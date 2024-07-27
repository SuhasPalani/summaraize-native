import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient
from flask import Flask, request, jsonify, redirect, url_for, session, send_from_directory
from bson.objectid import ObjectId
from flask_cors import CORS
from db_actions.functions import *
from retrievers.functions import *
from user_auth_actions.functions import *

load_dotenv()
mongo_uri = os.getenv('MONGO_URI')
if os.getenv("OPENAI_API_KEY") is not None: 
    chat, question_answering_prompt,demo_ephemeral_chat_history = set_bot_schema()

client = MongoClient(mongo_uri)
db = client['Summaraize']
user_auth = db['user_auth']
interests= db['interests']

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

chat, question_answering_prompt,demo_ephemeral_chat_history = set_bot_schema()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = user_auth.find_one({'username': username})
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        token = generate_token(user['_id'],app)
        
        session['token'] = token
        
        return jsonify({'status': 'success', 'token': token, 'user_id': str(user['_id'])}), 200
    else:
        return jsonify({'status': 'failure', 'message': 'Invalid credentials'}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user_id = create_user(db, username, password)
    
    if user_id:
        token = generate_token(user_id, app)
        
        return jsonify({"status": "success", "token": token, "message": "User created successfully", 'user_id': str(user_id)}), 201
    else:
        return jsonify({"status": "failure", "message": "User already exists"}), 400

    
def create_topic_folders(topics, base_path=None):
    if base_path is None:
        # Define the base_path relative to the location of this script
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'assets'))

    if not os.path.exists(base_path):
        # You mentioned the 'assets' folder already exists, so this part might be redundant.
        print(f"Base path does not exist: {base_path}")
        return

    for topic in topics:
        topic_path = os.path.join(base_path, topic.lower().replace(" ", "_"))
        try:
            if not os.path.exists(topic_path):
                os.makedirs(topic_path)
                print(f"Created folder: {topic_path}")
            else:
                print(f"Folder already exists: {topic_path}")
        except Exception as e:
            print(f"Error creating folder {topic_path}: {str(e)}")
            
@app.route('/api/interest', methods=['POST'])
def interest():
    headers = request.headers
    bearer_token = headers.get('Authorization')
    
    if not bearer_token:
        return jsonify({"status": "failure", "message": "Authorization token not provided"}), 400
    
    if bearer_token.startswith('Bearer '):
        clean_token = bearer_token[7:]
    else:
        clean_token = bearer_token

    isValid, response_message = verify_user(clean_token, app)

    if not isValid:
        return response_message
    
    user_id = response_message
    data = request.json
    interests_list = data.get('topics', [])

    result = interests.update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": {"interests": interests_list}},
        upsert=True
    )

    if result.upserted_id or result.modified_count > 0:
        updated_interests = interests.find_one({"user_id": ObjectId(user_id)})
        print(f"Updated interests: {interests_list}")

        # Create and remove folders
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'assets'))
        existing_folders = [f for f in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, f))]
        current_folders = [topic.lower().replace(" ", "_") for topic in interests_list]

        # Create folders for new interests
        create_topic_folders(interests_list, base_path)

        # Remove folders for interests that are no longer present
        for folder in existing_folders:
            if folder not in current_folders:
                folder_path = os.path.join(base_path, folder)
                try:
                    os.rmdir(folder_path)
                    print(f"Deleted folder: {folder_path}")
                except Exception as e:
                    print(f"Error deleting folder {folder_path}: {str(e)}")

        return jsonify({
            "user_id": str(user_id),
            "interests": updated_interests.get("interests", [])
        }), 201
    else:
        return jsonify({"status": "failure", "message": "Failed to add interests"}), 500


    
    
    
@app.route('/api/summary', methods=['GET'])
def get_summary():
    summary_data = {
        "title": "SummarAIze",
        "tagline": "Simplify the noise, embrace the essence",
        "description": "An AI-powered tool that helps you streamline information and focus on what truly matters."
    }
    return jsonify(summary_data)


@app.route('/api/chat', methods=['POST'])
def get_bot_response():
    question = request.json.get('question')
    recordId = request.json.get('recordId')
    article_url = get_article_url(db,recordId)
    response = response_retriever(article_url, question, chat, question_answering_prompt,demo_ephemeral_chat_history)

    print(response["answer"])

    return jsonify({"status": "success", "answer": response["answer"]})

@app.route('/api/get_user_interests', methods=['GET'])
def get_user_interests():
    headers = request.headers
    bearer_token = headers.get('Authorization')
    
    if bearer_token.startswith('Bearer '):
        clean_token = bearer_token[7:]
    else:
        clean_token = bearer_token

    isValid, response_message = verify_user(clean_token,app)

    if(isValid):
        records = []
        user_id = response_message
        print("user_id>>> ",user_id)

        for doc in db.interests.find({'user_id' : ObjectId(user_id)},{'interests':1}):
            records = doc["interests"]
        return jsonify({"status": "success", "interests": records})
    else:
        return response_message


@app.route('/api/videos/<topic>', methods=['GET'])
def get_videos(topic):
    base_path = os.path.join('assets', topic)
    if os.path.exists(base_path):
        files = os.listdir(base_path)
        videos = [f for f in files if f.endswith(('.mp4', '.mov'))]  # Add other video extensions if needed
        return jsonify({'videos': videos})
    else:
        return jsonify({'error': 'Topic not found'}), 404

@app.route('/api/video/<topic>/<filename>', methods=['GET'])
def serve_video(topic, filename):
    base_path = os.path.join('assets', topic)
    return send_from_directory(base_path, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

import os
import time
import bcrypt
import jwt
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient
from flask import Flask, request, jsonify, session, send_from_directory
from bson.objectid import ObjectId
from flask_cors import CORS
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from db_actions.functions import *
from retrievers.functions import *
from user_auth_actions.functions import *

load_dotenv()
mongo_uri = os.getenv('MONGO_URI')
if os.getenv("OPENAI_API_KEY") is not None: 
    chat, question_answering_prompt, demo_ephemeral_chat_history = set_bot_schema()

client = MongoClient(mongo_uri)
db = client['Summaraize']
user_auth = db['user_auth']
interests = db['interests']
videos_collection = db['videos']

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

chat, question_answering_prompt, demo_ephemeral_chat_history = set_bot_schema()

# Define the base directory and watch directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WATCH_DIR = os.path.join(BASE_DIR, 'Frontend', 'flask-backend', 'assets')

ARTICLE_LINKS = [
    "https://www.gov.ca.gov/2024/07/25/california-secures-federal-assistance-to-support-response-to-park-fire/",
    "https://www.gov.ca.gov/2024/07/26/governor-newsom-proclaims-state-of-emergency-in-plumas-butte-and-tehama-counties-due-to-fires/",
    "https://www.gov.ca.gov/2024/07/25/governor-newsom-orders-state-agencies-to-address-encampments-in-their-communities-with-urgency-and-dignity/"
]

class VideoEventHandler(FileSystemEventHandler):
    def __init__(self, videos_collection, base_path):
        self.videos_collection = videos_collection
        self.base_path = base_path
        self.last_added = {}  # Dictionary to track recently added videos

    def on_created(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(('.mp4', '.mov')):  # Add other video extensions if needed
            full_path = os.path.abspath(event.src_path)
            relative_path = os.path.relpath(full_path, self.base_path)
            interest = os.path.basename(os.path.dirname(relative_path))
            
            # Check if this file was recently added (within last 5 seconds)
            current_time = time.time()
            if relative_path in self.last_added and current_time - self.last_added[relative_path] < 300:
                print(f"Ignoring duplicate event for: {relative_path}")
                return

            # Update last added time
            self.last_added[relative_path] = current_time

            # Check if the video already exists in the database using the relative path
            existing_video = self.videos_collection.find_one({'video_path': relative_path})
            if existing_video is None:
                # Randomly select an article link from the predefined array
                article_link = random.choice(ARTICLE_LINKS)
                video_data = {
                    'video_path': relative_path,
                    'article_link': article_link,
                    'interest': interest
                }
                self.videos_collection.insert_one(video_data)
                print(f"New video added: {video_data}")
            else:
                print(f"Video already exists: {relative_path}")

            # Clean up old entries in last_added
            self.last_added = {k: v for k, v in self.last_added.items() if current_time - v < 60}
            

# Start the observer
event_handler = VideoEventHandler(videos_collection, BASE_DIR)
observer = Observer()
observer.schedule(event_handler, WATCH_DIR, recursive=True)
observer.start()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = user_auth.find_one({'username': username})
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        token = generate_token(user['_id'], app)
        
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
    article_url = get_article_url(db, recordId)
    response = response_retriever(article_url, question, chat, question_answering_prompt, demo_ephemeral_chat_history)

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

    isValid, response_message = verify_user(clean_token, app)

    if isValid:
        records = []
        user_id = response_message
        print("user_id>>> ", user_id)

        for doc in db.interests.find({'user_id': ObjectId(user_id)}, {'interests': 1}):
            records = doc["interests"]
        return jsonify({"status": "success", "interests": records})
    else:
        return response_message

@app.route('/api/videos/<topic>', methods=['GET'])
def get_videos(topic):
    base_path = os.path.join(WATCH_DIR, topic)
    if os.path.exists(base_path):
        files = os.listdir(base_path)
        videos = [f for f in files if f.endswith(('.mp4', '.mov'))]  # Add other video extensions if needed
        return jsonify({'videos': videos})
    else:
        return jsonify({'error': 'Topic not found'}), 404

@app.route('/api/video/<topic>/<filename>', methods=['GET'])
def serve_video(topic, filename):
    return send_from_directory(os.path.join(WATCH_DIR, topic), filename)

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    finally:
        observer.stop()
        observer.join()
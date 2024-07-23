import os
import bcrypt
from dotenv import load_dotenv
from pymongo import MongoClient
from flask import Flask, request, jsonify, redirect, url_for
from bson.objectid import ObjectId
from flask_cors import CORS
from db_actions.functions import *
from retrievers.functions import *


load_dotenv()
mongo_uri = os.getenv('MONGO_URI')


client = MongoClient(mongo_uri)
db = client['Summaraize']
user_auth = db['user_auth']


app = Flask(__name__)
CORS(app)

chat, question_answering_prompt,demo_ephemeral_chat_history = set_bot_schema()

def create_user(username, password):
    if user_auth.find_one({'username': username}):
        return None
    
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_id = user_auth.insert_one({
        '_id': ObjectId(),
        'username': username,
        'password': hashed_pw   
    }).inserted_id
    
    return user_id 

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = user_auth.find_one({'username': username})
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        
        return jsonify({'status': 'success', 'user_id': str(user['_id'])}), 200
    else:
        return jsonify({'status': 'failure', 'message': 'Invalid credentials'}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user_id = create_user(username, password)
    
    if user_id:
        return jsonify({"status": "success", "message": "User created successfully"}), 201
    else:
        return jsonify({"status": "failure", "message": "User already exists"}), 409

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
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)



# @app.route('/api/interest', methods=['POST'])
# def post_interest():
#     data = request.json
#     print("Received JSON data:", data)  # Debug statement
#     topics = data.get('topics', [])
#     print("Extracted topics:", topics)  # Debug statement
#     response = {
#         "status": "success",
#         "message": "Topics received!",
#         "received_data": topics
#     }
#     return jsonify(response)

# @app.route('/api/user_interests/<user_id>', methods=['GET'])
# def get_user_interests(user_id):
#     interests = user_interests_db.get(user_id, [])
#     return jsonify({"status": "success", "interests": interests})





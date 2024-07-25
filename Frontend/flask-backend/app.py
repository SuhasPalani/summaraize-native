import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient
from flask import Flask, request, jsonify, redirect, url_for, session
from bson.objectid import ObjectId
from flask_cors import CORS

load_dotenv()
mongo_uri = os.getenv('MONGO_URI')

client = MongoClient(mongo_uri)
db = client['Summaraize']
user_auth = db['user_auth']
interests = db['interests']

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

def create_user(username, password):
    if user_auth.find_one({'username': username}):
        return None
    
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_id = user_auth.insert_one({
        #'_id': ObjectId(),
        'username': username,
        'password': hashed_pw   
    }).inserted_id
    
    return user_id 

def generate_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(hours=2)
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    
    return token
    
def decode_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = user_auth.find_one({'username': username})
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        token = generate_token(user['_id'])
        
        #session['token'] = token
        
        return jsonify({'status': 'success', 'token': token, 'user_id': str(user['_id'])}), 200
    else:
        return jsonify({'status': 'failure', 'message': 'Invalid credentials'}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user_id = create_user(username, password)
    
    if user_id:
        token = generate_token(user_id)
        
        #session['token'] = token
        
        return jsonify({"status": "success", "token": token, "message": "User created successfully", 'user_id': str(user_id)}), 201
    else:
        return jsonify({"status": "failure", "message": "User already exists"}), 400
    

@app.route('/api/interest', methods=['POST'])
def interest():
    data = request.json
    token = data.get('token')
    
    if not token:
        return jsonify({"status": "failure", "message": "Missing or invalid token"}), 401
    
    user_id = decode_token(token)
    if not user_id:
        return jsonify({"status": "failure", "message": "Invalid or expired token"}), 401

    
    interests_list = data.get('interests', [])

    if not user_auth.find_one({'_id': ObjectId(user_id)}):
        return jsonify({"status": "failure", "message": "User not found"}), 404

    result = interests.update_one(
        {'user_id': ObjectId(user_id)},
        {"$addToSet": {"interests": {"$each": interests_list}}},
        upsert=True
    )
    
    if result.upserted_id or result.modified_count > 0:
        updated_interests = interests.find_one({'user_id': ObjectId(user_id)})
        return jsonify({
            "interests_id": str(updated_interests['_id']),
            "user_id": str(updated_interests['user_id']),
            "interests": updated_interests["interests"]
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
    recordId = request.json.get('record_id')
    database = get_DBconnection()
    article_url = get_article_url(database, recordId)
    response = response_retriever(article_url, question)

    print(response["answer"])

    return jsonify({"status": "success", "answer": response["answer"]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

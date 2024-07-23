import os
import bcrypt
from dotenv import load_dotenv
from pymongo import MongoClient
from flask import Flask, request, jsonify, redirect, url_for
from bson.objectid import ObjectId
from flask_cors import CORS


load_dotenv()
mongo_uri = os.getenv('MONGO_URI')


client = MongoClient(mongo_uri)
db = client['Summaraize']
user_auth = db['user_auth']
interests= db['interests']

app = Flask(__name__)
CORS(app)

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
        return jsonify({"status": "failure", "message": "User already exists"}), 400
    
@app.route('/api/add_interests',methods=['POST'])
def add_interests():
    data = request.json
    interests_list = data.get('interests',[])
    user_id = data.get('user_id')
    
    if not ObjectId.is_valid(user_id):
        return jsonify({"status": "failure", "message": "Invalid user ID"}), 400
    
    if not user_auth.find_one({'_id':ObjectId(user_id)}):
        return jsonify({"status": "failure", "message": "User not found"}), 404
    
    result = interests.update_one(
        {"_id":ObjectId(user_id)},
        {"$set":{"interests":interests_list}},
        upsert=True
    ) 
    
    if result.upserted_id or result.modified_count >0:
        updated_interests = interests.find_one({"_id": ObjectId(user_id)})
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
    recordId = request.json.get('record_id')
    database = get_DBconnection()
    article_url = get_article_url(database,recordId)
    response = response_retriever(article_url, question)


    print(response["answer"])

    return jsonify({"status": "success", "answer": response["answer"]})
if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)



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





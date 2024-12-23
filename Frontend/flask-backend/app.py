import os
import bcrypt
from dotenv import load_dotenv
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from db_actions.db_functions import *
from retrievers.retrieval import *
from user_auth_actions.authenticator import *

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

bot_schema = set_bot_schema()
# print(chat,question_answering_prompt,demo_ephemeral_chat_history)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WATCH_DIR = os.path.join(BASE_DIR, 'Frontend', 'flask-backend', 'assets')

@app.route('/api/summary', methods=['GET'])
def get_summary():
    summary_data = {
        "title": "SummarAIze",
        "tagline": "Simplify the noise, embrace the essence",
        "description": "An AI-powered tool that helps you streamline information and focus on what truly matters."
    }
    return jsonify(summary_data)

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
    # session_id is required to unpack the response from verify user function
    isValid,session_id, response_message = verify_user(headers,app)

    if(not isValid):
        return response_message
    
    user_id = response_message
    data = request.json
    interests_list = data.get('topics', [])

    return update_interest(interests,user_id,interests_list)

# @app.route('/api/videos/<topic>', methods=['GET'])
# def get_videos(topic):
#     response = find_videos(topic)
#     print(response)
#     return jsonify({'response': response})


@app.route('/api/chat', methods=['POST'])
def get_bot_response():
    headers = request.headers
    
    isValid,session_id, response_message = verify_user(headers,app)
    if(not isValid):
        return response_message
    
    question = request.json.get('question')
    recordId = request.json.get('recordId')

    article_url = get_article_url(db, recordId)
    unique_id = session_id+recordId
    
    response = response_retriever(article_url, question,unique_id, bot_schema)

    print(response["answer"])

    return jsonify({"status": "success", "answer": response["answer"]})

@app.route('/api/get_user_interests', methods=['GET'])
def get_user_interests():
    headers = request.headers
    
    # session_id is required to unpack the response from verify user function
    isValid,session_id, response_message = verify_user(headers,app)

    if(isValid):
        user_id = response_message
        return find_user_interests(db,user_id)
    else:
        return response_message
    
@app.route('/api/videos/<topic>', methods=['GET'])
def get_videos(topic):
    
    
    video_list = find_videos(topic)
    print(video_list)
    
    if not video_list:
        return jsonify({'error': 'No videos found for the given topic'}), 404
    
    
    videos = []
    for item in video_list:
        
        file = item['video_path']
        
        res=file[file.rindex('\\')+1:]
        item['video_name']=res
        print('dummy',item)
        # return 

    # return 'Test'
    return video_list

@app.route('/api/video/<topic>/<filename>', methods=['GET'])
def serve_video(topic, filename):
    base_path = os.path.join('assets', topic)
    print('Hello')
    print(topic, filename)
    return send_from_directory(base_path,filename)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True,use_reloader=False)
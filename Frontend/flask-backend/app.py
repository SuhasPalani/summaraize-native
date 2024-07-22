from flask import Flask, jsonify, request
import time
import random
from flask_cors import CORS
from db_actions.functions import *
from retrievers.functions import *


app = Flask(__name__)
CORS(app)

# Temporary in-memory storage for user interests
user_interests_db = {}

@app.route('/api/summary', methods=['GET'])
def get_summary():
    summary_data = {
        "title": "SummarAIze",
        "tagline": "Simplify the noise, embrace the essence",
        "description": "An AI-powered tool that helps you streamline information and focus on what truly matters."
    }
    return jsonify(summary_data)

@app.route('/api/interest', methods=['POST'])
def post_interest():
    data = request.json
    print("Received JSON data:", data)  # Debug statement
    topics = data.get('topics', [])
    print("Extracted topics:", topics)  # Debug statement
    response = {
        "status": "success",
        "message": "Topics received!",
        "received_data": topics
    }
    return jsonify(response)

@app.route('/api/user_interests/<user_id>', methods=['GET'])
def get_user_interests(user_id):
    interests = user_interests_db.get(user_id, [])
    return jsonify({"status": "success", "interests": interests})

@app.route('/api/chat', methods=['POST'])
def get_bot_response():
    question = request.json.get('question')
    recordId = request.json.get('record_id')
    database = get_DBconnection()
    article_url = get_article_url(database,recordId)
    response = response_retriever(article_url, question)


    print(response["answer"])

    return response["answer"]



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

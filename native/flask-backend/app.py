from flask import Flask, jsonify, request
import time
import random
from flask_cors import CORS


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
def chat():
    user_message = request.json.get('message', '')
    print(f"User message: {user_message}")  # Debug statement

    # Simulate processing delay
    time.sleep(5)
    
    # Generate a simple bot response
    bot_responses = [
        "That's an interesting question!",
        "Can you please clarify?",
        "I'll need to think about that.",
        "Here is some information related to your question.",
        "Thank you for your question! I'll get back to you soon."
    ]
    
    response = {
        "status": "success",
        "response": random.choice(bot_responses)
    }
    return jsonify(response)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

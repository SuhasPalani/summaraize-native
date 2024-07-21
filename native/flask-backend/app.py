from flask import Flask, jsonify, request

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

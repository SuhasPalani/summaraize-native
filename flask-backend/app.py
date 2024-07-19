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
    user_id = data.get('user_id')
    interests = data.get('interests')

    if not user_id or not interests:
        return jsonify({"status": "error", "message": "Invalid data"}), 400

    user_interests_db[user_id] = interests
    return jsonify({"status": "success", "message": "Interests saved successfully"})

@app.route('/api/user_interests/<user_id>', methods=['GET'])
def get_user_interests(user_id):
    interests = user_interests_db.get(user_id, [])
    return jsonify({"status": "success", "interests": interests})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

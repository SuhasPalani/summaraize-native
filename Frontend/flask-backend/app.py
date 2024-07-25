
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


# @app.route('/api/user_interests/<user_id>', methods=['GET'])
# def get_user_interests(user_id):
#     interests = user_interests_db.get(user_id, [])
#     return jsonify({"status": "success", "interests": interests})



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)









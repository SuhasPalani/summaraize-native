import json
import os
import random
from datetime import datetime, timedelta
import bcrypt
from flask import jsonify
from pymongo import MongoClient
from bson import ObjectId
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from dotenv import load_dotenv

load_dotenv()
mongo_uri = os.getenv('MONGO_URI')

client = MongoClient(mongo_uri)
db = client['Summaraize']
user_auth = db['user_auth']
interests = db['interests']
videos_collection = db['videos']

def get_article_url(database,recordId):

    record_details = database.videos.find({'_id' : ObjectId(str(recordId))},{'article_link':1})
    for doc in record_details:
        print(doc)
        article_url = doc["article_link"]

    return article_url

def create_user(database,username, password):
    if database.user_auth.find_one({'username': username}):
        return None
    
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_id = database.user_auth.insert_one({
        '_id': ObjectId(),
        'username': username,
        'password': hashed_pw   
    }).inserted_id
    
    return user_id 

def update_interest(interests,user_id,interests_list):
    result = interests.update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": {"interests": interests_list}},
        upsert=True
    )
    print(result)
    if result.upserted_id or result.modified_count > 0:
        updated_interests = interests.find_one({"user_id": ObjectId(user_id)})
        return jsonify({
            "user_id": str(user_id),
            "interests": updated_interests.get("interests", [])
        }), 201
    else:
        return jsonify({"status": "failure", "message": "Failed to add interests"}), 500
    

def find_user_interests(db,user_id):
    records = []
    for doc in db.interests.find({'user_id' : ObjectId(user_id)},{'interests':1}):
        records = doc["interests"]
    return jsonify({"status": "success", "interests": records})


def find_videos(interest):
    query = {"interest": interest}
    video_list = []

    documents = videos_collection.find(query).limit(5)

    for doc in documents:
        video_list.append(doc)
    return video_list

if __name__ == '__main__':
        
    print(find_videos('music'))
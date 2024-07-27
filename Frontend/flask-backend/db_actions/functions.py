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

ARTICLE_LINKS = [
    "https://www.gov.ca.gov/2024/07/25/california-secures-federal-assistance-to-support-response-to-park-fire/",
    "https://www.gov.ca.gov/2024/07/26/governor-newsom-proclaims-state-of-emergency-in-plumas-butte-and-tehama-counties-due-to-fires/",
    "https://www.gov.ca.gov/2024/07/25/governor-newsom-orders-state-agencies-to-address-encampments-in-their-communities-with-urgency-and-dignity/"
]


class VideoEventHandler(FileSystemEventHandler):
    def __init__(self, videos_collection, base_path):
        self.videos_collection = videos_collection
        self.base_path = base_path
        self.last_added = {}

    def on_created(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(('.mp4', '.mov')):
            full_path = os.path.abspath(event.src_path)
            relative_path = os.path.relpath(full_path, self.base_path)
            interest = os.path.basename(os.path.dirname(relative_path))

            current_time = time.time()
            if relative_path in self.last_added and current_time - self.last_added[relative_path] < 300:
                print(f"Ignoring duplicate event for: {relative_path}")
                return

            self.last_added[relative_path] = current_time
            existing_video = self.videos_collection.find_one({'video_path': relative_path})
            if existing_video is None:
                article_link = random.choice(ARTICLE_LINKS)
                video_data = {
                    'video_path': relative_path,
                    'article_link': article_link,
                    'interest': interest
                }
                self.videos_collection.insert_one(video_data)
                print(f"New video added: {video_data}")
            else:
                print(f"Video already exists: {relative_path}")

            self.last_added = {k: v for k, v in self.last_added.items() if current_time - v < 60}


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

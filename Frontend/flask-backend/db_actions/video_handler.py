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
import time

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
            
def start_observer(videos_collection, base_path, watch_dir):
    event_handler = VideoEventHandler(videos_collection, base_path)
    observer = Observer()
    observer.schedule(event_handler, watch_dir, recursive=True)
    observer.start()
    return observer
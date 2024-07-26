import json
import os
import bcrypt
from pymongo import MongoClient
from bson import ObjectId

from dotenv import load_dotenv
load_dotenv()

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

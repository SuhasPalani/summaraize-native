import json
import os
from pymongo import MongoClient
from bson import ObjectId

from dotenv import load_dotenv
load_dotenv()

def get_DBconnection():
    uri = 'mongodb+srv://'+os.environ["MONGO_DB_PASSWORD"]+':'+os.environ["MONGO_DB_USERNAME"]+'.ogqqgrf.mongodb.net/?retryWrites=true&w=majority&appName=Summaraize'
    # Create a new client and connect to the server
    client = MongoClient(uri)

        # Send a ping to confirm a successful connection
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
        database = client.get_database("Summaraize")
        return database
    
    except Exception as e:
        print(e)


def get_article_url(database,recordId):

    record_details = database.videos.find({'_id' : ObjectId(str(recordId))},{'article_link':1})
    for doc in record_details:
        print(doc)
        article_url = doc["article_link"]

    return article_url

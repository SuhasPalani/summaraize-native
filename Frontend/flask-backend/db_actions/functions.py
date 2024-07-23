import json
import os
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

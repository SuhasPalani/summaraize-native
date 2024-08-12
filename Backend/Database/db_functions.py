import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
mongo_uri = os.getenv('MONGO_URI')

client = MongoClient(mongo_uri)
db = client['Summaraize']
videos_collection = db['videos']

def insert_video_details(video_path,article_link,interest):
    video_id = videos_collection.insert_one({'video_path': video_path,
                                             'article_link':article_link,
                                             'interest':interest})
    if video_id:
        print('Uploaded video_id = ', video_id)
        return video_id
    else:
        raise Exception('Error in uploading video details to Videos collection')

if __name__ == '__main__':  
    insert_video_details('dfs/sdfgsdf','sdfsdfg','vishadfg')
from News_generation.news_gen import *
from Summarize.news_summarizer import *
from Audio_generation.audio_gen import *
from Audio_generation.combine_background import *
from Database.db_functions import *
from Video_generation.Scene_creator import *
from Video_generation.dalle_image_gen import *
from Video_generation.fal_video_gen import *
from Video_generation.combine_video import *
from Caption_generation_and_final_video_creation.caption_gen import *
import json
from dataclasses import dataclass

Interests_list = ['artificial_intellegence','business_and_finance','climate_change','crypto',
                  'electric_vehicles','entertainment','music','politics','science',
                  'renewable_energy','space_exploration','sports','stock','technology']

# Interests_list = ['ai'] ##remove after testing


@dataclass
class DataObject:
    def __init__(self,video_path = None, article_url= None ,interest= None):
        self.video_path = video_path
        self.article_url = article_url
        self.interest = interest

def read_json_file(path):
    with open(path, 'r',encoding='utf-8') as file:
        data = json.load(file)
    return data

def news_summaraize(data_store,item):
    extracted_data = read_json_file(item)
    # print(type(extracted_data))
    
    data_store.article_url = extracted_data['url']
    # print(data_store.article_url)
    
    summarized_content = summarize_news(extracted_data['content'])
    return summarized_content
    
if __name__ == '__main__':
    for selected_interest in Interests_list:
        recieved_news_list = newsapi_fun(selected_interest)
        
        #news extraction
        if recieved_news_list:
            for item in recieved_news_list:
                if item is not None:
                    #data object to store data
                    data_store = DataObject()
                    data_store.interest = selected_interest
                    
                    #news summaraization
                    summarized_content = news_summaraize(data_store,item)

                    #audio generation
                    text_to_speech(summarized_content)
                    background_audio('temp_audio_files/output.mp3',background_music_files,'temp_audio_files/combined.mp3')
                    
                    #video generation using Ai
                    scene_dict = create_scenes(summarized_content)
                    image_urls_dict = generate_multiple_images(scene_dict)
                    video_gen_thread(image_urls_dict)
                    video_combine_fun()
                    
                    #caption generation and final video generation
                    video_path = gen_start(selected_interest)
                    data_store.video_path = video_path
                    
                    insert_video_details(data_store.video_path,data_store.article_url,data_store.interest)
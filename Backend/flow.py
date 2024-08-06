from News_generation.news_gen import *
from Summarize.news_summarizer import *
from Audio_generation import *
from Database.db_functions import *
from Video_generation import *
from Caption_generation.caption_gen import *
import json
from dataclasses import dataclass

Interests_list = ['artificial_intellegence','business_and_finance','climate_change','crypto',
                  'electric_vehicles','entertainment','music','politics','science',
                  'renewable_energy','space_exploration','sports','stock','technology']

Interests_list = ['ai'] ##remove after testing


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
        for item in recieved_news_list:
            if item is not None:
                #data object to store data
                data_store = DataObject()
                data_store.interest = selected_interest
                
                #news summaraization
                summarized_content = news_summaraize(data_store,item)

                #audio generation
                
                
                
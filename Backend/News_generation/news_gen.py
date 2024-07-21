from newsdataapi import NewsDataApiClient
import os
from dotenv import load_dotenv

load_dotenv()

api = NewsDataApiClient(apikey=os.getenv('NEWSDATA_API_KEY'))


# News API
response = api.news_api(q='bitcoin')
print(response)
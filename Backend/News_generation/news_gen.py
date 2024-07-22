import requests
from bs4 import BeautifulSoup
import json
import string
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('NEWS_API_KEY')
url = os.getenv('NEWS_URL')
page_size = 20 #no. of articles per request

def sanitize_filename(title):
    """Sanitizes the title to create a valid filename."""
    valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
    filename = ''.join(c for c in title if c in valid_chars)
    filename = filename.replace(' ', '_')  # Replace spaces with underscores
    return filename

def save_article_json(article_data):
    """Saves the article data in a JSON format file named after the article's title."""
    if article_data.get("content") == "Failed to retrieve article content":
        print ("there was no content in that page")
        
    else:
        if sanitize_filename(article_data['title']) == 'Removed':
            print("but removed!")
        else:
            filename = "json_folder/" + sanitize_filename(article_data['title']) + '.json'
            try:
                with open(filename, 'w', encoding='utf-8') as file:
                    json.dump(article_data, file, ensure_ascii=False, indent=4)
                print(f"Article data saved to '{filename}'")
                return filename
            except IOError as e:
                print(f"Failed to save article data. Error: {e}")
        

def parse_article_content(html_content):
    """Parses the HTML content to extract contemmmnt paragraphs."""
    soup = BeautifulSoup(html_content, 'html.parser')
    content_paragraphs = soup.find_all('p')
    content = '\n'.join(p.text.strip() for p in content_paragraphs)
    return content

def get_web_page_content(url):
    """Fetches content from the specified URL."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Failed to retrieve web page. Error: {e}")
        return None

def get_news_articles(query):
    parameters = {
        'q': query,
        'apiKey': api_key,
        'pageSize': page_size,  
    }
    
    try:
        response = requests.get(url, params=parameters)
        response.raise_for_status()
        articles_data = []
        for article in response.json().get('articles', []):
            articles_data.append({
                'title': article['title'],
                'url': article['url'],
                'publishedAt': article['publishedAt'],
                'content': None
            })
        # print(articles_data)
        return articles_data
    except requests.RequestException as e:
        print(f"Failed to retrieve news articles. Error: {e}")
        return []


filename_list = []
def process_articles(query):
    """Processes articles related to the given query and saves them as JSON files."""
    articles = get_news_articles(query)
    if not articles:
        print("No articles found or failed to retrieve articles.")
        return

    for article in articles:
        html_content = get_web_page_content(article['url'])
        if html_content:
            article['content'] = parse_article_content(html_content)
        else:
            article['content'] = "Failed to retrieve article content"
        filename_list.append(save_article_json(article))
        
    return filename_list

def newsapi_fun(interest):
    filename_list_send = process_articles(interest)
    return filename_list_send

if __name__ == '__main__':
    interest = 'ai'
    print(newsapi_fun(interest))
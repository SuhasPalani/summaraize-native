import openai
import os
import threading
import time
from dotenv import load_dotenv

load_dotenv()
open_api_key = os.environ['CHATGPT_API_KEY']

def generate_image(prompt):
    try:
        response = openai.Image.create(
            model='dall-e-3',
            prompt=prompt,
            n=1,
            size="1024x1024"
        )
        images = response.get('data')
        
        if images:
            return images[0]['url']
        else:
            print('Did not get images')
            return None
    
    except Exception as e:
        print('Retryin due to {e}')
        
        time.sleep(20)
        return generate_image(prompt)
    
def generate_image_thread(prompt,index,results):
    url = generate_image(prompt)
    results[index] = url
           
def generate_multiple_images(prompt,count=3):
    threads=[]
    results = {}
    
    for i in range(count):
        thread = threading.Thread(target=generate_image_thread, args=(prompt,i,results))
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()
        
    return results

if __name__ == "__main__":
    urls = generate_multiple_images("Driving a car in USA",count=3)
    
    if urls:
        for key,url in urls.items():
            print(f"Image {key}: {url}") 
    else:
        print('Failed to generate image')
    
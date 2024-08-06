import openai
import os
import threading
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.environ['CHATGPT_API_KEY']

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
        print(f'Retrying due to {e}')
        # return generate_image(prompt)
    
def generate_image_thread(prompt,index,results):
    url = generate_image(prompt)
    results[index] = url
           
def generate_multiple_images(scene_dict):
    threads=[]
    results = {}
    count = 0
    for key, scene in scene_dict.items():
        thread = threading.Thread(target=generate_image_thread, args=(scene,count,results))
        thread.start()
        threads.append(thread)
        count+=1

    for thread in threads:
        thread.join()
        
    return results

if __name__ == "__main__":
    data_dict = {'scene1': 'A dynamic shot of the Emirates Stadium filled with passionate fans wearing Arsenal and Brentford jerseys, cheering and waving flags. The vibrant atmosphere is enhanced by colorful banners and a bright blue sky above. In the foreground, players from both teams are warming up on the pitch, with a bustling media area capturing the pre-match excitement. The sun casts long shadows on the lush green field, setting the stage for a thrilling match.', 'scene2': 'A close-up image of Aaron Ramsdale in his Arsenal goalkeeper kit, focused and determined as he prepares for the upcoming match. The scene captures the intensity in his eyes, with sweat glistening on his forehead. Behind him, blurred images of teammates engaged in tactical discussions and Brentford players warming up can be seen, emphasizing the high stakes of the game. The lighting highlights the detail of his kit and the stadium backdrop, creating a sense of anticipation.', 'scene3': 'A split-screen visualization showcasing fans around the world: on one side, a group of friends gathered in a cozy living room, passionately cheering while watching the game on a large screen, with snacks and drinks at hand. On the other side, a traveler sitting on a beach, using a laptop with a VPN to stream the match, with the ocean and palm trees in the background. This scene emphasizes the global reach of the Premier League and the innovative ways fans access the live streaming of the match.'}
    urls = generate_multiple_images(data_dict)
    if urls:
        for key,url in urls.items():
            print(f"Image {key}: {url}") 
    else:
        print('Failed to generate image')

import os
import json
import threading
import time
from dotenv import load_dotenv
from brx import BRX

load_dotenv()

brx = BRX(os.getenv('BRX_API_KEY'))
summaraize_brk = brx.get(os.getenv('BRK_KEY'))

def generate_brx_image(prompt):
    try:
        summaraize_brk.input['image_var'] = prompt
        summaraize_brk.input['size'] = '256x256'
        summaraize_brk.input['revised_prompt'] = prompt

        summaraize_result = summaraize_brk.run()
        summaraize_result_json = json.loads(summaraize_result[0])

        output = json.loads(summaraize_result_json['brxRes']['output'])
        url_link = output['url']

        return url_link

    except Exception as e:
        print(f"Retrying due to {e}")
        time.sleep(20)
        return generate_brx_image(prompt)

def generate_brx_image_thread(prompt, index, results):
    url = generate_brx_image(prompt)
    results[index] = url

def generate_multiple_brx_images(prompt, count=3):
    threads = []
    results = {}

    for i in range(count):
        thread = threading.Thread(target=generate_brx_image_thread, args=(prompt, i, results))
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()

    return results

if __name__ == "__main__":
    prompt = 'Car in moon'
    urls = generate_multiple_brx_images(prompt, count=3)

    if urls:
        for key, url in urls.items():
            print(f"Image {key}: {url}")
    else:
        print('Failed to generate images')

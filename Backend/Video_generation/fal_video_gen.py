import fal_client
import os
import requests
import threading
from dotenv import load_dotenv

load_dotenv()
FAL_API_KEY = os.environ["FAL_API_KEY"]
os.environ["FAL_KEY"] = FAL_API_KEY

def fal_video_api_fun(image_url, vid_num):
    try:
        handler = fal_client.submit(
            "fal-ai/fast-svd",
            arguments={
                "image_url": image_url
            },
        )
        log_index = 0
        for event in handler.iter_events(with_logs=True):
            if isinstance(event, fal_client.InProgress):
                new_logs = event.logs[log_index:]
                for log in new_logs:
                    print(log["message"])
                log_index = len(event.logs)

        result = handler.get()

        return result
    except Exception as e:
        print(f'Error in API call for video {vid_num}: {e}')
        return None

def download_video(video_url, save_dir, vid_num):
    try:
        response = requests.get(video_url, stream=True)
        response.raise_for_status()  
        filename = f'output_video{vid_num}.mp4'
        save_path = os.path.join(save_dir, filename)
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=1024):
                file.write(chunk)
        
    except Exception as e:
        print(f"Error downloading video {vid_num}: {e}")

def video_gen_fun(image_url, vid_num):
    vid_save_dir = 'temp_vid_files/'
    
    url_from_dalle = fal_video_api_fun(image_url, vid_num)
    if url_from_dalle:
        parsed_data = url_from_dalle
        video_url = parsed_data.get('video', {}).get('url')
        if video_url:
            download_video(video_url, vid_save_dir, vid_num)
            return True
        else:
            print(f"Video URL not found in the response for video {vid_num}")
            return False
    else:
        print(f"Failed to generate video {vid_num}")
        return False

def video_gen_thread(image_urls_dict):
    threads = []
    for i, (key, image_url) in enumerate(image_urls_dict.items()):
        t = threading.Thread(target=video_gen_fun, args=(image_url, i))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    print("All videos generated successfully!")

if __name__ == "__main__":
    # image_urls_dict = generate_multiple_images("Chicago skyline", count=3)
    # if image_urls_dict:
    image_urls_dict = {'Image 0': 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-QV6dmtfiwaZ7fqB9Y0SSSmls/user-LohAPIMbgt9yufmq1Gbb5Pv6/img-iMiINcvEwjLUDQwKwLkvOhHz.png?st=2024-08-06T15%3A06%3A10Z&se=2024-08-06T17%3A06%3A10Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-08-06T01%3A15%3A15Z&ske=2024-08-07T01%3A15%3A15Z&sks=b&skv=2023-11-03&sig=jrsczD7Yv109Iz4K1RzyV8KAI2lXiqUmcNcOIsSbYmE%3D',
    'Image 1': 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-QV6dmtfiwaZ7fqB9Y0SSSmls/user-LohAPIMbgt9yufmq1Gbb5Pv6/img-Bqe1Nwby8B96b68ZJq3oHvid.png?st=2024-08-06T15%3A06%3A12Z&se=2024-08-06T17%3A06%3A12Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-08-06T01%3A24%3A52Z&ske=2024-08-07T01%3A24%3A52Z&sks=b&skv=2023-11-03&sig=nEphG%2BpGR2gkmELzq4mqI2S7mF3/0GxYqPdLHvJ3gxc%3D',
    'Image 2': 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-QV6dmtfiwaZ7fqB9Y0SSSmls/user-LohAPIMbgt9yufmq1Gbb5Pv6/img-ltZnMgBHxyLfJjyvhc1HWrVw.png?st=2024-08-06T15%3A06%3A14Z&se=2024-08-06T17%3A06%3A14Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-08-06T01%3A30%3A40Z&ske=2024-08-07T01%3A30%3A40Z&sks=b&skv=2023-11-03&sig=0/HllA6xMPPd8%2BwWlTuzH28sqiwAjVJ7v6VVJpYEZ1s%3D'}
    
    video_gen_thread(image_urls_dict)

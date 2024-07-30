import fal_client
import os
import requests
import threading
from dotenv import load_dotenv
from multi_threading_dalle import generate_multiple_images

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
        print(f'Result for video {vid_num}:', result)
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
        print(f"Video {vid_num} downloaded successfully to {save_path}!")
    except Exception as e:
        print(f"Error downloading video {vid_num}: {e}")

def video_gen_fun(image_url, vid_num):
    print(f'Starting video generation for video {vid_num} with image URL: {image_url}')
    save_dir = "Video_generation/temp_vids/"
    os.makedirs(save_dir, exist_ok=True)
    
    url_from_dalle = fal_video_api_fun(image_url, vid_num)
    if url_from_dalle:
        parsed_data = url_from_dalle
        video_url = parsed_data.get('video', {}).get('url')
        if video_url:
            download_video(video_url, save_dir, vid_num)
            return True
        else:
            print(f"Video URL not found in the response for video {vid_num}")
            return False
    else:
        print(f"Failed to generate video {vid_num}")
        return False

if __name__ == "__main__":
    image_urls_dict = generate_multiple_images("A red car drifting on the moon", count=3)
    if image_urls_dict:
        print(f"Generated image URLs: {image_urls_dict}")

        threads = []
        for i, (key, image_url) in enumerate(image_urls_dict.items()):
            t = threading.Thread(target=video_gen_fun, args=(image_url, key))
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        print("All videos generated successfully!")
    else:
        print('Failed to generate images')

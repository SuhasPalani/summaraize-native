import fal_client
import os
import requests
from dotenv import load_dotenv
from multi_threading_dalle import generate_multiple_images

load_dotenv()
FAL_API_KEY = os.environ["FAL_API_KEY"]
os.environ["FAL_KEY"] = FAL_API_KEY

def fal_video_api_fun(image_urls):
    try:
        handler = fal_client.submit(
            "fal-ai/fast-svd",
            arguments={
                "images": image_urls  # Adjust the parameter name based on API documentation
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
        print('Result:', result)
        return result
    except Exception as e:
        print(f'Error in API call: {e}')
        return None

def download_video(video_url, save_dir, vid_num):
    try:
        response = requests.get(video_url, stream=True)
        response.raise_for_status()  # Ensure the response is successful
        filename = f'output_video{vid_num}.mp4'
        save_path = os.path.join(save_dir, filename)
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=1024):
                file.write(chunk)
        print(f"Video downloaded successfully to {save_path}!")
    except Exception as e:
        print(f"Error downloading video: {e}")

def video_gen_fun(image_urls):
    save_dir = "Video_generation/temp_vids/"
    os.makedirs(save_dir, exist_ok=True)
    
    url_from_fal = fal_video_api_fun(image_urls)
    if url_from_fal:
        print(url_from_fal)
        parsed_data = url_from_fal
        video_url = parsed_data.get('video', {}).get('url')
        if video_url:
            download_video(video_url, save_dir, 1)
            return True
        else:
            print("Video URL not found in the response")
            return False
    else:
        print("Failed to generate video")
        return False

if __name__ == "__main__":    
    image_urls = generate_multiple_images("Driving a car in USA", count=3)
    if image_urls:
        video_gen_fun(image_urls)
    else:
        print('Failed to generate images')

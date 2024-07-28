import fal_client
import os
import requests
from dotenv import load_dotenv

load_dotenv()
FAL_API_KEY = os.environ["FAL_API_KEY"]
os.environ["FAL_KEY"] = FAL_API_KEY

def fal_video_api_fun(image_url):
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
    print ('result')
    return result

def download_video(video_url, save_dir,vid_num):
    try:
        response = requests.get(video_url, stream=True)
        filename = 'output_video' + str(vid_num) + ".mp4"
        save_path = os.path.join(save_dir, filename)
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=1024):
                file.write(chunk)
        print(f"Video downloaded successfully to {save_path}!")
    except Exception as e:
        print(f"Error downloading video: {e}")

def video_gen_fun(image_url,vid_num):
    url_from_fal = fal_video_api_fun(image_url)
    print(url_from_fal)
    parsed_data = url_from_fal
    video_url = parsed_data['video']['url']
    save_path = "Video_generation/temp_vids/"
    download_video(video_url,save_path,vid_num)
    return True

if __name__ == '__main__':
    image_url = 'https://firebasestorage.googleapis.com/v0/b/brx-frontend.appspot.com/o/imgGen%2FdalleGen%2F2f2f590e-4c12-4d11-9c4e-fc30a033ffbf%2F2f0470f4-412c-41b3-9c2f-879e8fb5c3b3%2Fc78b6b7e-efae-4f79-8492-f7c47f3dd638?alt=media&token=5f5f36a9-c40d-4fe4-b48c-b5c39ba679b4'
    # video_url = 'https://storage.googleapis.com/isolate-dev-hot-rooster_toolkit_bucket/github_110602490/26fee471d73348be97ece732c370788b_reenc-tmpflk7xxk5.mp4?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=gke-service-account%40isolate-dev-hot-rooster.iam.gserviceaccount.com%2F20240724%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20240724T202309Z&X-Goog-Expires=604800&X-Goog-SignedHeaders=host&X-Goog-Signature=2cf45b50bb2bda6280a4462eee86635af9915c92ae9cefd0de41ad9e8d16051f3aec1428f03f6c64908f08082b09ecf780fbe17805cab9d364cc3fe570c7aebf5b6012c77c4cddc1d6c3208be3136f3449a189a4a03e021733ba414a7afae95ffc9fbb4e6f42f1e85f3b71cf80c651be589f5482d0c5fdc6f8dd18129d36b8ac6eb68f350cc11fd4f46a5034c88ac882bc48f8b0954132435065cefd02926dcd818a74edd81d3c6469ba707501b6a1b4aaebc09f6a2c9490266328259da0b5581fb3ac9c4e30a5bd67bf0d694160ebe7a3e12fc9703c2c5c4531fa61a87ffb42bbda6290109dbfc20ea3c54c5dedfadccfbfb4a5c369ec802539ce9f9941e995'
    print(video_gen_fun(image_url,1))
    # download_video(video_url,"Video_generation/temp_vids/",1)
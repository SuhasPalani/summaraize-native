import fal_client
import os
from dotenv import load_dotenv

load_dotenv()
FAL_API_KEY = os.environ["FAL_API_KEY"]
os.environ["FAL_KEY"] = FAL_API_KEY

def fal_image_gen(prompt):
    handler = fal_client.submit(
        "fal-ai/fast-turbo-diffusion",
        arguments={
            "prompt": prompt,
            'image_size' : 'portrait_4_3'
        },
    )
    result = handler.get()
    print(result)
    return result['video']['url']

if __name__ == '__main__':
    #fastest image generation api
    prompt = "Narendra Modi singing"
    fal_image_gen(prompt)

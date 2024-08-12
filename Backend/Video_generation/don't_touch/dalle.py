import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.environ['CHATGPT_API_KEY']

def generate_image(prompt, n=1, size="1024x1024"):
    try:
        response = openai.Image.create(
            model="dall-e-3",  # Specify the model version
            prompt=prompt,
            n=n,
            size=size
        )
        images = response.get('data')
        for i, image in enumerate(images):
            # This will print the URL of the generated image
            print(f"Image {i+1}: {image['url']}")
        return image['url']
    except Exception as e:
        print(f"An error occurred: {e}")
        print("trying again.................")
        generate_image(prompt)

if __name__ == '__main__':
# Example usage
    generate_image("A cozy living room environment where a group of friends is gathered to watch the Arsenal vs. Brentford match via streaming. The camera angles showcase a large flat-screen TV displaying the live match, with the friends excitedly cheering and discussing the game. One person holds a smartphone displaying the ExpressVPN app on the screen, symbolizing their effort to watch the game from their desired location. The room is decorated with football memorabilia, such as jerseys, signed balls, and a coffee table filled with snacks and drinks. Warm lighting enhances the inviting atmosphere, and a window in the background shows a hint of a setting sun, giving a sense of camaraderie and excitement for the match ahead.")
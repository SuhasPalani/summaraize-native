import os
import json
from dotenv import load_dotenv
from brx import BRX

load_dotenv()

brx = BRX(os.getenv('BRX_API_KEY'))
summaraize_brk = brx.get(os.getenv('BRK_KEY'))

def generate_brx_image(prompt):
    summaraize_brk.input['image_var'] = prompt
    summaraize_brk.input['size'] = '256x256'
    summaraize_brk.input['revised_prompt'] = prompt
    
    summaraize_result = summaraize_brk.run()
    summaraize_result_json=json.loads(summaraize_result[0])
        
    output = json.loads(summaraize_result_json['brxRes']['output'])
    url_link = output['url']
    
    return url_link

    
if __name__ =="__main__":
    prompt = 'A man playing soccer on the moon and kicking the ball to the earth'
    generate_brx_image(prompt)
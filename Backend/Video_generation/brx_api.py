from brx import BRX
import os
from dotenv import load_dotenv

load_dotenv()
brx = BRX(os.getenv['BRX_API_KEY'])

Summaraize = brx.get(os.getenv['BRK_KEY'])

def Image_gen(prompt):
    Summaraize.input['image_var'] = prompt
    Summaraize.input['size'] = '256x256'

    # Run the BRK
    SummaraizeResult = Summaraize.run()
    # print(SummaraizeResult)
    return SummaraizeResult


if __name__ == '__main__':
    prompt = 'donkey riding car in an indian highway'
    print(Image_gen(prompt))
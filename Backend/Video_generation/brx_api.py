from brx import BRX
import os
from dotenv import load_dotenv

load_dotenv()
brx = BRX(os.getenv('BRX_API_KEY'))

Summaraize = brx.get(os.getenv('BRK_KEY'))

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
    # x = {"brxId":"2f2f590e-4c12-4d11-9c4e-fc30a033ffbf","brxName":"Summaraize","topLevelBrx":true,"brxRes":{"output":"{\"url\":\"https://firebasestorage.googleapis.com/v0/b/brx-frontend.appspot.com/o/imgGen%2FdalleGen%2F2f2f590e-4c12-4d11-9c4e-fc30a033ffbf%2Ffe1516a4-512f-4608-a24d-a90b3cf31cb1%2F9f176c8f-595f-481d-8e7b-85aa23e9ee61?alt=media&token=20b28092-28ce-40ee-a55b-64b9c94fe73d\",\"revised_prompt\":\"A donkey comfortably takes the driver's seat in a classic sedan driving along a bustling Indian highway. The landscape features a blend of urban structures and natural sceneries. The highway is filled with varying vehicles, roadside food stalls, and crowd, a common sight in India. The donkey has a comical, oddly fitting appearance for the scene, with sunglasses and a light scarf flapping in the wind. The car is blue, showing signs of wear and age, fitting into the vibrant colorful scene around it.\"}"}}
    # print(x['brxRes']['output']['url'])
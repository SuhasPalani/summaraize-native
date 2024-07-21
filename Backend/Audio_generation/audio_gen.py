import os
import uuid
from gtts import gTTS 
from datetime import datetime
 
def text_to_speech(text):
    try:
        if not os.path.exists('/Users/nishchal/Desktop/summaraize-native/Backend/temp_files'):
            os.makedirs('/Users/nishchal/Desktop/summaraize-native/Backend/temp_files')
    
        filename = "output.mp3"
        file_path = os.path.join('/Users/nishchal/Desktop/summaraize-native/Backend/temp_files',filename)
        
        tts_model = gTTS(text=text, lang='en', slow=False) # Change to false if faster version is needed
        
        tts_model.save(file_path)
        
    except Exception as e:
        raise e
    
if __name__ == "__main__":
    audio_text = "In the serene embrace of nature, the world unfolds in a tapestry of vibrant colors and harmonious sounds. Towering trees sway gently in the breeze, their leaves whispering secrets of the ages. A river meanders through the landscape, its waters sparkling under the golden sun, offering a tranquil melody that soothes the soul. Birds flit from branch to branch, their songs a joyful chorus celebrating the beauty of the natural world. Amidst the verdant meadows, wildflowers bloom in a riot of colors, painting the earth with their delicate petals. The scent of pine and earth fills the air, grounding one in the present moment. In this sanctuary, away from the hustle and bustle of modern life, one can truly connect with the essence of existence, finding peace and inspiration in the timeless beauty of nature."
 
    text_to_speech(audio_text)
import random
from pydub import AudioSegment

def background_audio(main_audio_file,background_music_files,combined_music,fade_duration=5000,background_volume=-10):
    main_audio = AudioSegment.from_file(main_audio_file)
    background_file = random.choice(background_music_files)
    background_audio = AudioSegment.from_file(background_file)
    
    background_audio = background_audio + background_volume
    
    if len(background_audio) < len(main_audio):
        background_audio = background_audio * (len(main_audio)) // len(background_audio + 1)
        
    background_audio = background_audio.fade_in(fade_duration).fade_out(fade_duration)
    
    if len(background_audio) > len(main_audio):
        background_audio = background_audio[:len(main_audio)]
    
    combined_audio = main_audio.overlay(background_audio,position=0)
    
    combined_audio.export(combined_music, format="wav")
    
background_music_files = ['/Users/nishchal/Desktop/summaraize-native/Backend/Audio_generation/background_music_files/audio_file_1.mp3','/Users/nishchal/Desktop/summaraize-native/Backend/Audio_generation/background_music_files/audio_file_2.mp3','/Users/nishchal/Desktop/summaraize-native/Backend/Audio_generation/background_music_files/audio_file_3.mp3']

if __name__ == "__main__":
    background_audio('/Users/nishchal/Desktop/summaraize-native/Backend/temp_files/output.mp3',background_music_files,'/Users/nishchal/Desktop/summaraize-native/Backend/temp_files/combined.mp3')



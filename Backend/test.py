from Audio_generation.audio_gen import *
from Audio_generation.combine_background import *

print(background_music_files)
background_audio('temp_audio_files/output.mp3',background_music_files,'temp_audio_files/combined.mp3')


# from pydub import AudioSegment

# # Correct file path formatting
# audio = AudioSegment.from_file(r'temp_audio_files/output.mp3')
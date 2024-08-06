from vosk import Model, KaldiRecognizer
import os
import json
import wave
from moviepy.editor import TextClip, CompositeVideoClip, ColorClip, concatenate_videoclips,VideoFileClip, AudioFileClip
import numpy as np
import uuid
from pydub import AudioSegment
from pathlib import Path
from moviepy.config import change_settings

change_settings({"IMAGEMAGICK_BINARY": "C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"})
path = Path(__file__).parent.parent.parent
video_save_path = os.path.join(path, 'Frontend/flask-backend/assets')

model_path = "Caption_generation_and_final_video_creation/vosk_model/vosk-model-small-en-us-0.15"
ref_audio_file = "temp_audio_files/output.mp3"
wav_file = "temp_audio_files/output.wav"
# Convert MP3 to WAV
audio = AudioSegment.from_mp3(ref_audio_file)
audio.export(wav_file, format="wav")

audio_file = 'temp_audio_files/combined.mp3'
reference_json_file = "Caption_generation_and_final_video_creation/temp_json_files/recognized_speech.json"
output_json_file = "Caption_generation_and_final_video_creation/temp_json_files/output.json"
referece_video = 'temp_vid_files/combined_video.mp4'

if not os.path.exists(model_path):
    print("Model path is incorrect. Please adjust it.")
    exit(1)

frame_size = (1024,1024)
all_linelevel_splits=[]

def audio_to_text():   
    # Load the audio file
    wf = wave.open(wav_file, "rb")

    # Load the Vosk model
    model = Model(model_path)

    # Create a recognizer with the model
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    # Recognize speech
    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            results.append(json.loads(rec.Result()))

    results.append(json.loads(rec.FinalResult()))

    #Write results to JSON file
    with open(reference_json_file, 'w') as f:
        json.dump(results, f, indent=4)

    wf.close()

    print("JSON file created successfully.")


def split_text_into_lines(data):
    MaxChars = 80 
    MaxDuration = 3.0
    MaxGap = 1.5

    subtitles = []
    line = []
    line_duration = 0
    line_chars = 0

    for result_data in data:
        if "result" not in result_data:
            print("Warning: Missing 'result' key in dictionary")
            continue

        result_list = result_data["result"]

        for idx, word_data in enumerate(result_list):
            if "start" not in word_data or "end" not in word_data or "word" not in word_data:
                print(f"Warning: Missing key in dictionary at index {idx}")
                continue

            word = word_data["word"]
            start = word_data["start"]
            end = word_data["end"]

            line.append(word_data)
            line_duration += end - start
            
            temp = " ".join(item["word"] for item in line)

            new_line_chars = len(temp)

            duration_exceeded = line_duration > MaxDuration 
            chars_exceeded = new_line_chars > MaxChars 
            if idx > 0:
                gap = start - result_list[idx - 1]['end']
                maxgap_exceeded = gap > MaxGap
            else:
                maxgap_exceeded = False

            if duration_exceeded or chars_exceeded or maxgap_exceeded:
                if line:
                    subtitle_line = {
                        "text": " ".join(item["word"] for item in line),
                        "start": line[0]["start"],
                        "end": line[-1]["end"],
                        "textcontents": line
                    }
                    subtitles.append(subtitle_line)
                    line = []
                    line_duration = 0
                    line_chars = 0

        if line:
            subtitle_line = {
                "text": " ".join(item["word"] for item in line),
                "start": line[0]["start"],
                "end": line[-1]["end"],
                "textcontents": line
            }
            subtitles.append(subtitle_line)
            line = []
            line_duration = 0
            line_chars = 0

    return subtitles

def json_extract():
    # Load word-level timestamps JSON from a file
    with open(reference_json_file, "r") as file:
        wordlevel_info_modified = json.load(file)

    linelevel_subtitles = split_text_into_lines(wordlevel_info_modified)
    print(linelevel_subtitles)


    # Write results to JSON file
    with open(output_json_file, 'w') as f:
        json.dump(linelevel_subtitles, f, indent=4)

    print("JSON file 2 created successfully.")
    return linelevel_subtitles

def create_caption(textJSON, framesize,font = "Arial-Bold",fontsize=80, color='white', bgcolor='blue'):
    wordcount = len(textJSON['textcontents'])
    full_duration = textJSON['end']-textJSON['start']

    word_clips = []
    xy_textclips_positions =[]
    
    x_pos = 0
    y_pos = 0
    # max_height = 0
    frame_width = framesize[0]
    frame_height = framesize[1]
    x_buffer = frame_width*1/10
    y_buffer = frame_height*1/5

    space_width = ""
    space_height = ""

    for index,wordJSON in enumerate(textJSON['textcontents']):
      duration = wordJSON['end']-wordJSON['start']
      word_clip = TextClip(wordJSON['word'], font = font,fontsize=fontsize, color=color).set_start(textJSON['start']).set_duration(full_duration)
      word_clip_space = TextClip(" ", font = font,fontsize=fontsize, color=color).set_start(textJSON['start']).set_duration(full_duration)
      word_width, word_height = word_clip.size
      space_width,space_height = word_clip_space.size
      if x_pos + word_width+ space_width > frame_width-2*x_buffer:
            # Move to the next line
            x_pos = 0
            y_pos = y_pos+ word_height+40

            # Store info of each word_clip created
            xy_textclips_positions.append({
                "x_pos":x_pos+x_buffer,
                "y_pos": y_pos+y_buffer,
                "width" : word_width,
                "height" : word_height,
                "word": wordJSON['word'],
                "start": wordJSON['start'],
                "end": wordJSON['end'],
                "duration": duration
            })

            word_clip = word_clip.set_position((x_pos+x_buffer, y_pos+y_buffer))
            word_clip_space = word_clip_space.set_position((x_pos+ word_width +x_buffer, y_pos+y_buffer))
            x_pos = word_width + space_width
      else:
            # Store info of each word_clip created
            xy_textclips_positions.append({
                "x_pos":x_pos+x_buffer,
                "y_pos": y_pos+y_buffer,
                "width" : word_width,
                "height" : word_height,
                "word": wordJSON['word'],
                "start": wordJSON['start'],
                "end": wordJSON['end'],
                "duration": duration
            })

            word_clip = word_clip.set_position((x_pos+x_buffer, y_pos+y_buffer))
            word_clip_space = word_clip_space.set_position((x_pos+ word_width+ x_buffer, y_pos+y_buffer))

            x_pos = x_pos + word_width+ space_width


      word_clips.append(word_clip)
      word_clips.append(word_clip_space)  


    for highlight_word in xy_textclips_positions:
      
      word_clip_highlight = TextClip(highlight_word['word'], font = font,fontsize=fontsize, color=color,bg_color = bgcolor).set_start(highlight_word['start']).set_duration(highlight_word['duration'])
      word_clip_highlight = word_clip_highlight.set_position((highlight_word['x_pos'], highlight_word['y_pos']))
      word_clips.append(word_clip_highlight)

    return word_clips


def final_video_generator(linelevel_subtitles,interest):
    # Clear the list before adding new caption clips
    all_linelevel_splits.clear()

    for line in linelevel_subtitles:
        out = create_caption(line,frame_size)
        all_linelevel_splits.extend(out)

    # Load the input video
    input_video = VideoFileClip(referece_video)
    # Get the duration of the input video
    input_video_duration = input_video.duration
    # Create a color clip with the given frame size, color, and duration
    # background_clip = ColorClip(size=frame_size, color=(0, 0, 0)).set_duration(input_video_duration)

    # If you want to overlay this on the original video uncomment this and also change frame_size, font size and color accordingly.
    final_video = CompositeVideoClip([input_video] + all_linelevel_splits)

    # final_video = CompositeVideoClip([background_clip] + all_linelevel_splits)
    audio_clip = AudioFileClip(audio_file)
    repetitions = int(audio_clip.duration / input_video.duration) + 1

    # Loop the video to match the duration of the audio
    looped_video = concatenate_videoclips([input_video] * repetitions)
    looped_video = looped_video.subclip(0, audio_clip.duration)  # Trim to match audio duration

    # Set the audio of the final video to be your audio file
    final_video = CompositeVideoClip([looped_video] + all_linelevel_splits)
    final_video = final_video.set_audio(audio_clip)
    
    
    random_filename = video_save_path + '/' + interest + '/' + str(uuid.uuid4()) + ".mp4"
    # Save the final clip as a video file with the audio included
    final_video.write_videofile(random_filename, fps=24, codec="libx264", audio_codec="aac")
    return random_filename


def gen_start(interest):
    audio_to_text()
    linelevel_subtitles = json_extract()
    video_path = final_video_generator(linelevel_subtitles,interest)
    return video_path

if __name__ == '__main__':
    interest = 'artificial_intelligence'
    print(gen_start(interest))
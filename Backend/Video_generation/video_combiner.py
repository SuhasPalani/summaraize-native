import os
from pathlib import Path
from moviepy.editor import VideoFileClip, concatenate_videoclips, AudioFileClip

def combine_video_audio(video_path, audio_path, output_path):
    try:
        video_files = [os.path.join(video_path, f) for f in os.listdir(video_path) if f.endswith(('.mp4', '.mov', '.avi', '.mkv'))]

        if not video_files:
            raise FileNotFoundError("No video files found in the specified directory.")

        video_files.sort()

        video_clips = []
        for video in video_files:
            try:
                clip = VideoFileClip(video)
                video_clips.append(clip)

            except Exception as e:
                print(f"Error loading video file {video}: {e}")

        if not video_clips:
            raise ValueError("No valid video clips were loaded.")

        combined_video = concatenate_videoclips(video_clips)
        
        audio = AudioFileClip(audio_path)

        num_loops = int(audio.duration / combined_video.duration) + 1

        final_video = combined_video.fl_time(lambda t: t % combined_video.duration, keep_duration=True).set_duration(audio.duration)

        final_video = final_video.set_audio(audio)

        final_video.write_videofile(output_path, codec='libx264', audio_codec='aac')
        print(f"Video saved successfully at {output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    video_base_path = Path(__file__).parent
    output_base_path = Path(__file__).parent
    audio_base_path = Path(__file__).parent.parent
    video_path = os.path.join(video_base_path,'temp_vids')
    output_path = os.path.join(output_base_path,'temp_vids','combined_video.mp4')
    audio_path = os.path.join(audio_base_path,'temp_files','combined.mp3')
    
    combine_video_audio(video_path, audio_path, output_path)
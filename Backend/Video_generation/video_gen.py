import os
from moviepy.editor import VideoFileClip, concatenate_videoclips, AudioFileClip

def combine_videos_with_audio(video_path, audio_path, output_path):
    try:
        # List all video files in the given directory
        video_files = [os.path.join(video_path, f) for f in os.listdir(video_path) if f.endswith(('.mp4', '.mov', '.avi', '.mkv'))]

        if not video_files:
            raise FileNotFoundError("No video files found in the specified directory.")

        # Debug: Print out video file paths
        print(f"Video files found: {video_files}")

        # Sort video files to maintain order
        video_files.sort()

        # Load video clips
        video_clips = []
        for video in video_files:
            try:
                print(f"Loading video file: {video}")
                clip = VideoFileClip(video)
                video_clips.append(clip)
                print(f"Video loaded: {video}")
            except Exception as e:
                print(f"Error loading video file {video}: {e}")

        if not video_clips:
            raise ValueError("No valid video clips were loaded.")

        # Concatenate video clips
        print("Concatenating video clips...")
        combined_video = concatenate_videoclips(video_clips)
        print("Video clips concatenated.")

        # Load the audio file
        print(f"Loading audio file: {audio_path}")
        audio = AudioFileClip(audio_path)
        print(f"Audio file loaded: {audio_path}")

        # Calculate the number of loops needed
        num_loops = int(audio.duration / combined_video.duration) + 1

        # Create a loop of the concatenated video clips
        final_video = combined_video.fl_time(lambda t: t % combined_video.duration, keep_duration=True).set_duration(audio.duration)
        print("Video loop created.")

        # Set the audio of the final video
        final_video = final_video.set_audio(audio)
        print("Audio set.")

        # Preview the final video
        print("Previewing final video...")
        final_video.preview()

        # Write the final video to the output path
        print(f"Writing final video to: {output_path}")
        final_video.write_videofile(output_path, codec='libx264', audio_codec='aac')
        print(f"Video saved successfully at {output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
video_path = '/Users/nishchal/Desktop/summaraize-native/Backend/Video_generation/temp_vids'
audio_path = '/Users/nishchal/Desktop/summaraize-native/Backend/temp_files/combined.mp3'
output_path = '/Users/nishchal/Desktop/summaraize-native/Backend/Video_generation/combined_video.mp4'

combine_videos_with_audio(video_path, audio_path, output_path)
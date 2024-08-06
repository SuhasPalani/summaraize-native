from moviepy.editor import VideoFileClip, concatenate_videoclips

def video_combine_fun():
    clip1 = VideoFileClip("temp_vid_files/output_video0.mp4")
    clip2 = VideoFileClip("temp_vid_files/output_video1.mp4")
    clip3 = VideoFileClip("temp_vid_files/output_video2.mp4")

    # Concatenate the clips
    final_clip = concatenate_videoclips([clip1, clip2, clip3])

    # Write the result to a file
    final_clip.write_videofile("temp_vid_files/combined_video.mp4", codec="libx264")
    print('combined video created!!!!!!!!!!')

if __name__ == '__main__':
    video_combine_fun()
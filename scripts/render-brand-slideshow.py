"""Encode the approved bilingual artwork as a 42-second, 1080p video.
Only video assembly and format conversion; original artwork is retained.
"""
from pathlib import Path
import subprocess,tempfile

root=Path(__file__).resolve().parents[1]
media=root/'social/2026-10-11'
with tempfile.TemporaryDirectory(prefix='globalistihdam-slides-') as work:
    work=Path(work);segments=[]
    for index,name in enumerate(['overview','recruitment','education','investment','robotics','overview']):
        output=work/f'{index}.mp4'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-framerate','24','-i',str(root/f'globalistihdam-slide-{name}.webp'),'-t','7','-vf','scale=1920:1080:flags=lanczos,setsar=1,fade=t=in:st=0:d=0.3,fade=t=out:st=6.7:d=0.3,format=yuv420p','-an','-c:v','libx264','-preset','fast','-crf','19','-threads','2',str(output)],check=True)
        segments.append(output)
    listing=work/'concat.txt';listing.write_text(''.join(f"file '{file}'\n" for file in segments))
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-c:v','copy','-c:a','aac','-b:a','96k','-shortest','-movflags','+faststart',str(media/'Globalistihdam_Bilingual_Slideshow.mp4')],check=True)
print(media/'Globalistihdam_Bilingual_Slideshow.mp4')

#!/usr/bin/env python3
"""Render the approved 28-second introduction using FFmpeg and local brand assets.
Python standard library only. Requires ffmpeg, ffprobe and DejaVu Sans fonts.
No network calls, credentials, external music, stock downloads or publishing.
"""
from pathlib import Path
import argparse, json, math, re, struct, subprocess, tempfile, wave

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'social/2026-10-10/globalistihdam-introduction.mp4'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
NAVY = '0x102b3c'; PAPER = '0xf6f4ee'; GOLD = '0xdfcfaa'; MUTED = '0xc5d1d5'
FPS = 24; W = 720; H = 1280; SCENE_SECONDS = 5; DURATION = 28

def run(args):
    subprocess.run(args, check=True)

def draw(text, x, y, size=28, color=PAPER, bold=False, animate=False):
    # Text is stored in files to avoid FFmpeg escaping ambiguity.
    global text_index
    file = WORK / f'text-{text_index:03d}.txt'; text_index += 1
    file.write_text(text, encoding='utf8')
    xpos = f'{x}+18*(1-min(t/0.65,1))' if animate else str(x)
    return f"drawtext=fontfile='{BOLD if bold else FONT}':textfile='{file}':fontsize={size}:fontcolor={color}:x='{xpos}':y={y}:alpha='min(t/0.35,1)'"

def box(x, y, w, h, color):
    return f'drawbox=x={x}:y={y}:w={w}:h={h}:color={color}:t=fill'

def header():
    return [draw('GLOBALISTIHDAM', 180, 95, 27, bold=True),draw('RECRUITMENT & INVESTMENT AGENCY',180,135,13,color=MUTED),box(64,206,592,1,'0xdfcfaa@0.4')]

def ambient(path):
    # Original synthesized pad, not a recording or an imitation of a song.
    rate=32000; chords=[(146.83,220,293.66),(130.81,196,261.63),(174.61,220,349.23),(130.81,196,329.63)]
    with wave.open(str(path),'wb') as audio:
        audio.setnchannels(2); audio.setsampwidth(2); audio.setframerate(rate)
        frames=bytearray()
        for i in range(rate*DURATION):
            t=i/rate; fade=min(t/1.4,1,max((DURATION-t)/1.7,0)); total=0
            for k,notes in enumerate(chords):
                start=k*7; end=start+8
                if start <= t < end:
                    env=min((t-start)/1.2,1,max((end-t)/1.2,0))
                    total += env*sum(math.sin(2*math.pi*f*t+0.14*math.sin(t*0.7))*.007 + math.sin(2*math.pi*f*2*t)*.0015 for f in notes)
            # Very soft, brief chime at scene boundaries, with a gentle onset.
            for onset in (4.6,9.2,13.8,18.4,23):
                age=t-onset
                if 0 < age < 1.4: total += .007*min(age/.035,1)*math.exp(-age*4)*math.sin(2*math.pi*880*age)
            sample=int(max(-1,min(1,total*fade))*32767)
            frames.extend(struct.pack('<hh',sample,int(sample*(.97+.02*math.sin(t*.4)))))
        audio.writeframes(frames)

def render_scene(index, photo, geometry, labels, large_logo=False):
    photo_width, photo_height, photo_x, photo_y = geometry
    filters=[f'[0:v]format=yuv420p[bg]']
    if large_logo:
        filters += ['[2:v]scale=320:320:force_original_aspect_ratio=decrease,format=rgba[mark]', '[bg][mark]overlay=x=200:y=266:shortest=1[base]']
    else:
        # Slight lateral movement adds pace without scaling or altering the logo.
        filters += [f'[1:v]scale={photo_width+24}:{photo_height+16}:force_original_aspect_ratio=increase,crop={photo_width}:{photo_height}:x=\'12+8*sin(t/4)\':y=8,setsar=1[photo]',f'[bg][photo]overlay=x={photo_x}:y={photo_y}:shortest=1[withphoto]','[2:v]scale=100:100:force_original_aspect_ratio=decrease,format=rgba[mark]','[withphoto][mark]overlay=x=62:y=66:shortest=1[base]']
    common=header() if not large_logo else [draw('PEOPLE. EDUCATION. BUSINESS.',64,134,22,color=MUTED),box(64,206,592,1,'0xdfcfaa@0.4')]
    common += labels
    common += [box(64,1152,592,2,'0xffffff@0.15'),box(64,1152,(index+1)*592/6,2,GOLD),draw(f'0{index+1} / 06',64,1170,16,color=MUTED)]
    if not large_logo and index != 1: common += [draw('Illustrative photography',452,1170,15,color=MUTED)]
    filters.append('[base]'+','.join(common)+',format=yuv420p[v]')
    script=WORK/f'scene-{index}.ffgraph';script.write_text(';\n'.join(filters))
    dest=WORK/f'scene-{index}.mp4'
    run(['ffmpeg','-hide_banner','-loglevel','error','-y','-filter_complex_threads','1','-f','lavfi','-i',f'color=c={NAVY}:s={W}x{H}:r={FPS}:d={SCENE_SECONDS}','-loop','1','-framerate',str(FPS),'-i',str(ROOT/photo),'-loop','1','-framerate',str(FPS),'-i',str(ROOT/'global-istihdam-symbol-turkiye-v4.png'),'-filter_complex_script',str(script),'-map','[v]','-t',str(SCENE_SECONDS),'-an','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-threads','2',str(dest)])
    return dest

def validate_weekly(path):
    data=json.loads(path.read_text(encoding='utf8'))
    if not isinstance(data,dict) or data.get('schemaVersion')!=1 or data.get('format')!='weekly-video':
        raise ValueError('Expected schemaVersion 1 / format weekly-video')
    if data.get('website')!='https://globalistihdam.mtoman.chatgpt.site':
        raise ValueError('Use the canonical live website URL')
    if data.get('language') not in ('en','tr'):
        raise ValueError('Language must be en or tr')
    def text(value,limit):
        if not isinstance(value,str) or not value.strip() or len(value)>limit or any(ord(c)<32 for c in value):
            raise ValueError(f'Expected non-empty text of at most {limit} characters')
        return value
    text(data.get('title'),100)
    from PIL import ImageFont
    def fits(value,size,bold=False,width=592):
        if ImageFont.truetype(BOLD if bold else FONT,size).getlength(value)>width:
            raise ValueError('Text exceeds the safe width; shorten the line')
    scenes=data.get('scenes')
    if not isinstance(scenes,list) or len(scenes)!=6:
        raise ValueError('Six five-second scenes produce the required 28-second edit')
    for i,scene in enumerate(scenes):
        if not isinstance(scene,dict) or scene.get('layout') not in ('photo','list','closing'):
            raise ValueError('Scene layout must be photo, list or closing')
        closing=scene['layout']=='closing'
        if closing!=(i==5): raise ValueError('The final scene must be the only closing scene')
        heading=scene.get('heading',[]);body=scene.get('body',[])
        if not isinstance(heading,list) or not 1<=len(heading)<=(1 if closing else 2): raise ValueError('Use one or two short heading lines')
        if not isinstance(body,list) or len(body)>2: raise ValueError('At most two body lines')
        for line in heading:
            text(line,27 if closing else 21);fits(line,36 if closing else 52,True)
        for line in body:
            text(line,37);fits(line,25 if closing else 26)
        text(scene.get('eyebrow','GLOBALISTIHDAM'),36)
        text(scene.get('footer','Explore. Prepare. Connect.'),44)
        if scene['layout']=='list':
            if not isinstance(scene.get('items'),list) or not 1<=len(scene['items'])<=4: raise ValueError('Use one to four list items')
            for line in scene['items']:
                text(line,30);fits(line,28,width=570)
        if closing: text(scene.get('cta','Explore Globalistihdam'),28)
        image=scene.get('image','brand-banner-turkiye-v4.png')
        if not isinstance(image,str) or not re.fullmatch(r'[A-Za-z0-9_./-]+',image): raise ValueError('Image must be a simple local repository path')
        asset=(ROOT/image).resolve()
        if not asset.is_relative_to(ROOT.resolve()) or not asset.is_file() or asset.suffix.lower() not in ('.png','.jpg','.jpeg','.webp'):
            raise ValueError('Images must be existing local repository PNG/JPEG/WebP files')
    return data

def render_weekly(data):
    output=[]
    for i,scene in enumerate(data['scenes']):
        layout=scene['layout'];heading=scene['heading'];body=scene.get('body',[])
        labels=[]
        if layout=='closing':
            labels=[draw('GLOBALISTIHDAM',98,626,42,bold=True),box(64,704,592,1,'0xdfcfaa@0.4'),draw(heading[0],64,758,36,bold=True,animate=True)]
            labels += [draw(line,64,824+j*40,25,color=MUTED) for j,line in enumerate(body)]
            labels += [box(64,940,592,78,PAPER),draw(scene.get('cta','Explore Globalistihdam'),'(w-text_w)/2',965,25,color=NAVY,bold=True),draw(scene.get('footer','Explore. Prepare. Connect.'),64,1060,23,color=MUTED)]
            output.append(render_scene(i,scene.get('image','brand-banner-turkiye-v4.png'),(592,200,64,801),labels,large_logo=True));continue
        labels.append(draw(scene.get('eyebrow','GLOBALISTIHDAM'),64,248,17,color=GOLD))
        labels += [draw(line,64,312+j*72,52,bold=True,color=GOLD if j else PAPER,animate=True) for j,line in enumerate(heading)]
        if layout=='list':
            colors=('0x24a1c7','0x16a498','0xee9c38','0x83b84c')
            labels += [part for j,line in enumerate(scene['items']) for part in (box(64,474+j*63,4,28,colors[j]),draw(line,86,472+j*63,28))]
            geometry=(592,188,64,815)
        else:
            labels += [draw(line,64,500+j*43,26) for j,line in enumerate(body)]
            geometry=(592,350,64,665)
        labels.append(draw(scene.get('footer','Explore. Prepare. Connect.'),64,1060,23,color=MUTED))
        output.append(render_scene(i,scene.get('image','brand-banner-turkiye-v4.png'),geometry,labels))
    return output

parser=argparse.ArgumentParser()
parser.add_argument('--input',type=Path,help='Validated weekly-video JSON; omit to reproduce the first introduction')
parser.add_argument('--output',type=Path)
parser.add_argument('--validate-only',action='store_true')
args=parser.parse_args()
spec=validate_weekly(args.input) if args.input else None
if args.validate_only:
    if not spec: parser.error('--validate-only requires --input')
    print('Valid weekly-video input'); raise SystemExit(0)
if spec and not args.output: parser.error('--input requires an explicit --output path')
args.output=args.output or OUT
args.output.parent.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(prefix='globalistihdam-video-') as work:
    WORK=Path(work);text_index=0
    if spec:
        scenes=render_weekly(spec)
    else:
        scenes=[]
        scenes.append(render_scene(0,'energy-team.jpg',(592,350,64,650),[
            draw('AN INTERNATIONAL PERSPECTIVE',64,248,17,color=GOLD),
            draw('Work. Study.',64,304,64,bold=True,animate=True),draw('Build.',64,385,64,bold=True,animate=True),draw('Across borders.',64,465,54,color=GOLD,animate=True),
            draw('Explore what matters to you.',64,566,25),draw('People. Education. Business.',64,1042,24,color=MUTED)]))
        scenes.append(render_scene(1,'brand-banner-turkiye-v4.png',(592,200,64,801),[
            draw('FOUR AREAS OF SUPPORT',64,248,17,color=GOLD),draw('Find your focus.',64,310,52,bold=True,animate=True),
            box(64,420,4,30,'0x24a1c7'),draw('Recruitment',86,418,30),box(64,491,4,30,'0x16a498'),draw('International Education',86,489,30),
            box(64,562,4,30,'0xee9c38'),draw('Investment Advisory',86,560,30),box(64,633,4,30,'0x83b84c'),draw('Humanoid Robotics',86,631,30),
            draw('Choose the area that fits your goal.',64,1052,23,color=MUTED)]))
        scenes.append(render_scene(2,'students-campus.jpg',(592,365,64,660),[
            draw('01 / EXPLORE',64,248,18,color=GOLD),draw('See the',64,312,58,bold=True,animate=True),draw('options.',64,385,58,bold=True,color=GOLD,animate=True),
            draw('Browse service, country',64,496,27),draw('and university guides.',64,540,27),draw('Start with information.',64,1060,24,color=MUTED)]))
        scenes.append(render_scene(3,'sector-manufacturing.jpg',(592,350,64,665),[
            draw('02 / PREPARE',64,248,18,color=GOLD),draw('Bring the right',64,312,54,bold=True,animate=True),draw('questions.',64,386,54,bold=True,color=GOLD,animate=True),
            draw('Your goals. Your experience.',64,497,26),draw('Your preferred destinations.',64,541,26),draw('Make your priorities clear.',64,1060,24,color=MUTED)]))
        scenes.append(render_scene(4,'investment-istanbul.jpg',(592,350,64,665),[
            draw('03 / CONNECT',64,248,18,color=GOLD),draw('Discuss your',64,312,56,bold=True,animate=True),draw('next step.',64,386,56,bold=True,color=GOLD,animate=True),
            draw('Visit the Contact page',64,497,27),draw('and tell us what you need.',64,541,27),draw('Explore. Prepare. Connect.',64,1060,24,color=MUTED)]))
        scenes.append(render_scene(5,'brand-banner-turkiye-v4.png',(592,200,64,801),[
            draw('GLOBALISTIHDAM',98,626,42,bold=True),box(64,704,592,1,'0xdfcfaa@0.4'),draw('Explore the website.',64,758,40,bold=True,animate=True),
            draw('Start with your questions.',64,824,27,color=MUTED),box(64,940,592,78,PAPER),draw('Explore Globalistihdam','(w-text_w)/2',965,26,color=NAVY,bold=True),
            draw('Recruitment · Education',64,1054,22,color=MUTED),draw('Investment · Humanoid Robotics',64,1090,22,color=MUTED)],large_logo=True))
    audio=WORK/'original-ambient.wav';ambient(audio)
    inputs=[]
    for clip in scenes: inputs += ['-i',str(clip)]
    inputs += ['-i',str(audio)]
    graph=[]
    for i in range(6): graph.append(f'[{i}:v]settb=AVTB,setpts=PTS-STARTPTS,fps={FPS},format=yuv420p[s{i}]')
    previous='s0'
    for i in range(1,6):
        dest=f'x{i}';graph.append(f'[{previous}][s{i}]xfade=transition=fade:duration=0.4:offset={i*4.6:.1f}[{dest}]');previous=dest
    graph.append(f'[{previous}]format=yuv420p[v]')
    graphfile=WORK/'assembly.ffgraph';graphfile.write_text(';\n'.join(graph))
    common=['ffmpeg','-hide_banner','-loglevel','error','-y','-filter_complex_threads','1',*inputs,'-filter_complex_script',str(graphfile),'-map','[v]','-t',str(DURATION),'-c:v','libx264','-profile:v','high','-level:v','3.1','-preset','slow','-b:v','475k','-maxrate','700k','-bufsize','1400k','-pix_fmt','yuv420p','-r',str(FPS),'-g','48','-threads','2','-passlogfile',str(WORK/'encode')]
    run([*common,'-pass','1','-an','-f','mp4','/dev/null'])
    run([*common,'-pass','2','-map','6:a','-af','volume=4','-c:a','aac','-b:a','48k','-ar','32000','-ac','2','-movflags','+faststart','-metadata','title='+ (spec['title'] if spec else 'Globalistihdam — Explore. Prepare. Connect.'),'-metadata','comment=Original editorial video; website photography is illustrative. No external music.',str(args.output)])
    result=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_name,width,height,pix_fmt,r_frame_rate,sample_rate,channels','-of','json',str(args.output)],text=True)
    print(result)
    probe=json.loads(result);assert 27.9<float(probe['format']['duration'])<28.1
    assert any(s.get('codec_name')=='h264' and s.get('width')==720 and s.get('height')==1280 for s in probe['streams'])
    assert any(s.get('codec_name')=='aac' for s in probe['streams'])
    print('Verified output:',args.output)

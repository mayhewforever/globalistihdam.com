#!/usr/bin/env python3
"""Create one 1080x1350 Instagram news card from a prepared JSON brief.
No network or publishing. A native SVG contains text/shapes and the unchanged logo;
FFmpeg/librsvg renders it to PNG. Pillow is used only to measure text.
"""
from pathlib import Path
from datetime import date, datetime, timezone
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo
import argparse, base64, hashlib, html, json, re, subprocess
from PIL import ImageFont
ROOT=Path(__file__).resolve().parents[2]
WEBSITE='https://globalistihdam.mtoman.chatgpt.site'
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
LOGO=ROOT/'global-istihdam-symbol-turkiye-v4.png'
COLORS={'recruitment':'#347c9a','education':'#168d91','investment':'#d18a3e','robotics':'#6b9d48'}
LABELS={'en':{'recruitment':'Recruitment','education':'International Education','investment':'Investment Advisory','robotics':'Humanoid Robotics'},'tr':{'recruitment':'İstihdam','education':'Uluslararası Eğitim','investment':'Yatırım Danışmanlığı','robotics':'İnsansı Robotlar'}}

def text(value,limit):
    if not isinstance(value,str) or not value.strip() or len(value)>limit or any(ord(c)<32 for c in value): raise ValueError(f'Expected text of 1–{limit} characters')
    return value.strip()

def safe_url(value):
    value=text(value,2048)
    if re.search(r'[\s\\]',value): raise ValueError('Unsafe source URL')
    u=urlsplit(value)
    if u.scheme!='https' or not u.hostname or u.username or u.password or u.port not in (None,443): raise ValueError('Source URL must be safe HTTPS')
    return value

def wrap(value,size,bold,max_lines):
    font=ImageFont.truetype(BOLD if bold else FONT,size)
    lines=[];line=''
    for word in value.split():
        if font.getlength(word)>904: raise ValueError('Unbreakable text exceeds card width')
        test=(line+' '+word).strip()
        if font.getlength(test)>904:
            lines.append(line);line=word
        else: line=test
    if line: lines.append(line)
    if len(lines)>max_lines: raise ValueError(f'Shorten text to fit at most {max_lines} lines; it will not be truncated')
    return lines

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('input',type=Path);parser.add_argument('--output',type=Path);parser.add_argument('--validate-only',action='store_true');args=parser.parse_args()
data=json.loads(args.input.read_text(encoding='utf8'))
if data.get('schemaVersion')!=1 or data.get('format')!='daily-card': raise ValueError('Expected daily-card schemaVersion1')
if data.get('website')!=WEBSITE: raise ValueError('Use the canonical live website URL')
lang=data.get('language');category=data.get('category')
if lang not in LABELS or category not in COLORS: raise ValueError('Unsupported language or category')
id=text(data.get('id'),120);title=text(data.get('title'),180);summary=text(data.get('summary'),350);publisher=text(data.get('publisher'),100);source=safe_url(data.get('sourceUrl'))
published=date.fromisoformat(data.get('publishedOn',''))
if published.isoformat()!=data['publishedOn'] or published>datetime.now(ZoneInfo('Europe/Istanbul')).date(): raise ValueError('Publication date is malformed or in the future')
checked=datetime.fromisoformat(data.get('checkedAt','').replace('Z','+00:00'))
if not checked.tzinfo or checked>datetime.now(timezone.utc).replace(microsecond=0): raise ValueError('checkedAt must be a past ISO timestamp with timezone')
headline=wrap(title,47,True,4);body=wrap(summary,31,False,5);sources=wrap(publisher,25,True,2)
if args.validate_only: print('Valid daily-card input');raise SystemExit(0)
if not args.output or args.output.suffix.lower() not in ('.jpg','.jpeg','.png'): parser.error('--output must be an explicit .jpg/.jpeg/.png path')
args.output.parent.mkdir(parents=True,exist_ok=True)
# Shared coordinates drive both the editable vector SVG and FFmpeg rendering.
commands=[]
def line(value,x,y,size=30,color='#102b3c',bold=False): commands.append(('text',value,x,y,size,color,bold))
def rect(x,y,w,h,color): commands.append(('rect',x,y,w,h,color))
line('GLOBALISTIHDAM',238,100,37,bold=True)
line('RECRUITMENT & INVESTMENT AGENCY',238,151,17,'#5b6b71')
rect(88,232,904,1,'#d6ded9')
line('GÜNCEL HABERLER' if lang=='tr' else 'SECTOR UPDATE',88,274,20,'#5b6b71')
line(LABELS[lang][category],88,316,29,bold=True)
rect(88,371,72,5,COLORS[category])
for i,value in enumerate(headline): line(value,88,414+i*60,47,bold=True)
line(('Yayın tarihi: ' if lang=='tr' else 'Published: ')+published.isoformat(),88,683,23,'#5b6b71')
for i,value in enumerate(body): line(value,88,746+i*46,31,'#334b58')
rect(88,1035,904,1,'#d6ded9')
line('KAYNAK' if lang=='tr' else 'SOURCE',88,1070,18,'#5b6b71')
for i,value in enumerate(sources): line(value,88,1105+i*34,25,bold=True)
line('globalistihdam.mtoman.chatgpt.site',88,1200,25)
line('Kaynak bağlantısı ve yayın tarihi açıklamada.' if lang=='tr' else 'Source link and publication date in the caption.',88,1250,18,'#5b6b71')
svg=['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1350" viewBox="0 0 1080 1350">','<rect width="1080" height="1350" fill="#f6f4ee"/>',f'<image x="88" y="72" width="120" height="120" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{base64.b64encode(LOGO.read_bytes()).decode()}"/>']
for command in commands:
    if command[0]=='rect':
        _,x,y,w,h,color=command;svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>')
    else:
        _,value,x,y,size,color,bold=command
        svg.append(f'<text x="{x}" y="{y+size*.8}" font-family="DejaVu Sans,sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{html.escape(value)}</text>')
svg.append('</svg>')
vector=args.output.with_suffix('.svg');vector.write_text('\n'.join(svg),encoding='utf8')
run=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(vector),'-frames:v','1','-threads','1']
if args.output.suffix.lower()!='.png': run+=['-q:v','2']
subprocess.run([*run,str(args.output)],check=True)
metadata={'schemaVersion':1,'id':id,'format':'daily-card','language':lang,'category':category,'publishedOn':published.isoformat(),'publisher':publisher,'sourceUrl':source,'checkedAt':checked.isoformat(),'website':WEBSITE,'input':str(args.input),'asset':str(args.output),'sha256':hashlib.sha256(args.output.read_bytes()).hexdigest(),'captions':data.get('captions',{}),'provenanceNote':'Local v4 logo, unchanged except proportional scaling; text paraphrased from the recorded source.'}
args.output.with_suffix('.metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'asset':str(args.output),'bytes':args.output.stat().st_size,'width':1080,'height':1350,'sha256':metadata['sha256']},indent=2))

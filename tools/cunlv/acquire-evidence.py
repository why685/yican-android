"""Download public teaching evidence; does not classify or approve recipes."""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import time

parser=argparse.ArgumentParser()
parser.add_argument('--root',default=r'E:\一餐\quality-assurance\cunlv')
parser.add_argument('--limit',type=int)
args=parser.parse_args()
root=Path(args.root).resolve()
catalog=json.loads((root/'catalog-verified.json').read_text(encoding='utf-8'))
upstream={row['video_bvid'] for row in map(json.loads,(root/'upstream-recipes.jsonl').read_text(encoding='utf-8').strip().splitlines())}
items=sorted(catalog['items'],key=lambda item:(item['bvid'] in upstream,item['index']))
if args.limit:items=items[:args.limit]
ytdlp=Path(r'E:\Codex\toolchain\media\yt-dlp.exe')
progress_path=root/'acquisition-progress.json'
records={}
if progress_path.exists():
    records={item['bvid']:item for item in json.loads(progress_path.read_text(encoding='utf-8')).get('items',[])}

def acquire(item):
    bvid=item['bvid']
    directory=root/'evidence'/bvid
    directory.mkdir(parents=True,exist_ok=True)
    command=[str(ytdlp),'--no-playlist','--no-warnings','--newline','--socket-timeout','20','--retries','2','--fragment-retries','2',
             '--write-info-json','--write-subs','--write-auto-subs','--sub-langs','zh.*',
             '-f','bestaudio[abr<=80]/bestaudio','-o',str(directory/'audio.%(ext)s'),item['videoUrl']]
    log_path=directory/'acquisition.log'
    try:
        with log_path.open('w',encoding='utf-8') as log:
            result=subprocess.run(command,stdout=log,stderr=subprocess.STDOUT,timeout=180)
        if result.returncode:raise RuntimeError('yt-dlp exit '+str(result.returncode))
        info=json.loads((directory/'audio.info.json').read_text(encoding='utf-8'))
        if str(info.get('uploader_id'))!='417298480' or info.get('id')!=bvid:raise RuntimeError('Unexpected original author or video ID')
        audio=next((file for file in directory.glob('audio.*') if file.suffix in ('.m4a','.mp3','.webm','.mp4','.wav')),None)
        if audio is None:raise RuntimeError('Audio not found')
        metadata={key:info.get(key) for key in ['id','uploader','uploader_id','title','timestamp','duration','chapters','description']}
        metadata['videoUrl']=item['videoUrl']
        metadata['capturedAt']=datetime.now(timezone.utc).isoformat()
        (directory/'source.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        return {'bvid':bvid,'title':item['title'],'status':'evidence-acquired','audio':audio.relative_to(root).as_posix(),
                'audioSha256':hashlib.sha256(audio.read_bytes()).hexdigest(),'subtitles':[file.name for file in directory.glob('audio.*') if file.suffix in ('.srt','.vtt','.ass','.json3')],
                'source':(directory/'source.json').relative_to(root).as_posix(),'reviewed':False}
    except (Exception,subprocess.TimeoutExpired) as error:
        return {'bvid':bvid,'title':item['title'],'status':'acquisition-failed','error':str(error),'log':log_path.relative_to(root).as_posix(),'reviewed':False}

with ThreadPoolExecutor(max_workers=2) as executor:
    pending={executor.submit(acquire,item):item for item in items if records.get(item['bvid'],{}).get('status')!='evidence-acquired'}
    for future in as_completed(pending):
        record=future.result()
        records[record['bvid']]=record
        progress={'updatedAt':datetime.now(timezone.utc).isoformat(),'total':len(catalog['items']),'items':list(records.values())}
        temporary=progress_path.with_suffix('.tmp.json')
        temporary.write_text(json.dumps(progress,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        temporary.replace(progress_path)
        ok=sum(record['status']=='evidence-acquired' for record in records.values())
        failed=sum(record['status']=='acquisition-failed' for record in records.values())
        print(f'{ok} acquired, {failed} failed: {record["bvid"]} {record["status"]}',flush=True)
        time.sleep(.3)
    final={'updatedAt':datetime.now(timezone.utc).isoformat(),'total':len(catalog['items']),'complete':len(records)==len(catalog['items']),'items':list(records.values())}
    temporary=progress_path.with_suffix('.tmp.json')
    temporary.write_text(json.dumps(final,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    temporary.replace(progress_path)

"""Local transcription evidence only. This never marks a recipe as reviewed."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import time
import subprocess
from datetime import datetime, timezone

ROOT = Path(r'E:\一餐')
PACKAGES = ROOT / 'toolchain' / 'cunlv-asr' / 'packages'
sys.path.insert(0, str(PACKAGES))
os.environ['HF_HOME'] = str(ROOT / 'toolchain' / 'cunlv-asr' / 'hf-cache')
os.environ['HF_HUB_DISABLE_XET'] = '1'
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'
os.environ['HF_HUB_DISABLE_PROGRESS_BARS'] = '1'
os.environ['PYTHONDONTWRITEBYTECODE'] = '1'
from faster_whisper import WhisperModel
import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument('audio', nargs='?')
parser.add_argument('--output')
parser.add_argument('--prepare', action='store_true')
parser.add_argument('--model', default='medium')
parser.add_argument('--batch', action='store_true')
parser.add_argument('--limit', type=int)
args = parser.parse_args()
from job_state import JobState
job = JobState(ROOT/'quality-assurance'/'cunlv') if args.batch else None
started = time.monotonic()
print('Loading local CPU INT8 model: ' + args.model, flush=True)
model = WhisperModel(args.model, device='cpu', compute_type='int8', cpu_threads=8, num_workers=1,
                     download_root=str(ROOT / 'toolchain' / 'cunlv-asr' / 'models'))
print('Model ready', flush=True)
if job:job.update(status='running', stage='model-ready', model=args.model)
if args.prepare:
    sys.exit(0)
if not args.batch and (not args.audio or not args.output):
    parser.error('audio and --output are required')
ffmpeg = Path(r'E:\Codex\toolchain\python-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe')

def transcribe(source, target, verbose=True):
    started = time.monotonic()
    target.parent.mkdir(parents=True, exist_ok=True)
    decoded = subprocess.run([str(ffmpeg), '-v', 'error', '-i', str(source), '-f', 'f32le', '-acodec', 'pcm_f32le', '-ar', '16000', '-ac', '1', '-'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    audio = np.frombuffer(decoded.stdout, dtype=np.float32).copy()
    segments, info = model.transcribe(audio, language='zh', beam_size=5, vad_filter=True,
                                  word_timestamps=True, condition_on_previous_text=False)
    rows = []
    for segment in segments:
        rows.append({'start':segment.start,'end':segment.end,'text':segment.text,
                 'avgLogprob':segment.avg_logprob,'noSpeechProbability':segment.no_speech_prob,
                 'words':[{'start':word.start,'end':word.end,'word':word.word,'probability':word.probability} for word in segment.words or []]})
        if verbose:print(f'{segment.start:.1f}-{segment.end:.1f}: {segment.text}', flush=True)
        if job:job.update(stage='transcribing', currentBvid=source.parent.name, audioSeconds=info.duration, processedSeconds=segment.end)
    result = {'schemaVersion':1,'status':'unreviewed-transcript','model':args.model,
          'engine':'faster-whisper','computeType':'int8','language':info.language,'duration':info.duration,
          'audioSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
          'elapsedSeconds':round(time.monotonic()-started,2),'segments':rows}
    temporary=target.with_suffix('.tmp.json')
    temporary.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    temporary.replace(target)
    print('Saved ' + str(target) + ' ('+str(result['elapsedSeconds'])+'s)',flush=True)

if not args.batch:
    transcribe(Path(args.audio),Path(args.output))
else:
    review_root=ROOT/'quality-assurance'/'cunlv'
    upstream={row['video_bvid'] for row in map(json.loads,(review_root/'upstream-recipes.jsonl').read_text(encoding='utf-8').strip().splitlines())}
    done=set()
    failures={}
    idle_started=time.monotonic()
    while True:
        progress=json.loads((review_root/'acquisition-progress.json').read_text(encoding='utf-8'))
        available=sorted([row for row in progress['items'] if row.get('status')=='evidence-acquired'],key=lambda row:row['bvid'] in upstream)
        next_item=None
        for row in available:
            if row['bvid'] in done or row['bvid'] in failures:continue
            output=review_root/'evidence'/row['bvid']/'transcript.json'
            if output.exists():
                cached=json.loads(output.read_text(encoding='utf-8'))
                if cached.get('audioSha256')==row['audioSha256'] and cached.get('model')==args.model:
                    done.add(row['bvid'])
                    continue
            next_item=row
            break
        if next_item is None:
            if progress.get('complete') or len(progress['items'])>=progress['total']:break
            if time.monotonic()-idle_started>600:raise RuntimeError('Acquisition idle for ten minutes; inspect acquisition progress')
            time.sleep(5)
            continue
        idle_started=time.monotonic()
        bvid=next_item['bvid']
        print('Transcribing '+bvid+'; completed '+str(len(done)),flush=True)
        if job:job.update(stage='transcribing', currentBvid=bvid, completed=len(done), failed=len(failures), processedSeconds=0)
        try:
            transcribe(review_root/next_item['audio'],review_root/'evidence'/bvid/'transcript.json',verbose=False)
            done.add(bvid)
        except Exception as error:
            failures[bvid]=str(error)
            print('Failed '+bvid+': '+str(error),flush=True)
        report={'updatedAt':datetime.now(timezone.utc).isoformat(),'model':args.model,'status':'transcription-only-not-reviewed','completed':sorted(done),'failures':failures,'elapsedSeconds':round(time.monotonic()-started,2)}
        progress_target=review_root/'transcription-progress.json'
        temporary=progress_target.with_suffix('.tmp.json')
        temporary.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        temporary.replace(progress_target)
        if args.limit and len(done)>=args.limit:break
    if job:job.update(status='completed', stage='batch-finished', completed=len(done), failed=len(failures))

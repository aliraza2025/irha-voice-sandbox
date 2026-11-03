import os,sys,json,base64,tempfile,time
from pathlib import Path
os.environ.setdefault('HF_HOME',str(Path(__file__).resolve().parents[1]/'.model-cache'))
from faster_whisper import WhisperModel

def transcribe(path):
    started=time.perf_counter()
    model=WhisperModel(os.environ.get('WHISPER_MODEL','tiny'),device='cpu',compute_type='int8',download_root=os.environ['HF_HOME'])
    segments,info=model.transcribe(str(path),beam_size=3,vad_filter=False)
    rows=[{'id':f'S{i+1}','start':round(segment.start,3),'end':round(segment.end,3),'text':segment.text.strip()} for i,segment in enumerate(segments) if segment.text.strip()]
    if not rows: raise ValueError('No speech was recognized.')
    return {'model':os.environ.get('WHISPER_MODEL','tiny'),'language':info.language,'text':' '.join(row['text'] for row in rows),'segments':rows,'elapsedSeconds':round(time.perf_counter()-started,3),'fixture':'Operator-provided or synthetic audio; not customer data.'}

if __name__=='__main__':
    if len(sys.argv)>1:
        result=transcribe(Path(sys.argv[1]))
    else:
        payload=json.load(sys.stdin)
        raw=base64.b64decode(payload['audio'],validate=True)
        if not raw or len(raw)>8_000_000: raise ValueError('Audio must be 1 byte to 8 MB.')
        suffix=Path(payload.get('filename','audio.wav')).suffix.lower()
        if suffix not in ('.wav','.mp3','.webm','.m4a','.aiff','.ogg'): raise ValueError('Unsupported audio extension.')
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/('recording'+suffix);path.write_bytes(raw);result=transcribe(path)
    print(json.dumps(result))

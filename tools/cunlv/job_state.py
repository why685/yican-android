"""Single-instance state for the local transcription job; no scheduled tasks."""
from datetime import datetime, timezone
import atexit
import json
import msvcrt
import os
from pathlib import Path


class JobState:
    def __init__(self, directory):
        directory = Path(directory)
        directory.mkdir(parents=True, exist_ok=True)
        self.path = directory / 'transcription-job.json'
        self.lock = (directory / 'transcription-job.lock').open('a+b')
        if self.lock.seek(0, 2) == 0:
            self.lock.write(b'\0')
            self.lock.flush()
        self.lock.seek(0)
        try:
            msvcrt.locking(self.lock.fileno(), msvcrt.LK_NBLCK, 1)
        except OSError:
            self.lock.close()
            raise RuntimeError('Another transcription job holds the lock; do not start a duplicate')
        self.value = {'pid':os.getpid(), 'startedAt':datetime.now(timezone.utc).isoformat(), 'status':'starting'}
        self.update()
        atexit.register(self.close)

    def update(self, **values):
        self.value.update(values)
        self.value['updatedAt'] = datetime.now(timezone.utc).isoformat()
        temporary = self.path.with_suffix('.tmp.json')
        temporary.write_text(json.dumps(self.value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        temporary.replace(self.path)

    def close(self):
        if self.lock.closed:
            return
        if self.value.get('status') not in ('completed', 'failed'):
            self.update(status='stopped')
        self.lock.seek(0)
        msvcrt.locking(self.lock.fileno(), msvcrt.LK_UNLCK, 1)
        self.lock.close()

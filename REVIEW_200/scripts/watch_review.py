from pathlib import Path
import time,subprocess
out=Path('/workspace/Campaign/REVIEW_200');previous=-1
while True:
 count=len([p for p in (out/'validation').glob('*.json') if p.stem.isdigit()])
 if count!=previous:
  p=subprocess.run(['python',str(out/'scripts/review.py')],capture_output=True,text=True)
  print(p.stdout or p.stderr,flush=True)
  if p.returncode==0:previous=count
 if count==200:break
 time.sleep(20)

from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
import subprocess,sys,json
root=Path('/workspace/Campaign');out=root/'REVIEW_200'
rows=json.loads((out/'PLAN_200.json').read_text())
selection=set(map(int,sys.argv[1:]))
positions=[r['position'] for r in rows if not selection or r['position'] in selection]
def run(pos):
 p=subprocess.run(['node',str(out/'scripts/process.js'),str(pos)],cwd=root,capture_output=True,text=True)
 (out/'validation'/f'{pos:03}.worker.log').write_text(p.stdout+p.stderr)
 return p.stdout.strip() or p.stderr.strip(),p.returncode
with ThreadPoolExecutor(max_workers=4) as pool:
 for future in as_completed([pool.submit(run,p) for p in positions]):
  msg,code=future.result();print(msg,flush=True)

from pathlib import Path
import os,time,json,subprocess,sys
out=Path('/workspace/Campaign/REVIEW_200');pid=int(sys.argv[1]) if len(sys.argv)>1 else 0
while pid and Path(f'/proc/{pid}').exists():time.sleep(5)
rows=json.loads((out/'PLAN_200.json').read_text());missing=[r['position'] for r in rows if not (out/'validation'/f'{r["position"]:03}.json').exists()]
print('Retry with source-route ordering:',missing,flush=True)
env=os.environ.copy();env.update(ORDER_HINTS='1',SOLVE_TIME='180')
subprocess.run(['python',str(out/'scripts/run_batch.py'),*map(str,missing)],env=env,cwd=out.parent)

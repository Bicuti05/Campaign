from pathlib import Path
import json,subprocess,os,time,sys
out=Path('/workspace/Campaign/REVIEW_200');env=os.environ.copy();env.update(ORDER_HINTS='1',SOLVE_TIME='360')
# Wait for primary retry and optional manual repair to finish before further work.
for arg in sys.argv[1:]:
 while Path('/proc/'+arg).exists():time.sleep(5)
for attempt in range(3):
 missing=[n for n in range(1,201) if not(out/'validation'/f'{n:03}.json').exists()]
 print('Remaining:',missing,flush=True)
 if not missing:break
 subprocess.run(['python',str(out/'scripts/run_batch.py'),*map(str,missing)],env=env,cwd=out.parent)
else:raise SystemExit('Not all qualified; do not publish as completed')
subprocess.run(['python',str(out/'scripts/final_slots.py')],check=True,cwd=out.parent)
subprocess.run(['node',str(out/'scripts/audit.js')],check=True,cwd=out.parent,stdout=(out/'validation/FINAL_AUDIT.log').open('w'))
subprocess.run(['python',str(out/'scripts/review.py')],check=True,cwd=out.parent)
subprocess.run(['python',str(out/'scripts/browser_check.py')],check=True,cwd=out.parent)
subprocess.run(['python',str(out/'scripts/package.py')],check=True,cwd=out.parent)

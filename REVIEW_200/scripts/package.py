from pathlib import Path
import json,hashlib,zipfile,shutil,subprocess
out=Path('/workspace/Campaign/REVIEW_200');root=out.parent
summary=json.loads((out/'FINAL_SUMMARY.json').read_text());assert summary['completed'],summary['errors']
base=out/'validation/baseline_first20';base.mkdir(exist_ok=True)
plan=json.loads((out/'PLAN_200.json').read_text())
for r in plan[:20]:
 p=root/'REVIEW_FIRST_10'/r['qualification']
 if p.exists():shutil.copyfile(p,base/p.name)
shutil.copyfile(root/'REVIEW_FIRST_10/validation/FINAL_SUMMARY.json',base/'FINAL_SUMMARY.json')
# Keep failed intermediate experiments outside delivery validation files.
for p in (out/'validation').glob('*.failure.json'):
 if (out/'validation'/p.name.replace('.failure','')).exists():
  h=out/'validation/history';h.mkdir(exist_ok=True);shutil.move(str(p),str(h/p.name))
README=out/'README.md';s=README.read_text();s+='\n## Kết quả cuối\n\nĐủ 200 pack, 200 validate OK, 200 solver FOUND, 200 replay hoàn tất. Chi tiết FINAL_SUMMARY.json. Xích đúng 8 vị trí do GD chốt; Normal có bom được ghi trong STATUS.json. Không có Booster. Phân bố đối xứng tối ưu bình phương sai lệch R để tránh dồn sai lệch vào vài vị trí.\n\nCác nguồn legacy có thể chứa hình học bake không round-trip hoàn toàn qua design; pack runtime là dữ liệu giao Dev có thẩm quyền. Chỉ các bản sửa mới được dựng bằng official builder. Các mốc R=0 tại #41/#51/#72 được giữ đúng mapping tham chiếu, nên không có cá ở ba màn này.\n';README.write_text(s)
subprocess.run(['python',str(out/'scripts/review.py')],check=True)
# Redirect former review address to the completed live review.
old=root/'REVIEW_FIRST_10/index.html';backup=old.with_name('index_first20_archived.html')
if not backup.exists():shutil.copyfile(old,backup)
old.write_text('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=review200/index.html"><a href="review200/index.html">Mở bộ review 200 level đã hoàn tất</a>')
files=[]
for name in ['index.html','README.md','FINAL_SUMMARY.json','STATUS.json','MAPPING_200.json','MAPPING_200.csv','USER_MECHANIC_RULES.json','version.json','review-desktop.png','review-mobile.png']:
 p=out/name
 if p.exists():files.append(p)
for folder in ['packs','designs','previews','validation']:
 files.extend(p for p in (out/folder).rglob('*') if p.is_file() and 'history'not in p.parts and not p.name.endswith('.worker.log') and p.name!='INTERIM_AUDIT.log')
manifest=[{'path':str(p.relative_to(out)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
(out/'MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));files.append(out/'MANIFEST.json')
archive=root/'CAMPAIGN_200_REVIEW_FINAL.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,str(Path('CAMPAIGN_200_REVIEW')/p.relative_to(out)))
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
print('COMPLETE',archive,archive.stat().st_size)

'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const OUT=__dirname,ROOT=path.resolve(OUT,'../../../..'),R=require('../../rr-core.js'),G=require('../pose-body-gesture-query.js'),check=require('../20261021-gd-return-review/audit-static.cjs').check;
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const ingame=path.join(ROOT,'Tools/RotateLevelDesigner/ingame'),stamp=Date.now(),backup=path.join(OUT,'ingame-backup-'+stamp),resultFile=path.join(OUT,'ingame-update-manifest.json');
assert(!fs.existsSync(resultFile),'Already updated; inspect manifest');
const inventory=()=>fs.readdirSync(ingame).filter(f=>f.endsWith('.rrpack.json')).map(file=>({file,slot:Number(read(path.join(ingame,file)).runtime.levelId),sha256:sha(path.join(ingame,file))}));
const before=inventory();assert.equal(before.length,250);assert.equal(new Set(before.map(x=>x.slot)).size,250);
const deliveries=fs.readdirSync(OUT).filter(f=>f.endsWith('-delivery.json')).map(f=>({evidence:f,...read(path.join(OUT,f))})).sort((a,b)=>a.slot-b.slot),plan=[];
for(const d of deliveries){
 const source=path.join(ROOT,d.pack),pack=read(source),previous=before.find(x=>x.slot===d.slot);assert(previous,'Missing active ID');
 const lf=fs.readFileSync(source,'utf8').replace(/\r\n/g,'\n'),h=x=>crypto.createHash('sha256').update(x).digest('hex');
 assert([sha(source),h(lf),h(lf.replace(/\n/g,'\r\n'))].includes(d.packSha256),'Source content changed beyond line endings: '+d.slot);
 const original=path.join(ROOT,'Tools/LevelGen',d.source),current=read(path.join(ingame,previous.file)),old=read(original);
 assert.deepEqual(current.runtime,old.runtime,'Active runtime edited since source; preserve GD work');assert.deepEqual(current.design,old.design,'Active design edited since source');
 assert.equal(R.validate(pack.runtime),null);assert.equal(R.validate(R.Design.toLevel(pack.design).level),null);
 const checks=check(source,original);assert(checks.ok,JSON.stringify(checks.errors));
 const proof=G.replay(pack.runtime,d.moves,true,true);assert(proof.ok,'Saved solution no longer completes');
 assert.equal(d.defaultFeelVerified,true);assert.equal(d.staticPass,true);
 assert.deepEqual(JSON.parse(R.json.stringify(R.Design.toLevel(pack.design).level)),pack.runtime);
 plan.push({slot:d.slot,stem:d.stem,source:d.pack,target:'Tools/RotateLevelDesigner/ingame/'+previous.file,previousSha256:previous.sha256,sha256:sha(source),originalDeliverySha256:d.packSha256,lineEndingsChangedSinceDelivery:sha(source)!==d.packSha256,proof:d.evidence,defaultFeelVerified:true,analyticSameRouteVerified:d.analyticSameRouteVerified,boosterUsed:false,bombEvents:d.bombEvents.length,nativeSolveFound:d.nativeSolveFound===true||(d.slot===157&&read(path.join(OUT,'A157-native-200k-90s.json')).found===true)});
}
assert.equal(plan.length,42);
fs.mkdirSync(backup);
for(const p of plan){const target=path.join(ROOT,p.target),saved=path.join(backup,path.basename(target));assert.equal(sha(target),p.previousSha256);fs.copyFileSync(target,saved,fs.constants.COPYFILE_EXCL);assert.equal(sha(saved),p.previousSha256);p.backup=path.relative(ROOT,saved).replaceAll('\\','/');}
for(const p of plan){assert.equal(sha(path.join(ROOT,p.source)),p.sha256);fs.copyFileSync(path.join(ROOT,p.source),path.join(ROOT,p.target));assert.equal(sha(path.join(ROOT,p.target)),p.sha256);}
const after=inventory(),selected=new Set(plan.map(x=>x.slot));assert.equal(after.length,250);assert.equal(new Set(after.map(x=>x.slot)).size,250);
for(const p of before)if(!selected.has(p.slot))assert.equal(sha(path.join(ingame,p.file)),p.sha256,'Unselected pack changed');
const result={atUtc:new Date().toISOString(),status:'applied_ingame',count:plan.length,rows:plan,other208Unchanged:true,totalPacks:250,unityCampaignModifiedByThisStep:false,newSearchRun:false,verification:'Existing routes replayed on serialized runtime through current-body hitTest, fresh beginDrag, full pointer target and release with default feel; static gates and exact rebake checked. No Booster; Boms listed explicitly. Native solver coverage recorded separately.',before,after};
fs.writeFileSync(resultFile,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(OUT,'INGAME_UPDATED.csv'),'\ufefflevel,revision,ingamePack,bombEvents,nativeSolveFound\r\n'+plan.map(x=>[x.slot,x.stem,path.basename(x.target),x.bombEvents,x.nativeSolveFound].join(',')).join('\r\n')+'\r\n',{flag:'wx'});
const cp=path.join(ROOT,'Tools/RotateLevelDesigner/research/20261013/ongoing-research-state.json'),s=read(cp);
s.levelGenRepairIngameUpdate20261021={status:'applied_ingame',atUtc:result.atUtc,count:42,slots:plan.map(x=>x.slot),evidence:path.relative(ROOT,resultFile).replaceAll('\\','/'),newSearchRun:false,other208Unchanged:true};
fs.writeFileSync(cp,JSON.stringify(s,null,1)+'\n');
fs.appendFileSync(path.join(ROOT,'Assets/Document/TURP_ProjectScan.md'),'\n\n### Cập nhật42 revision đã có lời giải vào ingame (21/10/2026)\n\nTheo yêu cầu mới, hoàn tất xuất18candidate đã có route trước lệnh stop, không khởi động lại tìm/sửa mới; tổng42pack đều nativevalidate cả design/runtime, analyze/staticgate/strictOVLso nguồn, rebake pack.design khớp runtime và replay route đã lưu defaultfeel đi hết, không Booster. Đã xem ảnh trước/sau/mono cùng camera. NativeCLI FOUND riêng15/42 (gồm157lượt90s); những bản còn lại có fullgestureUIroute nhưng không tự gọi đãnativeFOUND. Tất cảBom bổ sung có mount trên vật liệu, không chạm ban đầu, và bỏ riêng từngBom làm route đang dùng không hoàn tất; không là chứng minh không còn lời giải khác. Ba lỗi serialize/ảnhdở195/197/211 được xuất revision tên mới, giữ nguyên bản lỗi.\n\nĐã thay đúng42pack ingame, giữ tênfile hiện có và ID, copy bytes từ revision trong levels; sao lưu42pack trước thay cóSHA256,208pack khác giữ nguyên, vẫn250IDunique. Các slot: '+plan.map(x=>x.slot).join(', ')+'. Manifest ingame-update-manifest.json và INGAME_UPDATED.csv trong research/20261021-levelgen-repair-155-240. Nguyên liệu LevelGen giữ nguyên. Riêng bước này không sửa Unity/campaign; yêu cầu Unity tiếp theo được ghi riêng. Audit/sửa cũ vẫn stopped_by_user.\n\nLưu ý lịch sử:86pack ingame khác hash snapshot cũ do bytes đã đổi, nhưng kiểm cấu trúc runtime/design của42pack thay vẫn khớp nguồn gốc; không coi khác hash tự nó là sửa gameplay.\n');
console.log(JSON.stringify({updated:42,slots:plan.map(x=>x.slot),nativeFound:plan.filter(x=>x.nativeSolveFound).length,otherPacksUnchanged:true},null,2));

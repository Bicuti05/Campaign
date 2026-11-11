'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const out=__dirname,root=path.resolve(out,'../../../..'),target=path.join(root,'Tools/RotateLevelDesigner/ingame');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const write=(name,x)=>fs.writeFileSync(path.join(out,name),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const now=new Date().toISOString(),inputs=read(path.join(out,'input-manifest.json')).entries;
const manifest=read(path.join(root,'Tools/LevelGen/IMPORT_MANIFEST.json')).rows.filter(x=>x.slot>=101&&x.slot<=250);
const progress=read(path.join(out,'body-progress.json')),files=fs.readdirSync(out),verified=[],manual=[],copies=[];
const originals=fs.readdirSync(target).filter(f=>f.endsWith('.rrpack.json')).map(file=>({file,sha256:hash(path.join(target,file)),levelId:read(path.join(target,file)).runtime.levelId}));
if(originals.length!==100)throw Error('Expected original100; inspect before integration');
const ids=new Set(originals.map(x=>Number(x.levelId)));
if(inputs.length!==150||manifest.length!==150)throw Error('Expected150 inputs');
for(const e of inputs){
 const row=manifest.find(x=>x.slot===e.slot),source=path.join(root,'Tools/LevelGen',e.pack),dest=path.join(target,path.basename(e.pack));
 if(!row||row.pack!==e.pack||row.packSha256!==e.sha256||hash(source)!==e.sha256)throw Error('Input mismatch '+e.slot);
 if(Number(read(source).runtime.levelId)!==e.slot||ids.has(e.slot)||fs.existsSync(dest))throw Error('ID/path conflict '+e.slot);
 ids.add(e.slot);
 const attempts=files.filter(f=>new RegExp('^A'+e.slot+'-(?:initial|deep|body(?:-v2)?-(?:initial|deep|180))\\.json$').test(f)).map(f=>({file:f,data:read(path.join(out,f))}));
 for(const a of attempts)if(a.data.packSha256&&a.data.packSha256!==e.sha256)throw Error('Proof hash mismatch '+a.file);
 const good=attempts.filter(a=>(a.data.verified===true&&a.data.defaultFeel?.ok===true)||(a.data.replay?.verified===true&&a.data.replay.defaultFeel?.ok===true)).sort((a,b)=>Number(b.file.includes('deep'))-Number(a.file.includes('deep')))[0];
 if(good){
  const r=good.data,p=r.replay?.verified?r.replay:r,moves=p.moves,proof=p.defaultFeel;
  if(!Array.isArray(moves)||!proof.ok)throw Error('Incomplete saved proof '+e.slot);
  const events=(proof.trace||[]).flatMap(t=>t.events||[]);
  const route={slot:e.slot,stem:e.stem,pack:e.pack,packSha256:e.sha256,moves,bombsEnabled:r.bombsEnabled,boosterUsed:false,bombEvents:events,defaultFeelVerified:true,analyticSameRouteVerified:p.analytic?.ok===true,evidence:good.file,verification:'Saved completed current-pose body hitTest/fresh beginDrag/full pointer target/release replay; no additional search after user stop. JS simulation only, not Unity/device certification.'};
  write('A'+e.slot+'-stopped-verified-route.json',route);
  verified.push({slot:e.slot,stem:e.stem,packSha256:e.sha256,moves:moves.length,bombEvents:events.length,route:'A'+e.slot+'-stopped-verified-route.json',evidence:good.file});
 }else{
  const deep=attempts.find(a=>a.file.endsWith('body-v2-deep.json')),active=progress.active.find(a=>a.slot===e.slot),remaining=attempts.map(a=>a.data.bestRemaining).filter(Number.isFinite);
  if(Number.isFinite(active?.progress?.bestRemaining))remaining.push(active.progress.bestRemaining);
  manual.push({slot:e.slot,stem:e.stem,pack:e.pack,ingamePack:path.basename(e.pack),packSha256:e.sha256,status:'needs_GD_manual_solution_check',deepStatus:deep?'completed_without_verified_solution':active?'interrupted_by_user':'not_completed_before_user_stop',bestRemaining:remaining.length?Math.min(...remaining):null,activeAtStop:active||null,attempts:attempts.map(a=>({evidence:a.file,found:a.data.found,verified:false,seconds:a.data.seconds,samples:a.data.nodes,bestRemaining:a.data.bestRemaining,limits:a.data.limits,structuralWitness:a.data.structuralWitness})),limitation:'Chưa có lời giải được xác nhận; không kết luận vô nghiệm. BestRemaining là quan sát trạng thái tìm kiếm, không là prefix được chứng nhận.'});
 }
 copies.push({slot:e.slot,stem:e.stem,source:path.relative(root,source).replaceAll('\\','/'),destination:path.relative(root,dest).replaceAll('\\','/'),sha256:e.sha256,solutionStatus:good?'verified_JS_default_feel':'needs_GD_manual_solution_check'});
}
if(verified.length+manual.length!==150)throw Error('Missing slots');
write('ingame-original100-before.json',originals);
write('stopped-progress-snapshot.json',{stoppedAtUtc:now,...progress});
for(const x of copies){fs.copyFileSync(path.join(root,x.source),path.join(root,x.destination),fs.constants.COPYFILE_EXCL);if(hash(path.join(root,x.destination))!==x.sha256)throw Error('Copy hash mismatch '+x.slot);}
for(const x of originals)if(hash(path.join(target,x.file))!==x.sha256)throw Error('Original changed '+x.file);
const after=fs.readdirSync(target).filter(f=>f.endsWith('.rrpack.json'));
if(after.length!==250||new Set(after.map(f=>Number(read(path.join(target,f)).runtime.levelId))).size!==250)throw Error('Final inventory mismatch');
const result={stoppedAtUtc:now,status:'stopped_by_user',range:[101,250],total:150,initialPassCompleted:150,deepPassCompleted:false,verifiedCount:verified.length,manualCount:manual.length,verified,manual,allSourcePackHashesUnchanged:true,searchAfterStop:false,limitations:['Lời giải xác nhận bằng replay JS với default feel, không dùng Booster; chưa chứng nhận Unity/thiết bị/độ khó.','83/nhóm chưa xác nhận gồm hết ngân sách, frontier lấy mẫu, lượt sâu bị dừng hoặc chưa chạy; không kết luận vô nghiệm.'],integration:{newPacks:150,totalIngame:250,original100Unchanged:true,unityCampaignModified:false,proofEmbeddedInSource:false}};
result.limitations[1]=manual.length+' màn chưa xác nhận gồm hết ngân sách, frontier lấy mẫu, lượt sâu bị dừng hoặc chưa chạy; không kết luận vô nghiệm.';
write('stopped-result.json',result);write('MANUAL_CHECK_LIST.json',{count:manual.length,rows:manual});
fs.writeFileSync(path.join(out,'MANUAL_CHECK_LIST.csv'),'\ufeffslot,stem,ingamePack,deepStatus,bestRemaining\r\n'+manual.map(x=>[x.slot,x.stem,x.ingamePack,x.deepStatus,x.bestRemaining??''].join(',')).join('\r\n')+'\r\n',{flag:'wx'});
write('ingame-integration-manifest.json',{atUtc:now,status:'copied_for_GD_review',count:150,totalIngame:250,original100Unchanged:true,unityCampaignModified:false,rows:copies});
const cp=path.join(root,'Tools/RotateLevelDesigner/research/20261013/ongoing-research-state.json'),state=read(cp);
state.updatedAtUtc=now;state.levelGenSolutionAudit20261021={...state.levelGenSolutionAudit20261021,status:'stopped_by_user',stoppedAtUtc:now,initialPassCompleted:150,deepPassCompleted:false,verified:verified.map(x=>x.slot),manualCheck:manual.map(x=>x.slot),finalEvidence:'Tools/RotateLevelDesigner/research/20261021-levelgen-solution-audit/stopped-result.json',sourcePacksUnchanged:true,campaignModified:false};
state.levelGenIngameIntegration20261021={status:'copied_for_GD_review',atUtc:now,range:[101,250],newPacks:150,totalIngame:250,original100Unchanged:true,unityCampaignModified:false,unresolvedIncludedByUserRequest:true,manifest:'Tools/RotateLevelDesigner/research/20261021-levelgen-solution-audit/ingame-integration-manifest.json'};
fs.writeFileSync(cp,JSON.stringify(state,null,1)+'\n');
fs.appendFileSync(path.join(root,'Assets/Document/TURP_ProjectScan.md'),`\n\n### Dừng audit theo yêu cầu và đưa150 pack vào ingame —21/10/2026\n\nNgười dùng yêu cầu dừng, liệt kê toàn bộ màn chưa giải được và tích hợp150LevelGen vào folder ingame để GD check. Đã xác minh PID đúng body-batch.cjs và dừng process cùng worker; không tìm kiếm thêm. Lượt đầu đủ150, lượt sâu chưa hoàn tất. Chốt từ proof replay đã lưu và hash nguồn: **${verified.length} màn có lời giải xác nhận bằng JS default feel, ${manual.length} màn chưa có lời giải xác nhận**. Không Booster; chưa là chứng nhận Unity/device hoặc vô nghiệm cho nhóm còn lại. Lượt sâu bị dừng/chưa chạy được đánh dấu riêng.\n\nCần GD kiểm tay: ${manual.map(x=>'A'+x.slot).join(', ')}.\n\nĐã copy đúng150pack slot101–250 theo Tools/LevelGen/IMPORT_MANIFEST.json vào Tools/RotateLevelDesigner/ingame, gồm cả nhóm chưa xác nhận theo yêu cầu trực tiếp. Giữ revision r02 cho101/119/120/125. Đối chiếu SHA256 đủ150bản copy bằng nguồn,100pack cũ giữ nguyên byte, tổng250pack/250IDunique. Không sửa nguồn, nhúng proof, sửa campaign Designer/Unity hay import Unity. Tất cả150vẫn proposal chờ GD, không tự approved.\n\nBằng chứng ở research/20261021-levelgen-solution-audit: stopped-result.json, MANUAL_CHECK_LIST.json/CSV, stopped-progress-snapshot.json, ingame-original100-before.json, ingame-integration-manifest.json và A<slot>-stopped-verified-route.json. Checkpoint đã chuyển stopped_by_user, ghi integration riêng; không commit/push/merge/upload/phát hành.\n`);
console.log(JSON.stringify({verified:verified.length,manual:manual.length,manualSlots:manual.map(x=>x.slot),copied:copies.length,totalIngame:after.length},null,2));

'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),cp=require('child_process');
const OUT=__dirname,ROOT=path.resolve(OUT,'../../../..'),TOOL=path.join(ROOT,'Tools/RotateLevelDesigner'),CAMPAIGN=path.join(ROOT,'Assets/_IEC/Config/TURP/Campaign'),PREFAB=path.join(ROOT,'Assets/_IEC/Prefab/_Controllers.prefab'),BUNDLE=path.join(TOOL,'rr-campaign.js');
const R=require('../../rr-core.js'),G=require('../pose-body-gesture-query.js'),read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),rel=p=>path.relative(ROOT,p).replaceAll('\\','/');
const targetManifest=path.join(OUT,'manifest.json');assert(!fs.existsSync(targetManifest),'Integration already exists; inspect it');
const ingame=path.join(TOOL,'ingame'),packs=fs.readdirSync(ingame).filter(f=>f.endsWith('.rrpack.json')).map(f=>({file:path.join(ingame,f),pack:read(path.join(ingame,f))}));
assert.equal(packs.length,250);const bySlot=new Map(packs.map(x=>[Number(x.pack.runtime.levelId),x]));assert.equal(bySlot.size,250);
const originalProofs=read(path.join(OUT,'../20261021-levelgen-solution-audit/stopped-result.json')).verified,repairs=read(path.join(OUT,'../20261021-levelgen-repair-155-240/ingame-update-manifest.json')).rows;
const selected=new Set([...Array.from({length:150},(_,i)=>i+1),...Array.from({length:8},(_,i)=>241+i),...originalProofs.map(x=>x.slot),...repairs.map(x=>x.slot)]),slots=[...selected].sort((a,b)=>a-b),excluded=Array.from({length:250},(_,i)=>i+1).filter(x=>!selected.has(x));assert.equal(slots.length,237);
const prefabBefore=fs.readFileSync(PREFAB),prefabText=prefabBefore.toString(),arrayRx=/^ {2}sampleLevels:[^\r\n]*\r?\n(?: {2}- [^\r\n]*\r?\n)*/m,arrayBlock=prefabText.match(arrayRx);assert(arrayBlock);assert.equal(prefabText.match(new RegExp(arrayRx.source,'gm')).length,1);
const oldGuids=[...arrayBlock[0].matchAll(/guid: ([0-9a-f]{32})/g)].map(m=>m[1]);assert.equal(oldGuids.length,100);
const existing=fs.readdirSync(CAMPAIGN).filter(f=>fs.statSync(path.join(CAMPAIGN,f)).isFile()).map(f=>({file:path.join(CAMPAIGN,f),sha256:sha(path.join(CAMPAIGN,f))}));
const metaTemplate=fs.readFileSync(path.join(CAMPAIGN,'Level100.json.meta'),'utf8'),guids=new Set(existing.filter(x=>x.file.endsWith('.meta')).map(x=>fs.readFileSync(x.file,'utf8').match(/guid: ([0-9a-f]{32})/)?.[1]).filter(Boolean)),plan=[];
function sameFloatContent(a,b){if(typeof a==='number'&&typeof b==='number')return Math.fround(a)===Math.fround(b);if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;const ka=Object.keys(a),kb=Object.keys(b);return ka.length===kb.length&&ka.every(k=>Object.hasOwn(b,k)&&sameFloatContent(a[k],b[k]));}
for(let i=0;i<slots.length;i++){
 const slot=slots[i],{file,pack}=bySlot.get(slot),id=pack.runtime.levelId,asset=path.join(CAMPAIGN,'Level'+id+'.json'),meta=asset+'.meta';assert.equal(R.validate(pack.runtime),null,'Runtime invalid '+slot);
 let guid,review=slot<=150?'GD_checked_through_150':slot>=241&&slot<=248?'user_manually_checked_241_248':'saved_full_gesture_solution_JS';
 if(slot<=100){assert(fs.existsSync(asset)&&fs.existsSync(meta));guid=fs.readFileSync(meta,'utf8').match(/guid: ([0-9a-f]{32})/)[1];assert.equal(guid,oldGuids[i]);assert(sameFloatContent(read(asset),pack.runtime),'Original campaign differs beyond known serialization precision '+slot);}
 else {assert(!fs.existsSync(asset)&&!fs.existsSync(meta),'New ID already exists; inspect before replacing '+id);do{guid=crypto.randomBytes(16).toString('hex');}while(guids.has(guid));guids.add(guid);}
 let proofEvidence=null;
 if(review==='saved_full_gesture_solution_JS'){
  const fixed=repairs.find(x=>x.slot===slot);let route,bombs;
  if(fixed){const d=read(path.join(OUT,'../20261021-levelgen-repair-155-240',fixed.proof));route=d.moves;bombs=true;assert.equal(sha(file),fixed.sha256);proofEvidence='Tools/RotateLevelDesigner/research/20261021-levelgen-repair-155-240/'+fixed.proof;}
  else {const d=read(path.join(OUT,'../20261021-levelgen-solution-audit/A'+slot+'-stopped-verified-route.json'));route=d.moves;bombs=d.bombsEnabled;proofEvidence='Tools/RotateLevelDesigner/research/20261021-levelgen-solution-audit/A'+slot+'-stopped-verified-route.json';}
  const proof=G.replay(pack.runtime,route,bombs,true);assert(proof.ok,'Previously verified route no longer completes '+slot);
 }
 plan.push({ordinal:i+1,slot,levelId:id,source:rel(file),sourceSha256:sha(file),asset:rel(asset),meta:rel(meta),guid,review,proofEvidence,preserveExisting:slot<=100,runtime:pack.runtime});
}
assert.equal(new Set(plan.map(x=>x.guid)).size,237);
const backup=path.join(OUT,'backup');assert(!fs.existsSync(backup));fs.mkdirSync(backup);
for(const file of [PREFAB,BUNDLE]){const destination=path.join(backup,rel(file));fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(file,destination,fs.constants.COPYFILE_EXCL);}
fs.writeFileSync(path.join(OUT,'before.json'),JSON.stringify({atUtc:new Date().toISOString(),campaignFiles:existing.map(x=>({file:rel(x.file),sha256:x.sha256})),prefabSha256:sha(PREFAB),bundleSha256:sha(BUNDLE),oldGuids,allIngame:packs.map(x=>({file:rel(x.file),sha256:sha(x.file)}))},null,2)+'\n',{flag:'wx'});
for(const p of plan.filter(x=>!x.preserveExisting)){
 assert.equal(sha(path.join(ROOT,p.source)),p.sourceSha256,'Pack changed during planning');
 fs.writeFileSync(path.join(ROOT,p.asset),JSON.stringify(p.runtime,null,2)+'\n',{flag:'wx'});
 fs.writeFileSync(path.join(ROOT,p.meta),metaTemplate.replace(/guid: [0-9a-f]{32}/,'guid: '+p.guid),{flag:'wx'});
 assert.deepEqual(read(path.join(ROOT,p.asset)),p.runtime);
}
const nl=prefabText.includes('\r\n')?'\r\n':'\n',newArray='  sampleLevels:'+nl+plan.map(x=>'  - {fileID: 4900000, guid: '+x.guid+', type: 3}'+nl).join('');
assert.equal(sha(PREFAB),crypto.createHash('sha256').update(prefabBefore).digest('hex'),'Prefab concurrently changed');
const changed=prefabText.replace(arrayRx,newArray);assert.equal(changed.replace(arrayRx,''),prefabText.replace(arrayRx,''));fs.writeFileSync(PREFAB,changed);
const nativeValidate=cp.execFileSync(process.execPath,[path.join(TOOL,'rr-cli.js'),'validate',...plan.filter(x=>!x.preserveExisting).map(x=>path.join(ROOT,x.asset))],{encoding:'utf8',maxBuffer:5*1024*1024});
fs.writeFileSync(path.join(OUT,'native-validate.txt'),nativeValidate,{flag:'wx'});
const bundleLog=cp.execFileSync(process.execPath,[path.join(TOOL,'rr-cli.js'),'bundle-campaign'],{encoding:'utf8'});
const text=fs.readFileSync(BUNDLE,'utf8'),bundle=JSON.parse(text.slice(text.indexOf('window.RR_CAMPAIGN = ')+21).replace(/;\s*$/,''));
assert.equal(bundle.order.length,237);assert.deepEqual(bundle.order.map(x=>Number(x.levelId)),slots);
for(const p of plan){const asset=path.join(ROOT,p.asset);assert(sameFloatContent(read(asset),p.runtime));assert.equal(fs.readFileSync(path.join(ROOT,p.meta),'utf8').match(/guid: ([0-9a-f]{32})/)[1],p.guid);assert.equal(sha(path.join(ROOT,p.source)),p.sourceSha256);}
for(const x of existing)assert.equal(sha(x.file),x.sha256,'Existing campaign asset changed '+x.file);
const result={atUtc:new Date().toISOString(),status:'applied_on_disk_editor_import_pending',totalCampaign:237,previousCampaign:100,newCampaignAssets:137,excluded,original100BytesGuidsAndOrderPreserved:true,prefabOnlySampleLevelsChanged:true,allExisting155AssetsPreserved:true,sourcePacksUnchanged:true,boosterUsedBySavedRoutes:false,newSolutionSearchRun:false,backup:rel(backup),bundleLog:bundleLog.trim(),rows:plan.map(({runtime,...p})=>({...p,assetSha256:sha(path.join(ROOT,p.asset))})),limitations:['79 levels beyond the GD-reviewed ranges have full-gesture/default-feel JS solutions, not Unity/device gameplay certification.','Original level IDs are retained, but after skipped IDs the player ordinal differs; exact mapping is in CAMPAIGN_ORDER.csv.','This does not mark automated levels GD-approved or alter player save data.']};
fs.writeFileSync(targetManifest,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(OUT,'CAMPAIGN_ORDER.csv'),'\ufeffcampaignOrdinal,sourceLevelId,reviewStatus,sourcePack,unityAsset\r\n'+plan.map(x=>[x.ordinal,x.levelId,x.review,x.source,x.asset].join(',')).join('\r\n')+'\r\n',{flag:'wx'});
const statePath=path.join(TOOL,'research/20261013/ongoing-research-state.json'),state=read(statePath);state.levelGenUnityCampaign20261021={status:result.status,atUtc:result.atUtc,campaignCount:237,added:137,excluded,evidence:rel(targetManifest),ingameFixedCount:42,original100Preserved:true,saveModified:false};fs.writeFileSync(statePath,JSON.stringify(state,null,1)+'\n');
fs.appendFileSync(path.join(ROOT,'Assets/Document/TURP_ProjectScan.md'),'\n\n## 124. Tích hợp campaign Unity theo các màn GD/user đã kiểm và route đã có (21/10/2026)\n\nNgười dùng xác nhận GD đã kiểm hết150 và user tự kiểm241–248, yêu cầu đưa các màn này cùng các màn đã giải được vào campaign. Đã chọn237ID:150GDchecked +8userchecked +79routeJSverified (gồm42revision sửa); loại13ID chưa có xác nhận: '+excluded.join(', ')+'. Không mở lại search/sửa màn mới. Phát lại route đã lưu của79màn tự động trên đúng pack ingame hiện tại đều hoàn tất defaultfeel, không Booster. Không tự gắn GDapproved cho nhóm tự động.\n\nGiữ nguyên bytes/GUID/thứ tự100slot đầu (sai số sourcefloat32/Unityserialize đối chiếu≤1e-5, không ghi lại); thêm137JSON runtime nguyên từpack và TextScriptImporter meta GUIDunique. Chỉ thay array sampleLevels của _Controllers.prefab theo cơ chế registry hiện có; ngoàiarray giữ nguyên bytes. Giữ đủ155asset cũ (55asset ngoài thứ tự vẫn ngoài), save/gameplay/core/tuning không đổi. CLIvalidate137asset mới OK; bundle-campaign cập nhật từ100 lên237, đủ237GUIDresolve/no duplicate/no excluded ID. IDgốc giữ nguyên, ordinal chơi sau cácID bị bỏ khác ID; bảng CAMPAIGN_ORDER.csv ghi rõ.\n\nChỉ mục research/20261021-campaign-verified-update/manifest.json, trước thay before.json, backup prefab/bundle tại backup/, native-validate.txt và CAMPAIGN_ORDER.csv. Trạng thái import Editor còn cần đối chiếu log; không gọi đã chơi thử Unity/device. Không commit/push/merge/upload/phát hành.\n');
console.log(JSON.stringify({campaign:237,added:137,excluded,original100Preserved:true,bundle:bundleLog.trim(),status:result.status},null,2));

'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const ROOT=path.resolve(__dirname,'../../../..');process.chdir(ROOT);
const OUT=path.relative(ROOT,__dirname).replaceAll('\\','/'),TOOL='Tools/RotateLevelDesigner',source=TOOL+'/levels/A010_20261026_image-r01.rrpack.json',ingame=TOOL+'/ingame/genai-31-helicopter-v03.rrpack.json',unity='Assets/_IEC/Config/TURP/Campaign/Level010.json',prefab='Assets/_IEC/Prefab/_Controllers.prefab',bundle=TOOL+'/rr-campaign.js';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const writeNew=(f,x)=>fs.writeFileSync(f,JSON.stringify(x,null,2)+'\n',{flag:'wx'});
function inventory(){const dirs=[TOOL+'/ingame','Assets/_IEC/Config/TURP/Campaign',TOOL+'/core'];const files=dirs.flatMap(dir=>fs.readdirSync(dir).filter(f=>fs.statSync(path.join(dir,f)).isFile()).map(f=>dir+'/'+f)).concat([prefab,bundle,unity+'.meta',TOOL+'/app.js',TOOL+'/rr-constants.js',TOOL+'/test/golden-unity.json']);return Object.fromEntries([...new Set(files)].sort().map(f=>[f,hash(f)]));}
function order(){const text=fs.readFileSync(prefab,'utf8'),block=/^ {2}sampleLevels:[^\r\n]*\r?\n((?: {2}- [^\r\n]*\r?\n)*)/m.exec(text);assert(block);return [...block[1].matchAll(/guid: ([0-9a-f]{32})/g)].map(m=>m[1]);}
const pack=read(source),delivery=read(OUT+'/final-delivery.json');assert.equal(delivery.status,'ready_to_apply');assert.equal(pack.runtime.levelId,'010');
const mode=process.argv[2];
if(mode==='apply'){
 assert(!fs.existsSync(OUT+'/before.json'),'Backup already exists; do not apply twice');
 const guid=/guid: ([0-9a-f]{32})/.exec(fs.readFileSync(unity+'.meta','utf8'))[1],campaign=order();assert.equal(campaign[9],guid);assert.equal(read(ingame).runtime.levelId,'010');
 const before=inventory();for(const f of[ingame,unity,unity+'.meta',prefab,bundle]){const dest=OUT+'/backup/'+f;fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(f,dest,fs.constants.COPYFILE_EXCL);}
 writeNew(OUT+'/before.json',{hashes:before,sourceHash:hash(source),order:campaign,authorization:'User requested replace current level10 with attached GD image.'});
 fs.writeFileSync(ingame,fs.readFileSync(source));fs.writeFileSync(unity,JSON.stringify(pack.runtime,null,2)+'\n');console.log('Applied ingame and Unity Level010; bundle regeneration next.');
}else if(mode==='verify'){
 const before=read(OUT+'/before.json'),after=inventory(),allowed=new Set([ingame,unity,bundle]);assert.deepEqual(Object.keys(after),Object.keys(before.hashes));for(const f of Object.keys(after))if(!allowed.has(f))assert.equal(after[f],before.hashes[f],'Unexpected change '+f);assert.deepEqual(order(),before.order);assert.equal(hash(source),before.sourceHash);assert.equal(hash(ingame),hash(source));assert.deepEqual(read(unity),pack.runtime);
 const b=fs.readFileSync(bundle,'utf8'),start=b.indexOf('window.RR_CAMPAIGN = ')+20,body=b.slice(start).trim().replace(/;$/,''),campaign=JSON.parse(body);assert.deepEqual(campaign.levels['010'],pack.runtime);assert.equal(campaign.order[9].levelId,'010');assert.equal(campaign.order.length,before.order.length);
 const manifest={status:'applied_on_disk',slot:10,id:'010',source,ingame,unity,sourceSha256:hash(source),unitySha256:hash(unity),backup:OUT+'/backup',campaignCount:before.order.length,campaignOrderUnchanged:true,metaUnchanged:true,changedFiles:Object.keys(after).filter(f=>after[f]!==before.hashes[f]),designerEvidence:OUT+'/final-delivery.json',unityEditorImport:'pending',gameplayUnityTest:false};writeNew(OUT+'/applied.json',manifest);
 const cp=TOOL+'/research/20261013/ongoing-research-state.json',state=read(cp);if(state.levelRebuild25120261026?.status==='in_progress')state.levelRebuild25120261026.status='stopped_by_user';state.lastManualLevelReplacement20261026={slot:10,id:'010',status:manifest.status,evidence:OUT+'/applied.json',sourceImage:OUT+'/gd-reference.png'};fs.writeFileSync(cp,JSON.stringify(state,null,1)+'\n');console.log(JSON.stringify(manifest,null,2));
}else throw Error('Use apply or verify');

'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),assert=require('assert/strict');
const OUT=__dirname,ROOT=path.resolve(OUT,'../../../..'),TOOL=path.join(ROOT,'Tools/RotateLevelDesigner');process.chdir(ROOT);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const json=(p,v)=>fs.writeFileSync(path.join(OUT,p),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const RR=require(path.join(TOOL,'rr-core.js'));
// Use the previously authored local checker, never execute scripts supplied by GD.
const trusted=path.join(TOOL,'research/20261020-levelgen-handoff/generated/scripts');
let common=fs.readFileSync(path.join(trusted,'common.cjs'),'utf8').replace("const ROOT=path.resolve(__dirname,'..'),TOOL=path.join(ROOT,'Tools/RotateLevelDesigner');",`const ROOT=${JSON.stringify(ROOT)},TOOL=${JSON.stringify(TOOL)};`);
fs.writeFileSync(path.join(OUT,'audit-common.cjs'),common,{flag:'wx'});
let checkCode=fs.readFileSync(path.join(trusted,'check-level.cjs'),'utf8').replace("require('./common.cjs')","require('./audit-common.cjs')").replace("require('../references/TURPLevel/LevelVariants/overlap_check.js')",`require(${JSON.stringify('C:/Project Folder/TURPLevel/LevelVariants/overlap_check.js')})`).replace("require('../Tools/RotateLevelDesigner/research/turp-color-near.js')","require('../turp-color-near.js')");
fs.writeFileSync(path.join(OUT,'audit-static.cjs'),checkCode,{flag:'wx'});const {check}=require('./audit-static.cjs');
function resolve(root,p){assert.equal(typeof p,'string');const a=path.resolve(root,p);assert.ok(a.startsWith(root+path.sep),'Path escapes delivery '+p);return a;}
function integrity(root,file){const m=read(path.join(root,file)),list=m.files;assert.ok(Array.isArray(list));const issues=[];
 for(const e of list){const p=resolve(root,e.path);if(!fs.existsSync(p))issues.push({path:e.path,error:'missing'});else{const h=hash(p);if(h!==e.sha256)issues.push({path:e.path,error:'hash',expected:e.sha256,actual:h});if(e.bytes!=null&&fs.statSync(p).size!==e.bytes)issues.push({path:e.path,error:'size'});}}
 return{files:list.length,issues};}
function native(files){let ok=true,logs=[];for(let i=0;i<files.length;i+=12){const r=cp.spawnSync(process.execPath,[path.join(TOOL,'rr-cli.js'),'validate',...files.slice(i,i+12)],{encoding:'utf8',maxBuffer:8*1024*1024});if(r.error)throw r.error;logs.push(r.stdout+r.stderr);if(r.status!==0)ok=false;}return{ok,log:logs.join('\n')};}
function count(d){return{rings:d.rings?.length||0,closed:(d.rings||[]).filter(r=>r.gap===0).length,sticks:d.sticks?.length||0,guides:(d.sticks||[]).reduce((a,s)=>a+(s.guides?.length||0),0),pins:(d.rings||[]).reduce((a,r)=>a+(r.pins?.length||0),0),stops:(d.rings||[]).reduce((a,r)=>a+(r.stops?.length||0),0),bombs:(d.bombs?.length||0)+[...d.rings||[],...d.sticks||[]].filter(x=>x.bomb).length};}
function bodySignature(d){const variants=[];for(const sign of [-1,1])for(const angle of [0,90,180,270]){
 const tr=([x,y])=>{const q=RR.M.rot(RR.M.V(x*sign,y),angle);return[q.x,q.y];},rings=(d.rings||[]).map(r=>({p:tr([r.x,r.y]),radius:r.radius||1.75,gap:r.gap==null?90:r.gap,gd:tr([Math.cos((r.gapDir||0)*RR.D2R),Math.sin((r.gapDir||0)*RR.D2R)])}));
 const sticks=(d.sticks||[]).map(s=>(s.path||RR.Builder.stickPath(s.shape||'straight',s.length||5.4167,s.arm||2.2083)).map(([x,y])=>{const p=RR.M.rot(RR.M.V(x,y),s.angle||0);return tr([s.x+p.x,s.y+p.y]);}));
 const pts=[...rings.map(r=>r.p),...sticks.flat()];if(!pts.length)return'empty';const x=Math.min(...pts.map(p=>p[0])),y=Math.min(...pts.map(p=>p[1])),n=v=>Math.round(v*1e4)/1e4,norm=p=>[n(p[0]-x),n(p[1]-y)];
 const r=rings.map(r=>[...norm(r.p),n(r.radius),r.gap,r.gap===0?0:n(Math.atan2(r.gd[1],r.gd[0])/RR.D2R)]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 const s=sticks.map(p=>{const a=p.map(norm);const b=a.slice().reverse();return JSON.stringify(a)<JSON.stringify(b)?a:b;}).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 variants.push(JSON.stringify({r,s}));}return variants.sort()[0];}
const levelRoot=path.join(ROOT,'Tools/LevelGen'),ringRoot=path.join(ROOT,'Tools/RingLab-GameDeveloper-20261021-r01');
const report={atUtc:new Date().toISOString(),solutionSearch:false,campaignModified:false,coreUsed:'Tools/RotateLevelDesigner/core',levelGen:{},ringLab:{}};
report.levelGen.integrity=integrity(levelRoot,'PACKAGE_MANIFEST.json');report.ringLab.integrity=integrity(ringRoot,'SHA256.json');
const lm=read(path.join(levelRoot,'IMPORT_MANIFEST.json')),rows=lm.rows;report.levelGen.slots=rows.map(r=>r.slot);report.levelGen.uniqueSlots=new Set(report.levelGen.slots).size;
report.levelGen.missingSlots=Array.from({length:250},(_,i)=>i+1).filter(n=>!report.levelGen.slots.includes(n));
report.levelGen.original100=rows.filter(r=>r.slot<=100).map(r=>({slot:r.slot,matchesCurrent:hash(resolve(levelRoot,r.pack))===hash(path.join(TOOL,'ingame',read(path.join('C:/Project Folder/LevelGen/references/CAMPAIGN_CATALOG.json')).rows.find(x=>x.slot===r.slot).pack.split('/').pop()))}));
const sourceMap=new Map((lm.sourceMapping||[]).map(x=>[x.originalPath,x.bundlePath]));
const newer=rows.filter(r=>r.slot>=101),allNative=[],results=[],groups=new Map();
for(const row of newer){const p=resolve(levelRoot,row.pack),d=resolve(levelRoot,row.design),pack=read(p),des=read(d),sp=row.source?.path,src=sp?resolve(levelRoot,sourceMap.get(sp)||sp):undefined;
 const c=check(p,src);const issues=[];if(hash(p)!==row.packSha256)issues.push('packHash');if(hash(d)!==row.designSha256)issues.push('designHash');if(JSON.stringify(des)!==JSON.stringify(pack.design))issues.push('designPairMismatch');if(String(pack.levelId)!==String(row.slot)||String(pack.runtime.levelId)!==String(row.slot))issues.push('slotID');
 if(src&&row.source.sha256&&hash(src)!==row.source.sha256)issues.push('sourceHash');
 const cfile='LevelGen-'+row.slot+'-checks.json';json(cfile,c);results.push({slot:row.slot,stem:row.stem,pack:row.pack,ok:c.ok&&!issues.length,issues,errors:c.errors,counts:count(des),source:sp,proof:pack.proof,checks:cfile});allNative.push(d,p);
 const sig=bodySignature(des);groups.set(sig,[...(groups.get(sig)||[]),row.slot]);
}
report.levelGen.newResults=results;report.levelGen.bodyLayoutRepeatGroups=[...groups.values()].filter(a=>a.length>1);report.levelGen.native=native(allNative);fs.writeFileSync(path.join(OUT,'levelgen-native.txt'),report.levelGen.native.log);delete report.levelGen.native.log;
const rm=read(path.join(ringRoot,'manifest.json')),ready=rm.entries.filter(e=>e.pack),held=rm.entries.filter(e=>!e.pack),listed=read(path.join(ringRoot,'IMPORT_ONLY_THESE_PACKS.json')).packs;report.ringLab.listedPackCount=listed.length;report.ringLab.importListExample=listed[0];
const readyResults=[],ringNative=[];
for(const e of ready){const p=resolve(ringRoot,e.pack),d=resolve(ringRoot,e.nativeDesign),source=path.join(path.dirname(p),'source-reference.json');const c=check(p,source),pack=read(p),issues=[];
 if(e.packSha256&&hash(p)!==e.packSha256)issues.push('packHash');if(JSON.stringify(read(d))!==JSON.stringify(pack.design))issues.push('designPairMismatch');
 const cfile='RingLab-'+e.id+'-checks.json';json(cfile,c);readyResults.push({id:e.id,title:e.title,pack:e.pack,ok:c.ok&&!issues.length,issues,errors:c.errors,counts:count(pack.design),checks:cfile});ringNative.push(d,p);
}
report.ringLab.readyResults=readyResults;report.ringLab.native=native(ringNative);fs.writeFileSync(path.join(OUT,'ringlab-native.txt'),report.ringLab.native.log);delete report.ringLab.native.log;
const categories={};for(const e of held)for(const x of e.errors||[])categories[x.code]=(categories[x.code]||0)+1;
report.ringLab.heldCount=held.length;report.ringLab.heldErrorsReported=categories;report.ringLab.heldIDs=held.map(e=>e.id);
report.summary={levelGenNew:results.length,levelGenStaticPass:results.filter(r=>r.ok).length,levelGenFailed:results.filter(r=>!r.ok).map(r=>r.slot),original100Changed:report.levelGen.original100.filter(x=>!x.matchesCurrent).map(x=>x.slot),ringLabReady:ready.length,ringLabStaticPass:readyResults.filter(r=>r.ok).length,ringLabFailed:readyResults.filter(r=>!r.ok).map(r=>r.id),ringLabHeld:held.length,levelGenHashIssues:report.levelGen.integrity.issues.length,ringLabHashIssues:report.ringLab.integrity.issues.length};
json('report.json',report);console.log(JSON.stringify(report.summary,null,2));

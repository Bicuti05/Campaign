'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const OUT=__dirname,ROOT=path.resolve(OUT,'../../../..'),TOOL=path.join(ROOT,'Tools/RotateLevelDesigner');
const RR=require(path.join(TOOL,'rr-core.js'));
const G=require('../pose-body-gesture-query.js');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function write(p,v){fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');}
function fullReplay(level,moves,bombs){
 const tries=[];
 for(const extra of [0,3,6,9,12]){
  const candidate=moves.map(m=>({part:m.part,target:m.target+(m.direction||1)*(m.kind==='stick'?(extra?.2:0):extra)}));
  const feel=G.replay(level,candidate,bombs,true);const analytic=G.replay(level,candidate,bombs,false);
  tries.push({extra,feelOK:feel.ok,analyticOK:analytic.ok,feelRemaining:feel.trace.at(-1)?.remaining,analyticRemaining:analytic.trace.at(-1)?.remaining});
  if(feel.ok&&analytic.ok)return{verified:true,extra,moves:candidate,defaultFeel:feel,analytic,attempts:tries,bombEvents:feel.trace.flatMap(x=>x.events||[])};
 }
 return{verified:false,attempts:tries};
}
if(!isMainThread){
 const {entry,seconds,nodes,stage}=workerData;
 try{
  const pack=read(entry.absolutePack);if(hash(entry.absolutePack)!==entry.sha256)throw Error('Pack changed after manifest');
  const lv=pack.runtime,bombs=!!lv.parts.some(p=>p.kind==='bomb'||p.hasBomb),options={nodeLimit:nodes,timeLimitSeconds:seconds,explodeBombs:bombs,sliceMs:1000};
  const gen=RR.Solver.findSteps(lv,options);let step,last=0;
  do{step=gen.next();if(!step.done&&Date.now()-last>15000){parentPort.postMessage({type:'progress',slot:entry.slot,stage,...step.value});last=Date.now();}}while(!step.done);
  const r=step.value,base=new RR.Simulation(lv),mapped=r.moves.map(m=>({part:base.idOf(m.obj),target:m.target,kind:base.isStick(m.obj)?'stick':'ring'}));
  if(r.found){const native=RR.Solver.describeRoute(lv,r.moves,bombs);for(let i=0;i<mapped.length;i++)mapped[i].direction=native[i].direction==='-'||native[i].direction==='CW'?-1:1;}
  let replay=null;if(r.found)replay=fullReplay(lv,mapped,bombs);
  const out={atUtc:new Date().toISOString(),slot:entry.slot,stem:entry.stem,pack:entry.pack,packSha256:entry.sha256,stage,limits:options,bombsEnabled:bombs,boosterUsed:false,found:r.found,log:r.log,nodes:r.nodes,seconds:r.seconds,moves:mapped,replay,
   status:r.found?(replay.verified?'verified_full_body_default_and_analytic':'solver_found_but_full_gesture_unverified'):'not_found_within_this_search',sourceUnchanged:hash(entry.absolutePack)===entry.sha256};
  parentPort.postMessage({type:'result',result:out});
 }catch(e){parentPort.postMessage({type:'error',slot:entry.slot,stage,error:e.stack||e.message});}
}else{
 const levelRoot=path.join(ROOT,'Tools/LevelGen'),manifest=read(path.join(levelRoot,'IMPORT_MANIFEST.json'));
 const entries=manifest.rows.filter(e=>e.slot>=101&&e.slot<=250).map(e=>({slot:e.slot,stem:e.stem,pack:e.pack,absolutePack:path.join(levelRoot,e.pack),sha256:hash(path.join(levelRoot,e.pack))}));
 if(entries.length!==150||new Set(entries.map(e=>e.slot)).size!==150)throw Error('Expected150 selected slots');
 const manifestFile=path.join(OUT,'input-manifest.json');if(fs.existsSync(manifestFile)){const old=read(manifestFile);for(const e of entries)if(old.entries.find(x=>x.slot===e.slot)?.sha256!==e.sha256)throw Error('Source changed; new audit revision required');}
 else write(manifestFile,{createdAt:new Date().toISOString(),authorization:'User21/10 requests high-budget solvability audit of all150 new LevelGen levels; exception to generation no-solution-search policy.',entries,initialLimits:{seconds:180,nodes:200000},retryLimits:{seconds:600,nodes:1000000},workers:6,solverConstants:RR.C.solver,scope:'Native JS search with bombs when present; full current-body pointer-target/release replay analytic and default feel. No Unity/device proof, no engine/tolerance edits, no source pack changes.'});
 const results=new Map(),jobs=[];for(const e of entries){const p=path.join(OUT,'A'+e.slot+'-initial.json');if(fs.existsSync(p))results.set(e.slot,read(p));else jobs.push({entry:e,stage:'initial',seconds:180,nodes:200000});}
 const active=new Map();let totalStarted=Date.now(),phase='initial';
 function summary(){const a=[...results.values()];return{updatedAt:new Date().toISOString(),phase,total:entries.length,completed:a.length,active:[...active.values()].map(x=>({slot:x.job.entry.slot,stage:x.job.stage,progress:x.progress||null})),queued:jobs.length,verified:a.filter(x=>x.replay?.verified).map(x=>x.slot).sort((a,b)=>a-b),solverOnly:a.filter(x=>x.found&&!x.replay?.verified).map(x=>x.slot).sort((a,b)=>a-b),notFound:a.filter(x=>!x.found).map(x=>x.slot).sort((a,b)=>a-b),elapsedSeconds:Math.round((Date.now()-totalStarted)/1000)};}
 function checkpoint(){write(path.join(OUT,'progress.json'),summary());}
 function pump(){
  while(active.size<6&&jobs.length){const job=jobs.shift(),key=job.entry.slot;const worker=new Worker(__filename,{workerData:job,resourceLimits:{maxOldGenerationSizeMb:512}});const info={worker,job};active.set(key,info);
   const watchdog=setTimeout(()=>worker.terminate(),(job.seconds+180)*1000);
   let got=false;
   worker.on('message',m=>{if(m.type==='progress'){info.progress=m;checkpoint();}else if(m.type==='result'||m.type==='error'){
    got=true;const r=m.result||{slot:key,stage:job.stage,status:'worker_error',found:false,error:m.error};write(path.join(OUT,'A'+key+'-'+job.stage+'.json'),r);results.set(key,r);console.log('A'+key+' '+job.stage+' '+r.status+' '+(r.seconds?.toFixed(1)||'')+'s');
   }});
   worker.on('error',e=>{if(!got){got=true;const r={slot:key,stage:job.stage,status:'worker_error',found:false,error:e.message};write(path.join(OUT,'A'+key+'-'+job.stage+'.json'),r);results.set(key,r);}});
   worker.on('exit',code=>{clearTimeout(watchdog);active.delete(key);if(!got){const r={slot:key,stage:job.stage,status:'worker_exit',found:false,error:'Worker exited '+code};write(path.join(OUT,'A'+key+'-'+job.stage+'.json'),r);results.set(key,r);}checkpoint();pump();});
  }
  if(!active.size&&!jobs.length){
   if(phase==='initial'){
    phase='deep_retry';for(const e of entries){const r=results.get(e.slot);if(r.found)continue;
     // A finite empty queue cannot gain anything from repeating identical search.
     // Preserve that model limit; deeper retries address actual time/node limits.
     if(/open 0\)/.test(r.log||''))continue;
     const f=path.join(OUT,'A'+e.slot+'-deep.json');if(fs.existsSync(f)){results.set(e.slot,read(f));continue;}jobs.push({entry:e,stage:'deep',seconds:600,nodes:1000000});}
    checkpoint();if(jobs.length){console.log('Deep retry '+jobs.length+' levels');pump();return;}
   }
   phase='complete';checkpoint();write(path.join(OUT,'summary.json'),{...summary(),results:[...results.values()].sort((a,b)=>a.slot-b.slot)});console.log('COMPLETE '+JSON.stringify(summary()));
  }
 }
 checkpoint();pump();
}

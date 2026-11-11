'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const OUT=__dirname,ROOT=path.resolve(OUT,'../../../..'),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const write=(f,x)=>fs.writeFileSync(path.join(OUT,f),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
function repair(row){
 const R=require('../../rr-core.js'),{search}=require('./diagnostic-search.cjs');
 const source=path.join(ROOT,'Tools/LevelGen',row.pack),pack=read(source),original=pack.design,start=Date.now(),history=[];
 let d=structuredClone(original),log=[],best=null,totalSamples=0;
 function gate(design){try{const b=R.Design.toLevel(design),a=R.analyze(b.level);if(a.error||a.warnings.length)return null;
  for(const r of design.rings)if(r.gap)for(const p of r.pins||[])if(Math.abs(((p.angle-(r.gapDir||0)+180)%360+360)%360-180)-r.gap/2<45-1e-6)return null;
  const s=new R.Simulation(b.level,R.Tuning.defaults());
  if(s.snapshot().links.some(l=>!l.active)||s.world.guides.some((g,i)=>!s.world.guideEngaged(i)))return null;
  for(let o=0;o<s.objectCount();o++){const p=s.isStick(o)?s.offsetOf(o):s.angleOf(o);if(R.W.bombSweep(s.world,o,p,p).contact)return null;}
  return {b,s};}catch{return null;}}
 function run(design,seconds=2,nodes=11000){const g=gate(design);if(!g)return null;const r=search(g.b.level,{seconds,nodes,prefix:best?.bestMoves||[]});totalSamples+=r.nodes||0;return r;}
 const saved=fs.readdirSync(OUT).find(f=>f.startsWith('A'+row.slot+'-bomb-')&&read(path.join(OUT,f)).verified);
 if(saved){const x=read(path.join(OUT,saved));return{slot:row.slot,source:row.pack,sourceSha256:hash(source),status:'verified_candidate',design:x.design,log:[{kind:'add_bomb',host:x.design.rings.find(r=>r.bomb&&!original.rings.find(o=>o.id===r.id).bomb)?.id,evidence:saved}],proof:x,seconds:(Date.now()-start)/1000};}
 best=run(d,5,28000);history.push({edit:'original_diagnostic',remaining:best?.bestRemaining,verified:best?.verified});
 if(best?.verified)return{slot:row.slot,source:row.pack,sourceSha256:hash(source),status:'original_now_verified',proof:best,seconds:(Date.now()-start)/1000};
 const maxRounds=process.env.REPAIR_RETRY?6:4;
 for(let round=0;round<maxRounds;round++){
  parentPort?.postMessage({type:'progress',slot:row.slot,round,remaining:best?.bestRemaining,edits:log.length});
  const g=gate(d);if(!g)throw Error('Chosen design no longer passes');
  const s=g.s,names=Object.fromEntries(Object.entries(g.b.ids).map(([k,v])=>[v,k]));if(best?.bestState)s.restoreState(best.bestState);
  const alive=new Set(Array.from({length:s.objectCount()},(_,o)=>!s.isSolved(o)?names[s.idOf(o)]:null).filter(Boolean));
  const movable=new Set(Array.from({length:s.objectCount()},(_,o)=>!s.isSolved(o)&&!s.isMovementLocked(o)?names[s.idOf(o)]:null).filter(Boolean));
  const candidates=[],seen=new Set();
  function add(c,op){const key=JSON.stringify(c);if(seen.has(key))return;seen.add(key);candidates.push({d:c,op});}
  // Attach Boms only on real host material. Existing Boms may be repositioned locally.
  const hosts=[...d.rings,...d.sticks].filter(h=>alive.has(h.id)).sort((a,b)=>Number(movable.has(b.id))-Number(movable.has(a.id)));
  const addedBombs=log.filter(x=>x.kind==='add_bomb').length;
  for(const h of hosts){if(addedBombs>=2&&!h.bomb)continue;
   const points=[];
   if(d.rings.some(r=>r.id===h.id))for(let angle=0;angle<360;angle+=30){const diff=Math.abs(((angle-(h.gapDir||0)+180)%360+360)%360-180);if(h.gap&&diff<h.gap/2+5)continue;points.push({x:h.x+h.radius*Math.cos(angle*Math.PI/180),y:h.y+h.radius*Math.sin(angle*Math.PI/180),angle});}
   else {const o=s.indexOf(g.b.ids[h.id]),st=s.world.stickOf(o);const pose=R.M.poseMake(R.M.V(h.x,h.y),h.angle||0,0);const pts=R.M.clSample(st.centerline,1);for(let i=0;i<pts.length;i+=Math.max(1,Math.ceil(pts.length/8))){const p=R.M.poseToWorld(pose,pts[i]);points.push(p);}}
   for(const point of points){const c=structuredClone(d),host=[...c.rings,...c.sticks].find(x=>x.id===h.id);host.bomb={x:point.x,y:point.y};add(c,{kind:h.bomb?'move_bomb':'add_bomb',host:h.id,from:h.bomb||null,to:host.bomb,materialAngle:point.angle});}
  }
  // A proven closed-target/cycle may instead be repaired by removing its authoring-only edge.
  for(const r of d.rings.filter(r=>alive.has(r.id))){
   if(process.env.REPAIR_RETRY&&r.gap){for(const delta of [30,-30,60,-60,90,-90,120,-120,180]){const c=structuredClone(d);c.rings.find(x=>x.id===r.id).gapDir+=delta;add(c,{kind:'redirect_gap',host:r.id,from:r.gapDir,to:r.gapDir+delta});}}
   for(let i=0;i<(r.pins||[]).length;i++){const p=r.pins[i],targets=p.targets||(p.target?[p.target]:[]);if(!targets.some(t=>alive.has(t)))continue;
    const c=structuredClone(d);c.rings.find(x=>x.id===r.id).pins.splice(i,1);add(c,{kind:'remove_deadlocking_pin',host:r.id,pin:p,targets});}
   for(let i=0;i<(r.stops||[]).length;i++){const c=structuredClone(d);c.rings.find(x=>x.id===r.id).stops.splice(i,1);add(c,{kind:'remove_blocking_stop',host:r.id,stop:r.stops[i]});}
  }
  // Prefer a local geometric correction over adding several bombs; full replay remains required.
  let winner=null,scanned=0;
  for(const c of candidates){
   const r=run(c.d,process.env.REPAIR_RETRY?4:1.2,process.env.REPAIR_RETRY?18000:6500);scanned++;if(!r)continue;
   history.push({round,op:c.op,remaining:r.bestRemaining,verified:r.verified,nodes:r.nodes,seconds:r.seconds});
   if(r.verified){winner={...c,r};break;}
   if(r.bestRemaining<(winner?.r.bestRemaining??best?.bestRemaining??Infinity))winner={...c,r};
   if(scanned%35===0)parentPort?.postMessage({type:'progress',slot:row.slot,round,scanned,total:candidates.length,remaining:winner?.r.bestRemaining??best?.bestRemaining});
  }
  if(!winner||winner.r.bestRemaining>=(best?.bestRemaining??Infinity))break;
  d=winner.d;log.push(winner.op);best=winner.r;
  if(best.verified)break;
  const deeper=run(d,8,45000);if(deeper?.verified||deeper?.bestRemaining<best.bestRemaining)best=deeper;
  if(best.verified)break;
 }
 return{slot:row.slot,source:row.pack,sourceSha256:hash(source),status:best?.verified?'verified_candidate':'research_hold',design:d,log,proof:best,history,totalSamples,seconds:(Date.now()-start)/1000};
}
if(!isMainThread&&require.main===module){try{parentPort.postMessage({type:'result',result:repair(workerData)});}catch(e){parentPort.postMessage({type:'result',result:{slot:workerData.slot,status:'error',error:e.stack}});}}
else if(require.main===module){
 const manual=read(path.join(OUT,'../20261021-levelgen-solution-audit/MANUAL_CHECK_LIST.json')).rows.filter(r=>r.slot>=155&&r.slot<=240),manifest=read(path.join(ROOT,'Tools/LevelGen/IMPORT_MANIFEST.json')).rows;
 const selection=process.argv.slice(2).map(Number),jobs=manual.filter(r=>!selection.length||selection.includes(r.slot)).map(r=>manifest.find(x=>x.slot===r.slot)).filter(r=>!fs.existsSync(path.join(OUT,'A'+r.slot+'-repair-candidate.json'))),active=new Map(),done=[];
 write('run-'+Date.now()+'-pid.json',{pid:process.pid,startedAt:new Date().toISOString(),slots:jobs.map(x=>x.slot)});
 const save=()=>fs.writeFileSync(path.join(OUT,'repair-progress.json'),JSON.stringify({atUtc:new Date().toISOString(),queued:jobs.map(x=>x.slot),active:[...active.values()].map(x=>({slot:x.row.slot,progress:x.progress})),done},null,2));
 function pump(){while(jobs.length&&active.size<4){const row=jobs.shift(),w=new Worker(__filename,{workerData:row,resourceLimits:{maxOldGenerationSizeMb:768}}),x={row,w};active.set(row.slot,x);let result;
  w.on('message',m=>{if(m.type==='result')result=m.result;else{x.progress=m;save();}});w.on('error',e=>result={slot:row.slot,status:'error',error:e.stack});
  w.on('exit',code=>{result=result||{slot:row.slot,status:'error',error:'exit '+code};write('A'+row.slot+'-repair-candidate.json',result);done.push({slot:row.slot,status:result.status,remaining:result.proof?.bestRemaining,edits:result.log});active.delete(row.slot);console.log('A'+row.slot+' '+result.status+' remaining '+result.proof?.bestRemaining+' '+JSON.stringify(result.log));save();pump();});
 }save();if(!jobs.length&&!active.size)console.log('COMPLETE '+JSON.stringify(done.map(x=>({slot:x.slot,status:x.status}))));}
 pump();
}
module.exports={repair};

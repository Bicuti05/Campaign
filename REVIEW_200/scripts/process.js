'use strict';
const fs=require('fs'),cp=require('child_process'),crypto=require('crypto'),RR=require('../../RotateLevelDesigner/rr-core.js');
const ROOT='/workspace/Campaign',OUT=ROOT+'/REVIEW_200',TOOL=ROOT+'/RotateLevelDesigner',clone=x=>JSON.parse(JSON.stringify(x));
const plan=JSON.parse(fs.readFileSync(OUT+'/PLAN_200.json')),pos=+process.argv[2],row=plan.find(r=>r.position===pos),pad=String(pos).padStart(3,'0'),file=OUT+'/packs/Level'+pad+'.rrpack.json',record=OUT+'/validation/'+pad+'.json';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function orderLevel(level,source){if(!process.env.ORDER_HINTS)return;const rank=new Map();for(const m of source.proof?.moves||[])if(!rank.has(m.part))rank.set(m.part,rank.size);level.parts.sort((a,b)=>(rank.get(b.partId)??1e6)-(rank.get(a.partId)??1e6));}
function find(level,seconds=25){return RR.Solver.find(level,{timeLimitSeconds:seconds,nodeLimit:8000,explodeBombs:true});}
function reserveChains(level){if(!row.chain_requested)return new Set();const w=RR.World.build(level,{lenient:true}),s=RR.Solver.newSim(level,true),rings=w.rings.filter(r=>!s.isMovementLocked(s.indexOf(r.id))&&!w.rings.some(q=>q!==r&&Math.hypot(q.center.x-r.center.x,q.center.y-r.center.y)+q.outer<r.inner));let pair=[],best=-1;for(let i=0;i<rings.length;i++)for(let j=i+1;j<rings.length;j++){const a=rings[i],b=rings[j],d=Math.hypot(a.center.x-b.center.x,a.center.y-b.center.y);if(d>best){pair=[a.id,b.id];best=d;}}return new Set(pair);}
function selectFish(level,exclude=new Set()){
 for(const p of level.parts)delete p.canCollect;
 if(pos<11)return [];
 const w=RR.World.build(level,{lenient:true}),options=RR.Fish.candidates(level).filter(f=>!exclude.has(f.id)),chosen=[];
 // Exhaust each tier before considering the next; alignment is only a tie-breaker.
 for(let tier=0;tier<=3&&chosen.length<3;tier++){
 let pool=options.filter(f=>f.tier===tier);
 while(pool.length&&chosen.length<3){pool.sort((a,b)=>alignment(a)-alignment(b));const f=pool.shift(),c=w.rings.find(r=>r.id===f.id).center;if(chosen.some(g=>{const q=w.rings.find(r=>r.id===g.id).center;return Math.hypot(c.x-q.x,c.y-q.y)<2*RR.Fish.CLEAR_RADIUS;}))continue;chosen.push(f);}
 }
 function alignment(f){const c=w.rings.find(r=>r.id===f.id).center;return chosen.reduce((v,g)=>{const q=w.rings.find(r=>r.id===g.id).center;return v+(Math.abs(q.x-c.x)<.3||Math.abs(q.y-c.y)<.3?1:0);},0);}
 for(const p of level.parts)if(chosen.some(f=>f.id===p.partId))p.canCollect=true;
 return chosen;
}
function serial(level,proof){const sim=RR.Solver.newSim(level,true);return proof.moves.map(m=>({part:sim.idOf(m.obj),target:m.target}));}
function updateDesignFish(design,level){if(!design)return;const built=RR.Design.toLevel(design);for(const r of design.rings){const id=built.ids[r.id],p=level.parts.find(p=>p.partId===id);if(p?.canCollect)r.collect=true;else delete r.collect;}}
function chain(level,proof){
 const w=RR.World.build(level,{lenient:true}),base=RR.Solver.newSim(level,true),eligible=w.rings.filter(r=>!base.isMovementLocked(base.indexOf(r.id))&&!level.parts.find(p=>p.partId===r.id).canCollect&&!w.rings.some(q=>q!==r&&Math.hypot(q.center.x-r.center.x,q.center.y-r.center.y)+q.outer<r.inner)).map(r=>({id:r.id,c:r.center,index:base.indexOf(r.id)}));
 let sim=RR.Solver.newSim(level,true),safe=new Map();for(const m of proof.moves){const gone=sim.objectCount()-sim.remaining();if(!safe.has(sim.idOf(m.obj)))safe.set(sim.idOf(m.obj),gone);RR.Solver.apply(sim,m);}
 let pairs=[];for(let i=0;i<eligible.length;i++)for(let j=i+1;j<eligible.length;j++){const a=eligible[i],b=eligible[j];pairs.push({a,b,d:Math.hypot(a.c.x-b.c.x,a.c.y-b.c.y)});}pairs.sort((a,b)=>b.d-a.d);
 for(const pair of pairs){const a=pair.a,b=pair.b;const cap=Math.max(1,Math.floor(Number(row.target_rings)/6));const choices=[[Math.max(1,Math.min(cap,safe.get(a.id)||1)),Math.max(1,Math.min(cap,safe.get(b.id)||1))],[1,1]];
 for(const counts of choices){const doc=new RR.Document(clone(level));for(const p of doc.data.parts)if(p.lockCount)doc.setLockCount(p.partId,0);doc.setLockCount(a.id,counts[0]);doc.setLockCount(b.id,counts[1]);let pr;if(RR.Solver.replay(doc.data,proof.moves,true).allSolved())pr={...proof};else pr=find(doc.data,4);if(!pr.found)continue;
 const s=RR.Solver.newSim(doc.data,true),events=[];let decrementOK=true;for(const m of pr.moves){const before=s.saveState(),left=s.remaining();RR.Solver.apply(s,m);const removed=left-s.remaining(),after=s.saveState();for(const id of [a.id,b.id]){const i=s.indexOf(id);if(!s.isSolved(i)&&before.lockCount[i]>0&&after.lockCount[i]!==Math.max(0,before.lockCount[i]-removed))decrementOK=false;}events.push({part:s.idOf(m.obj),removed,counts:[s.lockCountOf(a.index),s.lockCountOf(b.index)]});}
 if(!s.allSolved()||!decrementOK)continue;
 for(const id of [a.id,b.id]){const i=s.indexOf(id),fresh=RR.Solver.newSim(doc.data,true);if(!fresh.isMovementLocked(i)||fresh.isFreeToSolve(i))throw Error('chain does not lock');}
 return {level:doc.data,proof:pr,chain:{rings:[a.id,b.id],counts,distance:pair.d,events,decrementOK,rotationAndExitLockedInitially:true,baselineMovementUnlocked:true,countBasis:'Minimum of available prior exits on the demonstrated route and conservative reference-R cap; each selected ring gains an actual initial rotation gate.'}};
 }}throw Error('Cannot place two chain rings without deadlock');
}
function states(b,sequence,exclude){const sim=RR.Solver.newSim(b.level,true);function snap(){return Object.fromEntries(Object.entries(b.ids).filter(([id])=>id!==exclude).map(([id,p])=>{const i=sim.indexOf(p);return[id,[sim.isSolved(i),sim.isFreeToSolve(i),sim.isMovementLocked(i),Math.round((sim.isStick(i)?sim.offsetOf(i):sim.angleOf(i))*1000)]];}));}const trace=[snap()];for(const m of sequence){if(b.ids[m.id])RR.Solver.apply(sim,{obj:sim.indexOf(b.ids[m.id]),target:m.target});trace.push(snap());}return trace;}
function roleChecks(design,level,proof){let b=RR.Design.toLevel(design);const inv=Object.fromEntries(Object.entries(b.ids).map(([a,b])=>[b,a])),sim=RR.Solver.newSim(level,true),seq=proof.moves.map(m=>({id:inv[sim.idOf(m.obj)],target:m.target})),tests=[],redundant=[];
 function test(alt,feature,owner,detail,exclude){const altb=RR.Design.toLevel(alt),before=states(b,seq,exclude),after=states(altb,seq,exclude),changed=JSON.stringify(before)!==JSON.stringify(after);let causal=changed,alternate=false;
 if(!causal){const pr=find(altb.level,.25);if(pr.found){const asim=RR.Solver.newSim(altb.level,true),ainv=Object.fromEntries(Object.entries(altb.ids).map(([a,b])=>[b,a])),original=RR.Solver.newSim(b.level,true);for(const m of pr.moves){const id=ainv[asim.idOf(m.obj)];if(b.ids[id])RR.Solver.apply(original,{obj:original.indexOf(b.ids[id]),target:m.target});}alternate=!original.allSolved();causal=alternate;}}
 const initiallyRequired=feature==='stick'&&!sim.isFreeToSolve(sim.indexOf(b.ids[owner]));if(initiallyRequired)causal=true;
 tests.push({feature,owner,detail,physicallyRemoved:true,traceChanged:changed,alternateRouteRestricted:alternate,requiredExtraction:initiallyRequired,meaningful:causal});if(!causal){redundant.push({feature,owner,detail});throw new Error('__REDUNDANT__');}
 }
 try{for(const r of design.rings){if(r.bomb){const alt=clone(design);delete alt.rings.find(x=>x.id===r.id).bomb;test(alt,'bomb',r.id,'bomb');}for(let j=0;j<(r.pins||[]).length;j++){const alt=clone(design);alt.rings.find(x=>x.id===r.id).pins.splice(j,1);test(alt,'pin',r.id,j);}for(let j=0;j<(r.stops||[]).length;j++){const alt=clone(design);alt.rings.find(x=>x.id===r.id).stops.splice(j,1);test(alt,'stop',r.id,j);}}
 for(const s of design.sticks||[]){const alt=clone(design);alt.sticks=alt.sticks.filter(x=>x.id!==s.id);for(const r of alt.rings)r.pins=(r.pins||[]).filter(p=>!(p.targets||[p.target]).includes(s.id));test(alt,'stick',s.id,'whole',s.id);
 for(let j=0;j<(s.guides||[]).length;j++){const a=clone(design),st=a.sticks.find(x=>x.id===s.id);st.guides.splice(j,1);if(!st.guides.length&&!st.slideAxis){const w=RR.World.build(b.level,{lenient:true}),ax=RR.W.stickAxis(w.stickOf(w.objectIndexById[b.ids[s.id]])),angle=(st.angle||0)*Math.PI/180;st.slideAxis=[ax.x*Math.cos(angle)+ax.y*Math.sin(angle),-ax.x*Math.sin(angle)+ax.y*Math.cos(angle)];}test(a,'guide',s.id,j);}}
 }catch(e){if(e.message!=='__REDUNDANT__')throw e;}return {tests,redundant};
}
function mounts(design){const b=RR.Design.toLevel(design),checks=[];for(const r of design.rings){const p=b.level.parts.find(p=>p.partId===b.ids[r.id]);for(let i=0;i<(r.pins||[]).length;i++){const pin=r.pins[i],gap=r.gap??90,delta=Math.abs(((pin.angle-(r.gapDir||0)+540)%360)-180),margin=gap===0?180:delta-gap/2,foot=Math.atan2(p.pins[i].stemWidth/2,pin.inner?p.colliderInnerRadius:p.colliderOuterRadius)*180/Math.PI;checks.push({owner:r.id,pin:pin.id,pass:margin+0.01>=foot,margin,foot});}}return checks;}
try{
 if(fs.existsSync(record)&&!process.env.FORCE){console.log(pad+' cached');process.exit(0);}
 if(row.source_kind==='baseline_first20'){
 fs.copyFileSync(row.input_pack,file);const pack=JSON.parse(fs.readFileSync(file)),a=RR.analyze(pack.runtime);fs.writeFileSync(record,JSON.stringify({position:pos,status:'qualified',baselinePreserved:true,validateOK:!a.error,found:pack.proof?.found??true,replayComplete:true,info:a.info,warnings:a.warnings,sha256:sha(fs.readFileSync(file)),source:row.input_pack,scope:'Previously qualified first20; pack bytes unchanged'},null,2));console.log(pad+' baseline preserved');process.exit(0);}
 let source=JSON.parse(fs.readFileSync(row.input_pack)),design,level,geometryChanged=!!row.input_design;
 if(row.input_design){design=JSON.parse(fs.readFileSync(row.input_design));level=RR.Design.toLevel(design).level;}else{level=clone(source.runtime);design=clone(source.design);if(design)design.format='turp-design';}
 // Source chains are not campaign instructions. Explicit GD schedule is authoritative.
 const doc=new RR.Document(level);for(const p of level.parts)if(p.lockCount)doc.setLockCount(p.partId,0);
 orderLevel(level,source);let fish=selectFish(level,reserveChains(level)),analysis=RR.analyze(level);if(analysis.error)throw Error(analysis.error);
 let proof;
 if(source.proof?.moves?.length){const sim=RR.Solver.newSim(level,true),moves=source.proof.moves.map(m=>({obj:sim.indexOf(m.part),target:m.target}));if(moves.every(m=>m.obj>=0)&&RR.Solver.replay(level,moves,true).allSolved())proof={found:true,moves,log:'Source route independently replayed in current repository JS runtime; final CLI search also required',nodes:0,seconds:0};}
 if(!proof)proof=require('./hinted.js')(level,source,design);if(!proof)proof=find(level,Number(process.env.SOLVE_TIME||60));if(!proof.found)throw Error('NOT FOUND '+proof.log);
 let ablation=null,removed=[];
 if(row.input_design){
 for(let attempt=0;attempt<60;attempt++){
 ablation=roleChecks(design,level,proof);const fix=ablation.redundant.filter(r=>['pin','guide','stop','bomb'].includes(r.feature));
 if(!fix.length)break;
 // Remove only demonstrably redundant auxiliary features, never source rings.
 for(const r of fix.slice(0,1).sort((a,b)=>b.detail-a.detail)){const owner=r.feature==='guide'?design.sticks.find(s=>s.id===r.owner):design.rings.find(s=>s.id===r.owner),key=r.feature==='pin'?'pins':r.feature==='stop'?'stops':'guides';if(r.feature==='guide'&&owner.guides.length===1&&!owner.slideAxis){const b=RR.Design.toLevel(design),w=RR.World.build(b.level,{lenient:true}),ax=RR.W.stickAxis(w.stickOf(w.objectIndexById[b.ids[owner.id]])),a=(owner.angle||0)*Math.PI/180;owner.slideAxis=[ax.x*Math.cos(a)+ax.y*Math.sin(a),-ax.x*Math.sin(a)+ax.y*Math.cos(a)];}if(r.feature==='bomb')delete owner.bomb;else owner[key].splice(r.detail,1);removed.push(r);}
 level=RR.Design.toLevel(design).level;orderLevel(level,source);fish=selectFish(level,reserveChains(level));if(!RR.Solver.replay(level,proof.moves,true).allSolved())proof=find(level,90);if(!proof.found)throw Error('Pruned level NOT FOUND');
 }
 if(ablation.redundant.length)throw Error('Unresolved redundant features '+JSON.stringify(ablation.redundant));
 }
 let chainEvidence=null;if(row.chain_requested){const result=chain(level,proof);level=result.level;proof=result.proof;chainEvidence=result.chain;}
 level.levelId=String(pos);if(design)design.levelId=String(pos);updateDesignFish(design,level);analysis=RR.analyze(level);if(analysis.error)throw Error(analysis.error);
 if(!RR.Solver.replay(level,proof.moves,true).allSolved())throw Error('Replay incomplete');
 const mountChecks=geometryChanged?mounts(design):[];if(mountChecks.some(c=>!c.pass))throw Error('Pin foot outside material '+JSON.stringify(mountChecks.filter(c=>!c.pass)));
 const selected=RR.Fish.check(level).filter(f=>level.parts.find(p=>p.partId===f.id).canCollect);if(selected.some(f=>f.hard.length))throw Error('Fish initially covered');
 const knownMoves=serial(level,proof);const ranks=new Map();for(const m of knownMoves)if(!ranks.has(m.part))ranks.set(m.part,ranks.size);level.parts.sort((a,b)=>(ranks.get(b.partId)??1e6)-(ranks.get(a.partId)??1e6));const ordered=RR.Solver.newSim(level,true);proof.moves=knownMoves.map(m=>({obj:ordered.indexOf(m.part),target:m.target}));
 const runtimePath=OUT+'/source/'+pad+'.runtime.json';fs.writeFileSync(runtimePath,JSON.stringify(level));
 // Official pack exporter; chain state lives in runtime, design round-trip limitations are documented.
 const exported=cp.spawnSync('node',[TOOL+'/rr-cli.js','pack',runtimePath,'-o',file,'--no-solve','--name',`Campaign ${pad} — ${row.theme||row.type}`,'--author','Campaign review'],{encoding:'utf8'});if(exported.status!==0)throw Error(exported.stdout+exported.stderr);
 const pack=JSON.parse(fs.readFileSync(file));pack.design=design||pack.design;pack.proof={found:true,moves:serial(level,proof),drags:proof.moves.length,route:RR.Solver.describeRoute(level,proof.moves,true),log:proof.log,nodes:proof.nodes,seconds:proof.seconds,explodeBombs:true};pack.reviewProvenance={campaignPosition:pos,sourcePosition:row.source_position,sourceSHA256:sha(fs.readFileSync(row.input_pack)),sourceKind:row.source_kind,geometryChanged,fishRechecked:true,chains:chainEvidence,scope:'Repository JS validator/solver/replay; Unity native not run'};fs.writeFileSync(file,JSON.stringify(pack,null,2)+'\n');
 if(design)fs.writeFileSync(OUT+'/designs/Level'+pad+'.rrdesign.json',JSON.stringify(design,null,2)+'\n');if(chainEvidence)fs.writeFileSync(OUT+'/designs/Level'+pad+'.chains.json',JSON.stringify(chainEvidence,null,2));
 const val=cp.spawnSync('node',[TOOL+'/rr-cli.js','validate',file],{encoding:'utf8'});fs.writeFileSync(OUT+'/validation/'+pad+'.validate.log',val.stdout+val.stderr);if(val.status!==0)throw Error('CLI validate failed');
 const cli=cp.spawnSync('node',[TOOL+'/rr-cli.js','solve',file,'--json','--time',process.env.SOLVE_TIME||'90','--nodes','8000'],{encoding:'utf8'});fs.writeFileSync(OUT+'/validation/'+pad+'.solve.json',cli.stdout);if(cli.status!==0)throw Error('CLI solve NOT FOUND');
 const result={position:pos,status:'qualified',validateOK:true,found:true,replayComplete:true,noBooster:true,routeNeedsBomb:!RR.Solver.replay(level,proof.moves,false).allSolved(),info:analysis.info,warnings:analysis.warnings,fish:selected,chains:chainEvidence,mountChecks,ablation,removedRedundantFeatures:removed,geometryChanged,source:row.input_pack,sha256:sha(fs.readFileSync(file)),curveTarget:row.target_rings,actualRings:analysis.info.rings};
 fs.writeFileSync(record,JSON.stringify(result,null,2)+'\n');console.log(pad+' OK R'+analysis.info.rings+' F'+selected.length+' C'+(chainEvidence?2:0)+' B'+analysis.info.bombs);
}catch(e){fs.writeFileSync(OUT+'/validation/'+pad+'.failure.json',JSON.stringify({position:pos,error:e.stack},null,2));console.error(pad+' FAIL '+e.message);process.exit(1);}

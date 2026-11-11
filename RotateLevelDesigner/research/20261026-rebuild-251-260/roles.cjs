'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{Worker,isMainThread,parentPort,workerData}=require('worker_threads'),RR=require('../../rr-core.js'),G=require('../pose-body-gesture-query.js');
const OUT=__dirname,read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function roles(id){const proof=fs.readdirSync(OUT).filter(f=>f.startsWith('A'+id+'-solution-')).sort().map(f=>({evidence:f,...read(path.join(OUT,f))})).filter(p=>p.defaultFeel?.ok).at(-1);assert(proof,'No route');
 const d=read(path.join(OUT,proof.file)),build=RR.Design.toLevel(d),names=Object.fromEntries(Object.entries(build.ids).map(([k,v])=>[v,k])),moves=proof.moves.map(m=>({part:names[m.part],target:m.target}));assert(G.query(d,moves,false,true).data.solved,'Canonical route mapping mismatch');
 const variants=[];
 for(const bar of d.sticks||[]){
  if(bar.path.length===3){const a=structuredClone(d);a.sticks.find(x=>x.id===bar.id).path=bar.path.slice(0,2);variants.push({kind:'L_arm',host:bar.id,d:a});}
  if(bar.path.length===4){for(const leg of [0,2]){const a=structuredClone(d),o=a.sticks.find(x=>x.id===bar.id);o.path=leg===0?bar.path.slice(1):bar.path.slice(0,3);o.guides=(o.guides||[]).filter(g=>{const p=RR.M.V(g.x,g.y),w=bar.path.map(([x,y])=>RR.M.V(bar.x+x,bar.y+y)),dist=w.slice(1).map((b,i)=>RR.M.distanceToSegment(p,w[i],b));return dist.indexOf(Math.min(...dist))!==leg;});variants.push({kind:'U_leg',host:bar.id,index:leg,d:a});}}
  for(let i=0;i<(bar.guides||[]).length;i++){const a=structuredClone(d);a.sticks.find(x=>x.id===bar.id).guides.splice(i,1);variants.push({kind:'Guide',host:bar.id,index:i,d:a});}
  const a=structuredClone(d);a.sticks=a.sticks.filter(x=>x.id!==bar.id);for(const r of a.rings)r.pins=r.pins.filter(p=>!(p.targets||[p.target]).includes(bar.id));variants.push({kind:'bar',host:bar.id,d:a,removed:bar.id});
 }
 for(const ring of d.rings)for(let i=0;i<(ring.stops||[]).length;i++){const a=structuredClone(d);a.rings.find(x=>x.id===ring.id).stops.splice(i,1);variants.push({kind:'Stop',host:ring.id,index:i,d:a});}
 const out=[];
 for(const v of variants){let evidence=null,error=null;
  const prefixes=Array.from({length:moves.length+1},(_,k)=>moves.slice(0,k));
  if(v.kind==='Guide'||v.kind==='U_leg'){
   const q=G.query(d,[],false,true),accepted=[];
   for(let pass=0;pass<2;pass++)for(const m of moves){if(m.part===v.host)continue;const o=q.sim.indexOf(q.b.ids[m.part]);if(o<0||q.sim.isSolved(o)||q.sim.isMovementLocked(o))continue;const pts=G.selectableBody(q.sim,o),grab=pts[Math.floor(pts.length/2)];if(!grab)continue;const result=G.release.apply(q.sim,o,m.target,grab);if(result.began){accepted.push(m);prefixes.push(accepted.slice());}}
   for(const target of [-.7,-1.4,-2,-2.2,-2.5,1.5])prefixes.push(accepted.concat([{part:v.host,target}]));
  }
  for(let k=0;k<prefixes.length&&!evidence;k++){
   const prefix=prefixes[k],pa=G.query(d,prefix,false,true),pb=G.query(v.d,prefix.filter(m=>m.part!==v.removed),false,true);
   if(pb.data.trace.some(t=>t.began===false&&!t.alreadySolved))continue;
   const common=[...d.rings,...d.sticks].filter(x=>x.id!==v.removed).map(x=>x.id),sa=pa.sim.saveState(),sb=pb.sim.saveState();
   const pose=(q,id)=>{const o=q.sim.indexOf(q.b.ids[id]);return{solved:q.sim.isSolved(o),pose:q.sim.isStick(o)?q.sim.offsetOf(o):q.sim.angleOf(o)};};
   const diff=()=>common.map(x=>({part:x,a:pose(pa,x),b:pose(pb,x)})).find(x=>x.a.solved!==x.b.solved||!x.a.solved&&Math.abs(x.a.pose-x.b.pose)>(d.rings.some(r=>r.id===x.part)?10:.25));
   const initial=diff();if(initial){evidence={prefix:prefix.length,moves:prefix,phaseEffect:initial};break;}
   const selected=v.kind==='Stop'?common.filter(x=>d.rings.some(r=>r.id===x)):v.kind==='Guide'?common:[v.host,...common.filter(x=>d.rings.some(r=>r.id===x))];
   for(const actor of selected){if(evidence)break;for(const delta of d.rings.some(r=>r.id===actor)?[-240,-120,-60,60,120,240]:[-14,-6,-3,-2,-1.5,1.5,2,3,6,14]){
     pa.sim.restoreState(sa);pb.sim.restoreState(sb);const results=[];let accepted=true;
     for(const q of [pa,pb]){const o=q.sim.indexOf(q.b.ids[actor]);if(o<0||q.sim.isSolved(o)||q.sim.isMovementLocked(o)){accepted=false;break;}const pts=G.selectableBody(q.sim,o),grab=pts[Math.floor(pts.length/2)];if(!grab){accepted=false;break;}const target=(q.sim.isStick(o)?q.sim.offsetOf(o):q.sim.angleOf(o))+delta;results.push(G.release.apply(q.sim,o,target,grab));}
     if(accepted){const effect=diff();if(effect){evidence={prefix:prefix.length,moves:prefix,actor,delta,effect,scope:'Reached prefix in both variants; same relative full pointer gesture, fresh current-body grab, default feel.'};break;}}
    }
   }
  }
  out.push({kind:v.kind,host:v.host,index:v.index,effectFound:!!evidence,evidence,error});
 }
 return{id,design:proof.file,solution:proof.evidence,roles:out,scope:'Counterfactual effects on stored reachable prefixes; proves local role, not exhaustive necessity or minimum solution.'};
}
if(!isMainThread){try{parentPort.postMessage(roles(workerData));}catch(e){parentPort.postMessage({id:workerData,error:e.stack});}}
else {const jobs=process.argv.slice(2).map(Number);if(!jobs.length)for(let i=251;i<=260;i++)jobs.push(i);let active=0;function pump(){while(jobs.length&&active<3){const id=jobs.shift(),w=new Worker(__filename,{workerData:id});active++;w.on('message',x=>{fs.writeFileSync(path.join(OUT,'A'+id+'-roles-'+Date.now()+'.json'),JSON.stringify(x,null,2)+'\n',{flag:'wx'});console.log(id,x.error||x.roles.map(r=>r.kind+':'+r.host+(r.index===undefined?'':'#'+r.index)+'='+r.effectFound).join(' '));});w.on('error',e=>console.log(id,e.stack));w.on('exit',()=>{active--;pump();});}}pump();}

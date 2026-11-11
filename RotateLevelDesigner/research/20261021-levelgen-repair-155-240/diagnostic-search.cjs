'use strict';
// Research search through full body gestures. Engine, thresholds and tuning stay unchanged.
const RR=require('../../rr-core.js'),G=require('../pose-body-gesture-query.js');
const crypto=require('crypto');
function bodyGrab(s,o){const pts=G.bodyPoints(s,o),mid=Math.floor(pts.length/2);for(let k=0;k<pts.length;k++){const i=(mid+k)%pts.length,p=pts[i];if(G.bodySdf(s,o,p)<=0&&s.hitTest(p)===o)return p;}return null;}
function immovableRingLock(s){
 if(s.world.bombs.some(b=>b.active))return null;
 const adj=Array.from({length:s.ringCount()},()=>[]);
 for(let i=0;i<s.links.length;i++){const l=s.links[i];if(!s.graph.active[i]||l.target>=s.ringCount())continue;
  if(s.world.rings[l.target].gapDegrees===0)return{kind:'active_pin_into_closed_ring_without_bomb',source:s.idOf(l.source),target:s.idOf(l.target)};
  adj[l.source].push(l.target);
 }
 const stack=new Set(),seen=new Set();function visit(n){if(stack.has(n))return true;if(seen.has(n))return false;seen.add(n);stack.add(n);for(const j of adj[n])if(visit(j))return true;stack.delete(n);return false;}
 return adj.some((_,i)=>visit(i))?{kind:'active_outgoing_ring_cycle_without_bomb'}:null;
}
function search(level,{seconds=180,nodes=50000,onProgress=()=>{},diversify=false,prefix=[]}={}){
 const start=Date.now(),bombs=level.parts.some(p=>p.kind==='bomb'||p.hasBomb);let explored=0,last=0,bestRemaining=Infinity,bestMoves=[],bestState=null;
 const fresh=()=>{const t=RR.Tuning.defaults();t.explodeBombs=bombs;return new RR.Simulation(level,t);};
 function key(s){return Array.from({length:s.objectCount()},(_,o)=>s.isSolved(o)?'x':s.isStick(o)?Math.round(s.offsetOf(o)*20):Math.round(((s.angleOf(o)%360)+360)%360)%360).join(';')+'|'+s.graph.active.map(x=>x?1:0).join('')+'|'+s.graph.bindingActive.map(x=>x?1:0).join('');}
 function replay(moves){const s=fresh();for(const m of moves){const o=s.indexOf(m.part);if(s.isSolved(o))continue;if(s.isMovementLocked(o))return null;const pts=G.selectableBody(s,o),p=pts[Math.floor(pts.length/2)];if(!p||!G.release.apply(s,o,m.target,p).began)return null;}return s;}
 function score(s){return(s.objectCount()-s.remaining())*100-s.graph.active.filter(Boolean).length-s.graph.bindingActive.filter(Boolean).length;}
 const root=fresh(),initialPrefix=[];
 for(const m of prefix){const o=root.indexOf(m.part);if(o<0)break;if(root.isSolved(o))continue;if(root.isMovementLocked(o))break;const pts=G.selectableBody(root,o),p=pts[Math.floor(pts.length/2)];if(!p)break;const x=G.release.apply(root,o,m.target,p);if(!x.began)break;initialPrefix.push(m);}
 const shared=root;bestRemaining=root.remaining();bestMoves=initialPrefix;bestState=root.saveState();
 if(root.allSolved()){const defaultFeel=G.replay(level,initialPrefix,bombs,true),analytic=G.replay(level,initialPrefix,bombs,false);if(defaultFeel.ok)return{found:true,verified:true,moves:initialPrefix,bombsEnabled:bombs,defaultFeel,analytic,bestRemaining:0,nodes:0,seconds:(Date.now()-start)/1000};}
 const family=s=>s.graph.solved.map(x=>x?1:0).join('')+'|'+s.graph.active.map(x=>x?1:0).join('')+'|'+s.graph.bindingActive.map(x=>x?1:0).join('');
 const familyVisits=new Map([[family(root),1]]),seen=new Set([key(root)]),open=[{score:score(root),moves:initialPrefix,state:root.saveState()}];let expanded=0;
 while(open.length&&explored<nodes&&(Date.now()-start)/1000<seconds){
  let k=0;expanded++;if(!diversify||expanded%9!==0)for(let j=1;j<open.length;j++)if(open[j].score>open[k].score||(open[j].score===open[k].score&&open[j].moves.length<open[k].moves.length))k=j;
  const current=open.splice(k,1)[0],base=shared;base.restoreState(current.state);bestRemaining=Math.min(bestRemaining,base.remaining());if(current.moves.length>=100)continue;
  const eligible=Array.from({length:base.objectCount()},(_,i)=>i).filter(o=>!base.isSolved(o)&&!base.isMovementLocked(o));if(!diversify)eligible.reverse();
  for(const o of eligible){
   for(const dir of (diversify?[-1,1]:[1,-1])){if((Date.now()-start)/1000>=seconds)break;const s=shared;s.restoreState(current.state);const grab=bodyGrab(s,o);if(!grab)continue;
    const stick=s.isStick(o),from=stick?s.offsetOf(o):s.angleOf(o),axis=stick?RR.W.stickAxis(s.world.stickOf(o)):null,rel=stick?null:RR.M.sub(grab,s.world.rings[o].center),step=stick?.1:3,limit=stick?RR.C.solver.STICK_LIMIT:RR.C.solver.RING_LIMIT;
    if(!s.beginDrag(o,grab,1))continue;let pointer=from,stuck=0,moved=false,events=0;
    while(Math.abs(pointer-from)<limit-1e-4){pointer+=dir*Math.min(step,limit-Math.abs(pointer-from));const p=stick?RR.M.add(grab,RR.M.mul(axis,pointer-from)):RR.M.add(s.world.rings[o].center,RR.M.rot(rel,pointer-from)),x=s.drag(p);moved=moved||x.moved;explored++;
     if(x.bombContact&&bombs){s.endDrag();s.explode(x.bombContact);s.solveAll();events++;break;}
     if(x.locksChanged){events++;break;}stuck=x.blocked&&!x.moved?stuck+1:0;if(stuck>=3)break;
    }
    s.endDrag();s.solveAll();if(!moved&&!events)continue;const next=key(s);if(seen.has(next))continue;seen.add(next);
    const fam=family(s),visits=familyVisits.get(fam)||0;if(diversify&&visits>=1024)continue;familyVisits.set(fam,visits+1);
    const moves=current.moves.concat([{part:s.idOf(o),target:pointer}]);if(s.remaining()<bestRemaining){bestRemaining=s.remaining();bestMoves=moves;bestState=s.saveState();}
    if(s.allSolved()){
     const feel=G.replay(level,moves,bombs,true),analytic=G.replay(level,moves,bombs,false);
     if(feel.ok)return{found:true,verified:true,seconds:(Date.now()-start)/1000,nodes:explored,bestRemaining:0,moves,bombsEnabled:bombs,defaultFeel:feel,analytic,analyticAlsoVerified:analytic.ok,log:'Full-body gesture search completed under default feel; analytic comparison recorded.'};
    }
    open.push({score:score(s),moves,state:s.saveState()});
   }
  }
  if(Date.now()-last>15000){onProgress({nodes:explored,open:open.length,seconds:(Date.now()-start)/1000,bestRemaining});last=Date.now();}
 }
 return{found:false,verified:false,nodes:explored,seconds:(Date.now()-start)/1000,bestRemaining,open:open.length,bombsEnabled:bombs,bestMoves,bestState,diversify,familyStateCap:diversify?1024:null,expandedStates:expanded,log:'Full-body search limit or sampled queue exhausted; not an impossibility proof.'};
}
module.exports={search,immovableRingLock};
if(require.main===module){const fs=require('fs'),path=require('path'),slot=Number(process.argv[2]),seconds=Number(process.argv[3]||180),m=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../..','Tools/LevelGen/IMPORT_MANIFEST.json'))).rows.find(x=>x.slot===slot);if(!m)throw Error('Unknown slot');const f=path.resolve(__dirname,'../../../..','Tools/LevelGen',m.pack),r=search(JSON.parse(fs.readFileSync(f)).runtime,{seconds,onProgress:p=>console.log(JSON.stringify({slot,...p}))});fs.writeFileSync(path.join(__dirname,'A'+slot+'-body-'+seconds+'.json'),JSON.stringify({slot,pack:m.pack,packSha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),...r},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({slot,found:r.found,verified:r.verified,seconds:r.seconds,bestRemaining:r.bestRemaining}));}

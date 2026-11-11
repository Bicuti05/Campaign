const RR=require('../../RotateLevelDesigner/rr-core.js');
module.exports=function(level,source,design){
 const sim=RR.Solver.newSim(level,true),moves=[],hints=source.proof?.moves||[],built=design?RR.Design.toLevel(design):null;
 const leaves=design?design.rings.filter(r=>r.id.startsWith('CurveAdd')&&r.gap>0).map(r=>built.ids[r.id]):[];
 function metric(s){return (s.objectCount()-s.remaining())*1000-s.graph.active.filter(Boolean).length-s.graph.bindingActive.filter(Boolean).length;}
 function bestMove(id,preferred){const obj=sim.indexOf(id);if(obj<0||sim.isSolved(obj)||sim.isMovementLocked(obj))return false;const before=sim.saveState(),score=metric(sim);let best=null;
 for(const direction of [preferred||1,-(preferred||1)]){sim.restoreState(before);const start=sim.isStick(obj)?sim.offsetOf(obj):sim.angleOf(obj),target=RR.Solver.explore(sim,obj,direction);if(!Number.isFinite(target))continue;const value=metric(sim);if(value>score&&(!best||value>best.value))best={value,target,state:sim.saveState()};}
 sim.restoreState(before);if(!best)return false;RR.Solver.apply(sim,{obj,target:best.target});moves.push({obj,target:best.target});return true;}
 for(let pass=0;pass<5&&!sim.allSolved()&&moves.length<=40;pass++){
 let changed=false;
 for(const id of leaves)if(bestMove(id,1))changed=true;
 for(const h of hints){const i=sim.indexOf(h.part);if(i<0||sim.isSolved(i))continue;const value=sim.isStick(i)?sim.offsetOf(i):sim.angleOf(i);if(bestMove(h.part,h.target>=value?1:-1))changed=true;if(moves.length>40)break;}
 if(!changed)break;
 }
 if(process.env.DEBUG_HINT)console.error(JSON.stringify({moves:moves.map(m=>({id:sim.idOf(m.obj),target:m.target})),left:Array.from({length:sim.objectCount()},(_,i)=>i).filter(i=>!sim.isSolved(i)).map(i=>({id:sim.idOf(i),locked:sim.isMovementLocked(i),free:sim.isFreeToSolve(i)}))}));
 return sim.allSolved()&&moves.length<=40?{found:true,moves,nodes:0,seconds:0,log:'Constructive route using official Solver.explore/apply; independent CLI search required'}:null;
};

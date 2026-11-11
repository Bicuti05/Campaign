'use strict';
const fs=require('fs'),path=require('path'),RR=require('../../rr-core.js'),G=require('../pose-body-gesture-query.js');
const OUT=__dirname,ROOT=path.resolve(OUT,'../../../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const slot=process.argv[2]?Number(process.argv[2]):null;
const files=fs.readdirSync(OUT).filter(f=>/^A\d+-(?:initial|deep)\.json$/.test(f));
for(const f of files){const r=read(path.join(OUT,f));if(!r.found||r.replay?.verified||(slot&&r.slot!==slot))continue;
 const out=path.join(OUT,'A'+r.slot+'-effective-replay.json');if(fs.existsSync(out))continue;
 const pack=read(path.join(ROOT,'Tools/LevelGen',r.pack)),sim=RR.Solver.newSim(pack.runtime,r.bombsEnabled),moves=[];
 for(const m of r.moves){const o=sim.indexOf(m.part);if(sim.isSolved(o))continue;let pointer=sim.isStick(o)?sim.offsetOf(o):sim.angleOf(o),from=pointer,dir=m.target>from?1:-1;
  const step=sim.isStick(o)?RR.C.solver.STICK_STEP:RR.C.solver.RING_STEP;
  RR.Solver.apply(sim,{obj:o,target:m.target},()=>{pointer+=dir*Math.min(step,Math.abs(m.target-pointer));});
  moves.push({...m,target:pointer,direction:dir,rawTarget:m.target});
 }
 const attempts=[];let verified=null;
 for(const extra of [0,3,6,9,12,-3,-6]){
  const candidate=moves.map(m=>({part:m.part,target:m.target+m.direction*(m.kind==='stick'?(extra?.15*Math.sign(extra):0):extra)}));
  const feel=G.replay(pack.runtime,candidate,r.bombsEnabled,true),analytic=G.replay(pack.runtime,candidate,r.bombsEnabled,false);
  attempts.push({extra,feelOK:feel.ok,analyticOK:analytic.ok,feelRemaining:feel.trace.at(-1)?.remaining,analyticRemaining:analytic.trace.at(-1)?.remaining});
  if(feel.ok&&analytic.ok){verified={moves:candidate,defaultFeel:feel,analytic,bombEvents:feel.trace.flatMap(x=>x.events||[]),extra};break;}
 }
 const data={slot:r.slot,pack:r.pack,packSha256:r.packSha256,verified:!!verified,derivation:'Effective first-unlock pointer endpoints recovered from the native candidate, then independently replayed with full current-body pointer-target/release under unmodified default and analytic tuning. Native early-release is not used as verification.',effectiveMoves:moves,attempts,proof:verified};
 fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({slot:r.slot,verified:!!verified,extra:verified?.extra,attempts}));
}

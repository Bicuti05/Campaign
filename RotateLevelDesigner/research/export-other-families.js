"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),out=path.join(__dirname,"20261013"),levels=path.resolve(__dirname,"../levels");
const study=JSON.parse(fs.readFileSync(path.join(out,"other-families-study.json"))),closed=JSON.parse(fs.readFileSync(path.join(out,"closed-body-search.json"))).selected;
if(!closed)throw new Error("Closed-body motif not established");
const rows=study.candidates.slice(0,2).concat([{stem:"study-20261013-v4-closed-body-gate",design:closed.design,inspection:closed,witness:closed.witness}]);
function replay(level,moves,feel){const t=RR.Tuning.defaults();t.explodeBombs=false;const s=feel?new RR.Simulation(level,t):RR.Solver.newSim(level,false),trace=[];for(const m of moves){RR.Solver.apply(s,{obj:s.indexOf(m.part),target:m.target});trace.push({part:m.part,target:m.target,remaining:s.remaining(),solved:Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>s.isSolved(i)).map(i=>s.idOf(i))});}return {solved:s.allSolved(),trace};}
if(process.argv.includes("--proof")){const verified=JSON.parse(fs.readFileSync(path.join(out,"other-families-verification.json")));for(const row of rows){const v=verified.results.find(x=>x.stem===row.stem),file=path.join(levels,row.stem+".rrpack.json"),pack=JSON.parse(fs.readFileSync(file));if(pack.design.name!==row.design.name)throw new Error("Not this session's pack");pack.proof={found:true,drags:v.moves.length,moves:v.moves,route:v.route,log:v.proofOrigin,explodeBombs:false};fs.writeFileSync(file,RR.json.stringify(pack));console.log(row.stem,"proof attached");}process.exit(0);}
const results=[];
for(const row of rows){const inspection=row.inspection,b=RR.Design.toLevel(row.design);if(!inspection.solution.found||inspection.analysis.error||inspection.analysis.warnings.length)throw new Error("Unqualified draft "+row.stem);
 let raw=inspection.solution.route.map(m=>({part:m.part,target:m.to})),origin=inspection.solution.log;
 if(row.stem.includes("l-lifts")){raw=[{part:b.ids.S1,target:1},{part:b.ids.R2,target:144},{part:b.ids.R4,target:504},{part:b.ids.S1,target:5.4}];origin="Designer solver FOUND independently; authored demonstration releases R2 while L remains retained";}
 let moves=null,padUsed;
 for(const pad of [0,6,15,30]){const noFeel=RR.Solver.newSim(b.level,false),candidate=[];for(const m of raw){const obj=noFeel.indexOf(m.part),from=noFeel.isStick(obj)?noFeel.offsetOf(obj):noFeel.angleOf(obj),target=m.target+(noFeel.isStick(obj)?0:Math.sign(m.target-from)*pad);candidate.push({part:m.part,target});RR.Solver.apply(noFeel,{obj,target});}if(noFeel.allSolved()&&replay(b.level,candidate,true).solved){moves=candidate;padUsed=pad;break;}}
 if(!moves)throw new Error("No comfortable proof "+row.stem);
 const indexed=moves.map(m=>({obj:RR.Solver.newSim(b.level,false).indexOf(m.part),target:m.target})),route=RR.Solver.describeRoute(b.level,indexed,false);
 const margins=row.design.rings.flatMap(r=>(r.pins||[]).map(p=>({owner:r.id,angle:p.angle,gap:r.gap,logicMargin:r.gap===0?null:Math.abs(((p.angle-r.gapDir+540)%360)-180)-r.gap/2})));
 if(margins.some(p=>p.logicMargin!==null&&p.logicMargin<45))throw new Error("Pin too close to gap");
 const file=path.join(levels,row.stem+".rrdesign.json");fs.writeFileSync(file,JSON.stringify(row.design,null,2),{flag:"wx"});
 results.push({stem:row.stem,moves,route,pointerExtensionDegrees:padUsed,proofOrigin:origin,analyticReplay:replay(b.level,moves,false),feelReplay:replay(b.level,moves,true),pinMargins:margins,mechanicWitness:row.witness});console.log(row.stem,"qualified; analytic + feel proof OK; extension",padUsed);
}
fs.writeFileSync(path.join(out,"other-families-verification.json"),JSON.stringify({format:"rotate-other-families-verification",version:1,verificationScope:"Supplied Designer engine only, no Unity replay",results,holdout:{stem:study.candidates[2].stem,reason:"Known authored route replays, but bounded Designer solver has not found a route; not delivered under Designer AGENTS gate",solverLog:study.candidates[2].inspection.solution.log}},null,2));

"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js");
const out=path.join(__dirname,"20261013"),levels=path.resolve(__dirname,"../levels");
const study=JSON.parse(fs.readFileSync(path.join(out,"multibar-study.json")));
if(process.argv.includes("--proof")){
 const verified=JSON.parse(fs.readFileSync(path.join(out,"multibar-verification.json")));
 for(const row of study.drafts){const v=verified.results.find(r=>r.stem===row.stem),file=path.join(levels,row.stem+".rrpack.json"),pack=JSON.parse(fs.readFileSync(file));
  if(pack.design.name!==row.design.name)throw new Error("Not this session's pack "+file);
  const route=row.route.map((m,i)=>({...m,to:v.moves[i].target}));
  pack.proof={found:true,drags:v.moves.length,moves:v.moves,route,log:row.log+"; pointer targets compiled for feel replay",explodeBombs:false,limits:{nodes:1500,seconds:15}};
  fs.writeFileSync(file,RR.json.stringify(pack));console.log(row.stem,"proof attached");
 }process.exit(0);
}
const report={format:"rotate-multibar-verification",version:1,results:[]};
function replay(level,moves,feel){const s=feel?new RR.Simulation(level,RR.Tuning.defaults()):RR.Solver.newSim(level,false),trace=[];for(const m of moves){RR.Solver.apply(s,{obj:s.indexOf(m.part),target:m.target});trace.push({part:m.part,target:m.target,remaining:s.remaining(),removed:Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>s.isSolved(i)).map(i=>s.idOf(i))});}return {solved:s.allSolved(),trace};}
function lowerRingProbe(level,moves,dir){const s=RR.Solver.newSim(level,false);for(const m of moves)RR.Solver.apply(s,{obj:s.indexOf(m.part),target:m.target});const obj=s.ringCount()-1;RR.Solver.explore(s,obj,dir);return {direction:dir,removed:s.isSolved(obj),remaining:s.remaining()};}
for(const row of study.drafts){
 if(!row.found||row.analysis.error||row.analysis.warnings.length)throw new Error("Invalid candidate "+row.stem);
 if(row.initialBarProbes.some(p=>p.barRemoved)||row.counterfactualBarProbes.some(p=>!p.barRemoved)||row.afterGateProbes.some(p=>!p.barRemoved))throw new Error("Gate role not demonstrated "+row.stem);
 const built=RR.Design.toLevel(row.design),raw=row.route.map(m=>({part:m.part,target:m.to}));
 let moves=null,padUsed;
 for(const pad of [0,6,15,30]){const candidate=raw.map((m,i)=>({...m,target:m.target+(row.route[i].kind==="ring"?Math.sign(row.route[i].to-row.route[i].from)*pad:0)}));if(replay(built.level,candidate,false).solved&&replay(built.level,candidate,true).solved){moves=candidate;padUsed=pad;break;}}
 if(!moves)throw new Error("No feel route "+row.stem);
 const gateMoves=moves.filter(m=>m.part==="slide_bar_1"),allBarMoves=moves.filter(m=>m.part.startsWith("slide_bar"));
 const beforeDivider=[-1,1].map(dir=>lowerRingProbe(built.level,gateMoves,dir)),afterDivider=[-1,1].map(dir=>lowerRingProbe(built.level,allBarMoves,dir));
 if(beforeDivider.some(p=>p.removed)||!afterDivider.some(p=>p.removed))throw new Error("Divider role not demonstrated "+row.stem+" "+JSON.stringify({beforeDivider,afterDivider}));
 const file=path.join(levels,row.stem+".rrdesign.json");fs.writeFileSync(file,JSON.stringify(row.design,null,2),{flag:"wx"});
 const entry={stem:row.stem,moves,pointerExtensionDegrees:padUsed,analyticReplay:replay(built.level,moves,false),feelReplay:replay(built.level,moves,true),dividerWitness:{beforeDivider,afterDivider},pinMargins:row.pinMargins};
 report.results.push(entry);console.log(row.stem,"export design; both replay OK; gate + divider witnesses OK; pin margins",Math.min(...row.pinMargins.map(p=>p.logicMargin)));
}
fs.writeFileSync(path.join(out,"multibar-verification.json"),JSON.stringify(report,null,2));

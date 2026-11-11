"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process"),RR=require("../rr-core.js");
const tool=path.resolve(__dirname,".."),out=path.join(__dirname,"20261013"),cli=path.join(tool,"rr-cli.js");
const names=["divider-135","corner-225","frame-45"];
const report={format:"rotate-revision-verification",version:1,results:[]};
function run(args){return cp.execFileSync(process.execPath,[cli,...args],{encoding:"utf8"});}
function routeReplay(level,moves,feel){const s=feel?new RR.Simulation(level,RR.Tuning.defaults()):RR.Solver.newSim(level,false);const trace=[];for(const m of moves){RR.Solver.apply(s,{obj:s.indexOf(m.part),target:m.target});trace.push({part:m.part,remaining:s.remaining(),solved:Array.from({length:s.objectCount()},(_,i)=>i).filter(i=>s.isSolved(i)).map(i=>s.idOf(i))});}return {solved:s.allSolved(),trace};}
for(const name of names){
 const stem="study-20261013-v2-"+name,file=path.join(tool,"levels",stem+".rrdesign.json"),runtime=path.join(out,stem+".runtime.json"),packFile=path.join(tool,"levels",stem+".rrpack.json");
 if(fs.existsSync(packFile))throw new Error("Will not overwrite saved pack "+packFile);
 run(["build",file,"-o",runtime]);const validated=run(["validate",file]);
 const solution=JSON.parse(run(["solve",file,"--time","10","--nodes","1000","--no-bombs","--json"]));
 if(!solution.found)throw new Error(stem+": solve NOT FOUND");
 const level=JSON.parse(fs.readFileSync(runtime)),raw=solution.route.map(m=>({part:m.part,target:m.to}));
 let compiled=null,padUsed=null;
 for(const pad of [0,6,15,30,60]){
  const moves=raw.map((m,i)=>({part:m.part,target:m.target+(solution.route[i].kind==="ring"?Math.sign(solution.route[i].to-solution.route[i].from)*pad:0)}));
  if(routeReplay(level,moves,true).solved&&routeReplay(level,moves,false).solved){compiled=moves;padUsed=pad;break;}
 }
 if(!compiled)throw new Error(stem+": feel route needs investigation");
 run(["pack",file,"-o",packFile,"--no-solve"]);
 const pack=JSON.parse(fs.readFileSync(packFile));
 pack.proof={found:true,drags:compiled.length,moves:compiled,route:solution.route,log:solution.log+"; same-direction pointer targets compiled for feel replay",nodes:solution.nodes,seconds:solution.seconds,limits:{nodes:1000,seconds:10},explodeBombs:false};
 // Route labels must describe the actual exported pointer targets.
 compiled.forEach((m,i)=>{pack.proof.route[i].to=m.target;});
 fs.writeFileSync(packFile,RR.json.stringify(pack));
 const margins=JSON.parse(fs.readFileSync(path.join(out,"gd-feedback-revision.json"))).revisions.find(r=>r.stem===stem).pinMargins;
 const entry={stem,validate:validated.trim(),solver:"FOUND",rawMoves:raw,compiledMoves:compiled,pointerExtensionDegrees:padUsed,analyticReplay:routeReplay(level,compiled,false),feelReplay:routeReplay(level,compiled,true),pinMargins:margins};
 const probes=[];
 if(name.startsWith("divider")){
  for(const removed of [false,true])for(const dir of [-1,1]){
   const s=RR.Solver.newSim(level,false);
   if(removed)for(const m of compiled.filter(m=>m.part==="slide_bar_1"))RR.Solver.apply(s,{obj:s.indexOf(m.part),target:m.target});
   const r=s.indexOf("ring_4"),reached=RR.Solver.explore(s,r,dir);probes.push({barRemoved:removed,direction:dir,pointerReached:Number.isNaN(reached)?null:reached,ring4Removed:s.isSolved(r),remaining:s.remaining()});
  }
  if(probes.some(p=>p.ring4Removed!==p.barRemoved))throw new Error("Divider lost two-direction obstruction");
 }
 entry.dividerProbes=probes;
 report.results.push(entry);console.log(stem,"validate OK; solve FOUND; analytic + feel replay OK; guides 0; extension",padUsed);
}
fs.writeFileSync(path.join(out,"revision-verification.json"),JSON.stringify(report,null,2));

"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js");
const OUT=path.join(__dirname,"20261013"), manifest=JSON.parse(fs.readFileSync(path.join(OUT,"poc-manifest.json")));
const results=[];
for(const selected of manifest.selected){
 const pack=JSON.parse(fs.readFileSync(path.join(OUT,selected.stem+".rrpack.json"))),level=pack.runtime;
 const rows=[];
 for(const mode of ["initial","after_stick_removal"]){
  for(const dir of [-1,1]){
   const s=RR.Solver.newSim(level,false);
   if(mode==="after_stick_removal"){
    for(const m of pack.proof.moves){if(m.part!=="slide_bar_1")continue;RR.Solver.apply(s,{obj:s.indexOf(m.part),target:m.target});}
   }
   const ring=s.indexOf("ring_4"),before=s.angleOf(ring),reached=RR.Solver.explore(s,ring,dir);
   rows.push({mode,direction:dir,ring4_removed:s.isSolved(ring),angle_before:before,angle_after:s.angleOf(ring),pointer_reached:Number.isNaN(reached)?null:reached,remaining:s.remaining()});
  }
 }
 results.push({stem:selected.stem,rows,interpretation:selected.stem.includes("divider")?"Tests both directions of target rotation before and after the divider leaves; no blocker exemptions.":"Descriptive transition probes, not a difficulty score."});
}
fs.writeFileSync(path.join(OUT,"causal-probes.json"),JSON.stringify({results},null,2));
console.log(JSON.stringify(results,null,2));

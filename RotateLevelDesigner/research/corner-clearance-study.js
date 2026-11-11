"use strict";
// Six finite arm lengths at the same four-corner positions; no additional exports.
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js"),{OUT,clone,build,RR,probe,replay,inspect}=H;
const c=JSON.parse(fs.readFileSync(path.join(OUT,"corner-cycle-study.json"))).candidates[0],rows=[];
for(const arm of [1.2,1.5,1.7,2,2.4,3]){
 const d=clone(c.design);d.sticks.forEach(s=>s.arm=arm);const a=RR.analyze(build(d).level);
 if(a.error||a.warnings.length){rows.push({arm,analysis:a,recipePreserved:false});continue;}
 const initial=d.sticks.flatMap(st=>[-1,1].map(x=>({id:st.id,...probe(d,st.id,x)}))),prep=d.sticks.map(st=>({key:st.id,neighbor:{T:"L",R:"T",B:"R",L:"B"}[st.id],result:probe(d,{T:"L",R:"T",B:"R",L:"B"}[st.id],1,[{part:st.id,target:.5}])})),authorFeel=replay(d,c.authorMoves,false,true),finder=inspect(d,false,2,500).solution;
 rows.push({arm,analysis:a,initial,fixedHalfUnitPreparation:prep,authorFeel,finder,recipePreserved:!initial.some(x=>x.removed)&&prep.every(x=>x.result.removed)&&authorFeel.solved});
}
fs.writeFileSync(path.join(OUT,"corner-clearance-study.json"),JSON.stringify({format:"rotate-corner-clearance-study",version:1,scope:"Six fixed arm-length samples; loss of the 0.5 preparation recipe does not prove general impossibility, and Finder is bounded at 2 seconds/500 nodes. No aesthetics/difficulty inference or extra levels.",rows},null,2));
for(const r of rows)console.log(JSON.stringify({arm:r.arm,warnings:r.analysis.warnings?.length,initialFullEscapes:r.initial?.filter(x=>x.removed).length,fixedPrepOpened:r.fixedHalfUnitPreparation?.filter(x=>x.result.removed).length,authorFeel:r.authorFeel?.solved,finderFound:r.finder?.found,recipePreserved:r.recipePreserved}));

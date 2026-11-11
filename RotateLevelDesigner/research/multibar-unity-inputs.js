"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),out=path.join(__dirname,"20261013");
const study=JSON.parse(fs.readFileSync(path.join(out,"multibar-study.json"))),inputs=[];
for(const row of study.drafts){const d=JSON.parse(JSON.stringify(row.design));if(row.counterfactual==="remove_gate"){d.sticks=d.sticks.filter(s=>s.id!=="S1");for(const r of d.rings)r.pins=r.pins.filter(p=>p.target!=="S1");}else delete d.sticks[0].guides;
 const b=RR.Design.toLevel(d),file=path.join(out,row.stem+".counterfactual.runtime.json");fs.writeFileSync(file,RR.json.stringify(b.level));
 inputs.push({stem:row.stem,pack:path.resolve(__dirname,"../levels",row.stem+".rrpack.json"),counterfactualFile:file.replace(/\\/g,"/"),counterfactualBar:b.ids.S2});
}
fs.writeFileSync(path.join(out,"multibar-unity-inputs.json"),JSON.stringify(inputs,null,2));
console.log("prepared two report-only counterfactual inputs");

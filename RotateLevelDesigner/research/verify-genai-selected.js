"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),gesture=require("./pose-body-gesture-query.js");
const dir=path.join(__dirname,"20261015-genai-selected"),root=path.resolve(__dirname,".."),manifest=JSON.parse(fs.readFileSync(path.join(dir,"manifest.json"),"utf8"));
function save(f,v){fs.writeFileSync(path.join(dir,f),JSON.stringify(v,null,2)+"\n",{flag:"wx"});}
const result=[];
for(const entry of manifest.levels){
  const file=path.join(root,entry.design),d=JSON.parse(fs.readFileSync(file,"utf8")),stem=path.basename(file,".rrdesign.json"),b=RR.Design.toLevel(d),runtime=JSON.parse(RR.json.stringify(b.level));
  const solve=JSON.parse(fs.readFileSync(path.join(dir,stem+"-solve.json"),"utf8").replace(/^\uFEFF/,"")),moves=(solve.route||[]).map(m=>({part:m.part,target:m.to}));
  const proof={sourceId:entry.sourceId,found:solve.found,solverLog:solve.log,moves,explodeBombs:true,scope:"CLI route tested with hosted Bomb rules enabled. A finish is not evidence of picture-tab equivalence, feature necessity, or difficulty. Initial idle links/owner pin conflicts still block qualification.",analytic:solve.found?gesture.replay(runtime,moves,true,false):null,defaultFeel:solve.found?gesture.replay(runtime,moves,true,true):null,qualified:false};
  save(stem+"-gesture.json",proof);
  // CLI build output read back, compare against builder output, without hand-written runtime geometry.
  const built=JSON.parse(fs.readFileSync(path.join(dir,stem+"-cli-built.json"),"utf8").replace(/^\uFEFF/,""));
  const eq=JSON.stringify(built)===JSON.stringify(runtime);
  if(!eq||RR.validate(built))throw Error("CLI build mismatch "+stem);
  const body=Object.entries(b.ids).map(([id,runtimeId])=>{const sim=new RR.Simulation(built),o=sim.indexOf(runtimeId),points=gesture.selectableBody(sim,o),q=points[Math.floor(points.length/2)];return {id,selectable:points.length,beginDrag:q?sim.beginDrag(o,q):false};});
  result.push({sourceId:entry.sourceId,name:entry.name,cliValidate:"OK_with_reference_warnings",cliBuildReadbackMatches:eq,solverFound:solve.found,analyticGesture:proof.analytic?.ok??null,defaultGesture:proof.defaultFeel?.ok??null,initialBody:body,status:"reference_only_not_qualified_gameplay"});
}
save("verification.json",{createdAt:new Date().toISOString(),levels:result});
console.log(JSON.stringify(result.map(({initialBody,...r})=>r),null,2));

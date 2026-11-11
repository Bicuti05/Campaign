"use strict";
const fs=require("fs"),path=require("path"),h=require("./central-paired-bars-study.js"),{RR,OUT,clone,move,query}=h,sharp=require("C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
async function main(){const file=path.resolve(__dirname,"../levels/study-20261014-central-paired-bars-01.rrpack.json"),p=JSON.parse(fs.readFileSync(file)),proof=JSON.parse(fs.readFileSync(path.join(OUT,"serialized-proof.json")));if(!proof.ok)throw Error("Proof required");const init=query(p),view=RR.Render.pad(RR.Render.bounds(init.sim.world),.8),width=620,height=Math.round(width*(view.yMax-view.yMin)/(view.xMax-view.xMin)),states=[
 {stem:"initial",moves:[]},
 {stem:"right-shallow-relock",moves:[move("R",-.8),move("BR",90),move("SR",90)]},
 {stem:"right-deep-center-pin-block",moves:[move("R",-4),move("BR",90),move("SR",90)]},
 {stem:"center-cleared-before-right-turn",moves:[move("L",4),move("R",-4),move("BR",90),move("TC",270),move("BC",90)]}
],rows=[];
 for(const state of [...states,{stem:"initial-mono",moves:[],mono:true}]){const q=query(p,state.moves),level=clone(p.runtime);if(state.mono)for(const part of level.parts)part.color=[.35,.42,.46,1];const svg=RR.Render.render({world:q.sim.world,level,view,width,height,labels:true,title:p.name}),sf=path.join(OUT,state.stem+".svg"),pf=path.join(OUT,state.stem+".png");if(fs.existsSync(sf)||fs.existsSync(pf))throw Error("Preserve preview "+sf);fs.writeFileSync(sf,svg,{flag:"wx"});await sharp(Buffer.from(svg)).png().toFile(pf);rows.push({stem:state.stem,moves:state.moves,monoPreviewOnly:!!state.mono,file:pf,remaining:q.data.remaining});}
 fs.writeFileSync(path.join(OUT,"preview-contract.json"),JSON.stringify({format:"rotate-research-preview-contract",version:1,scope:"Native Designer renderer, final serialized runtime and full-release query states. Same view/units per pixel across all pictures. Mono palette changed only in renderer memory.",view,width,height,pixelsPerUnit:width/(view.xMax-view.xMin),rows},null,2),{flag:"wx"});console.log(JSON.stringify({width,height,rows:rows.map(x=>x.stem)}));}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});

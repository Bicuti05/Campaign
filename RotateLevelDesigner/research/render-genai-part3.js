"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),g=require("./pose-body-gesture-query.js");
const sharp=require("C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const root=path.resolve(__dirname,".."),out=path.join(__dirname,"20261015-genai-part3-completed"),jobs=JSON.parse(fs.readFileSync(path.join(out,"preflight.json"),"utf8"));
async function main(){const comparison=[],phases=[],contracts=[];
 for(let row=0;row<jobs.length;row++){
  const j=jobs[row],pack=JSON.parse(fs.readFileSync(path.join(root,"levels",j.stem+".rrpack.json"),"utf8"));
  const files=[path.join(path.dirname(j.source),j.stem+"-source.svg"),path.join(out,j.stem+"-initial.svg"),path.join(out,j.stem+"-mono.svg")];
  for(let col=0;col<files.length;col++)comparison.push({input:await sharp(fs.readFileSync(files[col])).resize(300,300,{fit:"contain",background:"#fff"}).png().toBuffer(),left:col*300,top:row*300});
  const moves=pack.proof.moves,prefixes=[[],moves.slice(0,Math.ceil(moves.length/2)),moves.slice(0,-1),moves],states=prefixes.map(ms=>g.query(pack,ms,false,true).sim),view={xMin:Infinity,yMin:Infinity,xMax:-Infinity,yMax:-Infinity};
  for(const s of states){const w={...s.world,rings:s.world.rings.filter(x=>x.active),sticks:s.world.sticks.filter(x=>x.active),guides:s.world.guides.filter(x=>x.active),bombs:s.world.bombs.filter(x=>x.active)};if(!w.rings.length&&!w.sticks.length)continue;const b=RR.Render.bounds(w);for(const k of ["xMin","yMin"])view[k]=Math.min(view[k],b[k]);for(const k of ["xMax","yMax"])view[k]=Math.max(view[k],b[k]);}
  for(const k of ["xMin","yMin"])view[k]-=1.6;for(const k of ["xMax","yMax"])view[k]+=1.6;
  for(let col=0;col<states.length;col++){const s=states[col],hidden={};for(let i=0;i<s.objectCount();i++)if(s.isSolved(i)){hidden[s.idOf(i)]=true;for(const guide of s.world.guides)if(guide.stickId===s.idOf(i))hidden[guide.id]=true;}const svg=RR.Render.render({world:s.world,level:pack.runtime,view,width:600,labels:true,hidden,title:j.stem+" phase "+col});fs.writeFileSync(path.join(out,j.stem+"-phase-safe-"+col+".svg"),svg,{flag:"wx"});phases.push({input:await sharp(Buffer.from(svg)).resize(300,300,{fit:"contain",background:"#fff"}).png().toBuffer(),left:col*300,top:row*300});}
  contracts.push({stem:j.stem,phaseView:view,prefixLengths:prefixes.map(p=>p.length),finalSolved:states.at(-1).allSolved(),sameCameraAcrossPhases:true,colorAndMonoSameCamera:true});
 }
 for(const [name,items,width] of [["comparison",comparison,900],["phases-safe",phases,1200]]){const file=path.join(out,name+".png");if(fs.existsSync(file))throw Error("Existing preview");await sharp({create:{width,height:jobs.length*300,channels:4,background:"#fff"}}).composite(items).png().toFile(file);}
 fs.writeFileSync(path.join(out,"preview-contract.json"),JSON.stringify(contracts,null,2),{flag:"wx"});console.log("Rendered source/color/mono and initial/middle/pre-last/completed for all five levels");
}
main().catch(e=>{console.error(e);process.exitCode=1;});

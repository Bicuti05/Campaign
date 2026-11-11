// Populate an existing literal HTML fragment with precomputed proof states.
"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js");
const out=path.join(__dirname,"20261013"),manifest=JSON.parse(fs.readFileSync(path.join(out,"poc-manifest.json")));
const target=process.argv[2];if(!target)throw new Error("Give writable visualization fragment path");
const palette=RR.C.authoring.PALETTE.map(c=>c.map(x=>Math.round(x*255)));
function theme(svg){
 svg=svg.replace(/<defs>[\s\S]*?<\/defs>/g,"").replace(/ filter="[^"]*"/g,"");
 svg=svg.replace(/#fbf1e0/g,"var(--card)").replace(/#3f4b48|#6f6a62/g,"var(--foreground)");
 return svg.replace(/rgba?\(([^)]+)\)/g,(_,values)=>{
  const c=values.split(',').map(Number);if(c.length===4)return "color-mix(in srgb, var(--foreground) "+Math.round(c[3]*100)+"%, transparent)";
  let best=0,distance=Infinity,highlight=false;
  palette.forEach((p,i)=>{for(const high of [false,true]){const color=high?p.map(x=>x+(255-x)*.55):p;const d=color.reduce((a,x,k)=>a+(x-c[k])**2,0);if(d<distance){distance=d;best=i;highlight=high;}}});
  const color="var(--viz-series-"+(best%6+1)+")";
  return highlight?"color-mix(in srgb, "+color+" 45%, var(--background) 55%)":color;
 });
}
const data=manifest.selected.map(m=>{
 const pack=JSON.parse(fs.readFileSync(path.join(out,m.stem+".rrpack.json"))),s=new RR.Simulation(pack.runtime,RR.Tuning.defaults()),frames=[];
 function frame(){frames.push({remaining:s.remaining(),svg:theme(RR.Render.render({world:s.world,level:pack.runtime,view:m.view,labels:false,title:pack.name}))});}
 frame();for(const move of pack.proof.moves){RR.Solver.apply(s,{obj:s.indexOf(move.part),target:move.target});frame();}
 return {name:pack.name,frames,labels:pack.proof.route.map(r=>`${r.label} ${r.kind==='stick'?'trượt':'xoay'} ${r.direction}`)};
});
const html=fs.readFileSync(target,"utf8");if(!html.includes("__REVIEW_FRAMES__"))throw new Error("Template already populated");
fs.writeFileSync(target,html.replace("__REVIEW_FRAMES__",JSON.stringify(data)));
console.log("Preview",fs.statSync(target).size,"bytes");

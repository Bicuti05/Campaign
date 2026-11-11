'use strict';
const C=require('./common.cjs'),{RR,path,fs}=C;
function availableSharp(){try{return require('sharp');}catch{return null;}}
async function preview(file,{source,out}){
 const items=[...(source?[{file:source,label:'Source'}]:[]),{file,label:'Proposal'}].map(x=>({...x,...C.load(x.file)}));
 items.forEach(x=>x.world=new RR.Simulation(x.level,RR.Tuning.defaults()).world);
 const bounds=items.map(x=>RR.Render.bounds(x.world));
 const view=RR.Render.pad({xMin:Math.min(...bounds.map(b=>b.xMin)),xMax:Math.max(...bounds.map(b=>b.xMax)),yMin:Math.min(...bounds.map(b=>b.yMin)),yMax:Math.max(...bounds.map(b=>b.yMax))},1.6);
 const h=900,width=Math.ceil(h*(view.xMax-view.xMin)/(view.yMax-view.yMin));
 const sharp=availableSharp(),outputs=[];
 for(const x of items){
  for(const mono of [false,true]){
   const level=mono?JSON.parse(JSON.stringify(x.level)):x.level;
   if(mono)for(const p of level.parts)if(p.kind==='ring'||p.kind==='stick')p.color=[.35,.35,.35];
   const svg=RR.Render.render({world:x.world,level,view,width,height:h,labels:true,links:false,title:x.label+(mono?' mono':' colour')});
   const p=out+'-'+x.label.toLowerCase()+(mono?'-mono':'-color')+'.svg';C.writeNew(p,svg);outputs.push(C.rel(p));
   if(sharp){await sharp(Buffer.from(svg)).png().toFile(p.replace(/\.svg$/,'.png'));outputs.push(C.rel(p.replace(/\.svg$/,'.png')));}
  }
 }
 const compare=out+'-vs-source.svg';
 if(source){const panels=items.map((x,i)=>RR.Render.render({world:x.world,level:x.level,view,width,height:h,labels:true,title:x.label}).replaceAll('rrShadow','rrShadow'+i));
  C.writeNew(compare,`<svg xmlns="http://www.w3.org/2000/svg" width="${width*2+20}" height="${h+40}" viewBox="0 0 ${width*2+20} ${h+40}"><rect width="100%" height="100%" fill="white"/><text x="10" y="22">Source — same camera / scale</text><text x="${width+30}" y="22">Proposal — same camera / scale</text><g transform="translate(0 40)">${panels[0]}</g><g transform="translate(${width+20} 40)">${panels[1]}</g></svg>`);outputs.push(C.rel(compare));
  if(sharp){await sharp(compare).png().toFile(compare.replace(/\.svg$/,'.png'));outputs.push(C.rel(compare.replace(/\.svg$/,'.png')));}
 }
 const info={view,width,height:h,sameScale:true,png:!!sharp,outputs,visualReview:'pending_human_or_AI_image_inspection',solutionSearch:false};
 C.writeNew(out+'-preview.json',info);return info;
}
module.exports={preview,availableSharp};
if(require.main===module){if(!C.args[0]||!C.opt('--out')){console.error('node scripts/preview.cjs file --out work/101/r01 [--source file]');process.exit(2);}
 preview(C.args[0],{source:C.opt('--source'),out:C.opt('--out')}).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});}

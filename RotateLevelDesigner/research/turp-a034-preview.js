"use strict";
const fs=require('fs'),path=require('path'),{RR}=require('./turp-continue'),g=require('./pose-body-gesture-query'),sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{OUT}=require('./turp-a034-author');
const DIR=path.join(__dirname,'20261016-turp-a034-image-delivery'),stem='turp-A034-70004-image-shared-sliders-r03',p=JSON.parse(fs.readFileSync(path.join(__dirname,'../levels',stem+'.rrpack.json'))),b=RR.Design.toLevel(p.design),byNative=Object.fromEntries(Object.entries(b.ids).map(([k,v])=>[v,k])),save=(n,s)=>fs.writeFileSync(path.join(DIR,n),s,{flag:'wx'});
function labels(svg){return svg.replace(/>R(\d+)<\/text>/g,(_,n)=>'>'+byNative['ring_'+n]+'</text>');}
function hidden(s){const h={};for(let i=0;i<s.objectCount();i++)if(s.isSolved(i)){h[s.idOf(i)]=true;for(const q of s.world.guides)if(q.stickId===s.idOf(i))h[q.id]=true;}return h;}
async function main(){
 const sim=g.query(p).sim,base=RR.Render.bounds(sim.world),view={xMin:base.xMin-1.5,xMax:base.xMax+1.5,yMin:base.yMin-1.5,yMax:base.yMax+1.5};
 const svg=labels(RR.Render.render({world:sim.world,level:p.runtime,view,width:700,height:1000,labels:true,title:'TURP A034 / r03 — author IDs follow picture labels'}));save('preview.svg',svg);await sharp(Buffer.from(svg)).png().toFile(path.join(DIR,'preview.png'));
 const m=JSON.parse(fs.readFileSync(OUT+'/r03-right-first-corrected-recovery.json')).variants.rightFirstReturn16,images=[];
 const stages=[[6,'S3 +1.4: giữ R2, nhả R8'],[9,'R7/R8 tháo trước, S3 còn giữ'],[11,'S3 trở về 0, R2 vẫn giữ'],[16,'Hoàn thành sau đổi hướng S3']];
 for(let i=0;i<stages.length;i++){const[n,title]=stages[i],s=g.query(p,m.slice(0,n),false,true).sim,svg=labels(RR.Render.render({world:s.world,level:p.runtime,view,width:320,height:550,labels:true,hidden:hidden(s),title}));save('mechanism-phase'+i+'.svg',svg);images.push({input:await sharp(Buffer.from(svg)).png().toBuffer(),left:i*320,top:40});const banner='<svg width="320" height="40"><rect width="320" height="40" fill="white"/><text x="8" y="24" font-size="13" font-family="sans-serif">'+title+'</text></svg>';images.push({input:await sharp(Buffer.from(banner)).png().toBuffer(),left:i*320,top:0});}
 await sharp({create:{width:1280,height:590,channels:4,background:'#fff'}}).composite(images).png().toFile(path.join(DIR,'mechanism-phases.png'));save('preview-label-mapping.json',JSON.stringify({byNative,labels:'Rendered text only uses author/picture IDs. Runtime untouched.',phasePrefixes:stages.map(s=>s[0]),camera:view},null,2)+'\n');
}
main().catch(e=>{console.error(e);process.exitCode=1;});

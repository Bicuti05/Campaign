'use strict';
const fs=require('fs'),path=require('path');
const OUT=__dirname,ROOT=path.resolve(OUT,'../../../..'),RR=require(path.join(ROOT,'Tools/RotateLevelDesigner/rr-core.js'));
const sharp=require(path.join(ROOT,'Tools/RotateLevelDesigner/research/20261020-levelgen-handoff/relocated check/LevelGen/node_modules/sharp'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
async function sheet(items,name,cols){const cw=400,ch=400,heads=40,rows=Math.ceil(items.length/cols),composite=[];
 for(let i=0;i<items.length;i++){const e=items[i],pack=read(e.file),world=new RR.Simulation(pack.runtime,RR.Tuning.defaults()).world;
  const svg=RR.Render.render({world,level:pack.runtime,width:400,height:360,labels:false,title:e.label});const b=await sharp(Buffer.from(svg)).resize(cw,ch-heads,{fit:'contain',background:'#fbf1e0'}).png().toBuffer();
  const label=Buffer.from(`<svg width="400" height="40"><rect width="400" height="40" fill="white"/><text x="10" y="26" font-family="Arial" font-size="18">${e.label.replaceAll('&','&amp;')}</text></svg>`);
  composite.push({input:label,left:(i%cols)*cw,top:Math.floor(i/cols)*ch},{input:b,left:(i%cols)*cw,top:Math.floor(i/cols)*ch+heads});
 }
 await sharp({create:{width:cols*cw,height:rows*ch,channels:3,background:'white'}}).composite(composite).png().toFile(path.join(OUT,name));
}
(async()=>{const lroot=path.join(ROOT,'Tools/LevelGen'),manifest=read(path.join(lroot,'IMPORT_MANIFEST.json'));
 const slots=[101,110,115,117,125,130,150,170,190,200,210,220,230,240,245,250];await sheet(slots.map(n=>{const r=manifest.rows.find(x=>x.slot===n);return{file:path.join(lroot,r.pack),label:'A'+n};}),'levelgen-sample-16.png',4);
 const rr=path.join(ROOT,'Tools/RingLab-GameDeveloper-20261021-r01'),short=read(path.join(rr,'SHORTLIST_FIGURES.json')).entries;await sheet(short.map(e=>({file:path.join(rr,e.pack),label:e.id+' - '+e.title})),'ringlab-shortlist-12.png',4);
 console.log('Rendered current-core contact sheets, 16 LevelGen +12 RingLab shortlist.');})().catch(e=>{console.error(e);process.exitCode=1;});

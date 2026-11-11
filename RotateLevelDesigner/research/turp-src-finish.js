"use strict";
// Shared exporter for source-weighted remakes: writes new design/pack (wx), geometry, r0x.png and comparison with source (+ previous revision).
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process'),{check}=require('./turp-a042-author'),near=require('./turp-color-near.js');
const sharp=require('C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const LV=path.join(__dirname,'../levels'),CLI=path.join(__dirname,'../rr-cli.js');
module.exports=async function finish({d,stem,out,rev,notes,compare=[]}){
 d.notes=notes;const c=check(d),n=near(d);
 if(c.analysis.error||c.analysis.warnings.length||c.margins.some(m=>m.margin<45)||c.guides.some(g=>!g.engaged)||c.links.some(l=>!l.active)||n.near.length||n.sizeClash.length)throw Error('checks: '+JSON.stringify({w:c.analysis.warnings,m:c.margins.filter(m=>m.margin<45),n}));
 const dp=path.join(LV,stem+'.rrdesign.json'),pp=path.join(LV,stem+'.rrpack.json');
 fs.writeFileSync(dp,JSON.stringify(d,null,2)+'\n',{flag:'wx'});fs.writeFileSync(path.join(out,stem+'-geometry.json'),JSON.stringify(c,null,2)+'\n',{flag:'wx'});
 console.log(execFileSync('node',[CLI,'validate',dp]).toString().trim());execFileSync('node',[CLI,'pack',dp,'-o',pp,'--author','Codex / TURP','--no-solve']);console.log(execFileSync('node',[CLI,'validate',pp]).toString().trim());
 const svg=path.join(out,rev+'.svg'),png=path.join(out,rev+'.png');execFileSync('node',[CLI,'render',dp,'-o',svg,'--links']);await sharp(svg).png().toFile(png);
 const imgs=[path.join(out,'source.png'),...compare,png],bufs=await Promise.all(imgs.map(f=>sharp(f).resize({height:800}).toBuffer())),metas=await Promise.all(bufs.map(b=>sharp(b).metadata()));let x=0;const comp=bufs.map((b,i)=>{const o={input:b,left:x,top:0};x+=metas[i].width+20;return o;});
 await sharp({create:{width:x,height:800,channels:3,background:'#ffffff'}}).composite(comp).png().toFile(path.join(out,rev+'-vs-source.png'));
 const sha=require('crypto').createHash('sha256').update(fs.readFileSync(pp)).digest('hex');console.log(sha,JSON.stringify(c.strict));return sha;};

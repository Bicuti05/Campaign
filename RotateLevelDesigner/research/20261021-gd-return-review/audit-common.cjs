'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT="C:\\Project Folder\\intern-iec-game-2026",TOOL="C:\\Project Folder\\intern-iec-game-2026\\Tools\\RotateLevelDesigner";
const RR=require(path.join(TOOL,'rr-core.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const rel=p=>path.relative(ROOT,path.resolve(p)).replaceAll('\\','/');
const args=process.argv.slice(2);
const opt=(key,fallback)=>{const i=args.indexOf(key);return i>=0?args[i+1]:fallback;};
function load(p){const doc=read(p);let design,level,built;
 if(doc.format==='turp-design'){design=doc;built=RR.Design.toLevel(design);level=built.level;}
 else if(doc.format==='turp-pack'){design=doc.design;level=doc.runtime;}
 else {level=doc;design=RR.Design.fromLevel(level,{});}
 return{doc,design,level,built};
}
function writeNew(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'});}
function date(){const d=new Date();return[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('');}
module.exports={fs,path,ROOT,TOOL,RR,read,sha,rel,args,opt,load,writeNew,date};

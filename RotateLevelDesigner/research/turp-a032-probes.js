"use strict";
const fs=require('fs'),path=require('path'),g=require('./pose-body-gesture-query'),{OUT,save}=require('./turp-a032-author'),stem='turp-A032-10021-cross-return-pinbars-r06',d=JSON.parse(fs.readFileSync(path.join(OUT,stem+'.rrdesign.json'))),q=JSON.parse(fs.readFileSync(path.join(OUT,stem+'-qualification.json'))),main=q.moves,rows=[];
function run(label,moves,feel){const v=g.query(d,moves,false,feel).data;rows.push({label,feel,moves,...v});return v;}
for(const feel of [false,true]){
 for(const target of [66,78,90,102,114,126])run('one-R6-'+target,[...main.slice(0,6),{part:'R6',target},...main.slice(8)],feel);
 run('swap-top-receivers',[...main.slice(0,9),main[10],main[9],...main.slice(11)],feel);
 for(const target of [-360,90,270,540])run('R6-with-S3-'+target,[...main.slice(0,6).filter(m=>m.part!=='S3'),...Array.from({length:3},()=>({part:'R6',target}))],feel);
 const early=[...main.slice(0,10),main[11],main[10]];
 run('R2-return-too-early',early,feel);
 run('R2-return-recovery',[...early,main[9],main[11],...main.slice(12)],feel);
 for(const target of [-66,294,654])run('R2-repeated-directions-'+target,[...main.slice(0,11),...Array.from({length:3},()=>({part:'R2',target}))],feel);
}
save('r06-directions-return-and-alternatives.json',{createdAtUtc:new Date().toISOString(),scope:'Finite full-pointer body gestures. No minimum/global impossibility claim; default feel and reached poses retained.',rows});console.log(JSON.stringify(rows.map(r=>({label:r.label,feel:r.feel,solved:r.solved,remaining:r.remaining,R2:r.poses.R2,R6:r.poses.R6,R5:r.poses.R5,R1:r.poses.R1}))));

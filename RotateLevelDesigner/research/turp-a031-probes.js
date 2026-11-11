"use strict";
const fs=require('fs'),path=require('path'),g=require('./pose-body-gesture-query'),{RR}=require('./turp-continue');
const dir=path.join(__dirname,'20261015-turp-a031-delivery'),stem='turp-A031-10026-shared-receiver-U-r01',read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')),pack=read(path.join(__dirname,'../levels',stem+'.rrpack.json')),proof=read(path.join(dir,stem+'-final-proof.json')),main=proof.finalProof.moves;
const rebuilt=RR.Design.toLevel(pack.design).level,variant=main.filter((_,i)=>i!==6),profiles={};
for(const [name,lv]of [['saved',pack.runtime],['rebuilt',rebuilt]])for(const feel of [false,true]){const ids=RR.Design.toLevel(pack.design).ids;profiles[name+(feel?'Default':'Analytic')]=g.replay(lv,variant.map(m=>({...m,part:ids[m.part]})),false,feel);}
const cases=[];
function run(label,moves,feel){const q=g.query(pack,moves,false,feel);cases.push({label,feel,moves,...q.data});return q.data;}
for(const feel of [false,true]){
 for(const target of [0,2.4,2.9,3.4,-2,-6])run('U-stage-R2-'+target,[...main.slice(0,6),{part:'S1',target},{part:'R2',target:156}],feel);
 const noR2=main.slice(0,11).filter(m=>m.part!=='R2');
 for(const target of [-360,90,201,360,540])run('R6-keep-R2-'+target,[...noR2,...Array.from({length:3},()=>({part:'R6',target}))],feel);
 run('R6-open-R2',main.slice(0,12),feel);
 const wrong=[...main.slice(0,14),{part:'R3',target:540}];
 run('central-deep-prefix',wrong,feel);
 run('central-deep-recover',[...wrong,...main.slice(14)],feel);
 const reorder=[...main.slice(0,13),main[14],main[13],...main.slice(15)];
 run('central-source-order-swap',reorder,feel);
}
const out={createdAtUtc:new Date().toISOString(),scope:'Finite alternate/deep/repeated full material-body gestures, saved pack. No minimum/global necessity claim; query records rejected inputs and reached states.',alternate16:{moves:variant,profiles},cases};
fs.writeFileSync(path.join(dir,'U-stages-central-return-and-alternatives.json'),JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({alternate:Object.fromEntries(Object.entries(profiles).map(([k,v])=>[k,v.ok])),cases:cases.map(c=>({label:c.label,feel:c.feel,solved:c.solved,remaining:c.remaining,R2:c.poses.R2,R3:c.poses.R3,R6:c.poses.R6,S1:c.poses.S1}))}));

"use strict";
const fs=require('fs'),path=require('path'),g=require('./pose-body-gesture-query'),dir=path.join(__dirname,'20261015-turp-a027-delivery'),stem='turp-A027-10018-shared-middle-U-r03',pack=JSON.parse(fs.readFileSync(path.join(__dirname,'../levels',stem+'.rrpack.json'))),proof=JSON.parse(fs.readFileSync(path.join(dir,stem+'-final-proof.json'))),m=proof.finalProof.moves,rows=[];
for(const feel of [false,true]){
 function run(kind,prefix,suffix){const q=g.query(pack,prefix.concat(suffix),false,feel).data;rows.push({kind,feel,prefix,suffix,solved:q.solved,remaining:q.remaining,poses:q.poses,trace:q.trace.slice(prefix.length)});}
 const gates=m.slice(0,5),bottom=[{part:'R10',target:66},{part:'R3',target:114}];
 for(const target of [0,-2.4,-2.9,-3.4,2,6])run('U_intermediate_R1_output',gates,[{part:'S1',target},...bottom,{part:'R1',target:24}]);
 for(const [bar,ring,prefix]of [['S2','R3',m.slice(0,9)],['S6','R2',m.slice(0,12)],['S7','R8',m.slice(0,15)]])for(const target of [-360,90,270,540])run('kept_'+bar+'_deep_repeated',prefix.filter(x=>x.part!==bar),Array.from({length:3},()=>({part:ring,target})));
 const pre=m.slice(0,9);for(const suffix of [[{part:'R1',target:540}],[{part:'R1',target:24},{part:'R3',target:540}],[{part:'R3',target:273},{part:'R1',target:24}],m.slice(9)])run('middle_return_and_order',pre,suffix);
 for(const target of [-6,-1.5,1.5,6])run('pinbar_direction',[],[{part:'S4',target}]);
 run('postponed_U_release',gates,[{part:'S1',target:-2.9},...m.slice(7),{part:'S1',target:-3.4}]);
}
fs.writeFileSync(path.join(dir,'full-gesture-alternatives.json'),JSON.stringify({createdAtUtc:new Date().toISOString(),scope:'Finite material-body current-pose beginDrag, full pointer target then release, analytic/default. Repeated targets have three fresh gestures. No global necessity/impossibility or minimum-route claim.',rows},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(rows.filter(r=>r.feel).map(r=>({kind:r.kind,suffix:r.suffix,remaining:r.remaining,solved:r.solved,S1:r.poses.S1,R1:r.poses.R1,R3:r.poses.R3,R2:r.poses.R2,R8:r.poses.R8,S4:r.poses.S4}))));

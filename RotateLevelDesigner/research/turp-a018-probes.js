"use strict";
const fs=require('fs'),path=require('path'),crypto=require('crypto'),g=require('./pose-body-gesture-query');
const OUT=path.join(__dirname,'20261015-turp-a018-delivery'),p=JSON.parse(fs.readFileSync(path.join(__dirname,'../levels/turp-A018-70009-shared-r06.rrpack.json'))),proof=JSON.parse(fs.readFileSync(path.join(OUT,'turp-A018-70009-shared-r06-final-proof.json'))),moves=proof.finalProof.moves,rows=[];
for(const feel of [false,true]){
 for(const [prefixLength,part,targets]of [[0,'R10',[-270,0,90,180,360,450]],[12,'R11',[-180,0,90,180,270,315,402,540]],[11,'R8',[-180,0,90,180,270,360,540]]])for(const target of targets){const prefix=moves.slice(0,prefixLength),q=g.query(p,prefix.concat(Array.from({length:3},()=>({part,target}))),false,feel);rows.push({feel,prefixLength,part,target,repeatedGestures:3,baseline:g.query(p,prefix,false,feel).data.poses[part],result:q.data.poses[part],remaining:q.data.remaining,trace:q.data.trace.slice(prefixLength)});}
 const omitted=moves.filter((m,i)=>i!==12),q=g.query(p,omitted,false,feel);rows.push({feel,kind:'omit_intermediate_R11_prepare_step13',remaining:q.data.remaining,solved:q.data.solved,trace:q.data.trace});
}
const inv=JSON.parse(fs.readFileSync(path.join(__dirname,'20261015-turplevel-approved-read/approval-inventory.json'))),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),approved=inv.entries.map(e=>({stem:e.stem,packUnchanged:hash(e.packSource)===e.packSha256,designUnchanged:hash(e.designSource)===e.designSha256}));
if(approved.some(a=>!a.packUnchanged||!a.designUnchanged))throw Error('Approved source hash changed');
fs.writeFileSync(path.join(OUT,'alternative-gestures-and-source-audit.json'),JSON.stringify({createdAt:new Date().toISOString(),scope:'Finite alternate/deep/repeated full body gestures at reachable prefixes; no exhaustive necessity claim.',rows,approved},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({tested:rows.length,approvedPairs:approved.length,rows:rows.map(r=>({feel:r.feel,prefix:r.prefixLength,part:r.part,target:r.target,solved:r.result?.solved,pose:r.result?.pose,kind:r.kind,remaining:r.remaining,routeSolved:r.solved}))}));

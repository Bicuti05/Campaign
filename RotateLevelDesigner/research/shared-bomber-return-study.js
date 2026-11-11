"use strict";
// Authoring/research only. Existing builder and full-release gesture harness.
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),checks=require("./production-batch-01-check.js"),{query}=require("./full-gesture-query.js"),release=require("./replay-until-release.js");
const OUT=path.join(__dirname,"20261014-shared-bomber-return"),P=4.5854,D=2.8354,clone=x=>JSON.parse(JSON.stringify(x)),move=(part,target)=>({part,target}),pin=(angle,target)=>({angle,target}),ring=(id,x,y,gapDir,color,pins=[],extra={})=>({id,x,y,radius:1.75,gap:90,gapDir,color,pins,...extra});
const design={format:"turp-design",version:1,levelId:"draft",name:"SBR-01 | Thanh chung mở bom và nguồn phải quay lại",author:"Codex + GD / research",notes:"Nghiên cứu tổ hợp mới: S giữ đồng thời input A mang bom và Q; Q được D giữ lại sau khi S rời. D có hai receiver Q/U và còn nhận C, cần quay thật để nhả C. T là cửa chung B/C/E. Bom A có thể cắt nguồn B, nhưng đường CCW còn bị pin cũ của A va thân C: đo riêng input và quỹ đạo, không coi source được kéo là đường đã mở. Mọi vòng radius1,75 và S mặc định; không Guide/Stop/Chain/Booster. Chưa đủ proof để giao.",rings:[
 ring("A",0,0,0,"orange",[pin(270,"S")],{bomb:{x:-2.2/Math.sqrt(2),y:-2.2/Math.sqrt(2),radius:.5}}),
 ring("B",-P,0,0,"purple",[pin(0,"A"),pin(90,"T"),pin(270,"BL")],{gap:0}),
 ring("BL",-P,-P,270,"blue"),ring("T",-P,P,180,"teal"),
 ring("C",0,P,0,"red",[pin(270,"A"),pin(180,"T"),pin(0,"D")],{gap:0}),
 ring("D",P,P,0,"green",[pin(270,"Q"),pin(90,"U")]),
 ring("Q",P,0,0,"sky",[pin(270,"S")]),ring("U",P,2*P,0,"blue"),
 ring("E",-P,2*P,0,"navy",[pin(270,"T"),pin(0,"CT")],{gap:0}),ring("CT",0,2*P,0,"orange")
],sticks:[{id:"S",shape:"straight",x:P/2,y:-D,angle:0,color:"red"}]};
const route=[move("S",6),move("A",-90),move("Q",90),move("U",270),move("D",180),move("T",0),move("T",90),move("CT",180)];
const candidate={stem:"study-20261014-shared-bomber-return-01",design,bombs:true,authorMoves:route,probes:[[],[move("S",1)],[move("S",-1)],[move("S",6),move("A",270)],[move("S",6),move("Q",90),move("D",180)]]};
function prepare(){fs.mkdirSync(OUT,{recursive:true});const input=checks.serialized(design),geometry=checks.geometry(input),proof=checks.proof(candidate,input),data=query(input,route,true).data;fs.writeFileSync(OUT+"/candidate-01.rrdesign.json",JSON.stringify(design,null,2),{flag:"wx"});fs.writeFileSync(OUT+"/initial-study-01.json",JSON.stringify({candidate,geometry,proof,data},null,2),{flag:"wx"});console.log(JSON.stringify({geometry,proof:{analytic:proof.analytic,feel:proof.feel,release:proof.release.ok},solved:data.solved,trace:data.trace,poses:data.poses}));}
if(require.main===module)prepare();module.exports={RR,OUT,P,D,clone,move,design,route,candidate,checks,query,release};

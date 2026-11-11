"use strict";
// Research only: compact Stop in another ring's open window, coordinated motion before root cleanup.
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),checks=require("./production-batch-01-check.js"),{query}=require("./full-gesture-query.js"),release=require("./replay-until-release.js");
const OUT=path.join(__dirname,"20261014-stop-window-handoff"),P=4.5854,X=4.2,clone=x=>JSON.parse(JSON.stringify(x)),move=(part,target)=>({part,target}),pin=(angle,target)=>({angle,target}),ring=(id,x,y,gapDir,color,pins=[],extra={})=>({id,x,y,radius:1.75,gap:90,gapDir,color,pins,...extra});
const design={format:"turp-design",version:1,levelId:"draft",name:"SWH-01 | Đổi cửa để chốt ra, quay lại nguồn còn giữ",author:"Codex + GD / research",notes:"Thăm dò tổ hợp: A input mở, nhận C/D và có Stop0 dài1,6, chân trên vật liệu ngoài khe A90. Stop nằm trong khe R180; R nhận RR nên còn giữ sau RT/DB mở input. DB dùng chung D/R. Dọn RT/DB rồi đổi khe R150 để A quay cửaC180 rồiD270; quay lại R0 sau khi A/DB dọn. Pitch A/R4,2 có mục đích cản Stop gọn, các root1,75/pitch4,5854. Không Bom/Stick/Guide/Chain/Booster. Chưa đủ proof để giao, không coi cản một lần là chuẩn bị bắt buộc.",rings:[
 ring("A",0,0,90,"orange",[],{stops:[{angle:0,length:1.6}]}),
 ring("C",-P,0,0,"purple",[pin(0,"A")],{gap:0}),
 ring("D",0,-P,0,"navy",[pin(90,"A"),pin(0,"DB")],{gap:0}),ring("DB",P,-P,0,"teal"),
 ring("R",X,0,180,"blue",[pin(90,"RT"),pin(270,"DB")]),ring("RT",X,P,0,"sky"),
 ring("RR",X+P,0,0,"green",[pin(180,"R"),pin(270,"Q")],{gap:0}),ring("Q",X+P,-P,0,"red")
],sticks:[]};
const route=[move("DB",90),move("RT",270),move("R",150),move("A",180),move("A",270),move("DB",180),move("R",0),move("Q",90)],candidate={stem:"study-20261014-stop-window-handoff-01",design,bombs:false,authorMoves:route,probes:[[move("A",180)],[move("A",0)],[move("A",270)],[move("DB",90),move("RT",270),move("R",210)]]};
function prepare(){fs.mkdirSync(OUT,{recursive:true});const input=checks.serialized(design),geometry=checks.geometry(input),proof=checks.proof(candidate,input),data=query(input,route).data;fs.writeFileSync(OUT+"/candidate-01.rrdesign.json",JSON.stringify(design,null,2),{flag:"wx"});fs.writeFileSync(OUT+"/initial-study-01.json",JSON.stringify({candidate,geometry,proof,data},null,2),{flag:"wx"});console.log(JSON.stringify({geometry,proof:{analytic:proof.analytic,feel:proof.feel,release:proof.release.ok},data}));}
if(require.main===module)prepare();module.exports={RR,OUT,P,X,clone,move,design,route,candidate,checks,query,release};

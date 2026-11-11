"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),checks=require("./production-batch-01-check.js"),{query}=require("./full-gesture-query.js"),release=require("./replay-until-release.js");
const OUT=path.join(__dirname,"20261014-shared-slider-two-gates"),P=4.5854,D=2.8354,Y=P*Math.sqrt(3)/2,clone=x=>JSON.parse(JSON.stringify(x)),move=(part,target)=>({part,target}),pin=(angle,target)=>({angle,target}),ring=(id,x,y,gapDir,color,pins=[],extra={})=>({id,x,y,radius:1.75,gap:90,gapDir,color,pins,...extra});
const design={format:"turp-design",version:1,levelId:"draft",name:"STG-01 research | Thanh chung mở hai nhánh, nguồn trên chờ hai cửa",author:"Codex + GD / research",notes:"8 vòng radius1,75,1 thanh straight default,9 pin; S ngang mở A/Q dưới, T chung A/C và U chung Q/C. C chỉ mở input sau cả T/U nhả đúng pin, E kín bên trái còn giữ C để quay thực; B/D kín giữ A/Q sau S và cửa. Hai cửa có thể phục vụ C trước rồi quay lại A/Q hoặc dọn nguồn dưới trước; cần đo geometry, role, tái khóa, đường khác và full-release sau serialize. Không Guide/Stop/Bom/Chain/Booster, không giả tăng số kéo là khó. Bản author research chưa bàn giao.",rings:[
ring("A",0,0,0,"orange",[pin(90,"T"),pin(270,"S")]),ring("Q",P,0,180,"blue",[pin(90,"U"),pin(270,"S")]),
ring("T",0,P,180,"purple"),ring("U",P,P,0,"teal"),
ring("C",P/2,P+Y,90,"red",[pin(240,"T"),pin(300,"U")]),
ring("B",-P,0,0,"green",[pin(0,"A")],{gap:0}),ring("D",2*P,0,0,"navy",[pin(180,"Q")],{gap:0}),ring("E",-P/2,P+Y,0,"sky",[pin(0,"C")],{gap:0})
],sticks:[{id:"S",shape:"straight",x:P/2,y:-D,angle:0,color:"green"}]};
const lowerFirst=[move("S",6),move("T",270),move("U",270),move("A",180),move("Q",0),move("T",60),move("U",120),move("C",180)];
const upperFirst=[move("T",60),move("U",120),move("C",180),move("S",6),move("T",270),move("U",270),move("A",180),move("Q",0)];
const candidate={stem:"study-20261014-shared-slider-two-gates-01",design,bombs:false,authorMoves:lowerFirst,probes:[...upperFirst.map((_,i)=>upperFirst.slice(0,i+1)),[move("S",-.5)],[move("S",.5)]]};
function prepare(){fs.mkdirSync(OUT,{recursive:true});const input=checks.serialized(design),geometry=checks.geometry(input),lower=query(input,lowerFirst).data,upper=query(input,upperFirst).data;fs.writeFileSync(OUT+"/candidate-01.rrdesign.json",JSON.stringify(design,null,2),{flag:"wx"});fs.writeFileSync(OUT+"/initial-study-01.json",JSON.stringify({candidate,geometry,lowerFirst,lower,upperFirst,upper},null,2),{flag:"wx"});console.log(JSON.stringify({geometry,lower,upper}));}
if(require.main===module)prepare();module.exports={RR,checks,query,release,P,D,Y,OUT,clone,move,pin,ring,design,candidate,lowerFirst,upperFirst};

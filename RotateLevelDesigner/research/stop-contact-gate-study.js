"use strict";
// Authoring research: an attached compact stop is a bomb contact gate, not a lock.
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),checks=require("./production-batch-01-check.js"),{query}=require("./full-gesture-query.js"),release=require("./replay-until-release.js");
const OUT=path.join(__dirname,"20261014-stop-contact-gate"),P=4.5854,D=2.8354,clone=x=>JSON.parse(JSON.stringify(x)),move=(part,target)=>({part,target}),pin=(angle,target)=>({angle,target}),ring=(id,x,y,gapDir,color,pins=[],extra={})=>({id,x,y,radius:1.75,gap:90,gapDir,color,pins,...extra});
const design={format:"turp-design",version:1,levelId:"draft",name:"SCG-01 | Chốt tạo điểm tiếp xúc qua cửa chung",author:"Codex + GD / research",notes:"Rút thanh giữa cụm để mở input A. A mang bom và được C giữ; chốt gọn trên B nối vào cung phải của B, vươn vào quỹ đạo bom, không là khóa. Nổ phá A/B, giải phóng nhánh E trong khi C vẫn giữ cửa chung T và CT. B cũng có route không nổ: BT/T nhả các pin đi ra nhưng E giữ B để có lượt quay thực. Đối chứng bỏ riêng chốt phải thay đổi contact/victim hoặc trạng thái sau release; không gọi một lần cản là thứ tự bắt buộc. Mọi vòng radius1,75, thanh default, không Guide/Chain/Booster; chưa GD duyệt visual/difficulty.",rings:[
 ring("A",0,0,0,"orange",[pin(270,"S")],{bomb:{x:-2.2/Math.sqrt(2),y:-2.2/Math.sqrt(2),radius:.5}}),
 ring("B",-P,0,180,"purple",[pin(90,"T"),pin(270,"BT")],{stops:[{angle:0,length:1.1}]}),
 ring("BT",-P,-P,270,"blue"),ring("T",-P,P,180,"teal"),
 ring("C",0,P,0,"red",[pin(270,"A"),pin(180,"T"),pin(0,"CT")],{gap:0}),ring("CT",P,P,0,"sky"),
 ring("E",-2*P,0,0,"green",[pin(0,"B"),pin(90,"ET")],{gap:0}),ring("ET",-2*P,P,90,"navy")
],sticks:[{id:"S",shape:"straight",x:0,y:-D,angle:0,color:"red"}]};
const route=[move("S",4),move("A",-90),move("CT",180),move("T",0),move("ET",270)];
const candidate={stem:"study-20261014-stop-contact-gate-01",design,authorMoves:route,bombs:true,probes:[[move("S",4),move("A",-180)],[move("S",4),move("A",270)],[move("S",4),move("BT",90),move("T",270)],[move("S",4),move("BT",90),move("T",270),move("B",180)]]};
function prepare(){fs.mkdirSync(OUT,{recursive:true});const input=checks.serialized(design),g=checks.geometry(input),p=checks.proof(candidate,input),r=checks.roles(candidate,input),noStop=clone(design);delete noStop.rings.find(x=>x.id==="B").stops;const full=query(input,route,true).data,counter=query(checks.serialized(noStop),route,true).data;fs.writeFileSync(OUT+"/candidate.rrdesign.json",JSON.stringify(design,null,2),{flag:"wx"});fs.writeFileSync(OUT+"/initial-study.json",JSON.stringify({candidate,geometry:g,proof:p,roles:r,full,counter},null,2),{flag:"wx"});console.log(JSON.stringify({geometry:g,proof:p,roles:r.ok,failedRoles:r.rows.filter(x=>!x.ok),full,counter}));}
if(require.main===module)prepare();
module.exports={RR,OUT,P,D,clone,move,ring,pin,design,route,candidate,checks,query,release};

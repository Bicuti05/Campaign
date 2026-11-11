"use strict";
const h=require("./stop-contact-gate-study.js"),fs=require("fs"),{ring,pin,move,P,D,clone,checks,query}=h;
const design={...clone(h.design),name:"SCG-02 | Chốt đổi nguồn bị bom phá",notes:"Chốt gọn của B là điểm chạm bom phía trái; B không có pin hướng vào A. B giữ T và L, F giữ B cùng AF. A có input sau rút thanh dọc và còn được C giữ; C giữ A/T/CT. Bỏ riêng chốt phải thay đổi vật đầu tiên bị bom chạm trong gesture sâu. T nối hai nguồn B/C; F là nguồn còn giữ B ở route không nổ. Đây là ý tưởng contact/quan hệ mới, không dùng nhánh solver hoặc số mảnh làm chứng minh khó/đẹp. Mọi radius1,75, thanh default, lockCount0.",rings:[
 ring("A",0,0,90,"orange",[pin(0,"S")],{bomb:{x:-2.2/Math.sqrt(2),y:-2.2/Math.sqrt(2),radius:.5}}),
 ring("B",-P,0,0,"purple",[pin(90,"T"),pin(180,"L")],{gap:0,stops:[{angle:0,length:.5}]}),ring("L",-2*P,0,180,"blue"),ring("T",-P,P,180,"teal"),
 ring("C",0,P,0,"red",[pin(270,"A"),pin(180,"T"),pin(0,"CT")],{gap:0}),ring("CT",P,P,0,"sky"),
 ring("F",-P,-P,0,"green",[pin(90,"B"),pin(0,"AF")],{gap:0}),ring("AF",0,-P,0,"navy")
],sticks:[{id:"S",shape:"straight",x:D,y:0,angle:90,color:"red"}]};
const route=[move("S",4),move("A",-90),move("CT",180),move("T",0),move("AF",180)],candidate={stem:"study-20261014-stop-contact-gate-02",design,authorMoves:route,bombs:true,probes:[[move("S",4),move("A",-360)],[move("S",4),move("A",270)],[move("S",4),move("L",0),move("T",270)],[move("S",4),move("L",0),move("T",270),move("B",90)]]};
function prepare(){const input=checks.serialized(design),g=checks.geometry(input),proof=checks.proof(candidate,input),roles=checks.roles(candidate,input),noStop=clone(design);delete noStop.rings.find(r=>r.id==="B").stops;const full=query(input,route,true).data,counter=query(checks.serialized(noStop),route,true).data,deep=query(checks.serialized(noStop),[move("S",4),move("A",-360)],true).data;fs.writeFileSync(h.OUT+"/revision-02.rrdesign.json",JSON.stringify(design,null,2),{flag:"wx"});fs.writeFileSync(h.OUT+"/revision-02-proof.json",JSON.stringify({candidate,geometry:g,proof,roles,full,counter,deep},null,2),{flag:"wx"});console.log(JSON.stringify({g,proof,roles:roles.ok,failed:roles.rows.filter(x=>!x.ok),full,counter,deep}));}
if(require.main===module)prepare();
module.exports={...h,design,route,candidate};

"use strict";
// Authoring/research: default U joins two lower sources, one wider common receiving window above.
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),checks=require("./production-batch-01-check.js"),{query}=require("./full-gesture-query.js"),release=require("./replay-until-release.js");
const OUT=path.join(__dirname,"20261014-shared-u-windows"),P=4.5854,D=2.8354,E=RR.C.authoring.STICK_DEFAULT_LENGTH/2,X=E+D,clone=x=>JSON.parse(JSON.stringify(x)),move=(part,target)=>({part,target}),pin=(angle,target)=>({angle,target}),ring=(id,x,y,gapDir,color,pins=[],extra={})=>({id,x,y,radius:1.75,gap:90,gapDir,color,pins,...extra});
const design={format:"turp-design",version:1,levelId:"draft",name:"SUW-01 | U mở hai nguồn, cửa trên phục vụ ba nguồn",author:"Codex + GD / research",notes:"Nghiên cứu tổ hợp: U default có hai nhánh giữ input A/B; một ngàm đầy đủ trên nhánh phải cần có retention sau pin và motion witness. C/D kín giữ A/B đồng thời cắm vào vòng giữa T. T radius2,70833325 có mục đích nhận hai pin ngang từ các cột x±5,54373325 theo span U default; các vòng khác1,75, không nghiên cứu size mặc định đồng loạt. T nhận thêm E kín phía trên; cần phục vụ cửa C/D/E và có lượt quay lại. Không Stop/Bom/Chain/Booster. Chưa đủ proof để xuất, không tự xác nhận khó/đẹp từ count.",rings:[
 ring("A",-X,0,180,"orange",[pin(0,"U")]),ring("B",X,0,0,"blue",[pin(180,"U")]),
 ring("C",-X,P,0,"purple",[pin(270,"A"),pin(0,"T")],{gap:0}),
 ring("D",X,P,0,"green",[pin(270,"B"),pin(180,"T")],{gap:0}),
 ring("T",0,P,270,"red",[],{radius:E}),
 ring("E",0,P+X,0,"navy",[pin(270,"T"),pin(0,"ER")],{gap:0}),ring("ER",P,P+X,0,"sky")
],sticks:[{id:"U",shape:"U",x:0,y:-1.8,angle:0,color:"teal",slideAxis:[0,1],guides:[{x:E,y:-1.2,angle:90}]}]};
const route=[move("U",-4),move("A",90),move("B",90),move("T",180),move("T",360),move("T",450),move("ER",180)],candidate={stem:"study-20261014-shared-u-windows-01",design,authorMoves:route,bombs:false,probes:[[],[move("U",-.3)],[move("U",-.5)],[move("U",-1)],[move("U",3)]]};
function prepare(){fs.mkdirSync(OUT,{recursive:true});const input=checks.serialized(design),geometry=checks.geometry(input),proof=checks.proof(candidate,input),states={main:query(input,route).data,shallow:query(input,[move("U",-.5)]).data};fs.writeFileSync(OUT+"/candidate-01.rrdesign.json",JSON.stringify(design,null,2),{flag:"wx"});fs.writeFileSync(OUT+"/initial-study-01.json",JSON.stringify({candidate,geometry,proof,states},null,2),{flag:"wx"});console.log(JSON.stringify({geometry,proof:{analytic:proof.analytic,feel:proof.feel,release:proof.release.ok},states}));}
if(require.main===module)prepare();module.exports={RR,OUT,P,D,E,X,clone,move,design,route,candidate,checks,query,release};

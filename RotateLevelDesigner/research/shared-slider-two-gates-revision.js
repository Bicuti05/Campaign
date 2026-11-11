"use strict";
const fs=require("fs"),h=require("./shared-slider-two-gates-study.js"),{P,D,Y,OUT,ring,pin,move,checks,query}=h;
const design={...h.clone(h.design),name:"STG-02 research | Thanh chung, hai cửa và nguồn kín giữ đôi",notes:"Tổ hợp mới5 vòng radius1,75 +1 straight default/8pin. Hàng trên T/C/U đều pitch4,5854; A/Q ở hàng dưới giữ S chung, có pin chéo120/60 lên T/U. C kín giữ cả A/Q bằng pin240/300 và cùng giữ T/U bằng180/0. T/U mở cửa cho A/Q thì S vẫn phải nhả; A/Q mở input vẫn nhận C nên còn lượt quay ngắn thực. T/U mở cửa cho C sớm chưa làm C tháo vì C vẫn nhận retention qua A/Q, cần quay lại T/U phục vụ A/Q. Đối chứng từng mối nối và retention trước bàn giao. Revision02 thay cấu trúc đề xuất01: bỏ3 root ngoài và chuyển góc pin tránh opposed-source caging; giữ01 geometry/proof thất bại, không ghi đè. Không Guide/Stop/Bom/Chain/Booster, chưa GD chốt đẹp/khó.",rings:[
ring("A",0,0,30,"orange",[pin(120,"T"),pin(270,"S")]),ring("Q",P,0,150,"blue",[pin(60,"U"),pin(270,"S")]),
ring("T",-P/2,Y,180,"purple"),ring("U",3*P/2,Y,0,"teal"),
ring("C",P/2,Y,0,"red",[pin(180,"T"),pin(0,"U"),pin(240,"A"),pin(300,"Q")],{gap:0})
]};
const lowerFirst=[move("S",6),move("T",300),move("U",240),move("A",60),move("Q",120),move("T",0),move("U",180)];
const returnRoute=[move("T",0),move("U",180),move("S",6),move("T",300),move("U",240),move("A",60),move("Q",120)];
const candidate={...h.candidate,stem:"study-20261014-shared-slider-two-gates-02",design,authorMoves:lowerFirst,probes:[...returnRoute.map((_,i)=>returnRoute.slice(0,i+1)),[move("S",-.5)],[move("S",.5)]]};
function prepare(){const input=checks.serialized(design),geometry=checks.geometry(input),lower=query(input,lowerFirst).data,back=query(input,returnRoute).data;fs.writeFileSync(OUT+"/candidate-02.rrdesign.json",JSON.stringify(design,null,2),{flag:"wx"});fs.writeFileSync(OUT+"/initial-study-02.json",JSON.stringify({candidate,geometry,lowerFirst,lower,returnRoute,back},null,2),{flag:"wx"});console.log(JSON.stringify({geometry,lower,back}));}
if(require.main===module)prepare();module.exports={...h,design,lowerFirst,returnRoute,candidate};

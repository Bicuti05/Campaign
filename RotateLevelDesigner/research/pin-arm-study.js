"use strict";
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js");
const {P,D,OUT,clone,ring,pin,design,inspect,probe,replay}=H;
const cx=-P*Math.cos(34*Math.PI/180),cy=P*Math.sin(34*Math.PI/180),base=P+2.2,arm=base+.6;
const d=design("Hai pin trên nhánh L — nhả nguồn dưới, dọn chốt rồi nâng tiếp",
 "Không ngàm. Hai pin cùng hướng giữ ở hai vị trí trên nhánh đứng của L, trục trượt là local Y và vuông góc đoạn ngang ngắn của L. Nâng +0,7 nhả pin dưới, pin trên vẫn giữ L. Vòng dưới được xoay để nhả nguồn chéo mang chốt; chốt biến mất, L mới nâng tiếp và nhả pin trên. Đầu ngang L chặn đường hạ qua thân vòng trên; đổi thành thanh đứng mở lối hạ. Chốt dài 6,5 đi qua khe 120 độ của vòng trên; bố cục chốt dài cần GD đánh giá sau, chưa tự nhận đẹp/khó. Không bom/Chain/Booster, không thêm ngàm trùng vai trò pin.",[
 ring("A",0,0,270,"orange",[pin(0,"S")]),
 ring("B",0,P,135,"blue",[pin(0,"S")],{gap:120}),
 ring("C",cx,cy,135,"purple",[pin(326,"A")],{stops:[{angle:45,length:6.5}]})
 ],[{id:"S",shape:"L",x:D-.6,y:base,length:1.2,arm,angle:0,color:"green",slideAxis:[0,1]}]);
const partial=[{part:"S",target:.7}],gate=[...partial,{part:"A",target:180}],route=[...gate,{part:"S",target:6}];
const noStop=clone(d);delete noStop.rings[2].stops;
const noUpper=clone(d);noUpper.rings[1].pins=[];
const noLower=clone(d);noLower.rings[0].pins=[];
const straight=clone(d);straight.sticks[0]={id:"S",shape:"straight",x:D,y:base-arm/2,length:arm,angle:90,color:"green"};
const narrow=clone(d);narrow.rings[1].gap=90;
const witness={initialBar:[-1,1].map(x=>probe(d,"S",x)),sourceBefore:[-1,1].map(x=>probe(d,"A",x)),partial:replay(d,partial),afterPartialBar:[-1,1].map(x=>probe(d,"S",x,partial)),afterGateBar:[-1,1].map(x=>probe(d,"S",x,gate)),withoutStop:[-1,1].map(x=>probe(noStop,"S",x)),withoutUpper:replay(noUpper,partial),withoutLowerSource:[-1,1].map(x=>probe(noLower,"A",x)),straightDirections:[-1,1].map(x=>probe(straight,"S",x)),narrowGap:inspect(narrow,false,2,400),undo:replay(d,[...partial,{part:"S",target:0},{part:"A",target:180}]),trace:replay(d,route)};
const c={stem:"study-20261013-v23-pin-on-l-arm",design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness};
fs.writeFileSync(path.join(OUT,"pin-arm-study.json"),JSON.stringify({format:"rotate-pin-arm-study",version:1,scope:"Pin passage on an L arm, two-source retention, no redundant guide",candidates:[c]},null,2));
console.log(JSON.stringify({stem:c.stem,inspection:c.inspection,trace:witness.trace,narrowGap:witness.narrowGap.analysis}));

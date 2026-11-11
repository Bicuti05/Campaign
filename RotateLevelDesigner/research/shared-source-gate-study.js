"use strict";
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {RR,P,D,OUT,clone,ring,pin,design,build,inspect,probe,replay}=h;
const d=design("Nhả hai thanh chung nguồn — giữ cửa dưới qua bước mở nguồn", "Một nguồn giữ hai thanh khác trục: thanh đứng chỉ có pin, thanh ngang có pin và ngàm. Rút thanh đứng và dịch thanh ngang một đoạn thì nguồn mới hết link đi ra, nhưng thanh ngang còn giữ cửa của cặp dưới. Hai chốt chặn hai lối rút hết thanh ngang; xoay nguồn để nhả nguồn còn lại và dọn hai chốt, rồi mới rút thanh ngang để mở cặp dưới. Ngàm cần giữ thanh qua thao tác trên nguồn khác; bỏ từng chốt phải mở một lối tắt. Không bom/Chain/Booster. Bản nghiên cứu, chưa GD nghiệm thu bố cục/độ khó.",[
 ring("R",0,0,90,"orange",[pin(0,"V"),pin(270,"H")],{stops:[{angle:315,length:2}]}),
 ring("N",-P,0,90,"green",[pin(0,"R")],{stops:[{angle:225,length:2}]}),
 ring("A",-2.35-P,-P,90,"blue",[pin(0,"B")]),
 ring("B",-2.35,-P,90,"purple")
],[
 {id:"V",shape:"straight",x:D,y:P/2,length:5.6,angle:90,color:"teal"},
 {id:"H",shape:"straight",x:-P/2,y:-D,length:5.6,angle:0,color:"red",guides:[{x:-4.1,y:-D,angle:0}]}
]);
const partial=[{part:"H",target:-.6}],both=[{part:"V",target:.6},...partial],gate=[...both,{part:"R",target:180}],route=[...gate,{part:"H",target:-5},{part:"B",target:180}];
const noGuide=clone(d);delete noGuide.sticks[1].guides;
const noLeft=clone(d);delete noLeft.rings[1].stops;
const noRight=clone(d);delete noRight.rings[0].stops;
const noV=clone(d);noV.sticks=noV.sticks.filter(s=>s.id!=="V");noV.rings[0].pins=noV.rings[0].pins.filter(p=>p.target!=="V");
const noH=clone(d);noH.sticks=noH.sticks.filter(s=>s.id!=="H");noH.rings[0].pins=noH.rings[0].pins.filter(p=>p.target!=="H");
const b=build(d),s=RR.Solver.newSim(b.level,false);
const w={initialGuideEngaged:s.world.guideEngaged(0),initialH:[-1,1].map(dir=>probe(d,"H",dir)),initialV:[-1,1].map(dir=>probe(d,"V",dir)),sourceInitially:[-1,1].map(dir=>probe(d,"R",dir)),sourceOnlyH:[-1,1].map(dir=>probe(d,"R",dir,partial)),sourceOnlyV:[-1,1].map(dir=>probe(d,"R",dir,both.slice(0,1))),partial:replay(d,partial),both:replay(d,both),lowerInitially:[-1,1].map(dir=>probe(d,"B",dir)),lowerPartial:[-1,1].map(dir=>probe(d,"B",dir,both)),afterGateH:[-1,1].map(dir=>probe(d,"H",dir,gate)),lowerAfterGate:[-1,1].map(dir=>probe(d,"B",dir,gate)),afterBarLower:[-1,1].map(dir=>probe(d,"B",dir,[...gate,{part:"H",target:-5}])),withoutGuide:replay(noGuide,both),withoutGuideLower:[-1,1].map(dir=>probe(noGuide,"B",dir,both)),withoutLeftStop:[-1,1].map(dir=>probe(noLeft,"H",dir)),withoutRightStop:[-1,1].map(dir=>probe(noRight,"H",dir)),withoutVSource:[-1,1].map(dir=>probe(noV,"R",dir,partial)),withoutHLower:[-1,1].map(dir=>probe(noH,"B",dir)),undo:replay(d,[...both,{part:"H",target:0},{part:"R",target:180}]),trace:replay(d,route),feel:replay(d,route,false,true)};
const c={stem:"study-20261013-v27-shared-source-bars-gate",design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness:w};
fs.writeFileSync(path.join(OUT,"shared-source-gate-study.json"),JSON.stringify({format:"rotate-shared-source-gate-study",version:1,scope:"Shared source input unlock plus held lower-region gate; Designer engine only",candidates:[c]},null,2));
console.log(JSON.stringify({inspection:c.inspection,witness:w}));

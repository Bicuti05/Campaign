"use strict";
const fs=require("fs"),path=require("path"),h=require("./ongoing-study.js");
const {P,D,OUT,clone,ring,pin,design,inspect,probe,replay}=h;
const d=design("Một thanh nhả, một thanh giữ — mở vòng nhận rồi quay lại", "A giữ hai thanh đứng và vòng B trên. Thanh trái L còn nhận pin từ B: hạ L một đoạn nhả riêng pin B, pin A vẫn giữ L; B khi đó mới hết link đi ra và được xoay. Chốt A chặn hạ L hết, chốt B chặn nâng L hết và còn bị thanh phải R chặn trên đường CW, nên phải rút R trước khi mở B. Sau B rời, A vẫn giữ L; đường nâng đã mở, đổi hướng kéo L lên để nhả A. Không ngàm vì các pin giữ thật, không bom/Chain/Booster. Chỉ một chốt B 135 độ trên đường CW đã kiểm; mẫu hai chốt trên B trước đó va thân A trước cửa nhả, giữ riêng trong research. Chưa GD nghiệm thu bố cục/độ khó.",[
 ring("A",0,0,270,"orange",[pin(0,"R"),pin(90,"B"),pin(180,"L")],{stops:[{angle:225,length:2}]}),
 ring("B",0,P,90,"purple",[pin(180,"L")],{stops:[{angle:135,length:2}]})
],[
 {id:"R",shape:"straight",x:D,y:P/2,length:5.6,angle:90,color:"blue"},
 {id:"L",shape:"straight",x:-D,y:P/2,length:5.6,angle:90,color:"green"}
]);
const right=[{part:"R",target:.6}],left=[{part:"L",target:-.6}],both=[...right,...left],afterB=[...both,{part:"B",target:-90}],route=[...afterB,{part:"L",target:.6}];
const noStop=clone(d);delete noStop.rings[1].stops;
const noLowerStop=clone(d);delete noLowerStop.rings[0].stops;
const noLowerPin=clone(d);noLowerPin.rings[0].pins=noLowerPin.rings[0].pins.filter(p=>p.target!=="L");
const noUpperPin=clone(d);noUpperPin.rings[1].pins=[];
const noRingPin=clone(d);noRingPin.rings[0].pins=noRingPin.rings[0].pins.filter(p=>p.target!=="B");
const noRight=clone(d);noRight.sticks=noRight.sticks.filter(s=>s.id!=="R");noRight.rings[0].pins=noRight.rings[0].pins.filter(p=>p.target!=="R");
const noLeft=clone(d);noLeft.sticks=noLeft.sticks.filter(s=>s.id!=="L");for(const r of noLeft.rings)r.pins=r.pins.filter(p=>p.target!=="L");
const w={initialB:[-1,1].map(dir=>probe(d,"B",dir)),onlyRightB:[-1,1].map(dir=>probe(d,"B",dir,right)),onlyLeftB:[-1,1].map(dir=>probe(d,"B",dir,left)),bothB:[-1,1].map(dir=>probe(d,"B",dir,both)),leftPhase:replay(d,left),rightPhase:replay(d,right),bothPhase:replay(d,both),afterB:replay(d,afterB),afterBLeft:[-1,1].map(dir=>probe(d,"L",dir,afterB)),withoutStopB:[-1,1].map(dir=>probe(noStop,"B",dir,left)),withoutLowerPin:replay(noLowerPin,left),withoutUpperPin:[-1,1].map(dir=>probe(noUpperPin,"B",dir,right)),withoutRingPin:replay(noRingPin,left),withoutRight:[-1,1].map(dir=>probe(noRight,"B",dir,left)),withoutLeft:[-1,1].map(dir=>probe(noLeft,"B",dir,right)),wrongLeftUp:replay(d,[...right,{part:"L",target:.6},{part:"B",target:-90}]),undoLeft:replay(d,[...both,{part:"L",target:0},{part:"B",target:-90}]),trace:replay(d,route),feel:replay(d,route,false,true),leftFirstRoute:replay(d,[...left,...right,{part:"B",target:-90},{part:"L",target:.6}])};
w.initialL=[-1,1].map(dir=>probe(d,"L",dir));
w.withoutLowerStopL=[-1,1].map(dir=>probe(noLowerStop,"L",dir));
w.withoutUpperStopL=[-1,1].map(dir=>probe(noStop,"L",dir));
const c={stem:"study-20261013-v31-joint-input-source",design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness:w};
fs.writeFileSync(path.join(OUT,"joint-input-source-study.json"),JSON.stringify({format:"rotate-joint-input-source-study",version:1,scope:"Mixed source targets, shared retained bar, and physical preparation select input/rotation windows",candidates:[c]},null,2));
console.log(JSON.stringify({inspection:c.inspection,witness:w}));

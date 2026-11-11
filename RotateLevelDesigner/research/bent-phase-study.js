"use strict";
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js");
const {P,D,OUT,clone,ring,pin,design,inspect,probe,replay}=H;
const d=design("Nhả pin L trước — ngàm giữ, khuỷu và chốt chọn phía rút",
 "Pin của vòng A giữ thanh L, vòng B giữ A và mang một chốt chặn lối trượt phải. Dịch L +0,6 nhả pin A nhưng ngàm vẫn giữ L; khuỷu L chặn lối trái qua vách ngàm, chốt B chặn lối phải dài. A được xoay để nhả B và dọn cả hai vòng cùng chốt. L còn lại chỉ rút được sang phải. Bỏ ngàm làm L tự tháo ngay khi pin nhả; bỏ chốt mở lối rút phải trước bước xoay A; đổi L thành thanh thẳng mở lối trái sau khi dọn nguồn. Ngàm/pin có vai trò theo hai trạng thái, không thêm ngàm để trang trí. Không bom/Chain/Booster; chưa nghiệm thu hình thức/độ khó.",[
 ring("A",0,0,90,"orange",[pin(270,"S")]),
 ring("B",P,0,90,"purple",[pin(180,"A")],{stops:[{angle:315,length:2}]})
 ],[{id:"S",shape:"L",x:P/2,y:-D,length:5.6,arm:1.3,angle:0,color:"blue",guides:[{x:4.1,y:-D,angle:0}]}]);
const partial=[{part:"S",target:.6}],sources=[...partial,{part:"A",target:0}],route=[...sources,{part:"S",target:5}];
const noStop=clone(d);delete noStop.rings[1].stops;
const noGuide=clone(d);delete noGuide.sticks[0].guides;noGuide.sticks[0].slideAxis=[1,0];
const straight=clone(d);straight.sticks[0].shape="straight";delete straight.sticks[0].arm;
const noPin=clone(d);noPin.rings[0].pins=[];
const witness={
 initialBar:[-1,1].map(x=>probe(d,"S",x)),
 sourceBefore:[-1,1].map(x=>probe(d,"A",x)),
 partial:replay(d,partial),
 afterPinBar:[-1,1].map(x=>probe(d,"S",x,partial)),
 afterSourcesBar:[-1,1].map(x=>probe(d,"S",x,sources)),
 withoutStop:[-1,1].map(x=>probe(noStop,"S",x)),
 withoutGuide:replay(noGuide,partial),
 straightAfterSources:[-1,1].map(x=>probe(straight,"S",x,sources)),
 withoutPinSource:[-1,1].map(x=>probe(noPin,"A",x)),
 partialThenUndo:replay(d,[...partial,{part:"S",target:0},{part:"A",target:0}]),
 trace:replay(d,route),feelTrace:replay(d,route,false,true)
};
const c={stem:"study-20261013-v22-bent-pin-guide-phases",design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness};
fs.writeFileSync(path.join(OUT,"bent-phase-study.json"),JSON.stringify({format:"rotate-bent-phase-study",version:1,scope:"Bent bar retained by guide after pin release; one removable stop and the elbow choose opposite paths",candidates:[c]},null,2));
console.log(JSON.stringify({stem:c.stem,inspection:c.inspection,witness}));

"use strict";
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js");
const {P,D,OUT,clone,ring,pin,design,inspect,probe,replay}=H;
const x=1.1+D,base=-P-2.6,arm=8.8;
const d=design("Hai phía giữ U — nhả một bên, quay đúng phía rồi rút tiếp",
 "Hai pin ngược hướng giữ hai nhánh đứng của cùng U ở hai độ cao, không ngàm; passage đều theo local Y. Hạ U một đoạn nhả pin trái, pin phải vẫn giữ cả khung. Chốt của nguồn dưới trái chặn đường hạ dài; đáy gập U và pin phải đã chặn nâng lên. Quay nguồn trái CCW để nhả nguồn mang chốt, rồi hạ U tiếp để nhả nguồn phải. Quay nguồn trái CW sau chuẩn bị có thể làm pin chạm lại U và khóa nguồn ở trạng thái sau thả tay. Đưa U về vị trí đầu cũng phục hồi pin trái. Chốt phụ phía trên đã bỏ vì không mở thêm lối tháo hoặc đổi recipe đang kiểm. Không bom/Chain/Booster, không thêm ngàm trùng vai trò hai pin; chưa nghiệm thu bố cục/độ khó.",[
 ring("A",-x,0,180,"orange",[pin(0,"U")]),
 ring("B",x,-P,0,"blue",[pin(180,"U")]),
 ring("C",-x,-P,270,"purple",[pin(90,"A")],{stops:[{angle:300,length:4.3}]})
 ],[{id:"U",shape:"U",x:0,y:base,length:2.2,arm,angle:0,color:"green",slideAxis:[0,1]}]);
const partial=[{part:"U",target:-1.9}],gate=[...partial,{part:"A",target:270}],route=[...gate,{part:"U",target:-7}];
const noStop=clone(d);delete noStop.rings[2].stops;
const noRight=clone(d);noRight.rings[1].pins=[];
const noLeft=clone(d);noLeft.rings[0].pins=[];
const sameHeight=clone(d);sameHeight.rings[1].y=0;
const split=clone(d);split.rings[0].pins[0].target="UL";split.rings[1].pins[0].target="UR";split.sticks=[{id:"UL",shape:"straight",x:-1.1,y:base+arm/2,length:arm,angle:90,color:"green"},{id:"UR",shape:"straight",x:1.1,y:base+arm/2,length:arm,angle:90,color:"green"}];
const extraUpper=clone(d);extraUpper.rings[0].stops=[{angle:45,length:2}];
const witness={
 initialBar:[-1,1].map(dir=>probe(d,"U",dir)),
 sourceBefore:[-1,1].map(dir=>probe(d,"A",dir)),
 partial:replay(d,partial),afterPartialBar:[-1,1].map(dir=>probe(d,"U",dir,partial)),
 afterGateBar:[-1,1].map(dir=>probe(d,"U",dir,gate)),
 withoutStop:[-1,1].map(dir=>probe(noStop,"U",dir)),
 withoutRightPin:replay(noRight,partial),withoutLeftPin:[-1,1].map(dir=>probe(noLeft,"A",dir)),
 sameHeight:replay(sameHeight,partial),splitParts:replay(split,[{part:"UL",target:-1.9}]),splitAnalysis:inspect(split,false,2,400).analysis,
 wrongSource:replay(d,[...partial,{part:"A",target:0},{part:"U",target:-7}]),
 sourceAfterPartial:[-1,1].map(dir=>probe(d,"A",dir,partial)),
 undo:replay(d,[...partial,{part:"U",target:0},{part:"A",target:270}]),
 trace:replay(d,route),feel:replay(d,route,false,true),
 rejectedUpperStop:{design:extraUpper,initialBar:[-1,1].map(dir=>probe(extraUpper,"U",dir)),sourceAfterPartial:[-1,1].map(dir=>probe(extraUpper,"A",dir,partial)),trace:replay(extraUpper,route),decision:"Removed in the delivered draft: only shortened an already blocked upward bar travel in these tested states; source direction and intended recipe unchanged."}
};
const c={stem:"study-20261013-v26-opposed-pin-u",design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness};
fs.writeFileSync(path.join(OUT,"opposed-pin-u-study.json"),JSON.stringify({format:"rotate-opposed-pin-u-study",version:1,scope:"Opposite-side pins retain distinct U arms at staggered heights with no guide",candidates:[c]},null,2));
console.log(JSON.stringify({stem:c.stem,inspection:c.inspection,witness:{partial:witness.partial,wrongSource:witness.wrongSource,trace:witness.trace,withoutStop:witness.withoutStop,sameHeight:witness.sameHeight,splitParts:witness.splitParts}}));

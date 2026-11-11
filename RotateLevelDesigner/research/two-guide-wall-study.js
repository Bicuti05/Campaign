"use strict";
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js");
const {RR,OUT,clone,design,build,inspect,probe,replay}=H;
// Both U guides change a different escape direction of the neighboring bar.
// This is a wall role, rather than a claim that two guides are required solely to retain U.
const d=design("Hai ngàm U giữ hai lối — nhả binding chưa dọn vách",
 "Thanh ngang nằm cao hơn đầu hai nhánh U, nên thân U không tự chặn lối ngang. Vách ngàm trái chặn lối trái, ngàm phải chặn lối phải; bỏ riêng từng ngàm mở đúng một lối khi U còn tồn tại. Hạ U một đoạn nhả binding ngàm phải nhưng ngàm trái vẫn giữ U, vì vậy vách phải vẫn ở đó và còn chặn thanh ngang. Hạ tiếp để nhả U, hai ngàm con mới rời cùng U và thanh ngang có thể rút hai phía. Có thể hạ U liền một lần; proof chia bước để kiểm trạng thái, không coi đó là số thao tác bắt buộc. Không vòng/pin/bom/Chain/Booster; chưa nghiệm thu hình thức hoặc độ khó.",[],[
 {id:"U",shape:"U",x:0,y:0,length:4.4,arm:3.6,angle:0,color:"green",slideAxis:[0,1],guides:[{x:-2.2,y:3.3,angle:90},{x:2.2,y:3.5,angle:90}]},
 {id:"H",shape:"straight",x:0,y:3.7,length:3,angle:0,color:"blue",guides:[{x:0,y:3.7,angle:0}]}
]);
const partial=[{part:"U",target:-.2}],removed=[{part:"U",target:-.5}],route=[...partial,...removed,{part:"H",target:3}];
const noLeft=clone(d);noLeft.sticks[0].guides.shift();
const noRight=clone(d);noRight.sticks[0].guides.pop();
const noHGuide=clone(d);delete noHGuide.sticks[1].guides;
const noUGuides=clone(d);delete noUGuides.sticks[0].guides;
function state(moves){const b=build(d),s=RR.Solver.newSim(b.level,false);for(const m of moves)RR.Solver.apply(s,{obj:s.indexOf(b.ids[m.part]),target:m.target});return {remaining:s.remaining(),bindings:s.graph.bindingActive.slice(),guides:s.world.guides.map((g,i)=>({active:g.active,engaged:s.world.guideEngaged(i)}))};}
const witness={
 initial:state([]),partial:state(partial),afterUndo:state([...partial,{part:"U",target:0}]),
 initialH:[-1,1].map(x=>probe(d,"H",x)),
 partialH:[-1,1].map(x=>probe(d,"H",x,partial)),
 afterU:[-1,1].map(x=>probe(d,"H",x,removed)),
 withoutLeft:[-1,1].map(x=>probe(noLeft,"H",x)),
 withoutRight:[-1,1].map(x=>probe(noRight,"H",x)),
 uDirections:[-1,1].map(x=>probe(d,"U",x)),
 withoutHGuide:replay(noHGuide,partial),
 withoutUGuides:replay(noUGuides,[{part:"H",target:3}]),
 trace:replay(d,route),directRoute:replay(d,[...removed,{part:"H",target:3}])
};
const c={stem:"study-20261013-v20-two-guide-walls",design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness};
fs.writeFileSync(path.join(OUT,"two-guide-wall-study.json"),JSON.stringify({format:"rotate-two-guide-wall-study",version:1,scope:"Distinct foreign-object wall roles of two supported U guides; no new gameplay",candidates:[c]},null,2));
console.log(JSON.stringify({stem:c.stem,inspection:c.inspection,witness}));

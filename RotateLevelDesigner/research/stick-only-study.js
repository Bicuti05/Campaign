"use strict";
const h=require("./ongoing-study.js"),fs=require("fs"),path=require("path"),{design,clone,inspect,probe,replay}=h,candidates=[];
{
 const d=design("Hai thanh L — đổi trục ở góc", "Nhóm nghiên cứu chỉ có thanh/ngàm, được gợi ý bởi quan hệ thanh dày ở ref_037 và các L riêng phía dưới ref_043. L đứng chặn lối trượt phải của L ngang; góc L ngang bị ngàm chặn khi kéo trái. Nâng L đứng một đoạn để đầu dưới ra khỏi đường ngang trong khi nó vẫn còn được ngàm giữ, kéo L ngang sang phải, rồi dọn L đứng. Góc L đứng chặn lối kéo xuống qua ngàm; bỏ từng nhánh gập thay hướng được phép. Mỗi thanh không nhận pin nên ngàm giữ thật. Không vòng/pin/bom/Chain/Booster; đây là thử cơ học với luật Designer có sẵn, chưa nghiệm thu đẹp/khó.",[],[
 {id:"V",shape:"L",x:3,y:-1,length:4,arm:2,angle:90,color:"blue",guides:[{x:3,y:0,angle:90}]},
 {id:"H",shape:"L",x:0,y:-1,length:4,arm:2,angle:0,color:"orange",guides:[{x:0,y:-1,angle:0}]}
 ]),i=inspect(d),noV=clone(d),straightV=clone(d),straightH=clone(d),noGuideV=clone(d),noGuideH=clone(d);noV.sticks.shift();straightV.sticks[0].shape="straight";delete straightV.sticks[0].arm;straightH.sticks[1].shape="straight";delete straightH.sticks[1].arm;delete noGuideV.sticks[0].guides;delete noGuideH.sticks[1].guides;noGuideV.sticks[0].slideAxis=[1,0];noGuideH.sticks[1].slideAxis=[1,0];
 const route=[{part:"V",target:2.2},{part:"H",target:3},{part:"V",target:3.2}];
 candidates.push({stem:"study-20261013-v15-orthogonal-l-corners",design:d,inspection:i,authorMoves:route,witness:{initialH:[-1,1].map(dir=>probe(d,"H",dir)),afterPartial:[-1,1].map(dir=>probe(d,"H",dir,[route[0]])),withoutV:[-1,1].map(dir=>probe(noV,"H",dir)),initialV:[-1,1].map(dir=>probe(d,"V",dir)),straightV:[-1,1].map(dir=>probe(straightV,"V",dir)),straightHAfterKey:[-1,1].map(dir=>probe(straightH,"H",dir,[route[0]])),trace:replay(d,route),withoutGuideV:replay(noGuideV,[{part:"H",target:3},{part:"H",target:3}]),withoutGuideH:replay(noGuideH,[route[0]])}});
}
{
 const d=design("U mở hai lối cho thanh — không vòng", "U quay xuống tạo hai thành ở hai phía thanh ngang. Ngàm trên một chân định trục dọc và giữ U; ngàm ngang giữ thanh thẳng. Nâng U để mở cả hai lối ngang; hạ U bị thân thanh chắn. Bỏ riêng U mở hai lối, bỏ riêng ngàm U làm U tự tháo sau lần thử ngang. Không thêm vòng để lấp bố cục; đây là family chỉ có thanh theo ref_037, chưa nghiệm thu đẹp/khó. Không pin/bom/Chain/Booster.",[],[
 {id:"U",shape:"U",x:0,y:0,length:4.4,arm:3,angle:180,color:"green",slideAxis:[0,1],guides:[{x:2.2,y:-1.5,angle:90}]},
 {id:"H",shape:"straight",x:0,y:-1,length:3.8,angle:0,color:"purple",guides:[{x:0,y:-1,angle:0}]}
 ]),i=inspect(d),noU=clone(d),noGuide=clone(d),noGuideH=clone(d);noU.sticks.shift();delete noGuide.sticks[0].guides;delete noGuideH.sticks[1].guides;
 // Canonical axis of U at angle 180 is world -Y. Negative offset lifts it.
 candidates.push({stem:"study-20261013-v15-stick-only-u-gate",design:d,inspection:i,witness:{initialH:[-1,1].map(dir=>probe(d,"H",dir)),afterLift:[-1,1].map(dir=>probe(d,"H",dir,[{part:"U",target:-2}])),withoutU:[-1,1].map(dir=>probe(noU,"H",dir)),uDirections:[-1,1].map(dir=>probe(d,"U",dir)),withGuideFirst:replay(d,[{part:"H",target:3}]),withoutGuideFirst:replay(noGuide,[{part:"H",target:3}]),withoutGuideH:replay(noGuideH,[{part:"U",target:-2}]),trace:i.solution?replay(d,i.solution.route.map(m=>({part:m.part,target:m.to}))):null}});
}
fs.writeFileSync(path.join(h.OUT,"stick-only-study.json"),JSON.stringify({format:"rotate-stick-only-study",version:1,scope:"Supported existing straight/L/U/guide mechanics; no new gameplay rule",candidates},null,2));for(const c of candidates)console.log(JSON.stringify(c));

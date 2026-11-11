"use strict";
const fs=require("fs"),path=require("path"),H=require("./ongoing-study.js");
const {RR,OUT,clone,design,build,inspect,probe,replay}=H;
const d=design("Bốn góc L — truyền khoảng trống rồi quay lại góc đầu",
 "Bốn L và bốn ngàm tạo cụm vuông với trục ngang/dọc xen kẽ. Trong các đường trượt đầu đã kiểm, không thanh nào rút hết theo hai phía. Dịch góc trên sang phải một đoạn, vẫn giữ cả bốn binding, làm góc trái có lối nâng lên. Nhả góc trái, góc dưới, góc phải rồi quay lại dọn góc trên. Có thể bắt đầu ở các góc khác; không có góc đầu duy nhất. Mỗi nhánh L vừa chọn hướng rút qua ngàm, vừa tham gia chặn thanh lân cận; bỏ riêng nhánh mở lối sớm. Đây là phụ thuộc do đường trượt/thân thanh, không link pin, Xích, bom hoặc Booster. Chưa nghiệm thu bố cục/độ khó.",[],[
 {id:"T",shape:"L",x:0,y:3,length:4,arm:1.7,angle:0,color:"orange",guides:[{x:0,y:3,angle:0}]},
 {id:"R",shape:"L",x:3,y:0,length:4,arm:1.7,angle:270,color:"blue",guides:[{x:3,y:0,angle:90}]},
 {id:"B",shape:"L",x:0,y:-3,length:4,arm:1.7,angle:180,color:"purple",guides:[{x:0,y:-3,angle:0}]},
 {id:"L",shape:"L",x:-3,y:0,length:4,arm:1.7,angle:90,color:"green",guides:[{x:-3,y:0,angle:90}]}
]);
const route=[{part:"T",target:.5},{part:"L",target:3},{part:"B",target:3},{part:"R",target:3},{part:"T",target:3}],b=build(d),sim=RR.Solver.newSim(b.level,false);
const roles=d.sticks.map((st,k)=>{
 const noBar=clone(d),noGuide=clone(d),noArm=clone(d);noBar.sticks.splice(k,1);delete noGuide.sticks[k].guides;noGuide.sticks[k].slideAxis=[1,0];noArm.sticks[k].shape="straight";delete noArm.sticks[k].arm;
 const neighbor={T:"L",R:"T",B:"R",L:"B"}[st.id];
 return {id:st.id,neighbor,afterPartial:probe(d,neighbor,1,[{part:st.id,target:.5}]),withoutBar:probe(noBar,neighbor,1),withoutGuide:replay(noGuide,[{part:st.id,target:.5}]),withoutArm:[-1,1].map(x=>probe(noArm,st.id,x))};
});
const witness={initialGuideEngaged:sim.world.guides.map((g,i)=>sim.world.guideEngaged(i)),initialMotion:d.sticks.flatMap(st=>[-1,1].map(x=>({id:st.id,...probe(d,st.id,x)}))),roles,trace:replay(d,route),feelTrace:replay(d,route,false,true),undoNeighbor:probe(d,"L",1,[{part:"T",target:.5},{part:"T",target:0}])};
const c={stem:"study-20261013-v21-four-l-corners",design:d,authorMoves:route,inspection:inspect(d,false,6,1000),witness};
fs.writeFileSync(path.join(OUT,"corner-cycle-study.json"),JSON.stringify({format:"rotate-corner-cycle-study",version:1,scope:"Four orthogonal L paths with a preparatory displacement and unchanged initial binding set",candidates:[c]},null,2));
console.log(JSON.stringify({stem:c.stem,inspection:c.inspection,witness}));

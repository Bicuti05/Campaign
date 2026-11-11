"use strict";
const h=require("./ongoing-study.js"),fs=require("fs"),path=require("path"),{ring,pin,design,clone,inspect,replay,probe}=h;
const R=2.8354,Q=3.9208,E=5.6708,candidates=[];
{
 const d=design("Ba tầng vòng lồng — nhả từ ngoài vào", "Nhóm lớn/nhỏ đã được GD mở riêng. Ba vòng đồng tâm radius 1,75/2,8354/3,9208. Vòng nhỏ gửi pin sang vành giữa, vành giữa gửi pin sang vành ngoài. Nhả vành ngoài để vành giữa được xoay, rồi nhả pin bên trong. Các tầng cùng một vùng, không thêm vật để phủ nền, không Chain/Booster. Bản nghiên cứu chưa nghiệm thu độ đọc hoặc độ khó.",[
  ring("I",0,0,180,"orange",[pin(0,"M")]),ring("M",0,0,270,"purple",[pin(90,"O")],{radius:R}),ring("O",0,0,180,"blue",[],{radius:Q})
 ]),i=inspect(d);
 candidates.push({stem:"study-20261013-v10-three-nested-layers",design:d,inspection:i,witness:{middleBefore:[-1,1].map(dir=>probe(d,"M",dir)),trace:i.solution?replay(d,i.solution.route.map(m=>({part:m.part,target:m.to}))):null}});
}
{
 const d=design("Vòng lớn nhận pin từ trong và ngoài", "Vòng lớn nhận một pin của vòng nhỏ đồng tâm và một pin từ nguồn ở phía trên. Xoay vành lớn qua từng cửa: một nguồn rời trước, vành lớn còn được nguồn kia giữ, rồi tiếp tục tới cửa còn lại. Radius 1,75 và 2,8354, nguồn trên cách 5,6708 theo hình học pin vào vòng lớn. Không thanh/ngàm/bom/Chain/Booster. Nhóm lớn/nhỏ đã được GD mở riêng; chưa nghiệm thu đẹp/khó.",[
  ring("I",0,0,180,"orange",[pin(0,"O")]),ring("O",0,0,225,"purple",[],{radius:R}),ring("T",0,E,90,"blue",[pin(270,"O")])
 ]),i=inspect(d);
 candidates.push({stem:"study-20261013-v10-inside-outside-junction",design:d,inspection:i,witness:{trace:i.solution?replay(d,i.solution.route.map(m=>({part:m.part,target:m.to}))):null}});
}
{
 const d=design("Hai pin cùng nguồn — cần cửa nhả rộng", "Vành giữa gửi hai pin cách nhau 90 độ vào cùng vành ngoài. Khóa ở mức vòng: nhả riêng một pin vẫn chưa làm nguồn rời, khe phải bao cả hai pin cùng lúc. Vành ngoài dùng khe logic 120 độ để mở cửa đồng thời; sau khi nó rời, xoay vành giữa để nhả pin nhỏ bên trong. Đối chứng khe 90 độ không có cửa nhả cả hai; bỏ một pin thì khe 90 độ giải được. Nhóm lớn/nhỏ đã được GD mở riêng; chỉ đây dùng khe 120 độ, không đổi tuning/rule/campaign, không Chain/Booster. Bản nghiên cứu chưa nghiệm thu đẹp/khó.",[
  ring("I",0,0,0,"orange",[pin(180,"M")]),ring("M",0,0,270,"purple",[pin(0,"O"),pin(90,"O")],{radius:R}),ring("O",0,0,270,"blue",[],{radius:Q,gap:120})
 ]),narrow=clone(d),single=clone(d);narrow.rings[2].gap=90;single.rings[2].gap=90;single.rings[1].pins.pop();const i=inspect(d),b=h.build(d),s=h.RR.Solver.newSim(b.level,false);
 candidates.push({stem:"study-20261013-v10-wide-two-pin-window",design:d,inspection:i,witness:{initialLinkCount:s.graph.active.filter(Boolean).length,narrowGap:inspect(narrow,false,2,500),singlePinNarrowGap:inspect(single),trace:i.solution?replay(d,i.solution.route.map(m=>({part:m.part,target:m.to}))):null}});
}
fs.writeFileSync(path.join(h.OUT,"nested-relations-study.json"),JSON.stringify({format:"rotate-nested-relations-study",version:1,scope:"Designer only, separate GD-authorized different-radius research group",candidates},null,2));for(const c of candidates)console.log(JSON.stringify(c));

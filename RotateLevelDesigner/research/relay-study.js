"use strict";
const h=require("./ongoing-study.js"),fs=require("fs"),path=require("path"),{P,D,ring,pin,design,inspect,replay,probe,clone}=h;
const candidates=[];
{
 const d=design("Vòng mang bom — chọn đúng phía phá", "Cụm trên có vòng phụ thuộc pin thường. Vòng dưới phải nhận pin từ trên và trái, mang bom ngoài vành bên phải. Quay CCW để bom phá vòng trên; quay CW nổ vào nguồn trái và mất bom, để lại cụm trên khóa. Bom nằm cạnh vòng mang nó trong cùng vùng 2 cột/3 hàng, không thanh kéo dài, ngàm, Chain hoặc Booster. Bom gameplay cần thiết; bản nghiên cứu chưa nghiệm thu đẹp/khó.",[
  ring("R1",0,0,135,"orange",[pin(0,"R2")]),ring("R2",P,0,45,"blue",[pin(270,"R4")]),
  ring("R3",0,-P,180,"purple",[pin(90,"R1"),pin(270,"R5")]),ring("R4",P,-P,45,"green",[pin(180,"R3"),pin(270,"R6")]),
  ring("R5",0,-2*P,180,"teal",[pin(0,"R6")]),ring("R6",P,-2*P,270,"red",[],{bomb:{x:P+2.2,y:-2*P,radius:.45}})
 ]);
 const i=inspect(d,true,6,1400),n=clone(d);delete n.rings[5].bomb;
 candidates.push({stem:"study-20261013-v7-ring-carried-bomb",design:d,bombs:true,inspection:i,witness:{withoutBomb:inspect(n,false,3,700),wrongFirst:replay(d,[{part:"R6",target:0}],true),correctFirst:replay(d,[{part:"R6",target:420}],true)}});
}
{
 const rings=[
  ring("A",0,0,135,"orange",[pin(0,"C"),pin(270,"D")]),ring("C",P,0,90,"purple"),
  ring("E",2*P,0,45,"teal",[pin(180,"C"),pin(270,"F")]),ring("D",0,-P,225,"blue"),
  ring("B",P,-P,270,"green",[pin(180,"D"),pin(90,"C"),pin(0,"F")]),ring("F",2*P,-P,315,"red")
 ];
 for(const r of rings){const x=r.x;r.x=r.y;r.y=-x;r.gapDir=(r.gapDir+270)%360;for(const p of r.pins)p.angle=(p.angle+270)%360;}
 const d=design("Ba cửa phối hợp — nguồn giữa giữ ba nơi", "Hai nguồn ngoài giữ mỗi nguồn hai cửa, nguồn giữa giữ cả ba cửa. Căn các cửa cùng nhả một nguồn để nó rời đi, rồi tiếp tục xử lý cửa còn lại. Bố cục hai cột/ba hàng, pin ngang/dọc, vòng cùng kích cỡ. Mở rộng ý tưởng hai cửa, kiểm khả năng phối hợp ba đích; không thêm special, Chain hoặc Booster. Bản nghiên cứu chưa nghiệm thu đẹp/khó.",rings),i=inspect(d,false,8,1800);
 candidates.push({stem:"study-20261013-v7-three-window-relay",design:d,inspection:i,witness:{routeTrace:i.solution?replay(d,i.solution.route.map(m=>({part:m.part,target:m.to}))):null,oneReceiverOnly:["C","D","F"].flatMap(id=>[-1,1].map(dir=>({id,...probe(d,id,dir)})))}});
}
fs.writeFileSync(path.join(h.OUT,"relay-study.json"),JSON.stringify({format:"rotate-relay-study",version:1,scope:"Designer engine only",candidates},null,2));
for(const c of candidates)console.log(JSON.stringify(c));

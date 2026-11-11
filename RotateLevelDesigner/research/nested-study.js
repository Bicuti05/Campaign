"use strict";
const h=require("./ongoing-study.js"),fs=require("fs"),path=require("path"),{P,D,ring,pin,design,clone,inspect,replay,probe}=h;
const R=2.8354,E=5.6708,candidates=[];
{
 const d=design("Vòng lồng — nhả nguồn ngoài trước", "Nhóm nghiên cứu lớn/nhỏ được GD mở riêng ngày 13/10. Vòng nhỏ giữ pin vào vành vòng lớn đồng tâm; vòng lớn còn giữ pin vào vòng phía trên nên chưa được xoay. Nhả vòng phía trên rồi xoay vòng lớn để nhả nguồn bên trong. Radius vòng nhỏ 1,75, vòng lớn 2,8354; không special, Chain hoặc Booster. Bản nghiên cứu chưa nghiệm thu bố cục/độ khó.",[
  ring("I",0,0,180,"orange",[pin(0,"O")]),ring("O",0,0,270,"purple",[pin(90,"T")],{radius:R}),ring("T",0,E,90,"blue")
 ]);
 candidates.push({stem:"study-20261013-v9-nested-source-relay",design:d,inspection:inspect(d),witness:{outerBefore:[-1,1].map(dir=>probe(d,"O",dir)),outerAfter:[-1,1].map(dir=>probe(d,"O",dir,[{part:"T",target:240}]))}});
}
{
 const d=design("Vòng lồng — rút thanh khỏi khe ngoài", "Nhóm lớn/nhỏ được GD mở riêng. Vòng nhỏ gửi một pin tới vành vòng lớn đồng tâm. Thanh ngang đi qua khe dưới của vòng lớn, cản cả hai đường quay. Một ngàm giữ thanh không nhận pin; rút thanh rồi xoay vòng ngoài để nhả vòng nhỏ. Không bom/Chain/Booster. Radius 1,75 và 2,8354; bản nghiên cứu chưa nghiệm thu đẹp/khó.",[
  ring("I",0,0,180,"orange",[pin(0,"O")]),ring("O",0,0,270,"purple",[],{radius:R})
 ],[{id:"S1",shape:"straight",length:5,x:0,y:-D,angle:0,color:"red",guides:[{x:0,y:-D,angle:0}]}]);
 const noBar=clone(d);noBar.sticks=[];const noGuide=clone(d);delete noGuide.sticks[0].guides;
 candidates.push({stem:"study-20261013-v9-nested-bar-gate",design:d,inspection:inspect(d),witness:{initial:[-1,1].map(dir=>probe(d,"O",dir)),afterPull:[-1,1].map(dir=>probe(d,"O",dir,[{part:"S1",target:3}])),withoutBar:[-1,1].map(dir=>probe(noBar,"O",dir)),withoutGuideFirstAttempt:replay(noGuide,[{part:"O",target:330}]),withGuideFirstAttempt:replay(d,[{part:"O",target:330}])}});
}
{
 const degrees=150,bx=1.25*Math.cos(degrees*Math.PI/180),by=1.25*Math.sin(degrees*Math.PI/180);
 const d=design("Vòng lồng kín — chốt đi qua khe vòng nhỏ", "Vòng lớn kín nhận pin từ vòng nhỏ bên trong và giữ pin tới vòng phía trên. Sau khi nhả vòng phía trên, quay vòng lớn một đoạn: chốt hướng vào trong đi qua khe trái của vòng nhỏ để chạm bom. Phá vòng lớn rồi nguồn nhỏ tự rời. Khe vòng nhỏ là hành lang của chốt, không phải quan hệ pin suy từ hình. Bỏ bom hoặc chốt không còn đường phá vòng kín. Bom gameplay cần thiết, không Booster/Chain. Nhóm lớn/nhỏ đã được GD mở riêng; chưa nghiệm thu đẹp/khó.",[
  ring("I",0,0,180,"orange",[pin(0,"O")]),ring("O",0,0,270,"purple",[pin(90,"T")],{radius:R,gap:0,stops:[{angle:180,length:-1.5}]}),ring("T",0,E,90,"blue")
 ],[],{bombs:[{x:bx,y:by,radius:.25}]}),noStop=clone(d),noBomb=clone(d);delete noStop.rings[1].stops;noBomb.bombs=[];
 candidates.push({stem:"study-20261013-v9-nested-closed-bomb",design:d,bombs:true,inspection:inspect(d,true,6),witness:{beforePreparation:[-1,1].map(dir=>probe(d,"O",dir,[],true)),withoutStop:inspect(noStop,true,2,500),withoutBomb:inspect(noBomb,false,2,500)}});
}
fs.writeFileSync(path.join(h.OUT,"nested-study.json"),JSON.stringify({format:"rotate-nested-study",version:1,scope:"Designer only; GD authorized separate large/small research group",candidates},null,2));
for(const c of candidates)console.log(JSON.stringify(c));

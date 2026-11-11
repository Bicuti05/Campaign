"use strict";
const h=require("./ongoing-study.js"),fs=require("fs"),path=require("path"),{D,ring,pin,design,clone,inspect,probe,replay}=h;
const R=2.8354,E=R+D,rows=[];let selected;
for(const width of [2.2,2.6,3])for(const arm of [3.2,3.4,3.8]){
 const d=design("U qua khe lớn — mở vùng trong trước", "Vòng lớn radius 2,8354 nhận pin từ hai nguồn bên trái/phải. Hai chân U đi qua khe dưới vào lòng vòng, làm cửa quay bị chặn hai phía. Kéo U xuống khỏi một ngàm trên chân không nhận pin để mở vòng, rồi nhả từng nguồn ngoài. U đi qua vùng hở, không bao toàn bộ cụm như khung V3. Ngàm giữ vật không có pin; không ngàm trên thanh đã được pin giữ, không bom/Chain/Booster. Nhóm lớn/nhỏ đã được GD mở riêng; chưa nghiệm thu đẹp/khó.",[
 ring("A",-E,0,180,"orange",[pin(0,"O")]),ring("B",E,0,0,"green",[pin(180,"O")]),ring("O",0,0,270,"purple",[],{radius:R})
 ],[{id:"U",shape:"U",x:0,y:-R-.65,length:width,arm,angle:0,color:"blue",slideAxis:[0,1],guides:[{x:-width/2,y:-1.2,angle:90}]}]);
 const b=h.build(d),s=h.RR.Solver.newSim(b.level,false),a=h.RR.analyze(b.level),guideEngaged=s.world.guides.every((g,i)=>s.world.guideEngaged(i));if(a.error||a.warnings.length||!guideEngaged){rows.push({parameters:{width,arm},analysis:a,guideEngaged});continue;}
 const before=[-1,1].map(dir=>probe(d,"O",dir)),bar=[-1,1].map(dir=>probe(d,"U",dir)),i=inspect(d,false,4);
 rows.push({parameters:{width,arm},analysis:a,guideEngaged,before,bar,solution:i.solution});if(!selected&&i.solution.found&&before.every(p=>!p.removed)&&bar[0].removed&&!bar[1].removed)selected={design:d,inspection:i};
}
const candidates=[];if(selected){const {design:d,inspection:i}=selected,without=clone(d),noGuide=clone(d),noRight=clone(d);without.sticks=[];delete noGuide.sticks[0].guides;const u=noRight.sticks[0];u.path=[[-u.length/2,u.arm],[-u.length/2,0],[u.length/2,0]];
 candidates.push({stem:"study-20261013-v14-u-in-large-gap",design:d,inspection:i,witness:{initial:[-1,1].map(dir=>probe(d,"O",dir)),afterPull:[-1,1].map(dir=>probe(d,"O",dir,[{part:"U",target:-2}])),withoutU:[-1,1].map(dir=>probe(without,"O",dir)),barDirections:[-1,1].map(dir=>probe(d,"U",dir)),withoutRightArm:[-1,1].map(dir=>probe(noRight,"O",dir)),withGuideFirstAttempt:replay(d,[{part:"O",target:330}]),withoutGuideFirstAttempt:replay(noGuide,[{part:"O",target:330}]),trace:replay(d,i.solution.route.map(m=>({part:m.part,target:m.to})))}});
}
fs.writeFileSync(path.join(h.OUT,"inside-u-study.json"),JSON.stringify({format:"rotate-inside-u-search",version:1,scope:"Joint placement of a guided U through a ring opening; approved mixed-radius group",rows,candidates},null,2));console.log(JSON.stringify({rows,candidates}));

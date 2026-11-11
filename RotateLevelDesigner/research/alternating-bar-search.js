"use strict";
const h=require("./ongoing-study.js"),fs=require("fs"),path=require("path"),{P,D,ring,pin,design,inspect,probe,replay,clone}=h;
const rows=[];let selected=null;
for(const length of [5.6,6,6.4])for(const stopLength of [2,2.4,2.8]){
 const d=design("Trượt một đoạn, nhả nguồn rồi đổi phía", "Hai vòng nguồn cùng giữ thanh ngang và vòng nhận ở phía trên. Hai chốt của nguồn chặn hai lối thoát dài của thanh. Dịch thanh một đoạn để nhả pin của một nguồn, nhưng nguồn ấy còn giữ vòng trên và chưa rời; căn khe vòng trên nhả cùng nguồn để chốt bên đó biến mất, rồi đưa thanh về phía vừa mở. Đây là đổi thao tác giữa thanh và vòng, không thêm ngàm lên thanh đã được hai pin giữ. Không bom/Chain/Booster; bản nghiên cứu chưa nghiệm thu bố cục/độ khó.",[
  ring("A",0,0,180,"orange",[pin(60,"C"),pin(270,"S")],{stops:[{angle:225,length:stopLength}]}),ring("B",P,0,0,"green",[pin(120,"C"),pin(270,"S")],{stops:[{angle:315,length:stopLength}]}),ring("C",P/2,P*Math.sqrt(3)/2,90,"purple")
 ],[{id:"S",shape:"straight",x:P/2,y:-D,length,angle:0,color:"blue"}]);
 const b=h.build(d),a=h.RR.analyze(b.level);if(a.error||a.warnings.length){rows.push({parameters:{length,stopLength},analysis:a});continue;}
 const i=inspect(d,false,4),before=[-1,1].map(dir=>probe(d,"S",dir));
 const row={parameters:{length,stopLength},analysis:a,solution:i.solution,before};rows.push(row);
 if(!selected&&i.solution.found&&before.every(p=>!p.removed))selected={design:d,inspection:i};
}
const candidates=[];
if(selected){const {design:d,inspection:i}=selected,noStops=clone(d),noLeft=clone(d),noRight=clone(d);for(const r of noStops.rings)delete r.stops;delete noLeft.rings[0].stops;delete noRight.rings[1].stops;
 d.notes+=" Có thể căn khe vòng trên trước; không khẳng định thứ tự bắt đầu duy nhất. Proof minh họa trượt phải một đoạn rồi nhả nguồn trái và trượt ngược lại.";
 candidates.push({stem:"study-20261013-v13-alternating-bar-and-window",design:d,inspection:i,witness:{initialBar:[-1,1].map(dir=>probe(d,"S",dir)),withoutStops:[-1,1].map(dir=>probe(noStops,"S",dir)),withoutLeftStop:[-1,1].map(dir=>probe(noLeft,"S",dir)),withoutRightStop:[-1,1].map(dir=>probe(noRight,"S",dir)),trace:replay(d,i.solution.route.map(m=>({part:m.part,target:m.to}))),receiverFirst:replay(d,[{part:"C",target:270},{part:"S",target:.6},{part:"S",target:-.6}])}});
}
fs.writeFileSync(path.join(h.OUT,"alternating-bar-study.json"),JSON.stringify({format:"rotate-alternating-bar-search",version:1,scope:"Finite joint geometry and state dependency search; no aesthetic score",rows,candidates},null,2));console.log(JSON.stringify({rows,candidates}));

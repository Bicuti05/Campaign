"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),P=4.5854,out=path.join(__dirname,"20261013");
function d(gap,stop,length){return {format:"turp-design",version:1,levelId:"draft",name:"Vòng kín làm vách cho chốt quay",author:"Codex reference study 20261013",notes:"Vòng kín trên trái giữ vòng dưới trái và làm vật cản cho chốt trên vòng trên phải. Hai cặp pin dọc được nối bằng quan hệ chặn hình học. Đổi riêng vòng kín sang vòng hở hoặc bỏ chốt phải mở thêm hướng quay. Tháo vòng dưới trái cũng gỡ vách kín, cho phép xử lý cặp bên phải. Không ngàm, bom, Chain hoặc Booster. Bản nghiên cứu, chưa nghiệm thu đẹp/khó.",rings:[{id:"R1",x:0,y:0,radius:1.75,gap:0,gapDir:0,color:"purple",pins:[{angle:270,target:"R3"}]},{id:"R2",x:P,y:0,radius:1.75,gap:90,gapDir:gap,color:"orange",stops:[{angle:stop,length}]},{id:"R3",x:0,y:-P,radius:1.75,gap:90,gapDir:270,color:"green"},{id:"R4",x:P,y:-P,radius:1.75,gap:90,gapDir:270,color:"blue",pins:[{angle:90,target:"R2"}]}]};}
function probe(design,dir){const b=RR.Design.toLevel(design),s=RR.Solver.newSim(b.level,false),obj=s.indexOf(b.ids.R2),pointer=RR.Solver.explore(s,obj,dir);return {direction:dir,removed:s.isSolved(obj),pointerReached:Number.isNaN(pointer)?null:pointer};}
let attempts=0,selected=null;
outer:for(const gap of [45,90,135,225,270,315])for(const stop of [60,90,120,180,240,270,300])for(const length of [.6,1,1.4,2,3]){
 if(Math.abs(((stop-gap+540)%360)-180)<60)continue;
 attempts++;const design=d(gap,stop,length),a=RR.analyze(RR.Design.toLevel(design).level);if(a.error||a.warnings.length)continue;
 const closed=[-1,1].map(dir=>probe(design,dir));if(closed.some(x=>x.removed))continue;
 const open=JSON.parse(JSON.stringify(design));open.rings[0].gap=90;const oa=RR.analyze(RR.Design.toLevel(open).level);if(oa.error||oa.warnings.length)continue;
 const opened=[-1,1].map(dir=>probe(open,dir));if(!opened.some(x=>x.removed))continue;
 const noStop=JSON.parse(JSON.stringify(design));delete noStop.rings[1].stops;const without=[-1,1].map(dir=>probe(noStop,dir));if(!without.some(x=>x.removed))continue;
 const b=RR.Design.toLevel(design),solution=RR.Solver.find(b.level,{nodeLimit:800,timeLimitSeconds:5,explodeBombs:false});if(!solution.found)continue;
 selected={design,analysis:a,solution:{...solution,route:RR.Solver.describeRoute(b.level,solution.moves,false)},witness:{closed,opened,withoutStop:without},parameters:{gap,stop,length}};break outer;
}
const result={format:"rotate-closed-body-search",version:1,method:"Finite geometry enumeration with causal motion probes. Not a trained generator or beauty score.",attempts,selected};
fs.writeFileSync(path.join(out,"closed-body-search.json"),JSON.stringify(result,null,2));console.log(JSON.stringify(result));

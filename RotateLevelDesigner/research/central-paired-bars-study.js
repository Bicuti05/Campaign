"use strict";
// Authoring/research only; all bake, collision, gestures and serialization use the existing Designer.
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js"),{query}=require("./full-gesture-query.js"),checks=require("./production-batch-01-check.js"),release=require("./replay-until-release.js");
const OUT=path.join(__dirname,"20261014-central-paired-bars"),P=4.5854,D=2.8354,clone=x=>JSON.parse(JSON.stringify(x)),pin=(angle,target)=>({angle,target}),move=(part,target)=>({part,target});
const ring=(id,x,y,gapDir,color,pins=[],extra={})=>({id,x,y,radius:1.75,gap:90,gapDir,color,pins,...extra});
const design={format:"turp-design",version:1,levelId:"draft",name:"CPB-01 | Hai thanh giữa cụm giữ chung lõi",author:"Codex + GD / research",notes:"Hai thanh thẳng nằm giữa ba cột so le; cùng giữ nguồn kín C và giữ nguồn ở mỗi phía. Pin đi vào giữ SL/SR sau khi pin đi ra đã nhả, để còn lượt xoay thực. Phân biệt mở input và chừa đường cho attachment khi quay. Vòng radius1,75, thanh kích thước mặc định; không Guide/Stop/Bom/Chain/Booster. Chờ GD chơi thử/chỉnh bố cục và đánh giá thử thách; không tích hợp campaign.",rings:[
 ring("BL",0,-P,270,"blue"),ring("SL",0,0,180,"orange",[pin(0,"L"),pin(270,"BL")]),ring("TL",0,P,90,"purple",[pin(270,"SL")]),
 ring("BC",2*D,-P/2,270,"teal"),ring("C",2*D,P/2,0,"red",[pin(180,"L"),pin(0,"R"),pin(90,"TC"),pin(270,"BC")],{gap:0}),ring("TC",2*D,1.5*P,90,"navy"),
 ring("BR",4*D,0,270,"sky"),ring("SR",4*D,P,0,"green",[pin(180,"R"),pin(270,"BR")]),ring("TR",4*D,2*P,90,"purple",[pin(270,"SR")])
],sticks:[{id:"L",shape:"straight",x:D,y:P/2,angle:90,color:"green"},{id:"R",shape:"straight",x:3*D,y:P/2,angle:90,color:"blue"}]};
const route=[move("L",.8),move("BL",90),move("SL",90),move("R",-.8),move("BR",90),move("SR",90),move("TC",270),move("BC",90),move("L",4),move("R",-4)];
const probes=[[],[move("L",.8),move("BL",90),move("SL",90)],[move("R",-.8),move("BR",90),move("SR",90)],[move("L",4)],[move("R",-4)]];
const candidate={stem:"study-20261014-central-paired-bars-01",design,authorMoves:route,bombs:false,probes};
function prepare(){fs.mkdirSync(OUT,{recursive:true});const q=query(design,route).data,g=checks.geometry(checks.serialized(design)),b=RR.Design.toLevel(design),p=checks.proof(candidate,{design,runtime:JSON.parse(RR.json.stringify(b.level))});const evidence={format:"rotate-central-paired-bars-study",version:1,scope:"Existing Designer only; full body gesture until release",candidate,geometry:g,query:q,proof:p,probes:probes.map(moves=>({moves,data:query(design,moves).data}))};fs.writeFileSync(path.join(OUT,"initial-study.json"),JSON.stringify(evidence,null,2));fs.writeFileSync(path.join(OUT,"candidate.rrdesign.json"),JSON.stringify(design,null,2),{flag:"wx"});console.log(JSON.stringify({geometry:g.ok,analysis:g.analysis,analytic:p.analytic,feel:p.feel,fullRelease:p.release.ok,trace:q.trace,poses:q.poses}));}
if(require.main===module)prepare();
module.exports={RR,OUT,candidate,design,route,probes,clone,move,query,checks,release};

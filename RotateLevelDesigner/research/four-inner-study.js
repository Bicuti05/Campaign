"use strict";
const h=require("./ongoing-study.js"),fs=require("fs"),path=require("path"),{P,D,ring,pin,design,clone,inspect,replay,probe}=h;
const LARGE=P/Math.SQRT2+D,TOP=LARGE+D,candidates=[];
function children(){return [ring("TL",-P/2,P/2,0,"orange",[pin(135,"O")]),ring("TR",P/2,P/2,180,"green",[pin(45,"O")]),ring("BL",-P/2,-P/2,0,"blue",[pin(225,"O")]),ring("BR",P/2,-P/2,180,"red",[pin(315,"O")])];}
{
 const d=design("Vòng lớn bao bốn nguồn theo ô đều", "Nhóm lớn/nhỏ được GD mở riêng. Bốn vòng nhỏ cùng radius 1,75 và pitch 4,5854 nằm theo ô 2x2 trong vòng lớn radius tính từ đầu pin. Mỗi vòng nhỏ hướng pin ra ngoài, cùng giữ vòng lớn; khe nhỏ hướng vào hành lang ngang. Vòng ngoài khe logic 60 độ để các pin nhận ban đầu không nằm sát mép hở. Xoay vòng ngoài nhả từng nguồn rồi tiếp tục xử lý các nguồn còn lại. Không special/Booster/Chain. Đây là thử quan hệ vùng bao nhiều tâm nhỏ, chưa nghiệm thu đẹp/khó.",[...children(),ring("O",0,0,0,"purple",[],{radius:LARGE,gap:60})]);
 const i=inspect(d,false,6),route=i.solution&&i.solution.route.map(m=>({part:m.part,target:m.to}));
 candidates.push({stem:"study-20261013-v12-four-small-in-one-large",design:d,inspection:i,witness:{trace:route?replay(d,route):null,geometry:{smallPitch:P,parentRadius:LARGE,radialBandClearance:.5854}}});
}
{
 const d=design("Chốt qua hành lang giữa bốn vòng nhỏ", "Bốn nguồn nhỏ nằm trong vòng lớn kín. Vòng lớn còn giữ pin tới vòng trên, nên phải nhả vòng trên trước. Chốt hướng vào trong đi theo hành lang dọc giữa bốn vòng nhỏ và quét tới bom ở vùng trống phía trên. Hướng khe nhỏ quyết định khoảng trống cho chốt khi quay; giữ tâm/radius/pin rồi xoay riêng khe nhỏ là một đối chứng đường quét. Bom gameplay cần thiết, không Booster/Chain. Nhóm lớn/nhỏ được GD mở riêng; chưa nghiệm thu bố cục hoặc độ khó.",[...children(),ring("O",0,0,270,"purple",[pin(90,"T")],{radius:LARGE,gap:0,stops:[{angle:90,length:-5}]}),ring("T",0,TOP,90,"teal")],[],{bombs:[{x:1,y:4.9,radius:.35}]});
 const i=inspect(d,true,6),route=i.solution&&i.solution.route.map(m=>({part:m.part,target:m.to})),noStop=clone(d),noBomb=clone(d),radialGaps=clone(d);delete noStop.rings[4].stops;noBomb.bombs=[];[315,225,45,135].forEach((a,j)=>radialGaps.rings[j].gapDir=a);
 candidates.push({stem:"study-20261013-v12-bomb-through-inner-corridor",design:d,bombs:true,inspection:i,witness:{outerBefore:[-1,1].map(dir=>probe(d,"O",dir,[],true)),withoutStop:inspect(noStop,true,2,500),withoutBomb:inspect(noBomb,false,2,500),route:route?replay(d,route,true):null,radialGapSameRoute:route?replay(radialGaps,route,true):null,radialGapAnalysis:h.RR.analyze(h.build(radialGaps).level),geometry:{smallPitch:P,parentRadius:LARGE,topY:TOP}}});
}
fs.writeFileSync(path.join(h.OUT,"four-inner-study.json"),JSON.stringify({format:"rotate-four-inner-study",version:1,scope:"Designer only; approved large/small group",candidates},null,2));for(const c of candidates)console.log(JSON.stringify(c));

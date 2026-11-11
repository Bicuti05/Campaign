"use strict";
const h=require("./ongoing-study.js"),fs=require("fs"),path=require("path"),{ring,pin,design,clone,inspect,replay,probe}=h;
const BIG=4.5854,TOP=7.4208,candidates=[];
{
 const d=design("Một vòng lớn giữ hai vòng nhỏ", "Nhóm lớn/nhỏ đã được GD mở riêng. Hai vòng nhỏ radius 1,75 nằm cùng hàng bên trong vòng lớn radius 4,5854, khe nhỏ hướng vào khoảng giữa để hai thân không chồng. Pin hướng ra hai phía đối nhau giữ cùng vòng ngoài. Xoay vòng ngoài để nhả từng nguồn; sau cửa thứ nhất nó vẫn được nguồn còn lại giữ. Không special/Chain/Booster. Đây là quan hệ một vùng ngoài chứa nhiều tâm nhỏ, khác với mọi vòng đồng tâm; chưa nghiệm thu đẹp/khó.",[
  ring("L",-1.75,0,0,"orange",[pin(180,"O")]),ring("R",1.75,0,180,"green",[pin(0,"O")]),ring("O",0,0,90,"purple",[],{radius:BIG})
 ]),i=inspect(d);
 candidates.push({stem:"study-20261013-v11-two-small-in-one-large",design:d,inspection:i,witness:{trace:i.solution?replay(d,i.solution.route.map(m=>({part:m.part,target:m.to}))):null}});
}
{
 const d=design("Bom trong khoảng giữa các vòng nhỏ", "Hai vòng nhỏ nằm trong vòng lớn kín và giữ hai pin vào nó. Vòng lớn giữ pin tới vòng phía trên, nên phải nhả vòng trên trước. Chốt hướng vào vùng trống phía trên hai vòng nhỏ quét tới bom và phá vòng lớn. Bom ở trong vùng ngoài nhưng ngoài thân các vòng nhỏ, khác với chốt đi qua khe của một vòng nhỏ đồng tâm. Bom gameplay cần thiết; không Booster/Chain. Nhóm lớn/nhỏ đã được GD mở riêng, chưa nghiệm thu đẹp/khó.",[
  ring("L",-1.75,0,0,"orange",[pin(180,"O")]),ring("R",1.75,0,180,"green",[pin(0,"O")]),
  ring("O",0,0,270,"purple",[pin(90,"T")],{radius:BIG,gap:0,stops:[{angle:90,length:-2.8}]}),ring("T",0,TOP,90,"blue")
 ],[],{bombs:[{x:1,y:2.7,radius:.35}]}),noStop=clone(d),noBomb=clone(d);delete noStop.rings[2].stops;noBomb.bombs=[];
 candidates.push({stem:"study-20261013-v11-bomb-in-shared-space",design:d,bombs:true,inspection:inspect(d,true,6),witness:{outerBefore:[-1,1].map(dir=>probe(d,"O",dir,[],true)),withoutStop:inspect(noStop,true,2,500),withoutBomb:inspect(noBomb,false,2,500)}});
}
fs.writeFileSync(path.join(h.OUT,"multi-inner-study.json"),JSON.stringify({format:"rotate-multi-inner-study",version:1,scope:"Designer only; approved large/small group",candidates},null,2));for(const c of candidates)console.log(JSON.stringify(c));

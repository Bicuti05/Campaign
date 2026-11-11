'use strict';
const fs=require('fs'),path=require('path'),RR=require('../../rr-core.js');
const d={format:'turp-design',version:1,levelId:'010',name:'Level 10',author:'Codex / GD image 2026-10-26',notes:'Theo ảnh GD: vòng cam lớn bao cụm ba vòng, hai thanh L đối xứng và vòng xanh dưới. Xoay vòng bao để mở đường rút L; mở hai nhánh rồi quay về cụm giữa. Không Booster, Bom hoặc Chain.',rings:[
 {id:'R1',x:0,y:0,radius:1,gap:90,gapDir:270,color:'sky',pins:[{angle:146.309932474,length:Math.sqrt(13)-2.25,targets:['R2']},{angle:33.690067526,length:Math.sqrt(13)-2.25,targets:['R3']}]},
 {id:'R2',x:-3,y:2,radius:1,gap:90,gapDir:330,color:'teal',pins:[{angle:180,length:Math.sqrt(60)-4.25,targets:['R4']},{angle:90,length:1.75,targets:['S1']}]},
 {id:'R3',x:3,y:2,radius:1,gap:90,gapDir:210,color:'teal',pins:[{angle:0,length:Math.sqrt(60)-4.25,targets:['R4']},{angle:90,length:1.75,targets:['S2']}]},
 {id:'R4',x:0,y:0,radius:8,gap:65,gapDir:230,color:'orange',pins:[]},
 {id:'R5',x:0,y:-4.8,radius:1.5,gap:180,gapDir:270,color:'green',pins:[{angle:90,length:2.05,targets:['R1']}]}
],sticks:[
 {id:'S1',x:-3,y:5,angle:0,path:[[-1.5,0],[2.05,0],[2.05,-1.55]],slideAxis:[1,0],color:'purple',guides:[{x:-3,y:5,angle:0}]},
 {id:'S2',x:3,y:5,angle:0,path:[[1.5,0],[-2.05,0],[-2.05,-1.55]],slideAxis:[1,0],color:'red',guides:[{x:3,y:5,angle:0}]}
]};
for(let i=0;i<8;i++){const n=JSON.parse(RR.json.stringify(d));if(JSON.stringify(n)===JSON.stringify(d))break;Object.assign(d,n);}
if(require.main===module){const f=path.join(__dirname,'draft01.rrdesign.json');fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n',{flag:'wx'});console.log(f);}
module.exports=d;

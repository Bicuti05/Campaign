"use strict";
const fs=require('fs'),path=require('path'),{api,RR}=require('./turp-continue');
const OUT=path.join(__dirname,'20261015-turp-a018-01');fs.mkdirSync(OUT,{recursive:true});
const save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function author(rev='01'){
 const d={format:'turp-design',version:1,levelId:'draft',name:'A018 — Ba cửa trên cột giữa / TURP r'+rev,author:'Codex / TURP continuation',notes:'Đề xuất remake nguồn70009: giữ11 vòng và6 thanh nhưng dựng lại lưới dọc, nối nhánh thấp R2→R1 và R11→R8; ba cửa trung tâm dùng chung. Thanh L mới ngang/dọc và thanh nhận pin không thêm ngàm. Lời giải cần rút các cửa thanh rồi quay lại nguồn theo các pha; chứng cứ full gesture và ablation riêng, không lấy số drag làm độ khó. Chưa GD duyệt.',rings:[],sticks:[]};
 const specs=[['R1',0,-2,2.15,225],['R2',1,-2,1.75,315],['R3',-1,-1,1.75,135],['R4',0,1,2.15,340],['R5',1,2,1.75,225],['R6',-1,0,2.15,270,0],['R7',1,0,1.75,315],['R8',0,0,1.75,270],['R9',1,1,2.15,0,0],['R10',-1,1,1.75,90],['R11',0,-1,1.75,315]];
 for(const [id,x,y,radius,gapDir,gap=90]of specs)d.rings.push({id,x:x*4.9,y:y*4.9,radius,gapDir,gap,lockCount:0,pins:[],color:'blue'});
 const ring=id=>d.rings.find(r=>r.id===id);
 if(+rev>=2){ring('R8').gap=60;ring('R8').gapDir=225;}
 if(+rev===4){const coords={R8:[0,0],R7:[4.5854,0],R6:[-4.9854,0],R4:[0,4.9854],R10:[-4.9854,4.9854],R9:[4.5854,4.9854],R5:[4.5854,9.9708],R11:[0,-4.5854],R3:[-4.5854,-4.5854],R1:[0,-9.5708],R2:[4.9854,-9.5708]};for(const r of d.rings)[r.x,r.y]=coords[r.id];}
 if(+rev>=5){ring('R9').radius=1.75;ring('R4').gap=60;ring('R4').gapDir=315;}
 if(+rev>=6){ring('R7').gap=60;ring('R7').gapDir=270;}
 function link(a,b,id){a=ring(a);b=ring(b);const dx=b.x-a.x,dy=b.y-a.y;a.pins.push({id,angle:(Math.atan2(dy,dx)*180/Math.PI+360)%360,length:Math.hypot(dx,dy)-a.radius-.25-b.radius,target:b.id});}
 for(const [a,b]of [['R1','R11'],['R2','R1'],['R3','R11'],['R4','R10'],['R6','R8'],['R7','R8'],['R8','R4'],['R9','R5'],['R9',+rev>=5?'R4':'R7'],['R11','R8']])link(a,b,'to'+b);
 function bar(id,owner,angle,points,axis){const r=ring(owner),dx=Math.cos(angle*Math.PI/180)*(r.radius+1.0854),dy=Math.sin(angle*Math.PI/180)*(r.radius+1.0854);d.sticks.push({id,x:r.x+dx,y:r.y+dy,angle:0,path:points,slideAxis:axis,color:'red'});r.pins.push({id:'to'+id,angle,target:id});}
 bar('S1','R5',90,[[-1.6,0],[1.5,0],[1.5,1.5]],[1,0]);
 bar('S2','R7',0,[[0,-1.3],[0,1.3],[1.2,1.3]],[0,1]);
 if(+rev>=3){bar('S3','R3',180,[[0,-1.4],[0,1.4],[-1.4,1.4]],[0,1]);ring('R3').gap=60;ring('R3').gapDir=90;}
 else bar('S3','R3',270,[[-1.4,0],[1.4,0],[1.4,-1.4]],[1,0]);
 bar('S4','R2',90,[[-1.6,0],[1.8,0]],[1,0]);
 const top=ring('R10');d.sticks.push({id:'S5',x:top.x,y:top.y+2.0,angle:0,path:[[0,-2],[0,1.7]],guides:[{x:top.x,y:top.y+2.65,angle:90}],slideAxis:[0,1],color:'red'});
 bar('S6','R4',90,[[-1.3,0],[1.5,0],[1.5,1.4]],[1,0]);
 const {objs,E}=api.touchGraph(d),colors=new Map(),keys=api.PALETTE;
 function dfs(){if(colors.size===objs.length)return true;let i=-1,best=-1;for(let j=0;j<objs.length;j++)if(!colors.has(j)){const score=new Set([...E[j]].map(k=>colors.get(k)).filter(Boolean)).size*100+E[j].size;if(score>best){best=score;i=j;}}for(const c of keys.slice().sort((a,b)=>[...colors.values()].filter(x=>x===a).length-[...colors.values()].filter(x=>x===b).length)){if([...E[i]].some(j=>colors.has(j)&&api.dE(keys.indexOf(c),keys.indexOf(colors.get(j)))<40))continue;const r=ring(objs[i].id);if(r&&[...colors].some(([j,cj])=>cj===c&&ring(objs[j].id)&&ring(objs[j].id).radius!==r.radius))continue;colors.set(i,c);if(dfs())return true;colors.delete(i);}return false;}
 if(!dfs())throw Error('No palette assignment');objs.forEach((o,i)=>[...d.rings,...d.sticks].find(x=>x.id===o.id).color=colors.get(i));
 const stem='turp-A018-70009-shared-r'+rev;save(stem+'.rrdesign.json',d);const geometry={analysis:RR.analyze(RR.Design.toLevel(d).level),strict:api.OVL.check(d)};save(stem+'-geometry.json',geometry);console.log(JSON.stringify({stem,...geometry}));return {d,stem};
}
if(require.main===module)author(process.argv[2]||'01');module.exports={OUT,save,author};

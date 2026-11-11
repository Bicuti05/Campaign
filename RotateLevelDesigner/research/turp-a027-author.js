"use strict";
const fs=require('fs'),path=require('path'),{api,RR}=require('./turp-continue'),{color}=require('./turp-feedback-author');
const OUT=path.join(__dirname,'20261015-turp-a027-01');fs.mkdirSync(OUT,{recursive:true});const save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function author(rev='01'){
 const d={format:'turp-design',version:1,levelId:'draft',name:'A027 — U nối nguồn giữa và hai cửa đáy / TURP r'+rev,author:'Codex / TURP continuation',notes:'Remake10018: bỏ hai nguồn rìa R6/R7, nối R8 trực tiếp tới R4/R5; U bên trái dùng chung khe R4 và R1, liên hệ tầng trên với nguồn giữa. R9 kín giữ hai receiver đáy R3/R10; chúng còn nhận R1/R2, nên mở một nguồn chưa giải xong nhánh. R2 giữ R1 để quay lại; R5 nhận pinbar L thay nhánh cũ. Các L có ngàm mở đường quay thực. Không mang Stop cũ sang proposal khi chưa có đối chứng cho vị trí mới. Bố cục dọc/cardinal, không Bom/Booster/Xích; chưa GD duyệt.',rings:[],sticks:[]};
 for(const[id,x,y,radius,gapDir,gap]of [['R1',-2.45,4.9,1.75,180,90],['R2',2.45,4.9,1.75,0,90],['R3',-2.45,0,2.15,180,90],['R4',-2.45,9.8,1.75,180,90],['R5',2.45,9.8,2.15,270,90],['R8',0,14.7,1.75,90,90],['R9',0,-4.9,1.75,90,0],['R10',2.45,0,1.75,0,90]])d.rings.push({id,x,y,radius,gapDir,gap,lockCount:0,pins:[],color:'blue'});
 const ring=id=>d.rings.find(r=>r.id===id);function link(a,b){a=ring(a);b=ring(b);const dx=b.x-a.x,dy=b.y-a.y;a.pins.push({id:'to'+b.id,target:b.id,angle:(Math.atan2(dy,dx)*180/Math.PI+360)%360,length:Math.hypot(dx,dy)-a.radius-.25-b.radius});}
 const edges=[['R1','R3'],['R2','R1'],['R2','R10'],['R8','R4'],['R8','R5'],['R9','R3'],['R9','R10']];
 if(rev!=='01'){ring('R5').gapDir=180;edges[3]=['R4','R8'];edges.push(['R5','R2']);d.notes+=' Revision02+ thay R8→R4 bằng R4→R8 và thêm R5→R2: hai L trên receiver R8/R2 còn giữ pin sau khi mở đầu ra, tránh hai thanh chỉ cản nguồn không có lượt quay. Thay r01 về đề xuất, giữ nguyên bản lỗi.';}
 for(const[a,b]of edges)link(a,b);
 d.sticks.push({id:'S1',x:-6.05,y:4.9,angle:0,path:[[4.2,0],[0,0],[0,4.9],[4.2,4.9]],slideAxis:[1,0],guides:[{x:-5.1,y:4.9,angle:0},{x:-4.6,y:9.8,angle:0}],color:'red'});
 if(rev==='03'){d.sticks[0].guides[0].x=-4.6;d.sticks[0].guides[1].x=-5.1;d.notes+=' Revision03 hoán vị vị trí hai Guide dọc chân U: chân nguồn R4 giữ U tới pha cuối, chân receiver R1 kiểm riêng đường quay ở pha trượt. Thay r02 về đề xuất; cần đối chứng từng Guide.';}
 function gate(id,x,y,dx,dy){const vertical=dy!==0,ex=dx?Math.sign(dx)*1.3:1.3,ey=dx?-1.3:0;d.sticks.push({id,x,y,angle:0,path:[[0,0],[dx,dy],[dx+ex*(vertical?1:0),dy+ey*(vertical?0:1)]],slideAxis:vertical?[0,1]:[1,0],guides:[{x:x+dx*2.65/3.8,y:y+dy*2.65/3.8,angle:vertical?90:0}],color:'red'});}
 gate('S2',-2.45,0,-3.8,0);gate('S3',2.45,0,3.8,0);gate('S6',2.45,4.9,3.8,0);gate('S7',0,14.7,0,3.8);
 d.sticks.push({id:'S4',x:5.6854,y:9.8,angle:0,path:[[0,-1.4],[0,1.4],[1.3,1.4]],slideAxis:[0,1],color:'red'});ring('R5').pins.push({id:'sideBar',angle:0,target:'S4',length:5.6854-2.45-2.15-.25});
 color(d);const stem='turp-A027-10018-shared-middle-U-r'+rev;save(stem+'.rrdesign.json',d);const geometry={analysis:RR.analyze(RR.Design.toLevel(d).level),strict:api.OVL.check(d)};save(stem+'-geometry.json',geometry);console.log(JSON.stringify({stem,...geometry}));return{stem,d};
}
if(require.main===module)author(process.argv[2]||'01');module.exports={OUT,save,author};

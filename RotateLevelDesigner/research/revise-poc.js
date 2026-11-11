// Apply GD feedback to new design files only. No HTML, no core/campaign edits.
"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js");
const out=path.join(__dirname,"20261013"),levels=path.resolve(__dirname,"../levels");
const corrections=[
 {old:"divider-135",name:"Thanh ngang chia hai hàng — bỏ ngàm thừa",changes:[],note:"Giữ bố cục đã được GD đánh giá khá đẹp. Bỏ ngàm: hai pin trên đã giữ thanh và trục trượt được suy ra từ đoạn thanh. Thanh vẫn chặn hai hướng quay trực tiếp của vòng dưới phải; phải dịch thanh trước khi tháo cặp dưới."},
 {old:"corner-225",name:"Thanh L giữ biên trên–trái — pin xa khe",changes:[["R1",0],["R2",90]],axis:[1,0],note:"Bỏ ngàm thừa. Pin bên trái được giữ trên thân vòng, xa mép khe: R1 hướng khe 0°, R2 hướng khe 90°. Giữ hình học và liên kết ban đầu. Vòng dưới phải nhận hai pin từ hai hướng; lần lượt nhả pin để mở nguồn rồi trượt L lên."},
 {old:"frame-45",name:"Thanh U bao hai tầng vòng — pin xa khe",changes:[["R2",135]],axis:[0,1],note:"Bỏ ngàm thừa. Hai pin của R2 ở 0°/270°; hướng khe 135° đặt khe đối diện vùng có pin. U là nguồn chung của bốn pin; trượt xuống giải phóng hai tầng, rồi xử lý cặp phụ thuộc bên phải."}
];
const report={format:"rotate-gd-feedback-revision",version:1,feedback:["No new HTML; research and export to provided Designer only.","A guide that merely delays an already pin-held bar does not prove a meaningful puzzle role.","Owner pins should be visually grounded on the body, away from the gap edge, supported by reference geometry."],revisions:[]};
function delta(a,b){return Math.abs(((a-b+180)%360+360)%360-180);}
for(const correction of corrections){
 const stem="study-20261013-v2-"+correction.old;
 const design=JSON.parse(fs.readFileSync(path.join(levels,"study-20261013-"+correction.old+".rrdesign.json"),"utf8"));
 design.name=correction.name;design.notes=correction.note+" Bản nghiên cứu theo feedback GD, không Chain/bom/Booster; chưa nghiệm thu đẹp/khó.";
 for(const stick of design.sticks||[]){delete stick.guides;if(correction.axis)stick.slideAxis=correction.axis;}
 for(const [id,gap] of correction.changes)design.rings.find(r=>r.id===id).gapDir=gap;
 const file=path.join(levels,stem+".rrdesign.json");
 fs.writeFileSync(file,JSON.stringify(design,null,2),{flag:"wx"});
 const built=RR.Design.toLevel(design),a=RR.analyze(built.level);
 const pinMargins=design.rings.flatMap(r=>(r.pins||[]).map(p=>({owner:r.id,pinAngle:p.angle,gapDir:r.gapDir,logicMargin:delta(p.angle,r.gapDir)-(r.gap||90)/2,meshMargin:delta(p.angle,r.gapDir)-built.level.parts.find(x=>x.partId===built.ids[r.id]).meshGapDegrees/2})));
 report.revisions.push({stem,previous:"study-20261013-"+correction.old,error:a.error||null,warnings:a.warnings||[],pinMargins});
 console.log(stem,a.error||"OK",a.warnings.length,"warnings; min logic margin",Math.min(...pinMargins.map(p=>p.logicMargin)));
}
fs.writeFileSync(path.join(out,"gd-feedback-revision.json"),JSON.stringify(report,null,2));

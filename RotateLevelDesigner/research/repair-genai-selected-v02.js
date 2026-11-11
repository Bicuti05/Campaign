"use strict";
const fs=require("fs"),path=require("path"),RR=require("../rr-core.js");
const revision=process.argv[2]||"v03";
if(!/^v\d+$/.test(revision))throw Error("Invalid revision");
const root=path.resolve(__dirname,".."),out=path.join(__dirname,"20261015-genai-repair-"+revision);
const names=["24-rabbit","21-hen","23-house","27-windmill","31-helicopter"].filter(n=>!process.argv[3]||n===process.argv[3]);
if(fs.existsSync(out))throw Error("Existing revision audit");
for(const n of names)if(fs.existsSync(path.join(root,"levels","genai-"+n+"-"+revision+".rrdesign.json")))throw Error("Existing design");
fs.mkdirSync(out);
const report=[];
const at=(d,id)=>d.rings.concat(d.sticks).find(r=>r.id===id);
function positionFrom(a,r,deg){return {x:a.x+r*Math.cos(deg*Math.PI/180),y:a.y+r*Math.sin(deg*Math.PI/180)};}
function pin(d,from,to,angle){at(d,from).pins.push({angle,target:to});}
function shift(s,dx,dy){s.x+=dx;s.y+=dy;for(const g of s.guides||[]){g.x+=dx;g.y+=dy;}}
function endpointPin(d,owner,bar,angle,end){const r=at(d,owner),s=at(d,bar),p=positionFrom(r,r.radius+1.0854,angle),q=s.path[end];shift(s,p.x-s.x-q[0],p.y-s.y-q[1]);s.guides=[];pin(d,owner,bar,angle);}
for(const n of names){
 const source="genai-reference-"+n+"-v01.rrdesign.json",file="genai-"+n+"-"+revision+".rrdesign.json",d=JSON.parse(fs.readFileSync(path.join(root,"levels",source),"utf8"));
 for(const r of d.rings){r.pins=[];delete r.bomb;}for(const s of d.sticks)delete s.bomb;
 const changes=["Removed picture-only hosted Bomb: no demonstrated causal role; preserves the drawing concept without inventing an arm/collider mechanic.","Rebuilt all retained links as standard native pins; explicit native geometry, no hand-written runtime."];
 if(n==="24-rabbit"){
  const a=at(d,"R2"),b=at(d,"R3"),nose=at(d,"R4"),spacing=a.radius+1.0854+b.radius;
  a.x=-spacing/2;b.x=spacing/2;a.y=at(d,"R1").y+Math.sqrt((at(d,"R1").radius-(a.radius+1.0854))**2-a.x**2);b.y=a.y;a.gapDir=200;b.gapDir=90;at(d,"R1").gapDir=70;
  nose.x=0;nose.y=a.y-Math.sqrt((a.radius+1.0854+nose.radius)**2-a.x**2);nose.gapDir=270;
  pin(d,"R2","R3",0);pin(d,"R2","R4",((Math.atan2(nose.y-a.y,nose.x-a.x)*180/Math.PI)+360)%360);
  pin(d,"R2","R1",Math.atan2(a.y-at(d,"R1").y,a.x-at(d,"R1").x)*180/Math.PI);
  shift(at(d,"S7"),0,nose.y-1.8-at(d,"S7").y);
  changes.push("Eyes moved closer/up by native pin reach; nose/tooth shifted up. Eye/nose gaps turned onto material-safe owner/target sectors. Inner left eye owns the outward pin into outer face instead of an impossible inward outer-face tab. Face gap turned slightly toward upper-right.");
 }
 if(n==="21-hen"){
  const body=at(d,"R1"),head=at(d,"R2"),eye=at(d,"R3"),a=Math.atan2(head.y-body.y,head.x-body.x)*180/Math.PI;
  Object.assign(head,positionFrom(body,body.radius+1.0854+head.radius,a));
  eye.x=head.x-(head.radius-(eye.radius+1.0854));eye.y=head.y;
  pin(d,"R1","R2",a);pin(d,"R3","R2",180);
  changes.push("Head separated from body to native contact spacing. Inner eye owns the outward pin into the head instead of a head pin reaching inward; head can rotate to release eye then body.");
 }
 if(n==="23-house"){
  const a=at(d,"R1"),b=at(d,"R2"),deg=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  Object.assign(b,positionFrom(a,a.radius+1.0854+b.radius,deg));pin(d,"R1","R2",deg);
  const l=at(d,"R3"),r=at(d,"R4"),spacing=l.radius+1.0854+r.radius;l.x=-spacing/2;r.x=spacing/2;pin(d,"R3","R4",0);
  if(revision!=="v03") {const door=at(d,"S6");door.slideAxis=[0,1];door.guides=[{x:door.x+door.path[0][0],y:door.y+(door.path[0][1]+door.path[1][1])/2,angle:90}];}
  changes.push("Smoke pair separated to native pin spacing. Removed detached chimney tab crossing owner gap. Windows closer together so their bridge actually engages; source whole house shape retained.");
 }
 if(n==="27-windmill"){
  const blade=at(d,"S4");blade.path=blade.path.map(([x,y])=>[y,-x]);blade.slideAxis=[Math.cos(45*Math.PI/180),Math.sin(45*Math.PI/180)];
  endpointPin(d,"R1","S4",135,0);
  changes.push("Upper-left blade turns tangentially to match the native pin passage, moved to pin endpoint; redundant Guide removed. Other blade/tower/ground Guides retained.");
 }
 if(n==="31-helicopter"){
  const body=at(d,"R1"),window=at(d,"R2");window.y=body.y;window.x=body.x-(body.radius-(window.radius+1.0854));pin(d,"R2","R1",180);
  // Keep tail boom fixed; translate tail rotor until its pin meets boom endpoint.
  const tail=at(d,"R3"),boom=at(d,"S1"),q=boom.path[1],a=277.3*Math.PI/180,dist=tail.radius+1.0854;
  tail.x=boom.x+q[0]-dist*Math.cos(a);tail.y=boom.y+q[1]-dist*Math.sin(a);boom.guides=[];pin(d,"R3","S1",277.3);
  changes.push("Window shifted left and owns the native pin into outer cabin. Tail rotor aligned to boom endpoint; boom's redundant Guide removed.");
 }
 d.name=d.name.replace(" · THAM KHẢO v01"," · "+revision+" sửa liên kết");
 d.notes="Revision "+revision+" theo yêu cầu sửa dữ liệu hợp lệ và giải được; thay đề xuất v01/v02, giữ bản cũ nguyên. "+changes.join(" ")+" Các thanh tạo hình vẫn là vật gameplay; không có Bom/Chain/Booster. Kiểm chứng thực tại research/20261015-genai-repair-"+revision+". Không tự nhập campaign. Visual và độ khó chưa nghiệm thu.";
 fs.writeFileSync(path.join(root,"levels",file),JSON.stringify(d,null,2)+"\n",{flag:"wx"});
 const b=RR.Design.toLevel(d),analysis=RR.analyze(b.level),sim=new RR.Simulation(b.level);
 const margins=d.rings.flatMap(r=>r.pins.map(p=>({owner:r.id,target:p.target,margin:Math.abs(((p.angle-r.gapDir+540)%360)-180)-r.gap/2})));
 report.push({name:n,source,file,changes,warnings:analysis.warnings,links:sim.graph.active.slice(),bindings:sim.graph.bindingActive.slice(),margins,validation:RR.validate(b.level)});
}
fs.writeFileSync(path.join(out,"repair-geometry.json"),JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(report.map(({changes,...r})=>r),null,2));

"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),RR=require("../rr-core.js");
const root=path.resolve(__dirname,".."),rev=process.argv[2]||"v01",only=process.argv[3];
if(!/^v\d+$/.test(rev))throw Error("Invalid revision");
const out=path.join(__dirname,"20261015-genai-part3-"+rev);
if(fs.existsSync(out))throw Error("Existing revision directory");fs.mkdirSync(out);
const source=fs.readFileSync(path.join(root,"Gen AI/turp_creative_levels_part3.json")),data=JSON.parse(source);
const palette={red:"#e0403a",orange:"#ef8c2b",yellow:"#f2c230",green:"#63c13d",dkgreen:"#1fa060",blue:"#4a6fe0",cyan:"#2eaadc",purple:"#9b4ddc"};
const slug={32:"peacock",33:"ferris-wheel",34:"birthday-cake",35:"castle",36:"stegosaurus"};
function write(f,v){fs.writeFileSync(path.join(out,f),typeof v==="string"||Buffer.isBuffer(v)?v:JSON.stringify(v,null,2)+"\n",{flag:"wx"});}
function r(d,id){return d.rings.concat(d.sticks).find(x=>x.id===id);}
function angle(a,b){return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;}
function point(a,dist,deg){return {x:a.x+dist*Math.cos(deg*Math.PI/180),y:a.y+dist*Math.sin(deg*Math.PI/180)};}
function pin(d,a,b,deg){r(d,a).pins.push({angle:(deg%360+360)%360,target:b});}
function pair(d,a,b){const p=r(d,a),q=r(d,b),deg=angle(p,q);Object.assign(q,point(p,p.radius+1.0854+q.radius,deg));pin(d,a,b,deg);}
function guideOnLeg(s){s.slideAxis=[0,1];s.guides=[{x:s.x+s.path[0][0],y:s.y+(s.path[0][1]+s.path[1][1])/2,angle:90}];}
function poly(s,pts,axis){const center=pts[0];s.x=center.x;s.y=center.y;s.path=pts.map(p=>[p.x-center.x,p.y-center.y]);s.slideAxis=axis;s.guides=[];}
const html=fs.readFileSync(path.join(root,"Gen AI/turp_part3_preview.html"),"utf8"),reports=[];
write("source-part3.json",source);
for(const l of data.levels.filter(x=>!only||only.split(",").includes(String(x.id)))){
 const unit=l.id===33?22:16,xy=(x,y)=>({x:(x-300)/unit,y:(300-y)/unit}),d={format:"turp-design",version:1,levelId:"draft",name:"GenAI · "+l.name_vi+" · "+rev,author:"User Gen AI part3; native Designer repair",notes:"",rings:[],sticks:[]},changes=[];
 for(const q of l.rings){let radius=q.r/unit;if(radius<.8){changes.push(q.id+" enlarged from "+radius+" to .85 units to make the small eye/flame legible with native authoring geometry.");radius=.85;}d.rings.push({id:q.id,...xy(q.cx,q.cy),radius,gap:q.gapSize,gapDir:(360-q.gapAngle%360)%360,color:palette[q.color],pins:[]});}
 for(const q of l.sticks){const origin=q.guide||{x:q.points[0][0],y:q.points[0][1]},p=xy(origin.x,origin.y),a=-q.slideAxis*Math.PI/180;d.sticks.push({id:q.id,...p,angle:0,path:q.points.map(v=>[(v[0]-origin.x)/unit,-(v[1]-origin.y)/unit]),slideAxis:[Math.cos(a),Math.sin(a)],color:palette[q.color],guides:q.guide?[{...xy(q.guide.x,q.guide.y),angle:(360-q.guide.angle%360)%360}]:[]});}
 changes.push("Removed unproven picture-only Bomb and drawing arms; no Booster/Chain. Native .5-unit tube, pins and complete Guides only. Drawing tabs replaced by real engaged joints.");
 if(l.id===32){
  for(const [a,b] of [["R4","R5"],["R6","R7"],["R8","R9"],["R10","R11"]])pair(d,a,b);
  const body=r(d,"R1"),head=r(d,"R2"),crest=r(d,"R3");head.gapDir=0;Object.assign(body,point(head,body.radius+1.0854+head.radius,270));pin(d,"R1","R2",90);
  const p=point(head,head.radius+1.0854,90),q=point(crest,crest.radius+1.0854,270),neck=r(d,"S1");
  poly(neck,[{x:p.x-.8,y:p.y},{x:p.x+.8,y:p.y},{x:q.x+.8,y:q.y},{x:q.x-.8,y:q.y}],[1,0]);pin(d,"R2","S1",90);pin(d,"R3","S1",270);
  if(rev!=="v01") {const s=r(d,"S4"),a=135*Math.PI/180;s.angle=135;s.path=s.path.map(([x,y])=>[x*Math.cos(a)+y*Math.sin(a),-x*Math.sin(a)+y*Math.cos(a)]);s.slideAxis=[1,0];changes.push("Feather S4 uses its own aligned local frame: same world geometry, stable offset direction after canonical numeric serialization; avoids the exact diagonal x/y dominance tie. No engine/tolerance edits.");}
  changes.push("Feather eyes pair along fan arc at native spacing. Body/head spacing fixed; stepped neck has two parallel native pin passages, no redundant Guide. Head rotation releases body after neck withdrawal.");
 }
 if(l.id===33){
  const wheel=r(d,"R1"),hub=r(d,"R2");
  for(let i=3;i<=10;i++){const id="R"+i,c=r(d,id),a=angle(wheel,c);Object.assign(c,point(wheel,wheel.radius+1.0854+c.radius,a));if(i===8||i===9){c.gapDir=(a+360)%360;pin(d,id,"R1",a+180);}else{c.gapDir=(a+90+360)%360;pin(d,"R1",id,a);}}
  const p=point(hub,hub.radius+1.0854,0),spoke=r(d,"S1"),half=rev==="v01"?.7:1.3;poly(spoke,[{x:p.x,y:p.y-half},{x:p.x,y:p.y+half}],[0,1]);pin(d,"R2","S1",0);
  changes.push("Wheel 7.5-unit radius uses uniform22px/unit; all cabins at exact native spacing, openings moved onto material-safe directions. Two top cabins own inward pins away from wheel gap. One short tangential hub strut replaces a radial shaft that disagreed with native passage; seven radial spokes remain.");
 }
 if(l.id===34){
  const a=r(d,"R1"),b=r(d,"R2"),c=r(d,"R3"),dist=a.radius+1.0854+b.radius;a.x=-dist;b.x=0;c.x=dist;pin(d,"R1","R2",0);pin(d,"R2","R3",0);
  for(const [ri,si] of [["R1","S5"],["R2","S6"],["R3","S7"]]){const candle=r(d,si),dx=r(d,ri).x-candle.x;candle.x+=dx;for(const g of candle.guides)g.x+=dx;}
  for(const ids of [["R4","R5","R6","R7"],["R8","R9","R10"]]){const middle=ids.map(id=>r(d,id)).reduce((s,p)=>s+p.x,0)/ids.length,span=r(d,ids[0]).radius*2+1.0854;ids.forEach((id,i)=>{r(d,id).x=middle+(i-(ids.length-1)/2)*span;});for(let i=0;i<ids.length-1;i++)pin(d,ids[i],ids[i+1],0);}
  guideOnLeg(r(d,"S2"));guideOnLeg(r(d,"S3"));
  const top=r(d,"S4"),dot=r(d,"R11");dot.x=top.x+top.path[0][0]+dot.radius+1.0854;top.slideAxis=[0,1];top.guides=[];pin(d,"R11","S4",180);
  for(const [ri,si,sign] of [["R12","S8",1],["R13","S9",-1]]){const ring=r(d,ri),s=r(d,si),p=point(ring,ring.radius+1.0854,270),last={x:s.x+s.path.at(-1)[0],y:s.y+s.path.at(-1)[1]};if(rev!=="v01")ring.gapDir=90;poly(s,[p,{x:p.x+sign*1.2,y:p.y},last],[1,0]);pin(d,ri,si,270);}
  changes.push("Flames and icing rows use native ring chains; candles follow flame x positions. U tiers withdraw vertically from a leg passage; upper tier held by the green ring pin instead of redundant Guide. Balloon strings have horizontal neck segments at pin contacts and no redundant Guides.");
 }
 if(l.id===35){
  for(const [a,b] of [["R1","R2"],["R3","R4"]]){const p=r(d,a),q=r(d,b),mid=(p.y+q.y)/2,dist=p.radius+q.radius+1.0854;p.y=mid+dist/2;q.y=mid-dist/2;p.gapDir=0;pin(d,a,b,270);}
  const a=r(d,"R5"),b=r(d,"R6"),gate=r(d,"R7"),dist=a.radius+b.radius+1.0854;a.x=-dist/2;b.x=dist/2;a.gapDir=90;pin(d,"R5","R6",0);gate.y=a.y-Math.sqrt((a.radius+gate.radius+1.0854)**2-a.x**2);pin(d,"R5","R7",angle(a,gate));
  const flag=r(d,"R8"),pole=r(d,"S15");flag.x=pole.x+flag.radius+1.0854;pole.guides=[];pin(d,"R8","S15",180);
  changes.push("Tower windows move to native vertical spacing; middle pair and arch spacing fixed. Owner gap changed clear of pins. Flag/pole contact aligned and redundant pole Guide removed.");
 }
 if(l.id===36){
  const body=r(d,"R1"),head=r(d,"R2"),eye=r(d,"R3");body.gapDir=315;head.gapDir=270;const a=angle(body,head);Object.assign(head,point(body,body.radius+head.radius+1.0854,a));pin(d,"R1","R2",a);eye.x=head.x-(head.radius-(eye.radius+1.0854));eye.y=head.y;pin(d,"R3","R2",180);
  r(d,"R4").gapDir=180;if(rev!=="v01")r(d,"R5").gapDir=90;pair(d,"R4","R5");pair(d,"R5","R6");
  changes.push("Head moves to body pin reach and mouth gap moves away from incoming tab. Small eye owns outward pin into head. Body spot chain spacing/gaps corrected; radial back plates retain native Guides.");
 }
 const stem="genai-"+l.id+"-"+slug[l.id]+"-"+rev;
 d.notes="Part3 native repair of source ID "+l.id+". "+l.idea+" "+changes.join(" ")+" Figure silhouette is a design reference, not evidence of difficulty or necessary cross-object preparation for every bar. No campaign import. Validation/full-gesture evidence: research/20261015-genai-part3-"+rev+".";
 write(stem+".rrdesign.json",d);const report={stem,sourceId:l.id,name:l.name_vi,unit,changes};
 try{const b=RR.Design.toLevel(d),sim=new RR.Simulation(b.level),a=RR.analyze(b.level);Object.assign(report,{validation:RR.validate(b.level),warnings:a.warnings,links:sim.graph.active.slice(),bindings:sim.graph.bindingActive.slice(),margins:d.rings.flatMap(p=>p.pins.map(q=>({owner:p.id,target:q.target,margin:Math.abs(((q.angle-p.gapDir+540)%360)-180)-p.gap/2}))),ids:b.ids});write(stem+".svg",RR.Render.render({world:sim.world,level:b.level,width:650,labels:true,title:d.name}));}catch(e){report.error=e.message;}
 const card=html.split('<div class="card">').find(s=>s.includes('<h3>Level '+l.id+':'));if(card)write(stem+"-source.svg",card.match(/<svg[\s\S]*?<\/svg>/)[0]);reports.push(report);
}
write("authoring-audit.json",{sourceSha256:crypto.createHash("sha256").update(source).digest("hex"),createdAt:new Date().toISOString(),reports});console.log(JSON.stringify(reports.map(({changes,ids,...r})=>r),null,2));

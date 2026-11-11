"use strict";
// Reference authoring import only. Runtime geometry always comes from Design.toLevel / CLI.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const RR = require("../rr-core.js");
const root = path.resolve(__dirname, ".."), out = path.join(__dirname, "20261015-genai-selected");
const source = path.join(root, "Gen AI", "turp_creative_levels_part2.json");
const input = JSON.parse(fs.readFileSync(source, "utf8"));
const wanted = [[24,"rabbit"],[21,"hen"],[23,"house"],[27,"windmill"],[31,"helicopter"]];
const palette = {red:"#e0403a",orange:"#ef8c2b",yellow:"#f2c230",green:"#63c13d",dkgreen:"#1fa060",blue:"#4a6fe0",cyan:"#2eaadc",purple:"#9b4ddc"};
const scale = 1/16, xy = (x,y) => [(x-300)*scale,(300-y)*scale];
const neg = a => ((-a%360)+360)%360;
function save(file,value) { fs.writeFileSync(file,typeof value === "string" ? value : JSON.stringify(value,null,2)+"\n",{flag:"wx"}); }
const jobs = wanted.map(([id,slug]) => ({src:input.levels.find(l=>l.id===id),stem:"genai-reference-"+id+"-"+slug+"-v01"}));
for(const j of jobs) if(fs.existsSync(path.join(root,"levels",j.stem+".rrdesign.json"))) throw Error("Existing design: "+j.stem);
if(fs.existsSync(out)) throw Error("Existing research audit directory; choose a new revision");
fs.mkdirSync(out);
const manifest = {createdAt:new Date().toISOString(),status:"reference_drafts_not_mechanics_qualified",source:path.relative(root,source),sourceSha256:crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex"),scope:"Five depicted layouts only. No source scripts executed. No core/app/runtime collider edits. No Unity/campaign/save changes.",conversion:{units:"1 board unit = 16 source pixels; x=(px-300)/16; y=(300-py)/16",purpose:"Preserve relative centers, radii and polylines of the pictured characters. Not a default-size puzzle study.",angles:"clockwise screen -> counterclockwise world by negation",thickness:"Source body thickness 12px = .75 units; Designer uses its existing .5-unit tube. No collider override.",pins:"Source p1/p2 drawing tabs replaced by existing standard owner-radius-relative pins at source angles, with explicit declared target. Detached links and owner-gap conflicts retained as flagged reference evidence, not repaired or claimed working.",guides:"Source guide position and axis retained; native complete Designer guides baked. Source angle precision retained.",bombs:"Native hosted bombs at source coordinates; drawing armLength/armStart has no equivalent authoring field and is not added as a collider.",difficulty:"Source difficulty tags are unverified and not imported as evidence."},levels:[]};
const html=fs.readFileSync(path.join(root,"Gen AI","turp_part2_preview.html"),"utf8");
for(const {src:l,stem} of jobs) {
  const d={format:"turp-design",version:1,levelId:"draft",name:"GenAI · "+l.name_vi+" · THAM KHẢO v01",author:"User Gen AI reference; Codex format adapter",notes:"BẢN THAM KHẢO THEO ẢNH, CHƯA NGHIỆM THU GAMEPLAY. "+l.idea+" "+l.bomb_note+" Nguồn Gen AI part2, ID "+l.id+". Giữ bố cục/radius theo ảnh; pin và ngàm dùng builder chuẩn nên khác đoạn nối vẽ. Xem audit research/20261015-genai-selected. Không dùng làm campaign hay bằng chứng độ khó.",rings:[],sticks:[]};
  for(const r of l.rings) {const [x,y]=xy(r.cx,r.cy);d.rings.push({id:r.id,x,y,radius:r.r*scale,gap:r.gapSize,gapDir:neg(r.gapAngle),color:palette[r.color],pins:[]});}
  for(const s of l.sticks) {const origin=s.guide ? [s.guide.x,s.guide.y] : s.points[0], [x,y]=xy(...origin), a=-s.slideAxis*Math.PI/180;d.sticks.push({id:s.id,x,y,angle:0,path:s.points.map(p=>[(p[0]-origin[0])*scale,-(p[1]-origin[1])*scale]),slideAxis:[Math.cos(a),Math.sin(a)],color:palette[s.color],guides:s.guide?[{x,y,angle:neg(s.guide.angle)}]:[]});}
  const issues=[];
  for(const link of l.links) {const ring=d.rings.find(r=>r.id===link.from), angle=neg(link.angle), delta=Math.abs(((angle-ring.gapDir+540)%360)-180), margin=delta-ring.gap/2;ring.pins.push({angle,target:link.to});if(margin<45)issues.push({type:"owner_pin_margin_under_45",owner:ring.id,target:link.to,margin});}
  for(const b of l.bombs) {const host=d.rings.find(r=>r.id===b.attachedTo)||d.sticks.find(s=>s.id===b.attachedTo);if(!host)throw Error("Unknown bomb host");const [x,y]=xy(b.cx,b.cy);host.bomb={x,y,radius:b.r*scale};}
  const file=path.join(root,"levels",stem+".rrdesign.json");save(file,d);
  // Read the exact serialized authoring file, then bake with the existing builder.
  const baked=RR.Design.toLevel(JSON.parse(fs.readFileSync(file,"utf8"))), level=JSON.parse(RR.json.stringify(baked.level)), analysis=RR.analyze(level);
  const sim=new RR.Simulation(level), body=require("./pose-body-gesture-query.js");
  const geometry={validatorError:RR.validate(level),info:analysis.info,warnings:analysis.warnings,issues,links:sim.graph.active.slice(),bindings:sim.graph.bindingActive.slice(),bodies:Object.entries(baked.ids).map(([id,runtimeId])=>{const o=sim.indexOf(runtimeId);return {id,runtimeId,selectableBodyPoints:body.selectableBody(sim,o).length,movementLocked:sim.isMovementLocked(o)};})};
  const raw=body.legacy.query(d,[],true);geometry.initialBombContacts=raw.data.initialContacts;
  save(path.join(out,stem+"-geometry.json"),geometry);
  const world=RR.World.build(level,{lenient:true}),view=RR.Render.bounds(world);view.xMin-=1.6;view.xMax+=1.6;view.yMin-=1.6;view.yMax+=1.6;
  save(path.join(out,stem+".svg"),RR.Render.render({world,level,width:700,labels:true,view,title:d.name}));
  const mono=JSON.parse(JSON.stringify(level));for(const p of mono.parts)if(p.color)p.color=[.25,.25,.25,1];save(path.join(out,stem+"-mono.svg"),RR.Render.render({world:RR.World.build(mono,{lenient:true}),level:mono,width:700,labels:true,view,title:d.name+" · mono"}));
  const card=html.split('<div class="card">').find(s=>s.includes('<h3>Level '+l.id+':'));if(!card)throw Error("Source preview card missing");const svg=card.match(/<svg[\s\S]*?<\/svg>/)[0];save(path.join(out,stem+"-source.svg"),svg);
  manifest.levels.push({sourceId:l.id,name:l.name_vi,design:path.relative(root,file),audit:stem+"-geometry.json",sourceRings:l.rings.length,sourceSticks:l.sticks.length,sourceBombs:l.bombs.length,status:"reference_only_pending_gameplay_redesign",issues:issues.length,warnings:analysis.warnings.length});
}
save(path.join(out,"manifest.json"),manifest);
console.log(JSON.stringify(manifest.levels,null,2));

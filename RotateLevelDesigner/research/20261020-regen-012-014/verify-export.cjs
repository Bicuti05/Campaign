'use strict';
const {RR,G,fs,path,load,clone,play,overlaps}=require('./common.cjs'),{canonical}=require('./author.cjs'),near=require('../turp-color-near');
function assert(x,m){if(!x)throw Error(m);}
const rows=[];
for(const [id,rev]of[[12,3],[14,1]]){
 const pre='A'+String(id).padStart(3,'0'),d=load(pre+'-draft0'+rev+'.rrdesign.json'),b=RR.Design.toLevel(d),s=new RR.Simulation(b.level),w=s.world,a=RR.analyze(b.level),native=load(pre+'-native-draft0'+rev+'.json');
 assert(!a.error&&!a.warnings.length&&native.found,'Analysis/native '+id);
 const margins=d.rings.filter(r=>r.gap>0).flatMap(r=>(r.pins||[]).map(p=>({ring:r.id,pin:p.id,margin:Math.abs(RR.M.deltaAngle(r.gapDir,p.angle))-r.gap/2})));
 assert(margins.every(m=>m.margin>=45-1e-6),'Pin owner gap margin');
 const color=near(d),ovl=overlaps(w),guides=w.guides.map((g,i)=>({id:g.id,engaged:w.guideEngaged(i)}));
 assert(!color.near.length&&!color.sizeClash.length&&!ovl.length&&guides.every(g=>g.engaged),'Geometry/color');
 const palette=RR.Color.KEYS.map(k=>RR.Color.parse(k));assert(b.level.parts.every(p=>!['ring','stick'].includes(p.kind)||palette.some(c=>c.every((v,i)=>Math.abs(v-p.color[i])<1e-6))),'Palette');
 assert(b.level.parts.every(p=>!p.lockCount),'Chain');
 const select=Array.from({length:s.objectCount()},(_,i)=>({part:s.idOf(i),samples:G.selectableBody(s,i).length}));assert(select.every(x=>x.samples),'Body selectable');
 const contacts=[];for(let i=0;i<s.objectCount();i++){const pose=s.isStick(i)?s.offsetOf(i):s.angleOf(i);if(RR.W.bombSweep(w,i,pose,pose).contact)contacts.push(s.idOf(i));}assert(!contacts.length,'Initial contact');
 const moves=native.route.map(r=>({part:r.part,target:r.to+Math.sign(r.to-r.from)*(r.kind==='stick'?.2:6)})),defaultReplay=G.replay(b.level,moves,false,true),analyticReplay=G.replay(b.level,moves,false,false);
 assert(defaultReplay.ok&&analyticReplay.ok,'Full gesture route');
 const shapeLengths=d.sticks.map(st=>{const p=st.path||[[-st.length/2,0],[st.length/2,0],[st.length/2,st.arm]];return{part:st.id,lengths:p.slice(1).map((v,i)=>Math.hypot(v[0]-p[i][0],v[1]-p[i][1]))};});assert(shapeLengths.every(st=>st.lengths.every(n=>n>1.5)),'Arm length');
 let roles,phases;
 if(id===12){const no=clone(d);delete no.rings.find(r=>r.id==='R2').stops;
  roles={stop:{}};for(const target of[220,600]){const m=[{part:'R3',target}];roles.stop[target]={withStop:play(d,m).data,withoutStop:play(no,m).data};assert(!roles.stop[target].withStop.poses.R3.solved&&roles.stop[target].withoutStop.poses.R3.solved,'Stop both directions');}
  roles.stop.deepRepeat=play(d,[{part:'R3',target:600},{part:'R3',target:720},{part:'R3',target:220},{part:'R3',target:-200},{part:'R3',target:600}]).data;assert(!roles.stop.deepRepeat.poses.R3.solved,'Stop repeated');
  roles.stop.sourceOpened=play(d,[{part:'R3',target:600},{part:'R4',target:243},{part:'R3',target:600}]).data;assert(roles.stop.sourceOpened.poses.R3.solved,'Stop removal opens path');
  roles.stop.foot=b.level.parts.flatMap(p=>(p.stopPins||[]).map(sp=>{const r=w.rings.find(r=>r.id===p.partId),q=r.worldQuads[r.quadKind.indexOf(RR.KIND.STOP)],sorted=q.slice().sort((a,b)=>RR.M.len(RR.M.sub(a,r.center))-RR.M.len(RR.M.sub(b,r.center)));return{owner:p.partId,feature:sp.featureId,footSdf:sorted.slice(0,2).map(pt=>RR.M.arcSdf(r.arc,pt))};}));assert(roles.stop.foot.every(f=>f.footSdf.every(n=>n<0)),'Stop material attachment');
  const prefix=moves.filter(m=>m.part!=='slide_bar_1').slice(0,-1),noBar=clone(d);noBar.sticks=[];
  roles.bar={prefix,withBar:play(d,[...prefix,{part:'R7',target:120}]).data,withoutBar:play(noBar,[...prefix,{part:'R7',target:120}]).data};assert(!roles.bar.withBar.poses.R7.solved&&roles.bar.withoutBar.poses.R7.solved,'L bar directional role');
  const noGuide=clone(d);noGuide.sticks[0].guides=[];roles.guide={withoutGuideAnalysis:RR.analyze(RR.Design.toLevel(noGuide).level),meaning:'S1 has no pin; its initial engaged Guide is its only retaining binding. Removing it creates a free object.'};
  phases=[{name:'01-stop-held',moves:[{part:'R3',target:600}]},{name:'02-stop-source-open',moves:[{part:'R3',target:600},{part:'R4',target:243}]},{name:'03-return-R3',moves:[{part:'R3',target:600},{part:'R4',target:243},{part:'R3',target:600}]},{name:'04-lower-preparation',moves:moves.slice(0,5)}];
 }else{roles={L:{}};for(const part of['S1','S4']){const no=clone(d),st=no.sticks.find(s=>s.id===part);if(st.path)st.path.pop();else{delete st.shape;st.path=[[-st.length/2,0],[st.length/2,0]];delete st.length;delete st.arm;}
   const m=[{part,target:-5}];roles.L[part]={withArm:play(d,m).data,withoutArm:play(no,m).data,deepRepeat:play(d,[{part,target:-5},{part,target:-9},{part,target:-5}]).data,otherDirection:play(d,[{part,target:5}]).data};assert(!roles.L[part].withArm.poses[part].solved&&roles.L[part].withoutArm.poses[part].solved&&roles.L[part].otherDirection.poses[part].solved,'L direction role '+part);
  }
  const noGuide=clone(d);noGuide.sticks.find(s=>s.id==='S2').guides=[];roles.guide={withoutGuideAnalysis:RR.analyze(RR.Design.toLevel(noGuide).level),meaning:'The straight bar S2 is retained by its engaged Guide; without it the bar has no pin/binding.'};
  phases=[{name:'01-L-wrong-way',moves:[{part:'S1',target:-5}]},{name:'02-L-exit',moves:[{part:'S1',target:-5},{part:'S1',target:5}]},{name:'03-central-return',moves:moves.slice(0,10)}];
 }
 const checks={id,draft:rev,analysis:a,native,margins,color,bodyOverlaps:ovl,guides,select,initialBombContacts:contacts,shapeLengths,moves,defaultReplay,analyticReplay,roles,phases};
 fs.writeFileSync(path.join(__dirname,pre+'-checks01.json'),JSON.stringify(checks,null,2),{flag:'wx'});
 d.notes+=' Kiểm mô hình: native solve FOUND, không Booster/Bom; full pointer-target/release analytic và default feel hoàn tất. Không khẳng định route tối thiểu hoặc độ khó/đẹp. '+(id===12?'Stop chặn R3 theo cả hai hướng đã thử, bỏ riêng Stop hoặc giải R4/R2 thì lối mở. Giữ chuẩn bị R9→R6 rồi quay lại R9; đây là route đã thử, không tuyên bố mọi route đều bắt đầu bằng chuẩn bị.':'Bỏ riêng cánh mỗi L mở thêm hướng rút đã thử; giữ cánh thì phải chọn hướng còn lối. Không buộc người chơi rút theo một thứ tự duy nhất.');
 const stem=pre+'_20261020_r01';fs.writeFileSync(path.resolve(__dirname,'../../levels',stem+'.rrdesign.json'),canonical(d),{flag:'wx'});rows.push({id,stem,shapeLengths,minimumPinMargin:Math.min(...margins.map(m=>m.margin)),guideRoleWarnings:roles.guide.withoutGuideAnalysis.warnings,foot:id===12?roles.stop.foot:null});
}
console.log(JSON.stringify(rows,null,2));

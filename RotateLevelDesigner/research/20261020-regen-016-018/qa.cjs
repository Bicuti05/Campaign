'use strict';
const {RR,G,fs,path,clone,play,overlaps}=require('../20261020-regen-012-014/common.cjs');
const load=f=>JSON.parse(fs.readFileSync(path.resolve(__dirname,f),'utf8').replace(/^\uFEFF/,'')),save=(f,d)=>fs.writeFileSync(path.join(__dirname,f),JSON.stringify(d,null,2),{flag:'wx'}),assert=(v,m)=>{if(!v)throw Error(m);};
const rows=[];
for(const [id,rev]of[[16,5],[18,4]]){if(process.argv[2]&&+process.argv[2]!==id)continue;const pre='A0'+id,d=load(pre+'-draft0'+rev+'.rrdesign.json'),n=load(pre+'-native-draft0'+rev+'.json'),b=RR.Design.toLevel(d),s=new RR.Simulation(b.level),w=s.world,an=RR.analyze(b.level),colors=require('../turp-color-near')(d);assert(!an.error&&!an.warnings.length&&!colors.near.length&&!colors.sizeClash.length&&!overlaps(w).length,'Static '+id);
 const margins=d.rings.filter(r=>r.gap>0).flatMap(r=>(r.pins||[]).map(p=>({ring:r.id,pin:p.id,margin:Math.abs(RR.M.deltaAngle(r.gapDir,p.angle))-r.gap/2})));assert(margins.every(m=>m.margin>=45-1e-6),'Pin gap');
 let chosen;const trials=[];for(const re of[6,9,3,12,0]){for(const se of[.2,.3,.1,0]){const moves=n.route.map(r=>({part:r.part,target:r.to+Math.sign(r.to-r.from)*(r.kind==='stick'?se:re)})),out=G.replay(b.level,moves,false,true);trials.push({re,se,ok:out.ok,last:out.trace.at(-1)?.part,remaining:out.trace.at(-1)?.remaining});if(out.ok){chosen={moves,re,se,defaultReplay:out,analyticReplay:G.replay(b.level,moves,false,false)};break;}}if(chosen)break;}assert(chosen&&chosen.analyticReplay.ok,'Body gestures '+id);
 let roles,phases;
 if(id===16){const prep=[{part:'S2',target:.7},{part:'R6',target:174}],withPrep=play(d,prep),noPrep=play(d,[{part:'R6',target:174}]);assert(withPrep.data.poses.R2.solved&&!withPrep.data.poses.S2.solved&&!noPrep.data.poses.R2.solved,'Temporary move causal');
 const noGuide=clone(d);noGuide.sticks.find(s=>s.id==='S2').guides=[];const guideOff=play(noGuide,[{part:'S2',target:.7}]);assert(guideOff.data.poses.S2.solved,'Guide retains after pin release');
 const noFoot=clone(d);noFoot.sticks.find(s=>s.id==='S2').path.pop();const deep=play(d,[{part:'S2',target:5},{part:'S2',target:9}]),footOff=play(noFoot,[{part:'S2',target:5}]);assert(!deep.data.poses.S2.solved&&footOff.data.poses.S2.solved,'Foot blocks early extraction');
 const prefix=chosen.moves.slice(0,9),later=play(d,[...prefix,{part:'S2',target:3}]);assert(later.data.poses.S2.solved&&later.data.poses.R7.solved,'Return after R7');
 const noSource=clone(d);noSource.rings=noSource.rings.filter(r=>r.id!=='R7');const r7off=play(noSource,[{part:'S2',target:5}]);assert(r7off.data.poses.S2.solved,'Remove R7 opens exit');
 const s1off=clone(d);s1off.sticks[0].path.pop();const s1with=play(d,[{part:'S1',target:5}]),s1without=play(s1off,[{part:'S1',target:5}]);
 roles={withPreparation:withPrep.data,withoutPreparation:noPrep.data,guideRemoved:guideOff.data,deepRepeated:deep.data,armRemoved:footOff.data,R7Removed:r7off.data,returnLater:later.data,S1:{withArm:s1with.data,withoutArm:s1without.data,limit:'S1 body retains R3 via an active pin. Both variants meet the same other blocker in this tested direction; no independent causal claim for the S1 elbow.'},remainingLinksAfterPrep:withPrep.s.snapshot().links};
 phases=[{name:'01-temporary-slide',moves:prep.slice(0,1)},{name:'02-R2-open-bar-retained',moves:prep},{name:'03-before-return',moves:prefix},{name:'04-return-extract',moves:[...prefix,{part:'S2',target:3}]}];
 }else{roles={U:{}};const moves=chosen.moves;
 for(const [bar,ring,prefix,target,mid]of[
  ['S7','R7',moves.slice(0,moves.findIndex(m=>m.part==='ring_7')).filter(m=>m.part!=='slide_bar_1'),75,3.6],
  ['S8','R5',[],240,4],
  ['S9','R4',[],0,2.1]
 ]){const innerOff=clone(d);innerOff.sticks.find(s=>s.id===bar).guides.shift();const withGate=play(d,[...prefix,{part:ring,target}]),withoutGate=play(innerOff,[...prefix,{part:ring,target}]);
  const outerOff=clone(d);outerOff.sticks.find(s=>s.id===bar).guides.pop();const outerPrefix=bar==='S9'?[{part:'S11',target:3.3}]:[];const retained=play(d,[...outerPrefix,{part:bar,target:mid}]),outerGone=play(outerOff,[...outerPrefix,{part:bar,target:mid}]);
  const role={ring,prefix,target,withInnerGuide:withGate.data,withoutInnerGuide:withoutGate.data,outerPrefix,midTarget:mid,withOuterGuide:retained.data,withoutOuterGuide:outerGone.data,deepWrongDirection:play(d,[{part:bar,target:-6},{part:bar,target:-9}]).data};
  assert(!retained.data.poses[bar].solved&&outerGone.data.poses[bar].solved,'Outer Guide role '+bar);
  assert(!withGate.data.trace.at(-1)?.locked&&Math.abs(withGate.data.poses[ring].pose-withoutGate.data.poses[ring].pose)>10,'Inner Guide blocks ring '+bar);
  if(bar!=='S9')assert(!withGate.data.poses[ring].solved&&withoutGate.data.poses[ring].solved,'Inner opens removal '+bar);
  else{const key=b.ids.R9,other=b.ids.R4;role.withInnerGuideLinks=withGate.s.snapshot().links;role.withoutInnerGuideLinks=withoutGate.s.snapshot().links;assert(withGate.s.snapshot().links.some(l=>l.source===key&&l.target===other&&l.active)&&withoutGate.s.snapshot().links.some(l=>l.source===key&&l.target===other&&!l.active),'Inner releases R9→R4');}
  roles.U[bar]=role;
 }
 const noStraightGuide=clone(d);noStraightGuide.sticks.find(s=>s.id==='S11').guides=[];roles.straightGuide=RR.analyze(RR.Design.toLevel(noStraightGuide).level);assert(roles.straightGuide.warnings.some(w=>w.code==='free'),'Straight Guide');
 const noL=clone(d);const st=noL.sticks.find(s=>s.id==='S10');st.path=[[-st.length/2,0],[st.length/2,0]];delete st.shape;delete st.length;delete st.arm;roles.L={withArm:play(d,[{part:'S10',target:-5}]).data,withoutArm:play(noL,[{part:'S10',target:-5}]).data};
 phases=[{name:'01-U-outer-still-retained',moves:[{part:'S8',target:4}]},{name:'02-U-exit-ring-opening',moves:[{part:'S8',target:6.5},{part:'R5',target:240}]},{name:'03-inner-guide-held',moves:[{part:'R4',target:0}]},{name:'04-central-preparation',moves:moves.slice(0,14)}];
 }
 const jitter=[];for(let k=0;k<12;k++){const moves=chosen.moves.map((m,j)=>({...m,target:m.target+((k*7+j*3)%5-2)*(m.part.startsWith('ring')?1:.025)}));jitter.push({case:k,ok:G.replay(b.level,moves,false,true).ok});}
 const row={id,draft:rev,an,colors,margins,bodyOverlaps:overlaps(w),guides:w.guides.map((g,i)=>({id:g.id,engaged:w.guideEngaged(i)})),selectable:Array.from({length:s.objectCount()},(_,i)=>({part:s.idOf(i),samples:G.selectableBody(s,i).length})),trials,chosen,roles,phases,jitter};
 assert(row.guides.every(g=>g.engaged)&&row.selectable.every(o=>o.samples),'Initial selection/Guide');save(pre+'-checks01.json',row);rows.push({id,an,selected:{ringExtra:chosen.re,stickExtra:chosen.se},jitter:jitter.filter(x=>x.ok).length,roles:Object.keys(roles)});
}
console.log(JSON.stringify(rows,null,2));

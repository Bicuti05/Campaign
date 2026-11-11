'use strict';
const fs=require('fs'),path=require('path'),RR=require('../../rr-core'),G=require('../pose-body-gesture-query');
const load=f=>JSON.parse(fs.readFileSync(path.resolve(__dirname,f),'utf8').replace(/^\uFEFF/,''));
const clone=o=>JSON.parse(JSON.stringify(o));
function play(d,moves,feel=true){const b=RR.Design.toLevel(d),t=RR.Tuning.defaults();t.feelEnabled=feel;t.explodeBombs=false;const s=new RR.Simulation(b.level,t),trace=[];
 for(const m of moves){const o=s.indexOf(b.ids[m.part]||m.part);if(o<0)throw Error('Missing '+m.part);if(s.isSolved(o)){trace.push({...m,alreadySolved:true});continue;}const pts=G.selectableBody(s,o),grab=pts[Math.floor(pts.length/2)];if(!grab||s.isMovementLocked(o)){trace.push({...m,began:false,locked:s.isMovementLocked(o)});break;}const sdf=G.bodySdf(s,o,grab),from=s.isStick(o)?s.offsetOf(o):s.angleOf(o),a=G.release.apply(s,o,m.target,grab);trace.push({...m,from,grab,grabSdf:sdf,...a,pose:s.isStick(o)?s.offsetOf(o):s.angleOf(o),remaining:s.remaining()});}
 return {s,b,data:{solved:s.allSolved(),remaining:s.remaining(),trace,poses:Object.fromEntries(Object.entries(b.ids).filter(([,v])=>s.indexOf(v)>=0).map(([k,v])=>{const o=s.indexOf(v);return[k,{pose:s.isStick(o)?s.offsetOf(o):s.angleOf(o),solved:s.isSolved(o),locked:s.isMovementLocked(o)}];}))}};
}
function overlaps(w){const a=[...w.rings.map(r=>({id:r.id,r})),...w.sticks.map(s=>({id:s.id,s}))],bad=[];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const x=a[i],y=a[j];let g;if(x.r&&y.r)g=RR.M.arcArcDistance(x.r.arc,y.r.arc)-x.r.arc.tube-y.r.arc.tube;else if(x.s&&y.s)g=RR.M.chainDistanceToChain(x.s.centerline,RR.W.stickPose(x.s),y.s.centerline,RR.W.stickPose(y.s))-x.s.centerline.tube-y.s.centerline.tube;else{const s=x.s||y.s,r=x.r||y.r;g=RR.M.chainDistanceToArc(s.centerline,RR.W.stickPose(s),r.arc)-s.centerline.tube-r.arc.tube;}if(g<-.00001)bad.push({a:x.id,b:y.id,gap:g});}return bad;}
module.exports={RR,G,fs,path,load,clone,play,overlaps};

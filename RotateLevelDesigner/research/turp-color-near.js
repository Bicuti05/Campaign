"use strict";
// Research-only: same-colour pairs closer than thr (body-to-body gap, any rings/bars). Uses core geometry read-only.
const RR=require('../rr-core.js');
module.exports=function nearSameColor(d,thr=1.5){const b=RR.Design.toLevel(d),w=new RR.Simulation(b.level,RR.Tuning.defaults()).world,col={},rad={};
 for(const o of [...d.rings,...d.sticks]){col[b.ids[o.id]]=o.color;rad[b.ids[o.id]]=o.radius;}
 const objs=[...w.rings.map(r=>({id:r.id,ring:r})),...w.sticks.map(s=>({id:s.id,st:s}))],out=[],name=id=>Object.keys(b.ids).find(k=>b.ids[k]===id);
 const gap=(a,c)=>{if(a.ring&&c.ring)return RR.M.arcArcDistance(a.ring.arc,c.ring.arc)-a.ring.arc.tube-c.ring.arc.tube;if(a.st&&c.st)return RR.M.chainDistanceToChain(a.st.centerline,RR.W.stickPose(a.st),c.st.centerline,RR.W.stickPose(c.st))-a.st.centerline.tube-c.st.centerline.tube;const s=a.st||c.st,r=a.ring||c.ring;return RR.M.chainDistanceToArc(s.centerline,RR.W.stickPose(s),r.arc)-s.centerline.tube-r.arc.tube;};
 for(let i=0;i<objs.length;i++)for(let j=i+1;j<objs.length;j++){if(col[objs[i].id]!==col[objs[j].id])continue;const g=gap(objs[i],objs[j]);if(g<thr)out.push(name(objs[i].id)+'|'+name(objs[j].id)+':'+g.toFixed(2));}
 const sizeClash=d.rings.filter(r=>d.rings.some(o=>o.color===r.color&&o.radius!==r.radius)).map(r=>r.id);
 return {near:out,sizeClash};};

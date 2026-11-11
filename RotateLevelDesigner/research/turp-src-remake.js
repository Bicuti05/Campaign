"use strict";
// Research-only helpers for source-weighted TURP remakes (user feedback 16/10/2026): keep the source geometry,
// apply small transforms. Reads source designs read-only; never writes TURPLevel.
const RR=require('../rr-core.js');
const r4=v=>Math.round(v*1e4)/1e4,norm=a=>r4(((a%360)+360)%360);
const clone=o=>JSON.parse(JSON.stringify(o));
function load(file){const d=clone(require(file));delete d._notes;d.format='turp-design';d.version=1;d.rings=d.rings||[];d.sticks=d.sticks||[];for(const r of d.rings){r.lockCount=0;if(r.radius==null)r.radius=1.75;}return d;}
const ringOf=(d,id)=>d.rings.find(r=>r.id===id),stickOf=(d,id)=>d.sticks.find(s=>s.id===id);
const tgt=p=>p.target||(p.targets&&p.targets[0]);
// Mirror across the vertical line x=cx (flip left/right).
function mirrorX(d,cx=0){const mx=x=>r4(2*cx-x),ma=a=>norm(180-a);
 for(const r of d.rings){r.x=mx(r.x);r.gapDir=ma(r.gapDir||0);for(const p of r.pins||[])p.angle=ma(p.angle);for(const s of r.stops||[])s.angle=ma(s.angle);if(r.bomb)r.bomb.x=mx(r.bomb.x);}
 for(const s of d.sticks){s.x=mx(s.x);s.angle=norm(-(s.angle||0));s.path=s.path.map(p=>[r4(-p[0]),p[1]]);if(s.slideAxis)s.slideAxis=[-s.slideAxis[0],s.slideAxis[1]];for(const g of s.guides||[]){g.x=mx(g.x);if(g.angle!=null)g.angle=ma(g.angle);}if(s.bomb)s.bomb.x=mx(s.bomb.x);}
 for(const b of d.bombs||[])b.x=mx(b.x);return d;}
// Mirror across the horizontal line y=cy (flip up/down).
function mirrorY(d,cy=0){const my=y=>r4(2*cy-y),ma=a=>norm(-a);
 for(const r of d.rings){r.y=my(r.y);r.gapDir=ma(r.gapDir||0);for(const p of r.pins||[])p.angle=ma(p.angle);for(const s of r.stops||[])s.angle=ma(s.angle);if(r.bomb)r.bomb.y=my(r.bomb.y);}
 for(const s of d.sticks){s.y=my(s.y);s.angle=norm(-(s.angle||0));s.path=s.path.map(p=>[p[0],r4(-p[1])]);if(s.slideAxis)s.slideAxis=[s.slideAxis[0],-s.slideAxis[1]];for(const g of s.guides||[]){g.y=my(g.y);if(g.angle!=null)g.angle=ma(g.angle);}if(s.bomb)s.bomb.y=my(s.bomb.y);}
 for(const b of d.bombs||[])b.y=my(b.y);return d;}
// Point every ring→ring pin exactly at its target and size it so the tip lands on the target centreline (fixes idle long pins).
function fitPins(d){for(const r of d.rings)for(const p of r.pins||[]){const t=ringOf(d,tgt(p));if(!t)continue;const dx=t.x-r.x,dy=t.y-r.y,dist=Math.hypot(dx,dy);p.angle=norm(Math.atan2(dy,dx)*180/Math.PI);p.length=r4(dist-t.radius-(r.radius+.25));}return d;}
function removeRing(d,id){d.rings=d.rings.filter(r=>r.id!==id);for(const r of d.rings)r.pins=(r.pins||[]).filter(p=>tgt(p)!==id);return d;}
function removeStick(d,id){d.sticks=d.sticks.filter(s=>s.id!==id);for(const r of d.rings)r.pins=(r.pins||[]).filter(p=>tgt(p)!==id);return d;}
function setPin(d,from,to){const r=ringOf(d,from);r.pins=r.pins||[];r.pins.push({id:'to'+to,targets:[to],angle:0});const t=ringOf(d,to);r.pins[r.pins.length-1].angle=norm(Math.atan2(t.y-r.y,t.x-r.x)*180/Math.PI);return d;}
function dropPin(d,from,to){const r=ringOf(d,from);r.pins=(r.pins||[]).filter(p=>tgt(p)!==to);return d;}
// Pin from a ring straight into a bar: tip distance along `angle` from the ring centre.
function pinBar(d,from,bar,angle,tip){const r=ringOf(d,from);r.pins=r.pins||[];r.pins.push({id:'to'+bar,targets:[bar],angle,length:r4(tip-(r.radius+.25))});return d;}
function renumber(d){const map={};d.rings.forEach((r,i)=>map[r.id]='R'+(i+1));d.sticks.forEach((s,i)=>map[s.id]='S'+(i+1));
 for(const r of d.rings){r.id=map[r.id];for(const p of r.pins||[]){const t=tgt(p);delete p.targets;p.target=map[t]||t;p.id='to'+p.target;}}for(const s of d.sticks)s.id=map[s.id];return map;}
function report(d){const lv=RR.Design.toLevel(d).level,an=RR.analyze(lv);return an;}
module.exports={load,mirrorX,mirrorY,fitPins,removeRing,removeStick,setPin,dropPin,pinBar,renumber,report,ringOf,stickOf,r4,norm};
// Rotate open-ring gaps by the smallest offset (≤ maxOff) so own pins keep ≥minM° from the gap edge and incoming pins stay off the gap.
function fixGaps(d,minM=45.5,maxOff=60){const ang=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
 for(const r of d.rings){if(!r.gap)continue;const own=(r.pins||[]).map(p=>p.angle),inc=[];for(const o of d.rings)for(const p of o.pins||[]){const t=(p.target||(p.targets&&p.targets[0]));if(t===r.id)inc.push(p.inner?(Math.hypot(r.x-o.x,r.y-o.y)>.01?norm(Math.atan2(r.y-o.y,r.x-o.x)*180/Math.PI):norm(p.angle)):norm(Math.atan2(o.y-r.y,o.x-r.x)*180/Math.PI));}
  const ok=g=>own.every(a=>ang(a,g)-r.gap/2>=minM)&&inc.every(a=>ang(a,g)-r.gap/2>=5);if(ok(r.gapDir))continue;
  let best=null;for(let off=1;off<=maxOff&&!best;off++)for(const s of [1,-1]){const g=norm(r.gapDir+s*off);if(ok(g)){best=g;break;}}if(best!=null)r.gapDir=best;}return d;}
module.exports.fixGaps=fixGaps;
// fitPins variant that also handles a source ring sitting inside a larger target ring (keeps the pin direction, tip on the target centreline).
function fitPins2(d){for(const r of d.rings)for(const p of r.pins||[]){const t=ringOf(d,(p.target||(p.targets&&p.targets[0])));if(!t)continue;const dx=t.x-r.x,dy=t.y-r.y,dist=Math.hypot(dx,dy);
 if(dist<t.radius){const a=p.angle*Math.PI/180,ux=Math.cos(a),uy=Math.sin(a),b=-(ux*dx+uy*dy),c=dist*dist-t.radius*t.radius,s=-b+Math.sqrt(b*b-c);p.length=r4(s-(r.radius+.25));continue;}
 p.angle=norm(Math.atan2(dy,dx)*180/Math.PI);p.length=r4(dist-t.radius-(r.radius+.25));}return d;}
module.exports.fitPins2=fitPins2;
// Greedy colour repair after linkedColors: resolve same-colour-near pairs and same-colour-different-size rings.
function fixColors(d,near,tries=40){const pal=['blue','navy','teal','green','orange','red','purple'],all=()=>[...d.rings,...d.sticks],byId=id=>all().find(o=>o.id===id);
 for(let t=0;t<tries;t++){const n=near(d);if(!n.near.length&&!n.sizeClash.length)return true;
  const bad=n.near.length?n.near[0].split(':')[0].split('|'):[n.sizeClash.find(id=>{const r=byId(id);return r.radius!==1.75;})||n.sizeClash[n.sizeClash.length-1]];
  const o=byId(bad[bad.length-1]);let best=null;
  for(const c of pal){if(c===o.color)continue;const old=o.color;o.color=c;const m=near(d),score=m.near.length*10+m.sizeClash.length;o.color=old;if(!best||score<best.s)best={c,s:score};}
  o.color=best.c;}
 const n=near(d);return !n.near.length&&!n.sizeClash.length;}
module.exports.fixColors=fixColors;
// fitPins3: ring→ring for all nestings (target inside source → negative/inward length; source inside target; separate) and ring→bar pins
// sized so the tip lands on the bar centreline along the pin ray.
function segHit(ox,oy,ux,uy,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,den=ux*dy-uy*dx;if(Math.abs(den)<1e-9)return null;const t=((ax-ox)*dy-(ay-oy)*dx)/den,u=((ax-ox)*uy-(ay-oy)*ux)/den;return t>0&&u>=-.02&&u<=1.02?t:null;}
function fitPins3(d){for(const r of d.rings)for(const p of r.pins||[]){if(p.inner)continue;const id=(p.target||(p.targets&&p.targets[0])),t=ringOf(d,id);
 if(t){const dx=t.x-r.x,dy=t.y-r.y,dist=Math.hypot(dx,dy);
  if(dist+t.radius<r.radius){if(dist>.01)p.angle=norm(Math.atan2(dy,dx)*180/Math.PI);p.length=r4(dist+t.radius-r.radius-.25);continue;}
  if(dist<t.radius){const a=p.angle*Math.PI/180,ux=Math.cos(a),uy=Math.sin(a),b=-(ux*dx+uy*dy),c=dist*dist-t.radius*t.radius,s=-b+Math.sqrt(b*b-c);p.length=r4(s-(r.radius+.25));continue;}
  p.angle=norm(Math.atan2(dy,dx)*180/Math.PI);p.length=r4(dist-t.radius-(r.radius+.25));continue;}
 const s=stickOf(d,id);if(!s)continue;const a=p.angle*Math.PI/180,ux=Math.cos(a),uy=Math.sin(a),pts=s.path.map(q=>[s.x+q[0],s.y+q[1]]);let best=null;
 for(let i=0;i+1<pts.length;i++){const h=segHit(r.x,r.y,ux,uy,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]);if(h!=null&&(best==null||h<best))best=h;}
 if(best!=null)p.length=r4(best-(r.radius+.25));}return d;}
module.exports.fitPins3=fitPins3;
// Inner-mounted pins are not representable in the Designer (pins point outward, length ≥0.45): reverse ring-in-ring links so the inner
// ring pins outward into the enclosing ring; drop pins into bars lying inside the owner ring and remove bars left without any link.
function fixInnerPins(d,log=[]){for(const r of [...d.rings])for(const p of [...(r.pins||[])]){const id=(p.target||(p.targets&&p.targets[0])),t=ringOf(d,id);
  if(t){const dist=Math.hypot(t.x-r.x,t.y-r.y);if(dist+t.radius<r.radius){r.pins=r.pins.filter(q=>q!==p);t.pins=t.pins||[];const a=dist>.01?norm(Math.atan2(t.y-r.y,t.x-r.x)*180/Math.PI):p.angle;t.pins.push({id:'to'+r.id,targets:[r.id],angle:a});log.push('pin trong '+r.id+'→'+t.id+' đổi thành '+t.id+'→'+r.id+' hướng ra');}continue;}
  const s=stickOf(d,id);if(s&&Math.hypot(s.x-r.x,s.y-r.y)<r.radius){r.pins=r.pins.filter(q=>q!==p);log.push('bỏ pin trong '+r.id+'→'+s.id);}}
 for(const s of [...d.sticks]){const pinned=d.rings.some(r=>(r.pins||[]).some(p=>(p.target||(p.targets&&p.targets[0]))===s.id));if(!pinned&&!(s.guides||[]).length){removeStick(d,s.id);log.push('bỏ thanh '+s.id+' (mất liên kết)');}}return log;}
module.exports.fixInnerPins=fixInnerPins;
// Drop block-only pins without a target and ring→bar pins whose ray never meets the bar (unrepresentable/idle); then prune unlinked bars.
function dropDeadPins(d,log=[]){for(const r of d.rings)for(const p of [...(r.pins||[])]){if(p.inner)continue;const id=(p.target||(p.targets&&p.targets[0]));if(!id){r.pins=r.pins.filter(q=>q!==p);log.push('bỏ pin chặn không liên kết của '+r.id);continue;}
 const s=stickOf(d,id);if(!s)continue;const a=p.angle*Math.PI/180,ux=Math.cos(a),uy=Math.sin(a),pts=s.path.map(q=>[s.x+q[0],s.y+q[1]]);let hit=false;for(let i=0;i+1<pts.length;i++)if(segHit(r.x,r.y,ux,uy,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1])!=null)hit=true;
 if(!hit){r.pins=r.pins.filter(q=>q!==p);log.push('bỏ pin '+r.id+'→'+s.id+' không chạm thanh');}}
 for(const s of [...d.sticks]){const pinned=d.rings.some(r=>(r.pins||[]).some(p=>(p.target||(p.targets&&p.targets[0]))===s.id));if(!pinned&&!(s.guides||[]).length){removeStick(d,s.id);log.push('bỏ thanh '+s.id+' (mất liên kết)');}}return log;}
module.exports.dropDeadPins=dropDeadPins;
// keepInnerPins: with inner-mounted pins now supported by the Designer (17/10/2026), keep the source's inner pins instead of reversing them.
// Ring target lying inside the owner: bearing towards the target (owner centre -> target centre, or the source angle when concentric), head on
// the target's far centre line. Bar target lying (partly) inside the owner: bearing = source angle, head where that ray meets the bar centre line.
function keepInnerPins(d,log=[]){for(const r of d.rings)for(const p of r.pins||[]){const id=(p.target||(p.targets&&p.targets[0])),inner=r.radius-.25;
  const t=ringOf(d,id);if(t){const dx=t.x-r.x,dy=t.y-r.y,dist=Math.hypot(dx,dy);if(dist+t.radius<inner){if(dist>.01)p.angle=norm(Math.atan2(dy,dx)*180/Math.PI);const depth=inner-(dist+t.radius);if(depth>=.2){p.inner=true;p.length=r4(depth);log.push('giữ pin trong '+r.id+'→'+t.id+' (sâu '+p.length+')');}}continue;}
  const s=stickOf(d,id);if(!s)continue;const pts=s.path.map(q=>[s.x+q[0],s.y+q[1]]);const segD=(ax,ay,bx,by)=>{const ex=bx-ax,ey=by-ay,L2=ex*ex+ey*ey,k=L2?Math.max(0,Math.min(1,((r.x-ax)*ex+(r.y-ay)*ey)/L2)):0;return Math.hypot(ax+ex*k-r.x,ay+ey*k-r.y);};let inside=false;for(let i=0;i+1<pts.length;i++)if(segD(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1])<inner)inside=true;if(!inside)continue;
  const a=p.angle*Math.PI/180,ux=Math.cos(a),uy=Math.sin(a);let best=null;
  for(let i=0;i+1<pts.length;i++){const ax=pts[i][0],ay=pts[i][1],bx=pts[i+1][0],by=pts[i+1][1],ex=bx-ax,ey=by-ay,den=ux*ey-uy*ex;if(Math.abs(den)<1e-9)continue;const tt=((ax-r.x)*ey-(ay-r.y)*ex)/den,u=((ax-r.x)*uy-(ay-r.y)*ux)/den;if(u<-.02||u>1.02||tt<-.5)continue;const h=Math.max(.05,Math.abs(tt));if(best==null||h<best)best=h;}
  if(best!=null&&inner-best>=.2){p.inner=true;p.length=r4(Math.min(inner-.05,inner-best));log.push('giữ pin trong '+r.id+'→'+s.id+' (sâu '+p.length+')');}}return log;}
module.exports.keepInnerPins=keepInnerPins;

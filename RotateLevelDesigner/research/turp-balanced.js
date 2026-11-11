"use strict";
// Research-only "balanced" remake pipeline (user feedback 16/10/2026: keep the source's core idea, change the outline clearly).
// Every step is applied on a snapshot and rolled back when it adds geometry/rule problems. Generate-only: GD finds solutions.
const T=require('./turp-src-remake.js'),{check}=require('./turp-a042-author'),near=require('./turp-color-near.js'),{linkedColors}=require('./turp-a032-author');
const clone=o=>JSON.parse(JSON.stringify(o)),tgt=p=>p.target||(p.targets&&p.targets[0]),ang=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
let SRC_STRICT=null;const {api}=require('./turp-continue');function strictPenalty(d){if(!SRC_STRICT)return 0;return api.OVL.check(d).filter(x=>{const k=[x.a,x.b].sort().join('|');return !(SRC_STRICT.has(k)&&SRC_STRICT.get(k)>=x.depth-0.01);}).length*5;}
function score(d){try{const c=check(d);return strictPenalty(d)+c.analysis.warnings.length*10+c.margins.filter(m=>m.margin<45).length*3+c.links.filter(l=>!l.active).length*10+c.guides.filter(g=>!g.engaged).length*10+(c.analysis.error?1000:0);}catch(e){return 1e6;}}
function step(st,label,fn){const snap=clone(st.d),before=score(st.d);try{fn(st.d);}catch(e){st.d=snap;return false;}const after=score(st.d);if(after>before){st.d=snap;return false;}st.log.push(label);return true;}
const centroid=d=>{const a=d.rings.length?d.rings:d.sticks;return {x:a.reduce((s,r)=>s+r.x,0)/a.length,y:a.reduce((s,r)=>s+r.y,0)/a.length};};
function links(d,id){let n=0;for(const r of d.rings){if(r.id===id)n+=(r.pins||[]).length;for(const p of r.pins||[])if(tgt(p)===id)n++;}return n;}
function sticksInGap(d,r){return d.sticks.filter(s=>(s.guides||[]).some(g=>Math.hypot(g.x-r.x,g.y-r.y)<r.radius+3.2)||Math.hypot(s.x-r.x,s.y-r.y)<r.radius+.6);}
// Sticks held only by pins from `id` (no Guides) would become free: remove them with the ring.
function removeRingSafe(d,id){const held=d.sticks.filter(s=>!(s.guides||[]).length&&d.rings.every(r=>r.id===id||!(r.pins||[]).some(p=>tgt(p)===s.id))&&d.rings.some(r=>r.id===id&&(r.pins||[]).some(p=>tgt(p)===s.id)));T.removeRing(d,id);for(const s of held)T.removeStick(d,s.id);return held.map(s=>s.id);}
function transform(d,kind){const c=centroid(d);if(kind==='flipX')T.mirrorX(d,c.x);else if(kind==='flipY')T.mirrorY(d,c.y);else{T.mirrorX(d,c.x);T.mirrorY(d,c.y);}}
// Place an L bar into an open ring's gap from outside when the gap points (nearly) along an axis and the space is free.
function addL(d,r,id,hookSign){const g=r.gapDir,card=[0,90,180,270].find(a=>ang(a,g)<=12);if(card==null)return false;r.gapDir=card;const ux=Math.round(Math.cos(card*Math.PI/180)),uy=Math.round(Math.sin(card*Math.PI/180));
 const gd=r.radius+.85,len=r.radius+2.0,hook=1.6*hookSign,gx=r.x+ux*gd,gy=r.y+uy*gd;const px=[-ux*gd,-uy*gd],pe=[ux*(len-gd),uy*(len-gd)],ph=[pe[0]+(uy?hook:0),pe[1]+(ux?hook:0)];
 d.sticks.push({id,x:+gx.toFixed(4),y:+gy.toFixed(4),angle:0,path:[px,pe,ph].map(p=>p.map(v=>+v.toFixed(4))),slideAxis:[ux,uy],guides:[{x:+gx.toFixed(4),y:+gy.toFixed(4),angle:card}]});return true;}
function remake(src,{kind='rot180',drop=3,reverse=3,shrink=2,addBars=2,seed=1}={}){
 const st={d:T.load(src),log:[]};SRC_STRICT=new Map(api.OVL.check(st.d).map(x=>[[x.a,x.b].sort().join('|'),x.depth]));delete st.d.levelId;st.d.levelId='draft';T.keepInnerPins(st.d,st.log);T.dropDeadPins(st.d,st.log);T.fitPins3(st.d);T.fixGaps(st.d);
 {const {check}=require('./turp-a042-author');for(let k=0;k<12;k++){let c;try{c=check(st.d);}catch(e){break;}const bad=c.margins.find(m=>m.margin<45);if(!bad)break;const r=T.ringOf(st.d,bad.ring),p=(r.pins||[]).find(q=>q.id===bad.pin),t=p&&T.ringOf(st.d,tgt(p));if(!p)break;
  if(t&&step(st,'đảo pin sát khe '+r.id+'→'+t.id,d=>{T.dropPin(d,r.id,t.id);T.setPin(d,t.id,r.id);T.fitPins3(d);T.fixGaps(d);}))continue;
  if(t&&links(st.d,t.id)>1&&step(st,'bỏ pin sát khe '+r.id+'→'+t.id,d=>{T.dropPin(d,r.id,t.id);}))continue;r.pins=r.pins.filter(q=>q!==p);st.log.push('bỏ pin sát khe '+r.id+'→'+(tgt(p)||'?'));}}
 const base=score(st.d);st.log.push('nguồn sau khi đặt lại độ dài pin: điểm lỗi '+base);
 step(st,{rot180:'xoay180°',flipX:'lật ngang',flipY:'lật dọc'}[kind],d=>transform(d,kind));
 // Drop outer rings with few links (outline change), keeping every remaining object linked.
 const c=centroid(st.d);let dropped=0;for(const r of [...st.d.rings].sort((a,b)=>(Math.hypot(b.x-c.x,b.y-c.y)-links(st.d,b.id)*.6)-(Math.hypot(a.x-c.x,a.y-c.y)-links(st.d,a.id)*.6))){if(dropped>=drop)break;if(!r.gap||sticksInGap(st.d,r).length)continue;if(step(st,'bỏ vòng rìa '+r.id,d=>{removeRingSafe(d,r.id);}))dropped++;}
 // Reverse ring→ring links (G5).
 let rev=0;const pairs=[];for(const r of st.d.rings)for(const p of r.pins||[]){const t=T.ringOf(st.d,tgt(p));if(t&&t.gap&&r.gap&&!p.inner)pairs.push([r.id,t.id]);}
 for(let i=0;i<pairs.length&&rev<reverse;i++){const [a,b]=pairs[(i*7+seed)%pairs.length];if(!T.ringOf(st.d,a)||!T.ringOf(st.d,b)||!(T.ringOf(st.d,a).pins||[]).some(p=>tgt(p)===b)||(T.ringOf(st.d,b).pins||[]).some(p=>tgt(p)===a))continue;if(step(st,'đảo chiều liên kết '+a+'→'+b,d=>{T.dropPin(d,a,b);T.setPin(d,b,a);T.fitPins3(d);}))rev++;}
 // Shrink open receivers (no own pins, no bars in gap) to radius 1.5.
 let sh=0;for(const r of st.d.rings){if(sh>=shrink)break;if(!r.gap||(r.pins||[]).length||sticksInGap(st.d,r).length||st.d.rings.some(o=>(o.pins||[]).some(p=>p.inner&&tgt(p)===r.id)))continue;if(step(st,'thu nhỏ '+r.id+' radius1,5',d=>{T.ringOf(d,r.id).radius=1.5;T.fitPins3(d);}))sh++;}
 // Add L bars into free outward gaps.
 const c2=centroid(st.d);let added=0,n=st.d.sticks.length;for(const r of [...st.d.rings].sort((a,b)=>Math.hypot(b.x-c2.x,b.y-c2.y)-Math.hypot(a.x-c2.x,a.y-c2.y))){if(added>=addBars)break;if(!r.gap||sticksInGap(st.d,r).length)continue;
  const out=Math.atan2(r.y-c2.y,r.x-c2.x)*180/Math.PI;if(ang(out,r.gapDir)>70)continue;for(const hs of [1,-1]){const id='S'+(n+added+1);if(step(st,'thêm L '+id+' vào khe '+r.id,d=>{if(!addL(d,T.ringOf(d,r.id),id,hs))throw 0;})){added++;break;}}}
 T.fixGaps(st.d);linkedColors(st.d);T.fixColors(st.d,near);return st;}
module.exports={remake,score,step};

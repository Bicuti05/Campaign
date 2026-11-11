"use strict";
// A069/BoardA69 (source10071: big ring with Bom/Stop around two inner rings): balanced remake; inner rings pin outward at a clear angle. Generate-only.
const path=require('path'),T=require('./turp-src-remake.js'),B=require('./turp-balanced.js');
const OUT=path.join(__dirname,'20261017-turp-a069-01');
function author(){
 const st=B.remake('./20261016-boardA-ref-51/sources/Level10071.rrdesign.json',{kind:'rot180',seed:69});st.d.name='Level 69';st.d.author='Codex / TURP';
 // Inner pins of the big ring R1 into R2/R3: aiming at the centres runs along the diagonal bar; search a nearby bearing whose ray still crosses the
 // target ring (head on the far crossing) with the lowest problem score.
 for(const id of ['R2','R3']){const r1=T.ringOf(st.d,'R1'),t=T.ringOf(st.d,id),p=(r1.pins||[]).find(q=>q.inner&&(q.target||(q.targets&&q.targets[0]))===id);if(!p)continue;const c0=Math.atan2(t.y-r1.y,t.x-r1.x)*180/Math.PI;let best=null;
  for(let off=-70;off<=70;off+=5){const a=(c0+off)*Math.PI/180,ux=Math.cos(a),uy=Math.sin(a),dx=t.x-r1.x,dy=t.y-r1.y,proj=ux*dx+uy*dy,disc=proj*proj-(dx*dx+dy*dy-t.radius*t.radius);if(disc<0)continue;const h=proj+Math.sqrt(disc),depth=r1.radius-.25-h;if(depth<.2)continue;p.angle=T.norm(c0+off);p.length=T.r4(depth);const sc=B.score(st.d);if(!best||sc<best.s||(sc===best.s&&Math.abs(off)<Math.abs(best.off)))best={s:sc,off,a:p.angle,l:p.length};}
  if(best){p.angle=best.a;p.length=best.l;st.log.push('pin trong R1→'+id+' đặt hướng '+best.a+'° (lệch '+best.off+'° khỏi tâm, tránh thanh chéo)');}}
 T.fixGaps(st.d);return st;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),{linkedColors}=require('./turp-a032-author'),N=require('./turp-color-near.js'),st=author();linkedColors(st.d);T.fixColors(st.d,N);const c=check(st.d);console.log(st.log.join('; '));console.log(JSON.stringify(c.analysis.warnings.map(w=>w.text)),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.links.filter(l=>!l.active).length,JSON.stringify(N(st.d)),JSON.stringify(c.analysis.info));require('fs').writeFileSync(process.env.TEMP+'/claude/a069.rrdesign.json',JSON.stringify(st.d,null,1));}

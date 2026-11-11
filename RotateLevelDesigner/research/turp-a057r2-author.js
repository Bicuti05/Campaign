"use strict";
// A057 r02: 10046 with stronger edits (user feedback 16/10/2026 "giống nguồn quá, hãy sáng tạo thêm"). Generate-only.
const path=require('path'),T=require('./turp-src-remake.js');
const OUT=path.join(__dirname,'20261016-turp-a057-01');
function author(){
 const d=T.load('./20261016-boardA-ref-51/sources/Level10046.rrdesign.json');d.name='Level 57';d.author='Codex / TURP';
 T.removeRing(d,'R7');T.removeRing(d,'R8');T.removeRing(d,'R10');T.removeStick(d,'S4');   // drop the outer top pair and the left ring with its pinned bar
 for(const [a,b] of [['R12','R11'],['R12','R13'],['R5','R2']]){T.dropPin(d,a,b);T.setPin(d,b,a);}  // reverse three links
 T.ringOf(d,'R16').radius=1.5;T.ringOf(d,'R17').radius=1.5;                                // smaller outer receivers (size change)
 T.fitPins2(d);
 T.mirrorX(d,11.3);T.mirrorY(d,-12.3);                                                    // rotate 180°: big-ring gap now on top
 // New L from below into R9's gap, foot running under the big ring; new L from the left into R16's gap, hook down along the left edge.
 const r9=T.ringOf(d,'R9'),r16=T.ringOf(d,'R16');
 d.sticks.push({id:'S9',x:r9.x,y:r9.y-2.6,angle:0,path:[[0,2.6],[0,-1.1],[-6.4,-1.1]],slideAxis:[0,1],guides:[{x:r9.x,y:r9.y-2.6,angle:90}]});
 d.sticks.push({id:'S10',x:r16.x-2.6,y:r16.y,angle:0,path:[[2.6,0],[-1.1,0],[-1.1,-2.6]],slideAxis:[1,0],guides:[{x:r16.x-2.6,y:r16.y,angle:0}]});
 return d;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),{linkedColors}=require('./turp-a032-author'),d=author();linkedColors(d);const c=check(d);console.log(JSON.stringify(c.analysis.warnings.map(w=>w.text)),JSON.stringify(c.strict),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.guides.map(g=>g.engaged).join(),c.links.filter(l=>!l.active).length,JSON.stringify(require('./turp-color-near.js')(d)));require('fs').writeFileSync(process.env.TEMP+'/claude/a057b.rrdesign.json',JSON.stringify(d,null,1));}

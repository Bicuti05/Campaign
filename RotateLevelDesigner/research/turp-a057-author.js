"use strict";
// A057/BoardA57: source-weighted remake of 10046 (generate-only; GD finds solutions).
const path=require('path'),T=require('./turp-src-remake.js');
const OUT=path.join(__dirname,'20261016-turp-a057-01');
function author(){
 const d=T.load('./20261016-boardA-ref-51/sources/Level10046.rrdesign.json');d.name='Level 57';d.author='Codex / TURP';
 T.mirrorX(d,11.3);                                   // flip left/right
 T.removeRing(d,'R16');                               // drop one outer edge ring
 for(const [a,b] of [['R12','R11'],['R12','R13']]){T.dropPin(d,a,b);T.setPin(d,b,a);}  // R12 becomes a receiver (fixes pins too close to its gap, holding bar S5)
 T.fitPins2(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),{linkedColors}=require('./turp-a032-author'),d=author();linkedColors(d);const c=check(d);console.log(JSON.stringify(c.analysis.warnings.map(w=>w.text)),JSON.stringify(c.strict),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.guides.map(g=>g.engaged).join(),c.links.filter(l=>!l.active).length,JSON.stringify(require('./turp-color-near.js')(d)));require('fs').writeFileSync(process.env.TEMP+'/claude/a057.rrdesign.json',JSON.stringify(d,null,1));}

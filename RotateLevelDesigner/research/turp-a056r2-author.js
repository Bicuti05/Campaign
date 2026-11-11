"use strict";
// A056 r02: source-weighted remake of 60006 (user feedback 16/10/2026). Generate-only; GD finds solutions.
const path=require('path'),T=require('./turp-src-remake.js');
const OUT=path.join(__dirname,'20261016-turp-a056-01');
function author(){
 const d=T.load('./20261016-boardA-ref-51/sources/Level60006.rrdesign.json');d.name='Level 56';d.author='Codex / TURP';
 T.removeRing(d,'R14');T.removeRing(d,'R15');                 // drop two opposite corner rings: breaks the 4-fold symmetry
 for(const [a,b] of [['R16','R12'],['R16','R10'],['R17','R13'],['R17','R11'],['R6','R10']]){T.dropPin(d,a,b);T.setPin(d,b,a);}  // corners become receivers; R10 feeds R6
 T.ringOf(d,'R1').radius=2.1;                                  // centre closed hub clearly bigger
 T.fitPins(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),{linkedColors}=require('./turp-a032-author'),d=author();linkedColors(d);const c=check(d);console.log(JSON.stringify(c.analysis.warnings),JSON.stringify(c.strict),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.guides.map(g=>g.engaged).join(),c.links.filter(l=>!l.active).length,JSON.stringify(require('./turp-color-near.js')(d)));require('fs').writeFileSync(process.env.TEMP+'/claude/a056b.rrdesign.json',JSON.stringify(d,null,1));}

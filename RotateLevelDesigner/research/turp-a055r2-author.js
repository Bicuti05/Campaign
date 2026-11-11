"use strict";
// A055 r02: source-weighted remake of 70013 (user feedback 16/10/2026). Generate-only; GD finds solutions.
const fs=require('fs'),path=require('path'),T=require('./turp-src-remake.js'),{linkedColors}=require('./turp-a032-author');
const OUT=path.join(__dirname,'20261016-turp-a055-01');
function author(){
 const d=T.load('./20261016-boardA-ref-51/sources/Level70013.rrdesign.json');d.name='Level 55';d.author='Codex / TURP';
 T.mirrorX(d,9.5);                       // flip left/right
 T.removeRing(d,'R4');                   // drop one outer bottom ring (outline)
 // Rewire by reversing source links (G5): R2 feeds R7/R8 instead of receiving them; R7 feeds R6. This also clears the source's pin–gap margin violations on R6/R7/R8 without turning gaps that hold the bar S2.
 for(const [a,b] of [['R7','R2'],['R8','R2'],['R6','R7']]){T.dropPin(d,a,b);T.setPin(d,b,a);}
 T.fitPins(d);T.fixGaps(d);
 return d;
}
module.exports={author,OUT};
if(require.main===module){const {check}=require('./turp-a042-author'),d=author();linkedColors(d);const c=check(d);console.log(JSON.stringify(c.analysis.warnings),JSON.stringify(c.strict),JSON.stringify(c.margins.filter(m=>m.margin<45)),c.guides.map(g=>g.engaged).join(),JSON.stringify(require('./turp-color-near.js')(d)));fs.writeFileSync(process.env.TEMP+'/claude/a055b.rrdesign.json',JSON.stringify(d,null,1));}

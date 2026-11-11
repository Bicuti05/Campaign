"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-finish.js'),'utf8');
function replace(a,b){if(!code.includes(a))throw Error('Pipeline changed: '+a);code=code.replace(a,b);}
replace('OUT:IN,CORE','CORE');
replace("const OUT=path.join(__dirname,'20261015-turp-continuation-delivery');","const IN=path.join(__dirname,'20261015-turp-a019-01');const OUT=path.join(__dirname,'20261015-turp-a019-delivery');");
replace("const jobs=[['10014','A014','turp-A014-10014-outline-r02'],['10013','A015','turp-A015-10013-outline-r02']];","const jobs=[['10017','A019','turp-A019-10017-left-U-r02']];");
replace('stage.name=d.name;stage.notes=d.notes;','stage.design=d;stage.name=d.name;stage.notes=d.notes;');
replace('See research/20261015-turp-continuation-01.','See research/20261015-turp-a019-delivery.');
replace("const probes=d.sticks.flatMap(s=>{const ms=proof.moves.filter(m=>m.part!==s.id);return ms.map((_,i)=>ms.slice(0,i+1));});","const probes=d.sticks.flatMap(s=>{const ms=proof.moves.filter(m=>m.part!==s.id);return ms.map((_,i)=>ms.slice(0,i+1));}).concat(read(path.join(IN,stem+'-extra-probes.json')));");
replace('width:960,height:1180','width:960,height:590');replace('width:1280,height:1100','width:1280,height:550');
replace('sourceReversal:reversal,','sourceInitialInputComparison:reversal,');
replace('no automatic schedule resume.','automation ACTIVE under user-authorized weekly50% stop policy. Source Bomb omitted and R1/R2 receivers opened; comparable human difficulty pending GD.');
new Function('require','__dirname','process',code)(require,__dirname,process);

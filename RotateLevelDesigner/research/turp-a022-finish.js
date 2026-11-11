"use strict";
// Keep native bake/writer and full readback pipeline; explicitly enable Bomb in all replay/phase calls.
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-finish.js'),'utf8');
function replace(a,b){if(!code.includes(a))throw Error('Pipeline changed: '+a);code=code.replace(a,b);}
replace('OUT:IN,CORE','CORE');
replace("const OUT=path.join(__dirname,'20261015-turp-continuation-delivery');","const IN=path.join(__dirname,'20261015-turp-a022-01');const OUT=path.join(__dirname,'20261015-turp-a022-delivery');");
replace("require('./gen/rr-qualify')","require('./turp-a022-qualify')");
replace("const jobs=[['10014','A014','turp-A014-10014-outline-r02'],['10013','A015','turp-A015-10013-outline-r02']];","const jobs=[['10019','A022','turp-A022-10019-bomb-U-r07']];");
replace('stage.name=d.name;stage.notes=d.notes;','stage.design=d;stage.name=d.name;stage.notes=d.notes;');
replace('explodeBombs:false,log:','explodeBombs:true,log:');
replace('CLI FOUND; authored current-pose','CLI FOUND with Bomb enabled; authored current-pose');
replace('See research/20261015-turp-continuation-01.','See research/20261015-turp-a022-delivery.');
replace("const probes=d.sticks.flatMap(s=>{const ms=proof.moves.filter(m=>m.part!==s.id);return ms.map((_,i)=>ms.slice(0,i+1));});","const probes=d.sticks.flatMap(s=>{const ms=proof.moves.filter(m=>m.part!==s.id);return ms.map((_,i)=>ms.slice(0,i+1));}).concat(read(path.join(IN,stem+'-extra-probes.json')));");
for(const runtime of ['saved.runtime','rebuilt'])for(const feel of ['false','true'])replace('pose.replay('+runtime+',saved.proof.moves,false,'+feel+')','pose.replay('+runtime+',saved.proof.moves,true,'+feel+')');
replace('pose.query(saved,m,false,true)','pose.query(saved,m,true,true)');
replace('noBombs:true,','noBombs:false,usesBombs:true,');
replace('width:960,height:1180','width:960,height:590');replace('width:1280,height:1100','width:1280,height:550');
replace('sourceReversal:reversal,','sourceInitialInputComparison:reversal,');
replace('no automatic schedule resume.','automation ACTIVE under50% stop policy. Delivered route uses Bomb; no-explosion search budgets are not a proof of necessity.');
const render="const svg=RR.Render.render({world,level:lv,view,width:320,height:550,labels:true,title:slot+' '+key});";
replace(render,"let svg=RR.Render.render({world,level:lv,view,width:320,height:550,labels:true,title:slot+' '+key});if(key==='mono')svg=svg.replace(/(<svg[^>]*>)/,'$1<defs><filter id=\"researchMono\"><feColorMatrix type=\"saturate\" values=\"0\"/></filter></defs><g filter=\"url(#researchMono)\">').replace('</svg>','</g></svg>');");
new Function('require','__dirname','process',code)(require,__dirname,process);

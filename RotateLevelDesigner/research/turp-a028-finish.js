"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-finish.js'),'utf8');
function replace(a,b){if(!code.includes(a))throw Error('Pipeline changed: '+a);code=code.replace(a,b);}
replace('OUT:IN,CORE','CORE');
replace("const OUT=path.join(__dirname,'20261015-turp-continuation-delivery');","const IN=path.join(__dirname,'20261015-turp-a028-01');const OUT=path.join(__dirname,'20261015-turp-a028-delivery');");
replace("require('./gen/rr-qualify')","require('./turp-a022-qualify')");
replace("const jobs=[['10014','A014','turp-A014-10014-outline-r02'],['10013','A015','turp-A015-10013-outline-r02']];","const jobs=[['70012','A028','turp-A028-70012-shared-pinbar-bomb-r05']];");
replace('stage.name=d.name;stage.notes=d.notes;','stage.design=d;stage.name=d.name;stage.notes=d.notes;');replace('explodeBombs:false,log:','explodeBombs:true,log:');replace('CLI FOUND; authored current-pose','CLI FOUND with Bomb enabled; authored current-pose');replace('See research/20261015-turp-continuation-01.','See research/20261015-turp-a028-delivery.');
// Recheck every recorded control witness on the exact saved and rebuilt data.
// Keep all full-route prefixes; avoid rescanning failed exploratory prefixes already archived.
replace('const probes=d.sticks.flatMap(s=>{const ms=proof.moves.filter(m=>m.part!==s.id);return ms.map((_,i)=>ms.slice(0,i+1));});','const probes=proof.roles.rows.filter(r=>r.ok&&r.prefix).map(r=>r.prefix);');
for(const runtime of ['saved.runtime','rebuilt'])for(const feel of ['false','true'])replace('pose.replay('+runtime+',saved.proof.moves,false,'+feel+')','pose.replay('+runtime+',saved.proof.moves,true,'+feel+')');
replace('pose.query(saved,m,false,true)','pose.query(saved,m,true,true)');replace('noBombs:true,','noBombs:false,usesBombs:true,');replace('width:960,height:1180','width:960,height:590');replace('width:1280,height:1100','width:1280,height:550');replace('sourceReversal:reversal,','sourceInitialInputComparison:reversal,');replace('no automatic schedule resume.','automation ACTIVE under50% stop policy. Delivered route uses Bomb. GD approval pending.');
const render="const svg=RR.Render.render({world,level:lv,view,width:320,height:550,labels:true,title:slot+' '+key});";
replace(render,"let svg=RR.Render.render({world,level:lv,view,width:320,height:550,labels:true,title:slot+' '+key});if(key==='mono')svg=svg.replace(/(<svg[^>]*>)/,'$1<defs><filter id=\"researchMono\"><feColorMatrix type=\"saturate\" values=\"0\"/></filter></defs><g filter=\"url(#researchMono)\">').replace('</svg>','</g></svg>');");
new Function('require','__dirname','process',code)(require,__dirname,process);

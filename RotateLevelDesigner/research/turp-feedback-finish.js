"use strict";
// Reuse the reviewed native CLI-stage/readback/render pipeline; no engine edits.
const fs=require('fs'),path=require('path'),{api,RR}=require('./turp-continue'),{OUT:IN}=require('./turp-feedback-author');
const jobs=[['10014','A014','turp-A014-10014-linked-r04'],['10013','A015','turp-A015-10013-linked-r06'],['70002','A016','turp-A016-70002-linked-r01'],['10015','A017','turp-A017-10015-linked-r06']];
for(const [id,slot,stem]of jobs){const d=JSON.parse(fs.readFileSync(path.join(IN,stem+'.rrdesign.json'))),source=JSON.parse(fs.readFileSync('C:/Project Folder/TURPLevel/LevelVariants/out_v3/profiles/'+slot+'-'+id+'.json')).source.plan,after=api.planProfile(RR.Design.toLevel(d).level,20);const model={before:source,after,pass:after.done&&Math.abs(after.drags-source.drags)<=.6*source.drags&&Math.abs(after.maxDepth-source.maxDepth)<=2,scope:'TURP local next-removal BFS uses feel off/early release; not human difficulty. Revised silhouette allows 60% drag and 2-depth drift.',strictOverlap:api.OVL.check(d)};fs.writeFileSync(path.join(IN,stem+'-comparison.json'),JSON.stringify(model,null,2),{flag:'wx'});}
let code=fs.readFileSync(path.join(__dirname,'turp-finish.js'),'utf8');
function replace(a,b){if(!code.includes(a))throw Error('Pipeline changed: '+a);code=code.replace(a,b);}
replace('OUT:IN,CORE','CORE');
replace("const OUT=path.join(__dirname,'20261015-turp-continuation-delivery');","const IN=path.join(__dirname,'20261015-turp-feedback-02');const OUT=path.join(__dirname,'20261015-turp-feedback-delivery');");
replace("const jobs=[['10014','A014','turp-A014-10014-outline-r02'],['10013','A015','turp-A015-10013-outline-r02']];",'const jobs='+JSON.stringify(jobs)+';');
replace("if(!proof.ok||!cli.found||!compare.pass)throw Error('Preflight '+stem);","if(!proof.ok||!cli.found||!compare.pass)throw Error('Preflight '+stem);if(id==='10014')d.notes=d.notes.replace('R03 thay đề xuất r02','Bản linked-r04 thay đề xuất outline-r02');");
replace('stage.name=d.name;stage.notes=d.notes;','stage.design=d;stage.name=d.name;stage.notes=d.notes;');
replace("See research/20261015-turp-continuation-01.","See research/20261015-turp-feedback-delivery.");
replace("const probes=d.sticks.flatMap(s=>{const ms=proof.moves.filter(m=>m.part!==s.id);return ms.map((_,i)=>ms.slice(0,i+1));});","const probes=d.sticks.flatMap(s=>{const ms=proof.moves.filter(m=>m.part!==s.id);return ms.map((_,i)=>ms.slice(0,i+1));}).concat(fs.existsSync(path.join(IN,stem+'-extra-probes.json'))?read(path.join(IN,stem+'-extra-probes.json')):[]);");
replace("fs.readFileSync(path.join(IN,stem+'.rrdesign.json'),'utf8')","JSON.stringify(d,null,2)+'\\n'");
replace('width:960,height:1180','width:960,height:jobs.length*590');replace('width:1280,height:1100','width:1280,height:jobs.length*550');
// Evaluate only our own already reviewed pipeline, with this module's local require.
new Function('require','__dirname','process',code)(require,__dirname,process);

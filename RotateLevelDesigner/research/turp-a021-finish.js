"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-finish.js'),'utf8');
function replace(a,b){if(!code.includes(a))throw Error('Pipeline changed: '+a);code=code.replace(a,b);}
replace('OUT:IN,CORE','CORE');
replace("const OUT=path.join(__dirname,'20261015-turp-continuation-delivery');","const IN=path.join(__dirname,'20261015-turp-a021-01');const OUT=path.join(__dirname,'20261015-turp-a021-delivery');");
replace("const jobs=[['10014','A014','turp-A014-10014-outline-r02'],['10013','A015','turp-A015-10013-outline-r02']];","const jobs=[['70005','A021','turp-A021-70005-middle-stop-r03']];");
replace('stage.name=d.name;stage.notes=d.notes;','stage.design=d;stage.name=d.name;stage.notes=d.notes;');
replace('See research/20261015-turp-continuation-01.','See research/20261015-turp-a021-delivery.');
replace('width:960,height:1180','width:960,height:590');replace('width:1280,height:1100','width:1280,height:550');
replace('sourceReversal:reversal,','sourceInitialInputComparison:reversal,');
replace('no automatic schedule resume.','automation ACTIVE under user-authorized weekly50% stop policy. Stop role witnesses are local retention/input/path evidence, not global mandatory order.');
new Function('require','__dirname','process',code)(require,__dirname,process);

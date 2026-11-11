"use strict";
// Adapt the reviewed native pack/readback/qualification/render pipeline for one new slot.
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-finish.js'),'utf8');
function replace(a,b){if(!code.includes(a))throw Error('Pipeline changed: '+a);code=code.replace(a,b);}
replace('OUT:IN,CORE','CORE');
replace("const OUT=path.join(__dirname,'20261015-turp-continuation-delivery');","const IN=path.join(__dirname,'20261015-turp-a018-01');const OUT=path.join(__dirname,'20261015-turp-a018-delivery');");
replace("const jobs=[['10014','A014','turp-A014-10014-outline-r02'],['10013','A015','turp-A015-10013-outline-r02']];","const jobs=[['70009','A018','turp-A018-70009-shared-r06']];");
replace('stage.name=d.name;stage.notes=d.notes;','stage.design=d;stage.name=d.name;stage.notes=d.notes;');
replace('See research/20261015-turp-continuation-01.','See research/20261015-turp-a018-delivery.');
replace('width:960,height:1180','width:960,height:590');replace('width:1280,height:1100','width:1280,height:550');
replace('sourceReversal:reversal,','sourceInitialInputComparison:reversal,');
replace('no automatic schedule resume.','automation ACTIVE under user-authorized weekly50% stop policy.');
new Function('require','__dirname','process',code)(require,__dirname,process);

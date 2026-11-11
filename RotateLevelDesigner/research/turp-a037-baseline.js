"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-a024-author.js'),'utf8').split('if(require.main===module)')[0].replaceAll('20261015-turp-a024-01','20261016-turp-a037-01').replaceAll('Level60001.rrdesign.json','Level10038.rrdesign.json');new Function('require','__dirname',code+'\nbaseline();')(require,__dirname);

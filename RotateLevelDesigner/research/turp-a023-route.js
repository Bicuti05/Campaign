"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-a022-route.js'),'utf8');code=code.replace("require('./turp-a022-author')","require('./turp-a023-author')").replace("['R1','R8']","['R6','R8']").replace("part:'S6',target","part:'S5',target");new Function('require','__dirname','process',code)(require,__dirname,process);

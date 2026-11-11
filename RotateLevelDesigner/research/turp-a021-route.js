"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-a018-route.js'),'utf8');if(!code.includes("require('./turp-a018-author')"))throw Error('Pipeline changed');code=code.replace("require('./turp-a018-author')","require('./turp-a021-author')");new Function('require','__dirname','process',code)(require,__dirname,process);

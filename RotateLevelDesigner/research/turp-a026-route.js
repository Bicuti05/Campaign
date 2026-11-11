"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-a024-route.js'),'utf8').replace("require('./turp-a024-author')","require('./turp-a026-author')");new Function('require','__dirname','process',code)(require,__dirname,process);

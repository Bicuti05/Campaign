"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-a025-finish.js'),'utf8').replaceAll('20261015-turp-a025','20261015-turp-a029').replace("['70008','A025','turp-A025-70008-shared-U-r02']","['60008','A029','turp-A029-60008-three-shared-pinbars-r10']");new Function('require','__dirname','process',code)(require,__dirname,process);

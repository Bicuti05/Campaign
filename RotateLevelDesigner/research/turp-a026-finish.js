"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-a025-finish.js'),'utf8').replaceAll('20261015-turp-a025','20261015-turp-a026').replace("['70008','A025','turp-A025-70008-shared-U-r02']","['60005','A026','turp-A026-60005-shared-receivers-r01']");new Function('require','__dirname','process',code)(require,__dirname,process);

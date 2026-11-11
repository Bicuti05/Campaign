"use strict";
const fs=require('fs'),path=require('path');let code=fs.readFileSync(path.join(__dirname,'turp-a032-finish.js'),'utf8').replaceAll('20261015-turp-a032','20261016-turp-a033').replace("['10021','A032','turp-A032-10021-cross-return-pinbars-r07']","['70010','A033','turp-A033-70010-shared-return-U-r02']");new Function('require','__dirname','process',code)(require,__dirname,process);

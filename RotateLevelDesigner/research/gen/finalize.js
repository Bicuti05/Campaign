"use strict";
const api=require("./finalize-qualified.js");
if(require.main===module){const [src,out,prefix]=process.argv.slice(2);if(!src||!out)throw Error("Usage: node finalize.js <run-dir> <Designer-levels-dir> <new-prefix>");const r=api.finalize(src,out,prefix);console.log(JSON.stringify({auditDir:r.auditDir,rows:r.rows}));if(r.rows.some(x=>x.status==="held"))process.exitCode=1;}
module.exports=api;

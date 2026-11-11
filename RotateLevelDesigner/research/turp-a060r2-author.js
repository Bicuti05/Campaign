"use strict";
// A060 r02 adapter: same edits as r01, eyes now held by the face's inner-mounted pins (kept as in the source).
const A=require('./turp-a060-author.js');
module.exports={OUT:A.OUT,author(){const log=[],d=A.author(log);return {d,log};}};

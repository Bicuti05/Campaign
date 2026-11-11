"use strict";
const fs = require("fs"), path = require("path"), { naive, structure, RR } = require("./rr-metrics.js");
const DIR = process.argv[2], out = [];
for (const f of fs.readdirSync(DIR).filter(f => /^Level\d+\.json$/.test(f)).sort()) {
  const lv = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8").replace(/^﻿/, "")), st = structure(lv);
  const t0 = Date.now(), nv = naive(lv, { playouts: 12, cap: 300, explodeBombs: st.bombs > 0 });
  const row = Object.assign({ id: lv.levelId, objects: st.rings + st.sticks }, nv, { sec: (Date.now() - t0) / 1000 }); out.push(row); console.log(JSON.stringify(row));
}
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));

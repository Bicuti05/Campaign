"use strict";
const { generate } = require("./rr-gen.js");
const fam = process.argv[2] || "square", n = +(process.argv[3] || 10);
const spec = JSON.parse(process.argv[4] || "{}");
const base = { family: fam, cols: 3, rows: 3, remove: 0.2, symmetric: true, extraEdges: 0.35, closed: 1, rings: 7 };
const why = {}; let ok = 0;
for (let s = 1; s <= n; s++) {
  const t0 = Date.now(), res = generate(Object.assign({}, base, spec), s);
  if (res.ok) { ok++; console.log("OK seed", s, JSON.stringify(res.metrics), "stops", res.roles.stops.length, "sticks", res.roles.sticks.length, ((Date.now() - t0) / 1000).toFixed(1) + "s"); }
  else why[res.why.replace(/R\d+|S\d+|ring_\d+/g, "#")] = (why[res.why.replace(/R\d+|S\d+|ring_\d+/g, "#")] || 0) + 1;
}
console.log("ok", ok, "/", n, JSON.stringify(why));

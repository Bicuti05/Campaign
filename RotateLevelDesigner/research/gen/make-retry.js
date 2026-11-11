"use strict";
// node make-retry.js <plan.json> <genDir> <outPlan.json>
// Slots with no candidate or with a pick outside the band get a second recipe:
//  - peaks: mirror-symmetric square grid with paired long stops and more shared pins (like the symmetric "Khó" boards);
//  - too easy: one more stop pair / more shared pins; too hard or failing organic: square/diamond grid instead.
const fs = require("fs"), path = require("path");
const [planFile, genDir, outFile] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
const got = {};
for (const f of fs.readdirSync(genDir).filter(f => /^progression-.*\.json$/.test(f)))
  for (const v of Object.values(JSON.parse(fs.readFileSync(path.join(genDir, f), "utf8")))) if (!got[v.slot] || v.inBand) got[v.slot] = v;
const big = { quickSeconds: 10, quickNodes: 2500, finalSeconds: 40, finalNodes: 8000, stopTries: 30, guidedTries: 140 };
const retry = [];
for (const p of plan) {
  const g = got[p.slot]; if (g && g.inBand) continue;
  const tooEasy = g && g.naivePerObject != null && g.naivePerObject < p.band[0];
  const n = p.spec.rings || (p.spec.cols || 3) * (p.spec.rows || 3);
  let spec;
  if (p.role === "peak") spec = { family: "square", cols: 4, rows: p.slot > 30 ? 5 : 4, remove: 0.12, mirror: true, closed: 2, stops: 4, extraEdges: 0.6, guidedSticks: p.spec.guidedSticks ? 1 : 0, budget: big };
  else if (p.role === "relief") spec = { family: "diamond", cols: 3, rows: 3, remove: 0, symmetric: true, mirror: true, closed: 1, stops: tooEasy ? 2 : 0, guidedSticks: p.spec.guidedSticks ? 2 : 0, requireSticks: !!p.spec.guidedSticks, extraEdges: 0.2, budget: big };
  else spec = Object.assign({}, p.spec, { family: n >= 12 ? "square" : "diamond", cols: n >= 12 ? 4 : 3, rows: n >= 12 ? 4 : 4, remove: 0.15, symmetric: true,
    stops: (p.spec.stops || 1) + (tooEasy ? 1 : 0), extraEdges: Math.min(0.6, (p.spec.extraEdges || 0.3) + (tooEasy ? 0.15 : 0)), budget: big });
  retry.push(Object.assign({}, p, { tries: 12, spec, retryOf: g ? (g.status || g.naivePerObject) : "none" }));
}
fs.writeFileSync(outFile, JSON.stringify(retry, null, 1));
console.log(retry.map(r => r.slot + "(" + r.role + ")").join(" "));

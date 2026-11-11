"use strict";
const G = require("./rr-gen.js"), RR = require("../../rr-core.js");
// minimal: two rings, ring A pins B, plus a stick pinned by A on the empty side
const d = { format: "turp-design", version: 1, levelId: "draft", rings: [
  { id: "R1", x: 0, y: 0, gap: 90, gapDir: 270, pins: [{ angle: 0, target: "R2" }, { angle: 90, target: "S1" }] },
  { id: "R2", x: G.P, y: 0, gap: 90, gapDir: 90, pins: [] }],
  sticks: [{ id: "S1", shape: "straight", x: 0, y: G.D, angle: 0 }] };
console.log(JSON.stringify(G.gates(d).why || "ok"));
d.sticks[0].x = G.P / 2; console.log("shift", JSON.stringify(G.gates(d).why || "ok"));
const lv = G.toLevel(d); const r = RR.Solver.find(lv, { timeLimitSeconds: 5, nodeLimit: 800 }); console.log(r.log);

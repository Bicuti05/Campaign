"use strict";
// Baseline metrics on the 48 imported campaign levels (track A, khe 90°).
const fs = require("fs"), path = require("path"), { structure, solve, openings, RR } = require("./rr-metrics.js");
const DIR = process.argv[2], OUT = process.argv[3], T = +(process.argv[4] || 20);
const files = fs.readdirSync(DIR).filter(f => /^Level\d+\.json$/.test(f)).sort();
const rows = [];
for (const f of files) {
  const level = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8").replace(/^﻿/, ""));
  const err = RR.validate(level); const row = { id: level.levelId, error: err || null };
  if (!err) {
    Object.assign(row, structure(level));
    try { Object.assign(row, openings(level)); } catch (e) { row.openErr = e.message; }
    const hasBomb = row.bombs > 0;
    const s = solve(level, { timeLimitSeconds: T, nodeLimit: 4000, explodeBombs: hasBomb });
    delete s.route; delete s.moves; Object.assign(row, { solve: s });
  }
  rows.push(row); console.log(JSON.stringify(row));
}
fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));

"use strict";
// Build a draft progression from a slot plan.
//   node progression.js <plan.json> <outDir> [fromSlot] [toSlot]
// plan: [{ slot, chapter, role: "intro|build|peak|relief", band:[lo,hi] (naive drags per object), tries, spec }]
// For every slot: generate `tries` seeds, keep valid candidates, pick the one whose naive-per-object is closest to the band.
const fs = require("fs"), path = require("path"), { generate } = require("./rr-gen.js"), RR = require("../../rr-core.js");
const [planFile, outDir, from = 1, to = 999] = process.argv.slice(2);
const list = String(from).includes(",") ? new Set(String(from).split(",").map(Number)) : null;
const plan = JSON.parse(fs.readFileSync(planFile, "utf8")).filter(p => list ? list.has(p.slot) : p.slot >= +from && p.slot <= +to);
fs.mkdirSync(outDir, { recursive: true });
const summaryFile = path.join(outDir, `progression-${list ? "L" + [...list][0] : from}-${to}.json`);
const summary = fs.existsSync(summaryFile) ? JSON.parse(fs.readFileSync(summaryFile, "utf8")) : {};

const { idea } = require("./idea.js");

for (const slot of plan) {
  const t0 = Date.now(), cands = [], why = {};
  for (let k = 0; k < (slot.tries || 8); k++) {
    const seed = slot.slot * 1000 + k + 1;
    let res; try { res = generate(Object.assign({ playouts: 20 }, slot.spec), seed); } catch (e) { res = { ok: false, why: "throw " + e.message }; }
    if (!res.ok) { const key = String(res.why).replace(/R\d+|S\d+|ring_\d+|slide_bar_\d+/g, "#"); why[key] = (why[key] || 0) + 1; continue; }
    const objs = res.metrics.rings + res.metrics.sticks, per = res.metrics.naiveDrags / objs;
    const [lo, hi] = slot.band, dist = per < lo ? lo - per : per > hi ? per - hi : 0;
    cands.push({ res, per, dist });
    if (dist === 0 && cands.length >= (slot.enough || 2)) break;
  }
  if (!cands.length) { summary[slot.slot] = { slot: slot.slot, chapter: slot.chapter, role: slot.role, status: "NO CANDIDATE", rejects: why }; console.log("slot", slot.slot, "NO CANDIDATE", JSON.stringify(why)); fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 1)); continue; }
  cands.sort((a, b) => a.dist - b.dist || Math.abs(a.per - (slot.band[0] + slot.band[1]) / 2) - Math.abs(b.per - (slot.band[0] + slot.band[1]) / 2));
  const best = cands[0], res = best.res, d = res.design, stem = `gen01-${String(slot.slot).padStart(3, "0")}`;
  d.name = `G01-${String(slot.slot).padStart(3, "0")} | ${slot.chapter}`;
  d.author = "rr-gen research 2026-10-15";
  d.notes = `Bản nháp tự sinh, slot ${slot.slot} (${slot.role}). Ý tưởng: ${idea(d, res.roles)} Chờ GD chơi thử/chỉnh; độ khó chỉ là proxy (người chơi ngẫu nhiên ${best.per.toFixed(1)} lần kéo/vật, mục tiêu ${slot.band.join("–")}). Không Booster/Chain/bom; lockCount 0.`;
  fs.writeFileSync(path.join(outDir, stem + ".rrdesign.json"), JSON.stringify(d, null, 2), { flag: "wx" });
  summary[slot.slot] = { slot: slot.slot, stem, chapter: slot.chapter, role: slot.role, band: slot.band, naivePerObject: +best.per.toFixed(2), inBand: best.dist === 0, candidates: cands.length,
    metrics: res.metrics, roles: res.roles, seed: res.seed, route: res.route.map(r => `${r.label} ${r.kind === "ring" ? r.direction + "→" + r.to : "slide→" + r.to}${r.removedNow ? " (-" + r.removedNow + ")" : ""}`), rejects: why, seconds: (Date.now() - t0) / 1000 };
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 1));
  console.log("slot", slot.slot, stem, slot.role, "per", best.per.toFixed(1), "band", slot.band.join("-"), best.dist === 0 ? "IN" : "OUT", "R", res.metrics.rings, "S", res.metrics.sticks, "st", res.metrics.stops, "C", res.metrics.closed, "cands", cands.length, ((Date.now() - t0) / 1000).toFixed(0) + "s");
}

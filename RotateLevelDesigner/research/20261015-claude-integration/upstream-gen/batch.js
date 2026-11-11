"use strict";
// node batch.js <specs.json> <outDir>   — specs: [{ name, keep, seeds:[from,to], spec:{...} }]
// Writes <outDir>/<name>-<seed>.rrdesign.json + metrics.json for accepted candidates.
const fs = require("fs"), path = require("path"), { generate } = require("./rr-gen.js");
const [specFile, outDir] = process.argv.slice(2);
const specs = JSON.parse(fs.readFileSync(specFile, "utf8"));
fs.mkdirSync(outDir, { recursive: true });
const all = [];
for (const s of specs) {
  const why = {}; let kept = 0;
  for (let seed = s.seeds[0]; seed <= s.seeds[1] && kept < (s.keep || 1); seed++) {
    let res; try { res = generate(s.spec, seed); } catch (e) { res = { ok: false, why: "throw " + e.message }; }
    if (!res.ok) { const k = String(res.why).replace(/R\d+|S\d+|ring_\d+|slide_bar_\d+/g, "#"); why[k] = (why[k] || 0) + 1; continue; }
    kept++;
    const stem = `${s.name}-${seed}`, d = res.design;
    d.name = `${s.title || s.name} #${seed}`; d.author = "rr-gen research 2026-10-15";
    d.notes = (s.idea || "") + ` [auto: ${res.metrics.family}, ${res.metrics.rings}R/${res.metrics.sticks}S, closed ${res.metrics.closed}, stop ${res.metrics.stops}, multiSrc ${res.metrics.multiSrc}, relock ${res.metrics.relock}; route ${res.metrics.drags} drags, prep ${res.metrics.prep}]`;
    fs.writeFileSync(path.join(outDir, stem + ".rrdesign.json"), JSON.stringify(d, null, 2));
    all.push({ stem, spec: s.name, seed, metrics: res.metrics, roles: res.roles, route: res.route.map(r => `${r.label} ${r.kind === "ring" ? r.direction + "→" + r.to : "slide→" + r.to}${r.removedNow ? " (-" + r.removedNow + ")" : ""}`) });
    console.log("kept", stem, JSON.stringify({ R: res.metrics.rings, S: res.metrics.sticks, C: res.metrics.closed, st: res.metrics.stops, ms: res.metrics.multiSrc, rl: res.metrics.relock, ch: res.metrics.chain, d: res.metrics.drags, p: res.metrics.prep, open: res.metrics.useful + "/" + res.metrics.movable }));
  }
  console.log("spec", s.name, "kept", kept, "rejects", JSON.stringify(why));
}
fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(all, null, 1));

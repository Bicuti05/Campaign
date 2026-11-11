"use strict";
// node compare.js <genDir/manifest.json> <campaign-baseline.json> <campaign-naive.json>
// Side-by-side proxies: generated slot N vs the N-th imported campaign level (track A order, 10016/10022 missing).
const fs = require("fs");
const [manFile, baseFile, naiveFile] = process.argv.slice(2);
const man = JSON.parse(fs.readFileSync(manFile, "utf8")), base = JSON.parse(fs.readFileSync(baseFile, "utf8")), nv = JSON.parse(fs.readFileSync(naiveFile, "utf8"));
const nvById = Object.fromEntries(nv.map(x => [x.id, x]));
const camp = base.map(b => Object.assign({}, b, { naivePer: nvById[b.id] && nvById[b.id].naiveDrags != null ? +(nvById[b.id].naiveDrags / nvById[b.id].objects).toFixed(1) : null, useless: nvById[b.id] ? nvById[b.id].naiveUseless : null }));
const lines = ["| Slot | Sinh: V/T/C/K | Sinh: mở đầu | Sinh: kéo bừa/vật · vô ích | Gốc (ID) | Gốc: V/T/C/K | Gốc: mở đầu | Gốc: kéo bừa/vật · vô ích |", "|---|---|---|---|---|---|---|---|"];
man.forEach(m => {
  const c = camp[m.slot - 1];
  lines.push(`| ${m.slot} | ${m.rings}/${m.sticks}/${m.stops}/${m.closed} | ${m.open} | ${m.naivePerObject} · ${m.naiveUseless} | ${c ? c.id : "-"} | ${c ? `${c.rings}/${c.sticks}/${c.stops}/${c.closed}` : "-"} | ${c ? c.useful + "/" + c.movable : "-"} | ${c ? (c.naivePer ?? "ngõ cụt") + " · " + (c.useless ?? "-") : "-"} |`);
});
const avg = (arr, f) => { const v = arr.map(f).filter(x => x != null && !isNaN(x)); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : "-"; };
const ratio = s => { const [u, m] = String(s).split("/").map(Number); return m ? u / m : null; };
const n = Math.min(man.length, camp.length);
lines.push("", `Trung bình ${n} slot đầu — sinh: vòng ${avg(man.slice(0, n), m => m.rings)}, thanh ${avg(man.slice(0, n), m => m.sticks)}, tỷ lệ có tác dụng ${avg(man.slice(0, n), m => ratio(m.open))}, kéo bừa/vật ${avg(man.slice(0, n), m => m.naivePerObject)}, vô ích ${avg(man.slice(0, n), m => m.naiveUseless)}; ` +
  `gốc: vòng ${avg(camp.slice(0, n), c => c.rings)}, thanh ${avg(camp.slice(0, n), c => c.sticks)}, tỷ lệ có tác dụng ${avg(camp.slice(0, n), c => c.movable ? c.useful / c.movable : null)}, kéo bừa/vật ${avg(camp.slice(0, n), c => c.naivePer)}, vô ích ${avg(camp.slice(0, n), c => c.useless)}.`);
console.log(lines.join("\n"));

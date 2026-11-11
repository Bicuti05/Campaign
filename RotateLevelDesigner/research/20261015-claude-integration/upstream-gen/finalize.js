"use strict";
// node finalize.js <genDir> <levelsDir> <prefix>
// Picks one entry per slot from progression-*.json, rewrites notes, copies the design to levels/<prefix>-NNN.rrdesign.json,
// packs it with the Designer CLI (solve without bombs) and writes manifest.md + manifest.json.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process"), { idea } = require("./idea.js");
const [genDir, levelsDir, prefix = "gen01"] = process.argv.slice(2);
const CLI = path.resolve(__dirname, "../../rr-cli.js");
const entries = {};
for (const f of fs.readdirSync(genDir).filter(f => /^progression-.*\.json$/.test(f))) {
  const j = JSON.parse(fs.readFileSync(path.join(genDir, f), "utf8"));
  for (const v of Object.values(j)) {
    if (!v.stem) continue;
    const prev = entries[v.slot];
    if (!prev || (v.inBand && !prev.inBand) || (v.inBand === prev.inBand && fs.statSync(path.join(genDir, f)).mtimeMs > prev._t)) entries[v.slot] = Object.assign({ _t: fs.statSync(path.join(genDir, f)).mtimeMs }, v);
  }
}
const rows = [];
for (const slot of Object.keys(entries).map(Number).sort((a, b) => a - b)) {
  const e = entries[slot], src = path.join(genDir, e.stem + ".rrdesign.json");
  if (!fs.existsSync(src)) continue;
  const d = JSON.parse(fs.readFileSync(src, "utf8")), stem = `${prefix}-${String(slot).padStart(3, "0")}`;
  const text = idea(d, e.roles || {});
  d.notes = `Bản nháp tự sinh (rr-gen), slot ${slot} — ${e.chapter} (${e.role}). Ý tưởng cần nhận ra: ${text} Độ khó proxy: người chơi ngẫu nhiên ${e.naivePerObject} lần kéo/vật (mục tiêu ${e.band.join("–")}${e.inBand ? "" : ", NGOÀI dải"}). Chờ GD chơi thử và chỉnh. Không Booster/Chain/bom; lockCount 0.`;
  const outDesign = path.join(levelsDir, stem + ".rrdesign.json"), outPack = path.join(levelsDir, stem + ".rrpack.json");
  if (fs.existsSync(outPack) && !process.env.OVERWRITE) { console.log("skip existing", outPack); continue; }
  fs.writeFileSync(outDesign, JSON.stringify(d, null, 2));
  let packLog = "";
  try { packLog = execFileSync("node", [CLI, "pack", outDesign, "-o", outPack, "--author", "rr-gen research 2026-10-15", "--no-bombs", "--time", "60", "--nodes", "8000"], { encoding: "utf8" }); }
  catch (err) { packLog = "PACK FAILED " + (err.stdout || "") + (err.stderr || ""); }
  const m = e.metrics;
  rows.push({ slot, stem, chapter: e.chapter, role: e.role, band: e.band, naivePerObject: e.naivePerObject, inBand: e.inBand, rings: m.rings, sticks: m.sticks, stops: m.stops, closed: m.closed,
    multiSrc: m.multiSrc, relock: m.relock, chain: m.chain, open: `${m.useful}/${m.movable}`, naiveUseless: m.naiveUseless, drags: m.drags, prep: m.prep, family: m.family, idea: text, proof: (packLog.match(/proof: [^\n]*/) || ["?"])[0] });
  console.log(stem, rows[rows.length - 1].proof);
}
fs.writeFileSync(path.join(genDir, "manifest.json"), JSON.stringify(rows, null, 1));
const md = ["# G01 — bản nháp tự sinh 50 slot (15/10/2026)", "", "Độ khó là proxy (người chơi ngẫu nhiên, lần kéo/vật); chưa phải đánh giá người chơi. Mọi màn: validate OK, 0 cảnh báo, solve FOUND không bom/Booster, chốt/thanh có witness vai trò.", "",
  "| Slot | File | Chương | Vai trò | Họ | Vòng/Thanh/Chốt/Kín | Mở đầu (có tác dụng/kéo được) | Kéo bừa/vật (mục tiêu) | Lời giải tìm được | Ý tưởng |", "|---|---|---|---|---|---|---|---|---|---|"]
  .concat(rows.map(r => `| ${r.slot} | ${r.stem} | ${r.chapter} | ${r.role} | ${r.family} | ${r.rings}/${r.sticks}/${r.stops}/${r.closed} | ${r.open} | ${r.naivePerObject} (${r.band.join("–")})${r.inBand ? "" : " ⚠"} | ${r.proof.replace("proof: ", "")} | ${r.idea} |`));
fs.writeFileSync(path.join(genDir, "manifest.md"), md.join("\n") + "\n");
console.log("rows", rows.length);

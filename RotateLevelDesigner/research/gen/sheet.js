"use strict";
// Contact sheet: render designs with the Designer renderer into one HTML page, then screenshot it with headless Chrome.
//   node sheet.js out.html out.png <file.rrdesign.json ...>
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process"), RR = require("../../rr-core.js");
const [outHtml, outPng, ...files] = process.argv.slice(2);
const cells = files.map(f => {
  const obj = JSON.parse(fs.readFileSync(f, "utf8")), lv = obj.format === "turp-pack" ? obj.runtime : RR.Design.toLevel(obj).level;
  const world = RR.World.build(lv, { lenient: true });
  let links = null; try { links = new RR.Simulation(lv).snapshot().links; } catch (e) { links = null; }
  const svg = RR.Render.render({ world, level: lv, labels: true, links, width: 360, title: "" });
  return `<figure><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"><figcaption>${path.basename(f).replace(/\.rr(design|pack)\.json$/, "")}<br>${(obj.notes || "").slice(0, 120)}</figcaption></figure>`;
});
const cols = Math.min(5, files.length);
fs.writeFileSync(outHtml, `<!doctype html><meta charset="utf-8"><style>body{margin:8px;font:12px sans-serif;background:#f6f0e4}main{display:grid;grid-template-columns:repeat(${cols},360px);gap:10px}figure{margin:0;background:#fff;border:1px solid #ddd}figure img{width:360px;height:auto;max-height:480px;object-fit:contain;display:block}figcaption{padding:4px 6px;color:#333}</style><main>${cells.join("")}</main>`);
const rows = Math.ceil(files.length / cols);
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(p => fs.existsSync(p));
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--screenshot=" + path.resolve(outPng), `--window-size=${cols * 370 + 20},${rows * 520 + 20}`, "file:///" + path.resolve(outHtml).replace(/\\/g, "/")], { stdio: "ignore", timeout: 60000 });
console.log("wrote", outPng);

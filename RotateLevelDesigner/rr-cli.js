#!/usr/bin/env node
// TURP designer — command line (for Codex and scripts). Same core as the web tool.
//   node rr-cli.js help
"use strict";
const fs = require("fs");
const path = require("path");
const RR = require("./rr-core.js");

const HERE = __dirname;
const REPO = path.resolve(HERE, "..", "..");
const CAMPAIGN_DIR = path.join(REPO, "Assets/_IEC/Config/TURP/Campaign");
const CONTROLLERS = path.join(REPO, "Assets/_IEC/Prefab/_Controllers.prefab");

const HELP = `TURP designer CLI

Usage: node rr-cli.js <command> [args] [options]

  validate <file...>            Check design/runtime/pack files the way the game loads them (+ designer warnings)
  build <design> [-o out]       Design (.rrdesign.json) -> runtime level JSON (schema v1, same as Campaign/Level*.json)
  describe <file> [-o out]      Runtime/pack -> compact design JSON (readable summary; lists non-default geometry in _notes)
  solve <file> [--nodes N] [--time S] [--no-bombs] [--json]
                                Search a route of drags in the simulation (bombs explode on contact unless --no-bombs).
                                Found = finishable; not found != impossible
  render <file> -o out.svg [--links] [--debug] [--grid]
                                Flat SVG picture of the level (collider shapes, mock-up style)
  pack <file> [-o out] [--name N] [--author A] [--notes T] [--no-solve] [--nodes N] [--time S]
                                Build the .rrpack.json to send to Dev (runtime + design + proof + warnings)
  bundle-campaign [-o rr-campaign.js]
                                Read Assets/_IEC/Config/TURP/Campaign + the campaign order in _Controllers.prefab
                                and write rr-campaign.js for the web tool (left panel)
  fish <runtime.json...> [--mark] [--max N]
                                Challenge Fish (canCollect): report the marked rings that something covers or sweeps over.
                                --mark re-marks up to N rings (default 3): clear closed rings first, then clear open rings,
                                then rings only a stick corridor crosses; a ring something can sweep over only if nothing
                                else exists; never a ring covered at the start. Deterministic per levelId.
  golden [test/golden-unity.json]
                                Compare this core with numbers exported by Unity (IEC > TURP > Designer Tool)

Files: a design has "format": "turp-design"; a pack has "format": "turp-pack"; anything else with
"version": 1 + "parts" is a runtime level. Exit code 0 = ok, 1 = failed check, 2 = usage/IO error.`;

function fail(msg, code) { console.error(msg); process.exit(code == null ? 2 : code); }
function readJson(file) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch (e) { fail("Cannot read " + file + ": " + e.message); }
  try { return JSON.parse(text.replace(/^﻿/, "")); } catch (e) { fail(file + ": invalid JSON: " + e.message); }
}
function opt(args, name, fallback) { const i = args.indexOf(name); return i >= 0 && i + 1 < args.length ? args[i + 1] : fallback; }
function flag(args, name) { return args.indexOf(name) >= 0; }
function positional(args) {
  const out = [], withValue = ["-o", "--nodes", "--time", "--name", "--author", "--notes"];
  for (let i = 0; i < args.length; i++) { if (withValue.indexOf(args[i]) >= 0) { i++; continue; } if (args[i].startsWith("--")) continue; out.push(args[i]); }
  return out;
}
function write(file, text) { fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true }); fs.writeFileSync(file, text); console.log("wrote " + file + " (" + text.length + " bytes)"); }

// Any supported file -> { level, design?, meta }
function loadLevel(file) {
  const obj = readJson(file), kind = RR.Design.detectFormat(obj);
  if (kind === "design") { const r = RR.Design.toLevel(obj); return { kind, level: r.level, design: obj, meta: { name: obj.name, author: obj.author, notes: obj.notes } }; }
  if (kind === "pack") return { kind, level: obj.runtime, design: obj.design, meta: { name: obj.name, author: obj.author, notes: obj.notes }, pack: obj };
  if (kind === "runtime") return { kind, level: obj, meta: {} };
  fail(file + ": unknown format (need turp-design, turp-pack or runtime schema v1)");
}

function cmdValidate(args) {
  const files = positional(args); if (!files.length) fail("validate: give at least one file");
  let bad = 0;
  for (const f of files) {
    let r;
    try { r = loadLevel(f); } catch (e) { console.log("FAIL " + f + "\n  " + e.message); bad++; continue; }
    const a = RR.analyze(r.level);
    if (a.error) { console.log("FAIL " + f + " (" + r.kind + ")\n  " + a.error); bad++; continue; }
    const i = a.info;
    console.log("OK   " + f + " (" + r.kind + ") rings " + i.rings + " (closed " + i.closedRings + "), pins " + i.pins + ", links " + i.links + ", stops " + i.stops + ", sticks " + i.sticks + ", guides " + i.guides + ", bombs " + i.bombs);
    a.warnings.forEach(w => console.log("  warn [" + w.code + "] " + w.text));
  }
  process.exit(bad ? 1 : 0);
}

function cmdBuild(args) {
  const [file] = positional(args); if (!file) fail("build: give a design file");
  const obj = readJson(file);
  let r; try { r = RR.Design.toLevel(obj); } catch (e) { fail(file + ": " + e.message, 1); }
  const err = RR.validate(r.level);
  const out = opt(args, "-o", null), text = RR.json.stringify(r.level);
  if (out) write(out, text); else process.stdout.write(text + "\n");
  if (err) { console.error("WARNING: the game would reject this level: " + err); process.exit(1); }
}

function cmdDescribe(args) {
  const [file] = positional(args); if (!file) fail("describe: give a runtime or pack file");
  const r = loadLevel(file), d = RR.Design.fromLevel(r.level, r.meta);
  if (r.meta.name) d.name = r.meta.name; if (r.meta.author) d.author = r.meta.author; if (r.meta.notes) d.notes = r.meta.notes;
  const out = opt(args, "-o", null), text = JSON.stringify(d, null, 2);
  if (out) write(out, text); else process.stdout.write(text + "\n");
}

function solveLevel(level, args) {
  const opts = { nodeLimit: +opt(args, "--nodes", 4000), timeLimitSeconds: +opt(args, "--time", 60), explodeBombs: !flag(args, "--no-bombs") };
  const r = RR.Solver.find(level, opts);
  r.limits = { nodes: opts.nodeLimit, seconds: opts.timeLimitSeconds }; r.explodeBombs = opts.explodeBombs;
  if (r.found) r.route = RR.Solver.describeRoute(level, r.moves, opts.explodeBombs);
  return r;
}
function cmdSolve(args) {
  const [file] = positional(args); if (!file) fail("solve: give a file");
  const r = loadLevel(file), err = RR.validate(r.level);
  if (err) fail("FAIL " + file + ": " + err, 1);
  const res = solveLevel(r.level, args);
  if (flag(args, "--json")) { console.log(JSON.stringify({ found: res.found, drags: res.found ? res.moves.length : null, log: res.log, nodes: res.nodes, seconds: res.seconds, route: res.route || null }, null, 2)); process.exit(res.found ? 0 : 1); }
  console.log((res.found ? "FOUND " : "NOT FOUND ") + file + " — " + res.log + " (" + res.seconds.toFixed(1) + " s)");
  (res.route || []).forEach(s => console.log("  " + s.step + ". " + s.label + " " + (s.kind === "ring" ? s.direction + " to " + s.to + "°" : "slide " + s.direction + " to " + s.to) + (s.removedNow ? "  (removed " + s.removedNow + ", left " + s.remaining + ")" : "")));
  process.exit(res.found ? 0 : 1);
}

function cmdRender(args) {
  const [file] = positional(args); const out = opt(args, "-o", null); if (!file || !out) fail("render: node rr-cli.js render <file> -o out.svg");
  const r = loadLevel(file), world = RR.World.build(r.level, { lenient: true });
  let links = null;
  if (flag(args, "--links")) { try { const sim = new RR.Simulation(r.level); links = sim.snapshot().links; } catch (e) { links = r.level.links.map(l => ({ source: l.sourcePartId, target: l.targetPartId, pin: l.sourceFeatureId, active: true })); } }
  const svg = RR.Render.render({ world, level: r.level, labels: true, links, debug: flag(args, "--debug"), grid: flag(args, "--grid") ? { pitch: RR.C.layout.PITCH, type: "square", step: RR.C.layout.PITCH / 2 } : null, width: 700, title: r.meta.name || ("Level " + r.level.levelId) });
  write(out, svg);
}

function cmdPack(args) {
  const [file] = positional(args); if (!file) fail("pack: give a design or runtime file");
  const r = loadLevel(file), err = RR.validate(r.level);
  if (err) fail("FAIL " + file + ": " + err, 1);
  const meta = { name: opt(args, "--name", r.meta.name || null), author: opt(args, "--author", r.meta.author || null), notes: opt(args, "--notes", r.meta.notes || null) };
  const res = flag(args, "--no-solve") ? null : solveLevel(r.level, args);
  const a = RR.analyze(r.level), design = r.design || RR.Design.fromLevel(r.level, meta);
  const sim = new RR.Simulation(r.level);
  const pack = {
    format: "turp-pack", version: 1, tool: { name: "RotateLevelDesigner CLI", version: "1.0.0", constants: RR.C.exportedAt },
    createdAt: new Date().toISOString(), name: meta.name, author: meta.author, notes: meta.notes, levelId: r.level.levelId,
    runtime: r.level, design,
    proof: res ? { found: res.found, drags: res.found ? res.moves.length : null, route: res.route || null, moves: res.moves.map(m => ({ part: sim.idOf(m.obj), target: m.target })), log: res.log, nodes: res.nodes, seconds: res.seconds, limits: res.limits, explodeBombs: res.explodeBombs } : null,
    analysis: { warnings: a.warnings.map(w => w.text), info: a.info }
  };
  const out = opt(args, "-o", file.replace(/(\.rrdesign)?\.json$/i, "") + ".rrpack.json");
  write(out, RR.json.stringify(pack));
  if (res) console.log(res.found ? "proof: " + res.moves.length + " drags" : "proof: NOT FOUND within limits (" + res.log + ")");
}

function cmdBundle(args) {
  const out = opt(args, "-o", path.join(HERE, "rr-campaign.js"));
  if (!fs.existsSync(CAMPAIGN_DIR)) fail("Campaign folder not found: " + CAMPAIGN_DIR);
  const files = fs.readdirSync(CAMPAIGN_DIR).filter(f => /^Level.+\.json$/.test(f));
  const byGuid = {}, levels = {};
  for (const f of files) {
    const meta = path.join(CAMPAIGN_DIR, f + ".meta");
    if (fs.existsSync(meta)) { const m = /guid: ([0-9a-f]{32})/.exec(fs.readFileSync(meta, "utf8")); if (m) byGuid[m[1]] = f; }
    levels[f.slice(5, -5)] = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, f), "utf8").replace(/^﻿/, ""));
  }
  const order = [];
  if (fs.existsSync(CONTROLLERS)) {
    const prefab = fs.readFileSync(CONTROLLERS, "utf8"), block = /^ {2}sampleLevels:[^\r\n]*\r?\n((?: {2}- [^\r\n]*\r?\n)*)/m.exec(prefab);
    if (block) {
      const guids = [...block[1].matchAll(/guid: ([0-9a-f]{32})/g)].map(m => m[1]);
      guids.forEach((g, i) => { const f = byGuid[g]; if (f) order.push({ ordinal: i + 1, levelId: f.slice(5, -5), file: f }); else order.push({ ordinal: i + 1, levelId: null, file: null, missingGuid: g }); });
    }
  }
  const registered = new Set(order.map(o => o.levelId));
  order.forEach(o => { const l = levels[o.levelId]; if (!l) return; const k = {}; l.parts.forEach(p => { k[p.kind] = (k[p.kind] || 0) + 1; }); o.summary = (k.ring || 0) + "R" + (k.stick ? " " + k.stick + "S" : "") + (k.bomb ? " " + k.bomb + "B" : ""); });
  const bundle = { generatedAt: new Date().toISOString(), source: "Assets/_IEC/Config/TURP/Campaign + _Controllers.prefab sampleLevels", order: order.filter(o => o.levelId), unregistered: Object.keys(levels).filter(id => !registered.has(id)).sort(), levels };
  const text = "// Generated by `node rr-cli.js bundle-campaign` — campaign levels for the designer's left panel. Do not edit.\nwindow.RR_CAMPAIGN = " + JSON.stringify(bundle) + ";\n";
  write(out, text);
  console.log("levels " + Object.keys(levels).length + ", in campaign order " + bundle.order.length + ", outside " + bundle.unregistered.length);
}

// Unity exports test/golden-unity.json (RotateDesignerBridge.cs); compare builder output and simulation traces.
function cmdGolden(args) {
  const file = positional(args)[0] || path.join(HERE, "test", "golden-unity.json");
  const g = readJson(file);
  let fails = 0, checks = 0;
  const TOL = 2e-4;
  function cmp(label, a, b, tol) {
    checks++;
    const bad = diff(a, b, tol == null ? TOL : tol, "");
    if (bad) { fails++; if (fails <= 40) console.log("DIFF " + label + " " + bad); }
  }
  function diff(a, b, tol, p) {
    if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= tol ? null : p + ": js " + a + " vs unity " + b;
    if (Array.isArray(a) && Array.isArray(b)) { if (a.length !== b.length) return p + ": length js " + a.length + " vs unity " + b.length; for (let i = 0; i < a.length; i++) { const d = diff(a[i], b[i], tol, p + "[" + i + "]"); if (d) return d; } return null; }
    if (a && b && typeof a === "object" && typeof b === "object") { for (const k of Object.keys(b)) { const d = diff(a[k], b[k], tol, p + "." + k); if (d) return d; } return null; }
    return a === b ? null : p + ": js " + JSON.stringify(a) + " vs unity " + JSON.stringify(b);
  }
  // 1) builder: every case is (input, unity output)
  (g.builder || []).forEach(c => {
    let js;
    if (c.kind === "ring") { const part = {}; RR.Builder.applyRingGeometry(part, c.radius, c.gap); js = { meshGapDegrees: part.meshGapDegrees, colliderInnerRadius: part.colliderInnerRadius, colliderOuterRadius: part.colliderOuterRadius, dragAreaInnerRadius: part.dragAreaInnerRadius, dragAreaOuterRadius: part.dragAreaOuterRadius, dragAreaPaths: part.dragAreaPaths }; }
    else if (c.kind === "pin") { const ring = {}; RR.Builder.applyRingGeometry(ring, c.radius, 90); const pin = {}; RR.Builder.applyPinGeometry(pin, ring, c.angle, c.length); const lp = RR.Builder.pinLocalPosition(ring, c.angle, c.length); js = { hardBlockPoints: pin.hardBlockPoints, sensorSize: pin.sensorSize, wallSize: pin.wallSize, wallOffsetX: pin.wallOffsetX, localPosition: [lp.x, lp.y] }; }
    else if (c.kind === "stop") { const ring = {}; RR.Builder.applyRingGeometry(ring, c.radius, 90); js = { hardBlockPoints: RR.Builder.stopPinPolygon(ring, c.angle, c.length) }; }
    else if (c.kind === "stick") { const part = {}; RR.Builder.applyStickGeometry(part, RR.Builder.stickPath(c.preset, c.length, c.arm)); js = { pathPoints: part.pathPoints, colliderPoints: part.colliderPoints, dragAreaPoints: part.dragAreaPoints }; }
    else if (c.kind === "guide") { const part = {}; RR.Builder.applyGuideGeometry(part); js = { guideTrigger: part.guideTrigger, guideWalls: part.guideWalls }; }
    else return;
    cmp("builder " + c.kind + " " + JSON.stringify(c.input || {}), js, c.unity);
  });
  // 2) simulation traces on real levels: initial link activity, then exploratory drags from the start state
  (g.levels || []).forEach(L => {
    const level = L.level || readJson(path.join(REPO, L.path));
    let sim;
    try { sim = RR.Solver.newSim(level, false); } catch (e) { fails++; console.log("FAIL " + L.levelId + " js cannot build: " + e.message); return; }
    cmp(L.levelId + " initial links", sim.graph.active.slice(), L.initialActive, 0);
    (L.explores || []).forEach(x => {
      const s = RR.Solver.newSim(level, false), obj = s.indexOf(x.part);
      if (obj < 0) { fails++; console.log("FAIL " + L.levelId + " missing " + x.part); return; }
      const reached = RR.Solver.explore(s, obj, x.dir);
      const solved = []; for (let o = 0; o < s.objectCount(); o++) if (s.isSolved(o)) solved.push(s.idOf(o));
      const stick = s.isStick(obj), label = L.levelId + " explore " + x.part + (x.dir > 0 ? "+" : "-");
      // Ring angles are compared modulo 360 (359.99998 and 0 are the same pose). "reached" is the pointer where the exploration stopped:
      // float32 (C#) and double (JS) sums of the 3-degree / 0.1 steps can stop one sample apart at the travel limit, so one step is tolerated.
      const pose = stick ? s.offsetOf(obj) : s.angleOf(obj), poseDiff = stick ? Math.abs(pose - x.pose) : Math.abs(RR.M.deltaAngle(pose, x.pose));
      const oneStepApart = !isNaN(reached) && x.reached != null && Math.abs(reached - x.reached) > 1e-3;   // then the pose may be one step apart too
      cmp(label + " pose", poseDiff, 0, oneStepApart ? (stick ? 0.1001 : 3.0001) : (stick ? 0.02 : 0.6));
      cmp(label + " reached", isNaN(reached) || x.reached == null ? (isNaN(reached) === (x.reached == null) ? 0 : 1e9) : Math.abs(reached - x.reached), 0, stick ? 0.1001 : 3.0001);
      cmp(label + " locks", { solved, active: s.graph.active.slice() }, { solved: x.solved, active: x.active }, 0);
    });
    if (L.solution) {
      const s = RR.Solver.newSim(level, false);
      L.solution.forEach(m => RR.Solver.apply(s, { obj: s.indexOf(m.part), target: m.target }));
      cmp(L.levelId + " unity route replayed in js solves", s.allSolved(), true, 0);
    }
  });
  console.log((fails ? "FAIL" : "PASS") + " golden: " + (checks - fails) + "/" + checks + " checks match (" + file + ", exported " + (g.exportedAt || "?") + ")");
  process.exit(fails ? 1 : 0);
}

function cmdFish(args) {
  const files = positional(args), mark = flag(args, "--mark"), maxAt = args.indexOf("--max"), max = maxAt >= 0 ? +args[maxAt + 1] : 3;
  if (!files.length) fail("fish: no file");
  let bad = 0;
  files.forEach(file => {
    const text = fs.readFileSync(file, "utf8"), level = JSON.parse(text), check = RR.Fish.check(level);
    if (!mark) {
      const marked = new Set(level.parts.filter(p => p.canCollect).map(p => p.partId));
      check.filter(f => marked.has(f.id) && (f.hard.length || f.sweep.length)).forEach(f => { bad++; console.log(file + ": " + f.id + (f.hard.length ? " covered by " + f.hard.join(", ") : " swept by " + f.sweep.join(", "))); });
      return;
    }
    // seeded shuffle inside each tier so a re-run gives the same marks
    let seed = 2166136261; for (const ch of String(level.levelId)) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
    const rnd = () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) >>> 0) / 4294967296);
    const tiers = [0, 1, 2, 3].map(t => check.filter(f => f.tier === t).map(f => ({ f, k: rnd() })).sort((a, b) => a.k - b.k).map(x => x.f));
    let pick = tiers[0].concat(tiers[1], tiers[2]).slice(0, max);
    if (!pick.length) pick = tiers[3].slice(0, 1);
    const ids = new Set(pick.map(f => f.id));
    // edit the text in place (minimal diff): drop old flags, add one after the "kind": "ring" line of each pick
    const CR = String.fromCharCode(13), LF = String.fromCharCode(10), nl = text.includes(CR + LF) ? CR + LF : LF, out = []; let cur = null;
    for (const line of text.split(nl)) {
      if (/^\s*"canCollect": (true|false),?$/.test(line)) continue;
      const m = /^\s*"partId": "(.*)",$/.exec(line); if (m) cur = m[1];
      out.push(line);
      if (ids.has(cur) && /^\s*"kind": "ring",$/.test(line)) { out.push(line.slice(0, line.length - line.trimStart().length) + '"canCollect": true,'); cur = null; }
    }
    let result = out.join(nl), back = JSON.parse(result);
    if (back.parts.filter(p => p.canCollect).length !== ids.size) { level.parts.forEach(p => { if (ids.has(p.partId)) p.canCollect = true; else delete p.canCollect; }); result = RR.json.stringify(level); }
    fs.writeFileSync(file, result);
    console.log(file + ": " + pick.map(f => f.id + (f.closed ? " (closed)" : "") + (f.tier === 3 ? " (sweep!)" : "")).join(", ") + (pick.length < max ? "  [only " + pick.length + " usable]" : ""));
  });
  if (bad) process.exit(1);
}

const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case "validate": cmdValidate(rest); break;
  case "build": cmdBuild(rest); break;
  case "describe": cmdDescribe(rest); break;
  case "solve": cmdSolve(rest); break;
  case "render": cmdRender(rest); break;
  case "pack": cmdPack(rest); break;
  case "bundle-campaign": cmdBundle(rest); break;
  case "golden": cmdGolden(rest); break;
  case "fish": cmdFish(rest); break;
  case undefined: case "help": case "--help": case "-h": console.log(HELP); break;
  default: fail("Unknown command " + cmd + "\n\n" + HELP);
}

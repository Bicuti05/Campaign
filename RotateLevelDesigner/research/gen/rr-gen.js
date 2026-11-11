"use strict";
// TURP — rule-based level generator (research, 15/10/2026).
// Writes .rrdesign.json candidates from layout rules measured on the 384 reference prefabs
// (Research_DoKho/TURP_DoKho_BoCuc.md §5) and checks them with the Designer core only.
// It does not change core/, constants or campaign files.
const RR = require("../../rr-core.js");
const { structure, solve, openings, naive } = require("./rr-metrics.js");

const P = 4.5854;          // centre distance at which a pin pointing at a neighbour locks it
const D = 2.8354;          // pin centre distance from its owner's centre
const COLORS = ["orange", "red", "blue", "sky", "purple", "green", "navy", "teal"];

// ---------- small helpers ----------
function mulberry32(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const norm = a => ((a % 360) + 360) % 360;
const angDist = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
const round4 = x => Math.round(x * 10000) / 10000;
const dirOf = (a, b) => norm(Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI);
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
function shuffle(r, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- layouts (ring centres) ----------
// Every family keeps the measured invariants: radius 1.75, neighbours exactly P apart.
function connected(pts) {
  if (!pts.length) return false; const seen = new Set([0]), st = [0];
  while (st.length) { const v = st.pop(); pts.forEach((q, i) => { if (!seen.has(i) && Math.abs(Math.hypot(q.x - pts[v].x, q.y - pts[v].y) - P) < 0.02) { seen.add(i); st.push(i); } }); }
  return seen.size === pts.length;
}
// mirror-symmetric removal of cells from a full grid (symmetry is common in ring-only grids, rare in mixed levels)
function carve(r, cells, removeFrac, symmetric, cx) {
  for (let tries = 0; tries < 40; tries++) {
    const keep = new Set(cells.map((_, i) => i)), order = shuffle(r, cells.map((_, i) => i)), target = Math.floor(cells.length * removeFrac);
    let removed = 0;
    for (const i of order) {
      if (removed >= target || !keep.has(i)) continue;
      const mates = [i];
      if (symmetric) { const m = cells.findIndex(c => Math.abs(c.x - (2 * cx - cells[i].x)) < 1e-3 && Math.abs(c.y - cells[i].y) < 1e-3); if (m >= 0 && m !== i) mates.push(m); }
      mates.forEach(k => keep.delete(k));
      if (!connected([...keep].map(k => cells[k]))) { mates.forEach(k => keep.add(k)); continue; }
      removed += mates.length;
    }
    const out = [...keep].map(k => cells[k]); if (connected(out)) return out;
  }
  return cells;
}
function squareLayout(r, spec) {
  const C = spec.cols, R = spec.rows, cells = [];
  for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) cells.push({ x: i * P, y: -j * P });
  return { pts: carve(r, cells, spec.remove || 0, spec.symmetric || spec.mirror, (C - 1) * P / 2), dirs: [0, 90, 180, 270], gapStep: 45, family: "square" };
}
function diamondLayout(r, spec) {
  const sq = squareLayout(r, spec), c = Math.SQRT1_2;
  return { pts: sq.pts.map(p => ({ x: round4((p.x - p.y) * c), y: round4((p.x + p.y) * c) })), dirs: [45, 135, 225, 315], gapStep: 45, family: "diamond" };
}
function hexLayout(r, spec) {
  // even rows: C rings; odd rows: C-1 rings shifted by P/2 -> mirror symmetric about the same centre
  const C = spec.cols, R = spec.rows, h = P * Math.sqrt(3) / 2, cells = [];
  for (let j = 0; j < R; j++) { const odd = j % 2 === 1, n = odd ? C - 1 : C; for (let i = 0; i < n; i++) cells.push({ x: round4(i * P + (odd ? P / 2 : 0)), y: round4(-j * h) }); }
  return { pts: carve(r, cells, spec.remove || 0, spec.symmetric, (C - 1) * P / 2), dirs: [0, 60, 120, 180, 240, 300], gapStep: 30, family: "hex" };
}
// free growth like 10005/10009: each new ring sits P away from a parent at a 15°-step angle
function organicLayout(r, spec) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const pts = [{ x: 0, y: 0 }], step = spec.angleStep || 15;
    let fails = 0;
    while (pts.length < spec.rings && fails < 400) {
      const parent = pick(r, pts), cx = pts.reduce((t, p) => t + p.x, 0) / pts.length, cy = pts.reduce((t, p) => t + p.y, 0) / pts.length;
      const cands = []; for (let a = 0; a < 360; a += step) cands.push({ a, x: round4(parent.x + P * Math.cos(a * Math.PI / 180)), y: round4(parent.y + P * Math.sin(a * Math.PI / 180)) });
      for (let k = cands.length - 1; k >= 0; k--) { const c = cands[k]; if (!pts.every(p => { const d = Math.hypot(p.x - c.x, p.y - c.y); return Math.abs(d - P) < 0.01 || d >= 5.6; })) cands.splice(k, 1); }
      if (!cands.length) { fails++; continue; }
      cands.forEach(c => { c.d = Math.hypot(c.x - cx, (c.y - cy) * (spec.tall || 0.7)) + r() * (spec.loose || 2.5); }); cands.sort((u, v) => u.d - v.d);
      const q = cands[Math.floor(r() * Math.min(3, cands.length))];
      // clean spacing: either exactly a neighbour (P) or clearly apart (>= 5.6) — no near-contact
      const ok = pts.every(p => { const d = Math.hypot(p.x - q.x, p.y - q.y); return Math.abs(d - P) < 0.01 || d >= 5.6; });
      if (!ok) { fails++; continue; }
      pts.push(q);
    }
    if (pts.length < spec.rings) continue;
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y), w = Math.max(...xs) - Math.min(...xs) + 4, hgt = Math.max(...ys) - Math.min(...ys) + 4;
    if (w / hgt > (spec.maxAspect || 1.0)) continue;   // portrait boards (median width/height 0.78 in the reference)
    return { pts, dirs: null, gapStep: 15, family: "organic" };
  }
  return null;
}
const LAYOUTS = { square: squareLayout, diamond: diamondLayout, hex: hexLayout, organic: organicLayout };

// ---------- pin graph ----------
function neighbourEdges(pts) {
  const e = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (Math.abs(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) - P) < 0.02) e.push([i, j]);
  return e;
}
// gap centre must stay >= 90° from every pin direction at the ring (own pins: 45° margin to the gap edge,
// incoming pins: engaged at start with the same margin). Closed rings need no gap but may only own pins.
function gapOptions(dirsAtRing, step) {
  const out = [];
  for (let a = 0; a < 360; a += step) if (dirsAtRing.every(d => angDist(a, d) >= 90 - 1e-6)) out.push(a);
  return out;
}
function orient(r, n, edges, spec) {
  // random spanning tree (keeps one cluster) + extra edges -> converging/shared pins
  const adj = Array.from({ length: n }, () => []); edges.forEach(([a, b], k) => { adj[a].push(k); adj[b].push(k); });
  const inTree = new Set([Math.floor(r() * n)]), chosen = new Set(), inTreeEdge = new Set();
  while (inTree.size < n) {
    const frontier = edges.map((e, k) => k).filter(k => inTree.has(edges[k][0]) !== inTree.has(edges[k][1]));
    if (!frontier.length) return null;
    const k = pick(r, frontier); chosen.add(k); inTreeEdge.add(k); inTree.add(edges[k][0]); inTree.add(edges[k][1]);
  }
  edges.forEach((_, k) => { if (!chosen.has(k) && r() < (spec.extraEdges || 0)) chosen.add(k); });
  // orientation by a random rank: always a DAG (a directed pin cycle would freeze every ring in it)
  const rank = Array.from({ length: n }, () => r());
  return [...chosen].map(k => { const [a, b] = edges[k]; const arc = rank[a] < rank[b] ? [a, b] : [b, a]; arc.extra = !inTreeEdge.has(k); return arc; });
}

function buildDesign(r, layout, spec) {
  const pts = layout.pts, n = pts.length, edges = neighbourEdges(pts);
  let arcs = orient(r, n, edges, spec); if (!arcs) return { error: "no tree" };
  // thin out extra (non-tree) arcs at rings that would have no room for a gap
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < n; i++) {
      const mine = arcs.filter(a => a[0] === i || a[1] === i), dirs = mine.map(a => dirOf(pts[i], pts[a[0] === i ? a[1] : a[0]]));
      const pureSource = !arcs.some(a => a[1] === i);
      if (pureSource || gapOptions(dirs, spec.gapStep || layout.gapStep).length) continue;
      const extra = mine.filter(a => a.extra);
      if (extra.length) { const drop = pick(r, extra); arcs = arcs.filter(a => a !== drop); continue; }
      // still no room: make this ring a pure source (it may then be closed). A ring with no incoming arc cannot sit on a pin cycle.
      arcs.forEach(a => { if (a[1] === i) { const t = a[0]; a[0] = i; a[1] = t; } });
    }
  }
  const outs = Array.from({ length: n }, () => []), ins = Array.from({ length: n }, () => []);
  arcs.forEach(([s, t]) => { outs[s].push(t); ins[t].push(s); });
  if (outs.some(o => o.length > (spec.maxOut || 4)) || ins.some(i => i.length > (spec.maxIn || 3))) return { error: "degree cap" };
  // gaps and closed rings
  let closedBudget = spec.closed || 0;
  const rings = pts.map((p, i) => ({ id: "R" + (i + 1), x: round4(p.x), y: round4(p.y), gap: 90, gapDir: 0, pins: [] }));
  const order = shuffle(r, rings.map((_, i) => i));
  for (const i of order) {
    const dirs = outs[i].map(t => dirOf(pts[i], pts[t])).concat(ins[i].map(s => dirOf(pts[i], pts[s])));
    const pureSource = ins[i].length === 0;
    if (pureSource && closedBudget > 0 && r() < (spec.closedBias || 0.6)) { rings[i].gap = 0; rings[i].gapDir = 90; closedBudget--; continue; }
    const step = spec.gapStep || layout.gapStep, opts = gapOptions(dirs, step);
    if (!opts.length) { if (pureSource && (spec.allowForcedClosed !== false)) { rings[i].gap = 0; rings[i].gapDir = 90; continue; } return { error: "no gap for " + rings[i].id }; }
    // prefer axis-aligned gaps (55% of reference rings are rotated by a multiple of 90°)
    const axis = opts.filter(a => a % 90 === 0), pool = axis.length && r() < (spec.axisGapBias || 0.6) ? axis : opts;
    rings[i].gapDir = pick(r, pool);
  }
  arcs.forEach(([s, t]) => rings[s].pins.push({ angle: round4(dirOf(pts[s], pts[t])), target: rings[t].id }));
  // colours: neighbours differ
  const nb = Array.from({ length: n }, () => new Set()); edges.forEach(([a, b]) => { nb[a].add(b); nb[b].add(a); });
  const palette = shuffle(r, COLORS), count = Object.fromEntries(palette.map(c => [c, 0]));
  rings.forEach((g, i) => { const used = new Set([...nb[i]].map(j => rings[j].color).filter(Boolean)); const free = palette.filter(c => !used.has(c)).sort((a, b) => count[a] - count[b]); g.color = free[0] || palette[i % palette.length]; count[g.color]++; });
  return { design: { format: "turp-design", version: 1, levelId: "draft", rings, sticks: [] }, outs, ins, pts, edges };
}

// Mirror-symmetric variant (vertical axis): positions, pins, gaps, closed rings and colours mirror each other,
// like the symmetric ring grids and the "Khó" level seen in the reference screenshots (M19, M49).
function mirrorMap(pts) {
  const xs = pts.map(p => p.x), cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const m = pts.map(p => pts.findIndex(q => Math.abs(q.x - (2 * cx - p.x)) < 0.05 && Math.abs(q.y - p.y) < 0.05));
  return m.some(i => i < 0) ? null : m;
}
function buildMirrored(r, layout, spec) {
  const pts = layout.pts, n = pts.length, edges = neighbourEdges(pts), m = mirrorMap(pts);
  if (!m) return { error: "layout not mirror-symmetric" };
  const key = (a, b) => a < b ? a + "-" + b : b + "-" + a, edgeIdx = new Map(edges.map(([a, b], k) => [key(a, b), k]));
  const mirrorEdge = k => edgeIdx.get(key(m[edges[k][0]], m[edges[k][1]]));
  const crossing = k => m[edges[k][0]] === edges[k][1];
  const rank = new Array(n); for (let i = 0; i < n; i++) if (rank[i] == null) { rank[i] = r(); rank[m[i]] = rank[i]; }
  // spanning tree that avoids axis-crossing pairs when it can, closed under mirroring
  const root = Math.floor(r() * n), chosen = new Set(), tree = new Set();
  const reach = () => { const seen = new Set([root]), st = [root]; while (st.length) { const v = st.pop(); chosen.forEach(k => { const [p, q] = edges[k]; const o = p === v ? q : q === v ? p : -1; if (o >= 0 && !seen.has(o)) { seen.add(o); st.push(o); } }); } return seen; };
  let inTree = reach();
  while (inTree.size < n) {
    const frontier = edges.map((e, k) => k).filter(k => inTree.has(edges[k][0]) !== inTree.has(edges[k][1]));
    if (!frontier.length) return { error: "no tree" };
    const plain = frontier.filter(k => !crossing(k)), k = pick(r, plain.length ? plain : frontier);
    [k, mirrorEdge(k)].forEach(e => { chosen.add(e); tree.add(e); });
    inTree = reach();
  }
  edges.forEach((_, k) => { if (!chosen.has(k) && !crossing(k) && k <= mirrorEdge(k) && r() < (spec.extraEdges || 0)) { chosen.add(k); chosen.add(mirrorEdge(k)); } });
  let arcs = [...chosen].map(k => { const [a, b] = edges[k]; let arc = rank[a] < rank[b] ? [a, b] : rank[b] < rank[a] ? [b, a] : (pts[a].x < pts[b].x ? [a, b] : [b, a]); arc.extra = !tree.has(k); arc.k = k; return arc; });
  for (let pass = 0; pass < 5; pass++) for (let i = 0; i < n; i++) {
    const mine = arcs.filter(a => a[0] === i || a[1] === i), dirs = mine.map(a => dirOf(pts[i], pts[a[0] === i ? a[1] : a[0]]));
    if (!arcs.some(a => a[1] === i) || gapOptions(dirs, spec.gapStep || layout.gapStep).length) continue;
    const extra = mine.filter(a => a.extra);
    if (extra.length) { const drop = pick(r, extra), mk = mirrorEdge(drop.k); arcs = arcs.filter(a => a.k !== drop.k && a.k !== mk); continue; }
    arcs.forEach(a => { [i, m[i]].forEach(v => { if (a[1] === v) { const t = a[0]; a[0] = v; a[1] = t; } }); });
  }
  const outs = Array.from({ length: n }, () => []), ins = Array.from({ length: n }, () => []);
  arcs.forEach(([s, t]) => { outs[s].push(t); ins[t].push(s); });
  if (outs.some(o => o.length > (spec.maxOut || 4)) || ins.some(i => i.length > (spec.maxIn || 3))) return { error: "degree cap" };
  const rings = pts.map((p, i) => ({ id: "R" + (i + 1), x: round4(p.x), y: round4(p.y), gap: 90, gapDir: 0, pins: [] }));
  let closedBudget = spec.closed || 0;
  const step = spec.gapStep || layout.gapStep, dirsOf = i => outs[i].map(t => dirOf(pts[i], pts[t])).concat(ins[i].map(s => dirOf(pts[i], pts[s])));
  for (const i of shuffle(r, rings.map((_, i) => i).filter(i => i <= m[i]))) {
    const j = m[i], pureSource = ins[i].length === 0 && ins[j].length === 0, cost = i === j ? 1 : 2;
    if (pureSource && closedBudget >= cost && r() < (spec.closedBias || 0.6)) { [i, j].forEach(v => { rings[v].gap = 0; rings[v].gapDir = 90; }); closedBudget -= cost; continue; }
    let opts = gapOptions(dirsOf(i), step).filter(a => gapOptions(dirsOf(j), step).includes(norm(180 - a)));
    if (i === j) opts = opts.filter(a => a === 90 || a === 270);
    if (!opts.length) { if (pureSource) { [i, j].forEach(v => { rings[v].gap = 0; rings[v].gapDir = 90; }); continue; } return { error: "no gap for " + rings[i].id }; }
    const axis = opts.filter(a => a % 90 === 0), a = pick(r, axis.length && r() < (spec.axisGapBias || 0.6) ? axis : opts);
    rings[i].gapDir = a; rings[j].gapDir = norm(180 - a);
  }
  arcs.forEach(([s, t]) => rings[s].pins.push({ angle: round4(dirOf(pts[s], pts[t])), target: rings[t].id }));
  const nb = Array.from({ length: n }, () => new Set()); edges.forEach(([a, b]) => { nb[a].add(b); nb[b].add(a); });
  const palette = shuffle(r, COLORS), count = Object.fromEntries(palette.map(c => [c, 0]));
  rings.forEach((g, i) => {
    if (g.color) return;
    const used = new Set([...nb[i], ...nb[m[i]]].map(j => rings[j].color).filter(Boolean)), free = palette.filter(c => !used.has(c)).sort((a, b) => count[a] - count[b]);
    g.color = free[0] || palette[i % palette.length]; count[g.color]++;
    if (m[i] !== i) { rings[m[i]].color = nb[i].has(m[i]) ? (free[1] || palette[(i + 1) % palette.length]) : g.color; count[rings[m[i]].color]++; }
  });
  return { design: { format: "turp-design", version: 1, levelId: "draft", rings, sticks: [] }, outs, ins, pts, edges, mirror: m };
}

// ---------- gates (Designer core only) ----------
function toLevel(design) { return RR.Design.toLevel(design).level; }
function hitReachable(level) {
  // every ring/stick must have a point of its own body that the hit test picks (players must be able to grab it)
  const sim = new RR.Simulation(level), w = sim.world;
  for (let o = 0; o < sim.objectCount(); o++) {
    let ok = false;
    if (!sim.isStick(o)) { const g = w.rings[o]; for (let a = 0; a < 360 && !ok; a += 6) { const p = { x: g.center.x + 1.75 * Math.cos(a * Math.PI / 180), y: g.center.y + 1.75 * Math.sin(a * Math.PI / 180) }; if (sim.hitTest(p) === o) ok = true; } }
    else { const st = w.stickOf(o), ax = RR.W.stickAxis(st); for (let t = -3; t <= 3 && !ok; t += 0.25) { const p = { x: st.origin.x + ax.x * t, y: st.origin.y + ax.y * t }; if (sim.hitTest(p) === o) ok = true; } }
    if (!ok) return sim.idOf(o);
  }
  return null;
}
function stopFeetOk(design, level) {
  const sim = new RR.Simulation(level), w = sim.world, bad = [];
  design.rings.forEach((r, ri) => {
    if (!r.stops || !r.stops.length) return;
    const g = w.rings[sim.indexOf(level.parts.filter(p => p.kind === "ring")[ri].partId)];
    const quads = g.worldQuads.filter((q, i) => g.quadKind[i] === RR.KIND.STOP);
    quads.forEach(q => { const foot = RR.M.mul(RR.M.add(q[0], q[q.length - 1]), 0.5); if (!(RR.M.arcSdf(g.arc, foot) < 0 && RR.M.minSdfArcOverConvex(g.arc, q) < 0)) bad.push(r.id); });
  });
  return bad;
}
function gates(design) {
  let level; try { level = toLevel(design); } catch (e) { return { ok: false, why: "build: " + e.message }; }
  const a = RR.analyze(level);
  if (a.error) return { ok: false, why: "validate: " + a.error };
  if (a.warnings.length) return { ok: false, why: "warn: " + a.warnings.map(w => w.code + ":" + w.part).slice(0, 3).join(",") };
  for (const r of design.rings) if (r.gap !== 0) for (const p of r.pins) if (angDist(p.angle, r.gapDir) - r.gap / 2 < 45 - 1e-6) return { ok: false, why: "pin near gap " + r.id };
  const feet = stopFeetOk(design, level); if (feet.length) return { ok: false, why: "stop foot " + feet[0] };
  const unreachable = hitReachable(level); if (unreachable) return { ok: false, why: "no grab point " + unreachable };
  return { ok: true, level, info: a.info };
}

// ---------- role witnesses for optional mechanics ----------
// Signature of every single drag from a state: where the pointer ends and whether the dragged part leaves.
function dragOutcomes(level, moves, onlyIds) {
  const base = RR.Solver.replay(level, moves, false), out = {};
  for (let o = 0; o < base.objectCount(); o++) {
    const id = base.idOf(o); if (onlyIds && !onlyIds.has(id)) continue;
    if (base.isSolved(o)) { out[id] = "solved"; continue; }
    if (base.isMovementLocked(o)) { out[id] = "frozen"; continue; }
    const sig = [];
    for (const dir of [1, -1]) { const s = RR.Solver.replay(level, moves, false), t = RR.Solver.explore(s, o, dir); sig.push(isNaN(t) ? "x" : (s.isStick(o) ? t.toFixed(1) : String(Math.round(t / 3) * 3)) + (s.isSolved(o) ? "*" : "")); }
    out[id] = sig.join("/");
  }
  return out;
}
// Mechanic M has a role if, in some state along the found route, removing M changes what a drag of `watch` parts does.
function roleWitness(withLevel, withoutLevel, moves, watchIds) {
  const ids = new Set(watchIds);
  for (let k = 0; k <= moves.length; k++) {
    const pre = moves.slice(0, k);
    let a, b; try { a = dragOutcomes(withLevel, pre, ids); b = dragOutcomes(withoutLevel, remap(withLevel, withoutLevel, pre), ids); } catch (e) { continue; }
    for (const id of ids) if (a[id] && b[id] && a[id] !== b[id] && a[id] !== "solved" && b[id] !== "solved") return { step: k, part: id, with: a[id], without: b[id] };
  }
  return null;
}
function remap(fromLevel, toLevelObj, moves) {
  const sa = new RR.Simulation(fromLevel), sb = new RR.Simulation(toLevelObj);
  return moves.map(m => ({ obj: sb.indexOf(sa.idOf(m.obj)), target: m.target })).filter(m => m.obj >= 0);
}
function partIdOfRing(design, level, ringLabel) { const i = design.rings.findIndex(r => r.id === ringLabel); return level.parts.filter(p => p.kind === "ring")[i].partId; }

// Try to add stop pins on rotating rings; keep only those with a witness on the found route.
function addStops(r, design, count, budget) {
  const added = [];
  for (let tries = 0; tries < (budget.stopTries || 30) && added.length < count; tries++) {
    // reference (48 campaign levels): 95/96 stops are 1.47 long, 81% on rings that only receive pins,
    // centre 60–180° from the gap centre with most at 60–90° (right beside a gap edge)
    const targets = design.rings.filter(g => g.gap !== 0 && !g.pins.length), others = design.rings.filter(g => g.gap !== 0 && g.pins.length);
    const pool = targets.length && (r() < 0.85 || !others.length) ? targets : others;
    if (!pool.length) break;
    const g = pick(r, pool), off = pick(r, [60, 60, 75, 75, 90, 90, 105, 120, 135, 150, 165, 180]) * (r() < 0.5 ? 1 : -1);
    let a = norm(g.gapDir + off);
    const gi = design.rings.indexOf(g), mj = budget.mirror ? budget.mirror[gi] : -1;
    if (mj === gi) { a = pick(r, [90, 270]); if (angDist(a, g.gapDir) < 60) continue; }      // ring on the mirror axis: stop on the axis
    if ((g.stops || []).some(s => angDist(s.angle, a) < 40)) continue;
    const trial = JSON.parse(JSON.stringify(design)), tg = trial.rings.find(x => x.id === g.id);
    tg.stops = (tg.stops || []).concat([{ angle: round4(a), length: budget.stopLength || 1.47 }]);
    if (mj >= 0 && mj !== gi) { const tm = trial.rings[mj]; tm.stops = (tm.stops || []).concat([{ angle: round4(norm(180 - a)), length: budget.stopLength || 1.47 }]); }
    const gt = gates(trial); if (!gt.ok) continue;
    const sol = solve(gt.level, { timeLimitSeconds: budget.quickSeconds || 6, nodeLimit: budget.quickNodes || 1500 });
    if (!sol.found) continue;
    const without = toLevel(design), w = roleWitness(gt.level, without, sol.moves, [partIdOfRing(trial, gt.level, g.id)]);
    if (!w) continue;
    design.rings.find(x => x.id === g.id).stops = tg.stops; added.push({ ring: g.id, angle: a, witness: w });
    if (mj >= 0 && mj !== gi) { design.rings[mj].stops = trial.rings[mj].stops; added.push({ ring: design.rings[mj].id, angle: norm(180 - a), mirrorOf: g.id }); }
  }
  return added;
}

// Straight sticks on free lattice slots next to boundary rings: the ring's pin locks the stick, the stick slides on its own axis.
function addSticks(r, design, layout, count, budget) {
  const added = [], pts = design.rings.map(g => ({ x: g.x, y: g.y }));
  const dirs = layout.dirs || [0, 90, 180, 270];
  for (let tries = 0; tries < (budget.stickTries || 30) && added.length < count; tries++) {
    const i = Math.floor(r() * pts.length), g = design.rings[i];
    if (g.gap === 0 && r() < 0.5) continue;
    const dir = pick(r, dirs), empty = !pts.some(p => Math.abs(p.x - (pts[i].x + P * Math.cos(dir * Math.PI / 180))) < 0.05 && Math.abs(p.y - (pts[i].y + P * Math.sin(dir * Math.PI / 180))) < 0.05);
    if (!empty) continue;
    if (g.gap !== 0 && angDist(dir, g.gapDir) - g.gap / 2 < 45) continue;
    if (g.pins.some(p => angDist(p.angle, dir) < 1)) continue;
    // stick centre on the pin, axis across it; optionally shifted so a second ring's pin can also reach it
    const ux = Math.cos(dir * Math.PI / 180), uy = Math.sin(dir * Math.PI / 180), shift = pick(r, [0, P / 2, -P / 2]);
    const cx = pts[i].x + D * ux - uy * shift, cy = pts[i].y + D * uy + ux * shift;
    const id = "S" + (design.sticks.length + 1);
    const trial = JSON.parse(JSON.stringify(design));
    trial.rings[i].pins.push({ angle: round4(dir), target: id });
    trial.sticks.push({ id, shape: "straight", x: round4(cx), y: round4(cy), angle: round4(norm(dir + 90)), color: pick(r, COLORS) });
    // a second ring on the same side may pin the stick too (shared target)
    const mate = pts.findIndex((p, k) => k !== i && Math.abs((p.x + D * ux) - (pts[i].x + D * ux) - (-uy * 2 * shift)) < 0.05 && Math.abs((p.y + D * uy) - (pts[i].y + D * uy) - (ux * 2 * shift)) < 0.05);
    if (mate >= 0 && shift !== 0 && r() < 0.6) {
      const m = trial.rings[mate];
      if (!(m.gap !== 0 && angDist(dir, m.gapDir) - m.gap / 2 < 45) && !m.pins.some(p => angDist(p.angle, dir) < 1)) m.pins.push({ angle: round4(dir), target: id });
    }
    const gt = gates(trial); if (!gt.ok) continue;
    const sol = solve(gt.level, { timeLimitSeconds: budget.quickSeconds || 6, nodeLimit: budget.quickNodes || 1500 });
    if (!sol.found) continue;
    // role: the stick must change what some ring other than its pin owners can do (blocking / ordering), not just hold its owner
    const owners = trial.rings.filter(x => x.pins.some(p => p.target === id)).map(x => partIdOfRing(trial, gt.level, x.id));
    const others = gt.level.parts.filter(p => p.kind === "ring" && !owners.includes(p.partId)).map(p => p.partId);
    const stripped = JSON.parse(JSON.stringify(trial)); stripped.sticks = stripped.sticks.filter(s => s.id !== id); stripped.rings.forEach(x => { x.pins = x.pins.filter(p => p.target !== id); });
    let without; try { without = toLevel(stripped); } catch (e) { continue; }
    const w = roleWitness(gt.level, without, sol.moves, others);
    // or: the stick cannot leave with one drag at the start (its way out is blocked until something else moves)
    const stickIdx = gt.level.parts.filter(p => p.kind === "stick").findIndex(p => p.partId === gt.level.parts.filter(q => q.kind === "stick").slice(-1)[0].partId);
    let gated = null;
    { const s0 = new RR.Simulation(gt.level), o = s0.ringCount() + stickIdx; let leaves = false;
      for (const dir of [1, -1]) { const s = RR.Solver.newSim(gt.level, false); RR.Solver.explore(s, o, dir); if (s.isSolved(o)) leaves = true; }
      if (!leaves) gated = { blockedAtStart: true }; }
    const holdsSource = trial.rings.some(x => x.pins.some(p => p.target === id) && design.rings.find(y => y.id === x.id).pins.length > 0);
    if (!w && !gated && !(budget.acceptHoldingSticks && holdsSource)) continue;
    design.rings = trial.rings; design.sticks = trial.sticks; added.push({ stick: id, owners: owners.length, witness: w || gated, holdsSource });
  }
  return added;
}

// Guide-held sticks (223/281 reference sticks): a straight or L stick held by one guide at its origin, slides on the guide axis.
// Positions are sampled around the rings and kept only when the simulation shows the stick matters.
function addGuidedSticks(r, design, layout, count, budget) {
  const added = [], xs = design.rings.map(g => g.x), ys = design.rings.map(g => g.y);
  const box = { x0: Math.min(...xs) - 3, x1: Math.max(...xs) + 3, y0: Math.min(...ys) - 3, y1: Math.max(...ys) + 3 };
  const axes = layout.family === "diamond" ? [45, 135] : layout.family === "hex" ? [0, 60, 120, 90] : [0, 90];
  let tries = 0;
  while (tries < (budget.guidedTries || 120) && added.length < count) {
    tries++;
    const x = Math.round((box.x0 + r() * (box.x1 - box.x0)) * 4) / 4, y = Math.round((box.y0 + r() * (box.y1 - box.y0)) * 4) / 4;
    const near = Math.min(...design.rings.map(g => Math.hypot(g.x - x, g.y - y)));
    if (near < 0.9 || near > 4.2) continue;                                      // reference: nearest ring centre 1–4.5 from the stick
    const angle = pick(r, axes) + (r() < 0.5 ? 0 : 180), shape = r() < (budget.lShare || 0.25) ? "L" : "straight";
    // composition: the stick body must sit among the rings (>= 2 ring centres within 3.3 of its segment, or pass inside a ring),
    // and must not run alongside another stick
    const half = 2.7, ux = Math.cos(angle * Math.PI / 180), uy = Math.sin(angle * Math.PI / 180);
    const segDist = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy))); return Math.hypot(px - ax - t * vx, py - ay - t * vy); };
    const A = [x - ux * half, y - uy * half], B = [x + ux * half, y + uy * half];
    const dists = design.rings.map(g => segDist(g.x, g.y, A[0], A[1], B[0], B[1]));
    if (!(dists.filter(d => d <= 3.3).length >= 2 || dists.some(d => d <= 1.2))) continue;
    if (design.sticks.some(o => { const oa = (o.angle || 0) * Math.PI / 180, oh = 2.7, P1 = [o.x - Math.cos(oa) * oh, o.y - Math.sin(oa) * oh], P2 = [o.x + Math.cos(oa) * oh, o.y + Math.sin(oa) * oh];
      return Math.min(segDist(P1[0], P1[1], A[0], A[1], B[0], B[1]), segDist(P2[0], P2[1], A[0], A[1], B[0], B[1]), segDist(A[0], A[1], P1[0], P1[1], P2[0], P2[1]), segDist(B[0], B[1], P1[0], P1[1], P2[0], P2[1])) < 1.0; })) continue;
    const id = "S" + (design.sticks.length + 1), trial = JSON.parse(JSON.stringify(design));
    trial.sticks.push({ id, shape, x, y, angle, color: pick(r, COLORS), guides: [{ x, y, angle }] });
    const gt = gates(trial); if (!gt.ok) continue;
    const sol = solve(gt.level, { timeLimitSeconds: budget.quickSeconds || 6, nodeLimit: budget.quickNodes || 1500 });
    if (!sol.found) continue;
    const others = gt.level.parts.filter(p => p.kind === "ring").map(p => p.partId);
    const stripped = JSON.parse(JSON.stringify(trial)); stripped.sticks = stripped.sticks.filter(s => s.id !== id);
    const w = roleWitness(gt.level, toLevel(stripped), sol.moves, others);
    let gated = null;
    { const o = new RR.Simulation(gt.level).ringCount() + trial.sticks.length - 1; let leaves = false;
      for (const dir of [1, -1]) { const s = RR.Solver.newSim(gt.level, false); RR.Solver.explore(s, o, dir); if (s.isSolved(o)) leaves = true; }
      if (!leaves) gated = { blockedAtStart: true }; }
    // removing a part never hurts without bombs, so a stick that one drag can take out at the start only adds a drag:
    // keep it only when it is stuck at the start (strong), unless weak sticks are explicitly allowed
    if (!gated && !(budget.allowWeakSticks && w)) continue;
    design.sticks = trial.sticks; added.push({ stick: id, shape, guided: true, strength: gated ? "strong" : "weak", witness: gated ? Object.assign({}, gated, w ? { alsoChanges: w } : {}) : w });
  }
  return added;
}

// ---------- one candidate ----------
function generate(spec, seed) {
  const r = mulberry32(seed), layout = LAYOUTS[spec.family](r, spec);
  if (!layout || layout.pts.length < 2) return { ok: false, why: "layout" };
  const b = spec.mirror ? buildMirrored(r, layout, spec) : buildDesign(r, layout, spec); if (b.error) return { ok: false, why: b.error };
  const design = b.design;
  let g = gates(design); if (!g.ok) return { ok: false, why: g.why };
  const budget = Object.assign({ quickSeconds: 6, quickNodes: 1500 }, spec.budget || {});
  const base = solve(g.level, { timeLimitSeconds: budget.quickSeconds, nodeLimit: budget.quickNodes });
  if (!base.found) return { ok: false, why: "base not found" };
  const stops = spec.stops ? addStops(r, design, spec.stops, Object.assign({ mirror: b.mirror }, budget)) : [];
  const sticks = (spec.sticks ? addSticks(r, design, layout, spec.sticks, budget) : []).concat(spec.guidedSticks ? addGuidedSticks(r, design, layout, spec.guidedSticks, budget) : []);
  if ((spec.requireStops && stops.length < spec.stops) || (spec.requireSticks && sticks.length < (spec.sticks || 0) + (spec.guidedSticks || 0))) return { ok: false, why: "mechanics not placed" };
  g = gates(design); if (!g.ok) return { ok: false, why: "final " + g.why };
  const fin = solve(g.level, { timeLimitSeconds: budget.finalSeconds || 20, nodeLimit: budget.finalNodes || 4000 });
  if (!fin.found) return { ok: false, why: "final not found" };
  const metrics = Object.assign({ family: layout.family }, structure(g.level), openings(g.level), spec.naive === false ? {} : naive(g.level, { playouts: spec.playouts || 16 }), { drags: fin.drags, prep: fin.prep, nodes: fin.nodes, seconds: fin.seconds, maxCascade: fin.maxCascade });
  return { ok: true, seed, design, level: g.level, metrics, roles: { stops, sticks }, route: fin.route, moves: fin.moves };
}

module.exports = { generate, gates, toLevel, LAYOUTS, P, D, mulberry32, angDist };

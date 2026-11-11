"use strict";
// Structural + solver metrics for a runtime level (campaign or generated). Proxies only: they describe the
// dependency structure and one found route, not player-perceived difficulty.
const RR = require("../../rr-core.js");

function structure(level) {
  const kinds = {}; level.parts.forEach(p => { kinds[p.partId] = p.kind; });
  const rings = level.parts.filter(p => p.kind === "ring"), sticks = level.parts.filter(p => p.kind === "stick");
  const objs = rings.concat(sticks).map(p => p.partId), idx = Object.fromEntries(objs.map((id, i) => [id, i]));
  const out = objs.map(() => new Set()), inn = objs.map(() => new Set()), und = objs.map(() => new Set());
  (level.links || []).forEach(l => {
    const s = idx[l.sourcePartId], t = idx[l.targetPartId]; if (s == null || t == null) return;
    out[s].add(t); inn[t].add(s); und[s].add(t); und[t].add(s);
  });
  // a stick bound to a guide is "held" too; guides follow their stick, so they add no node
  const guided = new Set((level.guideLinks || []).map(g => g.stickPartId));
  const indeg = inn.map(s => s.size), outdeg = out.map(s => s.size);
  // longest directed chain (sources -> targets); -1 when a directed cycle exists
  const memo = new Array(objs.length), onStack = new Array(objs.length).fill(false); let cyclic = false;
  function depth(i) { if (memo[i] != null) return memo[i]; if (onStack[i]) { cyclic = true; return 0; } onStack[i] = true; let d = 1; out[i].forEach(t => { d = Math.max(d, 1 + depth(t)); }); onStack[i] = false; return (memo[i] = d); }
  let chain = 0; objs.forEach((_, i) => { chain = Math.max(chain, depth(i)); });
  // undirected components / cycles (edges counted once)
  const seen = new Array(objs.length).fill(false); let comps = 0, edges = 0; und.forEach(s => { edges += s.size; }); edges /= 2;
  objs.forEach((_, i) => { if (seen[i]) return; comps++; const st = [i]; seen[i] = true; while (st.length) { const v = st.pop(); und[v].forEach(u => { if (!seen[u]) { seen[u] = true; st.push(u); } }); } });
  const multiSrc = indeg.filter(d => d >= 2).length;
  const sharedSrc = outdeg.filter(d => d >= 2).length;
  let relock = 0; inn.forEach(s => { if (s.size >= 2 && [...s].some(src => outdeg[src] >= 2)) relock++; });
  const closed = rings.filter(r => (r.logicGapDegrees || 0) <= 0).length;
  const stops = rings.reduce((n, r) => n + ((r.stopPins || []).length), 0);
  const pins = rings.reduce((n, r) => n + ((r.pins || []).length), 0);
  const bombs = level.parts.filter(p => p.kind === "bomb").length;
  const pureSources = objs.filter((_, i) => indeg[i] === 0 && outdeg[i] > 0).length;
  const pureTargets = objs.filter((_, i) => outdeg[i] === 0 && indeg[i] > 0).length;
  return { rings: rings.length, sticks: sticks.length, guides: (level.guideLinks || []).length, guided: guided.size, bombs, closed, stops, pins, links: (level.links || []).length,
    multiSrc, maxIn: Math.max(0, ...indeg), sharedSrc, maxOut: Math.max(0, ...outdeg), relock, chain: cyclic ? -1 : chain, components: comps, cycles: edges - objs.length + comps,
    pureSources, pureTargets };
}

function solve(level, opts) {
  opts = Object.assign({ nodeLimit: 3000, timeLimitSeconds: 20, explodeBombs: false }, opts || {});
  const r = RR.Solver.find(level, opts);
  const res = { found: r.found, nodes: r.nodes, seconds: +r.seconds.toFixed(2), drags: null, prep: null, firstRemoval: null, maxCascade: null, explodeBombs: opts.explodeBombs };
  if (r.found) {
    const route = RR.Solver.describeRoute(level, r.moves, opts.explodeBombs);
    res.drags = route.length; res.prep = route.filter(s => !s.removedNow).length;
    res.firstRemoval = (route.findIndex(s => s.removedNow > 0) + 1) || null;
    res.maxCascade = Math.max(0, ...route.map(s => s.removedNow));
    res.moves = r.moves.map(m => ({ obj: m.obj, target: m.target }));
    res.route = route;
  }
  return res;
}

// How many objects can be dragged at the start, and how many single drags change a lock (any direction).
function openings(level) {
  const sim0 = RR.Solver.newSim(level, false); let movable = 0, useful = 0;
  for (let o = 0; o < sim0.objectCount(); o++) {
    if (sim0.isMovementLocked(o)) continue;
    movable++;
    let hit = false;
    for (const dir of [1, -1]) {
      const sim = RR.Solver.newSim(level, false), before = sim.graph.active.slice().join(), rem = sim.remaining();
      const t = RR.Solver.explore(sim, o, dir);
      if (!isNaN(t) && (sim.graph.active.slice().join() !== before || sim.remaining() !== rem)) hit = true;
    }
    if (hit) useful++;
  }
  return { movable, useful };
}

// Naive player: repeatedly drags a random draggable object in a random direction until the first lock change
// (or until blocked). Mean drags to finish over N playouts, divided by the solver route length, is a proxy for
// how much of the board is "noise" — moves that do nothing useful. Not a measure of human difficulty.
function naive(level, opts) {
  opts = Object.assign({ playouts: 24, cap: 250, seed: 7, explodeBombs: false }, opts || {});
  let a = opts.seed >>> 0; const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const runs = [];
  for (let k = 0; k < opts.playouts; k++) {
    const sim = RR.Solver.newSim(level, opts.explodeBombs); let n = 0, useless = 0;
    while (!sim.allSolved() && n < opts.cap) {
      const cand = []; for (let o = 0; o < sim.objectCount(); o++) if (!sim.isSolved(o) && !sim.isMovementLocked(o)) cand.push(o);
      if (!cand.length) break;
      const o = cand[Math.floor(rnd() * cand.length)], before = sim.graph.active.join() + sim.remaining();
      RR.Solver.explore(sim, o, rnd() < 0.5 ? 1 : -1); n++;
      if (sim.graph.active.join() + sim.remaining() === before) useless++;
    }
    runs.push({ n, useless, done: sim.allSolved() });
  }
  const done = runs.filter(r => r.done);
  return { naiveSolved: done.length / runs.length, naiveDrags: done.length ? +(done.reduce((t, r) => t + r.n, 0) / done.length).toFixed(1) : null,
    naiveUseless: done.length ? +(done.reduce((t, r) => t + r.useless / r.n, 0) / done.length).toFixed(2) : null };
}

module.exports = { structure, solve, openings, naive, RR };

// TURP designer core — solution search. Port of RotateSolutionFinder.cs (Editor test tool):
// best-first search over scripted drags in the simulation (analytic probe, feel off, safety margin 0.03).
// Finding a route proves the level can be finished in THIS simulation. Not finding one within the limits does NOT prove it is impossible.
// It says nothing about difficulty or about the shortest solution.
(function (RR) {
  "use strict";
  var M = RR.M, V = M.V, D2R = RR.D2R, C = RR.C, SC = C.solver;

  function tuning(explodeBombs) { var t = RR.Tuning.defaults(); t.feelEnabled = false; t.explodeBombs = !!explodeBombs; return t; }
  function ringPointer(sim, ring, deg) { var c = sim.world.rings[ring].center; return V(c.x + 1.75 * Math.cos(deg * D2R), c.y + 1.75 * Math.sin(deg * D2R)); }
  function stickPointer(sim, obj, offset) { var st = sim.world.stickOf(obj), ax = RR.W.stickAxis(st); return V(st.origin.x + ax.x * offset, st.origin.y + ax.y * offset); }
  function pointerFor(sim, obj, v) { return sim.isStick(obj) ? stickPointer(sim, obj, v) : ringPointer(sim, obj, v); }
  function roundHalfEven(x) { var r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r; }

  // Optional (off by default, like the C# finder): a bomb contact explodes during the search, as the board controller does.
  function handleBomb(sim, step) {
    if (!sim.tuning.explodeBombs || !step.bombContact) return false;
    sim.endDrag(); sim.explode(step.bombContact); sim.solveAll(); return true;
  }

  // One scripted drag: release at the first unlock window, then solve. Yields after every pointer sample when `onSample` is given.
  function apply(sim, move, onSample) {
    var obj = move.obj; if (sim.isSolved(obj)) return;
    var stick = sim.isStick(obj), current = stick ? sim.offsetOf(obj) : sim.angleOf(obj), pointer = current, dir = move.target > current ? 1 : -1, step = stick ? SC.STICK_STEP : SC.RING_STEP;
    if (!sim.beginDrag(obj, pointerFor(sim, obj, pointer), 1)) return;
    while ((move.target - pointer) * dir > 1e-4) {
      pointer += dir * Math.min(step, Math.abs(move.target - pointer));
      var s = sim.drag(pointerFor(sim, obj, pointer));
      if (onSample) onSample(sim, s);
      if (handleBomb(sim, s)) return;
      if (s.locksChanged && !sim.hasActiveLock(obj)) break;
    }
    sim.endDrag(); sim.solveAll();
  }

  function key(sim) {
    var parts = [];
    for (var i = 0; i < sim.objectCount(); i++) {
      if (sim.isSolved(i)) { parts.push("x"); continue; }
      parts.push(roundHalfEven(sim.isStick(i) ? sim.offsetOf(i) * 10 : sim.angleOf(i) / 2));
    }
    return parts.join(";") + ";";
  }
  function score(sim) {
    var solved = sim.objectCount() - sim.remaining(), locks = 0, i;
    for (i = 0; i < sim.links.length; i++) if (sim.graph.active[i]) locks++;
    for (i = 0; i < sim.bindings.length; i++) if (sim.graph.bindingActive[i]) locks++;
    return solved * 100 - locks;
  }
  function newSim(level, explodeBombs) { var sim = new RR.Simulation(level, tuning(explodeBombs)); sim.setEngageThreshold(-SC.SAFETY_MARGIN); return sim; }
  function replay(level, moves, explodeBombs) { var sim = newSim(level, explodeBombs); moves.forEach(function (m) { apply(sim, m); }); return sim; }

  // Pull `obj` in `dir` until the first lock change, until it is blocked, or until the travel limit. Returns the pointer reached or NaN.
  function explore(sim, obj, dir) {
    var stick = sim.isStick(obj), start = stick ? sim.offsetOf(obj) : sim.angleOf(obj), pointer = start, step = stick ? SC.STICK_STEP : SC.RING_STEP, limit = stick ? SC.STICK_LIMIT : SC.RING_LIMIT;
    if (!sim.beginDrag(obj, pointerFor(sim, obj, pointer), 1)) return NaN;
    var stuck = 0, changed = false;
    while (Math.abs(pointer - start) < limit - 1e-3) {
      pointer += dir * step;
      var s = sim.drag(pointerFor(sim, obj, pointer));
      if (handleBomb(sim, s)) return pointer;
      if (s.locksChanged) { changed = true; break; }
      stuck = s.blocked && !s.moved ? stuck + 1 : 0; if (stuck >= 3) break;
    }
    sim.endDrag(); sim.solveAll();
    return changed || Math.abs(pointer - start) > 1e-3 ? pointer : NaN;
  }

  // Generator: yields progress objects { nodes, open, seconds } every `sliceMs`; returns { found, moves, log, nodes, seconds }.
  function* findSteps(level, opts) {
    opts = opts || {};
    var nodeLimit = opts.nodeLimit || 4000, timeLimit = (opts.timeLimitSeconds || 60) * 1000, sliceMs = opts.sliceMs || 30, bombs = !!opts.explodeBombs;
    var t0 = Date.now(), lastYield = t0, nodes = 0, seen = new Set();
    var root = newSim(level, bombs); seen.add(key(root));
    if (root.allSolved()) return { found: true, moves: [], log: "already solved", nodes: 0, seconds: 0 };
    var open = [{ score: score(root), moves: [] }];
    while (open.length > 0 && nodes < nodeLimit && Date.now() - t0 < timeLimit) {
      var best = 0;
      for (var i = 1; i < open.length; i++) if (open[i].score > open[best].score || (open[i].score === open[best].score && open[i].moves.length < open[best].moves.length)) best = i;
      var nodeEntry = open.splice(best, 1)[0];
      if (nodeEntry.moves.length >= SC.MAX_DEPTH) continue;
      var parent = replay(level, nodeEntry.moves, bombs);
      for (var obj = parent.objectCount() - 1; obj >= 0; obj--) {
        if (parent.isSolved(obj)) continue;
        for (var d = 0; d < 2; d++) {
          var dir = d === 0 ? 1 : -1; nodes++;
          var sim = replay(level, nodeEntry.moves, bombs), target = explore(sim, obj, dir);
          if (Date.now() - lastYield > sliceMs) { lastYield = Date.now(); yield { nodes: nodes, open: open.length, seconds: (lastYield - t0) / 1000 }; }
          if (isNaN(target)) continue;
          var k = key(sim); if (seen.has(k)) continue; seen.add(k);
          var child = nodeEntry.moves.concat([{ obj: obj, target: target }]);
          if (sim.allSolved()) return { found: true, moves: child, log: "found with " + child.length + " drags after " + nodes + " explorations", nodes: nodes, seconds: (Date.now() - t0) / 1000 };
          open.push({ score: score(sim), moves: child });
        }
      }
    }
    var secs = (Date.now() - t0) / 1000;
    return { found: false, moves: [], nodes: nodes, seconds: secs,
      log: "NOT FOUND after " + nodes + " explorations, " + secs.toFixed(0) + " s (limits " + nodeLimit + " nodes / " + (timeLimit / 1000) + " s, open " + open.length + ")" };
  }
  function find(level, opts) { var it = findSteps(level, opts), r; do { r = it.next(); } while (!r.done); return r.value; }

  // Human-readable route (ids are stable part ids; angles in degrees, stick offsets in board units).
  function describeRoute(level, moves, explodeBombs) {
    var sim = newSim(level, explodeBombs), kinds = {}; level.parts.forEach(function (p) { kinds[p.partId] = p.kind; });
    return moves.map(function (m, i) {
      var id = sim.idOf(m.obj), stick = sim.isStick(m.obj), from = stick ? sim.offsetOf(m.obj) : sim.angleOf(m.obj);
      var before = sim.remaining(); apply(sim, m);
      var solved = []; for (var o = 0; o < sim.objectCount(); o++) if (sim.isSolved(o)) solved.push(sim.idOf(o));
      return { step: i + 1, part: id, label: RR.labelOf(id, kinds[id]), kind: stick ? "stick" : "ring", from: Math.round(from * 100) / 100, to: Math.round(m.target * 100) / 100,
        direction: stick ? (m.target > from ? "+" : "-") : (m.target > from ? "CCW" : "CW"), removedNow: before - sim.remaining(), remaining: sim.remaining() };
    });
  }

  RR.Solver = { tuning: tuning, apply: apply, explore: explore, findSteps: findSteps, find: find, replay: replay, newSim: newSim, describeRoute: describeRoute, pointerFor: pointerFor };
})(typeof module === "object" && module.exports ? require("./rr-ns.js") : (self.RR = self.RR || {}));

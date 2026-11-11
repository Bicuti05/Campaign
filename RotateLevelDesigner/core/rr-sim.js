// TURP designer core — gameplay simulation.
// Port of RotateLockGraph.cs, RotateBlockSolver.cs, RotateFeel.cs, RotateTuning.cs, RotateSimulation.cs (analytic lock probe).
// NOT ported: Physics2D lock probe (the game uses tessellated polygons, this uses the closed-form twin), ratchet/haptics, view, timing.
(function (RR) {
  "use strict";
  var M = RR.M, V = M.V, W = RR.W, KIND = RR.KIND;
  var C = RR.C || (typeof module === "object" && module.exports ? require("../rr-constants.js") : self.RR_CONSTANTS);
  RR.C = C;

  // ---------- tuning ----------
  function defaultTuning() {
    var t = JSON.parse(JSON.stringify(C.tuning));
    if (!(t.dampingK1 > 0 && t.dampingK1 <= 1)) t.dampingK1 = 0.75;
    if (!(t.compensationK2 >= 1 && t.compensationK2 <= 2.5)) t.compensationK2 = 1.2;
    return t;
  }
  function blockerMask(t) { return t.wallsBlock ? KIND.BLOCKERS : KIND.BLOCKERS_NO_WALL; }

  // ---------- lock graph ----------
  function LockGraph(links, objectCount, bindings) {
    this.links = links.slice(); this.active = links.map(function () { return false; });
    this.solved = []; this.lockCount = []; for (var i = 0; i < objectCount; i++) { this.solved.push(false); this.lockCount.push(0); }
    this.bindings = (bindings || []).slice(); this.bindingActive = this.bindings.map(function () { return false; });
  }
  LockGraph.prototype.initialize = function (engaged) {
    for (var i = 0; i < this.links.length; i++) this.active[i] = engaged(this.links[i]);
    for (var j = 0; j < this.bindings.length; j++) this.bindingActive[j] = true;
  };
  LockGraph.prototype.refresh = function (obj, engaged, bindingEngaged) {
    var changed = false, i, now;
    for (i = 0; i < this.links.length; i++) {
      var l = this.links[i];
      if (l.source !== obj && l.target !== obj) continue;
      if (this.solved[l.source] || this.solved[l.target]) continue;
      now = engaged(l); if (now !== this.active[i]) { this.active[i] = now; changed = true; }
    }
    if (bindingEngaged)
      for (i = 0; i < this.bindings.length; i++) {
        if (this.bindings[i].stick !== obj || this.solved[obj]) continue;
        now = bindingEngaged(this.bindings[i]); if (now !== this.bindingActive[i]) { this.bindingActive[i] = now; changed = true; }
      }
    return changed;
  };
  // Chain (LockCount): solves of ANY other object still needed before this one is free; blocks drag and solve (port of RotateLockGraph.cs).
  LockGraph.prototype.hasActiveLock = function (obj) {
    if (this.lockCount[obj] > 0) return true;
    for (var i = 0; i < this.links.length; i++) if (this.active[i] && (this.links[i].source === obj || this.links[i].target === obj)) return true;
    return this.hasActiveBinding(obj);
  };
  LockGraph.prototype.hasActiveBinding = function (obj) {
    for (var i = 0; i < this.bindings.length; i++) if (this.bindingActive[i] && this.bindings[i].stick === obj) return true;
    return false;
  };
  LockGraph.prototype.hasActiveOutgoingLink = function (obj) {
    for (var i = 0; i < this.links.length; i++) if (this.active[i] && this.links[i].source === obj) return true;
    return false;
  };
  LockGraph.prototype.onSolved = function (obj) {
    this.solved[obj] = true; this.lockCount[obj] = 0; var i;
    for (i = 0; i < this.lockCount.length; i++) if (this.lockCount[i] > 0) this.lockCount[i]--;
    for (i = 0; i < this.links.length; i++) if (this.links[i].source === obj || this.links[i].target === obj) this.active[i] = false;
    for (i = 0; i < this.bindings.length; i++) if (this.bindings[i].stick === obj) this.bindingActive[i] = false;
  };
  // Scan from the last object to the first, solve what is free, repeat while anything was solved (chain).
  LockGraph.prototype.tryUpdateAll = function () {
    var solved = [], dirty;
    do {
      dirty = false;
      for (var i = this.solved.length - 1; i >= 0; i--) {
        if (this.solved[i] || this.hasActiveLock(i)) continue;
        this.onSolved(i); solved.push(i); dirty = true;
      }
    } while (dirty);
    return solved;
  };

  // ---------- block solver: sample the whole path, then bisect to the last valid pose ----------
  function blockSolve(penetration, from, to, threshold, sampleStep, bisectionIterations) {
    var result = { angle: to, blocked: false, blockedPose: 0, evaluations: 0 };
    var delta = to - from;
    if (Math.abs(delta) < 1e-6) { result.angle = from; return result; }
    var step = Math.max(0.01, sampleStep), sg = M.sign(delta), length = Math.abs(delta), lastValid = from, bad = NaN;
    for (var travelled = Math.min(step, length); ; travelled = Math.min(travelled + step, length)) {
      var a = from + sg * travelled; result.evaluations++;
      if (penetration(a) > threshold) { bad = a; break; }
      lastValid = a;
      if (travelled >= length) break;
    }
    if (isNaN(bad)) return result;
    var lo = lastValid, hi = bad;
    for (var i = 0; i < bisectionIterations; i++) { var mid = (lo + hi) * 0.5; result.evaluations++; if (penetration(mid) <= threshold) lo = mid; else hi = mid; }
    result.angle = lo; result.blockedPose = hi; result.blocked = true;
    return result;
  }

  // ---------- feel (K1/K2) ----------
  function Feel(t) { this.enabled = t.feelEnabled; this.k1 = t.dampingK1; this.k2 = t.compensationK2; this.lag = 0; }
  Feel.prototype.reset = function () { this.lag = 0; };
  Feel.prototype.adjust = function (delta, pinInGap) {
    if (Math.abs(delta) < 1e-6 || !this.enabled) return delta;
    if (pinInGap) { var damped = this.k1 * delta; this.lag += delta - damped; return damped; }
    if (Math.abs(this.lag) <= 1e-4 || M.sign(this.lag) !== M.sign(delta)) return delta;
    var maxComp = Math.abs(delta) * (this.k2 - 1);
    if (maxComp > Math.abs(this.lag)) { delta += this.lag; this.lag = 0; }
    else { delta *= this.k2; this.lag = M.sign(this.lag) * (Math.abs(this.lag) - maxComp); }
    return delta;
  };

  // ---------- simulation ----------
  // level: runtime schema v1 object. tuning: defaultTuning() (optionally modified). Throws Error like the C# constructor.
  function Simulation(level, tuning) {
    tuning = tuning || defaultTuning();
    var w = this.world = RR.World.build(level); w.lockMinPenetration = tuning.lockMinPenetration;
    this.tuning = tuning; this.feel = new Feel(tuning); this.dragged = -1; this.pointerId = 0; this.previous = V(0, 0);
    this.startPenetration = 0; this.stickGrab = 0; this.wasBlocked = false;
    var self = this, links = [];
    level.links.forEach(function (l) {
      var source = self.indexOf(l.sourcePartId), target = self.indexOf(l.targetPartId);
      var pin = source < 0 || w.isStickObject(source) ? -1 : w.rings[source].pinFeatures.indexOf(l.sourceFeatureId);
      if (source < 0 || target < 0 || pin < 0) throw new Error("Link does not resolve: " + l.sourcePartId + "/" + l.sourceFeatureId + " -> " + l.targetPartId);
      links.push({ source: source, target: target, pin: pin });
    });
    var bindings = w.guides.map(function (g) { return { guide: g.ordinal, stick: self.indexOf(g.stickId) }; });
    this.links = links; this.bindings = bindings;
    this.graph = new LockGraph(links, w.objectCount(), bindings);
    this.engaged = function (l) { return w.isEngaged(l.target, l.source, tuning.lockScope === "Ring" ? -1 : l.pin); };
    this.bindingEngaged = function (b) { return w.guideEngaged(b.guide); };
    this.graph.initialize(this.engaged);
    level.parts.forEach(function (p) { var o = w.objectIndexById[p.partId]; if ((p.lockCount || 0) > 0 && o !== undefined) self.graph.lockCount[o] = p.lockCount; });
  }
  var S = Simulation.prototype;
  S.ringCount = function () { return this.world.rings.length; };
  S.objectCount = function () { return this.world.objectCount(); };
  S.idOf = function (obj) { return this.world.idOf(obj); };
  S.indexOf = function (id) { var i = this.world.objectIndexById[id]; return i === undefined ? -1 : i; };
  S.isStick = function (obj) { return this.world.isStickObject(obj); };
  S.angleOf = function (ring) { return this.world.rings[ring].angleDeg; };
  S.offsetOf = function (obj) { return this.world.stickOf(obj).offset; };
  S.isSolved = function (obj) { return this.graph.solved[obj]; };
  S.hasActiveLock = function (obj) { return this.graph.hasActiveLock(obj); };
  S.isFreeToSolve = function (obj) { return obj >= 0 && obj < this.objectCount() && !this.graph.solved[obj] && !this.graph.hasActiveLock(obj); };
  S.isMovementLocked = function (obj) { return obj >= 0 && obj < this.objectCount() && (this.graph.lockCount[obj] > 0 || (obj < this.ringCount() && this.graph.hasActiveOutgoingLink(obj))); };
  S.lockCountOf = function (obj) { return obj >= 0 && obj < this.objectCount() ? this.graph.lockCount[obj] : 0; };
  S.remaining = function () { var n = 0; for (var i = 0; i < this.objectCount(); i++) if (!this.graph.solved[i]) n++; return n; };
  S.allSolved = function () { return this.remaining() === 0; };
  S.dragging = function () { return this.dragged >= 0; };
  S.setEngageThreshold = function (t) { this.world.engageThreshold = t; this.graph.initialize(this.engaged); };
  S.hitTest = function (p) { return this.world.hitTest(p); };
  // Source pins of `ring` that currently hold an active outgoing link (why the ring cannot move).
  S.activeSourcePins = function (ring) {
    var out = [], w = this.world;
    for (var i = 0; i < this.links.length; i++) {
      var l = this.links[i];
      if (l.source === ring && this.graph.active[i] && out.indexOf(w.rings[ring].pinFeatures[l.pin]) < 0) out.push(w.rings[ring].pinFeatures[l.pin]);
    }
    return out;
  };

  S.beginDrag = function (obj, p, pointerId) {
    if (this.dragged >= 0 || obj < 0 || obj >= this.objectCount() || this.graph.solved[obj] || this.isMovementLocked(obj)) return false;
    var t = this.tuning, w = this.world;
    this.dragged = obj; this.pointerId = pointerId || 1; this.previous = p; this.feel.reset(); this.wasBlocked = false;
    if (w.isStickObject(obj)) {
      var st = w.stickOf(obj);
      this.stickGrab = M.dot(M.sub(p, st.origin), W.stickAxis(st)) - st.offset;
      this.startPenetration = t.blockEnabled ? w.stickPenetration(st.ordinal, st.offset, blockerMask(t)) : 0;
    } else {
      this.startPenetration = t.blockEnabled ? w.penetration(obj, w.rings[obj].angleDeg, blockerMask(t)) : 0;
      W.ringSetAngle(w.rings[obj], w.rings[obj].angleDeg);
    }
    return true;
  };

  S.drag = function (p) {
    if (this.dragged >= 0 && this.world.isStickObject(this.dragged)) return this.dragStick(p);
    var step = { moved: false, blocked: false, enteredBlocked: false, locksChanged: false, angle: 0, appliedDelta: 0, isStick: false, bombContact: null };
    if (this.dragged < 0) return step;
    var w = this.world, t = this.tuning, ring = w.rings[this.dragged]; step.angle = ring.angleDeg;
    if (M.len2(M.sub(p, this.previous)) < t.minPointerMoveSqr) return step;
    var v0 = M.sub(this.previous, ring.center), v1 = M.sub(p, ring.center); this.previous = p;
    if (M.len2(v0) < 1e-8 || M.len2(v1) < 1e-8) return step;
    var delta = M.signedAngle(v0, v1);
    delta = this.feel.adjust(delta, t.feelEnabled && this.hasThreadablePinInGap(this.dragged));
    var from = ring.angleDeg, to = from + delta, fin = to, blocked = false, idx = this.dragged, mask = blockerMask(t);
    if (t.blockEnabled) {
      var r = blockSolve(function (a) { return w.penetration(idx, a, mask); }, from, to, Math.max(this.startPenetration, t.startPenetrationTolerance), t.pathSampleStepDegrees, t.bisectionIterations);
      fin = r.angle; blocked = r.blocked;
    }
    var sweep = W.bombSweep(w, this.dragged, from, fin); fin = sweep.to; step.bombContact = sweep.contact;
    W.ringSetAngle(ring, fin);
    step.angle = fin; step.appliedDelta = fin - from; step.moved = Math.abs(step.appliedDelta) > 1e-4; step.blocked = blocked;
    step.enteredBlocked = blocked && (!this.wasBlocked || Math.abs(step.appliedDelta) > t.reblockMinTravelDegrees); this.wasBlocked = blocked;
    if (step.moved) step.locksChanged = this.graph.refresh(this.dragged, this.engaged, this.bindingEngaged);
    return step;
  };

  S.dragStick = function (p) {
    var w = this.world, t = this.tuning, st = w.stickOf(this.dragged);
    var step = { moved: false, blocked: false, enteredBlocked: false, locksChanged: false, slide: st.offset, appliedDelta: 0, isStick: true, bombContact: null };
    if (M.len2(M.sub(p, this.previous)) < 1e-8) return step;
    this.previous = p;
    var from = st.offset, to = M.dot(M.sub(p, st.origin), W.stickAxis(st)) - this.stickGrab, fin = to, blocked = false, ord = st.ordinal, mask = blockerMask(t);
    if (t.blockEnabled) {
      var r = blockSolve(function (o) { return w.stickPenetration(ord, o, mask); }, from, to, Math.max(this.startPenetration, t.startPenetrationTolerance), t.stickPathSampleStep, t.bisectionIterations);
      fin = r.angle; blocked = r.blocked;
    }
    var sweep = W.bombSweep(w, this.dragged, from, fin); fin = sweep.to; step.bombContact = sweep.contact;
    st.offset = fin;
    step.slide = fin; step.appliedDelta = fin - from; step.moved = Math.abs(step.appliedDelta) > 1e-5; step.blocked = blocked;
    step.enteredBlocked = blocked && (!this.wasBlocked || Math.abs(step.appliedDelta) > 0.0075); this.wasBlocked = blocked;
    if (step.moved) step.locksChanged = this.graph.refresh(this.dragged, this.engaged, this.bindingEngaged);
    return step;
  };

  S.hasThreadablePinInGap = function (ring) {
    var t = this.tuning;
    for (var i = 0; i < this.links.length; i++) {
      var l = this.links[i];
      if (l.target === ring && !this.graph.solved[l.source] && this.world.pinInGap(ring, l.source, l.pin, t.minGapDegrees, t.gapEpsilonDegrees)) return true;
    }
    return false;
  };

  S.endDrag = function () {
    var obj = this.dragged; this.dragged = -1; this.pointerId = 0; this.feel.reset(); this.wasBlocked = false;
    return obj;
  };

  // Solve everything that is free (chain); solved objects leave the world. Returns them in solve order.
  S.solveAll = function () {
    if (this.dragged >= 0) return [];
    var solved = this.graph.tryUpdateAll(), self = this;
    solved.forEach(function (i) { self.deactivate(i); });
    return solved;
  };
  S.deactivate = function (obj) {
    var w = this.world;
    w.bombs.forEach(function (b) { if (b.active && b.host === obj) b.detach(); });
    if (!w.isStickObject(obj)) { w.rings[obj].active = false; return; }
    var st = w.stickOf(obj); st.active = false;
    w.guides.forEach(function (g) { if (g.stickId === st.id) g.active = false; });
  };
  S.remove = function (obj) { this.graph.onSolved(obj); this.deactivate(obj); };

  // Bomb explosion from a contact: chain through touching bombs; hosts and the struck object are removed.
  S.explode = function (contact) {
    var w = this.world, result = { explosions: [], removedParts: [] };
    if (!contact || contact.bomb < 0 || contact.bomb >= w.bombs.length || !w.bombs[contact.bomb].active) return result;
    var queue = [contact.bomb], exploding = [], victims = [], self = this;
    if (contact.otherBomb >= 0) queue.push(contact.otherBomb);
    while (queue.length) {
      var index = queue.shift(), bomb = w.bombs[index];
      if (!bomb.active || exploding.indexOf(index) >= 0) continue;
      exploding.push(index);
      if (bomb.host >= 0 && !this.isSolved(bomb.host) && victims.indexOf(bomb.host) < 0) victims.push(bomb.host);
      result.explosions.push({ bombId: bomb.id, hostId: bomb.host < 0 ? null : this.idOf(bomb.host), position: bomb.center() });
      for (var i = 0; i < w.bombs.length; i++)
        if (i !== index && w.bombs[i].active && M.len(M.sub(w.bombs[i].center(), bomb.center())) <= bomb.radius + w.bombs[i].radius + W.BOMB_CONTACT_EPSILON) queue.push(i);
    }
    if (contact.target >= 0 && !this.isSolved(contact.target) && victims.indexOf(contact.target) < 0) victims.push(contact.target);
    exploding.forEach(function (i) { w.bombs[i].active = false; });
    victims.forEach(function (obj) { result.removedParts.push(self.idOf(obj)); self.remove(obj); });
    return result;
  };

  // Full mutable state (designer tool: undo of play moves). Not used by the game.
  S.saveState = function () {
    var w = this.world;
    return {
      rings: w.rings.map(function (r) { return [r.angleDeg, r.active]; }), sticks: w.sticks.map(function (s) { return [s.offset, s.active]; }),
      guides: w.guides.map(function (g) { return g.active; }), bombs: w.bombs.map(function (b) { return [b.active, b.host, b.local, b.fixed]; }),
      active: this.graph.active.slice(), bindingActive: this.graph.bindingActive.slice(), solved: this.graph.solved.slice(), lockCount: this.graph.lockCount.slice()
    };
  };
  S.restoreState = function (s) {
    var w = this.world;
    w.rings.forEach(function (r, i) { r.active = s.rings[i][1]; W.ringSetAngle(r, s.rings[i][0]); });
    w.sticks.forEach(function (st, i) { st.offset = s.sticks[i][0]; st.active = s.sticks[i][1]; });
    w.guides.forEach(function (g, i) { g.active = s.guides[i]; });
    w.bombs.forEach(function (b, i) { b.active = s.bombs[i][0]; b.host = s.bombs[i][1]; b.local = s.bombs[i][2]; b.fixed = s.bombs[i][3]; });
    this.graph.active = s.active.slice(); this.graph.bindingActive = s.bindingActive.slice(); this.graph.solved = s.solved.slice(); this.graph.lockCount = s.lockCount ? s.lockCount.slice() : this.graph.lockCount.map(function () { return 0; });
    this.dragged = -1; this.feel.reset(); this.wasBlocked = false;
  };

  // Snapshot of the visible state (for rendering): per object pose/active, active links and bindings.
  S.snapshot = function () {
    var w = this.world, self = this;
    return {
      rings: w.rings.map(function (r) { return { id: r.id, angle: r.angleDeg, active: r.active, solved: self.graph.solved[r.index], locked: self.isMovementLocked(r.index) }; }),
      sticks: w.sticks.map(function (s) { return { id: s.id, offset: s.offset, active: s.active, solved: self.graph.solved[w.rings.length + s.ordinal] }; }),
      links: this.links.map(function (l, i) { return { source: self.idOf(l.source), target: self.idOf(l.target), pin: w.rings[l.source].pinFeatures[l.pin], active: self.graph.active[i] }; }),
      bombs: w.bombs.map(function (b) { return { id: b.id, active: b.active, center: b.center(), radius: b.radius }; })
    };
  };

  RR.Tuning = { defaults: defaultTuning, blockerMask: blockerMask };
  RR.LockGraph = LockGraph;
  RR.blockSolve = blockSolve;
  RR.Feel = Feel;
  RR.Simulation = Simulation;
})(typeof module === "object" && module.exports ? require("./rr-ns.js") : (self.RR = self.RR || {}));

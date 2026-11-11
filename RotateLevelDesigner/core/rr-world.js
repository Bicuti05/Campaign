// TURP designer core — collision world built from a runtime level (schema v1).
// Port of RotateCollisionWorld.cs, RotateSlideAxisResolver.cs and RotateBomb.cs. Objects are rings (0..R-1) then sticks (R..).
(function (RR) {
  "use strict";
  var M = RR.M, V = M.V, D2R = RR.D2R, R2D = RR.R2D, INF = Number.POSITIVE_INFINITY;
  var SCALE_TOLERANCE = 1e-4;

  var KIND = { BODY: 1, HARD: 2, WALL: 4, SENSOR: 8, STOP: 16, GUIDE: 32 };
  KIND.BLOCKERS = KIND.BODY | KIND.HARD | KIND.WALL | KIND.STOP | KIND.GUIDE;
  KIND.BLOCKERS_NO_WALL = KIND.BODY | KIND.HARD | KIND.STOP | KIND.GUIDE;
  KIND.PIN_PARTS = KIND.HARD | KIND.WALL | KIND.SENSOR;

  function P(a) { return V(a[0], a[1]); }

  // ---------- shapes ----------
  function ringSetAngle(r, degrees) {
    r.angleDeg = degrees;
    var rad = degrees * D2R, c = Math.cos(rad), s = Math.sin(rad), q, k, p;
    r.arc = M.arcCreate(r.center, r.inner, r.outer, r.gapDegrees, degrees + r.gapDirectionDegrees);
    for (q = 0; q < r.localQuads.length; q++)
      for (k = 0; k < r.localQuads[q].length; k++) { p = r.localQuads[q][k]; r.worldQuads[q][k] = V(r.center.x + c * p.x - s * p.y, r.center.y + s * p.x + c * p.y); }
    if (r.attachmentLocalPaths)
      for (q = 0; q < r.attachmentLocalPaths.length; q++)
        for (k = 0; k < r.attachmentLocalPaths[q].length; k++) { p = r.attachmentLocalPaths[q][k]; r.attachmentWorldPaths[q][k] = V(r.center.x + c * p.x - s * p.y, r.center.y + s * p.x + c * p.y); }
    if (r.stemLocalPaths)
      for (q = 0; q < r.stemLocalPaths.length; q++)
        for (k = 0; k < r.stemLocalPaths[q].length; k++) { p = r.stemLocalPaths[q][k]; r.stemWorldPaths[q][k] = V(r.center.x + c * p.x - s * p.y, r.center.y + s * p.x + c * p.y); }
  }
  function stickAxis(st) { return M.len2(st.slideAxis) > 0 ? st.slideAxis : V(Math.cos(st.angleDeg * D2R), Math.sin(st.angleDeg * D2R)); }
  function stickPoseAt(st, slide) { var ax = stickAxis(st); return M.poseMake(V(st.origin.x + ax.x * slide, st.origin.y + ax.y * slide), st.angleDeg, 0); }
  function stickPose(st) { return stickPoseAt(st, st.offset); }
  function stickToLocal(st, w) { var r = -st.angleDeg * D2R, c = Math.cos(r), s = Math.sin(r), dx = w.x - st.origin.x, dy = w.y - st.origin.y; return V(c * dx - s * dy, s * dx + c * dy); }
  function stickToWorld(st, l) { var r = st.angleDeg * D2R, c = Math.cos(r), s = Math.sin(r); return V(st.origin.x + c * l.x - s * l.y, st.origin.y + s * l.x + c * l.y); }
  function guideBoxWorld(g, center, size) {
    var r = g.angleDeg * D2R, c = Math.cos(r), s = Math.sin(r), q = [];
    for (var i = 0; i < 4; i++) {
      var cx = center.x + ((i === 1 || i === 2) ? 0.5 : -0.5) * size.x, cy = center.y + (i >= 2 ? 0.5 : -0.5) * size.y;
      q.push(V(g.origin.x + c * cx - s * cy, g.origin.y + s * cx + c * cy));
    }
    return q;
  }

  // ---------- world build ----------
  function World() {
    this.engageThreshold = 1e-6; this.lockMinPenetration = 0;
    this.rings = []; this.indexById = {}; this.sticks = []; this.guides = []; this.bombs = [];
    this.stickIndexById = {}; this.objectIndexById = {};
  }
  World.prototype.objectCount = function () { return this.rings.length + this.sticks.length; };
  World.prototype.isStickObject = function (obj) { return obj >= this.rings.length; };
  World.prototype.stickOf = function (obj) { return this.sticks[obj - this.rings.length]; };
  World.prototype.engageThresholdOf = function (kind) { return (kind === KIND.SENSOR || kind === KIND.WALL) ? Math.max(this.engageThreshold, this.lockMinPenetration) : this.engageThreshold; };

  // Throws Error for data the world cannot represent (same messages as the C# FormatException / NotSupportedException).
  // opts.lenient (editor drawing only): slide-axis, guide-link and bomb-host problems are recorded in world.problems instead of thrown.
  World.build = function (level, opts) {
    var lenient = !!(opts && opts.lenient), problems = [];
    var transforms = {}; level.transforms.forEach(function (t) { transforms[t.transformId] = t; });
    var cache = {};
    function pose(id) {
      if (cache[id]) return cache[id];
      var t = transforms[id]; if (!t) throw new Error("Missing transform " + id);
      if (Math.abs(t.localRotation[0]) > SCALE_TOLERANCE || Math.abs(t.localRotation[1]) > SCALE_TOLERANCE) throw new Error(id + ": rotation is not about Z");
      if (Math.abs(t.localScale[0] - 1) > SCALE_TOLERANCE || Math.abs(t.localScale[1] - 1) > SCALE_TOLERANCE) throw new Error(id + ": scaled transforms are not supported");
      var localAngle = 2 * Math.atan2(t.localRotation[2], t.localRotation[3]) * R2D;
      var p = { position: V(t.localPosition[0], t.localPosition[1]), angle: localAngle };
      if (t.parentId != null) {
        var parent = pose(t.parentId);
        p = { position: M.add(parent.position, M.rot(p.position, parent.angle)), angle: parent.angle + localAngle };
      }
      cache[id] = p; return p;
    }
    var w = new World();
    level.parts.forEach(function (part) {
      if (part.kind === "bomb") return;
      if (part.kind === "stick") {
        var parentId = transforms[part.transformId].parentId;
        if (parentId != null && Math.abs(M.deltaAngle(pose(parentId).angle, 0)) > 1e-3) throw new Error(part.partId + ": the parent of a stick must not be rotated");
        w.addStick(part, pose(part.transformId)); return;
      }
      if (part.kind === "guide") { w.addGuide(part, pose(part.transformId)); return; }
      if (part.kind !== "ring") throw new Error(part.partId + ": " + part.kind + " is not supported yet");
      if (part.colliderInnerRadius == null || part.dragAreaInnerRadius == null) throw new Error(part.partId + ": collider/drag area data missing (re-run Import samples)");
      var ring = pose(part.transformId);
      var shape = {
        id: part.partId, index: w.rings.length, active: true, center: ring.position, inner: part.colliderInnerRadius, outer: part.colliderOuterRadius,
        gapDegrees: part.logicGapDegrees, gapDirectionDegrees: part.meshGapDirection, dragInner: part.dragAreaInnerRadius, dragOuter: part.dragAreaOuterRadius,
        dragLocalPaths: part.dragAreaPaths == null ? null : part.dragAreaPaths.map(function (path) { return path.map(P); }), angleDeg: 0
      };
      var quads = [], kinds = [], pinIndex = [], features = [], attachmentPaths = [], stemPaths = [];
      var rr = -ring.angle * D2R, rc = Math.cos(rr), rs = Math.sin(rr);
      (part.pins || []).forEach(function (pin, p) {
        if (pin.sensorSize == null) throw new Error(part.partId + "/" + pin.featureId + ": pin collider data missing (re-run Import samples)");
        features.push(pin.featureId);
        var pinPose = pose(pin.transformId), d = M.sub(pinPose.position, ring.position);
        var relPos = V(rc * d.x - rs * d.y, rs * d.x + rc * d.y), relAngle = (pinPose.angle - ring.angle) * D2R, ac = Math.cos(relAngle), asn = Math.sin(relAngle);
        var toRing = function (v) { return V(relPos.x + ac * v.x - asn * v.y, relPos.y + asn * v.x + ac * v.y); };
        var box = function (o, sz) { return [toRing(V(o.x - sz.x * 0.5, o.y - sz.y * 0.5)), toRing(V(o.x + sz.x * 0.5, o.y - sz.y * 0.5)), toRing(V(o.x + sz.x * 0.5, o.y + sz.y * 0.5)), toRing(V(o.x - sz.x * 0.5, o.y + sz.y * 0.5))]; };
        var hard = pin.hardBlockPoints.map(P), wallSize = P(pin.wallSize);
        var addQ = function (quad, kind) { quads.push(quad); kinds.push(kind); pinIndex.push(p); };
        addQ(hard, KIND.HARD);
        var rightWall = box(V(pin.wallOffsetX, 0), wallSize), leftWall = box(V(-pin.wallOffsetX, 0), wallSize);
        addQ(rightWall, KIND.WALL); addQ(leftWall, KIND.WALL);
        addQ(box(V(0, 0), P(pin.sensorSize)), KIND.SENSOR);
        var outward = M.normalize(relPos), side = V(-outward.y, outward.x), start = M.len(relPos), end = start, low = INF, high = -INF;
        hard.forEach(function (pt) { var along = M.dot(pt, outward), across = M.dot(pt, side); start = Math.min(start, along); end = Math.max(end, along); low = Math.min(low, across); high = Math.max(high, across); });
        start -= (high - low) * 0.5;
        attachmentPaths.push([M.add(M.mul(outward, start), M.mul(side, low)), M.add(M.mul(outward, end), M.mul(side, low)), M.add(M.mul(outward, end), M.mul(side, high)), M.add(M.mul(outward, start), M.mul(side, high))]);
        attachmentPaths.push([leftWall[0], rightWall[1], rightWall[2], leftWall[3]]);
        // Mirrors RotateCollisionWorld: stem collider stops at the head so the threaded body can still pass between the walls.
        var headLow = INF, headHigh = -INF;
        leftWall.concat(rightWall).forEach(function (v) { var along = M.dot(v, outward); headLow = Math.min(headLow, along); headHigh = Math.max(headHigh, along); });
        var stemLow = start, stemHigh = end;
        if (headLow + headHigh < stemLow + stemHigh) stemLow = Math.max(stemLow, headHigh); else stemHigh = Math.min(stemHigh, headLow);
        if (stemHigh - stemLow > 1e-4)
          stemPaths.push([M.add(M.mul(outward, stemLow), M.mul(side, low)), M.add(M.mul(outward, stemHigh), M.mul(side, low)), M.add(M.mul(outward, stemHigh), M.mul(side, high)), M.add(M.mul(outward, stemLow), M.mul(side, high))]);
      });
      (part.stopPins || []).forEach(function (stop) {
        if (stop.hardBlockPoints == null) throw new Error(part.partId + "/" + stop.featureId + ": stop-pin collider data missing (re-run Import samples)");
        var sp = pose(stop.transformId);
        if (M.len2(M.sub(sp.position, ring.position)) > 1e-8 || Math.abs(M.deltaAngle(sp.angle, ring.angle)) > 1e-3) throw new Error(part.partId + "/" + stop.featureId + ": stop-pin must share the ring transform");
        quads.push(stop.hardBlockPoints.map(P)); kinds.push(KIND.STOP); pinIndex.push(-1);
      });
      shape.localQuads = quads; shape.quadKind = kinds; shape.quadPin = pinIndex; shape.pinFeatures = features;
      shape.stemLocalPaths = stemPaths; shape.stemWorldPaths = stemPaths.map(function (q) { return q.map(function () { return V(0, 0); }); });
      shape.attachmentLocalPaths = attachmentPaths; shape.attachmentWorldPaths = attachmentPaths.map(function (q) { return q.map(function () { return V(0, 0); }); });
      shape.worldQuads = quads.map(function (q) { return q.map(function () { return V(0, 0); }); });
      var bound = shape.outer; quads.forEach(function (q) { q.forEach(function (v) { bound = Math.max(bound, M.len(v)); }); });
      shape.bound = bound; ringSetAngle(shape, M.repeat(ring.angle, 360));
      w.indexById[shape.id] = shape.index; w.rings.push(shape);
    });
    function fail(message) { if (!lenient) throw new Error(message); problems.push(message); }
    (level.guideLinks || []).forEach(function (link) {
      var guide = w.guides.find(function (g) { return g.id === link.guidePartId; });
      if (!guide || !(link.stickPartId in w.stickIndexById)) { fail("Guide link does not resolve: " + link.guidePartId + " -> " + link.stickPartId); return; }
      guide.stickId = link.stickPartId;
    });
    w.guides.forEach(function (g) { if (g.stickId == null) fail(g.id + ": guide is not linked to a stick"); });
    if (lenient) w.guides = w.guides.filter(function (g) { return g.stickId != null; });
    if (lenient) {
      w.sticks.forEach(function (st) {
        var single = { parts: level.parts, links: level.links }, saved = w.sticks;
        w.sticks = [st];
        try { resolveSlideAxes(w, single); } catch (e) { problems.push(e.message); st.slideAxis = V(Math.cos(st.angleDeg * D2R), Math.sin(st.angleDeg * D2R)); st.axisError = e.message; }
        w.sticks = saved;
      });
    } else resolveSlideAxes(w, level);
    w.rings.forEach(function (r) { w.objectIndexById[r.id] = r.index; });
    w.sticks.forEach(function (s) { w.objectIndexById[s.id] = w.rings.length + s.ordinal; });
    level.parts.forEach(function (part) {
      if (part.kind !== "bomb") return;
      if (part.bombRadius == null) throw new Error(part.partId + ": bomb circle data missing");
      var bp = pose(part.transformId), offset = part.bombOffset == null ? V(0, 0) : P(part.bombOffset);
      var center = M.add(bp.position, M.rot(offset, bp.angle));
      var host = part.hostPartId == null ? -1 : w.objectIndexById[part.hostPartId];
      if (host === undefined) { fail(part.partId + ": bomb host " + part.hostPartId + " is not a ring or stick"); return; }
      w.bombs.push(new Bomb(w, part.partId, host, center, part.bombRadius));
    });
    level.parts.forEach(function (part) {
      if (part.hasBomb && !w.bombs.some(function (b) { return b.host >= 0 && part.partId === w.idOf(b.host); })) fail(part.partId + ": hasBomb without a bomb definition");
    });
    w.poseOf = pose; w.problems = problems;
    return w;
  };
  World.prototype.idOf = function (obj) { return this.isStickObject(obj) ? this.stickOf(obj).id : this.rings[obj].id; };

  World.prototype.addStick = function (part, pose) {
    if (part.colliderHalfWidth == null) throw new Error(part.partId + ": stick collider data missing (re-run Import samples)");
    var shape = {
      id: part.partId, ordinal: this.sticks.length, active: true, origin: pose.position, angleDeg: M.repeat(pose.angle, 360), offset: 0, slideAxis: V(0, 0), slideAxisSource: "",
      bodyLocal: part.colliderPoints.map(P), dragLocal: part.dragAreaPoints.map(P), lockDirectionType: part.lockDirectionType || 0,
      centerline: M.centerlineBuild(part.pathPoints.map(P), part.cornerRadius || 0, part.colliderEndInset, part.colliderHalfWidth)
    };
    this.stickIndexById[shape.id] = shape.ordinal; this.sticks.push(shape);
  };
  World.prototype.addGuide = function (part, pose) {
    if (part.guideTrigger == null) throw new Error(part.partId + ": guide collider data missing (re-run Import samples)");
    var g = { id: part.partId, stickId: null, ordinal: this.guides.length, active: true, origin: pose.position, angleDeg: M.repeat(pose.angle, 360),
      triggerCenter: P(part.guideTrigger.center), triggerSize: P(part.guideTrigger.size),
      wallCenters: part.guideWalls.map(function (b) { return P(b.center); }), wallSizes: part.guideWalls.map(function (b) { return P(b.size); }) };
    g.triggerQuad = guideBoxWorld(g, g.triggerCenter, g.triggerSize);
    g.wallQuads = g.wallCenters.map(function (c, i) { return guideBoxWorld(g, c, g.wallSizes[i]); });
    this.guides.push(g);
  };

  // ---------- queries ----------
  World.prototype.hitTest = function (p) {
    var i, r, st, rings = this.rings, sticks = this.sticks;
    for (i = rings.length - 1; i >= 0; i--) {
      r = rings[i]; if (!r.active || !r.attachmentWorldPaths) continue;
      for (var k = 0; k < r.attachmentWorldPaths.length; k++) if (M.pointInPolygon(r.attachmentWorldPaths[k], p)) return i;
      for (k = 0; k < r.worldQuads.length; k++) if (r.quadKind[k] === KIND.STOP && M.pointInPolygon(r.worldQuads[k], p)) return i;
    }
    for (i = rings.length - 1; i >= 0; i--) if (rings[i].active && M.arcSdf(rings[i].arc, p) <= 0) return i;
    for (i = sticks.length - 1; i >= 0; i--) { st = sticks[i]; if (st.active && M.pointInPolygon(st.bodyLocal, M.poseToLocal(stickPose(st), p))) return rings.length + i; }
    for (i = rings.length - 1; i >= 0; i--) {
      r = rings[i]; if (!r.active) continue;
      if (r.dragLocalPaths == null) { var d = M.len(M.sub(p, r.center)); if (d >= r.dragInner && d <= r.dragOuter) return i; }
      else {
        var local = M.rot(M.sub(p, r.center), -r.angleDeg), inside = false;
        r.dragLocalPaths.forEach(function (path) { if (M.pointInPolygon(path, local)) inside = !inside; });
        if (inside) return i;
      }
    }
    for (i = sticks.length - 1; i >= 0; i--) { st = sticks[i]; if (st.active && M.pointInPolygon(st.dragLocal, M.poseToLocal(stickPose(st), p))) return rings.length + i; }
    return -1;
  };

  function circleTouchesRect(c, radius, rect) {
    var dx = Math.max(rect.xMin - c.x, 0, c.x - rect.xMax), dy = Math.max(rect.yMin - c.y, 0, c.y - rect.yMax);
    return dx * dx + dy * dy <= radius * radius;
  }
  function wallNear(ring, quad) { var c = M.mul(M.add(quad[0], quad[2]), 0.5); return M.len(M.sub(c, ring.center)) <= ring.bound + M.len(M.sub(quad[2], quad[0])) * 0.5; }

  function pair(m, s, mask) {
    var best = 0, q, i, j;
    if (mask & KIND.BODY) {
      best = Math.max(best, -(M.arcArcDistance(m.arc, s.arc) - m.arc.tube - s.arc.tube));
      for (q = 0; q < s.worldQuads.length; q++) if (s.quadKind[q] & mask) best = Math.max(best, -M.minSdfArcOverConvex(m.arc, s.worldQuads[q]));
      for (q = 0; q < m.worldQuads.length; q++) if (m.quadKind[q] & mask) best = Math.max(best, -M.minSdfArcOverConvex(s.arc, m.worldQuads[q]));
      (m.stemWorldPaths || []).forEach(function (stem) { best = Math.max(best, -M.minSdfArcOverConvex(s.arc, stem)); });
      (s.stemWorldPaths || []).forEach(function (stem) { best = Math.max(best, -M.minSdfArcOverConvex(m.arc, stem)); });
    }
    for (i = 0; i < m.worldQuads.length; i++) {
      if (!(m.quadKind[i] & mask)) continue;
      for (j = 0; j < s.worldQuads.length; j++) if (s.quadKind[j] & mask) best = Math.max(best, M.satDepth(m.worldQuads[i], s.worldQuads[j]));
    }
    if (mask & KIND.HARD) best = Math.max(best, headDepth(m, s, mask));
    return Math.max(0, best);
  }

  // Mirrors RotateCollisionWorld.HeadDepth: the solid visible pin head blocks the other ring's pin parts, stop-pins and visible stems/heads
  // (never ring bodies or sticks, never a lock collider), so a head cannot slip into another head's open gap between its walls.
  function headDepth(m, s, mask) {
    if (!m.attachmentWorldPaths || !s.attachmentWorldPaths) return 0;
    var best = 0, h, q, k;
    for (h = 1; h < m.attachmentWorldPaths.length; h += 2) {
      for (q = 0; q < s.worldQuads.length; q++) if (s.quadKind[q] & mask) best = Math.max(best, M.satDepth(m.attachmentWorldPaths[h], s.worldQuads[q]));
      for (k = 0; k < s.attachmentWorldPaths.length; k++) best = Math.max(best, M.satDepth(m.attachmentWorldPaths[h], s.attachmentWorldPaths[k]));
    }
    for (h = 1; h < s.attachmentWorldPaths.length; h += 2) {
      for (q = 0; q < m.worldQuads.length; q++) if (m.quadKind[q] & mask) best = Math.max(best, M.satDepth(s.attachmentWorldPaths[h], m.worldQuads[q]));
      for (k = 0; k < m.attachmentWorldPaths.length; k += 2) best = Math.max(best, M.satDepth(s.attachmentWorldPaths[h], m.attachmentWorldPaths[k]));
    }
    return best;
  }

  // Deepest penetration of ring `mover` posed at `degrees` (poses the mover; caller commits the accepted angle).
  World.prototype.penetration = function (mover, degrees, mask) {
    var m = this.rings[mover]; ringSetAngle(m, degrees); var best = 0, i, q;
    for (i = 0; i < this.rings.length; i++) {
      var s = this.rings[i];
      if (i === mover || !s.active || M.len(M.sub(s.center, m.center)) > m.bound + s.bound) continue;
      best = Math.max(best, pair(m, s, mask));
    }
    if (mask & KIND.BODY)
      for (i = 0; i < this.sticks.length; i++) {
        var st = this.sticks[i]; if (!st.active) continue;
        var pose = stickPose(st); if (!circleTouchesRect(m.center, m.bound, M.chainBounds(st.centerline, pose))) continue;
        best = Math.max(best, -(M.chainDistanceToArc(st.centerline, pose, m.arc) - m.arc.tube - st.centerline.tube));
        for (q = 0; q < m.worldQuads.length; q++) if (m.quadKind[q] & mask) best = Math.max(best, -M.chainMinSdfOverConvex(st.centerline, pose, m.worldQuads[q]));
        (m.stemWorldPaths || []).forEach(function (stem) { best = Math.max(best, -M.chainMinSdfOverConvex(st.centerline, pose, stem)); });
      }
    if (mask & KIND.GUIDE)
      for (i = 0; i < this.guides.length; i++) {
        var g = this.guides[i]; if (!g.active) continue;
        for (var wq = 0; wq < g.wallQuads.length; wq++) {
          var wall = g.wallQuads[wq]; if (!wallNear(m, wall)) continue;
          if (mask & KIND.BODY) best = Math.max(best, -M.minSdfArcOverConvex(m.arc, wall));
          for (q = 0; q < m.worldQuads.length; q++) if (m.quadKind[q] & mask) best = Math.max(best, M.satDepth(m.worldQuads[q], wall));
        }
      }
    return best;
  };

  World.prototype.stickPenetration = function (ordinal, offset, mask) {
    var me = this.sticks[ordinal], chain = me.centerline, pose = stickPoseAt(me, offset), box = M.chainBounds(chain, pose), best = 0, i, q;
    for (i = 0; i < this.rings.length; i++) {
      var r = this.rings[i]; if (!r.active || !circleTouchesRect(r.center, r.bound, box)) continue;
      if (mask & KIND.BODY) best = Math.max(best, -(M.chainDistanceToArc(chain, pose, r.arc) - chain.tube - r.arc.tube));
      for (q = 0; q < r.worldQuads.length; q++) if (r.quadKind[q] & mask) best = Math.max(best, -M.chainMinSdfOverConvex(chain, pose, r.worldQuads[q]));
      if (mask & KIND.BODY) (r.stemWorldPaths || []).forEach(function (stem) { best = Math.max(best, -M.chainMinSdfOverConvex(chain, pose, stem)); });
    }
    if (mask & KIND.BODY)
      for (i = 0; i < this.sticks.length; i++) {
        var other = this.sticks[i]; if (i === ordinal || !other.active) continue;
        var op = stickPose(other); if (!M.rectOverlaps(box, M.chainBounds(other.centerline, op))) continue;
        best = Math.max(best, chain.tube + other.centerline.tube - M.chainDistanceToChain(chain, pose, other.centerline, op));
      }
    if (mask & KIND.GUIDE)
      for (i = 0; i < this.guides.length; i++) {
        var g = this.guides[i]; if (!g.active) continue;
        g.wallQuads.forEach(function (wall) { best = Math.max(best, -M.chainMinSdfOverConvex(chain, pose, wall)); });
      }
    return Math.max(0, best);
  };

  World.prototype.guideEngaged = function (guideOrdinal) {
    var g = this.guides[guideOrdinal]; if (!g.active) return false;
    var st = this.sticks[this.stickIndexById[g.stickId]]; if (!st.active) return false;
    return M.chainMinSdfOverConvex(st.centerline, stickPose(st), g.triggerQuad) < -this.engageThreshold;
  };

  // Does the body of `target` still overlap the source? pin < 0: any collider of the source ring (scope Ring); else only that pin.
  World.prototype.isEngaged = function (target, source, pin) {
    var q, s;
    if (this.isStickObject(target)) {
      var st = this.stickOf(target), src = this.rings[source]; if (!st.active || !src.active) return false;
      var pose = stickPose(st);
      // Only the source's pins hold a stick: a released stick touching the ring body again must not re-lock the ring.
      for (q = 0; q < src.worldQuads.length; q++)
        if (src.quadKind[q] !== KIND.STOP && (pin < 0 || src.quadPin[q] === pin) && M.chainMinSdfOverConvex(st.centerline, pose, src.worldQuads[q]) < -this.engageThresholdOf(src.quadKind[q])) return true;
      return false;
    }
    var t = this.rings[target]; s = this.rings[source];
    if (!t.active || !s.active) return false;
    if (pin < 0 && -(M.arcArcDistance(t.arc, s.arc) - t.arc.tube - s.arc.tube) > this.engageThreshold) return true;
    for (q = 0; q < s.worldQuads.length; q++)
      if (s.quadKind[q] !== KIND.STOP && (pin < 0 || s.quadPin[q] === pin) && M.minSdfArcOverConvex(t.arc, s.worldQuads[q]) < -this.engageThresholdOf(s.quadKind[q])) return true;
    return false;
  };

  World.prototype.pinInGap = function (target, source, pin, minGapDegrees, epsilonDegrees) {
    var t = this.rings[target], s = this.rings[source];
    if (t.gapDegrees <= minGapDegrees) return false;
    for (var q = 0; q < s.worldQuads.length; q++) {
      if (s.quadPin[q] !== pin || s.quadKind[q] !== KIND.SENSOR) continue;
      var quad = s.worldQuads[q], c = V(0, 0); quad.forEach(function (v) { c = M.add(c, v); }); c = M.mul(c, 1 / quad.length);
      var rel = M.sub(c, t.center), delta = M.deltaAngle(t.angleDeg + t.gapDirectionDegrees, Math.atan2(rel.y, rel.x) * R2D);
      if (Math.abs(delta) > t.gapDegrees * 0.5 + epsilonDegrees) return false;
      var min = M.distanceToPolygon(t.center, quad), max = 0; quad.forEach(function (v) { max = Math.max(max, M.len(M.sub(v, t.center))); });
      return min <= t.outer && t.inner <= max;
    }
    return false;
  };

  // ---------- RotateSlideAxisResolver ----------
  var PARALLEL_DOT = 0.9999, DISTANCE_TIE = 1e-4;
  function parallel(a, b) { return Math.abs(M.dot(a, b)) >= PARALLEL_DOT; }
  function toBoard(st, l) { return M.rot(l, st.angleDeg); }
  function invalid(st, msg) { return new Error(st.id + ": " + msg); }
  function addConstraint(st, state, c) {
    if (state.axis.x === 0 && state.axis.y === 0) state.axis = c.axis;
    else if (!parallel(state.axis, c.axis)) throw invalid(st, "incompatible slide axes: " + state.reasons.join(", ") + " vs " + c.source);
    if (state.reasons.indexOf(c.source) < 0) state.reasons.push(c.source);
  }
  function ordinalCompare(a, b) { return a.source < b.source ? -1 : a.source > b.source ? 1 : 0; }
  function resolveSlideAxes(w, level) {
    w.sticks.forEach(function (st) {
      var part = level.parts.find(function (p) { return p.partId === st.id; });
      var guides = [];
      w.guides.forEach(function (g) { if (g.stickId === st.id) guides.push({ axis: V(Math.cos(g.angleDeg * D2R), Math.sin(g.angleDeg * D2R)), source: "guide:" + g.id }); });
      guides.sort(ordinalCompare);
      var authored = part.localSlideAxis != null, state = { axis: V(0, 0), reasons: [] };
      if (authored) {
        var local = P(part.localSlideAxis), scale = Math.max(Math.abs(local.x), Math.abs(local.y));
        if (scale === 0 || !isFinite(scale)) throw invalid(st, "invalid localSlideAxis");
        state.axis = toBoard(st, M.normalize(M.mul(local, 1 / scale))); state.reasons.push("authored");
      }
      guides.forEach(function (g) { addConstraint(st, state, g); });
      var pins = [];
      level.links.forEach(function (link) {
        if (link.targetPartId !== st.id) return;
        if (!(link.sourcePartId in w.indexById)) throw invalid(st, "missing pin owner " + link.sourcePartId);
        var ring = w.rings[w.indexById[link.sourcePartId]], pin = ring.pinFeatures.indexOf(link.sourceFeatureId);
        if (pin < 0) throw invalid(st, "missing pin " + link.sourcePartId + "/" + link.sourceFeatureId);
        var sensor = null;
        for (var q = 0; q < ring.quadKind.length; q++) if (ring.quadKind[q] === KIND.SENSOR && ring.quadPin[q] === pin) { sensor = ring.worldQuads[q]; break; }
        if (!sensor) throw invalid(st, "missing pin sensor " + link.sourceFeatureId);
        if (M.chainMinSdfOverConvex(st.centerline, stickPose(st), sensor) >= 0) return;
        var passage = M.normalize(M.sub(sensor[3], sensor[0])), sourceName = "pin:" + link.sourcePartId + "/" + link.sourceFeatureId;
        if (authored || guides.length > 0) pins.push({ axis: passage, source: sourceName });
        else {
          var lc = stickToLocal(st, M.mul(M.add(sensor[0], sensor[2]), 0.5)), seg = { i: -1 };
          var tangent = contactTangent(st, lc, seg);
          if (!parallel(tangent, passage)) throw invalid(st, sourceName + " passage disagrees with the contacted segment; author localSlideAxis");
          pins.push({ axis: tangent, source: sourceName + "/segment:" + seg.i });
        }
      });
      pins.sort(ordinalCompare);
      pins.forEach(function (p) { addConstraint(st, state, p); });
      if (state.axis.x === 0 && state.axis.y === 0) {
        st.centerline.primitives.forEach(function (prim) {
          if (M.isArc(prim)) throw invalid(st, "unconstrained bent path; author localSlideAxis");
          var cand = toBoard(st, M.normalize(M.sub(prim.b, prim.a)));
          if (cand.x === 0 && cand.y === 0) return;
          addConstraint(st, state, { axis: cand, source: "straight-path" });
        });
      }
      if (state.axis.x === 0 && state.axis.y === 0) throw invalid(st, "no slide axis; author localSlideAxis");
      st.slideAxis = canonical(st, state.axis); st.slideAxisSource = state.reasons.join(", ");
    });
  }
  function contactTangent(st, point, seg) {
    var prims = st.centerline.primitives, nearest = INF, i;
    for (i = 0; i < prims.length; i++) { var d = M.distanceToPrimitive(prims[i], point); if (d < nearest) { nearest = d; seg.i = i; } }
    var hit = prims[seg.i];
    if (M.isArc(hit)) throw invalid(st, "pin contacts a curved corner; author localSlideAxis");
    var axis = toBoard(st, M.normalize(M.sub(hit.b, hit.a)));
    for (i = 0; i < prims.length; i++) {
      if (i === seg.i || M.distanceToPrimitive(prims[i], point) > nearest + DISTANCE_TIE) continue;
      var other = prims[i];
      if (M.isArc(other) || !parallel(axis, toBoard(st, M.normalize(M.sub(other.b, other.a))))) throw invalid(st, "ambiguous pin contact at a bend; author localSlideAxis");
    }
    return axis;
  }
  function canonical(st, axis) {
    var lx = toBoard(st, V(1, 0)), ly = toBoard(st, V(0, 1));
    var ref = Math.abs(M.dot(axis, lx)) >= Math.abs(M.dot(axis, ly)) ? lx : ly;
    return M.normalize(M.dot(axis, ref) < 0 ? M.mul(axis, -1) : axis);
  }

  // ---------- RotateBomb ----------
  var CONTACT_EPSILON = 0.00001;
  function Bomb(world, id, host, center, radius) {
    this.world = world; this.id = id; this.host = host; this.radius = radius; this.fixed = center; this.active = true; this.local = V(0, 0);
    if (host >= 0) this.local = world.isStickObject(host) ? M.poseToLocal(stickPose(world.stickOf(host)), center) : M.rot(M.sub(center, world.rings[host].center), -world.rings[host].angleDeg);
  }
  Bomb.prototype.center = function () {
    var w = this.world, h = this.host;
    if (h < 0) return this.fixed;
    return w.isStickObject(h) ? M.poseToWorld(stickPose(w.stickOf(h)), this.local) : M.add(w.rings[h].center, M.rot(this.local, w.rings[h].angleDeg));
  };
  Bomb.prototype.detach = function () { this.fixed = this.center(); this.host = -1; };
  Bomb.prototype.orbit = function () { return M.len(this.local); };

  function objectDistance(w, obj, p) {
    if (w.isStickObject(obj)) { var s = w.stickOf(obj); return M.clSdf(s.centerline, M.poseToLocal(stickPose(s), p)); }
    var ring = w.rings[obj], d = M.arcSdf(ring.arc, p);
    for (var i = 0; i < ring.worldQuads.length; i++) if (ring.quadKind[i] !== KIND.SENSOR) d = Math.min(d, M.distanceToPolygon(p, ring.worldQuads[i]));
    return d;
  }
  function objActive(w, obj) { return w.isStickObject(obj) ? w.stickOf(obj).active : w.rings[obj].active; }
  function candidate(state, distance, bomb, target, other, key) {
    if (distance < state.best || (distance === state.best && (state.contact == null || key < state.contact.colliderId)))
      { state.best = distance; state.contact = { bomb: bomb, target: target, otherBomb: other, colliderId: key, pose: 0 }; }
  }
  function pad6(n) { var s = String(n); while (s.length < 6) s = "0" + s; return s; }
  function bombNearest(w, moving) {
    var state = { best: INF, contact: null };
    for (var b = 0; b < w.bombs.length; b++) {
      var bomb = w.bombs[b]; if (!bomb.active) continue;
      var p = bomb.center();
      for (var o = 0; o < w.objectCount(); o++)
        if (o !== bomb.host && objActive(w, o) && (bomb.host === moving || o === moving))
          candidate(state, objectDistance(w, o, p) - bomb.radius, b, o, -1, bomb.id + "/object/" + pad6(o));
      if (bomb.host === moving)
        w.guides.forEach(function (g) {
          if (!g.active) return;
          var d = M.distanceToPolygon(p, g.triggerQuad);
          g.wallQuads.forEach(function (q) { d = Math.min(d, M.distanceToPolygon(p, q)); });
          candidate(state, d - bomb.radius, b, w.objectIndexById[g.stickId], -1, bomb.id + "/guide/" + g.id);
        });
      for (var other = b + 1; other < w.bombs.length; other++) {
        var next = w.bombs[other];
        if (next.active && (bomb.host === moving || next.host === moving)) candidate(state, M.len(M.sub(p, next.center())) - bomb.radius - next.radius, b, -1, other, bomb.id + "/bomb/" + next.id);
      }
    }
    return state;
  }
  // Analytic contact on the accepted path. Returns { contact, to } (to = pose where the contact happened, or the unchanged target).
  function bombSweep(w, moving, from, to) {
    if (w.bombs.length === 0) return { contact: null, to: to };
    var stick = w.isStickObject(moving), delta = to - from, speed = Math.abs(delta);
    if (!stick) {
      var bound = w.rings[moving].bound;
      w.bombs.forEach(function (b) { if (b.active && b.host === moving) bound = Math.max(bound, b.orbit()); });
      speed *= D2R * bound * 2;
    } else speed *= 2;
    var saved = stick ? w.stickOf(moving).offset : w.rings[moving].angleDeg, fraction = 0;
    function setPose(v) { if (stick) w.stickOf(moving).offset = v; else ringSetAngle(w.rings[moving], v); }
    try {
      for (var i = 0; i < 4096; i++) {
        var pose = from + delta * fraction; setPose(pose);
        var st = bombNearest(w, moving);
        if (st.best <= CONTACT_EPSILON) { st.contact.pose = pose; return { contact: st.contact, to: pose }; }
        if (fraction >= 1 || speed < 1e-10 || st.best === INF) return { contact: null, to: to };
        var next = Math.min(1, fraction + st.best / speed * 0.9);
        if (next <= fraction) return { contact: null, to: pose };
        fraction = next;
      }
      return { contact: null, to: from + delta * fraction };
    } finally { setPose(saved); }
  }

  RR.KIND = KIND;
  RR.World = World;
  RR.W = { ringSetAngle: ringSetAngle, stickAxis: stickAxis, stickPose: stickPose, stickPoseAt: stickPoseAt, stickToLocal: stickToLocal, stickToWorld: stickToWorld,
    bombSweep: bombSweep, BOMB_CONTACT_EPSILON: CONTACT_EPSILON };
})(typeof module === "object" && module.exports ? require("./rr-ns.js") : (self.RR = self.RR || {}));

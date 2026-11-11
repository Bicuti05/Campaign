// TURP Level Designer — browser UI. All gameplay/geometry comes from core/*.js (port of the Unity C# code).
(function () {
  "use strict";
  var RR = window.RR, C = RR.C, A = C.authoring, PITCH = C.layout.PITCH, M = RR.M, V = M.V, W = RR.W, KIND = RR.KIND;
  var TOOL_VERSION = "1.0.0";
  var STORAGE_DRAFT = "rr-designer.draft.v1", STORAGE_PREFS = "rr-designer.prefs.v1";

  function $(s) { return document.querySelector(s); }
  function $all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function storageGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function fmt(x, d) { return (Math.round(x * Math.pow(10, d || 2)) / Math.pow(10, d || 2)).toString(); }
  function norm360(a) { var r = M.repeat(a, 360); return r >= 359.9995 ? 0 : r; }

  // ============================================================== state
  var S = {
    doc: null, meta: { name: "", author: "", notes: "" }, fileName: null,
    mode: "edit", tool: "select", stickPreset: "straight",
    grid: true, lattice: "square", autoLink: true,
    show: { labels: true, links: false, phone: false, debug: false }, feel: true,
    cam: { x: 0, y: 0, scale: 0.03 }, // world units per screen pixel
    selection: null, group: [], hover: null, drag: null, linkSource: null, marquee: null, guides: null,
    clipboard: null, pasteCount: 0, dir: null, dirState: "none", savedName: null, levelFiles: [],
    worldCache: null, worldRev: -1, worldError: null,
    analysis: null, analysisTimer: 0,
    play: null, solve: { running: false, result: null, rev: -1, stepIndex: -1 },
    colorIndex: 0, ringGapDir: 0
  };

  // ============================================================== helpers: doc & world
  function doc() { return S.doc; }
  function rev() { return S.doc.revision; }
  function editWorld() {
    if (S.worldRev !== rev() || !S.worldCache) {
      try { S.worldCache = RR.World.build(S.doc.data, { lenient: true }); S.worldError = null; }
      catch (e) { S.worldError = e.message; S.worldCache = null; }
      S.worldRev = rev();
    }
    return S.worldCache;
  }
  function partKind(id) { var p = S.doc.part(id); return p ? p.kind : null; }
  function label(id) { return RR.labelOf(id, partKind(id)); }
  function ringPose(id) { return S.doc.worldOfPart(id); }

  function changed(opts) {
    S.worldRev = -1;
    if (!opts || !opts.keepSolve) { S.solve.result = null; S.solve.stepIndex = -1; }
    updateDirty(); scheduleAnalysis(); autosave(); render(); if (!opts || !opts.noInspector) renderInspector();
  }
  function updateDirty() {
    $("#dirtyMark").hidden = !S.doc.dirty;
    $("#docTitle").textContent = (S.meta.name || ("Level " + S.doc.data.levelId)) + (S.fileName ? "  ·  " + S.fileName : "");
    $("#btnUndo").disabled = S.mode === "edit" ? !S.doc.canUndo() : !(S.play && S.play.history.length);
    $("#btnRedo").disabled = S.mode !== "edit" || !S.doc.canRedo();
  }

  // ============================================================== snapping
  function snapPoint(p, free) {
    if (!S.grid || free) return V(Math.round(p.x * 100) / 100, Math.round(p.y * 100) / 100);
    if (S.lattice === "hex") {
      var dy = PITCH * Math.sqrt(3) / 2, best = null, bd = Infinity, r0 = Math.round(p.y / dy);
      for (var r = r0 - 1; r <= r0 + 1; r++) {
        var off = (r & 1) ? PITCH / 2 : 0, x = Math.round((p.x - off) / PITCH) * PITCH + off, q = V(x, r * dy), d = M.len2(M.sub(q, p));
        if (d < bd) { bd = d; best = q; }
      }
      return best;
    }
    var s = PITCH / 2;
    return V(Math.round(p.x / s) * s, Math.round(p.y / s) * s);
  }
  function snapAngle(a, free) { if (!S.grid || free) return Math.round(a); return Math.round(a / 15) * 15; }
  function angleStep() { return S.grid ? 15 : 5; }

  // ============================================================== camera
  var canvas = $("#canvas");
  function viewRect() {
    var w = canvas.clientWidth || 800, h = canvas.clientHeight || 600, s = S.cam.scale;
    return { xMin: S.cam.x - w * s / 2, xMax: S.cam.x + w * s / 2, yMin: S.cam.y - h * s / 2, yMax: S.cam.y + h * s / 2 };
  }
  function toWorld(ev) {
    var r = canvas.getBoundingClientRect(), s = S.cam.scale;
    return V(S.cam.x + (ev.clientX - r.left - r.width / 2) * s, S.cam.y - (ev.clientY - r.top - r.height / 2) * s);
  }
  function fit() {
    var w = S.mode === "play" && S.play ? S.play.sim.world : editWorld();
    var b = w ? RR.Render.bounds(w) : { xMin: -6, yMin: -6, xMax: 6, yMax: 6 };
    if (!w || (!w.rings.length && !w.sticks.length)) b = { xMin: -8, yMin: -10, xMax: 8, yMax: 10 };
    var cw = canvas.clientWidth || 800, ch = canvas.clientHeight || 600, m = 2.2;
    S.cam.x = (b.xMin + b.xMax) / 2; S.cam.y = (b.yMin + b.yMax) / 2;
    S.cam.scale = Math.max((b.xMax - b.xMin + 2 * m) / cw, (b.yMax - b.yMin + 2 * m) / ch);
    render();
  }

  // ============================================================== rendering
  var rafPending = false;
  function render() { if (!rafPending) { rafPending = true; requestAnimationFrame(draw); } }
  function draw() {
    rafPending = false;
    var world, level = S.doc.data, links = null, fade = {}, flash = {}, overlay = "";
    if (S.mode === "play" && S.play) {
      world = S.play.sim.world;
      if (S.show.links) links = S.play.sim.snapshot().links;
      var now = performance.now(), anim = false;
      S.play.fading.forEach(function (f) {
        var t = Math.min(1, (now - f.t0) / 450); fade[f.id] = { alpha: 1 - t, dx: f.dir.x * t * 3, dy: f.dir.y * t * 3 }; if (t < 1) anim = true;
      });
      S.play.fading = S.play.fading.filter(function (f) { return now - f.t0 < 450; });
      Object.keys(S.play.flash).forEach(function (id) { var f = S.play.flash[id]; if (now < f.until) { flash[id] = f.color; anim = true; } else delete S.play.flash[id]; });
      // fading objects are drawn although the simulation already removed them
      var revive = Object.keys(fade).map(function (id) { var o = world.objectIndexById[id]; return o === undefined ? null : (world.isStickObject(o) ? world.stickOf(o) : world.rings[o]); }).filter(Boolean);
      revive.forEach(function (o) { o._wasActive = o.active; o.active = true; });
      var svg = RR.Render.render({ world: world, level: level, view: viewRect(), labels: S.show.labels, links: links, debug: S.show.debug, fade: fade, flash: flash, phone: S.show.phone, axes: false, lockCounts: liveLockCounts(world) });
      revive.forEach(function (o) { o.active = o._wasActive; });
      canvas.innerHTML = svg;
      if (anim) render(); else if (S.play.pendingWin) showWin();
      return;
    }
    world = editWorld();
    if (!world) { canvas.innerHTML = '<div class="banner err" style="position:static;margin:20px">Không dựng được level: ' + esc(S.worldError) + "</div>"; return; }
    if (S.show.links) links = S.doc.data.links.map(function (l) { return { source: l.sourcePartId, target: l.targetPartId, pin: l.sourceFeatureId, active: linkEngaged(l) }; });
    overlay = editOverlay(world);
    canvas.innerHTML = RR.Render.render({ world: world, level: level, view: viewRect(), labels: S.show.labels, links: links, debug: S.show.debug, phone: S.show.phone,
      selection: S.selection ? { id: S.selection.id, feature: S.selection.feature } : null, selectedIds: groupSet(), grid: S.grid ? { pitch: PITCH, type: S.lattice, step: PITCH / 2 } : null, overlay: overlay, axes: true });
  }
  // Play mode: live Chain counts of the simulation world (null outside play).
  function liveLockCounts(world) {
    var sim = S.play && S.play.sim; if (!sim) return null; var o = {};
    for (var i = 0; i < sim.objectCount(); i++) o[sim.idOf(i)] = sim.lockCountOf(i);
    return o;
  }
  function groupSet() { var o = {}; S.group.forEach(function (id) { o[id] = true; }); return o; }
  function linkEngaged(l) {
    var a = S.analysisLinks; if (!a) return true;
    var k = l.sourcePartId + "/" + l.sourceFeatureId + "/" + l.targetPartId; return a[k] !== false;
  }
  function svgP(p) { return fmt(p.x, 3) + "," + fmt(-p.y, 3); }
  function handleFor(world, sel) {
    if (!sel || sel.feature) return null;
    var o = world.objectIndexById[sel.id];
    if (o !== undefined && !world.isStickObject(o)) { var r = world.rings[o], a = r.angleDeg + r.gapDirectionDegrees; return { center: r.center, pos: M.add(r.center, M.polar(r.radiusHandle || (r.outer + 1.05), a)), angle: a }; }
    if (o !== undefined) { var st = world.stickOf(o), pose = W.stickPose(st), pts = M.clSample(st.centerline, 0.25), end = M.poseToWorld(pose, pts[pts.length - 1]), c = M.poseToWorld(pose, V(0, 0)); var dir = M.normalize(M.sub(end, c)); return { center: c, pos: M.add(end, M.mul(dir, 0.9)), angle: st.angleDeg }; }
    var g = world.guides.find(function (q) { return q.id === sel.id; });
    if (g) return { center: g.origin, pos: M.add(g.origin, M.polar(1.0, g.angleDeg)), angle: g.angleDeg };
    return null;
  }
  function editOverlay(world) {
    var out = [], s = S.cam.scale;
    var h = S.group.length > 1 ? null : handleFor(world, S.selection);
    if (S.group.length > 1 && S.tool === "select" && !S.marquee) out.push(groupOverlay(world, s));
    if (S.guides) out.push(guideOverlay(S.guides, s));
    if (S.marquee) {
      var a = S.marquee.a, b = S.marquee.b;
      out.push('<rect x="' + fmt(Math.min(a.x, b.x), 3) + '" y="' + fmt(-Math.max(a.y, b.y), 3) + '" width="' + fmt(Math.abs(b.x - a.x), 3) + '" height="' + fmt(Math.abs(b.y - a.y), 3) + '" fill="rgba(29,111,224,0.08)" stroke="#1d6fe0" stroke-width="' + fmt(1 * s, 4) + '" stroke-dasharray="' + fmt(4 * s, 4) + '"/>');
    }
    if (h && S.tool === "select") {
      out.push('<line x1="' + fmt(h.center.x, 3) + '" y1="' + fmt(-h.center.y, 3) + '" x2="' + fmt(h.pos.x, 3) + '" y2="' + fmt(-h.pos.y, 3) + '" stroke="#1d6fe0" stroke-width="' + fmt(1.5 * s, 4) + '" stroke-dasharray="' + fmt(5 * s, 4) + '"/>');
      out.push('<circle cx="' + fmt(h.pos.x, 3) + '" cy="' + fmt(-h.pos.y, 3) + '" r="' + fmt(7 * s, 4) + '" fill="#fff" stroke="#1d6fe0" stroke-width="' + fmt(2 * s, 4) + '"/>');
      out.push('<text x="' + fmt(h.pos.x + 11 * s, 3) + '" y="' + fmt(-h.pos.y - 9 * s, 3) + '" font-size="' + fmt(11 * s, 4) + '" fill="#1d6fe0">' + fmt(norm360(h.angle), 0) + "°</text>");
    }
    if (S.linkSource) {
      var ring = world.rings[world.indexById[S.linkSource.id]];
      if (ring) { var pi = ring.pinFeatures.indexOf(S.linkSource.feature); if (pi >= 0) out.push('<polygon points="' + ring.attachmentWorldPaths[pi * 2].map(svgP).join(" ") + '" fill="none" stroke="#e0a020" stroke-width="' + fmt(3 * s, 4) + '"/>'); }
      if (S.hover && S.hover.world) out.push('<line x1="' + fmt(ring.center.x, 3) + '" y1="' + fmt(-ring.center.y, 3) + '" x2="' + fmt(S.hover.world.x, 3) + '" y2="' + fmt(-S.hover.world.y, 3) + '" stroke="#e0a020" stroke-width="' + fmt(2 * s, 4) + '" stroke-dasharray="' + fmt(6 * s, 4) + '"/>');
    }
    if (S.hover && S.hover.world && S.mode === "edit") {
      var p = S.hover.world, sp = snapPoint(p, S.hover.free);
      if (S.tool === "ring" || S.tool === "closed") {
        var R = A.RING_RADIUS, gap = S.tool === "closed" ? 0 : A.RING_GAP_DEGREES, half = gap / 2 + (A.RING_BAND_HALF / R) * RR.R2D;
        var arc = M.arcCreate(sp, R - A.RING_BAND_HALF, R + A.RING_BAND_HALF, gap, S.ringGapDir);
        out.push('<circle cx="' + fmt(sp.x, 3) + '" cy="' + fmt(-sp.y, 3) + '" r="' + fmt(R, 3) + '" fill="none" stroke="rgba(29,111,224,0.45)" stroke-width="0.5" stroke-dasharray="' + (gap ? "none" : "none") + '"/>');
        if (gap) { var g0 = M.add(sp, M.polar(R, S.ringGapDir)); out.push('<circle cx="' + fmt(g0.x, 3) + '" cy="' + fmt(-g0.y, 3) + '" r="0.32" fill="' + RR.Render.THEME.board + '"/>'); }
        void arc; void half;
      } else if (S.tool === "stick") {
        out.push('<circle cx="' + fmt(sp.x, 3) + '" cy="' + fmt(-sp.y, 3) + '" r="0.18" fill="rgba(29,111,224,0.6)"/>');
      }
    }
    return out.join("");
  }

  // ============================================================== picking (edit mode)
  function pick(p) {
    var w = editWorld(); if (!w) return null;
    var i, k, r;
    for (i = w.rings.length - 1; i >= 0; i--) {
      r = w.rings[i];
      for (k = 0; k < r.attachmentWorldPaths.length; k += 2) if (M.pointInPolygon(r.attachmentWorldPaths[k], p) || M.pointInPolygon(r.attachmentWorldPaths[k + 1], p)) return { type: "pin", id: r.id, feature: r.pinFeatures[k / 2] };
      var stops = (S.doc.part(r.id).stopPins || []), si = 0;
      for (k = 0; k < r.worldQuads.length; k++) if (r.quadKind[k] === KIND.STOP) { if (M.distanceToPolygon(p, r.worldQuads[k]) <= 0.08) return { type: "stop", id: r.id, feature: stops[si].featureId }; si++; }
    }
    for (i = w.bombs.length - 1; i >= 0; i--) if (M.len(M.sub(p, w.bombs[i].center())) <= w.bombs[i].radius) return { type: "part", id: w.bombs[i].id };
    for (i = w.guides.length - 1; i >= 0; i--) if (M.pointInPolygon(w.guides[i].triggerQuad, p) || w.guides[i].wallQuads.some(function (q) { return M.distanceToPolygon(p, q) <= 0.08; })) return { type: "part", id: w.guides[i].id };
    for (i = w.rings.length - 1; i >= 0; i--) if (Math.abs(M.arcDistanceToCenterline(w.rings[i].arc, p)) <= w.rings[i].arc.tube + 0.12) return { type: "part", id: w.rings[i].id };
    for (i = w.sticks.length - 1; i >= 0; i--) { var st = w.sticks[i]; if (M.clSdf(st.centerline, M.poseToLocal(W.stickPose(st), p)) <= 0.12) return { type: "part", id: st.id }; }
    for (i = w.rings.length - 1; i >= 0; i--) if (M.len(M.sub(p, w.rings[i].center)) <= w.rings[i].inner) return { type: "part", id: w.rings[i].id };
    return null;
  }
  function nearestRing(p, maxDist) {
    var w = editWorld(); if (!w) return null; var best = null, bd = maxDist;
    w.rings.forEach(function (r) { var d = Math.abs(M.len(M.sub(p, r.center)) - r.arc.radius); if (d < bd) { bd = d; best = r; } });
    return best;
  }
  function hitHandle(p) {
    var w = editWorld(); if (!w || !S.selection || S.tool !== "select") return false;
    var h = handleFor(w, S.selection); return h && M.len(M.sub(p, h.pos)) <= 10 * S.cam.scale;
  }

  // ============================================================== edit operations
  function nextColor() { var c = A.PALETTE[S.colorIndex % A.PALETTE.length]; S.colorIndex++; return c; }
  function afterEdit() { if (S.autoLink) S.doc.relinkAll(); }
  function placeAt(p, ev) {
    var free = ev.altKey, sp = snapPoint(p, free), d = S.doc, id;
    try {
      switch (S.tool) {
        case "ring": case "closed":
          id = d.addRing(sp, A.RING_RADIUS, S.tool === "closed" ? 0 : A.RING_GAP_DEGREES, S.ringGapDir, nextColor());
          afterEdit(); select({ type: "part", id: id }); break;
        case "pin": case "stop": {
          var r = nearestRing(p, 2.5); if (!r) { toast("Bấm gần một vòng để gắn " + (S.tool === "pin" ? "pin" : "chốt chặn")); return; }
          var wa = snapAngle(Math.atan2(p.y - r.center.y, p.x - r.center.x) * RR.R2D, free), ra = ringPose(r.id).angle;
          if (S.tool === "pin") { var f = d.addPin(r.id, wa - ra); afterEdit(); select({ type: "pin", id: r.id, feature: f }); }
          else {   // click inside the ring = inward stop-pin (negative length)
            var inward = M.len(M.sub(p, r.center)) < r.arc.radius;
            var sf = d.addStopPin(r.id, wa - ra, inward ? -A.STOP_PIN_DEFAULT_LENGTH : A.STOP_PIN_DEFAULT_LENGTH); afterEdit(); select({ type: "stop", id: r.id, feature: sf });
          }
          break;
        }
        case "stick":
          id = d.addStick(S.stickPreset, sp, 0, A.STICK_DEFAULT_LENGTH, A.STICK_DEFAULT_ARM, nextColor());
          afterEdit(); select({ type: "part", id: id }); break;
        case "guide": {
          var h = pick(p), w = editWorld();
          if (!h || partKind(h.id) !== "stick") { toast("Bấm lên một thanh để gắn ngàm"); return; }
          var st = w.stickOf(w.objectIndexById[h.id]), local = M.poseToLocal(W.stickPose(st), p), prim = nearestPrimitive(st.centerline, local);
          var on = closestOnPrimitive(prim, local), dir = M.isArc(prim) ? 0 : Math.atan2(prim.b.y - prim.a.y, prim.b.x - prim.a.x) * RR.R2D;
          var gid = d.addGuide(h.id, on, snapAngle(dir, true)); afterEdit(); select({ type: "part", id: gid }); break;
        }
        case "bomb": {
          var hb = pick(p), host = hb && hb.type === "part" && (partKind(hb.id) === "ring" || partKind(hb.id) === "stick") ? hb.id : (hb && hb.type === "pin" ? hb.id : null);
          if (host && d.bombOf(host)) { toast(label(host) + " đã có bom"); return; }
          var bid;
          if (host) { var hp = d.worldOfPart(host); bid = d.addBomb(host, M.rot(M.sub(p, hp.position), -hp.angle), A.BOMB_RADIUS); }
          else bid = d.addBomb(null, sp, A.BOMB_RADIUS);
          afterEdit(); select({ type: "part", id: bid }); break;
        }
        default: return;
      }
    } catch (e) { toast(e.message); return; }
    changed();
  }
  function nearestPrimitive(cl, p) { var best = null, bd = Infinity; cl.primitives.forEach(function (q) { var dd = M.distanceToPrimitive(q, p); if (dd < bd) { bd = dd; best = q; } }); return best; }
  function closestOnPrimitive(q, p) {
    if (M.isArc(q)) return q.a;
    var ab = M.sub(q.b, q.a), t = M.clamp01(M.dot(M.sub(p, q.a), ab) / M.len2(ab)); return M.add(q.a, M.mul(ab, t));
  }
  function guidesOf(stickId) { return (S.doc.data.guideLinks || []).filter(function (g) { return g.stickPartId === stickId; }).map(function (g) { return g.guidePartId; }); }

  function moveSelection(target, free) {
    var sel = S.selection, d = S.doc; if (!sel) return;
    var kind = partKind(sel.id);
    if (sel.type === "part") {
      var cur = d.worldOfPart(sel.id).position, np = kind === "bomb" ? V(Math.round(target.x * 100) / 100, Math.round(target.y * 100) / 100) : snapPoint(target, free);
      if (kind === "guide" && !free) np = V(Math.round(target.x * 20) / 20, Math.round(target.y * 20) / 20);
      var delta = M.sub(np, cur); if (M.len2(delta) < 1e-10) return false;
      d.setWorldPosition(sel.id, np);
      if (kind === "stick") guidesOf(sel.id).forEach(function (g) { d.setWorldPosition(g, M.add(d.worldOfPart(g).position, delta)); });
      if (kind === "bomb") { var b = d.part(sel.id); if (!b.hostPartId) { /* free bomb */ } }
      return true;
    }
    if (sel.type === "pin" || sel.type === "stop") {
      var rp = ringPose(sel.id), wa = snapAngle(Math.atan2(target.y - rp.position.y, target.x - rp.position.x) * RR.R2D, free), local = norm360(wa - rp.angle);
      if (sel.type === "pin") { if (Math.abs(M.deltaAngle(d.pinBearing(sel.id, sel.feature), local)) < 1e-6) return false; d.setPinAngle(sel.id, sel.feature, local); }
      else { var s = d.part(sel.id).stopPins.find(function (q) { return q.featureId === sel.feature; }); if (Math.abs(M.deltaAngle(s.angleDegrees || 0, local)) < 1e-6) return false; d.setStopPin(sel.id, sel.feature, local, null); }
      return true;
    }
    return false;
  }
  function rotateSelection(worldAngle) {
    var sel = S.selection, d = S.doc, kind = partKind(sel.id), cur = d.worldOfPart(sel.id);
    var target = kind === "ring" ? worldAngle - (d.part(sel.id).meshGapDirection || 0) : worldAngle;
    var dA = M.deltaAngle(cur.angle, target); if (Math.abs(dA) < 1e-6) return false;
    d.setWorldAngle(sel.id, cur.angle + dA);
    if (kind === "ring") S.ringGapDir = norm360(worldAngle);
    if (kind === "stick") guidesOf(sel.id).forEach(function (g) {
      var gp = d.worldOfPart(g); d.setWorldPosition(g, M.add(cur.position, M.rot(M.sub(gp.position, cur.position), dA))); d.setWorldAngle(g, gp.angle + dA);
    });
    return true;
  }
  function deleteTarget(t) {
    if (!t) return;
    try {
      if (t.type === "pin") S.doc.deletePin(t.id, t.feature);
      else if (t.type === "stop") S.doc.deleteStopPin(t.id, t.feature);
      else S.doc.deletePart(t.id);
    } catch (e) { toast(e.message); return; }
    if (S.selection && S.selection.id === t.id && (t.type === "part" || S.selection.feature === t.feature)) S.selection = null;
    afterEdit(); changed();
  }
  function toggleLink(source, targetId) {
    if (targetId === source.id) { toast("Pin không thể khóa chính vòng của nó"); return; }
    var exists = S.doc.data.links.some(function (l) { return l.sourcePartId === source.id && l.sourceFeatureId === source.feature && l.targetPartId === targetId; });
    if (exists) { S.doc.removeLink(source.id, source.feature, targetId); toast("Đã bỏ liên kết " + label(source.id) + " → " + label(targetId)); }
    else { S.doc.addLink(source.id, source.feature, targetId); toast("Đã thêm liên kết " + label(source.id) + " → " + label(targetId)); }
    if (S.autoLink) { $("#optAutoLink").checked = false; S.autoLink = false; toast("Đã tắt Tự nối pin để giữ liên kết thủ công"); }
    changed();
  }
  // Single selection (part, pin or stop-pin). A part selection also resets the group to that one part.
  function select(sel) { S.selection = sel; S.group = sel && sel.type === "part" ? [sel.id] : []; renderInspector(); render(); }
  function setGroup(ids, primary) {
    S.group = ids.filter(function (id, i) { return S.doc.part(id) && ids.indexOf(id) === i; });
    var p = primary && S.group.indexOf(primary) >= 0 ? primary : S.group[S.group.length - 1];
    S.selection = p ? { type: "part", id: p } : null; renderInspector(); render();
  }
  function toggleInGroup(id) {
    var ids = S.group.slice(), i = ids.indexOf(id);
    if (i >= 0) ids.splice(i, 1); else ids.push(id);
    setGroup(ids, i >= 0 ? null : id);
  }
  function selectedPartIds() { return S.group.length ? S.group.slice() : (S.selection && S.selection.type === "part" ? [S.selection.id] : []); }

  // ============================================================== moving parts, smart guides (Canva-style), Shift axis lock
  var GUIDE_PX = 6;
  // Parts that move together: the selection, the guides of its sticks; hosted bombs follow their host on their own.
  function expandMoving(ids) {
    var d = S.doc, set = {}, out = [];
    function add(id) { if (!set[id] && d.part(id)) { set[id] = true; out.push(id); } }
    ids.forEach(add);
    ids.forEach(function (id) { if (partKind(id) === "stick") guidesOf(id).forEach(add); });
    return out.filter(function (id) { var p = d.part(id); return !(p.kind === "bomb" && p.hostPartId && set[p.hostPartId]); });
  }
  function moveParts(ids, delta) { var d = S.doc; ids.forEach(function (id) { d.setWorldPosition(id, M.add(d.worldOfPart(id).position, delta)); }); }
  // Reference points of everything that is not moving: ring centres (with radii for the pin-distance circles), stick origins, free bombs, guides.
  function refPoints(moving) {
    var w = editWorld(), d = S.doc, out = []; if (!w) return out;
    w.rings.forEach(function (r) { if (!moving[r.id]) out.push({ id: r.id, p: r.center, ring: r }); });
    w.sticks.forEach(function (s) { if (!moving[s.id]) out.push({ id: s.id, p: s.origin }); });
    w.guides.forEach(function (g) { if (!moving[g.id] && !moving[g.stickId]) out.push({ id: g.id, p: g.origin }); });
    d.partsOf("bomb").forEach(function (b) { if (!moving[b.partId] && !b.hostPartId) out.push({ id: b.partId, p: d.worldOfPart(b.partId).position }); });
    return out;
  }
  function round2(v) { return Math.round(v * 100) / 100; }
  // ctx: { moving: {id:true}, kind, ringId, lock: "h"|"v"|null, start, alt }. Returns { pos, guides }.
  // Priority: pin-distance point around a neighbour ring > axis guide (when nearer than the grid) > grid (Lưới đều) > raw.
  function smartSnap(raw, ctx) {
    var th = GUIDE_PX * S.cam.scale, g = { lines: [], circles: [], spans: [], points: [] };
    if (ctx.alt) return { pos: V(round2(raw.x), round2(raw.y)), guides: null };
    var refs = refPoints(ctx.moving), useGrid = S.grid && (ctx.kind === "ring" || ctx.kind === "stick");
    // 1) pin distance around neighbour rings (only for a ring, only without axis lock)
    if (ctx.kind === "ring" && !ctx.lock) {
      // 15° points win when near; anywhere on the circle only with Lưới đều off.
      var me = editWorld().rings.find(function (r) { return r.id === ctx.ringId; }), bestPoint = null, bestCircle = null, best;
      if (me) refs.forEach(function (ref) {
        if (!ref.ring) return;
        var r = ref.ring, dists = [r.outer + A.PIN_OFFSET_FROM_OUTER + me.arc.radius, me.outer + A.PIN_OFFSET_FROM_OUTER + r.arc.radius];
        if (Math.abs(dists[0] - dists[1]) < 1e-3) dists.pop();
        dists.forEach(function (dist) {
          var v = M.sub(raw, r.center), a = Math.atan2(v.y, v.x) * RR.R2D, a15 = Math.round(a / 15) * 15;
          var onPoint = M.add(r.center, M.polar(dist, a15)), dp = M.len(M.sub(onPoint, raw));
          if (dp <= th * 2 && (!bestPoint || dp < bestPoint.d)) bestPoint = { d: dp, pos: onPoint, c: r.center, r: dist, angle: a15 };
          var dc = Math.abs(M.len(v) - dist);
          if (!S.grid && dc <= th && (!bestCircle || dc < bestCircle.d)) bestCircle = { d: dc, pos: M.add(r.center, M.polar(dist, a)), c: r.center, r: dist, angle: a };
        });
      });
      best = bestPoint || bestCircle;
      if (best) {
        g.circles.push({ c: best.c, r: best.r }); g.lines.push({ a: best.c, b: best.pos });
        g.points.push({ p: best.pos, text: fmt(norm360(best.angle), 0) + "°" });
        return { pos: best.pos, guides: g };
      }
    }
    // 2) axis candidates: aligned centres, centre of the level, equal spacing in a row/column
    function axisCands(axis) {
      var other = axis === "x" ? "y" : "x", out = [];
      refs.forEach(function (r) { out.push({ v: r.p[axis], from: r.p }); });
      if (refs.length) {
        var lo = Infinity, hi = -Infinity; refs.forEach(function (r) { lo = Math.min(lo, r.p[axis]); hi = Math.max(hi, r.p[axis]); });
        out.push({ v: (lo + hi) / 2, center: true });
      }
      var row = refs.filter(function (r) { return Math.abs(r.p[other] - raw[other]) < 1.0; }).sort(function (a, b) { return a.p[axis] - b.p[axis]; });
      for (var i = 0; i + 1 < row.length; i++) {
        var a = row[i].p, b = row[i + 1].p, gap = b[axis] - a[axis]; if (gap < 0.5) continue;
        out.push({ v: (a[axis] + b[axis]) / 2, spacing: [a, b] });
        out.push({ v: b[axis] + gap, spacing: [a, b], ext: 1 });
        out.push({ v: a[axis] - gap, spacing: [a, b], ext: -1 });
      }
      return out;
    }
    var gp = useGrid ? snapPoint(raw, false) : null, pos = V(raw.x, raw.y), used = { x: null, y: null };
    ["x", "y"].forEach(function (axis) {
      if ((axis === "y" && ctx.lock === "h") || (axis === "x" && ctx.lock === "v")) { pos[axis] = ctx.start[axis]; return; }
      var best = null;
      axisCands(axis).forEach(function (c) { var dd = Math.abs(c.v - raw[axis]); if (dd <= th && (!best || dd < best.d)) { best = c; best.d = dd; } });
      if (best && (!gp || best.d <= Math.abs(gp[axis] - raw[axis]) + 1e-9)) { pos[axis] = best.v; used[axis] = best; }
      else pos[axis] = gp ? gp[axis] : round2(raw[axis]);
    });
    if (gp && S.lattice === "hex" && !used.x && !used.y && !ctx.lock) pos = gp;
    ["x", "y"].forEach(function (axis) {
      var c = used[axis]; if (!c) return;
      var other = axis === "x" ? "y" : "x";
      if (c.from) { var a = {}, b = {}; a[axis] = b[axis] = pos[axis]; a[other] = Math.min(c.from[other], pos[other]) - 1.2; b[other] = Math.max(c.from[other], pos[other]) + 1.2; g.lines.push({ a: V(a.x, a.y), b: V(b.x, b.y) }); }
      if (c.center) { var v = viewRect(), a2 = {}, b2 = {}; a2[axis] = b2[axis] = pos[axis]; a2[other] = other === "x" ? v.xMin : v.yMin; b2[other] = other === "x" ? v.xMax : v.yMax; g.lines.push({ a: V(a2.x, a2.y), b: V(b2.x, b2.y), dash: true }); }
      if (c.spacing) {
        var pts = [c.spacing[0], c.spacing[1], pos].sort(function (p1, p2) { return p1[axis] - p2[axis]; });
        for (var i = 0; i + 1 < pts.length; i++) { var p1 = {}, p2 = {}; p1[axis] = pts[i][axis]; p2[axis] = pts[i + 1][axis]; p1[other] = p2[other] = pos[other]; g.spans.push({ a: V(p1.x, p1.y), b: V(p2.x, p2.y), text: fmt(pts[i + 1][axis] - pts[i][axis], 2) }); }
      }
    });
    return { pos: pos, guides: g.lines.length || g.spans.length ? g : null };
  }
  function guideOverlay(g, s) {
    var out = [], col = "#e5398f", sw = fmt(1.3 * s, 4);
    g.circles.forEach(function (c) { out.push('<circle cx="' + fmt(c.c.x, 3) + '" cy="' + fmt(-c.c.y, 3) + '" r="' + fmt(c.r, 3) + '" fill="none" stroke="' + col + '" stroke-width="' + sw + '" stroke-dasharray="' + fmt(5 * s, 4) + '" opacity="0.8"/>'); });
    g.lines.forEach(function (l) { out.push('<line x1="' + fmt(l.a.x, 3) + '" y1="' + fmt(-l.a.y, 3) + '" x2="' + fmt(l.b.x, 3) + '" y2="' + fmt(-l.b.y, 3) + '" stroke="' + col + '" stroke-width="' + sw + '"' + (l.dash ? ' stroke-dasharray="' + fmt(6 * s, 4) + '"' : "") + "/>"); });
    g.spans.forEach(function (sp) {
      out.push('<line x1="' + fmt(sp.a.x, 3) + '" y1="' + fmt(-sp.a.y, 3) + '" x2="' + fmt(sp.b.x, 3) + '" y2="' + fmt(-sp.b.y, 3) + '" stroke="' + col + '" stroke-width="' + sw + '" marker-start="" />');
      var m = M.mul(M.add(sp.a, sp.b), 0.5);
      out.push('<rect x="' + fmt(m.x - 18 * s, 3) + '" y="' + fmt(-m.y - 8 * s, 3) + '" width="' + fmt(36 * s, 3) + '" height="' + fmt(16 * s, 3) + '" rx="' + fmt(4 * s, 3) + '" fill="' + col + '"/>');
      out.push('<text x="' + fmt(m.x, 3) + '" y="' + fmt(-m.y + 4 * s, 3) + '" font-size="' + fmt(11 * s, 4) + '" fill="#fff" text-anchor="middle">' + sp.text + "</text>");
    });
    g.points.forEach(function (pt) {
      out.push('<circle cx="' + fmt(pt.p.x, 3) + '" cy="' + fmt(-pt.p.y, 3) + '" r="' + fmt(4 * s, 4) + '" fill="' + col + '"/>');
      out.push('<text x="' + fmt(pt.p.x + 8 * s, 3) + '" y="' + fmt(-pt.p.y - 8 * s, 3) + '" font-size="' + fmt(11 * s, 4) + '" fill="' + col + '">' + pt.text + "</text>");
    });
    return out.join("");
  }
  // ---------- rotating a multi-selection around its centre ----------
  function groupBounds(world) {
    var ids = expandMoving(S.group), b = { xMin: Infinity, yMin: Infinity, xMax: -Infinity, yMax: -Infinity };
    function inc(p, r) { r = r || 0; b.xMin = Math.min(b.xMin, p.x - r); b.yMin = Math.min(b.yMin, p.y - r); b.xMax = Math.max(b.xMax, p.x + r); b.yMax = Math.max(b.yMax, p.y + r); }
    ids.forEach(function (id) {
      var o = world.objectIndexById[id];
      if (o !== undefined && !world.isStickObject(o)) inc(world.rings[o].center, world.rings[o].bound);
      else if (o !== undefined) { var bb = M.chainBounds(world.stickOf(o).centerline, W.stickPose(world.stickOf(o))); inc(V(bb.xMin, bb.yMin)); inc(V(bb.xMax, bb.yMax)); }
      else { var bm = world.bombs.find(function (q) { return q.id === id; }); if (bm) inc(bm.center(), bm.radius); else inc(S.doc.worldOfPart(id).position, 0.5); }
    });
    return isFinite(b.xMin) ? b : null;
  }
  function groupHandle() {
    var w = editWorld(); if (!w || S.group.length < 2) return null;
    var b = groupBounds(w); if (!b) return null;
    var c = V((b.xMin + b.xMax) / 2, (b.yMin + b.yMax) / 2);
    return { bounds: b, center: S.drag && S.drag.kind === "groupRotate" ? S.drag.center : c, pos: V(c.x, b.yMin - 30 * S.cam.scale) };
  }
  function snapshotGroup() {
    var d = S.doc, snap = {};
    expandMoving(S.group).forEach(function (id) { var w = d.worldOfPart(id); snap[id] = { pos: w.position, angle: w.angle }; });
    return snap;
  }
  function rotateGroup(center, total, snap) {
    var d = S.doc;
    Object.keys(snap).forEach(function (id) {
      d.setWorldPosition(id, M.add(center, M.rot(M.sub(snap[id].pos, center), total)));
      d.setWorldAngle(id, snap[id].angle + total);
    });
  }
  function startGroupRotate(p, gh) {
    S.drag = { kind: "groupRotate", center: gh.center, a0: Math.atan2(p.y - gh.center.y, p.x - gh.center.x) * RR.R2D, snap: snapshotGroup(), total: 0 };
    S.doc.beginGesture();
  }
  // Grid on: 15° steps; Shift: 45°; otherwise 1°. Applied from the snapshot so repeated moves never accumulate error.
  function groupRotateTo(p, ev) {
    var dr = S.drag, raw = M.deltaAngle(dr.a0, Math.atan2(p.y - dr.center.y, p.x - dr.center.x) * RR.R2D);
    raw = dr.total + M.deltaAngle(dr.total, raw);   // continuous past ±180
    var step = ev.altKey ? 0.1 : ev.shiftKey ? 45 : S.grid ? 15 : 1, total = Math.round(raw / step) * step;
    if (Math.abs(total - dr.total) < 1e-9) return false;
    dr.total = total; rotateGroup(dr.center, total, dr.snap); return true;
  }
  function groupOverlay(world, s) {
    var gh = groupHandle(); if (!gh) return "";
    var b = gh.bounds, pad = 0.25, out = [], col = "#1d6fe0", rotating = S.drag && S.drag.kind === "groupRotate";
    out.push('<rect x="' + fmt(b.xMin - pad, 3) + '" y="' + fmt(-(b.yMax + pad), 3) + '" width="' + fmt(b.xMax - b.xMin + 2 * pad, 3) + '" height="' + fmt(b.yMax - b.yMin + 2 * pad, 3) + '" fill="none" stroke="' + col + '" stroke-width="' + fmt(1.2 * s, 4) + '" stroke-dasharray="' + fmt(6 * s, 4) + '" opacity="0.7"/>');
    var hp = rotating ? M.add(gh.center, M.rot(M.sub(gh.pos, gh.center), S.drag.total)) : gh.pos;
    out.push('<line x1="' + fmt(gh.center.x, 3) + '" y1="' + fmt(-gh.center.y, 3) + '" x2="' + fmt(hp.x, 3) + '" y2="' + fmt(-hp.y, 3) + '" stroke="' + col + '" stroke-width="' + fmt(1 * s, 4) + '" stroke-dasharray="' + fmt(3 * s, 4) + '" opacity="' + (rotating ? 0.8 : 0.35) + '"/>');
    out.push('<circle cx="' + fmt(gh.center.x, 3) + '" cy="' + fmt(-gh.center.y, 3) + '" r="' + fmt(3 * s, 4) + '" fill="' + col + '"/>');
    out.push('<circle cx="' + fmt(hp.x, 3) + '" cy="' + fmt(-hp.y, 3) + '" r="' + fmt(12 * s, 4) + '" fill="#fff" stroke="' + col + '" stroke-width="' + fmt(1.5 * s, 4) + '" style="cursor:grab"><title>Kéo để xoay cả cụm (Shift = 45°, Alt = mịn)</title></circle>');
    out.push('<text x="' + fmt(hp.x, 3) + '" y="' + fmt(-hp.y + 5 * s, 3) + '" font-size="' + fmt(15 * s, 4) + '" fill="' + col + '" text-anchor="middle" pointer-events="none">↻</text>');
    if (rotating) out.push('<text x="' + fmt(hp.x + 18 * s, 3) + '" y="' + fmt(-hp.y + 4 * s, 3) + '" font-size="' + fmt(12 * s, 4) + '" fill="' + col + '">' + fmt(S.drag.total, 1) + "°</text>");
    return out.join("");
  }

  // Drag of the selection: pins/stop-pins change angle; parts move as a group with guides, grid and Shift lock.
  function dragMove(p, ev) {
    var d = S.doc, sel = S.selection; if (!sel) return false;
    if (sel.type !== "part") return moveSelection(p, ev.altKey);
    var raw = M.add(p, S.drag.offset), start = S.drag.startPos, lock = null;
    if (ev.shiftKey) {
      var dx = Math.abs(raw.x - start.x), dy = Math.abs(raw.y - start.y);
      if (!S.drag.lock && dx + dy > 4 * S.cam.scale) S.drag.lock = dx >= dy ? "h" : "v";
      lock = S.drag.lock || null;
    } else S.drag.lock = null;
    if (lock === "h") raw.y = start.y; else if (lock === "v") raw.x = start.x;
    var ids = expandMoving(S.group.length ? S.group : [sel.id]), moving = {};
    ids.forEach(function (id) { moving[id] = true; });
    var kind = partKind(sel.id), snap = smartSnap(raw, { moving: moving, kind: kind, ringId: kind === "ring" ? sel.id : null, lock: lock, start: start, alt: ev.altKey });
    if (lock) { if (!snap.guides) snap.guides = { lines: [], circles: [], spans: [], points: [] }; var v = viewRect(); snap.guides.lines.push(lock === "h" ? { a: V(v.xMin, start.y), b: V(v.xMax, start.y), dash: true } : { a: V(start.x, v.yMin), b: V(start.x, v.yMax), dash: true }); }
    S.guides = snap.guides;
    var delta = M.sub(snap.pos, d.worldOfPart(sel.id).position);
    if (M.len2(delta) < 1e-12) { render(); return false; }
    moveParts(ids, delta); return true;
  }

  // ============================================================== pointer input
  var pointer = { down: false, id: 0, start: null, last: null, button: 0, panning: false, moved: false };
  canvas.addEventListener("pointerdown", function (ev) {
    canvas.focus();
    var p = toWorld(ev);
    pointer = { down: true, id: ev.pointerId, start: p, last: p, startClient: V(ev.clientX, ev.clientY), button: ev.button, panning: false, moved: false };
    canvas.setPointerCapture(ev.pointerId);
    if (ev.button === 1 || ev.button === 2 || (ev.button === 0 && spaceHeld)) { pointer.panning = true; canvas.classList.add("panning"); ev.preventDefault(); return; }
    if (S.mode === "play") { playDown(p); return; }
    if (S.tool === "select") {
      if (hitHandle(p)) { S.drag = { kind: "rotate" }; S.doc.beginGesture(); return; }
      var gh = groupHandle();
      if (gh && M.len(M.sub(p, gh.pos)) <= 12 * S.cam.scale) { startGroupRotate(p, gh); return; }
      var h = pick(p);
      if (h && ev.shiftKey && h.type === "part") { toggleInGroup(h.id); pointer.down = false; return; }   // Shift+click: add/remove
      if (h) {
        if (h.type === "part" && S.group.indexOf(h.id) >= 0 && S.group.length > 1) { S.selection = h; renderInspector(); }   // keep the group, h leads
        else select(h);
        var start = h.type === "part" ? S.doc.worldOfPart(h.id).position : p;
        S.drag = { kind: "move", offset: h.type === "part" ? M.sub(start, p) : V(0, 0), startPos: start }; S.doc.beginGesture();
      }
      else { S.marquee = { a: p, b: p, additive: ev.shiftKey }; }   // empty space: selection box (pan = right/middle button or Space+drag)
      return;
    }
    if (S.tool === "erase") { deleteTarget(pick(p)); return; }
    if (S.tool === "link") {
      var t = pick(p);
      if (!S.linkSource) { if (t && t.type === "pin") { S.linkSource = { id: t.id, feature: t.feature }; status("Chọn vật đích (vòng/thanh) cho pin của " + label(t.id) + " — Esc để hủy"); render(); } else toast("Bấm vào một pin trước"); return; }
      if (t && (partKind(t.id) === "ring" || partKind(t.id) === "stick")) { toggleLink(S.linkSource, t.id); S.linkSource = null; }
      else toast("Bấm vào vòng hoặc thanh làm đích");
      render(); return;
    }
    placeAt(p, ev);
  });
  canvas.addEventListener("pointermove", function (ev) {
    var p = toWorld(ev);
    S.hover = { world: p, free: ev.altKey };
    if (pointer.down && pointer.id === ev.pointerId) {
      if (pointer.panning) {
        var r = canvas.getBoundingClientRect(); void r;
        S.cam.x -= (ev.movementX || 0) * S.cam.scale; S.cam.y += (ev.movementY || 0) * S.cam.scale; render(); return;
      }
      if (S.mode === "play") { playMove(p); return; }
      if (S.marquee) { S.marquee.b = p; render(); return; }
      if (S.drag) {
        var did = false;
        try {
          if (S.drag.kind === "groupRotate") did = groupRotateTo(p, ev);
          else if (S.drag.kind === "rotate") {
            var c = S.doc.worldOfPart(S.selection.id).position, raw = Math.atan2(p.y - c.y, p.x - c.x) * RR.R2D;
            did = rotateSelection(ev.shiftKey && !ev.altKey ? Math.round(raw / 45) * 45 : snapAngle(raw, ev.altKey));
          }
          else did = dragMove(p, ev);
        } catch (e) { toast(e.message); }
        if (did) { S.drag.changed = true; S.worldRev = -1; render(); }
        return;
      }
    }
    statusCoords(p);
    if (S.mode === "edit" && S.tool !== "select") render();
  });
  function endPointer(ev) {
    if (!pointer.down || pointer.id !== ev.pointerId) return;
    pointer.down = false; canvas.classList.remove("panning");
    if (S.mode === "play") { playUp(ev.type === "pointercancel"); return; }
    if (S.marquee) { finishMarquee(); return; }
    S.guides = null;
    if (S.drag) {
      if (S.drag.changed) { afterEdit(); }
      S.doc.endGesture(); var ch = S.drag.changed; S.drag = null;
      if (ch) changed(); else render();
    }
  }
  // Parts whose reference point (ring centre, stick origin, bomb, guide) lies inside the box. A plain click on empty space clears the selection.
  function finishMarquee() {
    var m = S.marquee; S.marquee = null;
    var x0 = Math.min(m.a.x, m.b.x), x1 = Math.max(m.a.x, m.b.x), y0 = Math.min(m.a.y, m.b.y), y1 = Math.max(m.a.y, m.b.y);
    if ((x1 - x0) + (y1 - y0) < 4 * S.cam.scale) { if (!m.additive) select(null); else render(); return; }
    var inside = refPoints({}).filter(function (r) { return r.p.x >= x0 && r.p.x <= x1 && r.p.y >= y0 && r.p.y <= y1; }).map(function (r) { return r.id; });
    S.doc.partsOf("bomb").forEach(function (b) { if (b.hostPartId) { var c = S.doc.worldOfPart(b.partId).position; if (c.x >= x0 && c.x <= x1 && c.y >= y0 && c.y <= y1 && inside.indexOf(b.hostPartId) < 0) inside.push(b.partId); } });
    setGroup(m.additive ? S.group.concat(inside) : inside);
    status(S.group.length ? "Đã chọn " + S.group.length + " vật — kéo để di chuyển cả nhóm, Ctrl+C/Ctrl+D, Delete" : "Không có vật nào trong khung");
  }
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("pointerleave", function () { S.hover = null; if (S.mode === "edit") render(); });
  canvas.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });
  canvas.addEventListener("wheel", function (ev) {
    ev.preventDefault();
    var before = toWorld(ev), k = Math.exp(ev.deltaY * 0.0015);
    S.cam.scale = Math.min(0.5, Math.max(0.004, S.cam.scale * k));
    var after = toWorld(ev); S.cam.x += before.x - after.x; S.cam.y += before.y - after.y; render();
  }, { passive: false });
  window.addEventListener("resize", render);

  // ============================================================== play mode
  function startPlay() {
    var err = RR.validate(S.doc.data);
    if (err) { toast("Level chưa hợp lệ: " + err); setMode("edit"); return false; }
    var t = RR.Tuning.defaults(); t.feelEnabled = S.feel;
    S.play = { sim: new RR.Simulation(S.doc.data, t), history: [], moves: 0, fading: [], flash: {}, pending: null, pendingWin: false, won: false };
    $("#banner").hidden = true; updatePlayInfo(); render(); return true;
  }
  function centroid(world) { var c = V(0, 0), n = 0; world.rings.forEach(function (r) { c = M.add(c, r.center); n++; }); return n ? M.mul(c, 1 / n) : c; }
  function removeVisual(ids) {
    var w = S.play.sim.world, c = centroid(w), now = performance.now();
    ids.forEach(function (id) {
      var o = w.objectIndexById[id], pos = w.isStickObject(o) ? M.poseToWorld(W.stickPose(w.stickOf(o)), V(0, 0)) : w.rings[o].center, d = M.sub(pos, c);
      S.play.fading.push({ id: id, t0: now, dir: M.len2(d) < 1e-6 ? V(1, 0) : M.normalize(d) });
    });
  }
  function flash(id, color, ms) { S.play.flash[id] = { color: color, until: performance.now() + (ms || 300) }; render(); }
  function playDown(p) {
    var sim = S.play.sim; if (S.play.replaying) return;
    var hit = sim.hitTest(p);
    if (hit >= 0 && sim.isMovementLocked(hit)) {
      var id = sim.idOf(hit); flash(id, "#e5484d", 350);
      status(label(id) + " đang bị pin của chính nó giữ (pin cắm vào vật khác) — cần gỡ vật kia trước"); return;
    }
    S.play.pending = hit >= 0 ? { obj: hit, start: p } : null;
  }
  function playMove(p) {
    var sim = S.play.sim, pend = S.play.pending;
    if (pend && !sim.dragging()) {
      var travel = M.len2(M.sub(p, pend.start));
      if (travel < sim.tuning.minPointerMoveSqr) return;
      if (sim.isStick(pend.obj) && travel < sim.tuning.stickMoveThresholdSqr) return;
      S.play.before = sim.saveState();
      if (!sim.beginDrag(pend.obj, pend.start, 1)) { S.play.pending = null; return; }
      S.play.pending = null;
    }
    if (!sim.dragging()) return;
    var obj = sim.dragged, step = sim.drag(p);
    if (step.bombContact) { explode(step.bombContact); return; }
    if (step.enteredBlocked) flash(sim.idOf(obj), "#f0a020", 220);
    if (step.locksChanged) updatePlayInfo();
    render();
  }
  function explode(contact) {
    var sim = S.play.sim; sim.endDrag();
    var res = sim.explode(contact);
    removeVisual(res.removedParts);
    var solved = sim.solveAll().map(function (o) { return sim.idOf(o); }); removeVisual(solved);
    commitMove("Bom nổ: " + res.removedParts.map(label).join(", "));
  }
  function playUp() {
    var sim = S.play.sim; S.play.pending = null;
    if (!sim.dragging()) return;
    var obj = sim.dragged; sim.endDrag();
    var solved = sim.solveAll().map(function (o) { return sim.idOf(o); });
    removeVisual(solved);
    var moved = !sameState(S.play.before, sim.saveState());
    if (moved || solved.length) commitMove(solved.length ? "Tháo " + solved.map(label).join(", ") : "Xoay " + label(sim.idOf(obj)));
    render();
  }
  function sameState(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function commitMove(text) {
    var sim = S.play.sim;
    S.play.history.push(S.play.before); S.play.moves++;
    status(text);
    if (sim.allSolved()) { S.play.pendingWin = true; }
    updatePlayInfo(); updateDirty(); render();
  }
  function showWin() {
    S.play.pendingWin = false; S.play.won = true;
    var b = $("#banner"); b.className = "banner win"; b.textContent = "Hoàn thành sau " + S.play.moves + " lần kéo"; b.hidden = false;
  }
  function playUndo() {
    if (!S.play || !S.play.history.length) return;
    S.play.sim.restoreState(S.play.history.pop()); S.play.moves--; S.play.fading = []; S.play.won = false; $("#banner").hidden = true;
    updatePlayInfo(); updateDirty(); render();
  }
  function updatePlayInfo() {
    if (!S.play) return;
    var sim = S.play.sim, active = 0; sim.graph.active.forEach(function (a) { if (a) active++; });
    $("#playInfo").innerHTML = "<span>Lần kéo: " + S.play.moves + "</span><span>Còn lại: " + sim.remaining() + "/" + sim.objectCount() + "</span><span>Khóa đang giữ: " + active + "</span>";
  }

  // replay the found route inside play mode
  function replayRoute() {
    var r = S.solve.result; if (!r || !r.found) return;
    setMode("play"); if (!S.play) return;
    var t = RR.Tuning.defaults(); t.feelEnabled = false; t.explodeBombs = !!r.explodeBombs;
    S.play.sim = new RR.Simulation(S.doc.data, t); S.play.sim.setEngageThreshold(-C.solver.SAFETY_MARGIN);
    S.play.history = []; S.play.moves = 0; S.play.replaying = true; $("#banner").hidden = true;
    var moves = r.moves.slice(), i = 0;
    function nextMove() {
      if (i >= moves.length || S.mode !== "play") { S.play.replaying = false; if (S.play.sim.allSolved()) S.play.pendingWin = true; render(); return; }
      highlightStep(i);
      var sim = S.play.sim, m = moves[i++], samples = [];
      var before = sim.saveState(), remaining0 = [];
      for (var o = 0; o < sim.objectCount(); o++) if (!sim.isSolved(o)) remaining0.push(o);
      RR.Solver.apply(sim, m, function (_, s) { samples.push(s.isStick ? { o: m.obj, v: sim.offsetOf(m.obj) } : { o: m.obj, v: sim.angleOf(m.obj) }); });
      var after = sim.saveState(), solvedNow = remaining0.filter(function (o2) { return sim.isSolved(o2); }).map(function (o2) { return sim.idOf(o2); });
      sim.restoreState(before);
      var k = 0;
      (function animate() {
        if (S.mode !== "play") return;
        if (k < samples.length) {
          var smp = samples[k]; k += 2;
          if (sim.isStick(smp.o)) sim.world.stickOf(smp.o).offset = smp.v; else W.ringSetAngle(sim.world.rings[smp.o], smp.v);
          render(); setTimeout(animate, 16); return;
        }
        sim.restoreState(after); S.play.history.push(before); S.play.moves++; removeVisual(solvedNow); updatePlayInfo(); render();
        setTimeout(nextMove, 420);
      })();
    }
    nextMove();
  }

  // ============================================================== modes and tools
  function setMode(mode) {
    if (mode === S.mode) return;
    S.mode = mode;
    $all("#modeSwitch button").forEach(function (b) { b.classList.toggle("on", b.dataset.mode === mode); });
    $("#toolsPanel").style.display = mode === "edit" ? "" : "none";
    $("#inspector").hidden = mode !== "edit"; $("#playPanel").hidden = mode !== "play";
    $("#banner").hidden = true; S.drag = null; S.linkSource = null;
    if (mode === "play") { if (!startPlay()) return; status("Chơi thử: kéo vòng để xoay, kéo thanh để trượt. Tab để quay lại chỉnh sửa."); }
    else { S.play = null; status("Chỉnh sửa"); }
    canvas.className = "canvas " + (mode === "play" ? "tool-select" : (S.tool === "select" ? "tool-select" : "tool-place"));
    updateDirty(); render();
  }
  function setTool(tool) {
    S.tool = tool; S.linkSource = null;
    $all("#tools button").forEach(function (b) { b.classList.toggle("on", b.dataset.tool === tool); });
    canvas.className = "canvas " + (tool === "select" ? "tool-select" : "tool-place");
    var hints = { select: "Kéo vật để di chuyển (Shift = thẳng trục, Alt = bỏ bắt dính), kéo tay cầm tròn để xoay (Shift = 45°). Shift+click / kéo khung để chọn nhiều. Ctrl+C/V/D, Delete. Kéo chuột phải hoặc Space+kéo để cuộn.", ring: "Bấm để đặt vòng hở (Q/E đổi hướng khe trước khi đặt).",
      closed: "Bấm để đặt vòng kín.", pin: "Bấm cạnh vòng: pin gắn theo hướng bấm, tự nối với vật nó chạm.", stop: "Bấm ngoài vòng = chốt hướng ra, bấm trong vòng = chốt hướng vào (chỉ chặn, không khóa).",
      stick: "Bấm để đặt thanh " + S.stickPreset + ".", guide: "Bấm lên thanh để gắn ngàm tại điểm gần nhất.", bomb: "Bấm lên vòng/thanh để gắn bom; chỗ trống = bom tự do.",
      link: "Bấm pin, rồi bấm vật đích để bật/tắt liên kết.", erase: "Bấm vật/pin/chốt để xóa." };
    status(hints[tool] || ""); render();
  }
  $all("#tools button").forEach(function (b) { b.addEventListener("click", function () { setTool(b.dataset.tool); }); });
  $all("#stickPreset button").forEach(function (b) { b.addEventListener("click", function () { S.stickPreset = b.dataset.preset; $all("#stickPreset button").forEach(function (x) { x.classList.toggle("on", x === b); }); if (S.tool !== "stick") setTool("stick"); else setTool("stick"); savePrefs(); }); });
  $all("#lattice button").forEach(function (b) { b.addEventListener("click", function () { S.lattice = b.dataset.lattice; $all("#lattice button").forEach(function (x) { x.classList.toggle("on", x === b); }); savePrefs(); render(); }); });
  $all("#modeSwitch button").forEach(function (b) { b.addEventListener("click", function () { setMode(b.dataset.mode); }); });
  function bindSwitch(id, apply) { var el = $(id); el.addEventListener("change", function () { apply(el.checked); savePrefs(); render(); renderInspector(); }); }
  bindSwitch("#optGrid", function (v) { S.grid = v; $("#latticeRow").style.display = v ? "" : "none"; $("#gridHint").textContent = v ? "Vòng cùng cỡ 1,75; tâm bắt vào lưới bước 4,5854 (khoảng cách pin chuẩn); góc bắt 15°." : "Tự do: đặt ở bất kỳ đâu, góc 1°, đổi được bán kính/khe trong Thuộc tính."; });
  bindSwitch("#optAutoLink", function (v) { S.autoLink = v; if (v && S.doc.relinkAll()) changed(); });
  bindSwitch("#optLabels", function (v) { S.show.labels = v; });
  bindSwitch("#optLinks", function (v) { S.show.links = v; });
  bindSwitch("#optPhone", function (v) { S.show.phone = v; });
  bindSwitch("#optDebug", function (v) { S.show.debug = v; });
  bindSwitch("#optFeel", function (v) { S.feel = v; if (S.mode === "play") startPlay(); });
  $("#btnFit").addEventListener("click", fit);

  var spaceHeld = false;
  window.addEventListener("keyup", function (ev) { if (ev.code === "Space") spaceHeld = false; });
  window.addEventListener("keydown", function (ev) {
    var tag = (ev.target && ev.target.tagName) || ""; if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (galleryKey(ev)) return;
    var ctrl = ev.ctrlKey || ev.metaKey, k = ev.key;
    if (ev.code === "Space") { spaceHeld = true; return; }
    if (ctrl && (k === "z" || k === "Z") && !ev.shiftKey) { ev.preventDefault(); undo(); return; }
    if (ctrl && (k === "y" || ((k === "z" || k === "Z") && ev.shiftKey))) { ev.preventDefault(); redo(); return; }
    if (ctrl && (k === "s" || k === "S")) { ev.preventDefault(); saveToFolder({ saveAs: ev.shiftKey }); return; }
    if (ctrl && (k === "a" || k === "A") && S.mode === "edit") { ev.preventDefault(); setGroup(refPoints({}).map(function (r) { return r.id; })); return; }
    if (ctrl && (k === "d" || k === "D") && S.mode === "edit") { ev.preventDefault(); duplicateSelection(); return; }
    if (ctrl && (k === "o" || k === "O")) { ev.preventDefault(); $("#fileInput").click(); return; }
    if (ctrl && (k === "n" || k === "N")) { ev.preventDefault(); newLevel(); return; }
    if (k === "Tab") { ev.preventDefault(); setMode(S.mode === "edit" ? "play" : "edit"); return; }
    if (k === "f" || k === "F") { fit(); return; }
    if (S.mode === "play") { if (k === "r" || k === "R") startPlay(); return; }
    if (k === "Escape") { S.linkSource = null; if (S.tool !== "select") setTool("select"); else select(null); return; }
    var map = { v: "select", r: "ring", o: "closed", p: "pin", t: "stop", s: "stick", g: "guide", b: "bomb", l: "link", x: "erase" };
    if (!ctrl && map[k.toLowerCase()] && !(k.toLowerCase() === "q" || k.toLowerCase() === "e")) { setTool(map[k.toLowerCase()]); return; }
    if ((k === "k" || k === "K") && S.selection && S.selection.type === "pin") { fitSelectedPin(); return; }
    if ((k === "Delete" || k === "Backspace") && S.group.length > 1) { deleteGroup(); return; }
    if ((k === "Delete" || k === "Backspace") && S.selection) { deleteTarget(S.selection); return; }
    if (k === "q" || k === "Q" || k === "e" || k === "E") {
      var stepA = (k.toLowerCase() === "q" ? 1 : -1) * angleStep();
      if (S.tool === "ring" || S.tool === "closed") { S.ringGapDir = norm360(S.ringGapDir + stepA); render(); return; }
      if (S.group.length > 1) {   // Q/E on a group: rotate the whole cluster around its centre
        var g0 = groupHandle(); if (!g0) return;
        S.doc.beginGesture(); try { rotateGroup(g0.center, stepA, snapshotGroup()); afterEdit(); } catch (e0) { toast(e0.message); } S.doc.endGesture(); changed(); return;
      }
      if (!S.selection) return;
      S.doc.beginGesture();
      try {
        if (S.selection.type === "part" && ["ring", "stick", "guide"].indexOf(partKind(S.selection.id)) >= 0) {
          var pr = S.doc.worldOfPart(S.selection.id), cur = pr.angle + (partKind(S.selection.id) === "ring" ? (S.doc.part(S.selection.id).meshGapDirection || 0) : 0);
          rotateSelection(cur + stepA);
        } else if (S.selection.type === "pin" || S.selection.type === "stop") {
          var rp = ringPose(S.selection.id), item = S.selection.type === "pin" ? S.doc.part(S.selection.id).pins.find(function (q) { return q.featureId === S.selection.feature; }) : S.doc.part(S.selection.id).stopPins.find(function (q) { return q.featureId === S.selection.feature; });
          var wa = rp.angle + (S.selection.type === "pin" ? S.doc.pinBearing(S.selection.id, S.selection.feature) : (item.angleDegrees || 0)) + stepA; moveSelection(M.add(rp.position, M.polar(3, wa)), true);
        }
        afterEdit();
      } catch (e) { toast(e.message); }
      S.doc.endGesture(); changed(); return;
    }
    if (k.indexOf("Arrow") === 0 && S.selection && S.selection.type === "part") {
      ev.preventDefault();
      var st = S.grid ? PITCH / 2 : (ev.shiftKey ? 0.5 : 0.05), dv = { ArrowLeft: V(-st, 0), ArrowRight: V(st, 0), ArrowUp: V(0, st), ArrowDown: V(0, -st) }[k];
      S.doc.beginGesture(); try { moveParts(expandMoving(selectedPartIds()), dv); afterEdit(); } catch (e2) { toast(e2.message); } S.doc.endGesture(); changed();
    }
  });
  function deleteGroup() {
    var ids = S.group.slice(); S.doc.beginGesture();
    try { ids.forEach(function (id) { if (S.doc.part(id)) S.doc.deletePart(id); }); afterEdit(); } catch (e) { toast(e.message); }
    S.doc.endGesture(); select(null); changed(); status("Đã xóa " + ids.length + " vật");
  }

  // ============================================================== copy / paste (Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+D)
  // The clip is a mini level (Document.extract). It also goes to the system clipboard as JSON, so it can be pasted in another tab or
  // handed to Codex; pasting a turp-design JSON snippet adds those parts too.
  var CLIP_FORMAT = "turp-clipboard";
  function editingText() { var t = document.activeElement && document.activeElement.tagName; return t === "INPUT" || t === "TEXTAREA" || t === "SELECT"; }
  function copySelection() {
    var sel = S.selection; if (!sel) return null;
    if (sel.type === "pin" || sel.type === "stop") {
      var ring = S.doc.part(sel.id), item = (sel.type === "pin" ? ring.pins : ring.stopPins).find(function (q) { return q.featureId === sel.feature; });
      S.clipboard = { format: CLIP_FORMAT, version: 1, feature: { type: sel.type, angle: sel.type === "pin" ? S.doc.pinBearing(sel.id, sel.feature) : (item.angleDegrees || 0), pinLength: sel.type === "pin" ? S.doc.pinLength(sel.id, sel.feature) : null, inner: sel.type === "pin" && !!item.isInnerMount, length: sel.type === "stop" ? RR.Builder.stopLength(ring, item) : null } };
    } else {
      var ids = selectedPartIds(); if (!ids.length) return null;
      S.clipboard = { format: CLIP_FORMAT, version: 1, level: S.doc.extract(ids) };
    }
    S.pasteCount = 0;
    return S.clipboard;
  }
  function pasteClip(clip, atCursor) {
    if (!clip) return;
    var d = S.doc, sel = S.selection;
    try {
      if (clip.feature) {   // a pin / stop-pin goes onto the selected ring (or the ring of the selected pin)
        var ringId = sel && (sel.type !== "part" || partKind(sel.id) === "ring") ? sel.id : null;
        if (!ringId) { toast("Chọn một vòng để dán " + (clip.feature.type === "pin" ? "pin" : "chốt chặn")); return; }
        S.pasteCount++;
        var a = clip.feature.angle + (sel.type !== "part" ? 15 * S.pasteCount : 0), f;
        d.beginGesture();
        f = clip.feature.type === "pin" ? d.addPin(ringId, a, clip.feature.pinLength, !!clip.feature.inner) : d.addStopPin(ringId, a, clip.feature.length);
        afterEdit(); d.endGesture(); select({ type: clip.feature.type, id: ringId, feature: f }); changed(); return;
      }
      var level = clip.level, anchor = V(level.anchor[0], level.anchor[1]), delta;
      if (atCursor && S.hover && S.hover.world) delta = M.sub(S.hover.world, anchor);
      else { S.pasteCount++; delta = V(PITCH / 2 * S.pasteCount, -PITCH / 2 * S.pasteCount); }
      // keep the pasted rings on the grid: snap the first ring/stick, move everything by the same amount
      var lead = level.parts.find(function (p) { return p.kind === "ring" || p.kind === "stick"; }), leadT = lead && level.transforms.find(function (t) { return t.transformId === lead.transformId; });
      if (leadT && S.grid) { var lp = V(leadT.localPosition[0], leadT.localPosition[1]); delta = M.sub(snapPoint(M.add(lp, delta), false), lp); }
      var host = sel && sel.type === "part" && (partKind(sel.id) === "ring" || partKind(sel.id) === "stick") ? sel.id : null;
      d.beginGesture();
      var tops = d.paste(JSON.parse(JSON.stringify(level)), delta, { recolor: function () { return nextColor(); }, host: host });
      afterEdit(); d.endGesture();
      setGroup(tops.filter(function (id) { return partKind(id) !== "guide"; })); changed();
      status("Đã dán " + tops.length + " vật");
    } catch (e) { toast("Không dán được: " + e.message); }
  }
  function duplicateSelection() { var c = copySelection(); if (c) pasteClip(c, false); }
  document.addEventListener("copy", function (ev) {
    if (editingText() || S.mode !== "edit") return;
    var c = copySelection(); if (!c) return;
    ev.preventDefault(); ev.clipboardData.setData("text/plain", JSON.stringify(c)); status("Đã copy — Ctrl+V để dán tại con trỏ");
  });
  document.addEventListener("cut", function (ev) {
    if (editingText() || S.mode !== "edit") return;
    var c = copySelection(); if (!c) return;
    ev.preventDefault(); ev.clipboardData.setData("text/plain", JSON.stringify(c));
    if (S.group.length > 1) deleteGroup(); else deleteTarget(S.selection);
  });
  document.addEventListener("paste", function (ev) {
    if (editingText() || S.mode !== "edit") return;
    var text = ev.clipboardData && ev.clipboardData.getData("text/plain"), clip = null;
    if (text) {
      try {
        var obj = JSON.parse(text);
        if (obj && obj.format === CLIP_FORMAT) clip = obj;
        else if (RR.Design.detectFormat(obj) === "design") { var lvl = RR.Design.toLevel(obj).level, tmp = new RR.Document(lvl); clip = { format: CLIP_FORMAT, version: 1, level: tmp.extract(lvl.parts.filter(function (p) { return p.kind !== "bomb" || !p.hostPartId; }).map(function (p) { return p.partId; })) }; }
      } catch (e) { clip = null; }
    }
    clip = clip || S.clipboard; if (!clip) return;
    ev.preventDefault(); S.clipboard = clip; pasteClip(clip, true);
  });
  function undo() { if (S.mode === "play") { playUndo(); return; } if (S.doc.canUndo()) { S.doc.undo(); validateSelection(); changed(); } }
  function redo() { if (S.mode === "edit" && S.doc.canRedo()) { S.doc.redo(); validateSelection(); changed(); } }
  function validateSelection() {
    S.group = S.group.filter(function (id) { return !!S.doc.part(id); });
    var s = S.selection; if (!s) return; var p = S.doc.part(s.id);
    if (!p) S.selection = null;
    else if (s.type === "pin" && !(p.pins || []).some(function (q) { return q.featureId === s.feature; })) S.selection = null;
    else if (s.type === "stop" && !(p.stopPins || []).some(function (q) { return q.featureId === s.feature; })) S.selection = null;
  }
  $("#btnUndo").addEventListener("click", undo);
  $("#btnRedo").addEventListener("click", redo);
  $("#btnPlayUndo").addEventListener("click", playUndo);
  $("#btnPlayReset").addEventListener("click", function () { startPlay(); });

  // ============================================================== inspector
  function num(id, value, opts) {
    opts = opts || {};
    return '<input type="number" data-k="' + id + '" value="' + fmt(value, opts.d == null ? 3 : opts.d) + '" step="' + (opts.step || "any") + '"' + (opts.disabled ? " disabled" : "") + (opts.min != null ? ' min="' + opts.min + '"' : "") + ">";
  }
  function swatches(current) {
    return '<div class="swatches">' + A.PALETTE.map(function (c, i) {
      var on = current && Math.abs(c[0] - current[0]) < 0.01 && Math.abs(c[1] - current[1]) < 0.01 && Math.abs(c[2] - current[2]) < 0.01;
      return '<button data-color="' + i + '" class="' + (on ? "on" : "") + '" style="background:' + RR.Color.css(c) + '" title="' + RR.Color.KEYS[i] + '"></button>';
    }).join("") + "</div>";
  }
  // Auto-fit the selected pin onto the body it is linked to (or the nearest ring/stick), then report whether it now locks it.
  function fitSelectedPin() {
    var sel = S.selection, d = S.doc; if (!sel || sel.type !== "pin") { toast("Chọn một pin để khớp"); return; }
    var res;
    d.beginGesture();
    try { res = d.fitPin(sel.id, sel.feature); afterEdit(); } catch (e) { d.endGesture(); toast(e.message); return; }
    d.endGesture(); changed();
    var touching = d.pinTouches(sel.id, sel.feature).indexOf(res.target) >= 0;
    if (touching) status("Đã khớp pin của " + label(sel.id) + " vào " + label(res.target) + ": hướng " + fmt(res.angle, 1) + "°, dài " + fmt(res.length, 3));
    else toast("Pin đã hướng vào " + label(res.target) + " nhưng đầu pin nằm ở khe của nó, nên chưa khóa. Xoay khe của " + label(res.target) + " hoặc dời vòng.");
  }
  function renderInspector() {
    var body = $("#inspectorBody"), sel = S.selection, d = S.doc;
    renderMeta();
    if (S.mode !== "edit") return;
    if (S.group.length > 1) { renderGroupInspector(body); return; }
    if (!sel || !d.part(sel.id)) { body.className = "hint"; body.innerHTML = "Chọn một vật trên bảng. Phím tắt: V chọn · R vòng · O vòng kín · P pin · T chốt · S thanh · G ngàm · B bom · L liên kết · X xóa · Tab chơi thử."; return; }
    body.className = "insp";
    var part = d.part(sel.id), pose = d.worldOfPart(sel.id), html = [], kind = part.kind;
    if (sel.type === "pin") {
      var pin = part.pins.find(function (q) { return q.featureId === sel.feature; }); if (!pin) { body.innerHTML = ""; return; }
      var inner = !!pin.isInnerMount, wa = norm360(pose.angle + d.pinBearing(sel.id, sel.feature)), targets = d.data.links.filter(function (l) { return l.sourcePartId === sel.id && l.sourceFeatureId === sel.feature; });
      html.push("<h4>Pin của " + label(sel.id) + " <small>(" + esc(sel.feature) + ")</small></h4>");
      html.push('<div class="grid2"><label>Hướng (°)</label>' + num("pinAngle", wa, { d: 1, step: angleStep() }) + '<label>Dài</label>' + num("pinLength", d.pinLength(sel.id, sel.feature), { d: 3, step: 0.05, min: inner ? 0.2 : 0.45 }) + "</div>");
      html.push('<div class="row"><label><input type="checkbox" data-act="pinInner"' + (inner ? " checked" : "") + '> Gắn trong (cắm vào vòng/thanh nằm bên trong vòng này)</label></div>');
      html.push('<div class="hint">' + (inner ? "Dài = từ mép trong vòng vào tới tâm đầu pin." : "Dài = từ mép ngoài vòng tới tâm đầu pin (chuẩn " + fmt(A.PIN_OFFSET_FROM_OUTER, 4) + ").") + "</div>");
      html.push('<div class="row gap"><button class="primary" data-act="fitPin" title="Chỉnh hướng và độ dài để đầu pin nằm giữa thân vật đang nối (hoặc vật gần nhất) — phím K">Khớp vào vật nối</button><button data-act="resetPinLength" title="Về độ dài chuẩn">Độ dài chuẩn</button></div>');
      html.push('<div class="row"><label>Khóa</label>' + (targets.length ? targets.map(function (l) { return '<span class="chip">' + label(l.targetPartId) + ' <button data-unlink="' + esc(l.targetPartId) + '" title="Bỏ liên kết">×</button></span>'; }).join("") : '<span class="hint">không khóa vật nào (chỉ chặn)</span>') + "</div>");
      html.push('<div class="row gap"><button data-act="relinkPin">Nối theo vật đang chạm</button><button data-act="linkTool">Liên kết thủ công…</button></div>');
      html.push('<div class="row"><button class="danger" data-act="delete">Xóa pin</button></div>');
    } else if (sel.type === "stop") {
      var stp = (part.stopPins || []).find(function (q) { return q.featureId === sel.feature; }); if (!stp) { body.innerHTML = ""; return; }
      var len = RR.Builder.stopLength(part, stp);
      html.push("<h4>Chốt chặn của " + label(sel.id) + "</h4>");
      html.push('<div class="grid2"><label>Hướng (°)</label>' + num("stopAngle", norm360(pose.angle + (stp.angleDegrees || 0)), { d: 1, step: angleStep() }) + '<label>Dài</label>' + num("stopLength", len, { d: 2, step: 0.05 }) + "</div>");
      html.push('<div class="hint">' + (len < 0 ? "Chốt hướng vào trong vòng." : "Chốt hướng ra ngoài vòng.") + " Độ dài âm = chốt nằm bên trong vòng (bấm vào trong vòng khi đặt cũng tạo chốt bên trong).</div>");
      html.push('<div class="row"><button class="danger" data-act="delete">Xóa chốt</button></div>');
    } else if (kind === "ring") {
      var gapDir = norm360(pose.angle + (part.meshGapDirection || 0)), closed = part.logicGapDegrees <= 0.5;
      html.push("<h4>Vòng " + label(sel.id) + " <small>(" + esc(sel.id) + ")</small></h4>");
      html.push('<div class="grid2"><label>X</label>' + num("x", pose.position.x) + "<label>Y</label>" + num("y", pose.position.y) +
        "<label>Hướng khe</label>" + num("gapDir", gapDir, { d: 1, step: angleStep() }) +
        "<label>Khe (°)</label>" + (S.grid ? '<select data-k="gapPreset"><option value="90"' + (!closed ? " selected" : "") + ">Hở 90°</option><option value=\"0\"" + (closed ? " selected" : "") + ">Kín</option>" + (!closed && Math.abs(part.logicGapDegrees - 90) > 0.01 ? '<option value="' + part.logicGapDegrees + '" selected>' + fmt(part.logicGapDegrees, 1) + "° (gốc)</option>" : "") + "</select>" : num("gap", part.logicGapDegrees, { d: 1, step: 5, min: 0 })) +
        "<label>Bán kính</label>" + num("radius", part.radius, { d: 3, step: 0.05, disabled: S.grid, min: A.MIN_RING_RADIUS }) + "</div>");
      if (S.grid && Math.abs(part.radius - A.RING_RADIUS) > 1e-3) html.push('<div class="hint">Bán kính khác chuẩn 1,75 — tắt Lưới đều để sửa.</div>');
      html.push('<div class="grid2"><label>Xích (số lần giải)</label>' + num("lockCount", part.lockCount || 0, { d: 0, step: 1, min: 0 }) + "</div>");
      html.push('<div class="row"><label><input type="checkbox" data-act="canCollect"' + (part.canCollect ? " checked" : "") + '> Mang Cá (Challenge) — game chọn tối đa 3 vòng được đánh dấu mỗi lần chơi</label></div>');
      html.push("<h4>Màu</h4>" + swatches(part.color));
      html.push("<h4>Pin (" + part.pins.length + ") · Chốt (" + (part.stopPins || []).length + ")</h4>");
      part.pins.forEach(function (p, i) {
        var ts = d.data.links.filter(function (l) { return l.sourcePartId === sel.id && l.sourceFeatureId === p.featureId; }).map(function (l) { return label(l.targetPartId); });
        html.push('<div class="row"><a href="#" data-pin="' + esc(p.featureId) + '">p' + (i + 1) + " · " + fmt(norm360(pose.angle + (p.angleDegrees || 0)), 0) + "°</a> → " + (ts.length ? ts.join(", ") : '<span class="hint">không khóa</span>') + "</div>");
      });
      var bomb = d.bombOf(sel.id);
      html.push('<div class="row gap">' + (bomb ? '<button data-act="selectBomb">Chọn bom</button>' : '<button data-act="addBomb">Gắn bom</button>') + '<button class="danger" data-act="delete">Xóa vòng</button></div>');
    } else if (kind === "stick") {
      var preset = detectPresetLocal(part.pathPoints), slideTxt = "";
      var w = editWorld(); if (w) { var so = w.objectIndexById[sel.id]; if (so !== undefined) { var st = w.stickOf(so); slideTxt = st.axisError ? '<span class="danger">' + esc(st.axisError) + "</span>" : "(" + fmt(st.slideAxis.x, 2) + ", " + fmt(st.slideAxis.y, 2) + ") theo " + esc(st.slideAxisSource); } }
      html.push("<h4>Thanh " + label(sel.id) + " <small>(" + esc(sel.id) + ")</small></h4>");
      html.push('<div class="grid2"><label>Xích (số lần giải)</label>' + num("lockCount", part.lockCount || 0, { d: 0, step: 1, min: 0 }) + "</div>");
      html.push('<div class="grid2"><label>X</label>' + num("x", pose.position.x) + "<label>Y</label>" + num("y", pose.position.y) + "<label>Góc</label>" + num("angle", norm360(pose.angle), { d: 1, step: angleStep() }) +
        '<label>Dạng</label><select data-k="shape">' + ["straight", "L", "U"].map(function (s) { return '<option value="' + s + '"' + (preset && preset.shape === s ? " selected" : "") + ">" + { straight: "Thẳng", L: "L", U: "U" }[s] + "</option>"; }).join("") + (preset ? "" : '<option selected value="">Tùy chỉnh (giữ)</option>') + "</select>" +
        "<label>Dài</label>" + num("length", preset ? preset.length : 0, { d: 2, step: 0.25, disabled: !preset }) + "<label>Cánh</label>" + num("arm", preset && preset.arm != null ? preset.arm : A.STICK_DEFAULT_ARM, { d: 2, step: 0.25, disabled: !preset || preset.shape === "straight" }) + "</div>");
      html.push('<div class="hint">Trục trượt: ' + slideTxt + "</div>");
      html.push('<div class="row"><label>Trục tự đặt</label><select data-k="slideAxis"><option value="">Tự động</option><option value="1,0"' + (part.localSlideAxis && part.localSlideAxis[0] !== 0 && part.localSlideAxis[1] === 0 ? " selected" : "") + '>Dọc thân (X)</option><option value="0,1"' + (part.localSlideAxis && part.localSlideAxis[0] === 0 ? " selected" : "") + ">Ngang thân (Y)</option></select></div>");
      html.push("<h4>Màu</h4>" + swatches(part.color));
      html.push("<h4>Ngàm: " + guidesOf(sel.id).map(label).join(", ") + "</h4>");
      var bomb2 = d.bombOf(sel.id);
      html.push('<div class="row gap">' + (bomb2 ? '<button data-act="selectBomb">Chọn bom</button>' : '<button data-act="addBomb">Gắn bom</button>') + '<button class="danger" data-act="delete">Xóa thanh</button></div>');
    } else if (kind === "guide") {
      var gl = (d.data.guideLinks || []).find(function (g) { return g.guidePartId === sel.id; });
      html.push("<h4>Ngàm " + label(sel.id) + " của " + (gl ? label(gl.stickPartId) : "?") + "</h4>");
      html.push('<div class="grid2"><label>X</label>' + num("x", pose.position.x) + "<label>Y</label>" + num("y", pose.position.y) + "<label>Hướng lối</label>" + num("angle", norm360(pose.angle), { d: 1, step: angleStep() }) + "</div>");
      html.push('<div class="hint">Hướng lối = hướng thanh trượt qua ngàm. Thanh bị ngàm giữ cho đến khi thân rời hộp ngàm.</div>');
      html.push('<div class="row"><button class="danger" data-act="delete">Xóa ngàm</button></div>');
    } else if (kind === "bomb") {
      html.push("<h4>Bom " + label(sel.id) + (part.hostPartId ? " trên " + label(part.hostPartId) : " (tự do)") + "</h4>");
      html.push('<div class="grid2"><label>X</label>' + num("x", pose.position.x) + "<label>Y</label>" + num("y", pose.position.y) + "<label>Bán kính</label>" + num("bombRadius", part.bombRadius, { d: 2, step: 0.05, min: 0.1 }) + "</div>");
      html.push('<div class="hint">Luật §17: bom nổ khi chạm vật khác, phá vật mang bom và vật bị chạm.</div>');
      html.push('<div class="row"><button class="danger" data-act="delete">Xóa bom</button></div>');
    }
    body.innerHTML = html.join("");
    markScrubLabels(body);
  }
  // Labels of enabled number fields become scrub handles (drag left/right to change the value, like Unity).
  function markScrubLabels(body) {
    $all("#inspectorBody .grid2 > label").forEach(function (lab) {
      var input = lab.nextElementSibling;
      if (input && input.tagName === "INPUT" && input.type === "number" && !input.disabled && input.dataset.k) {
        lab.classList.add("scrub"); lab.dataset.scrub = input.dataset.k; lab.title = "Kéo trái/phải để đổi giá trị · Shift nhanh ×10 · Alt chậm ×0,1";
      }
    });
    void body;
  }
  function renderGroupInspector(body) {
    var kinds = {}; S.group.forEach(function (id) { var k = partKind(id); kinds[k] = (kinds[k] || 0) + 1; });
    var names = { ring: "vòng", stick: "thanh", guide: "ngàm", bomb: "bom" };
    body.className = "insp";
    body.innerHTML = "<h4>Đã chọn " + S.group.length + " vật</h4>" +
      '<div class="hint">' + Object.keys(kinds).map(function (k) { return kinds[k] + " " + (names[k] || k); }).join(" · ") + ". Kéo một vật để di chuyển cả nhóm; Shift+click để thêm/bớt.</div>" +
      "<h4>Căn chỉnh (theo tâm)</h4>" +
      '<div class="row gap"><button data-group="alignX" title="Cùng X (thẳng hàng dọc)">⇵ Cùng cột</button><button data-group="alignY" title="Cùng Y (thẳng hàng ngang)">⇆ Cùng hàng</button></div>' +
      '<div class="row gap"><button data-group="distX" title="Khoảng cách ngang đều nhau">↔ Giãn đều ngang</button><button data-group="distY" title="Khoảng cách dọc đều nhau">↕ Giãn đều dọc</button></div>' +
      '<div class="row gap"><button data-group="copy">Copy (Ctrl+C)</button><button data-group="dup">Nhân bản (Ctrl+D)</button><button class="danger" data-group="delete">Xóa</button></div>';
  }
  function groupAction(act) {
    var d = S.doc, ids = S.group.filter(function (id) { var p = d.part(id); return p && !(p.kind === "bomb" && p.hostPartId && S.group.indexOf(p.hostPartId) >= 0) && !(p.kind === "guide" && S.group.indexOf(stickOfGuide(id)) >= 0); });
    if (act === "copy") { copySelection(); toast("Đã copy " + S.group.length + " vật"); return; }
    if (act === "dup") { duplicateSelection(); return; }
    if (act === "delete") { deleteGroup(); return; }
    var pos = ids.map(function (id) { return d.worldOfPart(id).position; }), axis = act === "alignX" || act === "distX" ? "x" : "y";
    d.beginGesture();
    try {
      if (act === "alignX" || act === "alignY") {
        var lead = d.worldOfPart(S.selection.id).position[axis];
        ids.forEach(function (id, i) { var dv = V(0, 0); dv[axis] = lead - pos[i][axis]; moveParts(expandMoving([id]), dv); });
      } else {
        var order = ids.map(function (id, i) { return { id: id, v: pos[i][axis] }; }).sort(function (a, b) { return a.v - b.v; });
        if (order.length >= 3) {
          var lo = order[0].v, hi = order[order.length - 1].v;
          order.forEach(function (o, i) { var dv = V(0, 0); dv[axis] = lo + (hi - lo) * i / (order.length - 1) - o.v; moveParts(expandMoving([o.id]), dv); });
        } else toast("Cần ít nhất 3 vật để giãn đều");
      }
      afterEdit();
    } catch (e) { toast(e.message); }
    d.endGesture(); changed();
  }
  function stickOfGuide(id) { var g = (S.doc.data.guideLinks || []).find(function (q) { return q.guidePartId === id; }); return g ? g.stickPartId : null; }
  function detectPresetLocal(path) {
    var dsg = RR.Design.fromLevel({ version: 1, levelId: "x", transforms: [{ transformId: "t", parentId: null, localPosition: [0, 0, 0], localRotation: [0, 0, 0, 1], localScale: [1, 1, 1] }], parts: [Object.assign(RR.Builder.emptyPart("slide_bar_1", "stick", "t"), { pathPoints: path, color: [1, 1, 1, 1], colliderHalfWidth: A.STICK_HALF, colliderEndInset: A.STICK_INSET, cornerRadius: A.STICK_CORNER })], links: [] });
    var s = dsg.sticks[0]; return s.shape ? { shape: s.shape, length: s.length, arm: s.arm } : null;
  }
  $("#inspectorBody").addEventListener("change", function (ev) {
    var el = ev.target, k = el.dataset.k, sel = S.selection, d = S.doc; if (!k || !sel) return;
    d.beginGesture();
    try { applyField(k, parseFloat(el.value), el); afterEdit(); } catch (e) { toast(e.message); }
    d.endGesture(); changed();
  });
  // One inspector field -> document edit (no undo bracketing here: the caller opens/closes the gesture).
  function applyField(k, v, el) {
    var sel = S.selection, d = S.doc, part = d.part(sel.id), pose = d.worldOfPart(sel.id);
    if (!isFinite(v) && k !== "gapPreset" && k !== "shape" && k !== "slideAxis") return;
    {
      switch (k) {
        case "x": case "y": { var np = k === "x" ? V(v, pose.position.y) : V(pose.position.x, v); moveParts(expandMoving([sel.id]), M.sub(np, pose.position)); break; }
        case "gapDir": rotateSelection(v); break;
        case "angle": rotateSelection(v); break;
        case "gapPreset": d.setRing(sel.id, part.radius, parseFloat(el.value)); break;
        case "gap": d.setRing(sel.id, part.radius, Math.max(0, Math.min(360, v))); break;
        case "radius": d.setRing(sel.id, v, part.logicGapDegrees); break;
        case "pinAngle": d.setPinAngle(sel.id, sel.feature, norm360(v - pose.angle)); break;
        case "pinLength": d.setPinLength(sel.id, sel.feature, v); break;
        case "stopAngle": { var s = part.stopPins.find(function (q) { return q.featureId === sel.feature; }); d.setStopPin(sel.id, sel.feature, norm360(v - pose.angle), null); void s; break; }
        case "stopLength": { var s2 = part.stopPins.find(function (q) { return q.featureId === sel.feature; }); d.setStopPin(sel.id, sel.feature, s2.angleDegrees || 0, v); break; }
        case "shape": case "length": case "arm": {
          // read the INPUTS (labels carry data-scrub, never data-k)
          var root = el.closest(".insp"), shape = root.querySelector('select[data-k="shape"]').value; if (!shape) break;
          var sl = parseFloat(root.querySelector('input[data-k="length"]').value), sa = parseFloat(root.querySelector('input[data-k="arm"]').value);
          if (!isFinite(sl) || sl <= 0) throw new Error("Độ dài thanh phải là số dương");
          d.setStickShape(sel.id, shape, sl, isFinite(sa) && sa > 0 ? sa : A.STICK_DEFAULT_ARM); break;
        }
        case "slideAxis": d.setStickSlideAxis(sel.id, el.value ? el.value.split(",").map(Number) : null); break;
        case "bombRadius": d.setBombRadius(sel.id, v); break;
        case "lockCount": d.setLockCount(sel.id, v); break;
      }
    }
  }

  // Scrub: drag a field label left/right (pointer lock, so the mouse never hits the screen edge). One undo step per drag.
  // Per pixel: positions 0.01 (grid: half a grid step per 14 px), angles 0.5° (grid: 15° per 10 px), sizes 0.01; Shift ×10, Alt ×0.1.
  var SCRUB = {
    x: "pos", y: "pos", gapDir: "angle", angle: "angle", pinAngle: "angle", stopAngle: "angle", gap: "deg",
    radius: "size", stopLength: "size", length: "size", arm: "size", bombRadius: "small", pinLength: "size"
  };
  var scrub = null;
  $("#inspectorBody").addEventListener("pointerdown", function (ev) {
    var lab = ev.target.closest && ev.target.closest("label.scrub"); if (!lab || ev.button !== 0) return;
    var input = lab.nextElementSibling, k = lab.dataset.scrub; if (!input || !SCRUB[k]) return;
    ev.preventDefault();
    scrub = { k: k, input: input, start: parseFloat(input.value) || 0, acc: 0, changed: false, lab: lab };
    S.doc.beginGesture(); lab.classList.add("active");
    try { var lock = lab.requestPointerLock(); if (lock && lock.catch) lock.catch(function () { /* not available: plain pointer capture */ }); } catch (e) { /* idem */ }
    try { lab.setPointerCapture(ev.pointerId); } catch (e2) { /* ignore */ }
  });
  function scrubValue(k, start, px, ev) {
    var mult = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1, kind = SCRUB[k];
    if (kind === "pos") return S.grid ? start + Math.round(px * mult / 14) * (PITCH / 2) : Math.round((start + px * mult * 0.01) * 1000) / 1000;
    if (kind === "angle") return S.grid ? start + Math.round(px * mult / 10) * 15 : Math.round((start + px * mult * 0.5) * 10) / 10;
    if (kind === "deg") return Math.max(0, Math.min(360, Math.round((start + px * mult * 0.5) * 10) / 10));
    if (kind === "small") return Math.max(0.1, Math.round((start + px * mult * 0.005) * 1000) / 1000);
    return Math.round((start + px * mult * 0.01) * 1000) / 1000;
  }
  function scrubMove(ev) {
    if (!scrub) return;
    scrub.acc += ev.movementX || 0;
    var v = scrubValue(scrub.k, scrub.start, scrub.acc, ev);
    if (String(v) === scrub.input.value) return;
    scrub.input.value = fmt(v, 3);
    try { applyField(scrub.k, v, scrub.input); scrub.changed = true; S.worldRev = -1; render(); }
    catch (e) { status(e.message); }
  }
  function scrubEnd() {
    if (!scrub) return;
    var s = scrub; scrub = null; s.lab.classList.remove("active");
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) { /* ignore */ }
    if (s.changed) { try { afterEdit(); } catch (e2) { toast(e2.message); } }
    S.doc.endGesture(); if (s.changed) changed(); else renderInspector();
  }
  document.addEventListener("pointermove", scrubMove);
  document.addEventListener("pointerup", scrubEnd);
  $("#inspectorBody").addEventListener("click", function (ev) {
    var t = ev.target, sel = S.selection, d = S.doc;
    if (t.dataset.group) { groupAction(t.dataset.group); return; }
    if (!sel) return;
    if (t.dataset.color != null) { d.setColor(sel.id, A.PALETTE[+t.dataset.color]); changed(); return; }
    if (t.dataset.unlink) { d.removeLink(sel.id, sel.feature, t.dataset.unlink); if (S.autoLink) { S.autoLink = false; $("#optAutoLink").checked = false; toast("Đã tắt Tự nối pin để giữ thay đổi thủ công"); } changed(); return; }
    if (t.dataset.pin) { ev.preventDefault(); select({ type: "pin", id: sel.id, feature: t.dataset.pin }); return; }
    switch (t.dataset.act) {
      case "delete": deleteTarget(sel); break;
      case "relinkPin": d.relinkPin(sel.id, sel.feature); changed(); break;
      case "fitPin": fitSelectedPin(); break;
      case "canCollect": try { d.setCanCollect(sel.id, t.checked); } catch (e) { toast(e.message); } changed(); break;
      case "pinInner": d.beginGesture(); try { d.setPinInner(sel.id, sel.feature, t.checked); afterEdit(); } catch (e) { toast(e.message); } d.endGesture(); changed(); break;
      case "resetPinLength": d.beginGesture(); try { d.setPinLength(sel.id, sel.feature, A.PIN_OFFSET_FROM_OUTER); afterEdit(); } catch (e) { toast(e.message); } d.endGesture(); changed(); break;
      case "linkTool": setTool("link"); S.linkSource = { id: sel.id, feature: sel.feature }; status("Bấm vật đích cho pin của " + label(sel.id)); render(); break;
      case "addBomb": try { var bid = d.addBomb(sel.id, V(0, 0), A.BOMB_RADIUS); afterEdit(); S.selection = { type: "part", id: bid }; changed(); } catch (e) { toast(e.message); } break;
      case "selectBomb": var b = d.bombOf(sel.id); if (b) select({ type: "part", id: b.partId }); break;
    }
  });

  // ============================================================== level meta
  function renderMeta() {
    $("#metaName").value = S.meta.name || ""; $("#metaAuthor").value = S.meta.author || ""; $("#metaNotes").value = S.meta.notes || ""; $("#metaId").value = S.doc.data.levelId;
  }
  ["metaName", "metaAuthor", "metaNotes"].forEach(function (id) {
    $("#" + id).addEventListener("input", function () { S.meta[{ metaName: "name", metaAuthor: "author", metaNotes: "notes" }[id]] = $("#" + id).value; S.doc.dirty = true; updateDirty(); autosave(); });
  });
  $("#metaId").addEventListener("change", function () { var v = $("#metaId").value.trim() || "draft"; S.doc.setLevelId(v); changed({ keepSolve: true }); });

  // ============================================================== analysis
  function scheduleAnalysis() { clearTimeout(S.analysisTimer); S.analysisTimer = setTimeout(runAnalysis, 120); }
  function runAnalysis() {
    var a; try { a = RR.analyze(S.doc.data); } catch (e) { a = { error: e.message, warnings: [], info: {} }; }
    S.analysis = a; S.analysisLinks = null;
    try {
      if (!a.error) { var sim = new RR.Simulation(S.doc.data); S.analysisLinks = {}; sim.links.forEach(function (l, i) { S.analysisLinks[sim.idOf(l.source) + "/" + sim.world.rings[l.source].pinFeatures[l.pin] + "/" + sim.idOf(l.target)] = sim.graph.active[i]; }); }
    } catch (e2) { /* shown by analyze */ }
    var list = [], ul = $("#issues");
    if (!S.doc.data.parts.length) list.push('<li class="note">Level trống. Chọn công cụ Vòng (R) rồi bấm lên bảng.</li>');
    else if (a.error) list.push('<li class="err">' + esc(humanError(a.error)) + "</li>");
    else list.push('<li class="ok">Game nạp được level này (validator + simulation).</li>');
    (a.warnings || []).forEach(function (w) { list.push('<li class="warn" data-part="' + esc(w.part || "") + '">' + esc(w.text) + "</li>"); });
    ul.innerHTML = list.join("");
    $("#checkBadge").textContent = a.error ? "lỗi" : (a.warnings.length ? a.warnings.length + " cảnh báo" : "ổn");
    var info = a.info || {};
    $("#counts").innerHTML = S.doc.data.parts.length ? ["<span>" + (info.rings || 0) + " vòng</span>", info.closedRings ? "<span>" + info.closedRings + " kín</span>" : "", "<span>" + (info.pins || 0) + " pin</span>", "<span>" + (info.links || 0) + " liên kết</span>",
      info.stops ? "<span>" + info.stops + " chốt</span>" : "", info.sticks ? "<span>" + info.sticks + " thanh</span>" : "", info.guides ? "<span>" + info.guides + " ngàm</span>" : "", info.bombs ? "<span>" + info.bombs + " bom</span>" : ""].join("") : "";
    if (S.show.links) render();
  }
  function humanError(e) {
    return e.replace(/^InvalidData: /, "Dữ liệu chưa hợp lệ: ").replace(/^UnsupportedContent: /, "Game chưa hỗ trợ: ").replace("Missing parts", "chưa có vật nào");
  }
  $("#issues").addEventListener("click", function (ev) { var li = ev.target.closest("li[data-part]"); if (li && li.dataset.part && S.doc.part(li.dataset.part)) { if (S.mode !== "edit") setMode("edit"); select({ type: "part", id: li.dataset.part }); } });

  // ============================================================== solver
  var solveIter = null;
  function startSolve(onDone) {
    if (typeof onDone !== "function") onDone = null;
    var err = RR.validate(S.doc.data); if (err) { toast("Sửa lỗi trước khi tìm lời giải: " + humanError(err)); return; }
    var opts = { nodeLimit: +$("#solveNodes").value || 4000, timeLimitSeconds: +$("#solveTime").value || 60, sliceMs: 25, explodeBombs: $("#optSolveBombs").checked };
    var level = RR.json.clone(S.doc.data), revAt = rev();
    solveIter = RR.Solver.findSteps(level, opts); S.solve.running = true;
    $("#btnSolve").disabled = true; $("#btnSolveStop").hidden = false; $("#btnReplay").disabled = true; $("#solveSteps").innerHTML = "";
    $("#solveResult").className = "hint"; $("#solveResult").textContent = "Đang tìm…";
    (function tick() {
      if (!solveIter) return;
      var r = solveIter.next();
      if (!r.done) { $("#solveResult").textContent = "Đang tìm… " + r.value.nodes + " nhánh, " + r.value.seconds.toFixed(1) + " s"; setTimeout(tick, 0); return; }
      finishSolve(r.value, level, revAt, opts);
      if (onDone) onDone(r.value);
    })();
  }
  function finishSolve(result, level, revAt, opts) {
    solveIter = null; S.solve.running = false; $("#btnSolve").disabled = false; $("#btnSolveStop").hidden = true;
    result.explodeBombs = opts.explodeBombs; result.limits = { nodes: opts.nodeLimit, seconds: opts.timeLimitSeconds };
    if (rev() !== revAt) { $("#solveResult").textContent = "Level đã đổi trong lúc tìm — hãy chạy lại."; return; }
    S.solve.result = result; S.solve.rev = revAt;
    var box = $("#solveResult");
    if (result.found) {
      result.route = RR.Solver.describeRoute(level, result.moves, opts.explodeBombs);
      box.className = "issues"; box.innerHTML = '<li class="ok">Giải được: ' + result.moves.length + " lần kéo (" + result.nodes + " nhánh, " + result.seconds.toFixed(1) + " s)</li>";
      $("#solveSteps").innerHTML = result.route.map(function (s, i) { return '<li data-i="' + i + '">' + s.label + " " + (s.kind === "ring" ? (s.direction === "CCW" ? "↺" : "↻") + " tới " + fmt(M.repeat(s.to, 360), 0) + "°" : "trượt " + s.direction + " tới " + fmt(s.to, 2)) + (s.removedNow ? " · tháo " + s.removedNow : "") + "</li>"; }).join("");
      $("#btnReplay").disabled = false;
    } else {
      box.className = "issues"; box.innerHTML = '<li class="warn">Không tìm thấy trong giới hạn (' + result.nodes + " nhánh, " + result.seconds.toFixed(0) + " s). Không có nghĩa là vô nghiệm — thử tăng giới hạn hoặc tự chơi thử.</li>";
    }
  }
  function highlightStep(i) { $all("#solveSteps li").forEach(function (li) { li.classList.toggle("on", +li.dataset.i === i); }); S.solve.stepIndex = i; }
  $("#btnSolve").addEventListener("click", startSolve);
  $("#btnSolveStop").addEventListener("click", function () { if (solveIter) { var it = solveIter; solveIter = null; S.solve.running = false; $("#btnSolve").disabled = false; $("#btnSolveStop").hidden = true; $("#solveResult").textContent = "Đã dừng."; void it; } });
  $("#btnReplay").addEventListener("click", replayRoute);

  // ============================================================== files
  function download(name, text) {
    var blob = new Blob([text], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function safeName(s) { return (s || "level").replace(/[^\w\-]+/g, "_").replace(/^_+|_+$/g, "") || "level"; }
  function designObject() {
    var d = RR.Design.fromLevel(S.doc.data, { name: S.meta.name });
    if (S.meta.name) d.name = S.meta.name; if (S.meta.author) d.author = S.meta.author; if (S.meta.notes) d.notes = S.meta.notes;
    var ordered = { format: d.format, version: d.version, levelId: d.levelId, name: d.name, author: d.author, notes: d.notes, rings: d.rings, sticks: d.sticks, bombs: d.bombs, _notes: d._notes };
    Object.keys(ordered).forEach(function (k) { if (ordered[k] === undefined) delete ordered[k]; });
    return ordered;
  }
  // The pack is the saved/sent format: runtime level (exact geometry) + design (readable) + proof of the current version + warnings.
  function buildPack() {
    var r = S.solve.result && S.solve.rev === rev() ? S.solve.result : null, a = RR.analyze(S.doc.data), ids = null;
    if (r) { try { var sim = new RR.Simulation(S.doc.data); ids = r.moves.map(function (m) { return sim.idOf(m.obj); }); } catch (e) { ids = null; } }
    return {
      format: "turp-pack", version: 1,
      tool: { name: "RotateLevelDesigner", version: TOOL_VERSION, constants: C.exportedAt },
      createdAt: new Date().toISOString(), name: S.meta.name || null, author: S.meta.author || null, notes: S.meta.notes || null,
      levelId: S.doc.data.levelId,
      runtime: S.doc.data,
      design: designObject(),
      proof: r && ids ? { found: r.found, drags: r.found ? r.moves.length : null, route: r.route || null, moves: r.moves.map(function (m, i) { return { part: ids[i], target: m.target }; }), log: r.log, nodes: r.nodes, seconds: r.seconds, limits: r.limits, explodeBombs: !!r.explodeBombs } : null,
      analysis: { error: a.error || null, warnings: a.warnings.map(function (w) { return w.text; }), info: a.info }
    };
  }
  function exportDesign() {
    var d = designObject();
    download(safeName(S.meta.name || ("Level" + S.doc.data.levelId)) + ".rrdesign.json", JSON.stringify(d, null, 2));
    if (d._notes) toast("Lưu ý: " + d._notes.length + " chi tiết khác kích thước chuẩn sẽ được dựng lại theo chuẩn nếu mở từ file thiết kế.");
  }
  function exportRuntime() {
    var err = RR.validate(S.doc.data); if (err && !confirm("Level chưa hợp lệ (" + humanError(err) + "). Vẫn xuất?")) return;
    download("Level" + safeName(S.doc.data.levelId) + ".json", RR.json.stringify(S.doc.data));
  }

  // ---------- levels/ folder (File System Access API: Chrome/Edge) ----------
  // The folder handle is remembered in IndexedDB; the browser asks for permission once per session (one click).
  var IDB_NAME = "rr-designer", IDB_STORE = "handles", LEVEL_EXT = /\.(rrpack|rrdesign)\.json$/i;
  function idb(mode, fn) {
    return new Promise(function (resolve, reject) {
      var open; try { open = indexedDB.open(IDB_NAME, 1); } catch (e) { reject(e); return; }
      open.onupgradeneeded = function () { open.result.createObjectStore(IDB_STORE); };
      open.onerror = function () { reject(open.error); };
      open.onsuccess = function () {
        var tx = open.result.transaction(IDB_STORE, mode), req = fn(tx.objectStore(IDB_STORE));
        tx.oncomplete = function () { resolve(req && req.result); open.result.close(); };
        tx.onerror = function () { reject(tx.error); };
      };
    });
  }
  function folderSupported() { return typeof window.showDirectoryPicker === "function"; }
  function setDir(handle, state) {
    S.dir = handle; S.dirState = state;
    if (handle) idb("readwrite", function (st) { return st.put(handle, "levels"); }).catch(function () { /* not persisted */ });
    renderFolderPanel(); if (state === "ready") refreshLevels();
  }
  function restoreDir() {
    if (!folderSupported()) { S.dirState = "unsupported"; renderFolderPanel(); return; }
    idb("readonly", function (st) { return st.get("levels"); }).then(function (h) {
      if (!h) { S.dirState = "none"; renderFolderPanel(); return; }
      S.dir = h;
      return h.queryPermission({ mode: "readwrite" }).then(function (p) { S.dirState = p === "granted" ? "ready" : "permission"; renderFolderPanel(); if (p === "granted") refreshLevels(); });
    }).catch(function () { S.dirState = "none"; renderFolderPanel(); });
  }
  // Must run inside a user gesture (click / key press). Resolves true when the folder can be written.
  function ensureDir() {
    if (!folderSupported()) return Promise.resolve(false);
    if (S.dir && S.dirState === "ready") return Promise.resolve(true);
    if (S.dir && S.dirState === "permission")
      return S.dir.requestPermission({ mode: "readwrite" }).then(function (p) { if (p === "granted") { setDir(S.dir, "ready"); return true; } return false; });
    return pickDir();
  }
  function pickDir() {
    return window.showDirectoryPicker({ id: "rr-levels", mode: "readwrite" }).then(function (h) {
      if (h.name !== "levels") toast("Đã chọn thư mục \"" + h.name + "\". Nên chọn RotateLevelDesigner/levels để Dev dễ tìm.");
      setDir(h, "ready"); return true;
    }).catch(function (e) { if (e && e.name !== "AbortError") toast("Không mở được thư mục: " + e.message); return false; });
  }
  function fileExists(name) { return S.dir.getFileHandle(name).then(function () { return true; }, function () { return false; }); }
  function uniqueName(base) {
    var n = 1;
    function attempt() { var name = base + (n > 1 ? "-" + n : "") + ".rrpack.json"; return fileExists(name).then(function (ex) { if (!ex) return name; n++; return attempt(); }); }
    return attempt();
  }
  function writeFile(name, text) {
    return S.dir.getFileHandle(name, { create: true }).then(function (fh) { return fh.createWritable(); }).then(function (w) { return w.write(text).then(function () { return w.close(); }); });
  }
  // Ctrl+S: levels/<name>.rrpack.json (same file again on the next save). saveAs asks for a new name. Without folder support: download.
  function saveToFolder(opts) {
    opts = opts || {};
    if (S.mode === "play") setMode("edit");
    var err = RR.validate(S.doc.data);
    if (err && S.doc.data.parts.length && !confirm("Level chưa hợp lệ (" + humanError(err) + "). Vẫn lưu bản nháp?")) return Promise.resolve(false);
    if (!folderSupported()) { download(safeName(S.meta.name || ("Level" + S.doc.data.levelId)) + ".rrpack.json", RR.json.stringify(buildPack())); markSaved(null); return Promise.resolve(true); }
    return ensureDir().then(function (ok) {
      if (!ok) { status("Chưa chọn thư mục levels — chưa lưu"); return false; }
      var named;
      if (S.savedName && !opts.saveAs) named = Promise.resolve(S.savedName);
      else {
        var suggestion = safeName(S.meta.name || (S.doc.data.levelId !== "draft" ? "Level" + S.doc.data.levelId : "level-" + new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")));
        if (opts.saveAs) {
          var typed = prompt("Tên file trong thư mục levels:", (S.savedName || suggestion).replace(LEVEL_EXT, ""));
          if (!typed) return false;
          var name = safeName(typed.replace(LEVEL_EXT, "")) + ".rrpack.json";
          named = fileExists(name).then(function (ex) { return ex && name !== S.savedName && !confirm(name + " đã có. Ghi đè?") ? null : name; });
        } else named = uniqueName(suggestion);
      }
      return named.then(function (name) {
        if (!name) return false;
        return writeFile(name, RR.json.stringify(buildPack())).then(function () {
          markSaved(name); refreshLevels();
          var proof = S.solve.result && S.solve.rev === rev();
          toast("Đã lưu levels/" + name + (proof ? (S.solve.result.found ? " (kèm lời giải)" : " (kèm kết quả: chưa tìm thấy lời giải)") : " (chưa có lời giải)"));
          return true;
        });
      });
    }).catch(function (e) { toast("Không lưu được: " + e.message); return false; });
  }
  function markSaved(name) { if (name) S.savedName = name; S.fileName = name || S.fileName; S.doc.dirty = false; updateDirty(); }
  // "Lưu kèm lời giải": solve the current version first (if needed), then save.
  function saveWithProof() {
    if (S.solve.result && S.solve.rev === rev()) { saveToFolder(); return; }
    var err = RR.validate(S.doc.data); if (err) { toast("Sửa lỗi trước: " + humanError(err)); return; }
    // keep the user gesture for the folder permission: ask for the folder first, then solve
    ensureDir().then(function (ok) {
      if (!ok && folderSupported()) { status("Chưa chọn thư mục levels — chưa lưu"); return; }
      startSolve(function () { saveToFolder(); });
    });
  }
  function refreshLevels() {
    if (!S.dir || S.dirState !== "ready") return Promise.resolve();
    var files = [];
    function readAll(it) {
      return it.next().then(function (r) {
        if (r.done) return;
        var entry = r.value, name = entry[0], h = entry[1];
        if (h.kind !== "file" || !LEVEL_EXT.test(name)) return readAll(it);
        return h.getFile().then(function (f) { return f.text().then(function (t) { files.push(summarize(name, t, f.lastModified)); }); }).then(function () { return readAll(it); });
      });
    }
    return readAll(S.dir.entries()).then(function () {
      files.sort(function (a, b) { return b.modified - a.modified; });
      S.levelFiles = files; renderFolderPanel();
    }).catch(function (e) { toast("Không đọc được thư mục: " + e.message); });
  }
  function summarize(name, text, modified) {
    var out = { name: name, modified: modified, text: text, summary: "?", proof: null, error: null };
    try {
      var obj = JSON.parse(text), kind = RR.Design.detectFormat(obj), level = kind === "pack" ? obj.runtime : kind === "design" ? RR.Design.toLevel(obj).level : null;
      if (!level) throw new Error("không phải level");
      var k = {}; level.parts.forEach(function (p) { k[p.kind] = (k[p.kind] || 0) + 1; });
      out.summary = (k.ring || 0) + "R" + (k.stick ? " " + k.stick + "S" : "") + (k.bomb ? " " + k.bomb + "B" : "");
      out.title = obj.name || null; out.kind = kind;
      if (kind === "pack") out.proof = obj.proof ? !!obj.proof.found : null;
    } catch (e) { out.error = e.message; }
    return out;
  }
  function renderFolderPanel() {
    var box = $("#folderActions"), list = $("#levelList"), info = $("#folderInfo");
    if (!box) return;
    var st = S.dirState;
    if (st === "unsupported") { box.innerHTML = '<div class="hint">Trình duyệt này không cho ghi thư mục (cần Chrome/Edge). Lưu sẽ tải file về.</div>'; list.innerHTML = ""; info.textContent = ""; return; }
    if (st === "none") box.innerHTML = '<div class="hint">Chọn thư mục <code>RotateLevelDesigner/levels</code> một lần; sau đó Ctrl+S lưu thẳng vào đó.</div><button data-folder="pick" class="wide">Chọn thư mục levels…</button>';
    else if (st === "permission") box.innerHTML = '<div class="hint">Trình duyệt cần bạn cho phép lại thư mục <b>' + esc(S.dir.name) + "</b> trong phiên này.</div><button data-folder=\"grant\" class=\"wide\">Cho phép truy cập</button>";
    else box.innerHTML = '<div class="row gap"><span class="hint" style="margin:0">📁 ' + esc(S.dir.name) + '</span><button data-folder="refresh" title="Đọc lại thư mục">↻</button><button data-folder="pick" title="Đổi thư mục">Đổi…</button></div>';
    info.textContent = st === "ready" ? S.levelFiles.length + " file" : "";
    list.innerHTML = st !== "ready" ? "" : S.levelFiles.length === 0 ? '<li class="hint">Chưa có level. Ctrl+S để lưu level đang mở.</li>' : S.levelFiles.map(function (f, i) {
      var badge = f.error ? '<small class="danger">lỗi</small>' : "<small>" + esc(f.summary) + (f.kind === "design" ? " · thiết kế" : f.proof === true ? " · ✓" : f.proof === false ? " · ✗" : "") + "</small>";
      return '<li data-file="' + i + '" class="' + (f.name === S.savedName ? "on" : "") + '" title="' + esc(f.name + (f.title ? " — " + f.title : "") + " · " + new Date(f.modified).toLocaleString()) + '"><span>' + esc(f.name.replace(LEVEL_EXT, "")) + "</span>" + badge + "</li>";
    }).join("");
  }
  $("#folderPanel").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-folder]");
    if (b) {
      if (b.dataset.folder === "pick") pickDir();
      else if (b.dataset.folder === "grant") ensureDir();
      else refreshLevels();
      return;
    }
    var li = ev.target.closest("li[data-file]"); if (!li) return;
    var f = S.levelFiles[+li.dataset.file]; if (!f) return;
    if (f.error) { toast(f.name + ": " + f.error); return; }
    var obj = JSON.parse(f.text);
    if (loadObject(obj, f.name)) {
      S.savedName = f.kind === "pack" ? f.name : null;   // a design file is saved next to it as a pack
      if (f.kind === "design") S.fileName = f.name;
      renderFolderPanel();
    }
  });

  $("#btnSave").addEventListener("click", function () { saveToFolder(); });
  $("#btnSaveAs").addEventListener("click", function () { saveToFolder({ saveAs: true }); });
  $("#btnSaveProof").addEventListener("click", saveWithProof);
  $("#btnExportDesign").addEventListener("click", exportDesign);
  $("#btnExportRuntime").addEventListener("click", exportRuntime);
  $("#btnOpen").addEventListener("click", function () { $("#fileInput").value = ""; $("#fileInput").click(); });
  $("#fileInput").addEventListener("change", function () { openFiles($("#fileInput").files); });
  document.addEventListener("dragover", function (ev) { ev.preventDefault(); });
  document.addEventListener("drop", function (ev) { ev.preventDefault(); if (ev.dataTransfer && ev.dataTransfer.files.length) openFiles(ev.dataTransfer.files); });
  function openFiles(files) {
    var list = Array.prototype.slice.call(files); if (!list.length) return;
    var loaded = [], pending = list.length;
    list.forEach(function (f) {
      var reader = new FileReader();
      reader.onload = function () { try { loaded.push({ name: f.name, obj: JSON.parse(reader.result) }); } catch (e) { toast(f.name + ": không phải JSON (" + e.message + ")"); } if (--pending === 0) done(); };
      reader.onerror = function () { if (--pending === 0) done(); };
      reader.readAsText(f);
    });
    function done() {
      loaded.forEach(function (l) { addRecent(l.name, l.obj); });
      if (loaded.length) loadObject(loaded[0].obj, loaded[0].name);
    }
  }
  function confirmDiscard() { return !S.doc || !S.doc.dirty || confirm("Bỏ các thay đổi chưa lưu?"); }
  function loadObject(obj, name) {
    if (!confirmDiscard()) return false;
    var kind = RR.Design.detectFormat(obj), data, meta = { name: "", author: "", notes: "" }, autoLink = false;
    try {
      if (kind === "design") { data = RR.Design.toLevel(obj).level; meta = { name: obj.name || "", author: obj.author || "", notes: obj.notes || "" }; autoLink = true; }
      else if (kind === "pack") { data = RR.json.clone(obj.runtime); meta = { name: obj.name || "", author: obj.author || "", notes: obj.notes || "" }; }
      else if (kind === "runtime") { data = RR.json.clone(obj); meta.name = "Level " + obj.levelId; }
      else throw new Error("Không nhận ra định dạng (cần .rrdesign.json, .rrpack.json hoặc Level*.json)");
    } catch (e) { toast((name || "file") + ": " + e.message); return false; }
    S.doc = new RR.Document(data); S.meta = meta; S.fileName = name || null; S.savedName = null; S.selection = null; S.group = [];
    S.autoLink = autoLink; $("#optAutoLink").checked = autoLink;
    S.solve.result = null; $("#solveSteps").innerHTML = ""; $("#solveResult").className = "hint"; $("#solveResult").textContent = "Chưa chạy.";
    $("#btnReplay").disabled = true;
    if (S.mode === "play") setMode("edit");
    changed(); fit(); renderFolderPanel();
    if (kind === "pack" && obj.proof && obj.proof.found) status("Gói có lời giải " + obj.proof.drags + " lần kéo (từ " + (obj.tool && obj.tool.version) + "). Chạy lại Tìm lời giải để xác nhận.");
    else status("Đã mở " + (name || "level") + (kind === "runtime" ? " — Tự nối pin đang tắt để giữ liên kết gốc." : ""));
    return true;
  }
  function newLevel() {
    if (!confirmDiscard()) return;
    S.doc = RR.Document.createNew("draft"); S.meta = { name: "", author: S.meta.author || storageGet("rr-designer.author") || "", notes: "" }; S.fileName = null; S.savedName = null; S.selection = null; S.group = [];
    S.autoLink = true; $("#optAutoLink").checked = true; S.solve.result = null; $("#solveSteps").innerHTML = ""; $("#btnReplay").disabled = true;
    $("#solveResult").className = "hint"; $("#solveResult").textContent = "Chưa chạy.";
    if (S.mode === "play") setMode("edit");
    changed(); fit(); setTool("ring"); renderFolderPanel();
  }
  $("#btnNew").addEventListener("click", newLevel);

  // ============================================================== campaign + recent list
  var recent = [];
  function addRecent(name, obj) { recent = recent.filter(function (r) { return r.name !== name; }); recent.unshift({ name: name, obj: obj }); recent = recent.slice(0, 20); renderCampaign(); }
  function renderCampaign() {
    var camp = window.RR_CAMPAIGN, items = [];
    recent.forEach(function (r, i) { items.push('<li data-recent="' + i + '"><span>' + esc(r.name) + "</span><small>file</small></li>"); });
    if (camp && camp.order) {
      $("#campaignHint").hidden = true; $("#campaignInfo").textContent = camp.order.length + " màn";
      camp.order.forEach(function (e) { items.push('<li data-level="' + esc(e.levelId) + '"><span>' + e.ordinal + ". Level" + esc(e.levelId) + "</span><small>" + esc(e.summary || "") + "</small></li>"); });
      (camp.unregistered || []).forEach(function (id) { items.push('<li data-level="' + esc(id) + '"><span>Level' + esc(id) + "</span><small>ngoài campaign</small></li>"); });
    }
    $("#campaignList").innerHTML = items.join("");
  }
  $("#campaignList").addEventListener("click", function (ev) {
    var li = ev.target.closest("li"); if (!li) return;
    if (li.dataset.recent != null) { var r = recent[+li.dataset.recent]; loadObject(r.obj, r.name); return; }
    var lvl = window.RR_CAMPAIGN && window.RR_CAMPAIGN.levels[li.dataset.level];
    if (lvl && loadObject(lvl, "Level" + li.dataset.level + ".json")) $all("#campaignList li").forEach(function (x) { x.classList.toggle("on", x === li); });
  });

  // ============================================================== 20-level overview (GD)
  // Source: the level folder opened in "Level của tôi" (sorted by file name), else the bundled campaign order.
  var GALLERY_PAGE = 20, gallery = { items: [], page: 0 };
  function galleryItems() {
    if (S.dirState === "ready" && S.levelFiles.length)
      return S.levelFiles.filter(function (f) { return !f.error; }).slice().sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true }); })
        .map(function (f) { return { label: f.title || f.name.replace(LEVEL_EXT, ""), file: f.name, text: f.text }; });
    var camp = window.RR_CAMPAIGN;
    if (camp && camp.order) return camp.order.map(function (e) { return { label: "Level" + e.levelId, obj: camp.levels[e.levelId] }; });
    return [];
  }
  function galleryLevel(item) {
    var obj = item.obj || JSON.parse(item.text), kind = RR.Design.detectFormat(obj);
    return kind === "pack" ? obj.runtime : kind === "design" ? RR.Design.toLevel(obj).level : obj;
  }
  function renderGallery() {
    var pages = Math.max(1, Math.ceil(gallery.items.length / GALLERY_PAGE)); gallery.page = Math.min(Math.max(gallery.page, 0), pages - 1);
    var from = gallery.page * GALLERY_PAGE, slice = gallery.items.slice(from, from + GALLERY_PAGE);
    $("#galleryGrid").innerHTML = slice.map(function (item, i) {
      var svg, id = "?";
      try { var level = galleryLevel(item); id = level.levelId; svg = RR.Render.render({ world: RR.World.build(level, { lenient: true }), level: level, labels: false, width: 300 }).replace(/rrShadow/g, "rrShadow-g" + i); }   // inline SVGs share one ID space: each thumbnail needs its own shadow filter region
      catch (e) { svg = '<span class="hint">Không vẽ được: ' + esc(e.message) + "</span>"; }
      return '<figure title="' + esc(item.file || item.label) + '"><figcaption><span>' + (from + i + 1) + ". " + esc(item.label) + "</span><small>ID " + esc(id) + '</small></figcaption><div class="thumb">' + svg + "</div></figure>";
    }).join("");
    $("#galleryGrid").scrollTop = 0;
    $("#galleryPage").textContent = "Trang " + (gallery.page + 1) + "/" + pages + " · level " + (slice.length ? from + 1 : 0) + "–" + (from + slice.length) + " / " + gallery.items.length;
    $("#galleryPrev").disabled = gallery.page === 0; $("#galleryNext").disabled = gallery.page >= pages - 1;
  }
  function openGallery() {
    gallery.items = galleryItems();
    if (!gallery.items.length) { toast("Chưa có level để xem: chọn thư mục ở \"Level của tôi\" (ví dụ ingame) hoặc tạo rr-campaign.js."); return; }
    $("#gallerySource").textContent = S.dirState === "ready" && S.levelFiles.length ? "Thư mục " + S.dir.name : "Campaign (rr-campaign.js)";
    gallery.page = 0; $("#gallery").hidden = false; renderGallery();
  }
  function galleryKey(ev) {
    if ($("#gallery").hidden) return false;
    if (ev.key === "ArrowLeft") { gallery.page--; renderGallery(); }
    else if (ev.key === "ArrowRight") { gallery.page++; renderGallery(); }
    else if (ev.key === "Escape") $("#gallery").hidden = true;
    ev.preventDefault(); return true;   // the editor shortcuts stay off while the overview is open
  }
  $("#btnGallery").addEventListener("click", openGallery);
  $("#galleryClose").addEventListener("click", function () { $("#gallery").hidden = true; });
  $("#galleryPrev").addEventListener("click", function () { gallery.page--; renderGallery(); });
  $("#galleryNext").addEventListener("click", function () { gallery.page++; renderGallery(); });

  // ============================================================== misc UI
  var toastTimer = 0;
  function toast(text) { var t = $("#toast"); t.textContent = text; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3200); }
  function status(text) { $("#status").textContent = text; }
  function statusCoords(p) {
    if (S.mode !== "edit") return;
    var h = pick(p), t = h ? (h.type === "pin" ? "pin của " + label(h.id) : h.type === "stop" ? "chốt của " + label(h.id) : label(h.id)) : "";
    $("#status").textContent = "x " + fmt(p.x, 2) + "  y " + fmt(p.y, 2) + (t ? "  ·  " + t : "") + (S.grid ? "" : "  ·  tự do");
  }
  function savePrefs() { storageSet(STORAGE_PREFS, JSON.stringify({ grid: S.grid, lattice: S.lattice, show: S.show, feel: S.feel, stickPreset: S.stickPreset })); }
  function loadPrefs() {
    try { var p = JSON.parse(storageGet(STORAGE_PREFS) || "null"); if (!p) return; S.grid = p.grid !== false; S.lattice = p.lattice || "square"; S.show = Object.assign(S.show, p.show || {}); S.feel = p.feel !== false; S.stickPreset = p.stickPreset || "straight"; } catch (e) { /* ignore */ }
    $("#optGrid").checked = S.grid; $("#latticeRow").style.display = S.grid ? "" : "none";
    $all("#lattice button").forEach(function (b) { b.classList.toggle("on", b.dataset.lattice === S.lattice); });
    $all("#stickPreset button").forEach(function (b) { b.classList.toggle("on", b.dataset.preset === S.stickPreset); });
    $("#optLabels").checked = S.show.labels; $("#optLinks").checked = S.show.links; $("#optPhone").checked = S.show.phone; $("#optDebug").checked = S.show.debug; $("#optFeel").checked = S.feel;
  }
  var autosaveTimer = 0;
  function autosave() { clearTimeout(autosaveTimer); autosaveTimer = setTimeout(function () { storageSet(STORAGE_DRAFT, JSON.stringify({ data: S.doc.data, meta: S.meta, fileName: S.fileName, savedName: S.savedName, at: Date.now() })); }, 400); }

  // ============================================================== boot
  function boot() {
    loadPrefs();
    var draft = null; try { draft = JSON.parse(storageGet(STORAGE_DRAFT) || "null"); } catch (e) { draft = null; }
    if (draft && draft.data && draft.data.parts && draft.data.parts.length) {
      S.doc = new RR.Document(draft.data); S.meta = draft.meta || S.meta; S.fileName = draft.fileName || null; S.savedName = draft.savedName || null; S.doc.dirty = true;
      status("Đã khôi phục bản nháp tự lưu lúc " + new Date(draft.at).toLocaleString());
    } else S.doc = RR.Document.createNew("draft");
    renderCampaign(); changed({ keepSolve: true }); setTool("select"); restoreDir();
    setTimeout(fit, 0);
  }
  window.RRApp = { state: S, loadObject: loadObject, fit: fit, setMode: setMode, setTool: setTool, setDir: setDir, refreshLevels: refreshLevels, saveToFolder: saveToFolder, setGroup: setGroup, select: select };
  boot();
})();

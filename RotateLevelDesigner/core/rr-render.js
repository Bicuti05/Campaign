// TURP designer core — SVG renderer (flat schematic in the style of the approved level mock-ups: cream board, glazed
// coloured rings with a soft highlight, pins in the owner's colour, dark pin walls, R1/R2 labels).
// Draws the COLLIDER shapes (what the simulation uses), not the 3D meshes. Works in Node and in the browser (returns a string).
(function (RR) {
  "use strict";
  var M = RR.M, V = M.V, D2R = RR.D2R, KIND = RR.KIND, W = RR.W;

  var THEME = { board: "#fbf1e0", label: "#6f6a62", wall: "#3f4b48", shadow: "rgba(90,70,40,0.16)", link: "#e0a020", linkIdle: "#9a9a9a", select: "#1d6fe0", danger: "#e5484d", ok: "#2f9e5a", grid: "rgba(120,100,70,0.13)" };

  function n(x) { return Math.round(x * 1000) / 1000; }
  function P(p) { return n(p.x) + "," + n(-p.y); }
  function poly(points) { return points.map(P).join(" "); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function rgb(c) { return RR.Color.css(c); }
  function mix(c, t, k) { return [c[0] + (t[0] - c[0]) * k, c[1] + (t[1] - c[1]) * k, c[2] + (t[2] - c[2]) * k]; }
  function arcPath(center, r, fromDeg, toDeg) {
    var span = toDeg - fromDeg;
    if (span >= 359.99) return "M " + P(V(center.x + r, center.y)) + " A " + n(r) + " " + n(r) + " 0 1 0 " + P(V(center.x - r, center.y)) + " A " + n(r) + " " + n(r) + " 0 1 0 " + P(V(center.x + r, center.y));
    var a = V(center.x + r * Math.cos(fromDeg * D2R), center.y + r * Math.sin(fromDeg * D2R)), b = V(center.x + r * Math.cos(toDeg * D2R), center.y + r * Math.sin(toDeg * D2R));
    // y is flipped on screen, so a counter-clockwise world arc is drawn with sweep-flag 0.
    return "M " + P(a) + " A " + n(r) + " " + n(r) + " 0 " + (span > 180 ? 1 : 0) + " 0 " + P(b);
  }

  // World bounds of everything drawable: { xMin, yMin, xMax, yMax }.
  function bounds(world) {
    var b = { xMin: Infinity, yMin: Infinity, xMax: -Infinity, yMax: -Infinity };
    function inc(p, r) { r = r || 0; b.xMin = Math.min(b.xMin, p.x - r); b.yMin = Math.min(b.yMin, p.y - r); b.xMax = Math.max(b.xMax, p.x + r); b.yMax = Math.max(b.yMax, p.y + r); }
    world.rings.forEach(function (r) { inc(r.center, r.bound); });
    world.sticks.forEach(function (s) { var bb = M.chainBounds(s.centerline, W.stickPose(s)); inc(V(bb.xMin, bb.yMin)); inc(V(bb.xMax, bb.yMax)); });
    world.guides.forEach(function (g) { g.wallQuads.forEach(function (q) { q.forEach(function (p) { inc(p); }); }); });
    world.bombs.forEach(function (bm) { inc(bm.center(), bm.radius); });
    if (!isFinite(b.xMin)) return { xMin: -5, yMin: -5, xMax: 5, yMax: 5 };
    return b;
  }

  function partColor(level, id) { var p = level.parts.find(function (q) { return q.partId === id; }); return p && p.color ? p.color : [0.6, 0.6, 0.6]; }

  // opts: { world (from RR.World.build or a Simulation), level, view: {xMin,yMin,xMax,yMax} | undefined (fit), width, height,
  //         labels, links (array from sim.snapshot().links or "design"), debug, selection: {id, feature}, flash: {id: color}, fade: {id: {alpha, dx, dy}},
  //         grid: {pitch, type}, phone: true, hidden: {id: true}, title }
  function render(opts) {
    var world = opts.world, level = opts.level, out = [], view = opts.view || pad(bounds(world), 1.6), fade = opts.fade || {}, flash = opts.flash || {}, sel = opts.selection || {};
    var w = view.xMax - view.xMin, h = view.yMax - view.yMin, kinds = {}, selIds = opts.selectedIds || {};
    function isSel(id) { return sel.id === id || !!selIds[id]; }
    level.parts.forEach(function (p) { kinds[p.partId] = p.kind; });
    var attrs = 'xmlns="http://www.w3.org/2000/svg" viewBox="' + n(view.xMin) + " " + n(-view.yMax) + " " + n(w) + " " + n(h) + '"' + (opts.width ? ' width="' + opts.width + '"' : "") + (opts.height ? ' height="' + opts.height + '"' : "");
    out.push("<svg " + attrs + ' font-family="Segoe UI, Roboto, Arial, sans-serif">');
    if (opts.title) out.push("<title>" + esc(opts.title) + "</title>");
    out.push('<defs><filter id="rrShadow" filterUnits="userSpaceOnUse" x="' + n(view.xMin) + '" y="' + n(-view.yMax) + '" width="' + n(w) + '" height="' + n(h) + '"><feGaussianBlur in="SourceAlpha" stdDeviation="0.12"/><feOffset dx="0.06" dy="0.12"/><feComponentTransfer><feFuncA type="linear" slope="0.28"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>');
    out.push('<rect x="' + n(view.xMin) + '" y="' + n(-view.yMax) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + THEME.board + '"/>');
    if (opts.grid) out.push(gridLines(view, opts.grid));
    if (opts.phone) out.push(phoneFrame(bounds(world)));

    function fadeAttr(id) {
      var f = fade[id]; if (!f) return "";
      return ' opacity="' + n(f.alpha) + '"' + (f.dx || f.dy ? ' transform="translate(' + n(f.dx || 0) + "," + n(-(f.dy || 0)) + ')"' : "");
    }
    function hidden(id) { return opts.hidden && opts.hidden[id]; }

    // Guides (catches): faint trigger box, dark walls.
    world.guides.forEach(function (g) {
      if (!g.active || hidden(g.id)) return;
      out.push('<g data-id="' + esc(g.id) + '"' + fadeAttr(g.stickId) + '>');
      out.push('<polygon points="' + poly(g.triggerQuad) + '" fill="rgba(63,75,72,0.10)" stroke="rgba(63,75,72,0.35)" stroke-width="0.03"/>');
      g.wallQuads.forEach(function (q) { out.push('<polygon points="' + poly(q) + '" fill="' + THEME.wall + '"/>'); });
      if (isSel(g.id)) out.push('<polygon points="' + poly(g.triggerQuad) + '" fill="none" stroke="' + THEME.select + '" stroke-width="0.08"/>');
      out.push("</g>");
    });

    // Sticks: capsule chain of the collider centre line.
    world.sticks.forEach(function (s) {
      if (!s.active || hidden(s.id)) return;
      var pose = W.stickPose(s), pts = M.clSample(s.centerline, 0.2).map(function (p) { return M.poseToWorld(pose, p); }), col = partColor(level, s.id);
      var d = "M " + pts.map(P).join(" L ");
      out.push('<g data-id="' + esc(s.id) + '"' + fadeAttr(s.id) + ' filter="url(#rrShadow)">');
      if (flash[s.id]) out.push('<path d="' + d + '" fill="none" stroke="' + flash[s.id] + '" stroke-width="' + n(s.centerline.tube * 2 + 0.3) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>');
      if (isSel(s.id)) out.push('<path d="' + d + '" fill="none" stroke="' + THEME.select + '" stroke-width="' + n(s.centerline.tube * 2 + 0.22) + '" stroke-linecap="round" stroke-linejoin="round"/>');
      out.push('<path d="' + d + '" fill="none" stroke="' + rgb(col) + '" stroke-width="' + n(s.centerline.tube * 2) + '" stroke-linecap="round" stroke-linejoin="round"/>');
      out.push('<path d="' + d + '" fill="none" stroke="' + rgb(mix(col, [1, 1, 1], 0.55)) + '" stroke-width="0.07" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>');
      out.push("</g>");
      if (opts.debug) out.push('<polygon points="' + poly(s.bodyLocal.map(function (p) { return M.poseToWorld(pose, p); })) + '" fill="none" stroke="#0a0" stroke-width="0.02"/>');
      if (opts.axes) { var ax = W.stickAxis(s), c = M.poseToWorld(pose, V(0, 0)); out.push('<line x1="' + n(c.x - ax.x * 0.9) + '" y1="' + n(-(c.y - ax.y * 0.9)) + '" x2="' + n(c.x + ax.x * 0.9) + '" y2="' + n(-(c.y + ax.y * 0.9)) + '" stroke="' + (s.axisError ? THEME.danger : "#444") + '" stroke-width="0.05" stroke-dasharray="0.15 0.1" marker-end=""/>'); }
    });

    // Rings: body, stop-pins, pin stems and walls.
    world.rings.forEach(function (r) {
      if (!r.active || hidden(r.id)) return;
      var col = partColor(level, r.id), arc = r.arc, bandW = arc.tube * 2;
      var d = arc.closed ? arcPath(arc.center, arc.radius, 0, 360) : arcPath(arc.center, arc.radius, arc.startDeg, arc.endDeg);
      out.push('<g data-id="' + esc(r.id) + '"' + fadeAttr(r.id) + '>');
      out.push('<g filter="url(#rrShadow)">');
      if (flash[r.id]) out.push('<path d="' + d + '" fill="none" stroke="' + flash[r.id] + '" stroke-width="' + n(bandW + 0.32) + '" stroke-linecap="round" opacity="0.55"/>');
      if (isSel(r.id) && !(sel.id === r.id && sel.feature)) out.push('<path d="' + d + '" fill="none" stroke="' + THEME.select + '" stroke-width="' + n(bandW + 0.22) + '" stroke-linecap="round"/>');
      out.push('<path d="' + d + '" fill="none" stroke="' + rgb(col) + '" stroke-width="' + n(bandW) + '" stroke-linecap="round"/>');
      // stop-pins (solid bars in the ring colour)
      r.worldQuads.forEach(function (q, i) { if (r.quadKind[i] === KIND.STOP) out.push('<polygon points="' + poly(q) + '" fill="' + rgb(mix(col, [0, 0, 0], 0.08)) + '" stroke="' + rgb(mix(col, [0, 0, 0], 0.25)) + '" stroke-width="0.03"/>'); });
      // pin stems (owner colour)
      for (var a = 0; a < r.attachmentWorldPaths.length; a += 2) {
        var featureSel = sel.id === r.id && sel.feature === r.pinFeatures[a / 2];
        out.push('<polygon data-pin="' + esc(r.pinFeatures[a / 2]) + '" points="' + poly(r.attachmentWorldPaths[a]) + '" fill="' + rgb(mix(col, [0, 0, 0], 0.06)) + '"' + (featureSel ? ' stroke="' + THEME.select + '" stroke-width="0.09"' : "") + "/>");
      }
      out.push("</g>");
      out.push('<path d="' + d + '" fill="none" stroke="' + rgb(mix(col, [1, 1, 1], 0.6)) + '" stroke-width="0.07" stroke-linecap="round" opacity="0.75"/>');
      // pin walls (the two dark bars that sit across the threaded body)
      r.worldQuads.forEach(function (q, i) {
        if (r.quadKind[i] === KIND.WALL) out.push('<polygon points="' + poly(q) + '" fill="' + THEME.wall + '"/>');
        if (opts.debug && r.quadKind[i] === KIND.SENSOR) out.push('<polygon points="' + poly(q) + '" fill="rgba(0,160,255,0.15)" stroke="rgba(0,120,220,0.6)" stroke-width="0.02"/>');
        if (opts.debug && r.quadKind[i] === KIND.HARD) out.push('<polygon points="' + poly(q) + '" fill="none" stroke="#c00" stroke-width="0.02"/>');
      });
      out.push("</g>");
    });

    // Chain (LockCount), number of solves still needed. opts.lockCounts (play mode, live) overrides the authored lockCount.
    // Ring: three grey diameters at 0/60/120 degrees with the count above the ring; drawn before the Fish so a Fish stays on top.
    // Stick: the lock badge with the count.
    level.parts.forEach(function (p) {
      var cnt = opts.lockCounts && opts.lockCounts[p.partId] !== undefined ? opts.lockCounts[p.partId] : (p.lockCount || 0), o = world.objectIndexById[p.partId];
      if (!(cnt > 0) || o === undefined || hidden(p.partId)) return;
      if (world.isStickObject(o)) {
        var st = world.stickOf(o); if (!st.active) return; var c = M.poseToWorld(W.stickPose(st), V(0, 0));
        out.push('<g data-id="' + esc(p.partId) + '" pointer-events="none"><circle cx="' + n(c.x) + '" cy="' + n(-c.y) + '" r="0.42" fill="#6b7280" stroke="#e5e7eb" stroke-width="0.07"/>' +
          '<text x="' + n(c.x) + '" y="' + n(-c.y + 0.16) + '" text-anchor="middle" font-size="0.5" font-weight="700" fill="#fff">' + cnt + "</text></g>");
        return;
      }
      var rg = world.rings[o]; if (!rg.active) return;
      var rc = rg.arc.center, R = rg.outer, g = ['<g data-id="' + esc(p.partId) + '" pointer-events="none" stroke="#7d828a" stroke-width="0.14" stroke-linecap="round" opacity="0.9">'];
      [0, 60, 120].forEach(function (a) {
        var dx = R * Math.cos(a * Math.PI / 180), dy = R * Math.sin(a * Math.PI / 180);
        g.push('<line x1="' + n(rc.x - dx) + '" y1="' + n(-(rc.y - dy)) + '" x2="' + n(rc.x + dx) + '" y2="' + n(-(rc.y + dy)) + '"/>');
      });
      g.push('<text x="' + n(rc.x) + '" y="' + n(-(rc.y + R) - 0.3) + '" stroke="none" text-anchor="middle" font-size="0.55" font-weight="700" fill="#5b6068">' + cnt + "</text></g>");
      out.push(g.join(""));
    });
    // Challenge Fish (canCollect): orange disc at the ring centre, above the chain lines, shown with or without labels.
    var fish = {}; ((opts.level && opts.level.parts) || []).forEach(function (p) { if (p.canCollect) fish[p.partId] = true; });
    world.rings.forEach(function (r) { if (r.active && !hidden(r.id) && fish[r.id]) out.push('<circle cx="' + n(r.center.x) + '" cy="' + n(-r.center.y) + '" r="0.42" fill="#ff9f43" stroke="#c0611a" stroke-width="0.05"' + fadeAttr(r.id) + "/>"); });

    // Bombs.
    world.bombs.forEach(function (b) {
      if (!b.active || hidden(b.id)) return;
      var c = b.center(), hostId = b.host >= 0 ? world.idOf(b.host) : null;
      out.push('<g data-id="' + esc(b.id) + '"' + (hostId ? fadeAttr(hostId) : "") + '>');
      out.push('<circle cx="' + n(c.x) + '" cy="' + n(-c.y) + '" r="' + n(b.radius) + '" fill="#2f3437" stroke="' + (isSel(b.id) ? THEME.select : "#e5484d") + '" stroke-width="' + (isSel(b.id) ? 0.12 : 0.07) + '"/>');
      out.push('<circle cx="' + n(c.x - b.radius * 0.3) + '" cy="' + n(-(c.y + b.radius * 0.3)) + '" r="' + n(b.radius * 0.22) + '" fill="rgba(255,255,255,0.35)"/>');
      out.push('<path d="M ' + n(c.x + b.radius * 0.5) + " " + n(-(c.y + b.radius * 0.5)) + " q " + n(b.radius * 0.35) + " " + n(-b.radius * 0.35) + " " + n(b.radius * 0.55) + ' 0" fill="none" stroke="#f0a020" stroke-width="0.08" stroke-linecap="round"/>');
      out.push("</g>");
    });

    // Link overlay.
    if (opts.links) {
      out.push('<g pointer-events="none">');
      opts.links.forEach(function (l) {
        var si = world.indexById[l.source], ti = world.objectIndexById[l.target]; if (si === undefined || ti === undefined) return;
        var s = world.rings[si]; if (!s.active) return;
        var tc = world.isStickObject(ti) ? M.poseToWorld(W.stickPose(world.stickOf(ti)), V(0, 0)) : world.rings[ti].center;
        if (world.isStickObject(ti) ? !world.stickOf(ti).active : !world.rings[ti].active) return;
        var pi = s.pinFeatures.indexOf(l.pin), from = s.center;
        if (pi >= 0) { var q = s.attachmentWorldPaths[pi * 2]; from = M.mul(M.add(q[0], q[2]), 0.5); }
        var col = l.active ? THEME.link : THEME.linkIdle;
        out.push('<line x1="' + n(from.x) + '" y1="' + n(-from.y) + '" x2="' + n(tc.x) + '" y2="' + n(-tc.y) + '" stroke="' + col + '" stroke-width="0.07" stroke-dasharray="' + (l.active ? "none" : "0.2 0.15") + '" opacity="0.9"/>');
        out.push('<circle cx="' + n(tc.x) + '" cy="' + n(-tc.y) + '" r="0.12" fill="' + col + '"/>');
      });
      out.push("</g>");
    }

    // Labels.
    if (opts.labels !== false) {
      out.push('<g pointer-events="none" text-anchor="middle" dominant-baseline="central" fill="' + THEME.label + '">');
      world.rings.forEach(function (r) { if (r.active && !hidden(r.id)) out.push('<text x="' + n(r.center.x) + '" y="' + n(-r.center.y) + '" font-size="0.5"' + fadeAttr(r.id) + ">" + esc(RR.labelOf(r.id, "ring")) + "</text>"); });
      world.sticks.forEach(function (s) {
        if (!s.active || hidden(s.id)) return;
        var pose = W.stickPose(s), pts = M.clSample(s.centerline, 0.2), mid = M.poseToWorld(pose, pts[Math.floor(pts.length / 2)]);
        out.push('<text x="' + n(mid.x) + '" y="' + n(-mid.y) + '" font-size="0.34" fill="#fff" font-weight="600"' + fadeAttr(s.id) + ">" + esc(RR.labelOf(s.id, "stick")) + "</text>");
      });
      out.push("</g>");
    }
    if (opts.overlay) out.push(opts.overlay);
    out.push("</svg>");
    return out.join("");
  }
  function pad(b, m) { return { xMin: b.xMin - m, yMin: b.yMin - m, xMax: b.xMax + m, yMax: b.yMax + m }; }
  function gridLines(view, grid) {
    var p = grid.pitch, out = ['<g stroke="' + THEME.grid + '" stroke-width="0.03" fill="' + THEME.grid + '">'], x, y;
    if (grid.type === "hex") {
      var dy = p * Math.sqrt(3) / 2, row0 = Math.floor(view.yMin / dy) - 1, row1 = Math.ceil(view.yMax / dy) + 1;
      for (var r = row0; r <= row1; r++) {
        var off = (r & 1) ? p / 2 : 0;
        for (x = Math.floor((view.xMin - off) / p) * p + off; x <= view.xMax + p; x += p) out.push('<circle cx="' + n(x) + '" cy="' + n(-r * dy) + '" r="0.07"/>');
      }
    } else {
      var s = grid.step || p / 2;
      for (x = Math.floor(view.xMin / s) * s; x <= view.xMax; x += s) out.push('<line x1="' + n(x) + '" y1="' + n(-view.yMax) + '" x2="' + n(x) + '" y2="' + n(-view.yMin) + '"' + (Math.abs(x / p - Math.round(x / p)) < 1e-6 ? ' stroke-width="0.05"' : "") + "/>");
      for (y = Math.floor(view.yMin / s) * s; y <= view.yMax; y += s) out.push('<line x1="' + n(view.xMin) + '" y1="' + n(-y) + '" x2="' + n(view.xMax) + '" y2="' + n(-y) + '"' + (Math.abs(y / p - Math.round(y / p)) < 1e-6 ? ' stroke-width="0.05"' : "") + "/>");
    }
    out.push("</g>");
    return out.join("");
  }
  // Portrait 9:16 frame around the level bounds (a reading aid; the game fits the board into its own viewport).
  function phoneFrame(b) {
    var cx = (b.xMin + b.xMax) / 2, cy = (b.yMin + b.yMax) / 2, w = b.xMax - b.xMin + 1, h = b.yMax - b.yMin + 1;
    if (w / h > 9 / 16) h = w * 16 / 9; else w = h * 9 / 16;
    return '<rect x="' + n(cx - w / 2) + '" y="' + n(-(cy + h / 2)) + '" width="' + n(w) + '" height="' + n(h) + '" rx="0.8" fill="none" stroke="rgba(60,60,60,0.35)" stroke-width="0.06" stroke-dasharray="0.4 0.25"/>';
  }

  RR.Render = { render: render, bounds: bounds, pad: pad, THEME: THEME };
})(typeof module === "object" && module.exports ? require("./rr-ns.js") : (self.RR = self.RR || {}));

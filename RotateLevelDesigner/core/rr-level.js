// TURP designer core — runtime level data (schema v1): validator, baked-geometry builder, editable document,
// conversion to/from the compact design format (turp-design v1) and designer warnings.
// Ports: LevelDefinition.cs (RotateLevelValidator), BoardState.LoadLevel checks, RotateLevelBuilder.cs, RotateLevelDocument.cs.
(function (RR) {
  "use strict";
  var M = RR.M, V = M.V, D2R = RR.D2R, R2D = RR.R2D, KIND = RR.KIND;
  var C = RR.C, A = C.authoring;

  // =====================================================================================================
  // JSON output: numbers are written as the shortest text that round-trips the float32 value (like Unity/Newtonsoft).
  // =====================================================================================================
  function f32(x) {
    if (typeof x !== "number" || !isFinite(x) || Number.isInteger(x)) return x;
    var target = Math.fround(x);
    for (var p = 6; p <= 9; p++) { var v = Number(x.toPrecision(p)); if (Math.fround(v) === target) return v; }
    return Number(target.toPrecision(9));
  }
  function toJson(obj, indent) { return JSON.stringify(obj, function (k, v) { return typeof v === "number" ? f32(v) : v; }, indent === undefined ? 2 : indent); }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  // =====================================================================================================
  // Validator (RotateLevelValidator.Validate) — throws Error(message) on the first problem, like the C# ArgumentException.
  // =====================================================================================================
  function require_(value, message) { if (!value) throw new Error(message); }
  function finite(f) { return typeof f === "number" && isFinite(f); }
  function vector(v, count, label) { require_(Array.isArray(v) && v.length === count && v.every(finite), label + ": missing/nonfinite components"); }
  function has(v) { return v !== null && v !== undefined; }
  function optionalFinite(v, label) { if (has(v)) require_(finite(v), label + ": nonfinite"); }
  function optionalNonNegative(v, label) { if (has(v)) require_(finite(v) && v >= 0, label + ": invalid"); }
  function requireOwnedTransform(id, owner, transforms, label) {
    require_(id != null && transforms[id], "Missing " + label + " transform");
    var anc = id; while (anc != null && anc !== owner.transformId) anc = transforms[anc].parentId;
    require_(anc === owner.transformId, label + " is not a child of owner");
  }
  function validatePolygon(points, label) { require_(Array.isArray(points) && points.length >= 3, label + ": needs at least 3 points"); points.forEach(function (pt) { vector(pt, 2, label + " point"); }); }
  function validateBox(box, label) { require_(box != null, label + ": missing"); vector(box.center, 2, label + " centre"); vector(box.size, 2, label + " size"); require_(box.size[0] > 0 && box.size[1] > 0, label + ": size must be positive"); }
  function isStickBendFeature(part, feature) {
    var prefix = "attachment.bent_", suffix = ".solid";
    if (!feature || feature.indexOf(prefix) !== 0 || feature.slice(-suffix.length) !== suffix) return false;
    var ord = feature.substring(prefix.length, feature.length - suffix.length), n = parseInt(ord, 10);
    return /^\d+$/.test(ord) && n > 0 && String(n) === ord && part.pathPoints && part.pathPoints.length > 2;
  }
  function validateStructure(d) {
    require_(d != null, "Missing level");
    require_(d.version === 1, "Unsupported schema version");
    require_(d.levelId != null && String(d.levelId).trim() !== "", "Missing levelId");
    require_(Array.isArray(d.transforms) && d.transforms.length > 0, "Missing transforms");
    require_(Array.isArray(d.parts) && d.parts.length > 0, "Missing parts");
    require_(Array.isArray(d.links), "Missing links (use empty array)");
    var transforms = {}, parts = {};
    d.transforms.forEach(function (t) {
      require_(t && t.transformId && String(t.transformId).trim() !== "", "Missing transform ID");
      require_(!transforms[t.transformId], "Duplicate transform: " + t.transformId);
      transforms[t.transformId] = t;
      vector(t.localPosition, 3, t.transformId + " position"); vector(t.localRotation, 4, t.transformId + " quaternion xyzw"); vector(t.localScale, 3, t.transformId + " scale");
      require_(t.localRotation.reduce(function (s, x) { return s + x * x; }, 0) > 0.000001, "Zero quaternion");
      require_(t.localScale.every(function (x) { return x !== 0; }), "Zero scale");
    });
    d.transforms.forEach(function (t) {
      var visited = {}; visited[t.transformId] = true; var parent = t.parentId;
      while (parent) { require_(transforms[parent], "Missing parent: " + parent); require_(!visited[parent], "Transform cycle"); visited[parent] = true; parent = transforms[parent].parentId; }
    });
    d.parts.forEach(function (p) {
      require_(p && p.partId && String(p.partId).trim() !== "", "Missing partId");
      require_(!parts[p.partId], "Duplicate part: " + p.partId);
      parts[p.partId] = p;
      require_(["ring", "stick", "guide", "bomb"].indexOf(p.kind) >= 0, "Unsupported part kind: " + p.kind);
      require_(p.transformId != null && transforms[p.transformId], "Missing part transform");
      require_((p.lockCount || 0) >= 0, "Negative lockCount");
      require_(!p.canCollect || p.kind === "ring", "canCollect is only allowed on a ring");
      if (p.kind !== "ring") { validateNonRing(p); return; }
      require_(finite(p.logicGapDegrees) && p.logicGapDegrees >= 0 && p.logicGapDegrees <= 360, "Missing/invalid logic gap");
      require_(finite(p.meshGapDegrees) && p.meshGapDegrees >= 0 && p.meshGapDegrees <= 360, "Missing/invalid mesh gap");
      require_(finite(p.meshGapDirection), "Missing mesh gap direction");
      require_(finite(p.radius) && p.radius > 0, "Missing/invalid radius");
      require_(finite(p.width) && p.width > 0 && p.width < p.radius * 2, "Missing/invalid width");
      vector(p.color, 4, "color");
      require_(has(p.colliderInnerRadius) === has(p.colliderOuterRadius), "Collider radii must come as a pair");
      if (has(p.colliderInnerRadius)) require_(finite(p.colliderInnerRadius) && finite(p.colliderOuterRadius) && p.colliderInnerRadius > 0 && p.colliderInnerRadius < p.colliderOuterRadius, "Invalid collider radii");
      require_(has(p.dragAreaInnerRadius) === has(p.dragAreaOuterRadius), "Drag area radii must come as a pair");
      if (has(p.dragAreaInnerRadius)) require_(finite(p.dragAreaInnerRadius) && finite(p.dragAreaOuterRadius) && p.dragAreaInnerRadius >= 0 && p.dragAreaInnerRadius < p.dragAreaOuterRadius, "Invalid drag area radii");
      if (has(p.dragAreaPaths)) { require_(p.dragAreaPaths.length > 0, "Empty ring drag paths"); p.dragAreaPaths.forEach(function (path) { validatePolygon(path, "ring drag path"); }); }
      require_(Array.isArray(p.pins), "Missing pins");
      var features = {};
      p.pins.forEach(function (pin) {
        require_(pin && pin.featureId && !features[pin.featureId], "Missing/duplicate pin ID"); features[pin.featureId] = true;
        requireOwnedTransform(pin.transformId, p, transforms, "pin");
        optionalFinite(pin.angleDegrees, "pin angle"); optionalNonNegative(pin.stemWidth, "stemWidth"); optionalNonNegative(pin.stemLength, "stemLength");
        optionalNonNegative(pin.stemInsertOffset, "stemInsertOffset"); optionalNonNegative(pin.crossWidth, "crossWidth"); optionalNonNegative(pin.crossLength, "crossLength");
        var any = has(pin.sensorSize) || has(pin.wallSize) || has(pin.wallOffsetX) || has(pin.hardBlockPoints);
        if (!any) return;
        require_(has(pin.sensorSize) && has(pin.wallSize) && has(pin.wallOffsetX) && has(pin.hardBlockPoints), "Pin collider data must be complete");
        vector(pin.sensorSize, 2, "sensorSize"); vector(pin.wallSize, 2, "wallSize");
        require_(pin.sensorSize.every(function (x) { return x > 0; }) && pin.wallSize.every(function (x) { return x > 0; }), "Pin collider sizes must be positive");
        require_(finite(pin.wallOffsetX) && pin.wallOffsetX >= 0, "Invalid wallOffsetX");
        require_(pin.hardBlockPoints.length >= 3, "Hard block needs at least 3 points");
        pin.hardBlockPoints.forEach(function (pt) { vector(pt, 2, "hardBlock point"); });
      });
      (p.stopPins || []).forEach(function (stop) {
        require_(stop && stop.featureId && !features[stop.featureId], "Missing/duplicate stop-pin ID"); features[stop.featureId] = true;
        requireOwnedTransform(stop.transformId, p, transforms, "stop-pin");
        optionalFinite(stop.angleDegrees, "stop-pin angle");
        if (has(stop.hardBlockPoints)) validatePolygon(stop.hardBlockPoints, "stop-pin");
      });
    });
    d.parts.filter(function (x) { return x.kind === "bomb"; }).forEach(function (p) {
      if (has(p.bombRadius)) require_(finite(p.bombRadius) && p.bombRadius > 0, "Invalid bomb radius");
      if (has(p.bombOffset)) vector(p.bombOffset, 2, "bomb offset");
      if (p.hostPartId != null) {
        require_(parts[p.hostPartId], "Bomb host missing: " + p.hostPartId);
        require_(parts[p.hostPartId].kind === "ring" || parts[p.hostPartId].kind === "stick", "Bomb host must be ring or stick");
        requireOwnedTransform(p.transformId, parts[p.hostPartId], transforms, "bomb");
      }
    });
    var links = {};
    d.links.forEach(function (l) {
      require_(l && l.sourcePartId != null && l.targetPartId != null, "Missing link fields");
      require_(parts[l.sourcePartId] && parts[l.targetPartId], "Dangling link part");
      require_((parts[l.sourcePartId].pins || []).some(function (p) { return p.featureId === l.sourceFeatureId; }), "Dangling link pin");
      require_(parts[l.sourcePartId].kind === "ring", "Link source must be a ring");
      if (parts[l.targetPartId].kind === "ring") require_(l.targetFeatureId === "body", "Unsupported target feature");
      else require_(parts[l.targetPartId].kind === "stick" && (l.targetFeatureId === "body" || l.targetFeatureId === "attachment.bent" || isStickBendFeature(parts[l.targetPartId], l.targetFeatureId)), "Unsupported link target");
      require_(l.sourcePartId !== l.targetPartId, "Self link");
      var key = l.sourcePartId + "/" + l.sourceFeatureId + "/" + l.targetPartId + "/" + l.targetFeatureId;
      require_(!links[key], "Duplicate link"); links[key] = true;
    });
    if (d.guideLinks != null) {
      var guides = {};
      d.guideLinks.forEach(function (g) {
        require_(g && g.guidePartId != null && g.stickPartId != null, "Missing guide link fields");
        require_(parts[g.guidePartId] && parts[g.guidePartId].kind === "guide", "Guide link needs a guide part");
        require_(parts[g.stickPartId] && parts[g.stickPartId].kind === "stick", "Guide link needs a stick part");
        require_(!guides[g.guidePartId], "Guide linked to more than one stick"); guides[g.guidePartId] = true;
      });
    }
  }
  function validateNonRing(p) {
    if (p.kind === "guide") {
      require_(has(p.guideTrigger) || !has(p.guideWalls), "Guide walls without a trigger");
      if (has(p.guideTrigger)) { validateBox(p.guideTrigger, "guide trigger"); require_(has(p.guideWalls), "Guide collider data must be complete"); p.guideWalls.forEach(function (w) { validateBox(w, "guide wall"); }); }
      return;
    }
    if (p.kind !== "stick") return;
    require_(Array.isArray(p.pathPoints) && p.pathPoints.length >= 2, "Stick needs at least 2 path points");
    p.pathPoints.forEach(function (pt) { vector(pt, 2, "stick path point"); });
    if (has(p.localSlideAxis)) { vector(p.localSlideAxis, 2, "stick localSlideAxis"); require_(p.localSlideAxis.some(function (v) { return v !== 0; }), "Zero stick localSlideAxis"); }
    require_(finite(p.width) && p.width > 0, "Missing/invalid stick width");
    optionalNonNegative(p.cornerRadius, "cornerRadius");
    var any = has(p.colliderHalfWidth) || has(p.colliderEndInset) || has(p.colliderPoints) || has(p.dragAreaPoints);
    if (!any) return;
    require_(has(p.colliderHalfWidth) && has(p.colliderEndInset) && has(p.colliderPoints) && has(p.dragAreaPoints), "Stick collider data must be complete");
    require_(finite(p.colliderHalfWidth) && p.colliderHalfWidth > 0 && finite(p.colliderEndInset) && p.colliderEndInset >= 0, "Invalid stick collider numbers");
    validatePolygon(p.colliderPoints, "stick collider"); validatePolygon(p.dragAreaPoints, "stick drag area");
  }

  // Structure validator + the runtime load checks of BoardState.LoadLevel + building the simulation. Returns null when the game would accept it.
  function validate(level, tuning) {
    tuning = tuning || RR.Tuning.defaults();
    try { validateStructure(level); } catch (e) { return "InvalidData: " + e.message; }
    if (!tuning.isHaveBomb && level.parts.some(function (p) { return p.kind === "bomb" || p.hasBomb; })) return "UnsupportedContent: bombs are disabled";
    try { new RR.Simulation(level, tuning); } catch (e2) { return (/not supported/.test(e2.message) ? "UnsupportedContent: " : "InvalidData: ") + e2.message; }
    return null;
  }

  // =====================================================================================================
  // Builder (RotateLevelBuilder): baked geometry the runtime requires, in part-local space.
  // =====================================================================================================
  function pt(v) { return [v.x, v.y]; }
  function quat(angleDegrees) { var h = angleDegrees * D2R * 0.5; return [0, 0, Math.sin(h), Math.cos(h)]; }
  function angleOf(q) { return 2 * Math.atan2(q[2], q[3]) * R2D; }
  function meshGapFor(logicGap, radius) { return logicGap <= 0 ? 0 : Math.max(0, logicGap - 2 * Math.asin(Math.min(1, A.RING_BAND_HALF / radius)) * R2D); }
  function arcPoints(r, from, to, includeEnd) {
    var span = Math.abs(to - from), n = Math.max(3, Math.ceil(span / A.DRAG_ARC_STEP_DEGREES)), list = [];
    for (var i = 0; i <= n; i++) { if (!includeEnd && i === n) break; var a = M.lerp(from, to, i / n) * D2R; list.push([r * Math.cos(a), r * Math.sin(a)]); }
    return list;
  }
  function ringDragPaths(radius, logicGap) {
    var outer = radius + A.RING_DRAG_MARGIN, inner = radius - A.RING_DRAG_MARGIN;
    if (logicGap <= 0.01) return [arcPoints(outer, 0, 360, false), arcPoints(inner, 0, 360, false)];
    var half = logicGap * 0.5;
    return [arcPoints(outer, half, 360 - half, true).concat(arcPoints(inner, 360 - half, half, true))];
  }
  function applyRingGeometry(ring, radius, logicGap) {
    ring.radius = radius; ring.logicGapDegrees = logicGap; ring.meshGapDegrees = meshGapFor(logicGap, radius); ring.meshGapDirection = 0;
    ring.colliderInnerRadius = radius - A.RING_BAND_HALF; ring.colliderOuterRadius = radius + A.RING_BAND_HALF;
    ring.dragAreaInnerRadius = radius - A.RING_DRAG_MARGIN; ring.dragAreaOuterRadius = radius + A.RING_DRAG_MARGIN;
    ring.dragAreaPaths = ringDragPaths(radius, logicGap);
  }
  // Pin length = distance from the owner's outer edge to the pin head centre (the pin transform). Default PIN_OFFSET_FROM_OUTER.
  // The visible stem (hard block) grows with it and keeps its overlap with the head walls. Mirrored in RotateLevelBuilder.
  var MIN_PIN_LENGTH = 0.45, MAX_PIN_LENGTH = 8;
  function clampPinLength(offset) { return offset == null || !isFinite(offset) ? A.PIN_OFFSET_FROM_OUTER : Math.min(MAX_PIN_LENGTH, Math.max(MIN_PIN_LENGTH, offset)); }
  function pinDistance(ring, offset) { return ring.colliderOuterRadius + clampPinLength(offset); }
  function pinLocalPosition(ring, angle, offset) { return M.rot(V(pinDistance(ring, offset), 0), angle); }
  function applyPinGeometry(pin, ring, angle, offset) {
    var L = Math.max(0.2, A.PIN_HARD_BLOCK_LENGTH + clampPinLength(offset) - A.PIN_OFFSET_FROM_OUTER), H = A.PIN_HARD_BLOCK_HALF, outer = ring.colliderOuterRadius;
    var raw = [V(outer, -H), V(outer + L, -H), V(outer + L, H), V(outer, H)];
    pin.hardBlockPoints = raw.map(function (v) { return pt(M.rot(v, angle)); });
    pin.angleDegrees = angle; pin.isInnerMount = false;
    pin.stemWidth = A.PIN_STEM_WIDTH; pin.stemLength = A.PIN_STEM_LENGTH; pin.stemInsertOffset = A.PIN_STEM_INSERT;
    pin.crossWidth = A.PIN_CROSS_WIDTH; pin.crossLength = A.PIN_CROSS_LENGTH;
    pin.sensorSize = [A.PIN_SENSOR_X, A.PIN_SENSOR_Y]; pin.wallSize = [A.PIN_WALL_X, A.PIN_WALL_Y]; pin.wallOffsetX = A.PIN_WALL_OFFSET_X;
  }
  // Inner-mounted pin: rooted on the owner's inner edge and pointing towards the centre (into a ring/bar that lies inside the owner).
  // bearing = ring-local direction from the centre to the pin head; depth = inner collider edge -> head centre (MIN_INNER_PIN_DEPTH ..
  // colliderInnerRadius - 0.05). Geometry mirrors RotateCompactLayout.ConfigureInnerPin in Unity (transform rotated bearing + 180,
  // angleDegrees = bearing + 180, 0.5-long hard block inside the inner edge, stem at least the head depth).
  var MIN_INNER_PIN_DEPTH = 0.2;
  function clampInnerDepth(ring, depth) {
    var max = Math.max(MIN_INNER_PIN_DEPTH, ring.colliderInnerRadius - 0.05);
    return depth == null || !isFinite(depth) ? Math.min(A.PIN_OFFSET_FROM_OUTER, max) : Math.min(max, Math.max(MIN_INNER_PIN_DEPTH, depth));
  }
  function innerPinLocalPosition(ring, bearing, depth) { return M.rot(V(ring.colliderInnerRadius - clampInnerDepth(ring, depth), 0), bearing); }
  function applyInnerPinGeometry(pin, ring, bearing, depth) {
    applyPinGeometry(pin, ring, bearing, null);
    var inner = ring.colliderInnerRadius, H = A.PIN_HARD_BLOCK_HALF;
    var raw = [V(inner, -H), V(inner - 0.5, -H), V(inner - 0.5, H), V(inner, H)];
    pin.hardBlockPoints = raw.map(function (v) { return pt(M.rot(v, bearing)); });
    pin.isInnerMount = true; pin.angleDegrees = bearing + 180;
    pin.stemLength = Math.max(A.PIN_STEM_LENGTH, clampInnerDepth(ring, depth));
  }
  // Ring-local direction from the owner centre to the head, for outer and inner pins alike.
  function pinBearing(pin) { return (pin.angleDegrees || 0) - (pin.isInnerMount ? 180 : 0); }
  // Rounded bar rooted in the ring centre line. length > 0: sticks out beyond the outer edge (its farthest point is at
  // colliderOuterRadius + length). length < 0: points inwards (its nearest point is at colliderInnerRadius - |length|).
  // Same vertex count and order either way (RotateLevelBuilder.StopPinPolygon).
  function stopPinPolygon(ring, angle, length) {
    length = clampStopLength(ring, length);
    var hw = A.STOP_PIN_HALF_WIDTH, baseR = ring.radius, inner = length < 0, s = inner ? -1 : 1;
    var tip = inner ? ring.colliderInnerRadius + length + hw : ring.colliderOuterRadius + length - hw;
    var pts = [V(baseR, -hw * s), V(tip, -hw * s)];
    for (var i = 1; i < 6; i++) { var a = -Math.PI * 0.5 + Math.PI * i / 6; pts.push(V(tip + s * hw * Math.cos(a), s * hw * Math.sin(a))); }
    pts.push(V(tip, hw * s)); pts.push(V(baseR, hw * s));
    return pts.map(function (p) { return pt(M.rot(p, angle)); });
  }
  // Outward stop-pins are at least 0.2 long; inward ones too, and they stop 0.05 before the ring centre.
  function clampStopLength(ring, length) {
    if (length < 0) return -Math.min(Math.max(0.2, -length), Math.max(0.2, ring.colliderInnerRadius - 0.05));
    return Math.max(0.2, length);
  }
  function stickPath(preset, length, arm) {
    var a = A.STICK_MIN_SEGMENT; length = Math.max(length, a); arm = Math.max(arm, a);
    if (preset === "straight") return [[-length * 0.5, 0], [length * 0.5, 0]];
    if (preset === "L") return [[-length * 0.5, 0], [length * 0.5, 0], [length * 0.5, -arm]];
    if (preset === "U") return [[-length * 0.5, arm], [-length * 0.5, 0], [length * 0.5, 0], [length * 0.5, arm]];
    throw new Error("Unknown stick shape " + preset + " (straight, L, U)");
  }
  function outline(line, tube) {
    var c = M.clSample(line, A.OUTLINE_STEP), n = c.length, tan = [], i, k, a;
    for (i = 0; i < n; i++) { var d = i === 0 ? M.sub(c[1], c[0]) : i === n - 1 ? M.sub(c[n - 1], c[n - 2]) : M.sub(c[i + 1], c[i - 1]); tan.push(M.len2(d) < 1e-12 ? V(1, 0) : M.normalize(d)); }
    var poly = [], cap = A.OUTLINE_CAP_SEGMENTS;
    for (i = 0; i < n; i++) poly.push(M.add(c[i], M.mul(V(-tan[i].y, tan[i].x), tube)));
    var endAngle = Math.atan2(tan[n - 1].y, tan[n - 1].x);
    for (k = 1; k < cap; k++) { a = endAngle + Math.PI * 0.5 - Math.PI * k / cap; poly.push(M.add(c[n - 1], V(tube * Math.cos(a), tube * Math.sin(a)))); }
    for (i = n - 1; i >= 0; i--) poly.push(M.sub(c[i], M.mul(V(-tan[i].y, tan[i].x), tube)));
    var startAngle = Math.atan2(tan[0].y, tan[0].x);
    for (k = 1; k < cap; k++) { a = startAngle - Math.PI * 0.5 - Math.PI * k / cap; poly.push(M.add(c[0], V(tube * Math.cos(a), tube * Math.sin(a)))); }
    return poly.map(pt);
  }
  function applyStickGeometry(stick, path) {
    stick.pathPoints = path; stick.width = A.STICK_WIDTH; stick.cornerRadius = A.STICK_CORNER;
    stick.colliderHalfWidth = A.STICK_HALF; stick.colliderEndInset = A.STICK_INSET;
    var pts = path.map(function (p) { return V(p[0], p[1]); });
    stick.colliderPoints = outline(M.centerlineBuild(pts, A.STICK_CORNER, A.STICK_INSET, 0), A.STICK_HALF);
    var dragTube = Math.min(A.STICK_DRAG_TUBE, Math.max(A.STICK_HALF, A.STICK_CORNER * 0.95));
    stick.dragAreaPoints = outline(M.centerlineBuild(pts, A.STICK_CORNER, A.STICK_INSET * 0.4, 0), dragTube);
  }
  function applyGuideGeometry(guide) {
    guide.guideTrigger = { center: [0, 0], size: [A.GUIDE_TRIGGER, A.GUIDE_TRIGGER] };
    guide.guideWalls = [{ center: [0, -A.GUIDE_WALL_OFFSET_Y], size: [A.GUIDE_WALL_LENGTH, A.GUIDE_WALL_THICKNESS] }, { center: [0, A.GUIDE_WALL_OFFSET_Y], size: [A.GUIDE_WALL_LENGTH, A.GUIDE_WALL_THICKNESS] }];
  }

  // =====================================================================================================
  // Document (RotateLevelDocument): editable model over the runtime data with undo/redo.
  // =====================================================================================================
  var UNDO_LIMIT = 64;
  function node(id, parent, x, y, z, angle) { return { transformId: id, parentId: parent, localPosition: [x, y, z], localRotation: quat(angle || 0), localScale: [1, 1, 1] }; }
  function emptyPart(id, kind, transformId) {
    return { partId: id, kind: kind, transformId: transformId, logicGapDegrees: null, meshGapDegrees: null, meshGapDirection: null, radius: null, width: null, color: null,
      lockCount: 0, hasBomb: false, pins: null, stopPins: null, colliderInnerRadius: null, colliderOuterRadius: null, dragAreaInnerRadius: null, dragAreaOuterRadius: null,
      dragAreaPaths: null, pathPoints: null, localSlideAxis: null, cornerRadius: null, lockDirectionType: null, colliderHalfWidth: null, colliderEndInset: null,
      colliderPoints: null, dragAreaPoints: null, guideTrigger: null, guideWalls: null, hostPartId: null, bombRadius: null, bombOffset: null, sourcePartData: null, sourceAttachments: null };
  }

  function Document(data) { this.data = data; this.undoStack = []; this.redoStack = []; this.dirty = false; this.revision = 0; this.inGesture = false; this.gestureRecorded = false; }
  Document.createNew = function (levelId) {
    return new Document({ version: 1, levelId: String(levelId || "draft"), sourceSha256: null, transforms: [node("root", null, 0, 0, 0), node("camera", "root", 0, 0, -10), node("content", "root", 0, 0, 0)], parts: [], links: [], guideLinks: null });
  };
  var D = Document.prototype;
  D.toJson = function () { return toJson(this.data); };
  D.beginGesture = function () { this.inGesture = true; this.gestureRecorded = false; };
  D.endGesture = function () { this.inGesture = false; this.gestureRecorded = false; };
  D.begin = function () {
    this.dirty = true; this.revision++;
    if (this.inGesture) { if (this.gestureRecorded) return; this.gestureRecorded = true; }
    this.undoStack.push(JSON.stringify(this.data)); if (this.undoStack.length > UNDO_LIMIT) this.undoStack.shift();
    this.redoStack = [];
  };
  D.canUndo = function () { return this.undoStack.length > 0; };
  D.canRedo = function () { return this.redoStack.length > 0; };
  D.undo = function () { if (!this.canUndo()) return; this.redoStack.push(JSON.stringify(this.data)); this.data = JSON.parse(this.undoStack.pop()); this.dirty = true; this.revision++; };
  D.redo = function () { if (!this.canRedo()) return; this.undoStack.push(JSON.stringify(this.data)); this.data = JSON.parse(this.redoStack.pop()); this.dirty = true; this.revision++; };

  D.part = function (id) { return this.data.parts.find(function (p) { return p.partId === id; }) || null; };
  D.transform = function (id) { return this.data.transforms.find(function (t) { return t.transformId === id; }) || null; };
  D.partsOf = function (kind) { return this.data.parts.filter(function (p) { return p.kind === kind; }); };
  D.bombOf = function (hostId) { return this.data.parts.find(function (p) { return p.kind === "bomb" && p.hostPartId === hostId; }) || null; };
  D.world = function (transformId) {
    var t = this.transform(transformId), local = { position: V(t.localPosition[0], t.localPosition[1]), angle: angleOf(t.localRotation) };
    if (!t.parentId) return local;
    var parent = this.world(t.parentId);
    return { position: M.add(parent.position, M.rot(local.position, parent.angle)), angle: parent.angle + local.angle };
  };
  D.worldOfPart = function (partId) { return this.world(this.part(partId).transformId); };
  D.contentParent = function () {
    var first = this.data.parts.find(function (p) { return p.kind === "ring" || p.kind === "stick"; });
    if (first) return this.transform(first.transformId).parentId;
    return this.transform("content") ? "content" : this.data.transforms[0].transformId;
  };
  D.nextId = function (prefix) {
    var max = 0, re = new RegExp("^" + prefix.replace(/[.]/g, "\\.") + "_(\\d+)$");
    this.data.parts.forEach(function (p) { var m = re.exec(p.partId); if (m) max = Math.max(max, parseInt(m[1], 10)); });
    return prefix + "_" + (max + 1);
  };
  D.nextTransformId = function () { var n = this.data.transforms.length, id; do { id = "ed" + (++n); } while (this.transform(id)); return id; };
  D.addTransform = function (parent, localPos, z, localAngle) { var id = this.nextTransformId(); this.data.transforms.push(node(id, parent, localPos.x, localPos.y, z, localAngle)); return id; };
  D.addWorldTransform = function (parent, w, worldAngle, z) { var p = this.world(parent), local = M.rot(M.sub(w, p.position), -p.angle); return this.addTransform(parent, local, z, worldAngle - p.angle); };
  function nextNumber(prefix, ids) { var max = 0; ids.forEach(function (id) { if (id && id.indexOf(prefix) === 0) { var n = parseInt(id.substring(prefix.length), 10); if (String(n) === id.substring(prefix.length)) max = Math.max(max, n); } }); return max + 1; }
  D.allPinIds = function () { var ids = []; this.data.parts.forEach(function (p) { (p.pins || []).forEach(function (q) { ids.push(q.featureId); }); }); return ids; };
  D.allStopIds = function () { var ids = []; this.data.parts.forEach(function (p) { (p.stopPins || []).forEach(function (q) { ids.push(q.featureId); }); }); return ids; };

  // color: [r, g, b] in 0..1
  D.addRing = function (w, radius, logicGap, angle, color) {
    this.begin();
    var id = this.nextId("ring"), part = emptyPart(id, "ring", this.addWorldTransform(this.contentParent(), w, angle, 0));
    part.width = A.RING_WIDTH; part.color = [color[0], color[1], color[2], 1]; part.pins = [];
    applyRingGeometry(part, Math.min(A.MAX_RING_RADIUS, Math.max(A.MIN_RING_RADIUS, radius)), logicGap);
    this.data.parts.push(part); return id;
  };
  // angle: ring-local degrees (0 = towards the gap centre)
  // length: optional pin length (outer edge -> head centre), default PIN_OFFSET_FROM_OUTER.
  // inner: optional, mount the pin on the inner edge pointing inwards (length = depth from the inner edge, see applyInnerPinGeometry).
  D.addPin = function (ringId, angle, length, inner) {
    var ring = this.part(ringId); if (!ring || ring.kind !== "ring") throw new Error("Pin needs a ring");
    this.begin();
    var feature = "attachment.pin_" + nextNumber("attachment.pin_", this.allPinIds());
    var pin = { featureId: feature, transformId: this.addTransform(ring.transformId, inner ? innerPinLocalPosition(ring, angle, length) : pinLocalPosition(ring, angle, length), A.PIN_Z, inner ? angle + 180 : angle) };
    if (inner) applyInnerPinGeometry(pin, ring, angle, length); else applyPinGeometry(pin, ring, angle, length);
    ring.pins.push(pin); return feature;
  };
  D.addStopPin = function (ringId, angle, length) {
    var ring = this.part(ringId); if (!ring || ring.kind !== "ring") throw new Error("Stop-pin needs a ring");
    this.begin();
    var feature = "attachment.stop_" + nextNumber("attachment.stop_", this.allStopIds());
    var stop = { featureId: feature, transformId: this.addTransform(ring.transformId, V(0, 0), 0, 0), angleDegrees: angle, hardBlockPoints: stopPinPolygon(ring, angle, length) };
    ring.stopPins = (ring.stopPins || []).concat([stop]); return feature;
  };
  // preset: "straight" | "L" | "U"; or pass an explicit stick-local path as `path`.
  D.addStick = function (preset, w, angle, length, arm, color, path) {
    this.begin();
    var id = this.nextId("slide_bar"), part = emptyPart(id, "stick", this.addWorldTransform(this.contentParent(), w, angle, 0));
    part.color = [color[0], color[1], color[2], 1]; part.lockDirectionType = 0;
    applyStickGeometry(part, path || stickPath(preset, length, arm));
    this.data.parts.push(part); return id;
  };
  // stickLocal: position on the stick (stick-local); passageDegrees relative to the stick (0 = stick X).
  D.addGuide = function (stickId, stickLocal, passageDegrees) {
    var stick = this.part(stickId); if (!stick || stick.kind !== "stick") throw new Error("Guide needs a stick");
    this.begin();
    var sp = this.world(stick.transformId), w = M.add(sp.position, M.rot(stickLocal, sp.angle));
    var id = this.nextId("guide"), guide = emptyPart(id, "guide", this.addWorldTransform(this.contentParent(), w, sp.angle + passageDegrees, A.GUIDE_Z));
    applyGuideGeometry(guide);
    this.data.parts.push(guide);
    this.data.guideLinks = (this.data.guideLinks || []).concat([{ guidePartId: id, stickPartId: stickId }]);
    return id;
  };
  D.addBomb = function (hostId, hostLocalOffset, radius) {
    var host = hostId ? this.part(hostId) : null;
    if (hostId && (!host || (host.kind !== "ring" && host.kind !== "stick"))) throw new Error("Bomb host must be a ring or stick");
    if (hostId && this.bombOf(hostId)) throw new Error(hostId + " already carries a bomb");
    this.begin();
    var id = this.nextId("bomb"), part = emptyPart(id, "bomb", host ? this.addTransform(host.transformId, hostLocalOffset, 0, 0) : this.addWorldTransform(this.contentParent(), hostLocalOffset, 0, 0));
    part.hostPartId = host ? hostId : null; part.bombRadius = radius || A.BOMB_RADIUS; part.bombOffset = [0, 0];
    this.data.parts.push(part); if (host) host.hasBomb = true; return id;
  };
  D.addLink = function (ringId, pinFeature, targetId) {
    if (this.data.links.some(function (l) { return l.sourcePartId === ringId && l.sourceFeatureId === pinFeature && l.targetPartId === targetId; })) return false;
    this.begin();
    this.data.links.push({ sourcePartId: ringId, sourceFeatureId: pinFeature, targetPartId: targetId, targetFeatureId: "body", relationKind: 0, activityKind: 0 });
    return true;
  };
  D.removeLink = function (ringId, pinFeature, targetId) {
    this.begin();
    this.data.links = this.data.links.filter(function (l) { return !(l.sourcePartId === ringId && l.sourceFeatureId === pinFeature && (targetId == null || l.targetPartId === targetId)); });
  };
  D.setWorldPosition = function (partId, w) {
    var t = this.transform(this.part(partId).transformId); this.begin();
    var parent = t.parentId ? this.world(t.parentId) : { position: V(0, 0), angle: 0 }, local = M.rot(M.sub(w, parent.position), -parent.angle);
    t.localPosition[0] = local.x; t.localPosition[1] = local.y;
  };
  D.setWorldAngle = function (partId, worldAngle) {
    var t = this.transform(this.part(partId).transformId); this.begin();
    var parent = t.parentId ? this.world(t.parentId).angle : 0; t.localRotation = quat(worldAngle - parent);
  };
  D.setColor = function (partId, c) { this.begin(); this.part(partId).color = [c[0], c[1], c[2], 1]; };
  // Challenge: the ring may carry a Fish. Absent when false, so unmarked levels keep their JSON unchanged.
  // Chain: number of solves of any other object needed before this ring/stick can be touched (0 = none).
  D.setLockCount = function (partId, n) { var p = this.part(partId); if (p.kind !== "ring" && p.kind !== "stick") throw new Error("Only a ring or a stick can carry a Chain"); n = Math.round(n); if (!(n >= 0)) throw new Error("LockCount must be 0 or more"); this.begin(); p.lockCount = n; };
  D.setCanCollect = function (partId, on) { var p = this.part(partId); if (p.kind !== "ring") throw new Error("Only a ring can carry a Fish"); this.begin(); if (on) p.canCollect = true; else delete p.canCollect; };
  D.setRing = function (ringId, radius, logicGap) {
    var ring = this.part(ringId), self = this; this.begin();
    var stopLengths = (ring.stopPins || []).map(function (s) { return stopLength(ring, s); });   // measured against the old band
    var pinLengths = ring.pins.map(function (p) { return self.pinLength(ringId, p.featureId); });   // pins keep their length beyond the edge
    applyRingGeometry(ring, Math.min(A.MAX_RING_RADIUS, Math.max(A.MIN_RING_RADIUS, radius)), logicGap);
    ring.pins.forEach(function (pin, i) {
      var a = pinBearing(pin), t = self.transform(pin.transformId), inner = !!pin.isInnerMount, local = inner ? innerPinLocalPosition(ring, a, pinLengths[i]) : pinLocalPosition(ring, a, pinLengths[i]);
      t.localPosition[0] = local.x; t.localPosition[1] = local.y; if (inner) applyInnerPinGeometry(pin, ring, a, pinLengths[i]); else applyPinGeometry(pin, ring, a, pinLengths[i]);
    });
    (ring.stopPins || []).forEach(function (s, i) { s.hardBlockPoints = stopPinPolygon(ring, s.angleDegrees || 0, stopLengths[i]); });
  };
  // Inverse of stopPinPolygon: outward = farthest point - colliderOuterRadius; inward (reaches inside the band) = -(colliderInnerRadius - nearest).
  // (RotateLevelDocument.StopLength in Unity added STOP_PIN_HALF_WIDTH on top, so every SetRing grew stop-pins by 0.25; fixed on both sides.)
  function stopLength(ring, s) {
    var far = 0, near = Infinity;
    s.hardBlockPoints.forEach(function (p) { var r = Math.hypot(p[0], p[1]); far = Math.max(far, r); near = Math.min(near, r); });
    if (near < ring.colliderInnerRadius - 0.01) return clampStopLength(ring, -(ring.colliderInnerRadius - near));
    return clampStopLength(ring, far - ring.colliderOuterRadius);
  }
  // Current pin length: distance of the pin head (transform) from the ring centre minus the outer collider radius.
  // Inner-mounted pins: depth = inner collider radius minus the head distance.
  D.pinLength = function (ringId, featureId) {
    var ring = this.part(ringId), pin = ring.pins.find(function (p) { return p.featureId === featureId; });
    var d = M.len(M.sub(this.world(pin.transformId).position, this.world(ring.transformId).position));
    return pin.isInnerMount ? ring.colliderInnerRadius - d : d - ring.colliderOuterRadius;
  };
  D.isInnerPin = function (ringId, featureId) { var pin = this.part(ringId).pins.find(function (p) { return p.featureId === featureId; }); return !!(pin && pin.isInnerMount); };
  D.pinBearing = function (ringId, featureId) { return pinBearing(this.part(ringId).pins.find(function (p) { return p.featureId === featureId; })); };
  // length null = keep the current length (also when the pin came from an imported level with other sizes: it is rebuilt with the defaults).
  // angle = ring-local bearing (centre -> head). inner: null keeps the pin's mount side; a mount change resets length to the default.
  D.setPinAngle = function (ringId, featureId, angle, length, inner) {
    var ring = this.part(ringId), pin = ring.pins.find(function (p) { return p.featureId === featureId; });
    if (inner == null) inner = !!pin.isInnerMount;
    if (length == null) length = inner === !!pin.isInnerMount ? this.pinLength(ringId, featureId) : null;
    this.begin();
    var t = this.transform(pin.transformId), local = inner ? innerPinLocalPosition(ring, angle, length) : pinLocalPosition(ring, angle, length);
    if (t.parentId !== ring.transformId) { t.parentId = ring.transformId; t.localPosition[2] = A.PIN_Z; }   // re-seat nested imported pins on the ring
    t.localPosition[0] = local.x; t.localPosition[1] = local.y; t.localRotation = quat(inner ? angle + 180 : angle);
    if (inner) applyInnerPinGeometry(pin, ring, angle, length); else applyPinGeometry(pin, ring, angle, length);
  };
  D.setPinLength = function (ringId, featureId, length) {
    var pin = this.part(ringId).pins.find(function (p) { return p.featureId === featureId; });
    this.setPinAngle(ringId, featureId, pinBearing(pin), length);
  };
  // Switch a pin between outer and inner mount (keeps its bearing, default length for the new side).
  D.setPinInner = function (ringId, featureId, inner) {
    var pin = this.part(ringId).pins.find(function (p) { return p.featureId === featureId; });
    if (!!pin.isInnerMount === !!inner) return;
    this.setPinAngle(ringId, featureId, pinBearing(pin), null, !!inner);
  };
  // Auto-fit: aim the pin at its (first) linked target, or at the nearest ring/stick, and set its length so the head sits on the
  // target's centre line. Ring target: along the line of centres. Stick target: perpendicular to the nearest straight segment, so the
  // pin passage runs along the stick. Returns { target, angle (world), length } or throws when there is nothing to fit to.
  D.fitPin = function (ringId, featureId) {
    var self = this, w = RR.World.build(this.data, { lenient: true }), ring = this.part(ringId), owner = w.rings[w.indexById[ringId]];
    var link = this.data.links.find(function (l) { return l.sourcePartId === ringId && l.sourceFeatureId === featureId; });
    var head = this.world(ring.pins.find(function (p) { return p.featureId === featureId; }).transformId).position;
    function aimAt(objId) {
      var o = w.objectIndexById[objId]; if (o === undefined || objId === ringId) return null;
      if (!w.isStickObject(o)) {
        var t = w.rings[o], d = M.sub(t.center, owner.center), dist = M.len(d);
        return { target: objId, angle: Math.atan2(d.y, d.x) * R2D, length: dist - t.arc.radius - owner.outer, cost: M.len(M.sub(head, t.center)) - t.arc.radius };
      }
      var st = w.stickOf(o), pose = RR.W.stickPose(st), best = null;
      st.centerline.primitives.forEach(function (prim) {
        if (M.isArc(prim)) return;
        var a = M.poseToWorld(pose, prim.a), b = M.poseToWorld(pose, prim.b), ab = M.sub(b, a), t2 = M.clamp01(M.dot(M.sub(owner.center, a), ab) / M.len2(ab));
        var foot = M.add(a, M.mul(ab, t2)), d2 = M.sub(foot, owner.center), dd = M.len(d2);
        if (!best || dd < best.dd) best = { dd: dd, foot: foot, d: d2 };
      });
      if (!best) return null;
      return { target: objId, angle: Math.atan2(best.d.y, best.d.x) * R2D, length: best.dd - owner.outer, cost: M.len(M.sub(head, best.foot)) };
    }
    if (ring.pins.find(function (p) { return p.featureId === featureId; }).isInnerMount) {
      // Inner pin: head on the far side of the target ring's centre line as seen from the owner centre / on the bar centre line.
      var innerFit = function (objId) {
        var o = w.objectIndexById[objId]; if (o === undefined || objId === ringId) return null;
        if (!w.isStickObject(o)) {
          var t = w.rings[o], d = M.sub(t.center, owner.center), dist = M.len(d), cur = self.pinBearing(ringId, featureId) + self.world(ring.transformId).angle;
          return { target: objId, angle: dist > 1e-3 ? Math.atan2(d.y, d.x) * R2D : cur, length: owner.inner - (dist + t.arc.radius) };
        }
        var f = aimAt(objId); return f ? { target: objId, angle: f.angle, length: owner.inner - (f.length + owner.outer) } : null;
      };
      var fi = link ? innerFit(link.targetPartId) : null;
      if (!fi || fi.length < MIN_INNER_PIN_DEPTH - 1e-6 || fi.length > owner.inner - 0.05) throw new Error(!fi ? "Pin trong cần một vật đích đã liên kết" : "Vật đích không nằm trong tầm pin trong (độ sâu cần " + fi.length.toFixed(2) + ")");
      this.setPinAngle(ringId, featureId, M.repeat(fi.angle - this.world(ring.transformId).angle, 360), fi.length, true);
      return { target: fi.target, angle: M.repeat(fi.angle, 360), length: fi.length, inner: true };
    }
    var fit = link ? aimAt(link.targetPartId) : null;
    if (!fit) {
      w.rings.forEach(function (r) { var f = aimAt(r.id); if (f && f.length > 0 && (!fit || f.cost < fit.cost)) fit = f; });
      w.sticks.forEach(function (s) { var f = aimAt(s.id); if (f && f.length > 0 && (!fit || f.cost < fit.cost)) fit = f; });
    }
    if (!fit || fit.length < MIN_PIN_LENGTH - 1e-6 || fit.length > MAX_PIN_LENGTH) throw new Error(!fit ? "Không có vòng/thanh để khớp" : "Vật đích quá gần hoặc quá xa để pin chạm tới (độ dài cần " + fit.length.toFixed(2) + ")");
    var ringAngle = this.world(ring.transformId).angle;
    this.setPinAngle(ringId, featureId, M.repeat(fit.angle - ringAngle, 360), fit.length);
    return { target: fit.target, angle: M.repeat(fit.angle, 360), length: fit.length };
  };
  D.setStopPin = function (ringId, featureId, angle, length) {
    var ring = this.part(ringId), s = ring.stopPins.find(function (p) { return p.featureId === featureId; }); this.begin();
    if (length == null) length = stopLength(ring, s);
    s.angleDegrees = angle; s.hardBlockPoints = stopPinPolygon(ring, angle, length);
  };
  D.setStickShape = function (stickId, preset, length, arm, path) {
    this.begin(); var stick = this.part(stickId); stick.localSlideAxis = null;
    applyStickGeometry(stick, path || stickPath(preset, length, arm));
  };
  D.setStickSlideAxis = function (stickId, localAxis) { this.begin(); this.part(stickId).localSlideAxis = localAxis ? [localAxis[0], localAxis[1]] : null; };
  D.setBombRadius = function (bombId, radius) { this.begin(); this.part(bombId).bombRadius = Math.max(0.1, radius); };
  D.setLevelId = function (id) { this.begin(); this.data.levelId = String(id); };

  D.deletePart = function (partId) {
    var part = this.part(partId); if (!part) return;
    this.begin();
    var remove = {}; remove[partId] = true; var self = this;
    this.data.parts.forEach(function (p) { if (p.kind === "bomb" && p.hostPartId === partId) remove[p.partId] = true; });
    if (part.kind === "stick") (this.data.guideLinks || []).forEach(function (g) { if (g.stickPartId === partId) remove[g.guidePartId] = true; });
    this.data.links = this.data.links.filter(function (l) { return !remove[l.sourcePartId] && !remove[l.targetPartId]; });
    if (this.data.guideLinks) { var kept = this.data.guideLinks.filter(function (g) { return !remove[g.guidePartId] && !remove[g.stickPartId]; }); this.data.guideLinks = kept.length === 0 ? null : kept; }
    if (part.kind === "bomb" && part.hostPartId) { var host = this.part(part.hostPartId); if (host) host.hasBomb = false; }
    var roots = {}; this.data.parts.forEach(function (p) { if (remove[p.partId]) roots[p.transformId] = true; });
    this.data.parts = this.data.parts.filter(function (p) { return !remove[p.partId]; });
    self.pruneTransforms(roots);
  };
  D.deletePin = function (ringId, featureId) {
    var ring = this.part(ringId), pin = ring.pins.find(function (p) { return p.featureId === featureId; }); this.begin();
    this.data.links = this.data.links.filter(function (l) { return !(l.sourcePartId === ringId && l.sourceFeatureId === featureId); });
    ring.pins = ring.pins.filter(function (p) { return p !== pin; }); var roots = {}; roots[pin.transformId] = true; this.pruneTransforms(roots);
  };
  D.deleteStopPin = function (ringId, featureId) {
    var ring = this.part(ringId), stop = ring.stopPins.find(function (s) { return s.featureId === featureId; }); this.begin();
    ring.stopPins = ring.stopPins.filter(function (s) { return s !== stop; }); if (ring.stopPins.length === 0) ring.stopPins = null;
    var roots = {}; roots[stop.transformId] = true; this.pruneTransforms(roots);
  };
  D.pruneTransforms = function (roots) {
    var used = {}, self = this;
    this.data.parts.forEach(function (p) { used[p.transformId] = true; (p.pins || []).forEach(function (q) { used[q.transformId] = true; }); (p.stopPins || []).forEach(function (s) { used[s.transformId] = true; }); });
    var keep = Object.assign({}, used);
    Object.keys(used).forEach(function (id) { for (var t = self.transform(id); t && t.parentId; t = self.transform(t.parentId)) keep[t.parentId] = true; });
    var drop = {};
    this.data.transforms.forEach(function (t) { for (var c = t; c; c = c.parentId ? self.transform(c.parentId) : null) if (roots[c.transformId]) { drop[t.transformId] = true; break; } });
    this.data.transforms = this.data.transforms.filter(function (t) { return keep[t.transformId] || !drop[t.transformId]; });
  };

  // Objects whose body the pin (ring `ringId`, feature) overlaps right now — candidates for its links.
  function touchWorld(data) { var w = RR.World.build(data, { lenient: true }); w.lockMinPenetration = RR.Tuning.defaults().lockMinPenetration; return w; }
  D.pinTouches = function (ringId, featureId, world) {
    var w; try { w = world || touchWorld(this.data); } catch (e) { return []; }
    var ri = w.indexById[ringId]; if (ri === undefined) return [];
    var ring = w.rings[ri], pin = ring.pinFeatures.indexOf(featureId), out = [];
    for (var obj = 0; obj < w.objectCount(); obj++) {
      if (obj === ri) continue;
      for (var q = 0; q < ring.worldQuads.length; q++) {
        if (ring.quadPin[q] !== pin || ring.quadKind[q] === KIND.STOP) continue;
        var thr = -w.engageThresholdOf(ring.quadKind[q]), d;
        if (w.isStickObject(obj)) { var st = w.stickOf(obj); d = M.chainMinSdfOverConvex(st.centerline, RR.W.stickPose(st), ring.worldQuads[q]); }
        else d = M.minSdfArcOverConvex(w.rings[obj].arc, ring.worldQuads[q]);
        if (d < thr) { out.push(w.idOf(obj)); break; }
      }
    }
    return out;
  };
  // Replace the links of a pin by the bodies it overlaps now (editor convenience). Returns the new targets.
  D.relinkPin = function (ringId, featureId) {
    var targets = this.pinTouches(ringId, featureId), self = this;
    this.begin();
    this.data.links = this.data.links.filter(function (l) { return !(l.sourcePartId === ringId && l.sourceFeatureId === featureId); });
    targets.forEach(function (t) { self.data.links.push({ sourcePartId: ringId, sourceFeatureId: featureId, targetPartId: t, targetFeatureId: "body", relationKind: 0, activityKind: 0 }); });
    return targets;
  };
  // ---------- copy / paste ----------
  // extract(partIds): a self-contained mini level (schema v1) holding the parts, everything that belongs to them (pins, stop-pins,
  // hosted bombs, the guides of a stick) and the links/guide links among them. Top transforms carry WORLD poses (parent null), so the
  // clip can be pasted into any level. A hosted bomb whose host is not copied becomes a free bomb at its world position.
  var PART_PREFIX = { ring: "ring", stick: "slide_bar", guide: "guide", bomb: "bomb" };
  D.extract = function (partIds) {
    var self = this, set = {}, order = [];
    function add(id) { var p = self.part(id); if (!p || set[id]) return; set[id] = true; order.push(id); }
    partIds.forEach(add);
    partIds.forEach(function (id) {
      var p = self.part(id); if (!p) return;
      if (p.kind === "ring" || p.kind === "stick") { var b = self.bombOf(id); if (b) add(b.partId); }
      if (p.kind === "stick") (self.data.guideLinks || []).forEach(function (g) { if (g.stickPartId === id) add(g.guidePartId); });
    });
    var parts = order.map(function (id) { return clone(self.part(id)); }), transforms = [], tops = {};
    parts.forEach(function (p) {
      if (p.kind === "bomb" && p.hostPartId && !set[p.hostPartId]) p.hostPartId = null;   // detached: becomes a free bomb
      var top = p.kind === "bomb" && p.hostPartId ? null : p.transformId;
      if (top) tops[top] = true;
    });
    // top transforms with world poses, then every descendant transform of a copied part (pins, stop-pins, hosted bombs)
    var included = {};
    parts.forEach(function (p) {
      if (!tops[p.transformId]) return;
      var w = self.world(p.transformId), t = self.transform(p.transformId);
      transforms.push(node(p.transformId, null, w.position.x, w.position.y, t.localPosition[2], w.angle)); included[p.transformId] = true;
    });
    var added = true;
    while (added) {
      added = false;
      self.data.transforms.forEach(function (t) {
        if (included[t.transformId] || !t.parentId || !included[t.parentId]) return;
        transforms.push(clone(t)); included[t.transformId] = true; added = true;
      });
    }
    parts.forEach(function (p) {   // a detached bomb keeps its world position
      if (p.kind === "bomb" && !p.hostPartId && !included[p.transformId]) { var w = self.world(p.transformId); transforms.push(node(p.transformId, null, w.position.x, w.position.y, 0, w.angle)); included[p.transformId] = true; }
    });
    var links = this.data.links.filter(function (l) { return set[l.sourcePartId] && set[l.targetPartId]; }).map(clone);
    var guideLinks = (this.data.guideLinks || []).filter(function (g) { return set[g.guidePartId] && set[g.stickPartId]; }).map(clone);
    var anchor = V(0, 0), n = 0;
    transforms.forEach(function (t) { if (t.parentId == null) { anchor = M.add(anchor, V(t.localPosition[0], t.localPosition[1])); n++; } });
    return { version: 1, levelId: "clipboard", sourceSha256: null, transforms: transforms, parts: parts, links: links, guideLinks: guideLinks.length ? guideLinks : null,
      anchor: n ? [anchor.x / n, anchor.y / n] : [0, 0] };
  };
  // paste(clip, delta, opts): adds the clip moved by `delta` (world). New part/transform/feature ids; opts.recolor(kind) may return a new colour;
  // opts.host = id of a ring/stick that receives a free bomb when the clip is just one bomb. Returns the new ids of the top parts.
  D.paste = function (clip, delta, opts) {
    opts = opts || {};
    var self = this, tMap = {}, pMap = {}, fMap = {}, tops = [];
    this.begin();
    var parent = this.contentParent();
    var single = clip.parts.length === 1 && clip.parts[0].kind === "bomb" && opts.host && this.part(opts.host) && !this.bombOf(opts.host);
    // transforms: parents before children
    var byId = {}; clip.transforms.forEach(function (t) { byId[t.transformId] = t; });
    function depth(t) { var d = 0; while (t && t.parentId && byId[t.parentId]) { t = byId[t.parentId]; d++; } return d; }
    clip.transforms.slice().sort(function (a, b) { return depth(a) - depth(b); }).forEach(function (t) {
      if (t.parentId == null || !byId[t.parentId]) {
        var wp = V(t.localPosition[0] + delta.x, t.localPosition[1] + delta.y), wa = angleOf(t.localRotation);
        tMap[t.transformId] = self.addWorldTransform(parent, wp, wa, t.localPosition[2]);
      } else {
        var c = clone(t); c.transformId = self.nextTransformId(); c.parentId = tMap[t.parentId]; tMap[t.transformId] = c.transformId; self.data.transforms.push(c);
      }
    });
    clip.parts.forEach(function (src) {
      var p = clone(src), oldId = p.partId;
      p.partId = self.nextId(PART_PREFIX[p.kind] || p.kind); pMap[oldId] = p.partId; p.transformId = tMap[src.transformId];
      var pins = p.pins || [], stops = p.stopPins || [];
      p.pins = p.pins ? [] : p.pins; p.stopPins = p.stopPins ? [] : p.stopPins;
      self.data.parts.push(p);   // pushed first so features numbered below see each other
      pins.forEach(function (pin) { var f = "attachment.pin_" + nextNumber("attachment.pin_", self.allPinIds()); fMap[oldId + "/" + pin.featureId] = f; pin.featureId = f; pin.transformId = tMap[pin.transformId]; p.pins.push(pin); });
      stops.forEach(function (s) { var f = "attachment.stop_" + nextNumber("attachment.stop_", self.allStopIds()); s.featureId = f; s.transformId = tMap[s.transformId]; p.stopPins.push(s); });
      if ((p.kind === "ring" || p.kind === "stick") && opts.recolor) { var col = opts.recolor(p.kind); if (col) p.color = [col[0], col[1], col[2], 1]; }
      if (!(p.kind === "bomb" && p.hostPartId)) tops.push(p.partId);
    });
    clip.parts.forEach(function (src) {
      var p = self.part(pMap[src.partId]);
      if (p.kind === "bomb" && src.hostPartId) p.hostPartId = pMap[src.hostPartId];
      if (p.kind !== "bomb") p.hasBomb = clip.parts.some(function (b) { return b.kind === "bomb" && b.hostPartId === src.partId; });
    });
    if (single) {   // one free bomb dropped onto a host: re-parent it under the host at the same world spot
      var bomb = this.part(tops[0]), host = this.part(opts.host), hw = this.world(host.transformId), bw = this.world(bomb.transformId);
      var t = this.transform(bomb.transformId), local = M.rot(M.sub(bw.position, hw.position), -hw.angle);
      t.parentId = host.transformId; t.localPosition = [local.x, local.y, 0]; t.localRotation = quat(0);
      bomb.hostPartId = host.partId; host.hasBomb = true;
    }
    clip.links.forEach(function (l) {
      self.data.links.push({ sourcePartId: pMap[l.sourcePartId], sourceFeatureId: fMap[l.sourcePartId + "/" + l.sourceFeatureId], targetPartId: pMap[l.targetPartId], targetFeatureId: l.targetFeatureId, relationKind: l.relationKind || 0, activityKind: l.activityKind || 0 });
    });
    (clip.guideLinks || []).forEach(function (g) { self.data.guideLinks = (self.data.guideLinks || []).concat([{ guidePartId: pMap[g.guidePartId], stickPartId: pMap[g.stickPartId] }]); });
    return tops;
  };

  // Every pin is linked to exactly the bodies it overlaps now. Records one undo step only when the links change.
  D.relinkAll = function () {
    var w; try { w = touchWorld(this.data); } catch (e) { return false; }
    var self = this, links = [];
    this.partsOf("ring").forEach(function (r) {
      (r.pins || []).forEach(function (p) {
        self.pinTouches(r.partId, p.featureId, w).forEach(function (t) { links.push({ sourcePartId: r.partId, sourceFeatureId: p.featureId, targetPartId: t, targetFeatureId: "body", relationKind: 0, activityKind: 0 }); });
      });
    });
    function key(l) { return l.sourcePartId + "/" + l.sourceFeatureId + "/" + l.targetPartId; }
    var before = this.data.links.map(key).sort().join("|"), after = links.map(key).sort().join("|");
    if (before === after) return false;
    this.begin(); this.data.links = links; return true;
  };

  // =====================================================================================================
  // Colours and labels
  // =====================================================================================================
  var COLOR_NAMES = { orange: 0, red: 1, blue: 2, sky: 2, purple: 3, green: 4, navy: 5, teal: 6 };
  var COLOR_KEYS = ["orange", "red", "blue", "purple", "green", "navy", "teal"];
  function parseColor(c, index) {
    if (Array.isArray(c)) return [c[0], c[1], c[2]];
    if (typeof c === "string") {
      var key = c.toLowerCase().trim();
      if (key in COLOR_NAMES) return A.PALETTE[COLOR_NAMES[key]].slice();
      var m = /^#?([0-9a-f]{6})$/i.exec(key);
      if (m) { var n = parseInt(m[1], 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; }
      throw new Error("Unknown colour " + c + " (use " + COLOR_KEYS.join(", ") + " or #rrggbb)");
    }
    return A.PALETTE[(index || 0) % A.PALETTE.length].slice();
  }
  function colorName(rgb) {
    for (var i = 0; i < A.PALETTE.length; i++) { var p = A.PALETTE[i]; if (Math.abs(p[0] - rgb[0]) < 0.01 && Math.abs(p[1] - rgb[1]) < 0.01 && Math.abs(p[2] - rgb[2]) < 0.01) return COLOR_KEYS[i]; }
    function h(v) { var s = Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16); return s.length < 2 ? "0" + s : s; }
    return "#" + h(rgb[0]) + h(rgb[1]) + h(rgb[2]);
  }
  function colorCss(rgb) { return "rgb(" + Math.round(rgb[0] * 255) + "," + Math.round(rgb[1] * 255) + "," + Math.round(rgb[2] * 255) + ")"; }
  // Short label for the canvas and reports: ring_3 -> R3, slide_bar_2 -> S2, guide_1 -> G1, bomb_1 -> B1.
  function labelOf(partId, kind) {
    var m = /(\d+)$/.exec(partId || ""), prefix = { ring: "R", stick: "S", guide: "G", bomb: "B" }[kind] || "?";
    return prefix + (m && m[1].length <= 4 ? m[1] : (partId || "?"));
  }

  // =====================================================================================================
  // Design format (turp-design v1) <-> runtime data
  // =====================================================================================================
  var DESIGN_FORMAT = "turp-design";
  function round4(x) { return Math.round(x * 10000) / 10000; }
  function normDeg(a) { var r = M.repeat(a, 360); return round4(r >= 359.99995 ? 0 : r); }

  // Builds runtime data through the same Document operations the editor uses. Returns { level, ids: { designId: partId } }.
  function designToLevel(design) {
    if (!design || design.format !== DESIGN_FORMAT) throw new Error("Not a design file (format must be \"" + DESIGN_FORMAT + "\")");
    if (design.version !== 1) throw new Error("Unsupported design version " + design.version);
    var doc = Document.createNew(design.levelId || "draft"), ids = {}, pinRefs = [];
    function need(v, label) { if (typeof v !== "number" || !isFinite(v)) throw new Error(label + " must be a number"); return v; }
    (design.rings || []).forEach(function (r, i) {
      var label = "ring " + (r.id || i);
      if (r.id != null && ids[r.id]) throw new Error("Duplicate id " + r.id);
      var gapDir = r.gapDir == null ? 0 : need(r.gapDir, label + ".gapDir"), gap = r.gap == null ? A.RING_GAP_DEGREES : need(r.gap, label + ".gap");
      if (gap < 0 || gap > 360) throw new Error(label + ".gap must be 0..360 (0 = closed ring)");
      var id = doc.addRing(V(need(r.x, label + ".x"), need(r.y, label + ".y")), r.radius == null ? A.RING_RADIUS : need(r.radius, label + ".radius"), gap, gapDir, parseColor(r.color, i));
      ids[r.id != null ? r.id : id] = id;
      (r.pins || []).forEach(function (p, k) {
        var f = doc.addPin(id, need(p.angle, label + ".pins[" + k + "].angle") - gapDir, p.length == null ? null : need(p.length, label + ".pins[" + k + "].length"), p.inner === true);
        var targets = p.targets != null ? p.targets : p.target != null ? [p.target] : [];
        if (!Array.isArray(targets)) targets = [targets];
        pinRefs.push({ ring: id, feature: f, targets: targets, label: label + ".pins[" + k + "]" });
      });
      (r.stops || []).forEach(function (s, k) { doc.addStopPin(id, need(s.angle, label + ".stops[" + k + "].angle") - gapDir, s.length == null ? A.STOP_PIN_DEFAULT_LENGTH : need(s.length, label + ".stops[" + k + "].length")); });
      if (r.collect === true) doc.setCanCollect(id, true);
    });
    (design.sticks || []).forEach(function (s, i) {
      var label = "stick " + (s.id || i);
      if (s.id != null && ids[s.id]) throw new Error("Duplicate id " + s.id);
      var angle = s.angle == null ? 0 : need(s.angle, label + ".angle"), path = null;
      if (s.path) { if (!Array.isArray(s.path) || s.path.length < 2) throw new Error(label + ".path needs at least 2 points"); path = s.path.map(function (p) { return [need(p[0], label + ".path"), need(p[1], label + ".path")]; }); }
      var shape = s.shape || "straight";
      var id = doc.addStick(shape, V(need(s.x, label + ".x"), need(s.y, label + ".y")), angle, s.length == null ? A.STICK_DEFAULT_LENGTH : need(s.length, label + ".length"),
        s.arm == null ? A.STICK_DEFAULT_ARM : need(s.arm, label + ".arm"), parseColor(s.color, i + 3), path);
      ids[s.id != null ? s.id : id] = id;
      if (s.slideAxis) doc.setStickSlideAxis(id, s.slideAxis);
      (s.guides || []).forEach(function (g, k) {
        var gl = label + ".guides[" + k + "]", sp = doc.worldOfPart(id), gw = V(need(g.x, gl + ".x"), need(g.y, gl + ".y"));
        doc.addGuide(id, M.rot(M.sub(gw, sp.position), -sp.angle), (g.angle == null ? angle : need(g.angle, gl + ".angle")) - sp.angle);
      });
    });
    pinRefs.forEach(function (ref) {
      ref.targets.forEach(function (t) {
        if (!(t in ids)) throw new Error(ref.label + ": unknown target " + t);
        if (ids[t] === ref.ring) throw new Error(ref.label + ": a pin cannot lock its own ring");
        doc.addLink(ref.ring, ref.feature, ids[t]);
      });
    });
    function bombOn(hostId, b, label) {
      var hp = doc.worldOfPart(hostId), bw = b.x == null ? hp.position : V(need(b.x, label + ".x"), need(b.y, label + ".y"));
      doc.addBomb(hostId, M.rot(M.sub(bw, hp.position), -hp.angle), b.radius == null ? A.BOMB_RADIUS : need(b.radius, label + ".radius"));
    }
    (design.rings || []).forEach(function (r, i) { if (r.bomb) bombOn(ids[r.id != null ? r.id : "ring_" + (i + 1)], r.bomb, "ring " + (r.id || i) + ".bomb"); });
    (design.sticks || []).forEach(function (s, i) { if (s.bomb) bombOn(ids[s.id != null ? s.id : "slide_bar_" + (i + 1)], s.bomb, "stick " + (s.id || i) + ".bomb"); });
    (design.bombs || []).forEach(function (b, i) { doc.addBomb(null, V(need(b.x, "bombs[" + i + "].x"), need(b.y, "bombs[" + i + "].y")), b.radius == null ? A.BOMB_RADIUS : need(b.radius, "bombs[" + i + "].radius")); });
    doc.undoStack = []; doc.redoStack = []; doc.dirty = false;
    return { level: doc.data, ids: ids };
  }

  // Readable summary of any runtime level as a design. Parts whose baked numbers differ from the authoring defaults are listed in
  // `_notes`: converting such a design back rebuilds them with the default dimensions.
  function levelToDesign(level, meta) {
    var doc = new Document(clone(level)), notes = [], design = { format: DESIGN_FORMAT, version: 1, levelId: level.levelId, name: (meta && meta.name) || ("Level " + level.levelId) };
    var idOf = {}, worldCache;
    function resolvedWorld() { if (worldCache === undefined) { try { worldCache = RR.World.build(level, { lenient: true }); } catch (e) { worldCache = null; } } return worldCache; }
    doc.partsOf("ring").forEach(function (r) { idOf[r.partId] = labelOf(r.partId, "ring"); });
    doc.partsOf("stick").forEach(function (s) { idOf[s.partId] = labelOf(s.partId, "stick"); });
    function near(a, b) { return Math.abs(a - b) < 1e-3; }
    design.rings = doc.partsOf("ring").map(function (r) {
      var w = doc.world(r.transformId), gapDir = w.angle + (r.meshGapDirection || 0), out = { id: idOf[r.partId], x: round4(w.position.x), y: round4(w.position.y), gapDir: normDeg(gapDir), gap: round4(r.logicGapDegrees) };
      if (!near(r.radius, A.RING_RADIUS)) out.radius = round4(r.radius);
      if (r.radius > A.MAX_RING_RADIUS || r.radius < A.MIN_RING_RADIUS) notes.push(out.id + ": radius " + round4(r.radius) + " is outside the editor range " + A.MIN_RING_RADIUS + "–" + A.MAX_RING_RADIUS + " and is clamped when rebuilt");
      out.color = colorName(r.color);
      if (!near(r.colliderInnerRadius, r.radius - A.RING_BAND_HALF) || !near(r.colliderOuterRadius, r.radius + A.RING_BAND_HALF)) notes.push(out.id + ": collider band differs from the default ±" + A.RING_BAND_HALF);
      if (r.meshGapDirection && Math.abs(r.meshGapDirection) > 1e-3) notes.push(out.id + ": meshGapDirection " + r.meshGapDirection + " folded into gapDir");
      if (r.pins.length) out.pins = r.pins.map(function (p, k) {
        var local = p.angleDegrees == null ? null : pinBearing(p);
        if (local == null) { var pw = doc.world(p.transformId), d = M.sub(pw.position, w.position); local = Math.atan2(d.y, d.x) * R2D - w.angle; }
        var targets = level.links.filter(function (l) { return l.sourcePartId === r.partId && l.sourceFeatureId === p.featureId; }).map(function (l) { return idOf[l.targetPartId] || l.targetPartId; });
        if (p.sensorSize && (!near(p.sensorSize[0], A.PIN_SENSOR_X) || !near(p.sensorSize[1], A.PIN_SENSOR_Y) || !near(p.wallOffsetX, A.PIN_WALL_OFFSET_X))) notes.push(out.id + "/p" + (k + 1) + ": pin dimensions differ from the defaults");
        var pin = { id: "p" + (k + 1), angle: normDeg(w.angle + local) }, plen = doc.pinLength(r.partId, p.featureId);
        if (p.isInnerMount) { pin.inner = true; pin.length = round4(plen); }   // inner-mounted: length = depth from the inner edge
        else if (plen >= MIN_PIN_LENGTH && Math.abs(plen - A.PIN_OFFSET_FROM_OUTER) > 1e-3) pin.length = round4(plen);
        if (targets.length) pin.targets = targets;
        return pin;
      });
      if (r.stopPins && r.stopPins.length) out.stops = r.stopPins.map(function (s) {
        var a = s.angleDegrees;
        if (a == null) { var c = V(0, 0); s.hardBlockPoints.forEach(function (q) { c = M.add(c, V(q[0], q[1])); }); a = Math.atan2(c.y, c.x) * R2D; }
        return { angle: normDeg(w.angle + a), length: round4(stopLength(r, s)) };
      });
      if (r.canCollect) out.collect = true;
      var bomb = doc.bombOf(r.partId);
      if (bomb) out.bomb = bombDesign(bomb);
      return out;
    });
    function bombDesign(b) {
      var bw = doc.world(b.transformId), off = b.bombOffset ? M.rot(V(b.bombOffset[0], b.bombOffset[1]), bw.angle) : V(0, 0), c = M.add(bw.position, off);
      var out = { x: round4(c.x), y: round4(c.y) }; if (!near(b.bombRadius, A.BOMB_RADIUS)) out.radius = round4(b.bombRadius); return out;
    }
    design.sticks = doc.partsOf("stick").map(function (s) {
      var w = doc.world(s.transformId), out = { id: idOf[s.partId], x: round4(w.position.x), y: round4(w.position.y), angle: normDeg(w.angle), color: colorName(s.color) };
      var shape = detectPreset(s.pathPoints);
      if (shape) { out.shape = shape.shape; out.length = round4(shape.length); if (shape.arm != null) out.arm = round4(shape.arm); }
      else out.path = s.pathPoints.map(function (p) { return [round4(p[0]), round4(p[1])]; });
      if (s.localSlideAxis) out.slideAxis = [round4(s.localSlideAxis[0]), round4(s.localSlideAxis[1])];
      else if (!shape || shape.shape !== "straight") {
        // A bent stick whose axis comes only from a pin passage: write the resolved axis down, because a rebuilt (default-size) pin
        // may no longer overlap it and the game would then refuse the unconstrained bent path.
        var ws = resolvedWorld(), st = ws && ws.sticks.find(function (q) { return q.id === s.partId; });
        if (st && !st.axisError && st.slideAxisSource.indexOf("guide:") < 0) { var la = M.rot(st.slideAxis, -st.angleDeg); out.slideAxis = [round4(la.x), round4(la.y)]; }
      }
      if (!near(s.colliderHalfWidth, A.STICK_HALF) || !near(s.colliderEndInset, A.STICK_INSET) || !near(s.cornerRadius || 0, A.STICK_CORNER)) notes.push(out.id + ": stick collider numbers differ from the defaults");
      var guides = (level.guideLinks || []).filter(function (g) { return g.stickPartId === s.partId; }).map(function (g) {
        var gp = doc.part(g.guidePartId), gw = doc.world(gp.transformId);
        if (gp.guideTrigger && !near(gp.guideTrigger.size[0], A.GUIDE_TRIGGER)) notes.push(out.id + "/" + g.guidePartId + ": guide size differs from the defaults");
        return { x: round4(gw.position.x), y: round4(gw.position.y), angle: normDeg(gw.angle) };
      });
      if (guides.length) out.guides = guides;
      var bomb = doc.bombOf(s.partId); if (bomb) out.bomb = bombDesign(bomb);
      return out;
    });
    var free = doc.partsOf("bomb").filter(function (b) { return !b.hostPartId; }).map(bombDesign);
    if (free.length) design.bombs = free;
    if (!design.sticks.length) delete design.sticks;
    if (notes.length) design._notes = notes;
    return design;
  }
  function detectPreset(path) {
    function eq(a, b) { return Math.abs(a - b) < 1e-4; }
    if (!path) return null;
    var p = path;
    if (p.length === 2 && eq(p[0][1], 0) && eq(p[1][1], 0) && eq(p[0][0], -p[1][0]) && p[1][0] > 0) return { shape: "straight", length: p[1][0] * 2 };
    if (p.length === 3 && eq(p[0][1], 0) && eq(p[1][1], 0) && eq(p[0][0], -p[1][0]) && eq(p[2][0], p[1][0]) && p[2][1] < 0) return { shape: "L", length: p[1][0] * 2, arm: -p[2][1] };
    if (p.length === 4 && eq(p[1][1], 0) && eq(p[2][1], 0) && eq(p[1][0], -p[2][0]) && eq(p[0][0], p[1][0]) && eq(p[3][0], p[2][0]) && eq(p[0][1], p[3][1]) && p[0][1] > 0) return { shape: "U", length: p[2][0] * 2, arm: p[0][1] };
    return null;
  }

  function detectFormat(obj) {
    if (!obj || typeof obj !== "object") return "unknown";
    if (obj.format === DESIGN_FORMAT) return "design";
    if (obj.format === "turp-pack") return "pack";
    if (obj.version === 1 && Array.isArray(obj.parts) && Array.isArray(obj.transforms)) return "runtime";
    return "unknown";
  }

  // =====================================================================================================
  // Designer warnings (not game rules — hints about the setup)
  // =====================================================================================================
  function analyze(level, tuning) {
    var out = { error: validate(level, tuning), warnings: [], info: {} };
    if (out.error) return out;
    var sim = new RR.Simulation(level, tuning || RR.Tuning.defaults()), w = sim.world, mask = RR.Tuning.blockerMask(sim.tuning), kinds = {};
    level.parts.forEach(function (p) { kinds[p.partId] = p.kind; });
    function L(id) { return labelOf(id, kinds[id]); }
    out.info = { rings: w.rings.length, sticks: w.sticks.length, guides: w.guides.length, bombs: w.bombs.length, links: sim.links.length,
      pins: w.rings.reduce(function (s, r) { return s + r.pinFeatures.length; }, 0), stops: w.rings.reduce(function (s, r) { return s + r.quadKind.filter(function (k) { return k === KIND.STOP; }).length; }, 0),
      closedRings: w.rings.filter(function (r) { return r.gapDegrees <= M.CLOSED_GAP_DEGREES; }).length };
    w.rings.forEach(function (r, i) {
      var pen = w.penetration(i, r.angleDeg, mask); RR.W.ringSetAngle(r, r.angleDeg);
      if (pen > sim.tuning.startPenetrationTolerance) out.warnings.push({ code: "overlap", part: r.id, text: L(r.id) + " chồng lên vật khác lúc bắt đầu (độ xuyên " + pen.toFixed(3) + ")" });
    });
    w.sticks.forEach(function (s) {
      var pen = w.stickPenetration(s.ordinal, 0, mask);
      if (pen > sim.tuning.startPenetrationTolerance) out.warnings.push({ code: "overlap", part: s.id, text: L(s.id) + " chồng lên vật khác lúc bắt đầu (độ xuyên " + pen.toFixed(3) + ")" });
    });
    sim.links.forEach(function (l, i) {
      if (!sim.graph.active[i]) out.warnings.push({ code: "link-idle", part: sim.idOf(l.source), text: "Liên kết " + L(sim.idOf(l.source)) + " → " + L(sim.idOf(l.target)) + " không chạm lúc bắt đầu (chưa khóa)" });
    });
    w.rings.forEach(function (r, i) {
      r.pinFeatures.forEach(function (f, p) {
        if (!sim.links.some(function (l) { return l.source === i && l.pin === p; })) out.warnings.push({ code: "pin-unlinked", part: r.id, text: L(r.id) + " có pin không liên kết: pin chỉ chặn, không khóa" });
      });
    });
    var marked = {}; level.parts.forEach(function (p) { if (p.canCollect) marked[p.partId] = true; });
    if (Object.keys(marked).length) fishCheck(level).forEach(function (f) {
      if (!marked[f.id]) return;
      if (f.hard.length) out.warnings.push({ code: "fish-blocked", part: f.id, text: "Cá trên " + L(f.id) + " bị đè lúc bắt đầu bởi " + f.hard.join(", ") + " — bỏ cờ Cá ở vòng này" });
      else if (f.sweep.length) out.warnings.push({ code: "fish-sweep", part: f.id, text: "Cá trên " + L(f.id) + " có thể bị " + f.sweep.join(", ") + " quét qua — chỉ dùng khi không còn vòng khác" });
      else if (f.soft.length) out.warnings.push({ code: "fish-corridor", part: f.id, text: "Cá trên " + L(f.id) + " nằm trên " + f.soft.join(", ") + " — ưu tiên vòng kín/vòng khác nếu có" });
    });
    for (var obj = 0; obj < w.objectCount(); obj++)
      if (!sim.graph.hasActiveLock(obj)) out.warnings.push({ code: "free", part: sim.idOf(obj), text: L(sim.idOf(obj)) + " không bị khóa từ đầu: sẽ tự tháo ở lần thả tay đầu tiên" });
    return out;
  }

  // =====================================================================================================
  // Challenge Fish (canCollect) placement rule
  // =====================================================================================================
  // The Fish is a 2D sprite at the ring centre (Unity ChallengeFish prefab, diameter <= 2*(FISH_CLEAR_RADIUS - margin)).
  // hard: something covers the Fish area at the start (never allowed). sweep: a ring body/pin/stop or a ring-borne bomb can pass over it
  // when that ring turns. soft: a stick's slide corridor crosses it. Closed rings come first: nothing threads into them.
  var FISH_CLEAR_RADIUS = 0.7;
  function visibleQuads(r, local) { return (local ? r.localQuads : r.worldQuads).filter(function (q, k) { return r.quadKind[k] !== KIND.SENSOR; }); }
  function fishCheck(level) {
    var w = RR.World.build(level, { lenient: true }), F = FISH_CLEAR_RADIUS, origin = V(0, 0);
    var reach = w.rings.map(function (r) {   // [min, max] distance from the ring centre reached by its pins/stops when it turns
      var lo = Infinity, hi = -Infinity;
      visibleQuads(r, true).forEach(function (q) { lo = Math.min(lo, M.distanceToPolygon(origin, q)); q.forEach(function (v) { hi = Math.max(hi, M.len(v)); }); });
      return { lo: lo, hi: hi };
    });
    return w.rings.map(function (ring) {
      var c = ring.center, hard = [], sweep = [], soft = [];
      w.rings.forEach(function (o, j) {
        var d = M.len(M.sub(c, o.center)), name = labelOf(o.id, "ring");
        if (o !== ring && M.arcSdf(o.arc, c) < F) hard.push(name);
        else if (o !== ring && d > o.inner - F && d < o.outer + F) sweep.push(name);
        if (visibleQuads(o, false).some(function (q) { return M.distanceToPolygon(c, q) < F; })) hard.push(name + (o === ring ? " (pin/chốt của chính vòng)" : " (pin/chốt)"));
        else if (reach[j].lo < Infinity && d > reach[j].lo - F && d < reach[j].hi + F) sweep.push(name + " (pin/chốt khi xoay)");
      });
      w.sticks.forEach(function (s) {
        var pose = RR.W.stickPose(s);
        if (M.distanceToPolygon(M.poseToLocal(pose, c), s.bodyLocal) < F) { hard.push(labelOf(s.id, "stick")); return; }
        var ax = s.slideAxis; if (!ax || M.len(ax) < 1e-6) return;
        var n = V(-ax.y, ax.x), lo = Infinity, hi = -Infinity;
        s.bodyLocal.forEach(function (v) { var pv = M.dot(M.poseToWorld(pose, v), n); lo = Math.min(lo, pv); hi = Math.max(hi, pv); });
        var pc = M.dot(c, n); if (pc > lo - F && pc < hi + F) soft.push(labelOf(s.id, "stick") + " (đường trượt)");
      });
      w.guides.forEach(function (g) {
        if ([g.triggerQuad].concat(g.wallQuads).some(function (q) { return M.distanceToPolygon(c, q) < F; })) hard.push(labelOf(g.id, "guide"));
      });
      w.bombs.forEach(function (b) {
        if (M.len(M.sub(c, b.center())) < F + b.radius) hard.push(labelOf(b.id, "bomb"));
        else if (b.host >= 0 && !w.isStickObject(b.host) && Math.abs(M.len(M.sub(c, w.rings[b.host].center)) - b.orbit()) < F + b.radius) sweep.push(labelOf(b.id, "bomb") + " (quay theo vòng)");
      });
      var closed = ring.gapDegrees <= M.CLOSED_GAP_DEGREES;
      return { id: ring.id, closed: closed, hard: hard, sweep: sweep, soft: soft,
        tier: hard.length ? -1 : sweep.length ? 3 : soft.length ? 2 : closed ? 0 : 1 };
    });
  }
  // Rings that may carry a Fish, best first: 0 closed & clear, 1 open & clear, 2 only a slide corridor crosses it,
  // 3 something can sweep over it when a ring turns (use only when nothing better exists). Covered at the start: never.
  function fishCandidates(level) { return fishCheck(level).filter(function (f) { return f.tier >= 0; }).sort(function (a, b) { return a.tier - b.tier; }); }

  RR.Fish = { CLEAR_RADIUS: FISH_CLEAR_RADIUS, check: fishCheck, candidates: fishCandidates };
  RR.json = { f32: f32, stringify: toJson, clone: clone };
  RR.validateStructure = validateStructure;
  RR.validate = validate;
  RR.Builder = { quat: quat, angleOf: angleOf, meshGapFor: meshGapFor, ringDragPaths: ringDragPaths, applyRingGeometry: applyRingGeometry, pinLocalPosition: pinLocalPosition,
    applyPinGeometry: applyPinGeometry, stopPinPolygon: stopPinPolygon, stickPath: stickPath, outline: outline, applyStickGeometry: applyStickGeometry, applyGuideGeometry: applyGuideGeometry, emptyPart: emptyPart, stopLength: stopLength, clampStopLength: clampStopLength };
  RR.Document = Document;
  RR.Color = { parse: parseColor, name: colorName, css: colorCss, KEYS: COLOR_KEYS };
  RR.labelOf = labelOf;
  RR.Design = { FORMAT: DESIGN_FORMAT, toLevel: designToLevel, fromLevel: levelToDesign, detectFormat: detectFormat };
  RR.analyze = analyze;
})(typeof module === "object" && module.exports ? require("./rr-ns.js") : (self.RR = self.RR || {}));

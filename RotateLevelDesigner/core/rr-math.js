// TURP designer core — closed-form geometry.
// Port of RotateShapeMath.cs, RotateCenterline.cs, RotateChainMath.cs (Assets/_IEC/Script/Data/TURP). Keep the two in step:
// a change in the C# collision math must be mirrored here, then checked with `node rr-cli.js golden`.
(function (RR) {
  "use strict";
  var D2R = Math.PI / 180, R2D = 180 / Math.PI, INF = Number.POSITIVE_INFINITY;

  // ---------- Unity-compatible scalar helpers ----------
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function lerp(a, b, t) { return a + (b - a) * clamp01(t); }
  function repeat(t, length) { return t - Math.floor(t / length) * length; }
  function deltaAngle(current, target) { var n = repeat(target - current, 360); return n > 180 ? n - 360 : n; }
  function sign(f) { return f >= 0 ? 1 : -1; }   // Mathf.Sign: 0 -> 1

  // ---------- vectors {x, y} ----------
  function V(x, y) { return { x: x, y: y }; }
  function add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; }
  function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
  function mul(a, s) { return { x: a.x * s, y: a.y * s }; }
  function dot(a, b) { return a.x * b.x + a.y * b.y; }
  function cross(a, b) { return a.x * b.y - a.y * b.x; }
  function len2(a) { return a.x * a.x + a.y * a.y; }
  function len(a) { return Math.sqrt(a.x * a.x + a.y * a.y); }
  function normalize(a) { var l = len(a); return l > 1e-5 ? { x: a.x / l, y: a.y / l } : { x: 0, y: 0 }; }
  function vlerp(a, b, t) { t = clamp01(t); return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
  function rot(v, degrees) { var r = degrees * D2R, c = Math.cos(r), s = Math.sin(r); return { x: c * v.x - s * v.y, y: s * v.x + c * v.y }; }
  // Vector2.SignedAngle
  function signedAngle(from, to) {
    var denom = Math.sqrt(len2(from) * len2(to)); if (denom < 1e-15) return 0;
    var d = Math.max(-1, Math.min(1, dot(from, to) / denom));
    return Math.acos(d) * R2D * sign(from.x * to.y - from.y * to.x);
  }

  // ---------- capsule arc (ring body) ----------
  var CLOSED_GAP_DEGREES = 0.5;
  function arcCreate(center, inner, outer, gapDegrees, gapDirectionAbsDegrees) {
    var mid = (inner + outer) * 0.5, t = (outer - inner) * 0.5, start = gapDegrees * 0.5 + t / mid * R2D;
    if (gapDegrees <= CLOSED_GAP_DEGREES)
      return { center: center, radius: mid, tube: t, startDeg: gapDirectionAbsDegrees, endDeg: gapDirectionAbsDegrees + 360, gapX: 0, gapY: 0, cosGapHalf: 2, closed: true };
    var g = gapDirectionAbsDegrees * D2R;
    return { center: center, radius: mid, tube: t, startDeg: gapDirectionAbsDegrees + start, endDeg: gapDirectionAbsDegrees + 360 - start,
      gapX: Math.cos(g), gapY: Math.sin(g), cosGapHalf: Math.cos((360 - (360 - 2 * start)) * 0.5 * D2R), closed: false };
  }
  function arcEndPoint(arc, end) { var a = (end ? arc.endDeg : arc.startDeg) * D2R; return { x: arc.center.x + arc.radius * Math.cos(a), y: arc.center.y + arc.radius * Math.sin(a) }; }
  function arcContainsAngle(arc, degrees) { return arc.closed || repeat(degrees - arc.startDeg, 360) <= arc.endDeg - arc.startDeg; }
  function arcContainsDirection(arc, v) { return arc.closed || v.x * arc.gapX + v.y * arc.gapY < len(v) * arc.cosGapHalf; }
  function arcDistanceToCenterline(arc, p) {
    var vx = p.x - arc.center.x, vy = p.y - arc.center.y, l = Math.sqrt(vx * vx + vy * vy);
    if (arc.closed || vx * arc.gapX + vy * arc.gapY < l * arc.cosGapHalf) return Math.abs(l - arc.radius);
    var e0 = arcEndPoint(arc, false), e1 = arcEndPoint(arc, true);
    return Math.min(len(sub(p, e0)), len(sub(p, e1)));
  }
  function arcSdf(arc, p) { return arcDistanceToCenterline(arc, p) - arc.tube; }

  // ---------- RotateShapeMath ----------
  function polar(r, degrees) { return { x: Math.cos(degrees * D2R) * r, y: Math.sin(degrees * D2R) * r }; }

  function arcArcDistance(a, b) {
    var best = INF;
    if (!a.closed) best = Math.min(best, Math.min(arcDistanceToCenterline(b, arcEndPoint(a, false)), arcDistanceToCenterline(b, arcEndPoint(a, true))));
    if (!b.closed) best = Math.min(best, Math.min(arcDistanceToCenterline(a, arcEndPoint(b, false)), arcDistanceToCenterline(a, arcEndPoint(b, true))));
    var delta = sub(b.center, a.center), d = len(delta);
    if (d <= 1e-5) {
      if (arcContainsAngle(a, b.startDeg) || arcContainsAngle(a, b.endDeg) || arcContainsAngle(b, a.startDeg)) best = Math.min(best, Math.abs(a.radius - b.radius));
      return best;
    }
    var u = mul(delta, 1 / d);
    for (var sa = -1; sa <= 1; sa += 2)
      for (var sb = -1; sb <= 1; sb += 2) {
        var pa = add(a.center, mul(u, sa * a.radius)), pb = add(b.center, mul(u, sb * b.radius));
        if (arcContainsDirection(a, sub(pa, a.center)) && arcContainsDirection(b, sub(pb, b.center))) best = Math.min(best, len(sub(pa, pb)));
      }
    if (d <= a.radius + b.radius && d >= Math.abs(a.radius - b.radius)) {
      var x = (d * d + a.radius * a.radius - b.radius * b.radius) / (2 * d), h = Math.sqrt(Math.max(0, a.radius * a.radius - x * x));
      var p = add(a.center, mul(u, x)), perp = V(-u.y, u.x);
      for (var s = -1; s <= 1; s += 2) {
        var q = add(p, mul(perp, h * s));
        if (arcContainsDirection(a, sub(q, a.center)) && arcContainsDirection(b, sub(q, b.center))) return 0;
      }
    }
    return best;
  }

  // Shared edge-sampling scheme of MinSdfOverConvex (5 samples + 2 refinement rounds of 3) for any sdf(point).
  function minSdfOverEdges(sdf, poly) {
    var best = INF, count = poly.length;
    for (var i = 0; i < count; i++) {
      var a = poly[i], b = poly[(i + 1) % count], bestT = 0, bestV = INF, k, t, v;
      for (k = 0; k <= 4; k++) { t = k / 4; v = sdf(vlerp(a, b, t)); if (v < bestV) { bestV = v; bestT = t; } }
      var half = 0.25;
      for (var round = 0; round < 2; round++) {
        var lo = Math.max(0, bestT - half), hi = Math.min(1, bestT + half), center = bestT;
        for (k = 0; k <= 2; k++) { t = lerp(lo, hi, k / 2); v = sdf(vlerp(a, b, t)); if (v < bestV) { bestV = v; center = t; } }
        bestT = center; half *= 0.25;
      }
      best = Math.min(best, bestV);
    }
    return best;
  }

  function minSdfArcOverConvex(arc, poly) {
    var count = poly.length, cx = 0, cy = 0, i;
    for (i = 0; i < count; i++) { cx += poly[i].x; cy += poly[i].y; }
    cx /= count; cy /= count;
    var qr = 0; for (i = 0; i < count; i++) qr = Math.max(qr, Math.hypot(poly[i].x - cx, poly[i].y - cy));
    var dc = Math.hypot(cx - arc.center.x, cy - arc.center.y);
    if (dc + qr < arc.radius - arc.tube || dc - qr > arc.radius + arc.tube) return INF;
    var best = minSdfOverEdges(function (p) { return arcSdf(arc, p); }, poly);
    if (!arc.closed && (convexContains(poly, arcEndPoint(arc, false)) || convexContains(poly, arcEndPoint(arc, true)))) best = Math.min(best, -arc.tube);
    return best;
  }

  function distanceToSegment(p, a, b) {
    var abx = b.x - a.x, aby = b.y - a.y, l = abx * abx + aby * aby;
    var t = l < 1e-12 ? 0 : clamp01(((p.x - a.x) * abx + (p.y - a.y) * aby) / l);
    return Math.hypot(p.x - (a.x + abx * t), p.y - (a.y + aby * t));
  }

  function segmentSegmentDistance(a, b, c, d) {
    var r = sub(b, a), s = sub(d, c), cr = r.x * s.y - r.y * s.x;
    if (Math.abs(cr) > 1e-9) {
      var q = sub(c, a), t = (q.x * s.y - q.y * s.x) / cr, u = (q.x * r.y - q.y * r.x) / cr;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return 0;
    }
    return Math.min(Math.min(distanceToSegment(a, c, d), distanceToSegment(b, c, d)), Math.min(distanceToSegment(c, a, b), distanceToSegment(d, a, b)));
  }

  function segmentArcDistance(a, b, arc) {
    var best = Math.min(arcDistanceToCenterline(arc, a), arcDistanceToCenterline(arc, b));
    if (!arc.closed) best = Math.min(best, Math.min(distanceToSegment(arcEndPoint(arc, false), a, b), distanceToSegment(arcEndPoint(arc, true), a, b)));
    var d = sub(b, a), l2 = len2(d);
    if (l2 < 1e-12) return best;
    var ac = sub(arc.center, a), t0 = dot(ac, d) / l2;
    if (t0 > 0 && t0 < 1) {
      var foot = add(a, mul(d, t0)), v = sub(foot, arc.center);
      if (len2(v) < 1e-12 || arcContainsDirection(arc, v)) best = Math.min(best, Math.abs(len(v) - arc.radius));
    }
    var qa = l2, qb = -2 * dot(ac, d), qc = len2(ac) - arc.radius * arc.radius, disc = qb * qb - 4 * qa * qc;
    if (disc >= 0) {
      var root = Math.sqrt(disc);
      for (var sg = -1; sg <= 1; sg += 2) {
        var t = (-qb + sg * root) / (2 * qa);
        if (t >= 0 && t <= 1 && arcContainsDirection(arc, sub(add(a, mul(d, t)), arc.center))) return 0;
      }
    }
    return best;
  }

  function pointInPolygon(polygon, p) {
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var pi = polygon[i], pj = polygon[j];
      if ((pi.y > p.y) !== (pj.y > p.y) && p.x < (pj.x - pi.x) * (p.y - pi.y) / (pj.y - pi.y) + pi.x) inside = !inside;
    }
    return inside;
  }
  function distanceToPolygon(p, polygon) {
    if (pointInPolygon(polygon, p)) return 0;
    var best = INF;
    for (var i = 0; i < polygon.length; i++) best = Math.min(best, distanceToSegment(p, polygon[i], polygon[(i + 1) % polygon.length]));
    return best;
  }
  function convexContains(poly, p) {
    var pos = false, neg = false, n = poly.length;
    for (var i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n], c = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
      if (c > 0) pos = true; else if (c < 0) neg = true;
      if (pos && neg) return false;
    }
    return true;
  }
  function satDepth(a, b) {
    var depth = INF;
    for (var pass = 0; pass < 2; pass++) {
      var p = pass === 0 ? a : b, n = p.length;
      for (var i = 0; i < n; i++) {
        var ex = p[(i + 1) % n].x - p[i].x, ey = p[(i + 1) % n].y - p[i].y, l = Math.sqrt(ex * ex + ey * ey); if (l < 1e-9) continue;
        var ax = -ey / l, ay = ex / l, minA = INF, maxA = -INF, minB = INF, maxB = -INF, k, v;
        for (k = 0; k < a.length; k++) { v = a[k].x * ax + a[k].y * ay; if (v < minA) minA = v; if (v > maxA) maxA = v; }
        for (k = 0; k < b.length; k++) { v = b[k].x * ax + b[k].y * ay; if (v < minB) minB = v; if (v > maxB) maxB = v; }
        var overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
        if (overlap <= 0) return 0;
        if (overlap < depth) depth = overlap;
      }
    }
    return depth === INF ? 0 : depth;
  }

  // Collider polygon of a ring body (ring-local), as RotateShapeMath.BodyPolygon. Rendering/debug only.
  function bodyPolygon(inner, outer, gapDegrees, directionDegrees, arcPoints, capInteriorPoints) {
    var mid = (inner + outer) * 0.5, cap = (outer - inner) * 0.5, a0 = gapDegrees * 0.5 + cap / mid * R2D, a1 = 360 - a0, pts = [], i;
    function addCap(degrees, side) {
      var radial = polar(1, degrees), tangent = mul(V(-radial.y, radial.x), side), c = mul(radial, mid);
      for (var k = 1; k <= capInteriorPoints; k++) { var phi = Math.PI * k / (capInteriorPoints + 1); pts.push(add(c, mul(add(mul(radial, Math.cos(phi) * side), mul(tangent, Math.sin(phi))), cap))); }
    }
    for (i = 0; i < arcPoints; i++) pts.push(polar(outer, lerp(a0, a1, i / (arcPoints - 1)) + directionDegrees));
    addCap(a1 + directionDegrees, 1);
    for (i = 0; i < arcPoints; i++) pts.push(polar(inner, lerp(a1, a0, i / (arcPoints - 1)) + directionDegrees));
    addCap(a0 + directionDegrees, -1);
    return pts;
  }

  // ---------- RotateCenterline: straight segments joined by fillets, swept by a disc of radius `tube` ----------
  function toward(from, to, distance) {
    var d = sub(to, from), l = len(d);
    if (distance >= l) throw new Error("Stick path shorter than its end inset");
    return add(from, mul(d, distance / l));
  }
  function centerlineBuild(path, cornerRadius, endInset, tube) {
    if (!path || path.length < 2) throw new Error("A stick needs at least 2 path points");
    var p = path.map(function (q) { return V(q.x, q.y); });
    p[0] = toward(p[0], p[1], endInset); p[p.length - 1] = toward(p[p.length - 1], p[p.length - 2], endInset);
    var list = [], cursor = p[0];
    for (var i = 1; i < p.length - 1; i++) {
      var d1 = sub(p[i], p[i - 1]), d2 = sub(p[i + 1], p[i]), l1 = len(d1), l2 = len(d2);
      if (l1 < 1e-6 || l2 < 1e-6) throw new Error("Degenerate stick path segment");
      var u1 = mul(d1, 1 / l1), u2 = mul(d2, 1 / l2), cr = u1.x * u2.y - u1.y * u2.x, turn = Math.atan2(cr, dot(u1, u2));
      if (Math.abs(turn) < 1e-5) continue;
      var half = Math.tan(Math.abs(turn) * 0.5);
      var tangent = Math.min(cornerRadius * half, Math.min(l1 * (i === 1 ? 1 : 0.5), l2 * (i === p.length - 2 ? 1 : 0.5)));
      var radius = tangent / half, start = sub(p[i], mul(u1, tangent)), end = add(p[i], mul(u2, tangent));
      if (tangent > 1e-6) {
        list.push({ a: cursor, b: start, center: V(0, 0), radius: 0, angle0: 0, angle1: 0 });
        var normal = turn > 0 ? V(-u1.y, u1.x) : V(u1.y, -u1.x), center = add(start, mul(normal, radius));
        var a0 = Math.atan2(start.y - center.y, start.x - center.x);
        list.push({ center: center, radius: radius, angle0: a0, angle1: a0 + turn, a: start, b: end });
        cursor = end;
      }
    }
    list.push({ a: cursor, b: p[p.length - 1], center: V(0, 0), radius: 0, angle0: 0, angle1: 0 });
    return { primitives: list, tube: tube };
  }
  function isArc(prim) { return prim.radius > 0; }
  function clStart(cl) { return cl.primitives[0].a; }
  function clEnd(cl) { return cl.primitives[cl.primitives.length - 1].b; }
  function distanceToPrimitive(s, p) {
    if (!isArc(s)) return distanceToSegment(p, s.a, s.b);
    var lo = Math.min(s.angle0, s.angle1), hi = Math.max(s.angle0, s.angle1);
    var angle = Math.atan2(p.y - s.center.y, p.x - s.center.x), t = repeat(angle - lo, Math.PI * 2);
    if (t <= hi - lo) return Math.abs(len(sub(p, s.center)) - s.radius);
    return Math.min(len(sub(p, s.a)), len(sub(p, s.b)));
  }
  function clDistance(cl, p) { var best = INF; for (var i = 0; i < cl.primitives.length; i++) best = Math.min(best, distanceToPrimitive(cl.primitives[i], p)); return best; }
  function clSdf(cl, p) { return clDistance(cl, p) - cl.tube; }
  function clLength(cl) { var s = 0; cl.primitives.forEach(function (q) { s += isArc(q) ? q.radius * Math.abs(q.angle1 - q.angle0) : len(sub(q.b, q.a)); }); return s; }
  function clSample(cl, step) {
    var pts = [clStart(cl)];
    cl.primitives.forEach(function (s) {
      var n, k;
      if (!isArc(s)) { n = Math.max(1, Math.ceil(len(sub(s.b, s.a)) / step)); for (k = 1; k <= n; k++) pts.push(vlerp(s.a, s.b, k / n)); }
      else { n = Math.max(2, Math.ceil(s.radius * Math.abs(s.angle1 - s.angle0) / step)); for (k = 1; k <= n; k++) { var a = lerp(s.angle0, s.angle1, k / n); pts.push(add(s.center, V(s.radius * Math.cos(a), s.radius * Math.sin(a)))); } }
    });
    return pts;
  }

  // ---------- stick pose + RotateChainMath ----------
  function poseMake(origin, angleDeg, offset) {
    var r = angleDeg * D2R, c = Math.cos(r), s = Math.sin(r);
    return { origin: V(origin.x + c * offset, origin.y + s * offset), cos: c, sin: s, angleDeg: angleDeg };
  }
  function poseToWorld(pose, l) { return V(pose.origin.x + pose.cos * l.x - pose.sin * l.y, pose.origin.y + pose.sin * l.x + pose.cos * l.y); }
  function poseToLocal(pose, w) { var dx = w.x - pose.origin.x, dy = w.y - pose.origin.y; return V(pose.cos * dx + pose.sin * dy, -pose.sin * dx + pose.cos * dy); }

  function filletCapsule(f, pose, tube) {
    var lo = Math.min(f.angle0, f.angle1) * R2D + pose.angleDeg, hi = Math.max(f.angle0, f.angle1) * R2D + pose.angleDeg;
    var gapDirection = (lo + hi) * 0.5 + 180, halfCone = (360 - (hi - lo)) * 0.5;
    return { center: poseToWorld(pose, f.center), radius: f.radius, tube: tube, startDeg: lo, endDeg: hi, closed: false,
      gapX: Math.cos(gapDirection * D2R), gapY: Math.sin(gapDirection * D2R), cosGapHalf: Math.cos(halfCone * D2R) };
  }
  function chainDistanceToArc(chain, pose, arc) {
    var best = INF;
    for (var i = 0; i < chain.primitives.length; i++) {
      var prim = chain.primitives[i];
      var d = isArc(prim) ? arcArcDistance(filletCapsule(prim, pose, chain.tube), arc) : segmentArcDistance(poseToWorld(pose, prim.a), poseToWorld(pose, prim.b), arc);
      if (d < best) best = d;
    }
    return best;
  }
  function chainDistanceToChain(a, poseA, b, poseB) {
    var best = INF;
    for (var i = 0; i < a.primitives.length; i++)
      for (var j = 0; j < b.primitives.length; j++) {
        var p = a.primitives[i], q = b.primitives[j], d;
        if (!isArc(p) && !isArc(q)) d = segmentSegmentDistance(poseToWorld(poseA, p.a), poseToWorld(poseA, p.b), poseToWorld(poseB, q.a), poseToWorld(poseB, q.b));
        else if (isArc(p) && isArc(q)) d = arcArcDistance(filletCapsule(p, poseA, a.tube), filletCapsule(q, poseB, b.tube));
        else if (isArc(p)) d = segmentArcDistance(poseToWorld(poseB, q.a), poseToWorld(poseB, q.b), filletCapsule(p, poseA, a.tube));
        else d = segmentArcDistance(poseToWorld(poseA, p.a), poseToWorld(poseA, p.b), filletCapsule(q, poseB, b.tube));
        if (d < best) best = d;
      }
    return best;
  }
  function chainMinSdfOverConvex(chain, pose, poly) {
    var best = minSdfOverEdges(function (p) { return clSdf(chain, poseToLocal(pose, p)); }, poly);
    if (convexContains(poly, poseToWorld(pose, clStart(chain))) || convexContains(poly, poseToWorld(pose, clEnd(chain)))) best = Math.min(best, -chain.tube);
    return best;
  }
  function chainBounds(chain, pose) {
    var minX = INF, minY = INF, maxX = -INF, maxY = -INF;
    function inc(p) { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y; if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y; }
    chain.primitives.forEach(function (prim) {
      inc(poseToWorld(pose, prim.a)); inc(poseToWorld(pose, prim.b));
      if (isArc(prim)) {
        var c = prim.center, r = prim.radius;
        inc(poseToWorld(pose, V(c.x + r, c.y + r))); inc(poseToWorld(pose, V(c.x - r, c.y - r))); inc(poseToWorld(pose, V(c.x + r, c.y - r))); inc(poseToWorld(pose, V(c.x - r, c.y + r)));
      }
    });
    var pad = chain.tube;
    return { xMin: minX - pad, yMin: minY - pad, xMax: maxX + pad, yMax: maxY + pad };
  }
  function rectOverlaps(a, b) { return b.xMax > a.xMin && b.xMin < a.xMax && b.yMax > a.yMin && b.yMin < a.yMax; }

  RR.D2R = D2R; RR.R2D = R2D;
  RR.M = {
    clamp01: clamp01, lerp: lerp, repeat: repeat, deltaAngle: deltaAngle, sign: sign,
    V: V, add: add, sub: sub, mul: mul, dot: dot, cross: cross, len: len, len2: len2, normalize: normalize, vlerp: vlerp, rot: rot, signedAngle: signedAngle, polar: polar,
    arcCreate: arcCreate, arcEndPoint: arcEndPoint, arcContainsAngle: arcContainsAngle, arcContainsDirection: arcContainsDirection, arcDistanceToCenterline: arcDistanceToCenterline, arcSdf: arcSdf,
    CLOSED_GAP_DEGREES: CLOSED_GAP_DEGREES,
    arcArcDistance: arcArcDistance, minSdfArcOverConvex: minSdfArcOverConvex, segmentSegmentDistance: segmentSegmentDistance, segmentArcDistance: segmentArcDistance,
    distanceToSegment: distanceToSegment, pointInPolygon: pointInPolygon, distanceToPolygon: distanceToPolygon, convexContains: convexContains, satDepth: satDepth, bodyPolygon: bodyPolygon,
    centerlineBuild: centerlineBuild, isArc: isArc, clStart: clStart, clEnd: clEnd, distanceToPrimitive: distanceToPrimitive, clDistance: clDistance, clSdf: clSdf, clLength: clLength, clSample: clSample,
    poseMake: poseMake, poseToWorld: poseToWorld, poseToLocal: poseToLocal,
    filletCapsule: filletCapsule, chainDistanceToArc: chainDistanceToArc, chainDistanceToChain: chainDistanceToChain, chainMinSdfOverConvex: chainMinSdfOverConvex, chainBounds: chainBounds, rectOverlaps: rectOverlaps
  };
})(typeof module === "object" && module.exports ? require("./rr-ns.js") : (self.RR = self.RR || {}));

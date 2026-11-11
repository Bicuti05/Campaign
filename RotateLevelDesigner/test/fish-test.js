// Self-check of the Challenge Fish placement rule (RR.Fish). Run: node test/fish-test.js
const assert = require("assert");
const RR = require("../rr-core.js"), V = RR.M.V;

function level(build) { const doc = RR.Document.createNew("fish"); build(doc); return doc.data; }
const color = [1, 0, 0, 1];
const tier = (lv, id) => RR.Fish.check(lv).find(f => f.id === id).tier;

// 1. a lone closed ring is the best place; a lone open ring is next
let lv = level(d => { d.addRing(V(0, 0), 1.75, 0, 0, color); d.addRing(V(6, 0), 1.75, 90, 0, color); });
assert.strictEqual(tier(lv, lv.parts[0].partId), 0, "closed ring should be tier 0");
assert.strictEqual(tier(lv, lv.parts[1].partId), 1, "open ring should be tier 1");

// 2. a stick lying across the centre covers the Fish: never a candidate
lv = level(d => { d.addRing(V(0, 0), 1.75, 90, 0, color); d.addStick("straight", V(0, 0), 90, 3, 1, color, null); });
const ring = lv.parts.find(p => p.kind === "ring").partId;
assert.strictEqual(tier(lv, ring), -1, "ring with a stick over its centre must be rejected");
assert.ok(!RR.Fish.candidates(lv).some(f => f.id === ring), "rejected ring listed as a candidate");

// 3. analyze() warns about a marked ring that is covered
lv.parts.find(p => p.partId === ring).canCollect = true;
assert.ok(RR.analyze(lv).warnings.some(w => w.code === "fish-blocked"), "no fish-blocked warning");
console.log("PASS fish rule: 3 checks");

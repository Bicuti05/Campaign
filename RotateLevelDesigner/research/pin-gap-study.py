"""Measure authored pin anchor directions against owner gaps; never infer gameplay.

Uses reconstructed world transforms/features from Ring Lab, not screenshot order.
Logic and mesh gap margins are distinct. Summary is descriptive of resource assets,
not of unique campaign levels or player difficulty.
"""
from pathlib import Path
import json
import math
import statistics

REPO = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / "20261013"
data = json.loads((REPO / "LevelTrainingData/ring-lab/data/original_levels.json").read_text(encoding="utf-8"))


def delta(a, b):
    return abs((a - b + 180) % 360 - 180)


def percentile(values, p):
    s = sorted(values)
    pos = (len(s) - 1) * p
    lo = math.floor(pos)
    hi = math.ceil(pos)
    return s[lo] + (s[hi] - s[lo]) * (pos - lo)


rows = []
issues = []
for level in data["levels"]:
    owners = {p["id"]: p for p in level["parts"] if "ring" in p}
    features = {(f["owner"], f["id"]): f for f in level["features"]}
    pins = {(l["sourceRingId"], l["pinFeatureId"]) for l in level["links"]}
    for owner, feature in sorted(pins):
        p = owners.get(owner)
        f = features.get((owner, feature))
        if p is None or f is None:
            issues.append([level["id"], owner, feature, "missing owner/feature"])
            continue
        m = p["worldMatrix"]
        local_dir = math.radians(p["ring"]["gapDirection"])
        gx = m[0][0] * math.cos(local_dir) + m[0][1] * math.sin(local_dir)
        gy = m[1][0] * math.cos(local_dir) + m[1][1] * math.sin(local_dir)
        dx = f["position"][0] - p["position"][0]
        dy = f["position"][1] - p["position"][1]
        if math.hypot(dx, dy) < 1e-6:
            issues.append([level["id"], owner, feature, "pin at owner center"])
            continue
        separation = delta(math.degrees(math.atan2(dy, dx)), math.degrees(math.atan2(gy, gx)))
        mesh_gap = p["ring"]["gapAngle"]
        logic_gap = p["partData"].get("GapAngleDeg")
        logic_gap = float(logic_gap) if logic_gap is not None else None
        rows.append({"asset_id": level["id"], "owner": owner, "feature": feature,
                     "pin_to_gap_center_deg": round(separation, 4),
                     "mesh_gap_deg": mesh_gap, "logic_gap_deg": logic_gap,
                     "owner_local_radius": p["ring"]["radius"],
                     "mesh_margin_deg": round(separation - mesh_gap / 2, 4) if mesh_gap > 0 else None,
                     "logic_margin_deg": round(separation - logic_gap / 2, 4) if logic_gap and logic_gap > 0 else None})
        if mesh_gap > 0 and separation - mesh_gap / 2 < 0:
            rows[-1]["measurement_flag"] = "axis_inside_mesh_gap; needs source review, not a normal-layout example"


def summarize(field, subset=None):
    selected = rows if subset is None else subset
    values = [r[field] for r in selected if r[field] is not None]
    return {"samples": len(values), "min_deg": min(values),
            "p10_deg": round(percentile(values, .1), 4),
            "p25_deg": round(percentile(values, .25), 4),
            "median_deg": statistics.median(values),
            "p75_deg": round(percentile(values, .75), 4),
            "below_0_deg": sum(v < 0 for v in values),
            "below_15_deg": sum(v < 15 for v in values),
            "below_30_deg": sum(v < 30 for v in values),
            "at_least_45_deg": sum(v >= 45 for v in values)}

result = {"format": "rotate-pin-gap-study", "version": 1,
          "source": "LevelTrainingData/ring-lab/data/original_levels.json",
          "unique_authored_linked_pin_anchors": len(rows),
          "definition": "Absolute shortest angular distance pin-anchor to owner gap-center, minus half-gap. Positive = pin axis outside the gap; does not account for stem width.",
          "mesh": summarize("mesh_margin_deg"), "logic": summarize("logic_margin_deg"),
          "logic_90_subset": {"mesh": summarize("mesh_margin_deg", [r for r in rows if r["logic_gap_deg"] is not None and abs(r["logic_gap_deg"] - 90) < .001]),
                              "logic": summarize("logic_margin_deg", [r for r in rows if r["logic_gap_deg"] is not None and abs(r["logic_gap_deg"] - 90) < .001])},
          "issues": issues, "samples": rows,
          "limits": ["Pin anchors referenced by authored ringLinks only; unlinked decorative attachments excluded.",
                     "No ID mapping to screenshot/campaign.",
                     "Source bounds, viewport, physics and motion not part of this measurement.",
                     "Closed rings excluded from gap-margin summary.",
                     "A pin-axis margin is not full visible stem clearance; inspect geometry before accepting.",
                     "Descriptive sample distribution is not a universal minimum margin rule."]}
(OUT / "pin-gap-study.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"anchors": len(rows), "mesh": result["mesh"], "logic": result["logic"], "issues": len(issues)}, ensure_ascii=False))

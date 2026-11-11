"""Inventory local references and make contact sheets; never infer campaign IDs.

Run with bundled Python/Pillow. SHA and decoded-pixel duplicates are exact checks;
dHash candidates only propose visual review, never merge levels automatically.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import hashlib
import json
import collections

REPO = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / "20261013"
OUT.mkdir(parents=True, exist_ok=True)
FONT = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 15)


def dhash(im):
    tiny = im.convert("L").resize((9, 8))
    p = list(tiny.get_flattened_data())
    return sum((p[y * 9 + x] > p[y * 9 + x + 1]) << (y * 8 + x)
               for y in range(8) for x in range(8))


def sheets(files, label):
    for start in range(0, len(files), 20):
        chunk = files[start:start + 20]
        sheet = Image.new("RGB", (1100, 1420), "#f5f1e8")
        draw = ImageDraw.Draw(sheet)
        for i, record in enumerate(chunk):
            col, row = i % 5, i // 5
            with Image.open(REPO / record["source_image"]) as im:
                im = ImageOps.exif_transpose(im).convert("RGB")
                thumb = ImageOps.contain(im, (210, 320))
                sheet.paste(thumb, (col * 220 + (220 - thumb.width) // 2,
                                   row * 355 + (320 - thumb.height) // 2))
            draw.text((col * 220 + 6, row * 355 + 325), record["reference_id"],
                      fill="#222222", font=FONT)
        sheet.save(OUT / f"{label}-sheet-{start // 20 + 1}.jpg", quality=93)


records = []
for folder, prefix, role in [("LevelImage", "ref", "gameplay_reference"),
                             ("NewLevelImage", "new", "separate_user_material")]:
    files = sorted((REPO / "LevelTrainingData/TrainingLevel" / folder).glob("*.jpg"))
    group = []
    for i, f in enumerate(files, 1):
        with Image.open(f) as raw:
            im = ImageOps.exif_transpose(raw).convert("RGB")
            group.append({"reference_id": f"{prefix}_{i:03d}",
                          "source_image": f.relative_to(REPO).as_posix(),
                          "source_role": role,
                          "sha256": hashlib.sha256(f.read_bytes()).hexdigest(),
                          "pixel_sha256": hashlib.sha256(im.tobytes()).hexdigest(),
                          "width": im.width, "height": im.height,
                          "dhash": f"{dhash(im):016x}",
                          "campaign_level_id": None,
                          "duplicate_group_id": None,
                          "label_status": "not_annotated",
                          "ui_crop_verified": False})
    sheets(group, prefix)
    records.extend(group)

exact = []
for field in ["sha256", "pixel_sha256"]:
    buckets = collections.defaultdict(list)
    for r in records:
        buckets[(r["width"], r["height"], r[field])].append(r["reference_id"])
    exact.extend({"method": field, "references": ids} for ids in buckets.values() if len(ids) > 1)
near = []
refs = [r for r in records if r["source_role"] == "gameplay_reference"]
for i, a in enumerate(refs):
    for b in refs[i + 1:]:
        distance = (int(a["dhash"], 16) ^ int(b["dhash"], 16)).bit_count()
        if distance <= 8:
            near.append({"a": a["reference_id"], "b": b["reference_id"],
                         "dhash_distance": distance, "status": "needs_visual_review"})
out = {"format": "rotate-reference-audit", "version": 1,
       "reference_count": len(refs), "separate_material_count": len(records) - len(refs),
       "unique_level_count": None, "exact_duplicate_groups": exact,
       "similarity_candidates": sorted(near, key=lambda p: p["dhash_distance"]),
       "missing_report_inputs": ["drive-download-20261013T115434Z-1-001.zip",
                                 "rotate_reference_study/index.txt and contact sheets",
                                 "generator baselines v0-v6"],
       "records": records,
       "limits": ["Reference IDs are sorted-filename local IDs, not the report's 01-63 index.",
                  "No campaign or prefab mapping from screenshot order.",
                  "dHash compares full screenshots including UI; candidates are not proven duplicates.",
                  "NewLevelImage kept separate until its provenance is established."]}
annotation_file = OUT / "reference-annotations.json"
if annotation_file.exists():
    labels = json.loads(annotation_file.read_text(encoding="utf-8"))
    subset = {r["reference_id"]: r for r in labels["subset"]}
    groups = {r: g["id"] for g in labels["same_layout_groups"] for r in g["references"]}
    for record in records:
        record["duplicate_group_id"] = groups.get(record["reference_id"])
        if record["reference_id"] in subset:
            record["label_status"] = "manual_qualitative_relations"
    out["provisional_visual_layout_groups"] = labels["provisional_visual_layout_groups"]
    out["manual_subset_count"] = len(subset)
(OUT / "reference-audit.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"references": len(refs), "separate": len(records) - len(refs),
                  "exact_groups": len(exact), "review_pairs": len(near)}, ensure_ascii=False))

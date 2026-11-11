# NEW_CAMPAIGN_500_REORDER v2 — Rotate Ring

**v2:** chèn 20 level từ gói upload 10.11 + đề xuất Normal chờ GD. Xem UPLOAD_20261110_INSERT_REPORT.md, UPLOAD_20261110_CANDIDATE_AUDIT.csv, NEW_CAMPAIGN_500_MAPPING_v2.*. Báo cáo curve/diversity/audit khác là của v1.

**Sửa theo tool TURP mới (11/11):** `NEW_CAMPAIGN_500_SELECTED_LEVELS_TURP/` = 318 level đổi sang định dạng turp-pack, sửa cờ cá theo luật mới, giải lại bằng lõi mới (xích). Xem TURP_TOOL_FIX_REPORT.md/.csv. Dùng thư mục này để nhập vào tool mới / gửi Dev.

Mở `NEW_CAMPAIGN_500_PREVIEW/index.html` (offline) để duyệt 1–500: Prev/Next (phím ←/→), Jump, lọc Normal/Special/Symmetrical/Missing/Cần GD, so sánh level liền trước–sau cùng tỉ lệ camera, xem level không được xếp.

| File | Nội dung |
|---|---|
| NEW_CAMPAIGN_500_MAPPING_v2.xlsx / .csv / .json | Mapping 500 vị trí + đánh giá (Summary, Mapping, Missing_Briefs, Rejected_NotSelected, Pool_All_Candidates, Weights_Sensitivity) |
| NEW_CAMPAIGN_500_SELECTED_LEVELS/ | 298 pack được chọn, giữ nguyên byte; tên `VịTrí_Loại_Candidate`; levelId bên trong KHÔNG đổi |
| DIFFICULTY_CURVE_FIT_REPORT.md (+PNG) | Mức bám curve, scoring/trọng số, sensitivity |
| CAMPAIGN_DIVERSITY_REPORT.md | Object/layout/pattern, cửa sổ 3/5/10/20, neighbor similarity |
| SPECIAL_AND_SYMMETRY_AUDIT.md | Kiểm 100 Special + 50 Symmetrical |
| REJECTED_LEVELS.csv | 219 candidate không xếp + lý do |
| MISSING_LEVELS_AND_GENERATION_BRIEFS.csv | 202 slot Missing + brief sinh level |
| GD_REVIEW_PRIORITIES.md | Danh sách nên xem trước |
| VALIDATION_REPORT.md | Hard checks + tình trạng proof/gate |

Candidate key: `P###` = level ở vị trí ### của campaign 500 cũ (bản được chọn trong geometry_feedback_20261110); `U###` = shape upload 369–418 chưa từng xếp.
Trạng thái: Proposal — NOT Production Ready. Không import ingame, không sửa nguồn/curve.

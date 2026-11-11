# VALIDATION REPORT — New Campaign 500

## Hard checks

| Check | Kết quả | Chi tiết |
|---|---|---|
| Đủ 500 Campaign Positions | PASS | 500 dòng |
| Không trùng position | PASS |  |
| Không trùng selected candidate | PASS | 298 level |
| Không trùng runtime hash giữa các level đã chọn | PASS |  |
| Special chỉ ở đuôi 0/3 | PASS |  |
| Symmetrical chỉ ở đuôi 6 | PASS |  |
| Level trong slot Special đều là Recognizable Picture | PASS |  |
| Level trong slot Symmetrical đều Pass Symmetry Review | PASS |  |
| Slot Normal không chứa Recognizable Picture | PASS |  |
| Không level nào trong danh sách Bỏ/Chưa tốt của GD được xếp | PASS |  |
| Không level Rejected/Hold được âm thầm đưa vào | PASS |  |
| File level đã chọn giữ nguyên byte so với nguồn (SHA256) | PASS | 298 file |
| Nguồn không bị sửa (hash nguồn đọc lại khớp) | PASS |  |
| Mọi slot Missing có trong MISSING_LEVELS_AND_GENERATION_BRIEFS | PASS | 202 Missing |
| Mọi candidate không được chọn đều có lý do | PASS | 219 dòng |
| Difficulty Curve không đổi (SHA frozen) | PASS |  |
| Target R trong mapping khớp curve | PASS |  |
| Preview không tham chiếu file ngoài gói | PASS | 330 SVG |
| Không ghi đè ingame / source / campaign cũ | PASS | Chỉ ghi vào thư mục mới NEW_CAMPAIGN_500_REORDER; không chạy import |

## Gameplay proof

Đổi Campaign Position không đổi gameplay payload (byte giống hệt nguồn) → proof hiện có được tái sử dụng theo hash; **không chạy replay/solver mới**.

| Proof status (298 level đã xếp) | Số level |
|---|---|
| External JS replay complete (evidence cached) | 136 |
| Unverified | 77 |
| Saved route verified (JS replay) | 54 |
| Model-solved + route verified (JS) | 31 |

- "Unverified": không có bằng chứng giải trong mô hình đã kiểm (gồm 25 level 1–99 "Needs solvability review"). Unverified ≠ Invalid. Được xếp nhưng gắn GD Review, không bao giờ Ready.
- 14 level dùng bản chain overlay (experimental_chains): cơ chế xích **chưa được Designer/Unity hỗ trợ** (release gate BLOCKED). Bản trước-xích (before_source) có trong mapping cũ nếu Dev cần fallback.
- Fish/collectible seed theo levelId: levelId trong pack chưa đổi; nếu Dev đổi ID theo vị trí mới phải kiểm lại fish riêng.
- JS/model validation tách biệt với Native Unity/device validation. Native: **Unknown / chưa chạy**.

## Gate chưa đạt

- 202/500 slot Missing (86 Special, 29 Symmetrical, 87 Normal) — campaign **chưa hoàn chỉnh**.
- GD duyệt thứ tự + playtest độ khó người chơi: chưa có.
- Native Unity/device: chưa có.
- Chain mechanic: chưa implement.

**Trạng thái tổng: Proposal — NOT Production Ready.**
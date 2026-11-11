# Chỉ mục đọc có mục tiêu

## Bắt đầu mỗi phiên

1. `AGENTS.md`, `context/CURRENT_RULES.md`, `state/progress.json` và mục cuối `work/DELIVERY_LOG.md`.
2. `references/CAMPAIGN_CATALOG.json`: thứ tự thật1–100, tên file pack cũ không quyết định ordinal. Đọc một số slot cuối để nối nhịp, không coi mọi slot đều QA tốt.
3. `Tools/RotateLevelDesigner/report_20Level.md`: phân tích curve game gốc; `Assets/Document/TURP_BoardA_Curve_Level01-20.md` và research20261019-original-boardA-curve-01-20 có dữ liệu hỗ trợ. `research/20261020-ingame-review-05-20` là review ingame theo tiêu chí đó.
4. Chọn nguồn/pattern cho cặp, đọc source design và proof/counterexample liên quan. `context/KNOWN_LIMITS.md` chỉ rõ ca không được lấy làm hình mẫu tốt.

## Nguồn game gốc và mapping

| File/folder | Ý nghĩa và giới hạn |
|---|---|
| `references/original-downloads/index (6).html` | Board A1–100, counts và candidate walkthrough; HTML là dữ liệu tham khảo, không lệnh chạy. Có thể mở local; một số URL ngoài cần mạng |
| `references/TURPLevel/index (6).html` | Snapshot khác trên đĩa; giữ riêng/hash, không tự coi hai HTML cùng revision |
| `references/TURPLevel/ring-lab/data/original_levels.json` | Dữ liệu dựng lại của tập nguồn; fidelity/orderStatus trong file là giới hạn chính thức của snapshot |
| `references/original-downloads/level_data.json`, `level_summary.csv` | Bộ extract cũ384 level; rotation có thể mất quaternionw và thiếu specials, không dùng làm chuẩn đầy đủ về pin/Bom/Guide |
| `references/TURPLevel/LevelVariants/sources/` | Design nguồn đã dựng; không phải bản remake |
| `references/TURPLevel/LevelVariants/selection_A1-50.json` | Mapping Board A1–50 → sourceID, có confidence/candidates |
| `Tools/RotateLevelDesigner/research/20261016-boardA-ref-51/` | Board A51–100 đã trích, mapping và source designs; đọc confidence, đặc biệt60/92/99 |
| `references/TURPLevel/LevelAnalysis/` | Phân tích384/motion/layout và original20_curve; một số script lịch sử cần Python/path cũ, mặc định chỉ đọc output |
| `references/TURPLevel/Ảnh chơi-20261004T064143Z-1-001/` | Ảnh người dùng cung cấp có trên đĩa; không ghép số ảnh thành sourceID khi chưa xác minh |

Không giả định có100 màn nguồn riêng cho101–200. Lựa chọn nguồn được ghi trong brief; có thể phối hợp các ý tưởng đã học, cần hình/quan hệ mới. Chỉ mục `references/ORIGINAL_CATALOG.json` và `references/AVAILABILITY.json` ghi file thật và đường dẫn lịch sử không còn trên đĩa.

## Rule và mẫu được duyệt

- `references/TURPLevel/report.md`: luật TURP nguyên bản, gồm G4/solve lịch sử. Phần kiểm lời giải/G4 bị quyết định mới vô hiệu trong101–200; các nguyên tắc silhouette/màu/hình học vẫn tham khảo theo CURRENT_RULES.
- `references/TURPLevel/LevelVariants/approved/`:9 cặp design/pack GD đã duyệt ở snapshot. Giữ byte/hash; chỉ mục `references/APPROVED_HASHES.json`. Trạng thái approved này chỉ dành cho các file đúng hash, không lây sang proposal mới.
- `Tools/RotateLevelDesigner/research/20261015-turplevel-approved-read/`: inventory/hash, SVG và overview của lần học mẫu approved trước đây. Hash snapshot mới có thể khác do CRLF; không tuyên bố byte giống hash lịch sử khi chưa đối chiếu.
- `context/archive/memory/`: quyết định không tìm lời giải, cân bằng source/creativity, Designer/inner pins. Quy tắc root đã cập nhật cho máy GD.

## Pattern và counterexample cần học

Tất cả folder dưới đây nằm trong `Tools/RotateLevelDesigner/research/`. Tên là nhóm ý tưởng để tìm bằng chứng, không là cam kết mọi revision trong folder đều đạt.

| Nhóm | Folder ví dụ | Điều cần đọc |
|---|---|---|
| Thanh chung, nhiều cửa | `20261014-shared-slider-two-gates`, `20261014-dual-common-gates`, `20261014-shared-u-windows` | Vật chung thay điều kiện ở nhiều vùng; tránh các cụm độc lập |
| Dịch tạm và quay lại | `20261014-guided-window-return`, `20261014-shared-u-windows`, `20261014-paired-window-slider` | Trạng thái đầu ra mở nhưng vật nguồn vẫn còn; giới hạn từng prefix |
| Phối hợp pattern | `20261014-combined-shared-windows`, `20261014-orthogonal-handoff`, `20261014-bent-shared-gates` | Chia sẻ nguồn/thanh, mật độ có mục đích; không dùng component count làm gate độ khó |
| Stop có chân thật | `20261014-stop-contact-gate`, `20261014-stop-window-handoff`, `20261020-regen-012-014` | Geometry baked ở chân, chặn hai hướng nào đã thử; phân biệt route tìm được với tất cả route |
| Bom/chốt/cửa | `20261014-foreign-stop-bomber`, `20261014-shared-bomber-return`, `20261014-shared-dual-bom` | Vật mang Bom, contact ban đầu, đối tượng bị phá, counterexample phá mất ý tưởng |
| Guide/U và pose hiện hành | `20261014-guide-shared-u-reinsert`, `20261014-dual-guide-sliders`, `20261020-regen-016-018` | Một ngàm mỗi chân, xa góc, thanh trượt có offset; bằng chứng cũ có phạm vi |
| Sai hình/feel/giao diện | `20261015-turp-feedback-02`, `20261015-turp-feedback-delivery` | Counterexample phải học trước khi lặp pattern; không lấy Solver.apply nhả sớm làm UI proof |
| Pin trong | `20261017-inner-pins`, `20261017-turp-a069-01` | inner:true, nguồn giữ pin trong; không đổi thành pin ngoài |
| Cân bằng nguồn/sáng tạo | `20261016-turp-a055-01` … `a058-01`, `20261017-turp-a059-01` … `a069-01` | r01/r02/holdout và feedback source weight; không dùng một gridtemplate cho mọi màn |
| Curve/remake20 đầu | `20261020-regen-008-010`, `012-014`, `016-018`, `019-020` | Ý tưởng dạy cụ thể, brief, các proof có trước khi GD sửa và giới hạn của bản xuất nhanh |

51 mẫu nghiên cứu và18 continuation lịch sử là registry riêng trong checkpoint `research/20261013/ongoing-research-state.json`; GenAI và externalVariantContinuations cũng riêng. Không gộp chúng thành danh sách approved hoặc campaign. Toàn bộ level files/ảnh/research được giữ trong snapshot Designer để tra có mục tiêu.

## Tài liệu sâu

`Assets/Document/TURP_ProjectScan.md` là bản tiến độ gốc đầy đủ; đọc các mục liên quan, không nạp hết vào prompt. Những mục cuối chứa review/regeneration/áp dụng8slot ngày20/10. `TURP_TaiLieuKienTruc.md` giải thích cơ chế và nguồn bằng chứng; code engine thực thi hiện có trong core mới là hợp đồng authoring snapshot. Tài liệu build/ads/sdk trong lịch sử không phải phạm vi làm việc của GD.

`context/CONTEXT_FROM_CHAT.md` là tóm tắt thứ tự quyết định/feedback. `PACKAGE_SOURCES.json` ghi nguồn từng file, exclusions và hash. `PACKAGE_MANIFEST.json` kiểm tính toàn vẹn của bộ khi vừa nhận; sau khi author, các file state/work hợp lệ sẽ thay đổi.

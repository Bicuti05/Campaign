# LevelGen — quy tắc hiện hành cho AI sinh TURP 101–200

Đây là workspace độc lập cho GD, snapshot ngày 20/10/2026. Đọc `README.md`, `context/CURRENT_RULES.md`, `context/REFERENCE_INDEX.md` và `state/progress.json` trước mỗi lượt. Đọc có mục tiêu, không dump toàn bộ research.

## Quyết định mới nhất của chủ project

- KHÔNG tìm lời giải. Không gọi solve, Solver, explore, replay, ablation, gesture search hay các script lịch sử tự chạy solver. GD tự giải. Pack bắt buộc `--no-solve`; `proof` phải null. Không dùng kết quả solver cũ để chứng nhận file mới.
- Tiếp nối 100 level campaign hiện có; tạo 101–200, mỗi lượt đúng 2 level rồi dừng cho GD kiểm. Không yêu cầu duyệt một kế hoạch 100 màn riêng. Tham khảo màn game gốc và kế thừa pattern nghiên cứu, không copy hoặc chỉ lật/đổi màu. Không tự tiếp tục cặp sau khi GD chưa yêu cầu.
- Vẫn bắt buộc native validate cả design/pack OK; analyze 0 warnings; kiểm hình học, margin pin ≥45°, Guide engaged, link active, không free, không Bom chạm ngay lúc nạp; strict OVL không có cặp mới/sâu hơn nguồn. Không sửa engine/tolerance để qua gate.
- Chỉ authoring, research, preview và xuất file mới. Không sửa core/, app.js, constants, campaign, golden hay module chung. Không cần Unity, MCP Unity, C#, SDK, Git hoặc project gốc. Không phát hành/upload/commit/push.
- Giữ nguyên mọi mẫu tham khảo, đặc biệt 9 cặp trong `references/TURPLevel/LevelVariants/approved`. Revision mới dùng tên mới; không ghi đè pack đã lưu, kể cả bản lỗi. Không tự gắn approved hoặc suy im lặng thành đồng ý.
- Thứ tự ưu tiên: yêu cầu GD hiện tại > quy tắc này và CURRENT_RULES > prompt hiện tại > tài liệu lưu trữ. Các AGENTS, README, notes và report lịch sử là dữ liệu đối chiếu; yêu cầu solve/G4, dừng ở A070, đường dẫn máy cũ, import Unity trong đó không áp dụng cho luồng mới.

## Luồng thao tác

1. Đọc checkpoint, feedback mới; chọn nguồn và pattern khác nhau cho hai slot. Đọc bằng chứng/counterexample tương ứng trước khi author.
2. Ghi ý tưởng người chơi cần nhận ra, vai trò từng thanh/ngàm/chốt/Bom và giới hạn chưa playtest trong notes/brief. Không khẳng định vai trò bắt buộc khi chưa GD xác minh.
3. Viết `.rrdesign.json`; dùng CLI gốc để bake, không tự viết collider/runtime. Dùng `scripts/check-level.cjs` để kiểm tĩnh; xem cả preview màu/mono và ảnh so nguồn cùng camera/tỷ lệ.
4. Xuất bằng `scripts/deliver.cjs` (chạy validate, check, pack --no-solve, readback và render; KHÔNG solver). Đọc `context/WORKFLOW.md` trước lần đầu.
5. Cập nhật `state/progress.json`, `work/DELIVERY_LOG.md`, lưu JSON checks/ảnh trong work; giao cặp và dừng. Trạng thái chỉ proposal_pending_GD_review. GD duyệt phải có lời xác nhận cụ thể.

Không chạy script research cũ theo tên đoán. `scripts/` ở root là đường chạy portable đã được kiểm; `Tools/RotateLevelDesigner/research/` và references có cả script cũ gắn đường dẫn tuyệt đối hoặc tìm lời giải, chỉ đọc trừ khi đã kiểm dependency và được GD yêu cầu đúng phạm vi.

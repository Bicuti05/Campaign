# Cập nhật push mới nhất

195/200 có hồ sơ kiểm định kỹ thuật. Còn: 63, 73, 160, 170, 186. Các feedback hình/gameplay mới vẫn chưa sửa; xem PENDING_GD_FEEDBACK.md. Draft và bản đạt được phân biệt, chưa có bộ200 hoàn chỉnh cuối. CURRENT_STATE.json là trạng thái có thẩm quyền; các dòng bàn giao cũ dưới đây là lịch sử.

# Trạng thái bàn giao: 189/200 đã kiểm định, CHƯA hoàn thành

Còn thiếu: 30, 63, 73, 90, 125, 133, 160, 170, 183, 186, 193. Đã dừng mọi worker. Xem CURRENT_STATE.json và HANDOFF_PROMPT.md. Thư mục packs chỉ chứa pack có hồ sơ kiểm định; bản chưa đạt nằm ở drafts. Chưa có ZIP hoàn chỉnh200.

# Campaign — review 200 level

Mở index.html để xem ảnh PNG nhúng trực tiếp, lọc từng nhóm 20 hoặc loại level. Trên web, trang tự cập nhật khi có kết quả mới. STATUS.json thể hiện tiến độ thực tế; chỉ những màn có hồ sơ validation/NNN.json mới được ghi đã kiểm định.

Nguồn: 20 màn đầu đã chốt; ánh xạ Special do GD chỉ định; nguồn đối xứng GD duyệt; Normal chọn theo tham chiếu curve 500. Special cao hơn số vòng curve giữ nguồn, thấp hơn bổ sung liên kết thật. Các ngoại lệ được liệt kê trong STATUS.json.

Cá từ #11: ưu tiên tối đa 3 vị trí hợp lệ, vòng kín sạch → hở sạch → hành lang thanh → nguy cơ quét khi không còn lựa chọn tốt hơn; không che cá lúc bắt đầu. Cho phép 0–2 nếu thiếu chỗ.

Xích chỉ ở 101,102,108,118,131,145,158,198: hai vòng xa nhau, tránh cá/vòng bao vòng nhỏ. Số nấc tùy đường mở, kiểm tra bằng solver và replay. Dùng API Document.setLockCount của tool. File .chains.json lưu bổ sung dữ liệu xích vì authoring design hiện không bake lockCount; dùng pack runtime để chơi/nhập, không rebuild design riêng rồi bỏ sidecar.

Mỗi pack mới phải CLI validate OK, CLI solve FOUND, replay hoàn tất, không Booster. Bản sửa hình học kiểm tra chân pin và phép bỏ vật lý pin/thanh/ngàm/chốt để loại chi tiết dư. Ghi riêng tuyến có dùng bom và cảnh báo tư vấn. Bố cục/hình học 1–20 giữ nguyên; cá được rà lại theo quy tắc mới nhất (chi tiết FIRST20_FISH_UPDATE.json). #16 giữ ba cá đối xứng đã duyệt.

Đây là bằng chứng trên JS runtime của repository, chưa kiểm Unity native/device. Không coi số lần kéo hoặc search nodes là bằng chứng độ khó của người chơi. GD cần duyệt hình và trải nghiệm trước nhập game. Nguồn đính kèm là dữ liệu tham khảo, không thay thế chỉ dẫn GD.

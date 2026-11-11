# Rule và kiểm chứng của bản review hiện tại

Đã đọc RotateLevelDesigner/AGENTS.md, README.md, levels/README.md và schema chính thức. Mọi geometry mới dựng từ rrdesign bằng builder/CLI; không viết tay collider/runtime, không sửa core/constants/campaign/golden.

## Các lựa chọn GD đã chốt

- #10: P050 hình con gà ở mục không được xếp, bản chỉnh cỡ **giữ3 vòng**. Không thêm ba vòng cánh. Đây là ngoại lệ so với target frozen6 được ghi rõ, không sửa curve.
- #13: P040 (ID cũ40), ngôi nhà **6 vòng**; thay chùm nho khó nhận diện. Ngoại lệ so với target frozen7 theo lựa chọn GD. P040 từng bị note bỏ nhưng được yêu cầu phục hồi trong phiên hiện tại.
- #20: giữ bản vợt đang hiển thị, mở rộng U3.2 →10.1, đưa lên bao quanh hai thanh xanh/cam và cặp vòng tím/xanh lá. Bản active là CampaignReview020_SCH2_r04, không phải P040. Dịch cặp vòng bóng lên y-3.1, đáy U lên y-6.3, chân xanh lên y-7.2. Theo Render.bounds chính thức, chiều cao27.4925 →22.1925, giảm19.28%. Trước/sau dùng cùng camera.
- #14 vẫn P074 R14/target14; #17 P398 R13/target13; #18 P412 R11/target11. Đúng R không chứng nhận độ khó người chơi. #17 route có bom, #18 E target Unknown. Xem CURVE_CHECK_14_17_18.md.

## Gate và bằng chứng

Cả20 lựa chọn validate OK, solve FOUND và replay hoàn tất trong lõi JS; CLI logs ở validation/. Không Booster. Sáu bản mới/phái sinh không có bom, xích hoặc StopPin; các level nguồn dùng bom được ghi riêng ở card.

Pin/thanh/ngàm các bản mới/phái sinh được thử bỏ vật lý, build rồi solve lại; xem ablation trong qualification.json. Kiểm chân pin bằng góc khe và bề rộng stem đã bake, không chỉ id owner. Với thanh tạo hình và ngàm riêng, đóng góp là lượt rút bắt buộc, không tự gọi là cửa chung cho phần khác. Ngàm U dư được bỏ khi trace không đổi. Counterfactual bỏ ngàm cuối của thanh gấp giữ trục slide vốn có bằng thuộc tính authoring hợp lệ, không sửa engine để chạy ca lỗi.

#13 chuyển từ bản P040 đã kiểm sang vị trí13: so sánh rings/sticks/bombs hoàn toàn giống, tái sử dụng ablation có ghi nguồn; validate/solve/pack cho metadata13 đã chạy lại.

Cá: #1–10 không đánh dấu. #13 và #20 không có candidate tier0/1 nên dùng tier corridor theo ưu tiên tool; không bị đè lúc đầu, không chọn sweep và không chồng sprite đồng tâm. Cảnh báo fish-corridor được ghi, không giấu thành0 warning. #11 giữ lựa chọn có quyết định GD cũ. Max3 không có nghĩa phải đủ3.

Màu/hình/nhịp chơi cần GD review. Không dùng số lệnh solver, số node hay mật độ để chứng nhận khó/đẹp. Native Unity/device chưa chạy. Golden chưa thể hoàn tất vì repo thiếu Assets/Level91001 được golden tham chiếu; không sửa golden để lấy PASS.

## Bản active và cập nhật

REVISION_SELECTIONS.json chỉ rõ stem/candidate đang dùng. build_review.py kiểm SHA thiết kế khớp qualification, xuất20 pack, ảnh nhúng, bảng và curve. index.html tự kiểm cập nhật mỗi2 giây qua HTTP; ảnh vẫn xem được khi JavaScript bị tắt. history/ giữ các bản cũ, không dùng làm đầu vào giao Dev.

Nếu chỉnh geometry, chạy qualify_revision.js cho đúng stem và vị trí trước khi build_review.py. Các v1 cũ của #10/#13/#20 trong script author ban đầu không phải lựa chọn hiện tại. Mapping500 và source ingame được giữ nguyên; tích hợp vào game do Dev thực hiện sau review.

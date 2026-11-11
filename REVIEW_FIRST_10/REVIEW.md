# Review 20 level đầu — đã chạy tool

Cập nhật 2026-11-11T12:12:26+07:00

18/20 vị trí khớp Target R. Ngoại lệ GD đã chốt: #10 P050 3/6, #13 P040 6/7. 20/20 validate OK, solve FOUND và replay hoàn tất. Target frozen không sửa.

Người dùng xác nhận TARGET_CURVE_500_FROZEN.json và R tại #3/#9/#10 = 4/12/6. Giữ nguyên Target R trong mapping dẫn xuất; file frozen gốc chưa có trong checkout, chưa kiểm hash gốc.

Curve R: **2 → 3 → 4 → 7 → 7 → 9 → 7 → 9 → 12 → 6 → 6 → 9 → 7 → 14 → 9 → 10 → 13 → 11 → 10 → 6**.

[Rule tool và blocker](TOOL_RULES.md) · [Brief level 3 theo yêu cầu](LEVEL_003_BRIEF.md)

| # | Loại | Target R | R thực | Candidate | Thanh | Pin | Lệnh proof nguồn | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| 1 | Normal | 2 | 2 | P001 | 0 | 1 | 1 | REVALIDATED_SOURCE |
| 2 | Normal | 3 | 3 | P002 | 0 | 2 | 2 | REVALIDATED_SOURCE |
| 3 | Special | 4 | 4 | NEW003 | 0 | 3 | 3 | NEW_QUALIFIED |
| 4 | Normal | 7 | 7 | P004 | 0 | 6 | 6 | REVALIDATED_SOURCE |
| 5 | Normal | 7 | 7 | P007 | 4 | 5 | 9 | REVALIDATED_SOURCE |
| 6 | Symmetrical | 9 | 9 | NEW006 | 0 | 8 | 8 | NEW_QUALIFIED |
| 7 | Normal | 7 | 7 | P013 | 5 | 8 | 11 | REVALIDATED_SOURCE |
| 8 | Normal | 9 | 9 | P006 | 0 | 7 | 7 | REVALIDATED_SOURCE |
| 9 | Normal | 12 | 12 | P014 | 3 | 12 | 13 | REVALIDATED_SOURCE |
| 10 | Special | 6 | 3 | P050_R01 | 7 | 2 | 9 | NEW_QUALIFIED |
| 11 | Normal | 6 | 6 | P011 | 2 | 4 | 7 | REVALIDATED_SOURCE |
| 12 | Normal | 9 | 9 | P012 | 1 | 8 | 9 | REVALIDATED_SOURCE |
| 13 | Special | 7 | 6 | P040_R01 | 7 | 4 | 15 | NEW_QUALIFIED |
| 14 | Normal | 14 | 14 | P074 | 4 | 13 | 17 | REVALIDATED_SOURCE |
| 15 | Normal | 9 | 9 | P008 | 0 | 7 | 7 | REVALIDATED_SOURCE |
| 16 | Symmetrical | 10 | 10 | NEW016 | 0 | 9 | 9 | NEW_QUALIFIED |
| 17 | Normal | 13 | 13 | P398 | 4 | 14 | 13 | REVALIDATED_SOURCE |
| 18 | Normal | 11 | 11 | P412 | 3 | 13 | 13 | REVALIDATED_SOURCE |
| 19 | Normal | 10 | 10 | P016 | 2 | 11 | 12 | REVALIDATED_SOURCE |
| 20 | Special | 6 | 6 | SCH2_R04 | 10 | 5 | 11 | NEW_QUALIFIED |

#3 đã là level mới có validate/solve/replay, không còn ảnh ý tưởng. Sáu level mới đã kiểm vai trò pin bằng bỏ từng pin và giải lại; các level dùng lại giữ hình học và chưa chạy ablation toàn bộ vật thể. Mọi lựa chọn đã chạy validate/solve mới, không dùng proof cũ thay kiểm chứng. Số lệnh proof nguồn và E_record là tham chiếu, không phải đo độ khó người chơi. Các vị trí nguồn cần tái xếp khi tích hợp vào campaign 500 để tránh trùng.

## 01 · P001 · Target 2 vòng

Giữ lựa chọn gốc, hình học không đổi; tiếp tục GD review nhịp và cơ chế.

![Review 1](/workspace/Campaign/REVIEW_FIRST_10/previews/P001.png)

## 02 · P002 · Target 3 vòng

Giữ lựa chọn gốc, hình học không đổi; tiếp tục GD review nhịp và cơ chế.

![Review 2](/workspace/Campaign/REVIEW_FIRST_10/previews/P002.png)

## 03 · NEW003 · Target 4 vòng

Mặt cười mới theo yêu cầu: đầu kín, hai mắt hở và miệng cười hở lớn. 4 vòng, 3 pin trong, không thanh/bom/cá.

![Review 3](/workspace/Campaign/REVIEW_FIRST_10/previews/NEW003.png)

## 04 · P004 · Target 7 vòng

Giữ lựa chọn gốc, hình học không đổi; tiếp tục GD review nhịp và cơ chế.

![Review 4](/workspace/Campaign/REVIEW_FIRST_10/previews/P004.png)

## 05 · P007 · Target 7 vòng

Giữ lựa chọn gốc, hình học không đổi; tiếp tục GD review nhịp và cơ chế.

![Review 5](/workspace/Campaign/REVIEW_FIRST_10/previews/P007.png)

## 06 · NEW006 · Target 9 vòng

Thay P449 bằng bố cục mới 9 vòng. Phản chiếu cả khe, pin, màu qua trục dọc; không thanh/bom/cá.

![Review 6](/workspace/Campaign/REVIEW_FIRST_10/previews/NEW006.png)

## 07 · P013 · Target 7 vòng

Giữ lựa chọn gốc, hình học không đổi; tiếp tục GD review nhịp và cơ chế.

![Review 7](/workspace/Campaign/REVIEW_FIRST_10/previews/P013.png)

## 08 · P006 · Target 9 vòng

Thay P111: giữ 9 vòng nhưng bỏ hai bom và hai thanh. Cần GD review cân đối pin và khoảng trống.

![Review 8](/workspace/Campaign/REVIEW_FIRST_10/previews/P006.png)

## 09 · P014 · Target 12 vòng

Thay P085: giữ 12 vòng theo frozen; giảm 10 → 3 thanh và 21 → 13 lệnh proof nguồn.

![Review 9](/workspace/Campaign/REVIEW_FIRST_10/previews/P014.png)

## 10 · P050_R01 · Target 6 vòng

GD chốt P050 hình con gà trong mục không được xếp: bản chỉnh cỡ giữ 3 vòng, bỏ ba vòng cánh tự thêm. Thân r5.25, đầu r2.625, mắt r1.0; 7 thanh chỉnh cỡ/ngàm. Ngoại lệ công khai: thực3 so với target frozen6.

![Review 10](/workspace/Campaign/REVIEW_FIRST_10/previews/P050_R01.png)

## 11 · P011 · Target 6 vòng

Giữ lựa chọn gốc, hình học không đổi; tiếp tục GD review nhịp và cơ chế.

![Review 11](/workspace/Campaign/REVIEW_FIRST_10/previews/P011.png)

## 12 · P012 · Target 9 vòng

P012: 9 vòng, 1 thanh, 9 lệnh proof nguồn; gần E_record 8 hơn bản P028 có 12 lệnh.

![Review 12](/workspace/Campaign/REVIEW_FIRST_10/previews/P012.png)

## 13 · P040_R01 · Target 7 vòng

Thay chùm nho bằng P040 cũ40, hình ngôi nhà có mái, cửa sổ, ống khói. Giữ 6 vòng nguồn theo GD; ngoại lệ so với target frozen7. Dựng/kiểm bằng tool, cá corridor chỉ dùng do không có vị trí tier sạch.

![Review 13](/workspace/Campaign/REVIEW_FIRST_10/previews/P040_R01.png)

## 14 · P074 · Target 14 vòng

P074 đúng target R14. E_record 17 chỉ là dữ liệu tham khảo; chưa xác nhận độ khó người chơi bằng playtest.

![Review 14](/workspace/Campaign/REVIEW_FIRST_10/previews/P074.png)

## 15 · P008 · Target 9 vòng

P008: 9 vòng đúng target, không thanh/bom; thay P033 8 vòng. Có proof nguồn 7 lệnh; thấp hơn E_record 12, cần review nhịp.

![Review 15](/workspace/Campaign/REVIEW_FIRST_10/previews/P008.png)

## 16 · NEW016 · Target 10 vòng

10 vòng đúng curve; đối xứng xoay 9 nhánh và phản chiếu trục dọc. Ba vị trí cá cũng đối xứng.

![Review 16](/workspace/Campaign/REVIEW_FIRST_10/previews/NEW016.png)

## 17 · P398 · Target 13 vòng

P398 đúng target R13. Route hiện tại có bom; 13 lệnh proof so với E_record 11 chỉ để tham khảo, chưa xác nhận độ khó người chơi.

![Review 17](/workspace/Campaign/REVIEW_FIRST_10/previews/P398.png)

## 18 · P412 · Target 11 vòng

P412 đúng target R11. Target E Unknown; chưa đủ dữ liệu để kết luận khớp độ khó ngoài số vòng.

![Review 18](/workspace/Campaign/REVIEW_FIRST_10/previews/P412.png)

## 19 · P016 · Target 10 vòng

Thay P315 bằng P016: 10 vòng đúng target, bố cục dọc rõ hơn, 2 thanh và không bom. Chờ GD review hình; không dùng số lệnh solver để kết luận đẹp/khó.

![Review 19](/workspace/Campaign/REVIEW_FIRST_10/previews/P016.png)

## 20 · SCH2_R04 · Target 6 vòng

Theo feedback mới nhất, chỉnh trên bản vợt đang hiển thị: U rộng10.1 (trước3.2), dịch lên bao quanh hai thanh xanh/cam và cặp vòng tím/xanh lá. Bóng lên y-3.1; đáy U lên y-6.3; chân xanh lên y-7.2. Giữ 6 vòng và kiểm lại va chạm, đường rút, fish, vai trò. P040 được chuyển sang #13.

![Review 20](/workspace/Campaign/REVIEW_FIRST_10/previews/SCH2_R04.png)

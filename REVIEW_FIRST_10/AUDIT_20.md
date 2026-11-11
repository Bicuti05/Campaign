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

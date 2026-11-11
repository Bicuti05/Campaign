# Đối chiếu #14, #17, #18

| Vị trí | Level hiện chọn | Target R frozen dẫn xuất | R thực tế | Kết luận về số vòng |
|---|---|---|---|---|
| 14 | P074 | 14 | 14 | Khớp |
| 17 | P398 | 13 | 13 | Khớp |
| 18 | P412 | 11 | 11 | Khớp |

Không đồng nhất “khớp R” với “đã đúng độ khó người chơi”. Rule tool cấm dùng số lần kéo/tìm kiếm/mật độ làm chứng nhận độ khó hoặc độ đẹp.

- #14: E_record tham khảo 17; route kiểm được 17 lệnh. Số trùng nhau không chứng minh độ khó bằng nhau.
- #17: E_record tham khảo 11; route kiểm được 13 lệnh và có bom nổ. Cần GD chơi thử nhịp khó khi giới thiệu bom và phụ thuộc.
- #18: target E ghi Unknown; route kiểm được 13 lệnh. Không có budget E được xác nhận để kết luận “đúng E”.

Cả ba đã validate OK, solve FOUND và replay hoàn tất trong lõi JS. Chưa có đo người chơi hoặc kiểm Native Unity/device. Giữ nguyên các target của mapping dẫn xuất từ frozen theo xác nhận của GD.

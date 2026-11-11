# SPECIAL & SYMMETRY AUDIT

## Quy tắc slot mới

- Đuôi 0 và 3 → Special Picture (100 slot). Đuôi 6 → Symmetrical (50 slot). Còn lại Normal (350).
- Nguồn: level đuôi 0 trong campaign cũ = ứng viên Special; đuôi 5 = ứng viên Symmetrical (theo chỉ dẫn GD 10.11) — nhưng **mỗi ứng viên được kiểm tra hình ảnh thực tế** trên render cùng camera; không gán nhãn theo vị trí cũ hay tên file.
- Ngoài ra rà toàn bộ Normal còn lại để tìm level đối xứng rõ (IoU ảnh gương + xem trực tiếp) và 17 shape upload chưa xếp (369–418).

## Special Picture — kết quả nhận diện

| Candidate | Vị trí cũ | R | Kết luận | Chủ đề | Vị trí mới |
|---|---|---|---|---|---|
| P010 | 10 | 3 | Recognizable Picture | Khuôn mặt cú/mặt cười (hai mắt bom) | 60 |
| P020 | 20 | 4 | Recognizable Picture | Thỏ (hai tai dài, mặt tròn) | 50 |
| P030 | 30 | 9 | Recognizable Picture | Hai con cá và rong | 123 |
| P060 | 60 | 11 | Recognizable Picture | Chim công xòe đuôi | 213 |
| P090 | 90 | 11 | Recognizable Picture | Bánh sinh nhật có nến | 173 |
| P110 | 110 | 12 | Recognizable Picture | Hai người tuyết đội mũ | 103 |
| P120 | 120 | 40 | Recognizable Picture | Rừng cây (4 tán cây) | — |
| P130 | 130 | 16 | Potential Picture / Needs GD | Chủ đề không rõ: 2 vòng lớn + 3 hình người nhỏ | — |
| P150 | 150 | 15 | Not Recognizable | Cụm vòng tự do, không ra hình | 165 |
| P290 | 290 | 18 | Recognizable Picture | Chùm nho | 113 |
| P300 | 300 | 18 | Recognizable Picture | Chậu hoa ba bông | 193 |
| P310 | 310 | 19 | Recognizable Picture | Con ếch ngồi | 133 |
| P330 | 330 | 19 | Recognizable Picture | Đồng hồ báo thức | 183 |
| P340 | 340 | 19 | Recognizable Picture | Cặp cherry | 443 |
| P350 | 350 | 19 | Recognizable Picture | Ốc sên | 393 |
| P360 | 360 | 16 | Potential Picture / Needs GD | Ghế bập bênh — silhouette yếu, đọc thành khung + vòng | — |
| P370 | 370 | 15 | Potential Picture / Needs GD | Tên lửa — thân/cánh chưa rõ ở camera thực tế | — |
| P380 | 380 | 15 | Recognizable Picture | Nhân vật zombie (đầu + thân) | 110 |
| P385 | 385 | 9 | Recognizable Picture | Robot (cũng đối xứng trái/phải — chọn vai trò Special) | 33 |
| P400 | 400 | 12 | Potential Picture / Needs GD | Súng nước — khó nhận ra | — |
| U370 | — | 28 | Potential Picture / Needs GD | Tam giác/kim tự tháp — silhouette chỉ là tam giác dày đặc | — |
| U371 | — | 21 | Not Recognizable | Tên "trái tim" nhưng silhouette không đọc ra trái tim | — |
| U372 | — | 24 | Not Recognizable | Tên "ngôi nhà" nhưng chỉ là cột vòng + thanh | — |
| U375 | — | 24 | Potential Picture / Needs GD | Tam giác/kim tự tháp — dày đặc | — |
| U377 | — | 26 | Not Recognizable | Tên "trái tim" nhưng silhouette là khối tròn dày đặc | — |
| U379 | — | 25 | Not Recognizable | Tên "cánh bướm" nhưng đọc thành chữ H/M | — |
| U382 | — | 24 | Not Recognizable | Tên "trái tim" nhưng silhouette là khối ngũ giác | — |
| U388 | — | 24 | Not Recognizable | Tên "trái tim" nhưng silhouette là khối tròn | — |
| U389 | — | 24 | Not Recognizable | Tên "trái tim" nhưng silhouette là khối | — |
| U390 | — | 21 | Not Recognizable | Tên "cánh bướm" nhưng đọc thành chữ H | — |
| U393 | — | 23 | Not Recognizable | Tên "trái tim" nhưng silhouette là khối ngang | — |
| U399 | — | 22 | Not Recognizable | Tên "ngôi nhà" nhưng là khối chữ nhật dày đặc | — |
| U404 | — | 24 | Potential Picture / Needs GD | Tam giác/kim tự tháp — dày đặc | — |
| U405 | — | 23 | Not Recognizable | Tên "ngôi nhà" nhưng là khối dày đặc | — |
| U408 | — | 21 | Potential Picture / Needs GD | Tam giác/kim tự tháp — dày đặc | — |
| U410 | — | 27 | Not Recognizable | Tên "ngôi nhà" nhưng là khung chữ nhật dày đặc | — |
| U414 | — | 22 | Potential Picture / Needs GD | Tam giác/kim tự tháp — dày đặc | — |

**Special: 14/100 slot được lấp. Thiếu 86.** Ứng viên cũ ở 40, 50, 70, 80, 140, 160, 170, 180, 190, 200, 210, 220…500 phần lớn nằm trong danh sách Bỏ/Chưa tốt của GD; 4 Potential Picture và 5 "kim tự tháp" chờ GD; P120 (rừng cây, R=40) nhận diện được nhưng R vượt mọi target → chưa xếp.

## Symmetrical — kết quả

| Candidate | Vị trí cũ | R | Kết luận | Kiểu | Ghi chú | Vị trí mới |
|---|---|---|---|---|---|---|
| P005 | 5 | 7 | Pass | Trái/Phải | Hub nhỏ đối xứng rõ | 126 |
| P015 | 15 | 8 | Weak |  | Chuỗi dọc lệch, không đủ rõ | 135 |
| P018 | 18 | 12 | Pass | Trái/Phải (gần đúng) | Hai cột vòng (level gốc Normal) | 86 |
| P025 | 25 | 10 | Fail |  | Không đối xứng | 132 |
| P032 | 32 | 7 | Pass | Trái/Phải | Khung cổng đối xứng (level gốc Normal) | 66 |
| P035 | 35 | 9 | Fail |  | Không đối xứng | 82 |
| P036 | 36 | 13 | Pass | Trái/Phải | Lưới 2 cột đối xứng (level gốc Normal) | 186 |
| P045 | 45 | 11 | Weak |  | Lưới lệch, cân nhưng không đối xứng | 449 |
| P047 | 47 | 8 | Pass | Trái/Phải | Khung thanh bao quanh, vòng giữa (level gốc Normal) | 416 |
| P055 | 55 | 12 | Fail |  | Không đối xứng | 89 |
| P056 | 56 | 13 | Pass | Trái/Phải | Lưới dọc đối xứng (level gốc Normal; thuộc nhóm bố cục tương đương) | 16 |
| P063 | 63 | 21 | Pass | Trái/Phải | Khung đỏ giữa, hai cánh vòng (level gốc Normal) | 26 |
| P065 | 65 | 13 | Weak |  | Lưới 3 hàng, chi tiết thanh lệch | 318 |
| P075 | 75 | 17 | Weak |  | Lưới, lệch hai bên | 464 |
| P077 | 77 | 14 | Pass | Xoay (ngũ giác) | Hub 5 nhánh (level gốc Normal) | 246 |
| P085 | 85 | 12 | Fail |  | Không đối xứng | 9 |
| P095 | 95 | 12 | Fail |  | Không đối xứng | 397 |
| P105 | 105 | 18 | Pass | Trái/Phải (gần đúng) | Hai cụm cân hai bên vòng giữa | 36 |
| P115 | 115 | 13 | Pass | Trái/Phải | Hình sao với thanh zigzag hai bên | 116 |
| P125 | 125 | 16 | Pass | Trái/Phải + xoay 3 nhánh | Ba cánh chữ Y | 476 |
| P135 | 135 | 13 | Pass | Trái/Phải | Hai cánh đối xứng quanh vòng giữa | 76 |
| P165 | 165 | 17 | Pass | Xoay (vòng hoa) | Đối xứng xoay, không đối xứng gương — GD xác nhận | 136 |
| P177 | 177 | 18 | Pass | Trái/Phải | Chữ Y ba nhánh (level gốc Normal) | 196 |
| P195 | 195 | 19 | Pass | Trái/Phải | Hai cánh trên + thân dưới | 146 |
| P215 | 215 | 17 | Pass | Xoay (vòng hoa) | Đối xứng xoay gần đúng — GD xác nhận | 176 |
| P265 | 265 | 13 | Pass | Trái/Phải | Trục dọc rõ, tay zigzag hai bên | 226 |
| P295 | 295 | 14 | Pass | Trái/Phải | Hai cánh trên, chân giữa | 106 |
| P315 | 315 | 10 | Fail |  | Không đối xứng | 32 |
| P325 | 325 | 16 | Pass | Trái/Phải | Trục dọc + tay hai bên | 266 |
| P335 | 335 | 18 | Pass | Trái/Phải | Vòm trên + trục giữa | 376 |
| P345 | 345 | 8 | Fail |  | Không đối xứng | 154 |
| P355 | 355 | 15 | Pass | Trái/Phải + xoay 3 nhánh | Ba cánh tam giác | 436 |
| P365 | 365 | 16 | Weak |  | Cụm hub, đối xứng mờ | 495 |
| P375 | 375 | 19 | Fail |  | Không đối xứng | 201 |
| P385 | 385 | 9 | Pass | Trái/Phải | Robot — chuyển vai trò Special | 33 (Special) |
| P395 | 395 | 11 | Fail |  | Không đối xứng | 389 |
| P465 | 465 | 20 | Weak |  | Cụm hub, đối xứng mờ | 84 |
| P495 | 495 | 16 | Weak |  | Cụm hub, đối xứng mờ | 269 |

**Symmetrical: 21/50 slot được lấp. Thiếu 29.** 9 level đuôi 5 cũ không đối xứng (Fail) và 7 chỉ đối xứng mờ (Weak) được xếp như Normal, không gắn nhãn Symmetrical. 8 level gốc Normal đối xứng rõ được nâng lên slot đuôi 6.
- Vai trò kép: P385 (robot) vừa đối xứng vừa là hình → chọn Special vì thiếu Special trầm trọng hơn. P010/P300/P310/P330/P340 cũng đối xứng nhưng giữ Special.
- Đối xứng xoay (P165, P215, P077) ghi rõ "Xoay"; GD xác nhận có chấp nhận cho slot đuôi 6 không.

## Phương pháp kiểm

- Render mono cùng tỉ lệ → IoU với ảnh lật trái/phải, trên/dưới (dung sai 3px) làm sàng lọc; kết luận cuối bằng xem trực tiếp (không chỉ bounding box).
- Không mirror thêm object, không sửa geometry để ép đối xứng.
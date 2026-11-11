# CAMPAIGN DIVERSITY REPORT

Phân tích trên 298 level đã xếp (202 slot Missing bị bỏ qua khi tính cửa sổ; liền kề = 2 level có thật gần nhất, cách ≤2 vị trí).

## Phân bố object (đã xếp)

| Loại | Tổng | Số level có |
|---|---|---|
| straight | 683 | 236 |
| L | 623 | 251 |
| U | 195 | 121 |
| complexStick | 66 | 47 |
| bombs | 65 | 49 |
| stops | 115 | 56 |
| chains | 30 | 15 |
| fish | 824 | 283 |
| rings | 4141 | 298 |

Ring-only (không stick, không bom): 10 level.

## Ring size distribution

| bán kính ngoài (u) | số vòng |
|---|---|
| 1.0 | 82 |
| 1.5 | 1082 |
| 2.0 | 2576 |
| 2.5 | 350 |
| 3.0 | 21 |
| 3.5 | 6 |
| 4.0 | 4 |
| 4.5 | 2 |
| 5.0 | 3 |
| 6.0 | 3 |
| 7.0 | 5 |
| 7.5 | 1 |
| 8 | 6 |

## Coverage cơ chế theo khối 50 level

| Khối | có level | Straight | L | U | Bomb | Stop | Chain | Family chiếm nhiều nhất |
|---|---|---|---|---|---|---|---|---|
| 1–50 | 39 | 27 | 32 | 23 | 10 | 7 | 0 | ORIG-grid (16) |
| 51–100 | 33 | 28 | 29 | 17 | 6 | 5 | 0 | HUB (19) |
| 101–150 | 45 | 33 | 31 | 18 | 3 | 6 | 1 | HUB (25) |
| 151–200 | 39 | 32 | 32 | 14 | 8 | 6 | 1 | HUB (25) |
| 201–250 | 32 | 27 | 28 | 11 | 3 | 5 | 4 | HUB (22) |
| 251–300 | 27 | 20 | 23 | 7 | 3 | 8 | 1 | HUB (17) |
| 301–350 | 23 | 20 | 22 | 11 | 5 | 5 | 2 | HUB (15) |
| 351–400 | 27 | 20 | 26 | 10 | 6 | 6 | 1 | HUB (17) |
| 401–450 | 21 | 18 | 16 | 7 | 1 | 5 | 5 | HUB (12) |
| 451–500 | 12 | 11 | 12 | 3 | 4 | 3 | 0 | HUB (9) |

## Family layout

| Macro family | level | Ghi chú |
|---|---|---|
| HUB | 174 | cụm vòng quanh 1 vòng giữa (generation 101–358, 451–497) — rất đồng nhất về thị giác |
| ORIG-grid | 73 | level gốc 1–100, lưới vòng |
| FRAME | 31 | khung thanh dài + vòng (359–459) |
| ORIG-bars | 11 | level gốc, mê cung thanh |
| ORIG-small | 3 | level gốc nhỏ |
| BRANCH | 3 | nhánh/cây |
| ORIG-enclosure | 3 | vòng lớn bao quanh |

## Kiểm tra cửa sổ liên tiếp (trên chuỗi level có thật)

- Cửa sổ 3: 31/296 cửa sổ có ≥3 level cùng macro family.
- Cửa sổ 5: 78/294 cửa sổ có ≥4 level cùng macro family.
- Cửa sổ 10: 223/289 cửa sổ có ≥6 level cùng macro family.
- Cửa sổ 20: 201/279 cửa sổ có ≥12 level cùng macro family.
- Cửa sổ 20 level không có Bomb: 6 (bắt đầu tại vị trí 97, 98, 99, 101, 102, 329).
- Cửa sổ 20 level không có U Stick: 0. U Stick chỉ có ở 121 level trong pool — thiếu nguồn, không phải do sắp xếp.
- Chuỗi ≥4 level cùng macro family: 1 ([81]).
- Chuỗi ≥4 level ring-only liên tiếp: 0.

## Neighbor similarity

Độ giống cặp liền kề (0–1, kết hợp silhouette + family + R + cơ chế): median 0.13, p90 0.35, max 0.57.
Trước tối ưu liền kề (Stage 3): {"macro_family_streak>3": 38, "family_streak>3": 1, "similar_set_within_12": 24, "same_source_within_15": 1, "window10_macro>6": 10}; sau Stage 4: {"macro_family_streak>3": 1, "similar_set_within_12": 4, "window10_macro>6": 1}

## Nhóm "bố cục tương đương" của GD

34 level thuộc danh sách được xếp; khoảng cách giữa 2 thành viên liên tiếp: min 10, median 13. Cặp <12: P357@97–P364@107, P364@107–P276@118, P467@131–P238@142, P114@311–P197@321

Danh sách thành viên & vị trí: P056→16, P449→28, P272→45, P293→64, P333→81, P357→97, P364→107, P276→118, P467→131, P238→142, P059→155, P052→167, P374→185, P249→199, P222→212, P103→224, P493→239, P317→252, P495→269, P344→285, P278→299, P114→311, P197→321, P373→334, P104→351, P107→365, P466→378, P403→399, P239→412, P236→434, P106→452, P075→464, P237→477, P365→495

## Special theme repetition

Mỗi Special có chủ đề riêng, không lặp: 33: Robot (cũng đối xứng trái/phải — chọn vai trò Special); 50: Thỏ (hai tai dài, mặt tròn); 60: Khuôn mặt cú/mặt cười (hai mắt bom); 103: Hai người tuyết đội mũ; 110: Nhân vật zombie (đầu + thân); 113: Chùm nho; 123: Hai con cá và rong; 133: Con ếch ngồi; 173: Bánh sinh nhật có nến; 183: Đồng hồ báo thức; 193: Chậu hoa ba bông; 213: Chim công xòe đuôi; 393: Ốc sên; 443: Cặp cherry

## Symmetrical layout repetition

16: Trái/Phải; 26: Trái/Phải; 36: Trái/Phải (gần đúng); 66: Trái/Phải; 76: Trái/Phải; 86: Trái/Phải (gần đúng); 106: Trái/Phải; 116: Trái/Phải; 126: Trái/Phải; 136: Xoay (vòng hoa); 146: Trái/Phải; 176: Xoay (vòng hoa); 186: Trái/Phải; 196: Trái/Phải; 226: Trái/Phải; 246: Xoay (ngũ giác); 266: Trái/Phải; 376: Trái/Phải; 416: Trái/Phải; 436: Trái/Phải + xoay 3 nhánh; 476: Trái/Phải + xoay 3 nhánh

Kiểu đối xứng: {"Trái/Phải": 16, "Xoay": 3, "Trái/Phải + xoay 3 nhánh": 2}

## Đoạn 10–20 level quá đồng nhất

Cửa sổ 10 level có ≥7 cùng macro family: 104 (bắt đầu tại [4, 36, 42, 71, 72, 74, 97, 109, 110, 111, 112, 113, 114, 115, 116, 139, 142, 158, 159, 161, 164, 165, 167, 168, 169, 171, 173, 174, 176, 177, 178, 182, 183, 184, 186, 187, 188, 189, 191, 192, 193, 194, 195, 196, 197, 198, 199, 201, 202, 204, 207, 208, 209, 211, 212, 213, 214, 215, 219, 221, 224, 225, 226, 229, 231, 232, 234, 258, 259, 268, 274, 281, 282, 284, 285, 299, 308, 311, 314, 315, 321, 322, 324, 325, 328, 329, 331, 334, 337, 341, 348, 351, 364, 387, 388, 425, 441, 442, 443, 448, 449, 451, 452, 457]).
Nhận định: 60% Normal còn lại trong pool là layout HUB (generation 101–358 & 451–497) — dù đã xen kẽ với level gốc và FRAME, cảm giác "cụm vòng quanh vòng giữa" vẫn lặp lại nhiều từ 100 trở đi. Generation briefs cho slot Missing đều yêu cầu tránh HUB.
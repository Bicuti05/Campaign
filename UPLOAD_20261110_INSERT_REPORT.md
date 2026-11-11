# CHÈN LEVEL TỪ GÓI UPLOAD 10.11 — v2

Nguồn: `level_đặc_biệt.zip` (REV03), `RotateRings_Batch250_rev01.zip`, `RotateRings_10_levels_2026-11-05.zip`.

## Kết quả

- 48 level trùng geometry với campaign 500 cũ → giữ kết luận GD 10.11, không chèn lại.
- **Chèn 20 level**: Special 32/100 (v1: 14), Symmetrical 23/50 (v1: 21). Level v1 không bị dịch chuyển.
- 4 hình GD xác nhận nhận diện 23:26 10.11 (tàu hỏa, lâu đài, vườn hai bông hoa, rùa biển) đã được chèn: S140/S150 về đúng mốc thiết kế 140/150; SCJ → 43, SCL → 253.
- 87/87 slot Normal Missing có đề xuất (chưa chèn — chờ GD; họ HUB mà GD đã loại ~70%).

## Level đã chèn

| Vị trí | Loại | Candidate | Chủ đề / đối xứng | R | Lý do |
|---|---|---|---|---|---|
| 30 | Special | SCH2 | Vợt tennis và bóng | 10 | Ghép tối ưu vào slot Missing: R 10 vs đích 10; E 17 |
| 43 | Special | SCJ | Tàu hỏa hơi nước — GD xác nhận nhận diện 10.11 | 20 | Ghép tối ưu vào slot Missing: R 20 vs đích 21; E 21 |
| 53 | Special | SCK | Cây nấm | 12 | Ghép tối ưu vào slot Missing: R 12 vs đích 12; E 14 |
| 70 | Special | SCA | Hải đăng | 8 | Ghép tối ưu vào slot Missing: R 8 vs đích 9; E 19 |
| 130 | Special | S130 | Con bướm (mốc 130) | 12 | Thiết kế cho đúng mốc 130 |
| 140 | Special | S140 | Vườn hai bông hoa (mốc 140) — GD xác nhận nhận diện 10.11 | 20 | Thiết kế cho đúng mốc 140 |
| 143 | Special | SCG | Cối xay gió | 4 | Ghép tối ưu vào slot Missing: R 4 vs đích 11; E 27 |
| 150 | Special | S150 | Rùa biển (mốc 150) — GD xác nhận nhận diện 10.11 | 15 | Thiết kế cho đúng mốc 150 |
| 153 | Special | SCI4 | Máy ảnh trên chân máy | 8 | Ghép tối ưu vào slot Missing: R 8 vs đích 19; E 24 |
| 166 | Symmetrical | B135 | Trái/Phải | 13 | Ghép tối ưu vào slot Missing: R 13 vs đích 13; E 20 |
| 170 | Special | S170 | Cây thông và quà (mốc 170) | 6 | Thiết kế cho đúng mốc 170 |
| 180 | Special | S180 | Thuyền buồm (mốc 180) | 10 | Thiết kế cho đúng mốc 180 |
| 190 | Special | S190 | Đàn guitar (mốc 190) | 2 | Thiết kế cho đúng mốc 190 |
| 243 | Special | SCB | Robot thám hiểm (trùng chủ đề robot P385 — đặt xa) | 8 | Ghép tối ưu vào slot Missing: R 8 vs đích 11; E 24; giữ xa chủ đề trùng |
| 253 | Special | SCL | Lâu đài — GD xác nhận nhận diện 10.11 | 6 | Ghép tối ưu vào slot Missing: R 6 vs đích 13; E 25 |
| 263 | Special | SCE | Đồng hồ quả lắc (gần chủ đề đồng hồ P330 — đặt xa) | 10 | Ghép tối ưu vào slot Missing: R 10 vs đích 11; E 17; giữ xa chủ đề trùng |
| 306 | Symmetrical | S160 | Trái/Phải (cặp lều) | 8 | Ghép tối ưu vào slot Missing: R 8 vs đích 10; E 30 |
| 363 | Special | SCC | Khinh khí cầu | 10 | Ghép tối ưu vào slot Missing: R 10 vs đích 11; E 26 |
| 453 | Special | SCD | Chim cánh cụt | 8 | Ghép tối ưu vào slot Missing: R 8 vs đích 14; E 20 |
| 483 | Special | SCF | Kem ốc quế | 8 | Ghép tối ưu vào slot Missing: R 8 vs đích 16; E 20 |

## Còn thiếu

- Special 68 · Symmetrical 27 · Normal 87 (đều có đề xuất chờ GD).

## Kiểm tra

| Check | Kết quả |
|---|---|
| 500 vị trí, không trùng | PASS |
| Không trùng candidate | PASS |
| Không trùng runtime hash | PASS |
| Slot type đúng đuôi 0/3/6 | PASS |
| Level v1 giữ nguyên vị trí | PASS |
| File level chèn giữ nguyên byte | PASS |
| Normal đề xuất không tính là Assigned | PASS |

Native Unity: Unknown. Level mới: Needs GD Review (gameplay/độ khó).
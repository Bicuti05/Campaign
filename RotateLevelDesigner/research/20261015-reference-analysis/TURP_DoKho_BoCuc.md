# TURP — Phân chia độ khó và quy tắc bố cục (nghiên cứu 15/10/2026)

Nguồn: `ring-lab/data/original_levels.json` (384 prefab gốc), 63 ảnh chơi trong `Ảnh chơi-…`, `TURP_ProjectScan.md` §27–32, hai báo cáo HTML.
Bảng chỉ số từng level: `level_features_384.csv`, `level_layout_family_384.csv` (cùng thư mục).

Nhãn bằng chứng: **[Đo]** = đếm trực tiếp từ dữ liệu prefab; **[Ảnh]** = đối chiếu ảnh chơi bằng mắt; **[Suy luận]** = giả thuyết thiết kế, chưa chứng minh.
Không có số liệu nào ở đây là lời giải đã replay; độ khó "logic" chỉ đo qua proxy cấu trúc.

---

## 1. Kết luận chính

1. **Kho 384 prefab không phải một campaign tuyến tính** mà gồm nhiều series ID với vai trò khác nhau. **[Đo]**
2. **Khe 60° là "bản khó" của cùng một màn.** 10073–10151 lặp lại toàn bộ chỉ số của 10001–10072 nhưng khe vòng 90° → 60°. Series 70/71 có quy luật +50 tương tự, còn series 20 theo cặp lẻ/chẵn. **[Đo]**
3. **Thứ tự chơi thật không theo ID.** Game trộn màn chính 10xxx với màn "Khó" từ series khác và màn "hình vẽ" 101xx. **[Ảnh]**
4. **Độ khó không tăng đều mà đi theo răng cưa.** Đầu mỗi chặng có một cơ chế mới, rồi một đỉnh ("Khó"), sau đó là màn nghỉ. **[Đo + Ảnh, nhịp là Suy luận]**
5. **Bố cục có ngôn ngữ chung rất chặt:** vòng cùng cỡ r = 1,75, khoảng cách tâm ≈ 4,5, hàng/cột 0°/90° là chủ đạo, thanh song song trục. Bên trong khung đó có khoảng 7 họ bố cục khác nhau. **[Đo]**

---

## 2. Cấu trúc kho theo series ID [Đo]

| Series | Số màn | Đặc trưng | Vai trò dự đoán [Suy luận] |
|---|---|---|---|
| **10001–10072** (thiếu 10016, 10022) | 70 | Khe 90°. Mở cơ chế dần: vòng kín → chốt → thanh → bom → vòng lớn | **Campaign chính, track A** |
| **10073–10151** | 72 | Chỉ số trùng 1-1 với 10001–10072 nhưng khe 60° (19 cặp trùng cả toạ độ) | **Track B: bản khó/AB test** của cùng campaign |
| 10082, 10095, 10109, 10111, 10122, 10125, 10134 | 7 | Chèn vào giữa track B. Khe 90°, vòng lớn đồng tâm, nhiều thanh, đối xứng hoặc chỉ có thanh | Màn đặc biệt/nghỉ |
| **10152–10161** | 10 | "Hình vẽ": vòng lớn, rất nhiều thanh (10156: 24 vòng + 60 thanh), đối xứng, bar-only | Màn hình vẽ chèn vào campaign (M20 = 10161) |
| 10162–10169 | 8 | Cặp 90/60 **có Xích** (LockCount) | Nội dung mới nhất (release mình không làm Xích) |
| **20001–20040** | 40 | Cùng lưới **4×6 = 24 vòng**, chỉ có vòng. Lẻ = 90°, chẵn = 60°. Từ 20021 có bom + Xích | Chế độ thử thách theo lưới cố định |
| **60001–60036** | 36 | Ring-heavy, đối xứng cao (67% đối xứng gương), **5,9 chu trình/màn**, 1,3 pin/vòng, khung gần vuông | Màn "mạng lưới" nhiều phụ thuộc chéo |
| **70001–70035 / 70051–70085** | 70 | Cặp +50 (90°/60°). Lưới tam giác/hex nhiều, có vòng cung (arc) | Pool màn Khó (M19 ≈ 70005) |
| **71001–71034 / 71051–71084** | 67 | Cặp +50. 100% có thanh, hex chủ đạo, khung cao nhất (tỷ lệ 0,59), 35% có pin gắn trong | Pool màn Khó/biến thể |
| 72002, 73004–73056 | 7 | Bar-only 16 thanh; cặp +50 lớn (16–21 vòng) | Chưa rõ |

So sánh trung bình giữa các series (vòng / thanh / chu trình / đối xứng):

| Series | Vòng | Thanh | Chu trình | % có bom | % chỉ có vòng |
|---|---|---|---|---|---|
| 10 | 12,0 | 8,1 | 0,8 | 22% | 15% |
| 20 | 24,0 | 0 | 1,5 | 50% | 100% |
| 60 | 17,3 | 1,9 | 5,9 | 0% | 61% |
| 70 | 11,9 | 5,0 | 1,1 | 31% | 11% |
| 71 | 15,2 | 7,3 | 0,8 | 16% | 0% |

---

## 3. Bằng chứng về thứ tự chơi thật [Ảnh]

| Màn trong game | Khớp prefab | Căn cứ |
|---|---|---|
| M7 | **10007** | 9 vòng, 0 kín, 1 chốt |
| M8 | **10009** | 12 vòng, 3 kín, 2 chốt |
| M11 | **10008** | 9 vòng, 2 kín, 1 chốt → game đảo thứ tự 10008/10009 |
| M15 | ≈ 10013 | 9 vòng, 2 kín, khoảng 8 thanh (có U lớn) |
| M19 — **nhãn "Khó"** | ≈ **70005** | Hình tam giác, 13 vòng, 3 thanh, đối xứng dọc. Không màn 10xxx nào khớp |
| M20 | **10161** | 12 thanh L toả đối xứng quanh vòng lớn + 1 thanh I ở tâm. Khớp duy nhất |
| M49 — **nhãn lửa** | ≈ **10030** | Lưới 4×5, 20 vòng, 4 kín, 2 chốt |
| M50 | **10029** | 4 vòng đồng tâm + 2 bom + cụm thanh |

Rút ra:
- Màn chính lấy từ track A (khe 90°), **không** theo thứ tự ID.
- Màn "Khó" có thể lấy từ series khác (70xxx) hoặc là màn lớn trong 10xxx (10030 có 20 vòng + 2 bom).
- **Ngay sau màn Khó là một màn nhẹ về logic nhưng ấn tượng về hình** (M20 = hình vẽ, M50 = đồng tâm). **[Suy luận]** Nhịp này giống "Khó → phần thưởng thị giác".
- Mới khớp 8/50 màn. Cần đối chiếu đủ ảnh để chốt bảng thứ tự (xem câu hỏi).

---

## 4. Phân chia độ khó

### 4.1 Lộ trình mở cơ chế (track A, theo ID) [Đo]

| Lần đầu xuất hiện | Cơ chế | Ghi chú |
|---|---|---|
| 10001–10003 | Vòng + pin, 2→3→4 vòng | Một chuỗi, không chu trình |
| 10004 | **Vòng kín** + chu trình đầu tiên + vòng nhận nhiều pin | Đỉnh sớm (7 vòng, 2 chu trình), ảnh M4 có tutorial |
| 10006 | **Chốt chặn** | |
| 10010 | **Thanh + ngàm** (L trước), 10011 thanh I, 10012 thanh U | Số vòng giảm về 6–7 khi giới thiệu thanh |
| 10017 | **Bom** | |
| 10021 | **Vòng lớn/đồng tâm** | |
| 10029 | **Pin gắn trong** | |
| 10042 | **Vòng cung** (khe > 120°) | |
| 10162 | **Xích** | Ngoài phạm vi release |

**Quy tắc [Suy luận từ Đo]:** khi giới thiệu cơ chế mới thì **giảm quy mô**. Ví dụ 10009 có 12 vòng nhưng 10010 (màn đầu có thanh) chỉ còn 6 vòng; 10017 (màn đầu có bom) chỉ 10 vòng.

### 4.2 Các trục độ khó đo được

| Trục | Chỉ số | Ghi chú |
|---|---|---|
| Quy mô | số vòng + thanh | Tăng nhanh đến khoảng màn 15, sau đó dao động 15–35 vật thay vì tăng tiếp |
| Hội tụ pin | số vòng nhận ≥ 2 pin (`multiSrc`) | ProjectScan §32.4 (10014) cho thấy hai cửa đối diện buộc phải xử lý theo giai đoạn |
| Chu trình | `cycles` trong graph pin | 10037: 4 chu trình + 7 multiSrc; 10053: 6 chu trình + 9 multiSrc là các đỉnh |
| Vật cản phụ | chốt, vòng kín, thanh chắn hành lang | 10010: thân vòng chặn hành lang thanh (§32.3) |
| Bom | số bom | Tối đa 2 bom/màn ở track A |
| **Độ rộng khe** | 90° ↔ 60° | **Đòn bẩy độ khó không đổi bố cục:** cửa nhả hẹp hơn 1/3 |

Điểm proxy tham khảo (vòng + thanh + kín + chốt + 3·bom + 2·chu trình + 2·multiSrc) dọc track A cho thấy nhịp răng cưa, không đơn điệu:

```
10017 27 · 10018 25 · 10019 21 · 10020 38 · 10021 31 · 10023 30 · 10024 38 · 10025 24
10026 32 · 10027 34 · 10028 40 · 10029 26 · 10030 44 · 10031 28 · 10032 49 · 10033 40
```

Đây chỉ là proxy cấu trúc, chưa phải độ khó người chơi cảm nhận. ProjectScan §31.2 đã cảnh báo rằng nhiều vật chưa chắc đã khó.

### 4.3 Mô hình phân chia độ khó đề xuất [Suy luận]

1. **Chặng cơ chế** (khoảng 5–10 màn mỗi chặng): mở 1 cơ chế, màn đầu nhỏ, sau đó tăng quy mô và kết hợp với cơ chế cũ.
2. **Màn đỉnh có nhãn "Khó"/lửa** đặt cách quãng (M19, M49). Màn đỉnh thường có: lưới lớn, đối xứng, nhiều chu trình/hội tụ, hoặc bom.
3. **Màn nghỉ ngay sau đỉnh**: hình vẽ đối xứng, nhiều thanh rút độc lập (10152–10161) hoặc đồng tâm.
4. **Track khe 60°** để tăng khó mà không cần vẽ màn mới: dùng cho bản Hard, AB test hoặc lặp lại sau campaign.

---

## 5. Quy tắc bố cục [Đo]

### 5.1 Hằng số hình học chung
- **Bán kính vòng 1,75 chiếm 95,5%** (5.267/5.514). Vòng lớn (3,0 / 4,75 / 5,58 / 7,42 / 9,62 / 12,25) và vòng nhỏ (1,46) chỉ dùng có chủ đích: đồng tâm hoặc vòng bao cụm.
- **Khoảng cách tâm hai vòng kề nhau 4,44–4,58**, đúng khoảng để pin chạm vòng bên cạnh. Designer tool dùng 4,5854.
- **Khe logic chỉ có 3 giá trị chính**: 90° (2.420), 60° (2.280), 0 = vòng kín (652). Các khe 100–330° là vòng cung/arc dùng cho màn đặc biệt.
- **Pin không bao giờ nằm trong khe.** So với tâm khe, pin ở bên hông 90° (44%), 135° (28%), đối diện 180° (22%) hoặc 45° (7%).
- Mật độ pin khoảng **1 pin/vòng** (graph gần như cây). Riêng series 60 là 1,3 (dày, nhiều chu trình).

### 5.2 Hướng và lưới
- Hướng nối giữa các vòng kề: **khoảng 2/3 theo 0°/90°** (lưới vuông), khoảng 18% theo 30/60/120/150° (lưới tam giác/hex), khoảng 3% theo 45° chéo.
- Góc xoay vòng: 55% là bội của 90°, phần lớn còn lại là bội của 15°/30°. Khe hầu như luôn hướng theo trục hoặc theo bước 30°.
- Thanh: **I 43%, L 43%, U/Z 14%**. **73% thanh nằm theo trục 0°/90°**, còn lại theo 30/60/120° (đi cùng lưới hex) hoặc 45°.
- Tỷ lệ khung (rộng/cao, tính theo tâm): trung vị 0,78 ở 10xxx, 0,59–0,68 ở 70/71 → **bố cục dọc**, khớp màn hình điện thoại. Series 60 gần vuông (0,99).

### 5.3 Bảy họ bố cục (mỗi màn thuộc một họ chính)

| Họ | Nhận diện | Ví dụ |
|---|---|---|
| Chuỗi/cụm nhỏ nhập môn | 2–7 vòng, một thành phần, đối xứng | 10001–10005 |
| **Lưới vuông** | ≥ 70% cặp kề theo 0/90°, thường đối xứng | 10030 (4×5), 10050, toàn bộ 20xxx (4×6) |
| **Lưới tam giác/hex** | Cặp kề theo 60/120° | 10002–10003, nhiều màn 70/71 |
| Chéo/hình thoi | Cặp kề theo 45/135° | 10004, M24 |
| **Cụm hỗn hợp vòng + thanh** (chủ đạo ở 10xxx) | Các cụm vòng nối bằng thanh L/U chạy giữa. Pin graph rời nhiều thành phần (trung bình 9) nhưng **tương tác qua va chạm** | 10013–10049 |
| **Đồng tâm/vòng lớn** | Vòng lớn bao cụm nhỏ hoặc nhiều vòng đồng tâm, thường kèm bom | 10021, 10029 (M50), 10063 |
| **Hình vẽ/chỉ thanh** | Đối xứng, rất nhiều thanh I/L toả hoặc xếp hình, ít logic pin | 10155–10161 (M20), 10111, 10122, 72002 |

### 5.4 Quy tắc đối xứng
- Ở 10xxx chỉ khoảng 18% màn đối xứng gương. Đối xứng tập trung ở: màn nhập môn, lưới vuông chỉ có vòng, màn hình vẽ và màn "Khó" (M19).
- Màn hỗn hợp vòng + thanh gần như luôn **bất đối xứng**. **[Suy luận]** Đối xứng chỉ dùng cho màn có chủ đề thị giác; màn logic phức tạp ưu tiên hướng đọc rõ ràng hơn là cân đối.

---

## 6. Áp dụng cho game mình — đề xuất, chờ GD chốt

Người dùng xác nhận (15/10/2026): chưa biết vai trò thật của bộ khe 60° trong game gốc, nên mọi nội dung về 60° trong báo cáo là **suy luận**. Không đối chiếu thêm ảnh M1–M50. Kết quả dùng cho ba việc: xếp campaign 50 màn, luật cho generator/Designer và tài liệu cho GD.

### 6.1 Khung campaign 50 màn (dựa trên track A + 8 ảnh đã khớp)

| Màn | Nội dung đề xuất | Căn cứ |
|---|---|---|
| 1–3 | Chuỗi 2 → 3 → 4 vòng, khe 90°, đối xứng | 10001–10003 |
| 4 | Vòng kín + chu trình nhỏ đầu tiên (đỉnh sớm) | 10004 |
| 5 | Màn nghỉ: 7 vòng, không chu trình | 10005 |
| 6–9 | Chốt chặn; tăng lên 9–12 vòng; có vòng nhận 2 pin | 10006–10009, M7/M8/M11 |
| 10 | Thanh L đầu tiên, **giảm về khoảng 6 vòng** | 10010 |
| 11–12 | Thanh I, rồi thanh U, mỗi màn chỉ thêm một dạng | 10011–10012 |
| 13–18 | Kết hợp vòng + thanh, 9–14 vòng, 4–8 thanh | 10013–10018, M15 |
| **19** | **Khó**: lưới đối xứng 13+ vòng, nhiều hội tụ | M19 ≈ 70005 |
| 20 | Nghỉ: màn hình vẽ đối xứng, thanh rút gần độc lập | M20 = 10161 |
| 21 | Bom đầu tiên, giảm quy mô | 10017, ảnh M21 |
| 22–28 | Bom + thanh + chốt kết hợp; xen 1 màn chỉ có vòng | 10019–10028 |
| 29–30 | Vòng lớn/đồng tâm (+ bom) | 10021, 10029 |
| 31–48 | Lặp chu kỳ "tăng → đỉnh → nghỉ"; thêm pin gắn trong, vòng cung nếu GD duyệt | 10031–10072 |
| **49** | **Khó**: lưới lớn 20 vòng, 4 vòng kín | M49 ≈ 10030 |
| 50 | Nghỉ/kết chặng: đồng tâm + bom, hình ấn tượng | M50 = 10029 |

Cần GD quyết định:
- Màn "Khó" đặt ở vị trí nào. Hiện mới thấy ở M19 và M49; chưa đủ dữ liệu để suy ra chu kỳ.
- Có dùng khe 60° làm cách tăng khó cho màn đỉnh (hoặc cho chế độ Hard) hay không.
- Có làm màn hình vẽ hay không, và nếu có thì bao lâu một lần.
- Release này không có Xích, nên bỏ qua 10162–10169 và phần Xích của 20021+.

### 6.2 Ràng buộc cho generator/Designer (rút từ §5)

| Ràng buộc | Giá trị đề xuất | Loại |
|---|---|---|
| Bán kính vòng | 1,75. Vòng lớn/nhỏ chỉ trong họ đồng tâm/bao | Cứng (95,5% dữ liệu) |
| Khoảng cách tâm hai vòng kề nhau | 4,44–4,59 (mặc định Designer 4,5854) | Cứng |
| Hướng nối giữa các vòng | 0°/90° là chính; 60°/120° khi chọn họ hex; 45° hiếm | Mềm, theo họ |
| Góc xoay vòng | Bước 15°, ưu tiên bội 90° | Mềm |
| Khe | 90° mặc định; 60° = bản khó; 0 = vòng kín | Cứng |
| Vị trí pin so với tâm khe | 90–180° (không đặt trong hoặc sát khe) | Cứng |
| Mật độ pin | khoảng 1 pin/vòng; ≥ 1,3 chỉ cho màn đỉnh | Mềm |
| Thanh | I : L : U ≈ 3 : 3 : 1, song song trục (73%) | Mềm |
| Tỷ lệ khung rộng/cao | 0,6–0,95 (màn dọc) | Mềm |
| Đối xứng gương | Chỉ dùng cho nhập môn, lưới chỉ có vòng, hình vẽ, màn Khó | Mềm |
| Màn giới thiệu cơ chế | Giảm khoảng 40% số vòng so với màn trước | Mềm |

## 7. Giới hạn
- Phân loại hình dạng thanh dựa trên số cạnh dài của collider, nên L có móc ngắn đôi khi bị đếm là I.
- Độ đối xứng chỉ tính trên tâm vòng; chưa tính thanh, pin hay màu.
- Mới đối chiếu 8 ảnh với prefab. Các ghép "≈" là khớp tốt nhất theo số vật, chưa so toạ độ.
- Chưa có replay/lời giải, nên độ khó logic chỉ là proxy. Kết luận "khe 60° khó hơn" là suy luận hình học (cửa hẹp hơn), chưa đo bằng solver.

---

## 8. Nghiên cứu sinh level — tạm dừng 15/10/2026

Code và hướng dẫn: `RotateLevelDesigner/research/gen/README.md`. Dữ liệu: `RotateLevelDesigner/research/20261015-gen/`.

**Phát hiện mới [Đo trên 48 level campaign, bằng lõi Designer]:**
- **Độ khó gốc đến từ việc chặn.** Từ màn 10 trở đi, lúc bắt đầu có nhiều vật kéo được, nhưng chỉ 0–3 vật có tác dụng (ví dụ 10020: 1/10; 10024: 0/11). Ở level sinh ban đầu, vật nào kéo được cũng có tác dụng ngay.
- **Chốt chặn gốc dài 1,47** (95/96 chốt), không phải 0,6 như mặc định của tool. Chốt nằm 60–180° từ tâm khe (nhiều nhất 60–90°), 81% trên vòng chỉ-nhận-pin. Chốt dài cắt qua dải va chạm của vòng bên cạnh, nên giới hạn vùng quay.
- **Thanh gốc:** 223/281 thanh do ngàm giữ (không có pin), 55 thanh chỉ có pin giữ. Dài ~5,5, góc 0°/90° (88%), thường sát vòng hoặc xuyên vào lòng vòng.
- **Thước đo "người chơi ngẫu nhiên"** (số lần kéo bừa trên mỗi vật) khớp với nhịp đỉnh/nghỉ đã quan sát:

  | Nhóm | Màn (lần kéo bừa/vật) |
  |---|---|
  | Đỉnh | 10004 (4,6), 10013 (6,4), 10018 (7,6), 10021 (13,3), 10025 (11,1), 10037 (9,7) |
  | Nghỉ | 10005 (1,6), 10007–10008 (~1), 10029–10030 (3,3), 10042 (2,3) |

  Tỷ lệ "kéo vô ích" tăng từ ~0,3 (chỉ vòng) lên ~0,75–0,85 khi có thanh.
- **Bom tạo ngõ cụt thật:** người chơi ngẫu nhiên chỉ giải được 8–33% ở các màn 10041, 10047, 10049.
- **Solver tìm đường giới hạn:** trong 20 giây không tìm được lời giải cho phần lớn màn từ 10021 trở đi. Người chơi ngẫu nhiên lại giải được hầu hết các màn này.

**Generator (`rr-gen`):**
- Các họ bố cục: lưới vuông, hình thoi, hex, organic; tùy chọn đối xứng gương.
- Đồ thị pin luôn là DAG.
- Khe cách mọi pin ≥ 90°.
- Chốt 1,47 và thanh có ngàm, chỉ giữ khi có witness vai trò.
- Cổng kiểm giống batch B01; solver FOUND không bom/Booster.

**Kết quả:**
- Lượt G01 cho 13 màn chỉ có vòng đạt yêu cầu (slot 1–9, 19, 20, 24, 29). Hình thức gần ảnh game gốc.
- Màn có thanh trong G01 bị loại vì thanh yếu (28/31 rút ra được ngay).
- G02 đã chuẩn bị nhưng chưa chạy.

**Chưa làm:** bom, thanh U, vòng lớn/đồng tâm, màn hình vẽ; đóng gói vào `levels/`; GD chơi thử.
Dải độ khó vẫn là proxy, chưa phải đánh giá của người chơi.

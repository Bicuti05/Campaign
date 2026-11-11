# rr-gen — sinh level TURP theo quy tắc (nghiên cứu 15/10/2026)

Generator viết **file thiết kế** `.rrdesign.json` từ các quy tắc bố cục đo trên 384 prefab gốc
(`Research_DoKho/TURP_DoKho_BoCuc.md`). Toàn bộ kiểm tra dùng lõi Designer (`core/`), không sửa core, constants hay campaign.

## Tệp

| Tệp | Việc |
|---|---|
| `rr-gen.js` | Sinh một ứng viên: bố cục → đồ thị pin → khe/vòng kín → chốt → thanh → cổng kiểm → lời giải → chỉ số |
| `rr-metrics.js` | Chỉ số cấu trúc, solver, "nước mở đầu", người chơi ngẫu nhiên |
| `progression.js` | Ghép tiến trình theo kế hoạch slot, chọn ứng viên khớp dải độ khó |
| `batch.js`, `try.js` | Sinh thử theo spec |
| `calibrate.js`, `naive-campaign.js` | Đo mốc chuẩn trên campaign gốc |
| `sheet.js` | Ảnh tổng hợp (renderer Designer + Chrome headless) |

## Cách sinh

1. **Bố cục** (`family`):
   - `square`: lưới vuông `cols×rows`.
   - `diamond`: lưới vuông xoay 45°.
   - `hex`: lưới tam giác.
   - `organic`: mọc tự do theo bước 15°, kéo về tâm để gọn, giữ khung dọc.

   Mọi họ đều dùng vòng r = 1,75, hàng xóm cách đúng 4,5854. Hai vòng không kề thì cách ≥ 5,6, không có chạm sát.
   `remove` bỏ ô đối xứng gương (`symmetric`) và giữ một cụm liên thông.
2. **Đồ thị pin**: cây khung ngẫu nhiên (một cụm) + cạnh thêm theo `extraEdges` (hội tụ, nguồn chung). Hướng pin theo một thứ hạng ngẫu nhiên nên luôn là DAG; chu trình pin có hướng sẽ đóng băng mọi vòng trong chu trình. Giới hạn `maxOut` 4, `maxIn` 3.
3. **Khe**: tâm khe cách mọi hướng pin (ra và vào) ≥ 90°. Đây là gate "pin cách mép khe ≥ 45°" của batch B01. Ưu tiên khe theo trục (55% vòng gốc). Vòng chỉ-cho-pin có thể là vòng kín (`closed`).
4. **Chốt chặn**: dài **1,47** (95/96 chốt trong campaign gốc), đặt 60–180° từ tâm khe, nhiều nhất ở 60–90°, 85% trên vòng chỉ-nhận-pin. Chỉ giữ chốt có **witness**: ở một trạng thái trên lời giải tìm được, bỏ chốt làm thay đổi kết quả kéo vòng chủ.
5. **Thanh có ngàm** (`guidedSticks`; 223/281 thanh gốc do ngàm giữ): thẳng hoặc L, một ngàm ở gốc, góc theo lưới.
   - Thân thanh phải nằm giữa các vòng: ≥ 2 tâm vòng trong 3,3, hoặc xuyên vào lòng vòng.
   - Không chạy sát thanh khác.
   - Chỉ giữ thanh khi bỏ nó làm đổi kết quả kéo của vòng khác, hoặc khi thanh bị chặn đường rút lúc đầu.
   - `sticks` (thanh do pin giữ) vẫn có, nhưng hiếm khi qua được kiểm vai trò.
6. **Cổng kiểm**:
   - Build và validate OK, analyze **0 cảnh báo**: không chồng, mọi liên kết chạm lúc đầu, mọi pin có đích, không vật nào tự do.
   - Pin cách mép khe ≥ 45°.
   - Chân chốt nằm trên cung vật liệu (cùng phép kiểm của batch B01).
   - Mỗi vật có điểm thân bấm được.
   - Solver FOUND không bom/Booster.

## Thước đo độ khó (proxy, không phải độ khó người chơi)

- `useful/movable`: số vật kéo được lúc đầu và số trong đó có tác dụng.
- `naiveDrags/vật`: số lần kéo trung bình của **người chơi ngẫu nhiên**, tính trên mỗi vật. Người chơi này kéo một vật bất kỳ theo chiều bất kỳ, tới lần đổi khóa đầu tiên hoặc tới khi bị chặn. `naiveUseless` là tỷ lệ lần kéo không đổi gì. `naiveSolved` < 1 nghĩa là có ngõ cụt; ở campaign gốc điều này chỉ thấy ở màn có bom.
- Mốc chuẩn campaign: `research/20261015-gen/campaign-naive.json`, `campaign-baseline.json`.

## Lệnh

```
node research/gen/try.js square 10 '{"cols":3,"rows":3,"stops":2}'
node research/gen/batch.js specs.json outDir
node research/gen/progression.js research/20261015-gen/plan-g01.json research/20261015-gen/g01 1 12
node research/gen/sheet.js out.html out.png outDir/*.rrdesign.json
```

## Chưa làm

- Bom.
- Thanh U.
- Thanh có cả pin lẫn ngàm.
- Vòng lớn/đồng tâm.
- Màn hình vẽ.
- Đối xứng cả hướng khe/pin (hiện chỉ đối xứng vị trí).
- Họ `hex` hiếm khi qua giới hạn bậc.

Witness vai trò là cục bộ trên một lời giải; không chứng minh lời giải duy nhất hay bắt buộc.

## Trạng thái khi tạm dừng (15/10/2026)

- **Mốc chuẩn** trên 48 level campaign: `research/20261015-gen/campaign-baseline.json` (cấu trúc, solver 20 s) và `campaign-naive.json` (người chơi ngẫu nhiên).
- **G01** (`research/20261015-gen/g01/`, kế hoạch `plan-g01.json`) là **bản thử, chưa đóng gói vào `levels/`**:
  - Các màn chỉ có vòng (slot 1–9, 19, 20, 24, 29) qua đủ cổng kiểm và nằm trong dải độ khó mục tiêu. Đã kiểm lại bằng CLI: validate OK, solve FOUND.
  - Các màn có thanh dùng luật cũ: 28/31 thanh là thanh **yếu** (rút ra được ngay bước đầu, chỉ thêm một lần kéo). Không dùng các màn này.
  - Một số slot không có ứng viên hoặc lệch dải (26, 33, 36, 39, 43, 48, 49…).
- **Đã sửa sau G01, chưa chạy lại**:
  - Thanh có ngàm chỉ được giữ khi bị kẹt lúc đầu (`strength: strong`).
  - Thêm chế độ đối xứng gương (`mirror`) cho cả pin, khe, màu và chốt.
  - Vòng quá đông thì tự gỡ cạnh phụ hoặc đổi thành vòng nguồn.
- **G02 đã chuẩn bị, chưa chạy**: `research/20261015-gen/plan-g02.json` (37 slot). `g02/` đã chép sẵn 13 màn chỉ có vòng của G01. Chạy tiếp:

```
node research/gen/progression.js research/20261015-gen/plan-g02.json research/20261015-gen/g02 "<danh sách slot>" 999
node research/gen/finalize.js research/20261015-gen/g02 levels gen02
node research/gen/compare.js research/20261015-gen/g02/manifest.json research/20261015-gen/campaign-baseline.json research/20261015-gen/campaign-naive.json
```

Chia slot ra khoảng 10 tiến trình song song (máy 12 nhân). Slot lớn mất 2–15 phút. `finalize.js` ghi `levels/gen02-NNN.rrdesign.json` và `.rrpack.json` (pack qua CLI, solve không bom).

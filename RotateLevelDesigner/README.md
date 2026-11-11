# TURP — Level Designer (ngoài Unity)

Tool trình duyệt để Designer kéo thả, chơi thử, tìm lời giải và xuất level gửi Dev; kèm CLI để Codex sinh/kiểm level.
Lõi gameplay (`core/*.js`) là bản port JS của code C# trong `Assets/_IEC/Script/Data/TURP` và builder của Level Editor,
được đối chiếu với Unity bằng bộ golden (`node rr-cli.js golden`).

## Mở tool

- Double-click `index.html` (Chrome/Edge). Không cần cài gì, không cần mạng.
- Danh sách campaign bên trái lấy từ `rr-campaign.js`. File này sinh lại khi campaign đổi:
  `node rr-cli.js bundle-campaign` (hoặc Unity: **IEC > TURP > Designer Tool > Export constants + campaign**).
- Bản nháp tự lưu trong trình duyệt; mở lại tool sẽ khôi phục.

## Dùng nhanh

| Phím | Công cụ | Cách dùng |
|---|---|---|
| V | Chọn | Kéo vật để di chuyển; kéo tay cầm tròn để xoay; Q/E xoay; mũi tên dịch; Delete xóa |
| R / O | Vòng / Vòng kín | Bấm để đặt (Q/E đổi hướng khe trước khi đặt) |
| P | Pin | Bấm sát vòng chủ, pin gắn theo hướng bấm, tự nối vào vật nó chạm. Thuộc tính: Hướng, **Dài** (mép ngoài vòng → tâm đầu pin), **Gắn trong** (pin mọc từ mép trong vòng, cắm vào vòng/thanh nằm bên trong; Dài = mép trong → tâm đầu pin), **Khớp vào vật nối** (phím K, cả pin trong) |
| T | Chốt chặn | Bấm **ngoài** vòng = chốt hướng ra, bấm **trong** vòng = chốt hướng vào. Chỉ chặn, không khóa |
| S | Thanh | Chọn dạng Thẳng / L / U rồi bấm |
| G | Ngàm | Bấm lên thanh |
| B | Bom | Bấm lên vòng/thanh (bom đi theo vật) hoặc chỗ trống (bom tự do) |
| L | Liên kết | Bấm pin rồi bấm vật đích để bật/tắt liên kết thủ công |
| X | Xóa | |
| Tab | Chỉnh sửa ⇄ Chơi thử | |

**Chọn và căn chỉnh (kiểu Canva)**
- Shift+click để thêm/bớt vật; kéo khung ở chỗ trống để chọn nhiều; Ctrl+A chọn tất cả. Kéo một vật trong nhóm là kéo cả nhóm.
  Nút tròn ↻ nổi dưới khung chọn: kéo để **xoay cả cụm** quanh tâm khung (lưới bật 15°, Shift 45°, Alt mịn); Q/E xoay cụm từng bước.
  Bảng Thuộc tính khi chọn nhiều: cùng cột, cùng hàng, giãn đều ngang/dọc, copy, nhân bản, xóa.
- Khi kéo, vạch hồng hiện và vật tự hít vào: thẳng hàng tâm với vật khác, tâm cả level, khoảng cách đều trong một hàng/cột
  (có số khoảng cách), và vòng tròn **khoảng cách pin** quanh vòng bên cạnh (điểm 15°; lưới tắt thì hít tự do trên đường tròn).
  Vạch gióng thắng lưới khi gần hơn. **Shift** khi kéo = chỉ đi thẳng ngang hoặc dọc; **Shift** khi xoay = bước 45°; **Alt** = bỏ bắt dính.
- Cuộn bảng: kéo chuột phải/giữa hoặc giữ Space + kéo. Lăn chuột để zoom.
- **Ctrl+C / Ctrl+X / Ctrl+V / Ctrl+D**: copy vật kèm pin, chốt, bom, ngàm của nó; dán tại con trỏ (bám lưới) hoặc lệch một bước.
  Copy một pin/chốt rồi chọn vòng khác để dán lên vòng đó. Dán được cả đoạn JSON thiết kế (ví dụ Codex đưa) vào bảng.
- **Thuộc tính**: kéo trái/phải trên tên field (X, Y, Hướng, Dài…) để đổi giá trị như Unity; Shift nhanh ×10, Alt chậm ×0,1;
  lưới bật thì vị trí nhảy nửa bước lưới, góc nhảy 15°. Mỗi lần kéo là một bước Ctrl+Z.

**Bố cục**
- **Lưới đều** (bật): vòng cỡ 1,75, tâm bắt vào lưới bước 4,5854 (khoảng cách để pin chạm vòng bên cạnh), góc bắt 15°.
  **Tắt**: đặt tự do, góc 1°, sửa bán kính/khe trong Thuộc tính.
- **Tự nối pin** (bật mặc định khi tạo mới): mỗi lần sửa, pin liên kết với đúng các vật nó đang chạm. Khi mở level campaign
  tool tự tắt để giữ liên kết gốc (ví dụ liên kết chưa chạm lúc đầu ở Level10037).
- **Khớp vào vật nối** (pin): quay pin về phía vật đang nối (hoặc vật gần nhất) và chỉnh độ dài để đầu pin nằm giữa thân vật;
  với thanh, pin vuông góc đoạn thanh gần nhất để thanh vẫn trượt được. Nếu đầu pin rơi vào khe của vòng đích, tool báo "chưa khóa".
- **Chốt chặn** độ dài âm = nằm bên trong vòng (như vòng tím có chốt hướng vào tâm và bom bên trong).
- **Kiểm tra** chạy validator + nạp simulation giống game và cảnh báo: vật chồng nhau lúc đầu, liên kết không chạm, pin không khóa gì,
  vật không bị khóa từ đầu.
- **Chơi thử**: kéo vòng/thanh như trong game (chặn, khóa, tự tháo, bom nổ). Lùi nước / Chơi lại.
- **Tìm lời giải**: tìm chuỗi kéo trong mô phỏng. *Tìm thấy* = level kết thúc được; *không tìm thấy* ≠ vô nghiệm.
  Không đo độ khó hay lời giải ngắn nhất. **Phát lại** chạy lời giải từng bước.

## Lưu và gửi level cho Dev

1. Lần đầu: panel trái **Level của tôi → Chọn thư mục levels…**, chọn `RotateLevelDesigner/levels` (Chrome/Edge).
   Mỗi lần mở lại tool, bấm **Cho phép truy cập** một lần nếu trình duyệt hỏi.
2. **Ctrl+S / Lưu** ghi `levels/<tên>.rrpack.json` (lưu tiếp là ghi đè cùng file); **Lưu thành…** (Ctrl+Shift+S) đặt tên khác.
   **Lưu kèm lời giải** tìm lời giải cho bản hiện tại rồi lưu. Panel "Level của tôi" liệt kê các file (✓ = có lời giải, ✗ = chưa tìm thấy);
   bấm để mở lại. File `.rrdesign.json` (Codex viết) trong thư mục cũng hiện ở đây.
3. Gửi file `.rrpack.json` trong `levels/` cho Dev. Dev: Unity **IEC > TURP > Designer Tool > Import designer pack…**
   (hộp thoại mở sẵn thư mục levels) → kiểm schema/runtime, dựng lại hình học bằng C# để so, phát lại lời giải trong C#,
   rồi lưu `Campaign/Level9xxxx.json` với ID mới. Thứ tự campaign vẫn do Dev đặt trong Level Editor.

Trình duyệt không hỗ trợ ghi thư mục (ví dụ Firefox): Lưu sẽ tải file về như trước. Các nút **Xuất level** (`Level<ID>.json`)
và **Xuất thiết kế** (`.rrdesign.json`) luôn tải file về.

## Giới hạn đã biết

- Mô phỏng là bản giải tích (analytic) của lõi game; game dùng Physics2D cho khóa nên các ca sát mép (khe vừa khít, chạm dưới 1 mm)
  có thể khác. Importer Unity luôn chạy lại.
- Không có mesh gốm sứ, hiệu ứng, âm thanh, ngưỡng chạm ngón tay thật. Bảng màu là 7 màu campaign hiện tại (Art chưa chốt).
- Xích (`lockCount`) hỗ trợ từ 09/11/2026: đếm số lần giải vật khác (luật 1.2.2), chặn kéo và tháo tới khi về 0.
- File thiết kế dựng lại mọi vật theo kích thước chuẩn. Pin gắn trong (`"inner": true`) được dựng lại đúng dạng gắn trong
  (`isInnerMount`, hình học giống `RotateCompactLayout.ConfigureInnerPin` của Unity; từ 17/10/2026). Mở level campaign có kích thước khác chuẩn (pin thu nhỏ,
  vòng > 8) rồi **Lưu thiết kế** sẽ ghi các khác biệt vào `_notes`; muốn giữ nguyên hình học gốc thì gửi **gói** (.rrpack.json) chứ không gửi file thiết kế.

## CLI (Node 18+)

```
node rr-cli.js help
node rr-cli.js validate <file...>        # như game nạp + cảnh báo thiết kế
node rr-cli.js build <x.rrdesign.json> -o Level.json
node rr-cli.js describe <Level.json> -o x.rrdesign.json
node rr-cli.js solve <file> [--time 60] [--nodes 4000] [--no-bombs] [--json]
node rr-cli.js render <file> -o x.svg [--links] [--debug] [--grid]
node rr-cli.js pack <file> -o x.rrpack.json [--name ..] [--author ..] [--notes ..]
node rr-cli.js bundle-campaign
node rr-cli.js golden                    # so lõi JS với số liệu Unity xuất (test/golden-unity.json)
```

Định dạng thiết kế: `schema/rrdesign.schema.json`; ví dụ: `samples/sample-4rings-stick.rrdesign.json`.

## Bảo trì (Dev)

- Đổi `RotateAuthoringDefaults` / `RotateTuningConfig` → Unity **Export constants + campaign** (ghi `rr-constants.js`).
- Đổi luật/va chạm C# (`RotateCollisionWorld`, `RotateShapeMath`, `RotateSimulation`, `RotateLevelBuilder`…) → sửa file tương ứng
  trong `core/`, rồi Unity **Export golden test data (slow)** và `node rr-cli.js golden` phải PASS.

| Lõi JS | Nguồn C# |
|---|---|
| `core/rr-math.js` | RotateShapeMath, RotateCenterline, RotateChainMath |
| `core/rr-world.js` | RotateCollisionWorld, RotateSlideAxisResolver, RotateBomb |
| `core/rr-sim.js` | RotateLockGraph, RotateBlockSolver, RotateFeel, RotateTuning, RotateSimulation (probe giải tích) |
| `core/rr-level.js` | RotateLevelValidator + BoardState.LoadLevel, RotateLevelBuilder, RotateLevelDocument |
| `core/rr-solver.js` | RotateSolutionFinder (+ tùy chọn bom nổ khi tìm) |

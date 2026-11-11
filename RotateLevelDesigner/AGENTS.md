# Codex — sinh level TURP bằng Designer Tool

Áp dụng khi Codex làm việc trong `Tools/RotateLevelDesigner` để sinh hoặc sửa level cho Designer.

## Luật bắt buộc

- Viết level dưới dạng **file thiết kế** `*.rrdesign.json` (schema: `schema/rrdesign.schema.json`, ví dụ: `samples/`).
  Không tự viết tay JSON runtime (collider/drag area là dữ liệu bake); dùng `node rr-cli.js build`.
- Mỗi level giao cho Designer phải: `node rr-cli.js validate <file>` = OK **và** `node rr-cli.js solve <file>` = FOUND (không dùng Booster).
  Ghi rõ nếu chỉ giải được khi bom nổ.
- **Xích/Chain (`lockCount`) đã hỗ trợ từ 09/11/2026**: số lần giải vật khác còn cần trước khi vật này kéo/tháo được (thanh cũng được). Inspector có ô "Xích"; badge số trên vật; chơi thử đếm giảm đúng luật game. Luật: `RotateRings_Chain_v122.md`. Chỉ đặt khi GD yêu cầu; không đặt lớn hơn số vật còn lại (sẽ kẹt).
  thẳng/L/U, ngàm, bom.
- Mỗi chốt chặn/thanh/ngàm/bom phải có vai trò trong lời giải (feedback GD 11/10/2026): thử bỏ nó — nếu level vẫn giải giống hệt, bỏ đi.
- StopPin phải có **chân nối thật vào phần cung có vật liệu của vòng chủ**; không gắn vào khe hở hoặc để lơ lửng. Kiểm vị trí chân và geometry đã bake, không chỉ `ownerId`. `validate OK`/`solve FOUND` không thay phép kiểm này. Giữ chốt gọn, có vai trò; không tự đặt ngưỡng chiều dài/radius chung.
- **Cá (Challenge, từ level 11):** đánh dấu `"collect": true` trên vòng (runtime `canCollect`); game chọn tối đa 3 vòng có đánh dấu.
  Cá là sprite 2D ở tâm vòng, không vật nào được đè lên tâm lúc bắt đầu (thân thanh/ngàm/vòng khác/pin/chốt/bom). Ưu tiên **vòng kín**,
  rồi vòng hở sạch, rồi vòng chỉ có đường trượt của thanh đi qua; vòng mà pin/bom có thể quét qua khi xoay chỉ dùng khi không còn vòng khác.
  Kiểm bằng `validate` (cảnh báo `fish-*`) hoặc `node rr-cli.js fish <runtime.json>`; `--mark` tự đánh dấu theo luật này.
- Không lấy số lần kéo, số nhánh tìm kiếm hay mật độ làm bằng chứng độ khó/đẹp. Ghi vào `notes` ý tưởng cần người chơi nhận ra.
- Không sửa `rr-constants.js`, `rr-campaign.js`, `test/golden-unity.json` (sinh từ Unity/CLI) và không sửa `core/` khi chỉ sinh level.
- Không ghi đè level campaign trong `Assets/`; việc nhập vào game do Dev làm qua Unity.

## Hình học cần biết

- Đơn vị board; góc độ, ngược chiều kim đồng hồ từ +X; **mọi góc trong file thiết kế là góc thế giới lúc bắt đầu**.
- Vòng chuẩn: bán kính 1,75, dải va chạm ±0,25, khe logic 90° (0 = vòng kín). `gapDir` = hướng tâm khe.
- Pin nằm cách tâm vòng chủ 2,8354 (độ dài chuẩn 0,8354 tính từ mép ngoài). Hai vòng cách tâm **4,5854** thì pin hướng thẳng sang vòng kia sẽ cắm vào thân nó (khóa).
  Vòng ở khoảng cách khác: đặt `length` của pin = khoảng cách tâm − 1,75 (bán kính vòng đích) − 2,0 (mép ngoài vòng chủ), 0,45–8.
- **Pin gắn trong** (`"inner": true`, từ 17/10/2026): pin mọc từ mép trong vòng chủ, cắm vào vòng/thanh nằm **bên trong** vòng chủ
  (vòng lồng nhau, vòng đồng tâm, thanh luồn vào lòng vòng). `angle` = hướng thế giới từ tâm vòng chủ tới đầu pin; `length` = độ sâu từ
  mép trong (bán kính − 0,25) vào tới tâm đầu pin, 0,2 … (bán kính trong − 0,05). Vòng đích bên trong: đầu pin nằm trên đường tâm phía xa
  của vòng đích (độ sâu = bán kính chủ − 0,25 − (khoảng cách tâm + bán kính đích)). Pin vào thanh phải vuông góc đoạn thanh.
  Runtime ghi `isInnerMount`, giống generator Unity; không dùng pin ngoài đảo chiều để giả pin trong nữa.
- Vòng giữ pin đang cắm vào vật khác **không xoay được**; vật chỉ tự tháo khi không còn liên kết nào đang chạm (khóa đối xứng),
  thanh còn bị ngàm giữ cho tới khi thân rời hộp ngàm. Bom nổ khi chạm vật khác: phá vật mang bom và vật bị chạm.
- Thanh trượt theo một trục: theo ngàm, hoặc theo đoạn thẳng nơi pin cắm, hoặc theo thân nếu thẳng. Thanh gấp không ngàm cần `slideAxis`.
- Chốt chặn `length` dương = thò ra ngoài vòng; **âm = hướng vào trong vòng** (ví dụ chốt chặn bên trong vòng kín, chặn một quả bom nằm trong vòng).

## Lưu file

- Ghi level mới vào `levels/<tên>.rrdesign.json` (hoặc `pack` ra `levels/<tên>.rrpack.json`). Designer thấy ngay trong panel "Level của tôi".
- Không ghi đè file `.rrpack.json` Designer đã lưu trừ khi được yêu cầu; tạo tên mới.

## Vòng làm việc gợi ý

```
node rr-cli.js validate my.rrdesign.json
node rr-cli.js solve my.rrdesign.json --json
node rr-cli.js render my.rrdesign.json -o my.svg --links
node rr-cli.js pack my.rrdesign.json -o my.rrpack.json --author "<tên>"
```

Designer mở `index.html`, Mở… file thiết kế để xem/chơi thử/chỉnh, rồi **Xuất gói gửi Dev**.

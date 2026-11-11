# SỬA LEVEL THEO TOOL MỚI (TURP Designer 10.11)

Tool mới so với bản cũ: (1) đổi định dạng `rotate-rings-pack/design` → `turp-pack/turp-design` (tool mới **không mở được** file định dạng cũ); (2) Xích `lockCount` chính thức được hỗ trợ (validator không còn chặn; mô phỏng đếm giảm theo luật v1.2.2); (3) quy tắc Cá: từ level 11, tối đa 3 vòng, không đè lúc đầu, ưu tiên vòng kín > vòng hở sạch > vòng chỉ có đường trượt, vòng bị quét chỉ khi không còn vòng khác; (4) StopPin phải gắn vào phần cung có vật liệu; (5) mỗi level giao phải `validate` OK và `solve` FOUND.

Áp dụng cho 318 level đang xếp trong campaign v2. Bản sửa ở `NEW_CAMPAIGN_500_SELECTED_LEVELS_TURP/` (tên `..._turp.rrpack.json`); bản gốc giữ nguyên.

## Đã sửa

- Định dạng: 318/318 file đổi sang `turp-pack` + `turp-design`. Runtime gameplay (geometry, link, ngàm, bom, xích) **không đổi** ở mọi level.
- Cá: 29 level đổi cờ cá — bỏ cá ở level nay đứng vị trí 1–10, đánh dấu cá cho level chưa có (Special mới), đánh dấu lại theo thứ tự ưu tiên. P011, P033 giữ nguyên theo quyết định GD 10.11.
- Validate tool mới: 318/318 OK, không level nào bị chặn.
- StopPin: không phát hiện chốt nào có gốc nằm trong khe.

## Lời giải (solve tool mới)

| Trạng thái | Số level |
|---|---|
| Proof cũ tái sử dụng | 224 |
| FOUND | 84 |
| NOT FOUND trong giới hạn | 10 |

- 15 level có xích đều giải lại bằng lõi tool mới (luật xích chính thức) → FOUND.
- Level trước đây Unverified được thử giải: 45s/6000 node, rồi thử lại 150s/40000 node cho bản chưa ra.
- Level đã có proof cũ hợp lệ và gameplay không đổi → tái sử dụng proof (đổi cờ cá/định dạng không ảnh hưởng lời giải).

### Chưa tìm thấy lời giải (Unverified — cần GD chơi thử)

- Vị trí 26: P063
- Vị trí 27: P042
- Vị trí 34: P087
- Vị trí 61: P093
- Vị trí 69: P096
- Vị trí 89: P055
- Vị trí 175: P078
- Vị trí 304: P381
- Vị trí 422: P009
- Vị trí 457: P079

Không tìm thấy trong giới hạn ≠ vô nghiệm (README tool). Theo AGENTS tool mới, level giao phải solve FOUND → các level này **chưa đủ điều kiện giao Dev** cho tới khi GD xác nhận giải được hoặc sửa.

## Còn lại / không tự sửa

- 6 level từ vị trí 11 không có vòng nào đặt cá hợp lệ (mọi vòng bị đè lúc đầu): 41 (P041), 51 (P072), 72 (P051), 103 (P110), 133 (P310), 183 (P330).
- Cảnh báo `fish-corridor` (cá trên vòng có đường trượt thanh đi qua) còn ở các level không có đủ vòng kín/sạch — được phép theo luật.
- Cảnh báo `fish-sweep` còn lại: P033 (GD chọn), và level chỉ còn vòng bị quét.
- Luật "mỗi chốt/thanh/ngàm/bom phải có vai trò" (thử bỏ từng vật rồi giải lại) **chưa chạy**: cần hàng nghìn lượt solve và có thể đổi gameplay GD đã duyệt — đề xuất chạy riêng theo danh sách GD chọn.
- Native Unity: Unknown. Dev nhập bằng Import designer pack của tool mới.
# LevelGen — bộ độc lập để GD dùng AI sinh TURP 101–200

Bắt đầu từ file này. Giải nén toàn bộ folder, giữ nguyên cấu trúc. Không cần project Unity, tài khoản nội bộ, MCP hay Git. Bộ này có Designer hiện tại, CLI bake/validate/render, 100 pack campaign đang dùng, snapshot campaign/runtime, nguồn game gốc, các nghiên cứu và ảnh đã có trên đĩa, luật mới nhất, prompt và checkpoint sạch cho 101–200.

## Thiết lập trên Windows

1. Cài Chrome hoặc Edge nếu máy chưa có trình duyệt phù hợp.
2. Cài bản **Node.js LTS** từ [trang chính thức](https://nodejs.org/en/download). Chọn Windows Installer đúng kiến trúc máy, giữ tùy chọn thêm PATH. Đóng/mở lại terminal, chạy `node --version` và `npm --version`.
3. Mở terminal trong folder LevelGen. Chạy `node scripts/doctor.cjs`. Các thao tác bake/check/SVG chỉ dùng Node built-in, không cần npm install.
4. Muốn xuất PNG tự động: chạy `npm install --omit=dev` một lần trong LevelGen. Thư viện ảnh optional `sharp` có [hướng dẫn chính thức](https://sharp.pixelplumbing.com/install/). Nếu không cài, ảnh SVG và Designer vẫn dùng được; doctor ghi rõ PNG chưa sẵn sàng. Không cài Python để dùng luồng chuẩn.
5. Double-click `OPEN_DESIGNER.cmd` hoặc mở `Tools/RotateLevelDesigner/index.html`. Chọn thư mục `Tools/RotateLevelDesigner/levels` ở panel Level của tôi. Nút Lưu có thể ghi đè file đang mở; dùng **Lưu thành…** khi sửa mẫu để tạo revision mới.

## Đưa cho AI

Mở **cả folder LevelGen** bằng AI có quyền đọc/ghi file và chạy Node.js. Copy nội dung `PROMPT_101_200.md` làm prompt đầu. AI chỉ sinh 101/102 rồi dừng. Sau khi xem và tự giải, dùng prompt trong `prompts/CONTINUE.md` hoặc `prompts/REVISE.md`.

Nếu AI chỉ chat và không truy cập file/terminal, nó không thể tự kiểm hoặc ghi bộ level đầy đủ; cần phiên AI có workspace local. Bộ context không chứa phần mềm AI, subscription hay API key.

## Các phần chính

| Đường dẫn | Dùng làm gì |
|---|---|
| `AGENTS.md`, `context/CURRENT_RULES.md` | Quy tắc hiện hành; ưu tiên hơn mọi quyết định lịch sử |
| `PROMPT_101_200.md`, `prompts/` | Prompt khởi đầu, tiếp tục, sửa, khôi phục phiên |
| `Tools/RotateLevelDesigner/index.html` | Designer đã có, mở/chơi thử/chỉnh và xuất pack |
| `Tools/RotateLevelDesigner/ingame/` | Đúng 100 pack đang dùng ở snapshot; giữ nguyên tên file cũ, tra thứ tự bằng catalog |
| `references/CAMPAIGN_CATALOG.json` | Slot 1–100 → pack/runtime/hash/counts; hiện trạng, không là chứng nhận chất lượng |
| `references/ORIGINAL_CATALOG.json` | Chỉ mục dữ liệu game gốc, phân biệt Board A ordinal với source ID |
| `references/TURPLevel/` | Nguồn, 9 cặp approved, ảnh, report và phân tích gốc đã có |
| `Tools/RotateLevelDesigner/research/` | Nghiên cứu/counterexample/proof lịch sử đầy đủ của Designer |
| `context/archive/` | AGENTS project cũ, ký ức và snapshot chat liên quan; chỉ để tra cứu |
| `Assets/` | Chỉ snapshot dữ liệu/tài liệu phục vụ tra cứu và bundle CLI; không phải project Unity chạy được |
| `scripts/` | Công cụ portable: doctor, check, preview, deliver, verify-bundle |
| `state/progress.json`, `work/` | Checkpoint mới 101–200, brief/ảnh/nhật ký GD |
| `PACKAGE_MANIFEST.json`, `PACKAGE_CHECK.json` | Danh sách file/hash và kết quả kiểm bộ bàn giao lúc đóng gói |

## Quyết định đã chốt cho bộ này

Không tìm lời giải; GD tự giải. AI vẫn kiểm cấu trúc và hình học, dùng pack `--no-solve`. Tiếp nối nhịp 1–100, tham khảo màn gốc và pattern research, mỗi cặp 2 level. Không phải remake theo mapping nguồn 101→source101. Không yêu cầu duyệt kế hoạch tổng trước khi sinh.

Bản 1–100 là mốc tham khảo đã được dùng trong game, có cả hạn chế đã biết. Những bản từng solve FOUND không tự động là tốt/đẹp/khó, và proof không còn hiệu lực khi geometry thay đổi. Xem `context/KNOWN_LIMITS.md` trước khi dựa vào một mẫu.

## Gửi kết quả về Dev

Mỗi level gồm `.rrdesign.json`, `.rrpack.json`, brief, checks và ảnh màu/mono/so nguồn. Gửi thư mục kết quả mới, checkpoint và nhật ký feedback. Dev nhập pack vào project thật, tự xác nhận ID/thứ tự campaign và kiểm Unity. GD không cần cài Unity và không sửa snapshot Assets trong bộ này. Chi tiết ở `context/RETURN_TO_DEV.md`.

Chỉ mục đầy đủ: `context/REFERENCE_INDEX.md`. Bộ không có Git history, SDK/keystore/token, Library Unity, build hay dependency cache máy cũ. Context từ chat là bản tổng hợp các quyết định/feedback đã cung cấp, không giả là bản xuất nguyên văn các lượt assistant không có trong lịch sử hiện tại.

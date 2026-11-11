# Luồng authoring portable

Chạy lệnh tại root LevelGen, đặt đường dẫn trong dấu ngoặc kép nếu có khoảng trắng. Chỉ cần Node.js cho luồng chuẩn.

```powershell
node scripts/doctor.cjs
node scripts/check-level.cjs "work/101/draft.rrdesign.json" --source "references/TURPLevel/LevelVariants/sources/Level10014.rrdesign.json"
node scripts/preview.cjs "work/101/draft.rrdesign.json" --source "references/TURPLevel/LevelVariants/sources/Level10014.rrdesign.json" --out "work/101/preview-r01"
node scripts/deliver.cjs "work/101/draft.rrdesign.json" --slot 101 --rev r01 --source "references/TURPLevel/LevelVariants/sources/Level10014.rrdesign.json" --brief "work/101/brief.json"
```

Nguồn ở ví dụ chỉ minh họa cú pháp, không chỉ định source10014 cho101. Chọn nguồn/pattern thật sau khi đọc catalog. Brief là JSON theo `state/brief-template.json`, điền đầy đủ rồi dùng. Nếu không remake một nguồn cụ thể, bỏ --source; strict OVL phải sạch hoàn toàn. Nếu phối hợp nhiều nguồn, brief liệt kê tất cả, --source là nguồn chính để so ảnh/baseline; không tự union lỗi của nhiều nguồn để được phép chồng mới.

Thiết kế để tạm trong work/<slot>, xuất mới vào Tools/RotateLevelDesigner/levels. `deliver` tạo tên A<slot>_<ngày local>_<rev>, kiểm trùng trước khi ghi, chạy native validate design+pack, pack --no-solve, check bổ sung và roundtrip runtime. Preview màu/mono/so nguồn dùng chung world view. PNG chỉ được tạo nếu sharp đã cài tại LevelGen; SVG luôn có. Không tự thay đổi design để làm đẹp/qua gate. Một bước fail thì giữ artifact là research và ghi lỗi; không gọi bản đó đạt gate.

`check-level` dùng core hiện có: validate/analyze, Guide engaged, pin margin, initial bombSweep với đường đi0 (chỉ query pose ban đầu, không thao tác/replay), palette/cỡ/màu gần, strict OVL, cardinal đoạn thanh và U hai chân/ngàm. Stop root được kiểm bằng hai điểm chân polygon baked. Kết quả có giới hạn riêng; nếu check nghi ca hình hợp lệ bị bắt, giữ research và hỏi GD/Dev, không sửa engine/tolerance hoặc bỏ gate im lặng.

Native CLI có thể chạy riêng:

```powershell
node Tools/RotateLevelDesigner/rr-cli.js validate "work/101/draft.rrdesign.json"
node Tools/RotateLevelDesigner/rr-cli.js build "work/101/draft.rrdesign.json" -o "work/101/runtime.json"
node Tools/RotateLevelDesigner/rr-cli.js pack "work/101/draft.rrdesign.json" -o "work/101/research-only.rrpack.json" --no-solve
node Tools/RotateLevelDesigner/rr-cli.js validate "work/101/research-only.rrpack.json"
```

CLI pack gốc có thể ghi đè đường dẫn -o: chỉ dùng tên chưa tồn tại. `deliver` bảo vệ các output của nó. Không bấm Tìm lời giải/Lưu kèm lời giải trong Designer. Chơi thử bằng tay là việc GD, không gọi native Solver thay cho GD.

Sau khi xuất: mở ảnh và Designer, ghi rõ visual review đã/chưa làm. Cập nhật `state/progress.json` bằng giữ lịch sử, ghi source/stem/hash/status, pendingReview và nextSlot. Không tự động approve. Mẫu giao ở `state/brief-template.json`; nhật ký trong `work/DELIVERY_LOG.md`. `deliver` chỉ xuất và lập delivery.json; AI vẫn chịu trách nhiệm đọc ảnh, cập nhật checkpoint và giao cặp.

Ngày tên file lấy theo ngày local trên máy GD; checkpoint timestamps dùng ISO UTC. ZIP được mở lại ở vị trí bất kỳ, không cần đường dẫn C:/Project Folder cũ. Script historical trong research có thể không portable/tự tìm lời giải; không dùng làm entry point mặc định.

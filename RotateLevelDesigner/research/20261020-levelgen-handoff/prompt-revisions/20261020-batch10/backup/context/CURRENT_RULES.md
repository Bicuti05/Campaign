# Quy tắc thiết kế hiện hành — 20/10/2026

## Phạm vi và chất lượng

Sinh 100 level tiếp theo, logical slot 101–200, không đụng 1–100. Mỗi lượt hai proposal, không tự sang cặp mới. Tham khảo game gốc và pattern nghiên cứu, giữ tinh thần phụ thuộc/chia sẻ nguồn/cửa, nhưng tạo silhouette và bố cục đủ khác. Không một khuôn lưới dùng cho cả chuỗi; không chỉ lật, đổi góc hay màu; không ghép các cụm độc lập để đủ lượng vật. Không cắt bỏ tới mức trống chỉ để qua kiểm.

Feedback A055/056: mẫu tự dựng giống nhau và quá xa nguồn. Feedback A057/058: chỉ lật/sửa nhẹ thì quá giống nguồn. Khi remake một nguồn, phối hợp lật hoặc xoay bội90°, bỏ khoảng2–3 vòng rìa, thêm2–3 thanh có vai trò, đổi vài radius, rewire/đảo3–4 liên kết nếu phù hợp. Đây là hướng sáng tạo, không quota cứng áp cho mọi màn hoặc nguồn ít vật.

Khi pattern đơn đã đủ phong phú, kết hợp các pattern có bằng chứng vào level phức tạp hơn. Nguồn/cửa/thanh dùng chung và quay lại vật sau khi mở đầu ra là ưu tiên. Không ép graph một component, có chu trình, một số vòng hay size/stop cố định thành luật chung.

## Hình và màu

- Bố cục dọc, hàng/cột/khoảng cách có chủ đích; góc nhìn lật hoặc bội90°. Thanh mới ngang/dọc, không nghiêng trừ yêu cầu GD riêng.
- Cỡ linh hoạt có mục đích, một vài vòng lớn rõ; cùng màu/cùng vai trò nên cùng cỡ. Không vin min radius của tool để bác feedback GD.
- Chỉ7 màu `orange, red, blue, purple, green, navy, teal`. Vật gần/chạm phải khác màu và đủ tương phản. `sky` còn xuất hiện trong schema lịch sử nhưng không là màu thứ8 để dùng mới. Màu không thay luật.
- Pin trên vòng hở: góc pin cách **mép** khe logic ít nhất45° (không chỉ cách tâm khe). Giữ pin trong thật `inner:true` khi kế thừa nguồn; angle là hướng từ tâm chủ tới đầu pin, length là độ sâu từ mép trong vào.
- Mọi `lockCount=0`; không Chain. Vòng hở/kín, pin, stop-pin, straight/L/U, Guide và Bom là cơ chế đã có. Không thêm cơ chế mới hoặc Booster bắt buộc.

## Thanh, ngàm, chốt và Bom

- Guide đủ và engaged từ đầu; không thêm ngàm dư trên thanh nhận pin. Không link idle, pin vô liên kết hay vật tự do.
- U qua hai khe: hai chân bằng nhau, một Guide trên mỗi chân; Guide xa góc để không nửa ngàm. Nhận định trạng thái trung gian/đường rút cần GD chơi thử; kiểm tĩnh không chứng minh đường rút.
- Thanh gấp không có ràng buộc suy trục phải author `slideAxis` local hợp lệ. Không tự bỏ/sửa axis bằng engine để chữa hình học sai.
- Stop có chân thật vào cung có vật liệu, kiểm geometry baked; không gắn vào khe/lơ lửng. Chốt gọn, cân đối, vai trò nêu rõ. Stop không tạo khóa.
- Không Bom chạm ngay lúc nạp. Nếu có Bom, ghi vật chủ, vật định phá và mục đích; không tuyên bố đã nổ hoặc giải được khi không kiểm lời giải.

## Gate còn bắt buộc, và giới hạn của chúng

Native CLI validate design và pack phải OK. Analyze0 warning. Kiểm margin, Guide engaged, link active, initial Bom contact, palette/size/contrast, body overlap. Strict OVL không được có cặp mới/sâu hơn nguồn; nguồn chỉ là baseline hình học, không cho phép bỏ qua warning analyzer. Bản chưa đạt giữ research, không gọi là bản giao đạt gate.

Không solve/G4/gesture/ablation/replay ở luồng này. `proof:null`; notes ghi GD tự giải, chưa xác minh solvability/độ khó/role động. Số vật, drag lịch sử, PASS, density hay component không chứng nhận đẹp/khó. Mục tiêu cụ thể/tags Practice/Combine/Challenge là đề xuất thiết kế, phải phân biệt với hành vi đã chứng minh.

Luồng này không sửa core/app/constants/campaign/golden/C#/gameplay/save/dependency của project gốc. Có thể viết script authoring riêng trong work, dùng thư viện đã cung cấp; không triển khai engine mới. Không ghi đè revision cũ hoặc file tham chiếu.

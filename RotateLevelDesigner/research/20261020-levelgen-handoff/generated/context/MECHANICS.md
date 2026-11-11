# Cơ chế và dữ liệu cần hiểu trước khi author

Simulation diễn ra trong XY, góc độ ngược chiều kim đồng hồ từ +X. Hiển thị game thật là mesh3D gốm sứ; Designer chỉ là sơ đồ collider2D. Mọi góc `.rrdesign.json` là góc thế giới lúc đầu, trừ `slideAxis` là local theo thanh. Không suy chuyển động chiều sâu từ hình3D.

Vòng có khe logic; pin của vòng chủ cắm vào vật nhận tạo khóa hai phía. Vòng có outgoing pin còn engaged không thể xoay. Vật chỉ tự tháo khi hết liên kết đang chạm, và thanh còn được Guide giữ tới lúc thân rời ngàm. Input được chọn không chứng minh đường xoay/trượt mở. Một actor có thể đổi trạng thái để vật khác rời, chưa tự rời; ý tưởng tốt có bước chuẩn bị và quay lại.

Bán kính chuẩn1,75, bề dày va chạm±0,25, khe thường90°. Khoảng tâm hai vòng chuẩn4,5854 phù hợp pin chuẩn0,8354. Với pin ngoài hướng tâm-tâm, length ≈ khoảng tâm − radius đích − (radius chủ+0,25). Chỉ là công thức khởi đầu: cần kiểm đầu pin trên phần vật liệu của đích và đường hình học thật.

Pin gắn trong: `inner:true`, `angle` hướng từ tâm chủ tới đầu pin, `length` là độ sâu từ mép trong vào. Khi đầu pin trên phía xa đường tâm vòng đích nằm bên trong: length = (radius chủ−0,25) − (khoảng tâm+radius đích). Pin vào thanh phải vuông góc đoạn thanh đang nhận. Không giả inner bằng pin ngoài quay180°.

Stop: length dương hướng ra ngoài, âm hướng vào trong; chỉ chặn va chạm, không tạo khóa. Hai chân polygon baked phải nằm trên cung có vật liệu của vòng chủ. Bom gắn vật di chuyển theo vật; khi chạm vật khác có thể phá vật chủ và đích. Bom không đồng nghĩa Booster.

Thanh thẳng/L/U trượt theo một trục; Guide và pin-contact có thể xác định trục. Thanh gấp thiếu trục cần `slideAxis`. Guide có trigger và vách chặn thật. Với U qua hai cửa, một ngàm mỗi chân và hai chân bằng nhau giúp đọc hình; chưa chứng minh rút được chỉ bằng quan sát trạng thái đầu.

Nguồn chính xác cho authoring là `Tools/RotateLevelDesigner/schema/rrdesign.schema.json`, ví dụ trong samples và geometry hiện tại. Collider/drag area/runtime do CLI bake, không viết tay. Schema lịch sử có vài field/default rộng hơn luật hiện hành; luật root mới nhất thắng. Native CLI tự dựng simulation nhưng không phải một JSON Schema validator đầy đủ; check bổ sung cũng không thay playtest GD.

Pack gồm runtime+design+notes+analysis+proof. Khi GD chỉnh qua Designer, runtime có thể giữ kích thước mà design mô tả lại không lossless; xem `_notes`. Không tự rebake pack tham khảo rồi gọi là bản gốc. Với file sinh mới phải đọc lại serialized pack và kiểm bake design khớp runtime; với nguồn cũ khác biệt được ghi làm giới hạn, không sửa nguồn.

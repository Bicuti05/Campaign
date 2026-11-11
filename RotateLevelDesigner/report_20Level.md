# Nghiên cứu lại curve 20 level đầu — bộ 100 level gốc

Cập nhật: 20/10/2026 (Asia/Saigon). Phạm vi: phân tích, không sửa level hoặc trạng thái approved.

## 1. Kết quả chính

Curve có **ba trục riêng**, không phải đường tăng đều theo số object:

1. **Cơ chế/hình dạng:** xoay ring L1 → vòng kín L4 → stop-pin L6 → thanh thẳng L7 → thanh L và bom L10 → thanh U L13.
2. **Tư duy lời giải:** thao tác trực tiếp L1–2 → tác động gián tiếp thể hiện ở L3 → chuẩn bị và quay lại thể hiện rõ ở L4 → phối hợp trạng thái vòng/thanh ở các màn sau, nổi bật L15–L20.
3. **Nhịp trải nghiệm:** L4 có dấu hiệu đỉnh sớm, L5 giảm tải; L10 là mốc nhiều nội dung mới, L11 giảm lượng vật; L14–L20 tăng trọng tâm vào quan sát, trạng thái trung gian và quay lại vật cũ. L18 chưa đủ dữ liệu để xếp nhịp khó.

**Bom có từ L10 (2 bom), trở lại L19 (1 bom).** Thanh thẳng, L, U phải theo dõi thành ba bài học hình học riêng. Tuy nhiên, hình mới xuất hiện không tự chứng minh có thao tác mới hoặc buộc người chơi vận dụng đặc tính riêng của nó.

## 2. Nguồn, cách nghiên cứu và mức tin cậy

- Thứ tự, counts và candidate walkthrough: `index (6).html`, bộ **TURP · BOARD A · LEVELS 1–100**, nhánh `Thế-Anh`.
- Snapshot Git: `f8b4eefb686e2f8a2ca412e96924379e13620ba8`; SHA-256 HTML: `8a6ef566bcd034049a28c6c25c22114fdd085be8db2a3dcbf1b74df55daf93fd`.
- Snapshot ghi kiểm nguồn 11/10/2026; URL từng màn: `https://turp.com/levels/N/`. Lượt nghiên cứu này không tải được website để đối chiếu lại hình gốc (proxy trả 403), nên không tuyên bố đã xem ảnh mới hoặc chơi bản gốc.
- Hình thanh: đối chiếu `LevelVariants/sources/Level*.rrdesign.json`, **không dùng bản biến thể**. Kiểm đường tâm thẳng/một góc vuông/hai góc với hai nhánh cùng phía; tổng thanh khớp HTML ở cả 11 màn có thanh. Đây là hình học nguồn đã dựng, chưa phải bằng chứng engine gốc tương đương.
- Đếm lại record: rotate/slide, bước không ghi departure, đoạn liên tiếp không departure, actor quay lại sau một actor khác, actor đổi hướng và thao tác giải vật khác mà không giải chính actor.
- Không ghép số thứ tự bộ 100 với thứ tự asset 384; không chuyển số đo solver của prefab khác sang đây. Mã S trong hình học và walkthrough chưa được xác minh trùng nhau.

**Ba mức bằng chứng:** (1) hiện diện/cấu trúc được ghi; (2) hành vi được candidate mô tả; (3) bắt buộc/tối ưu trong gameplay. Báo cáo có mức 1–2; chưa có mức 3. Tag và mục tiêu là suy luận thiết kế, không phải chủ đích tác giả được xác nhận.

## 3. Tiêu chí curve

| Thành phần | Câu hỏi phân tích |
|---|---|
| Kiến thức mới | Có thêm quy tắc, hình dạng hoặc cách suy nghĩ chưa gặp? |
| Đọc hình | Có dễ thấy khe, chốt, trục rút, tay gập và vật cản? |
| Lựa chọn | Người chơi phải tìm bước hữu ích giữa những vật nào? Chưa đo được số lựa chọn hợp lệ thực tế từ record. |
| Phụ thuộc | Cần đổi A để B được giải? Một vật phục vụ nhiều nhiệm vụ? |
| Trạng thái trung gian | Có dịch/xoay chưa tháo, chuyển vật, đổi chiều và quay lại? |
| Phản hồi | Bao lâu mới thấy vật rời? Record có ghi kết quả rõ không? |
| Khối lượng | Có bao nhiêu vật, vùng và thao tác được ghi? Tách độ dài khỏi độ sâu suy nghĩ. |

**New** = nội dung mới; **Practice** = củng cố; **Combine** = phối hợp; **Challenge** = tăng yêu cầu vận dụng; **Recovery** = giảm tải tương đối. Tag có thể đồng thời; nhãn “dự kiến” cần playtest. Không gán điểm khó 1–10 hoặc phần trăm D1 khi chưa hiệu chuẩn.

## 4. Phân tích từng level

Cấu trúc ghi `vòng / thẳng / L / U`, vòng kín tính trong số vòng. Ngàm, stop-pin và bom không cộng thành vật kéo độc lập. Tên actor trong mô tả lấy từ candidate, không tự ghép với ID hình học.

| Level | Vòng / thẳng / L / U | Tag chính/phụ | Bài học cụ thể | Hành vi người chơi cần thực hiện | Bằng chứng và điểm gây vướng | Vai trò trong curve |
|---|---|---|---|---|---|---|
| 1 | 2 / 0 / 0 / 0 | New | Xoay ring, đọc khe và chốt | Xoay Ring 2 để khe đi qua chốt; thả tay và quan sát cả cặp tách. | Hai vòng chỉ đặt một bài toán thao tác. Record có quay + wait; departure trống, không coi là thất bại. | Nhập môn; học quan hệ giữa cử chỉ và kết quả. |
| 2 | 3 / 0 / 0 / 0 | Practice | Lặp lại xoay–tháo | Xử lý vòng ngoài trước rồi tiếp tục với cặp còn lại. | Ba vòng; candidate có hai lần quay đều ghi tháo. | Tăng lượng luyện, chưa tăng loại cơ chế. |
| 3 | 4 / 0 / 0 / 0 | Practice + mở rộng tư duy | Xoay A để B rời | Sau Ring 4, quay Ring 1 làm Ring 3 rời; tiếp tục dùng Ring 1 cho cặp cuối. | Cùng thao tác xoay nhưng kết quả không chỉ nằm trên actor đang kéo. | Tăng nhẹ yêu cầu đọc quan hệ; không phải cơ chế vật lý mới. |
| 4 | 7 / 0 / 0 / 0 | New + Challenge | Vòng kín; tạo trạng thái rồi quay lại | Xử lý các hàng xóm của vòng kín; giữ kết quả chuẩn bị qua nhiều thao tác. | Candidate quay Ring 2, Ring 6, Ring 3 chưa ghi tháo; bước 4 mới ghi Ring 1 rời; sau đó quay lại cả ba vòng. | Đỉnh sớm: cùng lúc tăng số vòng, liên kết và độ trễ phần thưởng. |
| 5 | 7 / 0 / 0 / 0 | Practice + Recovery dự kiến | Mở nhánh, tháo gián tiếp | Quay Ring 5 để Ring 7 rời, rồi tiếp tục quay để tháo Ring 5. | Không có vòng kín; sáu bước candidate đều ghi vật rời. | Nhịp củng cố và lấy lại cảm giác tiến triển sau L4. |
| 6 | 9 / 0 / 0 / 0 | New + Practice | Stop-pin / chọn đường xoay | Nhận biết chốt cản đường; tiếp tục xoay vòng để tháo hàng xóm rồi chính nó. | Một stop-pin; record có Ring 2 giải Ring 1 rồi mới tự rời. Chưa chứng minh hướng bị chốt chặn. | Tăng đọc hình học; chưa được gọi là bài chốt bắt buộc. |
| 7 | 7 / 4 / 0 / 0 | New + Combine | Thanh thẳng + guide | Nhận ra trượt khác xoay; chọn hướng rút theo guide và khoảng trống. | Bốn thanh thẳng; candidate rút S2/S3 trái, S1/S4 phải, xen nhóm vòng. Không ghép ID với hình học nếu chưa mapping. | Tải mới đáng chú ý: nhiều thanh ngay lần đầu, nhưng có nhiều lần thực hành trong cùng màn. |
| 8 | 9 / 0 / 0 / 0 | Combine + Practice | Vòng kín, chốt, tháo gián tiếp | Dùng vòng mở để giải hàng xóm, rồi tiếp tục xử lý chính vòng đó. | Hai vòng kín; record lần lượt dùng Ring 4 giải Ring 5, Ring 2 giải Ring 1, Ring 7 giải Ring 8. | Củng cố đọc quan hệ; tạm rời cơ chế thanh, không phải luyện thanh L7. |
| 9 | 12 / 0 / 0 / 0 | Combine + Challenge | Nhiều nhánh vòng kín/chốt | Chuyển giữa các nhánh và quay lại vòng đã tạo trạng thái. | Ba vòng kín, hai chốt; candidate quay Ring 1 chưa tháo rồi quay lại sau thao tác khác. | Tăng quy mô quan sát và phối hợp, không thêm loại object. |
| 10 | 6 / 0 / 8 / 0 | New + Combine; Challenge chưa xác minh | Thanh L + bom | Nhận dạng L và sự khác nhau giữa trục trượt với tay gập; nhận diện bom như cơ chế tương tác mới. Bố cục mang hình con vật/đồ vật theo xác nhận người dùng. | Tám L, hai bom, năm vòng kín. Năm bước đầu chỉ ghi xoay Ring 3 và rút hai thanh, chưa ghi kích bom. | Điểm mới lớn nhất về nội dung và mốc visual đặc biệt; chưa biết hiệu ứng bom có làm màn dễ hơn hay khó hơn. |
| 11 | 6 / 0 / 2 / 0 | Practice L + Combine; Recovery dự kiến | Đường rút của L; chuẩn bị vòng | Rút thanh xen với xoay vòng; xoay Ring 5 trước, xử lý phần khác rồi quay lại. | Hai L; record có một bước Ring 5 chưa ghi tháo, sau đó quay lại để giải Ring 6 rồi cụm cuối. | Giảm lượng vật so L10; có thể củng cố L, không luyện bom. |
| 12 | 9 / 0 / 0 / 0 | Combine + Practice | Ring, stop-pin, chuẩn bị ngắn | Xoay Ring 1 tạo trạng thái, giải Ring 3 rồi quay lại Ring 1. | Một vòng kín, hai chốt; candidate bắt đầu bằng một bước chưa tháo. | Ôn lại tư duy L4 trong cấu trúc khác; không phải lần đầu dạy chuẩn bị. |
| 13 | 7 / 0 / 0 / 2 | New U + Combine | Thanh U với hai nhánh | Nhận ra U là một vật; cần đọc khoảng trống cho cả nhánh và đáy, không coi là hai thanh riêng. | Hai U và bốn ngàm; candidate chỉ có ba thao tác vòng, chưa có thao tác trượt. | New về hình học đã có bằng chứng; bài học rút U mới là giả thuyết cần kiểm. |
| 14 | 14 / 3 / 2 / 0 | Combine; Challenge về khối lượng | Thanh thẳng + L, nhiều vùng | Phối hợp hướng rút ngang/dọc với mở vòng; quay lại đối tượng sau khi thay điều kiện. | Ba thẳng, hai L, ba stop-pin; candidate có S4 chia hai bước và Ring 11 đổi chiều sau đoạn xen kẽ. | Nặng về tìm kiếm/duy trì chú ý. Không chứng minh sâu hơn L15 chỉ vì nhiều vật hơn. |
| 15 | 9 / 4 / 3 / 1 | Combine + Challenge dự kiến | Thẳng + L + U; chuỗi chuẩn bị | Giữ trạng thái, chuyển vật, quay lại và có lúc đổi chiều. | Bốn thẳng, ba L, một U; record đầu có ba bước chưa tháo; quay lại Ring 6, Ring 9, S1. Candidate chưa kết thúc. | Đỉnh lập kế hoạch có dấu hiệu mạnh, nhưng chưa biết route thay thế đơn giản hơn. |
| 16 | 10 / 0 / 2 / 0 | Practice L + củng cố dịch tạm | Thanh làm công cụ giải vòng | Dịch S2 để Ring 8 rời nhưng giữ thanh lại; sau đó dịch ngược và cuối cùng rút thanh. | Hai L, không ghi ngàm; không suy trục từ guide không tồn tại. Record S2 đổi hướng qua các pha. | Giảm số thanh nhưng giữ yêu cầu suy luận. Không gọi là Recovery đã xác minh. |
| 17 | 13 / 2 / 1 / 1 | Combine + Challenge dự kiến | Thẳng + L + U; chuẩn bị xen kẽ | Kết hợp trượt thanh với chỉnh nhiều vòng trước lần tháo tiếp theo. | Hai thẳng, một L, một U; record có ba bước chưa tháo liên tiếp và quay lại/đổi chiều Ring 11; còn thiếu kết thúc. | Tăng tải nhớ mục đích của trạng thái trung gian. |
| 18 | 11 / 2 / 1 / 3 | Combine theo cấu trúc; chưa xếp Challenge | Nhiều U với các ngàm | Bố cục gợi ý cần đọc đường thoát đồng thời của nhiều hình thanh. | Hai thẳng, một L, ba U, tám ngàm; không có walkthrough hành động. | Có tải quan sát; chưa đủ bằng chứng về thứ tự, chuẩn bị hoặc độ khó chơi. |
| 19 | 10 / 0 / 3 / 2 | Combine; tái xuất bom | L + U + bom + vòng kín | Nhận lại bom sau khoảng ngắt; phối hợp các dạng thanh và vòng. | Ba L, hai U, một bom; record chỉ có phần đầu, chưa ghi nổ. | Không thể khẳng định Practice bom hay Challenge bom; bom có thể giảm ràng buộc nếu dùng hiệu quả. |
| 20 | 6 / 0 / 4 / 0 | Practice L + Combine + Challenge dự kiến | Dịch tạm và giữ kế hoạch qua nhiều bước | Giữ trạng thái qua nhiều thao tác vòng/thanh rồi quay lại hoàn tất. | Bốn L, không vòng kín/bom; record bước 3–7 là năm bước liên tiếp chưa ghi vật rời, bước 8 tháo Ring 3 và Ring 1. | Đỉnh trễ phần thưởng trong candidate; ít vật không có nghĩa ít phải nghĩ. Đồng thời là mốc visual hình con vật/đồ vật theo xác nhận người dùng. |

## 5. Từng chuỗi học: New → Practice → Combine → Challenge có thực sự nối tiếp?

| Chuỗi kỹ năng | New/biểu hiện sớm | Luyện và kết hợp về sau | Khoảng trống/giới hạn |
|---|---|---|---|
| Xoay ring | L1 | L2 luyện, L3 mở rộng quan hệ, L4 thử thách chuẩn bị | Nhịp đầu khá rõ; L4 tăng nhiều yếu tố cùng lúc. |
| Tác động gián tiếp | L3 ghi rõ xoay A giải B | L5, L6, L8 và nhiều màn sau | Không gọi là luật mới: có thể đã hiểu từ cặp L1; L3 làm biểu hiện rõ hơn. |
| Vòng kín | L4 | L8–L9 kết hợp chốt; có ở L10–12,14–15,17–19 | L5 không có vòng kín, nên là giảm tải/kỹ năng vòng chung, không phải Practice vòng kín trực tiếp. |
| Stop-pin | L6 | L8–L9, L10, L12, L14–L15 | L7 không có stop; chưa có đối chứng cho vai trò từng chốt. |
| Thanh thẳng | L7 (4 thanh) | L14, L15, L17, L18 | L8–9 không có thanh; không luyện liên tục ngay sau lần đầu. |
| Thanh L | L10 (8 thanh) | L11 (2 L), L14–L20 tùy màn | L10 đồng thời thêm bom; L11 có thể tách để củng cố L. |
| Bom | L10 (2 bom) | L19 (1 bom) | L11–18 không có bom: có 8 màn xen giữa. Chưa biết dùng bom bắt buộc hay chỉ là cách giải thuận lợi. |
| Thanh U | L13 (2 U) | L15 (1 U), L17 (1), L18 (3), L19 (2) | L14 không có U; candidate L13 chưa ghi trượt, không chứng minh đã dạy cách rút U. |
| Chuẩn bị/quay lại | L4 ghi rõ ba bước chưa tháo và quay lại | L9, L11–12, L14–17, L20 | Record không chứng minh tối thiểu; không dùng số lần chia bước để kết luận độ sâu bắt buộc. |
| Dịch tạm thanh để giải vòng | Thấy rõ ở candidate L16 | L17/L20 có trạng thái trượt trung gian | L14–15 đã có chia bước trượt; không khẳng định L16 là lần đầu cơ chế tồn tại. |

## 6. Nhịp khó và nhịp trải nghiệm

### L1–L5: từ thao tác đến tư duy chuẩn bị

L1 cho một thành công tập trung; L2 tăng cơ hội lặp; L3 mở rộng từ điều khiển một vật sang quan sát kết quả trên vật khác. L4 là bước chuyển lớn: thêm vòng kín, nhiều quan hệ và ba thao tác đầu chưa ghi tháo. L5 không tiếp tục ép vòng kín mà cho nhiều phản hồi tháo liên tục. Có thể hiểu đoạn này là **Learn → Repeat → Extend → First challenge → Confidence**, nhưng đây là diễn giải, chưa xác nhận ý đồ tác giả.

### L6–L10: thay đổi cách đọc đường đi

L6 đưa vật cản đường xoay. L7 chuyển sang một kiểu thao tác khác là trượt thanh thẳng. L8–9 quay lại phối hợp vòng/chốt thay vì ép thanh liên tục. L10 thêm cả hình L và bom trong một cấu trúc nhiều ràng buộc. Màn này là **đỉnh về số nội dung cần nhận diện**, không mặc nhiên là đỉnh khó: bom có thể phá nút giữ và làm giảm công việc. Thiếu phần kích bom nên chưa xác định được trải nghiệm đó.

### L11–L15: luyện hình L, thêm U, tăng phối hợp

L11 giảm số thanh từ tám xuống hai và không có bom/chốt, có dấu hiệu giảm tải nội dung đồng thời. L12 ôn chuẩn bị qua vòng/chốt. L13 đưa U nhưng record chưa cho thấy cách trượt. L14 phối hợp thẳng/L với nhiều vùng; L15 mới gom cả ba hình thanh, có chuỗi chuẩn bị và quay lại. **L14 có nhiều vật hơn L15 nhưng không đủ để xếp L14 khó hơn.**

### L16–L20: thay đổi mục đích sử dụng vật

L16 là ví dụ mạnh về “thanh chưa cần rút mất”: dịch nó để giải vòng, giữ lại rồi quay lại. L17 phối hợp các dạng thanh và chuẩn bị; L18 chưa đủ route để xác định nhịp căng. L19 nhắc lại bom sau khoảng ngắt dài. L20 bỏ bom/vòng kín nhưng record có năm bước liên tiếp chưa tháo; có thể tạo thử thách ghi nhớ trạng thái dù chỉ mười vật kéo.

**Curve suy luận:** mở đầu tăng nhẹ → L4 tăng mạnh → L5 hạ → L6–9 tăng nhận diện/phối hợp → L10 nhiều nội dung mới → L11 giảm tải cấu trúc → L12–15 tăng phối hợp → L16 luyện sâu hơn với ít thanh → L17–20 củng cố trạng thái, có điểm chưa biết ở L18 và phần bom L19. Không vẽ đồ thị số vì chưa có độ khó người chơi được đo.

## 7. Bằng chứng định lượng từ record — không phải độ khó engine

Chỉ đếm rotate/slide; bỏ wait. “Chưa tháo” nghĩa là field departures rỗng. “Quay lại” yêu cầu có actor khác xen giữa; lặp cùng actor liên tiếp không tính. “Đổi hướng” chỉ mô tả record, chưa chứng minh bắt buộc. L1 thiếu departure dù mô tả có đợi tách; không dùng ô trống để suy rằng không thể tháo.

| Level | Trạng thái record | Rotate/slide được ghi | Bước chưa ghi tháo | Chuỗi chưa tháo dài nhất | Lần đầu ghi tháo ở bước | Actor quay lại sau vật khác | Actor đổi hướng |
|---|---|---|---|---|---|---|---|
| 1 | Phần đầu | 1 | 1 | 1 | Không ghi | — | — |
| 2 | Candidate ghi về 0 | 2 | 0 | 0 | 1 | — | — |
| 3 | Candidate ghi về 0 | 3 | 0 | 0 | 1 | — | — |
| 4 | Candidate ghi về 0 | 8 | 3 | 3 | 4 | Ring 2, Ring 6, Ring 3 | — |
| 5 | Candidate ghi về 0 | 6 | 0 | 0 | 1 | — | — |
| 6 | Candidate ghi về 0 | 7 | 0 | 0 | 1 | — | — |
| 7 | Candidate ghi về 0 | 11 | 2 | 1 | 1 | — | — |
| 8 | Candidate ghi về 0 | 7 | 0 | 0 | 1 | — | — |
| 9 | Candidate ghi về 0 | 9 | 1 | 1 | 1 | Ring 1 | — |
| 10 | Phần đầu | 5 | 0 | 0 | 1 | — | Ring 3 |
| 11 | Candidate ghi về 0 | 7 | 1 | 1 | 1 | Ring 5 | — |
| 12 | Candidate ghi về 0 | 8 | 1 | 1 | 2 | Ring 1 | — |
| 13 | Phần đầu | 3 | 1 | 1 | 1 | — | — |
| 14 | Candidate ghi về 0 | 17 | 2 | 1 | 1 | Ring 11 | Ring 11 |
| 15 | Phần đầu | 12 | 6 | 3 | 4 | Ring 6, Ring 9, S1 | Ring 6 |
| 16 | Candidate ghi về 0 | 14 | 3 | 1 | 2 | Ring 9, S2 | Ring 9, S2, Ring 3 |
| 17 | Phần đầu | 11 | 4 | 3 | 1 | Ring 11 | Ring 11 |
| 18 | Chỉ ghi chú | — | — | — | — | — | — |
| 19 | Phần đầu | 9 | 2 | 1 | 1 | Ring 2 | Ring 2 |
| 20 | Candidate ghi về 0 | 14 | 6 | 5 | 1 | Ring 4, Ring 5, S3 | Ring 5, S3 |

Các candidate ghi về 0 chỉ là kết thúc được nguồn dự đoán, **không phải route replay đã xác minh**. Một bước record không nhất thiết tương ứng một drag người chơi: nhiều bước cùng actor/cùng chiều có thể là chia nhỏ một lần kéo. Vì vậy không dùng bảng để trả lời “số thao tác tối thiểu trước khi tháo một vật”. Muốn đo đúng định nghĩa đó cần gameplay/replay trung thực và tìm route thay thế, giữ phân biệt số đã tìm được với tối thiểu đã chứng minh.

### Điểm dữ liệu cần kiểm lại

- HTML liệt kê Ring 12 ở L14 và Ring 8 ở L15 là vòng kín nhưng candidate có thao tác quay chúng. **Vòng kín không đồng nghĩa không xoay được**, nên riêng chi tiết này không chứng minh record sai. Cần kiểm góc khe, pin và kết quả tháo, không tự xóa bước hoặc suy luật.
- L15, L16, L18, L19 có cảnh báo số quan hệ được liệt kê khác blocking pin. Không coi count cạnh là đồ thị khóa đầy đủ.
- L18 không có action walkthrough; mọi kết luận về chuỗi chuẩn bị tại đây đều chưa biết.
- Chưa xác minh hình website với từng actor S; không gán “S2 là L/U cụ thể” giữa hai nguồn bằng tên đơn thuần.

## 8. Ba hình thanh tạo ba bài học riêng

| Loại | Bài học | Điều cần kiểm để chứng minh hình dạng có vai trò |
|---|---|---|
| Thẳng | Xác định trục và đầu rút còn lối; có thể dịch tạm. | Vật cản/guide có thực sự đổi hướng rút hoặc thứ tự giải không? |
| L | Dự đoán đường quét của cả khuỷu/tay gập khi thân trượt. | Tay gập có buộc tạo clearance, hay thanh vẫn rút như thanh thẳng? |
| U | Hai nhánh thuộc một vật; xét cả hai nhánh, đáy và các vị trí giữ. | Có cần mở đường cho hai nhánh/đáy, hay hình U chỉ mang tính nhận diện? |

New về hình dạng không tự bằng New về luật điều khiển: cả ba có thể dùng thao tác trượt quen thuộc, nhưng yêu cầu đọc hình học khác nhau. Chỉ gọi “dạy đặc tính L/U” khi có bằng chứng tình huống khiến đặc tính đó quan trọng.

## 9. Giả thuyết retention và cách kiểm

| Mốc | Rủi ro có cơ sở cấu trúc/record | Trải nghiệm cần bảo đảm | Quan sát cần lấy |
|---|---|---|---|
| L4 | Nhiều bước chưa tháo trong candidate; chuyển từ phản hồi trực tiếp sang chuẩn bị. | Người chơi thấy thao tác đang mở đường, không cảm giác vô ích. | Thời gian tháo đầu; reset/thoát trước tháo; người chơi giải thích bước vừa làm. |
| L7 | Lần đầu trượt có bốn thanh. | Nhận ra trục và phân biệt hướng rút với thao tác xoay. | Lỗi kéo sai trục, lặp hướng bị chặn, cần hint. |
| L10 | L và bom cùng xuất hiện; nhiều ngàm/vòng kín. | Hiểu thao tác nào tạo nổ và điều gì vừa được giải phóng. | Có nhận diện bom, đoán hậu quả và tiếp tục sau nổ không. |
| L13 | U mới nhưng record chưa mô tả rút. | Hiểu U là một vật và nhận ra trục/đường thoát. | Kéo theo nhánh sai, nhầm hai vật, thử ngẫu nhiên. |
| L15/L20 | Chuỗi chưa tháo, đổi vật và quay lại. | Nhớ mục tiêu trạng thái trung gian; nhận biết tiến triển. | Hành vi hoàn tác vô mục đích, hint/reset, thời gian mắc và thoát. |
| L19 | Bom trở lại sau tám màn không bom. | Nhận lại cơ chế mà không cần học lại từ đầu. | Nhận diện, dự đoán, thao tác kích và khả năng giải thích kết quả. |

Đây là giả thuyết, không phải nguyên nhân D1 đã chứng minh. Thu completion, thời gian lần tháo đầu/toàn màn, thao tác không tiến triển, hint/reset và quit theo level. D1 cần cohort quay lại ngày tiếp theo; thoát ở một màn không tự chứng minh màn đó gây giảm D1. Không đặt ngưỡng hoặc hứa retention khi chưa có baseline.

## 10. Ghi chú visual và quy tắc authoring do người dùng xác nhận

Bổ sung ngày 20/10/2026. Đây là chỉ dẫn của người dùng cho việc phân tích và thiết kế biến thể; không phải kết quả suy ra từ candidate walkthrough.

### 10.1 L10 và L20: bố cục hình đặc biệt

**L10 và L20 là hai level có hình ảnh đặc biệt: bố cục các object mô tả một con vật hoặc đồ vật.** Cần đánh giá chúng thêm ở khả năng nhận ra hình tổng thể, thay vì chỉ coi là tập hợp ring/stick hoặc mốc thử thách cơ học. Chưa xác nhận tên con vật/đồ vật cụ thể, nên không tự gán tên.

Khi phân tích curve, bổ sung vai trò **mốc visual đặc biệt** cho cả hai màn. Hình tổng thể có thể tạo sự mới mẻ hoặc điểm nhớ, nhưng chưa có dữ liệu để kết luận tác động đến retention. Khi tạo biến thể, cần xét đồng thời hình tổng thể, quan hệ giữa các object và khả năng tháo; không đánh đổi tính hợp lệ của puzzle để giữ silhouette.

### 10.2 Tạo đường cong bằng ring hở

Một cách tạo đường cong mong muốn là **tăng bán kính ring và tăng góc hở**, để phần cung còn lại tạo hình cong phù hợp bố cục. Đây là kỹ thuật tạo hình từ ring, không phải một loại object hoặc cơ chế mới.

Dù trông như một nét cong, object vẫn là **ring hở** và phải tuân thủ đầy đủ nguyên tắc của ring hở: thao tác xoay quanh tâm, khe mở và quan hệ pin/khóa, kiểm đường chuyển động/va chạm, điều kiện tháo và quy tắc authoring hiện hành. Không coi cung cong là stick để trượt hoặc là chi tiết trang trí không có ràng buộc. Khi đổi bán kính/góc hở phải kiểm lại hình học và khả năng giải, vì đường quét, vùng tiếp xúc và vị trí có thể nhả liên kết cũng thay đổi.

### 10.3 Thanh thẳng, L và U: chiều dài và độ vuông góc rõ ràng

Theo yêu cầu người dùng, **phần chiều dài/cánh liên quan phải lớn hơn 1.5** để thanh đọc rõ hình dạng. Đây là ngưỡng do người dùng chỉ định, không phải số đo rút ra từ bộ gốc hoặc hằng số mới của engine. Giữ cách hiểu theo kích thước authoring đang dùng; chưa quy đổi sang pixel hoặc đơn vị vật lý khác.

- **Thanh thẳng:** đoạn thân dài hơn 1.5 để đọc rõ hướng/trục của thanh; bản thân thanh thẳng không có khuỷu vuông góc.
- **Thanh L:** thân và cánh tạo góc vuông rõ, các đoạn cần đọc hình dài hơn 1.5; tránh cánh quá ngắn khiến L trông như thanh thẳng có móc nhỏ.
- **Thanh U:** đáy và hai nhánh thể hiện các góc vuông rõ, các đoạn cần đọc hình dài hơn 1.5; tránh nhánh quá ngắn làm mất nhận diện U.

Ngưỡng này phục vụ nhận diện hình và cảm giác vuông góc; không thay thế kiểm khoảng trống tháo. Đồng thời giữ yêu cầu trước đó: độ dài/cánh phải cho người chơi có đường tháo dễ thao tác, không chỉ đúng silhouette. Không tự sửa core, ép ngưỡng vào engine hoặc sửa các level gốc trong lần cập nhật tài liệu này.

## 11. Kết luận cho việc học thiết kế

1. Giữ **bài học và phản hồi**, không chỉ đổi kích thước/bố cục hoặc giữ số object.
2. Theo dõi riêng ring, vòng kín, stop, thanh thẳng, L, U, bom và tư duy chuẩn bị; không gom tất cả thanh thành một tag stick.
3. L4 và L20 nhấn mạnh trễ phần thưởng; L10 nhấn mạnh nội dung mới; L14 nhấn mạnh khối lượng quan sát. Đây là các dạng khó khác nhau.
4. Không ép bộ gốc thành chu kỳ hoàn hảo. Thanh thẳng, U và bom đều có khoảng ngắt trước khi được dùng lại; cần kiểm xem khoảng ngắt hỗ trợ đổi nhịp hay làm mất cơ hội luyện.
5. Chưa đủ cơ sở xếp hạng khó tuyệt đối cho 20 màn hoặc nói số thao tác tối thiểu. Muốn chốt cần chơi/replay bản gốc trung thực, đặc biệt phần bom L10/L19, lần rút U L13 và toàn route L18.

## Phụ lục — mapping hình thanh và khả năng tái kiểm

| Level bộ 100 | Mã file hình học nguồn | Thẳng | L | U |
|---|---|---|---|---|
| 7 | `Level10011.rrdesign.json` | S1, S2, S3, S4 | — | — |
| 10 | `Level10109.rrdesign.json` | — | S1, S2, S3, S4, S5, S6, S7, S8 | — |
| 11 | `Level10010.rrdesign.json` | — | S1, S2 | — |
| 13 | `Level10012.rrdesign.json` | — | — | S1, S2 |
| 14 | `Level10014.rrdesign.json` | S1, S3, S5 | S2, S4 | — |
| 15 | `Level10013.rrdesign.json` | S1, S3, S5, S6 | S2, S7, S8 | S4 |
| 16 | `Level70002.rrdesign.json` | — | S1, S2 | — |
| 17 | `Level10015.rrdesign.json` | S1, S3 | S4 | S2 |
| 18 | `Level70009.rrdesign.json` | S4, S5 | S6 | S1, S2, S3 |
| 19 | `Level10017.rrdesign.json` | — | S1, S3, S4 | S2, S5 |
| 20 | `Level10082.rrdesign.json` | — | S1, S2, S3, S4 | — |

SHA-256 của danh sách `filename:sha256` theo thứ tự mapping trên (nối bằng newline, không newline cuối): `32a1a7eed25367cd4a74786133e753f08fbd6a933f40c19f8c4731a05b44e4e8`. Counts không có thanh ở L1–6, L8–9 và L12 lấy trực tiếp HTML.

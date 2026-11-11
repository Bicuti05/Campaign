# Tự đặt lịch tiếp tục — batch10, logical slots101–200

Quyết định20/10/2026: mỗi lượt sinh10 level, sau khi xuất xong tự schedule lượt gen tiếp theo; không cần GD bật lại từng đợt. Đây là quyền cho AI thực thi prompt trên máy GD. Việc đóng gói/sửa prompt không tạo lịch tại máy người soạn.

## Cách thực hiện khi AI đang làm việc

1. Đọc checkpoint và feedback mới trước mỗi lượt. Lần đầu101–110, sau đó111–120…191–200. Giữ pendingReview riêng; chưa review không chặn tự gen batch mới và cũng không đồng nghĩa approved. Feedback GD đến giữa chừng phải được áp dụng trước phần phụ thuộc. Không tìm lời giải.
2. Sau khi xuất batch, ghi đủ stem/hash/ảnh/checks/giới hạn, pendingReview, currentBatch/nextSlot. Chỉ các bản đạt gate được gọi là bản giao; giữ phần chưa xong và hold trong checkpoint, không giảm kiểm để đủ10.
3. Nếu còn việc độc lập được phép làm trong101–200 và GD chưa yêu cầu dừng/tạm dừng, dùng **công cụ scheduler thật của nền tảng AI** để tạo hoặc cập nhật một lịch tiếp tục gắn với cuộc trò chuyện/workspace này. Với Codex, ưu tiên heartbeat của thread hiện tại; không tự tạo task/thread mới hay dùng cron standalone làm đường vòng. Với nền tảng khác dùng khả năng lịch tương đương theo quy tắc của nền tảng đó.
4. Mặc định yêu cầu lượt tiếp theo sau khoảng15phút, không coi là ETA hoàn thành batch; dùng cùng lịch định kỳ15phút nếu nền tảng hỗ trợ heartbeat, tái sử dụng ID và chỉ cập nhật một lịch. Không tạo job trùng sau mỗi lượt. Không chạy chồng: nếu lượt trước còn chạy, giữ lượt đó; scheduler và thread phải tuần tự, không spawn các phiên cùng ghi checkpoint. Không dùng lệnh sleep dài/while vô hạn để giả lịch.
5. Nội dung lịch là toàn bộ prompt trong prompts/SCHEDULED_RUN.md, thêm đường dẫn workspace thực tế và nhắc phải đọc checkpoint mới trước mọi lượt. Khi GD đổi lịch, lưu cả trạng thái do scheduler trả về và quyết định của GD, không đoán nextRun. Không đưa mật khẩu/token vào prompt.
6. Chỉ ghi status=active và automationId/nextRunAt sau khi công cụ xác nhận tạo/cập nhật thành công. state/scheduler.json chỉ là bản ghi, bản thân file không chạy lịch. Nếu công cụ bị thiếu/không có quyền hoặc máy/app không đáp ứng điều kiện chạy nền: ghi unavailable/blocked, nêu lý do thật và hỏi GD thao tác cần thiết; không nói đã schedule. Không tự cài daemon/Task Scheduler hay dịch vụ hệ điều hành để lách giới hạn.
7. Chỉ thông báo khi có batch/revision mới, phát hiện đáng kể, lỗi/quota chặn hoặc cần GD hành động. Các lượt không có thay đổi không tạo báo cáo lặp. Không gửi tin cho người khác hoặc upload file.
8. Khi đã đủ101–200 được xuất hoặc chỉ còn phần thực sự phải chờ GD, ghi hoàn tất/chờ GD, dừng hoặc vô hiệu hóa đúng lịch đã tạo và xác nhận trạng thái trả về. Nếu GD yêu cầu dừng/tạm dừng thì làm ngay; không tự resume do thời gian trôi qua. Không gen quá200, không tự chuyển sang201.

## Lưu trạng thái

state/progress.json giữ batchSize10 và policy.autoContinue=true. state/scheduler.json giữ cadence15phút, automationId, nền tảng, status, nextRunAt (nếu công cụ cung cấp), lastResult, lý do chặn/tạm dừng. Không chứa giả định scheduler đã hoạt động khi mới giải nén bộ này.

Yêu cầu này thay quy tắc ban đầu “mỗi cặp2level rồi dừng chờ lệnh”. Giới hạn không solve/không auto-approve/không sửa engine/không ghi đè revision vẫn giữ.

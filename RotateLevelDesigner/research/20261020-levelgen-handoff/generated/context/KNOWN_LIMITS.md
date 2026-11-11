# Giới hạn và mẫu cần tránh hiểu nhầm

## Không có chứng nhận lời giải cho101–200

Luồng mới không tìm lời giải, replay hay ablation. Gate hình học OK chỉ cho biết trạng thái đầu và cấu trúc thỏa các phép kiểm được mô tả. Chưa biết level giải được, không có bypass, có bắt buộc chuẩn bị hay đủ khó/đẹp. Ghi GD tự giải trong notes/brief và hỏi cụ thể về đường rút, nhịp chuẩn bị/quay lại, cảm giác màu/spacing.

`check-level` là helper authoring mới của bộ portable, dùng core không sửa. Strict OVL là phép kiểm bảo thủ body-only cũ: coi vòng là vành tròn đầy trong phép ring-ring, lấy mẫu đường thanh, bỏ qua pin/Stop/Guide/Bom. Có thể cần GD/Dev xem một ca near-gap hoặc hình đặc biệt. Không sửa tolerance/engine để qua. Palette checker khác tên màu không đảm bảo tương phản đủ; xem ảnh màu và mono. Gate U-near-bend là cảnh báo kiểm duyệt nghiên cứu, không là luật geometry chung của gameplay.

## Audit lịch sử A071–A099

Snapshot `research/20261018-solution-a071-a099/completion.json` ghi:

- Verified trong phép kiểm đã làm:71,72,73,74,75,76,77,82,83,86,89,91,95,97,98.
- HardDeadlock được audit ghi:88,93,99.
- Unresolved:78,79,81,84,85,87,92,94,96.

Đây là trạng thái audit của đúng revision/hash ở input-manifest, không tự áp cho pack campaign hiện tại nếu đã đổi. Chưa đọc đối chiếu thì coi là cảnh báo mẫu, không suy toàn bộ folder verified. Không sinh lại/sửa các slot này khi nhiệm vụ đang là101–200. A070/080/090 từng bị yêu cầu bỏ qua; A100 của luồng external cũ không được tự coi đã sinh chỉ vì campaign có slot100.

## Mapping và nguồn không đầy đủ

Board A ordinal, sourceID384 và campaign slot là ba namespace khác nhau. Mapping60/92/99 có confidence thấp hơn exact. Source10024/10036 dựng lại có bent bar thiếu slideAxis và validate fail; chỉ sửa ở bản authoring mới nếu dùng, giữ nguồn nguyên. Các nguồn80/84/90/100 có inner pin; cần giữ đúng dạng. `level_data.json` extract cũ không đủ quaternion/special để bake trung thực một mình.

Các thư mục TrainingLevel/LevelTrainingData và selection_active.json lịch sử có thể không còn trên máy đóng gói; AVAILABILITY ghi thực tế. Đã kèm nguồn thay thế có trên đĩa (ring-lab/BoardA/source designs/ảnh), không bịa dữ liệu/video không tìm thấy.

## Snapshot campaign và proof cũ

Slot8/10/12/14/16/18/19/20 đã được chủ project yêu cầu áp dụng từ pack mới nhất sau khi GD đổi tên/chỉnh; SHA khác lần proposal đầu. Slot19/20 được xuất nhanh theo lệnh không test thêm. Các file pack có thể còn notes/proof thời điểm trước đó. Không gọi proof này là proof cho runtime đã sửa. Catalog ghi hash snapshot thật và tình trạng runtime-pack khớp hay không.

9 cặp trong approved là bộ tham khảo riêng, không đồng nghĩa100pack ingame đều approved. Các revision holdout/bản lỗi vẫn được giữ để học; tuyệt đối không chọn chỉ vì số revision cao hoặc tên có chữ final/verified.

## Tool và môi trường

Designer mô phỏng JS analytic, Unity dùng Physics2D cho một phần khóa/hit-test. Các ca mép khe, feel, safe area, mesh3D, input ngón tay, hiệu ứng và device cần Dev kiểm khi tích hợp. Không có Unity/project/SDK trong bộ và không cần chúng để author.

Script research cũ có thể require tuyệt đối, tạo thư mục khi import, hoặc tự chạy Solver. Chỉ đọc mặc định. Root scripts là đường portable. Giữ các công cụ pose-body-gesture-query/replay-until-release để hiểu counterexample lịch sử, không chạy chúng trong luồng không tìm lời giải.

Đây là snapshot nội dung hiện có và bản tổng hợp context được cung cấp, không chứa toàn bộ Git/chat history hay mọi tài liệu từng tồn tại. Nếu GD thiếu một quyết định thật sự ảnh hưởng cơ chế, hỏi người phụ trách; không dùng im lặng hay tài liệu lưu trữ làm quyền tự quyết.

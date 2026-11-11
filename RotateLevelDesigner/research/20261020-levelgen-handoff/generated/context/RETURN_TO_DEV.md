# Bàn giao kết quả mới về Dev

GD dùng Designer local, không cần Unity. Mỗi revision giao:

- `A101_YYYYMMDD_r01.rrdesign.json` và `.rrpack.json` tương ứng; pack proof:null.
- `brief.json`, `checks-design.json`, `checks-pack.json`, `delivery.json` (hash, nguồn, limits).
- Ảnh màu, mono, so nguồn cùng camera/tỷ lệ. Ghi nếu mới SVG hoặc chưa visual review.
- Feedback và trạng thái GD: chờ xem/đã xem/chưa giải/đã tự giải/được chọn, không gộp thành verified tự động.
- Checkpoint `state/progress.json`, nhật ký và danh sách revision thay thế/hold.

Dev dùng pack.runtime để giữ đúng geometry; design dùng cho authoring và đối chiếu. Với pack được GD sửa, proof/notes cũ không chứng nhận geometry hiện tại. Dev xác nhận source hash, ID mới, mapping slot101–200, nhập trong Unity, kiểm physics/feel/device và cập nhật campaign/save theo thỏa thuận riêng. Luồng đóng gói này không tự cấp quyền ghi vào game thật.

Importer Unity hiện tại có thể tự tìm lời giải khi pack không có proof. GD gửi file cho Dev kèm thông báo `no-solution-search / GD self-playtest`; Dev chọn luồng nhập phù hợp và xác nhận chính sách kiểm trước khi chạy. Không yêu cầu máy GD cài importer/Unity hoặc tự sửa core để né importer.

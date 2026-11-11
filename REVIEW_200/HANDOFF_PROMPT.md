# Prompt bàn giao cho AI tiếp theo

Bạn tiếp tục task Campaign trong repository Bicuti05/Campaign, branch work. Đọc REVIEW_200/CURRENT_STATE.json trước. Người dùng yêu cầu tiết kiệm token, hành động đến khi hoàn thành; không hỏi lại các quyết định đã chốt dưới đây.

## Trạng thái chính xác

Đã dừng mọi worker theo yêu cầu bàn giao. 189/200 vị trí có pack đã qualify. Còn **30, 63, 73, 90, 125, 133, 160, 170, 183, 186, 193**. Chưa hoàn tất và chưa có ZIP 200 đạt kiểm định. Không nói đã hoàn thành200.

- REVIEW_200/PLAN_200.json: mapping200 có source_kind, input_pack, input_design, target_rings, required_rings, chain_requested. Các đường dẫn tuyệt đối bắt đầu /workspace/Campaign; nếu checkout chỗ khác, sửa script/đường dẫn khi chạy.
- REVIEW_200/packs: chỉ189 pack đã kiểm. validation/NNN.json là hồ sơ đạt, *.solve.json và *.validate.log là bằng chứng CLI. Bản chưa đạt ở drafts; lỗi trung gian *.failure.json có thể cũ, hồ sơ đạt mới có thẩm quyền.
- index.html: review trực tiếp với PNG nhúng data URI, không cần tải ảnh rời hoặc chạy JS để xem. STATUS.json/CURRENT_STATE.json ghi tiến độ. Trước đây user không xem được ảnh SVG/path tương đối. Không lặp lỗi đó.
- scripts/process.js và run_batch.py: qualify từng màn/theo lô4 CPU. Chưa sửa tool core/constants. Các source pack R7 nằm IMPORTS/R7_20261111/TURP_UNITY_R7/NEW_CAMPAIGN_500_SELECTED_LEVELS; nguồn upload giữ nguyên.
- REVIEW_FIRST_10 có review20 cũ và toàn bộ bằng chứng đầu kỳ. Trang phục vụ cục bộ: python REVIEW_FIRST_10/serve_review.py, port8765; symlink review200 dẫn tới REVIEW_200. Lệnh python REVIEW_200/scripts/review.py tái tạo HTML + PNG (cần cairosvg; cài --target /tmp/campaign_py nếu cần). Native Unity chưa chạy.

## Mục tiêu cuối

Đủ 200 level được sắp xếp, 200 pack hợp lệ/giải được, review ảnh trực tiếp, mapping CSV/JSON, manifest hash và ZIP. Giữ những màn đã đạt, chỉ làm phần thiếu và xử lý lỗi tổng kiểm. Không nhập/ghi đè Assets game. Không giả vờ đạt nếu solver chưa FOUND. Không coi drag count/search nodes/mật độ là độ khó người chơi.

Đọc RotateLevelDesigner/AGENTS.md, README, schema và luật chain. Bản sinh/sửa phải rrdesign rồi official builder/CLI; không tự viết collider/runtime geometry. Mỗi màn giao: CLI validate OK, CLI solve FOUND, replay hoàn tất, không Booster. Thử bỏ vật lý pin/stick/guide/StopPin/bomb; chi tiết không đổi gameplay phải bỏ. Chân pin/StopPin phải nối phần cung có vật liệu, không nằm khe. Ghi rõ route dùng bom; JS proof không phải Unity native proof.

## Các quyết định GD đã chốt

1. Dùng curve500 được tham chiếu trong NEW_CAMPAIGN_500_MAPPING_v2.json, nguồn TARGET_CURVE_500_FROZEN.json không có trong checkout. GD xác nhận #3/#9/#10 R=4/12/6. Với target phân số: làm tròn gần nhất, .5 lên, lưu target thô. Human V/L/E trong nguồn là Unknown/proxy, đừng tự tuyên bố đã đo độ khó thật.
2. xx3 và xx0 phải Special có hình cụ thể. xx6 tạo cảm giác đối xứng. Có140 Normal,40 Special,20 Symmetrical.
3. Special nguồn cao hơn số vòng curve: GIỮ số vòng nguồn, không cắt. Nguồn thấp hơn: bổ sung vòng có liên kết gameplay thật. Không thêm vòng trang trí tự rơi.
4. Bố cục1–20 đã chốt. #10 là P050 con gà chỉnh cỡ, GIỮ3R dù target6. #13 P040 nhà, GIỮ6R dù target7. #20 vợt tennis SCH2 bản U rộng và ngắn: U x−2.3..7.8, miệng y.7, đáy−6.3; bóng tím/xanh tại y−3.1, đáy xanh y−7.2. #14 R14 đúngcurve. #19 P016 R10. #6/#16 đã kiểm đối xứng; #16 giữ3 cá đối xứng đã duyệt. Cá ở một số1–20 đã cập nhật metadata theo luật mới, hình học giữ nguyên; xem validation/FIRST20_FISH_UPDATE.json.
5. Nguồn R7 là ordinal trong ZIP NEW_CAMPAIGN_500_R7_UNITY_20261111, KHÔNG phải legacy_id. Mappings36 Special chi tiết ở REVIEW_FIRST_10/batch21_40/SPECIAL_REMAP_REQUESTS.json: 10→23,13→30,23→33,26→40,40→43,43→50,50→53,53→60,60→63,63→70,73→73,70→80,80→83,83→90,90→93,110→100,103→103,113→110,120→113,130→120,133→123,140→130,143→133,150→140,153→143,163→150,173→153,170→160,183→163,190→170,193→173,213→180,200→183,180→190,243→193,263→200. #130 tách2hoa; #173 cân bố cục/khoảng cách; #183 gọn và cân; #200 cân đối.
6. 18 nguồn Sym đã GD duyệt:56,66,76,86,106,126,136,146,176,186,206,236,246,256,266,286,296,306. Phân vào26..196 đuôi6, thứ tự linh hoạt; giữ6/16. Source206 chỉnh khoảng cách ring/stick (đã author tăng4%, pin refit, pack196 ĐẠT). Giữ số vòng nguồn, không ép thay vòng nguồn approved. Sau khi đủ200, scripts/final_slots.py tối ưu bình phương sai lệch R (chưa chạy) để giảm lệch lớn; chuyển hồ sơ/pack cùng nguồn, không đổi physics. Tuyệt đối không chạy lại setup_plan.py làm mất lựa chọn đã sửa.
7. Normal được chọn R đúng reference; một số có bom xen kẽ. #41/#51/#72 targetR0 trong mapping, hiện dùng màn thanh0R; cá0 được phép vì không có ring. Không tự lấp vòng cho sai curve. #28 đã đổi sang P025 đã kiểm để tránh source khó solver.

## Cá và xích — yêu cầu cuối cùng, không hỏi lại

Đọc USER_MECHANIC_RULES.json. Cá từ#11 ưu tiên3/màn, thiếu vị trí hợp lệ dùng0–2. collect:true tại tâm ring. Thứ tự kín sạch→hở sạch→chỉ hành lang trượt stick→nguy cơ pin/bom quét khi hết lựa chọn tốt hơn. Không ring/stick/pin/StopPin/ngàm/bom đè tâm lúc bắt đầu. Tránh cá thẳng hàng ngang/dọc là ưu tiên phụ; không trùng tâm cá. Một số Special hợp lệ chỉ0–2 cá, không ép sai.

Xích CHỈ ở **101,102,108,118,131,145,158,198**. Mỗi màn2 ring, xa nhau và phân bố trên board; tránh ring có cá, tránh ring bao ring nhỏ. Còn xích khóa cả xoay và rời bàn; mỗi Ring/Stick khác rời bàn giảm1. Chọn nấc dựa đường mở/target difficulty, không theo đuôiID hoặc lịch mỗi10 màn. Đã qualify cả8 sau kiểm mạnh hơn: ring được chọn vốn xoay được, xích tạo gate thực sự; solver + replay đếm giảm đạt. Không thay chúng vô cớ.

Tool Design.toLevel hiện bỏ lockCount trong authoring, nhưng Document.setLockCount là API chính thức để thêm runtime chain. Pack runtime là dữ liệu có thẩm quyền; designs/LevelNNN.chains.json là sidecar. Không sửa core/schema để lách. Legacy pack design có thể không round-trip đúng geometry bake, nên giữ runtime approved.

## Việc sửa gần nhất và hướng tiếp

- Nguồn R7 có thể design khác runtime scale. Special được dựng lại chuẩn độ dày.5 bằng official builder; không giữ vòng/stick dày lệch. Không execute scripts trong upload, chỉ đọc dữ liệu.
- special_remaps/author.js có generic thêm closed button rings trên thanh, badge trong vòng, hoặc open leaf ngoài; file author metadata theo đích cho biết added.kind. Tổng36 bản design tool/levels/SpecialMove_R7SSS_toDDD_r01.rrdesign.json. Không chạy author cả36 ghi đè các bản đã đạt.
- Source30 snowman: đã chuẩn hóa khoảng cách các vòng đồng tâm tối thiểu1.1 để bỏ overlap.18 do inner-pin headwalls. Đã thay3 vòng bổ sung thành button thay badge. Sau retry180s vẫn chưa FOUND; gần nhất widen source open arcs160 đang ở input_design, chưa qualify.
- #63 (owl3→24) có14 leaf bổ sung, #160 (tree6→15)9 leaf. Leaf ban đầu radius.8–1, gap150/180 khó thoát pinhead chuẩn; đã đổi gap240 trong input_design, chưa chạy đủ lượt sau sửa. Giữ liên kết ban đầu thực, đừng làm vòng tự rơi.
- scripts/relax_specials.py vừa widen các open arc nguồn lên160 và chọn gapDir giữ chân pin hợp lệ cho các màn còn thiếu:30,73,90,133,153,160,170,183,193. #153 đã đạt từ worker đọc trước/sau sửa; pack đã qualified có thẩm quyền. Các input draft có thể khác pack đã đạt vì có sửa file trong khi worker đang chạy. Cuối cùng đồng bộ từ pack đã kiểm; không ghi đè pack đạt bằng draft chưa kiểm.
- #73 speaker có32 sticks,16 cái *_parallel; #90 HI-heart23sticks; #133 windmill25sticks; #170 guitar22sticks; #193 robot20sticks. Có thể cần tinh gọn/điều chỉnh cơ chế nhưng giữ hình và R policy. Source style nhiều thanh khiến tìm kiếm chậm. Không đơn giản tăng token/solver mãi nếu geometry thực sự kẹt.
- process.js thử source proof replay trong core repo trước; luôn yêu cầu fresh CLI solve. ORDER_HINTS=1 reorder parts theo route để giúp search, không đổi hình học. Bước cuối hiện reorder thêm theo chính proof đã tìm trước CLI (sửa mới, chưa mọi màn thiếu chạy phiên bản này). Khi prune chi tiết dư chỉ xóa1 mỗi lượt để không xóa cả2 guide vốn thay thế nhau; replays proof cũ nếu còn hợp lệ. Role checks dừng sớm ở chi tiết dư rồi kiểm đầy đủ ở bản cuối; alt-search .25s. Solver MAX_DEPTH40, không sửa constant. Closed button thêm không bắt buộc thêm drag nếu tự rơi khi thanh đi; leaf làm tăng hành động, cần chú ý giới hạn.
- Những thiếu125,186 là source/CLI tìm kiếm, không đổi mapping Special. #186 Sym sẽ chuyển source theo final_slots sau khi qualify. Nâng time có thể giúp nhưng không chứng minh bất khả thi khi timeout.

## Lệnh tiếp tục

```
cd /workspace/Campaign
ORDER_HINTS=1 SOLVE_TIME=360 python REVIEW_200/scripts/run_batch.py 30 63 73 90 125 133 160 170 183 186 193
python REVIEW_200/scripts/review.py
```

Sau mỗi sửa kiểm riêng vị trí. process.js cache validation/NNN.json nên FORCE=1 chỉ khi thực sự cần kiểm lại bản đã đạt; giữ history. Nếu chạy mới có lỗi, đọc validation/NNN.failure.json và worker.log. Python có scipy,numpy,PIL,Playwright; cairosvg cài bằng `python -m pip install --target /tmp/campaign_py cairosvg`; Chromium /usr/bin/chromium. Workspace mới cần cài lại dependencies này nếu thiếu.

Khi ĐỦ200 hồ sơ đạt:
```
python REVIEW_200/scripts/final_slots.py
node REVIEW_200/scripts/audit.js
python REVIEW_200/scripts/review.py
python REVIEW_200/scripts/browser_check.py
python REVIEW_200/scripts/package.py
```
Kiểm kỹ scripts/finish.py trước dùng: script này chỉ retry rồi finalize, không tự giải mọi lỗi geometry. final_slots chỉ chạy1 lần nhờ marker. audit yêu cầu đúng8 chain, fish hợp lệ, replay mọi pack, hash, R policy, role checks và không duplicate; chưa kiểm Unity native. Bổ sung kiểm tất cả CurveAdd ban đầu có liên kết/không tự rơi (189 bản đã audit không có free addition). Kiểm stop feet nếu có. Sau final Slots cần cập nhật nguồn/raw design tương ứng pack nếu cần. Sửa README bỏ header bàn giao189 và cập nhật CURRENT_STATE trước đóng gói cuối; package.py hiện append kết quả nhưng chưa tự bỏ header tạm.

Cuối cùng giao link index.html (ảnh PNG nhúng), ZIP200, mapping và phạm vi kiểm định, push commit mới. Không nhận hoàn tất nếu còn vị trí thiếu hoặc audit lỗi. User thích cập nhật ngắn, ít token.

import { CheatEntry } from '../types/learning';

export const CSS_CHEAT_ENTRIES: CheatEntry[] = [
  // ================= 1. CÚ PHÁP & SELECTOR =================
  {
    id: 'css-element-selector',
    term: 'thẻ (Bộ chọn phần tử)',
    category: 'Cú pháp & selector',
    meaning: 'Chọn tất cả phần tử theo tên thẻ HTML (như p, h1, a, button)',
    syntax: 'tên-thẻ { thuộc-tính: giá-trị; }',
    example: {
      kind: 'render',
      code: `<style>
  h3 { color: #4f46e5; font-family: sans-serif; margin-bottom: 6px; }
  p { color: #475569; font-size: 14px; font-family: sans-serif; }
</style>
<h3>Tiêu đề áp dụng từ thẻ h3</h3>
<p>Đoạn văn được áp dụng kiểu chung từ bộ chọn thẻ p.</p>`,
      steps: [
        { lines: [2], title: 'Bộ chọn thẻ h3', text: 'Tìm tất cả thẻ <h3> trên trang và đổi màu sang tím.' },
        { lines: [3], title: 'Bộ chọn thẻ p', text: 'Tìm tất cả thẻ <p> trên trang và đặt cỡ chữ 14px.' },
      ],
    },
    tip: 'Nên dùng bộ chọn thẻ cho việc thiết lập kiểu nền tảng (CSS Reset/Base).',
    consequence: 'Dùng bộ chọn thẻ bừa bãi sẽ làm thay đổi toàn bộ các thẻ cùng tên trên toàn trang web.',
    analogy: 'Như thông báo "Tất cả học sinh mặc áo trắng": ai là học sinh đều phải tuân theo.',
  },
  {
    id: 'css-class-selector',
    term: '.class (Bộ chọn Class)',
    category: 'Cú pháp & selector',
    meaning: 'Chọn tất cả phần tử có chứa thuộc tính class tương ứng',
    syntax: '.tên-class { thuộc-tính: giá-trị; }',
    example: {
      kind: 'render',
      code: `<style>
  .the-noi-bat {
    background: #eef2ff;
    border: 2px solid #6366f1;
    color: #4338ca;
    padding: 12px;
    border-radius: 8px;
    font-weight: bold;
    font-family: sans-serif;
  }
</style>
<div class="the-noi-bat">
  Khối này có class .the-noi-bat
</div>`,
      steps: [
        { lines: [2], title: 'Dấu chấm (.)', text: 'Báo hiệu đây là bộ chọn class trong CSS.' },
        { lines: [12], title: 'Thuộc tính class', text: 'Trong HTML viết class="the-noi-bat", không viết dấu chấm ở HTML.' },
      ],
    },
    tip: 'Có thể gán nhiều class cho một phần tử HTML cách nhau bằng dấu cách: class="btn btn-primary large".',
    consequence: 'Nếu trong file CSS quên gõ dấu chấm trước tên class, trình duyệt sẽ coi đó là tên thẻ HTML và không hoạt động.',
    analogy: 'Như nhóm học sinh đeo huy hiệu cùng màu: tất cả học sinh mang huy hiệu đó đều nhận chung đặc quyền.',
  },
  {
    id: 'css-id-selector',
    term: '#id (Bộ chọn ID)',
    category: 'Cú pháp & selector',
    meaning: 'Chọn duy nhất một phần tử cụ thể có id tương ứng',
    syntax: '#tên-id { thuộc-tính: giá-trị; }',
    example: {
      kind: 'render',
      code: `<style>
  #banner-chinh {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    font-family: sans-serif;
    font-weight: bold;
  }
</style>
<div id="banner-chinh">
  Banner độc quyền duy nhất trên trang web
</div>`,
      steps: [
        { lines: [2], title: 'Dấu thăng (#)', text: 'Báo hiệu bộ chọn ID với độ ưu tiên rất cao trong CSS.' },
        { lines: [12], title: 'id duy nhất', text: 'Mỗi giá trị id chỉ nên xuất hiện 1 lần duy nhất trên một trang HTML.' },
      ],
    },
    tip: 'Hạn chế lạm dụng ID để viết CSS vì độ ưu tiên quá cao sẽ khiến việc ghi đè sau này rất khó khăn. Hãy ưu tiên Class.',
    consequence: 'Nếu đặt 2 phần tử có cùng 1 id, mã HTML sẽ bị vi phạm chuẩn W3C và JavaScript getElementById sẽ chỉ bắt được phần tử đầu tiên.',
    analogy: 'Như số Căn cước công dân: mỗi công dân có một số duy nhất, không trùng lặp.',
  },
  {
    id: 'css-universal-selector',
    term: '* (Bộ chọn toàn cục Universal)',
    category: 'Cú pháp & selector',
    meaning: 'Chọn tất cả mọi phần tử trên trang web, thường dùng để reset box-sizing',
    syntax: '* { thuộc-tính: giá-trị; }',
    example: {
      kind: 'render',
      code: `<style>
  * {
    box-sizing: border-box;
  }
  .khung-mau {
    width: 220px;
    padding: 16px;
    border: 4px solid #10b981;
    background: #ecfdf5;
    font-family: sans-serif;
  }
</style>
<div class="khung-mau">Mọi phần tử đều tuân theo luật reset từ dấu sao *</div>`,
      steps: [
        { lines: [2, 3, 4], title: 'Bộ chọn dấu sao (*)', text: 'Áp dụng quy tắc box-sizing: border-box cho 100% phần tử trong cây DOM.' },
      ],
    },
    tip: 'Luôn kết hợp: *, *::before, *::after { box-sizing: border-box; } ở dòng đầu CSS.',
    consequence: 'Viết các thuộc tính nặng như animation hoặc transition trong * sẽ làm giảm hiệu năng kết xuất của trình duyệt.',
    analogy: 'Như luật quốc gia áp dụng cho tất cả mọi người dân sinh sống trên lãnh thổ.',
  },
  {
    id: 'css-group-selector',
    term: 'a, b (Nhóm bộ chọn)',
    category: 'Cú pháp & selector',
    meaning: 'Gộp nhiều bộ chọn có chung định dạng cách nhau bằng dấu phẩy',
    syntax: 'selector1, selector2 { thuộc-tính: giá-trị; }',
    example: {
      kind: 'render',
      code: `<style>
  h2, h3, h4 {
    font-family: sans-serif;
    color: #4338ca;
    margin: 4px 0;
  }
</style>
<h2>Tiêu đề cấp 2</h2>
<h3>Tiêu đề cấp 3</h3>
<h4>Tiêu đề cấp 4</h4>`,
      steps: [
        { lines: [2], title: 'Dấu phẩy (,)', text: 'Áp dụng chung màu tím và phông chữ sans-serif cho cả 3 cấp tiêu đề.' },
      ],
    },
    tip: 'Giúp mã nguồn ngắn gọn, tuân thủ nguyên tắc DRY (Don\'t Repeat Yourself).',
    consequence: 'Nếu quên dấu phẩy (viết h2 h3), trình duyệt sẽ hiểu là bộ chọn con cháu h3 nằm trong h2!',
    analogy: 'Như mời cùng lúc nhóm A, nhóm B và nhóm C vào chung một phòng họp.',
  },
  {
    id: 'css-descendant-selector',
    term: 'a b (Bộ chọn con cháu)',
    category: 'Cú pháp & selector',
    meaning: 'Chọn phần tử b nằm bên trong phần tử cha a (ngăn cách bằng dấu cách)',
    syntax: 'cha con { thuộc-tính: giá-trị; }',
    example: {
      kind: 'render',
      code: `<style>
  .menu-chinh a {
    color: #ef4444;
    font-weight: bold;
    text-decoration: none;
    font-family: sans-serif;
  }
</style>
<div class="menu-chinh">
  <a href="#">Link trong menu (màu đỏ)</a>
</div>
<a href="#">Link bên ngoài menu (màu mặc định)</a>`,
      steps: [
        { lines: [2], title: 'Dấu cách ngăn cách', text: 'Chỉ chọn thẻ <a> nếu nó nằm sâu bên trong phần tử có class .menu-chinh.' },
      ],
    },
    tip: 'Dùng khi bạn muốn định kiểu riêng biệt cho phần tử chỉ trong một khu vực cụ thể mà không làm ảnh hưởng chỗ khác.',
    consequence: 'Lồng quá nhiều cấp (ví dụ .a .b .c .d .e) sẽ làm chậm tốc độ so khớp CSS của trình duyệt.',
    analogy: 'Như tìm những cuốn sách nằm trong ngăn tủ trên cùng của phòng đọc.',
  },
  {
    id: 'css-hover-pseudo',
    term: ':hover (Rê chuột)',
    category: 'Cú pháp & selector',
    meaning: 'Lớp giả kích hoạt giao diện khi con trỏ chuột người dùng rê lên phần tử',
    syntax: 'selector:hover { thuộc-tính: giá-trị; }',
    example: {
      kind: 'render',
      code: `<style>
  .nut-hover {
    background: #4f46e5;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-family: sans-serif;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }
  .nut-hover:hover {
    background: #312e81;
    transform: translateY(-2px);
  }
</style>
<button class="nut-hover">Rê chuột vào xem đổi màu</button>`,
      steps: [
        { lines: [14], title: ':hover', text: 'Khi chuột rê lên, nút tự đổi màu sang tím đậm và nhấc lên 2px.' },
      ],
    },
    tip: 'Luôn kết hợp :hover với transition: all 0.2s; để hiệu ứng chuyển động mượt mà không bị giật.',
    consequence: 'Trên điện thoại cảm ứng, :hover có thể bị kẹt lại sau khi người dùng chạm ngón tay vào màn hình.',
    analogy: 'Như chiếc đèn cảm ứng tự sáng lên khi có người bước đến gần.',
  },
  {
    id: 'css-focus-pseudo',
    term: ':focus / :active (Tập trung & Nhấp)',
    category: 'Cú pháp & selector',
    meaning: 'Kích hoạt khi ô nhập liệu được nhấp chọn (:focus) hoặc nút đang được bấm giữ (:active)',
    syntax: 'input:focus { outline: 2px solid blue; }',
    example: {
      kind: 'render',
      code: `<style>
  .o-nhap {
    padding: 8px 12px;
    border: 2px solid #cbd5e1;
    border-radius: 6px;
    font-family: sans-serif;
    outline: none;
    transition: border-color 0.2s;
  }
  .o-nhap:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
</style>
<input class="o-nhap" placeholder="Bấm chuột vào đây xem viền phát sáng..." />`,
      steps: [
        { lines: [10], title: ':focus', text: 'Tạo vòng phát sáng màu tím khi người dùng bấm vào ô nhập liệu.' },
      ],
    },
    tip: 'Tuyệt đối không xóa outline (outline: none) mà không có kiểu thay thế, vì sẽ làm hỏng trải nghiệm người khiếm thị dùng phím Tab.',
    consequence: 'Không có :focus rõ ràng khiến người dùng không biết con trỏ bàn phím đang nằm ở ô nào.',
    analogy: 'Như đèn pha rọi vào diễn viên chính trên sân khấu khi đến lượt họ cất lời.',
  },

  // ================= 2. MÀU & NỀN =================
  {
    id: 'css-color',
    term: 'color (Màu chữ)',
    category: 'Màu & nền',
    meaning: 'Định dạng màu sắc của văn bản bên trong phần tử',
    syntax: 'color: #hex | rgb() | tên-màu;',
    example: {
      kind: 'render',
      code: `<div style="font-family: sans-serif;">
  <p style="color: #4f46e5; font-weight: bold;">Màu xanh tím (#4f46e5)</p>
  <p style="color: #059669; font-weight: bold;">Màu xanh lục ngọc (#059669)</p>
  <p style="color: #dc2626; font-weight: bold;">Màu đỏ tươi (#dc2626)</p>
</div>`,
      steps: [
        { lines: [2, 3, 4], title: 'color', text: 'Thiết lập các màu chữ tương phản khác nhau bằng mã màu Hex.' },
      ],
    },
    tip: 'Nên dùng mã màu Hex 6 ký tự (#4f46e5) hoặc biến CSS var(--text-color) để đồng bộ.',
    consequence: 'Màu chữ xám nhạt trên nền trắng sẽ làm giảm khả năng đọc của người mắt kém.',
    analogy: 'Như việc bạn chọn bút mực xanh hay bút mực đen để viết vào vở.',
  },
  {
    id: 'css-background-color',
    term: 'background-color (Màu nền)',
    category: 'Màu & nền',
    meaning: 'Tô màu nền nguyên khối cho phần tử',
    syntax: 'background-color: #hex | rgba() | transparent;',
    example: {
      kind: 'render',
      code: `<div style="background-color: #fef3c7; color: #92400e; padding: 14px; border-radius: 8px; font-family: sans-serif; font-weight: bold;">
  ✓ Thẻ thông báo với màu nền vàng mật ong nhạt dịu mắt
</div>`,
      steps: [
        { lines: [1], title: 'background-color', text: 'Tô toàn bộ bề mặt hộp bằng màu vàng nhạt ấm áp #fef3c7.' },
      ],
    },
    tip: 'Màu nền mặc định của hầu hết phần tử HTML là transparent (trong suốt).',
    consequence: 'Quên đặt màu nền cho thẻ absolute có thể làm các dòng chữ phía dưới lộ xuyên thấu qua rất lộn xộn.',
    analogy: 'Như tấm giấy màu được dán lót ở mặt sau trang sách.',
  },
  {
    id: 'css-linear-gradient',
    term: 'linear-gradient (Dải màu chuyển)',
    category: 'Màu & nền',
    meaning: 'Tạo dải màu chuyển tiếp mượt mà theo góc nghiêng hoặc hướng',
    syntax: 'background: linear-gradient(góc, màu1, màu2);',
    example: {
      kind: 'render',
      code: `<div style="
  background: linear-gradient(135deg, #4f46e5, #06b6d4);
  color: white;
  padding: 20px;
  border-radius: 10px;
  font-family: sans-serif;
  text-align: center;
  font-weight: bold;
">
  Dải màu nghiêng 135 độ từ tím sang xanh lơ
</div>`,
      steps: [
        { lines: [2], title: 'linear-gradient', text: 'Chuyển màu mượt mà nghiêng 135 độ từ #4f46e5 sang #06b6d4.' },
      ],
    },
    tip: 'Dùng cú pháp to right để chuyển từ trái sang phải, to bottom để chuyển từ trên xuống.',
    consequence: 'Kết hợp các màu tương phản quá gắt trong gradient có thể tạo vệt xám đục ở điểm giao nhau.',
    analogy: 'Như ánh hoàng hôn trên biển chuyển từ cam rực rỡ sang tím thẫm.',
  },
  {
    id: 'css-background-image',
    term: 'background-image (Ảnh nền)',
    category: 'Màu & nền',
    meaning: 'Đặt hình ảnh làm nền phía sau nội dung',
    syntax: 'background-image: url("đường-dẫn-ảnh");',
    example: {
      kind: 'render',
      code: `<div style="
  background-image: radial-gradient(#6366f1 1px, transparent 1px);
  background-size: 16px 16px;
  background-color: #f8fafc;
  padding: 24px;
  border-radius: 10px;
  font-family: sans-serif;
  text-align: center;
">
  Nền chấm bi hoa văn nhẹ nhàng tạo bằng pattern CSS
</div>`,
      steps: [
        { lines: [2], title: 'background-image', text: 'Vẽ hoa văn chấm bi lặp lại phía sau nền.' },
      ],
    },
    tip: 'Luôn khai báo kèm background-color dự phòng phòng khi ảnh nền bị lỗi đường dẫn.',
    consequence: 'Dùng ảnh kích thước dung lượng quá lớn làm ảnh nền sẽ làm trang web tải chậm chạp.',
    analogy: 'Như dán giấy dán tường có hoa văn lên bức tường phòng khách.',
  },
  {
    id: 'css-background-size',
    term: 'background-size: cover / contain',
    category: 'Màu & nền',
    meaning: 'Quy định tỷ lệ co giãn của hình ảnh nền bên trong khung chứa',
    syntax: 'background-size: cover | contain | 100% auto;',
    example: {
      kind: 'render',
      code: `<div style="
  background: linear-gradient(to right, #4f46e5, #ec4899);
  background-size: cover;
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-family: sans-serif;
  text-align: center;
">
  cover: Ảnh nền tự động phủ kín 100% diện tích khung chứa
</div>`,
      steps: [
        { lines: [3], title: 'cover', text: 'Tự động mở rộng tỷ lệ ảnh để lấp đầy toàn bộ khung mà không làm méo hình.' },
      ],
    },
    tip: 'Cặp đôi hoàn hảo: background-size: cover; background-position: center;',
    consequence: 'Nếu dùng contain, ảnh có thể để lại khoảng trống thừa 2 bên khi khung chứa không cùng tỷ lệ.',
    analogy: 'cover như trải tấm bạt phủ kín toàn bộ chiếc xe; contain như đặt ảnh vừa vặn vào khung kính.',
  },
  {
    id: 'css-background-position',
    term: 'background-position: center',
    category: 'Màu & nền',
    meaning: 'Căn chỉnh vị trí bắt đầu của ảnh nền (giữa, trên, dưới, trái, phải)',
    syntax: 'background-position: center | top left | 50% 50%;',
    example: {
      kind: 'render',
      code: `<div style="
  background: linear-gradient(45deg, #3b82f6, #10b981);
  background-position: center;
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-family: sans-serif;
  text-align: center;
">
  background-position: center giữ trọng tâm ảnh ở giữa khung
</div>`,
      steps: [
        { lines: [3], title: 'center', text: 'Căn tâm của ảnh trùng với tâm của phần tử.' },
      ],
    },
    tip: 'Rất quan trọng khi làm banner hero ảnh người để mặt người mẫu luôn nằm ở trung tâm.',
    consequence: 'Mặc định là top left, có thể làm cắt mất phần quan trọng nhất ở giữa bức ảnh.',
    analogy: 'Như việc ngắm ống kính máy ảnh vào chính giữa chủ thể.',
  },
  {
    id: 'css-opacity',
    term: 'opacity (Độ mờ đục)',
    category: 'Màu & nền',
    meaning: 'Quy định độ trong suốt của toàn bộ phần tử và tất cả phần tử con bên trong',
    syntax: 'opacity: 0 (trong suốt) đến 1 (rõ nét);',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 12px; font-family: sans-serif;">
  <div style="flex:1; background: #6366f1; color: white; padding: 12px; border-radius: 6px; opacity: 1; text-align: center;">opacity: 1</div>
  <div style="flex:1; background: #6366f1; color: white; padding: 12px; border-radius: 6px; opacity: 0.6; text-align: center;">opacity: 0.6</div>
  <div style="flex:1; background: #6366f1; color: white; padding: 12px; border-radius: 6px; opacity: 0.2; text-align: center;">opacity: 0.2</div>
</div>`,
      steps: [
        { lines: [2, 3, 4], title: 'opacity', text: 'Giảm dần độ đục từ 100% xuống 60% và 20%.' },
      ],
    },
    tip: 'Nếu chỉ muốn làm mờ màu nền mà chữ vẫn nét, hãy dùng background: rgba(...) thay vì opacity.',
    consequence: 'opacity làm mờ cả chữ lẫn icon bên trong con, không thể đảo ngược bằng opacity: 1 ở thẻ con.',
    analogy: 'Như lớp kính mờ: chỉnh độ đục của tấm kính chắn phía trước.',
  },

  // ================= 3. CHỮ =================
  {
    id: 'css-font-family',
    term: 'font-family (Phông chữ)',
    category: 'Chữ',
    meaning: 'Chỉ định danh sách phông chữ ưu tiên hiển thị theo thứ tự dự phòng',
    syntax: 'font-family: \'Font-chính\', \'Font-phụ\', sans-serif;',
    example: {
      kind: 'render',
      code: `<p style="font-family: 'Segoe UI', system-ui, sans-serif; font-size: 15px; color: #1e293b;">
  Phông chữ không chân Segoe UI hiện đại, thanh thoát và dễ đọc trên màn hình máy tính.
</p>`,
      steps: [
        { lines: [1], title: 'font-family', text: 'Tìm Segoe UI trước, nếu máy không có thì dùng phông hệ thống system-ui.' },
      ],
    },
    tip: 'Luôn kết thúc bằng một họ phông chung như sans-serif, serif hoặc monospace.',
    consequence: 'Tên phông có dấu cách nhưng quên dấu nháy có thể khiến trình duyệt hiểu sai tên phông.',
    analogy: 'Như chọn bộ cọ vẽ nét tròn, nét vuông hay nét thanh nét đậm.',
  },
  {
    id: 'css-font-size',
    term: 'font-size (Kích cỡ chữ)',
    category: 'Chữ',
    meaning: 'Định dạng kích thước to nhỏ của con chữ',
    syntax: 'font-size: 16px | 1.25rem | 1.5em;',
    example: {
      kind: 'render',
      code: `<div style="font-family: sans-serif;">
  <span style="font-size: 12px; color: #64748b;">Chữ nhỏ (12px) - </span>
  <span style="font-size: 16px; color: #334155;">Chữ chuẩn (16px) - </span>
  <span style="font-size: 22px; color: #4f46e5; font-weight: bold;">Chữ lớn (22px)</span>
</div>`,
      steps: [
        { lines: [2, 3, 4], title: 'font-size', text: 'Thiết lập kích cỡ chữ tăng dần từ 12px đến 22px.' },
      ],
    },
    tip: 'Nên dùng rem cho kích cỡ chữ để tôn trọng cài đặt trợ năng phóng to chữ của người dùng.',
    consequence: 'Dùng cỡ chữ quá nhỏ dưới 12px trên điện thoại di động sẽ khiến người xem phải nheo mắt đọc.',
    analogy: 'Như các cấp ngòi bút 0.3mm, 0.5mm và 0.7mm.',
  },
  {
    id: 'css-font-weight',
    term: 'font-weight: bold / 400 - 900',
    category: 'Chữ',
    meaning: 'Quy định độ đậm nhạt của nét chữ',
    syntax: 'font-weight: normal (400) | bold (700) | 100 - 900;',
    example: {
      kind: 'render',
      code: `<div style="font-family: sans-serif; font-size: 15px;">
  <p style="font-weight: 300; color: #475569;">Nét thanh mảnh (Light 300)</p>
  <p style="font-weight: 500; color: #334155;">Nét vừa (Medium 500)</p>
  <p style="font-weight: 800; color: #1e1b4b;">Nét siêu đậm (ExtraBold 800)</p>
</div>`,
      steps: [
        { lines: [2, 3, 4], title: 'font-weight', text: 'Thay đổi độ dày của đường nét chữ từ 300 đến 800.' },
      ],
    },
    tip: 'Chỉ hoạt động tốt nếu tệp phông chữ được nạp có hỗ trợ độ đậm tương ứng.',
    consequence: 'Nếu phông không có bản nét đậm thật, trình duyệt sẽ tự ép đậm (faux bold) trông mờ nhòe.',
    analogy: 'Như việc ấn ngòi bút mạnh hay nhẹ tay khi viết lên giấy.',
  },
  {
    id: 'css-font-style',
    term: 'font-style: italic (Chữ nghiêng)',
    category: 'Chữ',
    meaning: 'Hiển thị kiểu chữ nghiêng hoặc chữ đứng thẳng',
    syntax: 'font-style: normal | italic | oblique;',
    example: {
      kind: 'render',
      code: `<p style="font-style: italic; color: #475569; font-family: Georgia, serif; font-size: 15px;">
  "Thiết kế web là sự kết hợp hoàn hảo giữa kỹ thuật và mỹ thuật."
</p>`,
      steps: [
        { lines: [1], title: 'font-style: italic', text: 'Tạo kiểu chữ nghiêng nghệ thuật thích hợp cho lời trích dẫn.' },
      ],
    },
    tip: 'Thường dùng cho trích dẫn (quote), chú thích ảnh hoặc thuật ngữ ngoại ngữ.',
    consequence: 'Lạm dụng chữ nghiêng cho đoạn văn dài sẽ gây mỏi mắt cho người đọc.',
    analogy: 'Như kiểu chữ viết tay uốn lượn mềm mại.',
  },
  {
    id: 'css-line-height',
    term: 'line-height (Độ cao dòng)',
    category: 'Chữ',
    meaning: 'Khoảng cách chiều cao giữa các dòng chữ trong đoạn văn',
    syntax: 'line-height: 1.5 | 1.6 | 24px;',
    example: {
      kind: 'render',
      code: `<div style="max-width: 320px; font-family: sans-serif; font-size: 13px; color: #334155;">
  <p style="line-height: 1.1; background: #fee2e2; padding: 6px; border-radius: 4px;">
    line-height 1.1 quá chật chội, các con chữ dính líu vào nhau rất khó đọc.
  </p>
  <p style="line-height: 1.7; background: #dcfce7; padding: 6px; border-radius: 4px;">
    line-height 1.7 chuẩn mực, khoảng thở giữa các dòng rộng rãi êm ái!
  </p>
</div>`,
      steps: [
        { lines: [2], title: 'line-height: 1.1', text: 'Dòng chật dính nhau.' },
        { lines: [5], title: 'line-height: 1.7', text: 'Dòng thoáng đãng dễ chịu.' },
      ],
    },
    tip: 'Nên dùng số không có đơn vị như 1.5 hoặc 1.6 để tự động nhân theo font-size.',
    consequence: 'line-height quá thấp khiến dấu phụ tiếng Việt (như ể, ễ, ộ) bị đè chèn lên dòng phía trên.',
    analogy: 'Như khoảng cách giữa các dòng kẻ trên trang giấy ô ly.',
  },
  {
    id: 'css-text-align',
    term: 'text-align: center / left / right',
    category: 'Chữ',
    meaning: 'Căn chỉnh vị trí văn bản theo phương ngang',
    syntax: 'text-align: left | center | right | justify;',
    example: {
      kind: 'render',
      code: `<div style="font-family: sans-serif; font-size: 13px;">
  <div style="text-align: left; color: #4f46e5; margin-bottom: 4px;">Căn mép trái (left)</div>
  <div style="text-align: center; color: #059669; margin-bottom: 4px;">Căn chính giữa (center)</div>
  <div style="text-align: right; color: #dc2626;">Căn mép phải (right)</div>
</div>`,
      steps: [
        { lines: [2, 3, 4], title: 'text-align', text: 'Dịch chuyển dòng văn bản sang trái, giữa, phải.' },
      ],
    },
    tip: 'text-align chỉ có tác dụng lên nội dung inline hoặc chữ bên trong khối block.',
    consequence: 'Dùng text-align: center để căn một khối <div> to đùng sẽ không hoạt động; khối phải dùng margin: auto.',
    analogy: 'Như thao tác bấm nút căn lề trên thanh công cụ Microsoft Word.',
  },
  {
    id: 'css-text-decoration',
    term: 'text-decoration: underline / none',
    category: 'Chữ',
    meaning: 'Tạo gạch chân, gạch ngang thân hoặc xóa đường gạch dưới liên kết',
    syntax: 'text-decoration: none | underline | line-through;',
    example: {
      kind: 'render',
      code: `<div style="font-family: sans-serif; font-size: 14px;">
  <a href="#" style="text-decoration: none; color: #4f46e5; font-weight: bold; margin-right: 12px;">Link không gạch chân (none)</a>
  <span style="text-decoration: line-through; color: #94a3b8;">Giá cũ: 500k</span>
</div>`,
      steps: [
        { lines: [2], title: 'none', text: 'Xóa đường gạch chân mặc định của thẻ <a>.' },
        { lines: [3], title: 'line-through', text: 'Tạo đường gạch ngang thân biểu thị giá cũ bị gạch bỏ.' },
      ],
    },
    tip: 'Nên giữ lại gạch chân khi hover (:hover) để người dùng nhận biết rõ đó là link bấm được.',
    consequence: 'Xóa sạch gạch chân của liên kết trong bài viết có thể khiến người đọc không nhận ra đó là link bấm được.',
    analogy: 'Như lấy bút gạch dưới từ khóa quan trọng hoặc gạch bỏ việc đã làm xong.',
  },
  {
    id: 'css-text-transform',
    term: 'text-transform: uppercase / capitalize',
    category: 'Chữ',
    meaning: 'Tự động chuyển đổi chữ hoa/chữ thường mà không cần gõ lại nội dung',
    syntax: 'text-transform: uppercase | lowercase | capitalize | none;',
    example: {
      kind: 'render',
      code: `<div style="font-family: sans-serif; font-size: 13px;">
  <p style="text-transform: uppercase; color: #4f46e5; font-weight: bold;">chữ viết hoa toàn bộ (uppercase)</p>
  <p style="text-transform: capitalize; color: #059669;">viết hoa chữ cái đầu mỗi từ (capitalize)</p>
</div>`,
      steps: [
        { lines: [2], title: 'uppercase', text: 'Tự động biến toàn bộ chữ thành IN HOA.' },
        { lines: [3], title: 'capitalize', text: 'Tự động viết hoa chữ cái đầu tiên của từng từ.' },
      ],
    },
    tip: 'Rất tiện cho nhãn nút bấm hoặc tiêu đề nhỏ mà không làm thay đổi văn bản gốc trong HTML.',
    consequence: 'Dùng uppercase quá nhiều trong các đoạn văn dài sẽ khiến người đọc có cảm giác như đang bị quát vào mặt.',
    analogy: 'Như nhấn phím Caps Lock tự động cho các đoạn văn bản được chọn.',
  },
  {
    id: 'css-letter-spacing',
    term: 'letter-spacing (Dãn khoảng cách chữ)',
    category: 'Chữ',
    meaning: 'Điều chỉnh khoảng cách rộng hay hẹp giữa các ký tự chữ cái',
    syntax: 'letter-spacing: 1px | -0.5px | 0.1em;',
    example: {
      kind: 'render',
      code: `<div style="font-family: sans-serif;">
  <div style="letter-spacing: 3px; text-transform: uppercase; font-size: 11px; font-weight: bold; color: #6366f1;">
    D Ã N  K H O Ả N G  C Á C H  3 P X
  </div>
</div>`,
      steps: [
        { lines: [2], title: 'letter-spacing: 3px', text: 'Dãn rộng khoảng trống giữa các chữ cái tạo vẻ hiện đại sang trọng.' },
      ],
    },
    tip: 'Thường kết hợp letter-spacing rộng với text-transform: uppercase cho nhãn nhỏ cao cấp.',
    consequence: 'letter-spacing âm quá nhiều (-2px) sẽ làm các chữ cái dính đè lên nhau gây lỗi đọc.',
    analogy: 'Như việc giãn cách khoảng cách giữa các chữ cái in trên biển hiệu quảng cáo.',
  },

  // ================= 4. HỘP & KÍCH THƯỚC =================
  {
    id: 'css-width',
    term: 'width (Chiều rộng)',
    category: 'Hộp & kích thước',
    meaning: 'Thiết lập độ rộng theo phương ngang của phần tử',
    syntax: 'width: 200px | 50% | auto;',
    example: {
      kind: 'render',
      code: `<div style="width: 200px; background: #6366f1; color: white; padding: 12px; border-radius: 6px; font-family: sans-serif; font-weight: bold; text-align: center;">
  width: 200px cố định
</div>`,
      steps: [
        { lines: [1], title: 'width: 200px', text: 'Khóa bề rộng phần tử cố định đúng 200 pixel.' },
      ],
    },
    tip: 'Kết hợp width: 100% với max-width để phần tử tự co lại trên màn hình nhỏ.',
    consequence: 'Đặt width cố định lớn hơn bề ngang màn hình điện thoại (như 500px) sẽ gây thanh cuộn ngang vỡ trang.',
    analogy: 'Như đo chiều ngang của mặt bàn bằng thước kẻ.',
  },
  {
    id: 'css-height',
    term: 'height (Chiều cao)',
    category: 'Hộp & kích thước',
    meaning: 'Thiết lập độ cao theo phương dọc của phần tử',
    syntax: 'height: 100px | 100vh | auto;',
    example: {
      kind: 'render',
      code: `<div style="height: 80px; background: #10b981; color: white; padding: 12px; border-radius: 6px; font-family: sans-serif; font-weight: bold; display: flex; align-items: center; justify-content: center;">
  height: 80px cố định
</div>`,
      steps: [
        { lines: [1], title: 'height: 80px', text: 'Khóa chiều cao phần tử cố định đúng 80 pixel.' },
      ],
    },
    tip: 'Nên để height: auto để hộp tự co giãn chiều cao theo nội dung văn bản bên trong.',
    consequence: 'Khóa height cố định cho hộp văn bản sẽ làm chữ bị tràn lòi ra ngoài khi nội dung dài thêm.',
    analogy: 'Như chiều cao của giá sách trong phòng.',
  },
  {
    id: 'css-max-width',
    term: 'max-width (Chiều rộng tối đa)',
    category: 'Hộp & kích thước',
    meaning: 'Quy định bề rộng tối đa mà phần tử không bao giờ được vượt quá',
    syntax: 'max-width: 600px | 100%;',
    example: {
      kind: 'render',
      code: `<div style="width: 100%; max-width: 320px; background: #f8fafc; border: 2px solid #6366f1; padding: 12px; border-radius: 8px; font-family: sans-serif; text-align: center; color: #4338ca; font-weight: bold;">
  width: 100% + max-width: 320px
</div>`,
      steps: [
        { lines: [1], title: 'max-width: 320px', text: 'Dù màn hình to đến đâu, hộp cũng không bao giờ bè rộng quá 320px.' },
      ],
    },
    tip: 'Cực kỳ quan trọng để căn giữa bố cục trang web và làm ảnh co giãn linh hoạt.',
    consequence: 'Thiếu max-width trên màn hình 4K siêu rộng, các dòng chữ sẽ bị kéo dài ngoằng từ mép này sang mép kia rất khó đọc.',
    analogy: 'Như dây an toàn giới hạn tối đa: được co nhỏ lại nhưng không được vượt quá mức quy định.',
  },
  {
    id: 'css-min-width',
    term: 'min-width (Chiều rộng tối thiểu)',
    category: 'Hộp & kích thước',
    meaning: 'Quy định bề rộng tối thiểu, không bao giờ bị co nhỏ hơn giá trị này',
    syntax: 'min-width: 150px | 300px;',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 8px; font-family: sans-serif;">
  <button style="min-width: 140px; padding: 8px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
    Nút min 140px
  </button>
</div>`,
      steps: [
        { lines: [2], title: 'min-width: 140px', text: 'Đảm bảo nút bấm luôn đủ to để ngón tay dễ bấm trên di động.' },
      ],
    },
    tip: 'Dùng cho các nút bấm UI hoặc thẻ cột để đảm bảo nội dung không bị bẹp dúm.',
    consequence: 'min-width quá lớn trên điện thoại nhỏ sẽ đẩy các phần tử khác tràn ra ngoài viền.',
    analogy: 'Như diện tích tối thiểu của một gian hàng trong hội chợ.',
  },
  {
    id: 'css-padding',
    term: 'padding (Khoảng đệm trong)',
    category: 'Hộp & kích thước',
    meaning: 'Tạo khoảng đệm trống từ đường viền vào trong nội dung',
    syntax: 'padding: 16px | 10px 20px (trên-dưới trái-phải);',
    example: {
      kind: 'render',
      code: `<div style="background: #e0e7ff; border: 2px solid #6366f1; padding: 20px; border-radius: 8px; font-family: sans-serif;">
  <strong style="color: #4338ca;">Padding 20px</strong>
  <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">Đẩy nội dung lùi sâu vào trong hộp an toàn.</p>
</div>`,
      steps: [
        { lines: [1], title: 'padding: 20px', text: 'Tạo vùng đệm 20px 4 phía đều nhau.' },
      ],
    },
    tip: 'Công thức ghi tắt 4 phía theo chiều kim đồng hồ: top right bottom left.',
    consequence: 'Không có padding khiến chữ chạm sát vào mép viền trông chật chội và thiếu chuyên nghiệp.',
    analogy: 'Như lớp xốp chống sốc lót đệm bên trong hộp quà.',
  },
  {
    id: 'css-margin',
    term: 'margin (Khoảng cách ngoài)',
    category: 'Hộp & kích thước',
    meaning: 'Tạo khoảng cách trống bên ngoài đường viền để cách ly các hộp',
    syntax: 'margin: 20px | 0 auto (căn giữa khối);',
    example: {
      kind: 'render',
      code: `<div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-family: sans-serif;">
  <div style="background: #ffffff; margin: 12px 0; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px;">Hộp 1</div>
  <div style="background: #ffffff; margin: 12px 0; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px;">Hộp 2 (cách hộp 1 nhờ margin)</div>
</div>`,
      steps: [
        { lines: [2, 3], title: 'margin: 12px 0', text: 'Tạo khoảng hở 12px giữa 2 hộp.' },
      ],
    },
    tip: 'margin: 0 auto; là tuyệt chiêu kinh điển để căn giữa một khối có chiều rộng cố định.',
    consequence: 'Hai margin dọc liền kề nhau sẽ xảy ra hiện tượng sụp đổ lề (Margin Collapse) gộp lại thành 1.',
    analogy: 'Như khoảng cách an toàn 2 mét giữa các phương tiện tham gia giao thông.',
  },
  {
    id: 'css-border',
    term: 'border (Đường viền)',
    category: 'Hộp & kích thước',
    meaning: 'Định dạng đường viền bao quanh hộp (độ dày, kiểu nét và màu sắc)',
    syntax: 'border: độ-dày kiểu màu (2px solid #6366f1);',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 10px; font-family: sans-serif; font-size: 12px;">
  <div style="flex:1; border: 2px solid #6366f1; padding: 10px; border-radius: 6px; text-align: center;">solid (liền)</div>
  <div style="flex:1; border: 2px dashed #f59e0b; padding: 10px; border-radius: 6px; text-align: center;">dashed (đứt)</div>
  <div style="flex:1; border: 2px dotted #ef4444; padding: 10px; border-radius: 6px; text-align: center;">dotted (chấm)</div>
</div>`,
      steps: [
        { lines: [2, 3, 4], title: 'border', text: 'Vẽ 3 kiểu viền khác nhau quanh các khối.' },
      ],
    },
    tip: 'Có thể chỉnh viền từng phía riêng biệt: border-bottom: 1px solid #e2e8f0;',
    consequence: 'Thêm viền ở chế độ content-box cũ sẽ làm hộp phình to thêm kích thước viền đó.',
    analogy: 'Như hàng rào bao quanh khu đất của ngôi nhà.',
  },
  {
    id: 'css-border-radius',
    term: 'border-radius (Bo góc)',
    category: 'Hộp & kích thước',
    meaning: 'Bo tròn các góc vuông sắc nhọn của phần tử',
    syntax: 'border-radius: 8px | 50% (tròn);',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 12px; align-items: center; font-family: sans-serif; font-size: 12px;">
  <div style="background: #6366f1; color: white; padding: 8px 14px; border-radius: 6px;">Bo nhẹ 6px</div>
  <div style="background: #059669; color: white; padding: 8px 14px; border-radius: 20px;">Viên thuốc 20px</div>
  <div style="width: 40px; height: 40px; background: #ec4899; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">50%</div>
</div>`,
      steps: [
        { lines: [2, 3, 4], title: 'border-radius', text: 'Tạo góc bo từ nhẹ nhàng đến hình viên thuốc và hình tròn.' },
      ],
    },
    tip: 'Góc bo tròn giúp giao diện người dùng trông thân thiện, hiện đại và ít gai góc hơn.',
    consequence: 'Bo góc quá đà trên các bảng biểu hoặc nút bấm dài có thể làm chữ bị cắt lẹm ở góc.',
    analogy: 'Như dùng giấy ráp mài nhẵn 4 góc sắc nhọn của chiếc bàn gỗ.',
  },
  {
    id: 'css-box-sizing',
    term: 'box-sizing: border-box',
    category: 'Hộp & kích thước',
    meaning: 'Tính chiều rộng bao gồm cả padding và border để không bị tràn hộp',
    syntax: 'box-sizing: border-box | content-box;',
    example: {
      kind: 'mixed',
      code: `<style>
  .hop-chuan {
    box-sizing: border-box;
    width: 100%;
    padding: 16px;
    border: 4px solid #10b981;
    background: #ecfdf5;
    border-radius: 8px;
    font-family: sans-serif;
  }
</style>
<div class="hop-chuan">
  <strong>box-sizing: border-box</strong>
  <p style="margin: 4px 0 0 0; font-size: 12px; color: #065f46;">
    Dù thêm padding 16px và viền 4px, tổng chiều rộng vẫn giữ đúng 100%, không bị vỡ bố cục!
  </p>
</div>`,
      steps: [
        { lines: [3], title: 'box-sizing: border-box', text: 'Gộp padding và viền vào bên trong chiều rộng width.' },
      ],
      illustration: {
        type: 'BoxModelDiagram',
        data: { width: '200px', compareBorderBox: true },
      },
    },
    tip: 'Luôn đặt quy tắc này lên đầu CSS toàn cục: *, *::before, *::after { box-sizing: border-box; }',
    consequence: 'Ở content-box cũ, thêm padding 10px vào hộp 100% sẽ làm nó rộng thành 100% + 20px và gây thanh cuộn ngang.',
    analogy: 'Như mua chiếc vali kích thước cố định: đồ đạc bên trong tự sắp xếp vừa trong thể tích đó.',
  },

  // ================= 5. BỐ CỤC (FLEXBOX/GRID/POSITION) =================
  {
    id: 'css-display-flex',
    term: 'display: flex (Kích hoạt Flexbox)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Biến phần tử thành Flex Container, các phần tử con tự động dàn hàng ngang',
    syntax: 'display: flex | inline-flex;',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 8px; font-family: sans-serif; font-size: 12px; font-weight: bold;">
  <div style="flex:1; background: #4f46e5; color: white; padding: 12px; border-radius: 6px; text-align: center;">Khối 1</div>
  <div style="flex:1; background: #059669; color: white; padding: 12px; border-radius: 6px; text-align: center;">Khối 2</div>
  <div style="flex:1; background: #d97706; color: white; padding: 12px; border-radius: 6px; text-align: center;">Khối 3</div>
</div>`,
      steps: [
        { lines: [1], title: 'display: flex', text: 'Kích hoạt mô hình dàn hàng ngang linh hoạt.' },
      ],
    },
    tip: 'Là công cụ bố cục phổ biến nhất trong phát triển web hiện đại.',
    consequence: 'display: flex phải đặt ở thẻ cha, đặt ở thẻ con sẽ không dàn hàng được các phần tử anh em.',
    analogy: 'Như mở rộng cánh cổng để các phần tử xếp hàng ngang bước vào.',
  },
  {
    id: 'css-flex-direction',
    term: 'flex-direction: row / column',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Xác định hướng của trục chính (dàn theo hàng ngang hay cột dọc)',
    syntax: 'flex-direction: row | column | row-reverse | column-reverse;',
    example: {
      kind: 'render',
      code: `<div style="display: flex; flex-direction: column; gap: 6px; font-family: sans-serif; font-size: 12px;">
  <div style="background: #e0e7ff; color: #4338ca; padding: 8px; border-radius: 4px; font-weight: bold;">Mục 1 (Xếp dọc)</div>
  <div style="background: #e0e7ff; color: #4338ca; padding: 8px; border-radius: 4px; font-weight: bold;">Mục 2 (Xếp dọc)</div>
</div>`,
      steps: [
        { lines: [1], title: 'flex-direction: column', text: 'Đổi hướng trục chính từ ngang sang dọc.' },
      ],
    },
    tip: 'Rất hay dùng trong media query để chuyển menu từ hàng ngang (Desktop) sang cột dọc (Mobile).',
    consequence: 'Khi đổi sang column, vai trò của justify-content và align-items sẽ bị tráo đổi trục cho nhau.',
    analogy: 'Như xoay chiếc bàn từ xếp hàng ngang sang xếp hàng dọc.',
  },
  {
    id: 'css-justify-content',
    term: 'justify-content (Căn trục chính)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Căn chỉnh và phân bổ khoảng trống dọc theo trục chính (Main Axis)',
    syntax: 'justify-content: flex-start | center | flex-end | space-between | space-around;',
    example: {
      kind: 'render',
      code: `<div style="display: flex; justify-content: space-between; background: #f1f5f9; padding: 10px; border-radius: 6px; font-family: sans-serif; font-size: 12px; font-weight: bold;">
  <div style="background: #4f46e5; color: white; padding: 6px 12px; border-radius: 4px;">Trái</div>
  <div style="background: #059669; color: white; padding: 6px 12px; border-radius: 4px;">Phải</div>
</div>`,
      steps: [
        { lines: [1], title: 'space-between', text: 'Đẩy phần tử đầu về mép trái và phần tử cuối về mép phải.' },
      ],
    },
    tip: 'space-between là bí quyết vàng để làm thanh điều hướng (Logo bên trái, Menu bên phải).',
    consequence: 'Nếu các phần tử con đã chiếm hết 100% bề rộng, justify-content sẽ không còn khoảng trống thừa để căn.',
    analogy: 'Như đẩy hai đồ vật dạt về hai mép tường phòng.',
  },
  {
    id: 'css-align-items',
    term: 'align-items (Căn trục phụ)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Căn chỉnh phần tử trên trục phụ vuông góc (Cross Axis)',
    syntax: 'align-items: stretch | center | flex-start | flex-end;',
    example: {
      kind: 'render',
      code: `<div style="display: flex; align-items: center; height: 70px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; font-family: sans-serif;">
  <div style="background: #6366f1; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 12px;">Căn giữa trục dọc</div>
</div>`,
      steps: [
        { lines: [1], title: 'align-items: center', text: 'Căn phần tử nằm vào đúng tâm chiều cao của khung cha.' },
      ],
    },
    tip: 'Giá trị mặc định là stretch (tự kéo dài chiều cao bằng nhau giữa các cột).',
    consequence: 'Nếu khung cha không có chiều cao (height) cố định hoặc padding, align-items: center trông sẽ như không có tác dụng.',
    analogy: 'Như treo một bức tranh vào đúng vị trí chính giữa chiều cao của bức tường.',
  },
  {
    id: 'css-flex-wrap',
    term: 'flex-wrap: wrap (Tự xuống dòng)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Cho phép các phần tử tự động xuống hàng mới khi hết chỗ',
    syntax: 'flex-wrap: nowrap | wrap | wrap-reverse;',
    example: {
      kind: 'render',
      code: `<div style="display: flex; flex-wrap: wrap; gap: 8px; max-width: 260px; font-family: sans-serif; font-size: 11px; font-weight: bold;">
  <div style="background: #e0e7ff; color: #4338ca; padding: 6px 12px; border-radius: 4px;">Thẻ tag 1</div>
  <div style="background: #e0e7ff; color: #4338ca; padding: 6px 12px; border-radius: 4px;">Thẻ tag 2</div>
  <div style="background: #e0e7ff; color: #4338ca; padding: 6px 12px; border-radius: 4px;">Thẻ tag 3</div>
  <div style="background: #e0e7ff; color: #4338ca; padding: 6px 12px; border-radius: 4px;">Thẻ tag 4 tự xuống dòng</div>
</div>`,
      steps: [
        { lines: [1], title: 'flex-wrap: wrap', text: 'Khi bề ngang vượt quá 260px, các mục tự động rơi xuống hàng 2.' },
      ],
    },
    tip: 'Tuyệt vời cho danh sách từ khóa (tags), huy hiệu, hoặc lưới sản phẩm responsive.',
    consequence: 'Mặc định là nowrap, các phần tử sẽ bị bóp nghẹt méo mó trên cùng một hàng thay vì xuống dòng.',
    analogy: 'Như việc viết chữ đến hết lề vở thì tự động xuống dòng kế tiếp.',
  },
  {
    id: 'css-flex-gap',
    term: 'gap (Khoảng cách hàng/cột)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Tạo khoảng cách trống đồng đều giữa các phần tử flex và grid',
    syntax: 'gap: 16px | 12px 24px (hàng cột);',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 16px; font-family: sans-serif; font-size: 12px; font-weight: bold;">
  <div style="background: #4f46e5; color: white; padding: 10px; border-radius: 6px;">Hộp A</div>
  <div style="background: #4f46e5; color: white; padding: 10px; border-radius: 6px;">Hộp B (cách A 16px)</div>
</div>`,
      steps: [
        { lines: [1], title: 'gap: 16px', text: 'Tạo khoảng hở 16px ở giữa mà không làm dính viền mép ngoài.' },
      ],
    },
    tip: 'Thay thế hoàn toàn giải pháp cũ margin-right phức tạp phải dùng thêm :last-child.',
    consequence: 'gap chỉ hoạt động bên trong container có display: flex hoặc display: grid.',
    analogy: 'Như khoảng cách giữa các ngón tay khi bạn xòe bàn tay ra.',
  },
  {
    id: 'css-display-grid',
    term: 'display: grid (Lưới 2 chiều)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Kích hoạt hệ thống bố cục lưới 2 chiều phân chia theo hàng và cột',
    syntax: 'display: grid | inline-grid;',
    example: {
      kind: 'render',
      code: `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: sans-serif; font-size: 12px; font-weight: bold; text-align: center;">
  <div style="background: #ecfdf5; color: #065f46; border: 1px solid #10b981; padding: 12px; border-radius: 6px;">Cột 1</div>
  <div style="background: #ecfdf5; color: #065f46; border: 1px solid #10b981; padding: 12px; border-radius: 6px;">Cột 2</div>
</div>`,
      steps: [
        { lines: [1], title: 'display: grid', text: 'Kích hoạt hệ thống lưới 2 cột tỷ lệ 1fr 1fr.' },
      ],
    },
    tip: 'Là công cụ số 1 để xây dựng layout tổng thể cho toàn bộ trang web.',
    consequence: 'Dùng bảng HTML table để làm bố cục trang web sẽ gây khó khăn cho việc responsive trên điện thoại.',
    analogy: 'Như bàn cờ vua với các ô kẻ hàng ngang và hàng dọc thẳng tắp.',
  },
  {
    id: 'css-grid-template-columns',
    term: 'grid-template-columns: repeat(...)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Định nghĩa số lượng và bề rộng của các cột trong lưới',
    syntax: 'grid-template-columns: repeat(3, 1fr) | 200px 1fr;',
    example: {
      kind: 'render',
      code: `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-family: sans-serif; font-size: 12px; font-weight: bold; text-align: center;">
  <div style="background: #e0e7ff; color: #4338ca; padding: 12px; border-radius: 6px;">Ô 1</div>
  <div style="background: #e0e7ff; color: #4338ca; padding: 12px; border-radius: 6px;">Ô 2</div>
  <div style="background: #e0e7ff; color: #4338ca; padding: 12px; border-radius: 6px;">Ô 3</div>
</div>`,
      steps: [
        { lines: [1], title: 'repeat(3, 1fr)', text: 'Tạo 3 cột có bề rộng bằng nhau tự động chia đều diện tích.' },
      ],
    },
    tip: 'Tự động responsive không cần media query: repeat(auto-fit, minmax(200px, 1fr));',
    consequence: 'Nếu đặt kích thước cột bằng pixel cố định, lưới sẽ không co giãn được trên điện thoại.',
    analogy: 'Như chia chiếc bánh ga-tô thành 3 phần bằng nhau.',
  },
  {
    id: 'css-grid-column',
    term: 'grid-column: span 2',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Chỉ định một ô trong lưới trải dài chiếm nhiều cột liên tiếp',
    syntax: 'grid-column: span 2 | 1 / 3;',
    example: {
      kind: 'render',
      code: `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-family: sans-serif; font-size: 12px; font-weight: bold; text-align: center;">
  <div style="grid-column: span 2; background: #fef3c7; color: #b45309; padding: 12px; border-radius: 6px;">Ô chiếm 2 cột (span 2)</div>
  <div style="background: #f1f5f9; color: #475569; padding: 12px; border-radius: 6px;">Ô 2</div>
</div>`,
      steps: [
        { lines: [2], title: 'grid-column: span 2', text: 'Ô đầu tiên mở rộng bề ngang chiếm trọn 2 rãnh cột.' },
      ],
    },
    tip: 'Tương đương thuộc tính colspan trong thẻ bảng <td> HTML.',
    consequence: 'span số cột vượt quá tổng số cột của lưới sẽ sinh thêm cột ngầm và làm hỏng cấu trúc layout.',
    analogy: 'Như gộp 2 phòng nhỏ lại thành một phòng khách lớn.',
  },
  {
    id: 'css-position-relative',
    term: 'position: relative (Mốc tọa độ)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Giữ phần tử ở vị trí bình thường nhưng biến nó thành mốc tọa độ neo cho thẻ con',
    syntax: 'position: relative;',
    example: {
      kind: 'render',
      code: `<div style="position: relative; width: 220px; height: 80px; background: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 8px; padding: 10px; font-family: sans-serif; font-size: 12px;">
  Khung cha relative
  <span style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: bold;">NEW</span>
</div>`,
      steps: [
        { lines: [1], title: 'position: relative', text: 'Đóng vai trò làm mốc neo để thẻ con có thể ghim vào góc.' },
      ],
    },
    tip: 'relative là cặp bài trùng bắt buộc phải có khi sử dụng absolute ở thẻ con.',
    consequence: 'Dùng relative với top/left sẽ dịch chuyển phần tử nhưng vẫn để lại khoảng trống cũ trống rỗng.',
    analogy: 'Như chiếc khung ảnh treo trên tường làm mốc để dán sticker vào góc khung.',
  },
  {
    id: 'css-position-absolute',
    term: 'position: absolute (Định vị tự do)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Thoát khỏi dòng chảy bình thường và bay đến đúng tọa độ top, right, bottom, left',
    syntax: 'position: absolute; top: 0; right: 0;',
    example: {
      kind: 'render',
      code: `<div style="position: relative; width: 200px; height: 70px; background: #e0e7ff; border-radius: 8px; padding: 10px; font-family: sans-serif; font-size: 12px;">
  Thẻ sản phẩm
  <div style="position: absolute; bottom: 8px; right: 8px; background: #4338ca; color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">299k</div>
</div>`,
      steps: [
        { lines: [3], title: 'position: absolute', text: 'Ghim nhãn giá 299k cố định ở góc dưới bên phải.' },
      ],
    },
    tip: 'Phần tử absolute không chiếm chỗ trong dòng chảy, các phần tử xung quanh sẽ lấp vào chỗ của nó.',
    consequence: 'Lạm dụng absolute để dàn trang sẽ làm các phần tử đè lấn lên nhau khi màn hình co giãn.',
    analogy: 'Như chiếc huy hiệu được ghim vào góc áo.',
  },
  {
    id: 'css-position-fixed',
    term: 'position: fixed / sticky (Ghim màn hình)',
    category: 'Bố cục (Flexbox/Grid/Position)',
    meaning: 'Ghim cố định phần tử trên màn hình không bị trôi khi người dùng cuộn trang',
    syntax: 'position: fixed | sticky; top: 0;',
    example: {
      kind: 'render',
      code: `<div style="background: #1e1b4b; color: white; padding: 10px 16px; border-radius: 6px; font-family: sans-serif; font-size: 12px; font-weight: bold; display: flex; justify-content: space-between;">
  <span>Thanh tiêu đề ghim cố định</span>
  <span style="color: #38bdf8;">position: sticky; top: 0;</span>
</div>`,
      steps: [
        { lines: [1], title: 'sticky / fixed', text: 'Thanh điều hướng neo chặt ở đầu trang khi cuộn.' },
      ],
    },
    tip: 'sticky tự động hoạt động như relative khi ở vị trí ban đầu và biến thành fixed khi cuộn tới mép.',
    consequence: 'Phần tử cha có overflow: hidden sẽ làm position: sticky bị vô hiệu hóa hoàn toàn.',
    analogy: 'Như biển tên gắn cố định trên kính lái ô tô.',
  },

  // ================= 6. HIỆU ỨNG =================
  {
    id: 'css-transition',
    term: 'transition: all 0.3s ease',
    category: 'Hiệu ứng',
    meaning: 'Tạo hoạt ảnh chuyển động mượt mà khi trạng thái phần tử thay đổi',
    syntax: 'transition: thuộc-tính thời-gian hàm-gia-tốc;',
    example: {
      kind: 'render',
      code: `<button style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-family: sans-serif; font-weight: bold; cursor: pointer; transition: all 0.2s ease-in-out;" onmouseover="this.style.background='#4338ca'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='#6366f1'; this.style.transform='translateY(0)';">
  Rê chuột để thấy chuyển động 0.2s
</button>`,
      steps: [
        { lines: [1], title: 'transition: all 0.2s', text: 'Biến đổi màu và vị trí từ từ trong 0.2 giây.' },
      ],
    },
    tip: 'Thời gian chuyển động vi mô lý tưởng trên giao diện là 0.15s đến 0.3s.',
    consequence: 'Thiếu transition khiến nút bấm đổi màu giật cục như công tắc điện.',
    analogy: 'Như chiếc piston giảm chấn giúp cánh cửa khép lại êm ái.',
  },
  {
    id: 'css-transform-scale',
    term: 'transform: scale() (Phóng to/thu nhỏ)',
    category: 'Hiệu ứng',
    meaning: 'Phóng to hoặc thu nhỏ kích thước hình học của phần tử',
    syntax: 'transform: scale(tỷ-lệ);',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 20px; align-items: center; padding: 10px; font-family: sans-serif;">
  <div style="background: #4f46e5; color: white; padding: 10px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; transform: scale(1.15);">scale(1.15)</div>
</div>`,
      steps: [
        { lines: [2], title: 'scale(1.15)', text: 'Phóng to 115% so với kích thước ban đầu nhờ GPU.' },
      ],
    },
    tip: 'scale() không làm đẩy xô lệch các phần tử xung quanh như việc tăng width/height.',
    consequence: 'scale quá lớn có thể khiến phần tử che khuất các nút bấm lân cận.',
    analogy: 'Như việc phóng to ảnh bằng ống kính zoom của máy ảnh.',
  },
  {
    id: 'css-transform-rotate',
    term: 'transform: rotate() (Xoay góc)',
    category: 'Hiệu ứng',
    meaning: 'Xoay phần tử theo một góc độ chỉ định (độ deg)',
    syntax: 'transform: rotate(45deg);',
    example: {
      kind: 'render',
      code: `<div style="display: flex; justify-content: center; padding: 16px; font-family: sans-serif;">
  <div style="background: #ec4899; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 12px; transform: rotate(-6deg);">
    Xoay nghiêng -6 độ cá tính
  </div>
</div>`,
      steps: [
        { lines: [2], title: 'rotate(-6deg)', text: 'Nghiêng phần tử ngược chiều kim đồng hồ 6 độ.' },
      ],
    },
    tip: 'Rất hay dùng làm nhãn huy hiệu nghiêng hoặc icon mũi tên xoay tròn khi mở menu.',
    consequence: 'Xoay góc chữ dài có thể làm chữ bị vỡ cạnh răng cưa nếu màn hình có độ phân giải thấp.',
    analogy: 'Như việc dán một tấm bưu thiếp hơi nghiêng trên bảng ghi nhớ.',
  },
  {
    id: 'css-transform-translate',
    term: 'transform: translateY() (Dời vị trí)',
    category: 'Hiệu ứng',
    meaning: 'Dời phần tử theo trục ngang X hoặc trục dọc Y mà không ảnh hưởng luồng trang',
    syntax: 'transform: translate(x, y) | translateY(-5px);',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 12px; padding: 10px; font-family: sans-serif; font-size: 12px;">
  <div style="background: #f1f5f9; padding: 10px; border-radius: 6px;">Vị trí gốc</div>
  <div style="background: #6366f1; color: white; padding: 10px; border-radius: 6px; transform: translateY(-8px); box-shadow: 0 4px 10px rgba(99,102,241,0.3); font-weight: bold;">Nhấc lên -8px</div>
</div>`,
      steps: [
        { lines: [3], title: 'translateY(-8px)', text: 'Nhấc nhẹ phần tử lên cao 8px tạo cảm giác nổi bật.' },
      ],
    },
    tip: 'Luôn ưu tiên translate hơn thuộc tính top/left vì translate được GPU xử lý cực mượt 60 FPS.',
    consequence: 'translate quá xa có thể làm phần tử bay ra khỏi màn hình hoặc chui vào dưới phần tử khác.',
    analogy: 'Như nhấc một quân cờ lên khỏi mặt bàn.',
  },
  {
    id: 'css-box-shadow',
    term: 'box-shadow (Đổ bóng khối)',
    category: 'Hiệu ứng',
    meaning: 'Tạo hiệu ứng đổ bóng mờ ảo nhiều tầng cho phần tử',
    syntax: 'box-shadow: x y blur spread color;',
    example: {
      kind: 'render',
      code: `<div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); font-family: sans-serif; text-align: center;">
  <strong style="color: #1e293b;">Thẻ đổ bóng nhiều lớp mềm mại</strong>
</div>`,
      steps: [
        { lines: [1], title: 'box-shadow', text: 'Tạo bóng đổ khuếch tán mềm mại màu đen trong suốt 10%.' },
      ],
    },
    tip: 'Kỹ thuật pro: dùng 2 lớp bóng chồng lên nhau cách nhau bằng dấu phẩy để bóng cực kỳ chân thực.',
    consequence: 'Dùng bóng đen đặc #000 không có độ mờ rgba sẽ biến thành vệt đen bẩn thỉu.',
    analogy: 'Như bóng của đồ vật khi có ánh sáng mặt trời chiếu nghiêng.',
  },
  {
    id: 'css-keyframes',
    term: '@keyframes (Kịch bản hoạt ảnh)',
    category: 'Hiệu ứng',
    meaning: 'Định nghĩa các mốc thời gian (0%, 50%, 100%) của một chuỗi chuyển động phức tạp',
    syntax: '@keyframes tên { 0% { } 100% { } }',
    example: {
      kind: 'mixed',
      code: `<style>
  @keyframes phap-phong {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  .the-phap-phong {
    display: inline-block;
    padding: 10px 20px;
    background: #ec4899;
    color: white;
    border-radius: 20px;
    font-family: sans-serif;
    font-weight: bold;
    animation: phap-phong 1.5s infinite ease-in-out;
  }
</style>
<div class="the-phap-phong">Đang có hoạt ảnh @keyframes</div>`,
      steps: [
        { lines: [2, 3, 4, 5], title: '@keyframes', text: 'Định nghĩa nhịp thở phóng to thu nhỏ ở mốc 50%.' },
      ],
    },
    tip: 'Có thể dùng từ khóa from thay cho 0% và to thay cho 100%.',
    consequence: 'Quên khai báo animation-duration (thời gian chạy) sẽ khiến hoạt ảnh không bao giờ chuyển động.',
    analogy: 'Như cuốn sổ vẽ hoạt hình từng trang: lật nhanh để các hình vẽ cử động.',
  },
  {
    id: 'css-animation',
    term: 'animation: tên 1s infinite',
    category: 'Hiệu ứng',
    meaning: 'Áp dụng kịch bản @keyframes vào phần tử và cấu hình thời gian, số lần lặp',
    syntax: 'animation: tên thời-gian gia-tốc số-lần;',
    example: {
      kind: 'render',
      code: `<style>
  @keyframes xoay-tron {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
<div style="display: flex; justify-content: center; padding: 10px;">
  <div style="width: 32px; height: 32px; border: 4px solid #e0e7ff; border-top-color: #4f46e5; border-radius: 50%; animation: xoay-tron 1s linear infinite;"></div>
</div>`,
      steps: [
        { lines: [8], title: 'animation', text: 'Biểu tượng xoay tròn loading liên tục 360 độ.' },
      ],
    },
    tip: 'infinite giúp hoạt ảnh chạy mãi mãi; linear giúp tốc độ quay đều đặn không bị giật.',
    consequence: 'Hoạt ảnh chạy liên tục có thể làm hao pin thiết bị nếu dùng quá nhiều trên cùng 1 trang.',
    analogy: 'Như việc bấm nút Play để phát đoạn video đã được quay sẵn.',
  },
  {
    id: 'css-cursor',
    term: 'cursor: pointer (Đổi hình trỏ chuột)',
    category: 'Hiệu ứng',
    meaning: 'Thay đổi hình dáng của con trỏ chuột khi rê lên phần tử (hình bàn tay, mũi tên, dấu cộng)',
    syntax: 'cursor: pointer | default | not-allowed | grab;',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 10px; font-family: sans-serif; font-size: 12px;">
  <div style="padding: 8px 12px; background: #e0e7ff; color: #4338ca; border-radius: 6px; cursor: pointer; font-weight: bold;">cursor: pointer (Bàn tay)</div>
  <div style="padding: 8px 12px; background: #fee2e2; color: #991b1b; border-radius: 6px; cursor: not-allowed;">not-allowed (Cấm bấm)</div>
</div>`,
      steps: [
        { lines: [2, 3], title: 'cursor', text: 'Biến đổi hình dạng con trỏ chuột để báo hiệu phần tử có bấm được hay không.' },
      ],
    },
    tip: 'Luôn thêm cursor: pointer cho các thẻ <div> hoặc nút bấm tự tạo để báo cho người dùng biết bấm được.',
    consequence: 'Thẻ tương tác mà con trỏ chuột vẫn là mũi tên thường sẽ khiến người dùng tưởng nhầm là văn bản chết.',
    analogy: 'Như biển chỉ dẫn "Mời bấm chuông" hoặc "Khu vực cấm vào".',
  },

  // ================= 7. RESPONSIVE =================
  {
    id: 'css-media-max-width',
    term: '@media (max-width: 768px) (Truy vấn di động)',
    category: 'Responsive',
    meaning: 'Áp dụng các quy tắc CSS khi màn hình nhỏ hơn hoặc bằng 768px (Điện thoại & Tablet)',
    syntax: '@media (max-width: 768px) { ... }',
    example: {
      kind: 'mixed',
      code: `<style>
  .hop-thich-ung {
    background: #4f46e5;
    color: white;
    padding: 16px;
    border-radius: 8px;
    font-family: sans-serif;
    text-align: center;
  }
  @media (max-width: 600px) {
    .hop-thich-ung {
      background: #059669; /* Đổi màu xanh lá trên di động */
    }
  }
</style>
<div class="hop-thich-ung">Co nhỏ cửa sổ xem đổi màu responsive</div>`,
      steps: [
        { lines: [10, 11, 12, 13, 14], title: '@media (max-width: 600px)', text: 'Tự động kích hoạt khi khung nhìn nhỏ hơn 600px.' },
      ],
    },
    tip: 'Các điểm ngắt (breakpoints) phổ biến: 640px (Mobile), 768px (Tablet), 1024px (Laptop).',
    consequence: 'Thiếu thẻ meta viewport trong head thì câu lệnh @media trên điện thoại thật sẽ bị vô hiệu.',
    analogy: 'Như cảm biến nhiệt độ: khi nhiệt độ vượt ngưỡng thì tự động bật quạt gió.',
  },
  {
    id: 'css-media-min-width',
    term: '@media (min-width: 1024px) (Truy vấn màn lớn)',
    category: 'Responsive',
    meaning: 'Áp dụng các quy tắc CSS khi màn hình lớn hơn hoặc bằng 1024px (Chiến lược Mobile-First)',
    syntax: '@media (min-width: 1024px) { ... }',
    example: {
      kind: 'mixed',
      code: `<style>
  .thiet-ke-mobile-first {
    padding: 12px;
    font-family: sans-serif;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
  }
  @media (min-width: 768px) {
    .thiet-ke-mobile-first {
      padding: 24px; /* Tăng padding trên màn hình lớn */
    }
  }
</style>
<div class="thiet-ke-mobile-first">Chiến lược Mobile-first với min-width</div>`,
      steps: [
        { lines: [9, 10, 11, 12, 13], title: '@media (min-width: 768px)', text: 'Viết kiểu cơ bản cho mobile trước, mở rộng dần cho desktop.' },
      ],
    },
    tip: 'Mobile-first với min-width là tiêu chuẩn công nghiệp được các framework như Tailwind CSS áp dụng.',
    consequence: 'Pha trộn lộn xộn giữa max-width và min-width sẽ khiến mã CSS rất khó bảo trì.',
    analogy: 'Như thiết kế chiếc ba lô leo núi: bản cơ bản gọn nhẹ trước, rồi gắn thêm các ngăn phụ trợ khi cần.',
  },
  {
    id: 'css-viewport-units',
    term: 'vw & vh (Đơn vị theo khung nhìn)',
    category: 'Responsive',
    meaning: 'Đơn vị tỷ lệ phần trăm theo chiều rộng (vw) và chiều cao (vh) của cửa sổ trình duyệt',
    syntax: 'width: 100vw; height: 100vh;',
    example: {
      kind: 'render',
      code: `<div style="width: 100%; height: 90px; background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-weight: bold; border-radius: 8px;">
  100vh = 100% chiều cao màn hình
</div>`,
      steps: [
        { lines: [1], title: 'vw & vh', text: '1vw = 1% bề ngang cửa sổ; 1vh = 1% chiều cao cửa sổ.' },
      ],
    },
    tip: '100vh rất tiện lợi để tạo các màn hình Hero Banner toàn màn hình mở đầu trang web.',
    consequence: 'Trên điện thoại di động, thanh địa chỉ URL co thụt có thể làm 100vh bị giật nhẹ; giải pháp hiện đại là 100dvh (Dynamic Viewport Height).',
    analogy: 'Như tấm rèm che tự động đo đạc vừa khít với kích cỡ khung cửa sổ thực tế.',
  },
  {
    id: 'css-object-fit',
    term: 'object-fit: cover (Cắt ảnh vừa khít)',
    category: 'Responsive',
    meaning: 'Cắt gọt hình ảnh hoặc video tự động vừa vặn vào khung mà không bị méo tỷ lệ',
    syntax: 'object-fit: cover | contain | fill;',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 12px; font-family: sans-serif; font-size: 11px;">
  <div style="width: 100px; height: 70px; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: bold; text-align: center;">
    object-fit: cover
  </div>
  <div style="display: flex; align-items: center; color: #475569;">
    Ảnh tự cắt tỉa vừa khít tỷ lệ khung 100x70px mà không bị bẹp méo!
  </div>
</div>`,
      steps: [
        { lines: [2], title: 'object-fit: cover', text: 'Hoạt động tương tự background-size: cover nhưng áp dụng trực tiếp cho thẻ <img> và <video>.' },
      ],
    },
    tip: 'Luôn kết hợp: width: 100%; height: 100%; object-fit: cover; cho thẻ <img> trong các card sản phẩm.',
    consequence: 'Nếu không dùng object-fit, gán width và height cứng cho ảnh sẽ làm khuôn mặt hoặc vật thể bị kéo giãn méo mó.',
    analogy: 'Như lồng một bức ảnh vào khung tranh: cắt bớt phần thừa xung quanh để ảnh vừa khít khung mà không bị bóp méo tỷ lệ.',
  },
  {
    id: 'css-aspect-ratio',
    term: 'aspect-ratio: 16 / 9 (Tỷ lệ khung hình)',
    category: 'Responsive',
    meaning: 'Khóa tỷ lệ khung hình cố định (như 16/9, 4/3, 1/1) khi phần tử co giãn',
    syntax: 'aspect-ratio: 16 / 9 | 1 / 1 | 4 / 3;',
    example: {
      kind: 'render',
      code: `<div style="width: 100%; max-width: 240px; aspect-ratio: 16 / 9; background: #1e1b4b; color: white; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif;">
  <span style="font-size: 20px;">▶</span>
  <span style="font-size: 11px; margin-top: 4px; color: #a5b4fc;">aspect-ratio: 16 / 9</span>
</div>`,
      steps: [
        { lines: [1], title: 'aspect-ratio: 16 / 9', text: 'Khung video tự động giữ tỷ lệ chuẩn 16:9 khi bề ngang co giãn.' },
      ],
    },
    tip: 'Ngăn chặn hoàn toàn hiện tượng giật giật giao diện (Cumulative Layout Shift - CLS) khi ảnh đang tải về.',
    consequence: 'Thiếu tỷ lệ khung hình có thể khiến trình duyệt tính chiều cao bằng 0 trước khi ảnh tải xong.',
    analogy: 'Như chuẩn khung hình TV màn hình rộng 16:9 hoặc tỷ lệ ảnh vuông Instagram 1:1.',
  },
];

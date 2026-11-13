import { CheatEntry } from '../types/learning';

export const HTML_CHEAT_ENTRIES: CheatEntry[] = [
  // ================= CẤU TRÚC =================
  {
    id: 'html-doctype',
    term: '<!DOCTYPE html>',
    category: 'Cấu trúc',
    meaning: 'Khai báo chuẩn HTML5 cho trình duyệt',
    syntax: '<!DOCTYPE html>',
    example: {
      kind: 'explain',
      code: `<!DOCTYPE html>
<html lang="vi">
  <head>
    <title>Trang web chuẩn</title>
  </head>
  <body>
    <p>Trang hiển thị ở chế độ chuẩn HTML5.</p>
  </body>
</html>`,
      steps: [
        {
          lines: [1],
          title: 'Khai báo loại tài liệu',
          text: 'Dòng đầu tiên báo cho trình duyệt biết đây là tài liệu HTML5 hiện đại.',
        },
        {
          lines: [2, 3, 4, 5, 6, 7, 8],
          title: 'Kích hoạt Standards Mode',
          text: 'Trình duyệt chuyển sang chế độ kết xuất chuẩn (Standards Mode) thay vì chế độ tương thích cũ.',
        },
      ],
      illustration: {
        type: 'DoctypeCompare',
        data: {},
      },
    },
    tip: 'Luôn đặt ở dòng số 1 của tệp .html, không phân biệt chữ hoa hay chữ thường.',
    consequence:
      'Nếu thiếu DOCTYPE, trình duyệt sẽ chuyển sang Quirks Mode (chế độ tương thích cũ của những năm 1990), khiến kích thước hộp (box-sizing), lề và phông chữ bị lệch hoàn toàn.',
    analogy: 'Như lời chào mở đầu xác nhận "Tôi nói tiếng Việt chuẩn", giúp người nghe hiểu đúng từng câu chữ.',
    mistakes: [
      {
        wrong: '<html>\n  <!DOCTYPE html>',
        right: '<!DOCTYPE html>\n<html>',
        why: '<!DOCTYPE html> bắt buộc phải nằm ở dòng đầu tiên, trước cả thẻ <html>.',
      },
    ],
  },
  {
    id: 'html-html',
    term: '<html lang="...">',
    category: 'Cấu trúc',
    meaning: 'Thẻ gốc bọc toàn bộ trang web và chỉ định ngôn ngữ',
    syntax: '<html lang="vi"> ... </html>',
    example: {
      kind: 'explain',
      code: `<!DOCTYPE html>
<html lang="vi">
  <head>
    <title>Ví dụ thẻ html</title>
  </head>
  <body>
    <h1>Chào mừng bạn!</h1>
  </body>
</html>`,
      steps: [
        {
          lines: [2],
          title: 'Thẻ gốc tài liệu',
          text: 'Là phần tử cha cao nhất (root element), bao bọc toàn bộ cây DOM của trang web.',
        },
        {
          lines: [2],
          title: 'Thuộc tính lang="vi"',
          text: 'Khai báo ngôn ngữ nội dung là tiếng Việt để công cụ tìm kiếm và trình đọc màn hình phát âm chuẩn.',
        },
      ],
      illustration: {
        type: 'DocumentTree',
        data: { highlight: 'html', note: 'Gốc của toàn bộ cây tài liệu' },
      },
    },
    tip: 'Luôn thêm thuộc tính lang (như lang="vi" hoặc lang="en") để hỗ trợ tiếp cận (a11y) và SEO.',
    consequence:
      'Nếu thiếu lang="vi", trình duyệt như Chrome có thể hiện bảng hỏi "Bạn có muốn dịch trang này sang tiếng Việt không?", và máy đọc cho người khiếm thị sẽ phát âm sai ngữ điệu.',
    analogy: 'Như bìa ngoài của cuốn sách, trên gáy ghi rõ "Sách viết bằng tiếng Việt".',
  },
  {
    id: 'html-head',
    term: '<head>',
    category: 'Cấu trúc',
    meaning: 'Phần đầu trang web chứa thông tin cấu hình và tài nguyên',
    syntax: '<head> ... </head>',
    example: {
      kind: 'explain',
      code: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiêu đề trên tab trình duyệt</title>
  <link rel="stylesheet" href="style.css">
</head>`,
      steps: [
        {
          lines: [1, 6],
          title: 'Khu vực hậu trường (Metadata)',
          text: 'Chứa các thông tin máy móc cần đọc trước khi vẽ giao diện cho người xem.',
        },
        {
          lines: [2, 3],
          title: 'Cấu hình hiển thị & bảng mã',
          text: 'Đặt mã hóa UTF-8 để gõ tiếng Việt và viewport để tương thích điện thoại di động.',
        },
        {
          lines: [4, 5],
          title: 'Tiêu đề & liên kết bên ngoài',
          text: 'Cung cấp tên hiển thị trên thanh tab và nạp tệp định dạng CSS bên ngoài.',
        },
      ],
      illustration: {
        type: 'DocumentTree',
        data: { highlight: 'head', note: 'Khu vực hậu trường: Không hiển thị trực tiếp lên trang' },
      },
    },
    tip: 'Các phần tử bên trong <head> không hiển thị trực quan lên màn hình trang web.',
    consequence:
      'Nếu viết các thẻ hiển thị như <h1>, <p> vào trong <head>, trình duyệt sẽ cố gắng tự sửa lỗi và đẩy chúng xuống <body>, gây sai cấu trúc HTML chuẩn.',
    analogy: 'Như hậu trường sân khấu: nơi đạo diễn chuẩn bị âm thanh, ánh sáng trước khi diễn viên bước ra.',
  },
  {
    id: 'html-title',
    term: '<title>',
    category: 'Cấu trúc',
    meaning: 'Tiêu đề trang hiển thị trên tab trình duyệt và kết quả tìm kiếm',
    syntax: '<title>Tên trang web</title>',
    example: {
      kind: 'explain',
      code: `<!DOCTYPE html>
<html lang="vi">
  <head>
    <title>Coderlive - Học Lập Trình Web Trực Quan</title>
  </head>
  <body>
    <p>Nội dung trang web ở đây.</p>
  </body>
</html>`,
      steps: [
        {
          lines: [4],
          title: 'Đặt tên cho cửa sổ / tab',
          text: 'Dòng chữ này xuất hiện trên thanh tiêu đề hoặc tab của trình duyệt, không nằm trên trang trắng.',
        },
        {
          lines: [4],
          title: 'Tiêu đề đánh dấu & SEO',
          text: 'Khi người dùng lưu Bookmark hoặc Google hiển thị kết quả, dòng chữ này sẽ là tiêu đề liên kết màu xanh.',
        },
      ],
      illustration: {
        type: 'BrowserTabMock',
        data: {
          title: 'Coderlive - Học Lập Trình Web Trực Quan',
          showBookmark: true,
          showSerp: true,
          description: 'Học lập trình web với HTML, CSS và JavaScript trực quan, bài học tương tác và thực hành xem trước trực tiếp.',
        },
      },
    },
    tip: 'Nên đặt ngắn gọn dưới 60 ký tự, chứa từ khóa chính và tên thương hiệu.',
    consequence:
      'Nếu thiếu <title>, tab trình duyệt sẽ hiển thị tên tệp thô như "index.html" hoặc địa chỉ IP, và công cụ tìm kiếm Google sẽ đánh giá trang kém uy tín.',
    analogy: 'Như biển tên lớp học gắn trước cửa phòng: người bên ngoài nhìn vào biết ngay phòng nào.',
  },
  {
    id: 'html-meta-charset',
    term: '<meta charset="UTF-8">',
    category: 'Cấu trúc',
    meaning: 'Khai báo bảng mã ký tự Unicode hiển thị tiếng Việt có dấu',
    syntax: '<meta charset="UTF-8">',
    example: {
      kind: 'explain',
      code: `<head>
  <meta charset="UTF-8">
  <title>Trang web tiếng Việt</title>
</head>
<body>
  <h1>Học lập trình web cùng Coderlive!</h1>
</body>`,
      steps: [
        {
          lines: [2],
          title: 'Chỉ định bộ giải mã UTF-8',
          text: 'Báo cho trình duyệt biết cách dịch các byte dữ liệu thành chữ cái tiếng Việt có dấu chính xác.',
        },
        {
          lines: [5],
          title: 'Hiển thị chuẩn xác',
          text: 'Các ký tự dấu tiếng Việt như "ọ", "ề", "ư", "ơ" không bị vỡ hạt hay biến thành ký tự lạ.',
        },
      ],
      illustration: {
        type: 'CharsetCompare',
        data: {},
      },
    },
    tip: 'Luôn đặt <meta charset="UTF-8"> là thẻ đầu tiên ngay sau thẻ mở <head>.',
    consequence:
      'Nếu thiếu, tiếng Việt sẽ bị lỗi font (mojibake) hiển thị thành các ký tự lạ như "TiÃªu Ä‘á»" hoặc hình thoi dấu hỏi đen.',
    analogy: 'Như bộ từ điển phiên dịch: đảm bảo người gửi và người nhận cùng dùng chung một bộ ký tự.',
  },
  {
    id: 'html-meta-viewport',
    term: '<meta name="viewport">',
    category: 'Cấu trúc',
    meaning: 'Tối ưu kích thước hiển thị cho điện thoại và máy tính bảng',
    syntax: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    example: {
      kind: 'explain',
      code: `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <p>Giao diện tự động co giãn vừa vặn màn hình điện thoại di động.</p>
</body>`,
      steps: [
        {
          lines: [2],
          title: 'width=device-width',
          text: 'Yêu cầu chiều rộng khung nhìn bằng đúng chiều rộng màn hình vật lý của thiết bị.',
        },
        {
          lines: [2],
          title: 'initial-scale=1.0',
          text: 'Thiết lập độ thu phóng ban đầu ở mức 100%, không bị thu nhỏ tí hon.',
        },
      ],
      illustration: {
        type: 'PhoneCompare',
        data: {
          withViewport: 'Chữ to rõ ràng, nút bấm vừa ngón tay',
          withoutViewport: 'Giao diện desktop thu nhỏ li ti, phải zoom tay',
        },
      },
    },
    tip: 'Đây là điều kiện bắt buộc số 1 để trang web đạt chuẩn thiết kế đáp ứng (Responsive Web Design).',
    consequence:
      'Nếu thiếu, điện thoại sẽ giả lập màn hình máy tính 980px và thu nhỏ giao diện lại thành li ti, người dùng phải dùng 2 ngón tay phóng to mới đọc được.',
    analogy: 'Như tấm gương soi tự điều chỉnh kích cỡ: đứng gần thì vừa vặn, không bị méo hình.',
  },
  {
    id: 'html-meta-description',
    term: '<meta name="description">',
    category: 'Cấu trúc',
    meaning: 'Mô tả tóm tắt nội dung trang web hiển thị trên kết quả tìm kiếm Google (SERP)',
    syntax: '<meta name="description" content="Tóm tắt nội dung trang...">',
    example: {
      kind: 'explain',
      code: `<head>
  <title>Coderlive - Học Lập Trình Web Trực Quan</title>
  <meta name="description" content="Nền tảng học HTML, CSS, JavaScript trực quan với bài tập tương tác, trình chạy mã tức thì và mẹo lập trình thực chiến.">
</head>`,
      steps: [
        {
          lines: [3],
          title: 'Thuộc tính name="description"',
          text: 'Báo cho bot tìm kiếm (Google, Bing) biết đây là đoạn tóm tắt nội dung chính của trang.',
        },
        {
          lines: [3],
          title: 'Thuộc tính content="..."',
          text: 'Chứa đoạn văn ngắn (120-160 ký tự) sẽ hiển thị làm đoạn trích (snippet) dưới tiêu đề màu xanh trên Google.',
        },
      ],
      illustration: {
        type: 'BrowserTabMock',
        data: {
          title: 'Coderlive - Học Lập Trình Web Trực Quan',
          description: 'Nền tảng học HTML, CSS, JavaScript trực quan với bài tập tương tác, trình chạy mã tức thì và mẹo lập trình thực chiến.',
          showSerp: true,
          showBookmark: false,
        },
      },
    },
    tip: 'Độ dài lý tưởng từ 120 đến 158 ký tự. Đặt từ khóa chính tự nhiên và có lời kêu gọi hành động.',
    consequence:
      'Nếu thiếu thẻ này, Google sẽ tự động nhặt một đoạn văn bản ngẫu nhiên bất kỳ trên trang làm đoạn trích tìm kiếm, khiến tỷ lệ nhấp chuột (CTR) giảm mạnh.',
    analogy: 'Như lời giới thiệu ngắn in ở bìa sau của cuốn sách: giúp người đọc quyết định có nên mở sách ra đọc hay không.',
  },
  {
    id: 'html-base',
    term: '<base>',
    category: 'Cấu trúc',
    meaning: 'Quy định URL gốc cơ sở và đích mở mặc định cho tất cả liên kết tương đối trong trang',
    syntax: '<base href="https://example.com/assets/" target="_blank">',
    example: {
      kind: 'explain',
      code: `<head>
  <!-- URL cơ sở cho tất cả đường dẫn tương đối -->
  <base href="https://cdn.example.com/images/" target="_blank">
</head>
<body>
  <!-- Trình duyệt sẽ tự động tải từ: https://cdn.example.com/images/logo.png -->
  <img src="logo.png" alt="Logo">
  <!-- Khi bấm sẽ mở link ở tab mới theo target="_blank" của base -->
  <a href="gioi-thieu.html">Giới thiệu</a>
</body>`,
      steps: [
        {
          lines: [3],
          title: 'Thiết lập URL gốc href',
          text: 'Mọi đường dẫn tương đối trong trang (ảnh, file css, link) đều được tự động ghép nối vào sau tiền tố này.',
        },
        {
          lines: [3],
          title: 'Thiết lập target mặc định',
          text: 'Các thẻ <a> nếu không chỉ định target riêng sẽ tuân theo target="_blank" của thẻ <base>.',
        },
        {
          lines: [7, 9],
          title: 'Độ phân giải URL tự động',
          text: 'Trình duyệt chuyển src="logo.png" thành https://cdn.example.com/images/logo.png trước khi gửi yêu cầu tải.',
        },
      ],
      illustration: {
        type: 'LinkDiagram',
        data: {
          title: 'Phân giải đường dẫn với <base href="...">',
        },
      },
    },
    tip: 'Chỉ được có tối đa một phần tử <base> duy nhất trong tài liệu và bắt buộc phải nằm trong phần tử <head>.',
    consequence:
      'Nếu cấu hình sai href trong <base>, toàn bộ hình ảnh, script, stylesheet có đường dẫn tương đối trên trang web sẽ bị lỗi 404 Not Found!',
    analogy: 'Như mã vùng điện thoại: khi bạn quay số nội hạt, tổng đài tự động ghép thêm mã vùng phía trước.',
  },
  {
    id: 'html-noscript',
    term: '<noscript>',
    category: 'Cấu trúc',
    meaning: 'Nội dung thay thế hiển thị cho người dùng khi trình duyệt tắt hoặc không hỗ trợ JavaScript',
    syntax: '<noscript> <p>Vui lòng bật JavaScript...</p> </noscript>',
    example: {
      kind: 'explain',
      code: `<noscript>
  <div style="background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; padding: 12px; border-radius: 6px;">
    <strong>Cảnh báo:</strong> Trình duyệt của bạn đã tắt JavaScript. Một số tính năng tương tác của Coderlive có thể không hoạt động bình thường!
  </div>
</noscript>
<p>Nội dung chính của trang web vẫn hiển thị bình thường.</p>`,
      steps: [
        {
          lines: [1, 5],
          title: 'Kiểm tra trạng thái JavaScript',
          text: 'Nếu JavaScript đang được bật (mặc định của hầu hết trình duyệt), toàn bộ khối <noscript> sẽ bị ẩn hoàn toàn.',
        },
        {
          lines: [2, 3, 4],
          title: 'Kích hoạt phương án dự phòng (Fallback)',
          text: 'Chỉ khi người dùng tắt JavaScript trong phần cài đặt hoặc dùng trình duyệt chỉ đọc, khối cảnh báo này mới xuất hiện.',
        },
      ],
      illustration: {
        type: 'CommentCompare',
        data: {},
      },
    },
    tip: 'Có thể đặt trong <head> (chỉ chứa link, style, meta) hoặc trong <body> (chứa nội dung HTML bất kỳ).',
    consequence:
      'Với các ứng dụng Single Page App (React, Vue), nếu thiếu <noscript>, người dùng tắt JS chỉ nhìn thấy một màn hình trắng trơn mà không biết lý do tại sao.',
    analogy: 'Như lối thoát hiểm dự phòng: bình thường cửa đóng không ai để ý, nhưng khi có sự cố thì mọi người đều dùng được.',
  },
  {
    id: 'html-comment',
    term: '<!-- ... -->',
    category: 'Cấu trúc',
    meaning: 'Ghi chú cho lập trình viên, trình duyệt sẽ bỏ qua không hiển thị',
    syntax: '<!-- Nội dung ghi chú ở đây -->',
    example: {
      kind: 'explain',
      code: `<!-- Đây là phần đầu trang web -->
<h1>Tiêu đề bài viết</h1>

<!-- <p>Đoạn này tạm thời bị ẩn đi để sửa lại sau.</p> -->
<p>Nội dung chính thức đang hiển thị cho người đọc.</p>`,
      steps: [
        {
          lines: [1, 4],
          title: 'Trình duyệt đọc và bỏ qua',
          text: 'Mọi ký tự nằm giữa <!-- và --> đều không xuất hiện trên giao diện trang web.',
        },
        {
          lines: [2, 5],
          title: 'Chỉ hiển thị mã thực tế',
          text: 'Người xem trang chỉ thấy thẻ <h1> và <p> chính thức.',
        },
      ],
      illustration: {
        type: 'CommentCompare',
        data: {},
      },
    },
    tip: 'Phím tắt nhanh trong hầu hết trình soạn thảo: nhấn Ctrl + / (hoặc Cmd + /).',
    consequence:
      'Nếu quên đóng thẻ chú thích (thiếu dấu -->), toàn bộ mã nguồn phía sau sẽ bị biến thành ghi chú và biến mất khỏi trang web!',
    analogy: 'Như bút ghi chú bằng mực tàng hình: người soạn kịch bản thấy, khán giả xem kịch không thấy.',
  },
  {
    id: 'html-link',
    term: '<link>',
    category: 'Cấu trúc',
    meaning: 'Liên kết tệp CSS bên ngoài hoặc biểu tượng Favicon',
    syntax: '<link rel="stylesheet" href="style.css">',
    example: {
      kind: 'explain',
      code: `<head>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>
  <h1>Trang được định dạng bởi CSS bên ngoài</h1>
</body>`,
      steps: [
        {
          lines: [2],
          title: 'Tải tệp CSS',
          text: 'Trình duyệt gửi yêu cầu tải tệp style.css và áp dụng các quy tắc màu sắc, phông chữ.',
        },
        {
          lines: [3],
          title: 'Nạp biểu tượng Favicon',
          text: 'Đặt logo nhỏ bên cạnh tiêu đề trang trên tab của trình duyệt.',
        },
      ],
      illustration: {
        type: 'LinkDiagram',
        data: {},
      },
    },
    tip: 'Là thẻ tự đóng (không có thẻ đóng </link>), luôn đặt bên trong phần tử <head>.',
    consequence:
      'Nếu đường dẫn href bị sai (ví dụ sai chính tả tên file), trang web sẽ mất toàn bộ màu sắc bố cục và quay về chữ đen nền trắng thô sơ.',
    analogy: 'Như đường dây cáp nối từ phòng điều khiển vào sân khấu: truyền âm thanh ánh sáng vào.',
  },
  {
    id: 'html-style',
    term: '<style>',
    category: 'Cấu trúc',
    meaning: 'Viết mã CSS nội bộ trực tiếp bên trong tài liệu HTML',
    syntax: '<style> bộ-chọn { thuộc-tính: giá-trị; } </style>',
    example: {
      kind: 'mixed',
      code: `<style>
  .hop-thong-bao {
    background: #ecfdf5;
    border: 2px solid #10b981;
    color: #065f46;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: 600;
  }
</style>

<div class="hop-thong-bao">
  ✓ Đăng ký thành công! Chào mừng bạn đến với Coderlive.
</div>`,
      steps: [
        {
          lines: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          title: 'Khai báo luật tạo kiểu CSS',
          text: 'Định nghĩa class .hop-thong-bao với màu nền xanh lá, viền bo tròn và chữ đậm.',
        },
        {
          lines: [11, 12, 13],
          title: 'Áp dụng vào thẻ HTML',
          text: 'Thẻ <div> có class tương ứng sẽ nhận toàn bộ giao diện đã thiết lập.',
        },
      ],
    },
    tip: 'Tiện lợi khi muốn thử nghiệm nhanh hoặc viết kiểu riêng biệt cho một trang duy nhất.',
    consequence:
      'Nếu viết CSS quá nhiều trong thẻ <style> thay vì tách thành tệp .css riêng, bạn sẽ không thể tái sử dụng kiểu đó cho các trang khác của website.',
    analogy: 'Như sơn vẽ trực tiếp lên một bức tường trong nhà thay vì dán tấm giấy dán tường có thể gỡ ra.',
  },
  {
    id: 'html-script',
    term: '<script>',
    category: 'Cấu trúc',
    meaning: 'Nhúng hoặc liên kết mã lập trình JavaScript tương tác',
    syntax: '<script> // Mã JS </script> hoặc <script src="app.js"></script>',
    example: {
      kind: 'mixed',
      code: `<button id="btn-chao" style="padding: 8px 16px; cursor: pointer;">
  Bấm vào tôi
</button>

<p id="loi-chao" style="color: #6366f1; font-weight: bold;"></p>

<script>
  const nut = document.getElementById('btn-chao');
  const loiChao = document.getElementById('loi-chao');
  nut.addEventListener('click', () => {
    loiChao.textContent = 'Xin chào bạn! JavaScript đã phản hồi.';
  });
</script>`,
      steps: [
        {
          lines: [1, 2, 3, 5],
          title: 'Tạo phần tử HTML',
          text: 'Tạo nút bấm và đoạn văn để làm đích tương tác.',
        },
        {
          lines: [7, 8, 9, 10, 11, 12, 13],
          title: 'Thực thi mã JavaScript',
          text: 'Trình duyệt lắng nghe sự kiện nhấp chuột và thay đổi nội dung thẻ <p> ngay lập tức.',
        },
      ],
      illustration: {
        type: 'Timeline',
        data: { title: 'Thứ tự tải và thực thi thẻ <script>' },
      },
    },
    tip: 'Thường đặt thẻ <script> ở cuối thẻ <body> trước </body> để trang web tải xong giao diện trước rồi mới chạy script.',
    consequence:
      'Nếu đặt script ở đầu trang mà không dùng defer hoặc async, script sẽ chặn quá trình tải trang (render-blocking), làm trang web bị đơ trong giây lát.',
    analogy: 'Như gắn bộ động cơ điện vào cỗ xe: làm cho các bánh răng bắt đầu chuyển động khi nhấn nút.',
  },
  {
    id: 'html-body',
    term: '<body>',
    category: 'Cấu trúc',
    meaning: 'Thân trang web chứa toàn bộ nội dung mà người xem nhìn thấy',
    syntax: '<body> ... </body>',
    example: {
      kind: 'render',
      code: `<body>
  <h1>Tiêu đề trang</h1>
  <p>Đây là nội dung thực tế hiển thị trên cửa sổ trình duyệt.</p>
  <button style="padding: 6px 14px; background: #6366f1; color: white; border: none; border-radius: 6px;">
    Khám phá ngay
  </button>
</body>`,
      steps: [
        {
          lines: [1, 7],
          title: 'Khung chứa trực quan',
          text: 'Bao trọn sân khấu chính của trang web.',
        },
        {
          lines: [2, 3, 4, 5, 6],
          title: 'Vẽ các phần tử',
          text: 'Văn bản, hình ảnh, nút bấm bên trong <body> đều được hiển thị trực tiếp cho người dùng.',
        },
      ],
    },
    tip: 'Một tài liệu HTML chỉ có duy nhất một thẻ <body>.',
    consequence: 'Bất kỳ nội dung văn bản nào nằm ngoài thẻ <body> đều không hợp lệ theo chuẩn W3C.',
    analogy: 'Như sân khấu biểu diễn: tất cả diễn viên, đạo cụ, hoạt cảnh đều nằm ở đây cho khán giả xem.',
  },

  // ================= VĂN BẢN =================
  {
    id: 'html-headings',
    term: '<h1> - <h6>',
    category: 'Văn bản',
    meaning: 'Tiêu đề cấp bậc từ quan trọng nhất (h1) đến nhỏ nhất (h6)',
    syntax: '<h1>Tiêu đề</h1>',
    example: {
      kind: 'render',
      code: `<h1>Tiêu đề cấp 1 (Lớn nhất)</h1>
<h2>Tiêu đề cấp 2 (Mục lớn)</h2>
<h3>Tiêu đề cấp 3 (Mục con)</h3>
<h4>Tiêu đề cấp 4</h4>
<h5>Tiêu đề cấp 5</h5>
<h6>Tiêu đề cấp 6 (Nhỏ nhất)</h6>`,
      steps: [
        {
          lines: [1],
          title: '<h1> - Tiêu đề chính',
          text: 'Có kích thước lớn nhất và mức độ ưu tiên SEO cao nhất trên trang.',
        },
        {
          lines: [2, 3, 4, 5, 6],
          title: '<h2> đến <h6>',
          text: 'Giảm dần kích cỡ để tạo cấu trúc mục lục rõ ràng cho bài viết.',
        },
      ],
    },
    tip: 'Mỗi trang web chỉ nên có duy nhất 1 thẻ <h1> đại diện cho chủ đề chính.',
    consequence: 'Nếu dùng nhiều thẻ <h1> bừa bãi hoặc nhảy cóc từ <h1> xuống <h4>, bot tìm kiếm sẽ khó hiểu thứ bậc nội dung.',
    analogy: 'Như bìa sách (h1), tên chương (h2), tên mục (h3) và tiểu mục (h4).',
  },
  {
    id: 'html-p',
    term: '<p>',
    category: 'Văn bản',
    meaning: 'Đoạn văn bản thông thường (Paragraph)',
    syntax: '<p>Nội dung đoạn văn</p>',
    example: {
      kind: 'render',
      code: `<p>HTML là ngôn ngữ đánh dấu siêu văn bản, được dùng để xây dựng khung xương cho các trang web.</p>
<p>Mỗi thẻ &lt;p&gt; tự động tạo một khoảng cách dòng phía trên và phía dưới để phân tách nội dung.</p>`,
      steps: [
        {
          lines: [1],
          title: 'Đoạn văn bản thứ nhất',
          text: 'Trình duyệt hiển thị khối chữ và tự động xuống dòng khi chạm mép phải.',
        },
        {
          lines: [2],
          title: 'Đoạn văn bản thứ hai',
          text: 'Tự động cách một khoảng lề trên/dưới để bài viết thông thoáng, dễ đọc.',
        },
      ],
    },
    tip: 'Không lồng thẻ <p> bên trong thẻ <p> khác.',
    consequence: 'Nếu không dùng <p> mà chỉ gõ chữ trần vào trang, chữ sẽ dính chùm vào nhau rất khó đọc.',
    analogy: 'Như một đoạn văn trong bài báo hay trang sách.',
  },
  {
    id: 'html-formatting',
    term: '<strong> & <em>',
    category: 'Văn bản',
    meaning: 'In đậm nhấn mạnh ý nghĩa & in nghiêng biểu thị ngữ điệu',
    syntax: '<strong>Chữ đậm</strong> <em>Chữ nghiêng</em>',
    example: {
      kind: 'render',
      code: `<p>Mật khẩu của bạn là thông tin <strong>tuyệt đối bảo mật</strong>.</p>
<p>Từ <em>"framework"</em> là một thuật ngữ tiếng Anh thông dụng trong công nghệ.</p>`,
      steps: [
        {
          lines: [1],
          title: '<strong> - Quan trọng',
          text: 'Làm chữ in đậm và báo cho công cụ tìm kiếm/trình đọc màn hình đây là thông tin cần chú ý đặc biệt.',
        },
        {
          lines: [2],
          title: '<em> - Nhấn mạnh ngữ điệu',
          text: 'Làm chữ in nghiêng để biểu thị cách phát âm hoặc thuật ngữ chuyên biệt.',
        },
      ],
    },
    tip: 'Dùng <strong> thay cho <b> và <em> thay cho <i> vì chúng mang ý nghĩa ngữ nghĩa (semantic).',
    consequence: 'Dùng thẻ <b> chỉ làm đậm hình thức chứ không báo cho người khiếm thị biết đây là từ then chốt.',
    analogy: 'Như giọng nói nhấn mạnh trong buổi diễn thuyết: <strong> nói to dõng dạc, <em> nói nhẹ nhàng nhấn nhá.',
  },
  {
    id: 'html-sub-sup',
    term: '<sub> & <sup>',
    category: 'Văn bản',
    meaning: 'Chỉ số dưới (hóa học) & chỉ số trên (toán học / lũy thừa)',
    syntax: 'H<sub>2</sub>O & x<sup>2</sup>',
    example: {
      kind: 'render',
      code: `<p>Công thức hóa học của nước: <strong>H<sub>2</sub>O</strong></p>
<p>Định lý Pythagoras: <strong>a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup></strong></p>
<p>Nhiệt độ ngoài trời hôm nay là <strong>32<sup>o</sup>C</strong>.</p>`,
      steps: [
        {
          lines: [1],
          title: '<sub> - Chỉ số dưới',
          text: 'Hạ thấp vị trí chữ số và thu nhỏ cỡ chữ để viết công thức hóa học.',
        },
        {
          lines: [2, 3],
          title: '<sup> - Chỉ số trên',
          text: 'Nâng cao vị trí chữ số để biểu thị số mũ toán học hoặc độ C.',
        },
      ],
    },
    tip: 'Rất hữu ích cho các bài viết khoa học, công thức nấu ăn hoặc ký hiệu bản quyền &reg;.',
    consequence: 'Nếu không dùng sub/sup, công thức H2O hoặc a2 + b2 sẽ dễ bị hiểu nhầm thành phép nhân H nhân 2 nhân O.',
    analogy: 'Như nốt trầm (sub) và nốt bổng (sup) trên khuông nhạc.',
  },
  {
    id: 'html-break-hr',
    term: '<br> & <hr>',
    category: 'Văn bản',
    meaning: 'Xuống dòng thủ công & đường kẻ phân cách ngang',
    syntax: '<br> và <hr>',
    example: {
      kind: 'render',
      code: `<p>Dòng thứ nhất của bài thơ<br>Dòng thứ hai liền kề sau ngắt dòng</p>
<hr style="border: 0; border-top: 2px dashed #94a3b8; margin: 16px 0;">
<p>Phần nội dung mới sau vạch ngăn cách.</p>`,
      steps: [
        {
          lines: [1],
          title: '<br> - Ngắt dòng',
          text: 'Xuống dòng ngay tại chỗ mà không tạo khoảng cách đoạn văn mới.',
        },
        {
          lines: [2],
          title: '<hr> - Vạch phân cách',
          text: 'Vẽ đường kẻ ngang đánh dấu sự chuyển đổi chủ đề trong bài viết.',
        },
      ],
    },
    tip: 'Cả hai thẻ này đều là thẻ tự đóng (không cần thẻ đóng </br> hay </hr>).',
    consequence: 'Không nên lạm dụng nhiều thẻ <br> liên tiếp để tạo khoảng cách; hãy dùng thuộc tính margin của CSS để điều chỉnh khoảng cách chuẩn.',
    analogy: '<br> như phím Shift+Enter khi gõ văn bản; <hr> như vạch kẻ ngang chia bài trên vở học sinh.',
  },

  // ================= LIÊN KẾT & MEDIA =================
  {
    id: 'html-a',
    term: '<a>',
    category: 'Liên kết & Media',
    meaning: 'Tạo siêu liên kết chuyển hướng sang trang khác hoặc phần tử khác',
    syntax: '<a href="URL" target="_blank">Văn bản liên kết</a>',
    example: {
      kind: 'mixed',
      code: `<p>
  Xem tài liệu chính thức tại:
  <a href="https://developer.mozilla.org" target="_blank" style="color: #6366f1; font-weight: bold; text-decoration: underline;">
    Trang Mozilla MDN Web Docs ↗
  </a>
</p>
<p>
  Liên kết nội bộ trang:
  <a href="#phan-cuoi" style="color: #059669; font-weight: 500;">
    Cuộn xuống phần cuối trang ↓
  </a>
</p>`,
      steps: [
        {
          lines: [3, 4, 5],
          title: 'href="URL"',
          text: 'Địa chỉ đích mà trình duyệt sẽ mở khi người dùng nhấp chuột.',
        },
        {
          lines: [3],
          title: 'target="_blank"',
          text: 'Mở liên kết trong một tab mới thay vì tải đè lên trang hiện tại.',
        },
      ],
    },
    tip: 'Khi dùng target="_blank", hãy thêm rel="noopener noreferrer" để bảo vệ bảo mật cho trang web.',
    consequence: 'Nếu thiếu thuộc tính href (chỉ viết <a>Liên kết</a>), trình duyệt sẽ coi đây là văn bản thường và không cho phép bấm chuyển trang.',
    analogy: 'Như cánh cửa thần kỳ Doraemon: bước qua là sang ngay một thế giới mới.',
  },
  {
    id: 'html-img',
    term: '<img>',
    category: 'Liên kết & Media',
    meaning: 'Chèn hình ảnh trực quan vào trang web',
    syntax: '<img src="URL" alt="Mô tả ảnh" width="300">',
    example: {
      kind: 'render',
      code: `<div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px;">
  <img 
    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='120' viewBox='0 0 280 120'%3E%3Crect width='280' height='120' fill='%236366f1' rx='12'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='16'%3ECoderlive Image Example%3C/text%3E%3C/svg%3E" 
    alt="Ảnh minh họa Coderlive với biểu tượng chuẩn" 
    width="280"
    style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
  />
  <p style="font-size: 12px; color: #64748b; margin-top: 6px;">Hình ảnh SVG mẫu nhúng an toàn, sắc nét</p>
</div>`,
      steps: [
        {
          lines: [2, 3],
          title: 'src (Source)',
          text: 'Đường dẫn đến tệp ảnh (URL online hoặc đường dẫn tệp nội bộ).',
        },
        {
          lines: [4],
          title: 'alt (Alternative Text)',
          text: 'Văn bản thay thế hiển thị khi mạng chậm, đồng thời cho công cụ tìm kiếm và máy đọc màn hình đọc được ảnh.',
        },
      ],
    },
    tip: 'Luôn khai báo thuộc tính alt cho mọi bức ảnh để cải thiện điểm số SEO và hỗ trợ người khiếm thị.',
    consequence: 'Nếu đường dẫn src bị hỏng và không có alt, người dùng sẽ chỉ thấy biểu tượng ảnh vỡ vuông vắn trống trơn.',
    analogy: 'Như bức tranh treo tường: có bức tranh (src) kèm chú thích bên dưới bảng tên (alt).',
  },
  {
    id: 'html-iframe',
    term: '<iframe>',
    category: 'Liên kết & Media',
    meaning: 'Nhúng một trang web, bản đồ hoặc video YouTube vào trang hiện tại',
    syntax: '<iframe src="URL" width="100%" height="300"></iframe>',
    example: {
      kind: 'mixed',
      code: `<div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
  <div style="background: #e2e8f0; padding: 6px 12px; font-size: 11px; font-weight: bold; color: #475569;">
    Khung nhúng trực tiếp an toàn
  </div>
  <iframe 
    srcdoc="<h3 style='color:#6366f1;font-family:sans-serif;'>Nội dung trang nhúng bên trong iframe</h3><p style='color:#334155;font-family:sans-serif;'>Hoàn toàn độc lập với trang chính.</p>" 
    width="100%" 
    height="120"
    style="border: none; background: white;"
  ></iframe>
</div>`,
      steps: [
        {
          lines: [5, 6, 7, 8, 9, 10],
          title: 'Khung tài liệu độc lập',
          text: 'Tạo một môi trường sandbox độc lập bên trong trang web chính.',
        },
      ],
    },
    tip: 'Luôn thêm thuộc tính loading="lazy" và sandbox để tối ưu tốc độ và an toàn bảo mật.',
    consequence: 'Một số trang web lớn (như Facebook hay Google) chặn nhúng qua iframe bằng tiêu đề X-Frame-Options để chống tấn công clickjacking.',
    analogy: 'Như một ô cửa sổ nhìn sang căn phòng của ngôi nhà hàng xóm.',
  },

  // ================= DANH SÁCH & BẢNG =================
  {
    id: 'html-lists',
    term: '<ul> & <ol> & <li>',
    category: 'Danh sách & Bảng',
    meaning: 'Danh sách không thứ tự (dấu chấm) & có thứ tự (đánh số 1, 2, 3)',
    syntax: '<ul><li>Mục</li></ul> và <ol><li>Bước</li></ol>',
    example: {
      kind: 'render',
      code: `<div style="display: flex; gap: 32px;">
  <div>
    <strong>Danh sách dấu chấm (&lt;ul&gt;):</strong>
    <ul style="margin-top: 8px; padding-left: 20px;">
      <li>Quả cam</li>
      <li>Quả chuối</li>
      <li>Quả dưa hấu</li>
    </ul>
  </div>
  <div>
    <strong>Danh sách đánh số (&lt;ol&gt;):</strong>
    <ol style="margin-top: 8px; padding-left: 20px;">
      <li>Sơ chế nguyên liệu</li>
      <li>Bật bếp nấu</li>
      <li>Thưởng thức món ăn</li>
    </ol>
  </div>
</div>`,
      steps: [
        {
          lines: [3, 4, 5, 6, 7],
          title: '<ul> (Unordered List)',
          text: 'Tạo danh sách các mục có vai trò ngang hàng, phân tách bằng dấu chấm tròn.',
        },
        {
          lines: [10, 11, 12, 13, 14],
          title: '<ol> (Ordered List)',
          text: 'Tự động đánh số thứ tự 1, 2, 3... cho các bước cần tuân theo trình tự.',
        },
      ],
    },
    tip: 'Bên trong thẻ <ul> hoặc <ol> chỉ được phép chứa trực tiếp các thẻ con <li>.',
    consequence: 'Nếu đặt trực tiếp thẻ <div> hoặc <p> bên trong <ul> mà không bọc trong <li>, cấu trúc HTML sẽ bị lỗi chuẩn ngữ nghĩa.',
    analogy: '<ul> như danh sách mua sắm ngoài chợ; <ol> như hướng dẫn từng bước nấu một bữa ăn.',
  },
  {
    id: 'html-table',
    term: '<table>',
    category: 'Danh sách & Bảng',
    meaning: 'Bảng dữ liệu có dòng (tr), cột tiêu đề (th) và ô dữ liệu (td)',
    syntax: '<table><tr><th>Tiêu đề</th></tr><tr><td>Dữ liệu</td></tr></table>',
    example: {
      kind: 'render',
      code: `<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px;">
  <thead>
    <tr style="background: #f1f5f9; text-align: left;">
      <th style="padding: 8px 12px; border: 1px solid #cbd5e1;">Mã môn</th>
      <th style="padding: 8px 12px; border: 1px solid #cbd5e1;">Tên khóa học</th>
      <th style="padding: 8px 12px; border: 1px solid #cbd5e1;">Trạng thái</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">HTML101</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">HTML Cơ Bản</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981;">Đang mở</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">JS102</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">JavaScript Cơ Bản</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; color: #10b981;">Đang mở</td>
    </tr>
  </tbody>
</table>`,
      steps: [
        {
          lines: [1, 21],
          title: '<table> bọc toàn bộ',
          text: 'Khung chứa bảng tổng thể.',
        },
        {
          lines: [3, 4, 5, 6, 7],
          title: '<tr> và <th>',
          text: '<tr> đại diện cho 1 dòng (Table Row), <th> là ô tiêu đề chữ in đậm (Table Header).',
        },
        {
          lines: [10, 11, 12, 13, 14],
          title: '<td> (Table Data)',
          text: 'Ô chứa nội dung dữ liệu thông thường.',
        },
      ],
    },
    tip: 'Luôn kết hợp CSS border-collapse: collapse để các đường viền ô không bị tách đôi thành 2 nét.',
    consequence: 'Chỉ dùng bảng cho dữ liệu dạng lưới (thống kê, bảng giá), không dùng thẻ <table> để dựng bố cục giao diện tổng thể của trang web.',
    analogy: 'Như một trang bảng tính Excel thu nhỏ hiển thị trên web.',
  },

  // ================= BIỂU MẪU (FORMS) =================
  {
    id: 'html-form',
    term: '<form>',
    category: 'Biểu mẫu',
    meaning: 'Biểu mẫu thu thập thông tin và gửi lên máy chủ',
    syntax: '<form action="/api" method="POST"> ... </form>',
    example: {
      kind: 'mixed',
      code: `<form style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 360px;" onsubmit="alert('Đã gửi form!'); return false;">
  <label style="display: block; font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #334155;">
    Họ và tên:
  </label>
  <input type="text" placeholder="Nguyễn Văn A" required style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; margin-bottom: 12px; box-sizing: border-box;" />

  <label style="display: block; font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #334155;">
    Địa chỉ Email:
  </label>
  <input type="email" placeholder="email@vi-du.com" required style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; margin-bottom: 16px; box-sizing: border-box;" />

  <button type="submit" style="width: 100%; padding: 10px; background: #6366f1; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
    Gửi thông tin
  </button>
</form>`,
      steps: [
        {
          lines: [1, 16],
          title: 'Khung thu thập dữ liệu',
          text: 'Gom toàn bộ các ô nhập liệu vào một nhóm để gửi đi cùng lúc khi nhấn nút Submit.',
        },
        {
          lines: [4, 5, 9, 10],
          title: 'Ô nhập liệu & nhãn',
          text: 'Người dùng điền văn bản và địa chỉ email.',
        },
        {
          lines: [13, 14, 15],
          title: 'Nút Submit',
          text: 'Kích hoạt hành động gửi dữ liệu của biểu mẫu.',
        },
      ],
    },
    tip: 'Luôn cung cấp thuộc tính name cho từng ô input để máy chủ phân biệt được đâu là email, đâu là tên.',
    consequence: 'Nếu các thẻ <input> nằm bên ngoài thẻ <form>, người dùng nhấn phím Enter sẽ không thể kích hoạt hành động gửi dữ liệu tự động.',
    analogy: 'Như tờ phiếu khai thông tin đăng ký: điền xong nộp lại cho quầy tiếp nhận.',
  },
  {
    id: 'html-input',
    term: '<input>',
    category: 'Biểu mẫu',
    meaning: 'Ô nhập liệu đa năng (văn bản, mật khẩu, checkbox, radio, màu...)',
    syntax: '<input type="text|password|email|checkbox|radio">',
    example: {
      kind: 'render',
      code: `<div style="display: flex; flex-direction: column; gap: 10px; font-family: sans-serif; font-size: 13px;">
  <div>
    <span style="font-size: 12px; color: #64748b;">type="text":</span><br>
    <input type="text" placeholder="Nhập tên đăng nhập" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px;" />
  </div>
  <div>
    <span style="font-size: 12px; color: #64748b;">type="password":</span><br>
    <input type="password" value="matkhau123" style="padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px;" />
  </div>
  <div style="display: flex; align-items: center; gap: 8px;">
    <input type="checkbox" id="ck" checked style="cursor: pointer;" />
    <label for="ck" style="cursor: pointer;">Ghi nhớ đăng nhập</label>
  </div>
</div>`,
      steps: [
        {
          lines: [3, 4],
          title: 'type="text"',
          text: 'Ô nhập chữ bình thường.',
        },
        {
          lines: [7, 8],
          title: 'type="password"',
          text: 'Ký tự tự động chuyển thành dấu chấm tròn đen để giấu mật khẩu.',
        },
        {
          lines: [11, 12],
          title: 'type="checkbox"',
          text: 'Hộp kiểm cho phép người dùng bật/tắt lựa chọn.',
        },
      ],
    },
    tip: '<input> là thẻ tự đóng. Thuộc tính type quyết định hoàn toàn giao diện và hành vi của ô nhập.',
    consequence: 'Nếu quên đặt type="password", mật khẩu của người dùng sẽ hiển thị trần trụi ra màn hình.',
    analogy: 'Như một chiếc tắc kè hoa: đổi màu và hình dạng tùy thuộc vào thuộc tính type được gán.',
  },
  {
    id: 'html-select-textarea',
    term: '<select> & <textarea>',
    category: 'Biểu mẫu',
    meaning: 'Hộp chọn danh sách thả xuống & ô nhập văn bản nhiều dòng',
    syntax: '<select><option>...</option></select> & <textarea></textarea>',
    example: {
      kind: 'render',
      code: `<div style="display: flex; flex-direction: column; gap: 12px; font-family: sans-serif;">
  <div>
    <label style="font-size: 12px; font-weight: bold; color: #334155; display: block; margin-bottom: 4px;">
      Chọn thành phố:
    </label>
    <select style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px;">
      <option value="hn">Hà Nội</option>
      <option value="hcm" selected>TP. Hồ Chí Minh</option>
      <option value="dn">Đà Nẵng</option>
    </select>
  </div>

  <div>
    <label style="font-size: 12px; font-weight: bold; color: #334155; display: block; margin-bottom: 4px;">
      Góp ý chi tiết:
    </label>
    <textarea rows="3" placeholder="Nhập suy nghĩ của bạn..." style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;"></textarea>
  </div>
</div>`,
      steps: [
        {
          lines: [5, 6, 7, 8, 9],
          title: '<select> và <option>',
          text: 'Tạo menu thả xuống sổ ra danh sách tùy chọn cho người dùng chọn một mục duy nhất.',
        },
        {
          lines: [15, 16],
          title: '<textarea>',
          text: 'Ô nhập văn bản nhiều dòng có thể kéo giãn chiều cao, phù hợp cho bình luận hoặc bài viết dài.',
        },
      ],
    },
    tip: '<textarea> là thẻ có đóng </textarea>, bất kỳ nội dung nào đặt giữa thẻ mở và thẻ đóng sẽ là giá trị văn bản ban đầu.',
    consequence: 'Không được dùng <input type="textarea"> vì HTML không có type này; bắt buộc phải dùng thẻ riêng <textarea>.',
    analogy: '<select> như cuốn menu món ăn; <textarea> như trang giấy trắng để viết tâm thư.',
  },

  // ================= NGỮ NGHĨA (SEMANTICS) =================
  {
    id: 'html-semantics-layout',
    term: '<header>, <nav>, <main>, <footer>',
    category: 'Ngữ nghĩa',
    meaning: 'Các thẻ cấu trúc bố cục trang web theo ngữ nghĩa chuẩn',
    syntax: '<header> ... </header> <nav> ... </nav> <main> ... </main> <footer> ... </footer>',
    example: {
      kind: 'mixed',
      code: `<div style="border: 1px solid #cbd5e1; border-radius: 8px; font-family: sans-serif; overflow: hidden;">
  <header style="background: #4f46e5; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
    <strong>Logo Website</strong>
    <nav style="display: flex; gap: 12px; font-size: 12px;">
      <span style="opacity: 0.9; cursor: pointer;">Trang chủ</span>
      <span style="opacity: 0.9; cursor: pointer;">Bài viết</span>
      <span style="opacity: 0.9; cursor: pointer;">Liên hệ</span>
    </nav>
  </header>
  <main style="padding: 16px; background: white;">
    <h3 style="margin-top: 0; color: #1e293b;">Nội dung cốt lõi của trang</h3>
    <p style="color: #64748b; font-size: 13px; margin: 0;">Khu vực đặt nội dung duy nhất của trang này.</p>
  </main>
  <footer style="background: #f1f5f9; padding: 10px 16px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
    © 2026 Bản quyền thuộc về Coderlive
  </footer>
</div>`,
      steps: [
        {
          lines: [2, 9],
          title: '<header> và <nav>',
          text: 'Chứa logo thương hiệu và thanh liên kết điều hướng toàn trang.',
        },
        {
          lines: [10, 13],
          title: '<main>',
          text: 'Khu vực chứa nội dung trung tâm duy nhất của trang (mỗi trang chỉ có 1 thẻ <main>).',
        },
        {
          lines: [14, 16],
          title: '<footer>',
          text: 'Chân trang chứa bản quyền, thông tin liên hệ và liên kết phụ.',
        },
      ],
    },
    tip: 'Ưu tiên các thẻ ngữ nghĩa này thay cho <div class="header"> hay <div class="footer"> để hỗ trợ đọc màn hình và SEO tối đa.',
    consequence: 'Dùng toàn bộ thẻ <div> cho mọi khối (Div Soup) khiến bộ máy tìm kiếm không phân biệt được đâu là nội dung chính, đâu là chân trang.',
    analogy: 'Như cấu tạo một bức thư: đầu thư (header), thân thư (main), và chữ ký tái bút ở cuối (footer).',
  },
  {
    id: 'html-div-span',
    term: '<div> & <span>',
    category: 'Ngữ nghĩa',
    meaning: 'Khối hộp chứa đa năng (div - Block) & vùng văn bản nội dòng (span - Inline)',
    syntax: '<div class="box"> ... </div> & <span> ... </span>',
    example: {
      kind: 'render',
      code: `<div style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px;">
  <p style="margin: 0; font-family: sans-serif; font-size: 14px;">
    Thẻ <strong>&lt;div&gt;</strong> là một khối chiếm trọn 100% chiều rộng dòng.
  </p>
  <p style="margin-top: 8px; font-family: sans-serif; font-size: 14px;">
    Còn thẻ <strong>&lt;span&gt;</strong> chỉ bọc một đoạn chữ ngắn như 
    <span style="color: #e11d48; font-weight: bold; background: #ffe4e6; padding: 2px 6px; border-radius: 4px;">nút nổi bật này</span> 
    mà không gây rớt dòng.
  </p>
</div>`,
      steps: [
        {
          lines: [1, 10],
          title: '<div> (Division)',
          text: 'Khối cấp dòng (block-level): tự động xuống dòng và có thể chỉnh chiều rộng, chiều cao.',
        },
        {
          lines: [6, 7, 8],
          title: '<span>',
          text: 'Khối nội dòng (inline): chỉ chiếm vừa khít độ dài văn bản bên trong, không tạo ngắt dòng mới.',
        },
      ],
    },
    tip: 'Chỉ dùng <div> và <span> khi không có thẻ ngữ nghĩa nào khác (như header, section, strong) phù hợp hơn.',
    consequence: 'Nếu lạm dụng <span> để bọc cả một đoạn văn lớn, bạn sẽ gặp khó khăn khi chỉnh lề margin trên/dưới vì phần tử inline không áp dụng margin dọc chuẩn.',
    analogy: '<div> như một chiếc thùng carton lớn để đóng hàng; <span> như chiếc nhãn dán dán lên một món đồ trong thùng.',
  },
];

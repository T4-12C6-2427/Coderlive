import { Lesson } from '../types/learning';

export const LESSONS: Lesson[] = [
  {
    id: 1,
    order: 1,
    slug: 'cau-truc-html-co-ban',
    title: 'HTML là gì? Cấu trúc một trang HTML',
    topic: 'Nền tảng',
    tags: ['<!DOCTYPE>', '<html>', '<head>', '<body>', '<title>', '<meta>'],
    intro:
      'HTML (HyperText Markup Language) là ngôn ngữ nền tảng tạo nên bộ khung xương cho mọi trang web trên Internet. Hãy tưởng tượng trang web như một ngôi nhà: HTML chính là các bức tường, cột bê tông và cửa sổ tạo nên cấu trúc vững chắc trước khi được sơn màu (bằng CSS) hay lắp đặt điện nước (bằng JavaScript).',
    analogy:
      'Ví von: Cấu trúc HTML giống như một bài luận có phần Mở bài (<head> - chứa thông tin ẩn) và Thân bài (<body> - chứa toàn bộ nội dung hiển thị ra cho người đọc).',
    initialCode: `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Trang Web Đầu Tiên Của Tôi</title>
</head>
<body>
  <h1>Xin chào thế giới!</h1>
  <p>Đây là trang web đầu tiên tôi tự tay tạo bằng mã nguồn HTML.</p>
</body>
</html>`,
    lineNotes: [
      { line: 1, tag: '<!DOCTYPE html>', note: 'Khai báo chuẩn HTML5 để trình duyệt web biết và hiển thị trang web chính xác.' },
      { line: 2, tag: '<html lang="vi">', note: 'Thẻ gốc (root) bao bọc toàn bộ mã nguồn của trang web, với ngôn ngữ chính là tiếng Việt (vi).' },
      { line: 3, tag: '<head>', note: 'Phần đầu trang web: chứa các thông tin cấu hình, cài đặt meta, tiêu đề tab... không hiển thị trực tiếp lên giao diện.' },
      { line: 4, tag: '<meta charset="UTF-8">', note: 'Thiết lập bảng mã ký tự UTF-8 để hiển thị hoàn hảo tiếng Việt có dấu mà không bị lỗi font.' },
      { line: 5, tag: '<title>', note: 'Tiêu đề của trang web được hiển thị trên thanh tab của trình duyệt hoặc khi chia sẻ link.' },
      { line: 6, tag: '</head>', note: 'Thẻ đóng kết thúc phần cấu hình đầu trang.' },
      { line: 7, tag: '<body>', note: 'Thân trang: nơi chứa tất cả nội dung người dùng thực sự nhìn thấy như chữ, ảnh, nút bấm.' },
      { line: 8, tag: '<h1>', note: 'Tiêu đề lớn nhất cấp 1 (Heading 1), dùng để làm tiêu đề bài viết hoặc chủ đề chính.' },
      { line: 9, tag: '<p>', note: 'Thẻ đoạn văn (Paragraph), dùng để hiển thị các đoạn văn bản thông thường.' },
      { line: 10, tag: '</body>', note: 'Thẻ đóng kết thúc phần thân trang.' },
      { line: 11, tag: '</html>', note: 'Thẻ đóng kết thúc toàn bộ tài liệu HTML.' },
    ],
    commonMistakes: [
      {
        title: 'Quên thẻ đóng hoặc đặt sai vị trí',
        description: 'Mỗi thẻ mở thường cần có một thẻ đóng tương ứng với dấu gạch chéo (/), nếu quên trình duyệt có thể hiển thị sai toàn bộ bố cục.',
        wrongCode: `<body>
  <h1>Xin chào!
  <p>Đoạn văn này bị lỗi đóng thẻ.
</body>`,
        correctCode: `<body>
  <h1>Xin chào!</h1>
  <p>Đoạn văn này đã được đóng thẻ chuẩn xác.</p>
</body>`,
        explanation: 'Luôn đảm bảo đóng thẻ theo nguyên tắc: Thẻ nào mở sau cùng thì phải được đóng trước tiên (LIFO).'
      },
      {
        title: 'Thiếu khai báo bảng mã UTF-8',
        description: 'Khi viết tiếng Việt có dấu, nếu thiếu <meta charset="UTF-8">, các ký tự tiếng Việt có thể biến thành các ký tự lạ hoặc dấu hỏi chấm.',
        wrongCode: `<head>
  <title>Tiêu đề</title>
</head>`,
        correctCode: `<head>
  <meta charset="UTF-8">
  <title>Tiêu đề tiếng Việt</title>
</head>`,
        explanation: 'Luôn đặt <meta charset="UTF-8"> ngay ở dòng đầu tiên bên trong thẻ <head>.'
      }
    ],
    quiz: [
      {
        id: 'q1-1',
        question: 'Thẻ nào chứa toàn bộ nội dung mà người dùng thực sự nhìn thấy trên màn hình trang web?',
        options: ['<head>', '<body>', '<title>', '<meta>'],
        correctIndex: 1,
        explanation: 'Chính xác! Thẻ <body> là thân trang web, tất cả hình ảnh, chữ, nút bấm đều phải nằm bên trong <body>.'
      },
      {
        id: 'q1-2',
        question: 'Dòng khai báo nào bắt buộc phải nằm ở dòng đầu tiên của tài liệu HTML5?',
        options: ['<html>', '<head>', '<!DOCTYPE html>', '<meta charset="UTF-8">'],
        correctIndex: 2,
        explanation: 'Đúng vậy! <!DOCTYPE html> báo cho trình duyệt biết tài liệu này sử dụng tiêu chuẩn chuẩn hóa HTML5 mới nhất.'
      }
    ]
  },
  {
    id: 2,
    order: 2,
    slug: 'tieu-de-va-doan-van',
    title: 'Tiêu đề và đoạn văn (<h1>–<h6>, <p>, <br>, <hr>)',
    topic: 'Nền tảng',
    tags: ['<h1>', '<h2>', '<h3>', '<p>', '<br>', '<hr>'],
    intro:
      'Văn bản là yếu tố cốt lõi truyền tải thông điệp trên web. HTML cung cấp 6 cấp độ tiêu đề từ <h1> (quan trọng nhất, to nhất) đến <h6> (nhỏ nhất) giúp phân cấp cấu trúc thông tin rõ ràng cho người đọc và công cụ tìm kiếm (SEO). Ngoài ra, thẻ <p> được dùng cho các đoạn văn thông thường.',
    analogy:
      'Ví von: Giống như một cuốn sách, <h1> là tên cuốn sách, <h2> là tên chương, <h3> là tên mục nhỏ trong chương, và <p> là nội dung từng trang sách.',
    initialCode: `<h1>Học Lập Trình Web Cùng HTMLive</h1>
<p>HTML rất dễ học và thú vị khi bạn được nhìn thấy kết quả ngay lập tức.</p>

<hr>

<h2>Chương 1: Khởi Đầu Thuận Lợi</h2>
<p>Một ngày bắt đầu bằng việc viết mã,<br>và kết thúc bằng một ứng dụng tuyệt đẹp!</p>

<h3>Mục 1.1: Những điều cần nhớ</h3>
<p>Hãy luyện tập gõ code mỗi ngày thay vì chỉ đọc lý thuyết.</p>`,
    lineNotes: [
      { line: 1, tag: '<h1>', note: 'Tiêu đề lớn nhất, mỗi trang web thường chỉ nên có DUY NHẤT một thẻ <h1> để tối ưu SEO.' },
      { line: 2, tag: '<p>', note: 'Đoạn văn bản (Paragraph), tự động có khoảng cách cách dòng phía trên và dưới.' },
      { line: 4, tag: '<hr>', note: 'Horizontal Rule: vẽ một đường kẻ ngang để phân chia ranh giới các phần nội dung khác nhau.' },
      { line: 6, tag: '<h2>', note: 'Tiêu đề cấp 2, dùng cho các chương hoặc tiêu đề phân mục chính.' },
      { line: 7, tag: '<br>', note: 'Break Line: ngắt dòng xuống hàng ngay tại vị trí đặt thẻ mà không tạo đoạn văn mới.' },
      { line: 9, tag: '<h3>', note: 'Tiêu đề cấp 3, dùng cho các tiểu mục con bên trong mục <h2>.' },
    ],
    commonMistakes: [
      {
        title: 'Dùng nhiều thẻ <h1> trên cùng một trang',
        description: 'Nhiều người mới học dùng <h1> cho mọi tiêu đề vì thấy chữ to, điều này gây hại cho thứ hạng tìm kiếm Google (SEO).',
        wrongCode: `<h1>Trang Chủ</h1>
<h1>Giới Thiệu</h1>
<h1>Sản Phẩm</h1>`,
        correctCode: `<h1>Công Ty Công Nghệ ABC</h1>
<h2>Dịch Vụ Nổi Bật</h2>
<h2>Sản Phẩm Mới Nhất</h2>`,
        explanation: 'Chỉ nên có 1 thẻ <h1> làm tiêu đề đại diện cho trang, các phân mục tiếp theo dùng <h2>, <h3>.'
      },
      {
        title: 'Viết thẻ đóng </br> hoặc </hr>',
        description: '<br> và <hr> là các "thẻ rỗng" (void elements), chúng không chứa nội dung bên trong nên không cần thẻ đóng.',
        wrongCode: `<p>Dòng 1<br>Nội dung</br></p>`,
        correctCode: `<p>Dòng 1<br>Nội dung tiếp theo</p>`,
        explanation: 'Thẻ <br> và <hr> tự kết thúc chính nó, bạn có thể viết <br> hoặc <br />.'
      }
    ],
    quiz: [
      {
        id: 'q2-1',
        question: 'Thẻ nào tạo ra tiêu đề có kích thước chữ lớn nhất và mức độ ưu tiên cao nhất?',
        options: ['<h6>', '<h3>', '<h1>', '<p>'],
        correctIndex: 2,
        explanation: 'Chính xác! Thẻ <h1> là tiêu đề lớn nhất và quan trọng nhất trên trang.'
      },
      {
        id: 'q2-2',
        question: 'Để ngắt dòng xuống hàng trong cùng một đoạn văn mà không tạo đoạn mới, bạn dùng thẻ nào?',
        options: ['<hr>', '<br>', '<p>', '<down>'],
        correctIndex: 1,
        explanation: 'Đúng rồi! Thẻ <br> (break line) giúp xuống dòng ngay lập tức mà không cần tạo thẻ <p> mới.'
      }
    ]
  },
  {
    id: 3,
    order: 3,
    slug: 'dinh-dang-chu',
    title: 'Định dạng chữ (<strong>, <em>, <u>, <mark>, <small>, <sub>, <sup>)',
    topic: 'Nền tảng',
    tags: ['<strong>', '<em>', '<u>', '<mark>', '<small>', '<sub>', '<sup>'],
    intro:
      'Khi viết bài, bạn thường muốn in đậm chữ quan trọng, in nghiêng thuật ngữ hoặc đánh dấu văn bản. HTML cung cấp các thẻ ngữ nghĩa đặc thù như <strong> (nhấn mạnh tầm quan trọng), <em> (nhấn mạnh giọng điệu) hay <mark> (bút highlight vàng) giúp văn bản sinh động và giàu ý nghĩa.',
    analogy:
      'Ví von: Giống như chiếc hộp bút màu: <strong> là chiếc bút lông nét đậm, <em> là nét viết nghiêng nghệ thuật, còn <mark> chính là chiếc bút dạ quang màu vàng!',
    initialCode: `<p>HTML là ngôn ngữ <strong>cực kỳ quan trọng</strong> trong lập trình web.</p>

<p>Hãy ghi nhớ từ khóa: <em>semantic elements</em> (thẻ ngữ nghĩa).</p>

<p>Hôm nay có chương trình giảm giá: <mark>Khuyến mãi 50%</mark> cho học viên mới!</p>

<p>Công thức hóa học của nước là: H<sub>2</sub>O</p>
<p>Công thức toán học định lý Pytago: a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup></p>

<p><small>* Lưu ý: Ưu đãi chỉ áp dụng trong ngày hôm nay.</small></p>`,
    lineNotes: [
      { line: 1, tag: '<strong>', note: 'In đậm và mang ý nghĩa quan trọng, hỗ trợ máy đọc màn hình đọc to hơn.' },
      { line: 3, tag: '<em>', note: 'In nghiêng (emphasized), dùng để nhấn mạnh trọng âm hoặc thuật ngữ nước ngoài.' },
      { line: 5, tag: '<mark>', note: 'Tô nền màu vàng như dùng bút highlight để gây sự chú ý.' },
      { line: 7, tag: '<sub>', note: 'Subscript: chỉ số dưới, thường dùng cho công thức hóa học (H₂O).' },
      { line: 8, tag: '<sup>', note: 'Superscript: chỉ số trên, thường dùng cho số mũ toán học (a² + b² = c²).' },
      { line: 10, tag: '<small>', note: 'Hiển thị chữ kích thước nhỏ hơn bình thường, thường dùng cho chú thích hoặc bản quyền.' },
    ],
    commonMistakes: [
      {
        title: 'Nhầm lẫn giữa <b> và <strong>, <i> và <em>',
        description: '<b> và <i> chỉ thuần túy làm đậm/nghiêng về mặt thị giác, còn <strong> và <em> mang ý nghĩa ngữ nghĩa (semantic) chuẩn SEO.',
        wrongCode: `<p>Mật khẩu là thông tin <b>bí mật</b>.</p>`,
        correctCode: `<p>Mật khẩu là thông tin <strong>bí mật</strong>.</p>`,
        explanation: 'Trong HTML5 hiện đại, hãy luôn ưu tiên <strong> và <em> để hỗ trợ công cụ tìm kiếm và người khiếm thị.'
      }
    ],
    quiz: [
      {
        id: 'q3-1',
        question: 'Để viết số mũ trong công thức toán học X² = Y, bạn sử dụng thẻ nào cho số 2?',
        options: ['<sub>', '<small>', '<sup>', '<mark>'],
        correctIndex: 2,
        explanation: 'Chính xác! Thẻ <sup> (superscript) tạo chỉ số trên, rất hoàn hảo cho số mũ.'
      },
      {
        id: 'q3-2',
        question: 'Thẻ nào tạo hiệu ứng bôi màu vàng giống bút dạ quang?',
        options: ['<strong>', '<mark>', '<u>', '<em>'],
        correctIndex: 1,
        explanation: 'Đúng rồi! Thẻ <mark> tô màu nền highlight vàng sáng cho đoạn văn bản được chọn.'
      }
    ]
  },
  {
    id: 4,
    order: 4,
    slug: 'lien-ket-anchor',
    title: 'Liên kết (<a>, href, target="_blank")',
    topic: 'Liên kết và hình ảnh',
    tags: ['<a>', 'href', 'target'],
    intro:
      'Chữ "H" và "T" trong HTML là HyperText (Siêu văn bản) – ý nói văn bản có khả năng liên kết nhảy sang một trang web khác! Thẻ liên kết <a> (anchor) cùng thuộc tính href chính là chiếc cầu nối kỳ diệu kết nối toàn bộ mạng Internet toàn cầu.',
    analogy:
      'Ví von: Thẻ <a> giống như một cánh cửa thần kỳ Doraemon: khi bạn bước qua (nhấp chuột), bạn sẽ lập tức dịch chuyển đến địa chỉ được ghi trên chìa khóa (href).',
    initialCode: `<h2>Khám Phá Các Trang Web Hữu Ích</h2>

<p>
  Ghé thăm trang tìm kiếm 
  <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">Google</a> 
  để tra cứu tài liệu học tập.
</p>

<p>
  Hoặc gửi email phản hồi trực tiếp: 
  <a href="mailto:support@example.com">Gửi thư cho chúng tôi</a>
</p>

<p>
  Liên kết gọi điện thoại trên di động: 
  <a href="tel:0901234567">Gọi số: 090 123 4567</a>
</p>`,
    lineNotes: [
      { line: 4, tag: '<a href="...">', note: 'Thuộc tính href (hypertext reference) chỉ định đường dẫn URL đích khi người dùng nhấp vào.' },
      { line: 4, tag: 'target="_blank"', note: 'Mở đường link trong một tab mới thay vì tải đè lên trang hiện tại.' },
      { line: 4, tag: 'rel="noopener"', note: 'Thuộc tính bảo mật khuyến nghị khi dùng target="_blank" để ngăn chặn trang đích can thiệp trang gốc.' },
      { line: 9, tag: 'href="mailto:..."', note: 'Giao thức mở ứng dụng gửi email mặc định trên máy tính hoặc điện thoại.' },
      { line: 14, tag: 'href="tel:..."', note: 'Giao thức kích hoạt ứng dụng quay số gọi điện trên điện thoại di động.' },
    ],
    commonMistakes: [
      {
        title: 'Quên thuộc tính href trong thẻ <a>',
        description: 'Nếu bạn viết <a>Click me</a> mà không có href, thẻ sẽ trở thành văn bản bình thường và không thể nhấp được.',
        wrongCode: `<a>Nhấp vào đây</a>`,
        correctCode: `<a href="https://example.com">Nhấp vào đây</a>`,
        explanation: 'Thẻ <a> luôn luôn phải đi kèm với thuộc tính href để có thể hoạt động như một liên kết.'
      },
      {
        title: 'Quên giao thức https:// trong đường dẫn bên ngoài',
        description: 'Nếu bạn viết href="google.com" thay vì "https://google.com", trình duyệt sẽ hiểu nhầm đây là tệp nội bộ trên máy bạn.',
        wrongCode: `<a href="google.com">Google</a>`,
        correctCode: `<a href="https://google.com">Google</a>`,
        explanation: 'Luôn thêm https:// hoặc http:// khi liên kết đến một website bên ngoài.'
      }
    ],
    quiz: [
      {
        id: 'q4-1',
        question: 'Thuộc tính nào dùng để chỉ định địa chỉ website đích khi người dùng nhấp vào thẻ liên kết?',
        options: ['src', 'link', 'href', 'url'],
        correctIndex: 2,
        explanation: 'Chính xác! href (Hypertext Reference) là thuộc tính bắt buộc của thẻ <a>.'
      },
      {
        id: 'q4-2',
        question: 'Để mở liên kết trong một tab mới của trình duyệt, ta dùng giá trị nào cho thuộc tính target?',
        options: ['target="_new"', 'target="_blank"', 'target="_tab"', 'target="_open"'],
        correctIndex: 1,
        explanation: 'Đúng rồi! target="_blank" sẽ mở liên kết sang một tab hoàn toàn mới.'
      }
    ]
  },
  {
    id: 5,
    order: 5,
    slug: 'hinh-anh',
    title: 'Hình ảnh (<img>, src, alt, width, height)',
    topic: 'Liên kết và hình ảnh',
    tags: ['<img>', 'src', 'alt', 'width', 'height'],
    intro:
      'Hình ảnh giúp trang web sống động và thu hút người xem hơn vạn lời nói. Thẻ <img> là thẻ tự đóng, sử dụng thuộc tính src để trỏ đến ảnh và alt để mô tả hình ảnh cho công cụ tìm kiếm cũng như người khiếm thị.',
    analogy:
      'Ví von: Thẻ <img> giống như một chiếc khung ảnh: src là bức tranh lồng vào khung, còn alt là tấm thẻ chú thích đính kèm giải thích bức tranh vẽ gì.',
    initialCode: `<h2>Thử Nghiệm Chèn Hình Ảnh</h2>

<p>Hình ảnh đồ họa vector SVG inline:</p>
<svg width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#4f46e5" />
  <polygon points="50,20 62,40 85,42 67,58 73,80 50,68 27,80 33,58 15,42 38,40" fill="#facc15" />
</svg>

<p>Hình ảnh từ đường dẫn placeholder:</p>
<img 
  src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='120' viewBox='0 0 240 120'><rect width='240' height='120' fill='%236366f1'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-size='16'>HTMLive Image</text></svg>"
  alt="Biểu trưng đồ họa HTMLive"
  width="240"
  height="120"
/>

<p>Ví dụ khi ảnh bị lỗi (src sai) thì thuộc tính <strong>alt</strong> sẽ hiển thị:</p>
<img src="anh-khong-ton-tai.jpg" alt="[Ảnh chân dung tác giả bị lỗi]" />`,
    lineNotes: [
      { line: 10, tag: '<img ... />', note: 'Thẻ <img> không có thẻ đóng, tự kết thúc chính nó.' },
      { line: 11, tag: 'src="..."', note: 'Source: đường dẫn tới tệp ảnh (URL, Data URI hoặc tệp nội bộ).' },
      { line: 12, tag: 'alt="..."', note: 'Alternate text: chữ thay thế hiển thị khi ảnh lỗi hoặc máy đọc cho người khiếm thị đọc to.' },
      { line: 13, tag: 'width="..."', note: 'Độ rộng của ảnh (tính theo pixel).' },
      { line: 14, tag: 'height="..."', note: 'Chiều cao của ảnh (tính theo pixel).' },
    ],
    commonMistakes: [
      {
        title: 'Bỏ quên thuộc tính alt',
        description: 'Bỏ trống hoặc không viết thuộc tính alt là một lỗi lớn trong lập trình web hiện đại (vi phạm chuẩn trợ năng a11y và SEO).',
        wrongCode: `<img src="avatar.jpg">`,
        correctCode: `<img src="avatar.jpg" alt="Ảnh đại diện của bạn">`,
        explanation: 'Luôn mô tả ngắn gọn nội dung của bức ảnh trong thuộc tính alt.'
      }
    ],
    quiz: [
      {
        id: 'q5-1',
        question: 'Thuộc tính nào trong thẻ <img> hiển thị văn bản thay thế khi hình ảnh tải thất bại?',
        options: ['title', 'alt', 'desc', 'caption'],
        correctIndex: 1,
        explanation: 'Chính xác! Thuộc tính alt (alternative text) sẽ hiển thị khi ảnh không tải được.'
      }
    ]
  },
  {
    id: 6,
    order: 6,
    slug: 'danh-sach',
    title: 'Danh sách (<ul>, <ol>, <li>)',
    topic: 'Danh sách và bảng',
    tags: ['<ul>', '<ol>', '<li>'],
    intro:
      'Để trình bày các mục thông tin ngăn nắp, HTML cung cấp hai loại danh sách chính: <ul> (không có thứ tự - dấu chấm đầu dòng) và <ol> (có thứ tự - đánh số 1, 2, 3). Các mục con bên trong luôn được bọc trong thẻ <li> (list item).',
    analogy:
      'Ví von: Danh sách mua sắm thực phẩm là <ul> (mua cái nào trước cũng được), còn công thức nấu ăn từng bước là <ol> (phải làm bước 1 rồi mới đến bước 2).',
    initialCode: `<h3>Danh Sách Đồ Cần Mua (Không thứ tự - ul)</h3>
<ul>
  <li>Sữa chua không đường</li>
  <li>Bánh mì ngũ cốc</li>
  <li>Táo đỏ New Zealand</li>
</ul>

<h3>3 Bước Học HTML Hiệu Quả (Có thứ tự - ol)</h3>
<ol>
  <li>Đọc hiểu ý nghĩa các thẻ</li>
  <li>Thực hành gõ mã trực tiếp</li>
  <li>Làm các bài tập quiz củng cố kiến thức</li>
</ol>`,
    lineNotes: [
      { line: 2, tag: '<ul>', note: 'Unordered List: danh sách dấu chấm tròn không theo thứ tự số.' },
      { line: 3, tag: '<li>', note: 'List Item: đại diện cho một phần tử mục con trong danh sách.' },
      { line: 9, tag: '<ol>', note: 'Ordered List: danh sách có số thứ tự tự động tăng 1, 2, 3...' },
    ],
    commonMistakes: [
      {
        title: 'Đặt chữ trực tiếp bên trong <ul> mà không có <li>',
        description: 'Mọi nội dung bên trong <ul> và <ol> bắt buộc phải nằm trong thẻ <li>.',
        wrongCode: `<ul>
  Cà phê
  Trà sữa
</ul>`,
        correctCode: `<ul>
  <li>Cà phê</li>
  <li>Trà sữa</li>
</ul>`,
        explanation: 'Thẻ <ul> chỉ đóng vai trò chứa, các phần tử mục bắt buộc phải là thẻ <li>.'
      }
    ],
    quiz: [
      {
        id: 'q6-1',
        question: 'Thẻ nào tạo ra danh sách được đánh số thứ tự tự động (1, 2, 3...)?',
        options: ['<ul>', '<ol>', '<dl>', '<list>'],
        correctIndex: 1,
        explanation: 'Chính xác! <ol> (Ordered List) tự động đánh số thứ tự cho các mục con.'
      }
    ]
  },
  {
    id: 7,
    order: 7,
    slug: 'bang-du-lieu',
    title: 'Bảng (<table>, <tr>, <th>, <td>)',
    topic: 'Danh sách và bảng',
    tags: ['<table>', '<tr>', '<th>', '<td>'],
    intro:
      'Bảng biểu giúp sắp xếp dữ liệu có mối tương quan theo các hàng và các cột rõ ràng, như danh sách điểm số hay báo giá sản phẩm. Mỗi hàng được xác định bằng thẻ <tr>, tiêu đề cột bằng <th>, và ô nội dung bằng <td>.',
    analogy:
      'Ví von: Bảng HTML giống như một bảng tính Excel: <tr> là từng hàng ngang, <th> là dòng tiêu đề in đậm trên cùng, còn <td> là từng ô dữ liệu.',
    initialCode: `<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #312e81; color: white;">
      <th>STT</th>
      <th>Tên Khóa Học</th>
      <th>Thời Lượng</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">1</td>
      <td>HTML & CSS Cơ Bản</td>
      <td>4 tuần</td>
    </tr>
    <tr>
      <td align="center">2</td>
      <td>JavaScript Nâng Cao</td>
      <td>6 tuần</td>
    </tr>
  </tbody>
</table>`,
    lineNotes: [
      { line: 1, tag: '<table>', note: 'Thẻ định nghĩa bảng dữ liệu.' },
      { line: 3, tag: '<tr>', note: 'Table Row: một hàng ngang trong bảng.' },
      { line: 4, tag: '<th>', note: 'Table Header: ô tiêu đề cột (tự động in đậm và căn giữa).' },
      { line: 10, tag: '<td>', note: 'Table Data: ô chứa dữ liệu thông thường trong bảng.' },
    ],
    commonMistakes: [
      {
        title: 'Nhầm lẫn giữa <tr> và <td>',
        description: '<tr> là thẻ tạo dòng (hàng), còn <td> là thẻ tạo ô bên trong dòng đó.',
        wrongCode: `<table>
  <td>Hàng 1 ô 1</td>
</table>`,
        correctCode: `<table>
  <tr>
    <td>Hàng 1 ô 1</td>
  </tr>
</table>`,
        explanation: 'Ô <td> luôn phải nằm bên trong hàng <tr>.'
      }
    ],
    quiz: [
      {
        id: 'q7-1',
        question: 'Thẻ nào dùng để tạo một hàng ngang trong bảng HTML?',
        options: ['<td>', '<th>', '<tr>', '<row>'],
        correctIndex: 2,
        explanation: 'Đúng rồi! <tr> (Table Row) định nghĩa một hàng ngang trong bảng.'
      }
    ]
  },
  {
    id: 8,
    order: 8,
    slug: 'bieu-mau-form',
    title: 'Biểu mẫu (<form>, <label>, <input>, <textarea>, <select>, <button>)',
    topic: 'Biểu mẫu',
    tags: ['<form>', '<label>', '<input>', '<textarea>', '<select>', '<button>'],
    intro:
      'Biểu mẫu (Form) là phương thức chính để người dùng tương tác và gửi dữ liệu về máy chủ, như khung đăng nhập, tìm kiếm hay liên hệ. Thẻ <input> rất linh hoạt với nhiều kiểu (type) như text, password, checkbox, radio.',
    analogy:
      'Ví von: Form giống như tờ phiếu khai báo thông tin lý lịch: mỗi ô điền tên, ngày sinh là một thẻ <input>, và nút nộp phiếu là <button>.',
    initialCode: `<form onsubmit="alert('Dữ liệu đã được nhập thành công!'); return false;" style="display: flex; flex-direction: column; gap: 10px; max-width: 320px;">
  <div>
    <label for="fullname">Họ và tên:</label><br>
    <input type="text" id="fullname" placeholder="Nguyễn Văn A" required style="width: 100%; padding: 6px;">
  </div>

  <div>
    <label for="city">Thành phố:</label><br>
    <select id="city" style="width: 100%; padding: 6px;">
      <option value="hn">Hà Nội</option>
      <option value="dn">Đà Nẵng</option>
      <option value="hcm">TP. Hồ Chí Minh</option>
    </select>
  </div>

  <div>
    <label for="note">Lời nhắn:</label><br>
    <textarea id="note" rows="3" placeholder="Nhập cảm nhận của bạn..." style="width: 100%; padding: 6px;"></textarea>
  </div>

  <button type="submit" style="padding: 8px 16px; background-color: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer;">
    Gửi Thông Tin
  </button>
</form>`,
    lineNotes: [
      { line: 1, tag: '<form>', note: 'Bao bọc các phần tử nhập liệu để gom nhóm và gửi dữ liệu.' },
      { line: 3, tag: '<label for="...">', note: 'Nhãn mô tả ô nhập. Thuộc tính for liên kết với id của input để bấm vào nhãn là focus vào ô.' },
      { line: 4, tag: '<input type="text">', note: 'Ô nhập văn bản một dòng. Thuộc tính required yêu cầu bắt buộc phải nhập.' },
      { line: 8, tag: '<select>', note: 'Menu thả xuống để người dùng chọn một trong các phương án có sẵn.' },
      { line: 16, tag: '<textarea>', note: 'Khung nhập văn bản nhiều dòng thích hợp cho lời nhắn, nhận xét.' },
      { line: 20, tag: '<button type="submit">', note: 'Nút nhấn kích hoạt sự kiện gửi dữ liệu của form.' },
    ],
    commonMistakes: [
      {
        title: 'Không đặt thuộc tính for trên thẻ <label>',
        description: 'Khi nhấp chuột vào chữ trên nhãn <label>, con trỏ chuột không tự động nhảy vào ô input nếu thiếu liên kết for = id.',
        wrongCode: `<label>Tên đăng nhập:</label>
<input type="text">`,
        correctCode: `<label for="username">Tên đăng nhập:</label>
<input type="text" id="username">`,
        explanation: 'Luôn ghép cặp label for và input id để tăng trải nghiệm người dùng.'
      }
    ],
    quiz: [
      {
        id: 'q8-1',
        question: 'Để tạo ô nhập dữ liệu nhiều dòng (như viết thư hoặc nhận xét), ta dùng thẻ nào?',
        options: ['<input type="textbox">', '<textarea>', '<text>', '<input type="multiline">'],
        correctIndex: 1,
        explanation: 'Chính xác! Thẻ <textarea> cho phép nhập văn bản nhiều dòng.'
      }
    ]
  },
  {
    id: 9,
    order: 9,
    slug: 'the-ngu-nghia-semantic',
    title: 'Khối và thẻ ngữ nghĩa (<div>, <span>, <header>, <nav>, <main>, <section>, <footer>)',
    topic: 'Cấu trúc và mở rộng',
    tags: ['<div>', '<span>', '<header>', '<nav>', '<main>', '<footer'],
    intro:
      'Các thẻ ngữ nghĩa (Semantic HTML) giúp mã nguồn trang web có nghĩa rõ ràng đối với cả lập trình viên và trình duyệt web. Thay vì lạm dụng toàn bộ thẻ <div> chung chung, hãy dùng <header> cho đầu trang, <nav> cho menu, và <footer> cho chân trang.',
    analogy:
      'Ví von: Nếu <div> giống như chiếc hộp cacton không nhãn mác, thì <header>, <nav>, <footer> là những chiếc hộp có in sẵn nhãn rõ ràng!',
    initialCode: `<header style="background: #1e1b4b; padding: 12px; color: white;">
  <h2>Trang Tin Tức Công Nghệ</h2>
  <nav style="margin-top: 8px;">
    <a href="#" style="color: #a5b4fc; margin-right: 12px;">Trang chủ</a>
    <a href="#" style="color: #a5b4fc;">Liên hệ</a>
  </nav>
</header>

<main style="padding: 16px;">
  <section style="margin-bottom: 16px;">
    <h3>Bài viết nổi bật</h3>
    <p>Học thẻ ngữ nghĩa giúp trang web của bạn chuẩn SEO hơn.</p>
  </section>
</main>

<footer style="background: #0f172a; padding: 12px; color: #94a3b8; font-size: 13px;">
  <p>© 2026 Bản quyền thuộc về HTMLive</p>
</footer>`,
    lineNotes: [
      { line: 1, tag: '<header>', note: 'Phần mở đầu trang hoặc phân mục, thường chứa logo và tiêu đề.' },
      { line: 3, tag: '<nav>', note: 'Navigation: chứa các liên kết điều hướng chính của trang web.' },
      { line: 9, tag: '<main>', note: 'Nội dung cốt lõi độc nhất của trang, không lặp lại ở các trang khác.' },
      { line: 10, tag: '<section>', note: 'Một phần hoặc một chương có chủ đề cụ thể trong trang.' },
      { line: 16, tag: '<footer>', note: 'Chân trang, chứa bản quyền tác giả, liên kết chính sách và thông tin liên hệ.' },
    ],
    commonMistakes: [
      {
        title: 'Hội chứng "Div Soup" (Lạm dụng thẻ div)',
        description: 'Viết toàn bộ cấu trúc bằng <div> khiến mã nguồn trở nên rối rắm và khó bảo trì.',
        wrongCode: `<div class="header">
  <div class="nav">Menu</div>
</div>`,
        correctCode: `<header>
  <nav>Menu</nav>
</header>`,
        explanation: 'Sử dụng thẻ ngữ nghĩa đúng mục đích giúp cấu trúc trang sáng sủa hơn rất nhiều.'
      }
    ],
    quiz: [
      {
        id: 'q9-1',
        question: 'Thẻ ngữ nghĩa nào phù hợp nhất để chứa menu thanh điều hướng website?',
        options: ['<menu>', '<nav>', '<header>', '<aside>'],
        correctIndex: 1,
        explanation: 'Chính xác! <nav> là thẻ ngữ nghĩa tiêu chuẩn cho các liên kết điều hướng.'
      }
    ]
  },
  {
    id: 10,
    order: 10,
    slug: 'thuoc-tinh-thuong-gap',
    title: 'Thuộc tính thường gặp (id, class, style, title)',
    topic: 'Cấu trúc và mở rộng',
    tags: ['id', 'class', 'style', 'title'],
    intro:
      'Thuộc tính (Attributes) cung cấp thêm thông tin bổ sung và định danh cho các thẻ HTML. Trong đó, id là định danh duy nhất (như số CMND/CCCD), class là nhóm đối tượng có chung đặc tính (như đồng phục lớp), và style dùng để trang trí giao diện.',
    analogy:
      'Ví von: Thẻ là một danh từ (Học sinh), còn thuộc tính là các đặc điểm đi kèm: id="101" (Số báo danh), class="lop-12a" (Lớp học).',
    initialCode: `<h2 id="chu-de-chinh" title="Di chuột vào đây để xem mẹo!">
  Thuộc Tính Trong HTML
</h2>

<p class="canh-bao" style="color: #f43f5e; font-weight: bold;">
  Cảnh báo: ID trên một trang web phải là duy nhất!
</p>

<p class="chu-xanh" style="color: #38bdf8;">
  Đoạn văn này mang class "chu-xanh".
</p>

<p class="chu-xanh" style="color: #38bdf8;">
  Đoạn văn khác cũng có thể mang cùng class "chu-xanh".
</p>`,
    lineNotes: [
      { line: 1, tag: 'id="..."', note: 'Định danh độc nhất trên toàn bộ trang web, không được trùng lặp.' },
      { line: 1, tag: 'title="..."', note: 'Hiển thị tooltip nhỏ khi người dùng rê chuột lên phần tử.' },
      { line: 5, tag: 'class="..."', note: 'Phân nhóm phần tử, nhiều phần tử có thể dùng chung một class.' },
      { line: 5, tag: 'style="..."', note: 'Khai báo các thuộc tính CSS nội dòng (inline style) trực tiếp.' },
    ],
    commonMistakes: [
      {
        title: 'Đặt trùng lặp cùng một ID cho nhiều phần tử',
        description: 'ID bắt buộc phải là duy nhất. Đặt trùng ID sẽ gây lỗi khi dùng JavaScript và CSS.',
        wrongCode: `<p id="doan-van">Đoạn 1</p>
<p id="doan-van">Đoạn 2 (Trùng ID!)</p>`,
        correctCode: `<p class="doan-van">Đoạn 1</p>
<p class="doan-van">Đoạn 2</p>`,
        explanation: 'Khi muốn áp dụng cho nhiều phần tử, hãy luôn dùng class thay vì id.'
      }
    ],
    quiz: [
      {
        id: 'q10-1',
        question: 'Một giá trị id có được phép xuất hiện lặp lại ở nhiều phần tử khác nhau trên cùng một trang web không?',
        options: ['Có, xuất hiện bao nhiêu lần cũng được', 'Không, id phải là duy nhất trên trang', 'Chỉ được tối đa 2 lần'],
        correctIndex: 1,
        explanation: 'Chính xác! Mỗi id phải là duy nhất trên toàn bộ tài liệu HTML.'
      }
    ]
  },
  {
    id: 11,
    order: 11,
    slug: 'chu-thich-code',
    title: 'Chú thích trong code (<!-- -->)',
    topic: 'Cấu trúc và mở rộng',
    tags: ['<!-- -->'],
    intro:
      'Chú thích (Comments) là những dòng ghi chú dành cho con người đọc, trình duyệt sẽ hoàn toàn bỏ qua chúng và không hiển thị ra màn hình. Chú thích giúp bạn giải thích mã nguồn phức tạp hoặc tạm thời vô hiệu hóa một đoạn code khi kiểm thử.',
    analogy:
      'Ví von: Chú thích giống như những mẩu giấy nhớ vàng (Post-it note) bạn dán lên bàn làm việc để nhắc nhở bản thân hoặc đồng nghiệp.',
    initialCode: `<!-- Đây là tiêu đề bài viết chính -->
<h2>Trang Tin Tức Hàng Ngày</h2>

<!-- Đoạn văn dưới đây đang được xuất bản -->
<p>Chào mừng bạn đọc đến với bản tin công nghệ số 1.</p>

<!-- 
  <p>Đoạn văn này tạm thời bị ẩn đi để biên tập lại.</p> 
  Trình duyệt sẽ không hiển thị đoạn này!
-->

<p>Chúc bạn một ngày làm việc hiệu quả!</p>`,
    lineNotes: [
      { line: 1, tag: '<!-- ... -->', note: 'Bắt đầu bằng <!-- và kết thúc bằng -->. Tất cả nội dung bên trong đều bị trình duyệt bỏ qua.' },
      { line: 6, tag: '<!-- khối nhiều dòng -->', note: 'Có thể che nhiều dòng code cùng một lúc để thử nghiệm nhanh.' },
    ],
    commonMistakes: [
      {
        title: 'Để lộ thông tin nhạy cảm trong chú thích HTML',
        description: 'Bất kỳ ai cũng có thể mở xem mã nguồn trang web (View Page Source). Không bao giờ đặt mật khẩu hay khóa bí mật vào chú thích HTML.',
        wrongCode: `<!-- Mật khẩu admin tạm thời: 123456 -->`,
        correctCode: `<!-- Cần kiểm tra lại quyền truy cập trang quản trị -->`,
        explanation: 'Chú thích HTML là công khai và ai cũng có thể đọc được.'
      }
    ],
    quiz: [
      {
        id: 'q11-1',
        question: 'Cú pháp chú thích đúng trong mã nguồn HTML là gì?',
        options: ['// Đây là chú thích', '/* Đây là chú thích */', '<!-- Đây là chú thích -->', '# Đây là chú thích'],
        correctIndex: 2,
        explanation: 'Đúng rồi! HTML sử dụng <!-- nội dung --> để tạo ghi chú.'
      }
    ]
  },
  {
    id: 12,
    order: 12,
    slug: 'css-va-javascript-co-ban',
    title: 'Thêm CSS và JavaScript cơ bản (<style>, <script>)',
    topic: 'Cấu trúc và mở rộng',
    tags: ['<style>', '<script>'],
    intro:
      'Một trang web hoàn chỉnh là sự phối hợp nhịp nhàng giữa "Bộ ba nguyên tử": HTML tạo khung sườn, CSS tạo vẻ đẹp màu sắc, và JavaScript tạo hành vi tương tác sống động khi người dùng nhấp chuột!',
    analogy:
      'Ví von: HTML là chiếc ô tô chưa sơn, CSS là nước sơn bóng bẩy và lớp bọc da sang trọng, còn JavaScript là động cơ giúp chiếc xe nổ máy và lăn bánh!',
    initialCode: `<style>
  .hop-qua {
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    color: white;
    padding: 24px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
  .nut-bam {
    background: #facc15;
    color: #1e1b4b;
    border: none;
    padding: 10px 20px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 12px;
  }
</style>

<div class="hop-qua">
  <h2>🎉 Hộp Quà May Mắn</h2>
  <p id="thong-bao">Hãy nhấp vào nút bên dưới để mở quà!</p>
  <button class="nut-bam" onclick="moHopQua()">Mở Hộp Quà</button>
</div>

<script>
  function moHopQua() {
    const el = document.getElementById('thong-bao');
    el.textContent = '🌟 Chúc mừng bạn đã hoàn thành bài học HTML số 12!';
    el.style.color = '#fef08a';
  }
</script>`,
    lineNotes: [
      { line: 1, tag: '<style>', note: 'Nơi viết các đoạn mã CSS trực tiếp trong tệp HTML để trang trí màu sắc, phông chữ.' },
      { line: 20, tag: '<div class="hop-qua">', note: 'Thẻ HTML được áp dụng kiểu dáng định nghĩa trong class .hop-qua.' },
      { line: 23, tag: 'onclick="..."', note: 'Gắn sự kiện nhấp chuột để gọi hàm JavaScript moHopQua().' },
      { line: 26, tag: '<script>', note: 'Nơi viết mã nguồn JavaScript xử lý tương tác động trên trang.' },
    ],
    commonMistakes: [
      {
        title: 'Viết mã CSS trong thẻ <script> hoặc ngược lại',
        description: 'CSS chỉ được viết trong thẻ <style>, còn JavaScript phải viết trong thẻ <script>.',
        wrongCode: `<script>
  body { background: red; }
</script>`,
        correctCode: `<style>
  body { background: red; }
</style>`,
        explanation: 'Nhớ rõ quy tắc: <style> dành cho CSS trang trí, <script> dành cho JavaScript lập trình.'
      }
    ],
    quiz: [
      {
        id: 'q12-1',
        question: 'Thẻ nào dùng để nhúng trực tiếp mã ngôn ngữ CSS vào trong tài liệu HTML?',
        options: ['<css>', '<script>', '<style>', '<design>'],
        correctIndex: 2,
        explanation: 'Chính xác! Thẻ <style> được dùng để viết các đoạn mã CSS.'
      },
      {
        id: 'q12-2',
        question: 'Thẻ nào dùng để viết các đoạn mã JavaScript tương tác trên trang web?',
        options: ['<script>', '<javascript>', '<code>', '<action>'],
        correctIndex: 0,
        explanation: 'Đúng rồi! Thẻ <script> được dùng để chứa mã JavaScript.'
      }
    ]
  }
];

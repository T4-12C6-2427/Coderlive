import { Lesson } from '../types/learning';

export const CSS_LESSONS: Lesson[] = [
  // ================= NỀN TẢNG (1..2) =================
  {
    id: 'css-01-intro',
    order: 1,
    slug: 'css-la-gi-va-ba-cach-chen-css',
    title: 'CSS là gì? Ba cách thêm CSS & Cú pháp cơ bản',
    topic: 'Nền tảng',
    tags: ['<style>', 'style=""', '<link>', 'Cú pháp'],
    intro:
      'CSS (Cascading Style Sheets) là ngôn ngữ quy định vẻ bề ngoài và cách trình bày của trang web. Nếu HTML là khung bê tông và bức tường thô của ngôi nhà, thì CSS chính là lớp sơn nước, rèm cửa, sàn gỗ và ánh đèn lung linh biến căn nhà thành không gian sống tiện nghi, đẹp mắt.',
    analogy:
      'Ví von: HTML giống như ma-nơ-canh mộc mạc, còn CSS là bộ trang phục hàng hiệu lộng lẫy và phụ kiện được mặc lên người ma-nơ-canh đó.',
    initialCode: `<style>
  /* Cú pháp: selector { thuộc-tính: giá-trị; } */
  h1 {
    color: #4f46e5;
    text-align: center;
    font-family: sans-serif;
  }
  p {
    color: #475569;
    font-size: 15px;
    line-height: 1.6;
    background-color: #f8fafc;
    padding: 12px;
    border-radius: 6px;
  }
</style>

<h1>Khám phá Sức mạnh của CSS</h1>
<p>
  Chỉ với vài dòng CSS, văn bản thô đã trở nên trang nhã với màu xanh tím hiện đại, phông chữ gọn gàng và khoảng đệm êm ái!
</p>`,
    lineNotes: [
      { line: 1, tag: '<style>', note: 'Thẻ mở khai báo vùng viết mã CSS nội bộ trực tiếp trong tài liệu HTML.' },
      { line: 2, tag: '/* ... */', note: 'Ghi chú (comment) trong CSS, trình duyệt bỏ qua không thực thi.' },
      { line: 3, tag: 'h1', note: 'Bộ chọn (Selector): Chọn tất cả thẻ <h1> trên trang để áp dụng kiểu dáng.' },
      { line: 4, tag: 'color', note: 'Thuộc tính đổi màu chữ sang tím (#4f46e5).' },
      { line: 5, tag: 'text-align', note: 'Căn giữa tiêu đề ra chính giữa màn hình.' },
      { line: 8, tag: 'p', note: 'Bộ chọn thẻ đoạn văn <p>.' },
      { line: 11, tag: 'padding', note: 'Tạo khoảng đệm lùi chữ vào trong hộp, không bị dính sát mép viền.' },
    ],
    cssProperties: [
      { property: 'color', description: 'Định dạng màu sắc của chữ', values: '#hex, rgb(), tên màu (blue, red)' },
      { property: 'text-align', description: 'Căn chỉnh văn bản theo phương ngang', values: 'left, center, right, justify' },
      { property: 'background-color', description: 'Tô màu nền cho phần tử', values: '#hex, rgba(), transparent' },
      { property: 'padding', description: 'Khoảng đệm trống bên trong đường viền', values: 'px, rem, %' },
      { property: 'border-radius', description: 'Bo tròn các góc của phần tử', values: 'px, %, rem' },
    ],
    browserSteps: [
      { step: 1, title: 'Đọc mã HTML & CSS', lines: [1, 16], text: 'Trình duyệt duyệt cây DOM và nạp các quy tắc trong khối <style>.' },
      { step: 2, title: 'So khớp bộ chọn', lines: [3, 8], text: 'Tìm tất cả phần tử <h1> và <p> trong trang.' },
      { step: 3, title: 'Vẽ giao diện (Painting)', lines: [4, 5, 9, 10, 11], text: 'Áp dụng màu tím, căn giữa và vẽ nền xám nhạt với bo góc.' },
    ],
    consequence: 'Nếu quên dấu chấm phẩy (;) ở cuối mỗi dòng khai báo thuộc tính, toàn bộ các quy tắc phía sau trong cùng khối sẽ bị trình duyệt bỏ qua vì lỗi cú pháp!',
    commonMistakes: [
      {
        title: 'Quên dấu chấm phẩy (;) ở cuối dòng thuộc tính',
        description: 'Mỗi khai báo thuộc tính CSS bắt buộc phải kết thúc bằng dấu chấm phẩy.',
        wrongCode: `h1 {\n  color: red\n  font-size: 20px;\n}`,
        correctCode: `h1 {\n  color: red;\n  font-size: 20px;\n}`,
        explanation: 'Dấu chấm phẩy đóng vai trò ngăn cách các câu lệnh trong khối ngoặc nhọn { }.'
      },
      {
        title: 'Nhầm lẫn giữa dấu hai chấm (:) và dấu bằng (=)',
        description: 'Trong CSS, ngăn cách giữa tên thuộc tính và giá trị là dấu hai chấm, không dùng dấu bằng.',
        wrongCode: `p { color = blue; }`,
        correctCode: `p { color: blue; }`,
        explanation: 'Dấu bằng (=) chỉ dùng cho thuộc tính trong thẻ HTML (class="btn"), còn CSS dùng dấu hai chấm (:).'
      }
    ],
    quiz: [
      {
        id: 'css-q-01-1',
        question: 'Có bao nhiêu cách chính để gắn mã CSS vào trang web?',
        options: ['1 cách duy nhất', '2 cách', '3 cách (Inline, Internal <style>, External file .css)', 'Vô số cách'],
        correctIndex: 2,
        explanation: 'Có 3 cách: Style nội dòng (inline style=""), thẻ <style> trong HTML, và liên kết tệp .css bên ngoài bằng <link>.'
      },
      {
        id: 'css-q-01-2',
        question: 'Dấu nào dùng để ngăn cách giữa tên thuộc tính và giá trị trong CSS?',
        options: ['Dấu bằng (=)', 'Dấu hai chấm (:)', 'Dấu mũi tên (->)', 'Dấu chấm phẩy (;)'],
        correctIndex: 1,
        explanation: 'Cú pháp chuẩn của CSS là: thuộc-tính: giá-trị; ví dụ color: red;.'
      }
    ]
  },

  {
    id: 'css-02-selectors',
    order: 2,
    slug: 'bo-chon-selector-va-do-uu-tien',
    title: 'Bộ chọn CSS: Thẻ, Class, ID, Nhóm, Con cháu & :hover',
    topic: 'Nền tảng',
    tags: ['Selector', '.class', '#id', ':hover', 'Specificity'],
    intro:
      'Bộ chọn (Selector) là chiếc "kính ngắm" giúp bạn nhắm chính xác phần tử HTML nào trên trang cần được trang trí. Bạn có thể chọn theo tên thẻ, theo nhóm class dùng chung, theo ID độc nhất hoặc thậm chí khi người dùng rê chuột vào phần tử (:hover).',
    analogy:
      'Ví von: Bộ chọn thẻ giống như gọi "Tất cả học sinh", Class giống như gọi "Những bạn đeo huy hiệu Đội", còn ID giống như gọi đích danh "Số căn cước 001" độc nhất vô nhị!',
    initialCode: `<style>
  /* 1. Bộ chọn thẻ (Element) */
  p { font-family: sans-serif; color: #64748b; }

  /* 2. Bộ chọn Class (bắt đầu bằng dấu chấm .) */
  .the-noi-bat {
    background: #e0e7ff;
    color: #4338ca;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: bold;
  }

  /* 3. Bộ chọn ID (bắt đầu bằng dấu thăng #) */
  #muc-dac-biet {
    border-left: 4px solid #ef4444;
  }

  /* 4. Trạng thái rê chuột (:hover) */
  .nut-bam {
    display: inline-block;
    background: #6366f1;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    transition: background 0.2s;
  }
  .nut-bam:hover {
    background: #4338ca;
  }
</style>

<p>Đoạn văn bình thường mang kiểu chung.</p>
<div class="the-noi-bat" id="muc-dac-biet">
  Khối này có class .the-noi-bat và ID #muc-dac-biet.
</div>
<br>
<a href="#" class="nut-bam">Rê chuột vào nút này</a>`,
    lineNotes: [
      { line: 2, tag: 'p', note: 'Chọn tất cả phần tử <p>.' },
      { line: 5, tag: '.the-noi-bat', note: 'Dấu chấm (.) chỉ định chọn theo thuộc tính class="the-noi-bat".' },
      { line: 14, tag: '#muc-dac-biet', note: 'Dấu thăng (#) chỉ định chọn duy nhất phần tử có id="muc-dac-biet".' },
      { line: 26, tag: ':hover', note: 'Lớp giả (pseudo-class) kích hoạt khi con trỏ chuột rê lên trên phần tử.' },
    ],
    cssProperties: [
      { property: 'border-left', description: 'Đường viền riêng bên trái phần tử', values: 'độ-dày kiểu màu (4px solid red)' },
      { property: 'text-decoration', description: 'Gạch chân hoặc bỏ gạch chân liên kết', values: 'none, underline' },
      { property: 'display', description: 'Kiểu hiển thị của hộp', values: 'inline, block, inline-block, flex' },
    ],
    browserSteps: [
      { step: 1, title: 'Quét các bộ chọn', lines: [2, 5, 14, 19], text: 'Trình duyệt phân loại các quy tắc theo thứ tự ưu tiên: ID > Class > Thẻ.' },
      { step: 2, title: 'Tính toán Specificity', lines: [5, 14], text: '#muc-dac-biet có độ ưu tiên cao hơn .the-noi-bat nếu có xung đột thuộc tính.' },
      { step: 3, title: 'Lắng nghe tương tác', lines: [26, 27], text: 'Khi chuột rê vào .nut-bam, trình duyệt tự đổi màu nền sang #4338ca.' },
    ],
    consequence: 'Nếu trong file CSS bạn viết class mà quên gõ dấu chấm (viết the-noi-bat thay vì .the-noi-bat), trình duyệt sẽ hiểu nhầm đó là một thẻ HTML tên là <the-noi-bat> và quy tắc sẽ không có tác dụng!',
    commonMistakes: [
      {
        title: 'Gõ thừa dấu chấm trong thuộc tính class của thẻ HTML',
        description: 'Dấu chấm chỉ dùng ở file CSS. Trong HTML chỉ viết tên thuần.',
        wrongCode: `<div class=".hop-tin"> // ❌ Sai! Thừa dấu chấm`,
        correctCode: `<div class="hop-tin"> // ✅ Đúng chuẩn`,
        explanation: 'Trong HTML viết class="hop-tin", còn trong CSS viết .hop-tin { }.'
      },
      {
        title: 'Lạm dụng ID để định kiểu giao diện',
        description: 'ID có độ ưu tiên quá cao khiến việc ghi đè sau này rất khó khăn.',
        wrongCode: `#nut-1 { background: blue; }`,
        correctCode: `.btn-primary { background: blue; }`,
        explanation: 'Hãy luôn ưu tiên dùng Class cho việc tạo kiểu giao diện để dễ dàng tái sử dụng.'
      }
    ],
    quiz: [
      {
        id: 'css-q-02-1',
        question: 'Ký tự nào dùng trước tên để định nghĩa một bộ chọn Class trong CSS?',
        options: ['Dấu thăng (#)', 'Dấu chấm (.)', 'Dấu đô la ($)', 'Dấu sao (*)'],
        correctIndex: 1,
        explanation: 'Dấu chấm (.) biểu thị bộ chọn Class (ví dụ: .noi-bat). Dấu thăng (#) biểu thị ID.'
      },
      {
        id: 'css-q-02-2',
        question: 'Lớp giả nào được kích hoạt khi người dùng rê con trỏ chuột lên phần tử?',
        options: [':focus', ':active', ':hover', ':visited'],
        correctIndex: 2,
        explanation: ':hover kích hoạt khi rê chuột lên; :active khi đang nhấn giữ; :focus khi nhấp chuột vào ô nhập liệu.'
      }
    ]
  },

  // ================= MÀU SẮC VÀ CHỮ (3..5) =================
  {
    id: 'css-03-colors',
    order: 3,
    slug: 'mau-sac-va-nen-color-background',
    title: 'Màu sắc & Nền: Hex, RGB, HSL và Dải màu Gradient',
    topic: 'Màu sắc và chữ',
    tags: ['color', 'background', 'hex', 'rgba', 'gradient'],
    intro:
      'Màu sắc là yếu tố đầu tiên tạo ấn tượng thị giác cho người dùng. CSS cung cấp nhiều cách biểu diễn màu linh hoạt: tên tiếng Anh thông dụng, mã Hex (#ff0000), hàm RGB với độ trong suốt (rgba) và dải màu chuyển tiếp (linear-gradient) thời thượng.',
    analogy:
      'Ví von: RGB giống như ba ống tuýp màu Đỏ, Xanh lá, Xanh dương của họa sĩ: pha trộn tỷ lệ khác nhau để tạo ra hàng triệu sắc màu tuyệt mỹ.',
    initialCode: `<style>
  .the-gradient {
    /* Dải màu chuyển tiếp từ tím sang hồng */
    background: linear-gradient(135deg, #4f46e5, #ec4899);
    color: #ffffff;
    padding: 24px;
    border-radius: 12px;
    font-family: sans-serif;
    text-align: center;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  }
  .the-gradient h2 {
    margin: 0 0 8px 0;
    font-size: 22px;
  }
  .the-gradient p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
</style>

<div class="the-gradient">
  <h2>Khám phá Nghệ thuật Màu sắc</h2>
  <p>Dải màu linear-gradient 135 độ kết hợp giữa tím đậm và hồng tươi tắn.</p>
</div>`,
    lineNotes: [
      { line: 3, tag: 'linear-gradient', note: 'Tạo dải màu chuyển tiếp mượt mà nghiêng góc 135 độ từ #4f46e5 đến #ec4899.' },
      { line: 4, tag: 'color', note: 'Màu chữ trắng sáng (#ffffff) tạo độ tương phản cao trên nền tối.' },
      { line: 9, tag: 'rgba(...)', note: 'Đổ bóng với màu tím có độ trong suốt 30% (alpha = 0.3) cho cảm giác chiều sâu tự nhiên.' },
    ],
    cssProperties: [
      { property: 'color', description: 'Màu sắc chữ viết', values: '#hex, rgb(r, g, b), tên màu' },
      { property: 'background', description: 'Đặt màu nền hoặc ảnh nền tổng hợp', values: 'màu, linear-gradient(...), url(...)' },
      { property: 'opacity', description: 'Độ mờ đục của toàn bộ phần tử', values: '0 (trong suốt) đến 1 (rõ nét)' },
    ],
    browserSteps: [
      { step: 1, title: 'Tính toán góc độ dải màu', lines: [3], text: 'Xác định đường chuyển màu nghiêng góc 135 độ từ góc trên bên trái sang góc dưới bên phải.' },
      { step: 2, title: 'Nội suy màu sắc', lines: [3], text: 'Tính toán các điểm pha màu trung gian liên tục giữa tím và hồng.' },
      { step: 3, title: 'Kết xuất bóng trong suốt', lines: [9], text: 'Vẽ lớp bóng đổ mềm mại dưới đáy hộp bằng kênh alpha rgba.' },
    ],
    consequence: 'Dùng màu chữ có độ tương phản quá thấp so với màu nền (ví dụ chữ xám nhạt trên nền trắng) sẽ khiến người dùng không đọc được nội dung và vi phạm tiêu chuẩn tiếp cận Web A11y!',
    playgroundType: 'colors',
    commonMistakes: [
      {
        title: 'Quên dấu thăng (#) trong mã màu Hex',
        description: 'Mã màu Hex 6 ký tự hoặc 3 ký tự bắt buộc phải có dấu thăng đứng trước.',
        wrongCode: `color: ffffff; // ❌ Trình duyệt không nhận diện được`,
        correctCode: `color: #ffffff; // ✅ Chuẩn mã Hex`,
        explanation: 'Không có dấu thăng, trình duyệt sẽ coi đó là tên màu không hợp lệ.'
      },
      {
        title: 'Nhầm lẫn giữa cú pháp rgb và rgba',
        description: 'Khi cần độ trong suốt alpha, truyền 4 tham số: đỏ, xanh lá, xanh dương và độ mờ từ 0 đến 1.',
        wrongCode: `background: rgb(0, 0, 0, 0.5);`,
        correctCode: `background: rgba(0, 0, 0, 0.5);`,
        explanation: 'rgba có thêm chữ a (Alpha) đại diện cho độ trong suốt từ 0 đến 1.'
      }
    ],
    quiz: [
      {
        id: 'css-q-03-1',
        question: 'Trong hàm rgba(0, 0, 0, 0.5), giá trị 0.5 đại diện cho điều gì?',
        options: ['Độ sáng', 'Kênh màu xanh lá', 'Độ trong suốt (Alpha)', 'Bán kính mờ'],
        correctIndex: 2,
        explanation: 'Ký tự "a" trong rgba là Alpha: 0 là trong suốt hoàn toàn, 1 là mờ đục đặc hoàn toàn.'
      },
      {
        id: 'css-q-03-2',
        question: 'Hàm nào dùng để tạo dải màu chuyển tiếp thẳng trong CSS?',
        options: ['radial-gradient()', 'linear-gradient()', 'color-mix()', 'gradient-linear()'],
        correctIndex: 1,
        explanation: 'linear-gradient() tạo dải màu thẳng theo một góc hoặc hướng nhất định.'
      }
    ]
  },

  {
    id: 'css-04-typography',
    order: 4,
    slug: 'dinh-dang-chu-font-va-text',
    title: 'Định dạng chữ: font-family, font-size, line-height & text-align',
    topic: 'Màu sắc và chữ',
    tags: ['font-family', 'font-size', 'font-weight', 'line-height', 'Typography'],
    intro:
      'Nghệ thuật sắp đặt chữ (Typography) quyết định 90% trải nghiệm đọc của website. Bằng cách chọn bộ phông chữ dễ nhìn, kích cỡ hợp lý, độ đậm ấn tượng và độ cao dòng (line-height) thoáng đãng, bạn sẽ biến trang web thô cứng thành một ấn phẩm đẹp như tạp chí.',
    analogy:
      'Ví von: line-height giống như khoảng cách giữa các dòng kẻ trên trang giấy thi: nếu dòng quá sát nhau chữ sẽ dính líu, dòng quá thưa mắt sẽ bị mỏi khi đọc hết dòng.',
    initialCode: `<style>
  .bai-viet {
    max-width: 420px;
    margin: 0 auto;
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
  .bai-viet h3 {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }
  .bai-viet p {
    font-size: 15px;
    line-height: 1.7; /* Chiều cao dòng thoáng đãng */
    color: #475569;
    text-align: justify;
  }
  .bai-viet strong {
    color: #4f46e5;
  }
</style>

<div class="bai-viet">
  <h3>Nghệ Thuật Sắp Đặt Chữ Hiện Đại</h3>
  <p>
    Khoảng cách dòng <strong>line-height: 1.7</strong> giúp các con chữ có đủ không gian thở, giúp mắt người đọc dễ dàng di chuyển từ cuối dòng này sang đầu dòng tiếp theo mà không bị lạc dòng.
  </p>
</div>`,
    lineNotes: [
      { line: 4, tag: 'font-family', note: 'Danh sách phông chữ ưu tiên theo thứ tự dự phòng: dùng Segoe UI trước, nếu máy thiếu thì dùng system-ui, cuối cùng là sans-serif.' },
      { line: 8, tag: 'font-weight: 700', note: 'Độ đậm của phông chữ (700 = Bold, 400 = Regular).' },
      { line: 10, tag: 'letter-spacing', note: 'Khoảng cách giữa các ký tự chữ (dãn hoặc co chữ).' },
      { line: 15, tag: 'line-height: 1.7', note: 'Khoảng cách giữa các dòng chữ bằng 1.7 lần cỡ chữ, tỷ lệ vàng cho bài đọc dài.' },
    ],
    cssProperties: [
      { property: 'font-family', description: 'Họ phông chữ hiển thị', values: 'sans-serif, serif, monospace, "Tên Font"' },
      { property: 'font-size', description: 'Kích cỡ của chữ', values: 'px, rem, em, %' },
      { property: 'font-weight', description: 'Độ đậm nhạt của chữ', values: 'normal (400), bold (700), 100 - 900' },
      { property: 'line-height', description: 'Khoảng cách chiều cao giữa các dòng', values: '1.5, 1.6, 24px' },
      { property: 'letter-spacing', description: 'Khoảng cách giãn giữa các con chữ', values: 'normal, 1px, -0.5px' },
    ],
    browserSteps: [
      { step: 1, title: 'Tìm kiếm phông chữ hệ thống', lines: [4], text: 'Kiểm tra trên hệ điều hành máy tính xem có phông Segoe UI hoặc phông không chân mặc định không.' },
      { step: 2, title: 'Đo đạc kích thước glyph', lines: [7, 8], text: 'Đo chiều cao chữ 20px với nét đậm 700.' },
      { step: 3, title: 'Chia dòng văn bản', lines: [15], text: 'Căn khoảng cách giữa các dòng văn bản theo tỷ lệ 1.7 để mắt đọc thoải mái.' },
    ],
    consequence: 'Nếu đặt line-height quá nhỏ (như line-height: 0.8), các dòng chữ sẽ đè chồng lấn lên nhau thành một mớ đen kịt không thể đọc nổi!',
    commonMistakes: [
      {
        title: 'Tên phông chữ có dấu cách nhưng quên đặt trong dấu nháy',
        description: 'Tên phông chứa khoảng trắng như "Times New Roman" bắt buộc phải bọc trong dấu nháy.',
        wrongCode: `font-family: Times New Roman, sans-serif;`,
        correctCode: `font-family: 'Times New Roman', sans-serif;`,
        explanation: 'Dấu nháy giúp trình duyệt hiểu đây là tên của một phông chữ duy nhất.'
      },
      {
        title: 'Không cung cấp phông chữ dự phòng generic (fallback)',
        description: 'Luôn kết thúc chuỗi font-family bằng một họ phông chung như sans-serif hoặc serif.',
        wrongCode: `font-family: Roboto;`,
        correctCode: `font-family: Roboto, sans-serif;`,
        explanation: 'Nếu máy tính người dùng chưa cài Roboto, trình duyệt sẽ tự động lùi về phông không chân chuẩn của máy.'
      }
    ],
    quiz: [
      {
        id: 'css-q-04-1',
        question: 'Giá trị nào của line-height thường được khuyến nghị cho đoạn văn bản dài để mắt đọc dễ chịu nhất?',
        options: ['1.0 (sát sạt)', '1.5 đến 1.8 (thoáng đãng)', '3.0 (quá xa)', '0.5'],
        correctIndex: 1,
        explanation: 'line-height từ 1.5 đến 1.8 là tiêu chuẩn công thái học tốt nhất cho mắt đọc trên màn hình điện tử.'
      },
      {
        id: 'css-q-04-2',
        question: 'Giá trị font-weight: 700 tương đương với từ khóa nào?',
        options: ['normal', 'bold', 'lighter', 'italic'],
        correctIndex: 1,
        explanation: '400 tương đương với normal (nét thường), 700 tương đương với bold (nét đậm).'
      }
    ]
  },

  {
    id: 'css-05-units',
    order: 5,
    slug: 'don-vi-do-px-rem-em-vw-vh',
    title: 'Đơn vị đo: Tuyệt đối (px) & Tương đối (%, rem, em, vw, vh)',
    topic: 'Màu sắc và chữ',
    tags: ['px', 'rem', 'em', '%', 'vw', 'vh', 'Đơn vị'],
    intro:
      'Trong CSS, chọn đúng đơn vị đo là chìa khóa để trang web hiển thị vừa vặn trên mọi thiết bị. Đơn vị tuyệt đối (px) cố định không đổi, trong khi đơn vị tương đối (rem, %, vw, vh) có khả năng co giãn linh hoạt theo kích cỡ chữ gốc hoặc kích thước màn hình.',
    analogy:
      'Ví von: px giống như cây thước kẻ bằng gỗ cố định 30cm; còn rem và % giống như chiếc dây chun co giãn theo kích cỡ bàn tay.',
    initialCode: `<style>
  .khung-cha {
    width: 100%;
    max-width: 460px;
    background: #f1f5f9;
    padding: 1.5rem; /* ~24px nếu font gốc là 16px */
    border-radius: 12px;
    font-family: sans-serif;
  }
  .the-con-phan-tram {
    width: 80%; /* Chiếm 80% chiều rộng của khung cha */
    background: #3b82f6;
    color: white;
    padding: 12px;
    border-radius: 6px;
    font-size: 1rem; /* Bằng 1 lần kích cỡ font gốc thẻ html */
    font-weight: bold;
    text-align: center;
  }
</style>

<div class="khung-cha">
  <div class="the-con-phan-tram">
    width: 80% (Co giãn theo cha)
  </div>
</div>`,
    lineNotes: [
      { line: 5, tag: '1.5rem', note: 'rem tính theo kích cỡ font của thẻ gốc <html> (mặc định 16px -> 1.5rem = 24px).' },
      { line: 10, tag: 'width: 80%', note: 'Tỷ lệ phần trăm tính theo bề rộng của phần tử cha chứa nó.' },
      { line: 15, tag: '1rem', note: 'Chuẩn kích cỡ chữ độc lập, không bị ảnh hưởng lồng nhau như em.' },
    ],
    cssProperties: [
      { property: 'width', description: 'Chiều rộng phần tử', values: 'px, %, rem, vw' },
      { property: 'max-width', description: 'Chiều rộng tối đa cho phép', values: 'px, rem, %' },
      { property: 'height', description: 'Chiều cao phần tử', values: 'px, vh, %' },
    ],
    browserSteps: [
      { step: 1, title: 'Đọc cỡ font gốc root (rem)', lines: [5, 15], text: 'Trình duyệt đọc cài đặt font của người dùng (thường là 16px) để quy đổi 1rem = 16px.' },
      { step: 2, title: 'Tính toán phần trăm (%)', lines: [10], text: 'Lấy bề rộng hiện tại của .khung-cha nhân với 0.8 để ra chiều rộng thực tế.' },
      { step: 3, title: 'Tự động thích ứng', lines: [3], text: 'Khi người dùng phóng to font trong trình duyệt, các kích thước dùng rem tự động nở to đều đặn.' },
    ],
    consequence: 'Dùng đơn vị cứng px cho toàn bộ kích thước chữ sẽ khiến người khiếm thị không thể phóng to chữ thông qua cài đặt của trình duyệt, làm giảm khả năng tiếp cận trang web!',
    playgroundType: 'units',
    commonMistakes: [
      {
        title: 'Nhầm lẫn giữa rem và em khi lồng nhau nhiều cấp',
        description: 'em tính theo font của phần tử cha gần nhất, dễ bị cấp số nhân phình to; rem luôn tính theo thẻ gốc <html>.',
        wrongCode: `/* Lồng 3 cấp em: 1.5em * 1.5em * 1.5em chữ bị to khổng lồ */`,
        correctCode: `font-size: 1.25rem; /* Cố định chuẩn theo thẻ gốc */`,
        explanation: 'Khuyên dùng rem cho khoảng cách và cỡ chữ để tránh lỗi nhân đôi kích thước của em.'
      },
      {
        title: 'Viết có dấu cách giữa con số và đơn vị',
        description: 'Trong CSS, số và đơn vị bắt buộc phải viết liền nhau.',
        wrongCode: `width: 100 px; // ❌ Sai cú pháp`,
        correctCode: `width: 100px; // ✅ Viết liền không có dấu cách`,
        explanation: 'Trình duyệt sẽ coi "100 px" là cú pháp lỗi và bỏ qua thuộc tính.'
      }
    ],
    quiz: [
      {
        id: 'css-q-05-1',
        question: '1rem thông thường tương đương bao nhiêu pixel trên trình duyệt mặc định?',
        options: ['10px', '12px', '16px', '20px'],
        correctIndex: 2,
        explanation: 'Kích cỡ chữ mặc định của hầu hết trình duyệt là 16px, do đó 1rem = 16px.'
      },
      {
        id: 'css-q-05-2',
        question: 'Đơn vị 100vw đại diện cho kích thước nào?',
        options: ['100 pixel', '100% chiều cao màn hình', '100% chiều rộng của khung nhìn (Viewport Width)', '100 chữ cái'],
        correctIndex: 2,
        explanation: 'vw là Viewport Width: 1vw = 1% bề ngang cửa sổ trình duyệt, 100vw = toàn bộ bề ngang màn hình.'
      }
    ]
  },

  // ================= HỘP VÀ HÌNH KHỐI (6..7) =================
  {
    id: 'css-06-box-model',
    order: 6,
    slug: 'mo-hinh-hop-box-model',
    title: 'Mô hình hộp (Box Model): Content, Padding, Border, Margin & Box-sizing',
    topic: 'Hộp và hình khối',
    tags: ['Box Model', 'padding', 'margin', 'border', 'box-sizing'],
    intro:
      'Mọi phần tử trên trang web, từ một chữ cái nhỏ đến chiếc banner lớn, đều được trình duyệt coi là một chiếc hộp chữ nhật (Box Model). Chiếc hộp này gồm 4 lớp từ trong ra ngoài: Nội dung (Content), Khoảng đệm (Padding), Đường viền (Border) và Khoảng cách ngoài (Margin).',
    analogy:
      'Ví von: Như gói quà gửi bưu điện: Món quà bên trong là Content, lớp xốp nổ chống sốc là Padding, vỏ hộp các-tông là Border, và khoảng cách giữ an toàn giữa các kiện hàng là Margin!',
    initialCode: `<style>
  * {
    /* Quy tắc vàng: Đảm bảo width bao gồm cả padding và border */
    box-sizing: border-box;
  }
  .hop-qua {
    width: 260px;
    margin: 20px auto; /* Margin căn giữa */
    border: 4px solid #f59e0b; /* Viền vàng */
    padding: 18px; /* Đệm trong */
    background: #ecfdf5; /* Nền xanh lá */
    border-radius: 8px;
    font-family: sans-serif;
    text-align: center;
  }
</style>

<div class="hop-qua">
  <strong style="color: #065f46;">Nội Dung Gói Quà</strong>
  <p style="margin: 6px 0 0 0; font-size: 13px; color: #047857;">
    Nhờ có padding, dòng chữ này không bị chạm sát vào đường viền vàng!
  </p>
</div>`,
    lineNotes: [
      { line: 3, tag: 'box-sizing: border-box', note: 'Quy tắc quan trọng nhất: Giúp tổng chiều rộng luôn đúng 260px, không bị phình to khi thêm padding và border.' },
      { line: 6, tag: 'margin: 20px auto', note: '20px cách trên dưới, auto tự động chia đều khoảng cách 2 bên trái phải để căn giữa khối.' },
      { line: 7, tag: 'border: 4px solid #f59e0b', note: 'Đường viền dày 4px nét liền màu vàng cam.' },
      { line: 8, tag: 'padding: 18px', note: 'Khoảng đệm 18px đẩy nội dung thụt vào trong hộp.' },
    ],
    cssProperties: [
      { property: 'box-sizing', description: 'Cách tính toán kích thước hộp', values: 'border-box (chuẩn), content-box' },
      { property: 'margin', description: 'Khoảng cách đẩy xa các phần tử lân cận', values: 'px, rem, auto' },
      { property: 'padding', description: 'Khoảng đệm từ mép viền vào trong nội dung', values: 'px, rem' },
      { property: 'border', description: 'Đường viền bao quanh hộp', values: 'độ-dày kiểu màu (1px solid #ccc)' },
    ],
    browserSteps: [
      { step: 1, title: 'Đo lường Content Box', lines: [5], text: 'Xác định kích thước vùng chứa nội dung bên trong.' },
      { step: 2, title: 'Cộng dồn Padding & Border', lines: [3, 7, 8], text: 'Với border-box, padding 18px và border 4px được nén gọn vào bên trong tổng width 260px.' },
      { step: 3, title: 'Dịch chuyển theo Margin', lines: [6], text: 'Tạo khoảng trống 20px xung quanh và căn giữa khối trên màn hình.' },
    ],
    consequence: 'Ở chế độ mặc định content-box, một hộp width 100% khi thêm padding 16px sẽ phình thành 100% + 32px và làm xuất hiện thanh cuộn ngang khó chịu!',
    playgroundType: 'box-model',
    commonMistakes: [
      {
        title: 'Nhầm lẫn giữa Margin và Padding',
        description: 'Padding nằm bên TRONG đường viền (có màu nền); Margin nằm bên NGOÀI đường viền (trong suốt).',
        wrongCode: `/* Muốn đẩy chữ cách xa viền nhưng lại dùng margin */\n.box { margin: 20px; }`,
        correctCode: `/* Dùng padding để lùi chữ vào trong hộp */\n.box { padding: 20px; }`,
        explanation: 'Padding tạo không gian cho nội dung bên trong; margin tạo khoảng cách giữa các phần tử với nhau.'
      },
      {
        title: 'Quên khai báo box-sizing: border-box toàn cục',
        description: 'Thiếu quy tắc này khiến kích thước trang web bị lệch tính toán và dễ vỡ layout.',
        wrongCode: `/* Thiếu reset box-sizing */`,
        correctCode: `*, *::before, *::after { box-sizing: border-box; }`,
        explanation: 'Luôn đặt quy tắc này ở dòng đầu tiên của mọi file CSS dự án.'
      }
    ],
    quiz: [
      {
        id: 'css-q-06-1',
        question: 'Khi sử dụng box-sizing: border-box với width: 200px, padding: 20px và border: 5px, tổng bề ngang của phần tử là bao nhiêu?',
        options: ['250px (bị phình)', '200px (đúng bằng width đã đặt)', '225px', '180px'],
        correctIndex: 1,
        explanation: 'border-box gộp padding và border vào trong width, do đó tổng bề rộng luôn giữ cố định đúng 200px.'
      },
      {
        id: 'css-q-06-2',
        question: 'Lớp nào trong mô hình hộp nằm ngoài cùng và hoàn toàn trong suốt?',
        options: ['Padding', 'Border', 'Margin', 'Content'],
        correctIndex: 2,
        explanation: 'Margin nằm ngoài cùng đường viền, có nhiệm vụ cách ly phần tử với các phần tử xung quanh và luôn trong suốt.'
      }
    ]
  },

  {
    id: 'css-07-borders',
    order: 7,
    slug: 'vien-bo-goc-va-do-bong',
    title: 'Viền, bo góc & Đổ bóng: border, border-radius và box-shadow',
    topic: 'Hộp và hình khối',
    tags: ['border-radius', 'box-shadow', 'border', 'Hiệu ứng khối'],
    intro:
      'Giao diện hiện đại không thể thiếu những đường bo góc tròn mềm mại và hiệu ứng đổ bóng mờ ảo tạo chiều sâu 3D (Neumorphism / Card Elevation). Thuộc tính border-radius giúp biến khối vuông thành hình elip hoặc hình tròn hoàn hảo, kết hợp cùng box-shadow giúp các thẻ nổi bật trên bề mặt màn hình.',
    analogy:
      'Ví von: box-shadow giống như bóng đổ của chiếc đồng hồ đeo tay khi ánh đèn bàn chiếu từ trên xuống: bóng càng mờ và to thì cảm giác chiếc đồng hồ càng được nhấc bổng lên cao.',
    initialCode: `<style>
  .the-card {
    max-width: 320px;
    margin: 20px auto;
    background: #ffffff;
    padding: 24px;
    /* Bo tròn góc 16px */
    border-radius: 16px;
    /* Viền mảnh tinh tế */
    border: 1px solid rgba(0, 0, 0, 0.08);
    /* Đổ bóng nhiều lớp tạo chiều sâu */
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    font-family: sans-serif;
    text-align: center;
  }
  .anh-dai-dien {
    width: 64px;
    height: 64px;
    background: #6366f1;
    color: white;
    /* 50% tạo hình tròn hoàn hảo */
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 12px;
  }
</style>

<div class="the-card">
  <div class="anh-dai-dien">H</div>
  <h4 style="margin: 0; color: #1e293b;">Nguyễn Hoàng Nam</h4>
  <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Học viên Lập trình Web</p>
</div>`,
    lineNotes: [
      { line: 7, tag: 'border-radius: 16px', note: 'Bo cong 4 góc của thẻ với bán kính 16px.' },
      { line: 11, tag: 'box-shadow', note: 'Tọa độ X (0), tọa độ Y (10px xuống dưới), độ mờ Blur (25px), độ lan Spread (-5px), màu bóng trong suốt 10%.' },
      { line: 20, tag: 'border-radius: 50%', note: 'Khi chiều rộng và chiều cao bằng nhau, bo tròn 50% sẽ tạo thành một hình tròn hoàn hảo.' },
    ],
    cssProperties: [
      { property: 'border-radius', description: 'Bán kính bo tròn góc', values: 'px, rem, 50% (hình tròn)' },
      { property: 'box-shadow', description: 'Đổ bóng ngoài hoặc bóng trong cho hộp', values: 'x y blur spread color, inset' },
      { property: 'border', description: 'Khai báo gộp đường viền', values: '1px solid #e2e8f0' },
    ],
    browserSteps: [
      { step: 1, title: 'Vẽ khung đường cong viền', lines: [7, 20], text: 'Cắt gọt 4 góc vuông của hộp theo bán kính cong được chỉ định.' },
      { step: 2, title: 'Khuếch tán bóng đổ (Gaussian Blur)', lines: [11], text: 'Vẽ bóng đổ dịch xuống dưới 10px và làm mờ tỏa ra 25px xung quanh.' },
    ],
    consequence: 'Dùng màu bóng đen đặc (box-shadow: 0 10px 20px #000) mà không có độ trong suốt rgba sẽ khiến bóng đen ngòm như vết mực loang, làm giao diện rất xấu và nặng nề!',
    playgroundType: 'borders',
    commonMistakes: [
      {
        title: 'Muốn tạo hình tròn bằng border-radius: 50% nhưng width và height không bằng nhau',
        description: 'Nếu width khác height, border-radius: 50% sẽ tạo thành hình elip (hình quả trứng) chứ không thành hình tròn.',
        wrongCode: `width: 100px; height: 60px; border-radius: 50%; // Ra hình elip`,
        correctCode: `width: 80px; height: 80px; border-radius: 50%; // Ra hình tròn chuẩn`,
        explanation: 'Muốn có hình tròn hoàn hảo, chiều ngang và chiều dọc phải bằng nhau 1:1.'
      },
      {
        title: 'Viết sai thứ tự tham số của box-shadow',
        description: 'Thứ tự chuẩn là: offset-x offset-y blur-radius spread-radius color.',
        wrongCode: `box-shadow: red 10px 5px;`,
        correctCode: `box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);`,
        explanation: 'Nên ghi tọa độ X Y trước rồi đến độ mờ và màu sắc.'
      }
    ],
    quiz: [
      {
        id: 'css-q-07-1',
        question: 'Để biến một ảnh vuông (100px x 100px) thành một hình tròn hoàn hảo, ta dùng thuộc tính nào?',
        options: ['circle: true;', 'border-radius: 50%;', 'shape: round;', 'border: round;'],
        correctIndex: 1,
        explanation: 'border-radius: 50% trên phần tử hình vuông sẽ cắt gọt 4 góc thành một hình tròn chuẩn.'
      },
      {
        id: 'css-q-07-2',
        question: 'Trong box-shadow: 0 4px 12px rgba(0,0,0,0.1), số 12px đại diện cho thông số gì?',
        options: ['Tọa độ dịch ngang X', 'Tọa độ dịch dọc Y', 'Bán kính làm mờ (Blur radius)', 'Độ lan rộng (Spread)'],
        correctIndex: 2,
        explanation: 'Tham số thứ ba (12px) là bán kính làm mờ Gaussian (blur radius): số càng lớn thì bóng càng tỏa mềm mại.'
      }
    ]
  },

  // ================= BỐ CỤC (8..10) =================
  {
    id: 'css-08-display-position',
    order: 8,
    slug: 'display-va-position',
    title: 'Display & Position: Block, Inline, Relative, Absolute, Fixed & Sticky',
    topic: 'Bố cục',
    tags: ['display', 'position', 'relative', 'absolute', 'fixed', 'sticky'],
    intro:
      'display quy định phần tử cư xử như một dòng chữ (inline) hay một khối chiếm trọn cả hàng (block). Còn position cho phép bạn nhấc phần tử ra khỏi dòng chảy tự nhiên và ghim cố định ở một tọa độ mong muốn như huy hiệu giảm giá góc ảnh hay thanh menu dính chặt trên đầu trang.',
    analogy:
      'Ví von: static như người đứng xếp hàng bình thường; relative như bước lệch một bước so với chỗ cũ; absolute như chiếc huy hiệu được ghim cố định vào áo của bạn; còn fixed như biển tên gắn chặt trên kính lái ô tô.',
    initialCode: `<style>
  .khung-cha-relative {
    position: relative; /* Làm mốc tọa độ neo */
    width: 280px;
    height: 140px;
    background: #f8fafc;
    border: 2px dashed #94a3b8;
    border-radius: 10px;
    padding: 16px;
    font-family: sans-serif;
  }
  .huy-hieu-absolute {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: bold;
    padding: 4px 10px;
    border-radius: 20px;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  }
</style>

<div class="khung-cha-relative">
  <span class="huy-hieu-absolute">HOT - GIẢM 50%</span>
  <h4 style="margin: 0; color: #1e293b;">Khóa học CSS Pro</h4>
  <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b;">
    Huy hiệu đỏ dùng position: absolute neo vào góc trên phải của khung cha relative.
  </p>
</div>`,
    lineNotes: [
      { line: 2, tag: 'position: relative', note: 'Đặt mốc neo tọa độ cho các phần tử con bên trong sử dụng absolute.' },
      { line: 12, tag: 'position: absolute', note: 'Thoát khỏi dòng chảy bình thường và bay tới tọa độ top: -10px, right: -10px.' },
    ],
    cssProperties: [
      { property: 'display', description: 'Cách thức hiển thị phần tử', values: 'block, inline, inline-block, none' },
      { property: 'position', description: 'Cơ chế định vị tọa độ phần tử', values: 'static, relative, absolute, fixed, sticky' },
      { property: 'top / right / bottom / left', description: 'Tọa độ định vị theo 4 hướng', values: 'px, %, rem' },
      { property: 'z-index', description: 'Thứ tự xếp lớp trước/sau theo trục sâu Z', values: 'số nguyên (1, 10, 999)' },
    ],
    browserSteps: [
      { step: 1, title: 'Tạo ngữ cảnh định vị (Positioning Context)', lines: [2], text: 'Khung cha relative trở thành gốc tọa độ (0, 0) cho thẻ con.' },
      { step: 2, title: 'Tính toán tọa độ absolute', lines: [12, 13, 14], text: 'Đặt huy hiệu bay ra ngoài góc trên bên phải 10px so với mép khung cha.' },
    ],
    consequence: 'Nếu dùng position: absolute ở thẻ con nhưng quên đặt position: relative ở thẻ cha, thẻ con sẽ bay thẳng ra mép ngoài cùng của toàn bộ cửa sổ trình duyệt!',
    playgroundType: 'display-position',
    commonMistakes: [
      {
        title: 'Quên đặt position: relative ở phần tử cha',
        description: 'Muốn con căn theo cha, cha bắt buộc phải có position (thường là relative).',
        wrongCode: `.cha { /* Quên position */ }\n.con { position: absolute; top: 0; }`,
        correctCode: `.cha { position: relative; }\n.con { position: absolute; top: 0; }`,
        explanation: 'Không có relative ở cha, absolute sẽ tìm ngược lên thẻ <body> ngoài cùng.'
      },
      {
        title: 'Nhầm lẫn giữa display: none và visibility: hidden',
        description: 'display: none xóa bỏ phần tử khỏi trang (không chiếm chỗ); visibility: hidden chỉ ẩn đi nhưng vẫn giữ nguyên khoảng trống.',
        wrongCode: `/* Muốn ẩn hoàn toàn không chiếm chỗ nhưng dùng visibility: hidden */`,
        correctCode: `display: none; /* Biến mất hoàn toàn và co lại */`,
        explanation: 'Dùng display: none khi muốn phần tử biến mất và nhường lại diện tích cho phần tử khác.'
      }
    ],
    quiz: [
      {
        id: 'css-q-08-1',
        question: 'Muốn tạo thanh menu luôn ghim chặt ở đầu màn hình ngay cả khi cuộn trang xuống dưới cùng, ta dùng giá trị position nào?',
        options: ['position: relative', 'position: static', 'position: fixed (hoặc sticky)', 'position: inherit'],
        correctIndex: 2,
        explanation: 'position: fixed ghim phần tử cố định theo khung nhìn của màn hình trình duyệt, không bị trôi khi cuộn trang.'
      },
      {
        id: 'css-q-08-2',
        question: 'Phần tử có display: block có đặc điểm gì?',
        options: ['Chỉ chiếm bề ngang vừa khít với chữ', 'Tự động chiếm trọn 100% bề ngang và đẩy phần tử tiếp theo xuống dòng', 'Không thể đặt width và height', 'Luôn căn giữa'],
        correctIndex: 1,
        explanation: 'Phần tử block (như <div>, <p>, <h1>) luôn chiếm trọn 100% chiều ngang hàng và ngắt dòng mới.'
      }
    ]
  },

  {
    id: 'css-09-flexbox',
    order: 9,
    slug: 'flexbox-bo-cuc-linh-hoat',
    title: 'Flexbox: Bố cục một chiều linh hoạt, căn giữa và dãn đều',
    topic: 'Bố cục',
    tags: ['Flexbox', 'display: flex', 'justify-content', 'align-items', 'gap'],
    intro:
      'Flexbox (Flexible Box Layout) là bước đột phá vĩ đại nhất của bố cục CSS hiện đại. Trước khi có Flexbox, việc căn giữa một phần tử theo cả chiều ngang lẫn chiều dọc là nỗi ám ảnh của mọi lập trình viên. Với display: flex, bạn chỉ cần 3 dòng mã là giải quyết xong mọi bài toán căn chỉnh hàng ngang/dọc.',
    analogy:
      'Ví von: Flexbox như hàng ghế xe buýt thông minh: các hành khách tự động dãn đều khoảng cách chỗ ngồi vừa khít với số lượng người trên xe.',
    initialCode: `<style>
  .thanh-dieu-huong {
    display: flex; /* Biến thành khung Flex Container */
    justify-content: space-between; /* Dãn đều 2 đầu mép */
    align-items: center; /* Căn giữa trục dọc */
    background: #1e1b4b;
    padding: 12px 20px;
    border-radius: 10px;
    font-family: sans-serif;
  }
  .logo {
    color: #ffffff;
    font-weight: 800;
    font-size: 18px;
  }
  .menu-links {
    display: flex;
    gap: 16px; /* Khoảng cách giữa các nút */
  }
  .menu-links a {
    color: #c7d2fe;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }
</style>

<nav class="thanh-dieu-huong">
  <div class="logo">⚡ HTMLive</div>
  <div class="menu-links">
    <a href="#">Trang chủ</a>
    <a href="#">Khóa học</a>
    <a href="#">Tra cứu</a>
  </div>
</nav>`,
    lineNotes: [
      { line: 2, tag: 'display: flex', note: 'Kích hoạt mô hình Flexbox, các phần tử con tự động dàn thành hàng ngang.' },
      { line: 3, tag: 'justify-content: space-between', note: 'Đẩy Logo sang sát mép trái và cụm menu sang sát mép phải.' },
      { line: 4, tag: 'align-items: center', note: 'Căn giữa các phần tử theo trục dọc (chiều cao) hoàn hảo.' },
      { line: 16, tag: 'gap: 16px', note: 'Tạo khoảng cách 16px đồng đều giữa các mục menu mà không cần tính margin.' },
    ],
    cssProperties: [
      { property: 'display: flex', description: 'Kích hoạt bố cục Flexbox cho khung cha', values: 'flex, inline-flex' },
      { property: 'flex-direction', description: 'Hướng dàn các phần tử con', values: 'row (ngang), column (dọc), row-reverse' },
      { property: 'justify-content', description: 'Căn chỉnh phần tử trên trục chính (Main Axis)', values: 'flex-start, center, flex-end, space-between, space-around' },
      { property: 'align-items', description: 'Căn chỉnh phần tử trên trục phụ (Cross Axis)', values: 'stretch, center, flex-start, flex-end' },
      { property: 'gap', description: 'Khoảng cách giữa các phần tử con', values: 'px, rem' },
    ],
    browserSteps: [
      { step: 1, title: 'Kích hoạt Flex Context', lines: [2], text: 'Tạo trục chính (Main Axis nằm ngang) và trục phụ (Cross Axis thẳng đứng).' },
      { step: 2, title: 'Phân bổ không gian trống', lines: [3], text: 'justify-content: space-between gom toàn bộ khoảng trống còn lại đặt vào giữa logo và menu.' },
      { step: 3, title: 'Căn đều trục dọc', lines: [4], text: 'Tự động tính toán đường trung trực của khung để căn logo và menu thẳng hàng.' },
    ],
    consequence: 'Nếu dùng float cũ thay vì flexbox, bạn sẽ phải dùng thêm clearfix phức tạp và giao diện rất dễ bị vỡ khi kích cỡ màn hình thay đổi!',
    playgroundType: 'flexbox',
    commonMistakes: [
      {
        title: 'Đặt display: flex ở thẻ con thay vì thẻ cha',
        description: 'display: flex phải được gán vào phần tử CHA bọc ngoài để điều khiển các phần tử con bên trong.',
        wrongCode: `.item-con { display: flex; } // Muốn dàn hàng ngang các item`,
        correctCode: `.khung-cha { display: flex; } // Đặt ở cha`,
        explanation: 'Thẻ cha là Flex Container, các thẻ trực thuộc bên trong là Flex Items.'
      },
      {
        title: 'Nhầm lẫn giữa justify-content và align-items',
        description: 'Mặc định (flex-direction: row): justify-content căn theo chiều NGANG, align-items căn theo chiều DỌC.',
        wrongCode: `/* Muốn căn giữa ngang nhưng lại dùng align-items: center */`,
        correctCode: `justify-content: center; /* Căn giữa trục ngang chính */`,
        explanation: 'Nhớ mẹo: Justify là trục chính (Main), Align là trục phụ (Cross).'
      }
    ],
    quiz: [
      {
        id: 'css-q-09-1',
        question: 'Công thức thần thánh để căn một phần tử vào chính giữa tâm màn hình (cả chiều ngang lẫn dọc) với Flexbox là gì?',
        options: [
          'display: flex; justify-content: center; align-items: center;',
          'margin: center; text-align: center;',
          'position: center;',
          'display: inline; center: true;'
        ],
        correctIndex: 0,
        explanation: 'Chỉ cần display: flex kết hợp justify-content: center và align-items: center là phần tử nằm chính giữa tâm.'
      },
      {
        id: 'css-q-09-2',
        question: 'Thuộc tính nào giúp tạo khoảng hở đồng đều giữa các phần tử flex mà không cần chỉnh margin từng thẻ?',
        options: ['space', 'gap', 'margin-between', 'distance'],
        correctIndex: 1,
        explanation: 'gap là thuộc tính hiện đại cực kỳ tiện lợi để tạo khoảng trống giữa các phần tử flex và grid.'
      }
    ]
  },

  {
    id: 'css-10-grid',
    order: 10,
    slug: 'css-grid-luoi-hai-chieu',
    title: 'CSS Grid: Bố cục lưới hai chiều mạnh mẽ theo hàng và cột',
    topic: 'Bố cục',
    tags: ['CSS Grid', 'display: grid', 'grid-template-columns', 'fr', 'span'],
    intro:
      'Trong khi Flexbox là bậc thầy của bố cục một chiều (hoặc một hàng, hoặc một cột), thì CSS Grid là vị vua thống trị bố cục hai chiều (đồng thời cả hàng lẫn cột). Với đơn vị phân số fr linh hoạt, bạn có thể chia màn hình thành 12 cột, tạo layout tạp chí hoặc thư viện ảnh thẻ chỉ với một dòng khai báo.',
    analogy:
      'Ví von: CSS Grid giống như chiếc tủ chia ô thuốc hoặc bàn cờ ca rô: bạn chỉ định rõ ô nào nằm ở cột mấy, hàng mấy và chiếm bao nhiêu ô.',
    initialCode: `<style>
  .luoi-anh {
    display: grid;
    /* 3 cột có bề rộng bằng nhau (1fr = 1 phần phân số) */
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    font-family: sans-serif;
  }
  .the-anh {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    font-weight: bold;
    color: #334155;
  }
  .the-noi-bat {
    /* Mở rộng chiếm 2 cột */
    grid-column: span 2;
    background: #e0e7ff;
    color: #4338ca;
    border-color: #a5b4fc;
  }
</style>

<div class="luoi-anh">
  <div class="the-anh the-noi-bat">Tin Nổi Bật (Chiếm 2 cột)</div>
  <div class="the-anh">Tin 2</div>
  <div class="the-anh">Tin 3</div>
  <div class="the-anh">Tin 4</div>
  <div class="the-anh">Tin 5</div>
</div>`,
    lineNotes: [
      { line: 2, tag: 'display: grid', note: 'Kích hoạt hệ thống lưới 2 chiều.' },
      { line: 4, tag: 'repeat(3, 1fr)', note: 'Chia đều thành 3 cột, mỗi cột chiếm 1 phần phân số (fr) bằng nhau.' },
      { line: 17, tag: 'grid-column: span 2', note: 'Ra lệnh cho ô này trải dài qua 2 cột liên tiếp.' },
    ],
    cssProperties: [
      { property: 'display: grid', description: 'Kích hoạt hệ thống bố cục lưới 2 chiều', values: 'grid, inline-grid' },
      { property: 'grid-template-columns', description: 'Định nghĩa số lượng và bề rộng của các cột', values: 'repeat(3, 1fr), 200px 1fr 2fr' },
      { property: 'grid-column', description: 'Chỉ định vị trí hoặc số cột một ô chiếm dụng', values: 'span 2, 1 / 3' },
      { property: 'gap', description: 'Khoảng cách giữa các cột và hàng trong lưới', values: '16px, 1rem' },
    ],
    browserSteps: [
      { step: 1, title: 'Chia rãnh lưới (Grid Tracks)', lines: [4], text: 'Chia tổng chiều rộng lưới thành 3 cột đều nhau với tỷ lệ 1fr.' },
      { step: 2, title: 'Xếp vị trí ô mở rộng', lines: [17], text: 'Đặt phần tử có grid-column: span 2 chiếm trọn 2 rãnh cột đầu tiên.' },
      { step: 3, title: 'Tự động dàn ô tiếp theo (Auto-placement)', lines: [5], text: 'Tự động đẩy các ô còn lại vào các ô trống tiếp theo theo thứ tự.' },
    ],
    consequence: 'Dùng bảng <table> để dàn bố cục thay vì CSS Grid sẽ làm mã nguồn HTML nặng nề, khó sửa đổi và vi phạm tiêu chuẩn thiết kế hiện đại!',
    playgroundType: 'grid',
    commonMistakes: [
      {
        title: 'Nhầm lẫn giữa repeat(3, 1fr) và 3fr',
        description: 'grid-template-columns: 3fr chỉ tạo ra DUY NHẤT 1 cột. Muốn 3 cột phải viết repeat(3, 1fr) hoặc 1fr 1fr 1fr.',
        wrongCode: `grid-template-columns: 3fr; // Chỉ tạo 1 cột!`,
        correctCode: `grid-template-columns: repeat(3, 1fr); // Tạo 3 cột đều nhau`,
        explanation: 'repeat(số_cột, kích_thước) là hàm tiện ích viết ngắn gọn trong CSS Grid.'
      },
      {
        title: 'Dùng CSS Grid khi chỉ cần dàn thanh điều hướng 1 chiều',
        description: 'Với menu 1 hàng ngang, Flexbox đơn giản và nhẹ nhàng hơn CSS Grid.',
        wrongCode: `/* Dùng grid cho thanh breadcrumb 1 hàng */`,
        correctCode: `/* Ưu tiên flex cho bố cục 1 chiều, grid cho lưới 2 chiều */`,
        explanation: 'Quy tắc chọn: 1 chiều (ngang hoặc dọc) chọn Flexbox; 2 chiều (cả hàng lẫn cột) chọn Grid.'
      }
    ],
    quiz: [
      {
        id: 'css-q-10-1',
        question: 'Đơn vị "fr" trong CSS Grid viết tắt của từ gì?',
        options: ['Frame', 'Fraction (Phân số)', 'Free', 'Front'],
        correctIndex: 1,
        explanation: 'fr là viết tắt của Fraction (phần phân số của không gian còn trống trong khung lưới).'
      },
      {
        id: 'css-q-10-2',
        question: 'Thuộc tính grid-column: span 2 có ý nghĩa gì?',
        options: ['Thu nhỏ ô lại 2 lần', 'Ô đó sẽ trải dài chiếm 2 cột liên tiếp', 'Tạo ra thêm 2 cột mới', 'Chờ 2 giây'],
        correctIndex: 1,
        explanation: 'span 2 ra lệnh cho phần tử kéo dài qua 2 cột trong hệ thống lưới.'
      }
    ]
  },

  // ================= CHUYỂN ĐỘNG VÀ RESPONSIVE (11..12) =================
  {
    id: 'css-11-animations',
    order: 11,
    slug: 'hieu-ung-transition-transform-animation',
    title: 'Chuyển động & Hiệu ứng: transition, transform, @keyframes',
    topic: 'Chuyển động và responsive',
    tags: ['transition', 'transform', '@keyframes', 'animation'],
    intro:
      'Chuyển động mượt mà biến trang web từ tĩnh lặng buồn ngủ thành một trải nghiệm sống động đầy tương tác. Thuộc tính transition tạo cảm giác mượt mà khi đổi màu nút bấm, transform cho phép xoay/phóng to/thu nhỏ thần tốc nhờ tăng tốc phần cứng GPU, còn @keyframes mở ra thế giới hoạt ảnh vô tận.',
    analogy:
      'Ví von: transition như cánh cửa phòng có gắn piston giảm chấn: khi buông tay nó khép lại êm ái chứ không bị sập uỳnh một cái như công tắc điện.',
    initialCode: `<style>
  @keyframes nhip-tim {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }

  .nut-trai-tim {
    background: #f43f5e;
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 30px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    font-family: sans-serif;
    /* Chuyển động mượt 0.3 giây */
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(244, 63, 94, 0.4);
    /* Lặp hoạt ảnh liên tục */
    animation: nhip-tim 2s infinite ease-in-out;
  }

  .nut-trai-tim:hover {
    background: #e11d48;
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 20px rgba(244, 63, 94, 0.6);
  }
</style>

<div style="text-align: center; padding: 20px;">
  <button class="nut-trai-tim">
    ❤️ Yêu thích HTMLive
  </button>
</div>`,
    lineNotes: [
      { line: 1, tag: '@keyframes', note: 'Định nghĩa chuỗi hoạt ảnh nhip-tim với các mốc thời gian 0%, 50%, 100%.' },
      { line: 17, tag: 'transition: all 0.3s ease', note: 'Báo cho trình duyệt biết mọi biến đổi trạng thái cần chuyển tiếp mượt mà trong 0.3 giây.' },
      { line: 20, tag: 'animation: nhip-tim 2s infinite', note: 'Gán hoạt ảnh chạy lặp vô tận mỗi chu kỳ 2 giây.' },
      { line: 25, tag: 'transform: translateY(-3px)', note: 'Nhấc nhẹ nút bấm lên cao 3px khi rê chuột vào.' },
    ],
    cssProperties: [
      { property: 'transition', description: 'Thời gian và gia tốc chuyển đổi mượt mà', values: 'all 0.3s ease, background 0.2s' },
      { property: 'transform', description: 'Biến đổi hình học (xoay, phóng to, dời chỗ)', values: 'scale(1.1), rotate(45deg), translateY(-5px)' },
      { property: '@keyframes', description: 'Định nghĩa kịch bản hoạt ảnh theo thời gian', values: '@keyframes tên { 0% { } 100% { } }' },
      { property: 'animation', description: 'Áp dụng kịch bản hoạt ảnh vào phần tử', values: 'tên thời-gian lặp (bounce 1s infinite)' },
    ],
    browserSteps: [
      { step: 1, title: 'Kích hoạt bộ gia tốc đồ họa (GPU Composite)', lines: [17, 25], text: 'Thuộc tính transform được GPU xử lý riêng biệt, chạy cực kỳ mượt mà 60 FPS mà không làm đơ trang.' },
      { step: 2, title: 'Nội suy khung hình @keyframes', lines: [1, 2, 3], text: 'Trình duyệt tính toán các khung hình trung gian giữa 1.0 và 1.15 để tạo nhịp đập phập phồng.' },
    ],
    consequence: 'Dùng thuộc tính top hoặc left để tạo chuyển động thay vì transform: translateY() sẽ buộc trình duyệt phải tính toán lại bố cục (reflow) liên tục, gây giật lag trên điện thoại yếu!',
    playgroundType: 'animations',
    commonMistakes: [
      {
        title: 'Thiếu đơn vị thời gian (s hoặc ms) trong transition',
        description: 'Thời gian chuyển động bắt buộc phải có đuôi s (giây) hoặc ms (mili-giây).',
        wrongCode: `transition: all 0.3; // ❌ Thiếu chữ s`,
        correctCode: `transition: all 0.3s; // ✅ Có chữ s`,
        explanation: 'Không có đơn vị thời gian, trình duyệt sẽ coi câu lệnh là vô hiệu.'
      },
      {
        title: 'Đặt thời gian hoạt ảnh quá lâu gây cảm giác ì ạch',
        description: 'Thời gian hover nút bấm lý tưởng là 0.15s - 0.3s. Đặt 2s sẽ khiến người dùng cảm thấy web bị chậm chạp.',
        wrongCode: `transition: all 2s; // Quá chậm chạp`,
        correctCode: `transition: all 0.2s ease-in-out; // Nhanh nhạy tinh tế`,
        explanation: 'Micro-interactions trên giao diện người dùng chỉ nên kéo dài từ 150ms đến 300ms.'
      }
    ],
    quiz: [
      {
        id: 'css-q-11-1',
        question: 'Thuộc tính transform nào dùng để phóng to hoặc thu nhỏ kích thước của phần tử?',
        options: ['rotate()', 'scale()', 'skew()', 'translate()'],
        correctIndex: 1,
        explanation: 'scale(1.2) phóng to 120%, scale(0.8) thu nhỏ lại 80%.'
      },
      {
        id: 'css-q-11-2',
        question: 'Từ khóa nào dùng trong thuộc tính animation để hoạt ảnh lặp lại mãi mãi không dừng?',
        options: ['always', 'loop', 'infinite', 'forever'],
        correctIndex: 2,
        explanation: 'animation: ten-hoat-anh 2s infinite; sẽ khiến hoạt ảnh lặp đi lặp lại vô tận.'
      }
    ]
  },

  {
    id: 'css-12-responsive',
    order: 12,
    slug: 'thiet-ke-responsive-va-media-queries',
    title: 'Thiết kế Responsive: @media, Mobile-first & Co giãn linh hoạt',
    topic: 'Chuyển động và responsive',
    tags: ['Responsive', '@media', 'Mobile-first', 'max-width', 'Tương thích'],
    intro:
      'Người dùng truy cập trang web của bạn từ hàng ngàn loại thiết bị: từ màn hình máy tính 32 inch, laptop, máy tính bảng đến điện thoại di động nhỏ gọn. Thiết kế đáp ứng (Responsive Web Design) kết hợp cùng quy tắc truy vấn truyền thông (@media) giúp trang web tự động biến hóa bố cục vừa vặn với bất kỳ kích thước màn hình nào.',
    analogy:
      'Ví von: Như dòng nước trong triết lý của Lý Tiểu Long: "Đổ nước vào cốc, nước biến thành chiếc cốc; đổ nước vào bình trà, nước biến thành bình trà". Trang web responsive tự động chảy vừa vặn vào mọi khuôn màn hình!',
    initialCode: `<style>
  /* 1. Mặc định cho màn hình máy tính lớn (Desktop) */
  .hop-san-pham {
    display: flex;
    gap: 16px;
    font-family: sans-serif;
  }
  .cot {
    flex: 1;
    background: #eef2ff;
    border: 2px solid #6366f1;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    font-weight: bold;
    color: #4338ca;
  }

  /* 2. Điểm ngắt Responsive khi màn hình nhỏ hơn 600px (Điện thoại) */
  @media (max-width: 600px) {
    .hop-san-pham {
      flex-direction: column; /* Đổi thành cột dọc để không bị chật */
    }
  }
</style>

<div class="hop-san-pham">
  <div class="cot">Khối A (Cột 1)</div>
  <div class="cot">Khối B (Cột 2)</div>
</div>`,
    lineNotes: [
      { line: 3, tag: 'display: flex', note: 'Trên máy tính, 2 khối nằm ngang cạnh nhau.' },
      { line: 17, tag: '@media (max-width: 600px)', note: 'Điểm ngắt (Breakpoint): Khi bề ngang màn hình nhỏ hơn hoặc bằng 600px thì kích hoạt khối mã bên trong.' },
      { line: 19, tag: 'flex-direction: column', note: 'Chuyển đổi hướng dàn từ hàng ngang thành cột dọc để người xem điện thoại dễ đọc.' },
    ],
    cssProperties: [
      { property: '@media', description: 'Quy tắc truy vấn truyền thông theo kích thước', values: '@media (max-width: 768px), (min-width: 1024px)' },
      { property: 'max-width', description: 'Bề rộng màn hình tối đa để quy tắc có hiệu lực', values: '600px, 768px, 1024px' },
      { property: 'flex-direction', description: 'Đổi hướng dàn linh hoạt khi co màn hình', values: 'row, column' },
    ],
    browserSteps: [
      { step: 1, title: 'Lắng nghe kích thước khung nhìn (Viewport Resize)', lines: [17], text: 'Trình duyệt liên tục theo dõi chiều rộng màn hình thiết bị.' },
      { step: 2, title: 'Kích hoạt quy tắc @media', lines: [18, 19], text: 'Nếu màn hình <= 600px, áp dụng ngay flex-direction: column và xếp chồng 2 khối lên nhau.' },
    ],
    consequence: 'Nếu thiếu thẻ <meta name="viewport" content="width=device-width, initial-scale=1.0"> trong thẻ <head>, quy tắc @media trên điện thoại sẽ không được kích hoạt chuẩn xác!',
    playgroundType: 'responsive',
    commonMistakes: [
      {
        title: 'Đặt kích thước chiều rộng cố định (width: 900px)',
        description: 'Đặt width: 900px cố định sẽ khiến điện thoại màn hình 375px bị tràn khung và sinh thanh cuộn ngang vỡ nát giao diện.',
        wrongCode: `width: 900px; // ❌ Cứng ngắc`,
        correctCode: `width: 100%; max-width: 900px; // ✅ Co giãn an toàn`,
        explanation: 'Luôn kết hợp width: 100% với max-width để giao diện tự co lại trên điện thoại nhỏ.'
      },
      {
        title: 'Quên cho ảnh co giãn tối đa 100% (max-width: 100%)',
        description: 'Ảnh kích thước lớn sẽ đâm thủng màn hình nếu không có quy tắc co giãn.',
        wrongCode: `img { /* Không khai báo max-width */ }`,
        correctCode: `img { max-width: 100%; height: auto; }`,
        explanation: 'Quy tắc vàng cho ảnh responsive: max-width: 100% và height: auto.'
      }
    ],
    quiz: [
      {
        id: 'css-q-12-1',
        question: 'Cú pháp nào dùng để viết luật CSS chỉ áp dụng khi bề ngang màn hình từ 768px trở xuống?',
        options: ['@media (max-width: 768px)', '@media (min-width: 768px)', '@screen mobile', '@mobile 768px'],
        correctIndex: 0,
        explanation: 'max-width: 768px nghĩa là từ 0 đến tối đa 768px (các thiết bị máy tính bảng và điện thoại).'
      },
      {
        id: 'css-q-12-2',
        question: 'Quy tắc vàng nào giúp ảnh không bao giờ bị tràn vỡ khung màn hình điện thoại?',
        options: ['img { width: 500px; }', 'img { max-width: 100%; height: auto; }', 'img { display: inline; }', 'img { overflow: visible; }'],
        correctIndex: 1,
        explanation: 'img { max-width: 100%; height: auto; } đảm bảo ảnh tự thu nhỏ vừa khít với bề ngang màn hình mà không bị méo tỷ lệ.'
      }
    ]
  }
];

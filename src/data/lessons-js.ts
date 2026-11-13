import { Lesson } from '../types/learning';

export const JS_LESSONS: Lesson[] = [
  // BÀI 1
  {
    id: 1,
    order: 1,
    slug: 'js-la-gi-va-cach-chen-js',
    title: 'JavaScript là gì? Cách chèn JS vào trang',
    topic: 'Nền tảng & Cú pháp',
    tags: ['<script>', 'console.log', 'alert', 'Cơ bản'],
    intro:
      'JavaScript (viết tắt là JS) là ngôn ngữ lập trình chạy trực tiếp trên trình duyệt, biến những trang web tĩnh thành những ứng dụng sống động, tương tác và thông minh.',
    analogy:
      'Hãy tưởng tượng trang web như cơ thể con người: HTML là bộ khung xương vững chắc, CSS là làn da và bộ trang phục đẹp mắt, còn JavaScript chính là bộ não và các cơ bắp giúp bạn di chuyển, suy nghĩ và phản xạ khi có ai đó chạm vào!',
    initialCode: `// 1. In thông điệp ra Bảng điều khiển (Console)
console.log("Xin chào! Tôi là JavaScript.");
console.log("Học lập trình thật thú vị!");

// 2. Tính toán thử một phép tính đơn giản
console.log("Kết quả của 10 + 25 là:", 10 + 25);

// 3. Hiển thị thông báo (Hộp thoại alert)
alert("Chào mừng bạn đến với khóa học JavaScript cơ bản!");
`,
    lineNotes: [
      { line: 1, tag: '//', note: 'Dấu hai gạch chéo dùng để viết chú thích (comment), máy tính sẽ bỏ qua không chạy dòng này.' },
      { line: 2, tag: 'console.log', note: 'Lệnh in thông tin ra cửa sổ Console để lập trình viên kiểm tra kết quả.' },
      { line: 6, tag: '10 + 25', note: 'JavaScript có thể tự động tính toán các biểu thức toán học và in ra kết quả số 35.' },
      { line: 9, tag: 'alert(...)', note: 'Lệnh tạo hộp thoại thông báo bật lên màn hình người dùng.' }
    ],
    commonMistakes: [
      {
        title: 'Viết hoa chữ cái đầu của console.log',
        description: 'JavaScript phân biệt chữ hoa và chữ thường rất nghiêm ngặt.',
        wrongCode: 'Console.log("Chào bạn"); // ❌ Lỗi ReferenceError: Console is not defined',
        correctCode: 'console.log("Chào bạn"); // ✅ Viết thường toàn bộ chữ console',
        explanation: 'Mọi từ khóa cơ bản của JavaScript như console, alert, let, const đều phải viết chữ thường.'
      },
      {
        title: 'Quên đóng dấu ngoặc kép hoặc ngoặc đơn của chuỗi chữ',
        description: 'Một đoạn văn bản (string) bắt đầu bằng dấu nào thì phải kết thúc bằng đúng dấu đó.',
        wrongCode: 'console.log("Xin chào); // ❌ Lỗi SyntaxError: Thiếu dấu đóng ngoặc kép',
        correctCode: 'console.log("Xin chào"); // ✅ Đầy đủ cặp ngoặc kép bao bọc',
        explanation: 'Luôn kiểm tra xem mỗi dấu mở ngoặc (, [, { hoặc dấu nháy ", \' đều có dấu đóng tương ứng chưa.'
      }
    ],
    predictions: [
      {
        id: 'pred-1-1',
        question: 'Đoạn mã sau sẽ in ra gì trên màn hình Console?',
        snippet: `console.log("5" + "3");
console.log(5 + 3);`,
        options: ['8 và 8', '"53" và 8', '8 và "53"', 'Báo lỗi cú pháp'],
        correctIndex: 1,
        explanation: 'Khi đặt trong dấu ngoặc kép ("5" + "3"), máy tính hiểu là hai chuỗi chữ và sẽ ghép dính lại thành "53". Còn (5 + 3) không có ngoặc kép là phép cộng số học ra 8!'
      }
    ],
    exercise: {
      prompt: 'Hãy dùng lệnh console.log() để in ra chính xác dòng chữ: "Tôi bắt đầu học JavaScript hôm nay!"',
      starterCode: `// Viết lệnh console.log của bạn bên dưới:
`,
      hint: 'Cú pháp chuẩn: console.log("nội dung chữ muốn in"); Hãy đảm bảo sao chép đúng từng chữ và dấu chấm than nhé!',
      expectedOutputDesc: 'Tôi bắt đầu học JavaScript hôm nay!',
      validate: (logs) => {
        const found = logs.some((l) => l.includes('Tôi bắt đầu học JavaScript hôm nay!'));
        if (found) {
          return { passed: true, message: 'Chính xác 100%! Bạn đã viết câu lệnh console.log đầu tiên thành công!' };
        }
        return { passed: false, message: 'Chưa thấy dòng chữ "Tôi bắt đầu học JavaScript hôm nay!" trong console. Hãy kiểm tra lại chính tả.' };
      }
    },
    quiz: [
      {
        id: 'q1-1',
        question: 'Lệnh nào sau đây dùng để ghi thông tin kiểm tra ra màn hình Console của nhà phát triển?',
        options: ['print("Hello")', 'console.log("Hello")', 'echo "Hello"', 'system.out.println("Hello")'],
        correctIndex: 1,
        explanation: 'Trong JavaScript, console.log(...) là hàm tiêu chuẩn để xuất dữ liệu ra cửa sổ kiểm tra (console).'
      }
    ]
  },

  // BÀI 2
  {
    id: 2,
    order: 2,
    slug: 'bien-va-kieu-du-lieu',
    title: 'Biến và kiểu dữ liệu (let, const, string, number)',
    topic: 'Nền tảng & Cú pháp',
    tags: ['let', 'const', 'typeof', 'Biến', 'Kiểu dữ liệu'],
    intro:
      'Biến là nơi dùng để lưu trữ dữ liệu (như tên người dùng, điểm số, tuổi tác) để máy tính có thể ghi nhớ và tái sử dụng bất cứ lúc nào trong chương trình.',
    analogy:
      'Hãy tưởng tượng biến như những chiếc hộp có dán nhãn tên: Hộp dán nhãn "let" cho phép bạn thoải mái lấy đồ cũ ra và bỏ đồ mới vào; còn hộp dán nhãn "const" đã bị niêm phong bằng băng keo vĩnh viễn, bạn chỉ được đặt giá trị vào đúng một lần duy nhất lúc tạo hộp!',
    initialCode: `// 1. Khai báo biến với let (có thể thay đổi giá trị sau này)
let tenNguoiDung = "Minh Hoàng";
let tuoi = 18;

// 2. Khai báo hằng số với const (không thể thay đổi)
const NAM_SINH = 2008;

// 3. Biến kiểu Đúng/Sai (Boolean)
let dangDiHoc = true;

// 4. Thay đổi giá trị của biến let
tuoi = tuoi + 1; // Sinh nhật thêm 1 tuổi

console.log("Tên:", tenNguoiDung, "| Kiểu:", typeof tenNguoiDung);
console.log("Tuổi mới:", tuoi, "| Kiểu:", typeof tuoi);
console.log("Đang đi học:", dangDiHoc, "| Kiểu:", typeof dangDiHoc);
console.log("Năm sinh (hằng số):", NAM_SINH);
`,
    lineNotes: [
      { line: 2, tag: 'let', note: 'Từ khóa khai báo biến có thể gán lại giá trị mới bất kỳ lúc nào.' },
      { line: 6, tag: 'const', note: 'Từ khóa khai báo hằng số (constant), bắt buộc phải gán giá trị ngay và không thể đổi.' },
      { line: 9, tag: 'true', note: 'Kiểu dữ liệu boolean chỉ có 2 giá trị duy nhất: true (đúng) hoặc false (sai).' },
      { line: 12, tag: 'tuoi = tuoi + 1', note: 'Lấy giá trị hiện tại (18) cộng thêm 1 rồi lưu lại vào biến tuoi (trở thành 19).' },
      { line: 14, tag: 'typeof', note: 'Toán tử typeof giúp bạn kiểm tra kiểu dữ liệu của một biến (string, number, boolean).' }
    ],
    commonMistakes: [
      {
        title: 'Cố tình gán lại giá trị cho biến const',
        description: 'Biến khai báo bằng const là bất biến.',
        wrongCode: `const PI = 3.14;
PI = 3.14159; // ❌ Lỗi TypeError: Assignment to constant variable`,
        correctCode: `let pi = 3.14;
pi = 3.14159; // ✅ Dùng let nếu bạn dự định thay đổi giá trị sau đó`,
        explanation: 'Quy tắc vàng: Nếu giá trị không bao giờ đổi, hãy dùng const. Nếu giá trị sẽ thay đổi (như điểm số, số đếm), hãy dùng let.'
      },
      {
        title: 'Sử dụng biến trước khi khai báo',
        description: 'Không thể đọc giá trị của biến let hoặc const trước dòng lệnh khai báo nó.',
        wrongCode: `console.log(diem); // ❌ Lỗi ReferenceError: Cannot access 'diem' before initialization
let diem = 10;`,
        correctCode: `let diem = 10;
console.log(diem); // ✅ Khai báo biến trước khi dùng`,
        explanation: 'Luôn khai báo biến ở phần đầu khối mã trước khi cố gắng sử dụng giá trị của nó.'
      }
    ],
    steps: [
      {
        step: 1,
        line: 2,
        variables: { tenNguoiDung: 'Minh Hoàng' },
        explanation: 'Khởi tạo biến "tenNguoiDung" với kiểu chuỗi (string) có giá trị là "Minh Hoàng".'
      },
      {
        step: 2,
        line: 3,
        variables: { tenNguoiDung: 'Minh Hoàng', tuoi: 18 },
        explanation: 'Khởi tạo biến "tuoi" với kiểu số (number) có giá trị là 18.'
      },
      {
        step: 3,
        line: 6,
        variables: { tenNguoiDung: 'Minh Hoàng', tuoi: 18, NAM_SINH: 2008 },
        explanation: 'Khởi tạo hằng số "NAM_SINH" cố định bằng 2008, không thể gán lại.'
      },
      {
        step: 4,
        line: 9,
        variables: { tenNguoiDung: 'Minh Hoàng', tuoi: 18, NAM_SINH: 2008, dangDiHoc: true },
        explanation: 'Tạo biến boolean "dangDiHoc" với giá trị true.'
      },
      {
        step: 5,
        line: 12,
        variables: { tenNguoiDung: 'Minh Hoàng', tuoi: 19, NAM_SINH: 2008, dangDiHoc: true },
        explanation: 'Biến "tuoi" được cập nhật: 18 + 1 = 19. Giá trị trong bộ nhớ đã được thay đổi!'
      }
    ],
    predictions: [
      {
        id: 'pred-2-1',
        question: 'Biến `ketQua` sau đây sẽ có giá trị và kiểu dữ liệu là gì?',
        snippet: `let x = 10;
let y = "20";
let ketQua = x + y;
console.log(typeof ketQua);`,
        options: ['number (giá trị 30)', 'string (giá trị "1020")', 'boolean', 'undefined'],
        correctIndex: 1,
        explanation: 'Khi cộng một số (10) với một chuỗi ("20"), JavaScript tự động ép kiểu thành chuỗi và ghép lại thành "1020". Do đó typeof ketQua là "string"!'
      }
    ],
    exercise: {
      prompt: 'Tạo một biến let diemToan = 9, let diemVan = 8. Tạo tiếp biến let diemTrungBinh bằng trung bình cộng của 2 môn, rồi dùng console.log() in ra biến diemTrungBinh.',
      starterCode: `let diemToan = 9;
let diemVan = 8;

// Tính điểm trung bình và in ra kết quả:
`,
      hint: 'Công thức trung bình cộng: (diemToan + diemVan) / 2. Đừng quên cặp ngoặc đơn để phép cộng được tính trước phép chia!',
      expectedOutputDesc: '8.5',
      validate: (logs) => {
        const found = logs.some((l) => l.includes('8.5'));
        if (found) {
          return { passed: true, message: 'Xuất sắc! Bạn đã tính toán và in ra chính xác điểm trung bình 8.5!' };
        }
        return { passed: false, message: 'Chưa thấy số 8.5 trong kết quả console. Hãy kiểm tra công thức tính và lệnh console.log.' };
      }
    },
    quiz: [
      {
        id: 'q2-1',
        question: 'Từ khóa nào dùng để khai báo một hằng số mà giá trị của nó không thể thay đổi sau khi tạo?',
        options: ['var', 'let', 'const', 'fixed'],
        correctIndex: 2,
        explanation: 'const (viết tắt của constant) dùng để khai báo giá trị cố định, không thể gán lại.'
      }
    ]
  },

  // BÀI 3
  {
    id: 3,
    order: 3,
    slug: 'toan-tu-va-chuoi',
    title: 'Toán tử và chuỗi (Toán tử số học, so sánh ===, Template Literal)',
    topic: 'Nền tảng & Cú pháp',
    tags: ['Toán tử', '===', 'Template Literal', 'Backtick', 'So sánh'],
    intro:
      'Toán tử giúp bạn thực hiện tính toán số học, so sánh các giá trị và ghép chuỗi thông minh bằng Template Literal (dấu backtick `).',
    analogy:
      'Template Literal giống như một bức thư mẫu đã chừa sẵn những chỗ trống có nhãn ${ten}. Khi gửi thư, bạn chỉ cần đưa tên người nhận vào, máy tính sẽ tự động điền giá trị vào chỗ trống mà bạn không phải lo nối từng dấu cộng rườm rà!',
    initialCode: `let giaSanPham = 50000;
let soLuong = 3;
let phiVanChuyen = 15000;

// 1. Toán tử số học: cộng, trừ, nhân, chia, chia lấy dư (%)
let tongTienHang = giaSanPham * soLuong;
let tongThanhToan = tongTienHang + phiVanChuyen;
let soDu = 10 % 3; // 10 chia 3 được 3 dư 1

console.log("Tổng tiền hàng:", tongTienHang);
console.log("Tổng thanh toán:", tongThanhToan);
console.log("10 chia 3 có số dư là:", soDu);

// 2. So sánh bằng tuyệt đối (===)
console.log("5 === 5:", 5 === 5);       // true (cùng giá trị và cùng kiểu)
console.log("5 === '5':", 5 === '5');   // false (khác kiểu dữ liệu: number vs string)

// 3. Chuỗi mẫu hiện đại (Template Literal với dấu backtick \`)
let hoTen = "Nguyễn Văn An";
let loiChao = \`Xin chào \${hoTen}! Bạn vừa mua \${soLuong} món hàng với tổng tiền \${tongThanhToan}đ.\`;
console.log(loiChao);
`,
    lineNotes: [
      { line: 5, tag: '*', note: 'Toán tử nhân trong JavaScript là dấu sao * (không phải dấu x).' },
      { line: 7, tag: '%', note: 'Toán tử chia lấy phần dư (modulus). Ví dụ 10 % 3 = 1.' },
      { line: 14, tag: '===', note: 'So sánh bằng nghiêm ngặt: so sánh cả giá trị lẫn kiểu dữ liệu (khuyên dùng tuyệt đối).' },
      { line: 15, tag: "5 === '5'", note: 'Trả về false vì một bên là số 5, một bên là chuỗi chữ "5".' },
      { line: 19, tag: '`${...}`', note: 'Template Literal bọc bằng dấu huyền (backtick `) nằm dưới phím Esc, chèn biến bằng cú pháp ${tên_biến}.' }
    ],
    commonMistakes: [
      {
        title: 'Dùng dấu nháy đơn hoặc nháy kép cho Template Literal',
        description: 'Template literal bắt buộc phải dùng dấu huyền ` (backtick), không phải dấu nháy đơn \' hay nháy kép ".',
        wrongCode: `let ten = "An";
console.log('Xin chào \${ten}'); // ❌ Máy sẽ in ra nguyên văn chữ "\${ten}"`,
        correctCode: `let ten = "An";
console.log(\`Xin chào \${ten}\`); // ✅ Dùng dấu backtick \` để máy tính hiểu và thế giá trị của biến ten`,
        explanation: 'Dấu backtick ` nằm ở góc trên bên trái bàn phím, ngay bên dưới phím Escape (Esc).'
      },
      {
        title: 'Nhầm lẫn giữa dấu gán = và dấu so sánh ===',
        description: 'Dấu = dùng để gán giá trị, còn dấu === dùng để so sánh xem hai vế có bằng nhau không.',
        wrongCode: `let a = 10;
console.log(a = 20); // ❌ Vô tình gán biến a thành 20!`,
        correctCode: `let a = 10;
console.log(a === 20); // ✅ So sánh: trả về false`,
        explanation: 'Luôn dùng 3 dấu bằng (===) khi bạn muốn so sánh công bằng giữa 2 giá trị trong JavaScript.'
      }
    ],
    steps: [
      {
        step: 1,
        line: 1,
        variables: { giaSanPham: 50000, soLuong: 3, phiVanChuyen: 15000 },
        explanation: 'Khởi tạo các biến đầu vào cho đơn hàng: đơn giá 50.000đ, số lượng 3 món, phí ship 15.000đ.'
      },
      {
        step: 2,
        line: 5,
        variables: { giaSanPham: 50000, soLuong: 3, tongTienHang: 150000 },
        explanation: 'Thực hiện phép nhân: 50000 * 3 = 150000. Lưu vào biến tongTienHang.'
      },
      {
        step: 3,
        line: 6,
        variables: { tongTienHang: 150000, phiVanChuyen: 15000, tongThanhToan: 165000 },
        explanation: 'Thực hiện phép cộng: 150000 + 15000 = 165000. Tính ra tổng thanh toán.'
      },
      {
        step: 4,
        line: 19,
        variables: { hoTen: 'Nguyễn Văn An', tongThanhToan: 165000, soLuong: 3 },
        explanation: 'Template literal tự động điền các biến vào chuỗi tạo ra thông điệp chúc mừng hoàn chỉnh.'
      }
    ],
    predictions: [
      {
        id: 'pred-3-1',
        question: 'Biểu thức sau sẽ trả về giá trị gì?',
        snippet: `let a = 15;
let b = 4;
console.log(a % b);`,
        options: ['3', '3.75', '4', '1'],
        correctIndex: 0,
        explanation: '15 chia 4 được 3 và dư 3 (15 = 4 * 3 + 3). Toán tử % lấy phần dư nên kết quả là 3!'
      }
    ],
    exercise: {
      prompt: 'Khai báo biến `let ten = "Nam"` và `let tuoi = 16`. Dùng Template Literal với dấu backtick (`) để in ra đúng câu: "Chào Nam, năm sau bạn 17 tuổi!"',
      starterCode: `let ten = "Nam";
let tuoi = 16;

// Viết lệnh in ra câu chào bằng Template Literal:
`,
      hint: 'Bạn có thể tính toán trực tiếp bên trong ${}: `Chào ${ten}, năm sau bạn ${tuoi + 1} tuổi!`',
      expectedOutputDesc: 'Chào Nam, năm sau bạn 17 tuổi!',
      validate: (logs) => {
        const found = logs.some((l) => l.includes('Chào Nam, năm sau bạn 17 tuổi!'));
        if (found) {
          return { passed: true, message: 'Chính xác! Bạn đã làm chủ Template Literal với dấu backtick rồi đấy!' };
        }
        return { passed: false, message: 'Chưa thấy câu "Chào Nam, năm sau bạn 17 tuổi!". Hãy kiểm tra lại dấu backtick ` và biểu thức ${tuoi + 1}.' };
      }
    },
    quiz: [
      {
        id: 'q3-1',
        question: 'Dấu nào sau đây là toán tử so sánh bằng nghiêm ngặt (so sánh cả giá trị và kiểu dữ liệu) trong JS?',
        options: ['=', '==', '===', 'eq'],
        correctIndex: 2,
        explanation: 'Toán tử === là so sánh nghiêm ngặt (strict equality), luôn được khuyên dùng để tránh lỗi ép kiểu ngầm.'
      }
    ]
  },

  // BÀI 4
  {
    id: 4,
    order: 4,
    slug: 'cau-dieu-kien-if-else',
    title: 'Câu điều kiện (if / else if / else, toán tử && || !)',
    topic: 'Điều khiển luồng',
    tags: ['if', 'else', 'else if', '&&', '||', '!', 'Điều kiện'],
    intro:
      'Câu lệnh điều kiện cho phép chương trình đưa ra quyết định thông minh: Nếu điều kiện này đúng thì thực hiện hành động A, ngược lại thì thực hiện hành động B.',
    analogy:
      'Giống như đèn tín hiệu giao thông: NẾU (if) đèn xanh thì xe chạy; NẾU KHÔNG THÌ NẾU (else if) đèn vàng thì chạy chậm lại; NẾU KHÔNG PHẢI CẢ HAI (else) tức đèn đỏ thì bắt buộc dừng lại!',
    initialCode: `let diemThi = 8.5;
let coTheUuTien = true;

// 1. Cấu trúc if / else if / else xếp loại học sinh
if (diemThi >= 8.5) {
  console.log("Xếp loại: Học sinh Giỏi 🌟");
} else if (diemThi >= 6.5) {
  console.log("Xếp loại: Học sinh Khá 👍");
} else if (diemThi >= 5.0) {
  console.log("Xếp loại: Học sinh Trung bình 📚");
} else {
  console.log("Xếp loại: Cần cố gắng thêm 💪");
}

// 2. Toán tử logic kết hợp: && (VÀ), || (HOẶC), ! (PHỦ ĐỊNH)
// Để nhận học bổng: Điểm >= 8.0 VÀ có hạnh kiểm tốt
let hanhKiemTot = true;

if (diemThi >= 8.0 && hanhKiemTot === true) {
  console.log("Chúc mừng! Bạn đủ điều kiện nhận Học Bổng!");
}

// Miễn phí vé vào cổng: Dưới 6 tuổi HOẶC có thẻ ưu tiên
let tuoi = 20;
if (tuoi < 6 || coTheUuTien === true) {
  console.log("Được miễn phí vé vào cổng!");
}
`,
    lineNotes: [
      { line: 5, tag: 'if (...)', note: 'Kiểm tra biểu thức trong ngoặc đơn, nếu kết quả là true thì khối lệnh trong { } sẽ chạy.' },
      { line: 7, tag: 'else if (...)', note: 'Nếu điều kiện phía trên sai, máy sẽ nhảy xuống kiểm tra tiếp điều kiện này.' },
      { line: 11, tag: 'else', note: 'Chạy khi tất cả các điều kiện phía trên đều sai (nhánh vét).' },
      { line: 19, tag: '&&', note: 'Toán tử VÀ (AND): Cả hai vế bên trái VÀ bên phải đều phải đúng thì kết quả mới là true.' },
      { line: 25, tag: '||', note: 'Toán tử HOẶC (OR): Chỉ cần ít nhất MỘT trong hai vế đúng là kết quả đã là true.' }
    ],
    commonMistakes: [
      {
        title: 'Quên dấu ngoặc tròn ( ) quanh điều kiện của if',
        description: 'Điều kiện sau if bắt buộc phải nằm trong cặp ngoặc đơn.',
        wrongCode: `if diemThi >= 5 { // ❌ Lỗi cú pháp SyntaxError
  console.log("Đỗ");
}`,
        correctCode: `if (diemThi >= 5) { // ✅ Bắt buộc có ngoặc tròn bao quanh điều kiện
  console.log("Đỗ");
}`,
        explanation: 'Trong JavaScript, sau if bắt buộc phải có cặp ngoặc tròn ( ), sau đó là khối lệnh trong cặp ngoặc nhọn { }.'
      },
      {
        title: 'Dùng một dấu = trong biểu thức so sánh của if',
        description: 'Dấu = là phép gán biến, không phải phép kiểm tra điều kiện.',
        wrongCode: `let x = 5;
if (x = 10) { // ❌ Biến x bị gán thành 10 và biểu thức luôn luôn đúng!
  console.log("Bằng 10");
}`,
        correctCode: `let x = 5;
if (x === 10) { // ✅ So sánh x với 10
  console.log("Bằng 10");
}`,
        explanation: 'Hãy luôn chú ý: 1 dấu bằng = là gán giá trị; 3 dấu bằng === là so sánh bằng.'
      }
    ],
    steps: [
      {
        step: 1,
        line: 1,
        variables: { diemThi: 8.5, coTheUuTien: true },
        explanation: 'Khởi tạo diemThi = 8.5 và coTheUuTien = true.'
      },
      {
        step: 2,
        line: 5,
        variables: { diemThi: 8.5, 'Điều kiện diemThi >= 8.5': true },
        explanation: 'Kiểm tra: 8.5 >= 8.5 là ĐÚNG (true)! Máy tính bước vào trong khối if dòng 6.'
      },
      {
        step: 3,
        line: 6,
        variables: { diemThi: 8.5, 'Đã in': 'Học sinh Giỏi' },
        explanation: 'In ra "Xếp loại: Học sinh Giỏi 🌟". Vì nhánh này đã chạy, các nhánh else if và else phía dưới sẽ được bỏ qua hoàn toàn!'
      },
      {
        step: 4,
        line: 19,
        variables: { 'diemThi >= 8.0': true, hanhKiemTot: true, 'Cả hai': true },
        explanation: 'Kiểm tra điều kiện nhận học bổng: Điểm (8.5 >= 8.0) VÀ hạnh kiểm tốt. Cả 2 đều đúng nên đủ điều kiện!'
      }
    ],
    predictions: [
      {
        id: 'pred-4-1',
        question: 'Đoạn mã sau sẽ in ra gì?',
        snippet: `let tuoi = 15;
if (tuoi >= 18) {
  console.log("Người lớn");
} else {
  console.log("Vị thành niên");
}`,
        options: ['Người lớn', 'Vị thành niên', 'Cả 2 câu', 'Không in gì cả'],
        correctIndex: 1,
        explanation: 'Vì 15 < 18 (điều kiện if trả về false), nên chương trình nhảy vào khối else và in ra "Vị thành niên".'
      }
    ],
    exercise: {
      prompt: 'Khai báo biến `let so = 7`. Viết câu lệnh `if...else` kiểm tra: nếu `so % 2 === 0` thì in ra "Số chẵn", ngược lại in ra "Số lẻ".',
      starterCode: `let so = 7;

// Viết câu lệnh if...else kiểm tra số chẵn hay số lẻ:
`,
      hint: 'Một số chia hết cho 2 (so % 2 === 0) là số chẵn, ngược lại là số lẻ.',
      expectedOutputDesc: 'Số lẻ',
      validate: (logs) => {
        const found = logs.some((l) => l.includes('Số lẻ'));
        if (found) {
          return { passed: true, message: 'Chính xác! 7 chia 2 dư 1 nên là số lẻ, bạn đã áp dụng if-else rất tốt!' };
        }
        return { passed: false, message: 'Chưa thấy kết quả "Số lẻ". Hãy kiểm tra lại biểu thức if (so % 2 === 0).' };
      }
    },
    quiz: [
      {
        id: 'q4-1',
        question: 'Toán tử logic nào sau đây trả về true khi cả hai điều kiện cùng đúng?',
        options: ['||', '&&', '!', '=='],
        correctIndex: 1,
        explanation: 'Toán tử && (AND) yêu cầu cả 2 vế đều phải true thì kết quả mới là true.'
      }
    ]
  },

  // BÀI 5
  {
    id: 5,
    order: 5,
    slug: 'vong-lap-for-while',
    title: 'Vòng lặp (for, while, for...of, break, continue)',
    topic: 'Điều khiển luồng',
    tags: ['for', 'while', 'for...of', 'break', 'Vòng lặp'],
    intro: 'Vòng lặp giúp máy tính tự động lặp lại một công việc hàng ngàn lần trong chớp mắt mà không cần viết lại mã nguồn.',
    analogy: 'Như việc tập thể dục: "Hãy hít đất 10 lần!". Bạn bắt đầu đếm từ 1 đến 10, mỗi lần xong 1 cái thì tăng biến đếm lên 1 cho đến khi đủ 10 lần thì dừng lại.',
    initialCode: `// 1. Vòng lặp for đếm từ 1 đến 5
console.log("--- Vòng lặp for ---");
for (let i = 1; i <= 5; i++) {
  console.log("Lần lặp thứ:", i);
}

// 2. Tính tổng các số từ 1 đến 10
let tong = 0;
for (let i = 1; i <= 10; i++) {
  tong += i;
}
console.log("Tổng từ 1 đến 10 là:", tong);
`,
    lineNotes: [
      { line: 3, tag: 'for (let i = 1; i <= 5; i++)', note: 'Khởi tạo i = 1, lặp chừng nào i <= 5, sau mỗi vòng lặp tăng i lên 1 (i++).' }
    ],
    commonMistakes: [
      {
        title: 'Vòng lặp vô hạn (Infinite Loop) do quên tăng biến đếm',
        description: 'Nếu điều kiện dừng không bao giờ đạt được, vòng lặp sẽ chạy mãi mãi.',
        wrongCode: `let i = 1;
while (i <= 5) {
  console.log(i); // ❌ Quên i++, i mãi mãi là 1!
}`,
        correctCode: `let i = 1;
while (i <= 5) {
  console.log(i);
  i++; // ✅ Tăng i để sau 5 lần vòng lặp dừng lại
}`,
        explanation: 'Luôn đảm bảo biến điều kiện được cập nhật sau mỗi vòng lặp.'
      }
    ],
    quiz: [
      {
        id: 'q5-1',
        question: 'Biểu thức i++ trong vòng lặp for có ý nghĩa gì?',
        options: ['Tăng i lên 1 đơn vị', 'Giảm i đi 1 đơn vị', 'Nhân đôi i', 'Gán i bằng 0'],
        correctIndex: 0,
        explanation: 'i++ là cách viết tắt của i = i + 1, dùng để tăng biến đếm lên 1.'
      }
    ]
  },
  {
    id: 6,
    order: 6,
    slug: 'ham-function',
    title: 'Hàm (function, arrow function, tham số, return)',
    topic: 'Hàm & Cấu trúc dữ liệu',
    tags: ['function', 'arrow function', 'return', 'Hàm'],
    intro: 'Hàm là một khối lệnh được đóng gói và đặt tên, có thể gọi thực thi lại nhiều lần từ bất kỳ đâu trong chương trình.',
    analogy: 'Hàm giống như chiếc máy ép nước trái cây: Bạn bỏ cam vào (tham số đầu vào), máy thực hiện quy trình ép (khối mã), và trả về ly nước cam thơm ngon (kết quả return)!',
    initialCode: `// 1. Khai báo hàm truyền thống
function tinhTong(a, b) {
  return a + b;
}

// 2. Gọi hàm
let ketQua = tinhTong(15, 25);
console.log("Tổng là:", ketQua);

// 3. Arrow function (Hàm mũi tên hiện đại)
const chaoNguoiDung = (ten) => {
  return \`Xin chào \${ten}, chúc bạn ngày tốt lành!\`;
};

console.log(chaoNguoiDung("Lan"));
`,
    lineNotes: [
      { line: 2, tag: 'function', note: 'Từ khóa định nghĩa hàm.' },
      { line: 3, tag: 'return', note: 'Trả kết quả từ trong hàm ra ngoài nơi gọi.' }
    ],
    commonMistakes: [
      {
        title: 'Quên từ khóa return trong hàm',
        description: 'Nếu không return, hàm sẽ mặc định trả về giá trị undefined.',
        wrongCode: `function nhanDoi(x) {
  x * 2; // ❌ Không có return
}`,
        correctCode: `function nhanDoi(x) {
  return x * 2; // ✅ Trả giá trị ra ngoài
}`,
        explanation: 'Phải dùng return khi bạn muốn lấy kết quả tính toán của hàm để lưu vào biến.'
      }
    ],
    quiz: [
      {
        id: 'q6-1',
        question: 'Từ khóa nào dùng để trả về giá trị từ bên trong một hàm?',
        options: ['send', 'output', 'return', 'give'],
        correctIndex: 2,
        explanation: 'return là từ khóa chuẩn để trả kết quả tính toán ra ngoài nơi gọi hàm.'
      }
    ]
  },
  {
    id: 7,
    order: 7,
    slug: 'mang-array',
    title: 'Mảng (Array: push, pop, length, map, filter)',
    topic: 'Hàm & Cấu trúc dữ liệu',
    tags: ['Array', 'push', 'pop', 'map', 'filter', 'Mảng'],
    intro: 'Mảng là danh sách chứa nhiều phần tử được sắp xếp theo thứ tự và đánh số chỉ mục bắt đầu từ số 0.',
    analogy: 'Giống như danh sách đi chợ viết trên tờ giấy: Mục số 0 là "Trứng", mục số 1 là "Sữa", mục số 2 là "Bánh mì". Bạn có thể thêm món mới vào cuối danh sách hoặc gạch bỏ món đã mua.',
    initialCode: `let danhSach = ["Táo", "Chuối", "Cam"];

console.log("Số lượng món:", danhSach.length);
console.log("Món đầu tiên (vị trí 0):", danhSach[0]);

// Thêm phần tử vào cuối mảng
danhSach.push("Nho");
console.log("Sau khi thêm:", danhSach);

// Duyệt qua từng phần tử
danhSach.forEach((mon, index) => {
  console.log(\`Món thứ \${index + 1}: \${mon}\`);
});
`,
    lineNotes: [
      { line: 1, tag: '[]', note: 'Dấu ngoặc vuông biểu thị một mảng trong JavaScript.' },
      { line: 4, tag: '[0]', note: 'Chỉ mục trong mảng bắt đầu từ 0 (phần tử đầu tiên là index 0).' }
    ],
    commonMistakes: [
      {
        title: 'Nghĩ rằng phần tử đầu tiên có chỉ mục là 1',
        description: 'Lập trình viên luôn đếm từ 0.',
        wrongCode: 'let item = danhSach[1]; // ❌ Đây là phần tử thứ HAI ("Chuối")',
        correctCode: 'let item = danhSach[0]; // ✅ Đây mới là phần tử ĐẦU TIÊN ("Táo")',
        explanation: 'Quy tắc ngón tay: Phần tử đầu tiên luôn là [0], phần tử cuối cùng là [danhSach.length - 1].'
      }
    ],
    quiz: [
      {
        id: 'q7-1',
        question: 'Trong JavaScript, chỉ số (index) của phần tử đầu tiên trong mảng là bao nhiêu?',
        options: ['1', '0', '-1', 'null'],
        correctIndex: 1,
        explanation: 'Mảng trong JavaScript (và hầu hết ngôn ngữ lập trình) được đánh chỉ mục bắt đầu từ 0 (0-indexed).'
      }
    ]
  },
  {
    id: 8,
    order: 8,
    slug: 'doi-tuong-object',
    title: 'Đối tượng (Object: thuộc tính, phương thức)',
    topic: 'Hàm & Cấu trúc dữ liệu',
    tags: ['Object', 'Key-Value', 'Thuộc tính', 'Đối tượng'],
    intro: 'Đối tượng giúp bạn nhóm các thông tin liên quan của một thực thể (như thông tin một học sinh, một sản phẩm) vào cùng một nơi bằng cặp khóa-giá trị (key-value).',
    analogy: 'Đối tượng giống như Thẻ Căn cước công dân của bạn: Trên thẻ có các mục rõ ràng: Họ tên: "Trần Văn B", Năm sinh: 2005, Quê quán: "Hà Nội".',
    initialCode: `let sinhVien = {
  hoTen: "Trần Bảo Nam",
  tuoi: 20,
  chuyenNganh: "Công nghệ thông tin",
  diemTB: 8.8,
  gioiThieu: function() {
    return \`Tôi là \${this.hoTen}, học ngành \${this.chuyenNganh}.\`;
  }
};

console.log("Tên sinh viên:", sinhVien.hoTen);
console.log("Điểm trung bình:", sinhVien.diemTB);
console.log(sinhVien.gioiThieu());
`,
    lineNotes: [
      { line: 1, tag: '{}', note: 'Dấu ngoặc nhọn khai báo một đối tượng.' },
      { line: 2, tag: 'hoTen: "..."', note: 'hoTen là thuộc tính (key), "Trần Bảo Nam" là giá trị (value).' },
      { line: 12, tag: 'sinhVien.hoTen', note: 'Truy cập thuộc tính bằng dấu chấm (dot notation).' }
    ],
    commonMistakes: [
      {
        title: 'Quên dấu phẩy giữa các thuộc tính trong Object',
        description: 'Mỗi cặp key: value phải được ngăn cách bằng dấu phẩy.',
        wrongCode: `let user = {
  name: "Nam"  // ❌ Thiếu dấu phẩy ở cuối dòng
  age: 20
}`,
        correctCode: `let user = {
  name: "Nam", // ✅ Có dấu phẩy ngăn cách
  age: 20
}`,
        explanation: 'Luôn đặt dấu phẩy sau mỗi thuộc tính trong object.'
      }
    ],
    quiz: [
      {
        id: 'q8-1',
        question: 'Dấu nào dùng để bao bọc một đối tượng (Object) trong JavaScript?',
        options: ['[ ]', '( )', '{ }', '< >'],
        correctIndex: 2,
        explanation: 'Dấu ngoặc nhọn { } dùng cho Object, còn dấu ngoặc vuông [ ] dùng cho Array.'
      }
    ]
  },
  {
    id: 9,
    order: 9,
    slug: 'dom-chon-va-thay-doi-phan-tu',
    title: 'DOM: Chọn và thay đổi phần tử HTML',
    topic: 'Tương tác trình duyệt & DOM',
    tags: ['DOM', 'querySelector', 'textContent', 'innerHTML', 'style'],
    intro: 'DOM (Document Object Model) là cây cầu nối giữa JavaScript và HTML, cho phép mã JS tìm kiếm, đọc và thay đổi nội dung trang web ngay lập tức.',
    analogy: 'HTML là trang giấy in, còn DOM giống như bút thần trong tay JavaScript: Bạn có thể chỉ định "Đổi màu đoạn văn bản này thành đỏ!" hay "Viết thêm một dòng chữ mới vào đây!".',
    isDomLesson: true,
    initialHtml: `<div style="text-align: center; padding: 20px;">
  <h2 id="tieu-de">Trang Web Mẫu</h2>
  <p id="mo-ta">Đây là nội dung gốc của trang web.</p>
  <button id="nut-bam">Nhấp để thay đổi</button>
</div>`,
    initialCode: `// 1. Chọn phần tử bằng document.querySelector
const tieuDe = document.querySelector("#tieu-de");
const moTa = document.querySelector("#mo-ta");

// 2. Thay đổi nội dung chữ (textContent)
tieuDe.textContent = "Chào mừng bạn đến với DOM!";

// 3. Thay đổi màu sắc và kích thước bằng CSS (.style)
tieuDe.style.color = "#4f46e5";
moTa.style.color = "#16a34a";
moTa.textContent = "Nội dung này vừa được JavaScript tự động cập nhật!";

console.log("Đã cập nhật DOM thành công!");
`,
    lineNotes: [
      { line: 2, tag: 'querySelector', note: 'Hàm mạnh mẽ dùng để tìm kiếm phần tử bằng bộ chọn CSS (như #id, .class).' },
      { line: 6, tag: 'textContent', note: 'Thay đổi văn bản thuần túy bên trong phần tử.' },
      { line: 9, tag: 'style.color', note: 'Chỉnh sửa thuộc tính CSS trực tiếp bằng JavaScript.' }
    ],
    commonMistakes: [
      {
        title: 'Quên dấu # khi chọn id bằng querySelector',
        description: 'querySelector dùng cú pháp bộ chọn CSS nên id bắt buộc phải có dấu #.',
        wrongCode: 'document.querySelector("tieu-de"); // ❌ Máy tìm thẻ <tieu-de> (không thấy)',
        correctCode: 'document.querySelector("#tieu-de"); // ✅ Có dấu # tìm đúng ID tieu-de',
        explanation: 'Với ID dùng #, với Class dùng ., với tên thẻ thì viết trực tiếp.'
      }
    ],
    quiz: [
      {
        id: 'q9-1',
        question: 'Thuộc tính nào dùng để thay đổi nội dung văn bản thuần túy của một phần tử HTML?',
        options: ['value', 'textContent', 'textStyle', 'html'],
        correctIndex: 1,
        explanation: 'textContent an toàn và hiệu quả nhất khi bạn chỉ muốn gán hoặc đọc văn bản.'
      }
    ]
  },
  {
    id: 10,
    order: 10,
    slug: 'su-kien-event-listener',
    title: 'Sự kiện (addEventListener, click, input)',
    topic: 'Tương tác trình duyệt & DOM',
    tags: ['addEventListener', 'click', 'Sự kiện', 'Event'],
    intro: 'Sự kiện là những hành động xảy ra trên trang web (như người dùng nhấp chuột, gõ phím, di chuột), và JavaScript lắng nghe để phản hồi lại.',
    analogy: 'Giống như chuông cửa nhà bạn: addEventListener là chiếc chuông luôn chờ sẵn; khi có khách bấm vào chuông (sự kiện click), chuông reo lên và bạn ra mở cửa (hàm xử lý callback)!',
    isDomLesson: true,
    initialHtml: `<div style="text-align: center; padding: 20px;">
  <h2 id="so-dem" style="font-size: 32px; color: #4f46e5; margin: 10px 0;">0</h2>
  <button id="btn-tang" style="margin-right: 8px;">+ Tăng số</button>
  <button id="btn-giam">- Giảm số</button>
</div>`,
    initialCode: `let dem = 0;
const theSoDem = document.querySelector("#so-dem");
const btnTang = document.querySelector("#btn-tang");
const btnGiam = document.querySelector("#btn-giam");

// Lắng nghe sự kiện click nút tăng
btnTang.addEventListener("click", () => {
  dem = dem + 1;
  theSoDem.textContent = dem;
  console.log("Đã tăng lên:", dem);
});

// Lắng nghe sự kiện click nút giảm
btnGiam.addEventListener("click", () => {
  dem = dem - 1;
  theSoDem.textContent = dem;
  console.log("Đã giảm xuống:", dem);
});
`,
    lineNotes: [
      { line: 7, tag: 'addEventListener', note: 'Gắn tai nghe sự kiện vào phần tử HTML.' },
      { line: 7, tag: '"click"', note: 'Tên sự kiện: nhấp chuột trái.' }
    ],
    commonMistakes: [
      {
        title: 'Thêm dấu ngoặc tròn () khi truyền tên hàm vào addEventListener',
        description: 'Nếu thêm (), hàm sẽ chạy ngay lập tức lúc tải trang thay vì đợi nhấp chuột.',
        wrongCode: 'btn.addEventListener("click", xuLy()); // ❌ Chạy ngay lúc nạp trang',
        correctCode: 'btn.addEventListener("click", xuLy); // ✅ Chỉ truyền tên hàm (reference)',
        explanation: 'Truyền tên hàm để trình duyệt tự động gọi khi sự kiện xảy ra.'
      }
    ],
    quiz: [
      {
        id: 'q10-1',
        question: 'Phương thức nào dùng để gắn một hàm lắng nghe sự kiện vào phần tử DOM?',
        options: ['attachEvent', 'addEventListener', 'listen', 'onClick'],
        correctIndex: 1,
        explanation: 'addEventListener là phương thức chuẩn của chuẩn Web API hiện đại.'
      }
    ]
  },
  {
    id: 11,
    order: 11,
    slug: 'du-an-nho-todo-list',
    title: 'Dự án nhỏ: Danh sách việc cần làm (To-Do List)',
    topic: 'Thực hành & Nâng cao',
    tags: ['Dự án', 'To-Do', 'DOM', 'Thực hành'],
    intro: 'Kết hợp toàn bộ kiến thức về Biến, Mảng, DOM và Sự kiện để tạo ứng dụng To-Do List hoàn chỉnh (thêm việc, đánh dấu xong, xóa việc) dưới 60 dòng code!',
    analogy: 'Đây là bài test tổng hợp: Bạn đóng vai trò như một người thợ xây dùng tất cả những viên gạch (HTML), xi măng (CSS) và hệ thống điện nước thông minh (JavaScript) để hoàn thiện ngôi nhà đầu tiên!',
    isDomLesson: true,
    initialHtml: `<div style="max-width: 320px; margin: 0 auto; padding: 15px; font-family: sans-serif;">
  <h3 style="margin-top:0;">Việc cần làm hôm nay</h3>
  <div style="display: flex; gap: 6px; margin-bottom: 12px;">
    <input id="input-todo" type="text" placeholder="Nhập việc cần làm..." style="flex:1;">
    <button id="btn-them" style="background:#4f46e5; color:white; border:none;">Thêm</button>
  </div>
  <ul id="danh-sach" style="list-style:none; padding:0; margin:0;"></ul>
</div>`,
    initialCode: `const inputTodo = document.querySelector("#input-todo");
const btnThem = document.querySelector("#btn-them");
const danhSach = document.querySelector("#danh-sach");

function themViecMoi() {
  const noiDung = inputTodo.value.trim();
  if (noiDung === "") return;

  // 1. Tạo thẻ li mới
  const li = document.createElement("li");
  li.style.cssText = "display:flex; justify-content:space-between; padding:6px; border-bottom:1px solid #e2e8f0; align-items:center;";

  // 2. Nội dung text và nút xóa
  li.innerHTML = \`
    <span style="cursor:pointer;" onclick="this.style.textDecoration = this.style.textDecoration ? '' : 'line-through'">\${noiDung}</span>
    <button style="color:#ef4444; border:none; background:none; cursor:pointer; font-weight:bold;">✕</button>
  \`;

  // 3. Gắn sự kiện xóa
  li.querySelector("button").onclick = () => li.remove();

  // 4. Thêm vào danh sách và xóa trắng ô input
  danhSach.appendChild(li);
  inputTodo.value = "";
}

btnThem.addEventListener("click", themViecMoi);
inputTodo.addEventListener("keydown", (e) => {
  if (e.key === "Enter") themViecMoi();
});
`,
    lineNotes: [
      { line: 9, tag: 'createElement("li")', note: 'Tạo động một phần tử HTML mới hoàn toàn bằng JavaScript.' },
      { line: 20, tag: 'li.remove()', note: 'Xóa phần tử đó khỏi giao diện khi người dùng nhấp nút xóa ✕.' },
      { line: 23, tag: 'appendChild(li)', note: 'Gắn thẻ li mới tạo vào trong thẻ danh sách ul.' }
    ],
    commonMistakes: [
      {
        title: 'Không kiểm tra input rỗng trước khi thêm',
        description: 'Người dùng có thể bấm nút thêm nhiều lần tạo ra các dòng trống rỗng vô nghĩa.',
        wrongCode: 'const noiDung = input.value; // Thêm luôn không kiểm tra',
        correctCode: 'if (input.value.trim() === "") return; // Bỏ qua nếu người dùng chưa nhập gì',
        explanation: 'Hàm trim() loại bỏ các khoảng trắng thừa trước và sau chuỗi.'
      }
    ],
    quiz: [
      {
        id: 'q11-1',
        question: 'Phương thức nào dùng để gắn một phần tử con mới tạo vào trong một phần tử cha trên DOM?',
        options: ['appendChild', 'attachChild', 'insertInto', 'pushChild'],
        correctIndex: 0,
        explanation: 'appendChild() gắn một node con vào cuối danh sách con của node cha.'
      }
    ]
  },
  {
    id: 12,
    order: 12,
    slug: 'hen-gio-va-go-loi-debugging',
    title: 'Hẹn giờ và gỡ lỗi (setTimeout, setInterval, Console Debugging)',
    topic: 'Thực hành & Nâng cao',
    tags: ['setTimeout', 'setInterval', 'Debug', 'Lỗi thường gặp'],
    intro: 'Học cách làm chủ thời gian với setTimeout, setInterval và bí kíp đọc hiểu thông báo lỗi trong console để trở thành lập trình viên tự tin gỡ lỗi.',
    analogy: 'setTimeout như chuông báo thức hẹn giờ: "Sau 3 giây nữa hãy đổ chuông một lần!". Còn setInterval như tiếng tích tắc của đồng hồ: "Cứ sau mỗi 1 giây hãy lặp lại một lần!".',
    initialCode: `// 1. setTimeout: Chạy một lần sau khoảng thời gian (tính bằng mili-giây: 1000ms = 1s)
console.log("Bắt đầu hẹn giờ 2 giây...");

setTimeout(() => {
  console.log("⏰ Đã hết 2 giây! Thông báo từ setTimeout.");
}, 2000);

// 2. Minh họa 3 lỗi kinh điển và cách đọc hiểu:
console.log("--- Minh họa gỡ lỗi ---");
// ReferenceError: Truy cập biến chưa khai báo
// TypeError: Gọi thứ không phải là hàm
// SyntaxError: Quên đóng ngoặc
`,
    lineNotes: [
      { line: 4, tag: 'setTimeout', note: 'Hàm nhận 2 tham số: hàm cần chạy và thời gian chờ tính bằng mili-giây.' }
    ],
    commonMistakes: [
      {
        title: 'Nhầm lẫn giữa mili-giây và giây trong setTimeout',
        description: 'JavaScript tính thời gian bằng mili-giây (ms). 1 giây = 1000ms.',
        wrongCode: 'setTimeout(fn, 2); // ❌ Chỉ có 2 mili-giây (chạy gần như tức thì)',
        correctCode: 'setTimeout(fn, 2000); // ✅ Đúng 2 giây',
        explanation: '1 giây = 1000 mili-giây, 5 giây = 5000 mili-giây.'
      }
    ],
    quiz: [
      {
        id: 'q12-1',
        question: 'Tham số thời gian trong setTimeout(callback, time) được tính bằng đơn vị nào?',
        options: ['Giây (seconds)', 'Mili-giây (milliseconds)', 'Phút (minutes)', 'Micro-giây'],
        correctIndex: 1,
        explanation: 'Trong JavaScript, thời gian hẹn giờ luôn được tính bằng mili-giây (1000ms = 1s).'
      }
    ]
  }
];

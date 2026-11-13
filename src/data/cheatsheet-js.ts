import { CheatEntry } from '../types/learning';

export const JS_CHEAT_ENTRIES: CheatEntry[] = [
  // ================= 1. BIẾN & KIỂU =================
  {
    id: 'js-let',
    term: 'let',
    category: 'Biến & kiểu',
    meaning: 'Khai báo biến có thể thay đổi và gán lại giá trị mới',
    syntax: 'let tên = giá_trị;',
    example: {
      kind: 'console',
      code: `let diemSo = 8;
console.log("Điểm ban đầu:", diemSo);

diemSo = 9.5; // Gán lại giá trị mới
console.log("Điểm sau khi cập nhật:", diemSo);`,
      expectedOutput: ['Điểm ban đầu: 8', 'Điểm sau khi cập nhật: 9.5'],
      steps: [
        {
          lines: [1],
          title: 'Khởi tạo biến',
          text: 'Tạo một vùng nhớ tên là diemSo trong bộ nhớ và cất số 8 vào đó.',
        },
        {
          lines: [2],
          title: 'Đọc và in giá trị',
          text: 'Lấy số 8 trong biến ra và in ra cửa sổ Console.',
        },
        {
          lines: [4],
          title: 'Gán đè giá trị mới',
          text: 'Xóa số 8 cũ đi và lưu số 9.5 mới vào cùng chiếc hộp diemSo đó.',
        },
        {
          lines: [5],
          title: 'In giá trị cập nhật',
          text: 'In ra giá trị mới nhất 9.5.',
        },
      ],
      illustration: {
        type: 'VariableBox',
        data: { name: 'diemSo', initial: 8, updated: 9.5 },
      },
    },
    tip: 'Chỉ dùng từ khóa "let" ở dòng đầu tiên khi khai báo biến. Khi gán lại giá trị sau đó thì không viết lại "let".',
    consequence:
      'Nếu khai báo trùng tên 2 lần cùng scope (let x = 1; let x = 2;), JavaScript sẽ dừng chương trình và báo lỗi: SyntaxError: Identifier "x" has already been declared.',
    analogy: 'Như chiếc hộp có nắp mở: bạn có thể lấy món đồ cũ ra và cất món đồ mới vào bất cứ lúc nào.',
    mistakes: [
      {
        wrong: 'let diem = 8;\nlet diem = 9; // Lỗi!',
        right: 'let diem = 8;\ndiem = 9; // Chuẩn',
        why: 'Không viết lại chữ "let" khi muốn đổi giá trị của biến đã có.',
      },
    ],
  },
  {
    id: 'js-const',
    term: 'const',
    category: 'Biến & kiểu',
    meaning: 'Khai báo hằng số cố định, không thể gán lại giá trị khác',
    syntax: 'const TÊN = giá_trị;',
    example: {
      kind: 'console',
      code: `const PI = 3.14159;
console.log("Giá trị hằng số PI:", PI);

try {
  PI = 3.14; // Cố tình gán lại sẽ bị lỗi
} catch (loi) {
  console.log("Lỗi bắt được:", loi.message);
}`,
      expectedOutput: ['Giá trị hằng số PI: 3.14159', 'Lỗi bắt được: Assignment to constant variable.'],
      steps: [
        {
          lines: [1],
          title: 'Tạo hằng số bất biến',
          text: 'Tạo vùng nhớ PI và khóa chặt giá trị 3.14159 ngay tại thời điểm khai báo.',
        },
        {
          lines: [5],
          title: 'Ngăn chặn gán đè',
          text: 'JavaScript phát hiện hành vi ghi đè lên hằng số và lập tức ném ra ngoại lệ TypeError.',
        },
      ],
      illustration: {
        type: 'VariableBox',
        data: { name: 'PI', value: 3.14159, isLocked: true },
      },
    },
    tip: 'Luôn ưu tiên dùng const theo mặc định. Chỉ chuyển sang let khi bạn biết chắc chắn giá trị biến đó sẽ thay đổi.',
    consequence:
      'Nếu cố tình gán lại hằng số (PI = 3.14;), chương trình sẽ ném lỗi: TypeError: Assignment to constant variable và dừng chạy.',
    analogy: 'Như tấm bia khắc trên đá: một khi đã khắc chữ vào thì không thể tẩy xóa hay sửa lại được.',
  },
  {
    id: 'js-typeof',
    term: 'typeof',
    category: 'Biến & kiểu',
    meaning: 'Kiểm tra kiểu dữ liệu của một giá trị hoặc biến',
    syntax: 'typeof giá_trị',
    example: {
      kind: 'console',
      code: `console.log("Số:", typeof 42);
console.log("Chuỗi chữ:", typeof "Xin chào HTMLive");
console.log("Đúng/Sai:", typeof true);
console.log("Chưa xác định:", typeof undefined);
console.log("Mảng danh sách:", typeof [1, 2, 3]);
console.log("Đối tượng null:", typeof null); // Trường hợp đặc biệt trong JS`,
      expectedOutput: [
        'Số: number',
        'Chuỗi chữ: string',
        'Đúng/Sai: boolean',
        'Chưa xác định: undefined',
        'Mảng danh sách: object',
        'Đối tượng null: object',
      ],
      steps: [
        {
          lines: [1, 2, 3, 4],
          title: 'Kiểm tra kiểu nguyên thủy',
          text: 'Trả về chuỗi đại diện cho kiểu dữ liệu gốc: number, string, boolean, undefined.',
        },
        {
          lines: [5, 6],
          title: 'Trường hợp mảng và null',
          text: 'Trong JavaScript, cả mảng (Array) và giá trị null đều được coi là kiểu "object".',
        },
      ],
    },
    tip: 'Để kiểm tra xem một biến có phải là mảng chuẩn hay không, hãy dùng Array.isArray(biến) thay vì typeof.',
    consequence: 'Nếu không kiểm tra kiểu dữ liệu khi cộng số với chuỗi, "5" + 2 sẽ ra "52" thay vì 7.',
    analogy: 'Như máy quét kiểm tra hành lý sân bay: soi vào món đồ để biết đó là chất lỏng, kim loại hay vải.',
  },
  {
    id: 'js-template-literal',
    term: 'Template Literal (`...`)',
    category: 'Biến & kiểu',
    meaning: 'Chuỗi mẫu hiện đại cho phép nhúng biến và xuống dòng tự nhiên',
    syntax: '`Nội dung văn bản ${tênBiến}`',
    example: {
      kind: 'console',
      code: `const hoTen = "Nguyễn Văn An";
const tuoi = 20;
const diem = 9.2;

// Nhúng trực tiếp biến và biểu thức toán học
const thongBao = \`Học viên \${hoTen}, \${tuoi} tuổi, đạt \${diem} điểm (Xếp loại: \${diem >= 8 ? "Giỏi" : "Khá"}).\`;
console.log(thongBao);`,
      expectedOutput: ['Học viên Nguyễn Văn An, 20 tuổi, đạt 9.2 điểm (Xếp loại: Giỏi).'],
      steps: [
        {
          lines: [6],
          title: 'Dấu huyền (Backtick `)',
          text: 'Ký tự backtick nằm ngay dưới phím Escape (góc trên bên trái bàn phím).',
        },
        {
          lines: [6],
          title: 'Nội suy biểu thức ${...}',
          text: 'JavaScript tự động thay thế ${hoTen} bằng giá trị "Nguyễn Văn An" mà không cần nối chuỗi bằng dấu cộng.',
        },
      ],
      illustration: {
        type: 'TextFlow',
        data: { template: 'Học viên ${hoTen}', result: 'Học viên Nguyễn Văn An' },
      },
    },
    tip: 'Hỗ trợ viết chuỗi nhiều dòng mà không cần gõ ký tự ngắt dòng \\n.',
    consequence: 'Nếu dùng nhầm dấu nháy đơn (\'...\') hoặc nháy kép ("..."), chuỗi sẽ in nguyên văn chữ "${hoTen}" ra màn hình.',
    analogy: 'Như văn bản mẫu có sẵn các ô trống điền tên: điền tên người nhận vào đúng vị trí đánh dấu.',
  },

  // ================= 2. TOÁN TỬ & CHUỖI =================
  {
    id: 'js-strict-equal',
    term: 'So sánh nghiêm ngặt (===)',
    category: 'Toán tử & chuỗi',
    meaning: 'So sánh cả giá trị VÀ kiểu dữ liệu, không ép kiểu ngầm',
    syntax: 'a === b và a !== b',
    example: {
      kind: 'console',
      code: `console.log("5 === 5:", 5 === 5);         // true (cùng là số 5)
console.log("5 === '5':", 5 === "5");     // false (số vs chuỗi chữ)
console.log("5 == '5':", 5 == "5");       // true (toán tử lỏng lẻo tự ép kiểu)

console.log("0 === false:", 0 === false); // false (khác kiểu)
console.log("0 == false:", 0 == false);   // true (nguy hiểm!)`,
      expectedOutput: [
        '5 === 5: true',
        '5 === \'5\': false',
        '5 == \'5\': true',
        '0 === false: false',
        '0 == false: true',
      ],
      steps: [
        {
          lines: [2],
          title: 'Kiểm tra kiểu dữ liệu trước',
          text: '5 là số (number), "5" là chuỗi (string) -> Khác kiểu nên kết luận ngay là false.',
        },
        {
          lines: [3, 5],
          title: 'Nguy hiểm của toán tử ==',
          text: 'Toán tử 2 dấu bằng (==) tự động chuyển đổi kiểu dữ liệu lén lút, dễ sinh lỗi logic khó phát hiện.',
        },
      ],
    },
    tip: 'Luôn luôn sử dụng 3 dấu bằng (===) và !== trong toàn bộ dự án hiện đại.',
    consequence: 'Dùng == có thể biến số 0, chuỗi rỗng "", mảng rỗng [] thành bằng nhau một cách khó hiểu.',
    analogy: '=== như nhân viên hải quan soi cả hộ chiếu lẫn vân tay; còn == chỉ nhìn thoáng qua khuôn mặt.',
  },
  {
    id: 'js-logical-operators',
    term: 'Toán tử logic (&&, ||, !)',
    category: 'Toán tử & chuỗi',
    meaning: 'Kết hợp điều kiện: VÀ (&&), HOẶC (||), PHỦ ĐỊNH (!)',
    syntax: 'đk1 && đk2, đk1 || đk2, !đk',
    example: {
      kind: 'console',
      code: `const coVe = true;
const duTuoi = false;

// &&: Cả hai điều kiện đều phải đúng
console.log("Được vào rạp (coVe && duTuoi):", coVe && duTuoi);

// ||: Chỉ cần một trong hai điều kiện đúng
console.log("Có quyền ưu tiên (coVe || duTuoi):", coVe || duTuoi);

// !: Đảo ngược đúng thành sai, sai thành đúng
console.log("Không đủ tuổi (!duTuoi):", !duTuoi);`,
      expectedOutput: [
        'Được vào rạp (coVe && duTuoi): false',
        'Có quyền ưu tiên (coVe || duTuoi): true',
        'Không đủ tuổi (!duTuoi): true',
      ],
      steps: [
        {
          lines: [5],
          title: 'Phép VÀ (&&)',
          text: 'Chỉ trả về true khi cả 2 vế đều là true. Nếu vế trái false, nó dừng ngay (short-circuit).',
        },
        {
          lines: [8],
          title: 'Phép HOẶC (||)',
          text: 'Trả về true nếu ít nhất một trong hai vế đúng.',
        },
        {
          lines: [11],
          title: 'Phép PHỦ ĐỊNH (!)',
          text: 'Biến true thành false và biến false thành true.',
        },
      ],
    },
    tip: 'Tận dụng toán tử || để đặt giá trị mặc định: const ten = tenNhap || "Khách ẩn danh";',
    consequence: 'Quên độ ưu tiên toán tử (&& có độ ưu tiên cao hơn ||) có thể làm câu lệnh điều kiện tính toán sai thứ tự.',
    analogy: '&& như ổ khóa 2 chìa phải vặn cả hai; || như nhà có 2 cửa chỉ cần 1 cửa mở là vào được.',
  },
  {
    id: 'js-string-methods',
    term: 'Phương thức chuỗi (includes, slice)',
    category: 'Toán tử & chuỗi',
    meaning: 'Tìm kiếm, cắt chuỗi và chuyển đổi chữ hoa/thường',
    syntax: 'str.includes(từKhóa), str.slice(từ, đến)',
    example: {
      kind: 'console',
      code: `const email = "contact@htmlive.dev";

console.log("Chứa đuôi @htmlive.dev:", email.includes("@htmlive.dev"));
console.log("Vị trí dấu @:", email.indexOf("@"));
console.log("Tên người dùng (cắt chuỗi):", email.slice(0, 7));
console.log("Chữ in hoa:", email.toUpperCase());`,
      expectedOutput: [
        'Chứa đuôi @htmlive.dev: true',
        'Vị trí dấu @: 7',
        'Tên người dùng (cắt chuỗi): contact',
        'Chữ in hoa: CONTACT@HTMLIVE.DEV',
      ],
      steps: [
        {
          lines: [3],
          title: 'includes()',
          text: 'Kiểm tra xem chuỗi có chứa đoạn từ khóa cần tìm hay không, trả về true hoặc false.',
        },
        {
          lines: [5],
          title: 'slice(0, 7)',
          text: 'Trích xuất các ký tự từ vị trí index 0 đến trước vị trí index 7.',
        },
      ],
    },
    tip: 'Các phương thức chuỗi không làm thay đổi chuỗi gốc mà luôn trả về một chuỗi mới.',
    consequence: 'Chuỗi trong JavaScript có chỉ số bắt đầu từ số 0 (Zero-indexed), không phải từ số 1.',
    analogy: 'slice() như chiếc kéo cắt băng rôn: cắt lấy đoạn từ vị trí A đến trước vị trí B.',
  },

  // ================= 3. ĐIỀU KIỆN & VÒNG LẶP =================
  {
    id: 'js-if-else',
    term: 'if...else',
    category: 'Điều kiện & vòng lặp',
    meaning: 'Rẽ nhánh thực thi mã dựa trên điều kiện đúng hoặc sai',
    syntax: 'if (điều_kiện) { ... } else { ... }',
    example: {
      kind: 'console',
      code: `const diemTB = 8.5;

if (diemTB >= 9.0) {
  console.log("Xếp loại: Xuất sắc");
} else if (diemTB >= 8.0) {
  console.log("Xếp loại: Giỏi");
} else if (diemTB >= 6.5) {
  console.log("Xếp loại: Khá");
} else {
  console.log("Xếp loại: Cần cố gắng hơn");
}`,
      expectedOutput: ['Xếp loại: Giỏi'],
      steps: [
        {
          lines: [3],
          title: 'Kiểm tra điều kiện 1',
          text: '8.5 >= 9.0 là false -> Bỏ qua nhánh đầu tiên.',
        },
        {
          lines: [5, 6],
          title: 'Kiểm tra điều kiện 2',
          text: '8.5 >= 8.0 là true -> Chạy khối mã in "Xếp loại: Giỏi" và kết thúc toàn bộ chuỗi if...else.',
        },
      ],
      illustration: {
        type: 'Flowchart',
        data: { condition: 'diemTB >= 8.0', branchTaken: 'true' },
      },
    },
    tip: 'Nếu chỉ có 1 câu lệnh ngắn, bạn có thể dùng toán tử 3 ngôi (Ternary Operator): điềuKiện ? đúng : sai;',
    consequence: 'Nếu viết nhầm dấu so sánh thành dấu gán (if (diem = 10)), điều kiện sẽ luôn luôn bị tính là true!',
    analogy: 'Như biển chỉ dẫn ở ngã ba đường: rẽ trái nếu đi Hà Nội, rẽ phải nếu đi Hải Phòng.',
  },
  {
    id: 'js-for-loop',
    term: 'Vòng lặp for',
    category: 'Điều kiện & vòng lặp',
    meaning: 'Lặp lại khối lệnh với số lần biết trước thông qua biến đếm',
    syntax: 'for (let i = 0; i < n; i++) { ... }',
    example: {
      kind: 'console',
      code: `console.log("Bắt đầu đếm bước chạy:");

for (let i = 1; i <= 4; i++) {
  console.log("Bước chân số " + i);
}

console.log("Hoàn thành bài tập!");`,
      expectedOutput: [
        'Bắt đầu đếm bước chạy:',
        'Bước chân số 1',
        'Bước chân số 2',
        'Bước chân số 3',
        'Bước chân số 4',
        'Hoàn thành bài tập!',
      ],
      steps: [
        {
          lines: [3],
          title: 'Khởi tạo (let i = 1)',
          text: 'Tạo biến đếm i với giá trị ban đầu là 1 (chỉ chạy 1 lần duy nhất).',
        },
        {
          lines: [3],
          title: 'Kiểm tra (i <= 4)',
          text: 'Nếu i còn nhỏ hơn hoặc bằng 4 thì tiếp tục chạy thân vòng lặp.',
        },
        {
          lines: [3],
          title: 'Bước nhảy (i++)',
          text: 'Tăng giá trị của i thêm 1 đơn vị sau mỗi vòng chạy thành công.',
        },
      ],
      illustration: {
        type: 'Flowchart',
        data: { loopCount: 4, counterVar: 'i' },
      },
    },
    tip: 'Có thể dùng từ khóa "break" để thoát sớm khỏi vòng lặp, hoặc "continue" để bỏ qua vòng hiện tại.',
    consequence: 'Nếu điều kiện lặp luôn đúng (ví dụ quên i++ hoặc viết i >= 0), vòng lặp sẽ chạy vĩnh viễn (Infinite Loop) làm treo trình duyệt.',
    analogy: 'Như đếm số vòng chạy quanh sân vận động: đủ 4 vòng là dừng lại nghỉ.',
  },
  {
    id: 'js-while-loop',
    term: 'Vòng lặp while',
    category: 'Điều kiện & vòng lặp',
    meaning: 'Lặp lại chừng nào điều kiện kiểm tra vẫn còn đúng',
    syntax: 'while (điều_kiện) { ... }',
    example: {
      kind: 'console',
      code: `let pinDienThoai = 3;

while (pinDienThoai > 0) {
  console.log(\`Điện thoại còn \${pinDienThoai}% pin...\`);
  pinDienThoai--; // Giảm pin sau mỗi lần dùng
}

console.log("Hết pin! Tự động tắt nguồn.");`,
      expectedOutput: [
        'Điện thoại còn 3% pin...',
        'Điện thoại còn 2% pin...',
        'Điện thoại còn 1% pin...',
        'Hết pin! Tự động tắt nguồn.',
      ],
      steps: [
        {
          lines: [3],
          title: 'Kiểm tra trước khi chạy',
          text: 'Kiểm tra pinDienThoai > 0. Lần 1: 3 > 0 (Đúng) -> Chạy.',
        },
        {
          lines: [5],
          title: 'Cập nhật biến điều kiện',
          text: 'Giảm pin từ 3 xuống 2, rồi xuống 1, cuối cùng là 0.',
        },
        {
          lines: [3],
          title: 'Kết thúc vòng lặp',
          text: 'Khi pin = 0, điều kiện 0 > 0 là false -> Vòng lặp dừng lại.',
        },
      ],
    },
    tip: 'Dùng while khi bạn không biết trước chính xác số lần cần lặp (chỉ biết điều kiện khi nào thì dừng).',
    consequence: 'Nếu quên dòng pinDienThoai--, biến pin sẽ mãi mãi là 3 và vòng lặp không bao giờ dừng lại.',
    analogy: 'Như xe máy chạy: chừng nào trong bình còn xăng thì động cơ vẫn nổ máy.',
  },

  // ================= 4. HÀM =================
  {
    id: 'js-function',
    term: 'Khai báo hàm (function)',
    category: 'Hàm',
    meaning: 'Đóng gói một đoạn mã để tái sử dụng nhiều lần với các tham số khác nhau',
    syntax: 'function tênHàm(thamSố) { return kếtQuả; }',
    example: {
      kind: 'console',
      code: `function tinhTienHang(giaTien, soLuong) {
  const tong = giaTien * soLuong;
  return tong;
}

const donHang1 = tinhTienHang(50000, 3);
console.log("Tổng đơn hàng 1:", donHang1 + "đ");

const donHang2 = tinhTienHang(120000, 2);
console.log("Tổng đơn hàng 2:", donHang2 + "đ");`,
      expectedOutput: ['Tổng đơn hàng 1: 150000đ', 'Tổng đơn hàng 2: 240000đ'],
      steps: [
        {
          lines: [1, 2, 3, 4],
          title: 'Định nghĩa hàm',
          text: 'Tạo công thức tính tiền với 2 đầu vào: giaTien và soLuong.',
        },
        {
          lines: [3],
          title: 'Từ khóa return',
          text: 'Trả giá trị đã tính toán về cho nơi gọi hàm và kết thúc hàm.',
        },
        {
          lines: [6, 9],
          title: 'Gọi hàm (Call / Invoke)',
          text: 'Truyền giá trị thực tế vào để nhận kết quả tương ứng.',
        },
      ],
      illustration: {
        type: 'FunctionMachine',
        data: { input: '50000, 3', fn: 'giaTien * soLuong', output: '150000' },
      },
    },
    tip: 'Hàm khai báo bằng từ khóa function có tính chất Hoisting (có thể gọi hàm trước dòng khai báo mà không bị lỗi).',
    consequence: 'Nếu hàm không có từ khóa return, nó sẽ mặc định trả về giá trị undefined.',
    analogy: 'Như chiếc máy xay sinh tố: bỏ hoa quả và sữa vào (tham số), nhấn nút xay, rót ra ly sinh tố (return).',
  },
  {
    id: 'js-arrow-function',
    term: 'Hàm mũi tên (Arrow Function)',
    category: 'Hàm',
    meaning: 'Cú pháp viết hàm hiện đại, ngắn gọn và không làm biến đổi ngữ cảnh this',
    syntax: 'const tênHàm = (thamSố) => biểuThức;',
    example: {
      kind: 'console',
      code: `// Cú pháp ngắn gọn: tự động return khi viết trên 1 dòng
const tinhBinhPhuong = (x) => x * x;
console.log("Bình phương của 6 là:", tinhBinhPhuong(6));

// Có nhiều dòng code: dùng thêm dấu ngoặc nhọn { ... }
const chaoHoi = (ten) => {
  const gio = 8;
  return \`Chào \${ten}, bây giờ là \${gio} giờ sáng!\`;
};
console.log(chaoHoi("Bảo"));`,
      expectedOutput: [
        'Bình phương của 6 là: 36',
        'Chào Bảo, bây giờ là 8 giờ sáng!',
      ],
      steps: [
        {
          lines: [2],
          title: 'Thu gọn cú pháp',
          text: 'Ký hiệu mũi tên => thay cho chữ function. Khi không có ngoặc nhọn {}, nó tự động return biểu thức.',
        },
        {
          lines: [6, 7, 8, 9],
          title: 'Khối lệnh nhiều dòng',
          text: 'Khi mở ngoặc nhọn { }, bắt buộc phải có từ khóa return nếu muốn trả về giá trị.',
        },
      ],
    },
    tip: 'Arrow function cực kỳ phổ biến khi làm việc với các phương thức mảng như .map(), .filter(), .forEach().',
    consequence: 'Nếu viết ngoặc nhọn { x * x } mà quên gõ chữ return, hàm sẽ trả về undefined.',
    analogy: 'Như chữ viết tắt tốc ký: truyền tải cùng một ý nghĩa nhưng tốn ít ký tự gõ phím hơn.',
  },

  // ================= 5. MẢNG =================
  {
    id: 'js-array-push-pop',
    term: 'push() & pop()',
    category: 'Mảng',
    meaning: 'Thêm phần tử vào cuối mảng & gỡ bỏ phần tử cuối cùng',
    syntax: 'mảng.push(mụcMới) & mảng.pop()',
    example: {
      kind: 'console',
      code: `const gioHang = ["Sách", "Bút"];
console.log("Giỏ hàng ban đầu:", gioHang);

// Thêm vào cuối mảng
gioHang.push("Thước kẻ");
console.log("Sau khi push('Thước kẻ'):", gioHang);

// Bỏ phần tử cuối cùng
const monBiBo = gioHang.pop();
console.log("Món vừa lấy ra:", monBiBo);
console.log("Giỏ hàng còn lại:", gioHang);`,
      expectedOutput: [
        'Giỏ hàng ban đầu: [ "Sách", "Bút" ]',
        'Sau khi push(\'Thước kẻ\'): [ "Sách", "Bút", "Thước kẻ" ]',
        'Món vừa lấy ra: Thước kẻ',
        'Giỏ hàng còn lại: [ "Sách", "Bút" ]',
      ],
      steps: [
        {
          lines: [5],
          title: 'push()',
          text: 'Tăng độ dài mảng thêm 1 và đặt "Thước kẻ" vào vị trí cuối.',
        },
        {
          lines: [9],
          title: 'pop()',
          text: 'Lấy phần tử cuối cùng ra, xóa nó khỏi mảng và trả về giá trị đó.',
        },
      ],
      illustration: {
        type: 'ArrayCells',
        data: { items: ['Sách', 'Bút', 'Thước kẻ'], action: 'push/pop' },
      },
    },
    tip: 'Muốn thêm/bớt ở ĐẦU mảng, dùng unshift() để thêm và shift() để lấy ra.',
    consequence: 'push() và pop() trực tiếp làm biến đổi mảng gốc (Mutate).',
    analogy: 'Như chồng đĩa trong quán ăn: đặt thêm đĩa lên đỉnh chồng (push) hoặc nhấc đĩa trên cùng ra (pop).',
  },
  {
    id: 'js-array-map',
    term: 'map()',
    category: 'Mảng',
    meaning: 'Biến đổi từng phần tử trong mảng thành một mảng mới hoàn toàn',
    syntax: 'mảng.map((item) => biếnĐổi)',
    example: {
      kind: 'console',
      code: `const giaGoc = [100, 200, 300];

// Nhân đôi tất cả giá tiền
const giaMoi = giaGoc.map((gia) => gia * 2);

console.log("Mảng gốc (không đổi):", giaGoc);
console.log("Mảng mới sau khi map:", giaMoi);`,
      expectedOutput: [
        'Mảng gốc (không đổi): [ 100, 200, 300 ]',
        'Mảng mới sau khi map: [ 200, 400, 600 ]',
      ],
      steps: [
        {
          lines: [4],
          title: 'Lặp qua từng phần tử',
          text: 'map() duyệt qua từng số 100, 200, 300, áp dụng công thức nhân 2 cho mỗi số.',
        },
        {
          lines: [6, 7],
          title: 'Không làm hỏng mảng cũ',
          text: 'Mảng giaGoc vẫn giữ nguyên vẹn, kết quả mới được gom vào mảng mới giaMoi.',
        },
      ],
      illustration: {
        type: 'ArrayCells',
        data: { before: [100, 200, 300], after: [200, 400, 600], label: '* 2' },
      },
    },
    tip: 'Luôn phải có giá trị trả về trong hàm callback của map(), nếu không mảng mới sẽ toàn giá trị undefined.',
    consequence: 'Dùng map() khi bạn cần kết quả là một mảng mới có cùng độ dài; nếu chỉ muốn in ra màn hình mà không cần mảng mới, hãy dùng forEach().',
    analogy: 'Như dây chuyền sản xuất: từng tấm gỗ thô đi qua máy bào đều được biến thành mặt bàn láng bóng.',
  },
  {
    id: 'js-array-filter',
    term: 'filter()',
    category: 'Mảng',
    meaning: 'Lọc ra các phần tử thỏa mãn điều kiện và gom vào mảng mới',
    syntax: 'mảng.filter((item) => điềuKiện)',
    example: {
      kind: 'console',
      code: `const danhSachDiem = [4.5, 8.0, 3.5, 9.2, 5.0, 7.5];

// Chỉ giữ lại điểm số đạt từ 5.0 trở lên
const danhSachQuaMon = danhSachDiem.filter((diem) => diem >= 5.0);

console.log("Tổng số bài thi:", danhSachDiem.length);
console.log("Số bài thi qua môn (>= 5):", danhSachQuaMon);`,
      expectedOutput: [
        'Tổng số bài thi: 6',
        'Số bài thi qua môn (>= 5): [ 8, 9.2, 5, 7.5 ]',
      ],
      steps: [
        {
          lines: [4],
          title: 'Kiểm tra từng phần tử',
          text: 'Nếu điều kiện (diem >= 5.0) trả về true thì phần tử đó được giữ lại; nếu false thì bị loại bỏ.',
        },
        {
          lines: [7],
          title: 'Mảng kết quả',
          text: 'Mảng mới chỉ chứa 4 điểm hợp lệ: [8, 9.2, 5, 7.5].',
        },
      ],
    },
    tip: 'filter() không làm thay đổi mảng gốc ban đầu.',
    consequence: 'Nếu không có phần tử nào thỏa mãn điều kiện, filter() sẽ trả về một mảng rỗng [] chứ không bị lỗi.',
    analogy: 'Như chiếc rây bột: những hạt mịn nhỏ hơn lỗ rây lọt qua, những hạt to thô bị giữ lại.',
  },

  // ================= 6. ĐỐI TƯỢNG =================
  {
    id: 'js-object-literal',
    term: 'Đối tượng (Object Literal)',
    category: 'Đối tượng',
    meaning: 'Lưu trữ tập hợp dữ liệu dưới dạng cặp khóa - giá trị (Key - Value)',
    syntax: 'const obj = { khóa: giáTrị, ... };',
    example: {
      kind: 'console',
      code: `const dienThoai = {
  hang: "Apple",
  mauSac: "Titan Tự Nhiên",
  giaTien: 28000000,
  conHang: true
};

// Đọc giá trị bằng dấu chấm hoặc dấu ngoặc vuông
console.log("Hãng sản xuất:", dienThoai.hang);
console.log("Màu sắc:", dienThoai["mauSac"]);

// Cập nhật hoặc thêm thuộc tính mới
dienThoai.giaTien = 26500000;
dienThoai.baoHanh = "12 tháng";
console.log("Giá khuyến mãi:", dienThoai.giaTien);
console.log("Bảo hành:", dienThoai.baoHanh);`,
      expectedOutput: [
        'Hãng sản xuất: Apple',
        'Màu sắc: Titan Tự Nhiên',
        'Giá khuyến mãi: 26500000',
        'Bảo hành: 12 tháng',
      ],
      steps: [
        {
          lines: [1, 2, 3, 4, 5, 6],
          title: 'Định nghĩa đối tượng',
          text: 'Nhóm các thông tin liên quan của một thực thể vào chung một biến dienThoai.',
        },
        {
          lines: [9, 10],
          title: 'Truy xuất thuộc tính',
          text: 'dienThoai.hang lấy ra giá trị "Apple".',
        },
        {
          lines: [13, 14],
          title: 'Thêm/sửa thuộc tính linh hoạt',
          text: 'JavaScript cho phép thêm thuộc tính mới vào object bất kỳ lúc nào.',
        },
      ],
    },
    tip: 'Dùng dấu ngoặc vuông obj[tênBiến] khi tên thuộc tính được lưu trong một biến khác.',
    consequence: 'Nếu truy xuất một thuộc tính không tồn tại (như dienThoai.trongLuong), JavaScript sẽ trả về undefined chứ không báo lỗi.',
    analogy: 'Như thẻ căn cước công dân: có mục Họ tên, Ngày sinh, Quê quán đi kèm thông tin cụ thể.',
  },
  {
    id: 'js-object-keys-values',
    term: 'Object.keys() & Object.values()',
    category: 'Đối tượng',
    meaning: 'Lấy danh sách toàn bộ tên thuộc tính (keys) hoặc toàn bộ giá trị (values)',
    syntax: 'Object.keys(obj) & Object.values(obj)',
    example: {
      kind: 'console',
      code: `const diemMonHoc = {
  toan: 9.0,
  van: 8.5,
  anh: 9.5
};

const danhSachMon = Object.keys(diemMonHoc);
console.log("Các môn học:", danhSachMon);

const danhSachDiem = Object.values(diemMonHoc);
console.log("Điểm số các môn:", danhSachDiem);`,
      expectedOutput: [
        'Các môn học: [ "toan", "van", "anh" ]',
        'Điểm số các môn: [ 9, 8.5, 9.5 ]',
      ],
      steps: [
        {
          lines: [7],
          title: 'Object.keys()',
          text: 'Trả về một mảng chứa toàn bộ tên các khóa: ["toan", "van", "anh"].',
        },
        {
          lines: [10],
          title: 'Object.values()',
          text: 'Trả về một mảng chứa toàn bộ các giá trị điểm tương ứng: [9.0, 8.5, 9.5].',
        },
      ],
    },
    tip: 'Rất tiện khi bạn muốn đếm số lượng thuộc tính trong đối tượng bằng Object.keys(obj).length.',
    consequence: 'Đối tượng thuần túy không có thuộc tính .length như mảng, nên bắt buộc phải thông qua Object.keys().',
    analogy: 'Như mở mục lục cuốn sổ: Object.keys() đọc tên các mục, Object.values() đọc nội dung trong từng mục.',
  },

  // ================= 7. DOM & SỰ KIỆN =================
  {
    id: 'js-dom-query',
    term: 'document.querySelector()',
    category: 'DOM & Sự kiện',
    meaning: 'Tìm kiếm phần tử HTML trên trang theo bộ chọn CSS (class, id, tag)',
    syntax: 'document.querySelector("#id hoặc .class")',
    example: {
      kind: 'mixed',
      code: `// Tìm phần tử tiêu đề và đổi nội dung chữ
const tieuDe = document.querySelector("#tieu-de-chinh");
console.log("Thẻ tìm thấy:", tieuDe.tagName);

tieuDe.textContent = "Nội dung đã được JavaScript cập nhật!";
tieuDe.style.color = "#4f46e5";`,
      domHtml: `<h2 id="tieu-de-chinh" style="font-family:sans-serif; color:#64748b;">Tiêu đề ban đầu</h2>`,
      expectedOutput: ['Thẻ tìm thấy: H2'],
      steps: [
        {
          lines: [2],
          title: 'Tìm kiếm phần tử',
          text: 'Tìm phần tử đầu tiên trên trang có id="tieu-de-chinh".',
        },
        {
          lines: [5, 6],
          title: 'Thao tác giao diện',
          text: 'Thay đổi chuỗi chữ hiển thị và đổi màu chữ sang tím.',
        },
      ],
    },
    tip: 'Nếu muốn tìm TẤT CẢ các phần tử khớp (ví dụ tất cả các nút), hãy dùng document.querySelectorAll().',
    consequence: 'Nếu không tìm thấy phần tử nào khớp, hàm trả về null. Cố tình truy xuất tieuDe.textContent khi tieuDe là null sẽ gây lỗi TypeError: Cannot read properties of null.',
    analogy: 'Như kính lúp tìm kiếm: quét toàn bộ ngôi nhà để tìm đúng món đồ có gắn nhãn tên tương ứng.',
  },
  {
    id: 'js-dom-events',
    term: 'addEventListener()',
    category: 'DOM & Sự kiện',
    meaning: 'Lắng nghe sự kiện người dùng (click, input, submit) và kích hoạt hàm xử lý',
    syntax: 'element.addEventListener("sự_kiện", callback)',
    example: {
      kind: 'mixed',
      code: `const nutBam = document.querySelector("#btn-dem");
const ketQua = document.querySelector("#so-dem");

let soLan = 0;

nutBam.addEventListener("click", () => {
  soLan++;
  ketQua.textContent = soLan;
  console.log("Đã click lần thứ:", soLan);
});`,
      domHtml: `<div style="font-family:sans-serif; padding:12px;">
  <button id="btn-dem" style="padding:8px 16px; background:#6366f1; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
    Bấm để tăng số
  </button>
  <p style="margin-top:8px; font-size:14px;">Số lần đã bấm: <strong id="so-dem" style="color:#6366f1; font-size:18px;">0</strong></p>
</div>`,
      expectedOutput: ['Sẵn sàng lắng nghe sự kiện click...'],
      steps: [
        {
          lines: [1, 2],
          title: 'Lấy phần tử nút và hiển thị',
          text: 'Lấy tham chiếu đến nút bấm và thẻ số đếm trong DOM.',
        },
        {
          lines: [6, 10],
          title: 'Gắn tai nghe sự kiện',
          text: 'Trình duyệt sẽ đợi khi người dùng nhấp chuột vào nút thì tự động gọi hàm callback bên trong.',
        },
      ],
    },
    tip: 'Các sự kiện phổ biến: "click" (bấm chuột), "input" (gõ phím vào ô nhập), "submit" (gửi biểu mẫu), "mouseover" (rê chuột).',
    consequence: 'Tên sự kiện là "click", không viết là "onclick" khi dùng với hàm addEventListener.',
    analogy: 'Như chuông cửa: người khách bấm nút (sự kiện) thì trong nhà chuông reo và có người ra mở cửa (hàm xử lý).',
  },
  {
    id: 'js-dom-classlist',
    term: 'classList (add, remove, toggle)',
    category: 'DOM & Sự kiện',
    meaning: 'Thêm, xóa hoặc bật tắt class CSS linh hoạt trên phần tử HTML',
    syntax: 'element.classList.add("ten-class") & .toggle()',
    example: {
      kind: 'mixed',
      code: `const hopThongBao = document.querySelector("#hop-tb");

// Thêm class và kiểm tra
hopThongBao.classList.add("noi-bat");
console.log("Có chứa class noi-bat?", hopThongBao.classList.contains("noi-bat"));

// Bật tắt class (nếu có thì xóa, nếu chưa có thì thêm)
hopThongBao.classList.toggle("da-doc");
console.log("Danh sách class hiện tại:", hopThongBao.className);`,
      domHtml: `<style>
  .noi-bat { border: 2px solid #6366f1 !important; background: #e0e7ff !important; }
  .da-doc { opacity: 0.8; }
</style>
<div id="hop-tb" style="padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px; font-family:sans-serif;">
  Thông báo mới từ hệ thống HTMLive
</div>`,
      expectedOutput: [
        'Có chứa class noi-bat? true',
        'Danh sách class hiện tại: noi-bat da-doc',
      ],
      steps: [
        {
          lines: [4],
          title: 'classList.add()',
          text: 'Gắn thêm class "noi-bat" vào phần tử mà không làm mất đi các class cũ.',
        },
        {
          lines: [8],
          title: 'classList.toggle()',
          text: 'Tiện lợi khi làm nút bật/tắt (như bật tắt chế độ Dark Mode hoặc đóng mở menu).',
        },
      ],
    },
    tip: 'Khi truyền tên class vào classList.add("active"), không viết kèm dấu chấm ở đầu (không viết .active).',
    consequence: 'Dùng thuộc tính cũ element.className = "active" sẽ ghi đè và làm mất sạch toàn bộ các class trước đó của phần tử.',
    analogy: 'Như gắn thêm huy hiệu lên áo: có thể gắn thêm huy hiệu mới (add) hoặc tháo bớt ra (remove).',
  },

  // ================= 8. HẸN GIỜ & GỠ LỖI =================
  {
    id: 'js-set-timeout',
    term: 'setTimeout()',
    category: 'Hẹn giờ & gỡ lỗi',
    meaning: 'Trì hoãn thực thi một đoạn mã sau một khoảng thời gian định trước (tính bằng mili-giây)',
    syntax: 'setTimeout(callback, thờiGianMs)',
    example: {
      kind: 'console',
      code: `console.log("1. Bắt đầu đun nước...");

// 1000 mili-giây = 1 giây
setTimeout(() => {
  console.log("3. Nước đã sôi sau 1 giây! Có thể pha trà.");
}, 1000);

console.log("2. Làm việc khác trong khi chờ nước sôi...");`,
      expectedOutput: [
        '1. Bắt đầu đun nước...',
        '2. Làm việc khác trong khi chờ nước sôi...',
        '3. Nước đã sôi sau 1 giây! Có thể pha trà.',
      ],
      steps: [
        {
          lines: [1],
          title: 'Thực thi đồng bộ dòng 1',
          text: 'In "1. Bắt đầu đun nước..." ngay lập tức.',
        },
        {
          lines: [4, 5, 6],
          title: 'Đăng ký bộ hẹn giờ',
          text: 'JavaScript giao việc chờ 1000ms cho Web API và tiếp tục chạy ngay xuống dòng dưới mà không dừng lại chờ.',
        },
        {
          lines: [8],
          title: 'Thực thi dòng 2 trước',
          text: 'In dòng 2 ngay lập tức.',
        },
        {
          lines: [5],
          title: 'Hết thời gian hẹn giờ',
          text: 'Sau 1000ms, hàm callback mới được đẩy vào hàng đợi và in dòng 3.',
        },
      ],
      illustration: {
        type: 'Timeline',
        data: { delayMs: 1000, label: 'Bất đồng bộ (Asynchronous)' },
      },
    },
    tip: '1000ms = 1 giây. Có thể hủy hẹn giờ bằng clearTimeout(timerId) nếu người dùng rời khỏi trang trước khi giờ điểm.',
    consequence: 'setTimeout không chặn luồng code chính; các dòng lệnh bên dưới sẽ chạy ngay lập tức trước khi hẹn giờ hoàn tất.',
    analogy: 'Như đặt chuông báo thức: hẹn giờ xong bạn vẫn làm việc bình thường, khi chuông reo mới xử lý việc đó.',
  },
  {
    id: 'js-console-debug',
    term: 'console.log / warn / error',
    category: 'Hẹn giờ & gỡ lỗi',
    meaning: 'Bộ công cụ in thông điệp gỡ lỗi, cảnh báo và báo lỗi ra cửa sổ kiểm tra của lập trình viên',
    syntax: 'console.log(...), console.warn(...), console.error(...)',
    example: {
      kind: 'console',
      code: `const nguoiDung = "HoangLong";
const dungLuongCon = 5; // Phần trăm

// In thông tin bình thường
console.log("Đăng nhập thành công với tài khoản:", nguoiDung);

// In cảnh báo màu vàng
if (dungLuongCon < 10) {
  console.warn("Cảnh báo: Bộ nhớ sắp hết! Chỉ còn", dungLuongCon + "%");
}

// In lỗi màu đỏ
console.error("Lỗi 404: Không tìm thấy ảnh đại diện của người dùng!");`,
      expectedOutput: [
        'Đăng nhập thành công với tài khoản: HoangLong',
        'Cảnh báo: Bộ nhớ sắp hết! Chỉ còn 5%',
        'Lỗi 404: Không tìm thấy ảnh đại diện của người dùng!',
      ],
      steps: [
        {
          lines: [5],
          title: 'console.log()',
          text: 'In thông tin kiểm tra luồng chạy bình thường.',
        },
        {
          lines: [9],
          title: 'console.warn()',
          text: 'In thông báo cảnh báo có biểu tượng tam giác vàng.',
        },
        {
          lines: [13],
          title: 'console.error()',
          text: 'In thông báo lỗi màu đỏ kèm theo vị trí dòng code phát sinh sự cố.',
        },
      ],
    },
    tip: 'Có thể in nhiều biến cùng lúc bằng cách phân tách bằng dấu phẩy: console.log("A:", a, "B:", b);',
    consequence: 'Trước khi xuất bản sản phẩm chính thức lên môi trường thực tế (Production), nên dọn dẹp bớt các lệnh console.log dư thừa để tối ưu hiệu năng.',
    analogy: 'Như nhật ký hành trình máy bay: ghi chép lại mọi sự kiện diễn ra để phi công và kỹ sư đối chiếu khi cần.',
  },
];

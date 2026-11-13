import { JsCheatItem } from '../types/learning';

export const JS_CHEAT_ITEMS: JsCheatItem[] = [
  // Biến & kiểu
  {
    id: 'js-let',
    name: 'let',
    syntax: 'let tenBien = giaTri;',
    category: 'Biến & kiểu',
    description: 'Khai báo biến có thể gán lại giá trị mới sau này.',
    example: 'let diem = 8;\ndiem = 10;\nconsole.log(diem); // 10',
    explanation: 'Dùng let khi giá trị của biến sẽ thay đổi theo thời gian.'
  },
  {
    id: 'js-const',
    name: 'const',
    syntax: 'const TEN_HANG = giaTri;',
    category: 'Biến & kiểu',
    description: 'Khai báo hằng số không thể gán lại sau khi khởi tạo.',
    example: 'const PI = 3.14159;\nconsole.log(PI);',
    explanation: 'Luôn ưu tiên const nếu bạn biết chắc giá trị sẽ không bao giờ đổi.'
  },
  {
    id: 'js-typeof',
    name: 'typeof',
    syntax: 'typeof giaTri',
    category: 'Biến & kiểu',
    description: 'Kiểm tra kiểu dữ liệu của biến (string, number, boolean, object, function).',
    example: 'console.log(typeof "Xin chào"); // "string"\nconsole.log(typeof 100); // "number"',
    explanation: 'Giúp kiểm tra và gỡ lỗi khi không chắc biến đang chứa loại dữ liệu nào.'
  },
  {
    id: 'js-template-literal',
    name: 'Template Literal (`...`)',
    syntax: '`Chuỗi chữ ${bien}`',
    category: 'Biến & kiểu',
    description: 'Chuỗi mẫu hiện đại cho phép nhúng biến và biểu thức trực tiếp bằng dấu backtick.',
    example: 'let ten = "Linh";\nlet tuoi = 18;\nconsole.log(`Chào ${ten}, bạn ${tuoi} tuổi.`);',
    explanation: 'Dấu huyền (backtick `) nằm dưới phím Esc trên bàn phím.'
  },

  // Điều kiện & vòng lặp
  {
    id: 'js-if-else',
    name: 'if...else',
    syntax: 'if (dieuKien) { ... } else { ... }',
    category: 'Điều kiện & vòng lặp',
    description: 'Rẽ nhánh thực thi dựa trên điều kiện đúng (true) hoặc sai (false).',
    example: 'let tuoi = 20;\nif (tuoi >= 18) {\n  console.log("Đã trưởng thành");\n} else {\n  console.log("Vị thành niên");\n}',
    explanation: 'Cấu trúc ra quyết định cơ bản nhất trong lập trình.'
  },
  {
    id: 'js-strict-equal',
    name: 'So sánh nghiêm ngặt (===)',
    syntax: 'a === b',
    category: 'Điều kiện & vòng lặp',
    description: 'So sánh cả giá trị lẫn kiểu dữ liệu mà không ép kiểu ngầm.',
    example: 'console.log(5 === 5); // true\nconsole.log(5 === "5"); // false (khác kiểu)',
    explanation: 'Luôn sử dụng === thay vì == để code chặt chẽ và không phát sinh lỗi bất ngờ.'
  },
  {
    id: 'js-for',
    name: 'Vòng lặp for',
    syntax: 'for (let i = 0; i < n; i++) { ... }',
    category: 'Điều kiện & vòng lặp',
    description: 'Lặp lại khối mã với số lần biết trước thông qua biến đếm.',
    example: 'for (let i = 1; i <= 3; i++) {\n  console.log("Lần " + i);\n}',
    explanation: 'Gồm 3 phần: khởi tạo biến đếm, điều kiện tiếp tục, và bước nhảy.'
  },
  {
    id: 'js-while',
    name: 'Vòng lặp while',
    syntax: 'while (dieuKien) { ... }',
    category: 'Điều kiện & vòng lặp',
    description: 'Lặp lại chừng nào điều kiện vẫn còn đúng.',
    example: 'let count = 3;\nwhile (count > 0) {\n  console.log("Đếm lùi: " + count);\n  count--;\n}',
    explanation: 'Nhớ cập nhật biến điều kiện bên trong vòng lặp để tránh infinite loop.'
  },

  // Hàm
  {
    id: 'js-function',
    name: 'function',
    syntax: 'function tenHam(thamSo) { return ...; }',
    category: 'Hàm',
    description: 'Khai báo hàm truyền thống có thể gọi lại nhiều lần.',
    example: 'function tinhBinhPhuong(x) {\n  return x * x;\n}\nconsole.log(tinhBinhPhuong(4)); // 16',
    explanation: 'Dùng return để trả kết quả tính toán ra bên ngoài.'
  },
  {
    id: 'js-arrow-fn',
    name: 'Arrow Function (=>)',
    syntax: 'const tenHam = (thamSo) => { ... };',
    category: 'Hàm',
    description: 'Cú pháp hàm mũi tên ngắn gọn, hiện đại và phổ biến nhất trong JS ngày nay.',
    example: 'const cong = (a, b) => a + b;\nconsole.log(cong(10, 20)); // 30',
    explanation: 'Nếu chỉ có 1 dòng return, có thể bỏ cả ngoặc nhọn { } và từ khóa return.'
  },

  // Mảng
  {
    id: 'js-push-pop',
    name: 'push / pop',
    syntax: 'mang.push(item); mang.pop();',
    category: 'Mảng',
    description: 'Thêm phần tử vào cuối mảng (push) hoặc xóa phần tử ở cuối mảng (pop).',
    example: 'let hoaQua = ["Táo", "Cam"];\nhoaQua.push("Xoài");\nconsole.log(hoaQua); // ["Táo", "Cam", "Xoài"]\nhoaQua.pop();\nconsole.log(hoaQua); // ["Táo", "Cam"]',
    explanation: 'Phương thức thao tác trực tiếp với mảng.'
  },
  {
    id: 'js-map',
    name: 'map()',
    syntax: 'mang.map(item => item * 2)',
    category: 'Mảng',
    description: 'Biến đổi từng phần tử trong mảng và trả về một mảng mới.',
    example: 'let so = [1, 2, 3];\nlet nhanDoi = so.map(x => x * 2);\nconsole.log(nhanDoi); // [2, 4, 6]',
    explanation: 'Không làm thay đổi mảng ban đầu, tạo ra mảng mới với độ dài tương đương.'
  },
  {
    id: 'js-filter',
    name: 'filter()',
    syntax: 'mang.filter(item => dieuKien)',
    category: 'Mảng',
    description: 'Lọc ra các phần tử thỏa mãn điều kiện và trả về mảng mới.',
    example: 'let diem = [5, 8, 4, 9, 7];\nlet quaMon = diem.filter(d => d >= 5);\nconsole.log(quaMon); // [5, 8, 9, 7]',
    explanation: 'Chỉ giữ lại các phần tử mà hàm kiểm tra trả về true.'
  },

  // Đối tượng
  {
    id: 'js-object',
    name: 'Object Literal',
    syntax: 'let obj = { key: value, ... };',
    category: 'Đối tượng',
    description: 'Tạo đối tượng chứa nhiều thuộc tính theo cặp khóa - giá trị.',
    example: 'let sach = {\n  tieuDe: "Dế Mèn Phiêu Lưu Ký",\n  tacGia: "Tô Hoài",\n  namXuatBan: 1941\n};\nconsole.log(sach.tieuDe);',
    explanation: 'Truy cập thuộc tính bằng dấu chấm (.key) hoặc ngoặc vuông (["key"]).'
  },

  // DOM & Sự kiện
  {
    id: 'js-query-selector',
    name: 'document.querySelector',
    syntax: 'document.querySelector(selector)',
    category: 'DOM & Sự kiện',
    description: 'Tìm kiếm phần tử HTML đầu tiên khớp với bộ chọn CSS.',
    example: 'const btn = document.querySelector("#my-btn");\nconsole.log(btn);',
    explanation: 'Hỗ trợ tất cả bộ chọn CSS: #id, .class, tag, [attribute].'
  },
  {
    id: 'js-add-event-listener',
    name: 'addEventListener',
    syntax: 'element.addEventListener("event", callback)',
    category: 'DOM & Sự kiện',
    description: 'Lắng nghe sự kiện người dùng (click, input, submit, mouseover...).',
    example: '// const nut = document.querySelector("button");\n// nut.addEventListener("click", () => console.log("Đã click"));',
    explanation: 'Chuẩn tương tác hiện đại giữa JavaScript và giao diện trang web.'
  }
];

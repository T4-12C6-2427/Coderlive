export interface ErrorGuideQuery {
  message?: string;
  auditAll?: boolean;
}

export interface CommonErrorGuideEntry {
  id: string;
  title: string;
  meaning: string;
  howToFix: string[];
}

const GUIDE_RULES: Array<{
  pattern: RegExp;
  entry: CommonErrorGuideEntry;
}> = [
  {
    pattern: /is not defined|ReferenceError/i,
    entry: {
      id: 'ref-not-defined',
      title: 'Biến hoặc hàm chưa được khai báo (ReferenceError)',
      meaning:
        'JavaScript đang cố gắng sử dụng một tên biến, hằng số hoặc hàm chưa từng được khai báo trong phạm vi hiện tại (hoặc bị gõ sai chính tả/sai chữ hoa-thường).',
      howToFix: [
        'Kiểm tra lại chính tả tên biến/hàm (JavaScript phân biệt chữ hoa và chữ thường).',
        'Khai báo biến bằng let / const hoặc định nghĩa function trước khi gọi.',
        'Nếu dùng thư viện ngoài, kiểm tra thẻ <script src="..."> ở tab HTML đã tải thành công chưa.',
      ],
    },
  },
  {
    pattern: /Cannot read propert(?:y|ies) of (?:null|undefined)|null is not an object|undefined is not an object/i,
    entry: {
      id: 'null-deref',
      title: 'Truy cập thuộc tính trên giá trị null hoặc undefined (TypeError)',
      meaning:
        'Thường xảy ra khi document.getElementById(...) hoặc querySelector(...) không tìm thấy phần tử HTML nào khớp selector, trả về null nhưng code vẫn đọc .textContent, .value hoặc gọi .addEventListener(...).',
      howToFix: [
        'Kiểm tra lại tên id hoặc class trong tab HTML có khớp 100% với JavaScript hay không.',
        'Thêm kiểm tra an toàn trước khi dùng (ví dụ: if (btn) { btn.addEventListener(...); } hoặc dùng toán tử ?. như el?.textContent).',
        'Đảm bảo phần tử HTML tồn tại trước khi đoạn JS chạy.',
      ],
    },
  },
  {
    pattern: /is not a function/i,
    entry: {
      id: 'not-a-function',
      title: 'Giá trị được gọi không phải là hàm (TypeError)',
      meaning:
        'Bạn đang dùng dấu ngoặc tròn () để gọi một biến vốn là số, chuỗi, mảng, đối tượng hoặc undefined (ví dụ: nhầm thuộc tính với phương thức, hoặc tên hàm bị biến cùng tên ghi đè).',
      howToFix: [
        'Kiểm tra xem tên biến có trùng với tên hàm không.',
        'Kiểm tra tên phương thức có viết đúng chính tả không (ví dụ: toUpperCase, querySelectorAll, forEach).',
      ],
    },
  },
  {
    pattern: /Assignment to constant variable/i,
    entry: {
      id: 'const-reassign',
      title: 'Gán lại giá trị cho biến hằng const',
      meaning: 'Biến được khai báo bằng const không thể gán lại giá trị mới bằng dấu =.',
      howToFix: [
        'Đổi khai báo từ const sang let nếu giá trị biến cần thay đổi (ví dụ biến đếm count).',
      ],
    },
  },
  {
    pattern: /SyntaxError|Unexpected token|Unexpected end of input|missing \) after argument list|Unterminated string/i,
    entry: {
      id: 'syntax-error',
      title: 'Lỗi cú pháp JavaScript (SyntaxError)',
      meaning:
        'Mã nguồn bị thiếu dấu đóng ngoặc (), {}, [], thiếu dấu nháy đóng chuỗi (\' hoặc "), thừa dấu phẩy/chấm phẩy hoặc viết sai từ khóa.',
      howToFix: [
        'Kiểm tra dòng được báo lỗi và 1–2 dòng ngay phía trên xem có cặp ngoặc hoặc dấu nháy nào chưa đóng không.',
        'Kiểm tra các dấu phẩy (,) giữa các thuộc tính trong Object { a: 1, b: 2 } hoặc tham số hàm.',
      ],
    },
  },
  {
    pattern: /Maximum call stack size exceeded/i,
    entry: {
      id: 'stack-overflow',
      title: 'Đệ quy vô hạn (Maximum call stack size exceeded)',
      meaning: 'Một hàm đang tự gọi lại chính nó liên tục mà không có điều kiện dừng hợp lệ.',
      howToFix: [
        'Thêm điều kiện dừng (base case) ở đầu hàm đệ quy.',
        'Kiểm tra vòng gọi chéo giữa hai hàm hoặc listener tự kích hoạt chính nó.',
      ],
    },
  },
  {
    pattern: /Promise|unhandledrejection|fetch|NetworkError|Failed to fetch/i,
    entry: {
      id: 'promise-network',
      title: 'Lỗi bất đồng bộ (Promise / Fetch)',
      meaning:
        'Một Promise bị từ chối hoặc yêu cầu mạng fetch() thất bại nhưng chưa có .catch() hoặc khối try { ... } catch (err) { ... } bao bọc.',
      howToFix: [
        'Bọc lệnh await trong try { ... } catch (err) { ... } hoặc nối thêm .catch(...) sau Promise.',
        'Kiểm tra URL API có đúng và hỗ trợ CORS khi chạy trong sandbox xem trước không.',
      ],
    },
  },
  {
    pattern: /Không tải được hình ảnh|Không tải được tệp JavaScript|Không tải được tài nguyên/i,
    entry: {
      id: 'resource-load',
      title: 'Không tải được tài nguyên ngoài (Ảnh / Script / CSS)',
      meaning:
        'Đường dẫn src hoặc href không tồn tại (404), viết sai chính tả, dùng đường dẫn tệp cục bộ trên máy cá nhân, hoặc máy chủ từ xa chặn tải.',
      howToFix: [
        'Kiểm tra lại URL trong thuộc tính src / href.',
        'Đảm bảo dùng liên kết HTTPS công khai hợp lệ thay vì đường dẫn ổ đĩa máy tính (C:\\...).',
      ],
    },
  },
];

export function matchCommonErrorGuides(errorInfo?: ErrorGuideQuery | null): CommonErrorGuideEntry[] {
  const msg = errorInfo?.message || '';
  if (errorInfo?.auditAll) {
    return [
      {
        id: 'audit-checklist',
        title: 'Danh sách tự kiểm tra nhanh HTML / CSS / JS',
        meaning:
          'Bạn có thể rà soát các lỗi phổ biến ngay dưới đây, kết hợp với mục "Vấn đề" kiểm tra tĩnh HTML/CSS.',
        howToFix: [
          'HTML: Đảm bảo mọi thẻ mở đều có thẻ đóng, không trùng thuộc tính id, và thẻ <img> có thuộc tính alt.',
          'CSS: Kiểm tra dấu hai chấm (:), chấm phẩy (;) cuối mỗi thuộc tính và cặp ngoặc nhọn { }.',
          'JS: Kiểm tra tên id/class trong querySelector/getElementById khớp với HTML và xử lý trường hợp phần tử trả về null.',
        ],
      },
    ];
  }

  const matched = GUIDE_RULES.filter((r) => r.pattern.test(msg)).map((r) => r.entry);
  if (matched.length > 0) return matched;

  return [
    {
      id: 'general-debug',
      title: 'Hướng dẫn tự kiểm tra lỗi phổ biến',
      meaning:
        'Hãy xem kỹ vị trí Tab, Dòng và Cột được báo lỗi, kiểm tra tên biến/hàm, dấu ngoặc và giá trị null/undefined xung quanh dòng đó.',
      howToFix: [
        'Bấm trực tiếp vào nhãn vị trí (ví dụ: JS, dòng 12) ở thanh Console để nhảy con trỏ tới đúng dòng lỗi.',
        'Dùng console.log(...) ngay phía trên dòng lỗi để in giá trị biến ra bảng Console.',
      ],
    },
  ];
}

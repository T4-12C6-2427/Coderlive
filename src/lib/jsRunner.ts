/**
 * jsRunner.ts
 * Bộ thực thi JavaScript an toàn dành cho học viên
 * - Web Worker có timeout 3 giây chống treo máy tuyệt đối cho bài 1-8
 * - Sandboxed Iframe (sandbox="allow-scripts", không allow-same-origin) cho bài 9-12 (DOM)
 * - Vô hiệu hóa fetch, XHR, WebSocket, window.open
 * - Chuyển đổi alert, prompt, confirm thành console log
 * - Dịch lỗi JavaScript sang tiếng Việt thân thiện kèm số dòng
 */

export interface RunnerLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  text: string;
  time?: string;
  line?: number;
  col?: number;
}

export interface RunResult {
  logs: RunnerLog[];
  hasError: boolean;
  errorMessage?: string;
  timedOut?: boolean;
}

/**
 * Dịch thông báo lỗi tiếng Anh thông dụng sang tiếng Việt thân thiện
 */
export function translateJsError(rawError: string, line?: number): string {
  const lineStr = line ? ` (dòng ${line})` : '';

  if (rawError.includes('is not defined')) {
    const match = rawError.match(/(\w+)\s+is not defined/);
    const varName = match ? match[1] : '';
    return `Lỗi tham chiếu${lineStr}: Biến "${varName}" chưa được khai báo hoặc viết sai tên. Hãy kiểm tra lại từ khóa let/const hoặc chính tả!`;
  }
  if (rawError.includes('is not a function')) {
    const match = rawError.match(/(\w+)\s+is not a function/);
    const fnName = match ? match[1] : 'giá trị này';
    return `Lỗi kiểu dữ liệu${lineStr}: "${fnName}" không phải là một hàm (function) để gọi.`;
  }
  if (rawError.includes('Cannot read properties of undefined') || rawError.includes('Cannot read property')) {
    return `Lỗi kiểu dữ liệu${lineStr}: Bạn đang cố truy cập thuộc tính từ một giá trị undefined (chưa có dữ liệu).`;
  }
  if (rawError.includes('Cannot read properties of null')) {
    return `Lỗi kiểu dữ liệu${lineStr}: Bạn đang cố truy cập thuộc tính từ một giá trị null.`;
  }
  if (rawError.includes('Unexpected token') || rawError.includes('Unexpected end of input')) {
    return `Lỗi cú pháp${lineStr}: Ký tự không hợp lệ, có thể bạn quên dấu đóng ngoặc đơn ), ngoặc nhọn }, ngoặc kép " hoặc dấu chấm phẩy.`;
  }
  if (rawError.includes('Maximum call stack size exceeded')) {
    return `Lỗi tràn ngăn xếp${lineStr}: Hàm gọi đệ quy lặp lại chính nó vô hạn mà không có điểm dừng.`;
  }
  if (rawError.includes('Assignment to constant variable')) {
    return `Lỗi hằng số${lineStr}: Bạn đang gán lại giá trị cho biến khai báo bằng const. Hằng số không thể thay đổi sau khi khởi tạo!`;
  }
  if (rawError.includes('Identifier') && rawError.includes('has already been declared')) {
    return `Lỗi khai báo trùng${lineStr}: Tên biến này đã được khai báo trước đó trong cùng phạm vi.`;
  }

  return `Lỗi thực thi${lineStr}: ${rawError}`;
}

/**
 * Trích xuất số dòng từ stack trace nếu có
 */
function extractLineNumber(stack?: string): number | undefined {
  if (!stack) return undefined;
  // Ví dụ: at <anonymous>:3:5 hoặc at eval (eval at <anonymous>:3:5)
  const match = stack.match(/:(\d+):(\d+)/);
  if (match) {
    const parsed = parseInt(match[1], 10);
    // Trừ đi offset nếu có mã bọc trước đó
    return parsed > 0 ? parsed : undefined;
  }
  return undefined;
}

/**
 * Thêm loop guard đếm số vòng lặp vào code để chống treo máy (chống infinite loop)
 */
export function injectLoopGuard(code: string, maxIterations: number = 20000): string {
  // Bổ sung đếm bước cho while, for, do-while đơn giản
  // Để an toàn và nhẹ, chúng ta inject biến đếm toàn cục
  const guardCode = `
    let __loopGuardCount = 0;
    const __checkLoopGuard = () => {
      if (++__loopGuardCount > ${maxIterations}) {
        throw new Error("Code chạy quá lâu, có thể có vòng lặp vô hạn. Hãy kiểm tra lại điều kiện dừng.");
      }
    };
  `;

  // Thay thế các vòng lặp for/while bằng cách thêm __checkLoopGuard()
  // Sử dụng regex an toàn cho cú pháp cơ bản
  const instrumented = code
    .replace(/(for\s*\([^)]*\)\s*\{)/g, '$1 __checkLoopGuard(); ')
    .replace(/(while\s*\([^)]*\)\s*\{)/g, '$1 __checkLoopGuard(); ')
    .replace(/(do\s*\{)/g, '$1 __checkLoopGuard(); ');

  return `${guardCode}\n${instrumented}`;
}

/**
 * Chạy mã trong Web Worker với timeout 3 giây (Dành cho bài 1-8: Console / Logic)
 */
export function runInWorker(code: string, timeoutMs: number = 3000): Promise<RunResult> {
  return new Promise((resolve) => {
    const logs: RunnerLog[] = [];
    let isSettled = false;

    // Worker code template
    const workerScript = `
      self.onmessage = function(e) {
        const rawCode = e.data.code;

        // Vô hiệu hóa các API nguy hiểm
        const forbidden = () => {
          throw new Error("Không thể gọi mạng (fetch/XHR) trong bài học này vì lý do an toàn.");
        };
        self.fetch = forbidden;
        self.XMLHttpRequest = forbidden;
        self.WebSocket = forbidden;
        self.EventSource = forbidden;

        // Ghi đè console
        const postLog = (type, args) => {
          const text = args.map(arg => {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg, null, 2);
              } catch (err) {
                return Object.prototype.toString.call(arg);
              }
            }
            return String(arg);
          }).join(' ');

          self.postMessage({ type: 'log', logType: type, text: text });
        };

        console.log = function(...args) { postLog('log', args); };
        console.info = function(...args) { postLog('info', args); };
        console.warn = function(...args) { postLog('warn', args); };
        console.error = function(...args) { postLog('error', args); };

        // Giả lập alert
        self.alert = function(msg) {
          postLog('info', ['[Thông báo alert]: ' + String(msg)]);
        };
        self.prompt = function(msg) {
          postLog('info', ['[Hỏi prompt]: ' + String(msg)]);
          return "";
        };
        self.confirm = function(msg) {
          postLog('info', ['[Xác nhận confirm]: ' + String(msg)]);
          return true;
        };

        try {
          const fn = new Function(rawCode);
          fn();
          self.postMessage({ type: 'done' });
        } catch (err) {
          self.postMessage({
            type: 'error',
            message: err.message || String(err),
            stack: err.stack,
            name: err.name
          });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    let worker: Worker | null = null;
    let timer: any = null;

    try {
      worker = new Worker(workerUrl);
    } catch (err: any) {
      URL.revokeObjectURL(workerUrl);
      resolve({
        logs: [{
          id: Math.random().toString(36).substring(2, 9),
          type: 'error',
          text: `Không thể khởi tạo môi trường thực thi: ${err.message}`
        }],
        hasError: true,
        errorMessage: err.message
      });
      return;
    }

    const cleanUp = () => {
      if (timer) clearTimeout(timer);
      if (worker) {
        worker.terminate();
        worker = null;
      }
      URL.revokeObjectURL(workerUrl);
    };

    // Hard timeout để diệt worker nếu gặp while(true)
    timer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      cleanUp();
      logs.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'error',
        text: '⚠️ Code chạy quá lâu (vượt quá 3 giây), có thể có vòng lặp vô hạn! Hệ thống đã tự động dừng để bảo vệ trình duyệt của bạn.'
      });
      resolve({
        logs,
        hasError: true,
        errorMessage: 'Quá thời gian thực thi (3s)',
        timedOut: true
      });
    }, timeoutMs);

    worker.onmessage = (event) => {
      if (isSettled) return;
      const data = event.data;

      if (data.type === 'log') {
        logs.push({
          id: Math.random().toString(36).substring(2, 9),
          type: data.logType,
          text: data.text,
          time: new Date().toLocaleTimeString('vi-VN')
        });
      } else if (data.type === 'error') {
        isSettled = true;
        cleanUp();
        const line = extractLineNumber(data.stack);
        const translated = translateJsError(data.message, line);
        logs.push({
          id: Math.random().toString(36).substring(2, 9),
          type: 'error',
          text: `❌ ${translated}`,
          line
        });
        resolve({
          logs,
          hasError: true,
          errorMessage: translated
        });
      } else if (data.type === 'done') {
        isSettled = true;
        cleanUp();
        resolve({
          logs,
          hasError: false
        });
      }
    };

    worker.onerror = (err) => {
      if (isSettled) return;
      isSettled = true;
      cleanUp();
      const translated = translateJsError(err.message);
      logs.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'error',
        text: `❌ ${translated}`
      });
      resolve({
        logs,
        hasError: true,
        errorMessage: translated
      });
    };

    // Gửi code vào worker (được bảo vệ bởi loop guard thêm 1 lớp)
    const guardedCode = injectLoopGuard(code);
    worker.postMessage({ code: guardedCode });
  });
}

/**
 * Xây dựng nội dung tài liệu HTML cho iframe sandboxed (Dành cho bài 9-12: DOM & Events)
 */
export function buildSandboxedDomHtml(userJs: string, userHtml: string = ''): string {
  const safeGuardedJs = injectLoopGuard(userJs);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 12px;
      margin: 0;
      color: #1e293b;
      background: #ffffff;
      font-size: 14px;
    }
    button {
      padding: 6px 12px;
      font-size: 13px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover {
      background: #e2e8f0;
    }
    input {
      padding: 6px 10px;
      font-size: 13px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  ${userHtml || '<div id="app"></div>'}

  <script>
    (function() {
      // Vô hiệu hóa API rủi ro
      window.fetch = function() {
        console.error("Không thể gọi mạng (fetch) trong bài học này.");
        return Promise.reject("Blocked");
      };
      window.XMLHttpRequest = function() {
        console.error("Không thể gọi mạng (XHR) trong bài học này.");
      };
      window.open = function() {
        console.warn("Lệnh window.open bị chặn vì lý do an toàn.");
        return null;
      };

      // Giả lập alert/prompt/confirm
      window.alert = function(msg) {
        window.parent.postMessage({
          source: 'htmlive-js-runner',
          type: 'info',
          text: '[Thông báo alert]: ' + String(msg)
        }, '*');
      };
      window.prompt = function(msg) {
        window.parent.postMessage({
          source: 'htmlive-js-runner',
          type: 'info',
          text: '[Hỏi prompt]: ' + String(msg)
        }, '*');
        return "";
      };
      window.confirm = function(msg) {
        window.parent.postMessage({
          source: 'htmlive-js-runner',
          type: 'info',
          text: '[Xác nhận confirm]: ' + String(msg)
        }, '*');
        return true;
      };

      // Gửi console log ra ngoài parent
      const sendLog = function(type, args) {
        const text = Array.from(args).map(function(arg) {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg); } catch(e) { return String(arg); }
          }
          return String(arg);
        }).join(' ');

        window.parent.postMessage({
          source: 'htmlive-js-runner',
          type: type,
          text: text
        }, '*');
      };

      console.log = function() { sendLog('log', arguments); };
      console.info = function() { sendLog('info', arguments); };
      console.warn = function() { sendLog('warn', arguments); };
      console.error = function() { sendLog('error', arguments); };

      window.addEventListener('error', function(e) {
        window.parent.postMessage({
          source: 'htmlive-js-runner',
          type: 'error',
          text: '❌ ' + (e.message || 'Lỗi thực thi'),
          line: e.lineno
        }, '*');
      });

      try {
        ${safeGuardedJs}
      } catch (err) {
        window.parent.postMessage({
          source: 'htmlive-js-runner',
          type: 'error',
          text: '❌ ' + (err.message || String(err))
        }, '*');
      }
    })();
  <\/script>
</body>
</html>`;
}

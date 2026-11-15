import { CODE_TEMPLATES } from '../constants/templates';
import { CodeTemplate } from '../types';

export interface TemplateDevAuditFailure {
  templateId: string;
  reason: string;
}

const REQUIRED_FIELDS: (keyof CodeTemplate)[] = [
  'id',
  'name',
  'description',
  'badge',
  'category',
  'difficulty',
  'tags',
  'learningPoints',
  'relatedLessons',
  'htmlCode',
];

function buildAuditSrcDoc(template: CodeTemplate, auditToken: string): string {
  const tokenLit = JSON.stringify(auditToken);
  const idLit = JSON.stringify(template.id);
  const probeScript = `<script>
(function() {
  var TOKEN = ${tokenLit};
  var ID = ${idLit};
  var errors = [];
  function report(ok, reason) {
    try {
      window.parent.postMessage({ source: 'coderlive-template-audit', token: TOKEN, templateId: ID, ok: ok, reason: reason || '' }, '*');
    } catch (e) {}
  }
  window.onerror = function(msg) {
    errors.push(String(msg || 'Runtime error'));
  };
  window.addEventListener('unhandledrejection', function(e) {
    errors.push('Unhandled rejection: ' + (e && e.reason ? String(e.reason) : 'unknown'));
  });
  var origErr = console.error;
  console.error = function() {
    errors.push(Array.prototype.slice.call(arguments).join(' '));
    if (origErr) origErr.apply(console, arguments);
  };
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (errors.length > 0) {
        report(false, errors.join(' | '));
        return;
      }
      var textLen = (document.body && document.body.innerText ? document.body.innerText.trim().length : 0);
      var hasCanvasOrSvg = Boolean(document.querySelector('svg, canvas'));
      if (textLen === 0 && !hasCanvasOrSvg) {
        report(false, 'Empty preview output');
        return;
      }
      report(true, '');
    }, 120);
  });
})();
</script>`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${probeScript}
  <style>${template.cssCode || ''}</style>
</head>
<body>
${template.htmlCode}
<script>${template.jsCode || ''}</script>
</body>
</html>`;
}

function auditSingleTemplateInHiddenIframe(template: CodeTemplate): Promise<TemplateDevAuditFailure | null> {
  for (const field of REQUIRED_FIELDS) {
    const val = template[field];
    if (
      val === undefined ||
      val === null ||
      (typeof val === 'string' && !val.trim()) ||
      (Array.isArray(val) && val.length === 0)
    ) {
      return Promise.resolve({
        templateId: template.id || '(unknown)',
        reason: `Thiếu trường bắt buộc: ${String(field)}`,
      });
    }
  }

  return new Promise((resolve) => {
    const token = `audit-${template.id}-${Math.random().toString(36).slice(2, 8)}`;
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '800px';
    iframe.style.height = '600px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    let settled = false;
    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const finish = (failure: TemplateDevAuditFailure | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(failure);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      const d = event.data;
      if (!d || d.source !== 'coderlive-template-audit' || d.token !== token) return;
      if (d.ok) {
        finish(null);
      } else {
        finish({ templateId: template.id, reason: d.reason || 'Lỗi render mẫu' });
      }
    };

    const timer = setTimeout(() => {
      finish({ templateId: template.id, reason: 'Quá thời gian kiểm tra mẫu trong iframe' });
    }, 3000);

    window.addEventListener('message', onMessage);
    document.body.appendChild(iframe);
    iframe.srcdoc = buildAuditSrcDoc(template, token);
  });
}

let hasRunDevAudit = false;

/**
 * Kiểm tra dev-time: render toàn bộ mẫu trong iframe sandbox ẩn (không allow-same-origin)
 * và báo lỗi rõ ràng nếu phát hiện lỗi runtime, kết quả rỗng hoặc thiếu trường dữ liệu.
 */
export async function runTemplateDevAudit(): Promise<TemplateDevAuditFailure[]> {
  if (typeof document === 'undefined') return [];
  const failures: TemplateDevAuditFailure[] = [];

  for (const template of CODE_TEMPLATES) {
    const res = await auditSingleTemplateInHiddenIframe(template);
    if (res) {
      failures.push(res);
    }
  }

  if (failures.length > 0) {
    const msg = failures.map((f) => `[${f.templateId}] ${f.reason}`).join('; ');
    console.error('❌ [TemplateDevAudit] Phát hiện mẫu lỗi:', msg);
    throw new Error(`TemplateDevAudit failed: ${msg}`);
  }

  return failures;
}

export function scheduleDevTemplateAuditOnce(): void {
  if (hasRunDevAudit || typeof window === 'undefined') return;
  hasRunDevAudit = true;
  (window as any).__runTemplateDevAudit = runTemplateDevAudit;

  setTimeout(() => {
    runTemplateDevAudit().catch((err) => {
      console.error(err);
    });
  }, 1800);
}

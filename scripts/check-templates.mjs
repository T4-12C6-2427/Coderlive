import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Standard CSS properties whitelist for Node validation when CSS.supports is absent
const STANDARD_CSS_PROPERTIES = new Set([
  'box-sizing', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'font-family', 'font-size', 'font-weight', 'font-variant-numeric', 'line-height', 'letter-spacing',
  'text-align', 'text-transform', 'text-decoration', 'text-overflow', 'white-space', 'word-break',
  'background', 'background-color', 'background-clip', 'background-size', 'background-position',
  'color', 'min-height', 'max-height', 'height', 'width', 'min-width', 'max-width',
  'display', 'flex', 'flex-direction', 'flex-wrap', 'flex-shrink', 'flex-grow',
  'align-items', 'justify-content', 'gap', 'grid-template-columns', 'grid-column',
  'position', 'top', 'right', 'bottom', 'left', 'inset', 'z-index', 'content',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-color',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-radius',
  'border-collapse', 'box-shadow', 'overflow', 'overflow-x', 'overflow-y', 'clip',
  'cursor', 'pointer-events', 'resize', 'user-select',
  'opacity', 'transform', 'transform-style', 'perspective', 'transition', 'animation', 'outline', 'outline-offset',
  'list-style', 'accent-color', 'backdrop-filter', 'break-inside', 'float',
  'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-dasharray', 'stroke-dashoffset',
  '-webkit-background-clip', '-webkit-text-fill-color',
]);

if (typeof globalThis.CSS === 'undefined') {
  globalThis.CSS = {
    supports: (prop, val) => {
      if (!prop) return false;
      const lower = String(prop).toLowerCase();
      if (lower.startsWith('--')) return true;
      return STANDARD_CSS_PROPERTIES.has(lower) && Boolean(val);
    },
  };
}

async function runTemplateChecks() {
  const { CODE_TEMPLATES, getTemplateLineCount } = await import('../src/constants/templates.ts');
  const { runStaticChecks } = await import('../src/lib/staticLinter.ts');
  const { LESSONS } = await import('../src/data/lessons.ts');
  const { CSS_LESSONS } = await import('../src/data/lessons-css.ts');
  const { JS_LESSONS } = await import('../src/data/lessons-js.ts');

  const validLessonKeys = new Set([
    ...LESSONS.map((l) => `html:${l.slug}`),
    ...CSS_LESSONS.map((l) => `css:${l.slug}`),
    ...JS_LESSONS.map((l) => `js:${l.slug}`),
  ]);

  const seenIds = new Set();
  let errors = 0;

  console.log(`🔍 Kiểm tra ${CODE_TEMPLATES.length} mẫu trong CODE_TEMPLATES...\n`);

  for (const tmpl of CODE_TEMPLATES) {
    const label = `[${tmpl.id || 'missing-id'}]`;

    if (!tmpl.id || !tmpl.name || !tmpl.description || !tmpl.badge || !tmpl.category || !tmpl.difficulty) {
      console.error(`❌ ${label}: Thiếu trường bắt buộc (id, name, description, badge, category, difficulty)`);
      errors++;
    }
    if (seenIds.has(tmpl.id)) {
      console.error(`❌ ${label}: Trùng lặp id mẫu`);
      errors++;
    }
    seenIds.add(tmpl.id);

    if (!Array.isArray(tmpl.tags) || tmpl.tags.length === 0) {
      console.error(`❌ ${label}: Thiếu tags`);
      errors++;
    }
    if (!Array.isArray(tmpl.learningPoints) || tmpl.learningPoints.length < 2) {
      console.error(`❌ ${label}: Cần ít nhất 2 mục trong "Bạn sẽ học"`);
      errors++;
    }
    if (!Array.isArray(tmpl.relatedLessons) || tmpl.relatedLessons.length < 1) {
      console.error(`❌ ${label}: Cần ít nhất 1 bài học liên quan`);
      errors++;
    } else {
      for (const rel of tmpl.relatedLessons) {
        if (!validLessonKeys.has(`${rel.courseId}:${rel.slug}`)) {
          console.error(`❌ ${label}: Bài học liên quan không tồn tại (${rel.courseId}:${rel.slug})`);
          errors++;
        }
      }
    }

    if (!tmpl.htmlCode || !tmpl.htmlCode.trim()) {
      console.error(`❌ ${label}: htmlCode rỗng`);
      errors++;
    }

    const totalLines = getTemplateLineCount(tmpl);
    if (totalLines > 280) {
      console.error(`❌ ${label}: Quá dài (${totalLines} dòng > 280 dòng)`);
      errors++;
    }

    const combined = `${tmpl.htmlCode}\n${tmpl.cssCode || ''}\n${tmpl.jsCode || ''}`;
    if (/\b(alert|prompt|confirm)\s*\(/.test(combined)) {
      console.error(`❌ ${label}: Không được dùng alert/prompt/confirm`);
      errors++;
    }
    if (/\bwindow\.open\s*\(|\blocation\.(href|assign|replace)\b/.test(combined)) {
      console.error(`❌ ${label}: Không được điều hướng hoặc mở cửa sổ mới`);
      errors++;
    }

    const strippedNs = combined.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '');
    if (/https?:\/\//i.test(strippedNs)) {
      console.error(`❌ ${label}: Chứa URL ngoài mạng (mẫu phải hoàn toàn offline)`);
      errors++;
    }

    if (/(localStorage|sessionStorage)/.test(tmpl.jsCode || '')) {
      if (!/try\s*\{[\s\S]*?(localStorage|sessionStorage)/.test(tmpl.jsCode || '')) {
        console.error(`❌ ${label}: Truy cập localStorage/sessionStorage phải nằm trong try/catch`);
        errors++;
      }
    }

    const staticIssues = runStaticChecks(tmpl.htmlCode, tmpl.cssCode || '');
    if (staticIssues.length > 0) {
      console.error(`❌ ${label}: Có ${staticIssues.length} vấn đề tĩnh:`, staticIssues.map((i) => `${i.tab}:${i.line} ${i.message}`));
      errors++;
    }

    if (tmpl.jsCode && tmpl.jsCode.trim()) {
      try {
        new Function(tmpl.jsCode);
      } catch (err) {
        console.error(`❌ ${label}: Lỗi cú pháp JS:`, err.message);
        errors++;
      }
    }
  }

  const scriptSrc = readFileSync(resolve('scripts/check-hardcoded-colors.mjs'), 'utf8');
  if (!scriptSrc.includes('constants/templates')) {
    console.error('❌ scripts/check-hardcoded-colors.mjs chưa cho phép thư mục constants/templates');
    errors++;
  }

  if (errors > 0) {
    console.error(`\n❌ Kiểm tra mẫu thất bại với ${errors} lỗi.`);
    process.exit(1);
  }

  console.log(`✅ Tất cả ${CODE_TEMPLATES.length} mẫu đều hợp lệ: đủ siêu dữ liệu, 0 vấn đề tĩnh, an toàn sandbox, offline 100%!`);
  process.exit(0);
}

runTemplateChecks().catch((err) => {
  console.error('Lỗi nghiêm trọng khi kiểm tra mẫu:', err);
  process.exit(1);
});

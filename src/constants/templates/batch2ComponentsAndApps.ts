import { CodeTemplate } from '../../types';

export const BATCH_2_TEMPLATES: CodeTemplate[] = [
  // =========================================================
  // THÀNH PHẦN GIAO DIỆN (6 mẫu mới)
  // =========================================================
  {
    id: 'ui-pricing-toggle',
    name: 'Bảng giá chuyển đổi tháng/năm',
    description: 'Thành phần bảng giá 3 gói dịch vụ có công tắc chuyển chu kỳ Tháng / Năm và tính tiết kiệm tự động',
    badge: 'Thành phần giao diện',
    category: 'Thành phần giao diện',
    difficulty: 'Dễ',
    tags: ['bang gia', 'pricing', 'switch', 'toggle', 'the goi', 'ui'],
    learningPoints: [
      'Xây dựng công tắc bật/tắt chuẩn truy cập với role="switch" và aria-checked',
      'Lưu dữ liệu giá theo hai chế độ bằng thuộc tính data-monthly và data-yearly',
      'Làm nổi bật gói phổ biến bằng CSS Grid và đường viền tương phản rõ ràng',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'css-grid-luoi-hai-chieu', title: 'CSS Grid: Lưới hai chiều' },
      { courseId: 'js', slug: 'dom-chon-va-thay-doi-phan-tu', title: 'DOM: Chọn và thay đổi phần tử' },
    ],
    createdOrder: 13,
    iconKey: 'layers',
    htmlCode: `<!-- Thành phần bảng giá kèm công tắc Tháng / Năm -->
<main class="pricing-wrap">
  <header class="pricing-head">
    <h1>Chọn gói phù hợp cho bạn</h1>
    <p>Linh hoạt nâng cấp hoặc hủy bất kỳ lúc nào, không phí ẩn.</p>
    <div class="switch-row">
      <span id="lbl-month" class="cycle-label active">Trả theo tháng</span>
      <button type="button" id="billing-switch" class="switch-btn" role="switch" aria-checked="false" aria-label="Chuyển sang thanh toán theo năm">
        <span class="switch-thumb"></span>
      </button>
      <span id="lbl-year" class="cycle-label">Theo năm <mark>Tiết kiệm 20%</mark></span>
    </div>
  </header>

  <section class="tiers" aria-label="Danh sách gói dịch vụ">
    <article class="tier-card">
      <h2>Khởi đầu</h2>
      <p class="price" data-monthly="0đ" data-yearly="0đ">0đ</p>
      <p class="unit">/ tháng</p>
      <ul>
        <li>3 dự án cá nhân</li>
        <li>Xuất mã nguồn HTML/CSS</li>
        <li>Hỗ trợ cộng đồng</li>
      </ul>
      <button type="button" class="tier-btn" data-plan="Khởi đầu">Bắt đầu miễn phí</button>
    </article>

    <article class="tier-card popular">
      <span class="tag">Phổ biến nhất</span>
      <h2>Sáng tạo Pro</h2>
      <p class="price" data-monthly="79.000đ" data-yearly="63.000đ">79.000đ</p>
      <p class="unit">/ tháng</p>
      <ul>
        <li>Không giới hạn dự án</li>
        <li>Đồng bộ đám mây tức thì</li>
        <li>Chia sẻ liên kết tùy chỉnh</li>
      </ul>
      <button type="button" class="tier-btn primary" data-plan="Sáng tạo Pro">Chọn gói Pro</button>
    </article>

    <article class="tier-card">
      <h2>Lớp học / Nhóm</h2>
      <p class="price" data-monthly="199.000đ" data-yearly="159.000đ">199.000đ</p>
      <p class="unit">/ tháng</p>
      <ul>
        <li>Tối đa 20 thành viên</li>
        <li>Chỉnh sửa nhóm thời gian thực</li>
        <li>Quản lý vai trò chi tiết</li>
      </ul>
      <button type="button" class="tier-btn" data-plan="Lớp học / Nhóm">Dùng thử cho nhóm</button>
    </article>
  </section>
  <p id="plan-status" class="status" role="status" aria-live="polite"></p>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 28px 16px; }
.pricing-wrap { max-width: 960px; margin: 0 auto; }
.pricing-head { text-align: center; margin-bottom: 26px; }
.pricing-head h1 { font-size: clamp(24px, 4vw, 34px); margin-bottom: 6px; }
.pricing-head p { color: #475569; font-size: 14px; }
.switch-row { display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; margin-top: 16px; }
.cycle-label { font-size: 14px; font-weight: 600; color: #64748b; }
.cycle-label.active { color: #0f172a; }
.cycle-label mark { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 6px; font-size: 12px; }
.switch-btn { width: 54px; height: 32px; min-height: 44px; padding: 6px 0; background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; }
.switch-thumb { width: 52px; height: 28px; border-radius: 999px; background: #cbd5e1; position: relative; transition: background 0.2s; display: block; }
.switch-thumb::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #ffffff; transition: transform 0.2s; }
.switch-btn[aria-checked="true"] .switch-thumb { background: #2563eb; }
.switch-btn[aria-checked="true"] .switch-thumb::after { transform: translateX(24px); }
.tiers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.tier-card { position: relative; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; display: flex; flex-direction: column; }
.tier-card.popular { border: 2px solid #2563eb; }
.tag { position: absolute; top: -11px; right: 16px; background: #2563eb; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.tier-card h2 { font-size: 17px; margin-bottom: 8px; }
.price { font-size: 28px; font-weight: 800; color: #1d4ed8; }
.unit { font-size: 12px; color: #64748b; margin-bottom: 14px; }
.tier-card ul { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; font-size: 14px; color: #334155; flex: 1; }
.tier-card li::before { content: '✓ '; color: #16a34a; font-weight: 700; }
.tier-btn { min-height: 44px; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; font-weight: 600; font-size: 14px; cursor: pointer; }
.tier-btn.primary { background: #2563eb; color: #ffffff; border-color: #2563eb; }
.status { text-align: center; margin-top: 16px; font-size: 14px; font-weight: 600; color: #1d4ed8; min-height: 22px; }
@media (max-width: 760px) { .tiers { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .switch-thumb, .switch-thumb::after { transition: none; } }`,
    jsCode: `// Chuyển đổi bảng giá giữa chu kỳ Tháng và Năm
const switchBtn = document.getElementById('billing-switch');
const prices = document.querySelectorAll('.price');
const lblMonth = document.getElementById('lbl-month');
const lblYear = document.getElementById('lbl-year');
const statusEl = document.getElementById('plan-status');

switchBtn.addEventListener('click', () => {
  const isYearly = switchBtn.getAttribute('aria-checked') !== 'true';
  switchBtn.setAttribute('aria-checked', String(isYearly));
  lblMonth.classList.toggle('active', !isYearly);
  lblYear.classList.toggle('active', isYearly);
  prices.forEach((el) => {
    el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
  });
  statusEl.textContent = isYearly ? 'Đang hiển thị giá ưu đãi theo năm.' : 'Đang hiển thị giá theo tháng.';
});

document.querySelectorAll('.tier-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const cycle = switchBtn.getAttribute('aria-checked') === 'true' ? 'theo năm' : 'theo tháng';
    statusEl.textContent = 'Bạn đã chọn gói "' + btn.dataset.plan + '" (' + cycle + ').';
  });
});`,
  },
  {
    id: 'ui-html-accordion',
    name: 'Hộp hỏi đáp thuần HTML (<details>)',
    description: 'Thành phần đóng mở nội dung, thanh tiến độ và ghi chú chỉ dùng HTML ngữ nghĩa thuần túy không cần CSS/JS',
    badge: 'Thành phần giao diện',
    category: 'Thành phần giao diện',
    difficulty: 'Dễ',
    tags: ['html thuan', 'details', 'summary', 'accordion', 'ngu nghia'],
    learningPoints: [
      'Tạo hiệu ứng đóng/mở nội dung hoàn toàn bằng cặp thẻ <details> và <summary>',
      'Hiển thị chỉ số trực quan với thẻ <progress>, <meter> và <mark>',
      'Tổ chức danh sách định nghĩa gọn gàng bằng <dl>, <dt> và <dd>',
    ],
    relatedLessons: [
      { courseId: 'html', slug: 'the-ngu-nghia-semantic', title: 'Khối và thẻ ngữ nghĩa' },
      { courseId: 'html', slug: 'dinh-dang-chu', title: 'Định dạng chữ cơ bản' },
    ],
    createdOrder: 14,
    iconKey: 'book',
    htmlCode: `<!-- Thành phần Hỏi đáp & Tóm tắt học tập thuần HTML5 (0 dòng CSS, 0 dòng JS) -->
<main>
  <header>
    <h1>Hỏi đáp nhanh về HTML5</h1>
    <p>Mọi mục dưới đây có thể <mark>bấm để mở hoặc đóng</mark> trực tiếp nhờ thẻ ngữ nghĩa của trình duyệt.</p>
  </header>

  <hr />

  <section aria-label="Câu hỏi thường gặp">
    <details open>
      <summary><strong>1. Tại sao thẻ &lt;details&gt; mở đóng được mà không cần JavaScript?</strong></summary>
      <p>Trình duyệt web hiện đại đã tích hợp sẵn trạng thái đóng/mở cho thẻ <code>&lt;details&gt;</code> và tiêu đề <code>&lt;summary&gt;</code>, hỗ trợ luôn cả phím Tab và Enter.</p>
    </details>

    <details>
      <summary><strong>2. Thuộc tính <code>open</code> có tác dụng gì?</strong></summary>
      <p>Khi thêm từ khóa <code>open</code> vào thẻ mở <code>&lt;details open&gt;</code>, khối nội dung sẽ tự động mở sẵn ngay khi trang vừa tải.</p>
    </details>

    <details>
      <summary><strong>3. Có thể đặt danh sách hoặc bảng bên trong &lt;details&gt; không?</strong></summary>
      <dl>
        <dt><strong>Câu trả lời:</strong></dt>
        <dd>Hoàn toàn được! Bạn có thể đặt đoạn văn, danh sách <code>&lt;ul&gt;</code>, bảng dữ liệu hay thậm chí thẻ <code>&lt;progress&gt;</code> ở bên trong.</dd>
      </dl>
    </details>
  </section>

  <hr />

  <section aria-label="Thẻ đo lường có sẵn">
    <h2>Chỉ báo tích hợp sẵn trong HTML</h2>
    <p>
      <label for="course-prog">Tiến độ hoàn thành bài:</label>
      <progress id="course-prog" value="75" max="100">75%</progress>
      <strong>75%</strong>
    </p>
    <p>
      <label for="read-score">Mức độ dễ hiểu:</label>
      <meter id="read-score" min="0" max="10" low="4" high="8" optimum="9" value="9">9/10</meter>
      <strong>9/10</strong>
    </p>
  </section>
</main>`,
    cssCode: '',
    jsCode: '',
  },
  {
    id: 'ui-accessible-tabs',
    name: 'Thanh Tab chuyển nội dung ARIA',
    description: 'Thanh tab chuyển đổi nội dung mượt mà, hỗ trợ đầy đủ phím mũi tên trái/phải và thuộc tính truy cập ARIA',
    badge: 'Thành phần giao diện',
    category: 'Thành phần giao diện',
    difficulty: 'Dễ',
    tags: ['tabs', 'aria', 'keyboard', 'thanh tab', 'giao dien'],
    learningPoints: [
      'Liên kết tab và bảng nội dung chuẩn mực bằng aria-controls và hidden',
      'Điều hướng giữa các tab bằng phím ArrowLeft và ArrowRight',
      'Quản lý trạng thái tab đang chọn qua aria-selected',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'flexbox-bo-cuc-linh-hoat', title: 'Flexbox: Bố cục linh hoạt' },
      { courseId: 'js', slug: 'su-kien-event-listener', title: 'Sự kiện (addEventListener)' },
    ],
    createdOrder: 15,
    iconKey: 'layers',
    htmlCode: `<!-- Thanh Tab hỗ trợ chuột, chạm và phím mũi tên -->
<main class="tab-shell">
  <h1>Khám phá lộ trình học web</h1>
  <div class="tablist" role="tablist" aria-label="Các chặng học lập trình web">
    <button type="button" class="tab-btn active" role="tab" id="t-html" aria-selected="true" aria-controls="p-html">HTML Cơ bản</button>
    <button type="button" class="tab-btn" role="tab" id="t-css" aria-selected="false" aria-controls="p-css" tabindex="-1">CSS Bố cục</button>
    <button type="button" class="tab-btn" role="tab" id="t-js" aria-selected="false" aria-controls="p-js" tabindex="-1">JavaScript DOM</button>
  </div>

  <section id="p-html" class="tab-panel" role="tabpanel" aria-labelledby="t-html">
    <h2>1. Dựng khung trang bằng HTML</h2>
    <p>Học cách sử dụng các thẻ ngữ nghĩa như <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, biểu mẫu và bảng dữ liệu chuẩn xác.</p>
  </section>

  <section id="p-css" class="tab-panel" role="tabpanel" aria-labelledby="t-css" hidden>
    <h2>2. Tạo kiểu &amp; đáp ứng mọi màn hình</h2>
    <p>Kết hợp Flexbox, CSS Grid và Media Queries để giao diện gọn đẹp từ điện thoại 360px tới màn hình lớn.</p>
  </section>

  <section id="p-js" class="tab-panel" role="tabpanel" aria-labelledby="t-js" hidden>
    <h2>3. Thêm tương tác sống động</h2>
    <p>Lắng nghe sự kiện người dùng, cập nhật DOM không tải lại trang và lưu trạng thái an toàn.</p>
  </section>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #0f172a; padding: 28px 16px; }
.tab-shell { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; }
.tab-shell h1 { font-size: 20px; margin-bottom: 14px; }
.tablist { display: flex; gap: 6px; border-bottom: 2px solid #e2e8f0; overflow-x: auto; }
.tab-btn { min-height: 44px; padding: 10px 16px; border: none; border-bottom: 3px solid transparent; margin-bottom: -2px; background: transparent; color: #475569; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; }
.tab-btn.active { color: #1d4ed8; border-bottom-color: #2563eb; background: #eff6ff; border-radius: 8px 8px 0 0; }
.tab-btn:focus-visible { outline: 2px solid #2563eb; outline-offset: -2px; }
.tab-panel { padding-top: 18px; }
.tab-panel h2 { font-size: 17px; margin-bottom: 6px; }
.tab-panel p { font-size: 14px; color: #334155; line-height: 1.65; }
code { background: #f1f5f9; padding: 2px 6px; border-radius: 5px; font-size: 13px; }`,
    jsCode: `// Kích hoạt tab theo click hoặc phím mũi tên trái/phải
const tabs = Array.from(document.querySelectorAll('.tab-btn'));
const panels = document.querySelectorAll('.tab-panel');

function activateTab(nextTab) {
  tabs.forEach((tab) => {
    const selected = tab === nextTab;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  panels.forEach((panel) => {
    panel.hidden = panel.id !== nextTab.getAttribute('aria-controls');
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    activateTab(next);
    next.focus();
  });
});`,
  },
  {
    id: 'ui-toast-modal',
    name: 'Hộp thoại Modal & Thông báo Toast',
    description: 'Hệ thống hộp thoại xác nhận trong trang và dải thông báo Toast xếp chồng tự động biến mất',
    badge: 'Thành phần giao diện',
    category: 'Thành phần giao diện',
    difficulty: 'Trung bình',
    tags: ['modal', 'toast', 'dialog', 'thong bao', 'xac nhan'],
    learningPoints: [
      'Tạo hộp thoại xác nhận trong trang thay thế hoàn toàn alert() và confirm()',
      'Trả tiêu điểm (focus) về nút mở ban đầu khi đóng Modal bằng Escape',
      'Xếp chồng thông báo Toast tự hủy sau thời gian hẹn giờ bằng setTimeout',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'display-va-position', title: 'Display & Position' },
      { courseId: 'js', slug: 'hen-gio-va-go-loi-debugging', title: 'Hẹn giờ và gỡ lỗi' },
    ],
    createdOrder: 16,
    iconKey: 'sparkles',
    htmlCode: `<!-- Nút kích hoạt Toast và Modal trong trang -->
<main class="demo-card">
  <h1>Thành phần Thông báo &amp; Hộp thoại</h1>
  <p>Tất cả thông báo và xác nhận đều hiển thị gọn gàng trong trang, không làm gián đoạn trình duyệt.</p>
  <div class="btn-group">
    <button type="button" class="btn primary" id="open-modal-btn">Mở hộp thoại xác nhận</button>
    <button type="button" class="btn" data-toast="success">Toast Thành công</button>
    <button type="button" class="btn" data-toast="warn">Toast Cảnh báo</button>
  </div>
  <p id="action-log" class="log">Chưa có thao tác nào.</p>
</main>

<div id="confirm-backdrop" class="backdrop" hidden>
  <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="m-title">
    <h2 id="m-title">Xác nhận xuất bản bài viết?</h2>
    <p>Bài viết sẽ hiển thị công khai trong danh sách thực hành của nhóm.</p>
    <div class="modal-actions">
      <button type="button" id="cancel-modal-btn" class="btn">Để sau</button>
      <button type="button" id="confirm-modal-btn" class="btn primary">Xuất bản ngay</button>
    </div>
  </div>
</div>

<div id="toast-stack" class="toast-stack" aria-live="polite"></div>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 28px 16px; }
.demo-card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; }
.demo-card h1 { font-size: 20px; margin-bottom: 8px; }
.demo-card p { font-size: 14px; color: #475569; margin-bottom: 16px; }
.btn-group { display: flex; flex-wrap: wrap; gap: 10px; }
.btn { min-height: 44px; padding: 10px 16px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; font-weight: 600; font-size: 14px; cursor: pointer; }
.btn.primary { background: #2563eb; color: #ffffff; border-color: #2563eb; }
.log { margin-top: 16px; padding: 10px 12px; background: #f1f5f9; border-radius: 8px; font-size: 13px; color: #1e293b; }
.backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 40; }
.backdrop[hidden] { display: none; }
.modal-box { background: #ffffff; max-width: 420px; width: 100%; border-radius: 16px; padding: 22px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2); }
.modal-box h2 { font-size: 18px; margin-bottom: 8px; }
.modal-box p { font-size: 14px; color: #475569; margin-bottom: 18px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.toast-stack { position: fixed; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; z-index: 50; max-width: min(320px, calc(100vw - 32px)); }
.toast-item { background: #0f172a; color: #ffffff; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; border-left: 4px solid #22c55e; }
.toast-item.warn { border-left-color: #f59e0b; }`,
    jsCode: `// Quản lý đóng/mở Modal và xếp chồng Toast tự biến mất
const backdrop = document.getElementById('confirm-backdrop');
const openBtn = document.getElementById('open-modal-btn');
const confirmBtn = document.getElementById('confirm-modal-btn');
const cancelBtn = document.getElementById('cancel-modal-btn');
const logEl = document.getElementById('action-log');
const toastStack = document.getElementById('toast-stack');

function pushToast(text, kind) {
  const item = document.createElement('div');
  item.className = 'toast-item ' + (kind === 'warn' ? 'warn' : '');
  item.textContent = text;
  toastStack.appendChild(item);
  setTimeout(() => item.remove(), 3000);
}

function closeModal() {
  backdrop.hidden = true;
  openBtn.focus();
}

openBtn.addEventListener('click', () => {
  backdrop.hidden = false;
  confirmBtn.focus();
});
cancelBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !backdrop.hidden) closeModal(); });

confirmBtn.addEventListener('click', () => {
  closeModal();
  logEl.textContent = 'Đã xuất bản bài viết thành công.';
  pushToast('Đã xuất bản bài viết!', 'success');
});

document.querySelectorAll('[data-toast]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const kind = btn.dataset.toast;
    pushToast(kind === 'warn' ? 'Hãy kiểm tra lại đường dẫn ảnh.' : 'Đã lưu thay đổi lên bộ nhớ.', kind);
  });
});`,
  },
  {
    id: 'ui-search-dropdown',
    name: 'Ô tìm kiếm gợi ý & gắn thẻ lọc',
    description: 'Ô tìm kiếm có danh sách gợi ý tức thì, chọn bằng chuột hoặc bàn phím và gắn thẻ kỹ năng đã chọn',
    badge: 'Thành phần giao diện',
    category: 'Thành phần giao diện',
    difficulty: 'Trung bình',
    tags: ['autocomplete', 'search', 'dropdown', 'tags', 'bo loc'],
    learningPoints: [
      'Lọc gợi ý từ khóa không phân biệt chữ hoa/thường theo thời gian thực',
      'Thêm và gỡ các thẻ (chip) đã chọn không trùng lặp',
      'Điều hướng danh sách thả xuống bằng phím ArrowDown, ArrowUp và Enter',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'mang-array', title: 'Mảng (Array) trong JavaScript' },
      { courseId: 'js', slug: 'su-kien-event-listener', title: 'Sự kiện (addEventListener)' },
    ],
    createdOrder: 17,
    iconKey: 'compass',
    htmlCode: `<!-- Ô tìm kiếm có gợi ý thả xuống và gắn thẻ lọc -->
<main class="picker-card">
  <h1>Chọn kỹ năng muốn luyện tập</h1>
  <div id="selected-chips" class="chips" aria-label="Danh sách kỹ năng đã chọn"></div>

  <div class="combo">
    <label for="skill-input">Tìm kỹ năng (gõ ví dụ: CSS, SVG, Grid...)</label>
    <input id="skill-input" type="search" autocomplete="off" placeholder="Nhập để lọc gợi ý..." />
    <ul id="suggestions" class="dropdown" role="listbox" hidden></ul>
  </div>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 28px 16px; }
.picker-card { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; }
.picker-card h1 { font-size: 19px; margin-bottom: 12px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; min-height: 36px; margin-bottom: 14px; }
.chip { min-height: 36px; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 13px; font-weight: 600; }
.chip button { min-width: 28px; min-height: 28px; border: none; background: transparent; color: #1d4ed8; font-weight: 700; cursor: pointer; }
.combo { position: relative; }
.combo label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
.combo input { width: 100%; min-height: 44px; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 15px; }
.dropdown { position: absolute; left: 0; right: 0; top: 100%; margin-top: 6px; list-style: none; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12); max-height: 220px; overflow-y: auto; z-index: 20; }
.dropdown[hidden] { display: none; }
.dropdown li { min-height: 44px; padding: 10px 14px; font-size: 14px; cursor: pointer; display: flex; align-items: center; }
.dropdown li:hover, .dropdown li.active { background: #eff6ff; color: #1d4ed8; font-weight: 600; }`,
    jsCode: `// Dữ liệu gợi ý kỹ năng và xử lý chọn không trùng lặp
const skills = ['HTML Ngữ nghĩa', 'CSS Flexbox', 'CSS Grid', 'Biểu mẫu & Xác thực', 'Đồ họa SVG', 'Canvas 2D', 'JavaScript DOM', 'Hẹn giờ Animation', 'Responsive Mobile'];
const selected = ['HTML Ngữ nghĩa', 'CSS Flexbox'];
let activeIndex = -1;

const input = document.getElementById('skill-input');
const dropdown = document.getElementById('suggestions');
const chipsEl = document.getElementById('selected-chips');

function renderChips() {
  chipsEl.innerHTML = selected.map((item) =>
    '<span class="chip">' + item + '<button type="button" data-remove="' + item + '" aria-label="Gỡ ' + item + '">×</button></span>'
  ).join('');
}

function renderList() {
  const q = input.value.trim().toLowerCase();
  const options = skills.filter((s) => !selected.includes(s) && (!q || s.toLowerCase().includes(q)));
  if (options.length === 0) {
    dropdown.hidden = true;
    return;
  }
  activeIndex = Math.min(activeIndex, options.length - 1);
  dropdown.innerHTML = options.map((opt, idx) =>
    '<li role="option" class="' + (idx === activeIndex ? 'active' : '') + '" data-val="' + opt + '">' + opt + '</li>'
  ).join('');
  dropdown.hidden = false;
}

function chooseSkill(val) {
  if (!selected.includes(val)) selected.push(val);
  input.value = '';
  activeIndex = -1;
  renderChips();
  renderList();
}

input.addEventListener('focus', renderList);
input.addEventListener('input', () => { activeIndex = 0; renderList(); });
input.addEventListener('keydown', (e) => {
  const items = Array.from(dropdown.querySelectorAll('li'));
  if (dropdown.hidden || items.length === 0) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = (activeIndex + 1) % items.length; renderList(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = (activeIndex - 1 + items.length) % items.length; renderList(); }
  if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); chooseSkill(items[activeIndex].dataset.val); }
  if (e.key === 'Escape') { dropdown.hidden = true; }
});

dropdown.addEventListener('mousedown', (e) => {
  const li = e.target.closest('li');
  if (li) chooseSkill(li.dataset.val);
});
chipsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-remove]');
  if (!btn) return;
  const idx = selected.indexOf(btn.dataset.remove);
  if (idx >= 0) selected.splice(idx, 1);
  renderChips();
});

renderChips();`,
  },
  {
    id: 'ui-skeleton-profile',
    name: 'Thẻ hồ sơ & hiệu ứng tải Skeleton',
    description: 'Thẻ hồ sơ thành viên chuyển đổi giữa trạng thái đang tải khung xương (Skeleton) và nội dung thật',
    badge: 'Thành phần giao diện',
    category: 'Thành phần giao diện',
    difficulty: 'Dễ',
    tags: ['skeleton', 'loading', 'profile card', 'shimmer', 'ui'],
    learningPoints: [
      'Tạo hiệu ứng khung xương nhấp nháy bằng CSS @keyframes và linear-gradient',
      'Tôn trọng người dùng nhạy cảm chuyển động với @media (prefers-reduced-motion: reduce)',
      'Giữ kích thước khung ổn định để tránh nhảy bố cục khi dữ liệu tải xong',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'hieu-ung-transition-transform-animation', title: 'Chuyển động & Hiệu ứng' },
      { courseId: 'css', slug: 'vien-bo-goc-va-do-bong', title: 'Viền, bo góc & Đổ bóng' },
    ],
    createdOrder: 18,
    iconKey: 'user',
    htmlCode: `<!-- Minh họa thẻ hồ sơ kèm chế độ mô phỏng tải Skeleton -->
<main class="wrap">
  <div class="controls">
    <button type="button" id="reload-card-btn" class="ctrl-btn">Mô phỏng tải lại (1.2 giây)</button>
  </div>

  <article id="profile-card" class="card" aria-busy="false">
    <div id="skeleton-view" class="skeleton-box" hidden>
      <div class="sk-row">
        <div class="sk sk-avatar"></div>
        <div class="sk-col">
          <div class="sk sk-title"></div>
          <div class="sk sk-sub"></div>
        </div>
      </div>
      <div class="sk sk-line"></div>
      <div class="sk sk-line short"></div>
    </div>

    <div id="content-view">
      <div class="head">
        <div class="avatar" aria-hidden="true">TH</div>
        <div>
          <h1>Trần Thu Hà</h1>
          <p class="role">Thiết kế giao diện • Hà Nội</p>
        </div>
      </div>
      <p class="bio">Yêu thích thiết kế hệ thống token rõ ràng, thẻ tương tác mượt mà và trải nghiệm di động thân thiện.</p>
      <div class="stats">
        <div><strong>24</strong><span>Mẫu UI</span></div>
        <div><strong>18</strong><span>Bài viết</span></div>
        <div><strong>420</strong><span>Lượt thích</span></div>
      </div>
      <button type="button" id="follow-btn" class="follow-btn" aria-pressed="false">Theo dõi</button>
    </div>
  </article>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #0f172a; padding: 28px 16px; }
.wrap { max-width: 440px; margin: 0 auto; }
.controls { margin-bottom: 12px; display: flex; justify-content: flex-end; }
.ctrl-btn { min-height: 44px; padding: 8px 14px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; font-size: 13px; font-weight: 600; cursor: pointer; }
.card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06); }
.head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.avatar { width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: #ffffff; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.head h1 { font-size: 18px; }
.role { font-size: 13px; color: #475569; }
.bio { font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12px; background: #f8fafc; border-radius: 12px; text-align: center; margin-bottom: 16px; }
.stats strong { display: block; font-size: 17px; color: #0f172a; }
.stats span { font-size: 12px; color: #64748b; }
.follow-btn { width: 100%; min-height: 44px; border-radius: 10px; border: none; background: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; cursor: pointer; }
.follow-btn[aria-pressed="true"] { background: #e2e8f0; color: #0f172a; }
.sk-row { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.sk-col { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sk { border-radius: 8px; background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
.sk-avatar { width: 54px; height: 54px; border-radius: 50%; flex-shrink: 0; }
.sk-title { height: 18px; width: 65%; }
.sk-sub { height: 14px; width: 45%; }
.sk-line { height: 14px; width: 100%; margin-bottom: 8px; }
.sk-line.short { width: 70%; margin-bottom: 0; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .sk { animation: none; } }`,
    jsCode: `// Chuyển đổi giữa trạng thái Skeleton và nội dung hồ sơ
const card = document.getElementById('profile-card');
const skBox = document.getElementById('skeleton-view');
const contentBox = document.getElementById('content-view');
const reloadBtn = document.getElementById('reload-card-btn');
const followBtn = document.getElementById('follow-btn');
let timer = null;

reloadBtn.addEventListener('click', () => {
  if (timer) clearTimeout(timer);
  card.setAttribute('aria-busy', 'true');
  skBox.hidden = false;
  contentBox.hidden = true;
  timer = setTimeout(() => {
    skBox.hidden = true;
    contentBox.hidden = false;
    card.setAttribute('aria-busy', 'false');
  }, 1200);
});

followBtn.addEventListener('click', () => {
  const followed = followBtn.getAttribute('aria-pressed') === 'true';
  followBtn.setAttribute('aria-pressed', String(!followed));
  followBtn.textContent = !followed ? 'Đang theo dõi ✓' : 'Theo dõi';
});`,
  },

  // =========================================================
  // ỨNG DỤNG NHỎ (6 mẫu mới)
  // =========================================================
  {
    id: 'app-pomodoro',
    name: 'Đồng hồ Pomodoro tập trung',
    description: 'Đồng hồ đếm ngược 25 phút học tập / 5 phút nghỉ với vòng tròn SVG và thống kê phiên hoàn thành',
    badge: 'Ứng dụng nhỏ',
    category: 'Ứng dụng nhỏ',
    difficulty: 'Trung bình',
    tags: ['pomodoro', 'dong ho', 'dem nguoc', 'svg', 'tap trung'],
    learningPoints: [
      'Cập nhật vòng tròn tiến độ SVG bằng stroke-dasharray và stroke-dashoffset',
      'Quản lý bộ đếm thời gian với setInterval và xóa hẹn giờ tránh rò rỉ',
      'Lưu số phiên tập trung an toàn trong sandbox bằng try/catch kèm bộ nhớ tạm',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'hen-gio-va-go-loi-debugging', title: 'Hẹn giờ (setInterval)' },
      { courseId: 'js', slug: 'ham-function', title: 'Hàm (Function)' },
    ],
    createdOrder: 19,
    iconKey: 'calendar',
    htmlCode: `<!-- Ứng dụng Pomodoro 25/5/15 kèm vòng tiến độ SVG -->
<main class="pomo-app">
  <header class="modes" role="group" aria-label="Chế độ hẹn giờ">
    <button type="button" class="mode-btn active" data-mins="25">Tập trung 25p</button>
    <button type="button" class="mode-btn" data-mins="5">Nghỉ ngắn 5p</button>
    <button type="button" class="mode-btn" data-mins="15">Nghỉ dài 15p</button>
  </header>

  <div class="ring-wrap">
    <svg viewBox="0 0 180 180" width="180" height="180" aria-hidden="true">
      <circle cx="90" cy="90" r="76" class="ring-bg" />
      <circle id="ring-progress" cx="90" cy="90" r="76" class="ring-fg" />
    </svg>
    <div class="time-text">
      <strong id="time-display">25:00</strong>
      <span id="mode-status">Sẵn sàng tập trung</span>
    </div>
  </div>

  <div class="actions">
    <button type="button" id="toggle-btn" class="primary-btn">Bắt đầu</button>
    <button type="button" id="reset-btn" class="sec-btn">Đặt lại</button>
  </div>

  <p class="done-count">Số phiên hoàn thành hôm nay: <strong id="session-count">0</strong></p>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.pomo-app { width: 100%; max-width: 420px; background: #1e293b; border: 1px solid #334155; border-radius: 22px; padding: 24px; text-align: center; }
.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 22px; }
.mode-btn { min-height: 44px; padding: 6px 8px; border-radius: 10px; border: 1px solid #334155; background: #0f172a; color: #cbd5e1; font-size: 12px; font-weight: 600; cursor: pointer; }
.mode-btn.active { background: #2563eb; color: #ffffff; border-color: #2563eb; }
.ring-wrap { position: relative; width: 180px; height: 180px; margin: 0 auto 22px; }
.ring-wrap svg { transform: rotate(-90deg); display: block; }
.ring-bg { fill: none; stroke: #334155; stroke-width: 10; }
.ring-fg { fill: none; stroke: #38bdf8; stroke-width: 10; stroke-linecap: round; stroke-dasharray: 477.5; stroke-dashoffset: 0; transition: stroke-dashoffset 0.4s linear; }
.time-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.time-text strong { font-size: 36px; font-variant-numeric: tabular-nums; }
.time-text span { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.actions { display: flex; gap: 10px; justify-content: center; margin-bottom: 18px; }
.primary-btn, .sec-btn { min-height: 44px; min-width: 112px; padding: 10px 18px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; border: none; }
.primary-btn { background: #38bdf8; color: #0f172a; }
.sec-btn { background: #334155; color: #f8fafc; }
.done-count { font-size: 13px; color: #cbd5e1; }
@media (prefers-reduced-motion: reduce) { .ring-fg { transition: none; } }`,
    jsCode: `// Bộ đếm Pomodoro và lưu số phiên hoàn thành an toàn trong sandbox
const CIRC = 2 * Math.PI * 76;
let totalSeconds = 25 * 60;
let remaining = totalSeconds;
let timerId = null;
let memoryCount = 0;

function readCount() {
  try { return Number(localStorage.getItem('pomo_done') || 0); } catch (e) { return memoryCount; }
}
function saveCount(n) {
  memoryCount = n;
  try { localStorage.setItem('pomo_done', String(n)); } catch (e) {}
}

const timeEl = document.getElementById('time-display');
const statusEl = document.getElementById('mode-status');
const ringEl = document.getElementById('ring-progress');
const toggleBtn = document.getElementById('toggle-btn');
const countEl = document.getElementById('session-count');

function render() {
  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  timeEl.textContent = m + ':' + s;
  const ratio = totalSeconds > 0 ? remaining / totalSeconds : 0;
  ringEl.style.strokeDasharray = String(CIRC);
  ringEl.style.strokeDashoffset = String(CIRC * (1 - ratio));
}

function stopTimer() {
  if (timerId) { clearInterval(timerId); timerId = null; }
  toggleBtn.textContent = 'Bắt đầu';
}

toggleBtn.addEventListener('click', () => {
  if (timerId) {
    stopTimer();
    statusEl.textContent = 'Đã tạm dừng';
    return;
  }
  toggleBtn.textContent = 'Tạm dừng';
  statusEl.textContent = 'Đang chạy...';
  timerId = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      remaining = 0;
      stopTimer();
      statusEl.textContent = 'Hoàn thành phiên!';
      const next = readCount() + 1;
      saveCount(next);
      countEl.textContent = String(next);
    }
    render();
  }, 1000);
});

document.getElementById('reset-btn').addEventListener('click', () => {
  stopTimer();
  remaining = totalSeconds;
  statusEl.textContent = 'Sẵn sàng tập trung';
  render();
});

document.querySelectorAll('.mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    stopTimer();
    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.toggle('active', b === btn));
    totalSeconds = Number(btn.dataset.mins) * 60;
    remaining = totalSeconds;
    statusEl.textContent = 'Đã chuyển chế độ';
    render();
  });
});

countEl.textContent = String(readCount());
render();`,
  },
  {
    id: 'app-calculator',
    name: 'Máy tính bỏ túi hỗ trợ bàn phím',
    description: 'Máy tính cầm tay 4 phép tính cộng trừ nhân chia, hỗ trợ bàn phím và dải lịch sử phép tính',
    badge: 'Ứng dụng nhỏ',
    category: 'Ứng dụng nhỏ',
    difficulty: 'Trung bình',
    tags: ['may tinh', 'calculator', 'ban phim', 'so hoc', 'app'],
    learningPoints: [
      'Xây dựng bàn phím số đều đẹp bằng CSS Grid 4 cột',
      'Xử lý phép tính tuần tự an toàn mà không dùng hàm eval()',
      'Bắt sự kiện nhấn phím số và Enter/Backspace từ bàn phím thật',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'css-grid-luoi-hai-chieu', title: 'CSS Grid: Lưới hai chiều' },
      { courseId: 'js', slug: 'cau-dieu-kien-if-else', title: 'Câu điều kiện if / else' },
    ],
    createdOrder: 20,
    iconKey: 'check',
    htmlCode: `<!-- Máy tính cầm tay an toàn không dùng eval() -->
<main class="calc">
  <div class="screen" aria-live="polite">
    <div id="expr-history" class="history">0</div>
    <div id="calc-display" class="display">0</div>
  </div>
  <div class="keys" role="group" aria-label="Bàn phím máy tính">
    <button type="button" class="k util" data-act="clear">AC</button>
    <button type="button" class="k util" data-act="back">⌫</button>
    <button type="button" class="k util" data-act="percent">%</button>
    <button type="button" class="k op" data-op="/">÷</button>
    <button type="button" class="k" data-num="7">7</button>
    <button type="button" class="k" data-num="8">8</button>
    <button type="button" class="k" data-num="9">9</button>
    <button type="button" class="k op" data-op="*">×</button>
    <button type="button" class="k" data-num="4">4</button>
    <button type="button" class="k" data-num="5">5</button>
    <button type="button" class="k" data-num="6">6</button>
    <button type="button" class="k op" data-op="-">−</button>
    <button type="button" class="k" data-num="1">1</button>
    <button type="button" class="k" data-num="2">2</button>
    <button type="button" class="k" data-num="3">3</button>
    <button type="button" class="k op" data-op="+">+</button>
    <button type="button" class="k zero" data-num="0">0</button>
    <button type="button" class="k" data-num=".">.</button>
    <button type="button" class="k eq" data-act="equals">=</button>
  </div>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
.calc { width: 100%; max-width: 340px; background: #0f172a; border-radius: 22px; padding: 18px; box-shadow: 0 20px 36px rgba(15, 23, 42, 0.25); }
.screen { background: #1e293b; border-radius: 14px; padding: 14px 16px; text-align: right; margin-bottom: 14px; min-height: 84px; }
.history { font-size: 13px; color: #94a3b8; min-height: 18px; word-break: break-all; }
.display { font-size: 32px; font-weight: 700; color: #ffffff; margin-top: 4px; font-variant-numeric: tabular-nums; overflow-x: auto; }
.keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.k { min-height: 52px; border-radius: 12px; border: none; background: #334155; color: #f8fafc; font-size: 18px; font-weight: 600; cursor: pointer; }
.k:hover { opacity: 0.92; }
.k.util { background: #475569; }
.k.op { background: #2563eb; }
.k.eq { background: #16a34a; }
.k.zero { grid-column: span 2; }`,
    jsCode: `// Logic máy tính tuần tự không dùng eval()
let current = '0';
let stored = null;
let operator = null;
let resetNext = false;

const displayEl = document.getElementById('calc-display');
const historyEl = document.getElementById('expr-history');

function compute(a, op, b) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? 'Lỗi chia 0' : a / b;
  return b;
}

function updateScreen() {
  displayEl.textContent = current;
  historyEl.textContent = stored !== null && operator ? stored + ' ' + operator : ' ';
}

function inputDigit(ch) {
  if (current === 'Lỗi chia 0') current = '0';
  if (resetNext) { current = ch === '.' ? '0.' : ch; resetNext = false; }
  else if (ch === '.') { if (!current.includes('.')) current += '.'; }
  else { current = current === '0' ? ch : current + ch; }
  updateScreen();
}

function chooseOp(op) {
  const num = parseFloat(current);
  if (Number.isNaN(num)) return;
  if (stored !== null && operator && !resetNext) {
    const res = compute(stored, operator, num);
    if (typeof res === 'string') { current = res; stored = null; operator = null; updateScreen(); return; }
    stored = Number(res.toFixed(8));
    current = String(stored);
  } else {
    stored = num;
  }
  operator = op;
  resetNext = true;
  updateScreen();
}

function evaluate() {
  if (stored === null || !operator) return;
  const num = parseFloat(current);
  const res = compute(stored, operator, num);
  historyEl.textContent = stored + ' ' + operator + ' ' + num + ' =';
  current = typeof res === 'string' ? res : String(Number(res.toFixed(8)));
  stored = null;
  operator = null;
  resetNext = true;
  displayEl.textContent = current;
}

document.querySelector('.keys').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.num !== undefined) inputDigit(btn.dataset.num);
  else if (btn.dataset.op) chooseOp(btn.dataset.op);
  else if (btn.dataset.act === 'equals') evaluate();
  else if (btn.dataset.act === 'clear') { current = '0'; stored = null; operator = null; resetNext = false; updateScreen(); }
  else if (btn.dataset.act === 'back') { current = current.length > 1 ? current.slice(0, -1) : '0'; updateScreen(); }
  else if (btn.dataset.act === 'percent') { current = String(Number((parseFloat(current || '0') / 100).toFixed(8))); updateScreen(); }
});

window.addEventListener('keydown', (e) => {
  if (/^[0-9.]$/.test(e.key)) inputDigit(e.key);
  else if (['+', '-', '*', '/'].includes(e.key)) chooseOp(e.key);
  else if (e.key === 'Enter' || e.key === '=') evaluate();
  else if (e.key === 'Backspace') { current = current.length > 1 ? current.slice(0, -1) : '0'; updateScreen(); }
  else if (e.key === 'Escape') { current = '0'; stored = null; operator = null; resetNext = false; updateScreen(); }
});
updateScreen();`,
  },
  {
    id: 'app-unit-converter',
    name: 'Chuyển đổi đơn vị đa năng',
    description: 'Ứng dụng quy đổi nhanh Chiều dài, Khối lượng và Nhiệt độ theo hai chiều với nút đảo ngược',
    badge: 'Ứng dụng nhỏ',
    category: 'Ứng dụng nhỏ',
    difficulty: 'Dễ',
    tags: ['chuyen doi', 'don vi', 'do dai', 'nhiet do', 'khoi luong'],
    learningPoints: [
      'Tổ chức bảng hệ số quy đổi theo đối tượng (Object) lồng nhau gọn gàng',
      'Cập nhật kết quả hai chiều ngay khi gõ hoặc đổi đơn vị',
      'Thay đổi danh sách <option> động khi người dùng chọn nhóm đại lượng mới',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'doi-tuong-object', title: 'Đối tượng (Object)' },
      { courseId: 'html', slug: 'bieu-mau-form', title: 'Biểu mẫu (<select>, <input>)' },
    ],
    createdOrder: 21,
    iconKey: 'compass',
    htmlCode: `<!-- Trình chuyển đổi đơn vị Chiều dài, Khối lượng & Nhiệt độ -->
<main class="conv-card">
  <h1>Chuyển đổi đơn vị</h1>
  <div class="group-tabs" role="group" aria-label="Nhóm đơn vị">
    <button type="button" class="g-btn active" data-cat="length">Chiều dài</button>
    <button type="button" class="g-btn" data-cat="weight">Khối lượng</button>
    <button type="button" class="g-btn" data-cat="temp">Nhiệt độ</button>
  </div>

  <div class="row">
    <div class="field">
      <label for="val-from">Giá trị nhập</label>
      <input id="val-from" type="number" step="any" value="1" />
      <select id="unit-from" aria-label="Đơn vị nguồn"></select>
    </div>

    <button type="button" id="swap-btn" class="swap-btn" aria-label="Đảo ngược hai đơn vị">⇄</button>

    <div class="field">
      <label for="val-to">Kết quả</label>
      <input id="val-to" type="number" step="any" readonly />
      <select id="unit-to" aria-label="Đơn vị đích"></select>
    </div>
  </div>
  <p id="formula-note" class="note"></p>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 28px 16px; }
.conv-card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; }
.conv-card h1 { font-size: 20px; margin-bottom: 14px; }
.group-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
.g-btn { min-height: 44px; padding: 8px 14px; border-radius: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #334155; font-weight: 600; font-size: 13px; cursor: pointer; }
.g-btn.active { background: #2563eb; color: #ffffff; border-color: #2563eb; }
.row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: end; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; }
.field input, .field select { width: 100%; min-height: 44px; padding: 10px 12px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 15px; background: #ffffff; }
.field input[readonly] { background: #f1f5f9; font-weight: 700; color: #1d4ed8; }
.swap-btn { min-width: 44px; min-height: 44px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; font-size: 18px; cursor: pointer; }
.note { margin-top: 14px; font-size: 13px; color: #475569; }
@media (max-width: 580px) { .row { grid-template-columns: 1fr; } .swap-btn { width: 100%; } }`,
    jsCode: `// Bảng đơn vị theo mét (length), gam (weight) và công thức riêng cho nhiệt độ
const DATA = {
  length: {
    units: { m: ['Mét (m)', 1], km: ['Kilômét (km)', 1000], cm: ['Xăng-ti-mét (cm)', 0.01], inch: ['Inch (in)', 0.0254], ft: ['Foot (ft)', 0.3048] },
    def: ['km', 'm']
  },
  weight: {
    units: { kg: ['Kilôgam (kg)', 1000], g: ['Gam (g)', 1], lb: ['Pound (lb)', 453.592] },
    def: ['kg', 'g']
  },
  temp: {
    units: { c: ['Độ C (°C)', 1], f: ['Độ F (°F)', 1], k: ['Độ K (K)', 1] },
    def: ['c', 'f']
  }
};

let cat = 'length';
const valFrom = document.getElementById('val-from');
const valTo = document.getElementById('val-to');
const unitFrom = document.getElementById('unit-from');
const unitTo = document.getElementById('unit-to');
const noteEl = document.getElementById('formula-note');

function convert() {
  const v = parseFloat(valFrom.value);
  if (Number.isNaN(v)) { valTo.value = ''; return; }
  const f = unitFrom.value;
  const t = unitTo.value;
  let out = v;
  if (cat === 'temp') {
    const celsius = f === 'c' ? v : f === 'f' ? (v - 32) * 5 / 9 : v - 273.15;
    out = t === 'c' ? celsius : t === 'f' ? celsius * 9 / 5 + 32 : celsius + 273.15;
  } else {
    const u = DATA[cat].units;
    out = (v * u[f][1]) / u[t][1];
  }
  valTo.value = String(Number(out.toFixed(4)));
  noteEl.textContent = v + ' ' + DATA[cat].units[f][0] + ' = ' + valTo.value + ' ' + DATA[cat].units[t][0];
}

function loadCategory(next) {
  cat = next;
  const entries = Object.entries(DATA[cat].units);
  const opts = entries.map(([k, [label]]) => '<option value="' + k + '">' + label + '</option>').join('');
  unitFrom.innerHTML = opts;
  unitTo.innerHTML = opts;
  unitFrom.value = DATA[cat].def[0];
  unitTo.value = DATA[cat].def[1];
  convert();
}

document.querySelectorAll('.g-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.g-btn').forEach((b) => b.classList.toggle('active', b === btn));
    loadCategory(btn.dataset.cat);
  });
});

document.getElementById('swap-btn').addEventListener('click', () => {
  const prev = unitFrom.value;
  unitFrom.value = unitTo.value;
  unitTo.value = prev;
  convert();
});

valFrom.addEventListener('input', convert);
unitFrom.addEventListener('change', convert);
unitTo.addEventListener('change', convert);
loadCategory('length');`,
  },
  {
    id: 'app-expense-tracker',
    name: 'Sổ thu chi cá nhân mini',
    description: 'Quản lý thu nhập và chi tiêu hằng ngày, tự tính số dư, lọc khoản mục và hiển thị thanh tỷ lệ thu/chi',
    badge: 'Ứng dụng nhỏ',
    category: 'Ứng dụng nhỏ',
    difficulty: 'Trung bình',
    tags: ['thu chi', 'tai chinh', 'ngan sach', 'expense', 'app'],
    learningPoints: [
      'Tính tổng thu, tổng chi và số dư từ mảng giao dịch bằng reduce',
      'Định dạng tiền tệ tiếng Việt dễ đọc bằng Intl.NumberFormat',
      'Lưu dữ liệu trong try/catch kèm danh sách mặc định để chạy mượt trong sandbox',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'mang-array', title: 'Mảng (Array) trong JavaScript' },
      { courseId: 'js', slug: 'du-an-nho-todo-list', title: 'Dự án nhỏ quản lý danh sách' },
    ],
    createdOrder: 22,
    iconKey: 'file',
    htmlCode: `<!-- Sổ thu chi mini có tổng hợp số dư và thanh tỷ lệ -->
<main class="wallet">
  <h1>Sổ Thu Chi Hằng Ngày</h1>
  <section class="summary" aria-label="Tổng quan tài chính">
    <div class="sum-card"><small>Số dư</small><strong id="sum-balance">0đ</strong></div>
    <div class="sum-card inc"><small>Tổng thu</small><strong id="sum-in">0đ</strong></div>
    <div class="sum-card exp"><small>Tổng chi</small><strong id="sum-out">0đ</strong></div>
  </section>

  <div class="bar-track" aria-label="Tỷ lệ thu và chi">
    <div id="bar-in" class="bar-in" style="width: 50%"></div>
  </div>

  <form id="tx-form" class="tx-form">
    <input id="tx-title" type="text" required placeholder="Nội dung (vd: Ăn trưa, Học bổng)" />
    <input id="tx-amount" type="number" min="1000" step="1000" required placeholder="Số tiền (đ)" />
    <select id="tx-type" aria-label="Loại giao dịch">
      <option value="expense">Chi tiêu</option>
      <option value="income">Thu nhập</option>
    </select>
    <button type="submit" class="add-btn">Thêm</button>
  </form>

  <ul id="tx-list" class="tx-list"></ul>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 24px 16px; }
.wallet { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; }
.wallet h1 { font-size: 20px; margin-bottom: 14px; }
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
.sum-card { background: #f1f5f9; border-radius: 12px; padding: 12px; }
.sum-card small { display: block; font-size: 12px; color: #475569; }
.sum-card strong { font-size: 17px; }
.sum-card.inc strong { color: #15803d; }
.sum-card.exp strong { color: #b91c1c; }
.bar-track { height: 10px; background: #fecaca; border-radius: 999px; overflow: hidden; margin-bottom: 16px; }
.bar-in { height: 100%; background: #16a34a; transition: width 0.25s; }
.tx-form { display: grid; grid-template-columns: 1.4fr 1fr 0.9fr auto; gap: 8px; margin-bottom: 16px; }
.tx-form input, .tx-form select { min-height: 44px; padding: 8px 10px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px; background: #ffffff; }
.add-btn { min-height: 44px; padding: 8px 16px; border-radius: 10px; border: none; background: #2563eb; color: #ffffff; font-weight: 700; cursor: pointer; }
.tx-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.tx-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; }
.tx-item .amt { font-weight: 700; margin-right: 8px; }
.tx-item .amt.in { color: #15803d; }
.tx-item .amt.out { color: #b91c1c; }
.del-btn { min-width: 44px; min-height: 44px; border: none; border-radius: 8px; background: #fee2e2; color: #b91c1c; font-weight: 700; cursor: pointer; }
@media (max-width: 600px) { .summary, .tx-form { grid-template-columns: 1fr; } }`,
    jsCode: `// Quản lý thu chi và lưu tạm an toàn khi chạy trong sandbox
const DEFAULT_ITEMS = [
  { id: 1, title: 'Trợ cấp gia đình', amount: 1500000, type: 'income' },
  { id: 2, title: 'Mua sách lập trình', amount: 185000, type: 'expense' },
  { id: 3, title: 'Tiền ăn trưa', amount: 45000, type: 'expense' }
];
let memItems = [...DEFAULT_ITEMS];

function loadItems() {
  try {
    const raw = localStorage.getItem('mini_wallet_v1');
    return raw ? JSON.parse(raw) : [...DEFAULT_ITEMS];
  } catch (e) { return memItems; }
}
function saveItems(list) {
  memItems = list;
  try { localStorage.setItem('mini_wallet_v1', JSON.stringify(list)); } catch (e) {}
}

let items = loadItems();
const fmt = new Intl.NumberFormat('vi-VN');
const listEl = document.getElementById('tx-list');

function render() {
  const totalIn = items.filter((i) => i.type === 'income').reduce((s, i) => s + i.amount, 0);
  const totalOut = items.filter((i) => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
  document.getElementById('sum-balance').textContent = fmt.format(totalIn - totalOut) + 'đ';
  document.getElementById('sum-in').textContent = '+' + fmt.format(totalIn) + 'đ';
  document.getElementById('sum-out').textContent = '-' + fmt.format(totalOut) + 'đ';
  const sum = totalIn + totalOut;
  document.getElementById('bar-in').style.width = (sum > 0 ? Math.round((totalIn / sum) * 100) : 50) + '%';

  listEl.innerHTML = items.map((i) =>
    '<li class="tx-item"><span>' + i.title + '</span><div><span class="amt ' +
    (i.type === 'income' ? 'in">+': 'out">-') + fmt.format(i.amount) +
    'đ</span><button type="button" class="del-btn" data-id="' + i.id + '" aria-label="Xóa khoản ' + i.title + '">×</button></div></li>'
  ).join('');
}

document.getElementById('tx-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('tx-title').value.trim();
  const amount = Number(document.getElementById('tx-amount').value);
  const type = document.getElementById('tx-type').value;
  if (!title || amount <= 0) return;
  items.unshift({ id: Date.now(), title, amount, type });
  saveItems(items);
  e.target.reset();
  render();
});

listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.del-btn');
  if (!btn) return;
  items = items.filter((i) => i.id !== Number(btn.dataset.id));
  saveItems(items);
  render();
});
render();`,
  },
  {
    id: 'app-markdown-preview',
    name: 'Trình soạn Markdown xem trước nhanh',
    description: 'Soạn thảo văn bản Markdown kèm thanh công cụ định dạng nhanh và khung xem trước HTML an toàn tức thì',
    badge: 'Ứng dụng nhỏ',
    category: 'Ứng dụng nhỏ',
    difficulty: 'Trung bình',
    tags: ['markdown', 'soan thao', 'xem truoc', 'editor', 'van ban'],
    learningPoints: [
      'Chống lỗi chèn mã độc (XSS) bằng cách thoát ký tự HTML trước khi chuyển đổi Markdown',
      'Chuyển đổi tiêu đề, chữ đậm/nghiêng, code và trích dẫn bằng biểu thức chính quy',
      'Chèn nhanh cú pháp vào đúng vị trí con trỏ trong <textarea>',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'toan-tu-va-chuoi', title: 'Toán tử và xử lý chuỗi' },
      { courseId: 'css', slug: 'flexbox-bo-cuc-linh-hoat', title: 'Flexbox: Bố cục linh hoạt' },
    ],
    createdOrder: 23,
    iconKey: 'book',
    htmlCode: `<!-- Trình soạn thảo Markdown 2 cột kèm thanh chèn nhanh -->
<main class="md-app">
  <header class="toolbar">
    <div class="tools" role="group" aria-label="Chèn nhanh Markdown">
      <button type="button" data-wrap="**">In đậm</button>
      <button type="button" data-wrap="*">In nghiêng</button>
      <button type="button" data-line="## ">Tiêu đề H2</button>
      <button type="button" data-line="- ">Gạch đầu dòng</button>
    </div>
    <span id="word-stat" class="stat">0 từ</span>
  </header>

  <section class="panes">
    <textarea id="md-input" aria-label="Nhập nội dung Markdown"># Ghi chú buổi học
Chào bạn, hãy thử **chỉnh sửa** nội dung này hoặc dùng nút phía trên!

- Học thẻ *HTML ngữ nghĩa*
- Luyện bố cục \`CSS Grid\`
> Mẹo nhỏ: Viết ghi chú mỗi ngày giúp nhớ cú pháp lâu hơn.</textarea>
    <article id="md-output" class="preview" aria-label="Bản xem trước HTML"></article>
  </section>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #0f172a; padding: 20px 14px; }
.md-app { max-width: 960px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.tools { display: flex; flex-wrap: wrap; gap: 6px; }
.tools button { min-height: 44px; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; font-size: 13px; font-weight: 600; cursor: pointer; }
.stat { font-size: 12px; font-weight: 600; color: #475569; }
.panes { display: grid; grid-template-columns: 1fr 1fr; min-height: 360px; }
textarea { width: 100%; min-height: 320px; border: none; border-right: 1px solid #e2e8f0; padding: 16px; font-family: ui-monospace, monospace; font-size: 14px; line-height: 1.6; resize: vertical; outline: none; }
.preview { padding: 16px 20px; line-height: 1.65; overflow-y: auto; }
.preview h1, .preview h2 { margin: 8px 0 10px; }
.preview p { margin-bottom: 10px; }
.preview ul { padding-left: 20px; margin-bottom: 10px; }
.preview code { background: #e2e8f0; padding: 2px 6px; border-radius: 5px; font-size: 13px; }
.preview blockquote { border-left: 4px solid #2563eb; padding-left: 12px; color: #475569; margin: 10px 0; }
@media (max-width: 720px) { .panes { grid-template-columns: 1fr; } textarea { border-right: none; border-bottom: 1px solid #e2e8f0; min-height: 200px; } }`,
    jsCode: `// Chuyển đổi Markdown cơ bản sang HTML an toàn (thoát HTML gốc trước)
const inputEl = document.getElementById('md-input');
const outputEl = document.getElementById('md-output');
const statEl = document.getElementById('word-stat');

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMarkdown() {
  const raw = inputEl.value;
  const words = raw.trim() ? raw.trim().split(/\\s+/).length : 0;
  statEl.textContent = words + ' từ • ' + raw.length + ' ký tự';

  const lines = escapeHtml(raw).split('\\n');
  let html = '';
  let inList = false;

  lines.forEach((line) => {
    const inline = line
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
      .replace(/\`(.+?)\`/g, '<code>$1</code>');

    if (inline.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + inline.slice(2) + '</li>';
      return;
    }
    if (inList) { html += '</ul>'; inList = false; }

    if (inline.startsWith('## ')) html += '<h2>' + inline.slice(3) + '</h2>';
    else if (inline.startsWith('# ')) html += '<h1>' + inline.slice(2) + '</h1>';
    else if (inline.startsWith('&gt; ')) html += '<blockquote>' + inline.slice(5) + '</blockquote>';
    else if (inline.trim()) html += '<p>' + inline + '</p>';
  });

  if (inList) html += '</ul>';
  outputEl.innerHTML = html;
}

document.querySelector('.tools').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const start = inputEl.selectionStart;
  const end = inputEl.selectionEnd;
  const val = inputEl.value;
  if (btn.dataset.wrap) {
    const w = btn.dataset.wrap;
    const sel = val.slice(start, end) || 'văn bản';
    inputEl.value = val.slice(0, start) + w + sel + w + val.slice(end);
  } else if (btn.dataset.line) {
    inputEl.value = val.slice(0, start) + '\\n' + btn.dataset.line + val.slice(start);
  }
  inputEl.focus();
  renderMarkdown();
});

inputEl.addEventListener('input', renderMarkdown);
renderMarkdown();`,
  },
  {
    id: 'app-password-gen',
    name: 'Trình tạo mật khẩu & đo độ mạnh',
    description: 'Tạo mật khẩu ngẫu nhiên tùy chỉnh độ dài, nhóm ký tự, chấm điểm độ mạnh và sao chép nhanh',
    badge: 'Ứng dụng nhỏ',
    category: 'Ứng dụng nhỏ',
    difficulty: 'Dễ',
    tags: ['mat khau', 'password', 'bao mat', 'random', 'cong cu'],
    learningPoints: [
      'Sinh ký tự ngẫu nhiên ưu tiên crypto.getRandomValues để tăng tính bảo mật',
      'Tính điểm độ mạnh mật khẩu dựa trên độ dài và đa dạng loại ký tự',
      'Xử lý sao chép vào clipboard kèm phương án dự phòng trong iframe sandbox',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'vong-lap-for-while', title: 'Vòng lặp (for, while)' },
      { courseId: 'js', slug: 'ham-function', title: 'Hàm (Function)' },
    ],
    createdOrder: 24,
    iconKey: 'check',
    htmlCode: `<!-- Trình tạo mật khẩu ngẫu nhiên kèm thanh đo độ mạnh -->
<main class="pw-card">
  <h1>Tạo mật khẩu mạnh</h1>
  <div class="output-row">
    <input id="pw-output" type="text" readonly aria-label="Mật khẩu vừa tạo" />
    <button type="button" id="copy-pw" class="btn primary">Sao chép</button>
  </div>

  <div class="meter-wrap">
    <div class="meter-track"><div id="strength-bar" class="meter-fill"></div></div>
    <span id="strength-label">Mạnh</span>
  </div>

  <div class="options">
    <label class="range-lbl" for="pw-len">Độ dài: <strong id="len-val">14</strong> ký tự</label>
    <input id="pw-len" type="range" min="8" max="28" value="14" />

    <label class="chk"><input type="checkbox" id="opt-upper" checked /> Chữ hoa (A–Z)</label>
    <label class="chk"><input type="checkbox" id="opt-lower" checked /> Chữ thường (a–z)</label>
    <label class="chk"><input type="checkbox" id="opt-num" checked /> Chữ số (0–9)</label>
    <label class="chk"><input type="checkbox" id="opt-sym" checked /> Ký tự đặc biệt (!@#$%)</label>
  </div>

  <button type="button" id="gen-btn" class="gen-btn">Tạo mật khẩu mới</button>
  <p id="pw-msg" class="msg" role="status" aria-live="polite"></p>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 28px 16px; }
.pw-card { max-width: 460px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; }
.pw-card h1 { font-size: 20px; margin-bottom: 14px; }
.output-row { display: flex; gap: 8px; margin-bottom: 12px; }
.output-row input { flex: 1; min-height: 44px; padding: 10px 12px; border-radius: 10px; border: 1px solid #cbd5e1; font-family: ui-monospace, monospace; font-size: 15px; background: #f1f5f9; }
.btn, .gen-btn { min-height: 44px; padding: 10px 16px; border-radius: 10px; border: none; background: #2563eb; color: #ffffff; font-weight: 700; font-size: 14px; cursor: pointer; }
.gen-btn { width: 100%; margin-top: 16px; }
.meter-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.meter-track { flex: 1; height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.meter-fill { height: 100%; width: 70%; background: #16a34a; transition: width 0.2s, background 0.2s; }
#strength-label { font-size: 12px; font-weight: 700; min-width: 78px; text-align: right; }
.options { display: flex; flex-direction: column; gap: 8px; }
.range-lbl { font-size: 14px; font-weight: 600; }
input[type="range"] { width: 100%; min-height: 36px; accent-color: #2563eb; }
.chk { min-height: 36px; display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
.chk input { width: 18px; height: 18px; accent-color: #2563eb; }
.msg { margin-top: 10px; font-size: 13px; color: #1d4ed8; font-weight: 600; min-height: 20px; text-align: center; }`,
    jsCode: `// Sinh mật khẩu ngẫu nhiên và đánh giá độ mạnh
const SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  num: '0123456789',
  sym: '!@#$%^&*()-_=+'
};

const outEl = document.getElementById('pw-output');
const lenEl = document.getElementById('pw-len');
const lenVal = document.getElementById('len-val');
const barEl = document.getElementById('strength-bar');
const lblEl = document.getElementById('strength-label');
const msgEl = document.getElementById('pw-msg');

function randomIndex(max) {
  if (window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function generate() {
  const len = Number(lenEl.value);
  lenVal.textContent = String(len);
  let pool = '';
  let types = 0;
  if (document.getElementById('opt-upper').checked) { pool += SETS.upper; types++; }
  if (document.getElementById('opt-lower').checked) { pool += SETS.lower; types++; }
  if (document.getElementById('opt-num').checked) { pool += SETS.num; types++; }
  if (document.getElementById('opt-sym').checked) { pool += SETS.sym; types++; }
  if (!pool) { pool = SETS.lower; document.getElementById('opt-lower').checked = true; types = 1; }

  let pw = '';
  for (let i = 0; i < len; i++) pw += pool[randomIndex(pool.length)];
  outEl.value = pw;

  const score = (len >= 14 ? 2 : len >= 10 ? 1 : 0) + types;
  if (score >= 5) { barEl.style.width = '100%'; barEl.style.background = '#16a34a'; lblEl.textContent = 'Rất mạnh'; }
  else if (score >= 3) { barEl.style.width = '68%'; barEl.style.background = '#eab308'; lblEl.textContent = 'Khá mạnh'; }
  else { barEl.style.width = '36%'; barEl.style.background = '#dc2626'; lblEl.textContent = 'Cần dài hơn'; }
}

document.getElementById('gen-btn').addEventListener('click', generate);
[lenEl, document.getElementById('opt-upper'), document.getElementById('opt-lower'), document.getElementById('opt-num'), document.getElementById('opt-sym')].forEach((el) => {
  el.addEventListener('input', generate);
});

document.getElementById('copy-pw').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(outEl.value);
    msgEl.textContent = 'Đã sao chép mật khẩu!';
  } catch (e) {
    outEl.select();
    msgEl.textContent = 'Đã chọn mật khẩu, nhấn Ctrl+C để sao chép.';
  }
});

generate();`,
  },
];

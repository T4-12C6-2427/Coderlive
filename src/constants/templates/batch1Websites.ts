import { CodeTemplate } from '../../types';

export const BATCH_1_WEBSITE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'portfolio-personal',
    name: 'Trang giới thiệu bản thân',
    description: 'Portfolio cá nhân gồm Hero, kỹ năng, dự án nổi bật, form liên hệ và nút đổi giao diện sáng/tối',
    badge: 'Trang web',
    category: 'Trang web',
    difficulty: 'Dễ',
    tags: ['portfolio', 'ca nhan', 'gioi thieu', 'sang toi', 'dark mode', 'responsive'],
    learningPoints: [
      'Xây dựng bố cục ngữ nghĩa với header, main, section và footer',
      'Tạo nút chuyển chế độ sáng/tối bằng biến CSS và thuộc tính data-theme',
      'Lưu tùy chọn người dùng an toàn với try/catch quanh localStorage',
      'Xác thực biểu mẫu liên hệ ngay trên trang không cần tải lại',
    ],
    relatedLessons: [
      { courseId: 'html', slug: 'the-ngu-nghia-semantic', title: 'Khối và thẻ ngữ nghĩa' },
      { courseId: 'css', slug: 'flexbox-bo-cuc-linh-hoat', title: 'Flexbox: Bố cục linh hoạt' },
      { courseId: 'js', slug: 'su-kien-event-listener', title: 'Sự kiện trong JavaScript' },
    ],
    createdOrder: 5,
    iconKey: 'user',
    htmlCode: `<!-- Trang Portfolio cá nhân với chuyển đổi sáng/tối -->
<header class="topbar">
  <a class="brand" href="#gioi-thieu">MinhAnh.dev</a>
  <nav class="nav" aria-label="Điều hướng chính">
    <a href="#ky-nang">Kỹ năng</a>
    <a href="#du-an">Dự án</a>
    <a href="#lien-he">Liên hệ</a>
    <button type="button" id="theme-toggle" class="btn-outline" aria-pressed="false">🌙 Giao diện tối</button>
  </nav>
</header>

<main class="container">
  <section id="gioi-thieu" class="hero">
    <div class="hero-copy">
      <p class="kicker">Lập trình viên Giao diện Web</p>
      <h1>Xin chào, mình là Minh Anh — xây dựng web gọn nhẹ &amp; dễ dùng.</h1>
      <p class="lead">Mình yêu thích thiết kế giao diện sạch sẽ, tốc độ tải nhanh và thân thiện trên mọi màn hình.</p>
      <div class="hero-actions">
        <a class="btn-primary" href="#du-an">Xem dự án</a>
        <a class="btn-outline" href="#lien-he">Nhắn tin ngay</a>
      </div>
    </div>
    <div class="avatar-box" aria-hidden="true">
      <svg viewBox="0 0 180 180" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
        <circle cx="90" cy="90" r="84" fill="#e0e7ff" />
        <circle cx="90" cy="70" r="30" fill="#4338ca" />
        <path d="M40 150 C45 112, 135 112, 140 150" fill="#4338ca" />
        <circle cx="79" cy="67" r="4" fill="#ffffff" />
        <circle cx="101" cy="67" r="4" fill="#ffffff" />
        <path d="M80 80 Q90 88 100 80" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" />
      </svg>
    </div>
  </section>

  <section id="ky-nang" class="section">
    <h2>Kỹ năng chuyên môn</h2>
    <div class="skills-grid">
      <div class="card"><strong>HTML5 &amp; Ngữ nghĩa</strong><span>95%</span><div class="bar"><div class="fill w95"></div></div></div>
      <div class="card"><strong>CSS Grid &amp; Responsive</strong><span>90%</span><div class="bar"><div class="fill w90"></div></div></div>
      <div class="card"><strong>JavaScript ES6 &amp; DOM</strong><span>85%</span><div class="bar"><div class="fill w85"></div></div></div>
    </div>
  </section>

  <section id="du-an" class="section">
    <h2>Dự án tiêu biểu</h2>
    <div class="projects-grid">
      <article class="card"><h3>Sổ Chi Tiêu Mini</h3><p>Theo dõi thu chi hằng ngày với biểu đồ SVG trực quan.</p></article>
      <article class="card"><h3>Thư Viện Thẻ Flashcard</h3><p>Ôn tập từ vựng tiếng Anh có hiệu ứng lật 3D mượt mà.</p></article>
      <article class="card"><h3>Trang Quán Trà Sữa</h3><p>Thực đơn lọc theo danh mục và giỏ hàng tính tiền tự động.</p></article>
    </div>
  </section>

  <section id="lien-he" class="section">
    <h2>Liên hệ hợp tác</h2>
    <form id="contact-form" class="contact-form">
      <label for="sender-name">Họ và tên</label>
      <input id="sender-name" type="text" required placeholder="Nhập tên của bạn..." />
      <label for="sender-msg">Lời nhắn</label>
      <textarea id="sender-msg" rows="3" required placeholder="Nội dung trao đổi..."></textarea>
      <button type="submit" class="btn-primary">Gửi lời nhắn</button>
      <p id="form-status" class="status" role="status" aria-live="polite"></p>
    </form>
  </section>
</main>

<footer class="footer">© 2025 MinhAnh.dev — Thiết kế bằng HTML, CSS và JS thuần.</footer>`,
    cssCode: `/* Biến màu cho chế độ sáng và tối */
:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #475569;
  --border: #e2e8f0;
  --accent: #2563eb;
  --accent-text: #ffffff;
}
[data-theme="dark"] {
  --bg: #0b1120;
  --surface: #111827;
  --text: #f1f5f9;
  --muted: #94a3b8;
  --border: #1e293b;
  --accent: #60a5fa;
  --accent-text: #0b1120;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.topbar {
  max-width: 980px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}
.brand { font-weight: 800; font-size: 18px; color: var(--text); text-decoration: none; }
.nav { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
.nav a { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 600; min-height: 44px; display: inline-flex; align-items: center; }
.nav a:hover { color: var(--accent); }
.container { max-width: 980px; margin: 0 auto; padding: 28px 20px; }
.hero { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: center; padding: 20px 0 36px; }
.kicker { color: var(--accent); font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; }
h1 { font-size: clamp(26px, 4vw, 38px); line-height: 1.2; margin: 10px 0 12px; }
.lead { color: var(--muted); margin-bottom: 20px; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
.avatar-box { display: flex; justify-content: center; }
.btn-primary, .btn-outline {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.btn-primary { background: var(--accent); color: var(--accent-text); border: none; }
.btn-outline { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
.section { margin-top: 32px; }
.section h2 { font-size: 20px; margin-bottom: 14px; }
.skills-grid, .projects-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px; }
.card h3 { font-size: 16px; margin-bottom: 6px; }
.card p { font-size: 14px; color: var(--muted); }
.card span { float: right; font-size: 13px; color: var(--accent); font-weight: 700; }
.bar { height: 8px; background: var(--border); border-radius: 99px; margin-top: 10px; overflow: hidden; }
.fill { height: 100%; background: var(--accent); border-radius: 99px; }
.w95 { width: 95%; }
.w90 { width: 90%; }
.w85 { width: 85%; }
.contact-form { display: flex; flex-direction: column; gap: 10px; max-width: 520px; background: var(--surface); border: 1px solid var(--border); padding: 18px; border-radius: 14px; }
.contact-form label { font-size: 13px; font-weight: 600; }
.contact-form input, .contact-form textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  font-size: 15px;
}
.status { font-size: 13px; color: var(--accent); min-height: 20px; }
.footer { text-align: center; padding: 28px 16px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 40px; }
@media (max-width: 720px) {
  .hero, .skills-grid, .projects-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  body { transition: none; }
}`,
    jsCode: `// Lưu giao diện an toàn khi chạy trong iframe sandbox
let memoryTheme = 'light';
const toggleBtn = document.getElementById('theme-toggle');

function readSavedTheme() {
  try {
    return localStorage.getItem('portfolio_theme') || memoryTheme;
  } catch (err) {
    return memoryTheme;
  }
}

function writeSavedTheme(mode) {
  memoryTheme = mode;
  try {
    localStorage.setItem('portfolio_theme', mode);
  } catch (err) {
    // Bỏ qua lỗi quyền truy cập storage trong sandbox
  }
}

function applyTheme(mode) {
  const isDark = mode === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  toggleBtn.textContent = isDark ? '☀️ Giao diện sáng' : '🌙 Giao diện tối';
  toggleBtn.setAttribute('aria-pressed', String(isDark));
}

applyTheme(readSavedTheme());

toggleBtn.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  writeSavedTheme(next);
  applyTheme(next);
});

// Xử lý form liên hệ ngay trên trang
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('sender-name').value.trim();
  statusEl.textContent = 'Cảm ơn ' + name + '! Tin nhắn của bạn đã được ghi nhận.';
  form.reset();
});`,
  },
  {
    id: 'resume-cv',
    name: 'Hồ sơ xin việc (CV) in được',
    description: 'Bố cục CV 2 cột chuyên nghiệp có quy tắc @media print gọn gàng và nút xem trước bản in',
    badge: 'Trang web',
    category: 'Trang web',
    difficulty: 'Dễ',
    tags: ['cv', 'ho so', 'xin viec', 'print', 'css grid', 'hai cot'],
    learningPoints: [
      'Dựng bố cục 2 cột linh hoạt bằng CSS Grid và tự xếp chồng trên điện thoại',
      'Viết quy tắc @media print để ẩn thanh công cụ và tối ưu lề khi in giấy',
      'Tổ chức thông tin CV rõ ràng bằng danh sách ul và phân cấp chữ',
    ],
    relatedLessons: [
      { courseId: 'html', slug: 'danh-sach', title: 'Danh sách trong HTML' },
      { courseId: 'css', slug: 'css-grid-luoi-hai-chieu', title: 'CSS Grid: Lưới hai chiều' },
      { courseId: 'css', slug: 'thiet-ke-responsive-va-media-queries', title: 'Thiết kế Responsive & @media' },
    ],
    createdOrder: 6,
    iconKey: 'file',
    htmlCode: `<!-- Mẫu CV 2 cột hỗ trợ in trực tiếp -->
<div class="toolbar no-print">
  <span class="toolbar-title">Hồ sơ ứng viên chuẩn A4</span>
  <div class="toolbar-actions">
    <button type="button" id="preview-print-btn" class="btn-secondary">Xem dạng trang in</button>
    <button type="button" id="print-btn" class="btn-primary">In / Lưu PDF</button>
  </div>
</div>

<main class="sheet" id="cv-sheet">
  <aside class="sidebar">
    <div class="monogram" aria-hidden="true">TH</div>
    <h1>Trần Hoàng Nam</h1>
    <p class="role">Thực tập sinh Frontend Web</p>

    <section class="side-block">
      <h2>Liên hệ</h2>
      <ul>
        <li>Email: nam.tran@example.vn</li>
        <li>Điện thoại: 090 123 4567</li>
        <li>Địa chỉ: Quận Cầu Giấy, Hà Nội</li>
      </ul>
    </section>

    <section class="side-block">
      <h2>Kỹ năng</h2>
      <ul>
        <li>HTML5 chuẩn ngữ nghĩa</li>
        <li>CSS Flexbox, Grid, Responsive</li>
        <li>JavaScript DOM &amp; Fetch API</li>
        <li>Git &amp; làm việc nhóm</li>
      </ul>
    </section>

    <section class="side-block">
      <h2>Ngoại ngữ</h2>
      <ul>
        <li>Tiếng Anh: Đọc hiểu tài liệu kỹ thuật</li>
        <li>Tiếng Việt: Bản ngữ</li>
      </ul>
    </section>
  </aside>

  <div class="main-col">
    <section class="block">
      <h2>Mục tiêu nghề nghiệp</h2>
      <p>Mong muốn tham gia đội ngũ phát triển sản phẩm web để rèn luyện kỹ năng tối ưu giao diện, khả năng truy cập và trải nghiệm người dùng thực tế.</p>
    </section>

    <section class="block">
      <h2>Kinh nghiệm &amp; Dự án</h2>
      <article class="entry">
        <div class="entry-head">
          <h3>Trưởng nhóm giao diện — Dự án Lớp học Trực tuyến</h3>
          <span>09/2024 – Hiện tại</span>
        </div>
        <ul>
          <li>Thiết kế hệ thống bảng điểm và lịch học đáp ứng từ màn hình 360px đến máy tính.</li>
          <li>Giảm 35% thời gian thao tác nhờ bổ sung phím tắt và bộ lọc tìm kiếm tức thì.</li>
        </ul>
      </article>

      <article class="entry">
        <div class="entry-head">
          <h3>Cộng tác viên CLB Tin học Sinh viên</h3>
          <span>02/2024 – 08/2024</span>
        </div>
        <ul>
          <li>Hướng dẫn 40 sinh viên năm nhất làm quen HTML/CSS qua các bài tập trực quan.</li>
          <li>Xây dựng trang giới thiệu sự kiện câu lạc bộ thu hút hơn 500 lượt đăng ký.</li>
        </ul>
      </article>
    </section>

    <section class="block">
      <h2>Học vấn</h2>
      <div class="entry-head">
        <h3>Đại học Công nghệ — Ngành Công nghệ Thông tin</h3>
        <span>2022 – 2026</span>
      </div>
      <p>Điểm trung bình tích lũy: 3.55 / 4.0 • Học bổng Khuyến khích Học tập 2024.</p>
    </section>
  </div>
</main>
<p id="print-note" class="print-note no-print" role="status" aria-live="polite"></p>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #e2e8f0;
  color: #0f172a;
  padding: 20px 14px 36px;
  line-height: 1.55;
}
.toolbar {
  max-width: 860px;
  margin: 0 auto 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.toolbar-title { font-size: 14px; font-weight: 700; color: #1e293b; }
.toolbar-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.btn-primary, .btn-secondary {
  min-height: 44px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary { background: #1d4ed8; color: #ffffff; border: none; }
.btn-secondary { background: #f8fafc; color: #1e293b; border: 1px solid #cbd5e1; }
.sheet {
  max-width: 860px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
  display: grid;
  grid-template-columns: 270px 1fr;
}
.sheet.paper-flat { border-radius: 0; box-shadow: none; border: 1px solid #94a3b8; }
.sidebar { background: #1e293b; color: #f8fafc; padding: 26px 22px; }
.monogram {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 800;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}
.sidebar h1 { font-size: 22px; line-height: 1.25; }
.role { font-size: 13px; color: #93c5fd; font-weight: 600; margin-top: 4px; }
.side-block { margin-top: 22px; }
.side-block h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #93c5fd; margin-bottom: 8px; }
.side-block ul { list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #e2e8f0; }
.main-col { padding: 28px 26px; display: flex; flex-direction: column; gap: 22px; }
.block h2 {
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1d4ed8;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 6px;
  margin-bottom: 10px;
}
.block p { font-size: 14px; color: #334155; }
.entry { margin-bottom: 14px; break-inside: avoid; }
.entry-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; margin-bottom: 6px; }
.entry-head h3 { font-size: 15px; color: #0f172a; }
.entry-head span { font-size: 12px; font-weight: 600; color: #475569; }
.entry ul { padding-left: 18px; font-size: 14px; color: #334155; display: flex; flex-direction: column; gap: 4px; }
.print-note { max-width: 860px; margin: 10px auto 0; font-size: 13px; color: #1e293b; text-align: right; }
@media (max-width: 680px) {
  .sheet { grid-template-columns: 1fr; }
}
@media print {
  body { background: #ffffff; padding: 0; }
  .no-print { display: none; }
  .sheet { max-width: 100%; box-shadow: none; border-radius: 0; }
}`,
    jsCode: `// Hỗ trợ xem trước chế độ giấy in và gọi window.print an toàn
const sheet = document.getElementById('cv-sheet');
const previewBtn = document.getElementById('preview-print-btn');
const printBtn = document.getElementById('print-btn');
const noteEl = document.getElementById('print-note');

previewBtn.addEventListener('click', () => {
  const active = sheet.classList.toggle('paper-flat');
  previewBtn.textContent = active ? 'Thoát chế độ giấy in' : 'Xem dạng trang in';
});

printBtn.addEventListener('click', () => {
  try {
    window.print();
    noteEl.textContent = 'Đã mở hộp thoại in (hoặc nhấn Ctrl+P trên bàn phím).';
  } catch (err) {
    noteEl.textContent = 'Môi trường xem trước chặn lệnh in tự động; hãy dùng tổ hợp Ctrl+P.';
  }
});`,
  },
  {
    id: 'product-landing',
    name: 'Landing page sản phẩm',
    description: 'Trang giới thiệu sản phẩm phần mềm có bảng giá chuyển đổi tháng/năm, FAQ đóng mở và form đăng ký',
    badge: 'Trang web',
    category: 'Trang web',
    difficulty: 'Trung bình',
    tags: ['landing page', 'san pham', 'bang gia', 'faq', 'accordion', 'saas'],
    learningPoints: [
      'Cấu trúc trang bán hàng gồm Hero, Tính năng, Bảng giá và Hỏi đáp',
      'Cập nhật động mức giá theo chu kỳ Tháng / Năm bằng thuộc tính data-*',
      'Xây dựng mục Hỏi đáp (FAQ) đóng mở thân thiện bằng thuộc tính aria-expanded',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'css-grid-luoi-hai-chieu', title: 'CSS Grid: Lưới hai chiều' },
      { courseId: 'css', slug: 'mau-sac-va-nen-color-background', title: 'Màu sắc & Nền' },
      { courseId: 'js', slug: 'dom-chon-va-thay-doi-phan-tu', title: 'DOM: Chọn và thay đổi phần tử' },
    ],
    createdOrder: 7,
    iconKey: 'rocket',
    htmlCode: `<!-- Trang giới thiệu ứng dụng ghi chú SổTay Cloud -->
<header class="site-header">
  <span class="logo">SổTay Cloud</span>
  <a class="nav-cta" href="#dang-ky">Dùng thử miễn phí</a>
</header>

<main class="page">
  <section class="hero">
    <div class="hero-text">
      <span class="eyebrow">Quản lý học tập &amp; ghi chú</span>
      <h1>Ghi chú bài giảng, lên lịch ôn thi và tìm lại trong 1 giây.</h1>
      <p>Sắp xếp tài liệu theo môn học, gắn thẻ từ khóa thông minh và hoạt động ổn định ngay cả khi mất mạng.</p>
      <a class="primary-btn" href="#bang-gia">Xem bảng giá</a>
    </div>
    <div class="hero-visual" aria-hidden="true">
      <svg viewBox="0 0 320 220" width="320" height="220" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="304" height="204" rx="16" fill="#eff6ff" stroke="#bfdbfe" stroke-width="2" />
        <rect x="24" y="28" width="84" height="164" rx="10" fill="#ffffff" />
        <rect x="34" y="44" width="60" height="10" rx="5" fill="#2563eb" />
        <rect x="34" y="66" width="52" height="8" rx="4" fill="#cbd5e1" />
        <rect x="34" y="84" width="64" height="8" rx="4" fill="#cbd5e1" />
        <rect x="122" y="28" width="174" height="76" rx="10" fill="#ffffff" />
        <rect x="136" y="44" width="120" height="12" rx="6" fill="#1e293b" />
        <rect x="136" y="66" width="140" height="8" rx="4" fill="#94a3b8" />
        <rect x="122" y="116" width="174" height="76" rx="10" fill="#2563eb" />
        <rect x="136" y="134" width="96" height="10" rx="5" fill="#ffffff" />
        <rect x="136" y="154" width="132" height="8" rx="4" fill="#bfdbfe" />
      </svg>
    </div>
  </section>

  <section class="features">
    <article class="feat-card">
      <h2>01. Phân loại tự động</h2>
      <p>Gom ghi chú theo từng môn học và kỳ thi mà không cần tạo hàng chục thư mục phức tạp.</p>
    </article>
    <article class="feat-card">
      <h2>02. Nhắc lịch ôn tập</h2>
      <p>Gợi ý thời điểm xem lại kiến thức giúp nhớ lâu hơn trước mỗi kỳ kiểm tra.</p>
    </article>
    <article class="feat-card">
      <h2>03. Xuất bản in sạch sẽ</h2>
      <p>Chuyển ghi chú thành tài liệu gọn gàng để chia sẻ cùng bạn học chỉ với một cú nhấp.</p>
    </article>
  </section>

  <section id="bang-gia" class="pricing">
    <div class="pricing-head">
      <h2>Bảng giá minh bạch</h2>
      <div class="billing-toggle" role="group" aria-label="Chọn chu kỳ thanh toán">
        <button type="button" class="bill-btn active" data-cycle="monthly">Theo tháng</button>
        <button type="button" class="bill-btn" data-cycle="yearly">Theo năm (Tiết kiệm 20%)</button>
      </div>
    </div>

    <div class="price-grid">
      <div class="price-card">
        <h3>Cá nhân</h3>
        <p class="price" data-monthly="0đ" data-yearly="0đ">0đ</p>
        <p class="desc">Tối đa 200 ghi chú, tìm kiếm toàn văn bản.</p>
      </div>
      <div class="price-card featured">
        <h3>Sinh viên Pro</h3>
        <p class="price" data-monthly="49.000đ/tháng" data-yearly="470.000đ/năm">49.000đ/tháng</p>
        <p class="desc">Không giới hạn ghi chú, đính kèm sơ đồ SVG và đồng bộ 5 thiết bị.</p>
      </div>
    </div>
  </section>

  <section class="faq">
    <h2>Câu hỏi thường gặp</h2>
    <div class="faq-list">
      <div class="faq-item">
        <button type="button" class="faq-q" aria-expanded="false">Dữ liệu có mất khi hết hạn gói Pro không?</button>
        <div class="faq-a" hidden>Không. Toàn bộ ghi chú cũ vẫn được giữ nguyên và bạn luôn có thể xem hoặc tải xuống.</div>
      </div>
      <div class="faq-item">
        <button type="button" class="faq-q" aria-expanded="false">Có thể dùng chung ghi chú theo nhóm lớp không?</button>
        <div class="faq-a" hidden>Có, bạn có thể mời tối đa 10 thành viên cùng biên tập trong một sổ tay môn học.</div>
      </div>
    </div>
  </section>

  <section id="dang-ky" class="waitlist">
    <h2>Nhận tài khoản dùng thử 30 ngày</h2>
    <form id="waitlist-form" class="waitlist-form">
      <label class="sr-only" for="waitlist-email">Email của bạn</label>
      <input id="waitlist-email" type="email" required placeholder="nhapemail@example.vn" />
      <button type="submit" class="primary-btn">Đăng ký ngay</button>
    </form>
    <p id="waitlist-msg" class="form-msg" role="status" aria-live="polite"></p>
  </section>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #0f172a; line-height: 1.6; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
.site-header {
  max-width: 1020px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}
.logo { font-size: 18px; font-weight: 800; color: #1d4ed8; }
.nav-cta, .primary-btn {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.page { max-width: 1020px; margin: 0 auto; padding: 28px 20px 44px; }
.hero { display: grid; grid-template-columns: 1.2fr 1fr; gap: 28px; align-items: center; }
.eyebrow { color: #2563eb; font-size: 13px; font-weight: 700; text-transform: uppercase; }
.hero h1 { font-size: clamp(26px, 4vw, 40px); line-height: 1.2; margin: 8px 0 12px; }
.hero p { color: #475569; margin-bottom: 18px; }
.hero-visual { display: flex; justify-content: center; }
.hero-visual svg { max-width: 100%; height: auto; }
.features { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 36px; }
.feat-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; }
.feat-card h2 { font-size: 16px; margin-bottom: 6px; color: #1e293b; }
.feat-card p { font-size: 14px; color: #475569; }
.pricing { margin-top: 38px; }
.pricing-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.billing-toggle { display: inline-flex; background: #e2e8f0; padding: 4px; border-radius: 10px; gap: 4px; }
.bill-btn { min-height: 44px; padding: 6px 14px; border: none; border-radius: 8px; background: transparent; color: #334155; font-weight: 600; font-size: 13px; cursor: pointer; }
.bill-btn.active { background: #ffffff; color: #0f172a; }
.price-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.price-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
.price-card.featured { border: 2px solid #2563eb; }
.price { font-size: 26px; font-weight: 800; color: #1d4ed8; margin: 8px 0; }
.desc { font-size: 14px; color: #475569; }
.faq { margin-top: 38px; }
.faq h2 { margin-bottom: 12px; font-size: 20px; }
.faq-list { display: flex; flex-direction: column; gap: 10px; }
.faq-item { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.faq-q { width: 100%; min-height: 44px; padding: 12px 16px; text-align: left; background: none; border: none; font-size: 14px; font-weight: 700; color: #0f172a; cursor: pointer; }
.faq-a { padding: 0 16px 14px; font-size: 14px; color: #475569; }
.waitlist { margin-top: 38px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 22px; }
.waitlist-form { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.waitlist-form input { flex: 1 1 220px; min-height: 44px; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 15px; }
.form-msg { margin-top: 10px; font-size: 14px; color: #1d4ed8; font-weight: 600; min-height: 20px; }
@media (max-width: 720px) {
  .hero, .features, .price-grid { grid-template-columns: 1fr; }
}`,
    jsCode: `// Chuyển đổi bảng giá Tháng / Năm
const billButtons = document.querySelectorAll('.bill-btn');
const priceElements = document.querySelectorAll('.price');

billButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const cycle = btn.dataset.cycle;
    billButtons.forEach((b) => b.classList.toggle('active', b === btn));
    priceElements.forEach((el) => {
      el.textContent = cycle === 'yearly' ? el.dataset.yearly : el.dataset.monthly;
    });
  });
});

// Đóng mở danh sách FAQ
document.querySelectorAll('.faq-q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.nextElementSibling.hidden = expanded;
  });
});

// Xác thực đăng ký dùng thử ngay trên trang
const waitlistForm = document.getElementById('waitlist-form');
const waitlistMsg = document.getElementById('waitlist-msg');
waitlistForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('waitlist-email').value.trim();
  waitlistMsg.textContent = 'Đã gửi lời mời dùng thử tới ' + email + '.';
  waitlistForm.reset();
});`,
  },
  {
    id: 'personal-blog',
    name: 'Blog cá nhân 2 cột',
    description: 'Trang blog có danh sách bài viết, thanh bên thông tin tác giả, lọc theo chủ đề và đọc chi tiết tại chỗ',
    badge: 'Trang web',
    category: 'Trang web',
    difficulty: 'Trung bình',
    tags: ['blog', 'bai viet', 'hai cot', 'thanh ben', 'tim kiem', 'doc bao'],
    learningPoints: [
      'Thiết kế bố cục 2 cột gồm luồng bài viết chính và thanh bên aside',
      'Lọc mảng bài viết bằng filter theo từ khóa và thẻ chủ đề',
      'Hiển thị bài viết chi tiết trong hộp thoại đọc ngay trên trang',
    ],
    relatedLessons: [
      { courseId: 'html', slug: 'the-ngu-nghia-semantic', title: 'Khối và thẻ ngữ nghĩa' },
      { courseId: 'css', slug: 'display-va-position', title: 'Display & Position' },
      { courseId: 'js', slug: 'mang-array', title: 'Mảng (Array) trong JavaScript' },
    ],
    createdOrder: 8,
    iconKey: 'book',
    htmlCode: `<!-- Blog cá nhân 2 cột kèm hộp đọc bài chi tiết -->
<header class="blog-header">
  <h1>Nhật Ký Học Web</h1>
  <p>Ghi chép thực hành HTML, CSS, JavaScript và thiết kế giao diện.</p>
</header>

<div class="layout">
  <main class="feed">
    <div class="search-row">
      <label class="sr-only" for="blog-search">Tìm bài viết</label>
      <input id="blog-search" type="search" placeholder="Tìm theo tiêu đề hoặc chủ đề..." />
    </div>
    <div id="posts-container" class="posts"></div>
  </main>

  <aside class="sidebar">
    <section class="box">
      <h2>Về tác giả</h2>
      <p>Mình là Lan Chi, sinh viên năm ba chia sẻ các mẹo tự học lập trình web dễ hiểu.</p>
    </section>

    <section class="box">
      <h2>Chủ đề</h2>
      <div class="topic-list" id="topic-filters">
        <button type="button" class="topic-btn active" data-topic="Tất cả">Tất cả</button>
        <button type="button" class="topic-btn" data-topic="CSS">CSS</button>
        <button type="button" class="topic-btn" data-topic="JavaScript">JavaScript</button>
        <button type="button" class="topic-btn" data-topic="Kinh nghiệm">Kinh nghiệm</button>
      </div>
    </section>
  </aside>
</div>

<div id="reader-modal" class="reader-backdrop" hidden>
  <article class="reader-box" role="dialog" aria-modal="true" aria-labelledby="reader-title">
    <button type="button" id="close-reader" class="close-btn" aria-label="Đóng bài viết">✕ Đóng</button>
    <p id="reader-meta" class="meta"></p>
    <h2 id="reader-title"></h2>
    <p id="reader-body" class="reader-body"></p>
  </article>
</div>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #faf8f5; color: #1c1917; line-height: 1.65; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
.blog-header { max-width: 980px; margin: 0 auto; padding: 28px 20px 18px; border-bottom: 2px solid #e7e5e4; }
.blog-header h1 { font-family: Georgia, serif; font-size: clamp(26px, 4vw, 36px); }
.blog-header p { color: #57534e; margin-top: 4px; }
.layout { max-width: 980px; margin: 0 auto; padding: 24px 20px 44px; display: grid; grid-template-columns: 1.8fr 1fr; gap: 24px; align-items: start; }
.search-row input { width: 100%; min-height: 44px; padding: 10px 14px; border-radius: 10px; border: 1px solid #d6d3d1; background: #ffffff; font-size: 15px; margin-bottom: 16px; }
.posts { display: flex; flex-direction: column; gap: 14px; }
.post-card { background: #ffffff; border: 1px solid #e7e5e4; border-radius: 14px; padding: 18px; }
.meta { font-size: 12px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.04em; }
.post-card h2 { font-family: Georgia, serif; font-size: 20px; margin: 6px 0 8px; }
.post-card p { font-size: 14px; color: #57534e; margin-bottom: 12px; }
.read-btn { min-height: 44px; padding: 8px 14px; border-radius: 8px; background: #1c1917; color: #ffffff; border: none; font-size: 13px; font-weight: 600; cursor: pointer; }
.sidebar { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 16px; }
.box { background: #ffffff; border: 1px solid #e7e5e4; border-radius: 14px; padding: 16px; }
.box h2 { font-size: 15px; margin-bottom: 8px; }
.box p { font-size: 14px; color: #57534e; }
.topic-list { display: flex; flex-wrap: wrap; gap: 8px; }
.topic-btn { min-height: 44px; padding: 6px 12px; border-radius: 8px; border: 1px solid #d6d3d1; background: #fafaf9; color: #44403c; font-weight: 600; font-size: 13px; cursor: pointer; }
.topic-btn.active { background: #b45309; color: #ffffff; border-color: #b45309; }
.reader-backdrop { position: fixed; inset: 0; background: rgba(28, 25, 23, 0.55); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50; }
.reader-backdrop[hidden] { display: none; }
.reader-box { background: #ffffff; max-width: 620px; width: 100%; border-radius: 16px; padding: 24px; max-height: 85vh; overflow-y: auto; }
.reader-box h2 { font-family: Georgia, serif; font-size: 24px; margin: 8px 0 12px; }
.reader-body { font-size: 15px; color: #292524; }
.close-btn { float: right; min-height: 44px; padding: 6px 12px; border-radius: 8px; border: 1px solid #d6d3d1; background: #fafaf9; cursor: pointer; font-weight: 600; }
@media (max-width: 740px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
}`,
    jsCode: `// Dữ liệu bài viết mẫu và logic lọc + đọc bài tại chỗ
const posts = [
  {
    id: 1,
    topic: 'CSS',
    date: '12/05/2025',
    title: 'Hiểu nhanh CSS Grid qua 3 thuộc tính cốt lõi',
    excerpt: 'Chỉ cần grid-template-columns, gap và minmax để dựng lưới co giãn đẹp mắt.',
    body: 'CSS Grid giúp chia bố cục theo cả hàng và cột rất trực quan. Kết hợp repeat(auto-fit, minmax(240px, 1fr)) sẽ tạo ra lưới thẻ tự xuống dòng mượt mà mà không cần viết quá nhiều media query.'
  },
  {
    id: 2,
    topic: 'JavaScript',
    date: '08/05/2025',
    title: 'Tránh lỗi mất dữ liệu trong iframe sandbox',
    excerpt: 'Tại sao cần bọc thao tác bộ nhớ trình duyệt trong try/catch khi làm bài tập nhúng.',
    body: 'Khi trang web chạy trong iframe bảo mật không có allow-same-origin, truy cập bộ nhớ Web Storage của trình duyệt sẽ ném lỗi SecurityError. Việc bọc try/catch kèm biến lưu tạm trong bộ nhớ giúp ứng dụng chạy êm ái ở mọi nơi.'
  },
  {
    id: 3,
    topic: 'Kinh nghiệm',
    date: '01/05/2025',
    title: 'Ghi chép 5 thói quen giúp code HTML sạch hơn',
    excerpt: 'Dùng đúng thẻ heading theo thứ tự và đặt alt đầy đủ cho hình ảnh.',
    body: 'Viết mã HTML có cấu trúc rõ ràng không chỉ giúp trình đọc màn hình hiểu nội dung mà còn giúp bạn chỉnh sửa CSS nhanh hơn gấp đôi khi dự án lớn dần.'
  }
];

let activeTopic = 'Tất cả';
const container = document.getElementById('posts-container');
const searchInput = document.getElementById('blog-search');
const modal = document.getElementById('reader-modal');

function renderPosts() {
  const q = searchInput.value.trim().toLowerCase();
  const list = posts.filter((p) => {
    const matchTopic = activeTopic === 'Tất cả' || p.topic === activeTopic;
    const matchText = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
    return matchTopic && matchText;
  });

  if (list.length === 0) {
    container.innerHTML = '<div class="post-card"><p>Không có bài viết nào khớp từ khóa.</p></div>';
    return;
  }

  container.innerHTML = list.map((p) =>
    '<article class="post-card">' +
      '<p class="meta">' + p.topic + ' • ' + p.date + '</p>' +
      '<h2>' + p.title + '</h2>' +
      '<p>' + p.excerpt + '</p>' +
      '<button type="button" class="read-btn" data-id="' + p.id + '">Đọc tiếp</button>' +
    '</article>'
  ).join('');
}

document.getElementById('topic-filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.topic-btn');
  if (!btn) return;
  activeTopic = btn.dataset.topic;
  document.querySelectorAll('.topic-btn').forEach((b) => b.classList.toggle('active', b === btn));
  renderPosts();
});

searchInput.addEventListener('input', renderPosts);

container.addEventListener('click', (e) => {
  const btn = e.target.closest('.read-btn');
  if (!btn) return;
  const post = posts.find((p) => p.id === Number(btn.dataset.id));
  if (!post) return;
  document.getElementById('reader-meta').textContent = post.topic + ' • ' + post.date;
  document.getElementById('reader-title').textContent = post.title;
  document.getElementById('reader-body').textContent = post.body;
  modal.hidden = false;
});

document.getElementById('close-reader').addEventListener('click', () => { modal.hidden = true; });
modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

renderPosts();`,
  },
  {
    id: 'cafe-website',
    name: 'Trang quán cà phê',
    description: 'Trang giới thiệu quán cà phê với thực đơn lọc theo nhóm, bảng giờ mở cửa và bản đồ phố vẽ bằng SVG',
    badge: 'Trang web',
    category: 'Trang web',
    difficulty: 'Dễ',
    tags: ['ca phe', 'thuc don', 'bang gio', 'svg map', 'quan an'],
    learningPoints: [
      'Hiển thị thực đơn lọc theo loại đồ uống và tính tạm tính đơn giản',
      'Trình bày lịch giờ mở cửa bằng thẻ table chuẩn ngữ nghĩa',
      'Vẽ bản đồ chỉ đường đơn giản hoàn toàn bằng SVG nội tuyến',
    ],
    relatedLessons: [
      { courseId: 'html', slug: 'bang-du-lieu', title: 'Bảng dữ liệu (<table>)' },
      { courseId: 'css', slug: 'vien-bo-goc-va-do-bong', title: 'Viền, bo góc & Đổ bóng' },
      { courseId: 'js', slug: 'su-kien-event-listener', title: 'Sự kiện (addEventListener)' },
    ],
    createdOrder: 9,
    iconKey: 'coffee',
    htmlCode: `<!-- Trang quán Cà Phê Phố Cổ với thực đơn và bản đồ SVG -->
<header class="hero">
  <p class="badge">Rang xay thủ công mỗi sáng</p>
  <h1>Tiệm Cà Phê Phố Cổ</h1>
  <p class="subtitle">Hương vị cà phê phin truyền thống hòa quyện cùng bánh nướng ấm nóng.</p>
</header>

<main class="wrap">
  <section class="section">
    <div class="menu-head">
      <h2>Thực đơn hôm nay</h2>
      <div class="filters" role="group" aria-label="Lọc thực đơn">
        <button type="button" class="filter-btn active" data-cat="all">Tất cả</button>
        <button type="button" class="filter-btn" data-cat="coffee">Cà phê</button>
        <button type="button" class="filter-btn" data-cat="tea">Trà &amp; Bánh</button>
      </div>
    </div>

    <div id="menu-grid" class="menu-grid">
      <article class="item" data-cat="coffee"><h3>Cà phê sữa đá</h3><p>Đậm đà vị phin truyền thống.</p><strong>35.000đ</strong></article>
      <article class="item" data-cat="coffee"><h3>Bạc xỉu cốt dừa</h3><p>Béo ngậy sữa dừa và bọt cà phê.</p><strong>42.000đ</strong></article>
      <article class="item" data-cat="tea"><h3>Trà đào cam sả</h3><p>Thanh mát từ trà ô long và đào giòn.</p><strong>45.000đ</strong></article>
      <article class="item" data-cat="tea"><h3>Bánh sừng bò bơ</h3><p>Nướng mới mỗi giờ, vỏ giòn rụm.</p><strong>32.000đ</strong></article>
    </div>
  </section>

  <section class="two-col">
    <div class="panel">
      <h2>Giờ mở cửa</h2>
      <table class="hours-table">
        <thead><tr><th>Ngày</th><th>Khung giờ</th></tr></thead>
        <tbody>
          <tr><td>Thứ 2 – Thứ 6</td><td>07:00 – 22:00</td></tr>
          <tr><td>Thứ 7 – Chủ nhật</td><td>07:30 – 23:00</td></tr>
        </tbody>
      </table>
    </div>

    <div class="panel">
      <h2>Bản đồ vị trí</h2>
      <svg class="map-svg" viewBox="0 0 320 170" role="img" aria-label="Bản đồ minh họa ngã tư Hàng Bông và Lý Quốc Sư" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="170" rx="12" fill="#f5ebe0" />
        <rect x="0" y="72" width="320" height="24" fill="#d6ccc2" />
        <rect x="148" y="0" width="24" height="170" fill="#d6ccc2" />
        <text x="16" y="88" font-size="11" fill="#5c4033" font-weight="bold">Phố Hàng Bông</text>
        <circle cx="195" cy="54" r="14" fill="#c26d2d" />
        <circle cx="195" cy="54" r="5" fill="#ffffff" />
        <text x="214" y="58" font-size="11" fill="#2c1810" font-weight="bold">Tiệm Cà Phê</text>
      </svg>
      <p class="address">Số 18 Hàng Bông, Hoàn Kiếm • Có chỗ gửi xe miễn phí.</p>
    </div>
  </section>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #fdfaf6; color: #2c1810; line-height: 1.55; }
.hero { background: #2c1810; color: #fdfaf6; text-align: center; padding: 42px 20px; }
.badge { display: inline-block; padding: 4px 12px; border-radius: 99px; background: #c26d2d; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
.hero h1 { font-size: clamp(26px, 4vw, 38px); }
.subtitle { color: #e6ccb2; margin-top: 6px; font-size: 15px; }
.wrap { max-width: 960px; margin: 0 auto; padding: 28px 20px 40px; }
.menu-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-btn { min-height: 44px; padding: 8px 14px; border-radius: 8px; border: 1px solid #d6ccc2; background: #ffffff; color: #5c4033; font-weight: 600; cursor: pointer; }
.filter-btn.active { background: #c26d2d; color: #ffffff; border-color: #c26d2d; }
.menu-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.item { background: #ffffff; border: 1px solid #e6ccb2; border-radius: 14px; padding: 16px; box-shadow: 0 4px 12px rgba(44, 24, 16, 0.05); }
.item h3 { font-size: 16px; }
.item p { font-size: 13px; color: #6f4e37; margin: 4px 0 8px; }
.item strong { color: #9c4221; font-size: 15px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 28px; }
.panel { background: #ffffff; border: 1px solid #e6ccb2; border-radius: 14px; padding: 18px; }
.panel h2 { font-size: 17px; margin-bottom: 12px; }
.hours-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.hours-table th, .hours-table td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #f5ebe0; }
.map-svg { width: 100%; height: auto; display: block; border: 1px solid #e6ccb2; border-radius: 12px; }
.address { font-size: 13px; color: #6f4e37; margin-top: 8px; }
@media (max-width: 680px) {
  .menu-grid, .two-col { grid-template-columns: 1fr; }
}`,
    jsCode: `// Lọc món ăn và đồ uống theo danh mục
const filterButtons = document.querySelectorAll('.filter-btn');
const menuItems = document.querySelectorAll('.item');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const selected = btn.dataset.cat;
    filterButtons.forEach((b) => b.classList.toggle('active', b === btn));

    menuItems.forEach((card) => {
      const match = selected === 'all' || card.dataset.cat === selected;
      card.style.display = match ? 'block' : 'none';
    });
  });
});`,
  },
  {
    id: 'event-invite',
    name: 'Thiệp mời sự kiện & Đếm ngược',
    description: 'Thiệp mời trực tuyến có đồng hồ đếm ngược thời gian thực bằng JS, lịch trình và nút xác nhận tham dự',
    badge: 'Trang web',
    category: 'Trang web',
    difficulty: 'Trung bình',
    tags: ['thiep moi', 'su kien', 'dem nguoc', 'countdown', 'rsvp', 'setInterval'],
    learningPoints: [
      'Tính toán ngày, giờ, phút, giây còn lại từ đối tượng Date trong JS',
      'Cập nhật giao diện định kỳ mỗi giây với setInterval và tabular-nums',
      'Xây dựng biểu mẫu xác nhận tham dự (RSVP) phản hồi tức thì',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'hen-gio-va-go-loi-debugging', title: 'Hẹn giờ (setInterval)' },
      { courseId: 'html', slug: 'bieu-mau-form', title: 'Biểu mẫu (<form>)' },
      { courseId: 'css', slug: 'hieu-ung-transition-transform-animation', title: 'Chuyển động & Hiệu ứng' },
    ],
    createdOrder: 10,
    iconKey: 'calendar',
    htmlCode: `<!-- Thiệp mời Đêm Giao Lưu Lập Trình Trẻ -->
<main class="invite-card">
  <p class="kicker">Trân trọng kính mời</p>
  <h1>Đêm Giao Lưu Lập Trình Trẻ 2025</h1>
  <p class="venue">19:00 • Hội trường Sáng tạo Tầng 3 • Thứ Bảy tuần tới</p>

  <section class="countdown" aria-label="Thời gian còn lại đến sự kiện">
    <div class="unit"><span id="cd-days">00</span><small>Ngày</small></div>
    <div class="unit"><span id="cd-hours">00</span><small>Giờ</small></div>
    <div class="unit"><span id="cd-mins">00</span><small>Phút</small></div>
    <div class="unit"><span id="cd-secs">00</span><small>Giây</small></div>
  </section>

  <section class="schedule">
    <h2>Lịch trình chính</h2>
    <ul>
      <li><strong>19:00</strong> — Đón khách &amp; kết nối giao lưu</li>
      <li><strong>19:30</strong> — Trình diễn 5 sản phẩm web học sinh</li>
      <li><strong>20:30</strong> — Thảo luận hỏi đáp &amp; tiệc nhẹ</li>
    </ul>
  </section>

  <form id="rsvp-form" class="rsvp">
    <label for="guest-name">Tên người tham dự</label>
    <div class="rsvp-row">
      <input id="guest-name" type="text" required placeholder="Nhập họ tên của bạn..." />
      <button type="submit" class="btn-rsvp">Xác nhận tham dự</button>
    </div>
    <p id="rsvp-status" class="rsvp-status" role="status" aria-live="polite"></p>
  </form>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: linear-gradient(150deg, #064e3b, #022c22);
  color: #ecfdf5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 14px;
}
.invite-card {
  width: 100%;
  max-width: 580px;
  background: #ffffff;
  color: #064e3b;
  border-radius: 20px;
  padding: 28px 24px;
  border: 2px solid #fbbf24;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
}
.kicker { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #b45309; font-weight: 800; }
h1 { font-size: clamp(24px, 4vw, 32px); line-height: 1.25; margin: 6px 0 8px; }
.venue { font-size: 14px; color: #047857; font-weight: 600; margin-bottom: 20px; }
.countdown { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 22px; }
.unit { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px 6px; text-align: center; }
.unit span { display: block; font-size: 26px; font-weight: 800; font-variant-numeric: tabular-nums; color: #065f46; }
.unit small { font-size: 12px; color: #047857; font-weight: 600; }
.schedule { background: #f8fafc; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; }
.schedule h2 { font-size: 15px; margin-bottom: 8px; }
.schedule ul { list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: #334155; }
.rsvp label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; }
.rsvp-row { display: flex; flex-wrap: wrap; gap: 10px; }
.rsvp-row input { flex: 1 1 200px; min-height: 44px; padding: 10px 12px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 15px; }
.btn-rsvp { min-height: 44px; padding: 10px 18px; border-radius: 10px; border: none; background: #065f46; color: #ffffff; font-weight: 700; cursor: pointer; transition: transform 0.15s ease; }
.btn-rsvp:hover { transform: translateY(-1px); }
.rsvp-status { margin-top: 10px; font-size: 14px; font-weight: 600; color: #047857; min-height: 20px; }
@media (max-width: 480px) {
  .countdown { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .btn-rsvp { transition: none; }
}`,
    jsCode: `// Đặt mốc sự kiện cách hiện tại 7 ngày để đồng hồ luôn chạy thực tế
const targetTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
const elDays = document.getElementById('cd-days');
const elHours = document.getElementById('cd-hours');
const elMins = document.getElementById('cd-mins');
const elSecs = document.getElementById('cd-secs');

function pad2(num) {
  return String(Math.max(0, num)).padStart(2, '0');
}

function updateCountdown() {
  const diff = Math.max(0, targetTime - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  elDays.textContent = pad2(days);
  elHours.textContent = pad2(hours);
  elMins.textContent = pad2(mins);
  elSecs.textContent = pad2(secs);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Xác nhận tham dự (RSVP)
const rsvpForm = document.getElementById('rsvp-form');
const rsvpStatus = document.getElementById('rsvp-status');
rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const guest = document.getElementById('guest-name').value.trim();
  rsvpStatus.textContent = '✓ Đã giữ chỗ cho ' + guest + '. Hẹn gặp bạn tại sự kiện!';
  rsvpForm.reset();
});`,
  },
  {
    id: 'local-showcase',
    name: 'Trang giới thiệu địa phương',
    description: 'Cẩm nang du lịch địa phương với phong cảnh vẽ bằng SVG, mục đặc sản và lịch lễ hội theo mùa',
    badge: 'Trang web',
    category: 'Trang web',
    difficulty: 'Trung bình',
    tags: ['dia phuong', 'du lich', 'dac san', 'le hoi', 'svg', 'van hoa'],
    learningPoints: [
      'Kết hợp nhiều lớp hình học SVG tạo minh họa phong cảnh không cần ảnh ngoài',
      'Xây dựng lưới thẻ đặc sản thích ứng từ 1 cột đến 3 cột',
      'Chuyển đổi lịch lễ hội theo mùa bằng tab nút bấm có aria-pressed',
    ],
    relatedLessons: [
      { courseId: 'html', slug: 'the-ngu-nghia-semantic', title: 'Khối và thẻ ngữ nghĩa' },
      { courseId: 'css', slug: 'css-grid-luoi-hai-chieu', title: 'CSS Grid: Lưới hai chiều' },
      { courseId: 'css', slug: 'thiet-ke-responsive-va-media-queries', title: 'Thiết kế Responsive' },
    ],
    createdOrder: 11,
    iconKey: 'map',
    htmlCode: `<!-- Cẩm nang giới thiệu vùng đất Miền Di Sản Xanh -->
<header class="hero">
  <div class="hero-inner">
    <p class="eyebrow">Cẩm nang văn hóa &amp; du lịch</p>
    <h1>Khám phá Miền Di Sản Xanh</h1>
    <p>Nơi dòng sông ngọc bích uốn quanh dãy núi đá vôi và những lễ hội dân gian rực rỡ.</p>
  </div>
  <svg class="landscape" viewBox="0 0 800 220" role="img" aria-label="Minh họa núi đá vôi, mặt trời và dòng sông xanh" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="220" fill="#e0f2fe" />
    <circle cx="640" cy="64" r="34" fill="#fbbf24" />
    <polygon points="0,175 130,65 260,175" fill="#0f766e" />
    <polygon points="180,175 340,42 500,175" fill="#115e59" />
    <polygon points="410,175 565,78 730,175" fill="#0d9488" />
    <rect x="0" y="170" width="800" height="50" fill="#0284c7" />
    <path d="M90 192 Q210 184 330 192 T580 192" stroke="#bae6fd" stroke-width="3" fill="none" stroke-linecap="round" />
  </svg>
</header>

<main class="wrap">
  <section class="section">
    <h2>Đặc sản nổi bật</h2>
    <div class="grid-3">
      <article class="card"><h3>Cơm lam ống trúc</h3><p>Gạo nếp nương thơm dẻo nướng trên than hồng, chấm muối vừng.</p></article>
      <article class="card"><h3>Gốm men ngọc</h3><p>Sản phẩm thủ công nung ở nhiệt độ cao với họa tiết hoa sen.</p></article>
      <article class="card"><h3>Trà sơn mật</h3><p>Thức uống thảo mộc thanh mát hái từ sườn núi cao.</p></article>
    </div>
  </section>

  <section class="section">
    <div class="season-head">
      <h2>Lịch lễ hội theo mùa</h2>
      <div class="tabs" role="group" aria-label="Chọn mùa lễ hội">
        <button type="button" class="tab-btn active" data-season="spring" aria-pressed="true">Mùa Xuân</button>
        <button type="button" class="tab-btn" data-season="autumn" aria-pressed="false">Mùa Thu</button>
      </div>
    </div>
    <div id="festival-box" class="festival-box"></div>
  </section>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.6; }
.hero { background: #e0f2fe; border-bottom: 1px solid #bae6fd; }
.hero-inner { max-width: 960px; margin: 0 auto; padding: 28px 20px 10px; }
.eyebrow { color: #0f766e; font-size: 13px; font-weight: 800; text-transform: uppercase; }
.hero h1 { font-size: clamp(26px, 4vw, 38px); margin: 4px 0 8px; color: #0c4a6e; }
.hero p { color: #0369a1; max-width: 600px; }
.landscape { width: 100%; height: auto; display: block; max-height: 220px; }
.wrap { max-width: 960px; margin: 0 auto; padding: 28px 20px 44px; }
.section { margin-bottom: 28px; }
.section h2 { font-size: 20px; margin-bottom: 14px; color: #0f172a; }
.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; }
.card h3 { font-size: 16px; color: #0f766e; margin-bottom: 6px; }
.card p { font-size: 14px; color: #475569; }
.season-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.tabs { display: flex; gap: 8px; }
.tab-btn { min-height: 44px; padding: 8px 16px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; font-weight: 600; cursor: pointer; }
.tab-btn.active { background: #0f766e; color: #ffffff; border-color: #0f766e; }
.festival-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; display: grid; gap: 10px; }
.fest-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
.fest-row:last-child { border-bottom: none; padding-bottom: 0; }
@media (max-width: 680px) {
  .grid-3 { grid-template-columns: 1fr; }
}`,
    jsCode: `// Dữ liệu lễ hội theo mùa
const festivals = {
  spring: [
    { name: 'Lễ hội Đua thuyền Sông Ngọc', time: 'Tháng Giêng (Mùng 6 ÂL)' },
    { name: 'Phiên chợ Hoa Rừng &amp; Thổ cẩm', time: 'Tháng 2 Âm lịch' }
  ],
  autumn: [
    { name: 'Đêm Hội Đèn Lồng Bến Đò', time: 'Rằm tháng 8 Âm lịch' },
    { name: 'Ngày Hội Cốm Mới Làng Thượng', time: 'Tháng 9 Âm lịch' }
  ]
};

const box = document.getElementById('festival-box');
const tabButtons = document.querySelectorAll('.tab-btn');

function renderSeason(season) {
  const rows = festivals[season] || [];
  box.innerHTML = rows.map((f) =>
    '<div class="fest-row"><strong>' + f.name + '</strong><span>' + f.time + '</span></div>'
  ).join('');
}

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const season = btn.dataset.season;
    tabButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    renderSeason(season);
  });
});

renderSeason('spring');`,
  },
  {
    id: 'fun-404',
    name: 'Trang lỗi 404 vui nhộn',
    description: 'Trang báo lỗi 404 minh họa bằng SVG hành tinh với hộp tìm kiếm gợi ý và hiệu ứng chuyển động nhẹ',
    badge: 'Trang web',
    category: 'Trang web',
    difficulty: 'Dễ',
    tags: ['404', 'trang loi', 'svg', 'vui nhon', 'tim kiem', 'animation'],
    learningPoints: [
      'Thiết kế minh họa SVG sinh động kết hợp hoạt ảnh @keyframes nhẹ nhàng',
      'Tôn trọng tùy chọn prefers-reduced-motion của người dùng',
      'Gợi ý trang thay thế trực tiếp bằng JavaScript khi không tìm thấy đường dẫn',
    ],
    relatedLessons: [
      { courseId: 'html', slug: 'lien-ket-anchor', title: 'Liên kết trong HTML' },
      { courseId: 'css', slug: 'hieu-ung-transition-transform-animation', title: 'Chuyển động & @keyframes' },
      { courseId: 'js', slug: 'dom-chon-va-thay-doi-phan-tu', title: 'DOM: Chọn và thay đổi phần tử' },
    ],
    createdOrder: 12,
    iconKey: 'compass',
    htmlCode: `<!-- Trang 404 vui nhộn không điều hướng rời khung xem trước -->
<main class="scene">
  <div class="card">
    <svg class="planet" viewBox="0 0 220 150" role="img" aria-label="Hành tinh 404 ngoài không gian" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="30" r="3" fill="#fde047" />
      <circle cx="188" cy="24" r="4" fill="#38bdf8" />
      <circle cx="196" cy="116" r="2.5" fill="#f472b6" />
      <circle cx="110" cy="76" r="42" fill="#38bdf8" />
      <ellipse cx="110" cy="80" rx="76" ry="16" fill="none" stroke="#f472b6" stroke-width="5" />
      <circle cx="96" cy="70" r="5" fill="#0f172a" />
      <circle cx="124" cy="70" r="5" fill="#0f172a" />
      <path d="M98 92 Q110 83 122 92" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round" />
    </svg>

    <p class="code">404</p>
    <h1>Ối! Trang này đang bay lạc ngoài quỹ đạo</h1>
    <p class="desc">Liên kết bạn vừa tìm có thể đã đổi tên hoặc chưa được tạo. Thử tìm nhanh mục bạn cần bên dưới nhé.</p>

    <form id="search-404" class="search-box">
      <label class="sr-only" for="lost-query">Tìm trang trong website</label>
      <input id="lost-query" type="search" placeholder="Ví dụ: khóa học, bài tập, liên hệ..." />
      <button type="submit" class="btn-go">Tìm</button>
    </form>

    <p id="search-hint" class="hint" role="status" aria-live="polite"></p>

    <div class="actions">
      <button type="button" id="home-btn" class="btn-home">Quay lại điểm xuất phát</button>
    </div>
  </div>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  background: radial-gradient(circle at top, #1e1b4b, #0b1120);
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 14px;
}
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
.scene { width: 100%; max-width: 520px; }
.card {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #334155;
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
}
.planet { width: 200px; height: auto; margin-bottom: 6px; animation: bob 3.2s ease-in-out infinite; }
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}
.code { font-size: 52px; font-weight: 900; color: #38bdf8; line-height: 1; }
h1 { font-size: 22px; margin: 10px 0 8px; }
.desc { font-size: 14px; color: #cbd5e1; margin-bottom: 18px; }
.search-box { display: flex; flex-wrap: wrap; gap: 8px; }
.search-box input {
  flex: 1 1 200px;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #334155;
  background: #020617;
  color: #f8fafc;
  font-size: 15px;
}
.btn-go, .btn-home {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
}
.btn-go { background: #38bdf8; color: #082f49; }
.btn-home { background: #1e293b; color: #f8fafc; border: 1px solid #475569; width: 100%; }
.hint { margin-top: 12px; font-size: 13px; color: #7dd3fc; min-height: 20px; }
.actions { margin-top: 14px; }
@media (prefers-reduced-motion: reduce) {
  .planet { animation: none; }
}`,
    jsCode: `// Tìm gợi ý trang nội bộ thay cho chuyển hướng thật
const pages = ['Trang chủ', 'Khóa học HTML', 'Bài tập CSS Grid', 'Tài liệu JavaScript', 'Liên hệ'];
const form = document.getElementById('search-404');
const input = document.getElementById('lost-query');
const hint = document.getElementById('search-hint');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = input.value.trim().toLowerCase();
  if (!q) {
    hint.textContent = 'Hãy nhập từ khóa để tìm trang gợi ý.';
    return;
  }
  const found = pages.filter((p) => p.toLowerCase().includes(q));
  hint.textContent = found.length
    ? 'Gợi ý phù hợp: ' + found.join(', ')
    : 'Chưa thấy mục trùng khớp. Bạn có thể quay lại Trang chủ.';
});

document.getElementById('home-btn').addEventListener('click', () => {
  input.value = '';
  hint.textContent = 'Đã đưa bạn trở về điểm xuất phát an toàn!';
});`,
  },
];

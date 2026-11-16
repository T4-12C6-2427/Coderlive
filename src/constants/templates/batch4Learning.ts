import { CodeTemplate } from '../../types';

export const BATCH_4_TEMPLATES: CodeTemplate[] = [
  // =========================================================
  // HỌC TẬP (5 mẫu mới -> Tổng cộng 38 mẫu)
  // =========================================================
  {
    id: 'learn-flexbox-playground',
    name: 'Phòng thí nghiệm CSS Flexbox',
    description: 'Thực hành trực quan flex-direction, justify-content, align-items và gap kèm đoạn mã CSS tự động sinh theo lựa chọn',
    badge: 'Học tập',
    category: 'Học tập',
    difficulty: 'Dễ',
    tags: ['flexbox', 'css', 'bo cuc', 'hoc tap', 'thuc hanh'],
    learningPoints: [
      'Quan sát sự thay đổi trục chính và trục phụ khi đổi flex-direction',
      'Phân biệt tác dụng căn chỉnh của justify-content và align-items',
      'Đọc ngay đoạn mã CSS tương ứng để áp dụng vào bài tập của bạn',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'flexbox-bo-cuc-linh-hoat', title: 'Flexbox: Bố cục linh hoạt' },
      { courseId: 'js', slug: 'su-kien-event-listener', title: 'Sự kiện (addEventListener)' },
    ],
    createdOrder: 34,
    iconKey: 'book',
    htmlCode: `<!-- Trình thử nghiệm thuộc tính CSS Flexbox trực quan -->
<main class="lab">
  <h1>Phòng Thí Nghiệm Flexbox</h1>

  <section class="controls" aria-label="Bảng chọn thuộc tính Flexbox">
    <label>flex-direction
      <select id="f-dir">
        <option value="row">row (ngang)</option>
        <option value="row-reverse">row-reverse</option>
        <option value="column">column (dọc)</option>
      </select>
    </label>
    <label>justify-content
      <select id="f-just">
        <option value="flex-start">flex-start</option>
        <option value="center" selected>center</option>
        <option value="space-between">space-between</option>
        <option value="space-around">space-around</option>
      </select>
    </label>
    <label>align-items
      <select id="f-align">
        <option value="stretch">stretch</option>
        <option value="center" selected>center</option>
        <option value="flex-start">flex-start</option>
        <option value="flex-end">flex-end</option>
      </select>
    </label>
    <label>gap: <strong id="gap-val">12px</strong>
      <input id="f-gap" type="range" min="0" max="28" value="12" />
    </label>
  </section>

  <section id="flex-stage" class="stage" aria-label="Khung kết quả Flexbox">
    <div class="box b1">1</div>
    <div class="box b2">2</div>
    <div class="box b3">3</div>
    <div class="box b4">4</div>
  </section>

  <pre id="css-code" class="code-out" aria-label="Mã CSS tương ứng"></pre>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 20px 14px; }
.lab { max-width: 720px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
.lab h1 { font-size: 20px; margin-bottom: 14px; }
.controls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
.controls label { display: flex; flex-direction: column; gap: 5px; font-size: 13px; font-weight: 600; color: #334155; }
.controls select { min-height: 44px; padding: 8px 10px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; font-size: 14px; }
.controls input[type="range"] { min-height: 44px; accent-color: #2563eb; }
.stage { min-height: 200px; padding: 14px; border-radius: 14px; border: 2px dashed #93c5fd; background: #eff6ff; display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 14px; }
.box { min-width: 52px; min-height: 52px; padding: 12px 16px; border-radius: 10px; background: #2563eb; color: #ffffff; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.b2 { min-height: 70px; background: #0284c7; }
.b3 { background: #0d9488; }
.code-out { background: #0f172a; color: #e2e8f0; padding: 14px; border-radius: 12px; font-family: ui-monospace, monospace; font-size: 13px; line-height: 1.55; overflow-x: auto; }
@media (max-width: 560px) { .controls { grid-template-columns: 1fr; } }`,
    jsCode: `// Áp dụng lựa chọn Flexbox lên khung mẫu và in lại đoạn CSS
const stage = document.getElementById('flex-stage');
const dirEl = document.getElementById('f-dir');
const justEl = document.getElementById('f-just');
const alignEl = document.getElementById('f-align');
const gapEl = document.getElementById('f-gap');
const gapTxt = document.getElementById('gap-val');
const codeOut = document.getElementById('css-code');

function updateFlex() {
  const dir = dirEl.value;
  const just = justEl.value;
  const align = alignEl.value;
  const gap = gapEl.value + 'px';

  stage.style.flexDirection = dir;
  stage.style.justifyContent = just;
  stage.style.alignItems = align;
  stage.style.gap = gap;
  gapTxt.textContent = gap;

  codeOut.textContent =
    '.container {\\n' +
    '  display: flex;\\n' +
    '  flex-direction: ' + dir + ';\\n' +
    '  justify-content: ' + just + ';\\n' +
    '  align-items: ' + align + ';\\n' +
    '  gap: ' + gap + ';\\n' +
    '}';
}

[dirEl, justEl, alignEl, gapEl].forEach((el) => el.addEventListener('input', updateFlex));
updateFlex();`,
  },
  {
    id: 'learn-box-model',
    name: 'Minh họa Mô hình hộp (Box Model)',
    description: 'Kéo thanh trượt để quan sát trực tiếp vùng Margin, Border, Padding, Content và tổng kích thước chiếm chỗ',
    badge: 'Học tập',
    category: 'Học tập',
    difficulty: 'Dễ',
    tags: ['box model', 'margin', 'padding', 'border', 'css'],
    learningPoints: [
      'Hiểu rõ thứ tự 4 lớp đồng tâm từ trong ra ngoài: Content → Padding → Border → Margin',
      'Quan sát khoảng cách bên trong (padding) khác khoảng cách bên ngoài (margin)',
      'Tính tổng chiều rộng khối khi thay đổi padding và border',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'mo-hinh-hop-box-model', title: 'Mô hình hộp (Box Model)' },
      { courseId: 'css', slug: 'vien-bo-goc-va-do-bong', title: 'Viền & Bo góc' },
    ],
    createdOrder: 35,
    iconKey: 'layers',
    htmlCode: `<!-- Minh họa tương tác 4 lớp của CSS Box Model -->
<main class="bm-wrap">
  <h1>Mô Hình Hộp CSS (Box Model)</h1>
  <div class="sliders">
    <label>Margin (ngoài): <strong id="v-m">16px</strong>
      <input id="r-m" type="range" min="0" max="36" value="16" />
    </label>
    <label>Border (viền): <strong id="v-b">4px</strong>
      <input id="r-b" type="range" min="0" max="16" value="4" />
    </label>
    <label>Padding (đệm): <strong id="v-p">18px</strong>
      <input id="r-p" type="range" min="0" max="36" value="18" />
    </label>
  </div>

  <div class="stage">
    <div id="layer-margin" class="margin-zone">
      <span class="badge-lbl">margin</span>
      <div id="layer-box" class="border-box">
        <div class="content-box">Content (160×60)</div>
      </div>
    </div>
  </div>
  <p id="size-summary" class="summary" role="status"></p>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 20px 14px; }
.bm-wrap { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
.bm-wrap h1 { font-size: 20px; margin-bottom: 14px; }
.sliders { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.sliders label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; font-weight: 600; color: #334155; }
.sliders input { min-height: 40px; accent-color: #2563eb; }
.stage { background: #f1f5f9; border-radius: 14px; padding: 18px; display: flex; justify-content: center; overflow-x: auto; }
.margin-zone { position: relative; background: #fed7aa; border: 1px dashed #ea580c; border-radius: 10px; display: inline-block; }
.badge-lbl { position: absolute; top: 2px; left: 6px; font-size: 10px; font-weight: 700; color: #9a3412; text-transform: uppercase; }
.border-box { background: #bbf7d0; border-style: solid; border-color: #1d4ed8; border-radius: 8px; }
.content-box { width: 160px; height: 60px; background: #93c5fd; color: #0f172a; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
.summary { margin-top: 14px; text-align: center; font-size: 14px; font-weight: 600; color: #1e293b; }
@media (max-width: 560px) { .sliders { grid-template-columns: 1fr; } }`,
    jsCode: `// Cập nhật độ dày từng lớp Box Model theo thanh trượt
const rM = document.getElementById('r-m');
const rB = document.getElementById('r-b');
const rP = document.getElementById('r-p');
const marginZone = document.getElementById('layer-margin');
const boxEl = document.getElementById('layer-box');
const summaryEl = document.getElementById('size-summary');

function renderBox() {
  const m = Number(rM.value);
  const b = Number(rB.value);
  const p = Number(rP.value);
  document.getElementById('v-m').textContent = m + 'px';
  document.getElementById('v-b').textContent = b + 'px';
  document.getElementById('v-p').textContent = p + 'px';

  marginZone.style.padding = m + 'px';
  boxEl.style.borderWidth = b + 'px';
  boxEl.style.padding = p + 'px';

  const totalW = 160 + (p + b + m) * 2;
  const totalH = 60 + (p + b + m) * 2;
  summaryEl.textContent = 'Tổng không gian chiếm chỗ (tính cả margin): ' + totalW + 'px × ' + totalH + 'px';
}

[rM, rB, rP].forEach((el) => el.addEventListener('input', renderBox));
renderBox();`,
  },
  {
    id: 'learn-flashcards',
    name: 'Thẻ ghi nhớ từ vựng (Flashcards)',
    description: 'Bộ thẻ ôn tập thuật ngữ lập trình web lật hai mặt, đánh dấu Đã thuộc / Ôn lại và thanh tiến độ học tập',
    badge: 'Học tập',
    category: 'Học tập',
    difficulty: 'Dễ',
    tags: ['flashcard', 'tu vung', 'on tap', 'the ghi nho', 'hoc tap'],
    learningPoints: [
      'Thiết kế thẻ lật 2 mặt truy cập được bằng cả chuột, chạm và phím Space',
      'Theo dõi danh sách thẻ đã thuộc với Set và thanh tiến độ trực quan',
      'Lưu tiến trình học trong try/catch kèm dự phòng bộ nhớ cho iframe sandbox',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'doi-tuong-object', title: 'Đối tượng (Object)' },
      { courseId: 'css', slug: 'hieu-ung-transition-transform-animation', title: 'Hiệu ứng chuyển động' },
    ],
    createdOrder: 36,
    iconKey: 'book',
    htmlCode: `<!-- Ứng dụng Flashcards ôn thuật ngữ lập trình Web -->
<main class="fc-app">
  <header class="fc-head">
    <h1>Thẻ Ghi Nhớ Thuật Ngữ</h1>
    <span id="prog-text" class="badge">Đã thuộc 0/6</span>
  </header>

  <div class="progress-bar" aria-hidden="true"><div id="prog-fill" class="progress-fill"></div></div>

  <button type="button" id="flashcard" class="flashcard" aria-label="Nhấn để lật mặt thẻ">
    <div id="fc-side" class="fc-side">THUẬT NGỮ</div>
    <div id="fc-main" class="fc-main">Semantic HTML</div>
    <div class="fc-hint">Nhấn hoặc bấm phím Space để xem giải thích</div>
  </button>

  <div class="fc-actions">
    <button type="button" id="again-btn" class="btn warn">Ôn lại sau</button>
    <button type="button" id="known-btn" class="btn ok">✓ Đã thuộc thẻ này</button>
  </div>

  <div class="nav-row">
    <button type="button" id="prev-btn" class="nav-btn">← Trước</button>
    <span id="idx-label">1 / 6</span>
    <button type="button" id="next-btn" class="nav-btn">Sau →</button>
  </div>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #0f172a; padding: 24px 16px; }
.fc-app { max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px; }
.fc-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.fc-head h1 { font-size: 19px; }
.badge { padding: 4px 10px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; }
.progress-bar { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-bottom: 18px; }
.progress-fill { height: 100%; width: 0%; background: #16a34a; transition: width 0.25s; }
.flashcard { width: 100%; min-height: 200px; padding: 22px; border-radius: 16px; border: 2px solid #bfdbfe; background: #eff6ff; color: #0f172a; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center; margin-bottom: 14px; }
.flashcard.flipped { background: #fefce8; border-color: #fde047; }
.fc-side { font-size: 11px; font-weight: 800; letter-spacing: 0.06em; color: #1d4ed8; }
.flashcard.flipped .fc-side { color: #a16207; }
.fc-main { font-size: 20px; font-weight: 700; line-height: 1.45; }
.fc-hint { font-size: 12px; color: #64748b; margin-top: 6px; }
.fc-actions, .nav-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.fc-actions { margin-bottom: 12px; }
.btn, .nav-btn { min-height: 44px; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px; font-weight: 600; cursor: pointer; background: #ffffff; color: #0f172a; }
.btn { flex: 1; border: none; }
.btn.warn { background: #fef3c7; color: #92400e; }
.btn.ok { background: #16a34a; color: #ffffff; }
#idx-label { font-size: 13px; font-weight: 700; color: #475569; }`,
    jsCode: `// Bộ 6 thẻ thuật ngữ kèm lưu trạng thái đã thuộc an toàn
const CARDS = [
  { id: 'c1', term: 'Semantic HTML', def: 'Dùng thẻ đúng ngữ nghĩa như <header>, <main>, <article> để trình đọc màn hình và máy tìm kiếm hiểu rõ.' },
  { id: 'c2', term: 'Box-sizing: border-box', def: 'Tính padding và border nằm gọn bên trong width/height đã khai báo, tránh tràn bố cục.' },
  { id: 'c3', term: 'Event Delegation', def: 'Gắn một listener ở thẻ cha để xử lý sự kiện cho nhiều phần tử con qua e.target.closest().' },
  { id: 'c4', term: 'prefers-reduced-motion', def: 'Media query giúp tắt hoặc giảm bớt hiệu ứng chuyển động cho người nhạy cảm.' },
  { id: 'c5', term: 'DOMContentLoaded', def: 'Sự kiện phát ra ngay khi trình duyệt đã phân tích xong toàn bộ cây HTML.' },
  { id: 'c6', term: 'viewport', def: 'Thẻ meta giúp trang web hiển thị đúng tỷ lệ trên màn hình điện thoại.' }
];

let idx = 0, flipped = false, memKnown = [];
function loadKnown() {
  try { return new Set(JSON.parse(localStorage.getItem('fc_known') || '[]')); } catch (e) { return new Set(memKnown); }
}
function saveKnown(set) {
  memKnown = Array.from(set);
  try { localStorage.setItem('fc_known', JSON.stringify(memKnown)); } catch (e) {}
}

const known = loadKnown();
const cardEl = document.getElementById('flashcard');

function render() {
  const c = CARDS[idx];
  cardEl.classList.toggle('flipped', flipped);
  document.getElementById('fc-side').textContent = flipped ? 'GIẢI THÍCH' : 'THUẬT NGỮ';
  document.getElementById('fc-main').textContent = flipped ? c.def : c.term;
  document.getElementById('idx-label').textContent = (idx + 1) + ' / ' + CARDS.length;
  document.getElementById('prog-text').textContent = 'Đã thuộc ' + known.size + '/' + CARDS.length;
  document.getElementById('prog-fill').style.width = Math.round((known.size / CARDS.length) * 100) + '%';
}

function flip() { flipped = !flipped; render(); }
function go(step) { idx = (idx + step + CARDS.length) % CARDS.length; flipped = false; render(); }

cardEl.addEventListener('click', flip);
document.getElementById('prev-btn').addEventListener('click', () => go(-1));
document.getElementById('next-btn').addEventListener('click', () => go(1));
document.getElementById('known-btn').addEventListener('click', () => { known.add(CARDS[idx].id); saveKnown(known); go(1); });
document.getElementById('again-btn').addEventListener('click', () => { known.delete(CARDS[idx].id); saveKnown(known); go(1); });
render();`,
  },
  {
    id: 'learn-quiz-builder',
    name: 'Trắc nghiệm kiến thức Web có giải thích',
    description: 'Bộ câu hỏi trắc nghiệm HTML, CSS và JavaScript chấm điểm tức thì, kèm giải thích chi tiết từng đáp án',
    badge: 'Học tập',
    category: 'Học tập',
    difficulty: 'Trung bình',
    tags: ['trac nghiem', 'quiz', 'on thi', 'giai thich', 'hoc tap'],
    learningPoints: [
      'Hiển thị câu hỏi tuần tự từ mảng dữ liệu đối tượng và khóa nút sau khi chọn',
      'Hiện khung giải thích lý do đúng/sai ngay sau mỗi lựa chọn của người học',
      'Tổng hợp điểm số cuối bài và cho phép làm lại nhanh chóng',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'mang-array', title: 'Mảng đối tượng câu hỏi' },
      { courseId: 'js', slug: 'dom-chon-va-thay-doi-phan-tu', title: 'Cập nhật DOM động' },
    ],
    createdOrder: 37,
    iconKey: 'check',
    htmlCode: `<!-- Ứng dụng Trắc nghiệm 5 câu hỏi kiến thức Web -->
<main class="quiz-box">
  <header class="q-top">
    <h1>Kiểm Tra Nhanh HTML/CSS/JS</h1>
    <span id="q-progress">Câu 1/5</span>
  </header>

  <section id="quiz-body">
    <h2 id="q-title" class="q-title"></h2>
    <div id="q-options" class="options"></div>
    <div id="q-explain" class="explain" hidden></div>
    <button type="button" id="next-q" class="next-btn" hidden>Câu tiếp theo →</button>
  </section>

  <section id="quiz-result" class="result" hidden>
    <h2 id="res-score"></h2>
    <p id="res-note"></p>
    <button type="button" id="retry-quiz" class="next-btn">Làm lại bài thi</button>
  </section>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 24px 16px; }
.quiz-box { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; }
.q-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
.q-top h1 { font-size: 18px; }
#q-progress { font-size: 13px; font-weight: 700; color: #1d4ed8; }
.q-title { font-size: 17px; line-height: 1.5; margin-bottom: 14px; }
.options { display: flex; flex-direction: column; gap: 10px; }
.opt-btn { width: 100%; min-height: 46px; padding: 10px 14px; text-align: left; border-radius: 12px; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; font-size: 14px; font-weight: 500; cursor: pointer; }
.opt-btn.correct { background: #dcfce7; border-color: #16a34a; color: #14532d; font-weight: 700; }
.opt-btn.wrong { background: #fee2e2; border-color: #dc2626; color: #7f1d1d; }
.explain { margin-top: 14px; padding: 12px 14px; border-radius: 12px; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 13px; color: #1e3a8a; line-height: 1.55; }
.next-btn { width: 100%; min-height: 44px; margin-top: 14px; border-radius: 12px; border: none; background: #2563eb; color: #ffffff; font-size: 14px; font-weight: 700; cursor: pointer; }
.result { text-align: center; padding: 12px 0; }
.result h2 { font-size: 24px; color: #1d4ed8; margin-bottom: 8px; }
.result p { font-size: 14px; color: #475569; }`,
    jsCode: `// Dữ liệu câu hỏi trắc nghiệm kèm lời giải thích
const QUESTIONS = [
  {
    q: 'Thẻ HTML nào dùng để đánh dấu nội dung chính duy nhất của trang web?',
    opts: ['<div>', '<main>', '<section>', '<aside>'],
    ans: 1,
    exp: 'Thẻ <main> đại diện cho nội dung trọng tâm duy nhất của tài liệu, giúp trình đọc màn hình nhảy thẳng tới nội dung.'
  },
  {
    q: 'Thuộc tính CSS nào giúp khoảng đệm padding nằm gọn bên trong chiều rộng width?',
    opts: ['display: flex', 'box-sizing: border-box', 'overflow: hidden', 'position: relative'],
    ans: 1,
    exp: 'box-sizing: border-box tính kích thước width/height bao gồm luôn cả padding và border.'
  },
  {
    q: 'Trong Flexbox, thuộc tính nào căn các phần tử con dọc theo trục chính (main axis)?',
    opts: ['align-items', 'justify-content', 'flex-wrap', 'order'],
    ans: 1,
    exp: 'justify-content điều chỉnh phân bố theo trục chính, còn align-items căn theo trục phụ.'
  },
  {
    q: 'Cách an toàn nhất khi đọc bộ nhớ trình duyệt (Web Storage) bên trong iframe sandbox là gì?',
    opts: ['Gọi trực tiếp không cần kiểm tra', 'Bọc trong try/catch kèm biến lưu tạm', 'Dùng document.write', 'Dùng hộp thoại chặn trang để báo'],
    ans: 1,
    exp: 'Khi iframe không có allow-same-origin, truy cập bộ nhớ Web Storage sẽ ném lỗi bảo mật nên cần bọc trong try/catch.'
  },
  {
    q: 'Phương thức nào biến một mảng thành mảng mới sau khi lọc theo điều kiện?',
    opts: ['array.push()', 'array.filter()', 'array.pop()', 'array.join()'],
    ans: 1,
    exp: 'filter() trả về một mảng mới chứa các phần tử thỏa mãn hàm kiểm tra trả về true.'
  }
];

let index = 0, score = 0, answered = false;
const bodyEl = document.getElementById('quiz-body');
const resEl = document.getElementById('quiz-result');
const optsEl = document.getElementById('q-options');
const expEl = document.getElementById('q-explain');
const nextBtn = document.getElementById('next-q');

function showQuestion() {
  answered = false;
  const item = QUESTIONS[index];
  document.getElementById('q-progress').textContent = 'Câu ' + (index + 1) + '/' + QUESTIONS.length;
  document.getElementById('q-title').textContent = item.q;
  expEl.hidden = true;
  nextBtn.hidden = true;
  optsEl.innerHTML = item.opts.map((text, i) =>
    '<button type="button" class="opt-btn" data-i="' + i + '">' + text + '</button>'
  ).join('');
}

optsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.opt-btn');
  if (!btn || answered) return;
  answered = true;
  const pick = Number(btn.dataset.i);
  const item = QUESTIONS[index];
  if (pick === item.ans) score++;
  optsEl.querySelectorAll('.opt-btn').forEach((b, i) => {
    if (i === item.ans) b.classList.add('correct');
    else if (i === pick) b.classList.add('wrong');
    b.disabled = true;
  });
  expEl.textContent = (pick === item.ans ? '✓ Chính xác! ' : '✕ Chưa đúng. ') + item.exp;
  expEl.hidden = false;
  nextBtn.textContent = index === QUESTIONS.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →';
  nextBtn.hidden = false;
});

nextBtn.addEventListener('click', () => {
  index++;
  if (index >= QUESTIONS.length) {
    bodyEl.hidden = true;
    resEl.hidden = false;
    document.getElementById('res-score').textContent = 'Bạn đạt ' + score + ' / ' + QUESTIONS.length + ' câu đúng!';
    document.getElementById('res-note').textContent = score >= 4 ? 'Kiến thức nền tảng của bạn rất vững!' : 'Hãy xem lại phần giải thích và thử lại nhé.';
  } else {
    showQuestion();
  }
});

document.getElementById('retry-quiz').addEventListener('click', () => {
  index = 0; score = 0; bodyEl.hidden = false; resEl.hidden = true; showQuestion();
});
showQuestion();`,
  },
  {
    id: 'learn-html-cheatsheet',
    name: 'Bảng tra cứu thẻ HTML5 thuần túy',
    description: 'Tài liệu bỏ túi các thẻ HTML cốt lõi gồm bảng ngữ nghĩa, phím tắt <kbd> và ví dụ <figure> viết hoàn toàn bằng HTML',
    badge: 'Học tập',
    category: 'Học tập',
    difficulty: 'Dễ',
    tags: ['html thuan', 'cheatsheet', 'tra cuu', 'table', 'hoc tap'],
    learningPoints: [
      'Ghi nhớ nhóm thẻ cấu trúc, văn bản, bảng biểu và biểu mẫu trong HTML5',
      'Sử dụng cặp thẻ <figure> và <figcaption> để chú thích sơ đồ',
      'Trình bày bảng tra cứu rõ ràng bằng <table>, <thead>, <tbody> và <code>',
    ],
    relatedLessons: [
      { courseId: 'html', slug: 'bang-du-lieu', title: 'Bảng dữ liệu (<table>)' },
      { courseId: 'html', slug: 'cau-truc-html-co-ban', title: 'Cấu trúc một trang HTML' },
    ],
    createdOrder: 38,
    iconKey: 'file',
    htmlCode: `<!-- Tài liệu tra cứu nhanh thẻ HTML5 (Chỉ dùng HTML, 0 dòng CSS/JS) -->
<main>
  <header>
    <h1>Bảng Tra Cứu Thẻ HTML5 Cốt Lõi</h1>
    <p>Gợi ý học nhanh: nhấn <kbd>Ctrl</kbd> + <kbd>Enter</kbd> bất cứ lúc nào để chạy lại xem trước.</p>
  </header>

  <section aria-label="Bảng các thẻ thường dùng">
    <h2>1. Các thẻ cần nhớ ngay</h2>
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>Thẻ HTML</th>
          <th>Ý nghĩa</th>
          <th>Ví dụ dùng</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>&lt;header&gt;</code>, <code>&lt;main&gt;</code></td>
          <td>Chia phần đầu và nội dung chính</td>
          <td>Đặt phần điều hướng đầu trang vào <code>&lt;header&gt;</code></td>
        </tr>
        <tr>
          <td><code>&lt;a href="..."&gt;</code></td>
          <td>Tạo liên kết hoặc cuộn tới mục</td>
          <td><code>&lt;a href="#ket-luan"&gt;Đi tới kết luận&lt;/a&gt;</code></td>
        </tr>
        <tr>
          <td><code>&lt;ul&gt;</code> / <code>&lt;ol&gt;</code></td>
          <td>Danh sách không thứ tự / có số</td>
          <td>Liệt kê các bước thực hành</td>
        </tr>
        <tr>
          <td><code>&lt;form&gt;</code> &amp; <code>&lt;label&gt;</code></td>
          <td>Thu thập dữ liệu biểu mẫu</td>
          <td>Luôn gắn <code>for="..."</code> khớp <code>id</code> của ô nhập</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section id="ket-luan" aria-label="Ví dụ sơ đồ minh họa">
    <h2>2. Minh họa thẻ &lt;figure&gt; với đồ họa SVG</h2>
    <figure>
      <svg width="280" height="72" viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sơ đồ 3 bước học Web: HTML, CSS, JS">
        <rect x="4" y="10" width="80" height="48" rx="8" fill="#fef2f2" stroke="#dc2626" />
        <text x="44" y="39" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#991b1b">1. HTML</text>
        <rect x="100" y="10" width="80" height="48" rx="8" fill="#eff6ff" stroke="#2563eb" />
        <text x="140" y="39" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#1e40af">2. CSS</text>
        <rect x="196" y="10" width="80" height="48" rx="8" fill="#fefce8" stroke="#ca8a04" />
        <text x="236" y="39" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#854d0e">3. JS</text>
      </svg>
      <figcaption><small>Hình 1: Thứ tự 3 lớp công nghệ nền tảng của trang web.</small></figcaption>
    </figure>
  </section>
</main>`,
    cssCode: '',
    jsCode: '',
  },
];

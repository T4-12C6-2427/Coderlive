import { CodeTemplate, TemplateCategory } from '../types';
import { BATCH_1_WEBSITE_TEMPLATES } from './templates/batch1Websites';
import { BATCH_2_TEMPLATES } from './templates/batch2ComponentsAndApps';
import { BATCH_3_TEMPLATES } from './templates/batch3GamesAndEffects';
import { BATCH_4_TEMPLATES } from './templates/batch4Learning';

export const TEMPLATE_CATEGORIES: ReadonlyArray<'Tất cả' | TemplateCategory> = [
  'Tất cả',
  'Trang web',
  'Thành phần giao diện',
  'Ứng dụng nhỏ',
  'Trò chơi',
  'Hiệu ứng & Canvas',
  'Học tập',
];

export const DEFAULT_HTML_PART = `<div class="card">
  <div class="badge">🚀 Coderlive Web Studio</div>
  <h1>Chào mừng bạn đến với Coderlive!</h1>
  <p>Chỉnh sửa các tab HTML, CSS và JavaScript riêng biệt ở bên trái. Bạn sẽ thấy kết quả thay đổi tức thì tại đây!</p>
  
  <div class="btn-group">
    <button id="counter-btn">✨ Nhấp vào tôi (<span id="count">0</span>)</button>
    <button class="secondary-btn" id="color-btn">🎨 Đổi màu nền</button>
  </div>

  <div id="message-box"></div>

  <div class="stats">
    <div>Độ trễ<span>Tức thì</span></div>
    <div>Trạng thái<span>Hoạt động</span></div>
    <div>Chế độ<span>3 Tabs</span></div>
  </div>
</div>`;

export const DEFAULT_CSS_PART = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%);
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  transition: background 0.5s ease;
}

.card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 40px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  text-align: center;
  animation: floatIn 0.8s ease-out;
}

@keyframes floatIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 9999px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
  text-transform: uppercase;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.3;
  background: linear-gradient(to right, #ffffff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #94a3b8;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 28px;
}

.btn-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);
}

button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

button:active {
  transform: translateY(0);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  box-shadow: none;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  box-shadow: none;
}

.stats {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-around;
  font-size: 14px;
}

.stats div {
  color: #64748b;
}

.stats span {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #38bdf8;
  margin-top: 4px;
}

#message-box {
  margin-top: 16px;
  font-size: 14px;
  color: #34d399;
  min-height: 20px;
  transition: all 0.3s;
}`;

export const DEFAULT_JS_PART = `// Logic tương tác JavaScript
let count = 0;
const countDisplay = document.getElementById('count');
const counterBtn = document.getElementById('counter-btn');
const colorBtn = document.getElementById('color-btn');
const msgBox = document.getElementById('message-box');

counterBtn.addEventListener('click', () => {
  count++;
  countDisplay.textContent = count;
  msgBox.textContent = 'Tuyệt vời! Bạn đã nhấp lần thứ ' + count;
  console.log('Nút được nhấn! Giá trị đếm hiện tại: ' + count);
});

const gradients = [
  'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
  'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
  'linear-gradient(135deg, #831843 0%, #701a75 50%, #4c1d95 100%)',
  'linear-gradient(135deg, #1e3a8a 0%, #0e7490 50%, #0f766e 100%)'
];
let gradIndex = 0;

colorBtn.addEventListener('click', () => {
  gradIndex = (gradIndex + 1) % gradients.length;
  document.body.style.background = gradients[gradIndex];
  console.log('Đã đổi màu nền sang kiểu số ' + (gradIndex + 1));
});

console.log('Trang web Coderlive đã tải thành công với 3 tab riêng biệt!');`;

const CORE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'welcome',
    name: 'Trang Chào Mừng',
    description: 'Thẻ Glassmorphism hiện đại với các hiệu ứng tương tác màu sắc và đếm số',
    badge: 'Mặc định',
    category: 'Thành phần giao diện',
    difficulty: 'Dễ',
    tags: ['glassmorphism', 'the', 'mac dinh', 'chao mung', 'dem so'],
    learningPoints: [
      'Tạo hiệu ứng kính mờ hiện đại bằng backdrop-filter và gradient',
      'Lắng nghe sự kiện click để cập nhật số đếm và màu nền',
      'Kết hợp mượt mà giữa 3 tab HTML, CSS và JavaScript',
    ],
    relatedLessons: [
      { courseId: 'html', slug: 'css-va-javascript-co-ban', title: 'Thêm CSS & JavaScript cơ bản' },
      { courseId: 'css', slug: 'mau-sac-va-nen-color-background', title: 'Màu sắc & Dải màu Gradient' },
      { courseId: 'js', slug: 'su-kien-event-listener', title: 'Sự kiện (addEventListener)' },
    ],
    createdOrder: 1,
    iconKey: 'sparkles',
    htmlCode: DEFAULT_HTML_PART,
    cssCode: DEFAULT_CSS_PART,
    jsCode: DEFAULT_JS_PART,
  },
  {
    id: 'todo',
    name: 'Ứng dụng To-Do List',
    description: 'Ứng dụng quản lý công việc có thể thêm, đánh dấu hoàn thành và xóa',
    badge: 'Ứng dụng',
    category: 'Ứng dụng nhỏ',
    difficulty: 'Trung bình',
    tags: ['todo', 'cong viec', 'danh sach', 'ung dung', 'crud'],
    learningPoints: [
      'Quản lý mảng dữ liệu công việc và vẽ lại danh sách DOM',
      'Ủy quyền sự kiện (Event Delegation) trên thẻ ul để đánh dấu và xóa',
      'Lọc công việc còn lại và dọn dẹp mục đã hoàn thành',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'du-an-nho-todo-list', title: 'Dự án nhỏ: Danh sách việc cần làm' },
      { courseId: 'js', slug: 'mang-array', title: 'Mảng (Array) & filter' },
      { courseId: 'css', slug: 'flexbox-bo-cuc-linh-hoat', title: 'Flexbox: Bố cục linh hoạt' },
    ],
    createdOrder: 2,
    iconKey: 'check',
    htmlCode: `<div class="todo-app">
  <h2>📝 Công Việc Cần Làm</h2>
  <p class="sub">Nhập công việc và nhấn Thêm để lưu lại</p>
  
  <div class="input-box">
    <input type="text" id="task-input" placeholder="Ví dụ: Thiết kế giao diện Coderlive..." />
    <button class="add-btn" id="add-btn">Thêm</button>
  </div>

  <ul id="task-list"></ul>

  <div class="footer">
    <span id="remaining-count">0 việc còn lại</span>
    <span style="color: #38bdf8; cursor: pointer;" id="clear-done">Xóa đã xong</span>
  </div>
</div>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; justify-content: center; padding: 40px 16px; }
.todo-app { width: 100%; max-width: 440px; background: #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); height: fit-content; }
h2 { font-size: 22px; margin-bottom: 6px; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
p.sub { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
.input-box { display: flex; gap: 8px; margin-bottom: 20px; }
input[type="text"] { flex: 1; padding: 12px 16px; border-radius: 10px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 14px; outline: none; }
input[type="text"]:focus { border-color: #38bdf8; }
button.add-btn { background: #0284c7; color: white; border: none; padding: 0 18px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
button.add-btn:hover { background: #0369a1; }
ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
li { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #334155; border-radius: 10px; transition: 0.2s; }
li.completed span { text-decoration: line-through; color: #94a3b8; }
.task-left { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.task-left input { cursor: pointer; width: 16px; height: 16px; accent-color: #38bdf8; }
.del-btn { background: none; border: none; color: #f87171; cursor: pointer; font-size: 16px; opacity: 0.7; padding: 4px; }
.del-btn:hover { opacity: 1; transform: scale(1.1); }
.footer { margin-top: 20px; padding-top: 14px; border-top: 1px solid #334155; font-size: 13px; color: #94a3b8; display: flex; justify-content: space-between; }`,
    jsCode: `let tasks = [
  { id: 1, text: 'Học cú pháp HTML & CSS hiện đại', done: true },
  { id: 2, text: 'Thử nghiệm chia 3 tab trong Coderlive', done: false },
  { id: 3, text: 'Tạo ứng dụng web tương tác', done: false }
];

const listEl = document.getElementById('task-list');
const inputEl = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const remainingEl = document.getElementById('remaining-count');
const clearDoneBtn = document.getElementById('clear-done');

function render() {
  listEl.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    if (task.done) li.classList.add('completed');
    li.innerHTML = \`
      <div class="task-left">
        <input type="checkbox" \${task.done ? 'checked' : ''} data-id="\${task.id}" />
        <span>\${task.text}</span>
      </div>
      <button class="del-btn" data-id="\${task.id}">✕</button>
    \`;
    listEl.appendChild(li);
  });

  const remaining = tasks.filter(t => !t.done).length;
  remainingEl.textContent = \`\${remaining} việc còn lại\`;
}

addBtn.addEventListener('click', () => {
  const text = inputEl.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  inputEl.value = '';
  render();
  console.log('Đã thêm công việc: ' + text);
});

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

listEl.addEventListener('click', (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;
  if (e.target.tagName === 'INPUT') {
    const task = tasks.find(t => t.id === id);
    if (task) task.done = e.target.checked;
    render();
  } else if (e.target.classList.contains('del-btn')) {
    tasks = tasks.filter(t => t.id !== id);
    render();
    console.log('Đã xóa công việc ID: ' + id);
  }
});

clearDoneBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  render();
  console.log('Đã dọn dẹp các việc hoàn thành');
});

render();`,
  },
  {
    id: 'card3d',
    name: 'Thẻ 3D Hiệu Ứng Nghiêng',
    description: 'Thẻ kính 3D với hiệu ứng nghiêng theo con trỏ chuột và viền phát sáng',
    badge: 'Hiệu ứng',
    category: 'Hiệu ứng & Canvas',
    difficulty: 'Trung bình',
    tags: ['3d', 'hologram', 'nghieng', 'perspective', 'hieu ung'],
    learningPoints: [
      'Sử dụng perspective và transform-style: preserve-3d để tạo chiều sâu',
      'Tính góc xoay rotateX, rotateY theo tọa độ con trỏ chuột',
      'Tách lớp phần tử bằng translateZ giúp chữ nổi bật trên nền thẻ',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'hieu-ung-transition-transform-animation', title: 'Chuyển động & Transform' },
      { courseId: 'js', slug: 'su-kien-event-listener', title: 'Sự kiện di chuyển chuột' },
    ],
    createdOrder: 3,
    iconKey: 'layers',
    htmlCode: `<div class="card-wrap">
  <div class="card" id="tilt-card">
    <div class="glow"></div>
    <div>
      <span class="tag">✦ 3D Experience</span>
      <h2>Thẻ Hologram Không Gian 3D</h2>
      <p>Di chuyển chuột quanh tấm thẻ để trải nghiệm chiều sâu 3D chân thực.</p>
    </div>
    <div class="meta">
      <span class="price">Trực tiếp</span>
      <button class="btn">Khám phá</button>
    </div>
  </div>
</div>`,
    cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #09090b;
  font-family: 'Segoe UI', system-ui, sans-serif;
  perspective: 1000px;
  overflow: hidden;
}
.card-wrap {
  padding: 40px;
}
.card {
  width: 320px;
  height: 420px;
  background: radial-gradient(circle at 50% 0%, #1e1b4b, #09090b);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px;
  cursor: pointer;
}
.glow {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.25), transparent 70%);
  pointer-events: none;
}
.tag {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #818cf8;
  font-weight: 700;
  transform: translateZ(30px);
}
h2 {
  color: #ffffff;
  font-size: 26px;
  line-height: 1.2;
  margin-top: 12px;
  transform: translateZ(40px);
}
p {
  color: #a1a1aa;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 8px;
  transform: translateZ(25px);
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  transform: translateZ(35px);
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.price {
  font-size: 22px;
  font-weight: 700;
  color: #38bdf8;
}
.btn {
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}`,
    jsCode: `const card = document.getElementById('tilt-card');

document.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  const rotateX = -(y / 15);
  const rotateY = (x / 15);

  card.style.transform = \`rotateX(\${rotateX}deg) rotateY(\${rotateY}deg)\`;
});

document.addEventListener('mouseleave', () => {
  card.style.transform = 'rotateX(0deg) rotateY(0deg)';
});

console.log('Hiệu ứng 3D đã sẵn sàng. Di chuyển chuột trên khung xem!');`,
  },
  {
    id: 'fireworks',
    name: 'Pháo Hoa Canvas Tương Tác',
    description: 'Bắn pháo hoa rực rỡ và hạt ánh sáng khi nhấp chuột trên màn hình Canvas',
    badge: 'Canvas',
    category: 'Hiệu ứng & Canvas',
    difficulty: 'Nâng cao',
    tags: ['canvas', 'phao hoa', 'hat anh sang', 'requestAnimationFrame', 'do hoa'],
    learningPoints: [
      'Khởi tạo phần tử Canvas tự khớp kích thước khung nhìn',
      'Mô phỏng vận tốc, ma sát và trọng lực cho hệ thống hạt (Particle)',
      'Tạo vòng lặp hoạt họa 60 FPS với requestAnimationFrame',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'doi-tuong-object', title: 'Đối tượng (Object) & Lớp' },
      { courseId: 'js', slug: 'vong-lap-for-while', title: 'Vòng lặp trong JavaScript' },
    ],
    createdOrder: 4,
    iconKey: 'flame',
    htmlCode: `<div class="hint">✨ Nhấp chuột bất kỳ đâu để bắn pháo hoa</div>
<canvas id="canvas"></canvas>`,
    cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #05050a; overflow: hidden; height: 100vh; font-family: sans-serif; }
canvas { display: block; cursor: crosshair; }
.hint {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.7);
  background: rgba(0,0,0,0.6);
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 14px;
  pointer-events: none;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
}`,
    jsCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.friction = 0.96;
    this.gravity = 0.12;
    this.radius = Math.random() * 2.5 + 1.5;
  }
  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.015;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

const colors = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#14b8a6', '#eab308', '#f97316'];

function createExplosion(x, y) {
  const color = colors[Math.floor(Math.random() * colors.length)];
  for (let i = 0; i < 45; i++) {
    particles.push(new Particle(x, y, color));
  }
  console.log('Bắn pháo hoa tại tọa độ (' + Math.round(x) + ', ' + Math.round(y) + ')');
}

window.addEventListener('click', (e) => {
  createExplosion(e.clientX, e.clientY);
});

setTimeout(() => {
  createExplosion(window.innerWidth / 2, window.innerHeight * 0.4);
}, 400);

function animate() {
  ctx.fillStyle = 'rgba(5, 5, 10, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
  requestAnimationFrame(animate);
}
animate();`,
  },
];

export const CODE_TEMPLATES: CodeTemplate[] = [
  ...CORE_TEMPLATES,
  ...BATCH_1_WEBSITE_TEMPLATES,
  ...BATCH_2_TEMPLATES,
  ...BATCH_3_TEMPLATES,
  ...BATCH_4_TEMPLATES,
];

export function hasTemplateHtml(template: CodeTemplate): boolean {
  return Boolean(template.htmlCode?.trim());
}

export function hasTemplateCss(template: CodeTemplate): boolean {
  return Boolean(template.cssCode?.trim());
}

export function hasTemplateJs(template: CodeTemplate): boolean {
  return Boolean(template.jsCode?.trim());
}

export function isTemplateHtmlOnly(template: CodeTemplate): boolean {
  return hasTemplateHtml(template) && !hasTemplateCss(template) && !hasTemplateJs(template);
}

export function getTemplateLineCount(template: CodeTemplate): number {
  const count = (s?: string) => (s && s.trim().length > 0 ? s.split('\n').length : 0);
  return count(template.htmlCode) + count(template.cssCode) + count(template.jsCode);
}

import { CodeTemplate } from '../../types';

export const BATCH_3_TEMPLATES: CodeTemplate[] = [
  // =========================================================
  // TRÒ CHƠI (5 mẫu mới)
  // =========================================================
  {
    id: 'game-snake',
    name: 'Rắn săn mồi Canvas',
    description: 'Trò chơi rắn săn mồi cổ điển hỗ trợ phím mũi tên, WASD và cụm nút chạm 4 chiều cho điện thoại',
    badge: 'Trò chơi',
    category: 'Trò chơi',
    difficulty: 'Nâng cao',
    tags: ['ran san moi', 'snake', 'canvas', 'tro choi', 'd-pad'],
    learningPoints: [
      'Vẽ lưới, thân rắn và mồi trên phần tử <canvas> bằng ngữ cảnh 2D',
      'Xử lý vòng lặp trò chơi, ăn mồi tăng chiều dài và kiểm tra va chạm biên/thân',
      'Hỗ trợ điều khiển đa nền tảng gồm bàn phím và cụm nút cảm ứng trên màn hình',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'mang-array', title: 'Mảng (Array) trong JavaScript' },
      { courseId: 'js', slug: 'hen-gio-va-go-loi-debugging', title: 'Hẹn giờ (setInterval)' },
    ],
    createdOrder: 25,
    iconKey: 'flame',
    htmlCode: `<!-- Trò chơi Rắn săn mồi trên Canvas kèm điều khiển chạm -->
<main class="game-wrap">
  <header class="hud">
    <div>Điểm: <strong id="score">0</strong></div>
    <div>Kỷ lục: <strong id="best">0</strong></div>
    <button type="button" id="restart-btn" class="mini-btn">Chơi lại</button>
  </header>

  <div class="board-box">
    <canvas id="snake-canvas" width="320" height="320" aria-label="Bảng chơi rắn săn mồi"></canvas>
    <div id="over-banner" class="overlay" hidden>
      <p id="over-text">Kết thúc lượt chơi!</p>
      <button type="button" id="play-again" class="start-btn">Bắt đầu lại</button>
    </div>
  </div>

  <div class="dpad" role="group" aria-label="Điều khiển hướng đi">
    <button type="button" class="pad up" data-dir="up" aria-label="Đi lên">▲</button>
    <button type="button" class="pad left" data-dir="left" aria-label="Sang trái">◀</button>
    <button type="button" class="pad down" data-dir="down" aria-label="Đi xuống">▼</button>
    <button type="button" class="pad right" data-dir="right" aria-label="Sang phải">▶</button>
  </div>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
.game-wrap { width: 100%; max-width: 380px; background: #1e293b; border: 1px solid #334155; border-radius: 18px; padding: 16px; text-align: center; }
.hud { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; font-size: 14px; }
.mini-btn, .start-btn { min-height: 44px; padding: 8px 14px; border-radius: 10px; border: none; background: #2563eb; color: #ffffff; font-weight: 700; cursor: pointer; }
.board-box { position: relative; display: inline-block; width: 100%; max-width: 320px; }
canvas { width: 100%; height: auto; aspect-ratio: 1 / 1; background: #020617; border: 2px solid #334155; border-radius: 12px; display: block; touch-action: none; }
.overlay { position: absolute; inset: 0; background: rgba(2, 6, 23, 0.82); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 16px; }
.overlay[hidden] { display: none; }
.overlay p { font-size: 18px; font-weight: 700; }
.dpad { margin: 14px auto 0; width: 176px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.pad { min-width: 48px; min-height: 48px; border-radius: 10px; border: 1px solid #475569; background: #334155; color: #ffffff; font-size: 16px; cursor: pointer; }
.pad.up { grid-column: 2; }
.pad.left { grid-column: 1; grid-row: 2; }
.pad.down { grid-column: 2; grid-row: 2; }
.pad.right { grid-column: 3; grid-row: 2; }`,
    jsCode: `// Trò chơi Rắn săn mồi với lưới 16x16 và lưu kỷ lục an toàn
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const GRID = 16;
const CELL = canvas.width / GRID;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

let snake, dir, nextDir, food, score, loopId, memBest = 0;
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const banner = document.getElementById('over-banner');

function getBest() {
  try { return Number(localStorage.getItem('snake_best') || 0); } catch (e) { return memBest; }
}
function saveBest(val) {
  memBest = val;
  try { localStorage.setItem('snake_best', String(val)); } catch (e) {}
}

function spawnFood() {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

function startGame() {
  if (loopId) clearInterval(loopId);
  snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
  dir = [1, 0];
  nextDir = [1, 0];
  score = 0;
  food = spawnFood();
  scoreEl.textContent = '0';
  bestEl.textContent = String(getBest());
  banner.hidden = true;
  draw();
  loopId = setInterval(step, 145);
}

function setDirection(name) {
  const d = DIRS[name];
  if (!d) return;
  if (d[0] + dir[0] === 0 && d[1] + dir[1] === 0) return;
  nextDir = d;
}

function step() {
  dir = nextDir;
  const head = { x: snake[0].x + dir[0], y: snake[0].y + dir[1] };
  const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
  const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) {
    clearInterval(loopId);
    banner.hidden = false;
    document.getElementById('over-text').textContent = 'Hết lượt! Điểm: ' + score;
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = String(score);
    if (score > getBest()) { saveBest(score); bestEl.textContent = String(score); }
    food = spawnFood();
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
  snake.forEach((part, idx) => {
    ctx.fillStyle = idx === 0 ? '#4ade80' : '#22c55e';
    ctx.fillRect(part.x * CELL + 1, part.y * CELL + 1, CELL - 2, CELL - 2);
  });
}

window.addEventListener('keydown', (e) => {
  const map = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
  const key = map[e.key] || map[e.key.toLowerCase()];
  if (key) { e.preventDefault(); setDirection(key); }
});
document.querySelectorAll('.pad').forEach((btn) => {
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); setDirection(btn.dataset.dir); });
});
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('play-again').addEventListener('click', startGame);
startGame();`,
  },
  {
    id: 'game-memory-flip',
    name: 'Lật thẻ ghi nhớ cặp đôi',
    description: 'Trò chơi lật mở các cặp biểu tượng giống nhau có hiệu ứng lật 3D, đếm lượt đi và đồng hồ thời gian',
    badge: 'Trò chơi',
    category: 'Trò chơi',
    difficulty: 'Trung bình',
    tags: ['lat the', 'tri nho', 'memory', '3d flip', 'tro choi'],
    learningPoints: [
      'Tạo hiệu ứng lật mặt thẻ bằng perspective, rotateY(180deg) và backface-visibility',
      'Trộn ngẫu nhiên mảng phần tử bằng thuật toán Fisher-Yates',
      'Khóa thao tác tạm thời khi đang so khớp hai thẻ để tránh bấm chồng',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'hieu-ung-transition-transform-animation', title: 'Chuyển động & Transform 3D' },
      { courseId: 'js', slug: 'mang-array', title: 'Mảng (Array) trong JavaScript' },
    ],
    createdOrder: 26,
    iconKey: 'layers',
    htmlCode: `<!-- Bảng 12 thẻ lật tìm 6 cặp biểu tượng giống nhau -->
<main class="mem-app">
  <header class="bar">
    <div>Lượt: <strong id="moves">0</strong></div>
    <div>Đã ghép: <strong id="matched">0/6</strong></div>
    <button type="button" id="reset-mem" class="btn">Trộn lại</button>
  </header>

  <section id="board" class="board" aria-label="Bảng thẻ ghi nhớ"></section>
  <p id="win-msg" class="win" role="status" aria-live="polite"></p>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #0f172a; padding: 24px 14px; }
.mem-app { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 16px; font-size: 14px; }
.btn { min-height: 44px; padding: 8px 14px; border-radius: 10px; border: none; background: #2563eb; color: #ffffff; font-weight: 700; cursor: pointer; }
.board { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.card-btn { aspect-ratio: 1 / 1; min-height: 64px; border: none; background: transparent; perspective: 700px; cursor: pointer; padding: 0; }
.card-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.35s; border-radius: 12px; }
.card-btn.flipped .card-inner, .card-btn.done .card-inner { transform: rotateY(180deg); }
.face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; }
.face.front { background: #1d4ed8; color: #ffffff; font-size: 20px; }
.face.back { background: #eff6ff; border: 2px solid #93c5fd; transform: rotateY(180deg); }
.card-btn.done .face.back { background: #dcfce7; border-color: #22c55e; }
.win { margin-top: 14px; text-align: center; font-size: 15px; font-weight: 700; color: #15803d; min-height: 22px; }
@media (max-width: 420px) { .board { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (prefers-reduced-motion: reduce) { .card-inner { transition: none; } }`,
    jsCode: `// Trò chơi lật thẻ 6 cặp biểu tượng
const ICONS = ['🚀', '🎨', '⚡', '🌿', '🎵', '💎'];
const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const matchedEl = document.getElementById('matched');
const winEl = document.getElementById('win-msg');

let first = null, locked = false, moves = 0, matched = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function init() {
  first = null; locked = false; moves = 0; matched = 0;
  movesEl.textContent = '0';
  matchedEl.textContent = '0/6';
  winEl.textContent = '';
  const deck = shuffle([...ICONS, ...ICONS]);
  board.innerHTML = deck.map((icon, i) =>
    '<button type="button" class="card-btn" data-icon="' + icon + '" aria-label="Thẻ số ' + (i + 1) + '">' +
      '<span class="card-inner"><span class="face front">?</span><span class="face back">' + icon + '</span></span>' +
    '</button>'
  ).join('');
}

board.addEventListener('click', (e) => {
  const btn = e.target.closest('.card-btn');
  if (!btn || locked || btn.classList.contains('flipped') || btn.classList.contains('done')) return;
  btn.classList.add('flipped');

  if (!first) { first = btn; return; }
  moves++;
  movesEl.textContent = String(moves);

  if (first.dataset.icon === btn.dataset.icon) {
    first.classList.add('done');
    btn.classList.add('done');
    first = null;
    matched++;
    matchedEl.textContent = matched + '/6';
    if (matched === ICONS.length) {
      winEl.textContent = 'Tuyệt vời! Bạn hoàn thành sau ' + moves + ' lượt mở thẻ.';
    }
  } else {
    locked = true;
    const prev = first;
    first = null;
    setTimeout(() => {
      prev.classList.remove('flipped');
      btn.classList.remove('flipped');
      locked = false;
    }, 650);
  }
});

document.getElementById('reset-mem').addEventListener('click', init);
init();`,
  },
  {
    id: 'game-tictactoe',
    name: 'Cờ Ca-rô 3×3 đấu với máy',
    description: 'Bàn cờ X/O 3×3 hỗ trợ chơi hai người hoặc đấu với máy thông minh, tô sáng đường thắng và đếm tỷ số',
    badge: 'Trò chơi',
    category: 'Trò chơi',
    difficulty: 'Trung bình',
    tags: ['co caro', 'tic tac toe', 'xo', 'ai', 'tro choi'],
    learningPoints: [
      'Kiểm tra tất cả 8 tổ hợp thắng trên lưới 3×3 bằng vòng lặp',
      'Lập chiến thuật máy (Bot): ưu tiên thắng ngay, chặn đối thủ và chọn ô trung tâm',
      'Cập nhật bảng tỷ số và cho phép chuyển đổi chế độ 1 người / 2 người',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'cau-dieu-kien-if-else', title: 'Câu điều kiện if / else' },
      { courseId: 'js', slug: 'vong-lap-for-while', title: 'Vòng lặp (for, while)' },
    ],
    createdOrder: 27,
    iconKey: 'check',
    htmlCode: `<!-- Cờ Ca-rô 3x3 đấu máy hoặc 2 người -->
<main class="ttt">
  <header class="top">
    <h1>Cờ Ca-rô 3×3</h1>
    <button type="button" id="mode-toggle" class="mode-btn">Chế độ: Đấu với máy</button>
  </header>

  <div class="scores">
    <span>Bạn (X): <strong id="sx">0</strong></span>
    <span>Hòa: <strong id="sd">0</strong></span>
    <span id="lbl-o">Máy (O): <strong id="so">0</strong></span>
  </div>

  <div id="grid" class="grid" role="grid" aria-label="Bàn cờ 3 nhân 3"></div>
  <p id="turn-msg" class="turn" role="status" aria-live="polite">Lượt của X</p>
  <button type="button" id="new-round" class="reset-btn">Ván mới</button>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 24px 16px; }
.ttt { max-width: 380px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px; text-align: center; }
.top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
.top h1 { font-size: 20px; }
.mode-btn, .reset-btn { min-height: 44px; padding: 8px 14px; border-radius: 10px; border: 1px solid #cbd5e1; background: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 13px; cursor: pointer; }
.reset-btn { width: 100%; background: #2563eb; color: #ffffff; border-color: #2563eb; margin-top: 12px; }
.scores { display: flex; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border-radius: 10px; font-size: 13px; margin-bottom: 14px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 280px; margin: 0 auto; }
.cell { aspect-ratio: 1 / 1; min-height: 76px; border-radius: 12px; border: 2px solid #cbd5e1; background: #ffffff; font-size: 32px; font-weight: 800; cursor: pointer; color: #0f172a; }
.cell.x { color: #2563eb; }
.cell.o { color: #dc2626; }
.cell.win { background: #dcfce7; border-color: #16a34a; }
.turn { margin-top: 14px; font-size: 15px; font-weight: 700; min-height: 22px; }`,
    jsCode: `// Bàn cờ X/O và chiến thuật đơn giản cho máy O
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let cells = Array(9).fill('');
let turn = 'X', over = false, vsBot = true;
const score = { X: 0, O: 0, D: 0 };

const grid = document.getElementById('grid');
const msg = document.getElementById('turn-msg');

function findWin(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a], line };
  }
  return null;
}

function botPick() {
  const empty = cells.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  for (const mark of ['O', 'X']) {
    for (const i of empty) {
      const test = [...cells]; test[i] = mark;
      if (findWin(test)) return i;
    }
  }
  if (!cells[4]) return 4;
  return empty[Math.floor(Math.random() * empty.length)];
}

function render(winLine = []) {
  grid.innerHTML = cells.map((v, i) =>
    '<button type="button" class="cell ' + (v ? v.toLowerCase() : '') + (winLine.includes(i) ? ' win' : '') +
    '" data-idx="' + i + '" aria-label="Ô ' + (i + 1) + (v ? ' đã đánh ' + v : '') + '">' + v + '</button>'
  ).join('');
  document.getElementById('sx').textContent = String(score.X);
  document.getElementById('so').textContent = String(score.O);
  document.getElementById('sd').textContent = String(score.D);
}

function playAt(idx) {
  if (over || cells[idx]) return;
  cells[idx] = turn;
  const res = findWin(cells);
  if (res) {
    over = true;
    score[res.winner]++;
    msg.textContent = (res.winner === 'X' ? 'X thắng!' : (vsBot ? 'Máy (O) thắng!' : 'O thắng!'));
    render(res.line);
    return;
  }
  if (cells.every(Boolean)) {
    over = true;
    score.D++;
    msg.textContent = 'Ván hòa!';
    render();
    return;
  }
  turn = turn === 'X' ? 'O' : 'X';
  msg.textContent = 'Lượt của ' + turn;
  render();
  if (vsBot && turn === 'O' && !over) {
    setTimeout(() => playAt(botPick()), 260);
  }
}

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.cell');
  if (!btn) return;
  if (vsBot && turn === 'O') return;
  playAt(Number(btn.dataset.idx));
});

document.getElementById('new-round').addEventListener('click', () => {
  cells = Array(9).fill(''); turn = 'X'; over = false; msg.textContent = 'Lượt của X'; render();
});
document.getElementById('mode-toggle').addEventListener('click', (e) => {
  vsBot = !vsBot;
  e.target.textContent = vsBot ? 'Chế độ: Đấu với máy' : 'Chế độ: 2 người';
  cells = Array(9).fill(''); turn = 'X'; over = false; msg.textContent = 'Lượt của X'; render();
});
render();`,
  },
  {
    id: 'game-whack-a-mole',
    name: 'Đập chuột nhanh tay',
    description: 'Mini-game phản xạ 30 giây trên lưới 9 hố, phản hồi ngay theo pointerdown và lưu điểm cao nhất',
    badge: 'Trò chơi',
    category: 'Trò chơi',
    difficulty: 'Dễ',
    tags: ['dap chuot', 'phan xa', 'whack a mole', 'pointerdown', 'tro choi'],
    learningPoints: [
      'Dùng sự kiện pointerdown để ghi nhận cú chạm/nhấp nhanh không có độ trễ',
      'Điều phối hai bộ hẹn giờ: đếm ngược thời gian chơi và xuất hiện mục tiêu ngẫu nhiên',
      'Xóa sạch timer cũ khi bắt đầu ván mới để tốc độ luôn ổn định',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'hen-gio-va-go-loi-debugging', title: 'Hẹn giờ (setInterval)' },
      { courseId: 'js', slug: 'su-kien-event-listener', title: 'Sự kiện (addEventListener)' },
    ],
    createdOrder: 28,
    iconKey: 'sparkles',
    htmlCode: `<!-- Trò chơi phản xạ 30 giây trên lưới 3x3 -->
<main class="mole-app">
  <h1>Nhanh Tay Đập Chuột</h1>
  <div class="stats">
    <span>Điểm: <strong id="m-score">0</strong></span>
    <span>Còn lại: <strong id="m-time">30s</strong></span>
    <span>Kỷ lục: <strong id="m-best">0</strong></span>
  </div>

  <div id="holes" class="holes">
    <button type="button" class="hole" data-i="0" aria-label="Hố 1"></button>
    <button type="button" class="hole" data-i="1" aria-label="Hố 2"></button>
    <button type="button" class="hole" data-i="2" aria-label="Hố 3"></button>
    <button type="button" class="hole" data-i="3" aria-label="Hố 4"></button>
    <button type="button" class="hole" data-i="4" aria-label="Hố 5"></button>
    <button type="button" class="hole" data-i="5" aria-label="Hố 6"></button>
    <button type="button" class="hole" data-i="6" aria-label="Hố 7"></button>
    <button type="button" class="hole" data-i="7" aria-label="Hố 8"></button>
    <button type="button" class="hole" data-i="8" aria-label="Hố 9"></button>
  </div>

  <button type="button" id="start-mole" class="start-btn">Bắt đầu chơi (30 giây)</button>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #ecfdf5; color: #064e3b; padding: 24px 16px; }
.mole-app { max-width: 420px; margin: 0 auto; background: #ffffff; border: 1px solid #a7f3d0; border-radius: 18px; padding: 20px; text-align: center; }
.mole-app h1 { font-size: 20px; margin-bottom: 12px; }
.stats { display: flex; justify-content: space-between; background: #f0fdf4; padding: 10px 14px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }
.holes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.hole { aspect-ratio: 1 / 1; min-height: 76px; border-radius: 16px; border: 3px solid #86efac; background: #d1fae5; font-size: 32px; cursor: pointer; transition: transform 0.08s; }
.hole.active { background: #fef08a; border-color: #eab308; transform: scale(1.03); }
.hole.hit { background: #bbf7d0; border-color: #16a34a; }
.start-btn { width: 100%; min-height: 46px; border-radius: 12px; border: none; background: #059669; color: #ffffff; font-size: 15px; font-weight: 700; cursor: pointer; }`,
    jsCode: `// Điều phối vòng chơi 30 giây và lưu kỷ lục an toàn
const holes = Array.from(document.querySelectorAll('.hole'));
const scoreEl = document.getElementById('m-score');
const timeEl = document.getElementById('m-time');
const bestEl = document.getElementById('m-best');
const startBtn = document.getElementById('start-mole');

let score = 0, timeLeft = 30, activeIdx = -1, spawnTimer = null, clockTimer = null, memBest = 0;

function readBest() { try { return Number(localStorage.getItem('mole_best') || 0); } catch (e) { return memBest; } }
function saveBest(v) { memBest = v; try { localStorage.setItem('mole_best', String(v)); } catch (e) {} }

function clearActive() {
  holes.forEach((h) => { h.classList.remove('active'); h.textContent = ''; });
  activeIdx = -1;
}

function nextMole() {
  clearActive();
  if (timeLeft <= 0) return;
  activeIdx = Math.floor(Math.random() * holes.length);
  holes[activeIdx].classList.add('active');
  holes[activeIdx].textContent = '🐹';
}

function startGame() {
  clearInterval(spawnTimer);
  clearInterval(clockTimer);
  score = 0; timeLeft = 30;
  scoreEl.textContent = '0';
  timeEl.textContent = '30s';
  bestEl.textContent = String(readBest());
  startBtn.disabled = true;
  startBtn.textContent = 'Đang chơi...';
  nextMole();
  spawnTimer = setInterval(nextMole, 780);
  clockTimer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft + 's';
    if (timeLeft <= 0) {
      clearInterval(spawnTimer);
      clearInterval(clockTimer);
      clearActive();
      if (score > readBest()) { saveBest(score); bestEl.textContent = String(score); }
      startBtn.disabled = false;
      startBtn.textContent = 'Chơi lại (Vừa ghi ' + score + ' điểm)';
    }
  }, 1000);
}

document.getElementById('holes').addEventListener('pointerdown', (e) => {
  const hole = e.target.closest('.hole');
  if (!hole || Number(hole.dataset.i) !== activeIdx) return;
  score++;
  scoreEl.textContent = String(score);
  hole.classList.remove('active');
  hole.classList.add('hit');
  hole.textContent = '💥';
  activeIdx = -1;
  setTimeout(() => hole.classList.remove('hit'), 180);
});

startBtn.addEventListener('click', startGame);
bestEl.textContent = String(readBest());`,
  },
  {
    id: 'game-reaction-quiz',
    name: 'Thử thách phản xạ Đọc màu',
    description: 'Trò chơi hiệu ứng Stroop: kiểm tra màu chữ hiển thị có khớp với tên màu hay không trong 10 câu hỏi',
    badge: 'Trò chơi',
    category: 'Trò chơi',
    difficulty: 'Dễ',
    tags: ['stroop', 'phan xa', 'mau sac', 'do vui', 'tro choi'],
    learningPoints: [
      'Đo thời gian phản xạ chính xác bằng performance.now()',
      'Tạo câu đố ngẫu nhiên ghép chữ và mã màu tương phản cao',
      'Tính điểm chuỗi trả lời đúng liên tiếp (streak) và phản hồi tức thì',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'toan-tu-va-chuoi', title: 'Toán tử và so sánh' },
      { courseId: 'js', slug: 'doi-tuong-object', title: 'Đối tượng (Object)' },
    ],
    createdOrder: 29,
    iconKey: 'compass',
    htmlCode: `<!-- Trò chơi Đọc màu (Stroop): tên màu và màu chữ có khớp nhau không? -->
<main class="stroop">
  <header class="meta">
    <span>Câu <strong id="q-num">1/10</strong></span>
    <span>Điểm: <strong id="q-score">0</strong></span>
    <span>Chuỗi đúng: <strong id="q-streak">0</strong></span>
  </header>

  <p class="prompt">Màu sắc của chữ dưới đây có khớp với nghĩa của từ không?</p>
  <div id="word-box" class="word-box" aria-live="polite">ĐỎ</div>

  <div class="choices">
    <button type="button" id="yes-btn" class="c-btn yes">✓ Khớp nhau</button>
    <button type="button" id="no-btn" class="c-btn no">✕ Không khớp</button>
  </div>

  <p id="feedback" class="fb" role="status"></p>
  <button type="button" id="replay-btn" class="replay" hidden>Chơi lại 10 câu</button>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 24px 16px; }
.stroop { max-width: 440px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; text-align: center; }
.meta { display: flex; justify-content: space-between; font-size: 13px; background: #f1f5f9; padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; }
.prompt { font-size: 14px; color: #475569; margin-bottom: 12px; }
.word-box { padding: 24px 12px; background: #0f172a; border-radius: 14px; font-size: 40px; font-weight: 900; letter-spacing: 0.04em; margin-bottom: 18px; }
.choices { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.c-btn { min-height: 48px; border-radius: 12px; border: none; font-size: 15px; font-weight: 700; cursor: pointer; color: #ffffff; }
.c-btn.yes { background: #16a34a; }
.c-btn.no { background: #dc2626; }
.fb { margin-top: 14px; min-height: 22px; font-size: 14px; font-weight: 700; }
.replay { margin-top: 10px; width: 100%; min-height: 44px; border-radius: 10px; border: none; background: #2563eb; color: #ffffff; font-weight: 700; cursor: pointer; }`,
    jsCode: `// Sinh 10 câu hỏi Stroop ngẫu nhiên và đo thời gian phản xạ
const PALETTE = [
  { name: 'ĐỎ', hex: '#ef4444' },
  { name: 'XANH LÁ', hex: '#22c55e' },
  { name: 'XANH DƯƠNG', hex: '#38bdf8' },
  { name: 'VÀNG', hex: '#facc15' },
  { name: 'TÍM', hex: '#c084fc' }
];
let round = 1, score = 0, streak = 0, isMatch = false, startedAt = 0;

const wordBox = document.getElementById('word-box');
const fbEl = document.getElementById('feedback');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const replayBtn = document.getElementById('replay-btn');

function nextQuestion() {
  document.getElementById('q-num').textContent = round + '/10';
  const word = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const shouldMatch = Math.random() < 0.5;
  let ink = word;
  if (!shouldMatch) {
    const others = PALETTE.filter((c) => c.name !== word.name);
    ink = others[Math.floor(Math.random() * others.length)];
  }
  isMatch = shouldMatch;
  wordBox.textContent = word.name;
  wordBox.style.color = ink.hex;
  startedAt = performance.now();
}

function answer(userSaysMatch) {
  const ms = Math.round(performance.now() - startedAt);
  if (userSaysMatch === isMatch) {
    streak++;
    score += 10 + Math.min(streak * 2, 10);
    fbEl.textContent = 'Chính xác! (' + ms + ' ms)';
    fbEl.style.color = '#15803d';
  } else {
    streak = 0;
    fbEl.textContent = 'Chưa đúng rồi (' + ms + ' ms)';
    fbEl.style.color = '#b91c1c';
  }
  document.getElementById('q-score').textContent = String(score);
  document.getElementById('q-streak').textContent = String(streak);

  if (round >= 10) {
    yesBtn.disabled = true;
    noBtn.disabled = true;
    replayBtn.hidden = false;
    fbEl.textContent = 'Hoàn thành 10 câu! Tổng điểm: ' + score;
  } else {
    round++;
    nextQuestion();
  }
}

yesBtn.addEventListener('click', () => answer(true));
noBtn.addEventListener('click', () => answer(false));
replayBtn.addEventListener('click', () => {
  round = 1; score = 0; streak = 0;
  document.getElementById('q-score').textContent = '0';
  document.getElementById('q-streak').textContent = '0';
  yesBtn.disabled = false; noBtn.disabled = false;
  replayBtn.hidden = true; fbEl.textContent = '';
  nextQuestion();
});
nextQuestion();`,
  },

  // =========================================================
  // HIỆU ỨNG & CANVAS (4 mẫu mới, tổng danh mục = 6)
  // =========================================================
  {
    id: 'fx-particle-network',
    name: 'Mạng hạt nối dây tương tác',
    description: 'Hiệu ứng chùm hạt chuyển động tự động nối dây khi ở gần nhau và tương tác đẩy nhẹ theo con trỏ',
    badge: 'Hiệu ứng & Canvas',
    category: 'Hiệu ứng & Canvas',
    difficulty: 'Trung bình',
    tags: ['canvas', 'hat', 'particle', 'tuong tac', 'hieu ung'],
    learningPoints: [
      'Cập nhật tọa độ vận tốc và độ bật biên cho mảng hạt bằng requestAnimationFrame',
      'Tính khoảng cách Euclid giữa hai điểm để vẽ đường nối mờ dần theo cự ly',
      'Hỗ trợ nút tạm dừng và tự dừng chuyển động khi prefers-reduced-motion được bật',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'vong-lap-for-while', title: 'Vòng lặp lồng nhau' },
      { courseId: 'js', slug: 'ham-function', title: 'Hàm và toán học' },
    ],
    createdOrder: 30,
    iconKey: 'sparkles',
    htmlCode: `<!-- Mạng lưới hạt tương tác theo con trỏ trên Canvas -->
<canvas id="net-canvas" aria-label="Hiệu ứng mạng hạt chuyển động"></canvas>
<div class="hud">
  <span>Di chuyển chuột hoặc chạm để đẩy các hạt</span>
  <button type="button" id="toggle-anim" class="btn">Tạm dừng</button>
</div>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: system-ui, -apple-system, sans-serif; }
canvas { display: block; width: 100%; height: 100%; touch-action: none; }
.hud { position: fixed; left: 14px; right: 14px; bottom: 14px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; pointer-events: none; color: #e2e8f0; font-size: 13px; }
.hud span { background: rgba(15, 23, 42, 0.78); padding: 8px 12px; border-radius: 10px; border: 1px solid #334155; }
.btn { pointer-events: auto; min-height: 44px; padding: 8px 14px; border-radius: 10px; border: 1px solid #38bdf8; background: #0f172a; color: #38bdf8; font-weight: 700; cursor: pointer; }`,
    jsCode: `// Mạng hạt 2D nối dây theo khoảng cách
const canvas = document.getElementById('net-canvas');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('toggle-anim');

const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reduceMotion;
let pointer = { x: -999, y: -999 };
let dots = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initDots() {
  dots = Array.from({ length: 46 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 1.1,
    vy: (Math.random() - 0.5) * 1.1
  }));
}

function drawFrame() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < dots.length; i++) {
    const a = dots[i];
    if (!paused) {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
      if (a.y < 0 || a.y > canvas.height) a.vy *= -1;
      const dxp = a.x - pointer.x, dyp = a.y - pointer.y;
      const dp = Math.hypot(dxp, dyp);
      if (dp > 1 && dp < 90) { a.x += (dxp / dp) * 2; a.y += (dyp / dp) * 2; }
    }
    ctx.beginPath();
    ctx.arc(a.x, a.y, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    for (let j = i + 1; j < dots.length; j++) {
      const b = dots[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 120) {
        ctx.strokeStyle = 'rgba(56, 189, 248, ' + (1 - dist / 120) * 0.5 + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  if (!paused) requestAnimationFrame(drawFrame);
}

canvas.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; });
canvas.addEventListener('pointerleave', () => { pointer.x = -999; pointer.y = -999; });
window.addEventListener('resize', () => { resize(); drawFrame(); });

toggleBtn.textContent = paused ? 'Tiếp tục' : 'Tạm dừng';
toggleBtn.addEventListener('click', () => {
  paused = !paused;
  toggleBtn.textContent = paused ? 'Tiếp tục' : 'Tạm dừng';
  if (!paused) drawFrame();
});

resize();
initDots();
drawFrame();`,
  },
  {
    id: 'fx-drawing-board',
    name: 'Bảng vẽ tay tự do Canvas',
    description: 'Bảng vẽ hỗ trợ chuột và cảm ứng với bảng màu, chỉnh nét bút, hoàn tác nét vừa vẽ và xóa bảng',
    badge: 'Hiệu ứng & Canvas',
    category: 'Hiệu ứng & Canvas',
    difficulty: 'Trung bình',
    tags: ['ve tay', 'canvas', 'but ve', 'pointer', 'do hoa'],
    learningPoints: [
      'Ghi nhận nét vẽ liên tục mượt mà bằng bộ sự kiện pointerdown / pointermove / pointerup',
      'Khóa cuộn màn hình khi vẽ trên điện thoại bằng touch-action: none',
      'Lưu mảng từng nét vẽ (strokes) để hoàn tác ngay bước vẽ gần nhất',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'su-kien-event-listener', title: 'Sự kiện (Pointer & Mouse)' },
      { courseId: 'js', slug: 'mang-array', title: 'Mảng lưu lịch sử thao tác' },
    ],
    createdOrder: 31,
    iconKey: 'sparkles',
    htmlCode: `<!-- Bảng vẽ tay tự do hỗ trợ chuột và màn hình cảm ứng -->
<main class="paint-app">
  <header class="toolbar">
    <div class="colors" role="group" aria-label="Chọn màu nét vẽ">
      <button type="button" class="swatch active" data-color="#0f172a" style="background:#0f172a" aria-label="Màu đen"></button>
      <button type="button" class="swatch" data-color="#2563eb" style="background:#2563eb" aria-label="Màu xanh dương"></button>
      <button type="button" class="swatch" data-color="#dc2626" style="background:#dc2626" aria-label="Màu đỏ"></button>
      <button type="button" class="swatch" data-color="#16a34a" style="background:#16a34a" aria-label="Màu xanh lá"></button>
      <button type="button" class="swatch" data-color="#ffffff" style="background:#ffffff" aria-label="Tẩy trắng"></button>
    </div>

    <div class="controls">
      <label for="brush-size">Nét <span id="size-txt">5</span>px</label>
      <input id="brush-size" type="range" min="2" max="24" value="5" />
      <button type="button" id="undo-stroke" class="btn">Hoàn tác</button>
      <button type="button" id="clear-board" class="btn danger">Xóa hết</button>
    </div>
  </header>

  <canvas id="draw-canvas" width="760" height="420" aria-label="Khu vực vẽ tự do"></canvas>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #e2e8f0; color: #0f172a; padding: 16px; }
.paint-app { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.colors, .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.swatch { width: 34px; height: 34px; min-width: 44px; min-height: 44px; border-radius: 999px; border: 2px solid #cbd5e1; cursor: pointer; }
.swatch.active { outline: 3px solid #2563eb; outline-offset: 2px; }
.controls label { font-size: 13px; font-weight: 600; }
.btn { min-height: 44px; padding: 8px 12px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; font-weight: 600; font-size: 13px; cursor: pointer; }
.btn.danger { background: #fee2e2; border-color: #fecaca; color: #b91c1c; }
canvas { width: 100%; height: auto; aspect-ratio: 760 / 420; display: block; background: #ffffff; touch-action: none; cursor: crosshair; }`,
    jsCode: `// Ghi lại từng nét vẽ dạng vector để vẽ lại và hoàn tác nhanh
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');
let color = '#0f172a', size = 5, drawing = false, currentStroke = null;
const strokes = [];

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height
  };
}

function redrawAll() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const s of strokes) {
    if (s.points.length === 0) continue;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
    ctx.stroke();
  }
}

canvas.addEventListener('pointerdown', (e) => {
  drawing = true;
  const p = getPos(e);
  currentStroke = { color, size, points: [p, { x: p.x + 0.1, y: p.y + 0.1 }] };
  strokes.push(currentStroke);
  redrawAll();
});

canvas.addEventListener('pointermove', (e) => {
  if (!drawing || !currentStroke) return;
  currentStroke.points.push(getPos(e));
  redrawAll();
});

window.addEventListener('pointerup', () => { drawing = false; currentStroke = null; });

document.querySelector('.colors').addEventListener('click', (e) => {
  const btn = e.target.closest('.swatch');
  if (!btn) return;
  color = btn.dataset.color;
  document.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('active', s === btn));
});

document.getElementById('brush-size').addEventListener('input', (e) => {
  size = Number(e.target.value);
  document.getElementById('size-txt').textContent = String(size);
});
document.getElementById('undo-stroke').addEventListener('click', () => { strokes.pop(); redrawAll(); });
document.getElementById('clear-board').addEventListener('click', () => { strokes.length = 0; redrawAll(); });
redrawAll();`,
  },
  {
    id: 'fx-wave-visualizer',
    name: 'Sóng nhạc & phổ cột SVG động',
    description: 'Mô phỏng bộ hiển thị sóng âm 20 cột bằng SVG, cho phép chỉnh nhịp điệu, biên độ và đổi bảng màu tức thì',
    badge: 'Hiệu ứng & Canvas',
    category: 'Hiệu ứng & Canvas',
    difficulty: 'Dễ',
    tags: ['song nhac', 'visualizer', 'svg', 'animation', 'am nhac'],
    learningPoints: [
      'Sinh động phần tử SVG bằng cách thay đổi thuộc tính height và y theo hàm sin',
      'Điều khiển tốc độ và biên độ sóng trực tiếp qua thanh trượt <input type="range">',
      'Tắt vòng lặp chuyển động mượt mà khi người dùng tạm dừng hoặc bật giảm chuyển động',
    ],
    relatedLessons: [
      { courseId: 'js', slug: 'vong-lap-for-while', title: 'Vòng lặp tạo danh sách phần tử' },
      { courseId: 'css', slug: 'mau-sac-va-nen-color-background', title: 'Màu sắc & Nền' },
    ],
    createdOrder: 32,
    iconKey: 'sparkles',
    htmlCode: `<!-- Bộ mô phỏng sóng nhạc 20 cột vẽ hoàn toàn bằng SVG -->
<main class="viz-card">
  <header class="head">
    <h1>Phổ Sóng Âm SVG</h1>
    <button type="button" id="play-viz" class="btn">Tạm dừng</button>
  </header>

  <svg id="bars-svg" viewBox="0 0 360 140" class="stage" aria-label="Sóng cột chuyển động"></svg>

  <div class="sliders">
    <label>Nhịp độ: <input id="speed-range" type="range" min="1" max="10" value="5" /></label>
    <label>Biên độ: <input id="amp-range" type="range" min="15" max="55" value="40" /></label>
  </div>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 18px; }
.viz-card { width: 100%; max-width: 520px; background: #1e293b; border: 1px solid #334155; border-radius: 18px; padding: 20px; }
.head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.head h1 { font-size: 19px; }
.btn { min-height: 44px; padding: 8px 16px; border-radius: 10px; border: none; background: #38bdf8; color: #0f172a; font-weight: 700; cursor: pointer; }
.stage { width: 100%; height: auto; background: #020617; border-radius: 12px; display: block; padding: 10px; }
.sliders { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; font-size: 13px; color: #cbd5e1; }
.sliders label { display: flex; flex-direction: column; gap: 6px; }
.sliders input { width: 100%; min-height: 36px; accent-color: #38bdf8; }
@media (max-width: 480px) { .sliders { grid-template-columns: 1fr; } }`,
    jsCode: `// Tạo 20 cột SVG và cập nhật chiều cao theo hàm sóng sin
const svg = document.getElementById('bars-svg');
const speedEl = document.getElementById('speed-range');
const ampEl = document.getElementById('amp-range');
const playBtn = document.getElementById('play-viz');

const BARS = 20;
const rects = [];
for (let i = 0; i < BARS; i++) {
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  r.setAttribute('x', String(10 + i * 17));
  r.setAttribute('width', '11');
  r.setAttribute('rx', '5');
  r.setAttribute('fill', i % 2 === 0 ? '#38bdf8' : '#818cf8');
  svg.appendChild(r);
  rects.push(r);
}

const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let running = !reduce;
let phase = 0;

function renderBars() {
  const amp = Number(ampEl.value);
  rects.forEach((r, idx) => {
    const wave = Math.sin(phase + idx * 0.45) * 0.5 + 0.5;
    const h = Math.round(14 + wave * amp * 1.8);
    r.setAttribute('height', String(h));
    r.setAttribute('y', String(130 - h));
  });
}

function tick() {
  if (!running) return;
  phase += Number(speedEl.value) * 0.025;
  renderBars();
  requestAnimationFrame(tick);
}

playBtn.textContent = running ? 'Tạm dừng' : 'Phát sóng';
playBtn.addEventListener('click', () => {
  running = !running;
  playBtn.textContent = running ? 'Tạm dừng' : 'Phát sóng';
  if (running) tick();
});
renderBars();
if (running) tick();`,
  },
  {
    id: 'fx-aurora-glass',
    name: 'Thẻ kính mờ & dải cực quang CSS',
    description: 'Hiệu ứng nền cực quang chuyển sắc kết hợp thẻ kính mờ (Glassmorphism) phản chiếu theo góc di chuột',
    badge: 'Hiệu ứng & Canvas',
    category: 'Hiệu ứng & Canvas',
    difficulty: 'Dễ',
    tags: ['glassmorphism', 'kinh mo', 'aurora', 'cuc quang', 'css'],
    learningPoints: [
      'Tạo chiều sâu kính mờ bằng backdrop-filter: blur() và viền bán trong suốt',
      'Tạo dải sáng cực quang mềm mại bằng radial-gradient và animation nhẹ',
      'Xoay nghiêng thẻ nhẹ nhàng theo con trỏ với CSS transform perspective()',
    ],
    relatedLessons: [
      { courseId: 'css', slug: 'mau-sac-va-nen-color-background', title: 'Màu sắc & Gradient' },
      { courseId: 'css', slug: 'hieu-ung-transition-transform-animation', title: 'Chuyển động & Transform' },
    ],
    createdOrder: 33,
    iconKey: 'sparkles',
    htmlCode: `<!-- Hiệu ứng nền cực quang và thẻ kính mờ tương tác -->
<main class="scene">
  <div class="aurora a1" aria-hidden="true"></div>
  <div class="aurora a2" aria-hidden="true"></div>

  <article id="glass-card" class="glass-card">
    <span class="chip">Hiệu ứng CSS Hiện đại</span>
    <h1>Thẻ Kính Mờ Cực Quang</h1>
    <p>Kết hợp nền chuyển sắc mềm, độ mờ nền backdrop-filter và hiệu ứng nghiêng 3D tinh tế khi rê chuột qua thẻ.</p>
    <button type="button" id="glow-btn" class="glow-btn">Đổi tông cực quang</button>
  </article>
</main>`,
    cssCode: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #020617; color: #f8fafc; min-height: 100vh; }
.scene { position: relative; min-height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 20px; }
.aurora { position: absolute; width: 360px; height: 360px; border-radius: 50%; filter: blur(70px); opacity: 0.6; pointer-events: none; animation: drift 9s ease-in-out infinite alternate; }
.a1 { background: #2563eb; top: -60px; left: -40px; }
.a2 { background: #0d9488; bottom: -60px; right: -40px; animation-delay: -4s; }
.glass-card { position: relative; z-index: 1; max-width: 440px; width: 100%; background: rgba(15, 23, 42, 0.58); backdrop-filter: blur(18px); border: 1px solid rgba(255, 255, 255, 0.22); border-radius: 22px; padding: 28px; transition: transform 0.18s ease-out; }
.chip { display: inline-block; padding: 4px 10px; border-radius: 999px; background: rgba(56, 189, 248, 0.18); color: #7dd3fc; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
.glass-card h1 { font-size: 24px; margin-bottom: 10px; }
.glass-card p { font-size: 14px; color: #cbd5e1; line-height: 1.65; margin-bottom: 18px; }
.glow-btn { min-height: 44px; padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.14); color: #ffffff; font-weight: 700; font-size: 14px; cursor: pointer; }
@keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(30px, 24px) scale(1.12); } }
@media (prefers-reduced-motion: reduce) { .aurora { animation: none; } .glass-card { transition: none; } }`,
    jsCode: `// Nghiêng nhẹ thẻ kính theo vị trí con trỏ và đổi tông màu cực quang
const card = document.getElementById('glass-card');
const a1 = document.querySelector('.a1');
const a2 = document.querySelector('.a2');
const THEMES = [['#2563eb', '#0d9488'], ['#7c3aed', '#db2777'], ['#0284c7', '#16a34a']];
let idx = 0;

card.addEventListener('pointermove', (e) => {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = card.getBoundingClientRect();
  const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
  const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
  card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
});
card.addEventListener('pointerleave', () => { card.style.transform = 'none'; });

document.getElementById('glow-btn').addEventListener('click', () => {
  idx = (idx + 1) % THEMES.length;
  a1.style.background = THEMES[idx][0];
  a2.style.background = THEMES[idx][1];
});`,
  },
];

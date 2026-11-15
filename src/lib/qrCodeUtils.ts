import QRCode from 'qrcode';

export interface QrRenderOptions {
  sizePx?: number;
}

/**
 * Vẽ mã QR đen trên nền trắng trực tiếp trên trình duyệt (mức sửa lỗi H, viền trắng quiet zone 4 ô).
 * Không gọi bất kỳ dịch vụ mạng ngoài nào.
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  url: string,
  options: QrRenderOptions = {}
): Promise<void> {
  const sizePx = Math.max(240, options.sizePx ?? 248);
  await QRCode.toCanvas(canvas, url, {
    width: sizePx,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Tạo ảnh PNG tổng hợp gồm nền trắng, mã QR (sửa lỗi H), tên dự án và dòng chữ "Quét để tham gia".
 */
export async function buildCompositeQrCanvas(
  inviteUrl: string,
  projectTitle: string
): Promise<HTMLCanvasElement> {
  const qrCanvas = document.createElement('canvas');
  const qrSize = 480;
  await QRCode.toCanvas(qrCanvas, inviteUrl, {
    width: qrSize,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  const paddingX = 48;
  const paddingTop = 44;
  const footerHeight = 112;
  const width = qrSize + paddingX * 2;
  const height = paddingTop + qrSize + footerHeight;

  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d');
  if (!ctx) {
    throw new Error('Trình duyệt không hỗ trợ xuất ảnh Canvas.');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Khung viền nhẹ giữ độ tương phản khi lưu hoặc in
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  drawRoundedRectPath(ctx, 12, 12, width - 24, height - 24, 24);
  ctx.stroke();

  ctx.drawImage(qrCanvas, paddingX, paddingTop, qrSize, qrSize);

  const safeTitle = (projectTitle || 'Dự án nhóm Coderlive').trim();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 26px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  // Thu gọn tiêu đề nếu quá dài so với chiều ngang thẻ
  let displayTitle = safeTitle;
  const maxTextWidth = width - 80;
  while (ctx.measureText(displayTitle).width > maxTextWidth && displayTitle.length > 4) {
    displayTitle = displayTitle.slice(0, -2) + '…';
  }
  ctx.fillText(displayTitle, width / 2, paddingTop + qrSize + 38);

  ctx.fillStyle = '#4B5563';
  ctx.font = '600 20px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('Quét để tham gia', width / 2, paddingTop + qrSize + 76);

  return out;
}

export async function downloadQrPng(inviteUrl: string, projectTitle: string): Promise<void> {
  const canvas = await buildCompositeQrCanvas(inviteUrl, projectTitle);
  const slug =
    (projectTitle || 'du-an-nhom')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'du-an-nhom';

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `coderlive-qr-${slug}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyQrImageToClipboard(
  inviteUrl: string,
  projectTitle: string
): Promise<void> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.clipboard ||
    typeof navigator.clipboard.write !== 'function' ||
    typeof ClipboardItem === 'undefined'
  ) {
    throw new Error('Trình duyệt hiện tại không hỗ trợ sao chép ảnh trực tiếp.');
  }

  const canvas = await buildCompositeQrCanvas(inviteUrl, projectTitle);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) {
    throw new Error('Không thể tạo dữ liệu ảnh PNG.');
  }

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * In mã QR bằng iframe ẩn để không mở popup window.open trong môi trường iframe.
 */
export async function printQrCard(
  inviteUrl: string,
  projectTitle: string,
  roleLabel: string,
  expiryLabel: string
): Promise<void> {
  const canvas = await buildCompositeQrCanvas(inviteUrl, projectTitle);
  const dataUrl = canvas.toDataURL('image/png');

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Không thể khởi tạo khung in.');
  }

  doc.open();
  doc.write(`<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Mã QR - ${escapeHtml(projectTitle)}</title>
  <style>
    @page { size: auto; margin: 16mm; }
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      color: #111827;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .card {
      max-width: 420px;
      padding: 24px;
      border: 1px solid #d1d5db;
      border-radius: 16px;
    }
    img { width: 280px; height: auto; display: block; margin: 0 auto 12px; }
    .meta { font-size: 13px; color: #374151; margin: 6px 0; }
    .url { font-family: monospace; font-size: 11px; color: #4b5563; word-break: break-all; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <img src="${dataUrl}" alt="Mã QR tham gia ${escapeHtml(projectTitle)}" />
    <div class="meta">Vai trò mặc định: <strong>${escapeHtml(roleLabel)}</strong></div>
    <div class="meta">Thời hạn: ${escapeHtml(expiryLabel)}</div>
    <div class="url">${escapeHtml(inviteUrl)}</div>
  </div>
</body>
</html>`);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1500);
    }
  }, 150);
}

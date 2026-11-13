import { EffectColorMode, PatternType } from '../../types/theme';

export type PatternGroup = 'geometric' | 'floral';

export interface StaticPatternDefinition {
  id: PatternType;
  name: string;
  group: PatternGroup;
  description: string;
  defaultColors: [string, string, string];
  isFloral?: boolean;
}

export const STATIC_PATTERN_DEFINITIONS: StaticPatternDefinition[] = [
  // =========================================================================
  // 8 HỌA TIẾT HOA VĂN TĨNH (FLORAL INLINE SVG)
  // =========================================================================
  {
    id: 'floral-sakura',
    name: 'Hoa anh đào',
    group: 'floral',
    isFloral: true,
    description: 'Cánh hoa anh đào 5 cánh chẻ nhẹ mềm mại và nhị hồng',
    defaultColors: ['#fda4af', '#fbcfe8', '#be185d'],
  },
  {
    id: 'floral-peach',
    name: 'Hoa đào',
    group: 'floral',
    isFloral: true,
    description: 'Hoa đào xuân sắc hồng thắm 5 cánh tròn và nhị vàng',
    defaultColors: ['#f472b6', '#fbcfe8', '#facc15'],
  },
  {
    id: 'floral-apricot',
    name: 'Hoa mai',
    group: 'floral',
    isFloral: true,
    description: 'Hoa mai vàng rực ngày Tết cùng nhị cam ấm áp',
    defaultColors: ['#facc15', '#fef08a', '#ea580c'],
  },
  {
    id: 'floral-lotus',
    name: 'Hoa sen',
    group: 'floral',
    isFloral: true,
    description: 'Đài sen nhiều lớp cánh thanh tao cùng lá sen xanh',
    defaultColors: ['#f472b6', '#fbcfe8', '#34d399'],
  },
  {
    id: 'floral-sunflower',
    name: 'Hoa hướng dương',
    group: 'floral',
    isFloral: true,
    description: 'Hoa hướng dương tỏa cánh vàng rực và nhị nâu trầm',
    defaultColors: ['#fbbf24', '#fde047', '#78350f'],
  },
  {
    id: 'floral-rose',
    name: 'Hoa hồng',
    group: 'floral',
    isFloral: true,
    description: 'Hoa hồng xoắn đa tầng lãng mạn điểm xuyết lá xanh',
    defaultColors: ['#fb7185', '#fecdd3', '#10b981'],
  },
  {
    id: 'floral-lavender',
    name: 'Oải hương',
    group: 'floral',
    isFloral: true,
    description: 'Nhành hoa oải hương tím dịu nhẹ theo chiều dọc',
    defaultColors: ['#a78bfa', '#ddd6fe', '#34d399'],
  },
  {
    id: 'floral-foliage',
    name: 'Nhành lá',
    group: 'floral',
    isFloral: true,
    description: 'Cành lá botanical uốn lượn thanh mát',
    defaultColors: ['#34d399', '#6ee7b7', '#059669'],
  },

  // =========================================================================
  // 22 HỌA TIẾT HÌNH HỌC & CỔ ĐIỂN (STATIC SVG PATTERNS)
  // =========================================================================
  {
    id: 'stripes-v',
    name: 'Sọc dọc',
    group: 'geometric',
    description: 'Đường kẻ sọc đứng gọn gàng tối giản',
    defaultColors: ['#6366f1', '#a855f7', '#38bdf8'],
  },
  {
    id: 'stripes-h',
    name: 'Sọc ngang',
    group: 'geometric',
    description: 'Đường kẻ sọc ngang êm dịu',
    defaultColors: ['#6366f1', '#a855f7', '#38bdf8'],
  },
  {
    id: 'stripes-diag',
    name: 'Sọc chéo',
    group: 'geometric',
    description: 'Sọc chéo hiện đại tạo chiều sâu chuyển động',
    defaultColors: ['#6366f1', '#a855f7', '#38bdf8'],
  },
  {
    id: 'checker',
    name: 'Caro',
    group: 'geometric',
    description: 'Ô vuông caro xen kẽ cân đối',
    defaultColors: ['#6366f1', '#a855f7', '#38bdf8'],
  },
  {
    id: 'gingham',
    name: 'Vải Gingham',
    group: 'geometric',
    description: 'Họa tiết đan ngang dọc hai lớp cổ điển',
    defaultColors: ['#ec4899', '#f472b6', '#fbcfe8'],
  },
  {
    id: 'dots',
    name: 'Chấm bi',
    group: 'geometric',
    description: 'Chấm tròn đều đặn phong cách retro',
    defaultColors: ['#6366f1', '#a855f7', '#38bdf8'],
  },
  {
    id: 'dots-fine',
    name: 'Chấm mịn',
    group: 'geometric',
    description: 'Lưới chấm nhỏ tinh tế kiểu bản vẽ',
    defaultColors: ['#94a3b8', '#6366f1', '#38bdf8'],
  },
  {
    id: 'grid',
    name: 'Lưới',
    group: 'geometric',
    description: 'Lưới ô vuông kỹ thuật sắc nét',
    defaultColors: ['#6366f1', '#38bdf8', '#a855f7'],
  },
  {
    id: 'graph-paper',
    name: 'Giấy kẻ ô',
    group: 'geometric',
    description: 'Giấy ô ly kép nét chính và nét phụ',
    defaultColors: ['#38bdf8', '#6366f1', '#0ea5e9'],
  },
  {
    id: 'zigzag',
    name: 'Zigzag',
    group: 'geometric',
    description: 'Đường gấp khúc Chevron nhịp nhàng',
    defaultColors: ['#f59e0b', '#fbbf24', '#f97316'],
  },
  {
    id: 'waves',
    name: 'Sóng',
    group: 'geometric',
    description: 'Đường sóng mềm mại uyển chuyển',
    defaultColors: ['#06b6d4', '#38bdf8', '#0ea5e9'],
  },
  {
    id: 'hexagon',
    name: 'Lục giác',
    group: 'geometric',
    description: 'Lưới tổ ong lục giác hiện đại',
    defaultColors: ['#6366f1', '#10b981', '#38bdf8'],
  },
  {
    id: 'fishscale',
    name: 'Vảy cá',
    group: 'geometric',
    description: 'Vòm vảy cá xếp lớp cổ điển',
    defaultColors: ['#0ea5e9', '#38bdf8', '#6366f1'],
  },
  {
    id: 'seigaiha',
    name: 'Seigaiha',
    group: 'geometric',
    description: 'Sóng đồng tâm Nhật Bản truyền thống',
    defaultColors: ['#38bdf8', '#6366f1', '#a5b4fc'],
  },
  {
    id: 'asanoha',
    name: 'Asanoha',
    group: 'geometric',
    description: 'Họa tiết ngôi sao lá gai Nhật Bản',
    defaultColors: ['#a855f7', '#6366f1', '#ec4899'],
  },
  {
    id: 'diamond',
    name: 'Hình thoi',
    group: 'geometric',
    description: 'Lưới hình thoi đan chéo sang trọng',
    defaultColors: ['#6366f1', '#a855f7', '#38bdf8'],
  },
  {
    id: 'brick',
    name: 'Tường gạch',
    group: 'geometric',
    description: 'Đường mạch gạch xếp so le đều đặn',
    defaultColors: ['#f97316', '#fb923c', '#6366f1'],
  },
  {
    id: 'triangles',
    name: 'Tam giác',
    group: 'geometric',
    description: 'Khối tam giác hình học sắc nét',
    defaultColors: ['#10b981', '#06b6d4', '#6366f1'],
  },
  {
    id: 'cross',
    name: 'Dấu cộng',
    group: 'geometric',
    description: 'Dấu cộng tọa độ nhỏ gọn',
    defaultColors: ['#6366f1', '#38bdf8', '#94a3b8'],
  },
  {
    id: 'plus-grid',
    name: 'Lưới chữ thập',
    group: 'geometric',
    description: 'Mạng lưới chữ thập xen kẽ nhẹ nhàng',
    defaultColors: ['#6366f1', '#a855f7', '#38bdf8'],
  },
  {
    id: 'houndstooth',
    name: 'Răng sói',
    group: 'geometric',
    description: 'Họa tiết dệt răng sói cá tính',
    defaultColors: ['#6366f1', '#94a3b8', '#a855f7'],
  },
  {
    id: 'isometric',
    name: 'Khối 3D',
    group: 'geometric',
    description: 'Khối lập phương đẳng cự không gian 3 chiều',
    defaultColors: ['#6366f1', '#38bdf8', '#a855f7'],
  },
];

export function normalizePatternId(pattern?: PatternType): PatternType {
  if (!pattern || pattern === 'none') return 'none';
  if (pattern === 'stripes') return 'stripes-diag';
  if (pattern === 'sakura') return 'floral-sakura';
  if (pattern === 'squares') return 'checker';
  return pattern;
}

export interface FloralGeneratorParams {
  type:
    | 'floral-sakura'
    | 'floral-peach'
    | 'floral-apricot'
    | 'floral-lotus'
    | 'floral-sunflower'
    | 'floral-rose'
    | 'floral-lavender'
    | 'floral-foliage';
  petalCount: number;
  size: number;
  rotation: number;
  colors: [string, string, string];
  density: number;
}

/**
 * Sinh họa tiết hoa văn tĩnh dạng SVG nội tuyến theo tham số
 * (petalCount, size, rotation, colors, density) — không tải tài nguyên ngoài.
 */
export function buildFloralPatternSvg(params: FloralGeneratorParams): {
  svg: string;
  tileSize: number;
} {
  const { type, petalCount, size, rotation, colors, density } = params;
  const [c1, c2, c3] = colors;
  const clampedDensity = Math.max(0.5, Math.min(2, density));
  const tileSize = Math.round(130 / clampedDensity);
  const half = tileSize / 2;
  const flowerR = Math.max(10, Math.min(tileSize * 0.34, size));

  const drawFlowerHead = (cx: number, cy: number, r: number, rotDeg: number): string => {
    const parts: string[] = [];

    if (type === 'floral-sakura') {
      for (let i = 0; i < petalCount; i++) {
        const a = (360 / petalCount) * i;
        // Notched sakura petal
        const d = `M 0 0 C ${-r * 0.38} ${-r * 0.36}, ${-r * 0.44} ${-r * 0.88}, ${-r * 0.13} ${-r} L 0 ${-r * 0.84} L ${r * 0.13} ${-r} C ${r * 0.44} ${-r * 0.88}, ${r * 0.38} ${-r * 0.36}, 0 0 Z`;
        parts.push(`<path d="${d}" fill="${i % 2 === 0 ? c1 : c2}" fill-opacity="0.92" transform="rotate(${a})" />`);
      }
      parts.push(`<circle cx="0" cy="0" r="${r * 0.14}" fill="${c3}" />`);
      for (let i = 0; i < petalCount; i++) {
        const rad = (((360 / petalCount) * i + 18) * Math.PI) / 180;
        const sx = Math.cos(rad) * r * 0.25;
        const sy = Math.sin(rad) * r * 0.25;
        parts.push(`<line x1="0" y1="0" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}" stroke="${c3}" stroke-width="1" />`);
        parts.push(`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1.2" fill="${c3}" />`);
      }
    } else if (type === 'floral-peach' || type === 'floral-apricot') {
      for (let i = 0; i < petalCount; i++) {
        const a = (360 / petalCount) * i;
        parts.push(
          `<ellipse cx="0" cy="${(-r * 0.52).toFixed(1)}" rx="${(r * 0.31).toFixed(1)}" ry="${(r * 0.46).toFixed(1)}" fill="${i % 2 === 0 ? c1 : c2}" fill-opacity="0.92" transform="rotate(${a})" />`
        );
      }
      parts.push(`<circle cx="0" cy="0" r="${(r * 0.17).toFixed(1)}" fill="${c3}" />`);
      for (let i = 0; i < 6; i++) {
        const rad = ((60 * i) * Math.PI) / 180;
        const sx = Math.cos(rad) * r * 0.28;
        const sy = Math.sin(rad) * r * 0.28;
        parts.push(`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1.1" fill="${c3}" />`);
      }
    } else if (type === 'floral-lotus') {
      // Pad ring
      parts.push(`<circle cx="0" cy="0" r="${(r * 0.92).toFixed(1)}" fill="none" stroke="${c3}" stroke-opacity="0.4" stroke-width="1.4" stroke-dasharray="18 5" />`);
      const outerCount = Math.max(6, petalCount);
      for (let i = 0; i < outerCount; i++) {
        const a = (360 / outerCount) * i;
        const d = `M 0 0 Q ${(-r * 0.32).toFixed(1)} ${(-r * 0.55).toFixed(1)} 0 ${(-r * 0.96).toFixed(1)} Q ${(r * 0.32).toFixed(1)} ${(-r * 0.55).toFixed(1)} 0 0 Z`;
        parts.push(`<path d="${d}" fill="${c2}" fill-opacity="0.88" transform="rotate(${a})" />`);
      }
      for (let i = 0; i < outerCount; i++) {
        const a = (360 / outerCount) * i + 180 / outerCount;
        const d = `M 0 0 Q ${(-r * 0.25).toFixed(1)} ${(-r * 0.44).toFixed(1)} 0 ${(-r * 0.76).toFixed(1)} Q ${(r * 0.25).toFixed(1)} ${(-r * 0.44).toFixed(1)} 0 0 Z`;
        parts.push(`<path d="${d}" fill="${c1}" fill-opacity="0.92" transform="rotate(${a})" />`);
      }
      parts.push(`<circle cx="0" cy="0" r="${(r * 0.16).toFixed(1)}" fill="${c3}" />`);
    } else if (type === 'floral-sunflower') {
      const rays = Math.max(12, petalCount);
      for (let i = 0; i < rays; i++) {
        const a = (360 / rays) * i;
        const d = `M 0 0 Q ${(-r * 0.16).toFixed(1)} ${(-r * 0.55).toFixed(1)} 0 ${(-r).toFixed(1)} Q ${(r * 0.16).toFixed(1)} ${(-r * 0.55).toFixed(1)} 0 0 Z`;
        parts.push(`<path d="${d}" fill="${i % 2 === 0 ? c1 : c2}" fill-opacity="0.94" transform="rotate(${a})" />`);
      }
      parts.push(`<circle cx="0" cy="0" r="${(r * 0.34).toFixed(1)}" fill="${c3}" />`);
      parts.push(`<circle cx="0" cy="0" r="${(r * 0.22).toFixed(1)}" fill="none" stroke="${c1}" stroke-opacity="0.55" stroke-width="1" stroke-dasharray="2 2.5" />`);
    } else if (type === 'floral-rose') {
      // Leaves behind rose
      parts.push(`<ellipse cx="${(-r * 0.52).toFixed(1)}" cy="${(r * 0.44).toFixed(1)}" rx="${(r * 0.34).toFixed(1)}" ry="${(r * 0.16).toFixed(1)}" fill="${c3}" fill-opacity="0.72" transform="rotate(-35)" />`);
      parts.push(`<ellipse cx="${(r * 0.52).toFixed(1)}" cy="${(r * 0.44).toFixed(1)}" rx="${(r * 0.34).toFixed(1)}" ry="${(r * 0.16).toFixed(1)}" fill="${c3}" fill-opacity="0.72" transform="rotate(35)" />`);
      for (let i = 0; i < 5; i++) {
        const a = 72 * i;
        parts.push(`<circle cx="0" cy="${(-r * 0.42).toFixed(1)}" r="${(r * 0.38).toFixed(1)}" fill="${c2}" fill-opacity="0.82" transform="rotate(${a})" />`);
      }
      for (let i = 0; i < 4; i++) {
        const a = 90 * i + 22;
        parts.push(`<circle cx="0" cy="${(-r * 0.24).toFixed(1)}" r="${(r * 0.26).toFixed(1)}" fill="${c1}" fill-opacity="0.92" transform="rotate(${a})" />`);
      }
      parts.push(`<circle cx="0" cy="0" r="${(r * 0.2).toFixed(1)}" fill="${c1}" />`);
      parts.push(`<path d="M ${(-r * 0.12).toFixed(1)} 0 A ${(r * 0.12).toFixed(1)} ${(r * 0.12).toFixed(1)} 0 1 1 ${(r * 0.1).toFixed(1)} ${(r * 0.08).toFixed(1)}" fill="none" stroke="${c2}" stroke-width="1.3" stroke-linecap="round" />`);
    } else if (type === 'floral-lavender') {
      parts.push(`<path d="M 0 ${(r * 0.95).toFixed(1)} Q ${(r * 0.08).toFixed(1)} 0 0 ${(-r * 0.95).toFixed(1)}" fill="none" stroke="${c3}" stroke-width="1.6" stroke-linecap="round" />`);
      for (let i = -3; i <= 3; i++) {
        const yy = i * r * 0.22 - r * 0.1;
        const spread = (4 - Math.abs(i)) * r * 0.06 + r * 0.1;
        parts.push(`<ellipse cx="${(-spread).toFixed(1)}" cy="${yy.toFixed(1)}" rx="${(r * 0.16).toFixed(1)}" ry="${(r * 0.1).toFixed(1)}" fill="${i % 2 === 0 ? c1 : c2}" transform="rotate(-25 ${(-spread).toFixed(1)} ${yy.toFixed(1)})" />`);
        parts.push(`<ellipse cx="${spread.toFixed(1)}" cy="${(yy + 2).toFixed(1)}" rx="${(r * 0.16).toFixed(1)}" ry="${(r * 0.1).toFixed(1)}" fill="${i % 2 === 0 ? c2 : c1}" transform="rotate(25 ${spread.toFixed(1)} ${(yy + 2).toFixed(1)})" />`);
      }
      parts.push(`<ellipse cx="0" cy="${(-r * 0.92).toFixed(1)}" rx="${(r * 0.11).toFixed(1)}" ry="${(r * 0.18).toFixed(1)}" fill="${c1}" />`);
    } else {
      // floral-foliage
      parts.push(`<path d="M 0 ${(r * 0.95).toFixed(1)} Q ${(r * 0.15).toFixed(1)} 0 ${(r * 0.04).toFixed(1)} ${(-r * 0.95).toFixed(1)}" fill="none" stroke="${c3}" stroke-width="1.8" stroke-linecap="round" />`);
      for (let i = -2; i <= 2; i++) {
        const yy = i * r * 0.3;
        const side = i % 2 === 0 ? 1 : -1;
        parts.push(
          `<ellipse cx="${(side * r * 0.34).toFixed(1)}" cy="${yy.toFixed(1)}" rx="${(r * 0.34).toFixed(1)}" ry="${(r * 0.14).toFixed(1)}" fill="${i % 2 === 0 ? c1 : c2}" fill-opacity="0.88" transform="rotate(${side * -30} ${(side * r * 0.34).toFixed(1)} ${yy.toFixed(1)})" />`
        );
      }
    }

    return `<g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${rotDeg.toFixed(1)})">${parts.join('')}</g>`;
  };

  // Place primary flower + staggered corner offset flower so repeating tiles feel organic
  const mainFlower = drawFlowerHead(half * 0.56, half * 0.56, flowerR, rotation);
  const subFlower = drawFlowerHead(tileSize * 0.78, tileSize * 0.76, flowerR * 0.72, rotation + 28);
  const dot1 = `<circle cx="${(tileSize * 0.82).toFixed(1)}" cy="${(tileSize * 0.24).toFixed(1)}" r="1.8" fill="${c2}" fill-opacity="0.6" />`;
  const dot2 = `<circle cx="${(tileSize * 0.22).toFixed(1)}" cy="${(tileSize * 0.82).toFixed(1)}" r="1.5" fill="${c1}" fill-opacity="0.55" />`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${tileSize} ${tileSize}">${mainFlower}${subFlower}${dot1}${dot2}</svg>`;
  return { svg, tileSize };
}

function buildGeometricTileSvg(
  type: PatternType,
  c1: string,
  c2: string,
  c3: string
): { svg: string; tileSize: number } {
  let tileSize = 40;
  let body = '';

  switch (type) {
    case 'stripes-v':
      tileSize = 24;
      body = `<rect x="0" y="0" width="2" height="24" fill="${c1}" /><rect x="12" y="0" width="1" height="24" fill="${c2}" fill-opacity="0.45" />`;
      break;
    case 'stripes-h':
      tileSize = 24;
      body = `<rect x="0" y="0" width="24" height="2" fill="${c1}" /><rect x="0" y="12" width="24" height="1" fill="${c2}" fill-opacity="0.45" />`;
      break;
    case 'stripes-diag':
      tileSize = 24;
      body = `<path d="M-6 6 L6 -6 M0 24 L24 0 M18 30 L30 18" stroke="${c1}" stroke-width="2" /><path d="M-6 18 L18 -6 M6 30 L30 6" stroke="${c2}" stroke-opacity="0.4" stroke-width="1" />`;
      break;
    case 'checker':
      tileSize = 40;
      body = `<rect x="0" y="0" width="20" height="20" fill="${c1}" fill-opacity="0.5" /><rect x="20" y="20" width="20" height="20" fill="${c1}" fill-opacity="0.5" />`;
      break;
    case 'gingham':
      tileSize = 40;
      body = `<rect x="0" y="0" width="20" height="40" fill="${c1}" fill-opacity="0.35" /><rect x="0" y="0" width="40" height="20" fill="${c2}" fill-opacity="0.35" />`;
      break;
    case 'dots':
      tileSize = 32;
      body = `<circle cx="8" cy="8" r="3.2" fill="${c1}" /><circle cx="24" cy="24" r="3.2" fill="${c2}" fill-opacity="0.8" />`;
      break;
    case 'dots-fine':
      tileSize = 20;
      body = `<circle cx="10" cy="10" r="1.3" fill="${c1}" />`;
      break;
    case 'grid':
      tileSize = 32;
      body = `<path d="M 32 0 L 0 0 0 32" fill="none" stroke="${c1}" stroke-width="1" />`;
      break;
    case 'graph-paper':
      tileSize = 64;
      body = `<path d="M 16 0 V 64 M 32 0 V 64 M 48 0 V 64 M 0 16 H 64 M 0 32 H 64 M 0 48 H 64" stroke="${c2}" stroke-opacity="0.38" stroke-width="0.7" /><path d="M 64 0 L 0 0 0 64" fill="none" stroke="${c1}" stroke-width="1.3" />`;
      break;
    case 'zigzag':
      tileSize = 40;
      body = `<path d="M0 10 L10 0 L20 10 L30 0 L40 10 M0 30 L10 20 L20 30 L30 20 L40 30" fill="none" stroke="${c1}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />`;
      break;
    case 'waves':
      tileSize = 48;
      body = `<path d="M0 12 Q12 2 24 12 T48 12 M0 36 Q12 26 24 36 T48 36" fill="none" stroke="${c1}" stroke-width="1.6" stroke-linecap="round" />`;
      break;
    case 'hexagon':
      tileSize = 56;
      body = `<path d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M0 48 L28 32 L56 48 M28 0 L28 32" fill="none" stroke="${c1}" stroke-width="1.2" />`;
      return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="64" viewBox="0 0 56 64">${body}</svg>`,
        tileSize: 56,
      };
    case 'fishscale':
      tileSize = 40;
      body = `<path d="M0 20 A20 20 0 0 1 40 20 M-20 40 A20 20 0 0 1 20 40 M20 40 A20 20 0 0 1 60 40" fill="none" stroke="${c1}" stroke-width="1.4" />`;
      break;
    case 'seigaiha':
      tileSize = 52;
      body = `<g fill="none" stroke="${c1}" stroke-width="1.15"><circle cx="26" cy="52" r="24" /><circle cx="26" cy="52" r="17" /><circle cx="26" cy="52" r="10" /><circle cx="0" cy="26" r="24" /><circle cx="0" cy="26" r="17" /><circle cx="0" cy="26" r="10" /><circle cx="52" cy="26" r="24" /><circle cx="52" cy="26" r="17" /><circle cx="52" cy="26" r="10" /></g>`;
      break;
    case 'asanoha':
      tileSize = 48;
      body = `<g fill="none" stroke="${c1}" stroke-width="1"><polygon points="24,0 48,24 24,48 0,24" /><line x1="24" y1="0" x2="24" y2="48" /><line x1="0" y1="24" x2="48" y2="24" /><line x1="0" y1="0" x2="48" y2="48" stroke-opacity="0.55" /><line x1="48" y1="0" x2="0" y2="48" stroke-opacity="0.55" /></g>`;
      break;
    case 'diamond':
      tileSize = 36;
      body = `<path d="M18 0 L36 18 L18 36 L0 18 Z" fill="none" stroke="${c1}" stroke-width="1.3" /><circle cx="18" cy="18" r="2" fill="${c2}" />`;
      break;
    case 'brick':
      tileSize = 48;
      body = `<path d="M0 0 H48 M0 24 H48 M24 0 V24 M0 24 V48 M48 24 V48" fill="none" stroke="${c1}" stroke-width="1.2" />`;
      break;
    case 'triangles':
      tileSize = 40;
      body = `<polygon points="20,4 36,36 4,36" fill="none" stroke="${c1}" stroke-width="1.3" /><polygon points="0,0 16,0 8,16" fill="${c2}" fill-opacity="0.35" />`;
      break;
    case 'cross':
      tileSize = 32;
      body = `<path d="M16 11 V21 M11 16 H21" stroke="${c1}" stroke-width="1.6" stroke-linecap="round" />`;
      break;
    case 'plus-grid':
      tileSize = 40;
      body = `<path d="M20 13 V27 M13 20 H27" stroke="${c1}" stroke-width="1.4" stroke-linecap="round" /><path d="M0 -6 V6 M-6 0 H6 M40 -6 V6 M34 0 H46 M0 34 V46 M-6 40 H6 M40 34 V46 M34 40 H46" stroke="${c2}" stroke-opacity="0.55" stroke-width="1.2" />`;
      break;
    case 'houndstooth':
      tileSize = 32;
      body = `<path d="M0 0 H16 L8 8 H0 Z M16 0 L32 16 V8 L24 0 Z M8 8 L16 16 V24 L8 16 Z M16 16 H32 L24 24 H16 Z M0 16 L16 32 H8 L0 24 Z" fill="${c1}" fill-opacity="0.45" />`;
      break;
    case 'isometric':
      tileSize = 48;
      body = `<path d="M24 0 L48 14 V42 L24 56 L0 42 V14 Z M0 14 L24 28 L48 14 M24 28 V56" fill="none" stroke="${c1}" stroke-width="1.15" /><polygon points="24,0 48,14 24,28 0,14" fill="${c2}" fill-opacity="0.22" /><polygon points="24,28 48,14 48,42 24,56" fill="${c3}" fill-opacity="0.16" />`;
      return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">${body}</svg>`,
        tileSize: 48,
      };
    default:
      return { svg: '', tileSize: 40 };
  }

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${tileSize} ${tileSize}">${body}</svg>`,
    tileSize,
  };
}

export interface StaticPatternOptions {
  patternType: PatternType;
  opacity?: number;
  scale?: number;
  angle?: number;
  density?: number;
  colorMode?: EffectColorMode;
  customColor?: string;
  accentColor: string;
  accentColor2?: string;
  vignette?: boolean;
}

export interface StaticPatternResult {
  backgroundImage: string;
  backgroundSize: string;
  opacity: number;
  maskImage?: string;
}

/**
 * Tạo chuỗi CSS inline SVG data URL hoàn chỉnh cho lớp họa tiết tĩnh.
 * Luôn giới hạn độ mờ tối đa 60% (0.60) để không lấn át nội dung làm việc.
 */
export function buildStaticPatternStyle(options: StaticPatternOptions): StaticPatternResult | null {
  const normalized = normalizePatternId(options.patternType);
  if (!normalized || normalized === 'none') return null;

  const def = STATIC_PATTERN_DEFINITIONS.find((d) => d.id === normalized);
  if (!def) return null;

  // Hard cap 60% opacity
  const opacity = Math.max(0.02, Math.min(0.6, options.opacity ?? 0.22));
  const scale = Math.max(0.4, Math.min(2.5, options.scale ?? 1));
  const angle = ((options.angle ?? 0) % 360 + 360) % 360;
  const density = Math.max(0.5, Math.min(2.0, options.density ?? 1));

  let colors: [string, string, string] = def.defaultColors;
  if (options.colorMode === 'accent') {
    colors = [options.accentColor, options.accentColor2 || options.accentColor, options.accentColor];
  } else if (options.colorMode === 'custom' && options.customColor) {
    colors = [options.customColor, options.accentColor2 || options.customColor, options.customColor];
  }

  let innerSvg = '';
  let tileW = 40;

  if (def.isFloral) {
    const petalCount = normalized === 'floral-sunflower' ? 14 : normalized === 'floral-lotus' ? 8 : 5;
    const baseFlowerSize = normalized === 'floral-sunflower' ? 28 : normalized === 'floral-lotus' ? 26 : 23;
    const floral = buildFloralPatternSvg({
      type: normalized as FloralGeneratorParams['type'],
      petalCount,
      size: baseFlowerSize,
      rotation: angle,
      colors,
      density,
    });
    innerSvg = floral.svg;
    tileW = floral.tileSize;
  } else {
    const geom = buildGeometricTileSvg(normalized, colors[0], colors[1], colors[2]);
    innerSvg = geom.svg;
    tileW = Math.round(geom.tileSize / Math.pow(density, 0.4));
  }

  if (!innerSvg) return null;

  // Wrap inside <pattern patternTransform="rotate(...)"> when angle != 0 for non-floral geometric tiles
  let finalSvg = innerSvg;
  let finalSizePx = Math.round(tileW * scale);

  if (!def.isFloral && angle !== 0) {
    const innerContentMatch = innerSvg.match(/<svg[^>]*viewBox="0 0 (\d+) (\d+)"[^>]*>([\s\S]*)<\/svg>/);
    if (innerContentMatch) {
      const vw = Number(innerContentMatch[1]);
      const vh = Number(innerContentMatch[2]);
      const inner = innerContentMatch[3];
      const canvasDim = Math.max(256, Math.round(tileW * scale * 4));
      finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasDim}" height="${canvasDim}" viewBox="0 0 ${canvasDim} ${canvasDim}"><defs><pattern id="p" width="${vw}" height="${vh}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle}) scale(${scale.toFixed(2)})">${inner}</pattern></defs><rect width="100%" height="100%" fill="url(#p)" /></svg>`;
      finalSizePx = canvasDim;
    }
  }

  const encoded = encodeURIComponent(finalSvg);
  const backgroundImage = `url("data:image/svg+xml;utf8,${encoded}")`;
  const maskImage = options.vignette
    ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,1) 100%)'
    : undefined;

  return {
    backgroundImage,
    backgroundSize: `${finalSizePx}px auto`,
    opacity,
    maskImage,
  };
}

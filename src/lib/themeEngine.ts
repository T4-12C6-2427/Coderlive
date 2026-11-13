import { ThemePreset, ThemeSettings, RadiusStyle, DensityStyle, FpsCorner } from '../types/theme';
import { migrateLegacyStorageKeys } from './storageMigration';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Xanh thẳm đêm khuya, điểm nhấn tím violet nhẹ nhàng, chiều sâu tinh tế',
    type: 'dark',
    bgApp: '#090b14',
    bgPanel: '#0f1322',
    bgElevated: '#171c32',
    bgInput: '#13182b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    borderDefault: 'rgba(255, 255, 255, 0.11)',
    borderStrong: 'rgba(255, 255, 255, 0.20)',
    accent: '#6366f1', // Indigo violet
    accent2: '#a855f7', // Purple
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#0b0e1b',
    codeGutter: '#080a13',
    codeSelection: 'rgba(99, 102, 241, 0.28)',
    codeLineHighlight: 'rgba(99, 102, 241, 0.08)',
    synKeyword: '#c084fc',
    synTag: '#f43f5e',
    synAttr: '#38bdf8',
    synString: '#34d399',
    synNumber: '#fbbf24',
    synFunction: '#60a5fa',
    synComment: '#64748b',
    synProperty: '#38bdf8',
    synValue: '#f472b6',
    fontUi: 'Inter, system-ui, sans-serif',
    fontCode: "'JetBrains Mono', monospace",
  },
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Xám than trung tính tối giản, không ám màu, đường nét sắc bén 6px',
    type: 'dark',
    bgApp: '#121214',
    bgPanel: '#18181b',
    bgElevated: '#242427',
    bgInput: '#1c1c1f',
    textPrimary: '#f4f4f5',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    borderDefault: 'rgba(255, 255, 255, 0.12)',
    borderStrong: 'rgba(255, 255, 255, 0.22)',
    accent: '#38bdf8', // Sky cyan
    accent2: '#0ea5e9',
    radius: 'sm',
    density: 'compact',
    surfaceStyle: 'bordered',
    tintNeutralsDefault: false,
    codeBg: '#151518',
    codeGutter: '#101012',
    codeSelection: 'rgba(56, 189, 248, 0.25)',
    codeLineHighlight: 'rgba(255, 255, 255, 0.04)',
    synKeyword: '#f472b6',
    synTag: '#fb7185',
    synAttr: '#7dd3fc',
    synString: '#4ade80',
    synNumber: '#facc15',
    synFunction: '#38bdf8',
    synComment: '#71717a',
    synProperty: '#a5b4fc',
    synValue: '#f43f5e',
    fontUi: 'system-ui, -apple-system, sans-serif',
    fontCode: "'JetBrains Mono', monospace",
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Nền xanh mòng két cực quang huyền ảo, điểm nhấn xanh ngọc lục bảo và kính mờ',
    type: 'dark',
    bgApp: '#041c18',
    bgPanel: '#082823',
    bgElevated: '#0f3831',
    bgInput: '#0a302a',
    textPrimary: '#e6fffa',
    textSecondary: '#81e6d9',
    textMuted: '#4da699',
    borderSubtle: 'rgba(16, 185, 129, 0.12)',
    borderDefault: 'rgba(16, 185, 129, 0.22)',
    borderStrong: 'rgba(16, 185, 129, 0.35)',
    accent: '#10b981', // Emerald
    accent2: '#06b6d4', // Cyan
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#05221d',
    codeGutter: '#031714',
    codeSelection: 'rgba(16, 185, 129, 0.30)',
    codeLineHighlight: 'rgba(16, 185, 129, 0.10)',
    synKeyword: '#2dd4bf',
    synTag: '#34d399',
    synAttr: '#38bdf8',
    synString: '#a7f3d0',
    synNumber: '#fde047',
    synFunction: '#6ee7b7',
    synComment: '#4da699',
    synProperty: '#67e8f9',
    synValue: '#5eead4',
    fontUi: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Hoàng hôn ấm áp, nền nâu tím sẫm, điểm nhấn cam đào và hồng ấm',
    type: 'dark',
    bgApp: '#190e14',
    bgPanel: '#24141d',
    bgElevated: '#331c29',
    bgInput: '#2a1722',
    textPrimary: '#fff1f2',
    textSecondary: '#fda4af',
    textMuted: '#be7887',
    borderSubtle: 'rgba(244, 63, 94, 0.12)',
    borderDefault: 'rgba(244, 63, 94, 0.22)',
    borderStrong: 'rgba(244, 63, 94, 0.36)',
    accent: '#f97316', // Orange
    accent2: '#f43f5e', // Rose
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#1f1119',
    codeGutter: '#160b11',
    codeSelection: 'rgba(249, 115, 22, 0.32)',
    codeLineHighlight: 'rgba(244, 63, 94, 0.08)',
    synKeyword: '#fb7185',
    synTag: '#f97316',
    synAttr: '#fcd34d',
    synString: '#fda4af',
    synNumber: '#fdba74',
    synFunction: '#f43f5e',
    synComment: '#be7887',
    synProperty: '#fca5a5',
    synValue: '#fb923c',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'Fira Code', monospace",
  },
  {
    id: 'sakura',
    name: 'Sakura',
    description: 'Hoa anh đào sáng trong trẻo, hồng phấn pastel dịu dàng, bo góc tròn',
    type: 'light',
    bgApp: '#fff5f7',
    bgPanel: '#ffffff',
    bgElevated: '#ffebee',
    bgInput: '#fff8f9',
    textPrimary: '#4a1525',
    textSecondary: '#783549',
    textMuted: '#a06073',
    borderSubtle: 'rgba(244, 63, 94, 0.08)',
    borderDefault: 'rgba(244, 63, 94, 0.16)',
    borderStrong: 'rgba(244, 63, 94, 0.28)',
    accent: '#ec4899', // Pink
    accent2: '#f43f5e', // Rose
    radius: 'lg',
    density: 'spacious',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fffbfd',
    codeGutter: '#fff0f3',
    codeSelection: 'rgba(236, 72, 153, 0.18)',
    codeLineHighlight: 'rgba(236, 72, 153, 0.06)',
    synKeyword: '#be185d',
    synTag: '#db2777',
    synAttr: '#e11d48',
    synString: '#059669',
    synNumber: '#d97706',
    synFunction: '#b91c1c',
    synComment: '#a06073',
    synProperty: '#c026d3',
    synValue: '#be123c',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
  },
  {
    id: 'paper',
    name: 'Paper',
    description: 'Giấy in cổ điển ấm áp, mực đen trang nhã, phẳng mịn giúp mắt thư giãn tối đa',
    type: 'light',
    bgApp: '#fbf9f4',
    bgPanel: '#ffffff',
    bgElevated: '#f4ede1',
    bgInput: '#fcfaf6',
    textPrimary: '#1c1917',
    textSecondary: '#44403c',
    textMuted: '#78716c',
    borderSubtle: 'rgba(0, 0, 0, 0.06)',
    borderDefault: 'rgba(0, 0, 0, 0.12)',
    borderStrong: 'rgba(0, 0, 0, 0.24)',
    accent: '#d97706', // Warm amber / ochre
    accent2: '#b45309',
    radius: 'sm',
    density: 'comfortable',
    surfaceStyle: 'flat',
    tintNeutralsDefault: true,
    codeBg: '#fdfcf9',
    codeGutter: '#f5eee3',
    codeSelection: 'rgba(217, 119, 6, 0.18)',
    codeLineHighlight: 'rgba(0, 0, 0, 0.03)',
    synKeyword: '#b45309',
    synTag: '#c2410c',
    synAttr: '#7c2d12',
    synString: '#15803d',
    synNumber: '#854d0e',
    synFunction: '#1e40af',
    synComment: '#78716c',
    synProperty: '#4338ca',
    synValue: '#9a3412',
    fontUi: "'Be Vietnam Pro', serif, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Đại dương xanh mát rực rỡ, bề mặt thẻ trắng thanh thoát, bóng đổ xanh mềm',
    type: 'light',
    bgApp: '#f0f7ff',
    bgPanel: '#ffffff',
    bgElevated: '#e0effe',
    bgInput: '#f8fbff',
    textPrimary: '#0c2340',
    textSecondary: '#1e4976',
    textMuted: '#527c9f',
    borderSubtle: 'rgba(2, 132, 199, 0.08)',
    borderDefault: 'rgba(2, 132, 199, 0.18)',
    borderStrong: 'rgba(2, 132, 199, 0.32)',
    accent: '#0284c7', // Ocean Blue
    accent2: '#0d9488', // Teal
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fafcff',
    codeGutter: '#e8f3ff',
    codeSelection: 'rgba(2, 132, 199, 0.18)',
    codeLineHighlight: 'rgba(2, 132, 199, 0.05)',
    synKeyword: '#0369a1',
    synTag: '#0284c7',
    synAttr: '#0e7490',
    synString: '#047857',
    synNumber: '#b45309',
    synFunction: '#1d4ed8',
    synComment: '#64748b',
    synProperty: '#4f46e5',
    synValue: '#0f766e',
    fontUi: 'Inter, system-ui, sans-serif',
    fontCode: "'JetBrains Mono', monospace",
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Rừng nguyên sinh sâu thẳm, sắc xanh thiên nhiên, mang lại cảm giác bình yên',
    type: 'dark',
    bgApp: '#08170e',
    bgPanel: '#0e2417',
    bgElevated: '#173623',
    bgInput: '#102a1c',
    textPrimary: '#ecfdf5',
    textSecondary: '#a7f3d0',
    textMuted: '#6ee7b7',
    borderSubtle: 'rgba(34, 197, 94, 0.10)',
    borderDefault: 'rgba(34, 197, 94, 0.20)',
    borderStrong: 'rgba(34, 197, 94, 0.32)',
    accent: '#22c55e', // Green
    accent2: '#14b8a6', // Teal
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#0b1d12',
    codeGutter: '#06130b',
    codeSelection: 'rgba(34, 197, 94, 0.25)',
    codeLineHighlight: 'rgba(34, 197, 94, 0.08)',
    synKeyword: '#4ade80',
    synTag: '#22c55e',
    synAttr: '#2dd4bf',
    synString: '#86efac',
    synNumber: '#fde047',
    synFunction: '#6ee7b7',
    synComment: '#5b8c6e',
    synProperty: '#5eead4',
    synValue: '#a3e635',
    fontUi: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontCode: "'Fira Code', monospace",
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Cyberpunk đen tuyền cực độ, tương phản rực rỡ magenta và cyan, viền sáng phát quang',
    type: 'dark',
    bgApp: '#050508',
    bgPanel: '#0a0a10',
    bgElevated: '#12121e',
    bgInput: '#0d0d17',
    textPrimary: '#ffffff',
    textSecondary: '#d8b4fe',
    textMuted: '#9333ea',
    borderSubtle: 'rgba(236, 72, 153, 0.20)',
    borderDefault: 'rgba(236, 72, 153, 0.40)',
    borderStrong: 'rgba(6, 182, 212, 0.60)',
    accent: '#f43f5e', // Hot magenta / Rose
    accent2: '#06b6d4', // Cyan glow
    radius: 'sm',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: false,
    codeBg: '#07070b',
    codeGutter: '#040407',
    codeSelection: 'rgba(244, 63, 94, 0.40)',
    codeLineHighlight: 'rgba(6, 182, 212, 0.12)',
    synKeyword: '#ff2d75',
    synTag: '#00f0ff',
    synAttr: '#fde047',
    synString: '#4ade80',
    synNumber: '#fb923c',
    synFunction: '#c084fc',
    synComment: '#7e22ce',
    synProperty: '#38bdf8',
    synValue: '#ff3366',
    fontUi: "'JetBrains Mono', monospace",
    fontCode: "'JetBrains Mono', monospace",
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Giao diện dòng lệnh hacker đen tuyền, chữ xanh phosphor ma trận, góc vuông vức',
    type: 'dark',
    bgApp: '#000000',
    bgPanel: '#050805',
    bgElevated: '#0c120c',
    bgInput: '#070c07',
    textPrimary: '#22c55e',
    textSecondary: '#16a34a',
    textMuted: '#15803d',
    borderSubtle: 'rgba(34, 197, 94, 0.20)',
    borderDefault: 'rgba(34, 197, 94, 0.35)',
    borderStrong: 'rgba(34, 197, 94, 0.60)',
    accent: '#22c55e', // Matrix Green
    accent2: '#4ade80',
    radius: 'none',
    density: 'compact',
    surfaceStyle: 'bordered',
    tintNeutralsDefault: false,
    codeBg: '#020402',
    codeGutter: '#000000',
    codeSelection: 'rgba(34, 197, 94, 0.35)',
    codeLineHighlight: 'rgba(34, 197, 94, 0.12)',
    synKeyword: '#4ade80',
    synTag: '#22c55e',
    synAttr: '#86efac',
    synString: '#bbf7d0',
    synNumber: '#facc15',
    synFunction: '#22c55e',
    synComment: '#166534',
    synProperty: '#86efac',
    synValue: '#4ade80',
    fontUi: "'JetBrains Mono', monospace",
    fontCode: "'JetBrains Mono', monospace",
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Băng đảo Bắc Âu lạnh thanh khiết, xanh xám tuyết phủ, tông màu pastel nhã nhặn',
    type: 'dark',
    bgApp: '#242933',
    bgPanel: '#2e3440',
    bgElevated: '#3b4252',
    bgInput: '#353c4a',
    textPrimary: '#eceff4',
    textSecondary: '#d8dee9',
    textMuted: '#4c566a',
    borderSubtle: 'rgba(236, 239, 244, 0.08)',
    borderDefault: 'rgba(236, 239, 244, 0.15)',
    borderStrong: 'rgba(236, 239, 244, 0.25)',
    accent: '#88c0d0', // Nord Frost cyan
    accent2: '#81a1c1', // Nord Blue
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'flat',
    tintNeutralsDefault: true,
    codeBg: '#2e3440',
    codeGutter: '#242933',
    codeSelection: 'rgba(136, 192, 208, 0.25)',
    codeLineHighlight: 'rgba(136, 192, 208, 0.08)',
    synKeyword: '#81a1c1',
    synTag: '#88c0d0',
    synAttr: '#8fbcbb',
    synString: '#a3be8c',
    synNumber: '#b48ead',
    synFunction: '#88c0d0',
    synComment: '#616e88',
    synProperty: '#8fbcbb',
    synValue: '#ebcb8b',
    fontUi: "'Inter', system-ui, sans-serif",
    fontCode: "'Fira Code', monospace",
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Chủ đề huyền thoại của lập trình viên: nền tím đen ma mị, điểm nhấn hồng tím rực lửa',
    type: 'dark',
    bgApp: '#21222c',
    bgPanel: '#282a36',
    bgElevated: '#343746',
    bgInput: '#2d303e',
    textPrimary: '#f8f8f2',
    textSecondary: '#bd93f9',
    textMuted: '#6272a4',
    borderSubtle: 'rgba(189, 147, 249, 0.12)',
    borderDefault: 'rgba(189, 147, 249, 0.24)',
    borderStrong: 'rgba(255, 121, 198, 0.38)',
    accent: '#ff79c6', // Dracula Pink
    accent2: '#bd93f9', // Dracula Purple
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#282a36',
    codeGutter: '#1e1f29',
    codeSelection: 'rgba(255, 121, 198, 0.25)',
    codeLineHighlight: 'rgba(255, 121, 198, 0.08)',
    synKeyword: '#ff79c6',
    synTag: '#ff79c6',
    synAttr: '#50fa7b',
    synString: '#f1fa8c',
    synNumber: '#bd93f9',
    synFunction: '#50fa7b',
    synComment: '#6272a4',
    synProperty: '#66d9ef',
    synValue: '#ffb86c',
    fontUi: "'Fira Code', sans-serif",
    fontCode: "'Fira Code', monospace",
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Độ tương phản tuyệt đối theo tiêu chuẩn WCAG AAA, viền nét rõ, vàng rực dễ nhận biết',
    type: 'dark',
    categories: ['contrast'],
    bgApp: '#000000',
    bgPanel: '#0a0a0a',
    bgElevated: '#171717',
    bgInput: '#121212',
    textPrimary: '#ffffff',
    textSecondary: '#facc15',
    textMuted: '#a3a3a3',
    borderSubtle: 'rgba(255, 255, 255, 0.25)',
    borderDefault: 'rgba(255, 255, 255, 0.50)',
    borderStrong: '#ffffff',
    accent: '#facc15', // High Contrast Gold Yellow
    accent2: '#38bdf8',
    radius: 'none',
    density: 'spacious',
    surfaceStyle: 'bordered',
    tintNeutralsDefault: false,
    codeBg: '#050505',
    codeGutter: '#000000',
    codeSelection: 'rgba(250, 204, 21, 0.40)',
    codeLineHighlight: 'rgba(255, 255, 255, 0.15)',
    synKeyword: '#facc15',
    synTag: '#38bdf8',
    synAttr: '#4ade80',
    synString: '#f43f5e',
    synNumber: '#fb923c',
    synFunction: '#38bdf8',
    synComment: '#a3a3a3',
    synProperty: '#ffffff',
    synValue: '#facc15',
    fontUi: 'system-ui, -apple-system, sans-serif',
    fontCode: "'JetBrains Mono', monospace",
  },
  // =========================================================================
  // 19 MẪU HOA VĂN & HIỆU ỨNG ĐỘNG (STAGE 3)
  // =========================================================================
  {
    id: 'sakura-night',
    name: 'Vườn Anh Đào Đêm',
    description: 'Đêm xuân tím sẫm điểm hoa anh đào tĩnh và cánh đào rơi lấp lánh ánh sao',
    type: 'dark',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#140c18',
    bgPanel: '#1e1224',
    bgElevated: '#2a1933',
    bgInput: '#23152a',
    textPrimary: '#fdf2f8',
    textSecondary: '#f9a8d4',
    textMuted: '#a87897',
    borderSubtle: 'rgba(244, 114, 182, 0.12)',
    borderDefault: 'rgba(244, 114, 182, 0.24)',
    borderStrong: 'rgba(244, 114, 182, 0.40)',
    accent: '#f472b6',
    accent2: '#c084fc',
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#180e1d',
    codeGutter: '#110915',
    codeSelection: 'rgba(244, 114, 182, 0.30)',
    codeLineHighlight: 'rgba(244, 114, 182, 0.08)',
    synKeyword: '#f472b6',
    synTag: '#fb7185',
    synAttr: '#e879f9',
    synString: '#86efac',
    synNumber: '#fde047',
    synFunction: '#c084fc',
    synComment: '#9d6d8b',
    synProperty: '#f9a8d4',
    synValue: '#fda4af',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-sakura',
    patternOpacity: 0.22,
    patternScale: 1.05,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['sakura-petals', 'twinkling-stars'],
    effectConfigs: {
      'sakura-petals': { amount: 0.9, speed: 0.9, size: 1.0, opacity: 0.85, colorMode: 'palette', customColor: '#fda4af', centerFade: true },
      'twinkling-stars': { amount: 0.7, speed: 0.8, size: 0.9, opacity: 0.75, colorMode: 'palette', customColor: '#fdf2f8', centerFade: true },
    },
  },
  {
    id: 'sakura-morning',
    name: 'Anh Đào Ban Mai',
    description: 'Sắc hồng phấn trong trẻo buổi sớm với cánh hoa anh đào bay nhẹ nhàng',
    type: 'light',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#fff6f9',
    bgPanel: '#ffffff',
    bgElevated: '#ffeaf1',
    bgInput: '#fff9fb',
    textPrimary: '#4a1228',
    textSecondary: '#88294b',
    textMuted: '#aa647d',
    borderSubtle: 'rgba(236, 72, 153, 0.10)',
    borderDefault: 'rgba(236, 72, 153, 0.20)',
    borderStrong: 'rgba(236, 72, 153, 0.34)',
    accent: '#db2777',
    accent2: '#fb7185',
    radius: 'lg',
    density: 'spacious',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fffbfc',
    codeGutter: '#fff0f5',
    codeSelection: 'rgba(219, 39, 119, 0.18)',
    codeLineHighlight: 'rgba(219, 39, 119, 0.05)',
    synKeyword: '#be185d',
    synTag: '#db2777',
    synAttr: '#e11d48',
    synString: '#059669',
    synNumber: '#d97706',
    synFunction: '#9d174d',
    synComment: '#aa647d',
    synProperty: '#a21caf',
    synValue: '#be123c',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-sakura',
    patternOpacity: 0.24,
    patternScale: 1.0,
    patternAngle: 12,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['sakura-petals'],
    effectConfigs: {
      'sakura-petals': { amount: 0.85, speed: 0.8, size: 0.95, opacity: 0.78, colorMode: 'palette', customColor: '#f472b6', centerFade: true },
    },
  },
  {
    id: 'peach-spring',
    name: 'Xuân Đào Nhật Tân',
    description: 'Nền trắng hồng hoa đào tươi tắn kết hợp đom đóm nắng xuân ấm áp',
    type: 'light',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#fff8f6',
    bgPanel: '#ffffff',
    bgElevated: '#ffede8',
    bgInput: '#fffbfa',
    textPrimary: '#4d1919',
    textSecondary: '#8c3438',
    textMuted: '#b0696d',
    borderSubtle: 'rgba(244, 63, 94, 0.10)',
    borderDefault: 'rgba(244, 63, 94, 0.20)',
    borderStrong: 'rgba(244, 63, 94, 0.34)',
    accent: '#e11d48',
    accent2: '#f59e0b',
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fffdfc',
    codeGutter: '#fff1ed',
    codeSelection: 'rgba(225, 29, 72, 0.18)',
    codeLineHighlight: 'rgba(225, 29, 72, 0.05)',
    synKeyword: '#be123c',
    synTag: '#e11d48',
    synAttr: '#d97706',
    synString: '#047857',
    synNumber: '#b45309',
    synFunction: '#9f1239',
    synComment: '#b0696d',
    synProperty: '#db2777',
    synValue: '#ea580c',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'mesh',
    patternType: 'floral-peach',
    patternOpacity: 0.22,
    patternScale: 1.0,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['sakura-petals', 'fireflies'],
    effectConfigs: {
      'sakura-petals': { amount: 0.75, speed: 0.85, size: 0.95, opacity: 0.72, colorMode: 'custom', customColor: '#f472b6', centerFade: true },
      'fireflies': { amount: 0.65, speed: 0.75, size: 0.9, opacity: 0.65, colorMode: 'custom', customColor: '#f59e0b', centerFade: true },
    },
  },
  {
    id: 'peach-lantern',
    name: 'Đêm Đào Lồng Đèn',
    description: 'Sắc đỏ rượu vang sang trọng với hoa đào thắm và đốm sáng lồng đèn vàng',
    type: 'dark',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#1b0b10',
    bgPanel: '#271018',
    bgElevated: '#361621',
    bgInput: '#2d131c',
    textPrimary: '#fff1f2',
    textSecondary: '#fda4af',
    textMuted: '#be7581',
    borderSubtle: 'rgba(251, 113, 133, 0.14)',
    borderDefault: 'rgba(251, 113, 133, 0.26)',
    borderStrong: 'rgba(251, 191, 36, 0.42)',
    accent: '#fb7185',
    accent2: '#fbbf24',
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#200d13',
    codeGutter: '#15080c',
    codeSelection: 'rgba(251, 113, 133, 0.28)',
    codeLineHighlight: 'rgba(251, 191, 36, 0.08)',
    synKeyword: '#fb7185',
    synTag: '#f43f5e',
    synAttr: '#fcd34d',
    synString: '#86efac',
    synNumber: '#fbbf24',
    synFunction: '#fda4af',
    synComment: '#a86470',
    synProperty: '#fdba74',
    synValue: '#f472b6',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-peach',
    patternOpacity: 0.20,
    patternScale: 1.05,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['sakura-petals', 'fireflies'],
    effectConfigs: {
      'sakura-petals': { amount: 0.75, speed: 0.85, size: 1.0, opacity: 0.82, colorMode: 'custom', customColor: '#fb7185', centerFade: true },
      'fireflies': { amount: 0.8, speed: 0.7, size: 1.15, opacity: 0.85, colorMode: 'custom', customColor: '#fbbf24', centerFade: true },
    },
  },
  {
    id: 'tet-apricot',
    name: 'Tết Mai Vàng',
    description: 'Không khí Tết ấm áp với hoa mai vàng 5 cánh và ánh sao đêm giao thừa',
    type: 'dark',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#191208',
    bgPanel: '#251a0c',
    bgElevated: '#332411',
    bgInput: '#2b1e0e',
    textPrimary: '#fefce8',
    textSecondary: '#fde047',
    textMuted: '#b59a5b',
    borderSubtle: 'rgba(250, 204, 21, 0.14)',
    borderDefault: 'rgba(250, 204, 21, 0.26)',
    borderStrong: 'rgba(249, 115, 22, 0.42)',
    accent: '#eab308',
    accent2: '#f97316',
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#1e1509',
    codeGutter: '#140e06',
    codeSelection: 'rgba(234, 179, 8, 0.28)',
    codeLineHighlight: 'rgba(250, 204, 21, 0.08)',
    synKeyword: '#facc15',
    synTag: '#fb923c',
    synAttr: '#fde047',
    synString: '#86efac',
    synNumber: '#fdba74',
    synFunction: '#fef08a',
    synComment: '#9c834b',
    synProperty: '#fcd34d',
    synValue: '#fb7185',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-apricot',
    patternOpacity: 0.22,
    patternScale: 1.0,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['apricot-petals', 'twinkling-stars'],
    effectConfigs: {
      'apricot-petals': { amount: 0.9, speed: 0.9, size: 1.0, opacity: 0.88, colorMode: 'palette', customColor: '#facc15', centerFade: true },
      'twinkling-stars': { amount: 0.65, speed: 0.8, size: 0.9, opacity: 0.75, colorMode: 'custom', customColor: '#fde047', centerFade: true },
    },
  },
  {
    id: 'apricot-sun',
    name: 'Mai Vàng Nắng Mới',
    description: 'Nền kem nắng mai dịu nhẹ cùng họa tiết hoa mai và cánh mai vàng bay',
    type: 'light',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#fefcf3',
    bgPanel: '#ffffff',
    bgElevated: '#fef5d4',
    bgInput: '#fffdf7',
    textPrimary: '#422006',
    textSecondary: '#854d0e',
    textMuted: '#a17c3a',
    borderSubtle: 'rgba(217, 119, 6, 0.10)',
    borderDefault: 'rgba(217, 119, 6, 0.22)',
    borderStrong: 'rgba(217, 119, 6, 0.36)',
    accent: '#d97706',
    accent2: '#eab308',
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fffef9',
    codeGutter: '#fdf6dc',
    codeSelection: 'rgba(217, 119, 6, 0.18)',
    codeLineHighlight: 'rgba(217, 119, 6, 0.05)',
    synKeyword: '#b45309',
    synTag: '#ea580c',
    synAttr: '#a16207',
    synString: '#15803d',
    synNumber: '#c2410c',
    synFunction: '#92400e',
    synComment: '#a17c3a',
    synProperty: '#ca8a04',
    synValue: '#dc2626',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-apricot',
    patternOpacity: 0.24,
    patternScale: 1.0,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['apricot-petals'],
    effectConfigs: {
      'apricot-petals': { amount: 0.85, speed: 0.8, size: 0.95, opacity: 0.80, colorMode: 'palette', customColor: '#eab308', centerFade: true },
    },
  },
  {
    id: 'lotus-pond',
    name: 'Đầm Sen Tĩnh Lặng',
    description: 'Mặt hồ xanh ngọc thẳm thanh bình, họa tiết đài sen và đom đóm lượn lờ',
    type: 'dark',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#071917',
    bgPanel: '#0c2623',
    bgElevated: '#133732',
    bgInput: '#0f2d29',
    textPrimary: '#ecfdf5',
    textSecondary: '#99f6e4',
    textMuted: '#5aa69d',
    borderSubtle: 'rgba(45, 212, 191, 0.12)',
    borderDefault: 'rgba(45, 212, 191, 0.24)',
    borderStrong: 'rgba(244, 114, 182, 0.38)',
    accent: '#14b8a6',
    accent2: '#f472b6',
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#091f1d',
    codeGutter: '#051412',
    codeSelection: 'rgba(20, 184, 166, 0.28)',
    codeLineHighlight: 'rgba(20, 184, 166, 0.08)',
    synKeyword: '#2dd4bf',
    synTag: '#f472b6',
    synAttr: '#67e8f9',
    synString: '#86efac',
    synNumber: '#fde047',
    synFunction: '#5eead4',
    synComment: '#5aa69d',
    synProperty: '#99f6e4',
    synValue: '#f9a8d4',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'mesh',
    patternType: 'floral-lotus',
    patternOpacity: 0.20,
    patternScale: 1.1,
    patternAngle: 0,
    patternDensity: 0.95,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['fireflies'],
    effectConfigs: {
      'fireflies': { amount: 0.9, speed: 0.75, size: 1.1, opacity: 0.85, colorMode: 'custom', customColor: '#86efac', centerFade: true },
    },
  },
  {
    id: 'lotus-dawn',
    name: 'Sen Trắng Bình Minh',
    description: 'Sương mai xanh ngọc dịu nhẹ cùng họa tiết hoa sen thanh khiết',
    type: 'light',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#f2fbf8',
    bgPanel: '#ffffff',
    bgElevated: '#e0f5ef',
    bgInput: '#f7fdfb',
    textPrimary: '#0b2e28',
    textSecondary: '#1a5c50',
    textMuted: '#548c81',
    borderSubtle: 'rgba(13, 148, 136, 0.10)',
    borderDefault: 'rgba(13, 148, 136, 0.20)',
    borderStrong: 'rgba(13, 148, 136, 0.34)',
    accent: '#0d9488',
    accent2: '#ec4899',
    radius: 'lg',
    density: 'spacious',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fafefc',
    codeGutter: '#e8f7f2',
    codeSelection: 'rgba(13, 148, 136, 0.18)',
    codeLineHighlight: 'rgba(13, 148, 136, 0.05)',
    synKeyword: '#0f766e',
    synTag: '#db2777',
    synAttr: '#0284c7',
    synString: '#059669',
    synNumber: '#d97706',
    synFunction: '#115e59',
    synComment: '#548c81',
    synProperty: '#0e7490',
    synValue: '#be185d',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-lotus',
    patternOpacity: 0.22,
    patternScale: 1.05,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['sakura-petals'],
    effectConfigs: {
      'sakura-petals': { amount: 0.65, speed: 0.7, size: 0.95, opacity: 0.68, colorMode: 'custom', customColor: '#f9a8d4', centerFade: true },
    },
  },
  {
    id: 'sunflower-field',
    name: 'Đồng Hướng Dương',
    description: 'Nắng vàng rực rỡ đầy năng lượng tích cực cùng hoa hướng dương và đom đóm',
    type: 'light',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#fffbeb',
    bgPanel: '#ffffff',
    bgElevated: '#fef3c7',
    bgInput: '#fffdf4',
    textPrimary: '#451a03',
    textSecondary: '#78350f',
    textMuted: '#9a6b35',
    borderSubtle: 'rgba(245, 158, 11, 0.12)',
    borderDefault: 'rgba(245, 158, 11, 0.24)',
    borderStrong: 'rgba(217, 119, 6, 0.38)',
    accent: '#f59e0b',
    accent2: '#ea580c',
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fffef7',
    codeGutter: '#fef5d1',
    codeSelection: 'rgba(245, 158, 11, 0.20)',
    codeLineHighlight: 'rgba(245, 158, 11, 0.06)',
    synKeyword: '#b45309',
    synTag: '#ea580c',
    synAttr: '#92400e',
    synString: '#15803d',
    synNumber: '#c2410c',
    synFunction: '#78350f',
    synComment: '#9a6b35',
    synProperty: '#d97706',
    synValue: '#b91c1c',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-sunflower',
    patternOpacity: 0.22,
    patternScale: 1.05,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['apricot-petals', 'fireflies'],
    effectConfigs: {
      'apricot-petals': { amount: 0.7, speed: 0.85, size: 0.95, opacity: 0.76, colorMode: 'custom', customColor: '#fbbf24', centerFade: true },
      'fireflies': { amount: 0.6, speed: 0.8, size: 0.95, opacity: 0.7, colorMode: 'custom', customColor: '#f59e0b', centerFade: true },
    },
  },
  {
    id: 'velvet-rose',
    name: 'Hoa Hồng Nhung',
    description: 'Nhung đỏ thẫm cổ điển quyến rũ, điểm họa tiết hoa hồng và cánh hồng rơi',
    type: 'dark',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#17080d',
    bgPanel: '#220c14',
    bgElevated: '#31121d',
    bgInput: '#280f18',
    textPrimary: '#fff1f2',
    textSecondary: '#fecdd3',
    textMuted: '#b8707d',
    borderSubtle: 'rgba(244, 63, 94, 0.14)',
    borderDefault: 'rgba(244, 63, 94, 0.28)',
    borderStrong: 'rgba(244, 63, 94, 0.44)',
    accent: '#f43f5e',
    accent2: '#fb7185',
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#1c0a10',
    codeGutter: '#12060a',
    codeSelection: 'rgba(244, 63, 94, 0.30)',
    codeLineHighlight: 'rgba(244, 63, 94, 0.08)',
    synKeyword: '#fb7185',
    synTag: '#f43f5e',
    synAttr: '#fda4af',
    synString: '#86efac',
    synNumber: '#fde047',
    synFunction: '#fecdd3',
    synComment: '#9e5d69',
    synProperty: '#fda4af',
    synValue: '#fb923c',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-rose',
    patternOpacity: 0.20,
    patternScale: 1.05,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['sakura-petals'],
    effectConfigs: {
      'sakura-petals': { amount: 0.8, speed: 0.8, size: 1.05, opacity: 0.84, colorMode: 'custom', customColor: '#fb7185', centerFade: true },
    },
  },
  {
    id: 'blush-rose',
    name: 'Hoa Hồng Phấn',
    description: 'Nhẹ nhàng thanh lịch với nền kem hồng dịu và cánh hồng phấn rơi chậm',
    type: 'light',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#fff7f8',
    bgPanel: '#ffffff',
    bgElevated: '#ffe8ec',
    bgInput: '#fffafb',
    textPrimary: '#47131f',
    textSecondary: '#86293d',
    textMuted: '#aa6674',
    borderSubtle: 'rgba(244, 63, 94, 0.09)',
    borderDefault: 'rgba(244, 63, 94, 0.18)',
    borderStrong: 'rgba(244, 63, 94, 0.32)',
    accent: '#e11d48',
    accent2: '#10b981',
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fffbfc',
    codeGutter: '#fff0f3',
    codeSelection: 'rgba(225, 29, 72, 0.16)',
    codeLineHighlight: 'rgba(225, 29, 72, 0.05)',
    synKeyword: '#be123c',
    synTag: '#e11d48',
    synAttr: '#059669',
    synString: '#047857',
    synNumber: '#d97706',
    synFunction: '#9f1239',
    synComment: '#aa6674',
    synProperty: '#db2777',
    synValue: '#be185d',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'solid',
    patternType: 'floral-rose',
    patternOpacity: 0.22,
    patternScale: 1.0,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['sakura-petals'],
    effectConfigs: {
      'sakura-petals': { amount: 0.7, speed: 0.75, size: 0.95, opacity: 0.75, colorMode: 'custom', customColor: '#fda4af', centerFade: true },
    },
  },
  {
    id: 'lavender-dusk',
    name: 'Hoàng Hôn Oải Hương',
    description: 'Cánh đồng tím oải hương lúc chạng vạng với đom đóm tím và bầu trời đầy sao',
    type: 'dark',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#120d1f',
    bgPanel: '#1b142e',
    bgElevated: '#261d40',
    bgInput: '#201836',
    textPrimary: '#f5f3ff',
    textSecondary: '#ddd6fe',
    textMuted: '#9282b8',
    borderSubtle: 'rgba(167, 139, 250, 0.13)',
    borderDefault: 'rgba(167, 139, 250, 0.25)',
    borderStrong: 'rgba(167, 139, 250, 0.42)',
    accent: '#a78bfa',
    accent2: '#c084fc',
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#151024',
    codeGutter: '#0e0a19',
    codeSelection: 'rgba(167, 139, 250, 0.28)',
    codeLineHighlight: 'rgba(167, 139, 250, 0.08)',
    synKeyword: '#c084fc',
    synTag: '#f472b6',
    synAttr: '#a5b4fc',
    synString: '#86efac',
    synNumber: '#fde047',
    synFunction: '#c4b5fd',
    synComment: '#7e6fa3',
    synProperty: '#93c5fd',
    synValue: '#ddd6fe',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'mesh',
    patternType: 'floral-lavender',
    patternOpacity: 0.22,
    patternScale: 1.05,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['fireflies', 'twinkling-stars'],
    effectConfigs: {
      'fireflies': { amount: 0.85, speed: 0.75, size: 1.05, opacity: 0.82, colorMode: 'custom', customColor: '#c4b5fd', centerFade: true },
      'twinkling-stars': { amount: 0.7, speed: 0.8, size: 0.9, opacity: 0.75, colorMode: 'custom', customColor: '#e9d5ff', centerFade: true },
    },
  },
  {
    id: 'lavender-mist',
    name: 'Sương Oải Hương',
    description: 'Tím pastel dịu mắt buổi sớm mai với hoa oải hương và làn sương nhẹ trôi',
    type: 'light',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#f7f5ff',
    bgPanel: '#ffffff',
    bgElevated: '#ede9fe',
    bgInput: '#faf9ff',
    textPrimary: '#2e1065',
    textSecondary: '#5b21b6',
    textMuted: '#8165ab',
    borderSubtle: 'rgba(139, 92, 246, 0.10)',
    borderDefault: 'rgba(139, 92, 246, 0.20)',
    borderStrong: 'rgba(139, 92, 246, 0.34)',
    accent: '#7c3aed',
    accent2: '#ec4899',
    radius: 'lg',
    density: 'spacious',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fcfbff',
    codeGutter: '#f3f0ff',
    codeSelection: 'rgba(124, 58, 237, 0.18)',
    codeLineHighlight: 'rgba(124, 58, 237, 0.05)',
    synKeyword: '#6d28d9',
    synTag: '#db2777',
    synAttr: '#0284c7',
    synString: '#059669',
    synNumber: '#d97706',
    synFunction: '#5b21b6',
    synComment: '#8165ab',
    synProperty: '#7c3aed',
    synValue: '#be185d',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-lavender',
    patternOpacity: 0.24,
    patternScale: 1.0,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['snow'],
    effectConfigs: {
      'snow': { amount: 0.65, speed: 0.6, size: 1.0, opacity: 0.65, colorMode: 'custom', customColor: '#c4b5fd', centerFade: true },
    },
  },
  {
    id: 'forest-fireflies',
    name: 'Rừng Đêm Đom Đóm',
    description: 'Khu rừng xanh thẳm yên bình với nhành lá botanical và đàn đom đóm phát sáng',
    type: 'dark',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#07150d',
    bgPanel: '#0d2216',
    bgElevated: '#153221',
    bgInput: '#10281b',
    textPrimary: '#ecfdf5',
    textSecondary: '#a7f3d0',
    textMuted: '#5b9475',
    borderSubtle: 'rgba(52, 211, 153, 0.12)',
    borderDefault: 'rgba(52, 211, 153, 0.22)',
    borderStrong: 'rgba(163, 230, 53, 0.36)',
    accent: '#10b981',
    accent2: '#84cc16',
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#091b11',
    codeGutter: '#05110a',
    codeSelection: 'rgba(16, 185, 129, 0.28)',
    codeLineHighlight: 'rgba(16, 185, 129, 0.08)',
    synKeyword: '#34d399',
    synTag: '#4ade80',
    synAttr: '#bef264',
    synString: '#86efac',
    synNumber: '#fde047',
    synFunction: '#6ee7b7',
    synComment: '#54856b',
    synProperty: '#5eead4',
    synValue: '#a3e635',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'mesh',
    patternType: 'floral-foliage',
    patternOpacity: 0.22,
    patternScale: 1.05,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['fireflies'],
    effectConfigs: {
      'fireflies': { amount: 1.05, speed: 0.85, size: 1.05, opacity: 0.90, colorMode: 'palette', customColor: '#bef264', centerFade: true },
    },
  },
  {
    id: 'botanical-breeze',
    name: 'Lá Xanh Gió Nhẹ',
    description: 'Không gian thực vật tươi mát ban ngày cùng nhành lá xanh và gió thoảng',
    type: 'light',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#f3fbf6',
    bgPanel: '#ffffff',
    bgElevated: '#dcfce7',
    bgInput: '#f8fdf9',
    textPrimary: '#062e1b',
    textSecondary: '#166534',
    textMuted: '#4d8a64',
    borderSubtle: 'rgba(22, 163, 74, 0.10)',
    borderDefault: 'rgba(22, 163, 74, 0.20)',
    borderStrong: 'rgba(22, 163, 74, 0.34)',
    accent: '#16a34a',
    accent2: '#0d9488',
    radius: 'lg',
    density: 'comfortable',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fafefc',
    codeGutter: '#e9faef',
    codeSelection: 'rgba(22, 163, 74, 0.18)',
    codeLineHighlight: 'rgba(22, 163, 74, 0.05)',
    synKeyword: '#15803d',
    synTag: '#0d9488',
    synAttr: '#0284c7',
    synString: '#047857',
    synNumber: '#d97706',
    synFunction: '#166534',
    synComment: '#4d8a64',
    synProperty: '#0f766e',
    synValue: '#ca8a04',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-foliage',
    patternOpacity: 0.24,
    patternScale: 1.0,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['apricot-petals'],
    effectConfigs: {
      'apricot-petals': { amount: 0.65, speed: 0.8, size: 0.9, opacity: 0.72, colorMode: 'custom', customColor: '#34d399', centerFade: true },
    },
  },
  {
    id: 'winter-blossom',
    name: 'Hoa Tuyết Mùa Đông',
    description: 'Bông tuyết trắng tinh khôi đan xen cánh anh đào hồng trên nền băng giá dịu nhẹ',
    type: 'light',
    categories: ['floral', 'animated', 'pattern'],
    bgApp: '#f3f8ff',
    bgPanel: '#ffffff',
    bgElevated: '#e4effd',
    bgInput: '#f8fbff',
    textPrimary: '#132642',
    textSecondary: '#2d4d7a',
    textMuted: '#6582ab',
    borderSubtle: 'rgba(59, 130, 246, 0.10)',
    borderDefault: 'rgba(59, 130, 246, 0.20)',
    borderStrong: 'rgba(236, 72, 153, 0.30)',
    accent: '#3b82f6',
    accent2: '#ec4899',
    radius: 'lg',
    density: 'spacious',
    surfaceStyle: 'raised',
    tintNeutralsDefault: true,
    codeBg: '#fafcff',
    codeGutter: '#ecf4fe',
    codeSelection: 'rgba(59, 130, 246, 0.18)',
    codeLineHighlight: 'rgba(59, 130, 246, 0.05)',
    synKeyword: '#1d4ed8',
    synTag: '#db2777',
    synAttr: '#0284c7',
    synString: '#059669',
    synNumber: '#d97706',
    synFunction: '#2563eb',
    synComment: '#6582ab',
    synProperty: '#4f46e5',
    synValue: '#be185d',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'floral-sakura',
    patternOpacity: 0.20,
    patternScale: 1.0,
    patternAngle: 0,
    patternDensity: 0.9,
    patternColorMode: 'palette',
    patternVignette: true,
    activeEffects: ['snow', 'sakura-petals'],
    effectConfigs: {
      'snow': { amount: 0.8, speed: 0.75, size: 1.0, opacity: 0.85, colorMode: 'custom', customColor: '#93c5fd', centerFade: true },
      'sakura-petals': { amount: 0.45, speed: 0.7, size: 0.9, opacity: 0.7, colorMode: 'palette', customColor: '#fda4af', centerFade: true },
    },
  },
  {
    id: 'meteor-night',
    name: 'Đêm Sao Băng',
    description: 'Vũ trụ sâu thẳm với chấm sao mịn, ngàn sao lấp lánh và những vệt sao băng',
    type: 'dark',
    categories: ['animated', 'pattern'],
    bgApp: '#050816',
    bgPanel: '#0a1024',
    bgElevated: '#111a38',
    bgInput: '#0d142e',
    textPrimary: '#f0f9ff',
    textSecondary: '#bae6fd',
    textMuted: '#6482ad',
    borderSubtle: 'rgba(56, 189, 248, 0.12)',
    borderDefault: 'rgba(56, 189, 248, 0.24)',
    borderStrong: 'rgba(139, 92, 246, 0.40)',
    accent: '#38bdf8',
    accent2: '#8b5cf6',
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#070c1c',
    codeGutter: '#040712',
    codeSelection: 'rgba(56, 189, 248, 0.28)',
    codeLineHighlight: 'rgba(56, 189, 248, 0.08)',
    synKeyword: '#a78bfa',
    synTag: '#38bdf8',
    synAttr: '#7dd3fc',
    synString: '#4ade80',
    synNumber: '#fbbf24',
    synFunction: '#60a5fa',
    synComment: '#5b769e',
    synProperty: '#67e8f9',
    synValue: '#f472b6',
    fontUi: "'Inter', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'mesh',
    patternType: 'dots-fine',
    patternOpacity: 0.18,
    patternScale: 1.0,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'accent',
    patternVignette: true,
    activeEffects: ['twinkling-stars', 'shooting-stars'],
    effectConfigs: {
      'twinkling-stars': { amount: 1.0, speed: 0.9, size: 1.0, opacity: 0.9, colorMode: 'palette', customColor: '#bae6fd', centerFade: true },
      'shooting-stars': { amount: 1.0, speed: 1.0, size: 1.0, opacity: 0.95, colorMode: 'palette', customColor: '#e0f2fe', centerFade: false },
    },
  },
  {
    id: 'nordic-snow',
    name: 'Băng Tuyết Bắc Âu',
    description: 'Hoa văn hình học Asanoha tuyết trắng trên nền xanh xám băng giá với tuyết rơi',
    type: 'dark',
    categories: ['animated', 'pattern'],
    bgApp: '#121b26',
    bgPanel: '#192433',
    bgElevated: '#233245',
    bgInput: '#1d2a3a',
    textPrimary: '#f0f7ff',
    textSecondary: '#cbd5e1',
    textMuted: '#6e849e',
    borderSubtle: 'rgba(148, 163, 184, 0.12)',
    borderDefault: 'rgba(125, 211, 252, 0.24)',
    borderStrong: 'rgba(125, 211, 252, 0.40)',
    accent: '#7dd3fc',
    accent2: '#93c5fd',
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#151f2b',
    codeGutter: '#0e151e',
    codeSelection: 'rgba(125, 211, 252, 0.25)',
    codeLineHighlight: 'rgba(125, 211, 252, 0.08)',
    synKeyword: '#93c5fd',
    synTag: '#7dd3fc',
    synAttr: '#bae6fd',
    synString: '#86efac',
    synNumber: '#fde047',
    synFunction: '#67e8f9',
    synComment: '#647991',
    synProperty: '#a5f3fc',
    synValue: '#f9a8d4',
    fontUi: "'Inter', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'gradient',
    patternType: 'asanoha',
    patternOpacity: 0.16,
    patternScale: 1.1,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'accent',
    patternVignette: true,
    activeEffects: ['snow', 'twinkling-stars'],
    effectConfigs: {
      'snow': { amount: 1.0, speed: 0.85, size: 1.0, opacity: 0.88, colorMode: 'palette', customColor: '#ffffff', centerFade: true },
      'twinkling-stars': { amount: 0.5, speed: 0.7, size: 0.8, opacity: 0.65, colorMode: 'palette', customColor: '#bae6fd', centerFade: true },
    },
  },
  {
    id: 'seigaiha-tide',
    name: 'Sóng Nhật Seigaiha',
    description: 'Họa tiết sóng nước truyền thống Seigaiha kết hợp ánh sáng trôi xanh biển sâu',
    type: 'dark',
    categories: ['animated', 'pattern'],
    bgApp: '#071422',
    bgPanel: '#0d1f33',
    bgElevated: '#142c47',
    bgInput: '#10253d',
    textPrimary: '#eff6ff',
    textSecondary: '#93c5fd',
    textMuted: '#587fa8',
    borderSubtle: 'rgba(56, 189, 248, 0.12)',
    borderDefault: 'rgba(56, 189, 248, 0.24)',
    borderStrong: 'rgba(45, 212, 191, 0.38)',
    accent: '#0ea5e9',
    accent2: '#2dd4bf',
    radius: 'md',
    density: 'comfortable',
    surfaceStyle: 'glass',
    tintNeutralsDefault: true,
    codeBg: '#091829',
    codeGutter: '#050f1a',
    codeSelection: 'rgba(14, 165, 233, 0.28)',
    codeLineHighlight: 'rgba(14, 165, 233, 0.08)',
    synKeyword: '#38bdf8',
    synTag: '#2dd4bf',
    synAttr: '#7dd3fc',
    synString: '#6ee7b7',
    synNumber: '#fde047',
    synFunction: '#60a5fa',
    synComment: '#55789e',
    synProperty: '#67e8f9',
    synValue: '#f472b6',
    fontUi: "'Be Vietnam Pro', system-ui, sans-serif",
    fontCode: "'JetBrains Mono', monospace",
    bgType: 'mesh',
    patternType: 'seigaiha',
    patternOpacity: 0.20,
    patternScale: 1.05,
    patternAngle: 0,
    patternDensity: 1.0,
    patternColorMode: 'accent',
    patternVignette: true,
    activeEffects: ['fireflies'],
    effectConfigs: {
      'fireflies': { amount: 0.85, speed: 0.75, size: 1.0, opacity: 0.82, colorMode: 'custom', customColor: '#38bdf8', centerFade: true },
    },
  },
];

export const ACCENT_SWATCHES = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#3b82f6', name: 'Xanh dương' },
  { hex: '#0ea5e9', name: 'Xanh trời' },
  { hex: '#10b981', name: 'Ngọc lục bảo' },
  { hex: '#14b8a6', name: 'Mòng két' },
  { hex: '#84cc16', name: 'Xanh chanh' },
  { hex: '#eab308', name: 'Vàng hổ phách' },
  { hex: '#f97316', name: 'Cam tươi' },
  { hex: '#ef4444', name: 'Đỏ son' },
  { hex: '#ec4899', name: 'Hồng sen' },
  { hex: '#d946ef', name: 'Tím hoa cà' },
  { hex: '#a855f7', name: 'Tím khói' },
  { hex: '#8b5cf6', name: 'Violet đậm' },
  { hex: '#06b6d4', name: 'Cyan neon' },
  { hex: '#f43f5e', name: 'Hồng đỏ' },
  { hex: '#facc15', name: 'Vàng rực' },
];

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  presetId: 'midnight',
  mode: 'dark',
  accentColor: '#6366f1',
  accentColor2: '#a855f7',
  tintNeutrals: true,
  radius: 'md',
  density: 'comfortable',
  surfaceStyle: 'raised',
  surfaceOpacity: 0.88,
  editorSurfaceOpacity: 0.88,
  editorFontSize: 13.5,
  editorFontFamily: "'JetBrains Mono', monospace",
  editorLineNumbers: true,
  editorWordWrap: true,
  previewBg: 'dark',
  uiFont: "'Be Vietnam Pro', system-ui, sans-serif",
  bgType: 'solid',
  patternType: 'none',
  patternOpacity: 0.18,
  patternScale: 1,
  patternAngle: 0,
  patternDensity: 1,
  patternColorMode: 'palette',
  patternColor: '#6366f1',
  patternVignette: true,
  customBgImage: '',
  customBgOpacity: 0.5,
  customBgBlur: 0,
  customBgFit: 'cover',
  enableAnimations: true,
  enableBlur: true,
  activeEffect: 'none',
  activeEffects: [],
  effectConfigs: {},
  batterySaver: false,
  mouseWind: true,
  clickBurst: true,
  collabHighlightInserts: true,
  collabHideRemoteCursors: false,
  collabHideOwnCursor: false,
  collabChatSound: false,
  fpsCorner: 'bottom-right',
};

export const STORAGE_KEY_THEME_SETTINGS = 'coderlive_theme_settings_v2';
export const STORAGE_KEY_THEME_MODE = 'coderlive_theme_mode_v1';

export function isTouchEnvironment(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(hover: none) and (pointer: coarse), (pointer: coarse)').matches;
}

export function getDefaultShowFps(): boolean {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= 768;
}

export function getDefaultThemeSettings(): ThemeSettings {
  return {
    ...DEFAULT_THEME_SETTINGS,
    density: isTouchEnvironment() ? 'comfortable' : DEFAULT_THEME_SETTINGS.density,
    showFps: getDefaultShowFps(),
    fpsCorner: 'bottom-right',
  };
}

// Color math helpers
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 99, g: 102, b: 241 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1)}`;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, l };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = (h % 360 + 360) % 360;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastingText(bgHex: string): '#ffffff' | '#0f172a' {
  const ratioWhite = getContrastRatio(bgHex, '#ffffff');
  const ratioDark = getContrastRatio(bgHex, '#0f172a');
  return ratioWhite >= ratioDark ? '#ffffff' : '#0f172a';
}

// Derive secondary accent with 35-degree hue shift
export function deriveSecondaryAccent(accentHex: string): string {
  const { r, g, b } = hexToRgb(accentHex);
  const hsl = rgbToHsl(r, g, b);
  const shiftedH = (hsl.h + 35) % 360;
  const newRgb = hslToRgb(shiftedH, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Derive hover and active lightness shifts
export function deriveAccentShades(accentHex: string, isDark: boolean) {
  const { r, g, b } = hexToRgb(accentHex);
  const hsl = rgbToHsl(r, g, b);

  // In dark mode, hover is slightly brighter or richer; in light mode slightly darker
  const hoverL = isDark ? Math.min(0.85, hsl.l + 0.08) : Math.max(0.25, hsl.l - 0.08);
  const activeL = isDark ? Math.min(0.92, hsl.l + 0.16) : Math.max(0.18, hsl.l - 0.15);

  const hoverRgb = hslToRgb(hsl.h, hsl.s, hoverL);
  const activeRgb = hslToRgb(hsl.h, hsl.s, activeL);

  return {
    hoverHex: rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b),
    activeHex: rgbToHex(activeRgb.r, activeRgb.g, activeRgb.b),
  };
}

// Tint neutrals with subtle accent hue (3-8% chroma)
export function tintNeutralColor(neutralHex: string, accentHex: string, amount: number = 0.06): string {
  const nRgb = hexToRgb(neutralHex);
  const aRgb = hexToRgb(accentHex);
  const blendedR = Math.round(nRgb.r * (1 - amount) + aRgb.r * amount);
  const blendedG = Math.round(nRgb.g * (1 - amount) + aRgb.g * amount);
  const blendedB = Math.round(nRgb.b * (1 - amount) + aRgb.b * amount);
  return rgbToHex(blendedR, blendedG, blendedB);
}

// Radius mapping
export function getRadiusTokens(radius: RadiusStyle) {
  switch (radius) {
    case 'none':
      return { xs: '0px', sm: '0px', md: '0px', lg: '0px', xl: '0px', full: '0px' };
    case 'sm':
      return { xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '10px', full: '9999px' };
    case 'lg':
      return { xs: '6px', sm: '10px', md: '14px', lg: '18px', xl: '24px', full: '9999px' };
    case 'full':
      return { xs: '8px', sm: '12px', md: '18px', lg: '24px', xl: '32px', full: '9999px' };
    case 'md':
    default:
      return { xs: '4px', sm: '6px', md: '10px', lg: '14px', xl: '18px', full: '9999px' };
  }
}

// Density mapping
export function getDensityTokens(density: DensityStyle) {
  switch (density) {
    case 'compact':
      return {
        scale: '0.88',
        headerHeight: '42px',
        tabHeight: '26px',
        btnSmHeight: '26px',
        btnMdHeight: '30px',
        inputHeight: '28px',
        codeLineHeight: '1.45',
      };
    case 'spacious':
      return {
        scale: '1.08',
        headerHeight: '52px',
        tabHeight: '32px',
        btnSmHeight: '30px',
        btnMdHeight: '36px',
        inputHeight: '34px',
        codeLineHeight: '1.75',
      };
    case 'comfortable':
    default:
      return {
        scale: '1.0',
        headerHeight: '48px',
        tabHeight: '28px',
        btnSmHeight: '28px',
        btnMdHeight: '32px',
        inputHeight: '30px',
        codeLineHeight: '1.6',
      };
  }
}

// Build complete CSS variables map
export function buildCssVariables(settings: ThemeSettings): Record<string, string> {
  const preset = THEME_PRESETS.find((p) => p.id === settings.presetId) || THEME_PRESETS[0];
  const isDark = settings.mode === 'dark';

  // Accent & Secondary Accent
  const accent = settings.accentColor || preset.accent;
  const accentRgb = hexToRgb(accent);
  const accent2 = settings.accentColor2 || deriveSecondaryAccent(accent);
  const accent2Rgb = hexToRgb(accent2);

  const { hoverHex: accentHover, activeHex: accentActive } = deriveAccentShades(accent, isDark);
  const textOnAccent = getContrastingText(accent);

  // Backgrounds with optional tinting
  let bgApp = preset.bgApp;
  let bgPanel = preset.bgPanel;
  let bgElevated = preset.bgElevated;
  let bgInput = preset.bgInput;

  let borderSubtle = preset.borderSubtle;
  let borderDefault = preset.borderDefault;
  let borderStrong = preset.borderStrong;

  if (settings.tintNeutrals) {
    const tintStrength = isDark ? 0.05 : 0.035;
    bgApp = tintNeutralColor(bgApp, accent, tintStrength);
    bgPanel = tintNeutralColor(bgPanel, accent, tintStrength);
    bgElevated = tintNeutralColor(bgElevated, accent, tintStrength + 0.02);
    bgInput = tintNeutralColor(bgInput, accent, tintStrength + 0.01);
  }

  const bgAppRgb = hexToRgb(bgApp);
  const bgPanelRgb = hexToRgb(bgPanel);
  const bgElevatedRgb = hexToRgb(bgElevated);
  const bgInputRgb = hexToRgb(bgInput);
  const codeBgRgb = hexToRgb(preset.codeBg);
  const codeGutterRgb = hexToRgb(preset.codeGutter);

  const textPrimary = preset.textPrimary;
  const textSecondary = preset.textSecondary;
  const textMuted = preset.textMuted;
  const textPrimaryRgb = hexToRgb(textPrimary);

  const radiusTokens = getRadiusTokens(settings.radius);
  const densityTokens = getDensityTokens(settings.density);

  // Semantic status colors
  const successHex = '#10b981';
  const successRgb = hexToRgb(successHex);
  const warningHex = '#f59e0b';
  const warningRgb = hexToRgb(warningHex);
  const dangerHex = '#ef4444';
  const dangerRgb = hexToRgb(dangerHex);
  const infoHex = '#0ea5e9';
  const infoRgb = hexToRgb(infoHex);

  // Surface translucency tokens (Stage 1)
  const surfaceOpacity = settings.surfaceOpacity !== undefined ? Math.max(0.4, Math.min(1, settings.surfaceOpacity)) : 0.88;
  // Code editor keeps a minimum of 88% opacity so source code always stays legible
  const editorOpacity = Math.max(
    0.88,
    surfaceOpacity,
    settings.editorSurfaceOpacity !== undefined ? Math.min(1, settings.editorSurfaceOpacity) : 0.88
  );

  return {
    // Background tokens
    '--bg-app': bgApp,
    '--bg-app-rgb': `${bgAppRgb.r}, ${bgAppRgb.g}, ${bgAppRgb.b}`,
    '--bg-panel': bgPanel,
    '--bg-panel-rgb': `${bgPanelRgb.r}, ${bgPanelRgb.g}, ${bgPanelRgb.b}`,
    '--bg-elevated': bgElevated,
    '--bg-elevated-rgb': `${bgElevatedRgb.r}, ${bgElevatedRgb.g}, ${bgElevatedRgb.b}`,
    '--bg-overlay': isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(15, 23, 42, 0.45)',
    '--bg-input': bgInput,
    '--bg-input-rgb': `${bgInputRgb.r}, ${bgInputRgb.g}, ${bgInputRgb.b}`,
    '--bg-hover': `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${isDark ? 0.10 : 0.06})`,
    '--bg-active': `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${isDark ? 0.18 : 0.12})`,
    '--bg-selected': `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${isDark ? 0.22 : 0.14})`,

    // Translucent panel surface tokens (Stage 1)
    '--surface-opacity': `${surfaceOpacity}`,
    '--editor-surface-opacity': `${editorOpacity}`,
    '--bg-panel-translucent': `rgba(${bgPanelRgb.r}, ${bgPanelRgb.g}, ${bgPanelRgb.b}, ${surfaceOpacity})`,
    '--bg-elevated-translucent': `rgba(${bgElevatedRgb.r}, ${bgElevatedRgb.g}, ${bgElevatedRgb.b}, ${Math.min(1, surfaceOpacity + 0.04)})`,
    '--bg-app-surface': `rgba(${bgAppRgb.r}, ${bgAppRgb.g}, ${bgAppRgb.b}, ${surfaceOpacity})`,
    '--bg-editor-surface': `rgba(${codeBgRgb.r}, ${codeBgRgb.g}, ${codeBgRgb.b}, ${editorOpacity})`,
    '--code-bg-translucent': `rgba(${codeBgRgb.r}, ${codeBgRgb.g}, ${codeBgRgb.b}, ${editorOpacity})`,
    '--code-gutter-translucent': `rgba(${codeGutterRgb.r}, ${codeGutterRgb.g}, ${codeGutterRgb.b}, ${editorOpacity})`,
    '--panel-backdrop-filter': settings.enableBlur !== false ? 'blur(16px)' : 'none',

    // Text tokens
    '--text-primary': textPrimary,
    '--text-primary-rgb': `${textPrimaryRgb.r}, ${textPrimaryRgb.g}, ${textPrimaryRgb.b}`,
    '--text-secondary': textSecondary,
    '--text-muted': textMuted,
    '--text-disabled': isDark ? '#4b5563' : '#9ca3af',
    '--text-on-accent': textOnAccent,
    '--text-link': accent,

    // Border tokens
    '--border-subtle': borderSubtle,
    '--border-default': borderDefault,
    '--border-strong': borderStrong,
    '--border-focus': accent,

    // Accent tokens
    '--accent': accent,
    '--accent-base': accent,
    '--accent-rgb': `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`,
    '--accent-hover': accentHover,
    '--accent-active': accentActive,
    '--accent-soft': `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${isDark ? 0.16 : 0.10})`,
    '--accent-border': `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${isDark ? 0.35 : 0.25})`,
    '--accent-text': accent,
    '--accent-2': accent2,
    '--accent-2-rgb': `${accent2Rgb.r}, ${accent2Rgb.g}, ${accent2Rgb.b}`,

    // Semantic tokens
    '--color-success': successHex,
    '--color-success-rgb': `${successRgb.r}, ${successRgb.g}, ${successRgb.b}`,
    '--color-success-soft': `rgba(${successRgb.r}, ${successRgb.g}, ${successRgb.b}, ${isDark ? 0.16 : 0.12})`,
    '--color-warning': warningHex,
    '--color-warning-rgb': `${warningRgb.r}, ${warningRgb.g}, ${warningRgb.b}`,
    '--color-warning-soft': `rgba(${warningRgb.r}, ${warningRgb.g}, ${warningRgb.b}, ${isDark ? 0.16 : 0.12})`,
    '--color-danger': dangerHex,
    '--color-danger-rgb': `${dangerRgb.r}, ${dangerRgb.g}, ${dangerRgb.b}`,
    '--color-danger-soft': `rgba(${dangerRgb.r}, ${dangerRgb.g}, ${dangerRgb.b}, ${isDark ? 0.16 : 0.12})`,
    '--color-info': infoHex,
    '--color-info-rgb': `${infoRgb.r}, ${infoRgb.g}, ${infoRgb.b}`,
    '--color-info-soft': `rgba(${infoRgb.r}, ${infoRgb.g}, ${infoRgb.b}, ${isDark ? 0.16 : 0.12})`,

    // Course Badge Theme Tokens
    '--course-html': isDark ? '#ea580c' : '#c2410c',
    '--course-html-soft': `rgba(234, 88, 12, ${isDark ? 0.16 : 0.12})`,
    '--course-html-border': `rgba(234, 88, 12, ${isDark ? 0.35 : 0.25})`,
    '--course-html-text': isDark ? '#f97316' : '#9a3412',

    '--course-css': isDark ? '#0284c7' : '#0369a1',
    '--course-css-soft': `rgba(2, 132, 199, ${isDark ? 0.16 : 0.12})`,
    '--course-css-border': `rgba(2, 132, 199, ${isDark ? 0.35 : 0.25})`,
    '--course-css-text': isDark ? '#38bdf8' : '#075985',

    '--course-js': isDark ? '#d97706' : '#b45309',
    '--course-js-soft': `rgba(217, 119, 6, ${isDark ? 0.16 : 0.12})`,
    '--course-js-border': `rgba(217, 119, 6, ${isDark ? 0.35 : 0.25})`,
    '--course-js-text': isDark ? '#fbbf24' : '#78350f',

    // Code & Syntax tokens
    '--code-bg': preset.codeBg,
    '--code-gutter': preset.codeGutter,
    '--code-selection': `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${isDark ? 0.28 : 0.18})`,
    '--code-line-highlight': `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${isDark ? 0.08 : 0.04})`,
    '--code-font-size': `${settings.editorFontSize}px`,
    '--code-line-height': densityTokens.codeLineHeight,
    '--syn-keyword': preset.synKeyword,
    '--syn-tag': preset.synTag,
    '--syn-attr': preset.synAttr,
    '--syn-string': preset.synString,
    '--syn-number': preset.synNumber,
    '--syn-function': preset.synFunction,
    '--syn-comment': preset.synComment,
    '--syn-property': preset.synProperty,
    '--syn-value': preset.synValue,

    // Radii tokens
    '--radius-xs': radiusTokens.xs,
    '--radius-sm': radiusTokens.sm,
    '--radius-md': radiusTokens.md,
    '--radius-lg': radiusTokens.lg,
    '--radius-xl': radiusTokens.xl,
    '--radius-full': radiusTokens.full,

    // Density and dimension tokens
    '--density-scale': densityTokens.scale,
    '--header-height': densityTokens.headerHeight,
    '--density-btn-sm-height': densityTokens.btnSmHeight,
    '--density-btn-md-height': densityTokens.btnMdHeight,
    '--density-input-height': densityTokens.inputHeight,
    '--density-tab-height': densityTokens.tabHeight,

    // Fonts
    '--font-sans': settings.uiFont || preset.fontUi,
    '--font-mono': settings.editorFontFamily || preset.fontCode,
  };
}

// Apply theme to document root directly
export function applyThemeToDom(settings: ThemeSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Toggle theme class
  if (settings.mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  // Set dataset attributes for theme & preset
  root.setAttribute('data-preset', settings.presetId);
  root.setAttribute('data-radius', settings.radius);
  root.setAttribute('data-density', settings.density);

  // Set all CSS variables on root style
  const vars = buildCssVariables(settings);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

const VALID_FPS_CORNERS: readonly FpsCorner[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];

/**
 * Chuẩn hóa dữ liệu cấu hình giao diện nhập từ JSON (hỗ trợ cả tệp cũ từ HTMLive và tệp mới Coderlive).
 */
export function normalizeImportedThemeJson(jsonStr: string):
  | { success: true; data: Partial<ThemeSettings> }
  | { success: false; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { success: false, message: 'Định dạng JSON không hợp lệ.' };
    }

    // Hỗ trợ cả cấu trúc phẳng (ThemeSettings trực tiếp) lẫn gói có metadata (settings / themeSettings / data)
    const obj = parsed as Record<string, unknown>;
    const candidateRaw =
      (obj.settings && typeof obj.settings === 'object' ? obj.settings : null) ||
      (obj.themeSettings && typeof obj.themeSettings === 'object' ? obj.themeSettings : null) ||
      (obj.data && typeof obj.data === 'object' ? obj.data : null) ||
      obj;

    const candidate = candidateRaw as Record<string, unknown>;
    if (!candidate.presetId && !candidate.accentColor) {
      return { success: false, message: 'Tệp JSON không chứa cấu hình giao diện hợp lệ.' };
    }

    const sanitized: Record<string, unknown> = { ...candidate };
    // Loại bỏ các trường metadata cũ/mới không thuộc ThemeSettings
    delete sanitized.app;
    delete sanitized.appName;
    delete sanitized.exportedFrom;
    delete sanitized.version;

    if (typeof sanitized.fpsCorner === 'string' && !VALID_FPS_CORNERS.includes(sanitized.fpsCorner as FpsCorner)) {
      sanitized.fpsCorner = 'bottom-right';
    }

    return { success: true, data: sanitized as Partial<ThemeSettings> };
  } catch (e) {
    return {
      success: false,
      message: `Lỗi đọc JSON: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`,
    };
  }
}

// Storage helpers
export function loadThemeSettings(): ThemeSettings {
  migrateLegacyStorageKeys();
  const defaults = getDefaultThemeSettings();
  if (typeof localStorage === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THEME_SETTINGS);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      density: parsed.density || defaults.density,
      showFps: typeof parsed.showFps === 'boolean' ? parsed.showFps : defaults.showFps,
      fpsCorner: VALID_FPS_CORNERS.includes(parsed.fpsCorner) ? parsed.fpsCorner : defaults.fpsCorner,
    };
  } catch {
    return defaults;
  }
}

export function saveThemeSettings(settings: ThemeSettings): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_THEME_SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEY_THEME_MODE, settings.mode);
  } catch (e) {
    console.error('Không thể lưu cài đặt giao diện:', e);
  }
}

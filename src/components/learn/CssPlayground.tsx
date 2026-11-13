import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Sliders,
  Play,
  Pause,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { useIsTouch } from '../../hooks/useViewport';

export type PlaygroundType =
  | 'colors'
  | 'units'
  | 'box-model'
  | 'borders'
  | 'display-position'
  | 'flexbox'
  | 'grid'
  | 'animations'
  | 'responsive';

interface CssPlaygroundProps {
  type: PlaygroundType;
  theme?: 'dark' | 'light';
}

export const CssPlayground: React.FC<CssPlaygroundProps> = ({ type }) => {
  const isTouch = useIsTouch();
  const [copied, setCopied] = useState(false);

  // ================= 1. LESSON 3: COLORS & BACKGROUNDS =================
  const [textColor, setTextColor] = useState('#ffffff');
  const [useGradient, setUseGradient] = useState(true);
  const [bgColor, setBgColor] = useState('#4f46e5');
  const [gradColor1, setGradColor1] = useState('#4f46e5');
  const [gradColor2, setGradColor2] = useState('#ec4899');
  const [gradAngle, setGradAngle] = useState(135);

  // ================= 2. LESSON 5: UNITS =================
  const [unitType, setUnitType] = useState<'px' | '%' | 'em' | 'rem' | 'vw'>('%');
  const [unitValue, setUnitValue] = useState(70);
  const [containerWidth, setContainerWidth] = useState(480);

  // ================= 3. LESSON 6: BOX MODEL =================
  const [margin, setMargin] = useState(16);
  const [padding, setPadding] = useState(20);
  const [borderWidth, setBorderWidth] = useState(4);
  const [boxSizing, setBoxSizing] = useState<'border-box' | 'content-box'>('border-box');

  // ================= 4. LESSON 7: BORDERS & SHADOW =================
  const [borderSize, setBorderSize] = useState(3);
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'dotted' | 'double'>('solid');
  const [borderColor, setBorderColor] = useState('#6366f1');
  const [borderRadius, setBorderRadius] = useState(16);
  const [isCircle, setIsCircle] = useState(false);
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(10);
  const [shadowBlur, setShadowBlur] = useState(24);
  const [shadowSpread, setShadowSpread] = useState(-4);
  const [shadowColor, setShadowColor] = useState('#4f46e5');
  const [shadowOpacity, setShadowOpacity] = useState(0.35);

  // ================= 5. LESSON 8: POSITION =================
  const [positionViewMode, setPositionViewMode] = useState<'all' | 'custom'>('all');
  const [posMode, setPosMode] = useState<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>('relative');
  const [posTop, setPosTop] = useState(20);
  const [posLeft, setPosLeft] = useState(30);

  // ================= 6. LESSON 9: FLEXBOX =================
  const [flexDirection, setFlexDirection] = useState<'row' | 'column' | 'row-reverse'>('row');
  const [justifyContent, setJustifyContent] = useState<
    'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  >('space-between');
  const [alignItems, setAlignItems] = useState<'stretch' | 'center' | 'flex-start' | 'flex-end'>('center');
  const [flexGap, setFlexGap] = useState(12);
  const [flexWrap, setFlexWrap] = useState<'nowrap' | 'wrap'>('nowrap');
  const [itemCount, setItemCount] = useState(3);

  // ================= 7. LESSON 10: GRID =================
  const [gridCols, setGridCols] = useState(3);
  const [gridGap, setGridGap] = useState(16);
  const [spanFirstCols, setSpanFirstCols] = useState(2);
  const [spanFirstRows, setSpanFirstRows] = useState(1);

  // ================= 8. LESSON 11: ANIMATIONS =================
  const [transDuration, setTransDuration] = useState(0.3);
  const [transEasing, setTransEasing] = useState<
    'ease' | 'linear' | 'ease-in-out' | 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  >('ease');
  const [transProp, setTransProp] = useState<'all' | 'transform' | 'background-color' | 'box-shadow'>('all');
  const [triggerMode, setTriggerMode] = useState<'hover' | 'click'>('hover');
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [transformScale, setTransformScale] = useState(1.1);
  const [transformRotate, setTransformRotate] = useState(6);
  const [transformTranslateY, setTransformTranslateY] = useState(-6);
  const [animPlaying, setAnimPlaying] = useState(true);
  const [animSpeed, setAnimSpeed] = useState(2);

  // ================= 9. LESSON 12: RESPONSIVE =================
  const [viewportWidth, setViewportWidth] = useState(640);

  // Generate CSS String and Live Frame HTML depending on type
  const { generatedCss, previewHtml } = useMemo(() => {
    switch (type) {
      case 'colors': {
        const bgVal = useGradient
          ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`
          : bgColor;
        const css = `.hop-mau-sac {
  color: ${textColor};
  background: ${bgVal};
  padding: 24px;
  border-radius: 12px;
  font-family: sans-serif;
  text-align: center;
}`;
        const html = `
          <div style="color:${textColor}; background:${bgVal}; padding:28px 20px; border-radius:12px; font-family:sans-serif; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
            <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:bold;">Khám phá Màu sắc & Nền CSS</h3>
            <p style="margin:0; font-size:13px; opacity:0.92;">Màu chữ sắc nét tương phản tuyệt đẹp trên nền dải màu chuyển động hoặc đơn sắc.</p>
          </div>
        `;
        return { generatedCss: css, previewHtml: html };
      }

      case 'units': {
        const appliedWidth = `${unitValue}${unitType}`;
        const css = `.hop-kich-thuoc {
  width: ${appliedWidth};
  background: #3b82f6;
  color: white;
  padding: 14px;
  border-radius: 8px;
  font-family: sans-serif;
}
/* Khung cha (Container) đang có width: ${containerWidth}px */`;
        const html = `
          <div style="width:100%; max-width:${containerWidth}px; margin:0 auto; background:#f8fafc; padding:18px; border:2px dashed #94a3b8; border-radius:10px; font-family:sans-serif; box-sizing:border-box;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#475569; margin-bottom:8px; font-weight:bold;">
              <span>Khung cha (Container): ${containerWidth}px</span>
              <span>Đang áp dụng: ${appliedWidth}</span>
            </div>
            <div style="width:${appliedWidth}; max-width:100%; background:#2563eb; color:white; padding:14px; border-radius:8px; font-weight:bold; font-size:13px; text-align:center; box-shadow:0 4px 12px rgba(37,99,235,0.25); transition:width 0.2s; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; box-sizing:border-box;">
              width: ${appliedWidth}
            </div>
            <div style="margin-top:8px; font-size:10px; color:#64748b; text-align:center;">
              ${unitType === '%' ? '💡 Đơn vị % tự động co giãn theo bề rộng khung cha!' : '💡 Đơn vị ' + unitType + ' giữ kích thước độc lập với khung cha!'}
            </div>
          </div>
        `;
        return { generatedCss: css, previewHtml: html };
      }

      case 'box-model': {
        const contentWidth = 200;
        const totalMeasured =
          boxSizing === 'border-box'
            ? contentWidth
            : contentWidth + padding * 2 + borderWidth * 2;
        const css = `.hop-box-model {
  box-sizing: ${boxSizing};
  width: ${contentWidth}px;
  margin: ${margin}px auto;
  border: ${borderWidth}px solid #f59e0b;
  padding: ${padding}px;
  background: #10b981;
  color: white;
}
/* Tổng chiều rộng đo được trên màn hình: ${totalMeasured}px */`;
        const html = `
          <div style="font-family:sans-serif; text-align:center; padding:10px 0;">
            <div style="display:inline-block; background:rgba(249,115,22,0.12); border:2px dashed #ea580c; border-radius:12px; padding:${margin}px; transition:all 0.2s;">
              <div style="font-size:11px; color:#c2410c; font-weight:bold; margin-bottom:4px;">Margin: ${margin}px</div>
              <div style="box-sizing:${boxSizing}; width:${contentWidth}px; border:${borderWidth}px solid #f59e0b; padding:${padding}px; background:#10b981; border-radius:8px; color:white; font-weight:bold; box-shadow:0 4px 12px rgba(0,0,0,0.1); transition:all 0.2s;">
                <div style="font-size:10px; opacity:0.95; margin-bottom:4px;">Border: ${borderWidth}px | Padding: ${padding}px</div>
                <div style="background:#047857; padding:8px 12px; border-radius:4px; font-size:12px; box-shadow:inset 0 1px 3px rgba(0,0,0,0.2);">
                  Content: ${contentWidth}px
                </div>
              </div>
            </div>
            <div style="margin-top:14px; font-size:12px; font-weight:bold; color:#1e293b;">
              Tổng bề rộng chiếm dụng: <span style="color:#2563eb; font-size:14px;">${totalMeasured}px</span> (${boxSizing})
            </div>
          </div>
        `;
        return { generatedCss: css, previewHtml: html };
      }

      case 'borders': {
        const effectiveRadius = isCircle ? '50%' : `${borderRadius}px`;
        const shadowStyle = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}${Math.round(
          shadowOpacity * 255
        )
          .toString(16)
          .padStart(2, '0')}`;
        const css = `.hop-vien-bong {
  border: ${borderSize}px ${borderStyle} ${borderColor};
  border-radius: ${effectiveRadius};
  box-shadow: ${shadowStyle};
  background: #ffffff;
  padding: 24px;
}`;
        const html = `
          <div style="display:flex; justify-content:center; align-items:center; padding:24px 10px; font-family:sans-serif;">
            <div style="width:160px; height:160px; display:flex; flex-direction:column; align-items:center; justify-content:center; border:${borderSize}px ${borderStyle} ${borderColor}; border-radius:${effectiveRadius}; box-shadow:${shadowStyle}; background:#ffffff; text-align:center; padding:12px; transition:all 0.2s; box-sizing:border-box;">
              <strong style="color:#1e293b; font-size:14px;">Viền & Bóng</strong>
              <span style="font-size:11px; color:#64748b; margin-top:4px;">Radius: ${effectiveRadius}</span>
            </div>
          </div>
        `;
        return { generatedCss: css, previewHtml: html };
      }

      case 'display-position': {
        if (positionViewMode === 'all') {
          // Visual demo with 5 colored labeled boxes inside a scrollable mini page
          const css = `/* Mô hình 5 giá trị position bên trong một trang web thu nhỏ có thanh cuộn */
.khung-mini-page {
  position: relative;
  height: 220px;
  overflow-y: scroll;
}
.box-static   { position: static; background: #3b82f6; }
.box-relative { position: relative; top: 12px; left: 16px; background: #f59e0b; }
.box-sticky   { position: sticky; top: 0; background: #10b981; z-index: 10; }
.box-absolute { position: absolute; top: 140px; right: 16px; background: #ef4444; z-index: 5; }
.box-fixed    { position: fixed; bottom: 12px; right: 12px; background: #8b5cf6; z-index: 20; }`;

          const html = `
            <div style="position:relative; width:100%; height:230px; overflow-y:scroll; background:#f8fafc; border:2px solid #cbd5e1; border-radius:10px; padding:14px; font-family:sans-serif; box-sizing:border-box;">
              <!-- Sticky element at top -->
              <div style="position:sticky; top:0; background:#10b981; color:white; padding:8px 14px; border-radius:6px; font-weight:bold; font-size:12px; box-shadow:0 2px 8px rgba(16,185,129,0.3); z-index:10; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;">
                <span>🟢 sticky: top: 0 (Cuộn chạm mép trên sẽ ghim lại)</span>
                <span style="font-size:10px; opacity:0.9;">Dính cố định</span>
              </div>

              <!-- Static Box -->
              <div style="position:static; background:#3b82f6; color:white; padding:10px 14px; border-radius:6px; font-weight:bold; font-size:12px; margin-bottom:10px;">
                🔵 static: Nằm tuần tự trong dòng chảy HTML bình thường
              </div>

              <!-- Relative Box -->
              <div style="position:relative; top:8px; left:16px; background:#f59e0b; color:white; padding:10px 14px; border-radius:6px; font-weight:bold; font-size:12px; margin-bottom:18px; box-shadow:0 2px 6px rgba(245,158,11,0.3);">
                🟡 relative: Dời nhẹ (top: 8px, left: 16px) nhưng vẫn giữ nguyên chỗ cũ trong dòng chảy
              </div>

              <!-- Absolute Box -->
              <div style="position:absolute; top:110px; right:14px; background:#ef4444; color:white; padding:8px 12px; border-radius:6px; font-weight:bold; font-size:11px; box-shadow:0 4px 10px rgba(239,68,68,0.35); z-index:5;">
                🔴 absolute: top: 110px, right: 14px<br><span style="font-size:9px; opacity:0.9;">(Neo theo khung cha relative)</span>
              </div>

              <!-- Dummy text to create scrolling space -->
              <div style="font-size:11px; color:#64748b; line-height:1.6; margin:14px 0 16px 0; padding-right:120px;">
                <p style="margin:0 0 6px 0;">👇 <em>Hãy cuộn chuột lên/xuống bên trong khung này để quan sát:</em></p>
                <p style="margin:0 0 6px 0;">• Thanh <strong>sticky</strong> màu xanh lá sẽ dính chặt ở mép trên.</p>
                <p style="margin:0 0 6px 0;">• Thẻ <strong>absolute</strong> màu đỏ bay tự do neo góc phải.</p>
                <p style="margin:0;">• Thẻ <strong>fixed</strong> màu tím ghim cố định góc phải dưới khung nhìn mini page.</p>
              </div>

              <div style="background:#e2e8f0; padding:10px; border-radius:6px; font-size:11px; color:#475569; margin-bottom:12px;">
                Đoạn văn bản đệm số 1: Giúp tạo độ cao trang web để học viên thử cuộn...
              </div>

              <div style="background:#e2e8f0; padding:10px; border-radius:6px; font-size:11px; color:#475569; margin-bottom:12px;">
                Đoạn văn bản đệm số 2: Cuộn tiếp xuống đáy trang...
              </div>

              <div style="background:#e2e8f0; padding:10px; border-radius:6px; font-size:11px; color:#475569;">
                Đoạn văn bản đệm số 3: Đáy trang mini page!
              </div>

              <!-- Fixed Badge in bottom right of preview container -->
              <div style="position:sticky; bottom:8px; float:right; background:#8b5cf6; color:white; padding:6px 12px; border-radius:20px; font-weight:bold; font-size:11px; box-shadow:0 4px 12px rgba(139,92,246,0.4); z-index:20;">
                🟣 fixed: Ghim góc cố định
              </div>
            </div>
          `;
          return { generatedCss: css, previewHtml: html };
        } else {
          const css = `.khung-neo-relative {
  position: relative;
  height: 200px;
  background: #f8fafc;
  border: 2px dashed #94a3b8;
}

.phan-tu-tuy-chinh {
  position: ${posMode};
  ${posMode !== 'static' ? `top: ${posTop}px;\n  left: ${posLeft}px;` : '/* static không nhận toạ độ top/left */'}
  background: #ef4444;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
}`;
          const html = `
            <div style="font-family:sans-serif; position:relative; width:100%; height:200px; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:10px; overflow:auto; padding:12px; box-sizing:border-box;">
              <span style="font-size:11px; color:#64748b; font-weight:bold;">Khung mốc toạ độ (position: relative)</span>
              <div style="margin-top:10px; padding:6px 10px; background:#e2e8f0; border-radius:6px; font-size:11px; color:#475569; display:inline-block;">
                Dòng chảy 1
              </div>
              <div style="position:${posMode}; ${posMode !== 'static' ? `top:${posTop}px; left:${posLeft}px;` : ''} background:#ef4444; color:white; padding:10px 16px; border-radius:8px; font-weight:bold; font-size:12px; box-shadow:0 4px 12px rgba(239,68,68,0.3); transition:all 0.15s; z-index:10; display:inline-block;">
                position: ${posMode} ${posMode !== 'static' ? `(top: ${posTop}px, left: ${posLeft}px)` : ''}
              </div>
              <div style="margin-top:10px; padding:6px 10px; background:#e2e8f0; border-radius:6px; font-size:11px; color:#475569; display:block;">
                Dòng chảy 2
              </div>
            </div>
          `;
          return { generatedCss: css, previewHtml: html };
        }
      }

      case 'flexbox': {
        const css = `.khung-flex {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  gap: ${flexGap}px;
  flex-wrap: ${flexWrap};
  min-height: 160px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}`;
        const items = Array.from({ length: itemCount }, (_, i) => i + 1);
        const itemColors = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed'];
        const html = `
          <div style="display:flex; flex-direction:${flexDirection}; justify-content:${justifyContent}; align-items:${alignItems}; gap:${flexGap}px; flex-wrap:${flexWrap}; min-height:160px; padding:16px; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:12px; box-sizing:border-box; font-family:sans-serif; overflow:hidden;">
            ${items
              .map(
                (n) => `
              <div style="background:${itemColors[(n - 1) % itemColors.length]}; color:white; padding:${12 + (n % 2) * 6}px ${16 + (n % 3) * 6}px; border-radius:8px; font-weight:bold; font-size:13px; box-shadow:0 2px 6px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; white-space:nowrap;">
                Mục ${n}
              </div>
            `
              )
              .join('')}
          </div>
        `;
        return { generatedCss: css, previewHtml: html };
      }

      case 'grid': {
        const css = `.khung-grid {
  display: grid;
  grid-template-columns: repeat(${gridCols}, 1fr);
  gap: ${gridGap}px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}
${spanFirstCols > 1 || spanFirstRows > 1 ? `.o-dac-biet {\n  ${spanFirstCols > 1 ? `grid-column: span ${spanFirstCols};` : ''}\n  ${spanFirstRows > 1 ? `grid-row: span ${spanFirstRows};` : ''}\n}` : ''}`;
        const html = `
          <div style="display:grid; grid-template-columns:repeat(${gridCols}, 1fr); gap:${gridGap}px; padding:16px; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:12px; font-family:sans-serif; box-sizing:border-box;">
            <div style="${spanFirstCols > 1 ? `grid-column: span ${spanFirstCols};` : ''} ${spanFirstRows > 1 ? `grid-row: span ${spanFirstRows};` : ''} background:#4f46e5; color:white; padding:18px; border-radius:8px; font-weight:bold; font-size:12px; text-align:center; box-shadow:0 2px 6px rgba(79,70,229,0.3); display:flex; align-items:center; justify-content:center;">
              Ô 1 ${spanFirstCols > 1 ? `(span ${spanFirstCols} cols)` : ''} ${spanFirstRows > 1 ? `(span ${spanFirstRows} rows)` : ''}
            </div>
            <div style="background:#059669; color:white; padding:18px; border-radius:8px; font-weight:bold; font-size:12px; text-align:center;">
              Ô 2
            </div>
            <div style="background:#d97706; color:white; padding:18px; border-radius:8px; font-weight:bold; font-size:12px; text-align:center;">
              Ô 3
            </div>
            <div style="background:#0891b2; color:white; padding:18px; border-radius:8px; font-weight:bold; font-size:12px; text-align:center;">
              Ô 4
            </div>
            <div style="background:#7c3aed; color:white; padding:18px; border-radius:8px; font-weight:bold; font-size:12px; text-align:center;">
              Ô 5
            </div>
            <div style="background:#e11d48; color:white; padding:18px; border-radius:8px; font-weight:bold; font-size:12px; text-align:center;">
              Ô 6
            </div>
          </div>
        `;
        return { generatedCss: css, previewHtml: html };
      }

      case 'animations': {
        const isActive = triggerMode === 'click' ? isClicked : isHovered;
        const activeScale = isActive ? transformScale : 1;
        const activeRotate = isActive ? transformRotate : 0;
        const activeTranslateY = isActive ? transformTranslateY : 0;
        const css = `@keyframes nhip-dap {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.the-hieu-ung {
  transition: ${transProp} ${transDuration}s ${transEasing};
  animation: nhip-dap ${animSpeed}s ease-in-out infinite;
  animation-play-state: ${animPlaying ? 'running' : 'paused'};
}

.the-hieu-ung:${triggerMode === 'hover' ? 'hover' : 'active'} {
  transform: translateY(${transformTranslateY}px) rotate(${transformRotate}deg) scale(${transformScale});
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.45);
}`;
        const html = `
          <style>
            @keyframes nhip-dap-preview {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          </style>
          <div style="display:flex; justify-content:center; align-items:center; padding:32px 10px; font-family:sans-serif;">
            <div style="padding:20px 28px; background:linear-gradient(135deg, #6366f1, #a855f7); color:white; border-radius:12px; font-weight:bold; font-size:14px; cursor:pointer; box-shadow:0 6px 20px rgba(99,102,241,0.35); transition:${transProp} ${transDuration}s ${transEasing}; transform:translateY(${activeTranslateY}px) rotate(${activeRotate}deg) scale(${activeScale}); ${animPlaying ? `animation:nhip-dap-preview ${animSpeed}s ease-in-out infinite;` : ''} text-align:center; user-select:none;">
              ✨ ${isTouch ? 'Chạm vào đây để bật/tắt hiệu ứng!' : triggerMode === 'hover' ? 'Rê chuột vào đây!' : 'Bấm chuột vào đây!'}
              <div style="font-size:11px; opacity:0.88; margin-top:4px;">
                transition: ${transProp} ${transDuration}s (${transEasing})
              </div>
            </div>
          </div>
        `;
        return { generatedCss: css, previewHtml: html };
      }

      case 'responsive': {
        const isMobile = viewportWidth < 640;
        const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
        const bpName = isMobile ? 'Mobile (<640px)' : isTablet ? 'Tablet (640px - 1023px)' : 'Desktop (>=1024px)';
        const bpColor = isMobile ? '#ef4444' : isTablet ? '#f59e0b' : '#10b981';

        const css = `/* 1. Mặc định Desktop (>= 1024px): 3 cột dàn ngang */
.luoi-san-pham {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

/* 2. Tablet (< 1024px): Co giãn tự do */
@media (max-width: 1023px) {
  .luoi-san-pham {
    flex-wrap: wrap;
  }
}

/* 3. Mobile (< 640px): Xếp thành 1 cột dọc */
@media (max-width: 639px) {
  .luoi-san-pham {
    flex-direction: column;
  }
}`;
        const html = `
          <div style="width:100%; max-width:${viewportWidth}px; margin:0 auto; padding:16px; background:#ffffff; border:3px solid ${bpColor}; border-radius:12px; font-family:sans-serif; box-sizing:border-box; transition:max-width 0.2s;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #e2e8f0; font-size:12px; color:#475569;">
              <strong>Khung nhìn: ${viewportWidth}px</strong>
              <span style="background:${bpColor}22; color:${bpColor}; padding:3px 10px; border-radius:20px; font-weight:bold; font-size:11px;">
                ${bpName}
              </span>
            </div>
            <div style="display:flex; flex-direction:${isMobile ? 'column' : 'row'}; flex-wrap:${isTablet ? 'wrap' : 'nowrap'}; gap:12px;">
              <div style="flex:1; min-width:${isTablet ? '45%' : 'auto'}; background:#e0e7ff; color:#4338ca; padding:16px; border-radius:8px; text-align:center; font-weight:bold; font-size:13px;">
                Khối 1 (${isMobile ? 'Cột dọc full' : isTablet ? 'Cột nửa' : 'Cột 1'})
              </div>
              <div style="flex:1; min-width:${isTablet ? '45%' : 'auto'}; background:#dcfce7; color:#15803d; padding:16px; border-radius:8px; text-align:center; font-weight:bold; font-size:13px;">
                Khối 2 (${isMobile ? 'Cột dọc full' : isTablet ? 'Cột nửa' : 'Cột 2'})
              </div>
              <div style="flex:1; min-width:${isTablet ? '100%' : 'auto'}; background:#fef3c7; color:#b45309; padding:16px; border-radius:8px; text-align:center; font-weight:bold; font-size:13px;">
                Khối 3 (${isMobile ? 'Cột dọc full' : isTablet ? 'Cột đáy' : 'Cột 3'})
              </div>
            </div>
          </div>
        `;
        return { generatedCss: css, previewHtml: html };
      }

      default:
        return { generatedCss: '/* Chọn bài học để hiển thị sân chơi */', previewHtml: '<div></div>' };
    }
  }, [
    type,
    textColor,
    useGradient,
    bgColor,
    gradColor1,
    gradColor2,
    gradAngle,
    unitType,
    unitValue,
    containerWidth,
    margin,
    padding,
    borderWidth,
    boxSizing,
    borderSize,
    borderStyle,
    borderColor,
    borderRadius,
    isCircle,
    shadowX,
    shadowY,
    shadowBlur,
    shadowSpread,
    shadowColor,
    shadowOpacity,
    positionViewMode,
    posMode,
    posTop,
    posLeft,
    flexDirection,
    justifyContent,
    alignItems,
    flexGap,
    flexWrap,
    itemCount,
    gridCols,
    gridGap,
    spanFirstCols,
    spanFirstRows,
    transDuration,
    transEasing,
    transProp,
    triggerMode,
    isClicked,
    isHovered,
    transformScale,
    transformRotate,
    transformTranslateY,
    animPlaying,
    animSpeed,
    viewportWidth,
    isTouch,
  ]);

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(generatedCss);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-default bg-elevated p-4 sm:p-5 space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-primary">Sân chơi CSS tương tác (Interactive Playground)</h3>
            <p className="text-[11px] text-muted">Kéo thanh trượt hoặc đổi thuộc tính để xem giao diện cập nhật ngay lập tức.</p>
          </div>
        </div>

        <button
          onClick={handleCopyCss}
          className="touch-target-h flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold bg-panel hover:bg-hover text-secondary hover:text-primary border border-default transition-all cursor-pointer shadow-xs"
          title={isTouch ? undefined : 'Sao chép toàn bộ mã CSS đã sinh'}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Đã sao chép CSS' : 'Sao chép CSS'}</span>
        </button>
      </div>

      {/* Main Grid: Controls on Left, Live Preview & Generated CSS on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Controls Column (col-span-5) */}
        <div className="lg:col-span-5 min-w-0 space-y-3.5 bg-panel p-3.5 rounded-[var(--radius-md)] border border-subtle text-xs">
          <div className="flex items-center gap-1.5 font-bold text-primary text-xs uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-accent" />
            <span>Bảng điều khiển thuộc tính</span>
          </div>

          {/* Controls for Lesson 3: Colors */}
          {type === 'colors' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-secondary block mb-1">Màu chữ (color):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded border border-default cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-primary">{textColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1 min-h-[36px]">
                <input
                  type="checkbox"
                  id="gradient-toggle"
                  checked={useGradient}
                  onChange={(e) => setUseGradient(e.target.checked)}
                  className="w-4 h-4 rounded border-default text-accent focus:ring-accent"
                />
                <label htmlFor="gradient-toggle" className="text-secondary cursor-pointer">
                  Dùng dải màu chuyển (Linear Gradient)
                </label>
              </div>

              {useGradient ? (
                <div className="space-y-2.5 pl-2 border-l-2 border-subtle">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Màu bắt đầu:</span>
                    <input
                      type="color"
                      value={gradColor1}
                      onChange={(e) => setGradColor1(e.target.value)}
                      className="w-9 h-9 sm:w-7 sm:h-7 rounded border border-default cursor-pointer bg-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Màu kết thúc:</span>
                    <input
                      type="color"
                      value={gradColor2}
                      onChange={(e) => setGradColor2(e.target.value)}
                      className="w-9 h-9 sm:w-7 sm:h-7 rounded border border-default cursor-pointer bg-transparent"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-muted mb-1">
                      <span>Góc xoay:</span>
                      <span className="font-mono">{gradAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={gradAngle}
                      onChange={(e) => setGradAngle(Number(e.target.value))}
                      className="w-full accent-[var(--accent-base)]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-secondary block mb-1">Màu nền đơn sắc (background-color):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 sm:w-8 sm:h-8 rounded border border-default cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-primary">{bgColor}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls for Lesson 5: Units */}
          {type === 'units' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-secondary block mb-1">Chọn đơn vị đo (Unit):</label>
                <div className="touch-gap grid grid-cols-5 gap-1">
                  {(['px', '%', 'em', 'rem', 'vw'] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => {
                        setUnitType(u);
                        if (u === 'px') setUnitValue(280);
                        if (u === '%') setUnitValue(70);
                        if (u === 'em' || u === 'rem') setUnitValue(16);
                        if (u === 'vw') setUnitValue(45);
                      }}
                      className={`touch-target-h py-1.5 text-xs font-bold rounded-[var(--radius-sm)] border transition-all cursor-pointer ${
                        unitType === u
                          ? 'bg-accent text-[var(--text-on-accent)] border-accent shadow-xs'
                          : 'bg-elevated border-default text-secondary hover:text-primary'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>Giá trị width:</span>
                  <span className="font-mono font-bold text-accent">
                    {unitValue}
                    {unitType}
                  </span>
                </div>
                <input
                  type="range"
                  min={unitType === 'em' || unitType === 'rem' ? 4 : 20}
                  max={unitType === 'em' || unitType === 'rem' ? 32 : unitType === '%' ? 100 : 450}
                  value={unitValue}
                  onChange={(e) => setUnitValue(Number(e.target.value))}
                  className="w-full accent-[var(--accent-base)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>Bề ngang khung cha (Container):</span>
                  <span className="font-mono font-bold text-primary">{containerWidth}px</span>
                </div>
                <input
                  type="range"
                  min={250}
                  max={700}
                  value={containerWidth}
                  onChange={(e) => setContainerWidth(Number(e.target.value))}
                  className="w-full accent-[var(--accent-base)]"
                />
                <p className="text-[10px] text-muted mt-1 leading-snug">
                  Kéo khung cha để thấy: đơn vị % tự động co giãn theo cha, còn rem và px giữ nguyên độ dài!
                </p>
              </div>
            </div>
          )}

          {/* Controls for Lesson 6: Box Model */}
          {type === 'box-model' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-secondary block mb-1">Quy tắc tính toán box-sizing:</label>
                <div className="touch-gap grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBoxSizing('border-box')}
                    className={`touch-target-h p-2 rounded-[var(--radius-sm)] border text-xs font-bold cursor-pointer transition-all ${
                      boxSizing === 'border-box'
                        ? 'bg-success-soft text-success border-success shadow-xs'
                        : 'bg-elevated border-default text-muted'
                    }`}
                  >
                    ✓ border-box (Chuẩn)
                  </button>
                  <button
                    onClick={() => setBoxSizing('content-box')}
                    className={`touch-target-h p-2 rounded-[var(--radius-sm)] border text-xs font-bold cursor-pointer transition-all ${
                      boxSizing === 'content-box'
                        ? 'bg-danger-soft text-danger border-danger shadow-xs'
                        : 'bg-elevated border-default text-muted'
                    }`}
                  >
                    content-box (Cũ)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>Padding (Khoảng đệm trong):</span>
                  <span className="font-mono font-bold text-success">{padding}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full accent-[var(--color-success)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>Border (Đường viền):</span>
                  <span className="font-mono font-bold text-warning">{borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  className="w-full accent-[var(--color-warning)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>Margin (Khoảng cách ngoài):</span>
                  <span className="font-mono font-bold text-danger">{margin}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-[var(--color-danger)]"
                />
              </div>
            </div>
          )}

          {/* Controls for Lesson 7: Borders & Shadows */}
          {type === 'borders' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>Độ dày viền (border-width):</span>
                  <span className="font-mono">{borderSize}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={16}
                  value={borderSize}
                  onChange={(e) => setBorderSize(Number(e.target.value))}
                  className="w-full accent-[var(--accent-base)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-muted block mb-1">Kiểu viền:</label>
                  <select
                    value={borderStyle}
                    onChange={(e) => setBorderStyle(e.target.value as any)}
                    className="touch-target-h w-full p-1.5 rounded bg-elevated border border-default text-primary text-xs"
                  >
                    <option value="solid">solid (nét liền)</option>
                    <option value="dashed">dashed (nét đứt)</option>
                    <option value="dotted">dotted (chấm tròn)</option>
                    <option value="double">double (viền đôi)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted block mb-1">Màu viền:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-9 h-9 sm:w-7 sm:h-7 rounded border border-default cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] truncate">{borderColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[11px] text-secondary mb-1 gap-2">
                  <span>Bo góc (border-radius):</span>
                  <button
                    onClick={() => setIsCircle(!isCircle)}
                    className={`touch-target-h px-2.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                      isCircle ? 'bg-accent text-[var(--text-on-accent)] border-accent' : 'bg-elevated border-default text-muted'
                    }`}
                  >
                    Bo tròn (50%)
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  disabled={isCircle}
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-[var(--accent-base)] disabled:opacity-30"
                />
              </div>

              <div className="pt-2 border-t border-subtle space-y-2">
                <span className="text-[11px] font-bold text-primary block">Tạo đổ bóng (box-shadow):</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted">Dời ngang (X): {shadowX}px</span>
                    <input
                      type="range"
                      min={-20}
                      max={20}
                      value={shadowX}
                      onChange={(e) => setShadowX(Number(e.target.value))}
                      className="w-full accent-[var(--accent-base)]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted">Dời dọc (Y): {shadowY}px</span>
                    <input
                      type="range"
                      min={-15}
                      max={30}
                      value={shadowY}
                      onChange={(e) => setShadowY(Number(e.target.value))}
                      className="w-full accent-[var(--accent-base)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted">Độ mờ (blur): {shadowBlur}px</span>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={shadowBlur}
                      onChange={(e) => setShadowBlur(Number(e.target.value))}
                      className="w-full accent-[var(--accent-base)]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted">Độ lan (spread): {shadowSpread}px</span>
                    <input
                      type="range"
                      min={-10}
                      max={20}
                      value={shadowSpread}
                      onChange={(e) => setShadowSpread(Number(e.target.value))}
                      className="w-full accent-[var(--accent-base)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 items-center pt-1">
                  <div>
                    <span className="text-[10px] text-muted block mb-1">Màu bóng:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={shadowColor}
                        onChange={(e) => setShadowColor(e.target.value)}
                        className="w-7 h-7 rounded border border-default cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-[11px]">{shadowColor}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block mb-1">Độ mờ đục: {Math.round(shadowOpacity * 100)}%</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={shadowOpacity}
                      onChange={(e) => setShadowOpacity(Number(e.target.value))}
                      className="w-full accent-[var(--accent-base)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls for Lesson 8: Position */}
          {type === 'display-position' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-secondary block mb-1">Chế độ xem:</label>
                <div className="touch-gap grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setPositionViewMode('all')}
                    className={`touch-target-h py-1.5 px-2 text-xs font-bold rounded-[var(--radius-sm)] border transition-all cursor-pointer ${
                      positionViewMode === 'all'
                        ? 'bg-accent text-[var(--text-on-accent)] border-accent shadow-xs'
                        : 'bg-elevated border-default text-secondary hover:text-primary'
                    }`}
                  >
                    Xem cả 5 giá trị (Trang cuộn)
                  </button>
                  <button
                    onClick={() => setPositionViewMode('custom')}
                    className={`touch-target-h py-1.5 px-2 text-xs font-bold rounded-[var(--radius-sm)] border transition-all cursor-pointer ${
                      positionViewMode === 'custom'
                        ? 'bg-accent text-[var(--text-on-accent)] border-accent shadow-xs'
                        : 'bg-elevated border-default text-secondary hover:text-primary'
                    }`}
                  >
                    Tùy chỉnh toạ độ từng loại
                  </button>
                </div>
              </div>

              {positionViewMode === 'custom' ? (
                <>
                  <div>
                    <label className="text-[11px] text-secondary block mb-1">Giá trị position:</label>
                    <div className="touch-gap grid grid-cols-2 gap-1.5">
                      {(['static', 'relative', 'absolute', 'fixed', 'sticky'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setPosMode(m)}
                          className={`touch-target-h p-1.5 text-xs font-bold rounded-[var(--radius-sm)] border transition-all cursor-pointer ${
                            posMode === m
                              ? 'bg-accent text-[var(--text-on-accent)] border-accent shadow-xs'
                              : 'bg-elevated border-default text-secondary hover:text-primary'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {posMode !== 'static' && (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] text-secondary mb-1">
                          <span>Tọa độ top:</span>
                          <span className="font-mono">{posTop}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={posTop}
                          onChange={(e) => setPosTop(Number(e.target.value))}
                          className="w-full accent-[var(--accent-base)]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-secondary mb-1">
                          <span>Tọa độ left:</span>
                          <span className="font-mono">{posLeft}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={160}
                          value={posLeft}
                          onChange={(e) => setPosLeft(Number(e.target.value))}
                          className="w-full accent-[var(--accent-base)]"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-2.5 rounded bg-elevated border border-default space-y-1.5 text-[11px] leading-relaxed text-secondary">
                  <div className="font-bold text-primary">Quan sát 5 loại position trong trang cuộn:</div>
                  <div>• <strong className="text-info">static:</strong> Trôi tự nhiên theo văn bản.</div>
                  <div>• <strong className="text-warning">relative:</strong> Lệch toạ độ nhưng giữ chỗ trong dòng.</div>
                  <div>• <strong className="text-success">sticky:</strong> Chạm mép trên thì dính chặt lại.</div>
                  <div>• <strong className="text-danger">absolute:</strong> Thoát dòng, neo góc khung cha.</div>
                  <div>• <strong className="text-accent-2">fixed:</strong> Ghim chặt góc màn hình khi cuộn.</div>
                </div>
              )}
            </div>
          )}

          {/* Controls for Lesson 9: Flexbox */}
          {type === 'flexbox' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted block mb-1">flex-direction (Hướng dàn):</label>
                <div className="touch-gap grid grid-cols-3 gap-1">
                  {(['row', 'column', 'row-reverse'] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setFlexDirection(dir)}
                      className={`touch-target-h py-1 text-[11px] font-bold rounded border cursor-pointer ${
                        flexDirection === dir
                          ? 'bg-accent text-[var(--text-on-accent)] border-accent'
                          : 'bg-elevated border-default text-secondary'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted block mb-1">justify-content (Căn trục chính):</label>
                <select
                  value={justifyContent}
                  onChange={(e) => setJustifyContent(e.target.value as any)}
                  className="touch-target-h w-full p-1.5 rounded bg-elevated border border-default text-primary text-xs"
                >
                  <option value="flex-start">flex-start (Dồn về đầu)</option>
                  <option value="center">center (Căn giữa)</option>
                  <option value="flex-end">flex-end (Dồn về cuối)</option>
                  <option value="space-between">space-between (Dãn đều 2 mép)</option>
                  <option value="space-around">space-around (Chia đều khoảng trống)</option>
                  <option value="space-evenly">space-evenly (Khoảng cách bằng hệt nhau)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-muted block mb-1">align-items (Căn trục phụ):</label>
                <select
                  value={alignItems}
                  onChange={(e) => setAlignItems(e.target.value as any)}
                  className="touch-target-h w-full p-1.5 rounded bg-elevated border border-default text-primary text-xs"
                >
                  <option value="center">center (Căn giữa trục phụ)</option>
                  <option value="flex-start">flex-start (Đầu trục phụ)</option>
                  <option value="flex-end">flex-end (Cuối trục phụ)</option>
                  <option value="stretch">stretch (Kéo dài hết chiều dọc)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted block mb-1">flex-wrap (Tự xuống dòng):</label>
                  <div className="touch-gap grid grid-cols-2 gap-1">
                    {(['nowrap', 'wrap'] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setFlexWrap(w)}
                        className={`touch-target-h py-1 text-[10px] font-bold rounded border cursor-pointer ${
                          flexWrap === w
                            ? 'bg-accent text-[var(--text-on-accent)] border-accent'
                            : 'bg-elevated border-default text-secondary'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-muted mb-1">
                    <span>Khoảng cách gap:</span>
                    <span className="font-mono">{flexGap}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={36}
                    value={flexGap}
                    onChange={(e) => setFlexGap(Number(e.target.value))}
                    className="w-full accent-[var(--accent-base)]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-secondary">Số lượng khối:</span>
                <div className="touch-gap flex items-center gap-1.5">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setItemCount(n)}
                      className={`touch-target w-6 h-6 rounded text-xs font-bold border cursor-pointer flex items-center justify-center ${
                        itemCount === n
                          ? 'bg-accent text-[var(--text-on-accent)] border-accent'
                          : 'bg-elevated border-default text-secondary'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Controls for Lesson 10: Grid */}
          {type === 'grid' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>Số cột (grid-template-columns):</span>
                  <span className="font-mono font-bold text-accent">{gridCols} cột</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={gridCols}
                  onChange={(e) => setGridCols(Number(e.target.value))}
                  className="w-full accent-[var(--accent-base)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>Khoảng cách rãnh (gap):</span>
                  <span className="font-mono font-bold text-primary">{gridGap}px</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={36}
                  value={gridGap}
                  onChange={(e) => setGridGap(Number(e.target.value))}
                  className="w-full accent-[var(--accent-base)]"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-subtle">
                <span className="text-[11px] font-bold text-primary block">Mở rộng ô 1 (Spanning):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-muted block mb-1">Trải qua cột (grid-column):</label>
                    <select
                      value={spanFirstCols}
                      onChange={(e) => setSpanFirstCols(Number(e.target.value))}
                      className="touch-target-h w-full p-1.5 rounded bg-elevated border border-default text-primary text-xs"
                    >
                      <option value={1}>span 1 (mặc định 1 ô)</option>
                      <option value={2}>span 2 (chiếm 2 cột)</option>
                      <option value={3}>span 3 (chiếm 3 cột)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted block mb-1">Trải qua hàng (grid-row):</label>
                    <select
                      value={spanFirstRows}
                      onChange={(e) => setSpanFirstRows(Number(e.target.value))}
                      className="touch-target-h w-full p-1.5 rounded bg-elevated border border-default text-primary text-xs"
                    >
                      <option value={1}>span 1 (mặc định 1 hàng)</option>
                      <option value={2}>span 2 (chiếm 2 hàng)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls for Lesson 11: Animations */}
          {type === 'animations' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted block mb-1">Cách kích hoạt hiệu ứng:</label>
                <div className="touch-gap grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setTriggerMode('hover')}
                    className={`touch-target-h py-1 px-2 text-xs font-bold rounded border cursor-pointer ${
                      triggerMode === 'hover'
                        ? 'bg-accent text-[var(--text-on-accent)] border-accent'
                        : 'bg-elevated border-default text-secondary'
                    }`}
                  >
                    Rê chuột (:hover)
                  </button>
                  <button
                    onClick={() => {
                      setTriggerMode('click');
                      setIsClicked(!isClicked);
                    }}
                    className={`touch-target-h py-1 px-2 text-xs font-bold rounded border cursor-pointer ${
                      triggerMode === 'click'
                        ? 'bg-accent text-[var(--text-on-accent)] border-accent'
                        : 'bg-elevated border-default text-secondary'
                    }`}
                  >
                    Bấm/Chạm (:active)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="flex justify-between text-[10px] text-muted mb-1">
                    <span>Thời gian transition:</span>
                    <span className="font-mono">{transDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    value={transDuration}
                    onChange={(e) => setTransDuration(Number(e.target.value))}
                    className="w-full accent-[var(--accent-base)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted block mb-1">Thuộc tính áp dụng:</label>
                  <select
                    value={transProp}
                    onChange={(e) => setTransProp(e.target.value as any)}
                    className="touch-target-h w-full p-1.5 rounded bg-elevated border border-default text-primary text-xs"
                  >
                    <option value="all">all (tất cả)</option>
                    <option value="transform">transform</option>
                    <option value="background-color">background-color</option>
                    <option value="box-shadow">box-shadow</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted block mb-1">Gia tốc chuyển động (easing):</label>
                <select
                  value={transEasing}
                  onChange={(e) => setTransEasing(e.target.value as any)}
                  className="touch-target-h w-full p-1.5 rounded bg-elevated border border-default text-primary text-xs"
                >
                  <option value="ease">ease (mặc định mượt)</option>
                  <option value="linear">linear (đều đặn)</option>
                  <option value="ease-in-out">ease-in-out (chậm ở 2 đầu)</option>
                  <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">bouncy (nảy sinh động)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-muted">Dời (Y): {transformTranslateY}px</span>
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    value={transformTranslateY}
                    onChange={(e) => setTransformTranslateY(Number(e.target.value))}
                    className="w-full accent-[var(--accent-base)]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted">Xoay: {transformRotate}°</span>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    value={transformRotate}
                    onChange={(e) => setTransformRotate(Number(e.target.value))}
                    className="w-full accent-[var(--accent-base)]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted">Phóng: {transformScale}x</span>
                  <input
                    type="range"
                    min={0.6}
                    max={1.4}
                    step={0.05}
                    value={transformScale}
                    onChange={(e) => setTransformScale(Number(e.target.value))}
                    className="w-full accent-[var(--accent-base)]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-subtle space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-primary">Hoạt ảnh @keyframes nhip-dap:</span>
                  <button
                    onClick={() => setAnimPlaying(!animPlaying)}
                    className={`touch-target-h flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border cursor-pointer ${
                      animPlaying
                        ? 'bg-warning-soft text-warning border-[var(--color-warning)]/30'
                        : 'bg-elevated text-muted border-default'
                    }`}
                  >
                    {animPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{animPlaying ? 'Tạm dừng' : 'Chạy tiếp'}</span>
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-muted mb-1">
                    <span>Tốc độ lặp chu kỳ:</span>
                    <span className="font-mono">{animSpeed}s / chu kỳ</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={4.0}
                    step={0.25}
                    value={animSpeed}
                    onChange={(e) => setAnimSpeed(Number(e.target.value))}
                    className="w-full accent-[var(--accent-base)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Controls for Lesson 12: Responsive */}
          {type === 'responsive' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-secondary mb-1">
                  <span>Kéo chiều rộng màn hình (320 - 1200px):</span>
                  <span className="font-mono font-bold text-accent">{viewportWidth}px</span>
                </div>
                <input
                  type="range"
                  min={320}
                  max={1200}
                  value={viewportWidth}
                  onChange={(e) => setViewportWidth(Number(e.target.value))}
                  className="w-full accent-[var(--accent-base)]"
                />
              </div>

              {/* Highlighted active breakpoint indicator */}
              <div className="p-2.5 rounded bg-elevated border border-default space-y-1.5">
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Trạng thái Breakpoint hiện tại:
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-semibold text-center">
                  <div
                    className={`py-1 rounded border transition-all ${
                      viewportWidth < 640
                        ? 'bg-danger-soft text-danger border-danger font-bold shadow-xs'
                        : 'bg-panel text-muted border-subtle'
                    }`}
                  >
                    Mobile &lt;640px
                  </div>
                  <div
                    className={`py-1 rounded border transition-all ${
                      viewportWidth >= 640 && viewportWidth < 1024
                        ? 'bg-warning-soft text-warning border-warning font-bold shadow-xs'
                        : 'bg-panel text-muted border-subtle'
                    }`}
                  >
                    Tablet 640-1023px
                  </div>
                  <div
                    className={`py-1 rounded border transition-all ${
                      viewportWidth >= 1024
                        ? 'bg-success-soft text-success border-success font-bold shadow-xs'
                        : 'bg-panel text-muted border-subtle'
                    }`}
                  >
                    Desktop &gt;=1024px
                  </div>
                </div>
              </div>

              <div className="touch-gap grid grid-cols-3 gap-1 pt-1">
                <button
                  onClick={() => setViewportWidth(375)}
                  className="touch-target-h py-1.5 px-2 rounded border border-default bg-elevated hover:bg-hover text-secondary hover:text-primary text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Smartphone className="w-3 h-3 text-danger flex-shrink-0" />
                  <span>375px</span>
                </button>
                <button
                  onClick={() => setViewportWidth(768)}
                  className="touch-target-h py-1.5 px-2 rounded border border-default bg-elevated hover:bg-hover text-secondary hover:text-primary text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Tablet className="w-3 h-3 text-warning flex-shrink-0" />
                  <span>768px</span>
                </button>
                <button
                  onClick={() => setViewportWidth(1024)}
                  className="touch-target-h py-1.5 px-2 rounded border border-default bg-elevated hover:bg-hover text-secondary hover:text-primary text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Monitor className="w-3 h-3 text-success flex-shrink-0" />
                  <span>1024px</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview & Code Column (col-span-7) */}
        <div className="lg:col-span-7 min-w-0 space-y-3 flex flex-col justify-between">
          {/* Live Preview Box */}
          <div className="rounded-[var(--radius-md)] border border-default bg-white p-3 sm:p-4 shadow-inner min-h-[220px] flex items-center justify-center overflow-x-auto overscroll-contain">
            <div
              className="w-full min-w-0"
              onMouseEnter={!isTouch ? () => setIsHovered(true) : undefined}
              onMouseLeave={!isTouch ? () => setIsHovered(false) : undefined}
              onClick={() => {
                if (isTouch || triggerMode === 'click') {
                  if (triggerMode === 'hover') {
                    setIsHovered((prev) => !prev);
                  } else {
                    setIsClicked((prev) => !prev);
                  }
                }
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>

          {/* Generated Code Block */}
          <div className="rounded-[var(--radius-md)] border border-subtle bg-[var(--code-bg)] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted font-mono border-b border-subtle pb-1.5">
              <span>Mã CSS tự động sinh ra:</span>
              <span className="text-[10px] text-accent">Real-time generated</span>
            </div>
            <pre className="font-mono text-xs text-secondary overflow-x-auto p-1 leading-relaxed whitespace-pre">
              <code>{generatedCss}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

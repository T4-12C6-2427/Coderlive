import React from 'react';
import { Illustration } from '../../types/learning';
import {
  Globe,
  Smartphone,
  Monitor,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Bookmark,
  FileCode,
  Clock,
  EyeOff,
  Eye,
  GitBranch,
  Cpu,
  CornerDownRight,
  Split,
  Maximize2
} from 'lucide-react';

interface CheatIllustrationProps {
  illustration?: Illustration;
}

export const CheatIllustration: React.FC<CheatIllustrationProps> = ({ illustration }) => {
  if (!illustration) return null;

  const { type, data } = illustration;

  switch (type) {
    // 1. DOCTYPE STANDARDS VS QUIRKS MODE COMPARE
    case 'DoctypeCompare':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Split className="w-3.5 h-3.5 text-accent" />
            <span>So sánh: Chế độ chuẩn (Standards Mode) vs Chế độ cũ (Quirks Mode)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            {/* Standards Mode */}
            <div className="p-3 rounded-[var(--radius-sm)] bg-success-soft border border-[var(--color-success)]/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-success">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Có &lt;!DOCTYPE html&gt; (Chuẩn)</span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Trình duyệt tính toán kích thước hộp chuẩn W3C, lề và độ cao phông chữ đồng nhất trên mọi trình duyệt.
              </p>
              <div className="pt-2 flex flex-col items-center">
                <div className="w-36 h-12 rounded bg-elevated border-2 border-success flex items-center justify-center font-mono text-[11px] text-primary shadow-xs">
                  width: 200px (Chuẩn)
                </div>
                <span className="text-[10px] text-success mt-1">Bố cục chính xác 100%</span>
              </div>
            </div>

            {/* Quirks Mode */}
            <div className="p-3 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-danger">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Thiếu DOCTYPE (Quirks Mode)</span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Trình duyệt lùi về quy tắc cũ của IE5 (năm 1999), padding cộng dồn làm vỡ bố cục và kích thước hộp.
              </p>
              <div className="pt-2 flex flex-col items-center">
                <div className="w-44 h-12 rounded bg-elevated border-2 border-dashed border-danger flex items-center justify-center font-mono text-[11px] text-primary shadow-xs">
                  width: 240px (Bị phình)
                </div>
                <span className="text-[10px] text-danger mt-1">Lệch kích thước & phông chữ</span>
              </div>
            </div>
          </div>
        </div>
      );

    // 2. DOCUMENT TREE (Page Anatomy: Head vs Body)
    case 'DocumentTree':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-2.5">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Giải phẫu trang web: Hậu trường (&lt;head&gt;) vs Sân khấu (&lt;body&gt;)</span>
          </div>

          <div className="flex flex-col gap-1.5 font-mono text-xs">
            {/* DOCTYPE Header */}
            <div className="p-2 rounded-[var(--radius-sm)] bg-elevated border border-default flex items-center justify-between">
              <span className="font-bold text-accent">&lt;!DOCTYPE html&gt;</span>
              <span className="text-[10px] text-muted font-sans">Khai báo chuẩn HTML5</span>
            </div>

            {/* HTML Root */}
            <div className="p-2.5 rounded-[var(--radius-sm)] bg-elevated border border-default space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">&lt;html lang="vi"&gt;</span>
                <span className="text-[10px] text-muted font-sans font-medium">Thẻ gốc tài liệu</span>
              </div>

              {/* Head & Body Nodes */}
              <div className="pl-3 sm:pl-5 space-y-2 border-l-2 border-subtle">
                {/* Head Node: Hậu trường */}
                <div className={`p-2.5 rounded-[var(--radius-sm)] border transition-all ${
                  data?.highlight === 'head'
                    ? 'bg-accent-soft border-[var(--accent-base)] text-accent font-semibold shadow-xs'
                    : 'bg-panel border-subtle text-secondary'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-bold">&lt;head&gt;</span>
                      <span className="font-sans text-xs">Hậu trường (Metadata & Cấu hình)</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-panel text-muted border border-subtle font-sans whitespace-nowrap">
                      <EyeOff className="w-3 h-3 text-warning" />
                      <span>Người xem KHÔNG thấy</span>
                    </span>
                  </div>
                  <div className="mt-1.5 pl-3 text-[11px] text-muted font-sans space-y-0.5 border-l border-subtle">
                    <div>• &lt;title&gt; (Tiêu đề tab), &lt;meta&gt; (Bảng mã & viewport)</div>
                    <div>• &lt;link&gt; (Tệp CSS ngoài), &lt;style&gt; (Định dạng giao diện)</div>
                  </div>
                </div>

                {/* Body Node: Sân khấu */}
                <div className={`p-2.5 rounded-[var(--radius-sm)] border transition-all ${
                  data?.highlight === 'body'
                    ? 'bg-accent-soft border-[var(--accent-base)] text-accent font-semibold shadow-xs'
                    : 'bg-panel border-subtle text-secondary'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-bold">&lt;body&gt;</span>
                      <span className="font-sans text-xs">Sân khấu trực quan</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-success-soft text-success border border-[var(--color-success)]/30 font-sans font-medium whitespace-nowrap">
                      <Eye className="w-3 h-3" />
                      <span>Người xem THẤY</span>
                    </span>
                  </div>
                  <div className="mt-1.5 pl-3 text-[11px] text-muted font-sans space-y-0.5 border-l border-subtle">
                    <div>• Tiêu đề &lt;h1&gt;, đoạn văn &lt;p&gt;, nút bấm &lt;button&gt;</div>
                    <div>• Ảnh &lt;img&gt;, bảng biểu &lt;table&gt;, biểu mẫu &lt;form&gt;</div>
                  </div>
                </div>
              </div>

              <span className="font-bold text-primary block pt-1">&lt;/html&gt;</span>
            </div>
          </div>
        </div>
      );

    // 3. BROWSER TAB MOCK + SERP + BOOKMARK
    case 'BrowserTabMock':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-accent" />
            <span>Mô phỏng 3 vị trí hiển thị của &lt;title&gt; & &lt;meta&gt;</span>
          </div>

          {/* Tab Bar & URL */}
          <div className="rounded-[var(--radius-sm)] border border-default bg-[var(--code-bg)] overflow-hidden shadow-xs">
            {/* Browser top controls */}
            <div className="px-3 py-1.5 bg-elevated border-b border-subtle flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
              </div>

              {/* Active Tab */}
              <div className="px-3 py-1 rounded-t bg-panel border-t border-x border-default text-xs font-semibold text-primary flex items-center gap-1.5 truncate max-w-xs shadow-xs">
                <Globe className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span className="truncate">{data?.title || 'HTMLive - Trình soạn thảo HTML'}</span>
              </div>
            </div>

            {/* Address Bar */}
            <div className="px-3 py-1.5 bg-panel/60 border-b border-subtle flex items-center gap-2 text-[11px] text-muted font-mono">
              <span className="text-secondary">https://</span>
              <span className="text-primary truncate">example.com/trang-chu</span>
            </div>

            {/* Empty Body Note */}
            <div className="p-3 text-center text-xs text-muted font-sans">
              Vùng nội dung bên trong &lt;body&gt; (Thẻ &lt;title&gt; không chiếm chỗ ở đây)
            </div>
          </div>

          {/* Google Search Result Mockup */}
          {data?.showSerp && (
            <div className="p-3 rounded-[var(--radius-sm)] bg-elevated border border-default space-y-1">
              <div className="text-[10px] text-muted flex items-center gap-1 font-sans">
                <Search className="w-3 h-3 text-accent" />
                <span>Xuất hiện trên kết quả tìm kiếm Google (SEO):</span>
              </div>
              <div className="text-sm font-semibold text-info hover:underline cursor-pointer truncate">
                {data?.title || 'Tiêu đề trang web'}
              </div>
              <div className="text-[11px] text-success font-mono">
                https://example.com › trang-chu
              </div>
              <p className="text-xs text-secondary leading-snug line-clamp-2">
                {data?.description || 'Nội dung mô tả trang web thu hút người dùng nhấp vào xem từ kết quả tìm kiếm (meta description).'}
              </p>
            </div>
          )}

          {/* Bookmark bar mockup */}
          {data?.showBookmark && (
            <div className="p-2.5 rounded-[var(--radius-sm)] bg-elevated border border-subtle flex items-center gap-2 text-xs">
              <Bookmark className="w-3.5 h-3.5 text-warning flex-shrink-0" />
              <span className="text-muted text-[11px]">Thanh dấu trang:</span>
              <span className="font-semibold text-primary truncate">{data?.title || 'Trang web'}</span>
            </div>
          )}
        </div>
      );

    // 4. PHONE COMPARE (Viewport Simulation)
    case 'PhoneCompare':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-accent" />
            <span>So sánh hiển thị trên màn hình điện thoại di động</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            {/* Without Viewport */}
            <div className="p-3 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-danger">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Không có thẻ Viewport</span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Trình duyệt giả lập màn hình máy tính 980px, chữ và nút bấm co nhỏ li ti, người dùng phải dùng 2 ngón tay kéo zoom to mới đọc được.
              </p>
              <div className="pt-2 flex justify-center">
                <div className="w-28 h-40 rounded-xl bg-elevated border-2 border-danger p-1.5 flex flex-col items-center justify-between shadow-xs">
                  <div className="w-full text-[6px] text-center text-muted border-b border-subtle pb-1">
                    980px zoom out
                  </div>
                  <div className="text-[7px] text-danger text-center leading-tight">
                    Chữ siêu bé....................
                  </div>
                  <div className="w-6 h-1 rounded bg-muted/40" />
                </div>
              </div>
            </div>

            {/* With Viewport */}
            <div className="p-3 rounded-[var(--radius-sm)] bg-success-soft border border-[var(--color-success)]/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-success">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Có &lt;meta name="viewport"&gt;</span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Trang web tự động vừa vặn 100% bề ngang điện thoại, phông chữ to rõ, nút bấm vừa vặn đầu ngón tay cái.
              </p>
              <div className="pt-2 flex justify-center">
                <div className="w-28 h-40 rounded-xl bg-elevated border-2 border-success p-2 flex flex-col justify-between shadow-xs">
                  <div className="w-full text-[8px] font-bold text-primary border-b border-subtle pb-1">
                    Trang chuẩn mobile
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] text-success font-semibold">Chữ to rõ ràng</div>
                    <div className="h-3.5 rounded bg-accent text-[8px] text-white flex items-center justify-center font-bold">
                      Nút bấm
                    </div>
                  </div>
                  <div className="w-6 h-1 rounded bg-muted/40 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    // 5. CHARSET COMPARE (UTF-8 Tiếng Việt có dấu vs Lỗi mã hóa)
    case 'CharsetCompare':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-accent" />
            <span>Mô phỏng bảng mã ký tự: Chuẩn UTF-8 vs Lỗi vỡ chữ (Mojibake)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="p-3 rounded-[var(--radius-sm)] bg-success-soft border border-[var(--color-success)]/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-success">
                <CheckCircle2 className="w-4 h-4" />
                <span>Có &lt;meta charset="UTF-8"&gt;</span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Trình duyệt giải mã chính xác dấu thanh tiếng Việt và emoji.
              </p>
              <div className="p-3 rounded bg-elevated border border-default text-center font-bold text-primary text-sm shadow-xs">
                Xin chào Việt Nam! Chúc bạn học tốt 🚀
              </div>
            </div>

            <div className="p-3 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-danger">
                <AlertTriangle className="w-4 h-4" />
                <span>Thiếu khai báo Charset</span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Trình duyệt hiểu nhầm là ASCII/Windows-1252, biến ký tự có dấu thành chuỗi ký tự rác.
              </p>
              <div className="p-3 rounded bg-elevated border border-dashed border-danger text-center font-mono font-bold text-danger text-xs shadow-xs break-all">
                Xin chÃ o Viá»‡t Nam! ChÃºc báº¡n há» c tá»'t âœ¨
              </div>
            </div>
          </div>
        </div>
      );

    // 6. LINK DIAGRAM (External CSS File link to HTML)
    case 'LinkDiagram':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-accent" />
            <span>Cơ chế liên kết tài nguyên bên ngoài: file style.css → Trang HTML</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-3 bg-elevated rounded-[var(--radius-sm)] border border-default">
            {/* File CSS */}
            <div className="p-3 rounded-[var(--radius-sm)] bg-panel border border-default text-center space-y-1 min-w-[130px]">
              <div className="w-8 h-8 rounded bg-accent-soft text-accent flex items-center justify-center mx-auto">
                <FileCode className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-accent block">style.css</span>
              <span className="text-[10px] text-muted block font-sans">Tệp định dạng ngoài</span>
            </div>

            {/* Connecting Arrow */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-secondary px-2 py-0.5 rounded bg-panel border border-subtle mb-1">
                &lt;link rel="stylesheet"&gt;
              </span>
              <ArrowRight className="w-5 h-5 text-accent rotate-90 sm:rotate-0" />
            </div>

            {/* HTML Page */}
            <div className="p-3 rounded-[var(--radius-sm)] bg-panel border border-default text-center space-y-1 min-w-[130px]">
              <div className="w-8 h-8 rounded bg-success-soft text-success flex items-center justify-center mx-auto">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-success block">index.html</span>
              <span className="text-[10px] text-muted block font-sans">Trang web được làm đẹp</span>
            </div>
          </div>
          <p className="text-[11px] text-muted text-center font-sans">
            Thẻ &lt;link&gt; giúp tách riêng mã HTML (nội dung) và mã CSS (giao diện) vào 2 file độc lập, tái sử dụng cho hàng trăm trang.
          </p>
        </div>
      );

    // 7. TIMELINE (Script loading: Normal vs Async vs Defer OR setTimeout order)
    case 'Timeline':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span>Tiến trình thời gian: {data?.title || 'Thứ tự thực thi mã'}</span>
          </div>

          <div className="space-y-2.5 text-xs font-sans">
            {/* Normal script */}
            <div className="p-2.5 rounded bg-elevated border border-default space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <strong className="text-primary font-mono">&lt;script src="..."&gt; (Mặc định)</strong>
                <span className="text-danger font-semibold">Chặn kết xuất HTML</span>
              </div>
              <div className="grid grid-cols-12 gap-1 text-[10px] font-mono text-center">
                <div className="col-span-4 py-1 rounded bg-info-soft text-info border border-[var(--color-info)]/30">Tải HTML</div>
                <div className="col-span-4 py-1 rounded bg-warning-soft text-warning border border-[var(--color-warning)]/30">Dừng tải để chạy JS</div>
                <div className="col-span-4 py-1 rounded bg-info-soft text-info border border-[var(--color-info)]/30">Tiếp tục HTML</div>
              </div>
            </div>

            {/* Defer script */}
            <div className="p-2.5 rounded bg-elevated border border-default space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <strong className="text-primary font-mono">&lt;script defer src="..."&gt; (Khuyên dùng)</strong>
                <span className="text-success font-semibold">Tải song song, chạy sau khi HTML xong</span>
              </div>
              <div className="grid grid-cols-12 gap-1 text-[10px] font-mono text-center">
                <div className="col-span-8 py-1 rounded bg-info-soft text-info border border-[var(--color-info)]/30">Tải HTML liên tục</div>
                <div className="col-span-4 py-1 rounded bg-success-soft text-success border border-[var(--color-success)]/30">Chạy JS cuối</div>
              </div>
            </div>
          </div>
        </div>
      );

    // 8. COMMENT COMPARE (Before vs After)
    case 'CommentCompare':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5 text-accent" />
            <span>So sánh: Mã nguồn có chú thích vs Giao diện hiển thị thực tế</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            {/* Source code */}
            <div className="p-3 rounded-[var(--radius-sm)] bg-elevated border border-default space-y-2">
              <span className="text-[11px] font-bold text-secondary block font-sans">Trong trình soạn thảo code:</span>
              <div className="p-2.5 rounded bg-[var(--code-bg)] border border-subtle font-mono text-[11px] space-y-1 overflow-x-auto">
                <div className="text-success font-semibold">&lt;h2&gt;Bản tin công nghệ&lt;/h2&gt;</div>
                <div className="text-muted line-through bg-danger-soft px-1 rounded">
                  &lt;!-- Lời nhắn này chỉ dành cho bạn đọc code --&gt;
                </div>
                <div className="text-success font-semibold">&lt;p&gt;Nội dung bài viết...&lt;/p&gt;</div>
              </div>
            </div>

            {/* Browser preview */}
            <div className="p-3 rounded-[var(--radius-sm)] bg-elevated border border-default space-y-2">
              <span className="text-[11px] font-bold text-secondary block font-sans">Người dùng thấy trên trang:</span>
              <div className="p-3 rounded bg-panel border border-subtle text-primary space-y-2 shadow-xs">
                <h4 className="font-bold text-sm text-primary">Bản tin công nghệ</h4>
                <div className="py-1 px-2 rounded bg-warning-soft border border-dashed border-warning/30 text-[10px] text-warning italic text-center">
                  (Đoạn chú thích đã bị trình duyệt bỏ qua hoàn toàn)
                </div>
                <p className="text-xs text-secondary">Nội dung bài viết...</p>
              </div>
            </div>
          </div>
        </div>
      );

    // 9. VARIABLE BOX (Step-by-step memory transition)
    case 'VariableBox':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-accent" />
            <span>Mô hình chiếc hộp biến trong bộ nhớ RAM máy tính</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2 font-mono text-xs">
            {/* Initial Box */}
            <div className="p-3 rounded-[var(--radius-md)] bg-elevated border-2 border-dashed border-[var(--accent-base)] text-center min-w-[130px] shadow-xs">
              <span className="text-[10px] text-muted block mb-1 font-sans">1. Khởi tạo biến:</span>
              <strong className="text-accent text-sm block">{data?.name || 'diem'}</strong>
              <div className="mt-2 pt-2 border-t border-subtle">
                <span className="text-[10px] text-muted block font-sans">Giá trị ban đầu:</span>
                <span className="text-primary font-bold text-base">{String(data?.initial ?? '8')}</span>
              </div>
            </div>

            {/* Step Arrow */}
            {data?.updated !== undefined && (
              <>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-warning font-sans font-semibold mb-1">Gán đè (=)</span>
                  <ArrowRight className="w-5 h-5 text-warning rotate-90 sm:rotate-0" />
                </div>

                {/* Updated Box */}
                <div className="p-3 rounded-[var(--radius-md)] bg-elevated border-2 border-success text-center min-w-[130px] shadow-xs">
                  <span className="text-[10px] text-muted block mb-1 font-sans">2. Giá trị mới:</span>
                  <strong className="text-success text-sm block">{data?.name || 'diem'}</strong>
                  <div className="mt-2 pt-2 border-t border-subtle">
                    <span className="text-[10px] text-muted block font-sans">Giá trị hiện tại:</span>
                    <span className="text-success font-bold text-base">{String(data?.updated)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      );

    // 10. TEXT FLOW (Template Literal Interpolation)
    case 'TextFlow':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-accent" />
            <span>Cơ chế nội suy chuỗi: Trình duyệt thay thế {'${biến}'} bằng giá trị thực</span>
          </div>

          <div className="p-3 rounded-[var(--radius-sm)] bg-elevated border border-default space-y-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-secondary font-sans text-xs">Cú pháp viết:</span>
              <span className="text-muted">`Xin chào </span>
              <span className="px-1.5 py-0.5 rounded bg-warning-soft text-warning font-bold border border-warning/30">
                {'${' + (data?.varName || 'ten') + '}'}
              </span>
              <span className="text-muted">!`</span>
            </div>

            <div className="flex items-center gap-2 text-accent pl-4">
              <CornerDownRight className="w-4 h-4" />
              <span className="font-sans text-[11px] text-muted">
                Máy tính đọc biến <strong className="text-warning">{data?.varName || 'ten'}</strong> = <strong className="text-success">"{data?.value || 'Lan'}"</strong>
              </span>
            </div>

            <div className="pt-2 border-t border-subtle flex items-center gap-2 flex-wrap">
              <span className="text-secondary font-sans text-xs">Chuỗi kết quả:</span>
              <span className="px-2.5 py-1 rounded bg-success-soft text-success font-bold border border-success/30">
                "{data?.result || 'Xin chào Lan!'}"
              </span>
            </div>
          </div>
        </div>
      );

    // 11. FLOWCHART (Decision & Condition Branches)
    case 'Flowchart':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-accent" />
            <span>Sơ đồ rẽ nhánh quyết định (Flowchart)</span>
          </div>

          <div className="flex flex-col items-center gap-2 font-mono text-xs">
            {/* Condition Diamond */}
            <div className="px-4 py-2 rounded-lg bg-accent text-[var(--text-on-accent)] font-bold text-center shadow-xs">
              Điều kiện: {data?.condition || 'diem >= 5'}
            </div>

            <div className="flex items-center justify-between w-full max-w-sm px-1 sm:px-6 gap-3 pt-1">
              {/* True Branch */}
              <div className="flex-1 min-w-0 flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-success font-sans">Đúng (true)</span>
                <div className={`w-full p-2.5 rounded-[var(--radius-sm)] border text-center break-words ${
                  (data?.taken || data?.branchTaken) === 'true'
                    ? 'bg-success-soft border-success text-success font-bold ring-2 ring-[var(--color-success)]/30'
                    : 'bg-elevated border-subtle text-muted'
                }`}>
                  {data?.trueAction || 'Đậu môn! 🎉'}
                </div>
              </div>

              {/* False Branch */}
              <div className="flex-1 min-w-0 flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-danger font-sans">Sai (false)</span>
                <div className={`w-full p-2.5 rounded-[var(--radius-sm)] border text-center break-words ${
                  (data?.taken || data?.branchTaken) === 'false'
                    ? 'bg-danger-soft border-danger text-danger font-bold ring-2 ring-[var(--color-danger)]/30'
                    : 'bg-elevated border-subtle text-muted'
                }`}>
                  {data?.falseAction || 'Học lại! 📚'}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    // 12. FUNCTION MACHINE (Input -> Function -> Output)
    case 'FunctionMachine':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-accent" />
            <span>Mô hình cỗ máy hàm: Tham số đầu vào (Input) → Xử lý → Giá trị trả về (Return)</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 font-mono text-xs flex-wrap">
            <div className="px-3 py-2 rounded-[var(--radius-sm)] bg-elevated border border-default text-primary text-center">
              <span className="text-[9px] text-muted block font-sans">Tham số (Input):</span>
              <strong className="text-accent">{data?.input || 'a = 3, b = 4'}</strong>
            </div>

            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0" />

            <div className="px-4 py-2.5 rounded-[var(--radius-md)] bg-accent text-[var(--text-on-accent)] font-bold shadow-xs text-center">
              <span className="text-[9px] text-white/80 block font-sans">Hàm xử lý:</span>
              <span>{data?.fn || 'tinhTong(a, b)'}</span>
            </div>

            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0" />

            <div className="px-3 py-2 rounded-[var(--radius-sm)] bg-success-soft text-success border border-[var(--color-success)]/30 font-bold text-center">
              <span className="text-[9px] text-success block font-sans">Kết quả (return):</span>
              <span className="text-base">{data?.output || '7'}</span>
            </div>
          </div>
        </div>
      );

    // 13. ARRAY CELLS (Numbered index cells with highlight / Transformation)
    case 'ArrayCells':
      if (data?.before && data?.after) {
        return (
          <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex flex-wrap items-center justify-between gap-1">
              <span>Biến đổi mảng với .map() (Mảng gốc được giữ nguyên)</span>
              <span className="text-[10px] font-mono text-accent">{data?.label || 'Biến đổi'}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-1 font-mono text-xs overflow-x-auto overscroll-contain">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {data.before.map((val: any, i: number) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[9px] text-muted font-sans">[{i}]</span>
                    <div className="w-14 h-11 rounded-[var(--radius-sm)] border border-default bg-elevated text-secondary flex items-center justify-center font-bold">
                      {String(val)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center px-1 flex-shrink-0">
                <span className="text-[10px] font-sans text-accent font-bold">{data?.label || 'map'}</span>
                <ArrowRight className="w-4 h-4 text-accent rotate-90 sm:rotate-0" />
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {data.after.map((val: any, i: number) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[9px] text-success font-sans">[{i}]</span>
                    <div className="w-14 h-11 rounded-[var(--radius-sm)] border border-success/40 bg-success-soft text-success flex items-center justify-center font-bold">
                      {String(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex flex-wrap items-center justify-between gap-1">
            <span>Minh họa các ô phần tử mảng (Chỉ số Index tính từ 0)</span>
            <span className="text-[10px] font-mono text-accent">length = {(data?.items || ['Cam', 'Táo', 'Xoài']).length}</span>
          </div>

          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto overscroll-contain py-2 font-mono text-xs">
            {(data?.items || ['Cam', 'Táo', 'Xoài']).map((item: any, idx: number) => {
              const isHighlight = data?.highlightIndex === idx;
              return (
                <div key={idx} className="flex flex-col items-center flex-shrink-0">
                  <span className="text-[10px] text-muted font-sans mb-1 font-semibold">
                    Index [{idx}]
                  </span>
                  <div className={`w-20 h-14 rounded-[var(--radius-sm)] border flex items-center justify-center font-bold shadow-xs transition-all ${
                    isHighlight
                      ? 'bg-accent text-[var(--text-on-accent)] border-accent scale-105 shadow-md'
                      : 'bg-elevated border-default text-primary'
                  }`}>
                    {String(item)}
                  </div>
                </div>
              );
            })}
          </div>
          {data?.note && (
            <p className="text-[11px] text-secondary text-center font-sans">{data.note}</p>
          )}
        </div>
      );

    // 14. BOX MODEL DIAGRAM (Margin, Border, Padding, Content with border-box measurement)
    case 'BoxModelDiagram':
      return (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle select-none space-y-3">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-accent" />
            <span>Mô hình chiếc hộp CSS (Box Model) & Đo lường kích thước</span>
          </div>

          <div className="flex flex-col items-center font-mono text-[11px]">
            {/* Margin layer */}
            <div className="w-full max-w-xs p-3 rounded-lg bg-warning-soft border border-dashed border-[var(--color-warning)]/40 text-warning text-center">
              <span className="text-[10px] font-sans font-bold block mb-1">Margin (Khoảng cách ngoài)</span>

              {/* Border layer */}
              <div className="p-2.5 rounded bg-accent-soft border-2 border-[var(--accent-base)]/50 text-accent">
                <span className="text-[10px] font-sans font-bold block mb-1">Border (Đường viền)</span>

                {/* Padding layer */}
                <div className="p-2 rounded bg-success-soft border border-dashed border-[var(--color-success)]/50 text-success">
                  <span className="text-[10px] font-sans font-bold block mb-1">Padding (Khoảng đệm trong)</span>

                  {/* Content layer */}
                  <div className="py-2 px-3 rounded bg-accent text-[var(--text-on-accent)] font-bold text-xs shadow-xs">
                    Content (Nội dung: {data?.width || '200px'})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {data?.compareBorderBox && (
            <div className="p-2.5 rounded bg-elevated border border-default text-xs font-sans space-y-1">
              <div className="font-bold text-primary">Tại sao luôn dùng box-sizing: border-box?</div>
              <p className="text-[11px] text-secondary">
                Nếu không dùng border-box: Chiều rộng thực = Content + Padding + Border = 200 + 40 + 4 = <strong className="text-danger">244px</strong> (vỡ bố cục).
                Khi có border-box: Chiều rộng luôn cố định đúng <strong className="text-success">200px</strong>.
              </p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

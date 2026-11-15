import React from 'react';
import { AlertTriangle, FolderPlus, RefreshCw } from 'lucide-react';
import { CodeTemplate } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

export interface TemplateApplyConflictModalProps {
  template: CodeTemplate | null;
  isOpen: boolean;
  onCancel: () => void;
  onCreateNewProject: (template: CodeTemplate) => void;
  onReplaceCurrentCode: (template: CodeTemplate) => void;
}

export const TemplateApplyConflictModal: React.FC<TemplateApplyConflictModalProps> = ({
  template,
  isOpen,
  onCancel,
  onCreateNewProject,
  onReplaceCurrentCode,
}) => {
  if (!template) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth="md"
      title="Editor đang có code. Bạn muốn làm gì?"
      description={`Mẫu được chọn: "${template.name}"`}
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
          <Button
            variant="ghost"
            size="md"
            onClick={onCancel}
            className="min-h-[44px] sm:min-h-[36px]"
          >
            Hủy
          </Button>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => onReplaceCurrentCode(template)}
            className="min-h-[44px] sm:min-h-[36px] border-[var(--color-warning)]/40 text-warning hover:bg-warning-soft"
          >
            Thay thế code hiện tại
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
            onClick={() => onCreateNewProject(template)}
            className="min-h-[44px] sm:min-h-[36px]"
          >
            Tạo dự án mới từ mẫu
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-xs leading-relaxed">
        <p className="text-secondary">
          Chọn <strong className="text-primary">Tạo dự án mới từ mẫu</strong> để giữ nguyên toàn bộ mã nguồn hiện tại và mở mẫu trong một dự án riêng biệt.
        </p>

        <div className="p-3 rounded-[var(--radius-md)] bg-warning-soft border border-[var(--color-warning)]/35 flex items-start gap-2.5 text-warning">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <p>
            Nếu chọn <strong>Thay thế code hiện tại</strong>, toàn bộ nội dung ở cả 3 tab{' '}
            <strong>HTML, CSS và JS</strong> sẽ bị thay thế. Bạn có thể nhấn{' '}
            <strong className="font-mono">Ctrl+Z</strong> để hoàn tác trong 1 bước.
          </p>
        </div>
      </div>
    </Modal>
  );
};

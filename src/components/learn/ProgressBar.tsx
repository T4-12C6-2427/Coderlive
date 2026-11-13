import React from 'react';
import { Award, CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  completedCount: number;
  totalCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completedCount, totalCount }) => {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-4 rounded-[var(--radius-md)] bg-elevated border border-default space-y-2 select-none">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-primary">
          <Award className="w-4 h-4 text-warning" />
          <span>Tiến độ học tập</span>
        </div>
        <span className="font-mono text-accent font-bold">
          {completedCount}/{totalCount} bài ({percent}%)
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent-base)] to-[var(--accent-2)] transition-all duration-500 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>

      {percent === 100 && (
        <p className="text-[11px] text-success font-medium text-center pt-1 animate-pulse">
          🎉 Xuất sắc! Bạn đã hoàn thành toàn bộ khóa học!
        </p>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { LayoutMode, ThemeMode } from '../types';
import { GripVertical, GripHorizontal } from 'lucide-react';

interface ResizerProps {
  layout: LayoutMode;
  theme: ThemeMode;
  onResize: (delta: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const Resizer: React.FC<ResizerProps> = ({
  layout,
  theme,
  onResize,
  onDragStart,
  onDragEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    let prevPos = 0;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const currentPos = layout === 'horizontal' ? e.clientX : e.clientY;
      if (prevPos !== 0) {
        const delta = currentPos - prevPos;
        onResize(delta);
      }
      prevPos = currentPos;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const currentPos = layout === 'horizontal' ? touch.clientX : touch.clientY;
      if (prevPos !== 0) {
        const delta = currentPos - prevPos;
        onResize(delta);
      }
      prevPos = currentPos;
    };

    const handleEnd = () => {
      setIsDragging(false);
      onDragEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, layout, onResize, onDragEnd]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    onDragStart?.();
  };

  const isHorizontal = layout === 'horizontal';

  return (
    <>
      {/* If dragging, render full transparent backdrop overlay to prevent iframe from trapping mouse events */}
      {isDragging && (
        <div 
          className="fixed inset-0 z-50 select-none cursor-grabbing" 
          style={{ cursor: isHorizontal ? 'col-resize' : 'row-resize' }}
        />
      )}

      <div
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className={`relative flex items-center justify-center transition-colors select-none z-20 group ${
          isHorizontal
            ? 'w-2 sm:w-2.5 h-full cursor-col-resize hover:w-2.5'
            : 'h-2 sm:h-2.5 w-full cursor-row-resize hover:h-2.5'
        } ${
          isDragging
            ? 'bg-accent shadow-xs'
            : 'bg-panel border-subtle hover:bg-accent-soft'
        }`}
        title={isHorizontal ? 'Kéo để thay đổi độ rộng 2 khung' : 'Kéo để thay đổi độ cao 2 khung'}
      >
        <div className={`flex items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
          isDragging ? 'text-[var(--text-on-accent)]' : 'text-muted group-hover:text-accent'
        }`}>
          {isHorizontal ? (
            <GripVertical className="w-3.5 h-3.5" />
          ) : (
            <GripHorizontal className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </>
  );
};

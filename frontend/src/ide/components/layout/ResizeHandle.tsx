import { useState } from 'react';
import { cn } from '@/utilities/cn.js';
import { useResizable } from '@/ide/hooks/useResizable.js';

// ─── Draggable resize strip ───────────────────────────────────────────────────

interface ResizeHandleProps {
  orientation: 'vertical' | 'horizontal';
  onResize: (size: number) => void;
  getSize: () => number;
  min: number;
  max: number;
  invert?: boolean;
  className?: string;
}

export default function ResizeHandle({
  orientation,
  onResize,
  getSize,
  min,
  max,
  invert,
  className,
}: ResizeHandleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const { handleMouseDown } = useResizable({
    axis: orientation === 'vertical' ? 'x' : 'y',
    min,
    max,
    invert,
    onResize,
    getSize,
  });

  const isV = orientation === 'vertical';

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative flex-shrink-0 transition-colors duration-150 select-none z-10',
        isV
          ? 'w-1 cursor-col-resize hover:w-1'
          : 'h-1 cursor-row-resize hover:h-1',
        className,
      )}
      style={{
        background: isHovered
          ? 'var(--color-accent)'
          : 'var(--color-border-subtle)',
      }}
    >
      {/* Invisible wider hit area */}
      <div
        className={cn(
          'absolute inset-0',
          isV ? '-inset-x-1' : '-inset-y-1',
        )}
      />
    </div>
  );
}

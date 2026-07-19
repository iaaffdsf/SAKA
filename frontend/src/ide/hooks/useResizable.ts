import { useCallback, useRef } from 'react';

// ─── Drag-to-resize panel hook ────────────────────────────────────────────────

interface UseResizableOptions {
  axis: 'x' | 'y';
  min: number;
  max: number;
  /** Positive delta increases size; negative inverts (for right/bottom handles) */
  invert?: boolean;
  onResize: (size: number) => void;
  getSize: () => number;
}

export function useResizable({ axis, min, max, invert = false, onResize, getSize }: UseResizableOptions) {
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;

      const startPos = axis === 'x' ? e.clientX : e.clientY;
      const startSize = getSize();

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const current = axis === 'x' ? ev.clientX : ev.clientY;
        const delta = invert ? startPos - current : current - startPos;
        const next = Math.max(min, Math.min(max, startSize + delta));
        onResize(next);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [axis, invert, min, max, onResize, getSize],
  );

  return { handleMouseDown };
}

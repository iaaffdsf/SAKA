import { useState, useEffect } from 'react';

// ─── Window size hook ─────────────────────────────────────────────────────────

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export function useIsMobile(breakpoint = 768): boolean {
  const { width } = useWindowSize();
  return width < breakpoint;
}

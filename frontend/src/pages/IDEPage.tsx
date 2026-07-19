import { IDELayout } from '@/ide/index.js';
import { IDEProvider } from '@/ide/contexts/IDEContext.js';
import { ThemeProvider } from '@/ide/contexts/ThemeContext.js';

// ─── IDE route — renders the full IDE layout ──────────────────────────────────

export default function IDEPage() {
  return (
    <ThemeProvider>
      <IDEProvider>
        <IDELayout />
      </IDEProvider>
    </ThemeProvider>
  );
}

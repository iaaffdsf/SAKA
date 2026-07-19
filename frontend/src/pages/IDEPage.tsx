import { IDELayout } from '@/ide/index.js';
import { IDEProvider } from '@/ide/contexts/IDEContext.js';
import { ThemeProvider } from '@/ide/contexts/ThemeContext.js';
import { WorkspaceProvider } from '@/ide/contexts/WorkspaceContext.js';

// ─── IDE route — renders the full IDE layout ──────────────────────────────────

export default function IDEPage() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <IDEProvider>
          <IDELayout />
        </IDEProvider>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}

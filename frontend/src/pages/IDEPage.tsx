import { IDELayout } from '@/ide/index.js';
import { IDEProvider } from '@/ide/contexts/IDEContext.js';
import { ThemeProvider } from '@/ide/contexts/ThemeContext.js';
import { WorkspaceProvider } from '@/ide/contexts/WorkspaceContext.js';
import { EditorSettingsProvider } from '@/ide/contexts/EditorSettingsContext.js';

// ─── IDE route — renders the full IDE layout ──────────────────────────────────

export default function IDEPage() {
  return (
    <ThemeProvider>
      <EditorSettingsProvider>
        <WorkspaceProvider>
          <IDEProvider>
            <IDELayout />
          </IDEProvider>
        </WorkspaceProvider>
      </EditorSettingsProvider>
    </ThemeProvider>
  );
}

import { Terminal, Cpu, FolderCode, ChevronRight } from 'lucide-react';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';

// ─── Title bar ────────────────────────────────────────────────────────────────

export default function TitleBar() {
  const {
    toggleSidebar, toggleAIPanel, toggleTerminal,
    openCommandPalette, activeProject: ideProject,
    openFiles, activeFileId,
  } = useIDE();
  const { activeProject } = useWorkspace();

  const project = activeProject ?? ideProject;
  const activeFile = openFiles.find((f) => f.id === activeFileId);

  return (
    <header
      className="flex items-center h-9 px-3 flex-shrink-0 gap-3 select-none"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Branding */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Cpu className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          AI IDE
        </span>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 flex-1 overflow-hidden text-sm min-w-0">
        {project && (
          <>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            <FolderCode className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#e2a252' }} />
            <span className="truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {project.name}
            </span>
          </>
        )}
        {activeFile && (
          <>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            <span className="truncate" style={{ color: 'var(--color-text-primary)' }}>
              {activeFile.name}
            </span>
            {activeFile.isDirty && (
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-accent)' }} />
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <TitleButton onClick={toggleSidebar} title="Toggle Sidebar (Ctrl+B)">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="14" height="14" rx="2" />
            <line x1="5" y1="1" x2="5" y2="15" />
          </svg>
        </TitleButton>
        <TitleButton onClick={toggleTerminal} title="Toggle Terminal (Ctrl+J)">
          <Terminal className="w-3.5 h-3.5" />
        </TitleButton>
        <TitleButton onClick={toggleAIPanel} title="Toggle AI Panel (Ctrl+Shift+A)">
          <Cpu className="w-3.5 h-3.5" />
        </TitleButton>
        <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border)' }} />
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 px-3 py-1 rounded text-xs transition-colors"
          style={{
            background: 'var(--color-surface-elevated)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
          title="Command Palette (Ctrl+P)"
        >
          <span>⌘P</span>
          <span className="hidden sm:inline">Command Palette</span>
        </button>
      </div>
    </header>
  );
}

function TitleButton({ onClick, title, children }: { onClick(): void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-white/10"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {children}
    </button>
  );
}

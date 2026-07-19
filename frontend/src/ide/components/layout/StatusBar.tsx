import { GitBranch, CheckCircle, AlertCircle, Zap, Wifi, WifiOff } from 'lucide-react';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useTheme } from '@/ide/contexts/ThemeContext.js';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';
import { useEditorSettings } from '@/ide/contexts/EditorSettingsContext.js';
import { useState, useEffect } from 'react';

// ─── Status bar ───────────────────────────────────────────────────────────────

export default function StatusBar() {
  const { openFiles, activeFileId, cursorPosition } = useIDE();
  const { theme }                                   = useTheme();
  const { activeProject, gitStatus }                = useWorkspace();
  const { settings }                                = useEditorSettings();

  const [branch,    setBranch]    = useState<string>('');
  const [connected, setConnected] = useState(true);

  const activeFile  = openFiles.find((f) => f.id === activeFileId);
  const gitChanges  = Object.keys(gitStatus).length;
  const dirtyCount  = openFiles.filter((f) => f.isDirty).length;

  // Fetch git branch when project opens
  useEffect(() => {
    if (!activeProject) { setBranch(''); return; }
    setBranch('main'); // placeholder — real detection needs /api/fs/git-branch
  }, [activeProject]);

  // Backend health ping
  useEffect(() => {
    const check = () => {
      fetch('/api/healthz')
        .then((r) => setConnected(r.ok))
        .catch(() => setConnected(false));
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  const item = (children: React.ReactNode, title?: string) => (
    <button
      title={title}
      className="flex items-center gap-1 hover:bg-white/15 px-1.5 py-0.5 rounded transition-colors"
    >
      {children}
    </button>
  );

  return (
    <footer
      className="h-6 flex items-center justify-between px-2 flex-shrink-0 text-[11px] select-none"
      style={{ background: 'var(--color-accent)', color: '#fff' }}
    >
      {/* ── Left ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0">
        {branch && item(
          <><GitBranch className="w-3 h-3" /><span>{branch}</span></>,
          'Git branch',
        )}
        {activeProject && (
          <>
            {item(
              <><CheckCircle className="w-3 h-3" /><span>0 errors</span></>,
              'Problems',
            )}
            {gitChanges > 0 && item(
              <><AlertCircle className="w-3 h-3" /><span>{gitChanges} change{gitChanges !== 1 ? 's' : ''}</span></>,
              'Git changes',
            )}
            {dirtyCount > 0 && (
              <span className="px-1.5 py-0.5 opacity-80">
                {dirtyCount} unsaved
              </span>
            )}
          </>
        )}
      </div>

      {/* ── Centre ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 opacity-90">
        <Zap className="w-3 h-3" />
        <span>AI IDE</span>
        {activeProject && (
          <>
            <span className="opacity-40 mx-1">·</span>
            <span className="opacity-80 max-w-[140px] truncate">{activeProject.name}</span>
          </>
        )}
        <span className="opacity-40 mx-1">·</span>
        <span className="opacity-60">{theme}</span>
      </div>

      {/* ── Right ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0">
        {/* Cursor position */}
        {cursorPosition && (
          <span className="px-1.5 py-0.5 opacity-80 tabular-nums" title="Cursor position">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
        )}

        {/* Active file language */}
        {activeFile && (
          <>
            <span className="opacity-40 mx-1">·</span>
            <span className="px-1 opacity-80 capitalize">{activeFile.language}</span>
            <span className="opacity-40 mx-1">·</span>
            <span className="px-1 opacity-70">
              {settings.tabSize === 1 ? '1 space' : `${settings.tabSize} spaces`}
            </span>
            <span className="opacity-40 mx-1">·</span>
            <span className="px-1 opacity-70">UTF-8</span>
          </>
        )}

        {/* Connection */}
        {item(
          <>
            {connected
              ? <Wifi className="w-3 h-3" />
              : <WifiOff className="w-3 h-3 opacity-50" />
            }
            <span>{connected ? 'Connected' : 'Offline'}</span>
          </>,
          connected ? 'Backend connected' : 'Backend unreachable',
        )}

        {/* Auto-save indicator */}
        {settings.autoSaveDelay > 0 && (
          <span className="px-1.5 py-0.5 opacity-60" title="Auto-save enabled">
            AS
          </span>
        )}
      </div>
    </footer>
  );
}

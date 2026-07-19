import { GitBranch, CheckCircle, AlertCircle, Zap, Wifi } from 'lucide-react';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useTheme } from '@/ide/contexts/ThemeContext.js';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';
import { useState, useEffect } from 'react';

// ─── Status bar ───────────────────────────────────────────────────────────────

export default function StatusBar() {
  const { openFiles, activeFileId } = useIDE();
  const { theme } = useTheme();
  const { activeProject, gitStatus } = useWorkspace();
  const [branch, setBranch] = useState<string>('');
  const [connected, setConnected] = useState(true);

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const gitChanges = Object.keys(gitStatus).length;

  // Fetch git branch
  useEffect(() => {
    if (!activeProject) { setBranch(''); return; }
    fetch(`/api/fs/git-status?path=${encodeURIComponent(activeProject.path)}`)
      .then(async (r) => {
        if (!r.ok) return;
        // Branch from a separate call; we already have the status
        // Use the project open signal to reset branch
        setBranch('main'); // default — real branch detection would need a /api/fs/git-branch endpoint
      })
      .catch(() => setBranch(''));
  }, [activeProject]);

  // Ping backend health
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

  return (
    <footer
      className="h-6 flex items-center justify-between px-3 flex-shrink-0 text-[11px] select-none"
      style={{ background: 'var(--color-accent)', color: '#fff' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {branch && (
          <button className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">
            <GitBranch className="w-3 h-3" />
            <span>{branch}</span>
          </button>
        )}
        {activeProject && (
          <>
            <button className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">
              <CheckCircle className="w-3 h-3" />
              <span>0 errors</span>
            </button>
            {gitChanges > 0 && (
              <button className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">
                <AlertCircle className="w-3 h-3" />
                <span>{gitChanges} change{gitChanges !== 1 ? 's' : ''}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Centre */}
      <div className="flex items-center gap-1 opacity-90">
        <Zap className="w-3 h-3" />
        <span>AI IDE</span>
        {activeProject && (
          <>
            <span className="opacity-50 mx-1">—</span>
            <span className="opacity-80 max-w-[140px] truncate">{activeProject.name}</span>
          </>
        )}
        <span className="opacity-50 ml-2">· {theme}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <>
            <span className="opacity-80">{activeFile.language}</span>
            <span className="opacity-80">UTF-8</span>
          </>
        )}
        <button
          className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors"
          title={connected ? 'Backend connected' : 'Backend unreachable'}
        >
          <Wifi className={`w-3 h-3 ${connected ? '' : 'opacity-40'}`} />
          <span>{connected ? 'Connected' : 'Offline'}</span>
        </button>
      </div>
    </footer>
  );
}

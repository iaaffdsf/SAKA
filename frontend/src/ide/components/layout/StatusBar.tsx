import { GitBranch, Wifi, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useTheme } from '@/ide/contexts/ThemeContext.js';

// ─── Status bar ───────────────────────────────────────────────────────────────

export default function StatusBar() {
  const { openFiles, activeFileId } = useIDE();
  const { theme } = useTheme();

  const activeFile = openFiles.find(f => f.id === activeFileId);

  return (
    <footer
      className="h-6 flex items-center justify-between px-3 flex-shrink-0 text-[11px] select-none"
      style={{ background: 'var(--color-accent)', color: '#fff' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </button>
        <button className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">
          <CheckCircle className="w-3 h-3" />
          <span>0 errors</span>
        </button>
        <button className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">
          <AlertCircle className="w-3 h-3" />
          <span>0 warnings</span>
        </button>
      </div>

      {/* Centre */}
      <div className="flex items-center gap-1 opacity-90">
        <Zap className="w-3 h-3" />
        <span>AI Dev Platform</span>
        <span className="opacity-60">— {theme}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <>
            <span className="opacity-80">{activeFile.language}</span>
            <span className="opacity-80">UTF-8</span>
            <span className="opacity-80">Ln 1, Col 1</span>
          </>
        )}
        <button className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </button>
      </div>
    </footer>
  );
}

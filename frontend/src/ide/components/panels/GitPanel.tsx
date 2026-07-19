import { RefreshCw, GitBranch } from 'lucide-react';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import type { FileEntryUI } from '@/ide/types/ide.js';
import { getGitStatusColor } from '@/ide/utilities/language.js';
import type { GitStatus } from '@workspace/shared';

// ─── Git panel ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  modified:  'M',
  added:     'A',
  deleted:   'D',
  untracked: 'U',
  renamed:   'R',
};

export default function GitPanel() {
  const { activeProject, gitStatus, refreshGitStatus } = useWorkspace();
  const { openFile } = useIDE();

  const entries = Object.entries(gitStatus) as [string, GitStatus][];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 pt-4 pb-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Source Control
        </span>
        {activeProject && (
          <button
            onClick={() => void refreshGitStatus()}
            title="Refresh"
            className="p-1 rounded hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {!activeProject ? (
          <div className="flex flex-col items-center justify-center py-10">
            <GitBranch className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Open a project first</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <GitBranch className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No changes</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {entries.map(([filePath, status]) => {
              const name = filePath.split('/').pop() ?? filePath;
              const rel  = activeProject ? filePath.replace(activeProject.path + '/', '') : filePath;
              const color = getGitStatusColor(status);
              return (
                <button
                  key={filePath}
                  onClick={() => {
                    const entry: FileEntryUI = {
                      id: filePath, name, path: filePath,
                      relativePath: rel, type: 'file',
                      extension: name.split('.').pop()?.toLowerCase(),
                    };
                    openFile(entry);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-white/5 transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: color ? `${color}22` : undefined, color }}
                  >
                    {STATUS_LABEL[status] ?? '?'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{name}</div>
                    <div className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>{rel}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

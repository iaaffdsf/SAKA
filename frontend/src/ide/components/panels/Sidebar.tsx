import {
  Files, Search, GitBranch, Settings, ChevronRight,
} from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';
import type { ActivityBarTab } from '@/ide/types/ide.js';
import WorkspaceManager from '@/ide/components/workspace/WorkspaceManager.js';
import FileExplorer from './FileExplorer.js';
import SearchPanel from './SearchPanel.js';
import GitPanel from './GitPanel.js';

// ─── Activity bar icon ─────────────────────────────────────────────────────────

interface ActivityIconProps {
  tab: ActivityBarTab;
  active: boolean;
  onClick(): void;
  title: string;
  icon: React.ReactNode;
  badge?: number;
}

function ActivityIcon({ tab: _tab, active, onClick, title, icon, badge }: ActivityIconProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
        active ? 'text-white' : 'text-text-muted hover:text-text-secondary hover:bg-white/5',
      )}
      style={active ? { background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' } : undefined}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { activeActivityTab, setActiveActivityTab } = useIDE();
  const { activeProject, gitStatus } = useWorkspace();

  const gitChanges = Object.keys(gitStatus).length;

  return (
    <div
      className="flex h-full w-full"
      style={{ background: 'var(--color-ide-sidebar)' }}
    >
      {/* Activity bar */}
      <div
        className="flex flex-col items-center py-2 gap-1 flex-shrink-0 w-10"
        style={{ borderRight: '1px solid var(--color-border-subtle)' }}
      >
        <ActivityIcon
          tab="files"
          active={activeActivityTab === 'files'}
          onClick={() => setActiveActivityTab('files')}
          title="Explorer (Ctrl+Shift+E)"
          icon={<Files className="w-5 h-5" />}
        />
        <ActivityIcon
          tab="search"
          active={activeActivityTab === 'search'}
          onClick={() => setActiveActivityTab('search')}
          title="Search (Ctrl+Shift+F)"
          icon={<Search className="w-5 h-5" />}
        />
        <ActivityIcon
          tab="git"
          active={activeActivityTab === 'git'}
          onClick={() => setActiveActivityTab('git')}
          title="Source Control"
          icon={<GitBranch className="w-5 h-5" />}
          badge={gitChanges}
        />

        <div className="flex-1" />

        <ActivityIcon
          tab="extensions"
          active={activeActivityTab === 'extensions'}
          onClick={() => setActiveActivityTab('extensions')}
          title="Settings"
          icon={<Settings className="w-5 h-5" />}
        />
      </div>

      {/* Panel content */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {activeActivityTab === 'files' && (
          activeProject
            ? <FileExplorer />
            : <WorkspaceManager />
        )}
        {activeActivityTab === 'search' && <SearchPanel />}
        {activeActivityTab === 'git'    && <GitPanel />}
        {activeActivityTab === 'extensions' && <SettingsTab />}
      </div>
    </div>
  );
}

// ─── Settings tab (placeholder) ───────────────────────────────────────────────

function SettingsTab() {
  return (
    <div className="flex flex-col h-full p-3">
      <div className="mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Settings
        </span>
      </div>
      <button
        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <span className="text-sm">Preferences</span>
        <ChevronRight className="w-4 h-4 opacity-50" />
      </button>
      <button
        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <span className="text-sm">AI Providers</span>
        <ChevronRight className="w-4 h-4 opacity-50" />
      </button>
      <button
        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <span className="text-sm">Keyboard Shortcuts</span>
        <ChevronRight className="w-4 h-4 opacity-50" />
      </button>
    </div>
  );
}

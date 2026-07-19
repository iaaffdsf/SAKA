import {
  Code2,
  Command,
  Settings,
  User,
  ChevronDown,
  Play,
  Share2,
} from 'lucide-react';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useTheme } from '@/ide/contexts/ThemeContext.js';
import { cn } from '@/utilities/cn.js';

// ─── Title bar ────────────────────────────────────────────────────────────────

interface MenuItemProps {
  label: string;
}

function MenuItem({ label }: MenuItemProps) {
  return (
    <button
      className="px-2 py-0.5 text-xs rounded hover:bg-white/10 transition-colors"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      {label}
    </button>
  );
}

export default function TitleBar() {
  const { openCommandPalette, activeFileId, openFiles } = useIDE();
  const { theme, setTheme, themes } = useTheme();

  const activeFile = openFiles.find(f => f.id === activeFileId);

  return (
    <header
      className="flex items-center h-10 flex-shrink-0 select-none border-b px-3 gap-3"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      {/* Traffic lights (macOS style) */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
        <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
      </div>

      {/* Brand */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Code2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          AI Dev Platform
        </span>
      </div>

      {/* Menu bar */}
      <nav className="hidden md:flex items-center gap-0.5">
        {['File', 'Edit', 'View', 'Run', 'Terminal', 'Help'].map(item => (
          <MenuItem key={item} label={item} />
        ))}
      </nav>

      {/* Command palette trigger — centred */}
      <div className="flex-1 flex justify-center">
        <button
          onClick={openCommandPalette}
          className={cn(
            'hidden md:flex items-center gap-2 px-3 py-1 rounded-md text-xs border',
            'transition-all duration-150 hover:border-[var(--color-accent)]',
            'hover:bg-[var(--color-surface-elevated)]',
          )}
          style={{
            background: 'var(--color-background)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
            minWidth: 200,
          }}
        >
          <Command className="w-3 h-3" />
          <span>
            {activeFile ? activeFile.path : 'Search or run a command…'}
          </span>
          <kbd
            className="ml-auto text-[10px] px-1 rounded"
            style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}
          >
            ⌘ P
          </kbd>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Run button */}
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-150 hover:opacity-90"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          <Play className="w-3 h-3 fill-white" />
          <span className="hidden sm:inline">Run</span>
        </button>

        {/* Share */}
        <button
          className="p-1.5 rounded transition-colors hover:bg-white/10"
          style={{ color: 'var(--color-text-secondary)' }}
          title="Share"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Theme picker */}
        <div className="relative group">
          <button
            className="p-1.5 rounded transition-colors hover:bg-white/10 flex items-center gap-1"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Theme"
          >
            <Settings className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
          <div
            className="absolute right-0 top-full mt-1 py-1 rounded-md border shadow-xl hidden group-hover:block z-50 min-w-28"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {themes.map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-2 capitalize"
                style={{ color: theme === t ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
              >
                {theme === t && <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />}
                {theme !== t && <span className="w-1 h-1" />}
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Avatar */}
        <button
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ml-1"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
          title="Account"
        >
          U
        </button>
      </div>
    </header>
  );
}

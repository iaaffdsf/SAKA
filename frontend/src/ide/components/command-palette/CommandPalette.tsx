import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, ChevronRight, PanelLeft, PanelRight, TerminalSquare,
  Eye, Sun, Moon, Sparkles, Keyboard, X, FileCode2,
  Play, GitBranch, Settings,
} from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useTheme } from '@/ide/contexts/ThemeContext.js';
import type { Command } from '@/ide/types/ide.js';

// ─── Build command list ───────────────────────────────────────────────────────

function useCommands(): Command[] {
  const {
    toggleSidebar, toggleAIPanel, toggleTerminal,
    closeCommandPalette, setActiveEditorTab,
  } = useIDE();
  const { setTheme } = useTheme();

  return [
    // View
    {
      id: 'view.toggle-sidebar',
      label: 'Toggle Sidebar',
      category: 'View',
      shortcut: '⌘ B',
      icon: 'panel-left',
      action: () => { closeCommandPalette(); toggleSidebar(); },
    },
    {
      id: 'view.toggle-ai',
      label: 'Toggle AI Panel',
      category: 'View',
      shortcut: '⌘ ⇧ A',
      icon: 'sparkles',
      action: () => { closeCommandPalette(); toggleAIPanel(); },
    },
    {
      id: 'view.toggle-terminal',
      label: 'Toggle Terminal',
      category: 'View',
      shortcut: '⌘ J',
      icon: 'terminal',
      action: () => { closeCommandPalette(); toggleTerminal(); },
    },
    {
      id: 'view.preview',
      label: 'Open Preview',
      category: 'View',
      icon: 'eye',
      action: () => { closeCommandPalette(); setActiveEditorTab('preview'); },
    },
    // Theme
    {
      id: 'theme.dark',
      label: 'Theme: Dark',
      category: 'Theme',
      icon: 'moon',
      action: () => { closeCommandPalette(); setTheme('dark'); },
    },
    {
      id: 'theme.midnight',
      label: 'Theme: Midnight',
      category: 'Theme',
      icon: 'moon',
      action: () => { closeCommandPalette(); setTheme('midnight'); },
    },
    {
      id: 'theme.light',
      label: 'Theme: Light',
      category: 'Theme',
      icon: 'sun',
      action: () => { closeCommandPalette(); setTheme('light'); },
    },
    // File
    {
      id: 'file.new',
      label: 'New File',
      category: 'File',
      shortcut: '⌘ N',
      icon: 'file-code',
      action: () => { closeCommandPalette(); },
    },
    {
      id: 'file.open',
      label: 'Open File…',
      category: 'File',
      shortcut: '⌘ O',
      icon: 'file-code',
      action: () => { closeCommandPalette(); },
    },
    // Run
    {
      id: 'run.start',
      label: 'Start Development Server',
      category: 'Run',
      icon: 'play',
      action: () => { closeCommandPalette(); },
    },
    // Git
    {
      id: 'git.commit',
      label: 'Git: Commit',
      category: 'Git',
      icon: 'git-branch',
      action: () => { closeCommandPalette(); },
    },
    {
      id: 'git.push',
      label: 'Git: Push',
      category: 'Git',
      icon: 'git-branch',
      action: () => { closeCommandPalette(); },
    },
    // Help
    {
      id: 'help.shortcuts',
      label: 'Keyboard Shortcuts',
      category: 'Help',
      icon: 'keyboard',
      action: () => { closeCommandPalette(); },
    },
    {
      id: 'help.settings',
      label: 'Open Settings',
      category: 'Help',
      icon: 'settings',
      action: () => { closeCommandPalette(); },
    },
  ];
}

// ─── Icon resolver ────────────────────────────────────────────────────────────

function CommandIcon({ name }: { name?: string }) {
  const cls = 'w-4 h-4 flex-shrink-0';
  switch (name) {
    case 'panel-left': return <PanelLeft      className={cls} />;
    case 'panel-right': return <PanelRight    className={cls} />;
    case 'terminal':    return <TerminalSquare className={cls} />;
    case 'eye':         return <Eye           className={cls} />;
    case 'sun':         return <Sun           className={cls} />;
    case 'moon':        return <Moon          className={cls} />;
    case 'sparkles':    return <Sparkles      className={cls} />;
    case 'keyboard':    return <Keyboard      className={cls} />;
    case 'file-code':   return <FileCode2     className={cls} />;
    case 'play':        return <Play          className={cls} />;
    case 'git-branch':  return <GitBranch     className={cls} />;
    case 'settings':    return <Settings      className={cls} />;
    default:            return <ChevronRight  className={cls} />;
  }
}

// ─── Command palette ──────────────────────────────────────────────────────────

export default function CommandPalette() {
  const { closeCommandPalette } = useIDE();
  const commands = useCommands();

  const [query,   setQuery]   = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef   = useRef<HTMLInputElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  // Filter
  const filtered = query.trim() === ''
    ? commands
    : commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()),
      );

  // Reset selection when filter changes
  useEffect(() => { setSelected(0); }, [query]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selected}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const execute = useCallback((cmd: Command) => {
    cmd.action();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelected(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelected(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selected]) execute(filtered[selected]);
        break;
      case 'Escape':
        e.preventDefault();
        closeCommandPalette();
        break;
    }
  };

  // Group by category for display
  const grouped: Record<string, Command[]> = {};
  for (const cmd of filtered) {
    (grouped[cmd.category] ??= []).push(cmd);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={closeCommandPalette}
    >
      {/* Panel */}
      <div
        className="w-full max-w-lg mx-4 rounded-xl border shadow-2xl overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
          animation: 'palette-in 120ms ease-out',
        }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--color-text-muted)' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0"
            style={{
              background: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No commands found for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                {/* Category heading */}
                <div
                  className="px-4 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {category}
                </div>

                {cmds.map(cmd => {
                  const idx = filtered.indexOf(cmd);
                  const isSelected = idx === selected;
                  return (
                    <button
                      key={cmd.id}
                      data-idx={idx}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors',
                      )}
                      style={{
                        background: isSelected ? 'var(--color-surface-elevated)' : 'transparent',
                        color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      }}
                      onMouseEnter={() => setSelected(idx)}
                      onClick={() => execute(cmd)}
                    >
                      <span style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                        <CommandIcon name={cmd.icon} />
                      </span>
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd
                          className="text-[10px] px-1.5 py-0.5 rounded border"
                          style={{
                            background: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          className="flex items-center gap-4 px-4 py-2 border-t text-[10px]"
          style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
        >
          <span><kbd className="font-sans">↑↓</kbd> navigate</span>
          <span><kbd className="font-sans">↵</kbd> run</span>
          <span><kbd className="font-sans">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Terminal, Plus, X, ChevronDown, Maximize2 } from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TerminalTab {
  id: string;
  label: string;
  cwd: string;
  output: TerminalLine[];
}

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

// ─── Mock terminal sessions ───────────────────────────────────────────────────

const INITIAL_TABS: TerminalTab[] = [
  {
    id: 'term-1',
    label: 'bash',
    cwd: '~/my-project',
    output: [
      { id: '1', type: 'info',    text: 'AI Dev Platform — development environment' },
      { id: '2', type: 'info',    text: 'Node.js v20.20.0 · pnpm v10.26.1' },
      { id: '3', type: 'info',    text: '' },
      { id: '4', type: 'command', text: 'pnpm install' },
      { id: '5', type: 'success', text: '✓ Resolved 581 packages in 20s' },
      { id: '6', type: 'info',    text: '' },
      { id: '7', type: 'command', text: 'pnpm --filter @workspace/frontend run dev' },
      { id: '8', type: 'success', text: '  VITE v7.3.6  ready in 536 ms' },
      { id: '9', type: 'output',  text: '  ➜  Local:   http://localhost:23107/' },
    ],
  },
  {
    id: 'term-2',
    label: 'output',
    cwd: '~/my-project',
    output: [
      { id: '1', type: 'info',    text: '[12:45:55] INFO: Database connected' },
      { id: '2', type: 'info',    text: '[12:45:55] INFO: WebSocket server attached at /ws' },
      { id: '3', type: 'success', text: '[12:45:55] INFO: 🚀  Server listening  port: 8080' },
    ],
  },
];

// ─── Line renderer ────────────────────────────────────────────────────────────

const LINE_COLORS = {
  command: '#818cf8',
  output:  'var(--color-text-secondary)',
  error:   '#f87171',
  success: '#34d399',
  info:    'var(--color-text-muted)',
};

function TermLine({ line, cwd }: { line: TerminalLine; cwd: string }) {
  return (
    <div className="leading-5">
      {line.type === 'command' ? (
        <span>
          <span style={{ color: '#34d399' }}>{cwd} </span>
          <span style={{ color: '#a78bfa' }}>$ </span>
          <span style={{ color: LINE_COLORS.command }}>{line.text}</span>
        </span>
      ) : (
        <span style={{ color: LINE_COLORS[line.type] }}>
          {line.text || '\u00a0'}
        </span>
      )}
    </div>
  );
}

// ─── Terminal panel ───────────────────────────────────────────────────────────

export default function TerminalPanel() {
  const { toggleTerminal } = useIDE();
  const [tabs,       setTabs]       = useState<TerminalTab[]>(INITIAL_TABS);
  const [activeId,   setActiveId]   = useState(INITIAL_TABS[0].id);
  const [inputValue, setInputValue] = useState('');
  const inputRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(t => t.id === activeId) ?? tabs[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab?.output]);

  const addTab = () => {
    const id = `term-${Date.now()}`;
    const newTab: TerminalTab = {
      id,
      label: 'bash',
      cwd: '~/my-project',
      output: [{ id: '1', type: 'info', text: 'New terminal session started.' }],
    };
    setTabs(prev => [...prev, newTab]);
    setActiveId(id);
  };

  const closeTab = (id: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (activeId === id && next.length > 0) setActiveId(next[next.length - 1].id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim();
    if (!cmd || !activeTab) return;
    setInputValue('');

    // Append the command and a mock response
    setTabs(prev => prev.map(t => {
      if (t.id !== activeId) return t;
      const cmdLine: TerminalLine = { id: `c-${Date.now()}`,    type: 'command', text: cmd };
      const outLine: TerminalLine = { id: `o-${Date.now()}`,    type: 'output',  text: `Command '${cmd}' executed (simulation).` };
      return { ...t, output: [...t.output, cmdLine, outLine] };
    }));
  };

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden border-t"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}
    >
      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center h-8 flex-shrink-0 border-b overflow-x-auto"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center flex-1 overflow-x-auto">
          {/* Terminal icon + label */}
          <div
            className="flex items-center gap-1.5 px-3 border-r flex-shrink-0"
            style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Terminal</span>
          </div>

          {tabs.map(tab => (
            <div
              key={tab.id}
              className={cn(
                'group flex items-center gap-1.5 px-3 h-full border-r text-xs cursor-pointer flex-shrink-0 transition-colors',
              )}
              style={{
                background: tab.id === activeId ? 'var(--color-background)' : 'transparent',
                borderColor: 'var(--color-border-subtle)',
                color: tab.id === activeId ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              }}
              onClick={() => setActiveId(tab.id)}
            >
              <span>{tab.label}</span>
              {tabs.length > 1 && (
                <button
                  className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5 -mr-1 transition-all"
                  onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addTab}
            className="h-full px-2 flex items-center hover:bg-white/10 transition-colors flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
            title="New terminal"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center px-2 gap-1 flex-shrink-0">
          <button
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title="Maximize"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={toggleTerminal}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title="Close terminal"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── Terminal output ──────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs min-h-0"
        style={{ background: 'var(--color-background)' }}
        onClick={() => inputRef.current?.focus()}
      >
        {activeTab?.output.map(line => (
          <TermLine key={line.id} line={line} cwd={activeTab.cwd} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input line ──────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center px-4 py-1.5 border-t font-mono text-xs flex-shrink-0"
        style={{
          background: 'var(--color-background)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        <span style={{ color: '#34d399' }}>{activeTab?.cwd ?? '~'} </span>
        <span className="mx-1" style={{ color: '#a78bfa' }}>$</span>
        <input
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="flex-1 bg-transparent outline-none"
          style={{ color: '#818cf8' }}
          spellCheck={false}
          autoComplete="off"
          placeholder="type a command…"
          autoFocus
        />
      </form>
    </div>
  );
}

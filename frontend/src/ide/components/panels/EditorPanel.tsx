import { X, Circle, Code2, Plus, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import PreviewPanel from './PreviewPanel.js';

// ─── Mock file content snippets ───────────────────────────────────────────────

const MOCK_CONTENT: Record<string, string[]> = {
  tsx: [
    "import { useState } from 'react';",
    "import { cn } from '@/utilities/cn';",
    "",
    "interface ButtonProps {",
    "  variant?: 'primary' | 'secondary';",
    "  children: React.ReactNode;",
    "  onClick?: () => void;",
    "}",
    "",
    "export default function Button({ variant = 'primary', children, onClick }: ButtonProps) {",
    "  return (",
    "    <button",
    "      onClick={onClick}",
    "      className={cn(",
    "        'px-4 py-2 rounded-md font-medium transition-all',",
    "        variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover',",
    "        variant === 'secondary' && 'bg-surface border border-border',",
    "      )}",
    "    >",
    "      {children}",
    "    </button>",
    "  );",
    "}",
  ],
  typescript: [
    "export interface ApiResponse<T> {",
    "  success: boolean;",
    "  data?: T;",
    "  error?: string;",
    "  timestamp: string;",
    "}",
    "",
    "export type Status = 'ok' | 'degraded' | 'down';",
    "",
    "export interface HealthCheckResponse {",
    "  status: Status;",
    "  version: string;",
    "  uptime: number;",
    "  services: {",
    "    database: 'connected' | 'disconnected';",
    "    websocket: 'listening' | 'stopped';",
    "  };",
    "}",
  ],
  json: [
    '{',
    '  "name": "@workspace/frontend",',
    '  "version": "0.0.0",',
    '  "type": "module",',
    '  "scripts": {',
    '    "dev": "vite --config vite.config.ts",',
    '    "build": "vite build",',
    '    "typecheck": "tsc --noEmit"',
    '  },',
    '  "dependencies": {',
    '    "react": "catalog:",',
    '    "wouter": "catalog:"',
    '  }',
    '}',
  ],
  css: [
    '@import "tailwindcss";',
    '',
    '@theme {',
    '  --color-background: #09090b;',
    '  --color-surface:    #18181b;',
    '  --color-accent:     #6366f1;',
    '  --font-mono: "JetBrains Mono", monospace;',
    '}',
    '',
    'body {',
    '  margin: 0;',
    '  background-color: var(--color-background);',
    '  color: var(--color-text-primary);',
    '  font-family: var(--font-sans);',
    '}',
  ],
  markdown: [
    '# AI Dev Platform',
    '',
    'A production-grade AI-powered development platform.',
    '',
    '## Stack',
    '',
    '| Layer    | Technology          |',
    '|----------|---------------------|',
    '| Frontend | React 19 + Vite 7   |',
    '| Backend  | Express 5 + WS      |',
    '| Database | Prisma + SQLite     |',
    '',
    '## Quick Start',
    '',
    '```bash',
    'pnpm install',
    'pnpm --filter @workspace/database run push',
    '```',
  ],
};

// ─── Token colouring (very simple) ───────────────────────────────────────────

function tokenize(line: string, language: string): React.ReactNode {
  if (language === 'markdown') {
    if (line.startsWith('#')) return <span style={{ color: '#818cf8', fontWeight: 600 }}>{line}</span>;
    if (line.startsWith('|')) return <span style={{ color: '#94a3b8' }}>{line}</span>;
    if (line.startsWith('```')) return <span style={{ color: '#f59e0b' }}>{line}</span>;
    return <span style={{ color: 'var(--color-text-secondary)' }}>{line}</span>;
  }
  if (language === 'json') {
    return (
      <span>
        {line.split(/(".*?")/g).map((part, i) =>
          part.startsWith('"') && part.endsWith('"')
            ? <span key={i} style={{ color: i % 2 === 1 ? '#34d399' : '#f87171' }}>{part}</span>
            : <span key={i} style={{ color: 'var(--color-text-secondary)' }}>{part}</span>
        )}
      </span>
    );
  }
  // tsx / typescript / css — very light colouring
  const keywordRe = /\b(import|export|from|interface|type|const|let|var|function|return|default|extends|implements)\b/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = keywordRe.exec(line)) !== null) {
    if (match.index > last) parts.push(<span key={last} style={{ color: 'var(--color-text-secondary)' }}>{line.slice(last, match.index)}</span>);
    parts.push(<span key={match.index} style={{ color: '#c084fc' }}>{match[0]}</span>);
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push(<span key={last} style={{ color: 'var(--color-text-secondary)' }}>{line.slice(last)}</span>);
  return parts.length ? <>{parts}</> : <span style={{ color: 'var(--color-text-secondary)' }}>{line}</span>;
}

// ─── Tab pill ─────────────────────────────────────────────────────────────────

interface TabPillProps {
  file: { id: string; name: string; language: string; isDirty: boolean };
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
}

function TabPill({ file, isActive, onActivate, onClose }: TabPillProps) {
  const dotColor = {
    tsx: '#61dafb', typescript: '#3b82f6', javascript: '#f59e0b',
    css: '#a855f7', json: '#f59e0b', markdown: '#94a3b8',
  }[file.language] ?? 'var(--color-text-muted)';

  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 px-3 h-full border-r cursor-pointer select-none flex-shrink-0',
        'transition-colors duration-100 text-xs',
      )}
      style={{
        background: isActive ? 'var(--color-background)' : 'var(--color-surface)',
        borderColor: 'var(--color-border-subtle)',
        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        borderBottom: isActive ? '1px solid var(--color-background)' : '1px solid var(--color-border-subtle)',
        marginBottom: isActive ? -1 : 0,
      }}
      onClick={onActivate}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
      <span>{file.name}</span>
      {file.isDirty && <Circle className="w-2 h-2 fill-current opacity-60" />}
      <button
        className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5 -mr-1 transition-all"
        onClick={e => { e.stopPropagation(); onClose(); }}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Editor panel ─────────────────────────────────────────────────────────────

export default function EditorPanel() {
  const {
    openFiles, activeFileId, activeEditorTab,
    closeFile, setActiveFile, setActiveEditorTab,
  } = useIDE();

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const lines = activeFile ? (MOCK_CONTENT[activeFile.language] ?? MOCK_CONTENT['tsx']) : [];

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden min-w-0"
      style={{ background: 'var(--color-background)' }}
    >
      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-end h-9 flex-shrink-0 border-b overflow-x-auto overflow-y-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}
      >
        {openFiles.map(f => (
          <TabPill
            key={f.id}
            file={f}
            isActive={f.id === activeFileId}
            onActivate={() => setActiveFile(f.id)}
            onClose={() => closeFile(f.id)}
          />
        ))}

        <button
          className="h-full px-2 flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          title="New tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Editor / Preview switcher */}
        {activeFile && (
          <div className="ml-auto flex items-center gap-1 px-2 h-full flex-shrink-0">
            {(['editor', 'preview'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveEditorTab(tab)}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded text-[11px] capitalize transition-colors',
                )}
                style={{
                  background: activeEditorTab === tab ? 'var(--color-surface-elevated)' : 'transparent',
                  color: activeEditorTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
              >
                {tab === 'editor' ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      {activeFile && (
        <div
          className="flex items-center gap-1 px-3 py-1 text-[11px] border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
        >
          <span>my-project</span>
          {activeFile.path.split('/').map((segment, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: i === arr.length - 1 ? 'var(--color-text-primary)' : undefined }}>
                {segment}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-h-0">
        {!activeFile ? (
          /* Empty state */
          <div className="h-full flex flex-col items-center justify-center gap-4 select-none">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-surface)' }}
            >
              <Code2 className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                No file open
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Select a file from the explorer or press{' '}
                <kbd
                  className="px-1 py-0.5 rounded text-[10px]"
                  style={{ background: 'var(--color-surface-elevated)' }}
                >
                  ⌘ P
                </kbd>
              </p>
            </div>
          </div>
        ) : activeEditorTab === 'preview' ? (
          <PreviewPanel />
        ) : (
          /* Code view */
          <div className="flex min-h-full">
            {/* Line numbers */}
            <div
              className="flex-shrink-0 px-4 py-4 text-right select-none"
              style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)', minWidth: 48 }}
            >
              {lines.map((_, i) => (
                <div key={i} className="text-xs leading-6 font-mono">{i + 1}</div>
              ))}
            </div>
            {/* Code */}
            <pre
              className="flex-1 p-4 overflow-x-auto text-xs leading-6 font-mono"
              style={{ color: 'var(--color-text-secondary)', tabSize: 2 }}
            >
              {lines.map((line, i) => (
                <div key={i} className="hover:bg-white/3 transition-colors px-1 rounded">
                  {line === '' ? '\u00a0' : tokenize(line, activeFile.language)}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

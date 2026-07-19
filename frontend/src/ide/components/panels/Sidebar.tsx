import { useState } from 'react';
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  Search, GitBranch, Box, Settings, Files, X,
  Plus, RefreshCw,
} from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import type { FileNode, ActivityBarTab } from '@/ide/types/ide.js';

// ─── Mock file tree ───────────────────────────────────────────────────────────

const MOCK_TREE: FileNode[] = [
  {
    id: 'src', name: 'src', type: 'folder', path: 'src',
    children: [
      {
        id: 'src-components', name: 'components', type: 'folder', path: 'src/components',
        children: [
          { id: 'f-button',    name: 'Button.tsx',    type: 'file', language: 'tsx',        path: 'src/components/Button.tsx' },
          { id: 'f-layout',    name: 'Layout.tsx',    type: 'file', language: 'tsx',        path: 'src/components/Layout.tsx' },
          { id: 'f-sidebar',   name: 'Sidebar.tsx',   type: 'file', language: 'tsx',        path: 'src/components/Sidebar.tsx' },
          { id: 'f-aipanel',   name: 'AIPanel.tsx',   type: 'file', language: 'tsx',        path: 'src/components/AIPanel.tsx' },
        ],
      },
      {
        id: 'src-pages', name: 'pages', type: 'folder', path: 'src/pages',
        children: [
          { id: 'f-homepage',  name: 'HomePage.tsx',  type: 'file', language: 'tsx',        path: 'src/pages/HomePage.tsx' },
          { id: 'f-ide',       name: 'IDEPage.tsx',   type: 'file', language: 'tsx',        path: 'src/pages/IDEPage.tsx' },
        ],
      },
      {
        id: 'src-hooks', name: 'hooks', type: 'folder', path: 'src/hooks',
        children: [
          { id: 'f-usewindow', name: 'useWindowSize.ts', type: 'file', language: 'typescript', path: 'src/hooks/useWindowSize.ts' },
        ],
      },
      { id: 'f-app',     name: 'App.tsx',       type: 'file', language: 'tsx',        path: 'src/App.tsx' },
      { id: 'f-main',    name: 'main.tsx',       type: 'file', language: 'tsx',        path: 'src/main.tsx' },
      { id: 'f-css',     name: 'index.css',      type: 'file', language: 'css',        path: 'src/index.css' },
    ],
  },
  { id: 'f-pkg',     name: 'package.json',   type: 'file', language: 'json',       path: 'package.json' },
  { id: 'f-tsconfig',name: 'tsconfig.json',  type: 'file', language: 'json',       path: 'tsconfig.json' },
  { id: 'f-readme',  name: 'README.md',      type: 'file', language: 'markdown',   path: 'README.md' },
  { id: 'f-vite',    name: 'vite.config.ts', type: 'file', language: 'typescript', path: 'vite.config.ts' },
];

// ─── File icon by language ────────────────────────────────────────────────────

function fileColor(language?: string) {
  switch (language) {
    case 'tsx':        return '#61dafb';
    case 'typescript': return '#3b82f6';
    case 'javascript': return '#f59e0b';
    case 'css':        return '#a855f7';
    case 'json':       return '#f59e0b';
    case 'markdown':   return '#94a3b8';
    default:           return 'var(--color-text-muted)';
  }
}

// ─── File tree node ───────────────────────────────────────────────────────────

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

function TreeNode({ node, depth, expandedIds, onToggle }: TreeNodeProps) {
  const { openFile, activeFileId } = useIDE();
  const isExpanded = expandedIds.has(node.id);
  const isActive   = activeFileId === node.id;

  const indent = depth * 12 + 8;

  if (node.type === 'folder') {
    return (
      <>
        <button
          onClick={() => onToggle(node.id)}
          className={cn(
            'w-full flex items-center gap-1 py-0.5 rounded text-left group',
            'transition-colors duration-100 hover:bg-white/5',
          )}
          style={{ paddingLeft: indent, color: 'var(--color-text-secondary)' }}
        >
          <span className="w-3 h-3 flex items-center justify-center flex-shrink-0">
            {isExpanded
              ? <ChevronDown className="w-3 h-3" />
              : <ChevronRight className="w-3 h-3" />}
          </span>
          {isExpanded
            ? <FolderOpen className="w-3.5 h-3.5 flex-shrink-0 text-yellow-400" />
            : <Folder     className="w-3.5 h-3.5 flex-shrink-0 text-yellow-400" />}
          <span className="text-xs truncate">{node.name}</span>
        </button>

        {isExpanded && node.children?.map(child => (
          <TreeNode key={child.id} node={child} depth={depth + 1} expandedIds={expandedIds} onToggle={onToggle} />
        ))}
      </>
    );
  }

  return (
    <button
      onClick={() => openFile(node)}
      className={cn(
        'w-full flex items-center gap-1.5 py-0.5 rounded text-left',
        'transition-colors duration-100',
        isActive
          ? 'bg-white/10'
          : 'hover:bg-white/5',
      )}
      style={{ paddingLeft: indent, color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
    >
      <File className="w-3.5 h-3.5 flex-shrink-0" style={{ color: fileColor(node.language) }} />
      <span className="text-xs truncate">{node.name}</span>
    </button>
  );
}

// ─── Activity bar icon button ─────────────────────────────────────────────────

interface ActivityButtonProps {
  icon: React.ReactNode;
  label: string;
  tab: ActivityBarTab;
  active: boolean;
  onClick: () => void;
}

function ActivityButton({ icon, label, active, onClick }: ActivityButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'w-10 h-10 flex items-center justify-center rounded-sm transition-all duration-150 relative',
        active ? 'text-white' : 'hover:text-white/80',
      )}
      style={{
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r"
          style={{ background: 'var(--color-accent)' }}
        />
      )}
      {icon}
    </button>
  );
}

// ─── Sidebar panel ────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { activeActivityTab, setActiveActivityTab, toggleSidebar } = useIDE();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(['src', 'src-components', 'src-pages']),
  );

  const toggle = (id: string) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const activities: { tab: ActivityBarTab; icon: React.ReactNode; label: string }[] = [
    { tab: 'files',      icon: <Files      className="w-5 h-5" />, label: 'Explorer'         },
    { tab: 'search',     icon: <Search     className="w-5 h-5" />, label: 'Search'           },
    { tab: 'git',        icon: <GitBranch  className="w-5 h-5" />, label: 'Source Control'   },
    { tab: 'extensions', icon: <Box        className="w-5 h-5" />, label: 'Extensions'       },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden">

      {/* ── Activity bar ──────────────────────────────────────────────── */}
      <div
        className="flex flex-col items-center py-2 flex-shrink-0 w-10 border-r"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex flex-col gap-0.5 flex-1">
          {activities.map(a => (
            <ActivityButton
              key={a.tab}
              tab={a.tab}
              icon={a.icon}
              label={a.label}
              active={activeActivityTab === a.tab}
              onClick={() => setActiveActivityTab(a.tab)}
            />
          ))}
        </div>
        <button
          onClick={toggleSidebar}
          title="Collapse sidebar"
          className="w-10 h-10 flex items-center justify-center transition-colors hover:text-white/80"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* ── Panel content ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col flex-1 overflow-hidden min-w-0"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-3 py-2 flex-shrink-0 border-b"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {activeActivityTab === 'files'      && 'Explorer'}
            {activeActivityTab === 'search'     && 'Search'}
            {activeActivityTab === 'git'        && 'Source Control'}
            {activeActivityTab === 'extensions' && 'Extensions'}
          </span>
          <div className="flex items-center gap-0.5">
            {activeActivityTab === 'files' && (
              <>
                <button className="p-0.5 rounded hover:bg-white/10 transition-colors" title="New file">
                  <Plus className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                </button>
                <button className="p-0.5 rounded hover:bg-white/10 transition-colors" title="Refresh">
                  <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </>
            )}
            <button onClick={toggleSidebar} className="p-0.5 rounded hover:bg-white/10 transition-colors" title="Close">
              <X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto py-1 px-1">
          {activeActivityTab === 'files' && (
            <>
              <div
                className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 mb-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                my-project
              </div>
              {MOCK_TREE.map(node => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  expandedIds={expandedIds}
                  onToggle={toggle}
                />
              ))}
            </>
          )}

          {activeActivityTab === 'search' && (
            <div className="px-2 py-2">
              <input
                placeholder="Search files…"
                className="w-full text-xs px-2 py-1.5 rounded border outline-none"
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <p className="text-xs mt-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                Type to search across files
              </p>
            </div>
          )}

          {activeActivityTab === 'git' && (
            <div className="px-3 py-4 text-center">
              <GitBranch className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No changes</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Branch: main
              </p>
            </div>
          )}

          {activeActivityTab === 'extensions' && (
            <div className="px-3 py-4 text-center">
              <Box className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Extensions coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

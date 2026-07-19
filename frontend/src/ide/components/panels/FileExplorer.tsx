import {
  useState, useRef, useEffect, useCallback, type KeyboardEvent,
} from 'react';
import {
  ChevronRight, ChevronDown, Folder, FolderOpen, File,
  Plus, FilePlus, FolderPlus, RefreshCw, MoreHorizontal,
  Pencil, Trash2, Copy, Scissors, Clipboard, EyeOff, Eye, Search,
} from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { getLanguageColor, getGitStatusColor } from '@/ide/utilities/language.js';
import type { FileEntryUI } from '@/ide/types/ide.js';

// ─── File icon ────────────────────────────────────────────────────────────────

function FileIcon({ entry }: { entry: FileEntryUI }) {
  if (entry.type === 'folder') {
    return <Folder className="w-4 h-4 flex-shrink-0" style={{ color: '#e2a252' }} />;
  }
  const lang = entry.extension
    ? (entry.name.toLowerCase() === 'dockerfile' ? 'dockerfile' : entry.extension)
    : 'plaintext';
  return (
    <File
      className="w-4 h-4 flex-shrink-0"
      style={{ color: getLanguageColor(lang) }}
    />
  );
}

// ─── Context menu ──────────────────────────────────────────────────────────────

interface ContextMenuProps {
  x: number;
  y: number;
  entry: FileEntryUI;
  onClose(): void;
  onRename(): void;
  onDelete(): void;
  onCopy(): void;
  onCut(): void;
  onPaste(): void;
  canPaste: boolean;
  onNewFile(): void;
  onNewFolder(): void;
  onCopyPath(): void;
}

function ContextMenu({
  x, y, entry, onClose, onRename, onDelete,
  onCopy, onCut, onPaste, canPaste,
  onNewFile, onNewFolder, onCopyPath,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const kh = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    setTimeout(() => {
      window.addEventListener('mousedown', handler);
      window.addEventListener('keydown', kh);
    }, 10);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', kh);
    };
  }, [onClose]);

  // Adjust position so menu stays in viewport
  const [pos, setPos] = useState({ x, y });
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos({
      x: x + rect.width > vw ? vw - rect.width - 8 : x,
      y: y + rect.height > vh ? vh - rect.height - 8 : y,
    });
  }, [x, y]);

  const item = (icon: React.ReactNode, label: string, action: () => void, danger = false, disabled = false) => (
    <button
      key={label}
      disabled={disabled}
      onClick={() => { action(); onClose(); }}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left rounded transition-colors',
        !disabled && !danger && 'hover:bg-white/10',
        !disabled && danger && 'hover:bg-red-500/20 text-danger',
        disabled && 'opacity-40 cursor-not-allowed',
        !disabled && !danger && 'text-text-primary',
      )}
    >
      <span className="w-4 flex-shrink-0">{icon}</span>
      {label}
    </button>
  );

  const sep = <div key="sep" className="my-1 border-t" style={{ borderColor: 'var(--color-border)' }} />;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 rounded-lg shadow-2xl py-1.5 px-1 min-w-[180px]"
      style={{
        left: pos.x,
        top: pos.y,
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      {entry.type === 'folder' && item(<FilePlus className="w-3.5 h-3.5" />, 'New File', onNewFile)}
      {entry.type === 'folder' && item(<FolderPlus className="w-3.5 h-3.5" />, 'New Folder', onNewFolder)}
      {entry.type === 'folder' && sep}
      {item(<Pencil className="w-3.5 h-3.5" />, 'Rename', onRename)}
      {item(<Copy className="w-3.5 h-3.5" />, 'Copy', onCopy)}
      {item(<Scissors className="w-3.5 h-3.5" />, 'Cut', onCut)}
      {item(<Clipboard className="w-3.5 h-3.5" />, 'Paste', onPaste, false, !canPaste)}
      {sep}
      {item(<Copy className="w-3.5 h-3.5" />, 'Copy Path', onCopyPath)}
      {sep}
      {item(<Trash2 className="w-3.5 h-3.5" />, 'Delete', onDelete, true)}
    </div>
  );
}

// ─── Inline input (new file / rename) ────────────────────────────────────────

interface InlineInputProps {
  defaultValue?: string;
  placeholder: string;
  onCommit(value: string): void;
  onCancel(): void;
  indent: number;
  icon?: React.ReactNode;
}

function InlineInput({ defaultValue = '', placeholder, onCommit, onCancel, indent, icon }: InlineInputProps) {
  const [val, setVal] = useState(defaultValue);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    if (defaultValue) {
      const dotIdx = defaultValue.lastIndexOf('.');
      ref.current?.setSelectionRange(0, dotIdx > 0 ? dotIdx : defaultValue.length);
    }
  }, [defaultValue]);

  const commit = () => { if (val.trim()) onCommit(val.trim()); else onCancel(); };

  return (
    <div
      className="flex items-center gap-1.5 py-0.5 pr-2"
      style={{ paddingLeft: indent }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <input
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
        }}
        className="flex-1 bg-transparent text-sm outline-none rounded px-1.5 py-0.5"
        style={{
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-accent)',
          background: 'var(--color-surface)',
        }}
      />
    </div>
  );
}

// ─── Tree node ────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  entry: FileEntryUI;
  depth: number;
  parentPath: string;
  renamingPath: string | null;
  newEntryState: NewEntryState | null;
  onRenameCommit(path: string, name: string): void;
  onRenameCancel(): void;
  onNewEntryCommit(parentPath: string, name: string): void;
  onNewEntryCancel(): void;
  onContextMenu(e: React.MouseEvent, entry: FileEntryUI): void;
  selectedPath: string | null;
  onSelect(path: string): void;
}

interface NewEntryState {
  parentPath: string;
  type: 'file' | 'folder';
}

function TreeNode({
  entry, depth, parentPath,
  renamingPath, newEntryState,
  onRenameCommit, onRenameCancel,
  onNewEntryCommit, onNewEntryCancel,
  onContextMenu, selectedPath, onSelect,
}: TreeNodeProps) {
  const { openFile, activeFileId } = useIDE();
  const { expandFolder, collapseFolder, expandedPaths } = useWorkspace();
  const isExpanded = expandedPaths.has(entry.path);
  const isActive   = activeFileId === entry.id;
  const isSelected = selectedPath === entry.path;
  const gitColor   = getGitStatusColor(entry.gitStatus);
  const indent     = depth * 12 + 8;

  const handleClick = useCallback(() => {
    onSelect(entry.path);
    if (entry.type === 'folder') {
      if (isExpanded) collapseFolder(entry.path);
      else void expandFolder(entry.path);
    } else {
      openFile(entry);
    }
  }, [entry, isExpanded, openFile, collapseFolder, expandFolder, onSelect]);

  const nameStyle: React.CSSProperties = {
    color: gitColor ?? (isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'),
  };

  return (
    <>
      {/* Row */}
      <div
        className={cn(
          'group flex items-center gap-1 py-0.5 rounded cursor-pointer select-none text-sm',
          isActive && 'bg-white/10',
          isSelected && !isActive && 'bg-white/5',
          !isActive && !isSelected && 'hover:bg-white/[0.04]',
        )}
        style={{ paddingLeft: indent, paddingRight: 6 }}
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); onSelect(entry.path); onContextMenu(e, entry); }}
        title={entry.path}
      >
        {/* Expand indicator (folders only) */}
        {entry.type === 'folder' ? (
          entry.loading ? (
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <span className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-text-muted)' }} />
            </span>
          ) : isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
          )
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}

        {/* Icon */}
        {entry.type === 'folder'
          ? <FolderOpen className={cn('w-4 h-4 flex-shrink-0', isExpanded ? 'opacity-100' : 'opacity-70')} style={{ color: '#e2a252' }} />
          : <FileIcon entry={entry} />
        }

        {/* Name (or rename input) */}
        {renamingPath === entry.path ? (
          <div className="flex-1 ml-1" onClick={(e) => e.stopPropagation()}>
            <InlineInput
              defaultValue={entry.name}
              placeholder="New name"
              indent={0}
              onCommit={(name) => onRenameCommit(entry.path, name)}
              onCancel={onRenameCancel}
            />
          </div>
        ) : (
          <span className="flex-1 truncate ml-1 text-[13px]" style={nameStyle}>
            {entry.name}
          </span>
        )}

        {/* Git status dot */}
        {gitColor && (
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1" style={{ background: gitColor }} title={entry.gitStatus} />
        )}
      </div>

      {/* New entry inline input */}
      {newEntryState?.parentPath === entry.path && entry.type === 'folder' && isExpanded && (
        <InlineInput
          placeholder={newEntryState.type === 'file' ? 'filename.ts' : 'folder-name'}
          indent={indent + 20}
          icon={newEntryState.type === 'file'
            ? <File className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            : <Folder className="w-4 h-4" style={{ color: '#e2a252' }} />
          }
          onCommit={(name) => onNewEntryCommit(entry.path, name)}
          onCancel={onNewEntryCancel}
        />
      )}

      {/* Children */}
      {entry.type === 'folder' && isExpanded && entry.children && (
        <>
          {entry.children.map((child) => (
            <TreeNode
              key={child.id}
              entry={child as FileEntryUI}
              depth={depth + 1}
              parentPath={entry.path}
              renamingPath={renamingPath}
              newEntryState={newEntryState}
              onRenameCommit={onRenameCommit}
              onRenameCancel={onRenameCancel}
              onNewEntryCommit={onNewEntryCommit}
              onNewEntryCancel={onNewEntryCancel}
              onContextMenu={onContextMenu}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
          {/* New entry inline input at root of folder */}
          {newEntryState?.parentPath === entry.path && entry.type === 'folder' && isExpanded && entry.children.length === 0 && (
            <InlineInput
              placeholder={newEntryState.type === 'file' ? 'filename.ts' : 'folder-name'}
              indent={indent + 20}
              icon={newEntryState.type === 'file'
                ? <File className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                : <Folder className="w-4 h-4" style={{ color: '#e2a252' }} />
              }
              onCommit={(name) => onNewEntryCommit(entry.path, name)}
              onCancel={onNewEntryCancel}
            />
          )}
        </>
      )}
    </>
  );
}

// ─── File Explorer ────────────────────────────────────────────────────────────

export default function FileExplorer() {
  const {
    activeProject, fileTree, isLoadingTree,
    clipboard, expandedPaths,
    expandFolder, refreshTree,
    createFile, createFolder, deleteEntry, renameEntry,
    copyToClipboard, cutToClipboard, paste, clearClipboard,
  } = useWorkspace();
  const { closeProject } = useWorkspace();

  const [selectedPath,   setSelectedPath]   = useState<string | null>(null);
  const [renamingPath,   setRenamingPath]   = useState<string | null>(null);
  const [newEntryState,  setNewEntryState]  = useState<NewEntryState | null>(null);
  const [showHidden,     setShowHidden]     = useState(false);
  const [contextMenu,    setContextMenu]    = useState<{ x: number; y: number; entry: FileEntryUI } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Expand root on load
  useEffect(() => {
    if (activeProject && fileTree.length > 0 && !expandedPaths.has(activeProject.path)) {
      void expandFolder(activeProject.path);
    }
  }, [activeProject, fileTree.length, expandedPaths, expandFolder]);

  // Keyboard shortcuts on tree
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!selectedPath) return;
    if (e.key === 'F2') { setRenamingPath(selectedPath); }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (e.key === 'Backspace' && (e.target as HTMLElement).tagName === 'INPUT') return;
      e.preventDefault();
      void deleteEntry(selectedPath);
    }
  }, [selectedPath, deleteEntry]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleContextMenu = useCallback((e: React.MouseEvent, entry: FileEntryUI) => {
    setContextMenu({ x: e.clientX, y: e.clientY, entry });
  }, []);

  const handleRootContextMenu = useCallback((e: React.MouseEvent) => {
    if (!activeProject) return;
    if ((e.target as HTMLElement) === e.currentTarget) {
      e.preventDefault();
      const rootEntry: FileEntryUI = {
        id: activeProject.path,
        name: activeProject.name,
        path: activeProject.path,
        relativePath: '',
        type: 'folder',
      };
      setContextMenu({ x: e.clientX, y: e.clientY, entry: rootEntry });
    }
  }, [activeProject]);

  const handleRenameCommit = useCallback(async (entryPath: string, newName: string) => {
    setRenamingPath(null);
    try { await renameEntry(entryPath, newName); } catch (err) {
      console.error('Rename failed:', err);
    }
  }, [renameEntry]);

  const handleNewEntryCommit = useCallback(async (parentPath: string, name: string) => {
    setNewEntryState(null);
    const type = newEntryState?.type ?? 'file';
    try {
      if (type === 'file') await createFile(parentPath, name);
      else await createFolder(parentPath, name);
    } catch (err) {
      console.error('Create failed:', err);
    }
  }, [newEntryState, createFile, createFolder]);

  const handleDelete = useCallback(async (entry: FileEntryUI) => {
    const confirmed = window.confirm(
      `Delete "${entry.name}"${entry.type === 'folder' ? ' and all its contents' : ''}?`
    );
    if (confirmed) await deleteEntry(entry.path);
  }, [deleteEntry]);

  const handlePaste = useCallback(async (entry: FileEntryUI) => {
    const destFolder = entry.type === 'folder' ? entry.path : (entry.path.split('/').slice(0, -1).join('/'));
    await paste(destFolder);
  }, [paste]);

  const triggerNew = useCallback((parentPath: string, type: 'file' | 'folder') => {
    if (!expandedPaths.has(parentPath)) void expandFolder(parentPath);
    setNewEntryState({ parentPath, type });
  }, [expandedPaths, expandFolder]);

  if (!activeProject) return null;

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onContextMenu={handleRootContextMenu}
    >
      {/* Header */}
      <div className="flex items-center px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <span
          className="flex-1 text-xs font-semibold truncate uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)' }}
          title={activeProject.path}
        >
          {activeProject.name}
        </span>
        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={() => selectedPath && triggerNew(selectedPath, 'file')}
            title="New File"
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedPath && triggerNew(selectedPath, 'folder')}
            title="New Folder"
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => void refreshTree()}
            title="Refresh"
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowHidden((v) => !v)}
            title={showHidden ? 'Hide hidden files' : 'Show hidden files'}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: showHidden ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
          >
            {showHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={closeProject}
            title="Close project"
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New entry at root level */}
      {newEntryState?.parentPath === activeProject.path && (
        <InlineInput
          placeholder={newEntryState.type === 'file' ? 'filename.ts' : 'folder-name'}
          indent={8}
          icon={newEntryState.type === 'file'
            ? <File className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            : <Folder className="w-4 h-4" style={{ color: '#e2a252' }} />
          }
          onCommit={(name) => void handleNewEntryCommit(activeProject.path, name)}
          onCancel={() => setNewEntryState(null)}
        />
      )}

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {isLoadingTree ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
          </div>
        ) : fileTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Empty folder</p>
            <button
              onClick={() => triggerNew(activeProject.path, 'file')}
              className="mt-2 text-xs flex items-center gap-1 hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              <Plus className="w-3 h-3" /> New file
            </button>
          </div>
        ) : (
          fileTree.map((entry) => (
            <TreeNode
              key={entry.id}
              entry={entry}
              depth={0}
              parentPath={activeProject.path}
              renamingPath={renamingPath}
              newEntryState={newEntryState}
              onRenameCommit={(path, name) => void handleRenameCommit(path, name)}
              onRenameCancel={() => setRenamingPath(null)}
              onNewEntryCommit={(parentPath, name) => void handleNewEntryCommit(parentPath, name)}
              onNewEntryCancel={() => setNewEntryState(null)}
              onContextMenu={handleContextMenu}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
            />
          ))
        )}
      </div>

      {/* Clipboard hint */}
      {clipboard && (
        <div
          className="flex items-center justify-between px-3 py-1.5 text-xs flex-shrink-0"
          style={{ borderTop: '1px solid var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
        >
          <span>
            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {clipboard.action === 'copy' ? 'Copied' : 'Cut'}:
            </span>{' '}
            {clipboard.entry.name}
          </span>
          <button onClick={clearClipboard} className="hover:text-text-primary">✕</button>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          entry={contextMenu.entry}
          onClose={() => setContextMenu(null)}
          onRename={() => setRenamingPath(contextMenu.entry.path)}
          onDelete={() => void handleDelete(contextMenu.entry)}
          onCopy={() => copyToClipboard(contextMenu.entry)}
          onCut={() => cutToClipboard(contextMenu.entry)}
          onPaste={() => void handlePaste(contextMenu.entry)}
          canPaste={!!clipboard}
          onNewFile={() => triggerNew(contextMenu.entry.type === 'folder' ? contextMenu.entry.path : contextMenu.entry.path.split('/').slice(0,-1).join('/'), 'file')}
          onNewFolder={() => triggerNew(contextMenu.entry.type === 'folder' ? contextMenu.entry.path : contextMenu.entry.path.split('/').slice(0,-1).join('/'), 'folder')}
          onCopyPath={() => void navigator.clipboard.writeText(contextMenu.entry.path)}
        />
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import {
  FolderOpen, Plus, Pin, PinOff, Pencil, Trash2,
  FolderCode, Clock, Search, X, ChevronRight,
} from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import type { WorkspaceProject } from '@workspace/shared';

// ─── Workspace Manager ────────────────────────────────────────────────────────

export default function WorkspaceManager() {
  const { projects, isLoadingProjects, addProject, removeProject, pinProject, renameProject, openProject } = useWorkspace();
  const { setActiveProject, setActiveActivityTab } = useIDE();
  const [showAdd, setShowAdd]       = useState(false);
  const [addPath, setAddPath]       = useState('');
  const [addError, setAddError]     = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);
  const addInputRef  = useRef<HTMLInputElement>(null);
  const renameRef    = useRef<HTMLInputElement>(null);

  useEffect(() => { if (showAdd) addInputRef.current?.focus(); }, [showAdd]);
  useEffect(() => { if (renamingId) renameRef.current?.focus(); }, [renamingId]);

  // Close context menu on outside click
  useEffect(() => {
    if (!menuId) return;
    const handler = () => setMenuId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [menuId]);

  async function handleAdd() {
    const trimmed = addPath.trim();
    if (!trimmed) { setAddError('Enter a folder path'); return; }
    setAddLoading(true);
    setAddError('');
    try {
      await addProject(trimmed);
      setAddPath('');
      setShowAdd(false);
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : 'Failed to add project');
    } finally {
      setAddLoading(false);
    }
  }

  async function handleOpen(project: WorkspaceProject) {
    setActiveProject(project);
    await openProject(project);
    setActiveActivityTab('files');
  }

  async function handleRenameCommit(id: string) {
    const trimmed = renameValue.trim();
    if (trimmed) await renameProject(id, trimmed);
    setRenamingId(null);
  }

  const pinned    = projects.filter((p) => p.pinned);
  const recents   = projects.filter((p) => !p.pinned);
  const filtered  = (list: WorkspaceProject[]) =>
    filterText ? list.filter((p) => p.name.toLowerCase().includes(filterText.toLowerCase()) || p.path.toLowerCase().includes(filterText.toLowerCase())) : list;

  const renderProject = (project: WorkspaceProject) => (
    <div
      key={project.id}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
        'hover:bg-white/5 transition-colors',
      )}
      onClick={() => renamingId !== project.id && handleOpen(project)}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: project.color ?? 'var(--color-accent-subtle)' }}
      >
        <FolderCode className="w-4 h-4" style={{ color: project.color ? '#fff' : 'var(--color-accent)' }} />
      </div>

      {/* Name / path */}
      <div className="flex-1 min-w-0">
        {renamingId === project.id ? (
          <input
            ref={renameRef}
            className="w-full bg-surface border border-accent rounded px-2 py-0.5 text-sm text-text-primary outline-none"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => handleRenameCommit(project.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); void handleRenameCommit(project.id); }
              if (e.key === 'Escape') setRenamingId(null);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <div className="text-sm font-medium text-text-primary truncate flex items-center gap-1.5">
              {project.name}
              {project.pinned && <Pin className="w-3 h-3 opacity-50 flex-shrink-0" />}
            </div>
            <div className="text-xs text-text-muted truncate">{project.path}</div>
          </>
        )}
      </div>

      {/* Last opened */}
      {project.lastOpenedAt && (
        <div className="text-xs text-text-muted hidden group-hover:hidden flex-shrink-0">
          <Clock className="w-3 h-3" />
        </div>
      )}

      {/* Action buttons */}
      <div
        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          title={project.pinned ? 'Unpin' : 'Pin'}
          onClick={(e) => { e.stopPropagation(); void pinProject(project.id, !project.pinned); }}
          className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
        >
          {project.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
        <button
          title="Rename"
          onClick={(e) => { e.stopPropagation(); setRenamingId(project.id); setRenameValue(project.name); }}
          className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          title="Remove from workspace"
          onClick={(e) => { e.stopPropagation(); void removeProject(project.id); }}
          className="p-1 rounded hover:bg-red-500/20 text-text-muted hover:text-danger"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <ChevronRight className="w-3.5 h-3.5 ml-1 text-text-muted" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ color: 'var(--color-text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
          Workspace
        </span>
        <button
          onClick={() => { setShowAdd(!showAdd); setAddError(''); setAddPath(''); }}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          title="Add folder"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Add project form */}
      {showAdd && (
        <div className="px-3 pb-3">
          <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Enter the full path to a local folder</p>
            <input
              ref={addInputRef}
              type="text"
              placeholder="/home/user/my-project"
              value={addPath}
              onChange={(e) => setAddPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleAdd();
                if (e.key === 'Escape') setShowAdd(false);
              }}
              className="w-full rounded px-2.5 py-1.5 text-sm outline-none font-mono"
              style={{
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            {addError && <p className="text-xs text-danger">{addError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={addLoading}
                className="flex-1 text-sm py-1.5 rounded font-medium transition-colors"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                {addLoading ? 'Adding…' : 'Add Folder'}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 text-sm py-1.5 rounded transition-colors"
                style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {projects.length > 3 && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded px-2.5 py-1.5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Filter projects…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <FolderOpen className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No projects yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Click <Plus className="w-3 h-3 inline" /> to add a local folder
            </p>
          </div>
        ) : (
          <>
            {filtered(pinned).length > 0 && (
              <>
                <div className="px-2 pt-1 pb-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Pinned</span>
                </div>
                {filtered(pinned).map(renderProject)}
              </>
            )}
            {filtered(recents).length > 0 && (
              <>
                {pinned.length > 0 && (
                  <div className="px-2 pt-2 pb-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Recent</span>
                  </div>
                )}
                {filtered(recents).map(renderProject)}
              </>
            )}
            {filtered(projects).length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>No matches</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

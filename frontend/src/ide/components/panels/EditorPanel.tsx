import { useState } from 'react';
import {
  X, Circle, Code2, Eye, Settings2, AlertTriangle,
  Loader2, CloudUpload,
} from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';
import MonacoEditor from '@/ide/components/editor/MonacoEditor.js';
import EditorSettingsPanel from '@/ide/components/editor/EditorSettingsPanel.js';
import PreviewPanel from './PreviewPanel.js';
import { getLanguageColor } from '@/ide/utilities/language.js';

// ─── Editor panel ─────────────────────────────────────────────────────────────

export default function EditorPanel() {
  const {
    openFiles, activeFileId, activeEditorTab,
    closeFile, setActiveFile, setActiveEditorTab,
    updateFileContent, setCursorPosition,
  } = useIDE();
  const { readFile, writeFile } = useWorkspace();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingFileId, setSavingFileId] = useState<string | null>(null);

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  // ── Close tab with unsaved-changes guard ─────────────────────────────────

  const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    const file = openFiles.find((f) => f.id === fileId);
    if (file?.isDirty) {
      const ok = window.confirm(
        `"${file.name}" has unsaved changes.\n\nDiscard changes and close?`
      );
      if (!ok) return;
    }
    closeFile(fileId);
  };

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden relative"
      style={{ background: 'var(--color-ide-editor)' }}
    >
      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-stretch overflow-x-auto flex-shrink-0 select-none"
        style={{ borderBottom: '1px solid var(--color-border-subtle)', minHeight: 36 }}
      >
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 border-r cursor-pointer flex-shrink-0',
                'text-xs transition-colors group max-w-[200px] relative',
                isActive
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-white/[0.03]',
              )}
              style={{
                borderRightColor: 'var(--color-border-subtle)',
                borderBottom:     isActive
                  ? '1px solid var(--color-accent)'
                  : '1px solid transparent',
                background:       isActive
                  ? 'var(--color-ide-editor)'
                  : 'var(--color-ide-sidebar)',
                paddingTop:    6,
                paddingBottom: 6,
              }}
              title={file.path}
            >
              {/* Language dot */}
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: getLanguageColor(file.language) }}
              />

              {/* Filename */}
              <span className="truncate">{file.name}</span>

              {/* Dirty / saving indicator */}
              {savingFileId === file.id ? (
                <CloudUpload
                  className="w-3 h-3 flex-shrink-0 opacity-60 animate-pulse"
                  style={{ color: 'var(--color-accent)' }}
                />
              ) : file.isDirty ? (
                <Circle
                  className="w-2 h-2 flex-shrink-0 fill-current"
                  style={{ color: 'var(--color-accent)' }}
                />
              ) : null}

              {/* Close button */}
              <button
                onClick={(e) => handleCloseTab(e, file.id)}
                className={cn(
                  'ml-0.5 p-0.5 rounded flex-shrink-0 transition-all',
                  'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-white/10',
                )}
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Spacer + right actions */}
        <div className="ml-auto flex items-center px-2 gap-0.5 flex-shrink-0">
          <button
            onClick={() => setActiveEditorTab('editor')}
            title="Code view"
            className={cn(
              'px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors',
              activeEditorTab === 'editor'
                ? 'bg-white/10 text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            <Code2 className="w-3 h-3" />
            Code
          </button>
          <button
            onClick={() => setActiveEditorTab('preview')}
            title="Preview"
            className={cn(
              'px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors',
              activeEditorTab === 'preview'
                ? 'bg-white/10 text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border-subtle)' }} />
          <button
            onClick={() => setSettingsOpen((v) => !v)}
            title="Editor settings"
            className={cn(
              'p-1.5 rounded transition-colors',
              settingsOpen
                ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-white/5',
            )}
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden relative">
        {activeEditorTab === 'preview' ? (
          <PreviewPanel />
        ) : activeFile ? (
          <MonacoEditor
            file={activeFile}
            readFile={readFile}
            writeFile={writeFile}
            onContentChange={(content, isDirty) =>
              updateFileContent(activeFile.id, content, isDirty)
            }
            onCursorChange={(line, column) => setCursorPosition({ line, column })}
            onSaveStart={() => setSavingFileId(activeFile.id)}
            onSaveEnd={() => setSavingFileId(null)}
          />
        ) : (
          <EmptyState />
        )}

        {/* Settings slide-in panel */}
        {settingsOpen && (
          <EditorSettingsPanel onClose={() => setSettingsOpen(false)} />
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const { setActiveActivityTab } = useIDE();
  const { activeProject } = useWorkspace();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Code2 className="w-14 h-14 opacity-[0.06]" />
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {activeProject ? 'Open a file from the explorer' : 'No project open'}
        </p>
        {activeProject && (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Select a file in the sidebar to start editing
          </p>
        )}
      </div>
      {!activeProject && (
        <button
          onClick={() => setActiveActivityTab('files')}
          className="text-xs px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          Open project
        </button>
      )}
      {activeProject && (
        <div
          className="flex flex-col gap-1.5 text-[11px] mt-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {[
            ['Ctrl+P',       'Quick open file'],
            ['Ctrl+B',       'Toggle sidebar'],
            ['Ctrl+Shift+A', 'Toggle AI panel'],
          ].map(([k, d]) => (
            <div key={k} className="flex items-center gap-2">
              <kbd
                className="px-1.5 py-0.5 rounded font-mono text-[10px]"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {k}
              </kbd>
              <span>{d}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

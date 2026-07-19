import { useEffect, useRef, useState } from 'react';
import { X, Circle, Code2, Plus, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';
import PreviewPanel from './PreviewPanel.js';
import { getLanguageColor } from '@/ide/utilities/language.js';

// ─── Editor panel ─────────────────────────────────────────────────────────────

export default function EditorPanel() {
  const {
    openFiles, activeFileId, activeEditorTab,
    closeFile, setActiveFile, setActiveEditorTab,
    updateFileContent,
  } = useIDE();
  const { readFile, writeFile } = useWorkspace();

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden"
      style={{ background: 'var(--color-ide-editor)' }}
    >
      {/* Tab bar */}
      <div
        className="flex items-stretch overflow-x-auto flex-shrink-0 select-none"
        style={{ borderBottom: '1px solid var(--color-border-subtle)', minHeight: 36 }}
      >
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId;
          const ext = file.language ?? 'plaintext';
          return (
            <div
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 border-r cursor-pointer flex-shrink-0',
                'text-sm transition-colors group max-w-[180px]',
                isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.03]',
              )}
              style={{
                borderRightColor: 'var(--color-border-subtle)',
                borderBottom: isActive ? '1px solid var(--color-accent)' : '1px solid transparent',
                background: isActive ? 'var(--color-ide-editor)' : 'var(--color-ide-sidebar)',
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getLanguageColor(ext) }} />
              <span className="truncate">{file.name}</span>
              {file.isDirty && (
                <Circle className="w-2 h-2 flex-shrink-0 fill-current" style={{ color: 'var(--color-accent)' }} />
              )}
              <button
                onClick={(e) => { e.stopPropagation(); closeFile(file.id); }}
                className="ml-0.5 p-0.5 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-white/10 transition-all flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* View toggle */}
        <div className="ml-auto flex items-center px-2 gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveEditorTab('editor')}
            className={cn('px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors', activeEditorTab === 'editor' ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-secondary')}
          >
            <Code2 className="w-3 h-3" /> Code
          </button>
          <button
            onClick={() => setActiveEditorTab('preview')}
            className={cn('px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors', activeEditorTab === 'preview' ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-secondary')}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeEditorTab === 'preview' ? (
          <PreviewPanel />
        ) : activeFile ? (
          <FileEditor
            key={activeFile.id}
            file={activeFile}
            readFile={readFile}
            writeFile={writeFile}
            onContentChange={(content, dirty) => updateFileContent(activeFile.id, content, dirty)}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// ─── Per-file editor pane ─────────────────────────────────────────────────────

interface FileEditorProps {
  file: { id: string; name: string; path: string; language: string; isDirty: boolean; content?: string };
  readFile(path: string): Promise<{ content: string; language: string }>;
  writeFile(path: string, content: string): Promise<void>;
  onContentChange(content: string, isDirty: boolean): void;
}

function FileEditor({ file, readFile, writeFile, onContentChange }: FileEditorProps) {
  const [content, setContent]   = useState(file.content ?? '');
  const [loading, setLoading]   = useState(!file.content);
  const [error,   setError]     = useState<string | null>(null);
  const [saving,  setSaving]    = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load content if not yet fetched
  useEffect(() => {
    if (file.content !== undefined) { setContent(file.content); setLoading(false); return; }
    setLoading(true);
    readFile(file.path)
      .then((fc) => { setContent(fc.content); onContentChange(fc.content, false); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.id]);

  // Auto-save on Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!file.isDirty || saving) return;
        setSaving(true);
        writeFile(file.path, content)
          .then(() => onContentChange(content, false))
          .catch(() => {/* ignore */})
          .finally(() => setSaving(false));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [file.path, file.isDirty, content, saving, writeFile, onContentChange]);

  // Tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current!;
      const { selectionStart, selectionEnd } = ta;
      const newContent = content.substring(0, selectionStart) + '  ' + content.substring(selectionEnd);
      setContent(newContent);
      onContentChange(newContent, true);
      setTimeout(() => ta.setSelectionRange(selectionStart + 2, selectionStart + 2), 0);
    }
  };

  const lines = content.split('\n');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2" style={{ color: 'var(--color-text-muted)' }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm mb-1" style={{ color: 'var(--color-danger)' }}>{error}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{file.path}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ fontFamily: 'var(--font-mono)' }}>
      {/* Line numbers */}
      <div
        className="flex-shrink-0 select-none text-right overflow-hidden"
        style={{
          width: `${Math.max(String(lines.length).length, 2) * 9 + 20}px`,
          paddingTop: '12px',
          paddingRight: '8px',
          paddingLeft: '8px',
          fontSize: '13px',
          lineHeight: '21px',
          color: 'var(--color-text-muted)',
          borderRight: '1px solid var(--color-border-subtle)',
          background: 'var(--color-ide-editor)',
        }}
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Editable content */}
      <div className="relative flex-1 overflow-auto">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); onContentChange(e.target.value, true); }}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="absolute inset-0 w-full h-full resize-none bg-transparent outline-none"
          style={{
            fontSize: '13px',
            lineHeight: '21px',
            padding: '12px 16px',
            color: 'var(--color-text-primary)',
            caretColor: 'var(--color-accent)',
            tabSize: 2,
          }}
        />
        {saving && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
            <Loader2 className="w-3 h-3 animate-spin" /> Saving…
          </div>
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
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Code2 className="w-12 h-12 opacity-10" />
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {activeProject ? 'Open a file from the explorer' : 'No project open'}
      </p>
      {!activeProject && (
        <button
          onClick={() => setActiveActivityTab('files')}
          className="text-xs px-3 py-1.5 rounded font-medium transition-colors"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          Open project
        </button>
      )}
    </div>
  );
}

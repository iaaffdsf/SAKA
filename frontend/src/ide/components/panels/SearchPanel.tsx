import { useState, useRef } from 'react';
import { Search, File, Folder, X } from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useWorkspace } from '@/ide/contexts/WorkspaceContext.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { getLanguageColor } from '@/ide/utilities/language.js';
import type { SearchResult } from '@workspace/shared';
import type { FileEntryUI } from '@/ide/types/ide.js';

// ─── Search panel ─────────────────────────────────────────────────────────────

export default function SearchPanel() {
  const { activeProject, searchFiles } = useWorkspace();
  const { openFile } = useIDE();
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState<SearchResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(q: string) {
    if (!q.trim() || !activeProject) { setResults([]); return; }
    setLoading(true);
    setSearched(false);
    try {
      const hits = await searchFiles(q.trim());
      setResults(hits);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void handleSearch(val), 350);
  }

  function handleResultClick(result: SearchResult) {
    if (result.type === 'file') {
      const entry: FileEntryUI = {
        id: result.path,
        name: result.name,
        path: result.path,
        relativePath: result.relativePath,
        type: 'file',
        extension: result.name.split('.').pop()?.toLowerCase(),
      };
      openFile(entry);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-4 pb-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Search
        </span>
      </div>

      {/* Input */}
      <div className="px-3 pb-3">
        <div
          className="flex items-center gap-2 rounded px-2.5 py-2"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={activeProject ? 'Search files…' : 'Open a project first'}
            value={query}
            disabled={!activeProject}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-2">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 rounded-full border-2 animate-spin"
              style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
          </div>
        )}
        {!loading && searched && results.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            No files match "{query}"
          </p>
        )}
        {!loading && results.map((r) => (
          <button
            key={r.path}
            onClick={() => handleResultClick(r)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded text-left',
              'hover:bg-white/5 transition-colors',
            )}
          >
            {r.type === 'folder'
              ? <Folder className="w-4 h-4 flex-shrink-0" style={{ color: '#e2a252' }} />
              : <File
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: getLanguageColor(r.name.split('.').pop() ?? '') }}
                />
            }
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{r.name}</div>
              <div className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>{r.relativePath}</div>
            </div>
          </button>
        ))}
        {!activeProject && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            Open a project to search
          </p>
        )}
      </div>
    </div>
  );
}

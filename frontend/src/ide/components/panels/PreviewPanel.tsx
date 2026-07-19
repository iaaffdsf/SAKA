import { useState } from 'react';
import {
  RefreshCw, ExternalLink, ChevronLeft, ChevronRight,
  Monitor, Smartphone, Tablet, Lock,
} from 'lucide-react';
import { cn } from '@/utilities/cn.js';

// ─── Viewport presets ─────────────────────────────────────────────────────────

type Viewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORTS: Record<Viewport, { width: string; height: string; label: string }> = {
  desktop: { width: '100%',   height: '100%',  label: 'Desktop' },
  tablet:  { width: '768px',  height: '1024px', label: 'Tablet' },
  mobile:  { width: '390px',  height: '844px',  label: 'Mobile' },
};

// ─── Preview panel ────────────────────────────────────────────────────────────

export default function PreviewPanel() {
  const [url,      setUrl]      = useState('http://localhost:23107/');
  const [input,    setInput]    = useState(url);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = (newUrl: string) => {
    setUrl(newUrl);
    setInput(newUrl);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  const vp = VIEWPORTS[viewport];

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden"
      style={{ background: 'var(--color-background)' }}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 border-b flex-shrink-0"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}
      >
        {/* Nav buttons */}
        <div className="flex items-center gap-0.5">
          <button
            className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-30"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-30"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={refresh}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          </button>
        </div>

        {/* URL bar */}
        <div
          className="flex items-center gap-1.5 flex-1 px-2 py-1 rounded border text-xs"
          style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
        >
          <Lock className="w-3 h-3 flex-shrink-0" style={{ color: '#34d399' }} />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(input)}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--color-text-secondary)' }}
          />
        </div>

        {/* Viewport switcher */}
        <div
          className="flex items-center gap-0.5 rounded border p-0.5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {([
            { v: 'desktop' as Viewport, icon: <Monitor    className="w-3.5 h-3.5" /> },
            { v: 'tablet'  as Viewport, icon: <Tablet     className="w-3.5 h-3.5" /> },
            { v: 'mobile'  as Viewport, icon: <Smartphone className="w-3.5 h-3.5" /> },
          ]).map(({ v, icon }) => (
            <button
              key={v}
              onClick={() => setViewport(v)}
              className="p-1 rounded transition-colors"
              style={{
                background: viewport === v ? 'var(--color-surface-elevated)' : 'transparent',
                color: viewport === v ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
              title={VIEWPORTS[v].label}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Open in new tab */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ── Frame ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 min-h-0"
        style={{ background: 'var(--color-background)' }}
      >
        <div
          className="relative transition-all duration-300 shadow-2xl rounded overflow-hidden"
          style={{ width: vp.width, height: vp.height, maxWidth: '100%', maxHeight: '100%' }}
        >
          {isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{ background: 'var(--color-surface)' }}
            >
              <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
          )}
          <iframe
            src={url}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
}

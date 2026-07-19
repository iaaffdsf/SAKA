import { Link } from 'wouter';
import { Code2, ExternalLink, Menu, X } from 'lucide-react';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { useAppContext } from '../../contexts/AppContext.js';
import { cn } from '../../utilities/cn.js';

// ─── Header ───────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Documentation', href: '/docs' },
  { label: 'Architecture', href: '/architecture' },
];

export default function Header() {
  const { isSidebarOpen, toggleSidebar } = useAppContext();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-14',
        'border-b border-[var(--color-border-subtle)]',
        'bg-[var(--color-background)]/80 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Brand ── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[var(--color-text-primary)] no-underline"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)]">
            <Code2 size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">AI Dev Platform</span>
          <Badge variant="accent" className="hidden sm:inline-flex">v0.1</Badge>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 text-sm text-[var(--color-text-secondary)]',
                'hover:text-[var(--color-text-primary)] rounded-[var(--radius-md)]',
                'hover:bg-[var(--color-surface-elevated)] transition-colors',
              )}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--color-text-secondary)]',
              'hover:text-[var(--color-text-primary)] rounded-[var(--radius-md)]',
              'hover:bg-[var(--color-surface-elevated)] transition-colors',
            )}
          >
            GitHub <ExternalLink size={11} className="opacity-60" />
          </a>
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button size="sm" className="hidden sm:inline-flex">
            Get started
          </Button>

          {/* Mobile menu toggle */}
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex md:hidden h-8 w-8 items-center justify-center rounded-[var(--radius-md)]',
              'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]',
              'transition-colors',
            )}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}

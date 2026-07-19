import { Code2, Heart } from 'lucide-react';

// ─── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <Code2 size={14} />
            <span className="text-xs">AI Dev Platform</span>
          </div>

          {/* Copyright */}
          <p className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            © {year} — Built with
            <Heart size={10} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
            on Replit
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <a href="/docs" className="hover:text-[var(--color-text-secondary)] transition-colors">
              Docs
            </a>
            <a href="/privacy" className="hover:text-[var(--color-text-secondary)] transition-colors">
              Privacy
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-text-secondary)] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

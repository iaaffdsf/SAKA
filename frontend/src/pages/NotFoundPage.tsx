import { Link } from 'wouter';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Button } from '../components/ui/Button.js';

// ─── 404 page ─────────────────────────────────────────────────────────────────

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
        <FileQuestion size={28} className="text-[var(--color-text-muted)]" />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-[var(--color-text-primary)]">
        404 — Page not found
      </h1>
      <p className="mb-8 max-w-sm text-sm text-[var(--color-text-secondary)]">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <Link href="/">
        <Button variant="secondary">
          <ArrowLeft size={14} />
          Back to home
        </Button>
      </Link>
    </div>
  );
}

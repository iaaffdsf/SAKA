import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../utilities/cn.js';

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] ' +
    'border border-[var(--color-border)]',
  accent:
    'bg-[var(--color-accent)]/10 text-[var(--color-accent-hover)] ' +
    'border border-[var(--color-accent)]/30',
  success:
    'bg-[var(--color-success)]/10 text-[var(--color-success)] ' +
    'border border-[var(--color-success)]/30',
  warning:
    'bg-[var(--color-warning)]/10 text-[var(--color-warning)] ' +
    'border border-[var(--color-warning)]/30',
  danger:
    'bg-[var(--color-danger)]/10 text-[var(--color-danger)] ' +
    'border border-[var(--color-danger)]/30',
  outline:
    'bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)]',
};

export const Badge: FC<BadgeProps> = ({ variant = 'default', dot, className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      variantClasses[variant],
      className,
    )}
    {...props}
  >
    {dot ? (
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
    ) : null}
    {children}
  </span>
);

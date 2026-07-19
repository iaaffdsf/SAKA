import { type ButtonHTMLAttributes, type FC, forwardRef } from 'react';
import { cn } from '../../utilities/cn.js';

// ─── Button variants ──────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] ' +
    'shadow-sm shadow-[var(--color-accent)]/20',
  secondary:
    'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] ' +
    'border border-[var(--color-border)] hover:bg-[var(--color-border)]',
  ghost:
    'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] ' +
    'hover:text-[var(--color-text-primary)]',
  danger:
    'bg-[var(--color-danger)]/10 text-[var(--color-danger)] ' +
    'border border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)]/20',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8  px-3 text-xs  gap-1.5',
  md: 'h-9  px-4 text-sm  gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
};

export const Button: FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)]',
        'transition-colors duration-150 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[var(--color-background)]',
        'disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Class name utility ───────────────────────────────────────────────────────
// Merges Tailwind classes intelligently, de-duplicating conflicting utilities.
// Usage: cn('px-4 py-2', isActive && 'bg-accent', className)

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

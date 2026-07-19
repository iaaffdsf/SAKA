import {
  Zap,
  Globe,
  Shield,
  Terminal,
  GitBranch,
  Cpu,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { cn } from '../utilities/cn.js';

// ─── Feature cards ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Cpu,
    title: 'AI-Powered Intelligence',
    description:
      'Deep language model integration across every surface — code completion, explanation, refactoring, and generation baked into the editor.',
  },
  {
    icon: Terminal,
    title: 'Full Dev Environment',
    description:
      'Fully containerized workspaces with a built-in terminal, package management, and live preview. Everything you need, zero setup.',
  },
  {
    icon: Globe,
    title: 'Instant Deployment',
    description:
      'Go from code to production in seconds. One-click deploys with automatic scaling, SSL, and custom domains out of the box.',
  },
  {
    icon: GitBranch,
    title: 'Real-Time Collaboration',
    description:
      'Multiplayer editing, live cursors, and shared terminals. Build with your team as if you were in the same room.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'SOC 2 ready from day one. Role-based access control, audit logs, SSO, and private networks for every organization.',
  },
  {
    icon: Zap,
    title: 'Blazing Performance',
    description:
      'Sub-second workspace startup, optimistic UI updates, and a WebSocket-first architecture keep you in flow.',
  },
] as const;

// ─── Stat row ─────────────────────────────────────────────────────────────────

const STATS = [
  { value: '<1s', label: 'Workspace startup' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '∞', label: 'Scalability' },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden">

      {/* ── Ambient background gradients ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Top-center radial glow */}
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--color-accent)]/[0.07] blur-3xl" />
        {/* Bottom-right secondary glow */}
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-[var(--color-accent)]/[0.04] blur-3xl" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #a1a1aa 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">

        {/* Announcement badge */}
        <div className="mb-6 inline-flex">
          <Badge variant="accent" dot>
            <Sparkles size={10} />
            Foundation release — v0.1 ready
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--color-text-primary)] leading-[1.1]">
          Build the future of
          <br />
          <span
            className="bg-gradient-to-r from-[var(--color-accent-hover)] via-[#a78bfa] to-[var(--color-accent)] bg-clip-text text-transparent"
          >
            software development
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-secondary)] leading-relaxed">
          A production-grade, AI-powered IDE platform built for teams that move fast.
          Real-time collaboration, instant deploys, and deep AI integration — all in
          one environment.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg">
            Start building
            <ArrowRight size={16} />
          </Button>
          <Button variant="secondary" size="lg">
            View documentation
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-px divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border-subtle)]">
          {STATS.map(({ value, label }) => (
            <div key={label} className="px-8 py-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <hr className="border-[var(--color-border-subtle)]" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FEATURES                                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">

        {/* Section label */}
        <div className="mb-4 flex justify-center">
          <Badge variant="outline">Platform capabilities</Badge>
        </div>

        <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Everything you need, nothing you don't
        </h2>
        <p className="mx-auto mb-16 max-w-xl text-center text-[var(--color-text-secondary)]">
          Each capability is designed to work together — not bolted on as an afterthought.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className={cn(
                'group relative rounded-[var(--radius-xl)] p-6',
                'bg-[var(--color-surface)] border border-[var(--color-border-subtle)]',
                'hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-elevated)]',
                'transition-all duration-200',
              )}
            >
              {/* Icon */}
              <div className={cn(
                'mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]',
                'bg-[var(--color-accent)]/10 text-[var(--color-accent-hover)]',
                'group-hover:bg-[var(--color-accent)]/20 transition-colors',
              )}>
                <Icon size={18} />
              </div>

              <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
                {title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CTA BANNER                                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className={cn(
          'relative overflow-hidden rounded-[var(--radius-2xl)] px-8 py-12 text-center',
          'bg-gradient-to-br from-[var(--color-accent-subtle)] via-[var(--color-surface)] to-[var(--color-surface)]',
          'border border-[var(--color-accent)]/20',
        )}>
          {/* Background glow */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[var(--color-accent)]/5 blur-2xl"
          />

          <h2 className="mb-3 text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Ready to get started?
          </h2>
          <p className="mb-8 text-[var(--color-text-secondary)]">
            The foundation is in place. Start building your AI-powered features.
          </p>
          <Button size="lg">
            Open the platform
            <ArrowRight size={16} />
          </Button>
        </div>
      </section>

    </div>
  );
}

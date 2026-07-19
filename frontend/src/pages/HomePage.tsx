import { useState, useEffect } from 'react';
import {
  Home,
  FolderOpen,
  Search,
  MessageSquare,
  GitBranch,
  Terminal,
  Globe,
  Cpu,
  Settings,
  ChevronRight,
  Play,
  Bot,
  Layers,
  Clock,
  Code2,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '../utilities/cn.js';

// ─── Static workspace data ─────────────────────────────────────────────────────

const RECENT_PROJECTS = [
  {
    id: 'blue-network',
    name: 'Blue Network',
    framework: 'Next.js',
    branch: 'main',
    lastOpened: '2 hours ago',
    color: '#3b82f6',
    letter: 'B',
  },
  {
    id: 'blue-tiers',
    name: 'Blue Tiers',
    framework: 'React + Vite',
    branch: 'feature/tiers-v2',
    lastOpened: 'Yesterday',
    color: '#6366f1',
    letter: 'T',
  },
  {
    id: 'my-website',
    name: 'My Website',
    framework: 'Astro',
    branch: 'main',
    lastOpened: '3 days ago',
    color: '#8b5cf6',
    letter: 'W',
  },
  {
    id: 'minecraft-mods',
    name: 'Minecraft Mods',
    framework: 'Java / Gradle',
    branch: 'dev',
    lastOpened: '1 week ago',
    color: '#22c55e',
    letter: 'M',
  },
] as const;

const NAV_ITEMS = [
  { icon: Home,         label: 'Home',      active: true  },
  { icon: FolderOpen,   label: 'Projects',  active: false },
  { icon: Layers,       label: 'Explorer',  active: false },
  { icon: Search,       label: 'Search',    active: false },
  { icon: MessageSquare,label: 'AI Chat',   active: false },
  { icon: GitBranch,    label: 'Git',       active: false },
  { icon: Terminal,     label: 'Terminal',  active: false },
  { icon: Globe,        label: 'Preview',   active: false },
  { icon: Cpu,          label: 'Models',    active: false },
] as const;

const BOTTOM_TABS = ['Terminal', 'Problems', 'Logs', 'Console', 'Git Output'] as const;

// ─── Live clock ────────────────────────────────────────────────────────────────

function useClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  );
  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
      1000,
    );
    return () => clearInterval(id);
  }, []);
  return time;
}

// ─── Project card ──────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  framework: string;
  branch: string;
  lastOpened: string;
  color: string;
  letter: string;
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden',
        'border border-[var(--color-border-subtle)] bg-[var(--color-surface)]',
        'hover:border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]',
        'transition-all duration-200 cursor-pointer',
      )}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* Top accent strip */}
      <div className="h-0.5 w-full" style={{ background: project.color }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          {/* Avatar */}
          <div
            className="flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ background: `${project.color}22`, border: `1px solid ${project.color}44` }}
          >
            <span style={{ color: project.color }}>{project.letter}</span>
          </div>

          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
            aria-label="More options"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Name + meta */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
            {project.name}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {project.framework}
          </p>
        </div>

        {/* Git branch */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <GitBranch size={11} />
          <span className="font-mono truncate">{project.branch}</span>
        </div>

        {/* Last opened */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <Clock size={11} />
          <span>{project.lastOpened}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-3 flex items-center gap-1.5">
        {(['Open', 'Run', 'Git', 'Ask AI'] as const).map((label) => (
          <button
            key={label}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
              'border border-[var(--color-border-subtle)]',
              'text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)]',
              'hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]',
              'transition-all duration-150',
            )}
          >
            {label === 'Open'   && <ChevronRight size={10} />}
            {label === 'Run'    && <Play size={10} />}
            {label === 'Git'    && <GitBranch size={10} />}
            {label === 'Ask AI' && <Bot size={10} />}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const time = useClock();
  const [activeBottomTab, setActiveBottomTab] = useState<string>('Terminal');

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden select-none"
      style={{ background: 'var(--color-background)', color: 'var(--color-text-primary)' }}
    >

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER BAR                                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 h-11 gap-4"
        style={{
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Left — workspace identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 h-5 w-5 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
            <Code2 size={11} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-[var(--color-text-primary)] tracking-tight whitespace-nowrap">
            Personal AI Workspace
          </span>
        </div>

        {/* Center — contextual pills */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Model */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs',
              'border border-[var(--color-border-subtle)] bg-[var(--color-surface)]',
              'text-[var(--color-text-secondary)]',
            )}
          >
            <Cpu size={11} className="text-[var(--color-accent)]" />
            <span className="font-mono">No model configured</span>
          </div>

          {/* Branch */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs',
              'border border-[var(--color-border-subtle)] bg-[var(--color-surface)]',
              'text-[var(--color-text-secondary)]',
            )}
          >
            <GitBranch size={11} className="text-[var(--color-success)]" />
            <span className="font-mono">main</span>
          </div>

          {/* Folder */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs',
              'border border-[var(--color-border-subtle)] bg-[var(--color-surface)]',
              'text-[var(--color-text-secondary)]',
              'hidden sm:flex',
            )}
          >
            <FolderOpen size={11} className="text-[var(--color-warning)]" />
            <span className="font-mono">~/workspace</span>
          </div>
        </div>

        {/* Right — clock + settings */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-mono text-[var(--color-text-muted)] tabular-nums">
            {time}
          </span>
          <button
            className={cn(
              'h-7 w-7 rounded-md flex items-center justify-center',
              'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-surface-elevated)] transition-colors',
            )}
            aria-label="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BODY (sidebar + main + right panel)                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Left sidebar — icon rail ─────────────────────────────────────── */}
        <aside
          className="flex-shrink-0 flex flex-col items-center py-2 gap-0.5 w-12"
          style={{
            borderRight: '1px solid var(--color-border-subtle)',
            background: 'var(--color-ide-sidebar)',
          }}
        >
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              title={label}
              className={cn(
                'group relative h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-150',
                active
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]',
              )}
            >
              <Icon size={16} />
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[var(--color-accent)]" />
              )}
            </button>
          ))}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Settings at bottom */}
          <button
            title="Settings"
            className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all"
          >
            <Settings size={16} />
          </button>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex flex-col flex-1 overflow-hidden min-w-0">

          {/* Scrollable workspace area */}
          <div className="flex-1 overflow-y-auto min-h-0 px-8 py-8">

            {/* Greeting */}
            <div className="mb-8">
              <h1 className="text-xl font-semibold text-[var(--color-text-primary)] leading-tight">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Pick up where you left off, or start something new.
              </p>
            </div>

            {/* Recently opened projects */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Recently Opened
                </h2>
                <button className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
                  View all
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                {RECENT_PROJECTS.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>

          </div>

          {/* ── Bottom panel ──────────────────────────────────────────────── */}
          <div
            className="flex-shrink-0"
            style={{
              height: 180,
              borderTop: '1px solid var(--color-border-subtle)',
              background: 'var(--color-ide-terminal)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Tab bar */}
            <div
              className="flex items-center gap-0 px-2 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--color-border-subtle)', height: 32 }}
            >
              {BOTTOM_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveBottomTab(tab)}
                  className={cn(
                    'px-3 h-full text-xs transition-colors relative',
                    activeBottomTab === tab
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
                  )}
                >
                  {tab}
                  {activeBottomTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-accent)]" />
                  )}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs text-[var(--color-text-muted)] font-mono">
                — No project open —
              </span>
            </div>
          </div>
        </main>

        {/* ── Right panel — AI assistant ───────────────────────────────────── */}
        <aside
          className="flex-shrink-0 flex flex-col"
          style={{
            width: 260,
            borderLeft: '1px solid var(--color-border-subtle)',
            background: 'var(--color-ide-sidebar)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-3 flex-shrink-0"
            style={{ height: 36, borderBottom: '1px solid var(--color-border-subtle)' }}
          >
            <div className="flex items-center gap-1.5">
              <Bot size={13} className="text-[var(--color-accent)]" />
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                AI Assistant
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--color-text-muted)' }}
              />
              <span className="text-xs text-[var(--color-text-muted)]">Idle</span>
            </div>
          </div>

          {/* Empty state */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
            >
              <Bot size={18} className="text-[var(--color-text-muted)]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                No project currently open.
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] leading-relaxed">
                Open a project to start using the AI coding assistant.
              </p>
            </div>
          </div>

          {/* Input area placeholder */}
          <div
            className="flex-shrink-0 p-3"
            style={{ borderTop: '1px solid var(--color-border-subtle)' }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--color-text-muted)]"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
            >
              <MessageSquare size={12} />
              <span>Ask AI anything…</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

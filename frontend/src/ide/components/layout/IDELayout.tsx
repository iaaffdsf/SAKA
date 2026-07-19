import { useCallback } from 'react';
import { useIDE } from '@/ide/contexts/IDEContext.js';
import { useKeyboardShortcuts } from '@/ide/hooks/useKeyboardShortcuts.js';
import TitleBar from './TitleBar.js';
import StatusBar from './StatusBar.js';
import ResizeHandle from './ResizeHandle.js';
import Sidebar from '@/ide/components/panels/Sidebar.js';
import EditorPanel from '@/ide/components/panels/EditorPanel.js';
import AIPanel from '@/ide/components/panels/AIPanel.js';
import TerminalPanel from '@/ide/components/panels/TerminalPanel.js';
import CommandPalette from '@/ide/components/command-palette/CommandPalette.js';

// ─── Main IDE layout orchestrator ────────────────────────────────────────────

export default function IDELayout() {
  const {
    sidebarOpen,    toggleSidebar,
    aiPanelOpen,    toggleAIPanel,
    terminalOpen,   toggleTerminal,
    sidebarWidth,   setSidebarWidth,
    aiPanelWidth,   setAIPanelWidth,
    terminalHeight, setTerminalHeight,
    openCommandPalette, closeCommandPalette,
    commandPaletteOpen,
  } = useIDE();

  // ── Keyboard shortcuts ───────────────────────────────────────────────────

  useKeyboardShortcuts([
    { key: 'b',     ctrl: true,  shift: false, action: toggleSidebar,        preventDefault: true  },
    { key: 'j',     ctrl: true,  shift: false, action: toggleTerminal,       preventDefault: true  },
    { key: 'a',     ctrl: true,  shift: true,  action: toggleAIPanel,        preventDefault: true  },
    { key: 'p',     ctrl: true,  shift: true,  action: openCommandPalette,   preventDefault: true  },
    { key: 'p',     ctrl: true,  shift: false, action: openCommandPalette,   preventDefault: true  },
    { key: 'Escape',             shift: false, action: closeCommandPalette,  preventDefault: false },
  ]);

  // ── Resize getters ───────────────────────────────────────────────────────

  const getSidebarWidth   = useCallback(() => sidebarWidth,   [sidebarWidth]);
  const getAIPanelWidth   = useCallback(() => aiPanelWidth,   [aiPanelWidth]);
  const getTerminalHeight = useCallback(() => terminalHeight, [terminalHeight]);

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: 'var(--color-background)', color: 'var(--color-text-primary)' }}
    >
      {/* ── Title bar ─────────────────────────────────────────────────────── */}
      <TitleBar />

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Left sidebar ──────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 overflow-hidden flex"
          style={{
            width: sidebarOpen ? sidebarWidth : 0,
            minWidth: sidebarOpen ? 160 : 0,
            transition: 'width 200ms ease',
          }}
        >
          <Sidebar />
        </div>

        {/* Sidebar → main resize handle */}
        {sidebarOpen && (
          <ResizeHandle
            orientation="vertical"
            min={160}
            max={480}
            getSize={getSidebarWidth}
            onResize={setSidebarWidth}
          />
        )}

        {/* ── Center column (editor + terminal) ─────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">

          {/* ── Editor row ──────────────────────────────────────────────── */}
          <div className="flex flex-1 overflow-hidden min-h-0">

            <EditorPanel />

            {/* Editor → AI panel resize handle */}
            {aiPanelOpen && (
              <ResizeHandle
                orientation="vertical"
                min={240}
                max={600}
                invert
                getSize={getAIPanelWidth}
                onResize={setAIPanelWidth}
              />
            )}

            {/* ── Right AI panel ────────────────────────────────────────── */}
            <div
              className="flex-shrink-0 overflow-hidden flex"
              style={{
                width: aiPanelOpen ? aiPanelWidth : 0,
                minWidth: aiPanelOpen ? 240 : 0,
                transition: 'width 200ms ease',
              }}
            >
              <AIPanel />
            </div>

          </div>

          {/* Editor → terminal resize handle */}
          {terminalOpen && (
            <ResizeHandle
              orientation="horizontal"
              min={80}
              max={600}
              invert
              getSize={getTerminalHeight}
              onResize={setTerminalHeight}
            />
          )}

          {/* ── Terminal ──────────────────────────────────────────────────── */}
          <div
            className="flex-shrink-0 overflow-hidden flex"
            style={{
              height: terminalOpen ? terminalHeight : 0,
              minHeight: terminalOpen ? 80 : 0,
              transition: 'height 200ms ease',
            }}
          >
            <TerminalPanel />
          </div>

        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────────── */}
      <StatusBar />

      {/* ── Command palette (portal-like overlay) ───────────────────────────── */}
      {commandPaletteOpen && <CommandPalette />}
    </div>
  );
}

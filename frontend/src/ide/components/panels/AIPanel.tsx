import { useState, useRef, useEffect } from 'react';
import {
  Bot, Sparkles, Send, X, ChevronDown, Copy,
  Lightbulb, Wand2, RotateCcw, Code2,
} from 'lucide-react';
import { cn } from '@/utilities/cn.js';
import { useIDE } from '@/ide/contexts/IDEContext.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type AIPanelTab = 'chat' | 'explain' | 'generate';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Greeting messages ────────────────────────────────────────────────────────

const GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  content: "Hi! I'm your AI coding assistant. I can help you write, explain, and improve your code.\n\nTry asking me to:\n- Explain the selected code\n- Refactor a function\n- Write unit tests\n- Fix a bug",
  timestamp: new Date(),
};

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-2 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: isUser ? 'var(--color-accent)' : 'var(--color-surface-elevated)',
          color: isUser ? '#fff' : 'var(--color-accent)',
        }}
      >
        {isUser ? <span className="text-[10px] font-bold">U</span> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed',
          isUser ? 'rounded-tr-sm' : 'rounded-tl-sm',
        )}
        style={{
          background: isUser ? 'var(--color-accent)' : 'var(--color-surface-elevated)',
          color: isUser ? '#fff' : 'var(--color-text-primary)',
        }}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div
          className={cn(
            'flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-60 transition-opacity',
            isUser ? 'justify-end' : 'justify-start',
          )}
        >
          <button className="hover:opacity-100 transition-opacity" title="Copy">
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Panel ─────────────────────────────────────────────────────────────────

export default function AIPanel() {
  const { toggleAIPanel, activeFileId, openFiles } = useIDE();
  const [activeTab, setActiveTab] = useState<AIPanelTab>('chat');
  const [messages,  setMessages]  = useState<Message[]>([GREETING]);
  const [input,     setInput]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model,     setModel]     = useState('claude-3-5-sonnet');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeFile = openFiles.find(f => f.id === activeFileId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `I'd be happy to help with that! This is a placeholder response — real AI integration will be added in the next phase.\n\nYou asked: "${text}"`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1200);
  };

  const models = [
    'claude-3-5-sonnet',
    'gpt-4o',
    'gemini-1.5-pro',
  ];

  const quickActions = [
    { icon: <Lightbulb className="w-3.5 h-3.5" />, label: 'Explain code' },
    { icon: <Wand2     className="w-3.5 h-3.5" />, label: 'Refactor'     },
    { icon: <Code2     className="w-3.5 h-3.5" />, label: 'Write tests'  },
    { icon: <RotateCcw className="w-3.5 h-3.5" />, label: 'Fix bugs'     },
  ];

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden border-l"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'var(--color-accent)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            AI Assistant
          </span>
        </div>
        <button
          onClick={toggleAIPanel}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div
        className="flex border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        {(['chat', 'explain', 'generate'] as AIPanelTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-1.5 text-[11px] capitalize transition-colors"
            style={{
              color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Model selector ──────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <Bot className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        <div className="relative flex-1">
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full text-[11px] appearance-none bg-transparent pr-4 outline-none cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-0 top-0.5 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      {/* ── Context pill ────────────────────────────────────────────────── */}
      {activeFile && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 border-b flex-shrink-0 text-[11px]"
          style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
        >
          <Code2 className="w-3 h-3" />
          <span>Context:</span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px]"
            style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}
          >
            {activeFile.name}
          </span>
        </div>
      )}

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {activeTab === 'chat' && (
          <>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-accent)' }}
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div
                  className="rounded-lg rounded-tl-sm px-3 py-2 flex items-center gap-1"
                  style={{ background: 'var(--color-surface-elevated)' }}
                >
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'var(--color-accent)', animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}

        {activeTab === 'explain' && (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Select code in the editor and click Explain to get a detailed explanation.
            </p>
            {quickActions.map((a, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md border text-xs transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Describe what you want to generate and AI will write it for you.
            </p>
            <textarea
              rows={4}
              placeholder="Describe what to generate…"
              className="w-full text-xs px-3 py-2 rounded-md border outline-none resize-none"
              style={{
                background: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            <button
              className="w-full py-2 rounded-md text-xs font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              Generate
            </button>
          </div>
        )}
      </div>

      {/* ── Input ───────────────────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div
          className="px-3 pb-3 pt-2 flex-shrink-0 border-t"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <div
            className="flex items-end gap-2 rounded-lg border p-2"
            style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
          >
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder="Ask anything… (⏎ to send)"
              className="flex-1 bg-transparent text-xs outline-none resize-none"
              style={{ color: 'var(--color-text-primary)', maxHeight: 80 }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={cn(
                'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all',
                input.trim() ? 'opacity-100' : 'opacity-30',
              )}
              style={{ background: 'var(--color-accent)' }}
            >
              <Send className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

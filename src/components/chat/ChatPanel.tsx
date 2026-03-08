'use client';
import { useCharacterStore, useChatStore } from '@/stores';
import { useChat, useAutoScroll } from '@/hooks/useChat';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { CHARACTER } from '@/lib/ai/config';

export default function ChatPanel() {
  const { messages, sendMessage, isStreaming } = useChat();
  const { emotion } = useCharacterStore();
  const { clearHistory } = useChatStore();
  const scrollRef = useAutoScroll(messages);

  return (
    <div
      className={`flex flex-col h-full rounded-xl overflow-hidden vn-glass vn-glow-box emotion-${emotion} transition-all duration-700`}
    >
      {/* ── Header ──────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--vn-border)' }}
      >
        {/* Live pulse */}
        <div className="relative w-2.5 h-2.5">
          <div
            className="absolute inset-0 rounded-full transition-colors duration-700"
            style={{ background: 'var(--vn-accent)' }}
          />
          <div
            className="absolute inset-0 rounded-full anim-pulse-glow"
            style={{ background: 'var(--vn-accent)', opacity: 0.4 }}
          />
        </div>

        <span className="vn-title text-xs">{CHARACTER.name}</span>

        <div className="flex-1" />

        {/* Status indicator */}
        <span className="vn-label capitalize" style={{ color: 'var(--vn-accent)', opacity: 0.7 }}>
          {isStreaming ? 'responding...' : emotion}
        </span>

        {/* Clear button */}
        {messages.length > 0 && !isStreaming && (
          <button
            onClick={clearHistory}
            className="vn-label opacity-30 hover:opacity-70 transition-opacity ml-2"
            title="Clear history"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Messages ────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto vn-scroll px-4 py-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 opacity-30 select-none">
            <div style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 8px var(--vn-glow))' }}>✦</div>
            <p className="vn-subtitle">Your story begins here</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} isLatest={i === messages.length - 1} />
          ))
        )}
      </div>

      {/* ── Input ───────────────────────────────── */}
      <div className="shrink-0">
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
'use client';
import { useSettingsStore, useChatStore } from '@/stores';
import type { Message } from '@/types';

interface Props {
  message: Message;
  isLatest?: boolean;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isLatest }: Props) {
  const isUser = message.role === 'user';
  const { showTimestamps } = useSettingsStore();
  const { isStreaming } = useChatStore();
  const isEmpty = !message.content;

  // Show cursor only on latest assistant message while streaming
  const showCursor = isLatest && !isUser && isStreaming && !isEmpty;

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} anim-fade-up`}
      style={{ animationDuration: '0.3s' }}
    >
      <div className={`max-w-[82%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-base leading-relaxed
            ${isUser ? 'msg-user' : 'msg-assistant'}
          `}
        >
          {isEmpty ? (
            // Loading dots — waiting for first chunk
            <div className="flex gap-1.5 items-center py-0.5 px-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            <p style={{ color: 'var(--vn-text)', whiteSpace: 'pre-wrap' }}>
              {message.content}
              {/* Blinking cursor while typewriter is running */}
              {showCursor && (
                <span
                  className="anim-blink"
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: '1em',
                    background: 'var(--vn-accent)',
                    marginLeft: 2,
                    verticalAlign: 'text-bottom',
                    borderRadius: 1,
                  }}
                />
              )}
            </p>
          )}
        </div>

        {showTimestamps && !isEmpty && (
          <div className="vn-label opacity-30 text-[10px] px-1">
            {formatTime(new Date(message.timestamp))}
          </div>
        )}
      </div>
    </div>
  );
}
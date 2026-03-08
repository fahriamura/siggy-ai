'use client';
import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores';
import type { Emotion } from '@/types';

const EMOTION_COLOR: Record<Emotion, string> = {
  neutral:   '#7eb2ff',
  happy:     '#f9d74a',
  sad:       '#5b8fd4',
  angry:     '#e04a4a',
  surprised: '#b06ee8',
  thinking:  '#4ec9a8',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function VNHistory({ open, onClose }: Props) {
  const { messages, clearHistory } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: 340,
          zIndex: 50,
          background: 'rgba(6,9,20,0.97)',
          borderLeft: '1px solid rgba(120,150,220,0.18)',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
          boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(120,150,220,0.12)',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#7eb2ff',
          }}>Chat History</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'rgba(224,74,74,0.6)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e04a4a')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(224,74,74,0.6)')}
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(180,200,240,0.4)', fontSize: '1.1rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(180,200,240,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(180,200,240,0.4)')}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflowY: 'auto', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(120,150,220,0.2) transparent',
          }}
        >
          {messages.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(180,200,240,0.2)',
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '0.9rem',
            }}>
              No messages yet...
            </div>
          ) : (
            messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              const accent = EMOTION_COLOR[msg.emotion ?? 'neutral'];
              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  animation: 'fadeUp 0.2s ease both',
                }}>
                  {/* Speaker label */}
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: isUser ? 'rgba(180,200,240,0.4)' : accent,
                    marginBottom: 3,
                    opacity: 0.8,
                  }}>
                    {isUser ? 'You' : 'Siggy'}
                  </div>
                  {/* Bubble */}
                  <div style={{
                    maxWidth: '88%',
                    padding: '8px 12px',
                    borderRadius: isUser ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                    background: isUser
                      ? `linear-gradient(135deg, ${accent}18, ${accent}08)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isUser ? accent + '30' : 'rgba(120,150,220,0.1)'}`,
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    lineHeight: 1.55,
                    color: 'rgba(210,220,240,0.85)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid rgba(120,150,220,0.1)',
          fontFamily: 'monospace',
          fontSize: '0.6rem',
          color: 'rgba(180,200,240,0.2)',
          textAlign: 'center',
          flexShrink: 0,
        }}>
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </div>
      </div>
    </>
  );
}
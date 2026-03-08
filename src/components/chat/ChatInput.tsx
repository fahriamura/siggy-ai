'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import { sfx } from '@/lib/sfx/manager';

interface Props {
  onSend: (msg: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue('');
    if (ref.current) { ref.current.style.height = 'auto'; }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const onInput = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 130)}px`;
  };

  return (
    <div
      className="flex items-end gap-3 px-4 py-3"
      style={{ borderTop: '1px solid var(--vn-border)' }}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        onInput={onInput}
        disabled={disabled}
        placeholder="Say something to Siggy..."
        rows={1}
        className="flex-1 vn-input resize-none rounded-lg px-3 py-2 text-base leading-relaxed vn-scroll"
        style={{ maxHeight: '130px', fontFamily: 'var(--font-body)' }}
      />

      <button
        disabled={disabled || !value.trim()}
        onMouseEnter={() => sfx.playUI('hover')}
        onClick={() => { sfx.playUI('click'); submit(); }}
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{
          background: disabled || !value.trim() ? 'rgba(126,178,255,0.1)' : 'var(--vn-accent)',
          color: disabled || !value.trim() ? 'var(--vn-text-faint)' : 'var(--vn-bg)',
          boxShadow: !disabled && value.trim() ? '0 0 16px var(--vn-glow-strong)' : 'none',
          transition: 'all 0.25s ease',
          border: '1px solid var(--vn-border)',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
'use client';
import { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react';
import type { Emotion } from '@/types';

interface Props {
  speakerName: string;
  response: { text: string; id: number } | null;
  isLoading: boolean;
  onAdvance: () => void;
  inputMode: boolean;
  onSend: (msg: string) => void;
  disabled: boolean;
  emotion: Emotion;
}

const EMOTION_COLOR: Record<Emotion, string> = {
  neutral:   '#7eb2ff',
  happy:     '#f9d74a',
  sad:       '#5b8fd4',
  angry:     '#e04a4a',
  surprised: '#b06ee8',
  thinking:  '#4ec9a8',
};

// Max chars per page — fits ~3 lines in a 140px box at 1.05rem/1.65 lineHeight
const PAGE_LIMIT = 120;
const SENTENCE_ENDS = new Set(['.', '!', '?', '…', '✨', '💫', '~']);

function isSentenceEnd(text: string): boolean {
  const trimmed = text.trimEnd();
  if (!trimmed) return false;
  // Check last char, or last char before closing punctuation/emoji
  const last = Array.from(trimmed).at(-1) ?? '';
  return SENTENCE_ENDS.has(last);
}

function paginateText(text: string): string[] {
  if (!text) return [];
  const pages: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (remaining.length <= PAGE_LIMIT) {
      pages.push(remaining);
      break;
    }

    // 1. Prefer cutting at a newline within PAGE_LIMIT
    const newlineAt = remaining.lastIndexOf('\n', PAGE_LIMIT);
    if (newlineAt > 0) {
      const chunk = remaining.slice(0, newlineAt).trimEnd();
      remaining = remaining.slice(newlineAt + 1).trimStart();
      // Add … if sentence isn't finished
      if (!isSentenceEnd(chunk)) {
        pages.push(chunk + '…');
        remaining = '…' + remaining;
      } else {
        pages.push(chunk);
      }
      continue;
    }

    // 2. Fall back to last space
    const spaceAt = remaining.lastIndexOf(' ', PAGE_LIMIT);
    if (spaceAt > 0) {
      const chunk = remaining.slice(0, spaceAt);
      remaining = remaining.slice(spaceAt + 1);
      if (!isSentenceEnd(chunk)) {
        pages.push(chunk + '…');
        remaining = '…' + remaining;
      } else {
        pages.push(chunk);
      }
      continue;
    }

    // 3. Hard cut with hyphen
    pages.push(remaining.slice(0, PAGE_LIMIT - 1) + '-');
    remaining = remaining.slice(PAGE_LIMIT - 1);
  }
  return pages;
}

export default function VNDialogBox({
  speakerName, response, isLoading, onAdvance, inputMode, onSend, disabled, emotion,
}: Props) {
  const [pages, setPages] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accent = EMOTION_COLOR[emotion];

  // New response object → re-paginate and restart from page 0
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!response?.text) {
      setPages([]);
      setPageIndex(0);
      setDisplayedChars(0);
      return;
    }
    const newPages = paginateText(response.text);
    // Debug: log to console so you can verify all text is present
    console.log('[VNDialogBox] response id:', response.id, '| pages:', newPages.length);
    newPages.forEach((p, i) => console.log(`  page ${i + 1} (${p.length} chars):`, p));
    setPages(newPages);
    setPageIndex(0);
    setDisplayedChars(0);
  }, [response]);

  // Typewriter per page
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (pages.length === 0 || isLoading) return;
    const currentPage = pages[pageIndex] ?? '';
    let i = 0;
    setDisplayedChars(0);
    const tick = () => {
      i = Math.min(i + 3, currentPage.length);
      setDisplayedChars(i);
      if (i < currentPage.length) timerRef.current = setTimeout(tick, 28);
    };
    timerRef.current = setTimeout(tick, 28);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [pageIndex, pages]);

  // Auto-focus textarea on input mode
  useEffect(() => {
    if (inputMode && inputRef.current) setTimeout(() => inputRef.current?.focus(), 80);
  }, [inputMode]);

  // Clear textarea when switching to input mode or on new response
  useEffect(() => { if (inputMode) setInput(''); }, [inputMode]);
  useEffect(() => { setInput(''); }, [response]);

  const currentPage = pages[pageIndex] ?? '';
  const isTyping    = displayedChars < currentPage.length;
  const isLastPage  = pageIndex >= pages.length - 1;
  const isFullyDone = !isTyping && isLastPage && pages.length > 0;

  const handleAdvance = useCallback(() => {
    if (inputMode || isLoading || pages.length === 0) return;
    if (isTyping) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setDisplayedChars(currentPage.length);
      return;
    }
    if (!isLastPage) { setPageIndex(p => p + 1); return; }
    onAdvance();
  }, [inputMode, isLoading, pages.length, isTyping, isLastPage, currentPage.length, onAdvance]);

  useEffect(() => {
    if (inputMode) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputMode, handleAdvance]);

  const handleSend = () => {
    const t = input.trim();
    if (!t || disabled) return;
    onSend(t);
    setInput('');
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
        padding: '0 20px calc(16px + env(safe-area-inset-bottom, 0px))',
      }}
      onClick={!inputMode && !isLoading && pages.length > 0 ? handleAdvance : undefined}
    >
      {/* Name tag */}
      <div style={{
        display: 'inline-block', marginBottom: -1, padding: '5px 18px 6px',
        background: 'rgba(4,6,18,0.95)',
        borderTop:   `1px solid ${inputMode ? 'rgba(120,150,220,0.4)' : accent}`,
        borderLeft:  `1px solid ${inputMode ? 'rgba(120,150,220,0.4)' : accent}`,
        borderRight: `1px solid ${inputMode ? 'rgba(120,150,220,0.4)' : accent}`,
        borderBottom: 'none',
        borderRadius: '6px 6px 0 0',
        transition: 'border-color 0.4s ease',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: inputMode ? 'rgba(180,200,240,0.9)' : accent,
          transition: 'color 0.4s ease',
        }}>
          {inputMode ? 'You' : speakerName}
        </span>
      </div>

      {/* Main box */}
      <div style={{
        background: 'rgba(4,6,18,0.95)',
        borderTop:    `1px solid ${inputMode ? 'rgba(120,150,220,0.3)' : accent + '90'}`,
        borderLeft:   `1px solid ${inputMode ? 'rgba(120,150,220,0.3)' : accent + '90'}`,
        borderRight:  `1px solid ${inputMode ? 'rgba(120,150,220,0.3)' : accent + '90'}`,
        borderBottom: `1px solid ${inputMode ? 'rgba(120,150,220,0.3)' : accent + '90'}`,
        borderRadius: '0 6px 6px 6px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.5)',
        padding: '14px 18px 10px',
        height: 140,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'border-color 0.4s ease',
        cursor: !inputMode ? 'pointer' : 'default',
        position: 'relative',
      }}>

        {inputMode ? (
          /* INPUT MODE */
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: '100%' }}
            onClick={e => e.stopPropagation()}>
            <textarea
              ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey} disabled={disabled}
              placeholder="Type your reply..." rows={3}
              style={{
                flex: 1, height: '100%', background: 'transparent',
                border: 'none', outline: 'none', resize: 'none', scrollbarWidth: 'none',
                color: 'rgba(220,230,250,0.95)', fontFamily: 'var(--font-body)',
                fontSize: '1.05rem', lineHeight: 1.6,
              }}
            />
            <button onClick={handleSend} disabled={disabled || !input.trim()} style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0, marginBottom: 2,
              background: (!disabled && input.trim()) ? accent : 'rgba(120,150,220,0.1)',
              border: `1px solid ${(!disabled && input.trim()) ? accent : 'rgba(120,150,220,0.2)'}`,
              color: (!disabled && input.trim()) ? '#06080f' : 'rgba(180,200,240,0.3)',
              cursor: (!disabled && input.trim()) ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s ease',
              boxShadow: (!disabled && input.trim()) ? `0 0 10px ${accent}66` : 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>

        ) : (
          /* DIALOG MODE */
          <>
            {isLoading && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            )}

            {!isLoading && (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '1.05rem', lineHeight: 1.65,
                color: 'rgba(220,230,250,0.95)', whiteSpace: 'pre-wrap',
                flex: 1, margin: 0,
              }}>
                {currentPage.slice(0, displayedChars)}
                {isTyping && (
                  <span className="anim-blink" style={{
                    display: 'inline-block', width: 2, height: '1em',
                    background: accent, marginLeft: 2, verticalAlign: 'text-bottom', borderRadius: 1,
                  }} />
                )}
              </p>
            )}

            {!isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                {pages.length > 1 && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {pages.map((_, i) => (
                      <div key={i} style={{
                        width: i === pageIndex ? 14 : 5, height: 5, borderRadius: 3,
                        background: i === pageIndex ? accent : 'rgba(120,150,220,0.25)',
                        transition: 'all 0.3s ease',
                      }} />
                    ))}
                  </div>
                )}
                <div style={{ flex: 1 }} />
                {!isTyping && (
                  <div style={{
                    fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.1em',
                    color: accent, opacity: 0.7, animation: 'blink 1.2s step-end infinite',
                  }}>
                    {isFullyDone ? '▼ reply' : '▶ next'}
                  </div>
                )}
                {isTyping && (
                  <div style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: 'rgba(180,200,240,0.2)', letterSpacing: '0.1em' }}>
                    tap to skip
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
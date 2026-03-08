'use client';
import Link from 'next/link';
import { useCharacterStore } from '@/stores';

interface Props {
  onHistoryOpen: () => void;
}

const EMOTION_COLOR: Record<string, string> = {
  neutral:   '#7eb2ff',
  happy:     '#f9d74a',
  sad:       '#5b8fd4',
  angry:     '#e04a4a',
  surprised: '#b06ee8',
  thinking:  '#4ec9a8',
};

export default function VNTopBar({ onHistoryOpen }: Props) {
  const { emotion } = useCharacterStore();
  const accent = EMOTION_COLOR[emotion] ?? '#7eb2ff';

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'linear-gradient(to bottom, rgba(6,9,20,0.7) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}
    >
      {/* Left — title */}
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          fontWeight: 900,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: accent,
          textDecoration: 'none',
          textShadow: `0 0 12px ${accent}66`,
          transition: 'all 0.4s ease',
          pointerEvents: 'all',
        }}
      >
        SIGGY
      </Link>

      {/* Right — buttons */}
      <div style={{ display: 'flex', gap: 8, pointerEvents: 'all' }}>
        {/* History */}
        <button
          onClick={onHistoryOpen}
          style={{
            background: 'rgba(5,7,18,0.85)',
            border: '1px solid rgba(120,150,220,0.2)',
            borderRadius: 6,
            padding: '5px 12px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(180,200,240,0.5)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'rgba(180,200,240,0.9)';
            e.currentTarget.style.borderColor = 'rgba(120,150,220,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(180,200,240,0.5)';
            e.currentTarget.style.borderColor = 'rgba(120,150,220,0.2)';
          }}
        >
          History
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          style={{
            background: 'rgba(6,9,20,0.7)',
            border: '1px solid rgba(120,150,220,0.2)',
            borderRadius: 6,
            padding: '5px 12px',
            textDecoration: 'none',
            fontFamily: 'monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(180,200,240,0.5)',
            transition: 'all 0.2s ease',
            display: 'inline-block',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(180,200,240,0.9)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,150,220,0.5)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(180,200,240,0.5)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,150,220,0.2)';
          }}
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
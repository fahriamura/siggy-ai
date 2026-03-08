'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w-screen h-screen overflow-hidden vn-scene-bg starfield flex flex-col items-center justify-center gap-8">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(126,178,255,0.06) 0%, transparent 70%)' }}
      />

      <div className="text-center space-y-4 anim-fade-up">
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(4rem, 12vw, 9rem)',
            fontWeight: 900,
            letterSpacing: '0.08em',
            color: 'rgba(126,178,255,0.12)',
            lineHeight: 1,
          }}
        >
          404
        </div>

        <div className="vn-title text-sm">Page Not Found</div>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--vn-text-dim)', fontStyle: 'italic' }}>
          This chapter does not exist in the story.
        </p>
      </div>

      <Link href="/" className="vn-btn">Return Home</Link>
    </div>
  );
}
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.8 + 0.3,
  opacity: Math.random() * 0.5 + 0.1,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 8,
}));

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: 60 + Math.random() * 40,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 6,
}));

export default function IntroPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'ready'>('loading');
  const [progress, setProgress] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const glitchRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load background
  useEffect(() => {
    const img = new Image();
    img.src = '/background.jpg';
    img.onload = () => setBgLoaded(true);
  }, []);

  // Progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase('reveal'), 200);
          setTimeout(() => setPhase('ready'), 900);
          return 100;
        }
        return Math.min(p + Math.random() * 6 + 2, 100);
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Random glitch on title
  useEffect(() => {
    if (phase !== 'ready') return;
    glitchRef.current = setInterval(() => {
      if (Math.random() < 0.15) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 120);
      }
    }, 2000);
    return () => { if (glitchRef.current) clearInterval(glitchRef.current); };
  }, [phase]);

  const handleStart = () => {
    // use a wrapper div with CSS transition instead of document.body.style
    // so the chat page can render with normal opacity on load
    const wrapper = document.querySelector('[data-page-wrapper]') as HTMLElement;
    if (wrapper) {
      wrapper.style.transition = 'opacity 0.5s';
      wrapper.style.opacity = '0';
    }
    setTimeout(() => router.push('/chat'), 500);
  };

  return (
    <div data-page-wrapper style={{
      position: 'relative',
      width: '100vw', height: '100vh',
      overflow: 'hidden',
      background: '#04060c',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>

      {/* Background image (dimmed) */}
      {bgLoaded && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: phase === 'loading' ? 0 : 0.18,
          transition: 'opacity 1.5s ease',
          filter: 'blur(2px)',
        }} />
      )}

      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {STARS.map(s => (
          <div key={s.id} style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            borderRadius: '50%',
            background: 'white',
            opacity: s.opacity,
            animation: `blink ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {PARTICLES.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: 'rgba(126,178,255,0.6)',
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(4,6,12,0.85) 100%)',
      }} />

      {/* Center glow */}
      <div style={{
        position: 'absolute', zIndex: 2, pointerEvents: 'none',
        width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(126,178,255,0.06) 0%, transparent 70%)',
        filter: 'blur(40px)',
        transition: 'opacity 1s ease',
        opacity: phase === 'loading' ? 0 : 1,
      }} />

      {/* ══ LOADING PHASE ══ */}
      {phase === 'loading' && (
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          animation: 'fadeIn 0.4s ease both',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'rgba(126,178,255,0.4)',
          }}>
            Initializing
          </div>
          <div style={{
            width: 200, height: 1,
            background: 'rgba(126,178,255,0.1)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, left: 0,
              width: `${progress}%`,
              background: 'linear-gradient(90deg, rgba(126,178,255,0.3), #7eb2ff)',
              boxShadow: '0 0 8px #7eb2ff',
              transition: 'width 0.1s linear',
            }} />
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: '0.55rem',
            color: 'rgba(126,178,255,0.25)', letterSpacing: '0.2em',
          }}>
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {/* ══ TITLE PHASE ══ */}
      {(phase === 'reveal' || phase === 'ready') && (
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 0, textAlign: 'center',
        }}>

          {/* Top ornament */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32,
            animation: 'fadeUp 0.6s ease 0.1s both',
          }}>
            <div style={{ width: 48, height: 1, background: 'linear-gradient(to right, transparent, rgba(126,178,255,0.35))' }} />
            <div style={{
              fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.35em',
              textTransform: 'uppercase', color: 'rgba(126,178,255,0.4)',
            }}>Visual Novel AI</div>
            <div style={{ width: 48, height: 1, background: 'linear-gradient(to left, transparent, rgba(126,178,255,0.35))' }} />
          </div>

          {/* Character sprite preview (small) */}
          <div style={{
            width: 120, height: 120, marginBottom: 24,
            position: 'relative',
            animation: 'fadeUp 0.7s ease 0.2s both',
          }}>
            <div style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(126,178,255,0.12) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/characters/happy.png"
              alt="Siggy"
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 16px rgba(126,178,255,0.5))',
                animation: 'float 4s ease-in-out infinite',
              }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* Main title */}
          <div style={{ animation: 'fadeUp 0.7s ease 0.3s both', marginBottom: 8 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 10vw, 7.5rem)',
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              lineHeight: 1,
              background: 'linear-gradient(180deg, #ffffff 0%, #a8caff 40%, rgba(126,178,255,0.5) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: glitch
                ? 'drop-shadow(2px 0 0 rgba(255,80,80,0.8)) drop-shadow(-2px 0 0 rgba(80,80,255,0.8))'
                : 'drop-shadow(0 0 40px rgba(126,178,255,0.35))',
              transition: 'filter 0.05s',
              transform: glitch ? 'translateX(2px)' : 'none',
            }}>
              SIGGY
            </h1>
          </div>

          {/* Subtitle */}
          <div style={{ animation: 'fadeUp 0.7s ease 0.45s both', marginBottom: 40 }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.6rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(180,200,240,0.4)',
            }}>
              Your Curious Companion
            </p>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, width: 240,
            animation: 'fadeUp 0.7s ease 0.5s both',
          }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(126,178,255,0.2))' }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(126,178,255,0.4)' }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(126,178,255,0.2)' }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(126,178,255,0.4)' }} />
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(126,178,255,0.2))' }} />
          </div>

          {/* CTA */}
          {phase === 'ready' && (
            <div style={{ animation: 'bounceIn 0.5s cubic-bezier(.34,1.56,.64,1) 0.1s both' }}>
              <button
                onClick={handleStart}
                className="vn-btn"
                style={{ padding: '13px 52px', fontSize: '0.68rem', letterSpacing: '0.2em' }}
              >
                <span>Begin</span>
                <span style={{ marginLeft: 8, display: 'inline-block', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}>›</span>
              </button>
            </div>
          )}

          {/* Bottom links */}
          {phase === 'ready' && (
            <div style={{
              marginTop: 28, display: 'flex', gap: 24, alignItems: 'center',
              animation: 'fadeIn 0.6s ease 0.4s both',
            }}>
              {[['Settings', '/settings']].map(([label, href]) => (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'monospace', fontSize: '0.6rem',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(180,200,240,0.3)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(126,178,255,0.8)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(180,200,240,0.3)')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Version */}
      <div style={{
        position: 'absolute', bottom: 16, right: 20, zIndex: 10,
        fontFamily: 'monospace', fontSize: '0.55rem',
        color: 'rgba(126,178,255,0.15)', letterSpacing: '0.15em',
      }}>
        v0.1.0
      </div>

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 4px)',
      }} />

    </div>
  );
}
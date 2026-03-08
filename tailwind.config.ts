import type { Config } from 'tailwindcss';

// Emotion accent colors — must match CSS variables in globals.css
const EMOTION_COLORS = {
  neutral:   '#7eb2ff',
  happy:     '#f9d74a',
  sad:       '#5b8fd4',
  angry:     '#e04a4a',
  surprised: '#b06ee8',
  thinking:  '#4ec9a8',
};

const config: Config = {
  // ── Content paths ─────────────────────────────────────────
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],

  // ── Theme ─────────────────────────────────────────────────
  theme: {
    extend: {
      // ── Fonts (fed via CSS variables from Google Fonts) ──
      fontFamily: {
        display: ['var(--font-display)', 'Cinzel', 'serif'],
        body:    ['var(--font-body)',    'Crimson Pro', 'Georgia', 'serif'],
        mono:    ['var(--font-mono)',    'Fira Code', 'monospace'],
      },

      // ── Design-token colors (map to CSS variables) ────────
      colors: {
        vn: {
          bg:           'var(--vn-bg)',
          'bg-2':       'var(--vn-bg-2)',
          panel:        'var(--vn-panel)',
          'panel-light':'var(--vn-panel-light)',
          border:       'var(--vn-border)',
          'border-bright': 'var(--vn-border-bright)',
          text:         'var(--vn-text)',
          'text-dim':   'var(--vn-text-dim)',
          'text-faint': 'var(--vn-text-faint)',
          accent:       'var(--vn-accent)',
          'accent-dim': 'var(--vn-accent-dim)',
          glow:         'var(--vn-glow)',
          'glow-strong':'var(--vn-glow-strong)',
        },
        emotion: EMOTION_COLORS,
      },

      // ── Backdrop blur extras ──────────────────────────────
      backdropBlur: {
        xs:  '2px',
        '2xl': '40px',
      },

      // ── Named animations (used as className="animate-*") ──
      animation: {
        // Character / sprite
        'float':        'float 3s ease-in-out infinite',
        'float-slow':   'floatSlow 4s ease-in-out infinite',
        'shake':        'shake 0.45s ease',
        'bounce-in':    'bounceIn 0.4s cubic-bezier(.34,1.56,.64,1) both',
        'emotion-flash':'emotionFlash 0.4s ease both',
        // UI
        'fade-up':      'fadeUp 0.5s ease both',
        'fade-in':      'fadeIn 0.4s ease both',
        'slide-right':  'slideInRight 0.4s ease both',
        'slide-left':   'slideInLeft 0.4s ease both',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'blink':        'blink 1s step-end infinite',
        'shimmer':      'shimmer 3s linear infinite',
        // Typing dots
        'typing-pulse': 'typingPulse 1.4s ease-in-out infinite',
      },

      // ── Keyframe definitions ──────────────────────────────
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%':      { transform: 'translateY(-6px) rotate(1deg)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-5px) rotate(-1deg)' },
          '40%':     { transform: 'translateX(5px) rotate(1deg)' },
          '60%':     { transform: 'translateX(-3px)' },
          '80%':     { transform: 'translateX(3px)' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '60%':  { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        emotionFlash: {
          '0%':   { filter: 'brightness(1.6) saturate(1.8)' },
          '100%': { filter: 'brightness(1)   saturate(1)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 12px var(--vn-glow)' },
          '50%':     { boxShadow: '0 0 28px var(--vn-glow-strong)' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        typingPulse: {
          '0%,60%,100%': { transform: 'translateY(0)',   opacity: '0.4' },
          '30%':          { transform: 'translateY(-5px)', opacity: '1' },
        },
      },

      // ── Spacing extras ────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // ── Max-width extras ──────────────────────────────────
      maxWidth: {
        'chat': '520px',
        'panel': '480px',
      },

      // ── Z-index scale ─────────────────────────────────────
      zIndex: {
        'bg':       '-1',
        'scene':     '1',
        'character': '10',
        'ui':        '20',
        'overlay':   '30',
        'modal':     '40',
        'toast':     '50',
      },
    },
  },

  plugins: [],
};

export default config;

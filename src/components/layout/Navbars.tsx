'use client';
import { useCharacterStore } from '@/stores';

interface SceneBackgroundProps {
  /** Override the glow position. Default: bottom-right (for chat page character area). */
  glowPosition?: string;
}

export default function SceneBackground({ glowPosition = '68% 88%' }: SceneBackgroundProps) {
  const { emotion } = useCharacterStore();

  return (
    <>
      {/* Base gradient — shifts with emotion */}
      <div
        className={`absolute inset-0 vn-scene-bg emotion-${emotion} transition-all duration-1000`}
        style={{ zIndex: 0 }}
      />

      {/* Starfield dots */}
      <div
        className="absolute inset-0 starfield pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Ambient radial glow — tracks emotion color */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          zIndex: 1,
          background: `
            radial-gradient(ellipse 55% 45% at ${glowPosition}, var(--vn-glow) 0%, transparent 60%),
            radial-gradient(ellipse 35% 25% at 4% 4%, rgba(20,30,70,.65) 0%, transparent 55%)
          `,
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: 0.022,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 inset-x-0 pointer-events-none"
        style={{
          zIndex: 2,
          height: 80,
          background: 'linear-gradient(to top, rgba(6,8,15,.65) 0%, transparent 100%)',
        }}
      />
    </>
  );
}
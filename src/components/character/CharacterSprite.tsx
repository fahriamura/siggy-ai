'use client';
import { useEffect } from 'react';
import { useCharacterStore, clearTransition } from '@/stores';
import { CHARACTER } from '@/lib/ai/config';
import type { Emotion } from '@/types';

const EMOTION_GLOW: Record<Emotion, string> = {
  neutral:   'drop-shadow(0 0 20px rgba(126,178,255,0.5))',
  happy:     'drop-shadow(0 0 28px rgba(249,215,74,0.65))',
  sad:       'drop-shadow(0 0 22px rgba(91,143,212,0.55))',
  angry:     'drop-shadow(0 0 30px rgba(224,74,74,0.7))',
  surprised: 'drop-shadow(0 0 26px rgba(176,110,232,0.6))',
  thinking:  'drop-shadow(0 0 22px rgba(78,201,168,0.55))',
};

const EMOTION_ANIM: Record<Emotion, string> = {
  neutral:   'floatSlow 5s ease-in-out infinite',
  happy:     'float 2.5s ease-in-out infinite',
  sad:       'floatSlow 6s ease-in-out infinite',
  angry:     'shake 0.6s ease 3',
  surprised: 'bounceIn 0.4s ease both',
  thinking:  'floatSlow 4s ease-in-out infinite',
};

export default function CharacterSprite() {
  const { emotion, isTransitioning } = useCharacterStore();

  useEffect(() => {
    if (isTransitioning) {
      const t = setTimeout(clearTransition, 400);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

  const spriteSrc = CHARACTER.sprites[emotion];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={spriteSrc}
        alt={emotion}
        style={{
          height: '100%',
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'bottom',
          display: 'block',
          animation: isTransitioning ? undefined : EMOTION_ANIM[emotion],
          filter: isTransitioning
            ? 'brightness(1.5) saturate(1.6)'
            : EMOTION_GLOW[emotion],
          transition: 'filter 0.5s ease',
          transform: emotion === 'happy' ? 'scale(1.03)' : emotion === 'surprised' ? 'scale(1.05)' : 'scale(1)',
        }}
      />
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { sfx } from '@/lib/sfx/manager';
import { useVNChat } from '@/hooks/useChat';
import { useCharacterStore } from '@/stores';
import { useSettingsStore } from '@/stores';
import { CHARACTER } from '@/lib/ai/config';
import VNDialogBox from '@/components/vn/vndialogboxes';
import VNTopBar    from '@/components/vn/vntopbars';
import VNHistory   from '@/components/vn/vnhistories';

const CharacterSprite = dynamic(
  () => import('@/components/character/CharacterSprite'),
  { ssr: false }
);

const EMOTION_GLOW: Record<string, string> = {
  neutral:   'rgba(126,178,255,0.15)',
  happy:     'rgba(249,215,74,0.2)',
  sad:       'rgba(91,143,212,0.18)',
  angry:     'rgba(224,74,74,0.2)',
  surprised: 'rgba(176,110,232,0.2)',
  thinking:  'rgba(78,201,168,0.18)',
};

export default function ChatPage() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bgLoaded, setBgLoaded]       = useState(false);
  const { emotion } = useCharacterStore();
  const settings = useSettingsStore();

  const { response, inputMode, isLoading, isStreaming, sendMessage, onDialogDone } = useVNChat();

  // Initialize SFX immediately
  useEffect(() => {
    sfx.init();
  }, []);
  
  // Apply SFX volume settings
  useEffect(() => {
    sfx.configure(settings.sfxEnabled, settings.sfxVolume);
  }, [settings.sfxEnabled, settings.sfxVolume]);
  
  // Apply BGM settings - trigger with a small delay to ensure initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      sfx.playBgMusic(settings.bgMusicEnabled, settings.bgMusicVolume);
    }, 300);
    return () => clearTimeout(timer);
  }, [settings.bgMusicEnabled, settings.bgMusicVolume]);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/background.jpg';
    img.onload  = () => setBgLoaded(true);
    img.onerror = () => setBgLoaded(false);
  }, []);

  const glow = EMOTION_GLOW[emotion] ?? EMOTION_GLOW.neutral;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }}>

      {/* ── Background ── */}
      {bgLoaded ? (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.55)',
          }} />
        </div>
      ) : (
        <>
          <div style={{ position: 'absolute', inset: 0, background: '#04060c', zIndex: 0 }} />
          <div className="starfield" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
        </>
      )}

      {/* ── Emotion ambient glow ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: `radial-gradient(ellipse 55% 50% at 60% 90%, ${glow} 0%, transparent 65%)`,
        transition: 'background 1s ease',
        pointerEvents: 'none',
      }} />

      {/* ── Top bar ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <VNTopBar onHistoryOpen={() => setHistoryOpen(true)} />
      </div>

      {/* ── Character sprite ── */}
      <div style={{
        position: 'absolute',
        bottom: 142,
        left: '50%',
        transform: 'translateX(-20%)',
        height: '70vh',
        maxHeight: 580,
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <CharacterSprite />
      </div>

      {/* ── Dialog box ── */}
      <VNDialogBox
        speakerName={CHARACTER.name}
        response={response}
        isLoading={isLoading || (isStreaming && !response)}
        onAdvance={onDialogDone}
        inputMode={inputMode}
        onSend={sendMessage}
        disabled={isStreaming || isLoading}
        emotion={emotion}
      />

      {/* ── History panel ── */}
      <VNHistory open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
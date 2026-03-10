'use client';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/stores';
import type { ChatSettings } from '@/types';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="vn-toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider" />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="vn-subtitle">{title}</div>
        <div className="flex-1 h-px" style={{ background: 'var(--vn-border)' }} />
      </div>
      <div className="space-y-3 pl-1">{children}</div>
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-2"
      style={{ borderBottom: '1px solid rgba(120,150,220,0.07)' }}
    >
      <div>
        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--vn-text)', fontSize: '1rem' }}>{label}</div>
        {description && (
          <div className="vn-label mt-0.5 opacity-40 normal-case" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            {description}
          </div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const settings = useSettingsStore();
  const { set } = settings;

  const textSpeedOptions: ChatSettings['textSpeed'][] = ['slow', 'normal', 'fast', 'instant'];

  return (
    <div className="w-screen h-screen overflow-hidden vn-scene-bg starfield flex items-center justify-center">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(126,178,255,0.06) 0%, transparent 70%)' }}
      />

      {/* Panel */}
      <div
        className="relative vn-glass vn-glow-box rounded-xl w-full max-w-lg mx-4 flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}
      >
        {/* Corners decoration */}
        <div className="vn-corners" />

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--vn-border)' }}
        >
          <button
            onClick={() => router.back()}
            className="vn-label opacity-40 hover:opacity-80 transition-opacity"
          >
            ‹ Back
          </button>
          <div className="flex-1" />
          <h1 className="vn-title text-sm">Settings</h1>
          <div className="flex-1" />
          <div style={{ width: 40 }} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto vn-scroll px-6 py-5 space-y-8">

          {/* ── Audio ── */}
          <Section title="Audio">
            <Row label="Sound Effects" description="Emotion transitions, UI sounds">
              <Toggle checked={settings.sfxEnabled} onChange={() => set({ sfxEnabled: !settings.sfxEnabled })} />
            </Row>

            <Row label="SFX Volume">
              <div className="flex items-center gap-3 w-48">
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={settings.sfxVolume}
                  onChange={(e) => set({ sfxVolume: parseFloat(e.target.value) })}
                  disabled={!settings.sfxEnabled}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                />
                <span className="vn-label w-8 text-right">{Math.round(settings.sfxVolume * 100)}</span>
              </div>
            </Row>

            <Row label="Typing Sounds" description="Typewriter SFX while Siggy responds">
              <Toggle checked={settings.typingSfxEnabled} onChange={() => set({ typingSfxEnabled: !settings.typingSfxEnabled })} />
            </Row>

            <Row label="Background Music">
              <Toggle checked={settings.bgMusicEnabled} onChange={() => set({ bgMusicEnabled: !settings.bgMusicEnabled })} />
            </Row>

            <Row label="BGM Volume">
              <div className="flex items-center gap-3 w-48">
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={settings.bgMusicVolume}
                  onChange={(e) => set({ bgMusicVolume: parseFloat(e.target.value) })}
                  disabled={!settings.bgMusicEnabled}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                />
                <span className="vn-label w-8 text-right">{Math.round(settings.bgMusicVolume * 100)}</span>
              </div>
            </Row>
          </Section>

          {/* ── Visuals ── */}
          <Section title="Text & Display">
            <Row label="Text Speed" description="How fast Siggy's text appears">
              <div className="flex gap-1">
                {textSpeedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => set({ textSpeed: speed })}
                    className="vn-label capitalize px-3 py-1 rounded transition-all"
                    style={{
                      background: settings.textSpeed === speed ? 'var(--vn-accent)' : 'transparent',
                      color: settings.textSpeed === speed ? 'var(--vn-bg)' : 'var(--vn-text-dim)',
                      border: `1px solid ${settings.textSpeed === speed ? 'var(--vn-accent)' : 'var(--vn-border)'}`,
                    }}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Show Timestamps">
              <Toggle checked={settings.showTimestamps} onChange={() => set({ showTimestamps: !settings.showTimestamps })} />
            </Row>
          </Section>

          {/* ── About ── */}
          <Section title="About">
            <div
              className="rounded-lg p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--vn-border)' }}
            >
              <div style={{ fontFamily: 'var(--font-body)', color: 'var(--vn-text)', fontSize: '0.95rem', fontWeight: 500 }}>
                Harmonic Siggy - Interactive Visual AI
              </div>
              
              {/* Credits with Twitter links */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="vn-label opacity-50 normal-case" style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                    Made by Absol
                  </div>
                  <a
                    href="https://x.com/jelenemae"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-40 hover:opacity-100 transition-opacity"
                    title="Follow Absol on Twitter"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--vn-text)' }}>
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9 0 11-4s1-6.08 0-7.5a4.5 4.5 0 00-.5-1.5z"/>
                    </svg>
                  </a>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="vn-label opacity-50 normal-case" style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                    Assets by Celine
                  </div>
                  <a
                    href="https://x.com/celinemamboo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-40 hover:opacity-100 transition-opacity"
                    title="Follow Celine on Twitter"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--vn-text)' }}>
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9 0 11-4s1-6.08 0-7.5a4.5 4.5 0 00-.5-1.5z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="vn-label opacity-30 normal-case" style={{ letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                Built with Next.js & OpenAI API
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4" style={{ borderTop: '1px solid var(--vn-border)' }}>
          <button onClick={() => router.push('/chat')} className="vn-btn w-full">
            Save &amp; Return to Story
          </button>
        </div>
      </div>
    </div>
  );
}
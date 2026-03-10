/**
 * SFX Manager (singleton)
 * Uses Howler.js — lazy-loaded to avoid SSR crashes.
 */
import type { Emotion } from '@/types';

type HowlInstance = {
  play: () => number;
  stop: (id?: number) => void;
  volume: (v?: number) => number | void;
};

type HowlCtor = new (opts: {
  src: string[];
  volume?: number;
  preload?: boolean;
  loop?: boolean;
  html5?: boolean;
}) => HowlInstance;

let HowlClass: HowlCtor | null = null;

async function getHowl(): Promise<HowlCtor> {
  if (!HowlClass) {
    const mod = await import('howler');
    HowlClass = mod.Howl as unknown as HowlCtor;
  }
  return HowlClass;
}

// ── Audio file paths (place your files here) ──────────────────
const EMOTION_SFX: Record<Emotion, string> = {
  neutral:   '/sfx/emotions/neutral.mp3',
  happy:     '/sfx/emotions/happy.mp3',
  sad:       '/sfx/emotions/sad.mp3',
  angry:     '/sfx/emotions/angry.mp3',
  surprised: '/sfx/emotions/surprised.mp3',
  thinking:  '/sfx/emotions/thinking.mp3',
};

const TYPING_SFX = [
  '/sfx/typing/type-01.mp3',
  '/sfx/typing/type-02.mp3',
  '/sfx/typing/type-03.mp3',
];

const UI_SFX = {
  sent:     '/sfx/ui/sent.mp3',
  received: '/sfx/ui/received.mp3',
  click:    '/sfx/ui/click.mp3',
  hover:    '/sfx/ui/hover.mp3',
  open:     '/sfx/ui/open.mp3',
};

const BG_MUSIC = '/sfx/background/background.mp3';

class SFXManager {
  private ready = false;
  private enabled = true;
  private volume = 0.55;
  // keep only file paths here; the actual Howl objects are created lazily when
  // first requested, which saves memory if a user never triggers certain sounds.
  private emotionPool: Partial<Record<Emotion, HowlInstance>> = {};
  private uiPool: Partial<Record<keyof typeof UI_SFX, HowlInstance>> = {};
  private typingPool: HowlInstance[] = [];
  private typingIdx = 0;
  private typingTimer: ReturnType<typeof setInterval> | null = null;
  private typingPlaybackId: number | null = null;
  private bgMusic: HowlInstance | null = null;
  private bgMusicPlaying: boolean = false;

  async init() {
    if (this.ready || typeof window === 'undefined') return;
    const Howl = await getHowl();
    this.ready = true;
    // do NOT preload all sounds here; use lazy initialization in play* methods
  }

  configure(enabled: boolean, volume: number) {
    this.enabled = enabled;
    this.volume = volume;
  }

  configureBgMusic(enabled: boolean, volume: number) {
    if (!this.bgMusic) return;
    if (enabled) {
      this.bgMusic.volume(volume);
      this.bgMusic.play();
    } else {
      this.bgMusic.stop();
    }
  }

  playEmotion(e: Emotion) {
    if (!this.enabled || !this.ready) return;
    // construction is async; we don't want callers to await so use promise.
    getHowl()
      .then((Howl) => {
        if (!this.emotionPool[e]) {
          this.emotionPool[e] = new Howl({ src: [EMOTION_SFX[e]], volume: this.volume * 0.75, preload: true });
        }
        this.emotionPool[e]?.play();
      })
      .catch(() => {});
  }

  playUI(k: keyof typeof UI_SFX) {
    if (!this.enabled || !this.ready) return;
    getHowl()
      .then((Howl) => {
        if (!this.uiPool[k]) {
          this.uiPool[k] = new Howl({ src: [UI_SFX[k]], volume: this.volume * 0.4, preload: true });
        }
        this.uiPool[k]?.play();
      })
      .catch(() => {});
  }

  startTyping(ms = 75) {
    if (!this.enabled || !this.ready || this.typingTimer) {
      return;
    }
    // Stop any previously playing typing sound
    this.stopTyping();
    // Reset index for new typing sequence
    this.typingIdx = 0;
    // build typing pool lazily if necessary (async)
    const makePool = () => {
      if (this.typingPool.length === 0) {
        return getHowl().then((Howl) => {
          for (const src of TYPING_SFX) {
            this.typingPool.push(new Howl({ src: [src], volume: this.volume * 0.7, preload: true, loop: false }));
          }
        });
      }
      return Promise.resolve();
    };
    makePool().finally(() => {
      this.typingTimer = setInterval(() => {
        const s = this.typingPool[this.typingIdx % this.typingPool.length];
        this.typingPlaybackId = s?.play() ?? null;
        this.typingIdx++;
      }, ms);
    });
  }

  stopTyping() {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
    // Stop all typing sounds
    for (let i = 0; i < this.typingPool.length; i++) {
      const sound = this.typingPool[i];
      sound?.stop();
    }
    this.typingPlaybackId = null;
  }

  async playBgMusic(enabled: boolean = true, volume: number = 0.25) {
    if (!this.ready || typeof window === 'undefined') return;
    
    if (!this.bgMusic) {
      const Howl = await getHowl();
      this.bgMusic = new Howl({
        src: [BG_MUSIC],
        volume: volume * 0.4,
        loop: true,
        preload: true,
        html5: true,
      });
    }
    
    const targetVolume = volume * 0.4;
    
    if (enabled && !this.bgMusicPlaying) {
      // Only play if not already playing
      this.bgMusic.volume(targetVolume);
      this.bgMusic.play();
      this.bgMusicPlaying = true;
    } else if (enabled && this.bgMusicPlaying) {
      // Already playing, just update volume
      this.bgMusic.volume(targetVolume);
    } else if (!enabled && this.bgMusicPlaying) {
      // Stop if was playing
      this.bgMusic.stop();
      this.bgMusicPlaying = false;
    }
  }

  stopBgMusic() {
    if (this.bgMusic && this.bgMusicPlaying) {
      this.bgMusic.stop();
      this.bgMusicPlaying = false;
    }
  }
}

export const sfx = new SFXManager();
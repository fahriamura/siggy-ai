import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { Emotion, Message, ChatSettings } from '@/types';

// ─── Character Store ────────────────────────────────────────────
interface CharacterStore {
  emotion: Emotion;
  prevEmotion: Emotion;
  isTyping: boolean;
  isTransitioning: boolean;
  setEmotion: (e: Emotion) => void;
  setTyping: (v: boolean) => void;
}

export const useCharacterStore = create<CharacterStore>()(
  subscribeWithSelector((set) => ({
    emotion: 'neutral',
    prevEmotion: 'neutral',
    isTyping: false,
    isTransitioning: false,

    setEmotion: (emotion) =>
      set((s) => {
        if (s.emotion === emotion) return {};
        return { prevEmotion: s.emotion, isTransitioning: true, emotion };
      }),

    setTyping: (isTyping) => set({ isTyping }),
  }))
);

// clear transitioning after animation completes (called from component)
export function clearTransition() {
  useCharacterStore.setState({ isTransitioning: false });
}

// ─── Chat Store ─────────────────────────────────────────────────
interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Message;
  updateLastAssistant: (content: string) => void;
  setStreaming: (v: boolean) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [],
  isStreaming: false,

  addMessage: (msg) => {
    const newMsg: Message = { ...msg, id: crypto.randomUUID(), timestamp: new Date() };
    set((s) => {
      // limit history size to avoid unbounded growth in long sessions
      // (memory had been creeping up to multiple gigabytes when users
      // left the page open for hours and thousands of chat turns stacked up).
      const MAX_HISTORY = 100;
      const msgs = [...s.messages, newMsg];
      if (msgs.length > MAX_HISTORY) msgs.splice(0, msgs.length - MAX_HISTORY);
      return { messages: msgs };
    });
    return newMsg;
  },

  updateLastAssistant: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      const idx = msgs.findLastIndex((m) => m.role === 'assistant');
      if (idx !== -1) msgs[idx] = { ...msgs[idx], content };
      return { messages: msgs };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),
  clearHistory: () => set({ messages: [] }),
}));

// ─── Settings Store ──────────────────────────────────────────────
interface SettingsStore extends ChatSettings {
  set: (patch: Partial<ChatSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      sfxEnabled: true,
      sfxVolume: 0.55,
      typingSfxEnabled: true,
      bgMusicEnabled: false,
      bgMusicVolume: 0.25,
      textSpeed: 'normal',
      autoScroll: true,
      showTimestamps: false,
      set: (patch) => set(patch),
    }),
    { name: 'vn-settings' }
  )
);
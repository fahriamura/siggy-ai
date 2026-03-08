// ================================================================
//  types/index.ts
//  Central type definitions for Visual Novel AI Chat
//  Import from here: import type { Emotion, Message, ... } from '@/types'
// ================================================================

// ────────────────────────────────────────────────────────────────
//  SECTION 1 — EMOTION
//  The six expressive states Aria can inhabit.
//  Used by: stores, sentiment analyzer, CharacterSprite,
//           SFXManager, ChatPage, GalleryPage, API route.
// ────────────────────────────────────────────────────────────────

/** All possible emotional states of the AI character. */
export type Emotion =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'thinking';

/** Convenience array — iterate all emotions without hardcoding. */
export const EMOTIONS: Emotion[] = [
  'neutral',
  'happy',
  'sad',
  'angry',
  'surprised',
  'thinking',
];

/** Emotions that are NOT neutral — used for sentiment keyword maps. */
export type ActiveEmotion = Exclude<Emotion, 'neutral'>;

/** Display metadata for each emotion (used in GalleryPage). */
export interface EmotionMeta {
  key: Emotion;
  /** Human-readable label shown in the Gallery. e.g. "Radiant" */
  label: string;
  /** Poetic one-liner shown below the sprite. */
  description: string;
  /** Hex accent color for this emotion, e.g. "#f9d74a". */
  color: string;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 2 — CHAT / MESSAGES
//  Core messaging primitives consumed by useChatStore and
//  all chat UI components.
// ────────────────────────────────────────────────────────────────

/** A single turn in the conversation. */
export interface Message {
  /** Unique ID — generated with crypto.randomUUID(). */
  id: string;
  /** Who sent this message. */
  role: MessageRole;
  /** Plain text content. May be empty string while streaming. */
  content: string;
  /**
   * Emotion detected at the time the message was sent/received.
   * Optional — only set after sentiment analysis completes.
   */
  emotion?: Emotion;
  /** Wall-clock time when the message was added to the store. */
  timestamp: Date;
}

/** Possible senders of a message. */
export type MessageRole = 'user' | 'assistant';

/**
 * The shape sent to /api/chat.
 * Stripped of UI-only fields (id, timestamp, emotion).
 */
export interface ChatAPIMessage {
  role: MessageRole;
  content: string;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 3 — SSE STREAM EVENTS
//  Parsed from the text/event-stream returned by /api/chat.
// ────────────────────────────────────────────────────────────────

/** Discriminated union of all SSE data payloads sent by the API. */
export type StreamEvent =
  | StreamEmotionEvent
  | StreamTextEvent
  | StreamDoneEvent
  | StreamErrorEvent;

/** Emitted first — tells the client which emotion to display. */
export interface StreamEmotionEvent {
  type: 'emotion';
  emotion: Emotion;
}

/** One incremental text delta from the model. */
export interface StreamTextEvent {
  type: 'text';
  text: string;
}

/** Signals that the full response has been received. */
export interface StreamDoneEvent {
  type: 'done';
}

/** Signals a server-side streaming error. */
export interface StreamErrorEvent {
  type: 'error';
  message: string;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 4 — CHARACTER
//  Static config for the AI character and her sprites.
//  Defined once in lib/ai/config.ts, read everywhere else.
// ────────────────────────────────────────────────────────────────

/** Full character configuration object. */
export interface CharacterConfig {
  /** Display name, e.g. "Aria". */
  name: string;
  /** Short poetic title shown in the UI, e.g. "The Ethereal Companion". */
  title: string;
  /** One-sentence description used in about screens. */
  description: string;
  /**
   * System prompt injected into every Anthropic API call.
   * Controls personality, speech style, and response length.
   */
  systemPrompt: string;
  /**
   * Map of emotion → absolute public path to the PNG sprite.
   * e.g. { happy: '/characters/happy.png' }
   */
  sprites: Record<Emotion, string>;
  /**
   * Default hex accent color for this character.
   * Overridden per-emotion by CSS variables at runtime.
   */
  color: string;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 5 — CHARACTER STATE
//  Runtime state managed by useCharacterStore in Zustand.
// ────────────────────────────────────────────────────────────────

/** Snapshot of the character's visual/animation state. */
export interface CharacterState {
  /** Currently displayed emotion. */
  emotion: Emotion;
  /** Emotion before the last transition — used for reverse animations. */
  prevEmotion: Emotion;
  /** True while the AI is streaming a reply (drives typing indicator). */
  isTyping: boolean;
  /**
   * True during the brief flash that plays between two emotion states.
   * Components use this to trigger CSS re-mount animations.
   */
  isTransitioning: boolean;
}

/** Actions available on useCharacterStore. */
export interface CharacterActions {
  setEmotion: (emotion: Emotion) => void;
  setTyping: (isTyping: boolean) => void;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 6 — CHAT STATE
//  Runtime state managed by useChatStore in Zustand.
// ────────────────────────────────────────────────────────────────

/** Snapshot of the conversation state. */
export interface ChatState {
  messages: Message[];
  /** True while an API response is actively streaming. */
  isStreaming: boolean;
}

/** Actions available on useChatStore. */
export interface ChatActions {
  /**
   * Appends a new message and returns it.
   * id and timestamp are generated automatically.
   */
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Message;
  /** Replaces the content of the most recent assistant message. */
  updateLastAssistant: (content: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  clearHistory: () => void;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 7 — SETTINGS
//  Persisted user preferences managed by useSettingsStore.
// ────────────────────────────────────────────────────────────────

/**
 * How fast the assistant's text is revealed character-by-character.
 * 'instant' skips the typewriter effect entirely.
 */
export type TextSpeed = 'slow' | 'normal' | 'fast' | 'instant';

/** All persisted user-facing settings. */
export interface ChatSettings {
  // ── Audio ────────────────────────────────────────────────────
  /** Master on/off for all sound effects. */
  sfxEnabled: boolean;
  /** Master volume for all SFX, 0–1. */
  sfxVolume: number;
  /** Whether the typewriter typing SFX plays during streaming. */
  typingSfxEnabled: boolean;
  /** Whether looping background music is enabled. */
  bgMusicEnabled: boolean;
  /** Volume for background music, 0–1. */
  bgMusicVolume: number;

  // ── Text & Display ───────────────────────────────────────────
  /** How fast assistant text is revealed in the chat bubble. */
  textSpeed: TextSpeed;
  /** Whether the chat panel automatically scrolls to new messages. */
  autoScroll: boolean;
  /** Whether to show HH:MM timestamps beneath each bubble. */
  showTimestamps: boolean;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 8 — SFX
//  Type contracts for the SFX manager singleton.
// ────────────────────────────────────────────────────────────────

/** All named UI sound effect keys. */
export type UISfxKey = 'sent' | 'received' | 'click' | 'hover' | 'open';

/** Public interface of the SFXManager class in lib/sfx/manager.ts. */
export interface ISFXManager {
  /** Lazy-initialises Howler and pre-loads all audio pools. */
  init(): Promise<void>;
  /** Updates master volume and enabled state. */
  configure(enabled: boolean, volume: number): void;
  /** Plays the short jingle for a given emotion transition. */
  playEmotion(emotion: Emotion): void;
  /** Plays a UI interaction sound. */
  playUI(key: UISfxKey): void;
  /** Starts the looping typewriter SFX at the given interval (ms). */
  startTyping(intervalMs?: number): void;
  /** Stops the looping typewriter SFX. */
  stopTyping(): void;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 9 — SENTIMENT
//  Types used by lib/sentiment/analyzer.ts.
// ────────────────────────────────────────────────────────────────

/** A scored sentiment result from a single text analysis pass. */
export interface SentimentResult {
  /** The dominant emotion detected, or 'neutral' if inconclusive. */
  emotion: Emotion;
  /**
   * Confidence score 0–N (raw keyword hit count).
   * Values ≥ 2 are considered a confident match.
   */
  score: number;
}

/**
 * A lightweight chat message accepted by analyzeConversation.
 * Intentionally looser than Message — avoids coupling the
 * analyzer to the full store shape.
 */
export interface ConversationTurn {
  role: string;
  content: string;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 10 — UI COMPONENT PROPS
//  Shared prop types used across multiple components.
// ────────────────────────────────────────────────────────────────

/** Props for any component that renders a single Message. */
export interface MessageBubbleProps {
  message: Message;
  /** Whether this is the latest message (used for scroll anchoring). */
  isLatest?: boolean;
}

/** Props for the chat input bar. */
export interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

/** Props for the emotion aura glow rendered behind the character. */
export interface EmotionAuraProps {
  emotion: Emotion;
}

// ────────────────────────────────────────────────────────────────
//  SECTION 11 — UTILITY / HELPER TYPES
//  Generic helpers used throughout the project.
// ────────────────────────────────────────────────────────────────

/**
 * Makes every key in T required AND non-nullable.
 * Useful for asserting that a loaded config is complete.
 */
export type Complete<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

/**
 * A Record keyed by Emotion with values of type V.
 * Alias for Record<Emotion, V> with a more descriptive name.
 */
export type EmotionMap<V> = Record<Emotion, V>;

/**
 * Extracts the resolved type from a Promise.
 * e.g. Awaited<Promise<string>> → string
 * (Re-exported for convenience — also built into TS 4.5+.)
 */

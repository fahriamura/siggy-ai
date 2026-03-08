'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatStore, useCharacterStore, useSettingsStore } from '@/stores';
import { analyzeSentiment } from '@/lib/sentiment/analyzer';
import { sfx } from '@/lib/sfx/manager';
import type { Emotion } from '@/types';

export function useVNChat() {
  const { messages, addMessage, updateLastAssistant, setStreaming, isStreaming } = useChatStore();
  const { setEmotion, setTyping } = useCharacterStore();
  const settings = useSettingsStore();

  const [response, setResponse] = useState<{ text: string; id: number } | null>(null);
  const [inputMode, setInputMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const responseCountRef = useRef(0);
  const emotionRef = useRef<Emotion>('neutral');

  useEffect(() => { sfx.init(); }, []);
  useEffect(() => {
    sfx.configure(settings.sfxEnabled, settings.sfxVolume);
  }, [settings.sfxEnabled, settings.sfxVolume]);

  const onDialogDone = useCallback(() => {
    setInputMode(true);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming || isLoading) return;

    addMessage({ role: 'user', content });
    sfx.playUI('sent');
    setInputMode(false);
    setResponse(null);
    setIsLoading(true);
    setStreaming(true);
    setTyping(true);

    const history = [...messages, { role: 'user', content }]
      .map(m => ({ role: m.role, content: m.content }));

    addMessage({ role: 'assistant', content: '' });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        for (const line of chunk.split('\n\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'emotion') {
              emotionRef.current = data.emotion as Emotion;
              setEmotion(data.emotion as Emotion);
            } else if (data.type === 'text') {
              full += data.text;
            }
          } catch { /* ignore */ }
        }
      }

      const detectedEmotion = analyzeSentiment(full);
      if (detectedEmotion !== 'neutral') setEmotion(detectedEmotion);

      updateLastAssistant(full);
      sfx.playUI('received');

      // Set response sebagai objek baru — SELALU trigger useEffect di VNDialogBox
      responseCountRef.current += 1;
      setResponse({ text: full, id: responseCountRef.current });

    } catch {
      const errText = 'Something went wrong. Please try again.';
      updateLastAssistant(errText);
      responseCountRef.current += 1;
      setResponse({ text: errText, id: responseCountRef.current });
    } finally {
      setIsLoading(false);
      setStreaming(false);
      setTyping(false);
    }
  }, [messages, isStreaming, isLoading, addMessage, updateLastAssistant, setStreaming, setEmotion, setTyping]);

  return { messages, response, inputMode, isLoading, isStreaming, sendMessage, onDialogDone };
}

export function useAutoScroll(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [dep]);
  return ref;
}

export const useChat = useVNChat;
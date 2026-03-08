/**
 * POST /api/chat
 *
 * Streaming chat endpoint using the OpenAI SDK.
 * Returns a text/event-stream (SSE) with the following event types:
 *
 *   { type: 'emotion',  emotion: Emotion }          — emitted first
 *   { type: 'text',     text: string }              — streamed deltas
 *   { type: 'done' }                                — stream complete
 *   { type: 'error',    message: string }           — on failure
 */

import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { analyzeConversation } from '@/lib/sentiment/analyzer';
import { CHARACTER } from '@/lib/ai/config';
import type { ChatAPIMessage, Emotion, StreamEvent } from '@/types';

// ── Node.js runtime — required to read .env.local variables ──
export const runtime = 'nodejs';

// ── OpenAI client ─────────────────────────────────────────────
console.log('KEY length:', process.env.OPENAI_API_KEY?.length);
console.log('KEY starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-'));
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set!');
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
});

// ── Constants ─────────────────────────────────────────────────
const MODEL       = process.env.OPENAI_MODEL      ?? 'gpt-4o-mini';
const MAX_HISTORY = 20;

// ── Request body schema ───────────────────────────────────────
interface RequestBody {
  messages: ChatAPIMessage[];
}

// ── Helpers ───────────────────────────────────────────────────
function encodeSSE(event: StreamEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

function validateMessages(raw: unknown): ChatAPIMessage[] {
  if (!Array.isArray(raw)) throw new Error('messages must be an array');
  if (raw.length === 0)    throw new Error('messages array is empty');

  return raw.map((m, i) => {
    if (typeof m !== 'object' || m === null)
      throw new Error(`messages[${i}] is not an object`);
    const msg = m as Record<string, unknown>;
    if (msg.role !== 'user' && msg.role !== 'assistant')
      throw new Error(`messages[${i}].role must be "user" or "assistant"`);
    if (typeof msg.content !== 'string')
      throw new Error(`messages[${i}].content must be a string`);
    return { role: msg.role, content: msg.content };
  });
}

// ── Route handler ─────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<Response> {
  // ── 1. Parse & validate ──────────────────────────────────────
  let messages: ChatAPIMessage[];
  try {
    const body = (await req.json()) as RequestBody;
    messages = validateMessages(body.messages);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Bad request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ── 2. Trim history ──────────────────────────────────────────
  const trimmed = messages.slice(-MAX_HISTORY);

  // ── 3. Detect emotion ────────────────────────────────────────
  const emotion: Emotion = analyzeConversation(trimmed);

  // ── 4. Build SSE stream ──────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      const push = (event: StreamEvent) =>
        controller.enqueue(encodeSSE(event));

      // Emit emotion first so sprite updates before text arrives
      push({ type: 'emotion', emotion });
      console.log('Emotion emitted:', emotion);

      try {
        console.log('Calling OpenAI with model:', MODEL);
        const openaiStream = await openai.chat.completions.create({
          model:      MODEL,
          stream:     true,
          messages: [
            // System prompt as first message
            { role: 'system', content: CHARACTER.systemPrompt },
            // Conversation history
            ...trimmed.map(m => ({
              role:    m.role as 'user' | 'assistant',
              content: m.content,
            })),
          ],
        });

        // Stream text deltas
        for await (const chunk of openaiStream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) push({ type: 'text', text: delta });
        }

        push({ type: 'done' });

      } catch (err) {
        console.error('OpenAI Error:', err);
        const message = err instanceof Error ? err.message : 'Stream error';
        push({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  // ── 5. Return SSE response ───────────────────────────────────
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type':  'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-cache',
      'Connection':    'keep-alive',
      'X-Emotion':     emotion,
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ── OPTIONS — preflight for CORS ─────────────────────────────
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
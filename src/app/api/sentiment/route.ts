/**
 * POST /api/sentiment
 *
 * Standalone sentiment analysis endpoint.
 * Accepts a text string or array of conversation turns and returns
 * the detected emotion plus confidence score.
 *
 * Request body (either form):
 *   { text: string }
 *   { messages: { role: string; content: string }[] }
 *
 * Response:
 *   { emotion: Emotion; score: number; label: string }
 *
 * This endpoint exists so the client can:
 *   1. Pre-detect emotion while typing (debounced)
 *   2. Analyse pasted/uploaded text outside of a live chat turn
 *   3. Be called independently of /api/chat for testing
 *
 * It runs on the Node.js runtime (not Edge) because it is
 * CPU-bound and does not need streaming.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment, analyzeConversation } from '@/lib/sentiment/analyzer';
import type { Emotion, ConversationTurn, SentimentResult } from '@/types';

// ── Runtime ───────────────────────────────────────────────────
export const runtime = 'nodejs';

// ── Emotion display metadata sent with every response ─────────
const EMOTION_META: Record<Emotion, { label: string; color: string }> = {
  neutral:   { label: 'Serene',          color: '#7eb2ff' },
  happy:     { label: 'Radiant',         color: '#f9d74a' },
  sad:       { label: 'Wistful',         color: '#5b8fd4' },
  angry:     { label: 'Aflame',          color: '#e04a4a' },
  surprised: { label: 'Awakened',        color: '#b06ee8' },
  thinking:  { label: 'Contemplative',   color: '#4ec9a8' },
};

// ── Request body schema ───────────────────────────────────────
interface TextBody {
  text: string;
}

interface MessagesBody {
  messages: ConversationTurn[];
  lookback?: number;
}

type RequestBody = TextBody | MessagesBody;

function isTextBody(b: RequestBody): b is TextBody {
  return 'text' in b && typeof (b as TextBody).text === 'string';
}

function isMessagesBody(b: RequestBody): b is MessagesBody {
  return 'messages' in b && Array.isArray((b as MessagesBody).messages);
}

// ── Route handler ─────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Parse body ────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // ── 2. Run sentiment analysis ─────────────────────────────────
  let result: SentimentResult;

  if (isTextBody(body)) {
    if (!body.text.trim()) {
      return NextResponse.json(
        { error: '"text" must be a non-empty string' },
        { status: 422 }
      );
    }
    const emotion = analyzeSentiment(body.text);
    // score is conceptual here — keyword analyzer returns binary-ish values
    result = { emotion, score: emotion === 'neutral' ? 0 : 2 };

  } else if (isMessagesBody(body)) {
    if (body.messages.length === 0) {
      return NextResponse.json(
        { error: '"messages" array must not be empty' },
        { status: 422 }
      );
    }
    const lookback = typeof body.lookback === 'number' ? body.lookback : 4;
    const emotion  = analyzeConversation(body.messages, lookback);
    result = { emotion, score: emotion === 'neutral' ? 0 : 2 };

  } else {
    return NextResponse.json(
      { error: 'Body must include either "text" (string) or "messages" (array)' },
      { status: 422 }
    );
  }

  // ── 3. Build response ─────────────────────────────────────────
  const meta = EMOTION_META[result.emotion];

  return NextResponse.json(
    {
      emotion:  result.emotion,
      score:    result.score,
      label:    meta.label,
      color:    meta.color,
    },
    {
      status: 200,
      headers: {
        'Cache-Control':                'no-store',
        'Access-Control-Allow-Origin':  '*',
      },
    }
  );
}

// ── GET — health / test endpoint ─────────────────────────────
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok:       true,
      endpoint: 'POST /api/sentiment',
      accepts:  ['{ text: string }', '{ messages: ConversationTurn[], lookback?: number }'],
      emotions: Object.keys(EMOTION_META),
    },
    { status: 200 }
  );
}

// ── OPTIONS — CORS preflight ──────────────────────────────────
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
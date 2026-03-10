import { readFileSync } from 'fs';
import { join } from 'path';

let cachedKnowledge: string | null = null;

/**
 * Load knowledge base from knowledge.txt
 * Cached in memory to avoid repeated file reads
 */
export function loadKnowledge(): string {
  if (cachedKnowledge) {
    return cachedKnowledge;
  }

  try {
    const knowledgePath = join(process.cwd(), 'src/lib/knowledge.txt');
    cachedKnowledge = readFileSync(knowledgePath, 'utf-8');
    return cachedKnowledge;
  } catch {
    return '';
  }
}

/**
 * Build enhanced system prompt with knowledge base
 * Integrates knowledge.txt content into the character system prompt
 */
export function buildEnhancedSystemPrompt(basePrompt: string): string {
  const knowledge = loadKnowledge();
  
  if (!knowledge) {
    return basePrompt;
  }

  return `${basePrompt}

=== YOUR KNOWLEDGE BASE ===
Use this as reference when needed, BUT DO NOT COPY-PASTE explanations.
Always rephrase technical information in your own fun, casual words like you're talking to a friend.
Use simple analogies and examples to make complex ideas easy to understand.
Keep it short and conversational - 2-4 sentences max when explaining.

REFERENCE MATERIAL:
${knowledge}

Remember: You're chatting with a friend, not writing documentation! Explain in YOUR personality and words, making it fun and understandable. 💖
`;
}


import type { Emotion } from '@/types';

const KEYWORDS: Record<Exclude<Emotion, 'neutral'>, string[]> = {
  happy: [
    'happy','joy','great','awesome','love','wonderful','amazing','excited',
    'haha','lol','nice','thank','thanks','yay','perfect','fantastic',
    'brilliant','excellent','delighted','glad','pleased','laugh','fun','😊','😄','🎉','❤️',
    // Indonesian
    'senang','bahagia','bagus','suka','lucu','mantap','keren','asyik','hebat',
    'gembira','sukacita','indah','menyenangkan','seru','hehe','wkwk',
  ],
  sad: [
    'sad','cry','unhappy','depressed','lonely','miss','lost','terrible',
    'awful','horrible','unfortunately','regret','disappointed','heartbroken','grief','😢','😭','💔',
    // Indonesian
    'sedih','menangis','kecewa','hancur','kesepian','menyesal','maaf',
    'galau','patah hati','susah','duka','pilu','nelangsa','muram',
  ],
  angry: [
    'angry','furious','hate','rage','mad','frustrated','annoyed','worst',
    'disgusting','unfair','betray','lie','cheat','😡','🤬',
    // Indonesian
    'marah','kesal','benci','jengkel','frustrasi','nyebelin','menyebalkan',
    'sialan','kampret','brengsek','najis','gajelas','ngeselin',
  ],
  surprised: [
    'wow','what','really','seriously','omg','whoa','unexpected','shocking',
    'unbelievable','incredible','no way','wait','huh','😮','😲','🤯',
    // Indonesian
    'wah','astaga','masa','serius','beneran','gila','luar biasa','kok bisa',
    'gak nyangka','kaget','ternyata','eh',
  ],
  thinking: [
    'think','maybe','perhaps','wonder','consider','hmm','actually',
    'interesting','curious','how','why','what if','suppose','possibly','🤔',
    // Indonesian
    'mungkin','kira-kira','kayaknya','sepertinya','pikir','pertimbangkan',
    'kalau','seandainya','gimana','kenapa','apa itu','coba',
  ],
};

export function analyzeSentiment(text: string): Emotion {
  const lower = text.toLowerCase();
  const scores: Record<Exclude<Emotion,'neutral'>, number> = {
    happy: 0, sad: 0, angry: 0, surprised: 0, thinking: 0,
  };

  for (const [emotion, keywords] of Object.entries(KEYWORDS) as [Exclude<Emotion,'neutral'>, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[emotion] += kw.length > 4 ? 2 : 1;
    }
  }

  let max = 0;
  let dominant: Emotion = 'neutral';
  for (const [emotion, score] of Object.entries(scores)) {
    if (score > max) { max = score; dominant = emotion as Emotion; }
  }

  return max >= 2 ? dominant : 'neutral';
}

export function analyzeConversation(
  messages: { role: string; content: string }[],
  lookback = 4
): Emotion {
  const recent = messages.slice(-lookback);
  const combined = recent.map((m) => m.content).join(' ');
  return analyzeSentiment(combined);
}
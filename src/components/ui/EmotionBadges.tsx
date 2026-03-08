import type { Emotion } from '@/types';

const BADGE_META: Record<Emotion, { symbol: string; label: string }> = {
  neutral:   { symbol: '◈', label: 'Serene'          },
  happy:     { symbol: '✦', label: 'Radiant'         },
  sad:       { symbol: '◆', label: 'Wistful'         },
  angry:     { symbol: '◉', label: 'Aflame'          },
  surprised: { symbol: '◎', label: 'Awakened'        },
  thinking:  { symbol: '◇', label: 'Contemplative'   },
};

interface EmotionBadgeProps {
  emotion: Emotion;
  /** 'full' shows symbol + label, 'compact' shows symbol only */
  variant?: 'full' | 'compact';
  className?: string;
}

export default function EmotionBadge({ emotion, variant = 'full', className = '' }: EmotionBadgeProps) {
  const { symbol, label } = BADGE_META[emotion];

  return (
    <span
      className={['vn-label capitalize transition-all duration-500', className].join(' ')}
      style={{ color: 'var(--vn-accent)' }}
    >
      {symbol}{variant === 'full' ? ` ${label}` : ''}
    </span>
  );
}
import { cn } from '@/lib/utils';
import { getScoreLabel, getScoreColor } from '@/data/biomotorTests';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold font-display text-background',
          sizeClasses[size]
        )}
        style={{ backgroundColor: getScoreColor(score) }}
      >
        {score}
      </div>
      {showLabel && (
        <span 
          className="text-sm font-medium"
          style={{ color: getScoreColor(score) }}
        >
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

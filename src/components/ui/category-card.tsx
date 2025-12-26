import { cn } from '@/lib/utils';
import { LucideIcon, Heart, Dumbbell, Zap, RotateCcw, Maximize2, Scale, Flame } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Heart,
  Dumbbell,
  Zap,
  RotateCcw,
  Maximize2,
  Scale,
  Flame,
};

interface CategoryCardProps {
  name: string;
  description: string;
  iconName: string;
  color: string;
  testCount: number;
  onClick?: () => void;
}

export function CategoryCard({ 
  name, 
  description, 
  iconName, 
  color, 
  testCount, 
  onClick 
}: CategoryCardProps) {
  const Icon = iconMap[iconName] || Heart;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm',
        'transition-all duration-300 hover:scale-[1.02] hover:border-border',
        'flex items-start gap-4 text-left group'
      )}
    >
      <div 
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
          'transition-all duration-300 group-hover:scale-110'
        )}
        style={{ 
          backgroundColor: `hsl(var(--${color}) / 0.15)`,
        }}
      >
        <Icon 
          className="w-6 h-6" 
          style={{ color: `hsl(var(--${color}))` }} 
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold font-display text-foreground truncate">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {description}
        </p>
        <p 
          className="text-xs font-medium mt-2"
          style={{ color: `hsl(var(--${color}))` }}
        >
          {testCount} Item Tes
        </p>
      </div>
    </button>
  );
}

import { cn } from '@/lib/utils';
import { LucideIcon, Heart, Dumbbell, Zap, RotateCcw, Maximize2, Scale, Flame, Move, Target } from 'lucide-react';
import { categoryImages } from '@/data/categoryImages';

const iconMap: Record<string, LucideIcon> = {
  Heart,
  Dumbbell,
  Zap,
  RotateCcw,
  Maximize2,
  Scale,
  Flame,
  Move,
  Target,
};

interface CategoryCardProps {
  name: string;
  description: string;
  iconName: string;
  color: string;
  testCount: number;
  categoryId?: string;
  showImage?: boolean;
  onClick?: () => void;
}

export function CategoryCard({ 
  name, 
  description, 
  iconName, 
  color, 
  testCount,
  categoryId,
  showImage = false,
  onClick 
}: CategoryCardProps) {
  const Icon = iconMap[iconName] || Heart;
  const categoryImage = categoryId ? categoryImages[categoryId] : null;
  
  if (showImage && categoryImage) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden',
          'transition-all duration-300 hover:scale-[1.02] hover:border-border',
          'text-left group'
        )}
      >
        <div className="relative h-32 overflow-hidden">
          <img 
            src={categoryImage} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-lg backdrop-blur-sm"
                style={{ backgroundColor: `hsl(var(--${color}) / 0.3)` }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold font-display text-white text-sm">
                  {name}
                </h3>
                <p 
                  className="text-xs font-medium"
                  style={{ color: `hsl(var(--${color}))` }}
                >
                  {testCount} Item Tes
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </button>
    );
  }
  
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

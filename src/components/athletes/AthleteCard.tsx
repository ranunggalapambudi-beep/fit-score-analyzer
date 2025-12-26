import { User, Calendar, Activity } from 'lucide-react';
import { Athlete } from '@/types/athlete';
import { cn } from '@/lib/utils';

interface AthleteCardProps {
  athlete: Athlete;
  onClick?: () => void;
  testCount?: number;
}

export function AthleteCard({ athlete, onClick, testCount = 0 }: AthleteCardProps) {
  const age = Math.floor(
    (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) / 
    (365.25 * 24 * 60 * 60 * 1000)
  );

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm',
        'transition-all duration-300 hover:scale-[1.02] hover:border-primary/50',
        'flex items-center gap-4 text-left'
      )}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 shrink-0">
        {athlete.photo ? (
          <img 
            src={athlete.photo} 
            alt={athlete.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User className="w-7 h-7 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold font-display text-foreground truncate">
          {athlete.name}
        </h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {age} tahun
          </span>
          <span>•</span>
          <span>{athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-medium text-primary">
            {athlete.sport}
          </span>
          {testCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="w-3 h-3" />
              {testCount} tes
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

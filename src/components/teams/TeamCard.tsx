import { Users, ChevronRight } from 'lucide-react';
import { Team } from '@/types/team';

interface TeamCardProps {
  team: Team;
  athleteCount: number;
  onClick?: () => void;
}

export function TeamCard({ team, athleteCount, onClick }: TeamCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl bg-card/80 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
    >
      <div 
        className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
        style={{ backgroundColor: `${team.color}20` }}
      >
        <Users className="w-6 h-6" style={{ color: team.color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{team.name}</h3>
        <p className="text-sm text-muted-foreground">{team.sport}</p>
        {team.description && (
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
            {team.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: team.color }}>
            {athleteCount}
          </p>
          <p className="text-xs text-muted-foreground">Atlet</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}

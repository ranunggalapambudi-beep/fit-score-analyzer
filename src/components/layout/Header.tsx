import { Activity } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = 'BiomotorTest', subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl no-print">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 glow-primary">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold font-display text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}

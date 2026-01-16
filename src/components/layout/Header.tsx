import { ReactNode } from 'react';
import hirocrossLogo from '@/assets/hirocross-logo.png';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export function Header({ title = 'Hirocross', subtitle, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl no-print">
      <div className="flex items-center gap-3 px-4 py-3">
        {children}
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-background overflow-hidden">
          <img src={hirocrossLogo} alt="Hirocross" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold font-display text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

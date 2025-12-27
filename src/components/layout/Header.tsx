import hirocrossLogo from '@/assets/hirocross-logo.png';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = 'HIROCROSS', subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl no-print">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black overflow-hidden">
          <img src={hirocrossLogo} alt="HIROCROSS" className="w-8 h-8 object-contain" />
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

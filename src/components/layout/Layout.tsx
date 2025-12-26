import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

export function Layout({ children, title, subtitle, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {showHeader && <Header title={title} subtitle={subtitle} />}
      <main className="animate-fade-in">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

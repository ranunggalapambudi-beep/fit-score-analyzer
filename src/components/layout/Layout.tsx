import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showBackButton?: boolean;
}

export function Layout({ children, title, subtitle, showHeader = true, showBackButton = false }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {showHeader && (
        <Header title={title} subtitle={subtitle}>
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
        </Header>
      )}
      <main className="animate-fade-in">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

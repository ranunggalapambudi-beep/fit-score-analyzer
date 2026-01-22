import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield, ScanLine } from 'lucide-react';
import hirocrossLogo from '@/assets/hirocross-logo.png';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export function Header({ title = 'Hirocross', subtitle, children }: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

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
        <BarcodeScanner
          trigger={
            <Button variant="ghost" size="icon" className="rounded-full">
              <ScanLine className="w-5 h-5" />
            </Button>
          }
        />
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Akun Saya</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin')}>
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/ui/category-card';
import { Button } from '@/components/ui/button';
import { biomotorCategories } from '@/data/biomotorTests';
import { useAthleteStore } from '@/store/athleteStore';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, ClipboardList, TrendingUp, ArrowRight, Activity, 
  Target, Brain, BarChart3, Zap, Award, ChevronRight, LayoutDashboard, Users2, BookOpen, LogIn, LogOut
} from 'lucide-react';

export default function Index() {
  const { user, signOut } = useAuth();
  const athletes = useAthleteStore((state) => state.athletes);
  const testSessions = useAthleteStore((state) => state.testSessions);

  const totalTests = testSessions.reduce((acc, s) => acc + s.results.length, 0);
  const totalSessions = testSessions.length;

  const recentAthletes = athletes.slice(-3).reverse();

  return (
    <Layout showHeader={false}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent/10 blur-[80px]" />
        
        <div className="relative px-6 pt-12 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-xs font-medium text-primary/80 uppercase tracking-wider">
                Biomotor Analysis
              </span>
              <h1 className="text-2xl font-bold font-display tracking-tight">
                <span className="gradient-text">BiomotorTest</span>
              </h1>
            </div>
          </div>
          
          <p className="text-muted-foreground leading-relaxed max-w-sm">
            Platform pengukuran komponen biomotor komprehensif dengan norma ilmiah 
            dan analisis AI untuk optimalisasi performa atlet.
          </p>
          
          <div className="flex gap-3 mt-6">
            <Link to="/athletes">
              <Button size="lg" className="gap-2 glow-primary">
                Mulai Pengukuran
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/tests">
              <Button variant="outline" size="lg">
                Lihat Tes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="px-4 pb-6 space-y-6">
        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3 -mt-2">
          <div className="p-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm text-center animate-fade-in">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mx-auto">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display mt-2">{athletes.length}</p>
            <p className="text-xs text-muted-foreground">Atlet</p>
          </div>
          <div className="p-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 mx-auto">
              <ClipboardList className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold font-display mt-2">{totalSessions}</p>
            <p className="text-xs text-muted-foreground">Sesi Tes</p>
          </div>
          <div className="p-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-strength/10 mx-auto">
              <BarChart3 className="w-5 h-5 text-strength" />
            </div>
            <p className="text-2xl font-bold font-display mt-2">{totalTests}</p>
            <p className="text-xs text-muted-foreground">Item Tes</p>
          </div>
        </section>

        {/* Recent Athletes */}
        {recentAthletes.length > 0 && (
          <section className="animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold font-display flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Atlet Terbaru
              </h2>
              <Link to="/athletes" className="text-sm text-primary flex items-center gap-1">
                Semua
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentAthletes.map((athlete) => {
                const athleteSessions = testSessions.filter(s => s.athleteId === athlete.id);
                return (
                  <Link 
                    key={athlete.id} 
                    to={`/athletes/${athlete.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0 overflow-hidden">
                      {athlete.photo ? (
                        <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{athlete.name}</p>
                      <p className="text-xs text-muted-foreground">{athlete.sport}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{athleteSessions.length} sesi</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold font-display flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Kategori Biomotor
            </h2>
            <Link to="/tests" className="text-sm text-primary flex items-center gap-1">
              Lihat Semua
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {biomotorCategories.slice(0, 4).map((category, idx) => (
              <Link key={category.id} to={`/tests/${category.id}`}>
                <CategoryCard
                  name={category.name}
                  description={category.description}
                  iconName={category.icon}
                  color={category.color}
                  testCount={category.tests.length}
                />
              </Link>
            ))}
          </div>
          {biomotorCategories.length > 4 && (
            <Link to="/tests">
              <Button variant="outline" className="w-full mt-3 gap-2">
                Lihat {biomotorCategories.length - 4} Kategori Lainnya
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </section>

        {/* Features */}
        <section className="rounded-2xl border border-border/50 p-5 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Fitur Unggulan
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-background/50 border border-border/30">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-endurance/10 mb-2">
                <ClipboardList className="w-4 h-4 text-endurance" />
              </div>
              <p className="text-sm font-medium">30+ Item Tes</p>
              <p className="text-xs text-muted-foreground mt-0.5">Berdasarkan referensi ilmiah</p>
            </div>
            <div className="p-3 rounded-xl bg-background/50 border border-border/30">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-strength/10 mb-2">
                <BarChart3 className="w-4 h-4 text-strength" />
              </div>
              <p className="text-sm font-medium">Norma Usia & Gender</p>
              <p className="text-xs text-muted-foreground mt-0.5">Skala penilaian 1-5</p>
            </div>
            <div className="p-3 rounded-xl bg-background/50 border border-border/30">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm font-medium">Radar Chart</p>
              <p className="text-xs text-muted-foreground mt-0.5">Visualisasi profil biomotor</p>
            </div>
            <div className="p-3 rounded-xl bg-background/50 border border-border/30">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 mb-2">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium">Analisis AI</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rekomendasi latihan cerdas</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-4 space-y-3">
          <p className="text-muted-foreground text-sm mb-3">
            Siap untuk mengukur performa atletmu?
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="gap-2 w-full max-w-xs glow-primary">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard Pelatih
            </Button>
          </Link>
          <Link to="/teams">
            <Button size="lg" variant="outline" className="gap-2 w-full max-w-xs">
              <Users2 className="w-5 h-5" />
              Kelola Tim
            </Button>
          </Link>
          <Link to="/athletes">
            <Button size="lg" variant="ghost" className="gap-2 w-full max-w-xs">
              <Users className="w-5 h-5" />
              Kelola Atlet
            </Button>
          </Link>
          <Link to="/tutorial">
            <Button size="lg" variant="ghost" className="gap-2 w-full max-w-xs">
              <BookOpen className="w-5 h-5" />
              Panduan Tes
            </Button>
          </Link>
          
          {user ? (
            <Button 
              size="lg" 
              variant="ghost" 
              className="gap-2 w-full max-w-xs text-muted-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="w-5 h-5" />
              Keluar
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="lg" variant="ghost" className="gap-2 w-full max-w-xs">
                <LogIn className="w-5 h-5" />
                Masuk / Daftar
              </Button>
            </Link>
          )}
        </section>
      </div>
    </Layout>
  );
}

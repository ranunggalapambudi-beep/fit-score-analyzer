import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/ui/category-card';
import { Button } from '@/components/ui/button';
import { biomotorCategories } from '@/data/biomotorTests';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Users, ClipboardList, TrendingUp, ArrowRight, Activity, Target, Brain, BarChart3, Zap, Award, ChevronRight, LayoutDashboard, Users2, BookOpen, LogIn, LogOut, Loader2, Info, Play, ScanLine } from 'lucide-react';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { categoryImageList } from '@/data/categoryImages';
import hirocrossLogo from '@/assets/hirocross-logo.png';
import heroAthleteImage from '@/assets/hero-athlete-testing.jpg';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

export default function Index() {
  const {
    user,
    signOut
  } = useAuth();
  const {
    athletes,
    testSessions,
    loading
  } = useSupabaseData();
  const totalTests = testSessions.reduce((acc, s) => acc + s.results.length, 0);
  const totalSessions = testSessions.length;
  const recentAthletes = athletes.slice(0, 5);
  return <Layout showHeader={false}>
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden min-h-[60vh]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroAthleteImage} 
            alt="Athlete Performance Testing" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative px-6 pt-12 pb-8 z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/20 overflow-hidden">
                <img src={hirocrossLogo} alt="HIROCROSS" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  Biomotor Analysis
                </span>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white">
                  <span className="gradient-text">BiomotorTest</span>
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="mt-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white leading-tight mb-4">
              Ukur Performa <br />
              <span className="text-primary">Atlet Profesional</span>
            </h2>
            <p className="text-white/80 leading-relaxed max-w-sm text-base">
              Platform pengukuran komponen biomotor komprehensif dengan norma ilmiah 
              dan analisis AI untuk optimalisasi performa atlet.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/athletes">
              <Button size="lg" className="gap-2 glow-primary bg-primary text-white hover:bg-primary/90">
                Mulai Pengukuran
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/tests">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Lihat Tes
              </Button>
            </Link>
            <BarcodeScanner
              trigger={
                <Button variant="outline" size="lg" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  <ScanLine className="w-4 h-4" />
                  Scan Atlet
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Biomotor Categories Carousel with Auto-play */}
      <section className="px-4 -mt-8 relative z-20">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {categoryImageList.map((category) => (
              <CarouselItem key={category.id} className="pl-2 basis-1/3 md:basis-1/4">
                <Link to={`/tests/${category.id}`}>
                  <div className="relative rounded-xl overflow-hidden aspect-square group cursor-pointer">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-medium">{category.name}</p>
                      <p className="text-white/60 text-[10px]">{category.nameEn}</p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-1/2 bg-background/80 border-border/50" />
          <CarouselNext className="right-0 translate-x-1/2 bg-background/80 border-border/50" />
        </Carousel>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Auto-play aktif</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <p className="text-xs text-muted-foreground">
            ← Geser untuk melihat semua kategori →
          </p>
        </div>
      </section>

      <div className="px-4 pb-6 space-y-6">
        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3 -mt-2">
          <Link to="/athletes" className="p-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm text-center animate-fade-in hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mx-auto">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : athletes.length}
            </p>
            <p className="text-xs text-muted-foreground">Atlet</p>
          </Link>
          <Link to="/results" className="p-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm text-center animate-fade-in hover:border-primary/50 transition-colors" style={{
          animationDelay: '0.1s'
        }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 mx-auto">
              <ClipboardList className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold font-display mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : totalSessions}
            </p>
            <p className="text-xs text-muted-foreground">Sesi Tes</p>
          </Link>
          <Link to="/results" className="p-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm text-center animate-fade-in hover:border-primary/50 transition-colors" style={{
          animationDelay: '0.2s'
        }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-strength/10 mx-auto">
              <BarChart3 className="w-5 h-5 text-strength" />
            </div>
            <p className="text-2xl font-bold font-display mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : totalTests}
            </p>
            <p className="text-xs text-muted-foreground">Item Tes</p>
          </Link>
        </section>

        {/* Recent Athletes */}
        {!loading && recentAthletes.length > 0 && <section className="animate-slide-up">
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
              {recentAthletes.map(athlete => {
            const athleteSessions = testSessions.filter(s => s.athleteId === athlete.id);
            return <Link key={athlete.id} to={`/athletes/${athlete.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0 overflow-hidden">
                      {athlete.photo ? <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{athlete.name}</p>
                      <p className="text-xs text-muted-foreground">{athlete.sport}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{athleteSessions.length} sesi</p>
                      <p className="text-xs text-muted-foreground">
                        {athlete.gender === 'male' ? 'L' : 'P'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>;
          })}
            </div>
            {athletes.length > 5 && <Link to="/athletes">
                <Button variant="ghost" size="sm" className="w-full mt-2 text-primary">
                  Lihat {athletes.length - 5} atlet lainnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>}
          </section>}

        {/* No Athletes Yet */}
        {!loading && recentAthletes.length === 0 && user && <section className="animate-slide-up">
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold font-display">Belum Ada Atlet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Tambahkan atlet untuk memulai pengukuran biomotor
              </p>
              <Link to="/athletes">
                <Button className="gap-2">
                  <Users className="w-4 h-4" />
                  Tambah Atlet
                </Button>
              </Link>
            </div>
          </section>}

        {/* Categories */}
        <section className="animate-slide-up" style={{
        animationDelay: '0.15s'
      }}>
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
            {biomotorCategories.slice(0, 4).map((category, idx) => <Link key={category.id} to={`/tests/${category.id}`}>
                <CategoryCard name={category.name} description={category.description} iconName={category.icon} color={category.color} testCount={category.tests.length} />
              </Link>)}
          </div>
          {biomotorCategories.length > 4 && <Link to="/tests">
              <Button variant="outline" className="w-full mt-3 gap-2">
                Lihat {biomotorCategories.length - 4} Kategori Lainnya
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>}
        </section>

        {/* Features */}
        <section className="rounded-2xl border border-border/50 p-5 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm animate-slide-up" style={{
        animationDelay: '0.2s'
      }}>
          <h2 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Fitur Unggulan
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/tests" className="p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-endurance/10 mb-2">
                <ClipboardList className="w-4 h-4 text-endurance" />
              </div>
              <p className="text-sm font-medium">30+ Item Tes</p>
              <p className="text-xs text-muted-foreground mt-0.5">Berdasarkan referensi ilmiah</p>
            </Link>
            <Link to="/results" className="p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-strength/10 mb-2">
                <BarChart3 className="w-4 h-4 text-strength" />
              </div>
              <p className="text-sm font-medium">Norma Usia & Gender</p>
              <p className="text-xs text-muted-foreground mt-0.5">Skala penilaian 1-5</p>
            </Link>
            <Link to="/dashboard" className="p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm font-medium">Radar Chart</p>
              <p className="text-xs text-muted-foreground mt-0.5">Visualisasi profil biomotor</p>
            </Link>
            <Link to="/analysis" className="p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 mb-2">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium">Analisis AI</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rekomendasi latihan cerdas</p>
            </Link>
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
          <Link to="/about">
            <Button size="lg" variant="ghost" className="gap-2 w-full max-w-xs">
              <Info className="w-5 h-5" />
              About HIROCROSS
            </Button>
          </Link>
          
          {user ? <Button size="lg" variant="ghost" className="gap-2 w-full max-w-xs text-muted-foreground" onClick={() => signOut()}>
              <LogOut className="w-5 h-5" />
              Keluar
            </Button> : <Link to="/auth">
              <Button size="lg" variant="ghost" className="gap-2 w-full max-w-xs">
                <LogIn className="w-5 h-5" />
                Masuk / Daftar
              </Button>
            </Link>}
        </section>
      </div>
    </Layout>;
}
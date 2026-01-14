import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { PerformanceTrendChart, ScoreChange } from '@/components/charts/PerformanceTrendChart';
import { ScoreBadge } from '@/components/ui/score-badge';
import { biomotorCategories } from '@/data/biomotorTests';
import { Athlete, TestSession } from '@/types/athlete';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChevronLeft, User, Calendar, TrendingUp, TrendingDown, 
  Target, Activity, BarChart3, Loader2, ArrowRight,
  History, Award, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function AthleteDashboard() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch athlete and sessions from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!athleteId || !user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch athlete
        const { data: athleteData, error: athleteError } = await supabase
          .from('athletes')
          .select('*')
          .eq('id', athleteId)
          .maybeSingle();

        if (athleteError) throw athleteError;

        if (athleteData) {
          setAthlete({
            id: athleteData.id,
            createdAt: athleteData.created_at,
            name: athleteData.name,
            dateOfBirth: athleteData.date_of_birth,
            gender: athleteData.gender as 'male' | 'female',
            sport: athleteData.sport,
            team: athleteData.team || undefined,
            photo: athleteData.photo || undefined,
          });
        }

        // Fetch sessions with results
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('test_sessions')
          .select('*')
          .eq('athlete_id', athleteId)
          .order('date', { ascending: false });

        if (sessionsError) throw sessionsError;

        const sessionsWithResults: TestSession[] = [];
        
        for (const session of sessionsData || []) {
          const { data: results } = await supabase
            .from('test_results')
            .select('*')
            .eq('session_id', session.id);
          
          sessionsWithResults.push({
            id: session.id,
            athleteId: session.athlete_id,
            date: session.date,
            results: (results || []).map(r => ({
              id: r.id,
              athleteId: session.athlete_id,
              testId: r.test_id,
              categoryId: r.category_id,
              value: Number(r.value),
              unit: '',
              score: r.score,
              date: session.date,
            })),
            notes: session.notes || undefined,
          });
        }
        
        setSessions(sessionsWithResults);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [athleteId, user]);

  const age = useMemo(() => {
    if (!athlete) return 0;
    return Math.floor(
      (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    );
  }, [athlete]);

  // Latest session scores
  const latestSession = sessions[0];
  const previousSession = sessions[1];

  const latestCategoryScores = useMemo(() => {
    if (!latestSession) return {};
    const scores: Record<string, number[]> = {};
    latestSession.results.forEach((r) => {
      if (!scores[r.categoryId]) scores[r.categoryId] = [];
      scores[r.categoryId].push(r.score);
    });
    const avgScores: Record<string, number> = {};
    Object.entries(scores).forEach(([catId, catScores]) => {
      avgScores[catId] = catScores.reduce((a, b) => a + b, 0) / catScores.length;
    });
    return avgScores;
  }, [latestSession]);

  const previousCategoryScores = useMemo(() => {
    if (!previousSession) return {};
    const scores: Record<string, number[]> = {};
    previousSession.results.forEach((r) => {
      if (!scores[r.categoryId]) scores[r.categoryId] = [];
      scores[r.categoryId].push(r.score);
    });
    const avgScores: Record<string, number> = {};
    Object.entries(scores).forEach(([catId, catScores]) => {
      avgScores[catId] = catScores.reduce((a, b) => a + b, 0) / catScores.length;
    });
    return avgScores;
  }, [previousSession]);

  // Overall progress
  const overallProgress = useMemo(() => {
    if (!latestSession) return { current: 0, previous: 0, change: 0 };
    
    const currentScores = latestSession.results.map(r => r.score);
    const current = currentScores.length > 0 
      ? currentScores.reduce((a, b) => a + b, 0) / currentScores.length 
      : 0;
    
    let previous = 0;
    if (previousSession) {
      const prevScores = previousSession.results.map(r => r.score);
      previous = prevScores.length > 0 
        ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length 
        : 0;
    }
    
    return { current, previous, change: current - previous };
  }, [latestSession, previousSession]);

  // Find strengths and weaknesses
  const analysis = useMemo(() => {
    const sorted = Object.entries(latestCategoryScores)
      .map(([id, score]) => ({ id, score, name: biomotorCategories.find(c => c.id === id)?.name || id }))
      .sort((a, b) => b.score - a.score);
    
    return {
      strengths: sorted.filter(c => c.score >= 4).slice(0, 2),
      weaknesses: sorted.filter(c => c.score < 3).slice(-2).reverse(),
      mostImproved: Object.entries(latestCategoryScores)
        .map(([id, score]) => ({
          id,
          score,
          name: biomotorCategories.find(c => c.id === id)?.name || id,
          change: score - (previousCategoryScores[id] || 0)
        }))
        .filter(c => c.change > 0)
        .sort((a, b) => b.change - a.change)
        .slice(0, 2),
    };
  }, [latestCategoryScores, previousCategoryScores]);

  const radarData = useMemo(() => generateRadarData(latestCategoryScores, true), [latestCategoryScores]);
  const previousRadarData = useMemo(() => generateRadarData(previousCategoryScores, true), [previousCategoryScores]);

  if (loading) {
    return (
      <Layout title="Memuat...">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-4">Memuat data atlet...</p>
        </div>
      </Layout>
    );
  }

  if (!athlete) {
    return (
      <Layout title="Atlet Tidak Ditemukan">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted-foreground">Atlet tidak ditemukan</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/athletes')}>
            Kembali
          </Button>
        </div>
      </Layout>
    );
  }

  if (sessions.length === 0) {
    return (
      <Layout showHeader={false}>
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/athletes/${athlete.id}`)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold font-display">Dashboard Perkembangan</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="px-4 py-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground" />
            <h3 className="font-semibold font-display mt-4">Belum Ada Data Tes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Lakukan tes pertama untuk melihat perkembangan atlet
            </p>
            <Button className="mt-4" onClick={() => navigate(`/test-session/${athlete.id}`)}>
              Mulai Tes
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/athletes/${athlete.id}`)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold font-display">Dashboard Perkembangan</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Athlete Info Card */}
        <section className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 shrink-0 overflow-hidden">
            {athlete.photo ? (
              <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold font-display truncate">{athlete.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{age} tahun</span>
              <span>•</span>
              <span>{athlete.sport}</span>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
            <Activity className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold font-display">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">Sesi Tes</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
            <Award className="w-5 h-5 mx-auto text-speed mb-1" />
            <p className="text-xl font-bold font-display">{overallProgress.current.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Skor Rata-rata</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
            {overallProgress.change >= 0 ? (
              <TrendingUp className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
            ) : (
              <TrendingDown className="w-5 h-5 mx-auto text-rose-500 mb-1" />
            )}
            <p className={`text-xl font-bold font-display ${
              overallProgress.change > 0 ? 'text-emerald-500' : 
              overallProgress.change < 0 ? 'text-rose-500' : ''
            }`}>
              {overallProgress.change >= 0 ? '+' : ''}{overallProgress.change.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Perubahan</p>
          </div>
        </section>

        {/* Performance Trend Chart */}
        <section className="p-4 rounded-xl bg-card border border-border/50">
          <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tren Performa
          </h3>
          <PerformanceTrendChart sessions={sessions} height={250} showLegend={true} />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Grafik menunjukkan perkembangan skor dari waktu ke waktu
          </p>
        </section>

        {/* Radar Chart Comparison */}
        {radarData.length > 0 && (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Profil Biomotor Terkini
            </h3>
            <RadarChart 
              data={radarData} 
              compareData={previousRadarData.length > 0 ? previousRadarData : undefined}
              height={280} 
            />
            {previousSession && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Garis putus-putus: Sesi sebelumnya ({format(new Date(previousSession.date), 'd MMM yyyy', { locale: localeId })})
              </p>
            )}
          </section>
        )}

        {/* Category Score Comparison */}
        <section className="p-4 rounded-xl bg-card border border-border/50">
          <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Detail Skor per Kategori
          </h3>
          <div className="space-y-3">
            {biomotorCategories.map((cat) => {
              const currentScore = latestCategoryScores[cat.id];
              const previousScore = previousCategoryScores[cat.id];
              
              if (!currentScore) return null;
              
              return (
                <div key={cat.id} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: `hsl(var(--${cat.color}))` }}
                      />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={Math.round(currentScore)} size="sm" showLabel={false} />
                      {previousScore !== undefined && (
                        <ScoreChange current={currentScore} previous={previousScore} />
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(currentScore / 5) * 100}%`,
                        backgroundColor: `hsl(var(--${cat.color}))`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Strengths & Weaknesses */}
        <section className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Keunggulan</span>
            </div>
            {analysis.strengths.length > 0 ? (
              <div className="space-y-2">
                {analysis.strengths.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{s.name}</span>
                    <ScoreBadge score={Math.round(s.score)} size="sm" showLabel={false} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada data</p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Perlu Ditingkatkan</span>
            </div>
            {analysis.weaknesses.length > 0 ? (
              <div className="space-y-2">
                {analysis.weaknesses.map((w) => (
                  <div key={w.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{w.name}</span>
                    <ScoreBadge score={Math.round(w.score)} size="sm" showLabel={false} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Semua kategori baik!</p>
            )}
          </div>
        </section>

        {/* Most Improved */}
        {analysis.mostImproved.length > 0 && previousSession && (
          <section className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-speed/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-semibold font-display">Peningkatan Terbaik</span>
            </div>
            <div className="space-y-2">
              {analysis.mostImproved.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-emerald-500 font-medium">
                    +{item.change.toFixed(2)} poin
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Session History */}
        <section className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-display flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Riwayat Sesi
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => navigate(`/athletes/${athlete.id}`)}
            >
              Lihat Semua
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session, idx) => {
              const avgScore = session.results.length > 0
                ? session.results.reduce((a, b) => a + b.score, 0) / session.results.length
                : 0;
              
              return (
                <button
                  key={session.id}
                  className="w-full p-3 rounded-lg bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  onClick={() => navigate(`/athletes/${athlete.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(session.date), 'd MMMM yyyy', { locale: localeId })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.results.length} item tes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={Math.round(avgScore)} size="sm" showLabel={false} />
                    {idx === 0 && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        Terbaru
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full gap-2" 
            onClick={() => navigate(`/test-session/${athlete.id}`)}
          >
            <Activity className="w-5 h-5" />
            Mulai Tes Baru
          </Button>
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={() => navigate(`/analysis/${athlete.id}`)}
          >
            <BarChart3 className="w-5 h-5" />
            Analisis AI
          </Button>
        </div>
      </div>
    </Layout>
  );
}

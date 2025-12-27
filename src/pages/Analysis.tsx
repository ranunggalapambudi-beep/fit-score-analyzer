import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { ScoreBadge } from '@/components/ui/score-badge';
import { useAthleteStore } from '@/store/athleteStore';
import { biomotorCategories } from '@/data/biomotorTests';
import { 
  Brain, ChevronLeft, Loader2, User, Calendar, 
  TrendingUp, TrendingDown, Target, Dumbbell, RefreshCw
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ExportPDF } from '@/components/export/ExportPDF';

export default function Analysis() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const athletes = useAthleteStore((state) => state.athletes);
  const testSessions = useAthleteStore((state) => state.testSessions);
  
  const athlete = useMemo(() => athletes.find((a) => a.id === athleteId), [athletes, athleteId]);
  const sessions = useMemo(() => testSessions.filter((s) => s.athleteId === athleteId), [testSessions, athleteId]);

  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);

  const age = useMemo(() => {
    if (!athlete) return 0;
    return Math.floor(
      (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    );
  }, [athlete]);

  const latestSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }, [sessions]);

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

  const radarData = useMemo(() => {
    return generateRadarData(latestCategoryScores, true);
  }, [latestCategoryScores]);

  const handleAnalyze = async () => {
    if (!athlete || !latestSession) return;

    setIsLoading(true);
    setAnalysis(null);

    try {
      // Get test details for each result
      const resultsWithDetails = latestSession.results.map((r) => {
        const category = biomotorCategories.find(c => c.id === r.categoryId);
        const test = category?.tests.find(t => t.id === r.testId);
        return {
          categoryId: r.categoryId,
          categoryName: category?.name || r.categoryId,
          testId: r.testId,
          testName: test?.name || r.testId,
          value: r.value,
          unit: r.unit,
          score: r.score,
        };
      });

      const athleteData = {
        name: athlete.name,
        age,
        gender: athlete.gender,
        sport: athlete.sport,
        weight: athlete.weight,
        height: athlete.height,
        results: resultsWithDetails,
      };

      const { data, error } = await supabase.functions.invoke('analyze-biomotor', {
        body: { athleteData },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
      setStrengths(data.strengths || []);
      setWeaknesses(data.weaknesses || []);
      
      toast.success('Analisis AI berhasil');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal melakukan analisis');
    } finally {
      setIsLoading(false);
    }
  };

  // No athlete selected
  if (!athleteId) {
    return (
      <Layout title="Analisis AI" subtitle="Analisis cerdas biomotor">
        <div className="px-4 py-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold font-display">Analisis AI</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Pilih atlet dari halaman Atlet untuk melihat analisis AI lengkap dengan rekomendasi latihan
            </p>
            <Button className="mt-4" onClick={() => navigate('/athletes')}>
              Lihat Daftar Atlet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Athlete not found
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

  // No test data
  if (sessions.length === 0) {
    return (
      <Layout showHeader={false}>
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/athletes/${athlete.id}`)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold font-display">Analisis AI</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="px-4 py-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="w-12 h-12 text-muted-foreground" />
            <h3 className="font-semibold font-display mt-4">Belum Ada Data Tes</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Lakukan tes biomotor terlebih dahulu untuk mendapatkan analisis AI
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
          <h1 className="font-semibold font-display">Analisis AI</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Athlete Info */}
        <section className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 shrink-0">
            {athlete.photo ? (
              <img src={athlete.photo} alt={athlete.name} className="w-full h-full rounded-full object-cover" />
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

        {/* Radar Chart */}
        {radarData.length > 0 && (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Profil Biomotor
            </h3>
            <RadarChart data={radarData} height={280} />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {radarData.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground truncate">{item.category}</span>
                  <ScoreBadge score={Math.round(item.score)} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Keunggulan</span>
            </div>
            {strengths.length > 0 ? (
              <div className="space-y-1">
                {strengths.slice(0, 2).map((s) => (
                  <p key={s} className="text-sm font-medium truncate">{s}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Jalankan analisis</p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Perlu Ditingkatkan</span>
            </div>
            {weaknesses.length > 0 ? (
              <div className="space-y-1">
                {weaknesses.slice(0, 2).map((w) => (
                  <p key={w} className="text-sm font-medium truncate">{w}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Jalankan analisis</p>
            )}
          </div>
        </section>

        {/* Analyze Button */}
        <Button 
          className="w-full gap-2" 
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Menganalisis...
            </>
          ) : analysis ? (
            <>
              <RefreshCw className="w-5 h-5" />
              Analisis Ulang
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Mulai Analisis AI
            </>
          )}
        </Button>

        {/* Analysis Result */}
        {analysis && (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              Analisis & Rekomendasi Latihan
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {analysis}
              </div>
            </div>
          </section>
        )}

        {/* Export PDF Section */}
        <section className="p-4 rounded-xl bg-card border border-border/50">
          <h3 className="font-semibold font-display mb-4">Export Laporan</h3>
          <ExportPDF athlete={athlete} sessions={sessions} />
        </section>
      </div>
    </Layout>
  );
}

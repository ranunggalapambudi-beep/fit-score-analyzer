import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { ScoreBadge } from '@/components/ui/score-badge';
import { useAthleteStore } from '@/store/athleteStore';
import { biomotorCategories } from '@/data/biomotorTests';
import { EditAthleteSheet } from '@/components/athletes/EditAthleteSheet';
import { 
  User, Calendar, Activity, ChevronLeft, Trash2, 
  PlayCircle, FileText, Scale, Ruler, Heart, TrendingUp, TrendingDown, GitCompareArrows
} from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// BMI calculation helper
function calculateBMI(weight: number, height: number): { value: number; category: string; color: string } {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let category = '';
  let color = '';
  
  if (bmi < 18.5) {
    category = 'Kurus';
    color = 'text-accent';
  } else if (bmi < 25) {
    category = 'Normal';
    color = 'text-endurance';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = 'text-speed';
  } else {
    category = 'Obesitas';
    color = 'text-destructive';
  }
  
  return { value: Math.round(bmi * 10) / 10, category, color };
}

export default function AthleteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const athletes = useAthleteStore((state) => state.athletes);
  const testSessions = useAthleteStore((state) => state.testSessions);
  const deleteAthlete = useAthleteStore((state) => state.deleteAthlete);
  
  const athlete = useMemo(() => athletes.find((a) => a.id === id), [athletes, id]);
  const sessions = useMemo(() => testSessions.filter((s) => s.athleteId === id), [testSessions, id]);

  const age = useMemo(() => {
    if (!athlete) return 0;
    return Math.floor(
      (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    );
  }, [athlete]);

  const bmiData = useMemo(() => {
    if (!athlete?.weight || !athlete?.height) return null;
    return calculateBMI(athlete.weight, athlete.height);
  }, [athlete]);

  const latestCategoryScores = useMemo(() => {
    if (sessions.length === 0) return {};
    
    const latest = sessions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    const scores: Record<string, number[]> = {};
    latest.results.forEach((r) => {
      if (!scores[r.categoryId]) scores[r.categoryId] = [];
      scores[r.categoryId].push(r.score);
    });

    const avgScores: Record<string, number> = {};
    Object.entries(scores).forEach(([catId, catScores]) => {
      avgScores[catId] = catScores.reduce((a, b) => a + b, 0) / catScores.length;
    });

    return avgScores;
  }, [sessions]);

  // Get all test results grouped by category
  const allTestResults = useMemo(() => {
    if (sessions.length === 0) return [];
    
    const latest = sessions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    const grouped: { categoryId: string; categoryName: string; tests: Array<{ name: string; value: number; unit: string; score: number }> }[] = [];
    
    biomotorCategories.forEach(cat => {
      const catResults = latest.results.filter(r => r.categoryId === cat.id);
      if (catResults.length > 0) {
        grouped.push({
          categoryId: cat.id,
          categoryName: cat.name,
          tests: catResults.map(r => {
            const test = cat.tests.find(t => t.id === r.testId);
            return {
              name: test?.name || r.testId,
              value: r.value,
              unit: r.unit,
              score: r.score
            };
          })
        });
      }
    });
    
    return grouped;
  }, [sessions]);

  const radarData = useMemo(() => {
    return generateRadarData(latestCategoryScores, true);
  }, [latestCategoryScores]);

  const handleDelete = () => {
    if (athlete) {
      deleteAthlete(athlete.id);
      toast.success('Atlet berhasil dihapus');
      navigate('/athletes');
    }
  };

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

  return (
    <Layout showHeader={false}>
      {/* Custom Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/athletes')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold font-display">Detail Atlet</h1>
          <div className="flex gap-1">
            <EditAthleteSheet athlete={athlete} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Atlet?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Semua data tes atlet ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <section className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 shrink-0 overflow-hidden border-2 border-primary/30">
            {athlete.photo ? (
              <img 
                src={athlete.photo} 
                alt={athlete.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold font-display truncate">{athlete.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{age} tahun</span>
              <span>•</span>
              <span>{athlete.gender === 'male' ? 'L' : 'P'}</span>
            </div>
            <p className="text-sm font-medium text-primary mt-1">{athlete.sport}</p>
            {athlete.team && (
              <p className="text-xs text-muted-foreground">{athlete.team}</p>
            )}
          </div>
        </section>

        {/* BMI & Quick Stats */}
        <section className="grid grid-cols-3 gap-3">
          {athlete.height && (
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <Ruler className="w-5 h-5 text-muted-foreground mx-auto" />
              <p className="text-lg font-bold font-display mt-1">{athlete.height}</p>
              <p className="text-xs text-muted-foreground">cm</p>
            </div>
          )}
          {athlete.weight && (
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <Scale className="w-5 h-5 text-muted-foreground mx-auto" />
              <p className="text-lg font-bold font-display mt-1">{athlete.weight}</p>
              <p className="text-xs text-muted-foreground">kg</p>
            </div>
          )}
          {bmiData && (
            <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <Heart className="w-5 h-5 text-muted-foreground mx-auto" />
              <p className={`text-lg font-bold font-display mt-1 ${bmiData.color}`}>{bmiData.value}</p>
              <p className="text-xs text-muted-foreground">{bmiData.category}</p>
            </div>
          )}
        </section>

        {/* Radar Chart */}
        {sessions.length > 0 && radarData.length > 0 ? (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4">Profil Biomotor</h3>
            <RadarChart data={radarData} height={280} />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {biomotorCategories.filter(cat => latestCategoryScores[cat.id] !== undefined).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground truncate">{cat.name}</span>
                  <ScoreBadge 
                    score={Math.round(latestCategoryScores[cat.id] || 0)} 
                    size="sm"
                    showLabel={false}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="p-6 rounded-xl bg-card border border-border/50 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="font-semibold font-display mt-4">Belum Ada Data Tes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Lakukan tes biomotor untuk melihat profil atlet
            </p>
          </section>
        )}

        {/* All Test Results */}
        {allTestResults.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-semibold font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Hasil Tes Terakhir
            </h3>
            {allTestResults.map((group) => (
              <div key={group.categoryId} className="rounded-xl bg-card border border-border/50 overflow-hidden">
                <div className={`px-4 py-2 bg-${group.categoryId === 'endurance' ? 'endurance' : group.categoryId === 'strength' ? 'strength' : group.categoryId === 'speed' ? 'speed' : 'primary'}/10 border-b border-border/50`}>
                  <h4 className="font-medium text-sm">{group.categoryName}</h4>
                </div>
                <div className="divide-y divide-border/50">
                  {group.tests.map((test, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{test.name}</p>
                        <p className="text-xs text-muted-foreground">{test.value} {test.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.score >= 4 ? (
                          <TrendingUp className="w-4 h-4 text-endurance" />
                        ) : test.score <= 2 ? (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        ) : null}
                        <ScoreBadge score={test.score} size="sm" showLabel={false} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Action Buttons */}
        <section className="space-y-3">
          <Button 
            className="w-full gap-2" 
            onClick={() => navigate(`/test-session/${athlete.id}`)}
          >
            <PlayCircle className="w-5 h-5" />
            Mulai Sesi Tes Baru
          </Button>
          {sessions.length > 0 && (
            <>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate(`/results/${athlete.id}`)}
              >
                <Activity className="w-5 h-5" />
                Lihat Riwayat Tes
              </Button>
              {sessions.length >= 2 && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => navigate(`/comparison/${athlete.id}`)}
                >
                  <GitCompareArrows className="w-5 h-5" />
                  Bandingkan Progress
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate(`/analysis/${athlete.id}`)}
              >
                <FileText className="w-5 h-5" />
                Analisis AI & Export
              </Button>
            </>
          )}
        </section>

        {/* Test Sessions History */}
        {sessions.length > 0 && (
          <section>
            <h3 className="font-semibold font-display mb-3">Riwayat Sesi Tes</h3>
            <div className="space-y-2">
              {sessions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((session) => (
                  <button
                    key={session.id}
                    className="w-full p-3 rounded-xl bg-card border border-border/50 flex items-center justify-between text-left hover:border-primary/50 transition-colors"
                    onClick={() => navigate(`/results/${athlete.id}/${session.id}`)}
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(session.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.results.length} item tes
                      </p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                  </button>
                ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

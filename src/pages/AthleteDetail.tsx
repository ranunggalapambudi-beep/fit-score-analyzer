import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { ScoreBadge } from '@/components/ui/score-badge';
import { useAthleteStore } from '@/store/athleteStore';
import { biomotorCategories } from '@/data/biomotorTests';
import { 
  User, Calendar, Activity, ChevronLeft, Edit, Trash2, 
  PlayCircle, FileText, Scale, Ruler
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

export default function AthleteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const athlete = useAthleteStore((state) => state.getAthleteById(id || ''));
  const sessions = useAthleteStore((state) => state.getSessionsByAthleteId(id || ''));
  const deleteAthlete = useAthleteStore((state) => state.deleteAthlete);

  const age = useMemo(() => {
    if (!athlete) return 0;
    return Math.floor(
      (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    );
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

  const radarData = useMemo(() => {
    return generateRadarData(latestCategoryScores);
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
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
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
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 shrink-0">
            {athlete.photo ? (
              <img 
                src={athlete.photo} 
                alt={athlete.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary" />
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
          </div>
        </section>

        {/* Quick Stats */}
        {(athlete.height || athlete.weight) && (
          <section className="grid grid-cols-2 gap-3">
            {athlete.height && (
              <div className="p-4 rounded-xl bg-card border border-border/50 flex items-center gap-3">
                <Ruler className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold font-display">{athlete.height} cm</p>
                  <p className="text-xs text-muted-foreground">Tinggi Badan</p>
                </div>
              </div>
            )}
            {athlete.weight && (
              <div className="p-4 rounded-xl bg-card border border-border/50 flex items-center gap-3">
                <Scale className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold font-display">{athlete.weight} kg</p>
                  <p className="text-xs text-muted-foreground">Berat Badan</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Radar Chart */}
        {sessions.length > 0 ? (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4">Profil Biomotor</h3>
            <RadarChart data={radarData} height={280} />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {biomotorCategories.map((cat) => (
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

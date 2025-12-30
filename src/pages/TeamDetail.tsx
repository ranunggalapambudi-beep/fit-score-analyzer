import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { EditTeamSheet } from '@/components/teams/EditTeamSheet';
import { AddAthleteSheet } from '@/components/athletes/AddAthleteSheet';
import { useTeamStore } from '@/store/teamStore';
import { useAthleteStore } from '@/store/athleteStore';
import { 
  Users, Trash2, Plus, ArrowLeft, Activity, 
  TrendingUp, Medal, AlertCircle 
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { biomotorCategories } from '@/data/biomotorTests';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const team = useTeamStore((state) => state.getTeamById(id || ''));
  const deleteTeam = useTeamStore((state) => state.deleteTeam);
  const athletes = useAthleteStore((state) => state.athletes);
  const testSessions = useAthleteStore((state) => state.testSessions);

  if (!team) {
    return (
      <Layout title="Tim tidak ditemukan">
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Tim yang Anda cari tidak ditemukan</p>
          <Button onClick={() => navigate('/teams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Tim
          </Button>
        </div>
      </Layout>
    );
  }

  const teamAthletes = athletes.filter(a => a.team === team.name);
  const totalSessions = teamAthletes.reduce((acc, athlete) => {
    return acc + testSessions.filter(s => s.athleteId === athlete.id).length;
  }, 0);

  // Calculate team average scores per category
  const getCategoryAverage = (categoryId: string) => {
    const allScores: number[] = [];
    
    teamAthletes.forEach(athlete => {
      const athleteSessions = testSessions.filter(s => s.athleteId === athlete.id);
      if (athleteSessions.length > 0) {
        const latestSession = athleteSessions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        
        const categoryResults = latestSession.results.filter(r => r.categoryId === categoryId);
        if (categoryResults.length > 0) {
          const avg = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length;
          allScores.push(avg);
        }
      }
    });

    if (allScores.length === 0) return 0;
    return allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
  };

  const handleDeleteTeam = () => {
    deleteTeam(team.id);
    toast({
      title: "Tim dihapus",
      description: `Tim ${team.name} berhasil dihapus`,
    });
    navigate('/teams');
  };

  const getAthleteTestCount = (athleteId: string) => {
    return testSessions.filter(s => s.athleteId === athleteId).length;
  };

  return (
    <Layout
      title={team.name}
      subtitle={team.sport}
      showBackButton
    >
      <div className="px-4 pb-6 space-y-6">
        {/* Team Header */}
        <div className="p-4 rounded-2xl bg-card/80 border border-border/50">
          <div className="flex items-start gap-4">
            <div 
              className="flex items-center justify-center w-16 h-16 rounded-2xl shrink-0"
              style={{ backgroundColor: `${team.color}20` }}
            >
              <Users className="w-8 h-8" style={{ color: team.color }} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{team.name}</h2>
              <p className="text-muted-foreground">{team.sport}</p>
              {team.description && (
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {team.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <EditTeamSheet team={team}>
              <Button variant="outline" className="flex-1">
                Edit Tim
              </Button>
            </EditTeamSheet>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Tim?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tim "{team.name}" akan dihapus. Atlet dalam tim ini tidak akan terhapus.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTeam}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-card/50 border border-border/50 text-center">
            <Users className="w-5 h-5 mx-auto mb-1" style={{ color: team.color }} />
            <p className="text-lg font-bold">{teamAthletes.length}</p>
            <p className="text-xs text-muted-foreground">Atlet</p>
          </div>
          <div className="p-3 rounded-xl bg-card/50 border border-border/50 text-center">
            <Activity className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold">{totalSessions}</p>
            <p className="text-xs text-muted-foreground">Sesi Tes</p>
          </div>
          <div className="p-3 rounded-xl bg-card/50 border border-border/50 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">
              {teamAthletes.length > 0 
                ? (biomotorCategories.reduce((acc, cat) => acc + getCategoryAverage(cat.id), 0) / biomotorCategories.length).toFixed(1)
                : '-'}
            </p>
            <p className="text-xs text-muted-foreground">Rata-rata</p>
          </div>
        </div>

        {/* Category Averages */}
        {teamAthletes.length > 0 && totalSessions > 0 && (
          <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              Rata-rata Skor Tim per Kategori
            </h3>
            <div className="space-y-2">
              {biomotorCategories.map((category) => {
                const avg = getCategoryAverage(category.id);
                if (avg === 0) return null;
                return (
                  <div key={category.id} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-muted-foreground truncate">
                      {category.name}
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${(avg / 5) * 100}%`,
                          backgroundColor: `hsl(var(--${category.color}))`
                        }}
                      />
                    </div>
                    <div className="w-10 text-sm font-medium text-right">
                      {avg.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Athletes List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: team.color }} />
              Atlet dalam Tim ({teamAthletes.length})
            </h3>
            <AddAthleteSheet defaultTeam={team.name} defaultSport={team.sport}>
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Tambah
              </Button>
            </AddAthleteSheet>
          </div>

          {teamAthletes.length > 0 ? (
            <div className="space-y-2">
              {teamAthletes.map((athlete) => (
                <Link key={athlete.id} to={`/athletes/${athlete.id}`}>
                  <AthleteCard
                    athlete={athlete}
                    testCount={getAthleteTestCount(athlete.id)}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card/30 rounded-2xl border border-dashed border-border">
              <AlertCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground mb-3">
                Belum ada atlet dalam tim ini
              </p>
              <AddAthleteSheet defaultTeam={team.name} defaultSport={team.sport}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Tambah Atlet
                </Button>
              </AddAthleteSheet>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

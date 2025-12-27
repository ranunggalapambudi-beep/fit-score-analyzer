import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAthleteStore } from '@/store/athleteStore';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { ProgressComparison } from '@/components/athletes/ProgressComparison';

export default function Progress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const athletes = useAthleteStore((state) => state.athletes);
  const testSessions = useAthleteStore((state) => state.testSessions);
  
  const athlete = useMemo(() => athletes.find((a) => a.id === id), [athletes, id]);
  const sessions = useMemo(() => 
    testSessions.filter((s) => s.athleteId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [testSessions, id]
  );

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
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/athlete/${id}`)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold font-display">Perbandingan Progress</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Athlete Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{athlete.name}</h2>
            <p className="text-sm text-muted-foreground">{sessions.length} sesi tes</p>
          </div>
        </div>

        {/* Progress Comparison Component */}
        <ProgressComparison sessions={sessions} />
      </div>
    </Layout>
  );
}

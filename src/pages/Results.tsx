import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { useAthleteStore } from '@/store/athleteStore';
import { BarChart3 } from 'lucide-react';

export default function Results() {
  const navigate = useNavigate();
  const athletes = useAthleteStore((state) => state.athletes);
  const testSessions = useAthleteStore((state) => state.testSessions);

  const athletesWithTests = athletes.filter((a) =>
    testSessions.some((s) => s.athleteId === a.id)
  );

  return (
    <Layout title="Hasil Tes" subtitle="Lihat hasil tes atlet">
      <div className="px-4 py-6">
        {athletesWithTests.length > 0 ? (
          <div className="space-y-3">
            {athletesWithTests.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                testCount={testSessions.filter((s) => s.athleteId === athlete.id).length}
                onClick={() => navigate(`/athletes/${athlete.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold font-display">Belum ada hasil tes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Lakukan tes biomotor untuk melihat hasil
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

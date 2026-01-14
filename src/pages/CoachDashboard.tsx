import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { ScoreBadge } from '@/components/ui/score-badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { biomotorCategories } from '@/data/biomotorTests';
import { 
  Users, Activity, TrendingUp, TrendingDown, Target, 
  Medal, User, ChevronRight, BarChart3, Dumbbell, Loader2
} from 'lucide-react';

export default function CoachDashboard() {
  const navigate = useNavigate();
  const { athletes, testSessions, loading } = useSupabaseData();

  // Calculate team statistics
  const teamStats = useMemo(() => {
    const maleAthletes = athletes.filter(a => a.gender === 'male');
    const femaleAthletes = athletes.filter(a => a.gender === 'female');
    const athletesWithSessions = athletes.filter(a => 
      testSessions.some(s => s.athleteId === a.id)
    );
    
    return {
      totalAthletes: athletes.length,
      maleCount: maleAthletes.length,
      femaleCount: femaleAthletes.length,
      testedAthletes: athletesWithSessions.length,
      totalSessions: testSessions.length,
    };
  }, [athletes, testSessions]);

  // Calculate average scores per category by gender
  const categoryStatsByGender = useMemo(() => {
    const maleScores: Record<string, number[]> = {};
    const femaleScores: Record<string, number[]> = {};

    athletes.forEach(athlete => {
      const latestSession = testSessions
        .filter(s => s.athleteId === athlete.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (!latestSession) return;

      latestSession.results.forEach(result => {
        const target = athlete.gender === 'male' ? maleScores : femaleScores;
        if (!target[result.categoryId]) target[result.categoryId] = [];
        target[result.categoryId].push(result.score);
      });
    });

    const avgMale: Record<string, number> = {};
    const avgFemale: Record<string, number> = {};

    Object.entries(maleScores).forEach(([catId, scores]) => {
      avgMale[catId] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    Object.entries(femaleScores).forEach(([catId, scores]) => {
      avgFemale[catId] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    return { male: avgMale, female: avgFemale };
  }, [athletes, testSessions]);

  // Get top performers
  const topPerformers = useMemo(() => {
    const athleteScores = athletes.map(athlete => {
      const latestSession = testSessions
        .filter(s => s.athleteId === athlete.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (!latestSession) return { athlete, avgScore: 0 };

      const scores = latestSession.results.map(r => r.score);
      const avgScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;

      return { athlete, avgScore };
    });

    return athleteScores
      .filter(a => a.avgScore > 0)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
  }, [athletes, testSessions]);

  // Get athletes needing improvement
  const needsImprovement = useMemo(() => {
    const athleteScores = athletes.map(athlete => {
      const latestSession = testSessions
        .filter(s => s.athleteId === athlete.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (!latestSession) return { athlete, avgScore: 0, weakCategories: [] as string[] };

      const categoryScores: Record<string, number[]> = {};
      latestSession.results.forEach(r => {
        if (!categoryScores[r.categoryId]) categoryScores[r.categoryId] = [];
        categoryScores[r.categoryId].push(r.score);
      });

      const avgScores = Object.entries(categoryScores).map(([catId, scores]) => ({
        catId,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length
      }));

      const weakCategories = avgScores
        .filter(s => s.avg < 3)
        .map(s => biomotorCategories.find(c => c.id === s.catId)?.name || s.catId);

      const totalAvg = avgScores.reduce((a, b) => a + b.avg, 0) / avgScores.length;

      return { athlete, avgScore: totalAvg, weakCategories };
    });

    return athleteScores
      .filter(a => a.avgScore > 0 && a.avgScore < 3)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);
  }, [athletes, testSessions]);

  // Sports distribution
  const sportsDistribution = useMemo(() => {
    const distribution: Record<string, { male: number; female: number }> = {};
    athletes.forEach(a => {
      if (!distribution[a.sport]) distribution[a.sport] = { male: 0, female: 0 };
      distribution[a.sport][a.gender]++;
    });
    return Object.entries(distribution)
      .map(([sport, counts]) => ({ sport, ...counts, total: counts.male + counts.female }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [athletes]);

  const radarDataMale = useMemo(() => generateRadarData(categoryStatsByGender.male, true), [categoryStatsByGender.male]);
  const radarDataFemale = useMemo(() => generateRadarData(categoryStatsByGender.female, true), [categoryStatsByGender.female]);

  if (loading) {
    return (
      <Layout title="Dashboard Pelatih" subtitle="Statistik tim dan atlet">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard Pelatih" subtitle="Statistik tim dan atlet">
      <div className="px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Total Atlet</span>
            </div>
            <p className="text-2xl font-bold font-display">{teamStats.totalAthletes}</p>
            <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
              <span className="text-blue-500">{teamStats.maleCount} Pria</span>
              <span>•</span>
              <span className="text-pink-500">{teamStats.femaleCount} Wanita</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-endurance" />
              <span className="text-xs text-muted-foreground">Sesi Tes</span>
            </div>
            <p className="text-2xl font-bold font-display">{teamStats.totalSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {teamStats.testedAthletes} atlet sudah dites
            </p>
          </div>
        </section>

        {/* Radar Comparison by Gender */}
        {(radarDataMale.length > 0 || radarDataFemale.length > 0) && (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Rata-rata Tim per Gender
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Male Stats */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Pria</span>
                </div>
                {radarDataMale.length > 0 ? (
                  <RadarChart data={radarDataMale} height={180} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">Belum ada data</p>
                )}
              </div>

              {/* Female Stats */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span className="text-sm font-medium">Wanita</span>
                </div>
                {radarDataFemale.length > 0 ? (
                  <RadarChart data={radarDataFemale} height={180} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">Belum ada data</p>
                )}
              </div>
            </div>

            {/* Category Scores Table */}
            <div className="mt-4 space-y-2">
              {biomotorCategories.map(cat => {
                const maleScore = categoryStatsByGender.male[cat.id];
                const femaleScore = categoryStatsByGender.female[cat.id];
                if (!maleScore && !femaleScore) return null;
                
                return (
                  <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm">{cat.name}</span>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-blue-500">♂</span>
                        {maleScore ? <ScoreBadge score={Math.round(maleScore)} size="sm" showLabel={false} /> : <span className="text-xs text-muted-foreground">-</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-pink-500">♀</span>
                        {femaleScore ? <ScoreBadge score={Math.round(femaleScore)} size="sm" showLabel={false} /> : <span className="text-xs text-muted-foreground">-</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Sports Distribution */}
        {sportsDistribution.length > 0 && (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Distribusi Cabang Olahraga
            </h3>
            <div className="space-y-3">
              {sportsDistribution.map(sport => (
                <div key={sport.sport}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{sport.sport}</span>
                    <span className="text-muted-foreground">{sport.total} atlet</span>
                  </div>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
                    <div 
                      className="bg-blue-500 transition-all"
                      style={{ width: `${(sport.male / sport.total) * 100}%` }}
                    />
                    <div 
                      className="bg-pink-500 transition-all"
                      style={{ width: `${(sport.female / sport.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-speed" />
              Top Performers
            </h3>
            <div className="space-y-2">
              {topPerformers.map((item, idx) => (
                <button
                  key={item.athlete.id}
                  className="w-full p-3 rounded-lg bg-muted/30 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => navigate(`/athletes/${item.athlete.id}`)}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-500 text-black' :
                    idx === 1 ? 'bg-gray-400 text-black' :
                    idx === 2 ? 'bg-amber-700 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.athlete.photo ? (
                        <img src={item.athlete.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm truncate">{item.athlete.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className={item.athlete.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}>
                            {item.athlete.gender === 'male' ? '♂' : '♀'}
                          </span>
                          {item.athlete.sport}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={Math.round(item.avgScore)} size="sm" showLabel={false} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Needs Improvement */}
        {needsImprovement.length > 0 && (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-destructive" />
              Perlu Peningkatan
            </h3>
            <div className="space-y-2">
              {needsImprovement.map(item => (
                <button
                  key={item.athlete.id}
                  className="w-full p-3 rounded-lg bg-destructive/5 border border-destructive/20 flex items-center gap-3 hover:bg-destructive/10 transition-colors text-left"
                  onClick={() => navigate(`/athletes/${item.athlete.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.athlete.photo ? (
                        <img src={item.athlete.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-destructive" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm truncate">{item.athlete.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.weakCategories.slice(0, 2).map(cat => (
                            <span key={cat} className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={Math.round(item.avgScore)} size="sm" showLabel={false} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Gender Norm Reference */}
        <section className="p-4 rounded-xl bg-card border border-border/50">
          <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Referensi Norma Tes
          </h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Semua norma tes dalam sistem ini telah disesuaikan berdasarkan jenis kelamin:</p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-500 text-lg">♂</span>
                  <span className="font-medium text-foreground">Norma Pria</span>
                </div>
                <p className="text-xs">Standar yang lebih tinggi untuk tes kekuatan, kecepatan, dan daya tahan</p>
              </div>
              <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-pink-500 text-lg">♀</span>
                  <span className="font-medium text-foreground">Norma Wanita</span>
                </div>
                <p className="text-xs">Standar yang disesuaikan dengan karakteristik fisiologis wanita</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-3">
          <Button className="w-full gap-2" onClick={() => navigate('/athletes')}>
            <Users className="w-5 h-5" />
            Kelola Atlet
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/tests')}>
            <Activity className="w-5 h-5" />
            Lihat Tes
          </Button>
        </section>
      </div>
    </Layout>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { ScoreBadge } from '@/components/ui/score-badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { biomotorCategories } from '@/data/biomotorTests';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, Calendar, Loader2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SessionComparison() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const { athletes, testSessions, loading } = useSupabaseData();
  
  const athlete = useMemo(() => athletes.find((a) => a.id === athleteId), [athletes, athleteId]);
  const sessions = useMemo(() => 
    testSessions
      .filter((s) => s.athleteId === athleteId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [testSessions, athleteId]
  );

  const [session1Id, setSession1Id] = useState<string>('');
  const [session2Id, setSession2Id] = useState<string>('');

  // Initialize session IDs when sessions are loaded
  useEffect(() => {
    if (sessions.length >= 2 && !session1Id && !session2Id) {
      setSession1Id(sessions[0]?.id || '');
      setSession2Id(sessions[1]?.id || '');
    } else if (sessions.length === 1 && !session1Id) {
      setSession1Id(sessions[0]?.id || '');
    }
  }, [sessions, session1Id, session2Id]);

  const session1 = useMemo(() => sessions.find(s => s.id === session1Id), [sessions, session1Id]);
  const session2 = useMemo(() => sessions.find(s => s.id === session2Id), [sessions, session2Id]);

  const getSessionScores = (session: typeof sessions[0] | undefined) => {
    if (!session) return {};
    const scores: Record<string, number[]> = {};
    session.results.forEach((r) => {
      if (!scores[r.categoryId]) scores[r.categoryId] = [];
      scores[r.categoryId].push(r.score);
    });
    const avgScores: Record<string, number> = {};
    Object.entries(scores).forEach(([catId, catScores]) => {
      avgScores[catId] = catScores.reduce((a, b) => a + b, 0) / catScores.length;
    });
    return avgScores;
  };

  const session1Scores = useMemo(() => getSessionScores(session1), [session1]);
  const session2Scores = useMemo(() => getSessionScores(session2), [session2]);

  const radarData1 = useMemo(() => generateRadarData(session1Scores, true), [session1Scores]);
  const radarData2 = useMemo(() => generateRadarData(session2Scores, true), [session2Scores]);

  // Get comparison data with test details
  const comparisonData = useMemo(() => {
    if (!session1 || !session2) return [];
    
    const comparison: {
      categoryId: string;
      categoryName: string;
      tests: {
        testId: string;
        testName: string;
        value1: number;
        value2: number;
        score1: number;
        score2: number;
        unit: string;
        diff: number;
        scoreDiff: number;
      }[];
    }[] = [];

    biomotorCategories.forEach(cat => {
      const tests1 = session1.results.filter(r => r.categoryId === cat.id);
      const tests2 = session2.results.filter(r => r.categoryId === cat.id);
      
      if (tests1.length === 0 && tests2.length === 0) return;

      const allTestIds = new Set([
        ...tests1.map(t => t.testId),
        ...tests2.map(t => t.testId)
      ]);

      const testComparisons: typeof comparison[0]['tests'] = [];
      
      allTestIds.forEach(testId => {
        const t1 = tests1.find(t => t.testId === testId);
        const t2 = tests2.find(t => t.testId === testId);
        const test = cat.tests.find(t => t.id === testId);
        
        testComparisons.push({
          testId,
          testName: test?.name || testId,
          value1: t1?.value || 0,
          value2: t2?.value || 0,
          score1: t1?.score || 0,
          score2: t2?.score || 0,
          unit: t1?.unit || t2?.unit || '',
          diff: (t1?.value || 0) - (t2?.value || 0),
          scoreDiff: (t1?.score || 0) - (t2?.score || 0)
        });
      });

      if (testComparisons.length > 0) {
        comparison.push({
          categoryId: cat.id,
          categoryName: cat.name,
          tests: testComparisons
        });
      }
    });

    return comparison;
  }, [session1, session2]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout title="Perbandingan Sesi">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!athlete) {
    return (
      <Layout title="Memuat..." subtitle="Mencari data atlet">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memuat data atlet...</p>
        </div>
      </Layout>
    );
  }

  if (sessions.length < 2) {
    return (
      <Layout title="Perbandingan Sesi">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold font-display">Perbandingan Sesi</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted-foreground text-center">
            Minimal 2 sesi tes diperlukan untuk membandingkan progress
          </p>
          <Button className="mt-4" onClick={() => navigate(`/test-session/${athleteId}`)}>
            Mulai Sesi Tes
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold font-display">Perbandingan Progress</h1>
            <p className="text-xs text-muted-foreground">{athlete.name}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Session Selectors */}
        <section className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Sesi Terbaru
            </label>
            <Select value={session1Id} onValueChange={setSession1Id}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Pilih sesi" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map(s => (
                  <SelectItem key={s.id} value={s.id} disabled={s.id === session2Id}>
                    {formatDate(s.date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Sesi Sebelumnya
            </label>
            <Select value={session2Id} onValueChange={setSession2Id}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Pilih sesi" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map(s => (
                  <SelectItem key={s.id} value={s.id} disabled={s.id === session1Id}>
                    {formatDate(s.date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Radar Comparison */}
        {session1 && session2 && radarData1.length > 0 && (
          <section className="p-4 rounded-xl bg-card border border-border/50">
            <h3 className="font-semibold font-display mb-4">Perbandingan Radar</h3>
            <RadarChart 
              data={radarData1} 
              compareData={radarData2} 
              height={280} 
            />
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">{formatDate(session1.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent border-2 border-dashed border-accent" />
                <span className="text-muted-foreground">{formatDate(session2.date)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Category Score Comparison */}
        <section className="p-4 rounded-xl bg-card border border-border/50">
          <h3 className="font-semibold font-display mb-4">Perbandingan Kategori</h3>
          <div className="space-y-3">
            {biomotorCategories
              .filter(cat => session1Scores[cat.id] || session2Scores[cat.id])
              .map(cat => {
                const score1 = session1Scores[cat.id] || 0;
                const score2 = session2Scores[cat.id] || 0;
                const diff = score1 - score2;
                
                return (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <ScoreBadge score={Math.round(score2)} size="sm" showLabel={false} />
                        <span className="text-muted-foreground">→</span>
                        <ScoreBadge score={Math.round(score1)} size="sm" showLabel={false} />
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        diff > 0 ? 'text-endurance' : diff < 0 ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {diff > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : diff < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                        <span>{diff > 0 ? '+' : ''}{diff.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Detailed Test Comparison */}
        {comparisonData.map(group => (
          <section key={group.categoryId} className="rounded-xl bg-card border border-border/50 overflow-hidden">
            <div className="px-4 py-3 bg-muted/50 border-b border-border/50">
              <h4 className="font-semibold">{group.categoryName}</h4>
            </div>
            <div className="divide-y divide-border/50">
              {group.tests.map(test => (
                <div key={test.testId} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{test.testName}</span>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      test.scoreDiff > 0 ? 'text-endurance' : test.scoreDiff < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {test.scoreDiff > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : test.scoreDiff < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      <span>{test.scoreDiff > 0 ? '+' : ''}{test.scoreDiff}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="text-muted-foreground text-xs">Sebelum</span>
                      <span className="font-medium">{test.value2} {test.unit}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-primary/10">
                      <span className="text-muted-foreground text-xs">Sesudah</span>
                      <span className="font-medium">{test.value1} {test.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}

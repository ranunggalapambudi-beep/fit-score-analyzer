import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { ScoreBadge } from '@/components/ui/score-badge';
import { TestSession } from '@/types/athlete';
import { biomotorCategories } from '@/data/biomotorTests';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ProgressComparisonProps {
  sessions: TestSession[];
}

export function ProgressComparison({ sessions }: ProgressComparisonProps) {
  const sortedSessions = useMemo(() => 
    [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sessions]
  );

  const [session1Id, setSession1Id] = useState<string>(sortedSessions[0]?.id || '');
  const [session2Id, setSession2Id] = useState<string>(sortedSessions[1]?.id || '');

  const session1 = useMemo(() => sessions.find(s => s.id === session1Id), [sessions, session1Id]);
  const session2 = useMemo(() => sessions.find(s => s.id === session2Id), [sessions, session2Id]);

  const getSessionScores = (session: TestSession | undefined): Record<string, number> => {
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

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    const allCategories = new Set([...Object.keys(session1Scores), ...Object.keys(session2Scores)]);
    return Array.from(allCategories).map(catId => {
      const cat = biomotorCategories.find(c => c.id === catId);
      const score1 = session1Scores[catId] || 0;
      const score2 = session2Scores[catId] || 0;
      const diff = score1 - score2;
      return {
        categoryId: catId,
        categoryName: cat?.name || catId,
        score1,
        score2,
        diff,
        improved: diff > 0.1,
        declined: diff < -0.1,
      };
    });
  }, [session1Scores, session2Scores]);

  // Calculate test-level comparison
  const testComparison = useMemo(() => {
    if (!session1 || !session2) return [];
    
    const results: Array<{
      testId: string;
      testName: string;
      categoryName: string;
      value1: number;
      value2: number;
      unit: string;
      score1: number;
      score2: number;
      diff: number;
    }> = [];

    session1.results.forEach(r1 => {
      const r2 = session2.results.find(r => r.testId === r1.testId);
      if (r2) {
        const cat = biomotorCategories.find(c => c.id === r1.categoryId);
        const test = cat?.tests.find(t => t.id === r1.testId);
        results.push({
          testId: r1.testId,
          testName: test?.name || r1.testId,
          categoryName: cat?.name || r1.categoryId,
          value1: r1.value,
          value2: r2.value,
          unit: r1.unit,
          score1: r1.score,
          score2: r2.score,
          diff: r1.score - r2.score,
        });
      }
    });

    return results;
  }, [session1, session2]);

  if (sessions.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Minimal 2 sesi tes diperlukan untuk perbandingan</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => format(new Date(dateStr), 'd MMM yyyy', { locale: id });

  return (
    <div className="space-y-4">
      {/* Session Selectors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Pilih Sesi untuk Dibandingkan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sesi Terbaru</label>
              <Select value={session1Id} onValueChange={setSession1Id}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortedSessions.map(s => (
                    <SelectItem key={s.id} value={s.id} disabled={s.id === session2Id}>
                      {formatDate(s.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground mt-5" />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sesi Sebelumnya</label>
              <Select value={session2Id} onValueChange={setSession2Id}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortedSessions.map(s => (
                    <SelectItem key={s.id} value={s.id} disabled={s.id === session1Id}>
                      {formatDate(s.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart Comparison */}
      {session1 && session2 && radarData1.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Perbandingan Profil Biomotor</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart 
              data={radarData1} 
              compareData={radarData2}
              height={280} 
            />
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>{formatDate(session1.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span>{formatDate(session2.date)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Summary */}
      {comparisonData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Ringkasan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparisonData.map(cat => (
                <div 
                  key={cat.categoryId} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium text-sm">{cat.categoryName}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm">
                      <ScoreBadge score={Math.round(cat.score2)} size="sm" showLabel={false} />
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <ScoreBadge score={Math.round(cat.score1)} size="sm" showLabel={false} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      cat.improved ? 'text-endurance' : cat.declined ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {cat.improved ? (
                        <><TrendingUp className="w-4 h-4" /> +{cat.diff.toFixed(1)}</>
                      ) : cat.declined ? (
                        <><TrendingDown className="w-4 h-4" /> {cat.diff.toFixed(1)}</>
                      ) : (
                        <><Minus className="w-4 h-4" /> 0</>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Test Comparison */}
      {testComparison.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Detail Perbandingan Tes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {testComparison.map(test => (
                <div 
                  key={test.testId}
                  className="p-3 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{test.testName}</p>
                      <p className="text-xs text-muted-foreground">{test.categoryName}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      test.diff > 0.1 ? 'text-endurance' : test.diff < -0.1 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {test.diff > 0.1 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : test.diff < -0.1 ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-muted-foreground">
                      {test.value2} {test.unit}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">
                      {test.value1} {test.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

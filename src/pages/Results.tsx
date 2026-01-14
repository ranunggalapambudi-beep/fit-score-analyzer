import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScoreBadge } from '@/components/ui/score-badge';
import { biomotorCategories } from '@/data/biomotorTests';
import { 
  BarChart3, Search, X, Loader2, Activity, TrendingUp, 
  Calendar, ChevronRight, PlayCircle, FileText, Users
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function Results() {
  const navigate = useNavigate();
  const { athletes, testSessions, loading } = useSupabaseData();
  
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'athletes' | 'sessions'>('athletes');

  // Get unique sports from athletes with tests
  const athletesWithTests = useMemo(() => {
    return athletes.filter((a) =>
      testSessions.some((s) => s.athleteId === a.id)
    );
  }, [athletes, testSessions]);

  const uniqueSports = useMemo(() => {
    const sports = [...new Set(athletesWithTests.map(a => a.sport))];
    return sports.sort();
  }, [athletesWithTests]);

  const filteredAthletes = useMemo(() => {
    return athletesWithTests.filter((a) => {
      const matchesSearch = 
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.sport.toLowerCase().includes(search.toLowerCase());
      
      const matchesGender = genderFilter === 'all' || a.gender === genderFilter;
      const matchesSport = sportFilter === 'all' || a.sport === sportFilter;
      
      return matchesSearch && matchesGender && matchesSport;
    });
  }, [athletesWithTests, search, genderFilter, sportFilter]);

  // All sessions sorted by date
  const allSessions = useMemo(() => {
    return testSessions
      .map(session => {
        const athlete = athletes.find(a => a.id === session.athleteId);
        if (!athlete) return null;
        
        // Calculate average score
        const avgScore = session.results.length > 0
          ? session.results.reduce((a, b) => a + b.score, 0) / session.results.length
          : 0;
        
        return {
          ...session,
          athlete,
          avgScore
        };
      })
      .filter(Boolean)
      .filter(session => {
        if (!session) return false;
        const matchesSearch = 
          session.athlete.name.toLowerCase().includes(search.toLowerCase()) ||
          session.athlete.sport.toLowerCase().includes(search.toLowerCase());
        const matchesGender = genderFilter === 'all' || session.athlete.gender === genderFilter;
        const matchesSport = sportFilter === 'all' || session.athlete.sport === sportFilter;
        return matchesSearch && matchesGender && matchesSport;
      })
      .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());
  }, [testSessions, athletes, search, genderFilter, sportFilter]);

  const hasActiveFilters = genderFilter !== 'all' || sportFilter !== 'all' || search.length > 0;

  const clearFilters = () => {
    setGenderFilter('all');
    setSportFilter('all');
    setSearch('');
  };

  if (loading) {
    return (
      <Layout title="Hasil Tes" subtitle="Lihat hasil tes atlet">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Hasil Tes" subtitle="Lihat hasil tes atlet">
      <div className="px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari atlet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'athletes' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setViewMode('athletes')}
          >
            <Users className="w-4 h-4" />
            Per Atlet
          </Button>
          <Button
            variant={viewMode === 'sessions' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setViewMode('sessions')}
          >
            <Calendar className="w-4 h-4" />
            Per Sesi
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Jenis Kelamin" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50">
              <SelectItem value="all">Semua Gender</SelectItem>
              <SelectItem value="male">Laki-laki</SelectItem>
              <SelectItem value="female">Perempuan</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Cabang Olahraga" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50 max-h-60">
              <SelectItem value="all">Semua Cabor</SelectItem>
              {uniqueSports.map((sport) => (
                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Results Count */}
        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground">
            Menampilkan {viewMode === 'athletes' ? filteredAthletes.length : allSessions.length} hasil
          </p>
        )}

        {/* Athletes View */}
        {viewMode === 'athletes' && (
          <>
            {filteredAthletes.length > 0 ? (
              <div className="space-y-3">
                {filteredAthletes.map((athlete) => {
                  const athleteSessions = testSessions.filter((s) => s.athleteId === athlete.id);
                  const latestSession = athleteSessions.sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0];
                  
                  const avgScore = latestSession?.results.length > 0
                    ? latestSession.results.reduce((a, b) => a + b.score, 0) / latestSession.results.length
                    : 0;

                  return (
                    <div
                      key={athlete.id}
                      className="p-4 rounded-xl bg-card border border-border/50 space-y-3"
                    >
                      {/* Athlete Info */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0 overflow-hidden">
                          {athlete.photo ? (
                            <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{athlete.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {athlete.sport} • {athlete.gender === 'male' ? 'L' : 'P'} • {athleteSessions.length} sesi
                          </p>
                        </div>
                        {avgScore > 0 && (
                          <ScoreBadge score={Math.round(avgScore)} size="md" showLabel={false} />
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 text-xs"
                          onClick={() => navigate(`/athletes/${athlete.id}`)}
                        >
                          <Activity className="w-3 h-3" />
                          Detail
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 text-xs"
                          onClick={() => navigate(`/athletes/${athlete.id}/dashboard`)}
                        >
                          <TrendingUp className="w-3 h-3" />
                          Tren
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="gap-1 text-xs"
                          onClick={() => navigate(`/test-session/${athlete.id}`)}
                        >
                          <PlayCircle className="w-3 h-3" />
                          Tes
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : athletesWithTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold font-display">Belum ada hasil tes</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Lakukan tes biomotor untuk melihat hasil
                </p>
                <Button onClick={() => navigate('/athletes')} className="gap-2">
                  <Users className="w-4 h-4" />
                  Pilih Atlet
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold font-display">Tidak ditemukan</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tidak ada hasil yang sesuai dengan filter
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                  Reset Filter
                </Button>
              </div>
            )}
          </>
        )}

        {/* Sessions View */}
        {viewMode === 'sessions' && (
          <>
            {allSessions.length > 0 ? (
              <div className="space-y-3">
                {allSessions.map((session) => {
                  if (!session) return null;
                  
                  // Group results by category
                  const categoryScores: Record<string, number[]> = {};
                  session.results.forEach(r => {
                    if (!categoryScores[r.categoryId]) categoryScores[r.categoryId] = [];
                    categoryScores[r.categoryId].push(r.score);
                  });

                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl bg-card border border-border/50 space-y-3"
                    >
                      {/* Session Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0 overflow-hidden">
                            {session.athlete.photo ? (
                              <img src={session.athlete.photo} alt={session.athlete.name} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{session.athlete.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(session.date), 'd MMM yyyy', { locale: localeId })}
                            </p>
                          </div>
                        </div>
                        <ScoreBadge score={Math.round(session.avgScore)} size="md" showLabel={false} />
                      </div>

                      {/* Category Scores */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(categoryScores).map(([catId, scores]) => {
                          const category = biomotorCategories.find(c => c.id === catId);
                          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                          return (
                            <div 
                              key={catId}
                              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                              style={{ 
                                backgroundColor: `hsl(var(--${category?.color || 'primary'}) / 0.1)`,
                                color: `hsl(var(--${category?.color || 'primary'}))`
                              }}
                            >
                              <span>{category?.name || catId}</span>
                              <span className="font-bold">{avgScore.toFixed(1)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-1 text-xs"
                          onClick={() => navigate(`/athletes/${session.athlete.id}`)}
                        >
                          <Activity className="w-3 h-3" />
                          Detail Atlet
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-1 text-xs"
                          onClick={() => navigate(`/athletes/${session.athlete.id}/dashboard`)}
                        >
                          <TrendingUp className="w-3 h-3" />
                          Dashboard
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="gap-1 text-xs"
                          onClick={() => navigate(`/analysis/${session.athlete.id}`)}
                        >
                          <FileText className="w-3 h-3" />
                          AI
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold font-display">Belum ada sesi tes</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Lakukan tes untuk melihat riwayat sesi
                </p>
                <Button onClick={() => navigate('/athletes')} className="gap-2">
                  <Users className="w-4 h-4" />
                  Pilih Atlet
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

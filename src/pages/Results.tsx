import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart3, Search, X, Loader2 } from 'lucide-react';

export default function Results() {
  const navigate = useNavigate();
  const { athletes, testSessions, loading } = useSupabaseData();
  
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');

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
            Menampilkan {filteredAthletes.length} dari {athletesWithTests.length} atlet
          </p>
        )}

        {/* Athletes List */}
        {filteredAthletes.length > 0 ? (
          <div className="space-y-3">
            {filteredAthletes.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                testCount={testSessions.filter((s) => s.athleteId === athlete.id).length}
                onClick={() => navigate(`/athletes/${athlete.id}`)}
              />
            ))}
          </div>
        ) : athletesWithTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold font-display">Belum ada hasil tes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Lakukan tes biomotor untuk melihat hasil
            </p>
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
      </div>
    </Layout>
  );
}

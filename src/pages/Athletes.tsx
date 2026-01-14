import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { AddAthleteSheet } from '@/components/athletes/AddAthleteSheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { CSVImportDialog } from '@/components/import/CSVImportDialog';
import { exportAthletesToCSV } from '@/utils/csvExport';
import { Search, Plus, Users, Download, Upload, Loader2, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { Athlete } from '@/types/athlete';

export default function Athletes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const { athletes, testSessions, loading, addAthlete, refreshData } = useSupabaseData();

  // Get unique sports from athletes
  const uniqueSports = useMemo(() => {
    const sports = [...new Set(athletes.map(a => a.sport))];
    return sports.sort();
  }, [athletes]);

  const filteredAthletes = useMemo(() => {
    return athletes.filter((a) => {
      const matchesSearch = 
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.sport.toLowerCase().includes(search.toLowerCase());
      
      const matchesGender = genderFilter === 'all' || a.gender === genderFilter;
      const matchesSport = sportFilter === 'all' || a.sport === sportFilter;
      
      return matchesSearch && matchesGender && matchesSport;
    });
  }, [athletes, search, genderFilter, sportFilter]);

  const hasActiveFilters = genderFilter !== 'all' || sportFilter !== 'all';

  const clearFilters = () => {
    setGenderFilter('all');
    setSportFilter('all');
    setSearch('');
  };

  const getTestCount = (athleteId: string) => {
    return testSessions.filter((s) => s.athleteId === athleteId).length;
  };

  const handleExport = () => {
    if (athletes.length === 0) {
      toast.error('Tidak ada data atlet untuk diekspor');
      return;
    }
    exportAthletesToCSV(athletes);
    toast.success('Data atlet berhasil diekspor');
  };

  const handleImportAthletes = async (importedAthletes: Omit<Athlete, 'id'>[]) => {
    let successCount = 0;
    for (const athlete of importedAthletes) {
      const result = await addAthlete(athlete);
      if (result) successCount++;
    }
    toast.success(`${successCount} atlet berhasil diimpor`);
    refreshData();
  };

  if (loading) {
    return (
      <Layout title="Atlet" subtitle="Kelola data atlet">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Atlet" subtitle="Kelola data atlet">
      <div className="px-4 py-6 space-y-4">
        {/* Search & Actions */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari atlet atau cabor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <AddAthleteSheet
            onSuccess={refreshData}
            trigger={
              <Button size="icon" className="shrink-0">
                <Plus className="w-5 h-5" />
              </Button>
            }
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

        {/* Import/Export Buttons */}
        <div className="flex gap-2">
          <CSVImportDialog 
            type="athletes" 
            onImportAthletes={handleImportAthletes}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Import
              </Button>
            }
          />
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Results Count */}
        {(search || hasActiveFilters) && (
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredAthletes.length} dari {athletes.length} atlet
          </p>
        )}

        {/* Athletes List */}
        {filteredAthletes.length > 0 ? (
          <div className="space-y-3">
            {filteredAthletes.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                testCount={getTestCount(athlete.id)}
                onClick={() => navigate(`/athletes/${athlete.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold font-display text-foreground">
              {search || hasActiveFilters ? 'Atlet tidak ditemukan' : 'Belum ada atlet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search || hasActiveFilters
                ? 'Coba kata kunci atau filter lain'
                : 'Tambahkan atlet pertama untuk mulai melakukan tes biomotor'}
            </p>
            {!search && !hasActiveFilters && (
              <AddAthleteSheet
                onSuccess={refreshData}
                trigger={
                  <Button className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Tambah Atlet
                  </Button>
                }
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

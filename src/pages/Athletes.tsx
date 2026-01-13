import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AthleteCard } from '@/components/athletes/AthleteCard';
import { AddAthleteSheet } from '@/components/athletes/AddAthleteSheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { CSVImportDialog } from '@/components/import/CSVImportDialog';
import { exportAthletesToCSV } from '@/utils/csvExport';
import { Search, Plus, Users, Download, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Athlete } from '@/types/athlete';

export default function Athletes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { athletes, testSessions, loading, addAthlete, refreshData } = useSupabaseData();

  const filteredAthletes = athletes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.sport.toLowerCase().includes(search.toLowerCase())
  );

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
              {search ? 'Atlet tidak ditemukan' : 'Belum ada atlet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search
                ? 'Coba kata kunci lain'
                : 'Tambahkan atlet pertama untuk mulai melakukan tes biomotor'}
            </p>
            {!search && (
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
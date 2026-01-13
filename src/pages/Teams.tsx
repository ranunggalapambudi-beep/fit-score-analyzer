import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TeamCard } from '@/components/teams/TeamCard';
import { AddTeamSheet } from '@/components/teams/AddTeamSheet';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { CSVImportDialog } from '@/components/import/CSVImportDialog';
import { exportTeamsToCSV } from '@/utils/csvExport';
import { Search, Plus, Users2, Download, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Team } from '@/types/team';

export default function Teams() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { teams, athletes, loading, addTeam, refreshData } = useSupabaseData();

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.sport.toLowerCase().includes(search.toLowerCase())
  );

  const getAthleteCount = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return 0;
    return athletes.filter(a => a.team === team.name).length;
  };

  const handleExport = () => {
    if (teams.length === 0) {
      toast.error('Tidak ada data tim untuk diekspor');
      return;
    }
    exportTeamsToCSV(teams);
    toast.success('Data tim berhasil diekspor');
  };

  const handleImportTeams = async (importedTeams: Omit<Team, 'id' | 'createdAt'>[]) => {
    let successCount = 0;
    for (const team of importedTeams) {
      const result = await addTeam(team);
      if (result) successCount++;
    }
    toast.success(`${successCount} tim berhasil diimpor`);
    refreshData();
  };

  if (loading) {
    return (
      <Layout title="Manajemen Tim" subtitle="Kelola tim dan grup atlet">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Manajemen Tim"
      subtitle="Kelola tim dan grup atlet"
    >
      <div className="px-4 pb-6 space-y-4">
        {/* Search & Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari tim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <AddTeamSheet onSuccess={refreshData}>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Tim</span>
            </Button>
          </AddTeamSheet>
        </div>

        {/* Import/Export Buttons */}
        <div className="flex gap-2">
          <CSVImportDialog 
            type="teams" 
            onImportTeams={handleImportTeams}
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card/80 border border-border/50 text-center">
            <p className="text-2xl font-bold text-primary">{teams.length}</p>
            <p className="text-sm text-muted-foreground">Total Tim</p>
          </div>
          <div className="p-4 rounded-2xl bg-card/80 border border-border/50 text-center">
            <p className="text-2xl font-bold text-accent">{athletes.length}</p>
            <p className="text-sm text-muted-foreground">Total Atlet</p>
          </div>
        </div>

        {/* Teams List */}
        {filteredTeams.length > 0 ? (
          <div className="space-y-3">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                athleteCount={getAthleteCount(team.id)}
                onClick={() => navigate(`/teams/${team.id}`)}
              />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4">
              <Users2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Belum Ada Tim</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Buat tim untuk mengelompokkan atlet berdasarkan cabang olahraga
            </p>
            <AddTeamSheet onSuccess={refreshData}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Buat Tim Pertama
              </Button>
            </AddTeamSheet>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Tidak ada tim ditemukan</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
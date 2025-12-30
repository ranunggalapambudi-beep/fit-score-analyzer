import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TeamCard } from '@/components/teams/TeamCard';
import { AddTeamSheet } from '@/components/teams/AddTeamSheet';
import { useTeamStore } from '@/store/teamStore';
import { useAthleteStore } from '@/store/athleteStore';
import { Search, Plus, Users2 } from 'lucide-react';

export default function Teams() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const teams = useTeamStore((state) => state.teams);
  const athletes = useAthleteStore((state) => state.athletes);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.sport.toLowerCase().includes(search.toLowerCase())
  );

  const getAthleteCount = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return 0;
    return athletes.filter(a => a.team === team.name).length;
  };

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
          <AddTeamSheet>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Tim</span>
            </Button>
          </AddTeamSheet>
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
            <AddTeamSheet>
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

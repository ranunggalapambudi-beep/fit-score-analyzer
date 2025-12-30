import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Team } from '@/types/team';

interface TeamStore {
  teams: Team[];
  addTeam: (team: Team) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  getTeamById: (id: string) => Team | undefined;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teams: [],
      
      addTeam: (team) => 
        set((state) => ({ teams: [...state.teams, team] })),
      
      updateTeam: (id, team) =>
        set((state) => ({
          teams: state.teams.map((t) => 
            t.id === id ? { ...t, ...team } : t
          ),
        })),
      
      deleteTeam: (id) =>
        set((state) => ({
          teams: state.teams.filter((t) => t.id !== id),
        })),
      
      getTeamById: (id) => get().teams.find((t) => t.id === id),
    }),
    {
      name: 'biomotor-team-storage',
    }
  )
);

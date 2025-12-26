import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Athlete, TestResult, TestSession } from '@/types/athlete';

interface AthleteStore {
  athletes: Athlete[];
  testSessions: TestSession[];
  addAthlete: (athlete: Athlete) => void;
  updateAthlete: (id: string, athlete: Partial<Athlete>) => void;
  deleteAthlete: (id: string) => void;
  addTestSession: (session: TestSession) => void;
  updateTestSession: (id: string, session: Partial<TestSession>) => void;
  deleteTestSession: (id: string) => void;
  getAthleteById: (id: string) => Athlete | undefined;
  getSessionsByAthleteId: (athleteId: string) => TestSession[];
  getLatestSessionByAthleteId: (athleteId: string) => TestSession | undefined;
}

export const useAthleteStore = create<AthleteStore>()(
  persist(
    (set, get) => ({
      athletes: [],
      testSessions: [],
      
      addAthlete: (athlete) => 
        set((state) => ({ athletes: [...state.athletes, athlete] })),
      
      updateAthlete: (id, athlete) =>
        set((state) => ({
          athletes: state.athletes.map((a) => 
            a.id === id ? { ...a, ...athlete } : a
          ),
        })),
      
      deleteAthlete: (id) =>
        set((state) => ({
          athletes: state.athletes.filter((a) => a.id !== id),
          testSessions: state.testSessions.filter((s) => s.athleteId !== id),
        })),
      
      addTestSession: (session) =>
        set((state) => ({ testSessions: [...state.testSessions, session] })),
      
      updateTestSession: (id, session) =>
        set((state) => ({
          testSessions: state.testSessions.map((s) =>
            s.id === id ? { ...s, ...session } : s
          ),
        })),
      
      deleteTestSession: (id) =>
        set((state) => ({
          testSessions: state.testSessions.filter((s) => s.id !== id),
        })),
      
      getAthleteById: (id) => get().athletes.find((a) => a.id === id),
      
      getSessionsByAthleteId: (athleteId) =>
        get().testSessions.filter((s) => s.athleteId === athleteId),
      
      getLatestSessionByAthleteId: (athleteId) => {
        const sessions = get().testSessions
          .filter((s) => s.athleteId === athleteId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sessions[0];
      },
    }),
    {
      name: 'biomotor-athlete-storage',
    }
  )
);

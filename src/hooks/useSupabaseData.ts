import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Athlete, TestSession } from '@/types/athlete';
import { Team } from '@/types/team';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAthletes = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching athletes:', error);
      return;
    }
    
    setAthletes(data.map(a => ({
      id: a.id,
      createdAt: a.created_at,
      name: a.name,
      dateOfBirth: a.date_of_birth,
      gender: a.gender as 'male' | 'female',
      sport: a.sport,
      team: a.team || undefined,
      height: a.height ? Number(a.height) : undefined,
      weight: a.weight ? Number(a.weight) : undefined,
      photo: a.photo || undefined,
    })));
  }, [user]);

  const fetchTeams = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }
    
    setTeams(data.map(t => ({
      id: t.id,
      name: t.name,
      sport: t.sport,
      description: t.description || undefined,
      color: t.color || '#3B82F6',
      createdAt: t.created_at,
    })));
  }, [user]);

  const fetchTestSessions = useCallback(async () => {
    if (!user) return;
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('test_sessions')
      .select('*')
      .order('date', { ascending: false });
    
    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return;
    }
    
    const sessionsWithResults: TestSession[] = [];
    
    for (const session of sessions) {
      const { data: results } = await supabase
        .from('test_results')
        .select('*')
        .eq('session_id', session.id);
      
      sessionsWithResults.push({
        id: session.id,
        athleteId: session.athlete_id,
        date: session.date,
        results: (results || []).map(r => ({
          id: r.id,
          athleteId: session.athlete_id,
          testId: r.test_id,
          categoryId: r.category_id,
          value: Number(r.value),
          unit: '',
          score: r.score,
          date: session.date,
        })),
        notes: session.notes || undefined,
      });
    }
    
    setTestSessions(sessionsWithResults);
  }, [user]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAthletes(), fetchTeams(), fetchTestSessions()]);
    setLoading(false);
  }, [fetchAthletes, fetchTeams, fetchTestSessions]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setAthletes([]);
      setTeams([]);
      setTestSessions([]);
      setLoading(false);
    }
  }, [user, refreshData]);

  // Athletes CRUD
  const addAthlete = async (athlete: Omit<Athlete, 'id'>) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('athletes')
      .insert({
        user_id: user.id,
        name: athlete.name,
        date_of_birth: athlete.dateOfBirth,
        gender: athlete.gender,
        sport: athlete.sport,
        team: athlete.team || null,
        height: athlete.height || null,
        weight: athlete.weight || null,
        photo: athlete.photo || null,
      })
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    await fetchAthletes();
    return data;
  };

  const updateAthlete = async (id: string, updates: Partial<Athlete>) => {
    const { error } = await supabase
      .from('athletes')
      .update({
        name: updates.name,
        date_of_birth: updates.dateOfBirth,
        gender: updates.gender,
        sport: updates.sport,
        team: updates.team || null,
        height: updates.height || null,
        weight: updates.weight || null,
        photo: updates.photo || null,
      })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    await fetchAthletes();
    return true;
  };

  const deleteAthlete = async (id: string) => {
    const { error } = await supabase
      .from('athletes')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    await fetchAthletes();
    await fetchTestSessions();
    return true;
  };

  // Teams CRUD
  const addTeam = async (team: Omit<Team, 'id' | 'createdAt'>) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('teams')
      .insert({
        user_id: user.id,
        name: team.name,
        sport: team.sport,
        description: team.description || null,
        color: team.color || '#3B82F6',
      })
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    await fetchTeams();
    return data;
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    const { error } = await supabase
      .from('teams')
      .update({
        name: updates.name,
        sport: updates.sport,
        description: updates.description || null,
        color: updates.color,
      })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    await fetchTeams();
    return true;
  };

  const deleteTeam = async (id: string) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    await fetchTeams();
    return true;
  };

  // Test Sessions CRUD
  const addTestSession = async (session: Omit<TestSession, 'id'>) => {
    if (!user) return null;
    
    const { data: sessionData, error: sessionError } = await supabase
      .from('test_sessions')
      .insert({
        user_id: user.id,
        athlete_id: session.athleteId,
        date: session.date,
        notes: session.notes || null,
      })
      .select()
      .single();
    
    if (sessionError) {
      toast({ title: 'Error', description: sessionError.message, variant: 'destructive' });
      return null;
    }
    
    // Insert test results
    const results = session.results.map(r => ({
      session_id: sessionData.id,
      test_id: r.testId,
      category_id: r.categoryId,
      value: r.value,
      score: r.score,
    }));
    
    const { error: resultsError } = await supabase
      .from('test_results')
      .insert(results);
    
    if (resultsError) {
      toast({ title: 'Error', description: resultsError.message, variant: 'destructive' });
    }
    
    await fetchTestSessions();
    return sessionData;
  };

  const deleteTestSession = async (id: string) => {
    const { error } = await supabase
      .from('test_sessions')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    await fetchTestSessions();
    return true;
  };

  return {
    athletes,
    teams,
    testSessions,
    loading,
    refreshData,
    addAthlete,
    updateAthlete,
    deleteAthlete,
    addTeam,
    updateTeam,
    deleteTeam,
    addTestSession,
    deleteTestSession,
    getAthlete: (id: string) => athletes.find(a => a.id === id),
    getTeam: (id: string) => teams.find(t => t.id === id),
    getAthleteTestSessions: (athleteId: string) => testSessions.filter(s => s.athleteId === athleteId),
  };
}

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Athlete, TestSession } from '@/types/athlete';
import { Team } from '@/types/team';
import { useToast } from '@/hooks/use-toast';
import { computeTestScores, type ParsedAthleteTest } from '@/utils/csvExport';
import { biomotorCategories, calculateScore } from '@/data/biomotorTests';

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

  const addAthletes = async (newAthletes: Omit<Athlete, 'id'>[]) => {
    if (!user || newAthletes.length === 0) return { inserted: 0, updated: 0 };

    // 1. Fetch existing athletes for deduplication
    const { data: existingData, error: existingErr } = await supabase
      .from('athletes')
      .select('id, name, date_of_birth')
      .eq('user_id', user.id);

    if (existingErr) {
      toast({ title: 'Error', description: existingErr.message, variant: 'destructive' });
      return { inserted: 0, updated: 0 };
    }

    const normalizeName = (n: string) => n.trim().toLowerCase().replace(/\s+/g, ' ');
    const existingMap = new Map<string, string>();
    for (const e of existingData || []) {
      const key = `${normalizeName(e.name)}|${e.date_of_birth}`;
      existingMap.set(key, e.id);
    }

    const toInsertRows: any[] = [];
    const athleteIdByIndex = new Map<number, string>();

    newAthletes.forEach((athlete, idx) => {
      const key = `${normalizeName(athlete.name)}|${athlete.dateOfBirth}`;
      const existingId = existingMap.get(key);
      if (existingId) {
        athleteIdByIndex.set(idx, existingId);
      } else {
        toInsertRows.push({
          user_id: user.id,
          name: athlete.name,
          date_of_birth: athlete.dateOfBirth,
          gender: athlete.gender,
          sport: athlete.sport,
          team: athlete.team || null,
          height: athlete.height || null,
          weight: athlete.weight || null,
          photo: athlete.photo || null,
        });
      }
    });

    // 2. Update existing athletes in parallel
    const updatePromises = [];
    newAthletes.forEach((athlete, idx) => {
      const existingId = athleteIdByIndex.get(idx);
      if (existingId) {
        updatePromises.push(
          supabase.from('athletes').update({
            sport: athlete.sport,
            team: athlete.team || null,
            height: athlete.height || null,
            weight: athlete.weight || null,
          }).eq('id', existingId)
        );
      }
    });
    await Promise.all(updatePromises);

    // 3. Insert new athletes
    let insertedIds: string[] = [];
    if (toInsertRows.length > 0) {
      const { data, error } = await supabase
        .from('athletes')
        .insert(toInsertRows)
        .select('id');
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        insertedIds = (data || []).map(d => d.id);
      }
    }

    // Map inserted IDs back to indices
    let insertIdx = 0;
    newAthletes.forEach((_, idx) => {
      if (!athleteIdByIndex.has(idx)) {
        athleteIdByIndex.set(idx, insertedIds[insertIdx++]);
      }
    });

    // 4. Insert test sessions for ALL athletes that carry parsed tests
    try {
      const nowIso = new Date().toISOString();
      const sessionsToCreate: { athleteId: string; results: ReturnType<typeof computeTestScores> }[] = [];
      newAthletes.forEach((a, idx) => {
        const tests = (a as Athlete & { __tests?: ParsedAthleteTest[] }).__tests;
        if (!tests || tests.length === 0) return;
        const athleteId = athleteIdByIndex.get(idx);
        if (!athleteId) return;
        const scored = computeTestScores(tests, { gender: a.gender, dateOfBirth: a.dateOfBirth });
        if (scored.length > 0) sessionsToCreate.push({ athleteId, results: scored });
      });

      if (sessionsToCreate.length > 0) {
        const sessionRows = sessionsToCreate.map(s => ({
          user_id: user.id,
          athlete_id: s.athleteId,
          date: nowIso,
          notes: 'Diimpor dari file Excel/CSV',
        }));
        const { data: sessionData, error: sessionErr } = await supabase
          .from('test_sessions')
          .insert(sessionRows)
          .select('id');
        if (!sessionErr && sessionData) {
          const resultRows = sessionData.flatMap((s, i) =>
            sessionsToCreate[i].results.map(r => ({
              session_id: s.id,
              test_id: r.testId,
              category_id: r.categoryId,
              value: r.value,
              score: r.score,
            })),
          );
          if (resultRows.length > 0) {
            await supabase.from('test_results').insert(resultRows);
          }
        }
      }
    } catch (e) {
      console.error('Failed to import test sessions:', e);
    }

    await fetchAthletes();
    await fetchTestSessions();
    return { inserted: insertedIds.length, updated: updatePromises.length };
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

  // Update session metadata (date / notes)
  const updateTestSession = async (
    id: string,
    updates: { date?: string; notes?: string | null },
  ) => {
    const payload: Record<string, unknown> = {};
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    const { error } = await supabase.from('test_sessions').update(payload).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    await fetchTestSessions();
    return true;
  };

  // Add or update a single test result inside an existing session.
  // Re-computes the score using the athlete profile.
  const upsertTestResult = async (
    sessionId: string,
    athlete: { gender: 'male' | 'female'; dateOfBirth: string },
    testId: string,
    value: number,
  ) => {
    const category = biomotorCategories.find(c => c.tests.some(t => t.id === testId));
    const test = category?.tests.find(t => t.id === testId);
    if (!category || !test) {
      toast({ title: 'Error', description: 'Tes tidak ditemukan', variant: 'destructive' });
      return false;
    }
    const age = Math.floor(
      (Date.now() - new Date(athlete.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    const score = calculateScore(value, test, athlete.gender, age);

    // Find existing result
    const { data: existing } = await supabase
      .from('test_results')
      .select('id')
      .eq('session_id', sessionId)
      .eq('test_id', testId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from('test_results')
        .update({ value, score, category_id: category.id })
        .eq('id', existing.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return false;
      }
    } else {
      const { error } = await supabase.from('test_results').insert({
        session_id: sessionId,
        test_id: testId,
        category_id: category.id,
        value,
        score,
      });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return false;
      }
    }
    await fetchTestSessions();
    return true;
  };

  const deleteTestResult = async (resultId: string) => {
    const { error } = await supabase.from('test_results').delete().eq('id', resultId);
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
    addAthletes,
    updateAthlete,
    deleteAthlete,
    addTeam,
    updateTeam,
    deleteTeam,
    addTestSession,
    deleteTestSession,
    updateTestSession,
    upsertTestResult,
    deleteTestResult,
    getAthlete: (id: string) => athletes.find(a => a.id === id),
    getTeam: (id: string) => teams.find(t => t.id === id),
    getAthleteTestSessions: (athleteId: string) => testSessions.filter(s => s.athleteId === athleteId),
  };
}

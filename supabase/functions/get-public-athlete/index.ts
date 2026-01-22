import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { athleteId } = await req.json();

    if (!athleteId) {
      return new Response(
        JSON.stringify({ error: 'Athlete ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for public access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch athlete data
    const { data: athlete, error: athleteError } = await supabase
      .from('athletes')
      .select('*')
      .eq('id', athleteId)
      .single();

    if (athleteError || !athlete) {
      console.error('Athlete not found:', athleteError);
      return new Response(
        JSON.stringify({ error: 'Athlete not found', athlete: null, latestSession: null }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch latest test session
    const { data: sessions, error: sessionsError } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: false })
      .limit(1);

    let latestSession = null;

    if (!sessionsError && sessions && sessions.length > 0) {
      const session = sessions[0];
      
      // Fetch test results for this session
      const { data: results, error: resultsError } = await supabase
        .from('test_results')
        .select('*')
        .eq('session_id', session.id);

      if (!resultsError && results) {
        latestSession = {
          id: session.id,
          date: session.date,
          notes: session.notes,
          results: results
        };
      }
    }

    return new Response(
      JSON.stringify({ 
        athlete: {
          id: athlete.id,
          name: athlete.name,
          date_of_birth: athlete.date_of_birth,
          gender: athlete.gender,
          sport: athlete.sport,
          team: athlete.team,
          height: athlete.height,
          weight: athlete.weight,
          photo: athlete.photo
        },
        latestSession 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-public-athlete:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

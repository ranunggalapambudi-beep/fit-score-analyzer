import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

 // Biomotor categories data for AI analysis
 const biomotorCategories = [
   { id: 'strength', name: 'Kekuatan' },
   { id: 'endurance', name: 'Daya Tahan' },
   { id: 'speed', name: 'Kecepatan' },
   { id: 'flexibility', name: 'Kelentukan' },
   { id: 'agility', name: 'Kelincahan' },
   { id: 'balance', name: 'Keseimbangan' },
   { id: 'coordination', name: 'Koordinasi' },
   { id: 'power', name: 'Daya Ledak' },
 ];
 
 // Generate AI analysis for athlete
 async function generateAIAnalysis(
   athlete: any,
   results: any[],
   categoryAverages: any[]
 ): Promise<string | null> {
   const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
   if (!LOVABLE_API_KEY) {
     console.log("LOVABLE_API_KEY not configured, skipping AI analysis");
     return null;
   }
 
   if (results.length === 0) {
     return null;
   }
 
   // Calculate age
   const age = Math.floor(
     (new Date().getTime() - new Date(athlete.date_of_birth).getTime()) /
     (365.25 * 24 * 60 * 60 * 1000)
   );
 
   // Find strengths and weaknesses
   const sortedCategories = [...categoryAverages].sort((a, b) => b.averageScore - a.averageScore);
   const strengths = sortedCategories.filter(c => c.averageScore >= 4);
   const weaknesses = sortedCategories.filter(c => c.averageScore <= 2);
 
   const prompt = `Kamu adalah pelatih olahraga profesional. Berikan analisis SINGKAT tentang kondisi biomotor atlet berikut.
 
 DATA ATLET:
 - Nama: ${athlete.name}
 - Usia: ${age} tahun
 - Cabang Olahraga: ${athlete.sport}
 ${athlete.height ? `- Tinggi: ${athlete.height} cm` : ''}
 ${athlete.weight ? `- Berat: ${athlete.weight} kg` : ''}
 
 HASIL TES BIOMOTOR:
 ${categoryAverages.map(c => `- ${c.categoryName}: Skor ${c.averageScore.toFixed(1)}/5`).join('\n')}
 
 ${strengths.length > 0 ? `\nKEKUATAN: ${strengths.map(s => s.categoryName).join(', ')}` : ''}
 ${weaknesses.length > 0 ? `\nKELEMAHAN: ${weaknesses.map(w => w.categoryName).join(', ')}` : ''}
 
 INSTRUKSI:
 - Berikan analisis dalam format yang MUDAH DIBACA
 - Maksimal 3-4 paragraf singkat
 - Fokus pada: (1) Kondisi umum, (2) Keunggulan, (3) Area perbaikan, (4) Rekomendasi latihan
 - Gunakan bahasa yang mudah dipahami`;
 
   try {
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-2.5-flash",
         messages: [
           { 
             role: "system", 
             content: "Kamu adalah pelatih olahraga profesional. Berikan analisis yang informatif, mudah dipahami, dan actionable." 
           },
           { role: "user", content: prompt }
         ],
       }),
     });
 
     if (!response.ok) {
       console.error("AI gateway error:", response.status);
       return null;
     }
 
     const data = await response.json();
     return data.choices?.[0]?.message?.content || null;
   } catch (error) {
     console.error("Error generating AI analysis:", error);
     return null;
   }
 }
 
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
     let aiAnalysis = null;
     let categoryAverages: any[] = [];

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
         
         // Calculate category averages for AI analysis
         const categoryResults: Record<string, number[]> = {};
         results.forEach((result: any) => {
           if (!categoryResults[result.category_id]) {
             categoryResults[result.category_id] = [];
           }
           categoryResults[result.category_id].push(result.score);
         });
         
         categoryAverages = Object.entries(categoryResults).map(([catId, scores]) => {
           const category = biomotorCategories.find(c => c.id === catId);
           return {
             categoryId: catId,
             categoryName: category?.name || catId,
             averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
           };
         });
         
         // Generate AI analysis
         aiAnalysis = await generateAIAnalysis(athlete, results, categoryAverages);
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
         latestSession,
         aiAnalysis,
         categoryAverages
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

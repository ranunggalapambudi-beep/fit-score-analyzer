import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const TestResultSchema = z.object({
  categoryId: z.string().min(1).max(100),
  categoryName: z.string().min(1).max(100),
  testId: z.string().min(1).max(100),
  testName: z.string().min(1).max(200),
  value: z.number(),
  unit: z.string().min(1).max(50),
  score: z.number().min(1).max(5),
});

const AthleteDataSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(1).max(120),
  gender: z.string().min(1).max(20),
  sport: z.string().min(1).max(100),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  results: z.array(TestResultSchema).min(1).max(100),
});

const RequestBodySchema = z.object({
  athleteData: AthleteDataSchema,
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate JWT and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;
    console.log("Authenticated user:", userId);

    // Input validation
    let validatedBody;
    try {
      const rawBody = await req.json();
      validatedBody = RequestBodySchema.parse(rawBody);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validationError instanceof z.ZodError 
            ? validationError.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            : 'Validation failed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { athleteData } = validatedBody;
    
    console.log("Analyzing biomotor data for:", athleteData.name);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Group results by category
    const categoryResults: Record<string, { scores: number[]; tests: z.infer<typeof TestResultSchema>[] }> = {};
    athleteData.results.forEach((result) => {
      if (!categoryResults[result.categoryId]) {
        categoryResults[result.categoryId] = { scores: [], tests: [] };
      }
      categoryResults[result.categoryId].scores.push(result.score);
      categoryResults[result.categoryId].tests.push(result);
    });

    // Calculate average per category
    const categoryAverages = Object.entries(categoryResults).map(([catId, data]) => ({
      categoryId: catId,
      categoryName: data.tests[0]?.categoryName || catId,
      averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      tests: data.tests,
    }));

    // Find strengths and weaknesses
    const sortedCategories = [...categoryAverages].sort((a, b) => b.averageScore - a.averageScore);
    const strengths = sortedCategories.filter(c => c.averageScore >= 4);
    const weaknesses = sortedCategories.filter(c => c.averageScore <= 2);

    // Build prompt for AI - Focused on improvements for weak areas only
    const prompt = `Kamu adalah pelatih olahraga profesional. Berikan analisis SINGKAT dan FOKUS hanya pada komponen biomotor yang LEMAH (skor ≤2) untuk atlet berikut.

DATA ATLET:
- Nama: ${athleteData.name}
- Usia: ${athleteData.age} tahun
- Cabang Olahraga: ${athleteData.sport}

KOMPONEN BIOMOTOR YANG PERLU DITINGKATKAN:
${weaknesses.length > 0 ? weaknesses.map(w => `- ${w.categoryName}: Skor ${w.averageScore.toFixed(1)}/5\n  Tes: ${w.tests.map(t => `${t.testName} (${t.value} ${t.unit})`).join(', ')}`).join('\n') : 'Semua komponen sudah baik (skor >2)'}

${strengths.length > 0 ? `\nKEUNGGULAN (pertahankan): ${strengths.map(s => s.categoryName).join(', ')}` : ''}

INSTRUKSI:
- Berikan analisis SINGKAT dalam 2-3 kalimat per poin
- FOKUS hanya pada cara meningkatkan komponen yang LEMAH
- Berikan 3-4 latihan spesifik untuk memperbaiki kelemahan
- Jangan bertele-tele, langsung ke poin penting

FORMAT JAWABAN (SINGKAT):
1. MASALAH UTAMA: Sebutkan 1-2 kalimat masalah biomotor utama
2. REKOMENDASI LATIHAN: 3-4 latihan spesifik dengan dosis (set x rep atau durasi)
3. PRIORITAS LATIHAN: Urutan prioritas latihan untuk 4 minggu ke depan
4. CATATAN: 1 tips penting untuk recovery/nutrisi`;

    console.log("Sending request to Lovable AI...");

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
            content: "Kamu adalah pelatih olahraga profesional dengan keahlian dalam periodisasi latihan, pengembangan biomotor, dan ilmu keolahragaan. Berikan analisis dan rekomendasi yang terstruktur, spesifik, dan berbasis bukti ilmiah." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Batas permintaan tercapai, coba lagi nanti." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit habis, silakan tambahkan kredit." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    console.log("Analysis completed successfully for user:", userId);

    return new Response(JSON.stringify({ 
      analysis,
      categoryAverages,
      strengths: strengths.map(s => s.categoryName),
      weaknesses: weaknesses.map(w => w.categoryName),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-biomotor function:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

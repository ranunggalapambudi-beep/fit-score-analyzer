import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestResult {
  categoryId: string;
  categoryName: string;
  testId: string;
  testName: string;
  value: number;
  unit: string;
  score: number;
}

interface AthleteData {
  name: string;
  age: number;
  gender: string;
  sport: string;
  weight?: number;
  height?: number;
  results: TestResult[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { athleteData } = await req.json() as { athleteData: AthleteData };
    
    console.log("Analyzing biomotor data for:", athleteData.name);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Group results by category
    const categoryResults: Record<string, { scores: number[]; tests: TestResult[] }> = {};
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

    // Build prompt for AI
    const prompt = `Kamu adalah pelatih olahraga profesional dan ahli dalam ilmu keolahragaan. Analisis data biomotor atlet berikut dan berikan rekomendasi latihan yang spesifik dan terstruktur dalam Bahasa Indonesia.

DATA ATLET:
- Nama: ${athleteData.name}
- Usia: ${athleteData.age} tahun
- Jenis Kelamin: ${athleteData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
- Cabang Olahraga: ${athleteData.sport}
${athleteData.weight ? `- Berat Badan: ${athleteData.weight} kg` : ''}
${athleteData.height ? `- Tinggi Badan: ${athleteData.height} cm` : ''}

HASIL TES BIOMOTOR:
${categoryAverages.map(cat => `
${cat.categoryName.toUpperCase()} (Rata-rata Skor: ${cat.averageScore.toFixed(1)}/5):
${cat.tests.map(t => `  - ${t.testName}: ${t.value} ${t.unit} (Skor: ${t.score}/5)`).join('\n')}`).join('\n')}

KEUNGGULAN:
${strengths.length > 0 ? strengths.map(s => `- ${s.categoryName}: ${s.averageScore.toFixed(1)}/5`).join('\n') : 'Belum ada kategori dengan skor sangat baik (≥4)'}

KELEMAHAN:
${weaknesses.length > 0 ? weaknesses.map(w => `- ${w.categoryName}: ${w.averageScore.toFixed(1)}/5`).join('\n') : 'Tidak ada kategori dengan skor kurang (≤2)'}

Berikan analisis dalam format berikut:
1. RINGKASAN PROFIL BIOMOTOR (2-3 kalimat tentang kondisi fisik atlet secara keseluruhan)
2. ANALISIS KEUNGGULAN (jelaskan apa yang sudah baik dan bagaimana mempertahankannya)
3. ANALISIS KELEMAHAN (jelaskan area yang perlu ditingkatkan dan mengapa penting untuk cabor ini)
4. REKOMENDASI LATIHAN (minimal 5 latihan spesifik dengan:
   - Nama latihan
   - Target komponen biomotor
   - Dosis latihan (set x repetisi atau durasi)
   - Frekuensi per minggu
   - Intensitas yang disarankan)
5. PERIODISASI (saran pembagian periode latihan 4-8 minggu)
6. TIPS TAMBAHAN (nutrisi, recovery, dll yang relevan)`;

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

    console.log("Analysis completed successfully");

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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

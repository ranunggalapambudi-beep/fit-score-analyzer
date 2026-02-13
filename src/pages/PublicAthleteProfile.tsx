import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
 import { User, Calendar, Ruler, Weight, Trophy, Target, FileText, AlertCircle, Brain, Sparkles } from 'lucide-react';
import { RadarChart } from '@/components/charts/RadarChart';
import { biomotorCategories } from '@/data/biomotorTests';
import hirocrossLogo from '@/assets/hirocross-logo.png';
 import vocafitLogo from '@/assets/vocafit-logo.png';

interface AthleteData {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  sport: string;
  team?: string;
  height?: number;
  weight?: number;
  photo?: string;
}

interface TestResult {
  id: string;
  test_id: string;
  category_id: string;
  value: number;
  score: number;
}

interface TestSession {
  id: string;
  date: string;
  notes?: string;
  results: TestResult[];
}

 interface CategoryAverage {
   categoryId: string;
   categoryName: string;
   averageScore: number;
 }
 
const getScoreLabel = (score: number): { label: string; color: string } => {
  if (score >= 5) return { label: 'Baik Sekali', color: 'text-green-600 bg-green-100' };
  if (score >= 4) return { label: 'Baik', color: 'text-blue-600 bg-blue-100' };
  if (score >= 3) return { label: 'Cukup', color: 'text-yellow-600 bg-yellow-100' };
  if (score >= 2) return { label: 'Kurang', color: 'text-orange-600 bg-orange-100' };
  return { label: 'Kurang Sekali', color: 'text-red-600 bg-red-100' };
};

const calculateAge = (dateOfBirth: string): number => {
  return Math.floor(
    (new Date().getTime() - new Date(dateOfBirth).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)
  );
};

const calculateBMI = (weight: number, height: number): { value: number; category: string } => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  let category = '';
  if (bmi < 18.5) category = 'Kurus';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Gemuk';
  else category = 'Obesitas';
  return { value: parseFloat(bmi.toFixed(1)), category };
};

export default function PublicAthleteProfile() {
   const { id } = useParams<{ id: string }>();
   const [athlete, setAthlete] = useState<AthleteData | null>(null);
   const [latestSession, setLatestSession] = useState<TestSession | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [categoryAverages, setCategoryAverages] = useState<CategoryAverage[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [isVocaFit] = useState(true); // VocaFit version for scanned profiles

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID atlet tidak valid');
        setLoading(false);
        return;
      }

      try {
        // Fetch athlete data (using service role via edge function for public access)
        const { data: athleteData, error: athleteError } = await supabase
          .functions.invoke('get-public-athlete', {
            body: { athleteId: id }
          });

        if (athleteError) throw athleteError;
        if (!athleteData?.athlete) {
          setError('Atlet tidak ditemukan');
          setLoading(false);
          return;
        }

        setAthlete(athleteData.athlete);
        setLatestSession(athleteData.latestSession);
         setAiAnalysis(athleteData.aiAnalysis || null);
         setCategoryAverages(athleteData.categoryAverages || []);
      } catch (err) {
        console.error('Error fetching athlete:', err);
        setError('Gagal memuat data atlet');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Data Tidak Tersedia</h2>
            <p className="text-muted-foreground">{error || 'Atlet tidak ditemukan'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const age = calculateAge(athlete.date_of_birth);
  const bmi = athlete.height && athlete.weight 
    ? calculateBMI(athlete.weight, athlete.height) 
    : null;

  // Prepare radar chart data - only include categories that have results
  const radarData = latestSession?.results 
    ? biomotorCategories
        .map(category => {
          const categoryResults = latestSession.results.filter(r => r.category_id === category.id);
          if (categoryResults.length === 0) return null; // Skip empty categories
          const avgScore = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length;
          return {
            category: category.name,
            score: Math.round(avgScore * 20), // Convert 1-5 to 0-100
            fullMark: 100
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null) // Remove null entries
    : [];
  
  // Get categories that have results for display
  const categoriesWithResults = latestSession?.results
    ? biomotorCategories.filter(category => 
        latestSession.results.some(r => r.category_id === category.id)
      )
    : [];

   // Format AI analysis text with proper line breaks
   const formatAnalysisText = (text: string) => {
     return text.split('\n').map((line, index) => {
       // Check if line is a header (starts with ** or number)
       const isHeader = line.match(/^\*\*.*\*\*$/) || line.match(/^\d+\./);
       const cleanLine = line.replace(/\*\*/g, '');
       
       if (!cleanLine.trim()) return null;
       
       if (isHeader) {
         return (
           <p key={index} className="font-semibold text-foreground mt-3 first:mt-0">
             {cleanLine}
           </p>
         );
       }
       return (
         <p key={index} className="text-muted-foreground mb-2">
           {cleanLine}
         </p>
       );
     });
   };
 
   return (
     <div className={`min-h-screen bg-gradient-to-br ${isVocaFit ? 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' : 'from-background to-muted'}`}>
       {/* Header */}
          <div className={`${isVocaFit ? 'bg-blue-600' : 'bg-primary'} text-white p-4`}>
           <div className="max-w-2xl mx-auto">
             <img src={vocafitLogo} alt="VocaFit" className="h-16 object-contain" />
             <p className="text-xs opacity-80 mt-1">Profil Atlet Digital</p>
          </div>
        </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Athlete Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {/* Photo */}
              <div className="flex-shrink-0">
                {athlete.photo ? (
                   <img 
                     src={athlete.photo} 
                     alt={athlete.name} 
                     className={`w-24 h-24 rounded-full object-cover border-4 ${isVocaFit ? 'border-blue-600' : 'border-primary'}`}
                   />
                ) : (
                   <div className={`w-24 h-24 rounded-full ${isVocaFit ? 'bg-blue-100' : 'bg-muted'} border-4 ${isVocaFit ? 'border-blue-600' : 'border-primary'} flex items-center justify-center`}>
                     <User className={`w-12 h-12 ${isVocaFit ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">{athlete.name}</h2>
                <Badge variant="secondary" className="text-sm">
                  <Trophy className="w-3 h-3 mr-1" />
                  {athlete.sport}
                </Badge>
                {athlete.team && (
                  <p className="text-sm text-muted-foreground">{athlete.team}</p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
               <div className={`${isVocaFit ? 'bg-blue-100' : 'bg-muted'} rounded-lg p-3 text-center`}>
                 <Calendar className={`w-5 h-5 mx-auto ${isVocaFit ? 'text-blue-600' : 'text-primary'} mb-1`} />
                 <p className="text-lg font-bold">{age}</p>
                 <p className="text-xs text-muted-foreground">Tahun</p>
               </div>
               <div className={`${isVocaFit ? 'bg-blue-100' : 'bg-muted'} rounded-lg p-3 text-center`}>
                 <User className={`w-5 h-5 mx-auto ${isVocaFit ? 'text-blue-600' : 'text-primary'} mb-1`} />
                 <p className="text-lg font-bold">{athlete.gender === 'male' ? 'L' : 'P'}</p>
                 <p className="text-xs text-muted-foreground">Gender</p>
               </div>
              {athlete.height && (
                 <div className={`${isVocaFit ? 'bg-blue-100' : 'bg-muted'} rounded-lg p-3 text-center`}>
                   <Ruler className={`w-5 h-5 mx-auto ${isVocaFit ? 'text-blue-600' : 'text-primary'} mb-1`} />
                   <p className="text-lg font-bold">{athlete.height}</p>
                   <p className="text-xs text-muted-foreground">cm</p>
                 </div>
              )}
              {athlete.weight && (
                 <div className={`${isVocaFit ? 'bg-blue-100' : 'bg-muted'} rounded-lg p-3 text-center`}>
                   <Weight className={`w-5 h-5 mx-auto ${isVocaFit ? 'text-blue-600' : 'text-primary'} mb-1`} />
                   <p className="text-lg font-bold">{athlete.weight}</p>
                   <p className="text-xs text-muted-foreground">kg</p>
                 </div>
              )}
            </div>

            {/* BMI */}
            {bmi && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">IMT (Indeks Massa Tubuh)</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">{bmi.value}</span>
                    <Badge variant="outline" className="ml-2">{bmi.category}</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Hasil Tes Biomotor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestSession ? (
              <div className="space-y-6">
                {/* Session Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tanggal Tes</span>
                  <span className="font-medium">
                    {new Date(latestSession.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Radar Chart */}
                {radarData.length > 0 && (
                  <div className="h-64">
                    <RadarChart data={radarData} />
                  </div>
                )}

                 {/* Category Scores Summary */}
                 {categoryAverages.length > 0 && (
                   <div className="space-y-2">
                     <h4 className="font-medium text-sm text-muted-foreground">Skor Kategori</h4>
                     <div className="grid grid-cols-2 gap-2">
                       {categoryAverages.map((cat) => {
                         const scoreInfo = getScoreLabel(cat.averageScore);
                         return (
                           <div key={cat.categoryId} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                             <span className="text-sm font-medium">{cat.categoryName}</span>
                             <Badge className={scoreInfo.color} variant="outline">
                               {cat.averageScore.toFixed(1)}
                             </Badge>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}
 
                {/* Detailed Results */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Detail Hasil</h4>
                  {categoriesWithResults.length > 0 ? (
                    categoriesWithResults.map(category => {
                      const categoryResults = latestSession.results.filter(r => r.category_id === category.id);

                      return (
                        <div key={category.id} className="border rounded-lg p-3">
                          <h5 className="font-medium text-sm mb-2">{category.name}</h5>
                          <div className="space-y-2">
                            {categoryResults.map(result => {
                              const test = category.tests.find(t => t.id === result.test_id);
                              const unit = test?.norms?.[0]?.unit || '';
                              const scoreInfo = getScoreLabel(result.score);
                              return (
                                <div key={result.id} className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">{test?.name || result.test_id}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{result.value} {unit}</span>
                                    <Badge className={scoreInfo.color} variant="outline">
                                      {scoreInfo.label}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Tidak ada hasil tes yang tercatat untuk sesi ini.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h4 className="font-medium mb-1">Belum Ada Hasil Tes</h4>
                <p className="text-sm text-muted-foreground">
                  Atlet ini belum memiliki hasil tes biomotor yang tercatat.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

          {/* AI Analysis Section */}
          {aiAnalysis && (
             <Card className={`${isVocaFit ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 dark:to-background' : 'border-primary/20 bg-gradient-to-br from-primary/5 to-background'}`}>
              <CardHeader>
                 <CardTitle className={`flex items-center gap-2 ${isVocaFit ? 'text-blue-600' : 'text-primary'}`}>
                   <div className={`p-2 ${isVocaFit ? 'bg-blue-100' : 'bg-primary/10'} rounded-lg`}>
                    <Brain className={`w-5 h-5 ${isVocaFit ? 'text-blue-600' : ''}`} />
                  </div>
                  <div>
                    <span>Analisis AI</span>
                    <p className="text-xs font-normal text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                      Powered by VocaFit AI
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {formatAnalysisText(aiAnalysis)}
                </div>
              </CardContent>
            </Card>
          )}
 
        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4">
           <p>Profil Atlet Digital oleh VocaFit © {new Date().getFullYear()}</p>
           <p className="mt-1 opacity-60">Powered by HIROCROSS Measure</p>
        </div>
      </div>
    </div>
  );
}

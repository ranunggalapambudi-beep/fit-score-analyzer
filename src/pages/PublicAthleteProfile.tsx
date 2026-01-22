import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Calendar, Ruler, Weight, Trophy, Target, FileText, AlertCircle } from 'lucide-react';
import { RadarChart } from '@/components/charts/RadarChart';
import { biomotorCategories } from '@/data/biomotorTests';
import hirocrossLogo from '@/assets/hirocross-logo.png';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Prepare radar chart data
  const radarData = latestSession?.results 
    ? biomotorCategories.map(category => {
        const categoryResults = latestSession.results.filter(r => r.category_id === category.id);
        const avgScore = categoryResults.length > 0
          ? categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length
          : 0;
        return {
          category: category.name,
          score: Math.round(avgScore * 20), // Convert 1-5 to 0-100
          fullMark: 100
        };
      })
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <img src={hirocrossLogo} alt="Hirocross" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold">HIROCROSS</h1>
            <p className="text-xs opacity-80">Profil Atlet Digital</p>
          </div>
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
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted border-4 border-primary flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
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
              <div className="bg-muted rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{age}</p>
                <p className="text-xs text-muted-foreground">Tahun</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <User className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{athlete.gender === 'male' ? 'L' : 'P'}</p>
                <p className="text-xs text-muted-foreground">Gender</p>
              </div>
              {athlete.height && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <Ruler className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold">{athlete.height}</p>
                  <p className="text-xs text-muted-foreground">cm</p>
                </div>
              )}
              {athlete.weight && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <Weight className="w-5 h-5 mx-auto text-primary mb-1" />
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

                {/* Detailed Results */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Detail Hasil</h4>
                  {biomotorCategories.map(category => {
                    const categoryResults = latestSession.results.filter(r => r.category_id === category.id);
                    if (categoryResults.length === 0) return null;

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
                  })}
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

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4">
          <p>Profil Atlet Digital oleh Hirocross © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

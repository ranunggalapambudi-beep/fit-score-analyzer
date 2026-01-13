import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { ScoreBadge } from '@/components/ui/score-badge';
import { useTeamStore } from '@/store/teamStore';
import { useAthleteStore } from '@/store/athleteStore';
import { biomotorCategories } from '@/data/biomotorTests';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, Users, User, TrendingUp, TrendingDown,
  BarChart3, FileDown, Loader2
} from 'lucide-react';
import { useMemo, useState, useRef } from 'react';
import { toast } from 'sonner';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import hirocrossLogo from '@/assets/hirocross-logo.png';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(221, 83%, 53%)', // blue
  'hsl(142, 71%, 45%)', // green
  'hsl(38, 92%, 50%)', // orange
  'hsl(280, 67%, 52%)', // purple
];

interface AthleteScores {
  athleteId: string;
  athleteName: string;
  categoryScores: Record<string, number>;
  overallScore: number;
}

export default function TeamComparison() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  
  const team = useTeamStore((state) => state.getTeamById(teamId || ''));
  const athletes = useAthleteStore((state) => state.athletes);
  const testSessions = useAthleteStore((state) => state.testSessions);
  
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const teamAthletes = useMemo(() => 
    athletes.filter(a => a.team === team?.name),
    [athletes, team]
  );

  // Calculate scores for each athlete
  const athleteScores: AthleteScores[] = useMemo(() => {
    return teamAthletes.map(athlete => {
      const sessions = testSessions.filter(s => s.athleteId === athlete.id);
      if (sessions.length === 0) {
        return {
          athleteId: athlete.id,
          athleteName: athlete.name,
          categoryScores: {},
          overallScore: 0
        };
      }

      const latestSession = sessions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      const scores: Record<string, number[]> = {};
      latestSession.results.forEach((r) => {
        if (!scores[r.categoryId]) scores[r.categoryId] = [];
        scores[r.categoryId].push(r.score);
      });

      const categoryScores: Record<string, number> = {};
      let totalScore = 0;
      let categoryCount = 0;

      Object.entries(scores).forEach(([catId, catScores]) => {
        const avg = catScores.reduce((a, b) => a + b, 0) / catScores.length;
        categoryScores[catId] = avg;
        totalScore += avg;
        categoryCount++;
      });

      return {
        athleteId: athlete.id,
        athleteName: athlete.name,
        categoryScores,
        overallScore: categoryCount > 0 ? totalScore / categoryCount : 0
      };
    }).filter(a => a.overallScore > 0);
  }, [teamAthletes, testSessions]);

  // Selected athletes data
  const selectedAthletesData = useMemo(() => 
    athleteScores.filter(a => selectedAthletes.includes(a.athleteId)),
    [athleteScores, selectedAthletes]
  );

  // Bar chart data
  const barChartData = useMemo(() => {
    return biomotorCategories.map(cat => {
      const data: Record<string, unknown> = { category: cat.name };
      selectedAthletesData.forEach(athlete => {
        data[athlete.athleteName] = athlete.categoryScores[cat.id] || 0;
      });
      return data;
    }).filter(d => {
      // Only include categories that have data
      return selectedAthletesData.some(a => a.categoryScores[biomotorCategories.find(c => c.name === d.category)?.id || ''] > 0);
    });
  }, [selectedAthletesData]);

  // Radar chart data for comparison
  const radarComparisonData = useMemo(() => {
    if (selectedAthletesData.length === 0) return [];
    
    // Use first athlete as primary
    const primaryData = selectedAthletesData[0];
    return generateRadarData(primaryData.categoryScores, true);
  }, [selectedAthletesData]);

  const radarCompareData = useMemo(() => {
    if (selectedAthletesData.length < 2) return undefined;
    return generateRadarData(selectedAthletesData[1].categoryScores, true);
  }, [selectedAthletesData]);

  const toggleAthleteSelection = (athleteId: string) => {
    setSelectedAthletes(prev => {
      if (prev.includes(athleteId)) {
        return prev.filter(id => id !== athleteId);
      }
      if (prev.length >= 6) {
        toast.warning('Maksimal 6 atlet untuk perbandingan');
        return prev;
      }
      return [...prev, athleteId];
    });
  };

  const selectAll = () => {
    const maxAthletes = athleteScores.slice(0, 6).map(a => a.athleteId);
    setSelectedAthletes(maxAthletes);
  };

  const clearSelection = () => {
    setSelectedAthletes([]);
  };

  const handleExportPDF = async () => {
    if (!printRef.current || selectedAthletesData.length === 0) return;

    setIsGeneratingPDF(true);
    toast.info('Sedang membuat PDF...');

    try {
      const element = printRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 5;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      pdf.save(`Perbandingan_Tim_${team?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF berhasil dibuat!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal membuat PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!team) {
    return (
      <Layout title="Tim tidak ditemukan">
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Tim tidak ditemukan</p>
          <Button onClick={() => navigate('/teams')}>Kembali ke Daftar Tim</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/teams/${teamId}`)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold font-display">Perbandingan Tim</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Team Info */}
        <section className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
            style={{ backgroundColor: `${team.color}20` }}
          >
            <Users className="w-6 h-6" style={{ color: team.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold font-display truncate">{team.name}</h2>
            <p className="text-sm text-muted-foreground">{team.sport}</p>
          </div>
        </section>

        {/* Athlete Selection */}
        <section className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-display flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Pilih Atlet ({selectedAthletes.length}/6)
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Pilih Semua
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Hapus
              </Button>
            </div>
          </div>

          {athleteScores.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Tidak ada atlet dengan data tes
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {athleteScores.map((athlete, idx) => (
                <label
                  key={athlete.athleteId}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAthletes.includes(athlete.athleteId)
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={selectedAthletes.includes(athlete.athleteId)}
                    onCheckedChange={() => toggleAthleteSelection(athlete.athleteId)}
                  />
                  <div 
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{athlete.athleteName}</p>
                    <p className="text-xs text-muted-foreground">
                      Skor: {athlete.overallScore.toFixed(1)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* Comparison Charts */}
        {selectedAthletesData.length > 0 && (
          <>
            {/* Radar Chart (for 2 athletes) */}
            {selectedAthletesData.length === 2 && radarComparisonData.length > 0 && (
              <section className="p-4 rounded-xl bg-card border border-border/50">
                <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Perbandingan Radar
                </h3>
                <div className="flex justify-center gap-4 mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>{selectedAthletesData[0].athleteName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span>{selectedAthletesData[1].athleteName}</span>
                  </div>
                </div>
                <RadarChart 
                  data={radarComparisonData} 
                  compareData={radarCompareData} 
                  height={300} 
                />
              </section>
            )}

            {/* Bar Chart */}
            <section className="p-4 rounded-xl bg-card border border-border/50">
              <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Perbandingan per Kategori
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                    {selectedAthletesData.map((athlete, idx) => (
                      <Bar 
                        key={athlete.athleteId}
                        dataKey={athlete.athleteName}
                        fill={COLORS[idx % COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Rankings Table */}
            <section className="p-4 rounded-xl bg-card border border-border/50">
              <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Peringkat Atlet
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">Nama</th>
                      <th className="text-center py-2 px-2">Rata-rata</th>
                      <th className="text-center py-2 px-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAthletesData
                      .sort((a, b) => b.overallScore - a.overallScore)
                      .map((athlete, idx) => (
                        <tr key={athlete.athleteId} className="border-b border-border/50">
                          <td className="py-3 px-2 font-bold text-primary">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-2 font-medium">{athlete.athleteName}</td>
                          <td className="py-3 px-2 text-center">
                            <ScoreBadge score={Math.round(athlete.overallScore)} size="sm" />
                          </td>
                          <td className="py-3 px-2 text-center">
                            {athlete.overallScore >= 3.5 ? (
                              <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : athlete.overallScore < 2.5 ? (
                              <TrendingDown className="w-4 h-4 text-rose-500 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Export Button */}
            <Button 
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              className="w-full gap-2"
              variant="outline"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              {isGeneratingPDF ? 'Membuat PDF...' : 'Export Perbandingan ke PDF'}
            </Button>
          </>
        )}

        {/* Empty State */}
        {selectedAthletes.length === 0 && athleteScores.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Pilih atlet untuk melihat perbandingan</p>
          </div>
        )}
      </div>

      {/* Hidden PDF Content */}
      <div 
        ref={printRef} 
        className="fixed left-[-9999px] top-0 bg-white text-black"
        style={{ width: '1100px', padding: '40px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-red-600">
          <div className="flex items-center gap-4">
            <img src={hirocrossLogo} alt="Hirocross" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HIROCROSS</h1>
              <p className="text-sm text-gray-600">Perbandingan Performa Tim</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Tim: {team?.name}</p>
            <p>Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Athletes Compared */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Atlet yang Dibandingkan</h2>
          <div className="flex flex-wrap gap-2">
            {selectedAthletesData.map((athlete, idx) => (
              <span 
                key={athlete.athleteId}
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              >
                {athlete.athleteName}
              </span>
            ))}
          </div>
        </div>

        {/* Rankings */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Peringkat Atlet</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-3 py-2 border-b">Peringkat</th>
                <th className="text-left px-3 py-2 border-b">Nama Atlet</th>
                <th className="text-center px-3 py-2 border-b">Skor Rata-rata</th>
                {biomotorCategories.slice(0, 5).map(cat => (
                  <th key={cat.id} className="text-center px-3 py-2 border-b">{cat.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedAthletesData
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((athlete, idx) => (
                  <tr key={athlete.athleteId} className="border-b">
                    <td className="px-3 py-2 font-bold text-red-600">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{athlete.athleteName}</td>
                    <td className="text-center px-3 py-2">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${
                        athlete.overallScore >= 4 ? 'bg-green-500' : 
                        athlete.overallScore >= 3 ? 'bg-yellow-500' : 
                        athlete.overallScore >= 2 ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {athlete.overallScore.toFixed(1)}
                      </span>
                    </td>
                    {biomotorCategories.slice(0, 5).map(cat => (
                      <td key={cat.id} className="text-center px-3 py-2">
                        {athlete.categoryScores[cat.id]?.toFixed(1) || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Laporan ini dihasilkan oleh Hirocross Biomotor Test System</p>
          <p>© {new Date().getFullYear()} Hirocross. All rights reserved.</p>
        </div>
      </div>
    </Layout>
  );
}

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { Athlete, TestSession } from '@/types/athlete';
import { biomotorCategories } from '@/data/biomotorTests';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { ScoreBadge } from '@/components/ui/score-badge';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import hirocrossLogo from '@/assets/hirocross-logo.png';

interface PDFExportProps {
  athlete: Athlete;
  session: TestSession;
  categoryScores: Record<string, number>;
  analysisResult?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    overallAssessment: string;
  };
}

export function PDFExport({ athlete, session, categoryScores, analysisResult }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const radarData = generateRadarData(categoryScores, true);

  const age = Math.floor(
    (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)
  );

  const allTestResults = (() => {
    const grouped: { categoryId: string; categoryName: string; tests: Array<{ name: string; value: number; unit: string; score: number }> }[] = [];
    
    biomotorCategories.forEach(cat => {
      const catResults = session.results.filter(r => r.categoryId === cat.id);
      if (catResults.length > 0) {
        grouped.push({
          categoryId: cat.id,
          categoryName: cat.name,
          tests: catResults.map(r => {
            const test = cat.tests.find(t => t.id === r.testId);
            const unit = test?.norms?.[0]?.unit || 'unit';
            return {
              name: test?.name || r.testId,
              value: r.value,
              unit,
              score: r.score
            };
          })
        });
      }
    });
    
    return grouped;
  })();

  // Calculate overall score
  const overallScore = (() => {
    const scores = Object.values(categoryScores);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  })();

  // Get score label
  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Sangat Baik';
    if (score >= 3.5) return 'Baik';
    if (score >= 2.5) return 'Cukup';
    if (score >= 1.5) return 'Kurang';
    return 'Sangat Kurang';
  };

  const handleExport = async () => {
    if (!printRef.current) return;

    setIsGenerating(true);
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
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // If content is too long, add more pages
      let remainingHeight = imgHeight * ratio - pdfHeight;
      let pageNumber = 1;
      
      while (remainingHeight > 0) {
        pdf.addPage();
        pageNumber++;
        pdf.addImage(imgData, 'PNG', imgX, -(pdfHeight * (pageNumber - 1)), imgWidth * ratio, imgHeight * ratio);
        remainingHeight -= pdfHeight;
      }

      pdf.save(`Laporan_Tes_${athlete.name.replace(/\s+/g, '_')}_${new Date(session.date).toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF berhasil dibuat!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal membuat PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleExport} 
        disabled={isGenerating}
        className="w-full gap-2"
        variant="outline"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        {isGenerating ? 'Membuat PDF...' : 'Export ke PDF'}
      </Button>

      {/* Hidden Print Content */}
      <div 
        ref={printRef} 
        className="fixed left-[-9999px] top-0 bg-white text-black"
        style={{ width: '794px', padding: '40px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-red-600">
          <div className="flex items-center gap-4">
            <img src={hirocrossLogo} alt="Hirocross" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HIROCROSS</h1>
              <p className="text-sm text-gray-600">Laporan Tes Biomotor</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Tanggal: {new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Athlete Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Profil Atlet</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nama</p>
                  <p className="font-semibold">{athlete.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Usia</p>
                  <p className="font-semibold">{age} tahun</p>
                </div>
                <div>
                  <p className="text-gray-500">Jenis Kelamin</p>
                  <p className="font-semibold">{athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cabang Olahraga</p>
                  <p className="font-semibold">{athlete.sport}</p>
                </div>
                {athlete.team && (
                  <div>
                    <p className="text-gray-500">Tim/Klub</p>
                    <p className="font-semibold">{athlete.team}</p>
                  </div>
                )}
                {athlete.height && (
                  <div>
                    <p className="text-gray-500">Tinggi Badan</p>
                    <p className="font-semibold">{athlete.height} cm</p>
                  </div>
                )}
                {athlete.weight && (
                  <div>
                    <p className="text-gray-500">Berat Badan</p>
                    <p className="font-semibold">{athlete.weight} kg</p>
                  </div>
                )}
              </div>
            </div>
            {/* Overall Score */}
            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Skor Keseluruhan</p>
              <div className={`text-3xl font-bold ${
                overallScore >= 4 ? 'text-green-600' : 
                overallScore >= 3 ? 'text-yellow-600' : 
                overallScore >= 2 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {overallScore.toFixed(1)}
              </div>
              <p className={`text-xs font-medium ${
                overallScore >= 4 ? 'text-green-600' : 
                overallScore >= 3 ? 'text-yellow-600' : 
                overallScore >= 2 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {getScoreLabel(overallScore)}
              </p>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        {radarData.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Profil Biomotor</h2>
            <div className="flex justify-center">
              <RadarChart data={radarData} height={300} />
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Hasil Tes Detail</h2>
          {allTestResults.map(group => (
            <div key={group.categoryId} className="mb-4">
              <h3 className="font-semibold text-gray-800 bg-gray-100 px-3 py-2 rounded-t">
                {group.categoryName}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 border-b">Tes</th>
                    <th className="text-center px-3 py-2 border-b">Hasil</th>
                    <th className="text-center px-3 py-2 border-b">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {group.tests.map((test, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">{test.name}</td>
                      <td className="text-center px-3 py-2">{test.value} {test.unit}</td>
                      <td className="text-center px-3 py-2">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                          test.score >= 4 ? 'bg-green-500' : 
                          test.score >= 3 ? 'bg-yellow-500' : 
                          test.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
                        }`}>
                          {test.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* AI Analysis */}
        {analysisResult && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs">AI</span>
              Hasil Analisis & Rekomendasi
            </h2>
            
            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2 text-sm flex items-center gap-1">
                  <span className="text-green-600">✓</span> Kekuatan
                </h3>
                <ul className="text-xs text-green-700 space-y-1">
                  {analysisResult.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2 text-sm flex items-center gap-1">
                  <span className="text-amber-600">!</span> Perlu Ditingkatkan
                </h3>
                <ul className="text-xs text-amber-700 space-y-1">
                  {analysisResult.weaknesses.slice(0, 3).map((w, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Training Recommendations */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2 text-sm flex items-center gap-1">
                <span className="text-blue-600">▶</span> Rekomendasi Latihan
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {analysisResult.recommendations.slice(0, 4).map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-blue-700 bg-white/50 p-2 rounded">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Evaluation */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">📋 Evaluasi Keseluruhan</h3>
              <p className="text-xs text-gray-700 leading-relaxed">{analysisResult.overallAssessment}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Laporan ini dihasilkan oleh Hirocross Biomotor Test System</p>
          <p>© {new Date().getFullYear()} Hirocross. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}

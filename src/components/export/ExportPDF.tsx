import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { Athlete, TestSession } from '@/types/athlete';
import { biomotorCategories } from '@/data/biomotorTests';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportPDFProps {
  athlete: Athlete;
  sessions: TestSession[];
}

// BMI calculation helper
function calculateBMI(weight: number, height: number): { value: number; category: string } {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let category = '';
  if (bmi < 18.5) {
    category = 'Kurus';
  } else if (bmi < 25) {
    category = 'Normal';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obesitas';
  }
  
  return { value: Math.round(bmi * 10) / 10, category };
}

export function ExportPDF({ athlete, sessions }: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const latestSession = sessions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  const age = Math.floor(
    (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)
  );

  const bmiData = athlete.weight && athlete.height 
    ? calculateBMI(athlete.weight, athlete.height) 
    : null;

  const categoryScores = (() => {
    if (!latestSession) return {};
    const scores: Record<string, number[]> = {};
    latestSession.results.forEach((r) => {
      if (!scores[r.categoryId]) scores[r.categoryId] = [];
      scores[r.categoryId].push(r.score);
    });

    const avgScores: Record<string, number> = {};
    Object.entries(scores).forEach(([catId, catScores]) => {
      avgScores[catId] = catScores.reduce((a, b) => a + b, 0) / catScores.length;
    });
    return avgScores;
  })();

  const allTestResults = (() => {
    if (!latestSession) return [];
    const grouped: Array<{
      categoryId: string;
      categoryName: string;
      tests: Array<{ name: string; value: number; unit: string; score: number }>;
    }> = [];
    
    biomotorCategories.forEach(cat => {
      const catResults = latestSession.results.filter(r => r.categoryId === cat.id);
      if (catResults.length > 0) {
        grouped.push({
          categoryId: cat.id,
          categoryName: cat.name,
          tests: catResults.map(r => {
            const test = cat.tests.find(t => t.id === r.testId);
            return {
              name: test?.name || r.testId,
              value: r.value,
              unit: r.unit,
              score: r.score
            };
          })
        });
      }
    });
    
    return grouped;
  })();

  const handleExport = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Laporan-Biomotor-${athlete.name.replace(/\s+/g, '-')}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      toast.success('PDF berhasil di-export!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 4.5) return 'Sangat Baik';
    if (score >= 3.5) return 'Baik';
    if (score >= 2.5) return 'Cukup';
    if (score >= 1.5) return 'Kurang';
    return 'Sangat Kurang';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4.5) return '#22c55e';
    if (score >= 3.5) return '#84cc16';
    if (score >= 2.5) return '#eab308';
    if (score >= 1.5) return '#f97316';
    return '#ef4444';
  };

  if (!latestSession) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Tidak ada data tes untuk di-export</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleExport} disabled={isExporting} className="w-full gap-2">
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mengexport...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export Laporan PDF
          </>
        )}
      </Button>

      {/* Hidden PDF Content */}
      <div className="overflow-hidden" style={{ height: 0 }}>
        <div 
          ref={reportRef} 
          className="bg-white text-black p-8"
          style={{ width: '794px', minHeight: '1123px' }}
        >
          {/* Header */}
          <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              LAPORAN TES BIOMOTOR
            </h1>
            <p className="text-sm text-gray-600">
              {format(new Date(latestSession.date), 'd MMMM yyyy', { locale: id })}
            </p>
          </div>

          {/* Athlete Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-bold text-lg mb-3 text-gray-900">Data Atlet</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="text-gray-600">Nama:</span> <strong>{athlete.name}</strong></p>
                <p><span className="text-gray-600">Usia:</span> {age} tahun</p>
                <p><span className="text-gray-600">Jenis Kelamin:</span> {athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                <p><span className="text-gray-600">Cabang Olahraga:</span> {athlete.sport}</p>
              </div>
              <div>
                {athlete.team && <p><span className="text-gray-600">Tim:</span> {athlete.team}</p>}
                {athlete.height && <p><span className="text-gray-600">Tinggi:</span> {athlete.height} cm</p>}
                {athlete.weight && <p><span className="text-gray-600">Berat:</span> {athlete.weight} kg</p>}
                {bmiData && <p><span className="text-gray-600">BMI:</span> {bmiData.value} ({bmiData.category})</p>}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-3 text-gray-900">Ringkasan Skor per Kategori</h2>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(categoryScores).map(([catId, score]) => {
                const cat = biomotorCategories.find(c => c.id === catId);
                return (
                  <div 
                    key={catId} 
                    className="p-3 rounded-lg text-center"
                    style={{ backgroundColor: `${getScoreColor(score)}20`, border: `1px solid ${getScoreColor(score)}40` }}
                  >
                    <p className="font-medium text-sm text-gray-700">{cat?.name}</p>
                    <p className="text-2xl font-bold" style={{ color: getScoreColor(score) }}>
                      {score.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-600">{getScoreLabel(score)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Results */}
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-3 text-gray-900">Detail Hasil Tes</h2>
            {allTestResults.map(group => (
              <div key={group.categoryId} className="mb-4">
                <h3 className="font-semibold text-sm bg-gray-100 px-3 py-2 rounded-t-lg text-gray-800">
                  {group.categoryName}
                </h3>
                <table className="w-full text-sm border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2 border-b border-gray-200">Item Tes</th>
                      <th className="text-center px-3 py-2 border-b border-gray-200">Hasil</th>
                      <th className="text-center px-3 py-2 border-b border-gray-200">Skor</th>
                      <th className="text-center px-3 py-2 border-b border-gray-200">Kategori</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.tests.map((test, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 border-b border-gray-200">{test.name}</td>
                        <td className="text-center px-3 py-2 border-b border-gray-200">
                          {test.value} {test.unit}
                        </td>
                        <td className="text-center px-3 py-2 border-b border-gray-200">
                          <span 
                            className="inline-block w-8 h-8 rounded-full leading-8 font-bold text-white"
                            style={{ backgroundColor: getScoreColor(test.score) }}
                          >
                            {test.score}
                          </span>
                        </td>
                        <td className="text-center px-3 py-2 border-b border-gray-200">
                          {getScoreLabel(test.score)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
            <p>Laporan ini dibuat secara otomatis oleh Sistem Tes Biomotor</p>
            <p>Tanggal cetak: {format(new Date(), 'd MMMM yyyy, HH:mm', { locale: id })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

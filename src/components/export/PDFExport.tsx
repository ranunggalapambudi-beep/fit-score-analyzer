import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { Athlete, TestSession } from '@/types/athlete';
import { biomotorCategories } from '@/data/biomotorTests';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { BMISpeedometer, calculateBMI } from '@/components/charts/BMISpeedometer';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import hirocrossLogo from '@/assets/hirocross-logo.png';
import vocafitHeader from '@/assets/vocafit-header.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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

type PDFVersion = 'hirocross' | 'vocafit';

export function PDFExport({ athlete, session, categoryScores, analysisResult }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PDFVersion>('hirocross');
  const [includeSignature, setIncludeSignature] = useState(false);
  const [signerName, setSignerName] = useState('Dr. Kunjung Ashadi, S.Pd., M.Fis., AIFO');
  const [signerPosition, setSignerPosition] = useState('Manajer');
  const printRef = useRef<HTMLDivElement>(null);

  const radarData = generateRadarData(categoryScores, true);

  const age = Math.floor(
    (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)
  );

  // Calculate BMI if height and weight are available
  const bmi = athlete.height && athlete.weight 
    ? calculateBMI(athlete.weight, athlete.height) 
    : null;

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

      const versionName = selectedVersion === 'hirocross' ? 'Hirocross' : 'VocaFit';
      pdf.save(`Laporan_${versionName}_${athlete.name.replace(/\s+/g, '_')}_${new Date(session.date).toISOString().split('T')[0]}.pdf`);
      
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
      <div className="space-y-3">
        <Select value={selectedVersion} onValueChange={(v: PDFVersion) => setSelectedVersion(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih versi PDF" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hirocross">Versi HiroCross</SelectItem>
            <SelectItem value="vocafit">Versi VocaFit</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-signature" 
            checked={includeSignature}
            onCheckedChange={(checked) => setIncludeSignature(checked === true)}
          />
          <Label htmlFor="include-signature" className="text-sm cursor-pointer">
            Tambahkan tanda tangan
          </Label>
        </div>

        {includeSignature && (
          <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="signer-name" className="text-xs">Nama Penandatangan</Label>
              <Input
                id="signer-name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Nama lengkap dengan gelar"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="signer-position" className="text-xs">Jabatan</Label>
              <Input
                id="signer-position"
                value={signerPosition}
                onChange={(e) => setSignerPosition(e.target.value)}
                placeholder="Jabatan"
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}

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
          {isGenerating ? 'Membuat PDF...' : `Export ke PDF (${selectedVersion === 'hirocross' ? 'HiroCross' : 'VocaFit'})`}
        </Button>
      </div>

      {/* Hidden Print Content */}
      <div 
        ref={printRef} 
        className="fixed left-[-9999px] top-0 bg-white text-black"
        style={{ width: '794px', padding: '40px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header - Different based on version */}
        {selectedVersion === 'vocafit' ? (
          <div className="mb-6 pb-4 border-b-2 border-blue-600">
            <img src={vocafitHeader} alt="VocaFit" className="w-full h-auto" />
            <div className="text-right text-sm text-gray-600 mt-2">
              <p>Tanggal Tes: {new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        ) : (
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
        )}

        {/* Athlete Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            {/* Profile Photo */}
            <div className="flex-shrink-0 mr-4">
              {athlete.photo ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                  <img 
                    src={athlete.photo} 
                    alt={athlete.name} 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1">
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
            
            {/* BMI Section with Speedometer */}
            {bmi && (
              <div className="flex flex-col items-center gap-2 ml-4">
                <div className="text-center bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Indeks Massa Tubuh</p>
                  <BMISpeedometer bmi={bmi} size={100} />
                </div>
              </div>
            )}
            
            {/* Overall Score */}
            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200 ml-4">
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

        {/* Keunggulan & Perlu Ditingkatkan Section - Professional Style */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Ringkasan Performa</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Keunggulan */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border-2 border-emerald-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-200">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-sm">↑</span>
                <h3 className="font-bold text-emerald-800 text-sm">KEUNGGULAN</h3>
              </div>
              {(() => {
                const sortedCategories = Object.entries(categoryScores)
                  .map(([id, score]) => ({ 
                    id, 
                    score, 
                    name: biomotorCategories.find(c => c.id === id)?.name || id 
                  }))
                  .sort((a, b) => b.score - a.score);
                const strengths = sortedCategories.filter(c => c.score >= 4).slice(0, 3);
                
                return strengths.length > 0 ? (
                  <div className="space-y-2">
                    {strengths.map((s) => (
                      <div key={s.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-gray-800" style={{ wordBreak: 'break-word' }}>{s.name}</span>
                        <span className={`inline-flex items-center justify-center min-w-[28px] h-7 rounded-full text-white text-xs font-bold px-2 ${
                          s.score >= 4.5 ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}>
                          {s.score.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Belum ada kategori dengan skor ≥4</p>
                );
              })()}
            </div>

            {/* Perlu Ditingkatkan */}
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4 border-2 border-rose-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-rose-200">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-500 text-white text-sm">↓</span>
                <h3 className="font-bold text-rose-800 text-sm">PERLU DITINGKATKAN</h3>
              </div>
              {(() => {
                const sortedCategories = Object.entries(categoryScores)
                  .map(([id, score]) => ({ 
                    id, 
                    score, 
                    name: biomotorCategories.find(c => c.id === id)?.name || id 
                  }))
                  .sort((a, b) => a.score - b.score);
                const weaknesses = sortedCategories.filter(c => c.score < 3).slice(0, 3);
                
                return weaknesses.length > 0 ? (
                  <div className="space-y-2">
                    {weaknesses.map((w) => (
                      <div key={w.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-gray-800" style={{ wordBreak: 'break-word' }}>{w.name}</span>
                        <span className={`inline-flex items-center justify-center min-w-[28px] h-7 rounded-full text-white text-xs font-bold px-2 ${
                          w.score < 2 ? 'bg-rose-600' : 'bg-rose-500'
                        }`}>
                          {w.score.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-emerald-600 font-medium">✓ Semua kategori sudah baik!</p>
                );
              })()}
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {analysisResult && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs">AI</span>
              Hasil Analisis & Rekomendasi
            </h2>
            
            {/* AI Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2 text-sm flex items-center gap-1">
                  <span className="text-green-600">✓</span> Analisis Kekuatan
                </h3>
                <ul className="text-xs text-green-700 space-y-1.5">
                  {analysisResult.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">•</span>
                      <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2 text-sm flex items-center gap-1">
                  <span className="text-amber-600">!</span> Analisis Kelemahan
                </h3>
                <ul className="text-xs text-amber-700 space-y-1.5">
                  {analysisResult.weaknesses.slice(0, 3).map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                      <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Training Recommendations */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 text-sm flex items-center gap-1">
                <span className="text-blue-600">▶</span> Rekomendasi Latihan
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {analysisResult.recommendations.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-blue-800 bg-white/70 p-2.5 rounded-lg border border-blue-100">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Evaluation */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2 text-sm flex items-center gap-1">
                <span className="text-purple-600">📋</span> Evaluasi Keseluruhan
              </h3>
              <p 
                className="text-xs text-gray-700 leading-relaxed"
                style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
              >
                {analysisResult.overallAssessment}
              </p>
            </div>
          </div>
        )}

        {/* Signature Section */}
        {includeSignature && (
          <div className="mt-10 flex justify-end">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-16">Mengetahui,</p>
              <div className="border-b border-gray-400 w-48 mb-2"></div>
              <p className="font-semibold text-gray-900 text-sm">{signerName}</p>
              <p className="text-gray-600 text-xs">{signerPosition}</p>
            </div>
          </div>
        )}

        {/* Footer - Different based on version */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          {selectedVersion === 'vocafit' ? (
            <>
              <p>Laporan ini dihasilkan oleh VocaFit Biomotor Test System</p>
              <p>© {new Date().getFullYear()} VocaFit Strength and Conditioning Consultant. All rights reserved.</p>
            </>
          ) : (
            <>
              <p>Laporan ini dihasilkan oleh Hirocross Biomotor Test System</p>
              <p>© {new Date().getFullYear()} Hirocross. All rights reserved.</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

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

  // Calculate overall score (1-5 scale)
  const overallScore = (() => {
    const scores = Object.values(categoryScores);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  })();

  // Convert score to percentage (1-5 scale to 0-100%)
  const scoreToPercentage = (score: number) => {
    return ((score - 1) / 4) * 100;
  };

  const overallPercentage = scoreToPercentage(overallScore);

  // Get score label based on norm (1-5 scale)
  const getScoreLabel = (score: number) => {
    if (score >= 5) return 'Baik Sekali';
    if (score >= 4) return 'Baik';
    if (score >= 3) return 'Cukup';
    if (score >= 2) return 'Kurang';
    return 'Kurang Sekali';
  };

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 5) return '#059669'; // emerald-600
    if (score >= 4) return '#22C55E'; // green-500
    if (score >= 3) return '#F59E0B'; // amber-500
    if (score >= 2) return '#F97316'; // orange-500
    return '#EF4444'; // red-500
  };

  // Get background color based on score
  const getScoreBgColor = (score: number) => {
    if (score >= 5) return '#D1FAE5'; // emerald-100
    if (score >= 4) return '#DCFCE7'; // green-100
    if (score >= 3) return '#FEF3C7'; // amber-100
    if (score >= 2) return '#FFEDD5'; // orange-100
    return '#FEE2E2'; // red-100
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
          <div className="flex justify-between items-start gap-4">
            {/* Profile Photo - Enhanced */}
            <div className="flex-shrink-0">
              {athlete.photo ? (
                <div className="w-36 h-44 rounded-xl overflow-hidden shadow-lg" style={{ border: '4px solid #e5e7eb' }}>
                  <img 
                    src={athlete.photo} 
                    alt={athlete.name} 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
              ) : (
                <div className="w-36 h-44 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center shadow-lg" style={{ border: '4px solid #e5e7eb' }}>
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <p className="text-xs text-gray-400 mt-1">Foto Atlet</p>
                </div>
              )}
            </div>
            
            {/* Athlete Details */}
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Profil Atlet</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Nama</p>
                  <p className="font-semibold" style={{ wordBreak: 'break-word' }}>{athlete.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Usia</p>
                  <p className="font-semibold">{age} tahun</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Jenis Kelamin</p>
                  <p className="font-semibold">{athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p className="text-gray-500 text-xs">Cabang Olahraga</p>
                  <p className="font-semibold" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{athlete.sport}</p>
                </div>
                {athlete.team && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <p className="text-gray-500 text-xs">Tim/Klub</p>
                    <p className="font-semibold" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{athlete.team}</p>
                  </div>
                )}
                {athlete.height && (
                  <div>
                    <p className="text-gray-500 text-xs">Tinggi Badan</p>
                    <p className="font-semibold">{athlete.height} cm</p>
                  </div>
                )}
                {athlete.weight && (
                  <div>
                    <p className="text-gray-500 text-xs">Berat Badan</p>
                    <p className="font-semibold">{athlete.weight} kg</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* BMI Section with Speedometer - Enhanced */}
            <div className="flex flex-col items-center">
              {bmi ? (
                <div className="bg-white rounded-xl p-4 shadow-md border-2" style={{ borderColor: bmi < 18.5 ? '#3B82F6' : bmi < 25 ? '#22C55E' : bmi < 30 ? '#F59E0B' : '#EF4444' }}>
                  <p className="text-xs text-gray-600 font-medium text-center mb-2">INDEKS MASSA TUBUH (IMT)</p>
                  <BMISpeedometer bmi={bmi} size={110} />
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div>
                        <p className="text-gray-500">BB</p>
                        <p className="font-bold">{athlete.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-500">TB</p>
                        <p className="font-bold">{athlete.height} cm</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-4 shadow-md border-2 border-gray-300">
                  <p className="text-xs text-gray-600 font-medium text-center mb-2">INDEKS MASSA TUBUH (IMT)</p>
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    <span className="text-gray-400 text-xs text-center px-2">Data TB/BB tidak tersedia</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Overall Score - Enhanced */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-xl p-4 shadow-md border-2" style={{ borderColor: overallScore >= 4 ? '#22C55E' : overallScore >= 3 ? '#F59E0B' : overallScore >= 2 ? '#F97316' : '#EF4444' }}>
                <p className="text-xs text-gray-600 font-medium text-center mb-2">SKOR KESELURUHAN</p>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ 
                    backgroundColor: getScoreColor(overallScore)
                  }}>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-white">{overallPercentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: getScoreBgColor(overallScore) }}>
                    <p className="text-sm font-bold" style={{ color: getScoreColor(overallScore) }}>
                      {getScoreLabel(overallScore)}
                    </p>
                  </div>
                </div>
              </div>
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
              <h3 className="font-semibold text-white px-3 py-2 rounded-t" style={{ backgroundColor: '#374151' }}>
                {group.categoryName}
              </h3>
              <table className="w-full text-sm border border-gray-200">
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6' }}>
                    <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold">Nama Tes</th>
                    <th className="text-center px-3 py-2 border-b border-gray-200 font-semibold">Hasil</th>
                    <th className="text-center px-3 py-2 border-b border-gray-200 font-semibold">Skor</th>
                    <th className="text-center px-3 py-2 border-b border-gray-200 font-semibold">Status Norma</th>
                  </tr>
                </thead>
                <tbody>
                  {group.tests.map((test, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                      <td className="px-3 py-2 border-b border-gray-100">{test.name}</td>
                      <td className="text-center px-3 py-2 border-b border-gray-100 font-medium">{test.value} {test.unit}</td>
                      <td className="text-center px-3 py-2 border-b border-gray-100">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold" style={{
                          backgroundColor: getScoreColor(test.score)
                        }}>
                          {test.score}
                        </span>
                      </td>
                      <td className="text-center px-3 py-2 border-b border-gray-100">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold" style={{
                          backgroundColor: getScoreBgColor(test.score),
                          color: getScoreColor(test.score)
                        }}>
                          {getScoreLabel(test.score)}
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
            <div style={{ background: 'linear-gradient(to bottom right, #D1FAE5, #DCFCE7)', borderRadius: '12px', padding: '16px', border: '2px solid #A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #A7F3D0' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#059669', color: 'white', fontSize: '14px' }}>↑</span>
                <h3 style={{ fontWeight: 'bold', color: '#065F46', fontSize: '14px' }}>KEUNGGULAN</h3>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {strengths.map((s) => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#1F2937' }}>{s.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ backgroundColor: getScoreColor(s.score), color: 'white', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>
                            {scoreToPercentage(s.score).toFixed(0)}%
                          </span>
                          <span style={{ backgroundColor: getScoreBgColor(s.score), color: getScoreColor(s.score), padding: '4px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 'bold' }}>
                            {getScoreLabel(s.score)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic' }}>Belum ada kategori dengan skor ≥4</p>
                );
              })()}
            </div>

            {/* Perlu Ditingkatkan */}
            <div style={{ background: 'linear-gradient(to bottom right, #FEE2E2, #FECACA)', borderRadius: '12px', padding: '16px', border: '2px solid #FECACA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #FECACA' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#DC2626', color: 'white', fontSize: '14px' }}>↓</span>
                <h3 style={{ fontWeight: 'bold', color: '#991B1B', fontSize: '14px' }}>PERLU DITINGKATKAN</h3>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {weaknesses.map((w) => (
                      <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#1F2937' }}>{w.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ backgroundColor: getScoreColor(w.score), color: 'white', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>
                            {scoreToPercentage(w.score).toFixed(0)}%
                          </span>
                          <span style={{ backgroundColor: getScoreBgColor(w.score), color: getScoreColor(w.score), padding: '4px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 'bold' }}>
                            {getScoreLabel(w.score)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#059669', fontWeight: '500' }}>✓ Semua kategori sudah baik!</p>
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

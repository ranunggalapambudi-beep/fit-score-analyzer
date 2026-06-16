import { Athlete, TestSession } from '@/types/athlete';
import { biomotorCategories } from '@/data/biomotorTests';
import { RadarChart, generateRadarData } from '@/components/charts/RadarChart';
import { BMISpeedometer, calculateBMI } from '@/components/charts/BMISpeedometer';
import hirocrossLogo from '@/assets/hirocross-logo.png';
import vocafitHeader from '@/assets/vocafit-header.png';
import { formatDateID } from '@/lib/dateFormat';
import { forwardRef } from 'react';

export type ReportVersion = 'hirocross' | 'vocafit';

export interface AthleteReportTemplateProps {
  athlete: Athlete;
  session: TestSession;
  categoryScores: Record<string, number>;
  version?: ReportVersion;
  includeSignature?: boolean;
  signerName?: string;
  signerPosition?: string;
  analysisResult?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    overallAssessment: string;
  };
}

const scoreToPercentage = (score: number) => ((score - 1) / 4) * 100;
const getScoreLabel = (score: number) => {
  if (score >= 5) return 'Baik Sekali';
  if (score >= 4) return 'Baik';
  if (score >= 3) return 'Cukup';
  if (score >= 2) return 'Kurang';
  return 'Kurang Sekali';
};
const getScoreColor = (score: number) => {
  if (score >= 5) return '#059669';
  if (score >= 4) return '#22C55E';
  if (score >= 3) return '#F59E0B';
  if (score >= 2) return '#F97316';
  return '#EF4444';
};
const getScoreBgColor = (score: number) => {
  if (score >= 5) return '#D1FAE5';
  if (score >= 4) return '#DCFCE7';
  if (score >= 3) return '#FEF3C7';
  if (score >= 2) return '#FFEDD5';
  return '#FEE2E2';
};

export const AthleteReportTemplate = forwardRef<HTMLDivElement, AthleteReportTemplateProps>(
  function AthleteReportTemplate(
    {
      athlete,
      session,
      categoryScores,
      version = 'hirocross',
      includeSignature = false,
      signerName = '',
      signerPosition = '',
      analysisResult,
    },
    ref,
  ) {
    const radarData = generateRadarData(categoryScores, true);
    const age = Math.floor(
      (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000),
    );
    const bmi =
      athlete.height && athlete.weight ? calculateBMI(athlete.weight, athlete.height) : null;

    const allTestResults: {
      categoryId: string;
      categoryName: string;
      tests: Array<{ name: string; value: number; unit: string; score: number }>;
    }[] = [];
    biomotorCategories.forEach((cat) => {
      const catResults = session.results.filter((r) => r.categoryId === cat.id);
      if (catResults.length > 0) {
        allTestResults.push({
          categoryId: cat.id,
          categoryName: cat.name,
          tests: catResults.map((r) => {
            const test = cat.tests.find((t) => t.id === r.testId);
            const unit = test?.norms?.[0]?.unit || 'unit';
            return { name: test?.name || r.testId, value: r.value, unit, score: r.score };
          }),
        });
      }
    });

    const scores = Object.values(categoryScores);
    const overallScore = scores.length === 0 ? 0 : scores.reduce((a, b) => a + b, 0) / scores.length;
    const overallPercentage = scoreToPercentage(overallScore);

    return (
      <div
        ref={ref}
        className="bg-white text-black"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm 12mm',
          fontFamily: 'Arial, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        {version === 'vocafit' ? (
          <div className="mb-6 pb-4 border-b-2 border-blue-600">
            <img src={vocafitHeader} alt="VocaFit" className="w-full h-auto" />
            <div className="text-right text-sm text-gray-600 mt-2">
              <p>Tanggal Tes: {formatDateID(session.date)}</p>
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
              <p>Tanggal: {formatDateID(session.date)}</p>
            </div>
          </div>
        )}

        {/* Athlete Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0 }}>
              {athlete.photo ? (
                <div style={{ width: '100px', height: '120px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '3px solid #e5e7eb' }}>
                  <img src={athlete.photo} alt={athlete.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                </div>
              ) : (
                <div style={{ width: '100px', height: '120px', borderRadius: '12px', background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '3px solid #e5e7eb' }}>
                  <svg style={{ width: '40px', height: '40px', color: '#9ca3af' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <p style={{ fontSize: '9px', color: '#9ca3af', marginTop: '4px' }}>Foto Atlet</p>
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '180px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>Profil Atlet</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '11px' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>Nama</p>
                  <p style={{ fontWeight: 600, wordBreak: 'break-word', lineHeight: 1.3 }}>{athlete.name}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>Usia</p>
                  <p style={{ fontWeight: 600 }}>{age} tahun</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>Jenis Kelamin</p>
                  <p style={{ fontWeight: 600 }}>{athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>Cabang Olahraga</p>
                  <p style={{ fontWeight: 600, wordBreak: 'break-word', lineHeight: 1.3, maxWidth: '150px' }}>{athlete.sport}</p>
                </div>
                {athlete.team && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>Tim/Klub</p>
                    <p style={{ fontWeight: 600, wordBreak: 'break-word', lineHeight: 1.3 }}>{athlete.team}</p>
                  </div>
                )}
                {athlete.height && athlete.weight && (
                  <>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>Tinggi Badan</p>
                      <p style={{ fontWeight: 600 }}>{athlete.height} cm</p>
                    </div>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '9px', marginBottom: '2px' }}>Berat Badan</p>
                      <p style={{ fontWeight: 600 }}>{athlete.weight} kg</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ flexShrink: 0 }}>
              {bmi ? (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: `2px solid ${bmi < 18.5 ? '#3B82F6' : bmi < 25 ? '#22C55E' : bmi < 30 ? '#F59E0B' : '#EF4444'}`, textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', color: '#6b7280', fontWeight: 600, marginBottom: '6px' }}>IMT</p>
                  <BMISpeedometer bmi={bmi} size={80} />
                  <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', textAlign: 'center' }}>
                      <div>
                        <p style={{ color: '#6b7280' }}>BB</p>
                        <p style={{ fontWeight: 'bold' }}>{athlete.weight} kg</p>
                      </div>
                      <div>
                        <p style={{ color: '#6b7280' }}>TB</p>
                        <p style={{ fontWeight: 'bold' }}>{athlete.height} cm</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '2px solid #d1d5db', textAlign: 'center', width: '100px' }}>
                  <p style={{ fontSize: '9px', color: '#6b7280', fontWeight: 600, marginBottom: '6px' }}>IMT</p>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <span style={{ color: '#9ca3af', fontSize: '8px', textAlign: 'center', padding: '4px' }}>Data TB/BB tidak tersedia</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ flexShrink: 0 }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: `2px solid ${overallScore >= 4 ? '#22C55E' : overallScore >= 3 ? '#F59E0B' : overallScore >= 2 ? '#F97316' : '#EF4444'}`, textAlign: 'center' }}>
                <p style={{ fontSize: '9px', color: '#6b7280', fontWeight: 600, marginBottom: '6px' }}>SKOR TOTAL</p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: getScoreColor(overallScore) }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{overallPercentage.toFixed(0)}%</span>
                  </div>
                  <div style={{ marginTop: '6px', padding: '3px 8px', borderRadius: '9999px', backgroundColor: getScoreBgColor(overallScore) }}>
                    <p style={{ fontSize: '10px', fontWeight: 'bold', color: getScoreColor(overallScore) }}>{getScoreLabel(overallScore)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Radar */}
        {radarData.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Profil Biomotor</h2>
            <div style={{ width: '100%', height: '480px' }}>
              <RadarChart data={radarData} height={480} showValues />
            </div>
          </div>
        )}

        {/* Tests detail */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Hasil Tes Detail</h2>
          {allTestResults.map((group) => (
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
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold" style={{ backgroundColor: getScoreColor(test.score) }}>
                          {test.score}
                        </span>
                      </td>
                      <td className="text-center px-3 py-2 border-b border-gray-100">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: getScoreBgColor(test.score), color: getScoreColor(test.score) }}>
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

        {/* Ringkasan */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Ringkasan Performa</h2>
          <div className="grid grid-cols-2 gap-4">
            <div style={{ background: 'linear-gradient(to bottom right, #D1FAE5, #DCFCE7)', borderRadius: '12px', padding: '16px', border: '2px solid #A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #A7F3D0' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#059669', color: 'white', fontSize: '14px' }}>↑</span>
                <h3 style={{ fontWeight: 'bold', color: '#065F46', fontSize: '14px' }}>KEUNGGULAN</h3>
              </div>
              {(() => {
                const sorted = Object.entries(categoryScores)
                  .map(([id, score]) => ({ id, score, name: biomotorCategories.find((c) => c.id === id)?.name || id }))
                  .sort((a, b) => b.score - a.score);
                const strengths = sorted.filter((c) => c.score >= 4).slice(0, 3);
                return strengths.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {strengths.map((s) => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>{s.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ backgroundColor: getScoreColor(s.score), color: 'white', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>{scoreToPercentage(s.score).toFixed(0)}%</span>
                          <span style={{ backgroundColor: getScoreBgColor(s.score), color: getScoreColor(s.score), padding: '4px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 'bold' }}>{getScoreLabel(s.score)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic' }}>Belum ada kategori dengan skor ≥4</p>
                );
              })()}
            </div>

            <div style={{ background: 'linear-gradient(to bottom right, #FEE2E2, #FECACA)', borderRadius: '12px', padding: '16px', border: '2px solid #FECACA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #FECACA' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#DC2626', color: 'white', fontSize: '14px' }}>↓</span>
                <h3 style={{ fontWeight: 'bold', color: '#991B1B', fontSize: '14px' }}>PERLU DITINGKATKAN</h3>
              </div>
              {(() => {
                const sorted = Object.entries(categoryScores)
                  .map(([id, score]) => ({ id, score, name: biomotorCategories.find((c) => c.id === id)?.name || id }))
                  .sort((a, b) => a.score - b.score);
                const weaknesses = sorted.filter((c) => c.score < 3).slice(0, 3);
                return weaknesses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {weaknesses.map((w) => (
                      <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>{w.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ backgroundColor: getScoreColor(w.score), color: 'white', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>{scoreToPercentage(w.score).toFixed(0)}%</span>
                          <span style={{ backgroundColor: getScoreBgColor(w.score), color: getScoreColor(w.score), padding: '4px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 'bold' }}>{getScoreLabel(w.score)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#059669', fontWeight: 500 }}>✓ Semua kategori sudah baik!</p>
                );
              })()}
            </div>
          </div>
        </div>

        {analysisResult && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs">AI</span>
              Hasil Analisis & Rekomendasi
            </h2>
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
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 text-sm flex items-center gap-1">
                <span className="text-blue-600">▶</span> Rekomendasi Latihan
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {analysisResult.recommendations.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-blue-800 bg-white/70 p-2.5 rounded-lg border border-blue-100">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">{i + 1}</span>
                    <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2 text-sm flex items-center gap-1">
                <span className="text-purple-600">📋</span> Evaluasi Keseluruhan
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {analysisResult.overallAssessment}
              </p>
            </div>
          </div>
        )}

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

        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          {version === 'vocafit' ? (
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
    );
  },
);
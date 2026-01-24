import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Download } from 'lucide-react';
import { Athlete, TestSession } from '@/types/athlete';
import { biomotorCategories } from '@/data/biomotorTests';
import { toast } from 'sonner';
import hirocrossLogo from '@/assets/hirocross-logo.png';
import vocafitHeader from '@/assets/vocafit-header.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TeamReportPDFProps {
  teamName: string;
  teamSport: string;
  teamColor: string;
  athletes: Athlete[];
  testSessions: TestSession[];
}

const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const getScoreLabel = (score: number): { label: string; color: string; bgColor: string } => {
  if (score >= 4.5) return { label: 'Baik Sekali', color: '#16a34a', bgColor: '#dcfce7' };
  if (score >= 3.5) return { label: 'Baik', color: '#2563eb', bgColor: '#dbeafe' };
  if (score >= 2.5) return { label: 'Cukup', color: '#ca8a04', bgColor: '#fef9c3' };
  if (score >= 1.5) return { label: 'Kurang', color: '#ea580c', bgColor: '#fed7aa' };
  return { label: 'Kurang Sekali', color: '#dc2626', bgColor: '#fecaca' };
};

export function TeamReportPDF({ 
  teamName, 
  teamSport, 
  teamColor,
  athletes, 
  testSessions 
}: TeamReportPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<'hirocross' | 'vocafit'>('hirocross');
  const [includeSignature, setIncludeSignature] = useState(false);
  const [signerName, setSignerName] = useState('Dr. Kunjung Ashadi, S.Pd., M.Fis., AIFO');
  const [signerPosition, setSignerPosition] = useState('Manajer');

  const getLogoBase64 = (): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve('');
      img.src = selectedVersion === 'vocafit' ? vocafitHeader : hirocrossLogo;
    });
  };

  const calculateAge = (dateOfBirth: string): number => {
    return Math.floor(
      (new Date().getTime() - new Date(dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    );
  };

  const getAthleteLatestSession = (athleteId: string): TestSession | undefined => {
    return testSessions
      .filter(s => s.athleteId === athleteId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const getCategoryScore = (session: TestSession, categoryId: string): number => {
    const results = session.results.filter(r => r.categoryId === categoryId);
    if (results.length === 0) return 0;
    return results.reduce((sum, r) => sum + r.score, 0) / results.length;
  };

  const getTeamCategoryAverage = (categoryId: string): number => {
    const scores: number[] = [];
    athletes.forEach(athlete => {
      const session = getAthleteLatestSession(athlete.id);
      if (session) {
        const score = getCategoryScore(session, categoryId);
        if (score > 0) scores.push(score);
      }
    });
    if (scores.length === 0) return 0;
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  };

  const getOverallTeamAverage = (): number => {
    const categoryScores = biomotorCategories.map(cat => getTeamCategoryAverage(cat.id)).filter(s => s > 0);
    if (categoryScores.length === 0) return 0;
    return categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length;
  };

  const athletesWithTests = athletes.filter(a => getAthleteLatestSession(a.id));
  const athletesWithoutTests = athletes.filter(a => !getAthleteLatestSession(a.id));
  const totalSessions = athletes.reduce((acc, a) => acc + testSessions.filter(s => s.athleteId === a.id).length, 0);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const logoBase64 = await getLogoBase64();
      const overallAvg = getOverallTeamAverage();
      const overallInfo = getScoreLabel(overallAvg);

      // Generate category data
      const categoryData = biomotorCategories.map(cat => ({
        name: cat.name,
        average: getTeamCategoryAverage(cat.id),
        ...getScoreLabel(getTeamCategoryAverage(cat.id))
      })).filter(c => c.average > 0);

      // Generate athlete data
      const athleteData = athletesWithTests.map(athlete => {
        const session = getAthleteLatestSession(athlete.id)!;
        const scores = biomotorCategories.map(cat => getCategoryScore(session, cat.id));
        const validScores = scores.filter(s => s > 0);
        const avgScore = validScores.length > 0 
          ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
          : 0;
        return {
          name: athlete.name,
          age: calculateAge(athlete.dateOfBirth),
          gender: athlete.gender === 'male' ? 'L' : 'P',
          sessionDate: new Date(session.date).toLocaleDateString('id-ID'),
          avgScore,
          ...getScoreLabel(avgScore)
        };
      }).sort((a, b) => b.avgScore - a.avgScore);

      // Create container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm';
      document.body.appendChild(container);

      container.innerHTML = `
        <div id="report" style="
          width: 210mm;
          min-height: 297mm;
          padding: 15mm;
          background: white;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          color: #1a1a2e;
        ">
          ${selectedVersion === 'vocafit' 
            ? `<div style="text-align: center; margin-bottom: 20px;">
                <img src="${logoBase64}" alt="VocaFit" style="max-width: 100%; height: 60px; object-fit: contain;" />
               </div>`
            : `<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #e94560;">
                <img src="${logoBase64}" alt="HiroCross" style="width: 50px; height: 50px;" />
                <div>
                  <div style="font-size: 24px; font-weight: 700; color: #e94560;">HIROCROSS</div>
                  <div style="font-size: 12px; color: #666;">Laporan Performa Tim</div>
                </div>
               </div>`
          }

          <!-- Team Info -->
          <div style="background: linear-gradient(135deg, ${teamColor}20 0%, ${teamColor}10 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid ${teamColor};">
            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 5px 0; color: #1a1a2e;">${escapeHtml(teamName)}</h1>
            <p style="font-size: 16px; color: ${teamColor}; font-weight: 600; margin: 0;">${escapeHtml(teamSport)}</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">Tanggal Laporan: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <!-- Quick Stats -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: ${teamColor};">${athletes.length}</div>
              <div style="font-size: 11px; color: #666;">Total Atlet</div>
            </div>
            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #16a34a;">${athletesWithTests.length}</div>
              <div style="font-size: 11px; color: #666;">Sudah Tes</div>
            </div>
            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #2563eb;">${totalSessions}</div>
              <div style="font-size: 11px; color: #666;">Total Sesi</div>
            </div>
            <div style="background: ${overallInfo.bgColor}; border-radius: 10px; padding: 15px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: ${overallInfo.color};">${overallAvg.toFixed(1)}</div>
              <div style="font-size: 11px; color: ${overallInfo.color};">${overallInfo.label}</div>
            </div>
          </div>

          <!-- Category Averages -->
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 15px; color: #1a1a2e; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 4px; height: 20px; background: #e94560; border-radius: 2px;"></span>
              Rata-rata Skor Biomotor Tim
            </h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              ${categoryData.map(cat => `
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                  <div style="flex: 1;">
                    <div style="font-size: 12px; font-weight: 600; color: #1a1a2e; margin-bottom: 6px;">${escapeHtml(cat.name)}</div>
                    <div style="height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                      <div style="height: 100%; width: ${(cat.average / 5) * 100}%; background: ${cat.color}; border-radius: 4px;"></div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 18px; font-weight: 700; color: ${cat.color};">${cat.average.toFixed(1)}</div>
                    <div style="font-size: 9px; color: ${cat.color};">${cat.label}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Athlete Rankings -->
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 15px; color: #1a1a2e; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 4px; height: 20px; background: #e94560; border-radius: 2px;"></span>
              Peringkat Atlet (${athleteData.length} atlet)
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #1a1a2e; color: white;">
                  <th style="padding: 10px 8px; text-align: center; border-radius: 6px 0 0 0;">#</th>
                  <th style="padding: 10px 8px; text-align: left;">Nama Atlet</th>
                  <th style="padding: 10px 8px; text-align: center;">Usia</th>
                  <th style="padding: 10px 8px; text-align: center;">L/P</th>
                  <th style="padding: 10px 8px; text-align: center;">Tanggal Tes</th>
                  <th style="padding: 10px 8px; text-align: center; border-radius: 0 6px 0 0;">Skor</th>
                </tr>
              </thead>
              <tbody>
                ${athleteData.map((a, idx) => `
                  <tr style="background: ${idx % 2 === 0 ? '#f8f9fa' : 'white'}; ${idx < 3 ? 'font-weight: 600;' : ''}">
                    <td style="padding: 8px; text-align: center; ${idx < 3 ? `color: ${idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : '#cd7f32'};` : ''}">${idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}</td>
                    <td style="padding: 8px;">${escapeHtml(a.name)}</td>
                    <td style="padding: 8px; text-align: center;">${a.age} th</td>
                    <td style="padding: 8px; text-align: center;">${a.gender}</td>
                    <td style="padding: 8px; text-align: center;">${a.sessionDate}</td>
                    <td style="padding: 8px; text-align: center;">
                      <span style="display: inline-block; padding: 3px 8px; background: ${a.bgColor}; color: ${a.color}; border-radius: 4px; font-weight: 600;">${a.avgScore.toFixed(1)}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          ${athletesWithoutTests.length > 0 ? `
          <!-- Athletes Without Tests -->
          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 15px; color: #ea580c; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 4px; height: 20px; background: #ea580c; border-radius: 2px;"></span>
              Atlet Belum Tes (${athletesWithoutTests.length})
            </h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${athletesWithoutTests.map(a => `
                <span style="display: inline-block; padding: 6px 12px; background: #fed7aa; color: #ea580c; border-radius: 6px; font-size: 11px;">${escapeHtml(a.name)}</span>
              `).join('')}
            </div>
          </div>
          ` : ''}

          ${includeSignature ? `
          <!-- Signature -->
          <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
            <div style="text-align: center; min-width: 200px;">
              <p style="font-size: 11px; color: #666; margin-bottom: 60px;">Mengetahui,</p>
              <p style="font-size: 12px; font-weight: 600; margin: 0; border-top: 1px solid #333; padding-top: 5px;">${escapeHtml(signerName)}</p>
              <p style="font-size: 11px; color: #666; margin: 3px 0 0 0;">${escapeHtml(signerPosition)}</p>
            </div>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 10px; color: #999;">
              ${selectedVersion === 'vocafit' ? 'VocaFit' : 'HiroCross'} - Laporan Performa Tim © ${new Date().getFullYear()}
            </p>
          </div>
        </div>
      `;

      await new Promise(r => setTimeout(r, 500));

      const reportElement = container.querySelector('#report') as HTMLElement;
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan-Tim-${teamName.replace(/\s+/g, '-')}.pdf`);

      document.body.removeChild(container);
      toast.success('Laporan berhasil diunduh!');
      setIsOpen(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Gagal membuat laporan. Silakan coba lagi.');
    }

    setIsGenerating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Laporan Tim
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Laporan Performa Tim</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Versi Laporan</Label>
            <Select value={selectedVersion} onValueChange={(v: 'hirocross' | 'vocafit') => setSelectedVersion(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hirocross">HiroCross</SelectItem>
                <SelectItem value="vocafit">VocaFit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="signature">Sertakan Tanda Tangan</Label>
            <Switch
              id="signature"
              checked={includeSignature}
              onCheckedChange={setIncludeSignature}
            />
          </div>

          {includeSignature && (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              <div className="space-y-1">
                <Label className="text-xs">Nama Penandatangan</Label>
                <Input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Jabatan</Label>
                <Input
                  value={signerPosition}
                  onChange={(e) => setSignerPosition(e.target.value)}
                  placeholder="Jabatan"
                />
              </div>
            </div>
          )}

          <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
            <p><strong>Tim:</strong> {teamName}</p>
            <p><strong>Jumlah Atlet:</strong> {athletes.length}</p>
            <p><strong>Sudah Tes:</strong> {athletesWithTests.length}</p>
            <p><strong>Rata-rata Skor:</strong> {getOverallTeamAverage().toFixed(1)}</p>
          </div>
        </div>

        <Button 
          onClick={handleGeneratePDF} 
          disabled={isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download Laporan PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}

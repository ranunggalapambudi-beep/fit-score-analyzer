import jsPDF from 'jspdf';
import { Athlete, TestSession } from '@/types/athlete';
import { biomotorCategories } from '@/data/biomotorTests';
import { formatDateID } from '@/lib/dateFormat';

const SCORE_LABELS: Record<number, string> = {
  1: 'Kurang Sekali',
  2: 'Kurang',
  3: 'Cukup',
  4: 'Baik',
  5: 'Baik Sekali',
};

function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function calcBMI(weight?: number, height?: number): number | null {
  if (!weight || !height) return null;
  const h = height / 100;
  return +(weight / (h * h)).toFixed(1);
}

/** Generate a single-page PDF for an athlete (latest session) and trigger download. */
function generateAthletePDF(
  athlete: Athlete,
  session: TestSession | undefined,
): Blob {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  // Header
  pdf.setFillColor(220, 38, 38);
  pdf.rect(0, 0, pageW, 12, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('HIROCROSS — Laporan Biomotor Atlet', margin, 8);

  pdf.setTextColor(0, 0, 0);
  y = 22;

  // Athlete profile
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(athlete.name, margin, y);
  y += 6;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const age = calcAge(athlete.dateOfBirth);
  const bmi = calcBMI(athlete.weight, athlete.height);
  const profileLines = [
    `Tanggal Lahir : ${formatDateID(athlete.dateOfBirth)}   (${age} tahun)`,
    `Jenis Kelamin : ${athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}`,
    `Cabor         : ${athlete.sport}${athlete.team ? `   |   Tim: ${athlete.team}` : ''}`,
    `Tinggi/Berat  : ${athlete.height ?? '-'} cm / ${athlete.weight ?? '-'} kg${bmi !== null ? `   |   IMT: ${bmi}` : ''}`,
  ];
  profileLines.forEach(line => { pdf.text(line, margin, y); y += 5; });

  y += 3;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, y, pageW - margin, y);
  y += 6;

  // Session date
  if (session) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(`Tanggal Tes: ${formatDateID(session.date)}`, margin, y);
    y += 7;
  } else {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Belum ada sesi tes', margin, y);
    pdf.setTextColor(0, 0, 0);
    y += 6;
  }

  // Results grouped by category
  if (session) {
    biomotorCategories.forEach(cat => {
      const items = session.results.filter(r => r.categoryId === cat.id);
      if (items.length === 0) return;

      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, y - 4, pageW - margin * 2, 6, 'F');
      pdf.text(cat.name, margin + 2, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      items.forEach(r => {
        if (y > 280) { pdf.addPage(); y = 20; }
        const test = cat.tests.find(t => t.id === r.testId);
        const unit = test?.norms?.[0]?.unit || '';
        const label = SCORE_LABELS[r.score] || '-';
        const name = test?.name || r.testId;
        pdf.text(`• ${name}`, margin + 2, y);
        pdf.text(`${r.value} ${unit}`, pageW - margin - 55, y, { align: 'left' });
        pdf.text(`Skor ${r.score} (${label})`, pageW - margin, y, { align: 'right' });
        y += 5;
      });
      y += 2;
    });

    // Overall avg
    const avg = session.results.reduce((s, r) => s + r.score, 0) / Math.max(1, session.results.length);
    if (y > 270) { pdf.addPage(); y = 20; }
    y += 4;
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, y, pageW - margin, y);
    y += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`Rata-rata: ${avg.toFixed(2)}  (${SCORE_LABELS[Math.round(avg)] || '-'})`, margin, y);
  }

  // Footer
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(140, 140, 140);
  pdf.text(`Dibuat: ${formatDateID(new Date())}`, margin, 290);

  return pdf.output('blob');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generate one PDF per athlete and trigger sequential downloads.
 * Uses small delay between saves so browser doesn't suppress them.
 */
export async function bulkExportAthletePDFs(
  athletes: Athlete[],
  sessions: TestSession[],
  onProgress?: (done: number, total: number, currentName: string) => void,
): Promise<{ generated: number }> {
  let count = 0;
  for (const athlete of athletes) {
    const athleteSessions = sessions
      .filter(s => s.athleteId === athlete.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = athleteSessions[0];
    const blob = generateAthletePDF(athlete, latest);
    const safeName = athlete.name.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');
    downloadBlob(blob, `Laporan_${safeName}.pdf`);
    count++;
    onProgress?.(count, athletes.length, athlete.name);
    // small delay so browser allows multiple downloads
    await new Promise(r => setTimeout(r, 350));
  }
  return { generated: count };
}
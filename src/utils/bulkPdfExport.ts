import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { Athlete, TestSession } from '@/types/athlete';
import { biomotorCategories } from '@/data/biomotorTests';
import {
  AthleteReportTemplate,
  type ReportVersion,
} from '@/components/export/AthleteReportTemplate';

/** Compute average score per biomotor category from a session. */
function computeCategoryScores(session: TestSession): Record<string, number> {
  const out: Record<string, number> = {};
  biomotorCategories.forEach((cat) => {
    const items = session.results.filter((r) => r.categoryId === cat.id);
    if (items.length === 0) return;
    const avg = items.reduce((s, r) => s + r.score, 0) / items.length;
    out[cat.id] = avg;
  });
  return out;
}

/** Render the report template to an off-screen container and snapshot it to a PDF Blob. */
async function renderAthletePDF(
  athlete: Athlete,
  session: TestSession,
  version: ReportVersion,
): Promise<Blob> {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-99999px';
  host.style.top = '0';
  host.style.background = '#ffffff';
  document.body.appendChild(host);

  let root: Root | null = null;
  try {
    root = createRoot(host);
    const categoryScores = computeCategoryScores(session);
    root.render(
      createElement(AthleteReportTemplate, {
        athlete,
        session,
        categoryScores,
        version,
      }),
    );

    // Wait for React commit + images to load
    await new Promise((r) => setTimeout(r, 400));
    const imgs = Array.from(host.querySelectorAll('img'));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((res) => {
            if (img.complete) return res();
            img.onload = () => res();
            img.onerror = () => res();
          }),
      ),
    );

    const target = host.firstElementChild as HTMLElement;
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
    const imgX = (pdfWidth - canvas.width * ratio) / 2;
    pdf.addImage(imgData, 'PNG', imgX, 0, canvas.width * ratio, canvas.height * ratio);

    let remaining = canvas.height * ratio - pdfHeight;
    let page = 1;
    while (remaining > 0) {
      pdf.addPage();
      page++;
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        -(pdfHeight * (page - 1)),
        canvas.width * ratio,
        canvas.height * ratio,
      );
      remaining -= pdfHeight;
    }

    return pdf.output('blob');
  } finally {
    try {
      root?.unmount();
    } catch {
      /* noop */
    }
    host.remove();
  }
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
  version: ReportVersion = 'hirocross',
): Promise<{ generated: number; skipped: number }> {
  let count = 0;
  let skipped = 0;
  for (const athlete of athletes) {
    const latest = sessions
      .filter((s) => s.athleteId === athlete.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!latest) {
      skipped++;
      onProgress?.(count + skipped, athletes.length, athlete.name);
      continue;
    }

    try {
      const blob = await renderAthletePDF(athlete, latest, version);
      const safeName = athlete.name.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');
      const versionName = version === 'hirocross' ? 'Hirocross' : 'VocaFit';
      const dateStr = new Date(latest.date).toISOString().split('T')[0];
      downloadBlob(blob, `Laporan_${versionName}_${safeName}_${dateStr}.pdf`);
      count++;
      onProgress?.(count + skipped, athletes.length, athlete.name);
      // small delay so browser allows multiple downloads
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      console.error(`Failed PDF for ${athlete.name}`, e);
      skipped++;
    }
  }
  return { generated: count, skipped };
}
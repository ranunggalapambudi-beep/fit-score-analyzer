import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, Download, FileText } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { Athlete } from '@/types/athlete';
import { toast } from 'sonner';
import hirocrossLogo from '@/assets/hirocross-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

interface BatchPrintCardsProps {
  athletes: Athlete[];
  teamName: string;
  baseUrl?: string;
}

interface AthleteCardData {
  athlete: Athlete;
  qrDataUrl: string;
  barcodeDataUrl: string;
  shortId: string;
  age: number;
}

export function BatchPrintCards({ athletes, teamName, baseUrl = window.location.origin }: BatchPrintCardsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState<AthleteCardData[]>([]);
  const qrRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Register QR code ref for each athlete
  const setQrRef = (athleteId: string, el: HTMLCanvasElement | null) => {
    if (el) {
      qrRefs.current.set(athleteId, el);
    }
  };

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
      img.src = hirocrossLogo;
    });
  };

  const generateBarcodeDataUrl = (id: string): string => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    try {
      JsBarcode(svg, id, {
        format: 'CODE128',
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 5,
        background: '#ffffff',
        lineColor: '#000000'
      });
      const svgString = new XMLSerializer().serializeToString(svg);
      const encoded = btoa(unescape(encodeURIComponent(svgString)));
      return `data:image/svg+xml;base64,${encoded}`;
    } catch (e) {
      console.error('Barcode generation error:', e);
      return '';
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    return Math.floor(
      (new Date().getTime() - new Date(dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    );
  };

  const prepareCardData = async (): Promise<AthleteCardData[]> => {
    await new Promise(r => setTimeout(r, 200));
    
    return athletes.map(athlete => {
      const qrCanvas = qrRefs.current.get(athlete.id);
      const qrDataUrl = qrCanvas ? qrCanvas.toDataURL('image/png') : '';
      const shortId = athlete.id.slice(0, 8).toUpperCase();
      const barcodeDataUrl = generateBarcodeDataUrl(shortId);
      const age = calculateAge(athlete.dateOfBirth);
      
      return { athlete, qrDataUrl, barcodeDataUrl, shortId, age };
    });
  };

  const generateCardHtml = (
    data: AthleteCardData,
    logoBase64: string
  ) => {
    const { athlete, qrDataUrl, barcodeDataUrl, shortId, age } = data;
    const safeName = escapeHtml(athlete.name);
    const safeSport = escapeHtml(athlete.sport);
    const safeTeam = escapeHtml(athlete.team);
    const safePhoto = escapeHtml(athlete.photo);

    return `
      <div class="card" style="
        width: 340px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 16px;
        overflow: hidden;
        color: white;
        font-family: 'Segoe UI', Tahoma, sans-serif;
        page-break-inside: avoid;
        margin-bottom: 20px;
      ">
        <div style="
          background: linear-gradient(90deg, #e94560 0%, #ff6b6b 100%);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Hirocross" style="width: 40px; height: 40px; object-fit: contain;" />` : ''}
          <div>
            <div style="font-size: 18px; font-weight: 700; letter-spacing: 1px;">HIROCROSS</div>
            <div style="font-size: 10px; opacity: 0.9;">Athlete Identification Card</div>
          </div>
        </div>
        <div style="padding: 24px 20px; display: flex; gap: 20px;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
            ${safePhoto 
              ? `<img src="${safePhoto}" alt="${safeName}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #e94560; object-fit: cover;" />`
              : `<div style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #e94560; background: #2a2a4a; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #e94560;">${safeName.charAt(0)}</div>`
            }
            <div style="background: white; padding: 6px; border-radius: 6px;">
              <img src="${qrDataUrl}" alt="QR Code" style="width: 60px; height: 60px; display: block;" />
            </div>
            <div style="background: white; padding: 4px 8px; border-radius: 4px;">
              <img src="${barcodeDataUrl}" alt="Barcode" style="height: 30px;" />
            </div>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">${safeName}</div>
            <div style="font-size: 12px; color: #e94560; font-weight: 600; margin-bottom: 12px;">${safeSport}</div>
            <div style="display: grid; gap: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #888;">Usia</span>
                <span style="font-weight: 600;">${age} tahun</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #888;">Gender</span>
                <span style="font-weight: 600;">${athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              ${safeTeam ? `
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #888;">Tim</span>
                <span style="font-weight: 600;">${safeTeam}</span>
              </div>
              ` : ''}
              ${athlete.height ? `
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #888;">Tinggi</span>
                <span style="font-weight: 600;">${athlete.height} cm</span>
              </div>
              ` : ''}
              ${athlete.weight ? `
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #888;">Berat</span>
                <span style="font-weight: 600;">${athlete.weight} kg</span>
              </div>
              ` : ''}
            </div>
            <div style="background: #e94560; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block; margin-top: 8px;">ID: ${shortId}</div>
          </div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px 20px; text-align: center; font-size: 10px; color: #888;">
          Scan QR/Barcode untuk akses profil & hasil tes • ${new Date().getFullYear()} Hirocross
        </div>
      </div>
    `;
  };

  const generateStickerHtml = (
    data: AthleteCardData,
    logoBase64: string
  ) => {
    const { athlete, qrDataUrl, barcodeDataUrl, shortId } = data;
    const safeName = escapeHtml(athlete.name);
    const safeSport = escapeHtml(athlete.sport);
    const safeTeam = escapeHtml(athlete.team);
    const safePhoto = escapeHtml(athlete.photo);

    return `
      <div class="sticker" style="
        width: 320px;
        height: 204px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        font-family: 'Segoe UI', Tahoma, sans-serif;
        border: 1px solid #ddd;
        page-break-inside: avoid;
        margin-bottom: 10px;
      ">
        <div style="
          width: 100px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          padding: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="width: 45px; height: 45px; object-fit: contain;" />` : ''}
          <div style="color: white; font-size: 10px; font-weight: 700;">HIROCROSS</div>
          ${safePhoto 
            ? `<img src="${safePhoto}" alt="${safeName}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; object-fit: cover;" />`
            : `<div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold;">${safeName.charAt(0)}</div>`
          }
        </div>
        <div style="flex: 1; padding: 12px; display: flex; flex-direction: column;">
          <div style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 2px;">${safeName}</div>
          <div style="font-size: 11px; color: #e94560; font-weight: 600; margin-bottom: 6px;">${safeSport}</div>
          ${safeTeam ? `<div style="font-size: 9px; color: #666;">Tim: ${safeTeam}</div>` : ''}
          <div style="display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 8px; border-top: 1px solid #eee;">
            <img src="${qrDataUrl}" alt="QR Code" style="width: 55px; height: 55px; border: 1px solid #ddd; border-radius: 4px;" />
            <div style="flex: 1; text-align: center;">
              <img src="${barcodeDataUrl}" alt="Barcode" style="max-width: 100%; height: 35px;" />
              <div style="font-size: 8px; color: #999; margin-top: 2px;">ID: ${shortId}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const handleBatchPrint = async (format: 'card' | 'sticker') => {
    if (athletes.length === 0) {
      toast.error('Tidak ada atlet dalam tim ini.');
      return;
    }

    setIsProcessing(true);

    try {
      const data = await prepareCardData();
      const logoBase64 = await getLogoBase64();

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Popup diblokir. Izinkan popup untuk mencetak.');
        setIsProcessing(false);
        return;
      }

      const cardsHtml = data.map(d => 
        format === 'card' ? generateCardHtml(d, logoBase64) : generateStickerHtml(d, logoBase64)
      ).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Kartu Tim - ${escapeHtml(teamName)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, sans-serif;
              background: #f5f5f5;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e94560;
            }
            .header h1 {
              font-size: 24px;
              color: #1a1a2e;
              margin-bottom: 5px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .cards-container {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              justify-content: center;
            }
            @media print {
              body { 
                background: white; 
                padding: 10mm;
              }
              .header {
                page-break-after: avoid;
              }
              .card, .sticker {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Kartu Atlet - ${escapeHtml(teamName)}</h1>
            <p>Total: ${athletes.length} atlet | Dicetak: ${new Date().toLocaleDateString('id-ID')}</p>
          </div>
          <div class="cards-container">
            ${cardsHtml}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };

      toast.success(`Mencetak ${athletes.length} kartu atlet...`);
    } catch (error) {
      console.error('Batch print error:', error);
      toast.error('Gagal mencetak. Silakan coba lagi.');
    }

    setIsProcessing(false);
  };

  const handleBatchDownloadPDF = async (format: 'card' | 'sticker') => {
    if (athletes.length === 0) {
      toast.error('Tidak ada atlet dalam tim ini.');
      return;
    }

    setIsProcessing(true);

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const data = await prepareCardData();
      const logoBase64 = await getLogoBase64();

      // Create PDF - A4 size
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const cardWidth = format === 'card' ? 85 : 85;
      const cardHeight = format === 'card' ? 130 : 54;
      const cardsPerRow = Math.floor((pageWidth - margin * 2) / (cardWidth + 5));
      const cardsPerCol = Math.floor((pageHeight - margin * 2) / (cardHeight + 5));
      const cardsPerPage = cardsPerRow * cardsPerCol;

      let currentCard = 0;
      let currentPage = 0;

      for (const d of data) {
        if (currentCard > 0 && currentCard % cardsPerPage === 0) {
          pdf.addPage();
          currentPage++;
        }

        const positionOnPage = currentCard % cardsPerPage;
        const col = positionOnPage % cardsPerRow;
        const row = Math.floor(positionOnPage / cardsPerRow);

        const x = margin + col * (cardWidth + 5);
        const y = margin + row * (cardHeight + 5);

        // Create temp container for this card
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        const cardHtml = format === 'card' 
          ? generateCardHtml(d, logoBase64)
          : generateStickerHtml(d, logoBase64);
        
        container.innerHTML = cardHtml;
        await new Promise(r => setTimeout(r, 100));

        const cardElement = container.querySelector('.card, .sticker') as HTMLElement;
        if (cardElement) {
          const canvas = await html2canvas(cardElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);
        }

        document.body.removeChild(container);
        currentCard++;
      }

      pdf.save(`Kartu-Tim-${teamName.replace(/\s+/g, '-')}.pdf`);
      toast.success(`${athletes.length} kartu berhasil diunduh!`);
    } catch (error) {
      console.error('Batch PDF error:', error);
      toast.error('Gagal mengunduh PDF. Silakan coba lagi.');
    }

    setIsProcessing(false);
  };

  return (
    <>
      {/* Hidden QR codes for each athlete */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        {athletes.map(athlete => (
          <QRCodeCanvas
            key={athlete.id}
            ref={(el) => setQrRef(athlete.id, el)}
            value={`${baseUrl}/p/${athlete.id}`}
            size={128}
            level="M"
            includeMargin={false}
          />
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            disabled={isProcessing || athletes.length === 0}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Cetak Batch Kartu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleBatchPrint('card')}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak Kartu Penuh
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBatchPrint('sticker')}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak Stiker Label
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleBatchDownloadPDF('card')}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF Kartu
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBatchDownloadPDF('sticker')}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF Stiker
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

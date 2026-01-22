import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, Tag } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Athlete } from '@/types/athlete';
import { toast } from 'sonner';
import hirocrossLogo from '@/assets/hirocross-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// HTML escape function to prevent XSS attacks
const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

interface AthleteProfileCardProps {
  athlete: Athlete;
  baseUrl?: string;
}

export function AthleteProfileCard({ athlete, baseUrl = window.location.origin }: AthleteProfileCardProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const age = Math.floor(
    (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)
  );

  // Public profile URL (accessible without login)
  const publicProfileUrl = `${baseUrl}/p/${athlete.id}`;
  // Short ID for barcode
  const shortId = athlete.id.slice(0, 8).toUpperCase();

  // Convert logo to base64 for print window
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

  const handlePrint = async (format: 'card' | 'sticker' = 'card') => {
    setIsPrinting(true);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup diblokir. Izinkan popup untuk mencetak.');
      setIsPrinting(false);
      return;
    }

    // Get logo as base64
    const logoBase64 = await getLogoBase64();

    // Escape all user-controlled data to prevent XSS
    const safeName = escapeHtml(athlete.name);
    const safeSport = escapeHtml(athlete.sport);
    const safeTeam = escapeHtml(athlete.team);
    const safePhoto = escapeHtml(athlete.photo);
    const safePublicUrl = encodeURI(publicProfileUrl);

    const cardHtml = format === 'sticker' 
      ? generateStickerHtml(safeName, safeSport, safeTeam, safePhoto, safePublicUrl, shortId, logoBase64)
      : generateCardHtml(safeName, safeSport, safeTeam, safePhoto, safePublicUrl, shortId, logoBase64, age, athlete);

    printWindow.document.write(cardHtml);
    printWindow.document.close();
    
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const generateStickerHtml = (
    safeName: string, 
    safeSport: string, 
    safeTeam: string | undefined, 
    safePhoto: string | undefined, 
    safePublicUrl: string, 
    shortId: string,
    logoBase64: string
  ) => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Stiker Atlet - ${safeName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        .sticker {
          width: 85mm;
          height: 54mm;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          page-break-inside: avoid;
        }
        .left-section {
          width: 28mm;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          padding: 4mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2mm;
        }
        .logo {
          width: 12mm;
          height: 12mm;
          object-fit: contain;
        }
        .brand {
          color: white;
          font-size: 6pt;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .photo {
          width: 14mm;
          height: 14mm;
          border-radius: 50%;
          border: 2px solid white;
          object-fit: cover;
          background: rgba(255,255,255,0.2);
        }
        .photo-placeholder {
          width: 14mm;
          height: 14mm;
          border-radius: 50%;
          border: 2px solid white;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10pt;
          font-weight: bold;
        }
        .right-section {
          flex: 1;
          padding: 3mm 4mm;
          display: flex;
          flex-direction: column;
        }
        .name {
          font-size: 10pt;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 1mm;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sport {
          font-size: 7pt;
          color: #e94560;
          font-weight: 600;
          margin-bottom: 2mm;
        }
        .info-row {
          display: flex;
          font-size: 6pt;
          color: #666;
          gap: 3mm;
        }
        .codes-section {
          display: flex;
          align-items: center;
          gap: 3mm;
          margin-top: auto;
          padding-top: 2mm;
          border-top: 1px solid #eee;
        }
        .qr-box {
          width: 15mm;
          height: 15mm;
          background: white;
          padding: 1mm;
          border: 1px solid #ddd;
          border-radius: 2px;
        }
        .qr-box canvas {
          width: 100% !important;
          height: 100% !important;
        }
        .barcode-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .barcode-box svg {
          max-width: 100%;
          height: 12mm !important;
        }
        .id-text {
          font-size: 6pt;
          color: #999;
          margin-top: 1mm;
        }
        @media print {
          body { 
            background: white; 
            padding: 0; 
          }
          .sticker { 
            border: 0.5pt solid #ccc;
            box-shadow: none;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="sticker">
        <div class="left-section">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo" />` : ''}
          <div class="brand">HIROCROSS</div>
          ${safePhoto 
            ? `<img src="${safePhoto}" alt="${safeName}" class="photo" />`
            : `<div class="photo-placeholder">${safeName.charAt(0)}</div>`
          }
        </div>
        <div class="right-section">
          <div class="name">${safeName}</div>
          <div class="sport">${safeSport}</div>
          ${safeTeam ? `<div class="info-row">Tim: ${safeTeam}</div>` : ''}
          <div class="codes-section">
            <div class="qr-box">
              <canvas id="qr-code"></canvas>
            </div>
            <div class="barcode-box">
              <svg id="barcode"></svg>
              <div class="id-text">ID: ${shortId}</div>
            </div>
          </div>
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
      <script>
        function waitForLibraries() {
          return new Promise((resolve) => {
            const check = () => {
              if (typeof QRCode !== 'undefined' && typeof JsBarcode !== 'undefined') {
                resolve();
              } else {
                setTimeout(check, 50);
              }
            };
            check();
          });
        }
        
        async function generateCodes() {
          await waitForLibraries();
          
          // Generate QR Code
          try {
            const qrCanvas = document.getElementById('qr-code');
            await QRCode.toCanvas(qrCanvas, '${safePublicUrl}', { 
              width: 80, 
              margin: 0,
              color: { dark: '#000000', light: '#ffffff' }
            });
          } catch(e) {
            console.error('QR error:', e);
          }
          
          // Generate Barcode
          try {
            JsBarcode("#barcode", "${shortId}", {
              format: "CODE128",
              width: 1.2,
              height: 30,
              displayValue: false,
              margin: 0
            });
          } catch(e) {
            console.error('Barcode error:', e);
          }
          
          // Wait a bit then print
          setTimeout(() => window.print(), 300);
        }
        
        generateCodes();
      </script>
    </body>
    </html>
  `;

  const generateCardHtml = (
    safeName: string, 
    safeSport: string, 
    safeTeam: string | undefined, 
    safePhoto: string | undefined, 
    safePublicUrl: string, 
    shortId: string,
    logoBase64: string,
    age: number,
    athlete: Athlete
  ) => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kartu Atlet - ${safeName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .card {
          width: 350px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          color: white;
        }
        .header {
          background: linear-gradient(90deg, #e94560 0%, #ff6b6b 100%);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }
        .header-text h1 {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .header-text p {
          font-size: 10px;
          opacity: 0.9;
        }
        .body {
          padding: 24px 20px;
          display: flex;
          gap: 20px;
        }
        .photo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #e94560;
          object-fit: cover;
          background: #2a2a4a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: #e94560;
        }
        .codes-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .qr-container {
          background: white;
          padding: 6px;
          border-radius: 6px;
        }
        .qr-container canvas {
          display: block;
        }
        .barcode-container {
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          min-height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .info-section {
          flex: 1;
        }
        .name {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #fff;
        }
        .sport {
          font-size: 12px;
          color: #e94560;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .details {
          display: grid;
          gap: 8px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .detail-label {
          color: #888;
        }
        .detail-value {
          font-weight: 600;
        }
        .footer {
          background: rgba(0,0,0,0.2);
          padding: 12px 20px;
          text-align: center;
          font-size: 10px;
          color: #888;
        }
        .id-badge {
          background: #e94560;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          display: inline-block;
          margin-top: 8px;
        }
        @media print {
          body { background: white; padding: 0; }
          .card { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Hirocross" class="logo" />` : '<div class="logo"></div>'}
          <div class="header-text">
            <h1>HIROCROSS</h1>
            <p>Athlete Identification Card</p>
          </div>
        </div>
        <div class="body">
          <div class="photo-section">
            ${safePhoto 
              ? `<img src="${safePhoto}" alt="${safeName}" class="photo" />`
              : `<div class="photo">${safeName.charAt(0)}</div>`
            }
            <div class="codes-container">
              <div class="qr-container">
                <canvas id="qr-code" width="60" height="60"></canvas>
              </div>
              <div class="barcode-container">
                <svg id="barcode"></svg>
              </div>
            </div>
          </div>
          <div class="info-section">
            <div class="name">${safeName}</div>
            <div class="sport">${safeSport}</div>
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Usia</span>
                <span class="detail-value">${age} tahun</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Gender</span>
                <span class="detail-value">${athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              ${safeTeam ? `
              <div class="detail-row">
                <span class="detail-label">Tim</span>
                <span class="detail-value">${safeTeam}</span>
              </div>
              ` : ''}
              ${athlete.height ? `
              <div class="detail-row">
                <span class="detail-label">Tinggi</span>
                <span class="detail-value">${athlete.height} cm</span>
              </div>
              ` : ''}
              ${athlete.weight ? `
              <div class="detail-row">
                <span class="detail-label">Berat</span>
                <span class="detail-value">${athlete.weight} kg</span>
              </div>
              ` : ''}
            </div>
            <div class="id-badge">ID: ${shortId}</div>
          </div>
        </div>
        <div class="footer">
          Scan QR/Barcode untuk akses profil & hasil tes • ${new Date().getFullYear()} Hirocross
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
      <script>
        function waitForLibraries() {
          return new Promise((resolve) => {
            const check = () => {
              if (typeof QRCode !== 'undefined' && typeof JsBarcode !== 'undefined') {
                resolve();
              } else {
                setTimeout(check, 50);
              }
            };
            check();
          });
        }
        
        async function generateCodes() {
          await waitForLibraries();
          
          // Generate QR Code
          try {
            const qrCanvas = document.getElementById('qr-code');
            await QRCode.toCanvas(qrCanvas, '${safePublicUrl}', { 
              width: 60, 
              margin: 0,
              color: { dark: '#000000', light: '#ffffff' }
            });
          } catch(e) {
            console.error('QR error:', e);
          }
          
          // Generate Barcode
          try {
            JsBarcode("#barcode", "${shortId}", {
              format: "CODE128",
              width: 1.5,
              height: 25,
              displayValue: true,
              fontSize: 10,
              margin: 0
            });
          } catch(e) {
            console.error('Barcode error:', e);
          }
          
          // Wait a bit then print
          setTimeout(() => window.print(), 500);
        }
        
        generateCodes();
      </script>
    </body>
    </html>
  `;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            disabled={isPrinting}
            className="gap-2"
          >
            {isPrinting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            Cetak Kartu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handlePrint('card')} className="gap-2">
            <Printer className="w-4 h-4" />
            Kartu Penuh (350px)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePrint('sticker')} className="gap-2">
            <Tag className="w-4 h-4" />
            Stiker Label (85x54mm)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Preview Card */}
      <div ref={cardRef} className="hidden">
        <div className="w-[350px] bg-gradient-to-br from-background to-muted rounded-xl overflow-hidden border">
          <div className="bg-primary p-4 flex items-center gap-3">
            <img src={hirocrossLogo} alt="Hirocross" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">HIROCROSS</h1>
              <p className="text-xs text-primary-foreground/80">Athlete ID Card</p>
            </div>
          </div>
          <div className="p-5 flex gap-4">
            <div className="flex flex-col items-center gap-3">
              {athlete.photo ? (
                <img src={athlete.photo} alt={athlete.name} className="w-20 h-20 rounded-full border-2 border-primary object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted border-2 border-primary flex items-center justify-center text-2xl font-bold">
                  {athlete.name.charAt(0)}
                </div>
              )}
              <div className="bg-white p-2 rounded">
                <QRCodeSVG value={publicProfileUrl} size={60} />
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {shortId}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{athlete.name}</h2>
              <p className="text-sm text-primary font-medium">{athlete.sport}</p>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Usia</span><span>{age} tahun</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gender</span><span>{athlete.gender === 'male' ? 'L' : 'P'}</span></div>
                {athlete.team && <div className="flex justify-between"><span className="text-muted-foreground">Tim</span><span>{athlete.team}</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

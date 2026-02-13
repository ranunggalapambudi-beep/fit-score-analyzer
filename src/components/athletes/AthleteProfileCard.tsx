import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, Tag, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { Athlete } from '@/types/athlete';
import { toast } from 'sonner';
import hirocrossLogo from '@/assets/hirocross-logo.png';
 import vocafitLogo from '@/assets/vocafit-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
   DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Label } from "@/components/ui/label";

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

 type CardVersion = 'hirocross' | 'vocafit';
 
export function AthleteProfileCard({ athlete, baseUrl = window.location.origin }: AthleteProfileCardProps) {
  const [isPrinting, setIsPrinting] = useState(false);
   const [selectedVersion, setSelectedVersion] = useState<CardVersion>('hirocross');
  const qrRef = useRef<HTMLCanvasElement>(null);

  const age = Math.floor(
    (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)
  );

  // Public profile URL (accessible without login)
  const publicProfileUrl = `${baseUrl}/p/${athlete.id}`;
  // Short ID for barcode
  const shortId = athlete.id.slice(0, 8).toUpperCase();

  // Convert logo to base64 for print window
   const getLogoBase64 = (version: CardVersion): Promise<string> => {
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
       img.src = version === 'vocafit' ? vocafitLogo : hirocrossLogo;
    });
  };

  // Generate QR Code as base64 data URL
  const generateQRCodeDataUrl = useCallback((): string => {
    if (qrRef.current) {
      return qrRef.current.toDataURL('image/png');
    }
    return '';
  }, []);

  // Generate Barcode as SVG string
  const generateBarcodeSVG = useCallback((id: string): string => {
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
      return new XMLSerializer().serializeToString(svg);
    } catch (e) {
      console.error('Barcode generation error:', e);
      return '';
    }
  }, []);

  // Generate Barcode as base64 data URL
  const generateBarcodeDataUrl = useCallback((id: string): string => {
    const svgString = generateBarcodeSVG(id);
    if (!svgString) return '';
    
    const encoded = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${encoded}`;
  }, [generateBarcodeSVG]);

  const handlePrint = async (format: 'card' | 'sticker' = 'card') => {
    setIsPrinting(true);
    
    // Wait a moment for QR code to render
    await new Promise(r => setTimeout(r, 100));

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup diblokir. Izinkan popup untuk mencetak.');
      setIsPrinting(false);
      return;
    }

    // Get pre-generated assets
     const logoBase64 = await getLogoBase64(selectedVersion);
    const qrDataUrl = generateQRCodeDataUrl();
    const barcodeDataUrl = generateBarcodeDataUrl(shortId);

    // Escape all user-controlled data to prevent XSS
    const safeName = escapeHtml(athlete.name);
    const safeSport = escapeHtml(athlete.sport);
    const safeTeam = escapeHtml(athlete.team);
    const safePhoto = escapeHtml(athlete.photo);

    const cardHtml = format === 'sticker' 
       ? generateStickerHtml(safeName, safeSport, safeTeam, safePhoto, qrDataUrl, barcodeDataUrl, shortId, logoBase64, selectedVersion)
       : generateCardHtml(safeName, safeSport, safeTeam, safePhoto, qrDataUrl, barcodeDataUrl, shortId, logoBase64, age, athlete, selectedVersion);

    printWindow.document.write(cardHtml);
    printWindow.document.close();
    
    // Wait for images to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
    
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleDownloadPDF = async (format: 'card' | 'sticker' = 'card') => {
    setIsPrinting(true);
    
    try {
      // Dynamically import jspdf and html2canvas
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      // Wait for QR code to render
      await new Promise(r => setTimeout(r, 100));

      // Get pre-generated assets
       const logoBase64 = await getLogoBase64(selectedVersion);
      const qrDataUrl = generateQRCodeDataUrl();
      const barcodeDataUrl = generateBarcodeDataUrl(shortId);

      const safeName = escapeHtml(athlete.name);
      const safeSport = escapeHtml(athlete.sport);
      const safeTeam = escapeHtml(athlete.team);
      const safePhoto = escapeHtml(athlete.photo);

      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      const cardHtml = format === 'sticker' 
         ? generateStickerHtmlForPDF(safeName, safeSport, safeTeam, safePhoto, qrDataUrl, barcodeDataUrl, shortId, logoBase64, selectedVersion)
         : generateCardHtmlForPDF(safeName, safeSport, safeTeam, safePhoto, qrDataUrl, barcodeDataUrl, shortId, logoBase64, age, athlete, selectedVersion);

      container.innerHTML = cardHtml;

      // Wait for images to load
      await new Promise(r => setTimeout(r, 500));

      const cardElement = container.querySelector('.card, .sticker') as HTMLElement;
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: format === 'sticker' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: format === 'sticker' ? [85, 54] : [90, 130]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
       const versionName = selectedVersion === 'hirocross' ? 'Hirocross' : 'VocaFit';
       pdf.save(`Kartu-${versionName}-${athlete.name.replace(/\s+/g, '-')}.pdf`);

      // Cleanup
      document.body.removeChild(container);
      toast.success('Kartu berhasil diunduh!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Gagal mengunduh kartu. Silakan coba lagi.');
    }
    
    setIsPrinting(false);
  };

  const generateStickerHtmlForPDF = (
    safeName: string, 
    safeSport: string, 
    safeTeam: string | undefined, 
    safePhoto: string | undefined, 
    qrDataUrl: string,
    barcodeDataUrl: string,
    shortId: string,
     logoBase64: string,
     version: CardVersion
   ) => {
     const isVocafit = version === 'vocafit';
     const brandName = isVocafit ? 'VOCAFIT' : 'HIROCROSS';
     const primaryColor = isVocafit ? '#1e40af' : '#e94560';
     const gradientColors = isVocafit 
       ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
       : 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)';
     
     return `
    <div class="sticker" style="
      width: 320px;
      height: 204px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      font-family: 'Segoe UI', Tahoma, sans-serif;
    ">
      <div style="
        width: 100px;
         background: ${gradientColors};
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
      ">
         ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="width: ${isVocafit ? '60px' : '45px'}; height: ${isVocafit ? '35px' : '45px'}; object-fit: contain;" />` : ''}
         <div style="color: white; font-size: 10px; font-weight: 700;">${brandName}</div>
        ${safePhoto 
          ? `<img src="${safePhoto}" alt="${safeName}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; object-fit: cover;" />`
          : `<div style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold;">${safeName.charAt(0)}</div>`
        }
      </div>
      <div style="flex: 1; padding: 12px; display: flex; flex-direction: column;">
        <div style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 2px;">${safeName}</div>
         <div style="font-size: 11px; color: ${primaryColor}; font-weight: 600; margin-bottom: 6px;">${safeSport}</div>
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

  const generateCardHtmlForPDF = (
    safeName: string, 
    safeSport: string, 
    safeTeam: string | undefined, 
    safePhoto: string | undefined, 
    qrDataUrl: string,
    barcodeDataUrl: string,
    shortId: string,
    logoBase64: string,
    age: number,
     athlete: Athlete,
     version: CardVersion
   ) => {
     const isVocafit = version === 'vocafit';
     const brandName = isVocafit ? 'VOCAFIT' : 'HIROCROSS';
     const primaryColor = isVocafit ? '#1e40af' : '#e94560';
     const headerGradient = isVocafit 
       ? 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)'
       : 'linear-gradient(90deg, #e94560 0%, #ff6b6b 100%)';
     const bodyGradient = isVocafit
       ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)'
       : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
     
     return `
    <div class="card" style="
      width: 340px;
       background: ${bodyGradient};
      border-radius: 16px;
      overflow: hidden;
      color: white;
      font-family: 'Segoe UI', Tahoma, sans-serif;
    ">
      <div style="
         background: ${headerGradient};
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      ">
         ${logoBase64 ? `<img src="${logoBase64}" alt="${brandName}" style="width: ${isVocafit ? '80px' : '40px'}; height: ${isVocafit ? '35px' : '40px'}; object-fit: contain;" />` : ''}
        <div>
           <div style="font-size: 18px; font-weight: 700; letter-spacing: 1px;">${brandName}</div>
          <div style="font-size: 10px; opacity: 0.9;">Athlete Identification Card</div>
        </div>
      </div>
      <div style="padding: 24px 20px; display: flex; gap: 20px;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
          ${safePhoto 
             ? `<img src="${safePhoto}" alt="${safeName}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid ${primaryColor}; object-fit: cover;" />`
             : `<div style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid ${primaryColor}; background: #2a2a4a; display: flex; align-items: center; justify-content: center; font-size: 32px; color: ${primaryColor};">${safeName.charAt(0)}</div>`
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
           <div style="font-size: 12px; color: ${primaryColor}; font-weight: 600; margin-bottom: 12px;">${safeSport}</div>
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
           <div style="background: ${primaryColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; display: inline-block; margin-top: 8px;">ID: ${shortId}</div>
        </div>
      </div>
      <div style="background: rgba(0,0,0,0.2); padding: 12px 20px; text-align: center; font-size: 10px; color: #888;">
         Scan QR/Barcode untuk akses profil & hasil tes • ${new Date().getFullYear()} ${brandName}
      </div>
    </div>
  `;
   };

  const generateStickerHtml = (
    safeName: string, 
    safeSport: string, 
    safeTeam: string | undefined, 
    safePhoto: string | undefined, 
    qrDataUrl: string,
    barcodeDataUrl: string,
    shortId: string,
     logoBase64: string,
     version: CardVersion
   ) => {
     const isVocafit = version === 'vocafit';
     const brandName = isVocafit ? 'VOCAFIT' : 'HIROCROSS';
     const primaryColor = isVocafit ? '#1e40af' : '#e94560';
     const gradientColors = isVocafit 
       ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
       : 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)';
     
     return `
    <!DOCTYPE html>
    <html>
    <head>
       <title>Stiker Atlet ${brandName} - ${safeName}</title>
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
           background: ${gradientColors};
          padding: 4mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2mm;
        }
        .logo {
           width: ${isVocafit ? '18mm' : '12mm'};
           height: ${isVocafit ? '10mm' : '12mm'};
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
           color: ${primaryColor};
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
        .qr-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .barcode-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .barcode-box img {
          max-width: 100%;
          height: 12mm;
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
           <div class="brand">${brandName}</div>
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
              <img src="${qrDataUrl}" alt="QR Code" />
            </div>
            <div class="barcode-box">
              <img src="${barcodeDataUrl}" alt="Barcode" />
              <div class="id-text">ID: ${shortId}</div>
            </div>
          </div>
        </div>
      </div>
      <script>
        // Wait for all images to load
        Promise.all(Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })).then(() => {
          setTimeout(() => window.print(), 200);
        });
      </script>
    </body>
    </html>
  `;
   };

  const generateCardHtml = (
    safeName: string, 
    safeSport: string, 
    safeTeam: string | undefined, 
    safePhoto: string | undefined, 
    qrDataUrl: string,
    barcodeDataUrl: string,
    shortId: string,
    logoBase64: string,
    age: number,
     athlete: Athlete,
     version: CardVersion
   ) => {
     const isVocafit = version === 'vocafit';
     const brandName = isVocafit ? 'VOCAFIT' : 'HIROCROSS';
     const primaryColor = isVocafit ? '#1e40af' : '#e94560';
     const headerGradient = isVocafit 
       ? 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)'
       : 'linear-gradient(90deg, #e94560 0%, #ff6b6b 100%)';
     const bodyGradient = isVocafit
       ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)'
       : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
     
     return `
    <!DOCTYPE html>
    <html>
    <head>
       <title>Kartu Atlet ${brandName} - ${safeName}</title>
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
           background: ${bodyGradient};
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          color: white;
        }
        .header {
           background: ${headerGradient};
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
           width: ${isVocafit ? '80px' : '40px'};
           height: ${isVocafit ? '35px' : '40px'};
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
          gap: 10px;
        }
        .photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
           border: 3px solid ${primaryColor};
          object-fit: cover;
          background: #2a2a4a;
        }
        .photo-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
           border: 3px solid ${primaryColor};
          background: #2a2a4a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
           color: ${primaryColor};
        }
        .qr-container {
          background: white;
          padding: 6px;
          border-radius: 6px;
        }
        .qr-container img {
          width: 60px;
          height: 60px;
          display: block;
        }
        .barcode-container {
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .barcode-container img {
          height: 30px;
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
           color: ${primaryColor};
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
           background: ${primaryColor};
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
           ${logoBase64 ? `<img src="${logoBase64}" alt="${brandName}" class="logo" />` : '<div class="logo"></div>'}
          <div class="header-text">
             <h1>${brandName}</h1>
            <p>Athlete Identification Card</p>
          </div>
        </div>
        <div class="body">
          <div class="photo-section">
            ${safePhoto 
              ? `<img src="${safePhoto}" alt="${safeName}" class="photo" />`
              : `<div class="photo-placeholder">${safeName.charAt(0)}</div>`
            }
            <div class="qr-container">
              <img src="${qrDataUrl}" alt="QR Code" />
            </div>
            <div class="barcode-container">
              <img src="${barcodeDataUrl}" alt="Barcode" />
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
           Scan QR/Barcode untuk akses profil & hasil tes • ${new Date().getFullYear()} ${brandName}
        </div>
      </div>
      <script>
        // Wait for all images to load
        Promise.all(Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })).then(() => {
          setTimeout(() => window.print(), 200);
        });
      </script>
    </body>
    </html>
  `;
   };

  return (
    <>
      {/* Hidden QR Code Canvas for generating data URL */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <QRCodeCanvas
          ref={qrRef}
          value={publicProfileUrl}
          size={200}
          level="M"
          includeMargin={false}
        />
      </div>

       <div className="flex items-center gap-2">
         <Select value={selectedVersion} onValueChange={(v: CardVersion) => setSelectedVersion(v)}>
           <SelectTrigger className="w-[130px] h-9">
             <SelectValue placeholder="Pilih versi" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="hirocross">HiroCross</SelectItem>
             <SelectItem value="vocafit">VocaFit</SelectItem>
           </SelectContent>
         </Select>
 
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
           <DropdownMenuContent align="end" className="bg-popover">
             <DropdownMenuLabel className="text-xs text-muted-foreground">
               Versi: {selectedVersion === 'hirocross' ? 'HiroCross' : 'VocaFit'}
             </DropdownMenuLabel>
             <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => handlePrint('card')} className="gap-2">
               <Printer className="w-4 h-4" />
               Cetak Kartu Penuh
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handlePrint('sticker')} className="gap-2">
               <Tag className="w-4 h-4" />
               Cetak Stiker Label
             </DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => handleDownloadPDF('card')} className="gap-2">
               <Download className="w-4 h-4" />
               Download PDF Kartu
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleDownloadPDF('sticker')} className="gap-2">
               <Download className="w-4 h-4" />
               Download PDF Stiker
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       </div>
    </>
  );
}

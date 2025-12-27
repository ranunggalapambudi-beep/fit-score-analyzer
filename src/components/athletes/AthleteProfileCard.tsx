import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Athlete } from '@/types/athlete';
import { toast } from 'sonner';
import hirocrossLogo from '@/assets/hirocross-logo.png';

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

  const athleteUrl = `${baseUrl}/athletes/${athlete.id}`;

  const handlePrint = () => {
    setIsPrinting(true);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup diblokir. Izinkan popup untuk mencetak.');
      setIsPrinting(false);
      return;
    }

    const cardHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kartu Atlet - ${athlete.name}</title>
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
          .qr-container {
            background: white;
            padding: 8px;
            border-radius: 8px;
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
            <img src="${hirocrossLogo}" alt="Hirocross" class="logo" />
            <div class="header-text">
              <h1>HIROCROSS</h1>
              <p>Athlete Identification Card</p>
            </div>
          </div>
          <div class="body">
            <div class="photo-section">
              ${athlete.photo 
                ? `<img src="${athlete.photo}" alt="${athlete.name}" class="photo" />`
                : `<div class="photo">${athlete.name.charAt(0)}</div>`
              }
              <div class="qr-container">
                <svg id="qr-placeholder" width="70" height="70"></svg>
              </div>
            </div>
            <div class="info-section">
              <div class="name">${athlete.name}</div>
              <div class="sport">${athlete.sport}</div>
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Usia</span>
                  <span class="detail-value">${age} tahun</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Gender</span>
                  <span class="detail-value">${athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
                ${athlete.team ? `
                <div class="detail-row">
                  <span class="detail-label">Tim</span>
                  <span class="detail-value">${athlete.team}</span>
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
              <div class="id-badge">ID: ${athlete.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
          <div class="footer">
            Scan QR untuk akses profil digital • ${new Date().getFullYear()} Hirocross
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        <script>
          const canvas = document.createElement('canvas');
          QRCode.toCanvas(canvas, '${athleteUrl}', { width: 70, margin: 0 }, function(error) {
            if (!error) {
              const placeholder = document.getElementById('qr-placeholder');
              placeholder.parentNode.replaceChild(canvas, placeholder);
            }
          });
          setTimeout(() => window.print(), 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(cardHtml);
    printWindow.document.close();
    
    setTimeout(() => setIsPrinting(false), 1000);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={handlePrint}
        disabled={isPrinting}
        className="gap-2"
      >
        {isPrinting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Printer className="w-4 h-4" />
        )}
        Cetak Kartu Profil
      </Button>

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
                <QRCodeSVG value={athleteUrl} size={70} />
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

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScanLine, Camera, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  trigger?: React.ReactNode;
}

export function BarcodeScanner({ trigger }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const startScanning = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const html5QrCode = new Html5Qrcode('reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (normal during scanning)
          console.debug('Scan frame:', errorMessage);
        }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    stopScanning();
    setIsOpen(false);

    // Check if it's a URL (QR code)
    if (decodedText.startsWith('http')) {
      try {
        const url = new URL(decodedText);
        const pathMatch = url.pathname.match(/\/p\/([a-zA-Z0-9-]+)/);
        if (pathMatch) {
          toast.success('Atlet ditemukan!');
          navigate(`/p/${pathMatch[1]}`);
          return;
        }
      } catch (e) {
        console.error('Invalid URL:', e);
      }
    }

    // Check if it's a short ID (barcode - 8 character uppercase)
    if (/^[A-Z0-9]{8}$/.test(decodedText)) {
      // Search for athlete with this short ID prefix
      toast.info('Mencari atlet dengan ID: ' + decodedText);
      // Navigate to search or use the short ID to find the athlete
      // For now, we'll show an info message
      handleShortIdSearch(decodedText.toLowerCase());
      return;
    }

    // Try to extract UUID directly
    const uuidMatch = decodedText.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
    if (uuidMatch) {
      toast.success('Atlet ditemukan!');
      navigate(`/p/${uuidMatch[0]}`);
      return;
    }

    toast.error('Kode tidak valid. Pastikan scan barcode/QR atlet yang benar.');
  };

  const handleShortIdSearch = async (shortId: string) => {
    // Since barcode only shows first 8 chars of UUID, we need to search
    // Navigate to athletes page with search filter
    toast.info('Fitur pencarian dengan short ID akan segera tersedia');
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanning();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopScanning();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <ScanLine className="w-4 h-4" />
            Scan Barcode
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Barcode / QR Code Atlet
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div 
                id="reader" 
                className="w-full aspect-square bg-muted rounded-lg overflow-hidden"
              >
                {!isScanning && !error && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {error && (
                <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={startScanning}
                  >
                    Coba Lagi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="text-center text-sm text-muted-foreground">
            <p>Arahkan kamera ke barcode atau QR code pada kartu atlet</p>
            <p className="text-xs mt-1">Hasil tes akan ditampilkan jika atlet sudah melakukan tes</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

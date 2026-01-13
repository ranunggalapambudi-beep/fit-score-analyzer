import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { parseCSV, parseAthletesFromCSV, parseTeamsFromCSV } from '@/utils/csvExport';
import { Athlete } from '@/types/athlete';
import { Team } from '@/types/team';

interface CSVImportDialogProps {
  type: 'athletes' | 'teams';
  onImportAthletes?: (athletes: Omit<Athlete, 'id'>[]) => Promise<void>;
  onImportTeams?: (teams: Omit<Team, 'id' | 'createdAt'>[]) => Promise<void>;
  trigger?: React.ReactNode;
}

export function CSVImportDialog({ type, onImportAthletes, onImportTeams, trigger }: CSVImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      setPreview([]);
      return;
    }

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Hanya file CSV yang diperbolehkan');
      setFile(null);
      setPreview([]);
      return;
    }

    setFile(selectedFile);
    
    try {
      const text = await selectedFile.text();
      const data = parseCSV(text);
      setPreview(data.slice(0, 5)); // Show first 5 rows as preview
    } catch {
      setError('Gagal membaca file CSV');
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    setError(null);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (type === 'athletes' && onImportAthletes) {
        const athletes = parseAthletesFromCSV(data);
        if (athletes.length === 0) {
          setError('Tidak ada data atlet valid yang ditemukan');
          setImporting(false);
          return;
        }
        await onImportAthletes(athletes);
      } else if (type === 'teams' && onImportTeams) {
        const teams = parseTeamsFromCSV(data);
        if (teams.length === 0) {
          setError('Tidak ada data tim valid yang ditemukan');
          setImporting(false);
          return;
        }
        await onImportTeams(teams);
      }
      
      setOpen(false);
      setFile(null);
      setPreview([]);
    } catch (err) {
      setError('Gagal mengimpor data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setImporting(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import {type === 'athletes' ? 'Data Atlet' : 'Data Tim'}
          </DialogTitle>
          <DialogDescription>
            Upload file CSV untuk mengimpor {type === 'athletes' ? 'data atlet' : 'data tim'} secara massal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">
              {file ? file.name : 'Klik untuk upload file CSV'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Format: {type === 'athletes' ? 'name, dateOfBirth, gender, sport, team' : 'name, sport, description, color'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Preview ({preview.length} baris pertama)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border rounded-lg overflow-hidden">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(preview[0]).slice(0, 4).map(key => (
                        <th key={key} className="p-2 text-left font-medium">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        {Object.values(row).slice(0, 4).map((val, j) => (
                          <td key={j} className="p-2 truncate max-w-[100px]">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || importing}
              className="gap-2"
            >
              {importing ? 'Mengimpor...' : 'Import Data'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
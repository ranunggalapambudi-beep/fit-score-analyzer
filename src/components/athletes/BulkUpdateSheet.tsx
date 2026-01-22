import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Athlete } from '@/types/athlete';
import { Loader2, Scale, Ruler, AlertCircle } from 'lucide-react';

interface BulkUpdateSheetProps {
  athletes: Athlete[];
  onSuccess: () => void;
  trigger: React.ReactNode;
}

interface AthleteUpdate {
  id: string;
  name: string;
  height: string;
  weight: string;
  selected: boolean;
  hasData: boolean;
}

export function BulkUpdateSheet({ athletes, onSuccess, trigger }: BulkUpdateSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [athleteUpdates, setAthleteUpdates] = useState<AthleteUpdate[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (open) {
      // Initialize with athletes that need data
      const updates = athletes.map((a) => ({
        id: a.id,
        name: a.name,
        height: a.height?.toString() || '',
        weight: a.weight?.toString() || '',
        selected: !a.height || !a.weight, // Auto-select athletes missing data
        hasData: Boolean(a.height && a.weight),
      }));
      setAthleteUpdates(updates);
      setSelectAll(false);
    }
  }, [open, athletes]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setAthleteUpdates((prev) =>
      prev.map((a) => ({ ...a, selected: checked }))
    );
  };

  const handleSelectAthlete = (id: string, checked: boolean) => {
    setAthleteUpdates((prev) =>
      prev.map((a) => (a.id === id ? { ...a, selected: checked } : a))
    );
  };

  const handleHeightChange = (id: string, value: string) => {
    setAthleteUpdates((prev) =>
      prev.map((a) => (a.id === id ? { ...a, height: value } : a))
    );
  };

  const handleWeightChange = (id: string, value: string) => {
    setAthleteUpdates((prev) =>
      prev.map((a) => (a.id === id ? { ...a, weight: value } : a))
    );
  };

  const handleSubmit = async () => {
    const selectedAthletes = athleteUpdates.filter((a) => a.selected);
    
    if (selectedAthletes.length === 0) {
      toast.error('Pilih minimal satu atlet untuk diupdate');
      return;
    }

    // Validate data
    const invalidAthletes = selectedAthletes.filter(
      (a) => !a.height || !a.weight || isNaN(Number(a.height)) || isNaN(Number(a.weight))
    );

    if (invalidAthletes.length > 0) {
      toast.error(`${invalidAthletes.length} atlet memiliki data tidak valid`);
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const athlete of selectedAthletes) {
      const { error } = await supabase
        .from('athletes')
        .update({
          height: Number(athlete.height),
          weight: Number(athlete.weight),
        })
        .eq('id', athlete.id);

      if (error) {
        console.error('Error updating athlete:', error);
        errorCount++;
      } else {
        successCount++;
      }
    }

    setLoading(false);

    if (successCount > 0) {
      toast.success(`${successCount} atlet berhasil diupdate`);
      onSuccess();
      setOpen(false);
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} atlet gagal diupdate`);
    }
  };

  const selectedCount = athleteUpdates.filter((a) => a.selected).length;
  const missingDataCount = athletes.filter((a) => !a.height || !a.weight).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Bulk Update TB & BB
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Info Banner */}
          {missingDataCount > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-500">
                  {missingDataCount} atlet belum memiliki data TB/BB
                </p>
                <p className="text-muted-foreground mt-1">
                  Lengkapi data untuk menampilkan BMI di laporan PDF
                </p>
              </div>
            </div>
          )}

          {/* Select All */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
              <Label htmlFor="select-all" className="font-medium">
                Pilih Semua
              </Label>
            </div>
            <Badge variant="secondary">{selectedCount} dipilih</Badge>
          </div>

          {/* Athletes List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {athleteUpdates.map((athlete) => (
                <div
                  key={athlete.id}
                  className={`p-3 rounded-lg border ${
                    athlete.selected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      id={athlete.id}
                      checked={athlete.selected}
                      onCheckedChange={(checked) =>
                        handleSelectAthlete(athlete.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={athlete.id} className="font-medium flex-1">
                      {athlete.name}
                    </Label>
                    {athlete.hasData ? (
                      <Badge variant="outline" className="text-green-500 border-green-500/30">
                        Lengkap
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                        Belum Lengkap
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        Tinggi (cm)
                      </Label>
                      <Input
                        type="number"
                        placeholder="170"
                        value={athlete.height}
                        onChange={(e) => handleHeightChange(athlete.id, e.target.value)}
                        disabled={!athlete.selected}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        Berat (kg)
                      </Label>
                      <Input
                        type="number"
                        placeholder="65"
                        value={athlete.weight}
                        onChange={(e) => handleWeightChange(athlete.id, e.target.value)}
                        disabled={!athlete.selected}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading || selectedCount === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                `Update ${selectedCount} Atlet`
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

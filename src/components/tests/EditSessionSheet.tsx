import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { biomotorCategories } from '@/data/biomotorTests';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Athlete, TestSession } from '@/types/athlete';
import { toast } from 'sonner';
import { Loader2, Save, Trash2, Calendar } from 'lucide-react';

interface Props {
  athlete: Athlete;
  session: TestSession;
  trigger: React.ReactNode;
  onSaved?: () => void;
}

export function EditSessionSheet({ athlete, session, trigger, onSaved }: Props) {
  const { updateTestSession, upsertTestResult, deleteTestResult } = useSupabaseData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});

  // Initialise form when opened
  useEffect(() => {
    if (!open) return;
    setDate(session.date ? new Date(session.date).toISOString().split('T')[0] : '');
    const map: Record<string, string> = {};
    session.results.forEach(r => { map[r.testId] = String(r.value); });
    setValues(map);
  }, [open, session]);

  const allTests = useMemo(
    () => biomotorCategories.flatMap(c => c.tests.map(t => ({ ...t, categoryId: c.id, categoryName: c.name }))),
    [],
  );

  const existingByTestId = useMemo(() => {
    const m: Record<string, { id: string; value: number; score: number }> = {};
    session.results.forEach(r => { m[r.testId] = { id: r.id, value: r.value, score: r.score }; });
    return m;
  }, [session.results]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update session date (if changed)
      const newIso = date ? new Date(date).toISOString() : session.date;
      if (newIso !== session.date) {
        await updateTestSession(session.id, { date: newIso });
      }

      // 2. Upsert each test that has a value
      const ops: Promise<unknown>[] = [];
      for (const test of allTests) {
        const raw = (values[test.id] ?? '').toString().trim();
        const prev = existingByTestId[test.id];
        if (raw === '') {
          // empty + previously existed -> delete
          if (prev) ops.push(deleteTestResult(prev.id));
          continue;
        }
        const num = parseFloat(raw.replace(',', '.'));
        if (!Number.isFinite(num) || num <= 0) continue;
        if (prev && prev.value === num) continue; // unchanged
        ops.push(
          upsertTestResult(session.id, { gender: athlete.gender, dateOfBirth: athlete.dateOfBirth }, test.id, num),
        );
      }
      await Promise.all(ops);
      toast.success('Sesi tes berhasil diperbarui');
      setOpen(false);
      onSaved?.();
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Sesi Tes</SheetTitle>
          <SheetDescription>
            Ubah tanggal pelaksanaan, perbarui nilai, atau tambahkan tes yang belum dilakukan.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-2">
          <Label htmlFor="session-date" className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            Tanggal Pelaksanaan
          </Label>
          <Input
            id="session-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 mt-4 -mx-6 px-6">
          <div className="space-y-5 pb-6">
            {biomotorCategories.map(cat => (
              <div key={cat.id} className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">{cat.name}</h4>
                <div className="space-y-2">
                  {cat.tests.map(t => {
                    const unit = t.norms?.[0]?.unit || '';
                    const prev = existingByTestId[t.id];
                    return (
                      <div key={t.id} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{unit}</p>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          placeholder="-"
                          value={values[t.id] ?? ''}
                          onChange={e => setValues(v => ({ ...v, [t.id]: e.target.value }))}
                          className="w-24 h-9"
                        />
                        {prev ? (
                          <Badge variant="secondary" className="shrink-0 w-14 justify-center">
                            Skor {prev.score}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0 w-14 justify-center text-muted-foreground">
                            -
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t pt-4 flex items-center gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={saving}>
            Batal
          </Button>
          <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
          <Trash2 className="w-3 h-3" /> Kosongkan kolom untuk menghapus hasil tes
        </p>
      </SheetContent>
    </Sheet>
  );
}
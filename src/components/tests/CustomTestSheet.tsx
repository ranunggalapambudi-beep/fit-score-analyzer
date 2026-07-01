import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { biomotorCategories, TestNorm } from '@/data/biomotorTests';
import { CustomTestItem, CustomTestPayload, useCustomTests } from '@/hooks/useCustomTests';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTest?: CustomTestItem | null;
  defaultCategoryId?: string;
  onSaved?: () => void;
}

interface NormRow {
  gender: 'male' | 'female';
  ageMin: number;
  ageMax: number;
  scale1From: number; scale1To: number;
  scale2From: number; scale2To: number;
  scale3From: number; scale3To: number;
  scale4From: number; scale4To: number;
  scale5From: number;
}

const emptyRow = (gender: 'male' | 'female'): NormRow => ({
  gender,
  ageMin: 0, ageMax: 99,
  scale1From: 0, scale1To: 0,
  scale2From: 0, scale2To: 0,
  scale3From: 0, scale3To: 0,
  scale4From: 0, scale4To: 0,
  scale5From: 0,
});

function normsToRows(norms: TestNorm[]): NormRow[] {
  return norms.map((n) => ({
    gender: n.gender,
    ageMin: n.ageRange[0], ageMax: n.ageRange[1],
    scale1From: n.scale1[0], scale1To: n.scale1[1],
    scale2From: n.scale2[0], scale2To: n.scale2[1],
    scale3From: n.scale3[0], scale3To: n.scale3[1],
    scale4From: n.scale4[0], scale4To: n.scale4[1],
    scale5From: n.scale5[0],
  }));
}

function rowsToNorms(rows: NormRow[], unit: string, higherIsBetter: boolean): TestNorm[] {
  return rows.map((r) => ({
    gender: r.gender,
    ageRange: [r.ageMin, r.ageMax],
    scale1: [r.scale1From, r.scale1To],
    scale2: [r.scale2From, r.scale2To],
    scale3: [r.scale3From, r.scale3To],
    scale4: [r.scale4From, r.scale4To],
    scale5: [r.scale5From, r.scale5From],
    unit,
    higherIsBetter,
  }));
}

export function CustomTestSheet({ open, onOpenChange, editingTest, defaultCategoryId, onSaved }: Props) {
  const { createCustomTest, updateCustomTest } = useCustomTests();
  const [saving, setSaving] = useState(false);

  const [categoryId, setCategoryId] = useState(defaultCategoryId || biomotorCategories[0].id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [procedure, setProcedure] = useState('');
  const [equipmentText, setEquipmentText] = useState('');
  const [reference, setReference] = useState('');
  const [unit, setUnit] = useState('');
  const [higherIsBetter, setHigherIsBetter] = useState(true);
  const [useAgeGroups, setUseAgeGroups] = useState(false);
  const [rows, setRows] = useState<NormRow[]>([emptyRow('male'), emptyRow('female')]);

  useEffect(() => {
    if (!open) return;
    if (editingTest) {
      setCategoryId(editingTest.categoryId);
      setName(editingTest.name);
      setDescription(editingTest.description);
      setProcedure(editingTest.procedure);
      setEquipmentText((editingTest.equipment || []).join(', '));
      setReference(editingTest.reference);
      setUnit(editingTest.unit);
      setHigherIsBetter(editingTest.higherIsBetter);
      setUseAgeGroups(editingTest.useAgeGroups);
      setRows(normsToRows(editingTest.norms));
    } else {
      setCategoryId(defaultCategoryId || biomotorCategories[0].id);
      setName(''); setDescription(''); setProcedure('');
      setEquipmentText(''); setReference(''); setUnit('');
      setHigherIsBetter(true); setUseAgeGroups(false);
      setRows([emptyRow('male'), emptyRow('female')]);
    }
  }, [open, editingTest, defaultCategoryId]);

  const addRow = (gender: 'male' | 'female') => {
    setRows((prev) => [...prev, emptyRow(gender)]);
  };
  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateRow = (idx: number, patch: Partial<NormRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Nama tes wajib diisi'); return; }
    if (!unit.trim()) { toast.error('Satuan wajib diisi (contoh: detik, cm, repetisi)'); return; }
    if (!rows.length) { toast.error('Tambahkan minimal 1 baris norma'); return; }

    setSaving(true);
    const payload: CustomTestPayload = {
      categoryId,
      name: name.trim(),
      description: description.trim(),
      procedure: procedure.trim(),
      equipment: equipmentText.split(',').map((s) => s.trim()).filter(Boolean),
      reference: reference.trim(),
      unit: unit.trim(),
      higherIsBetter,
      useAgeGroups,
      norms: rowsToNorms(rows, unit.trim(), higherIsBetter),
    };
    const ok = editingTest
      ? await updateCustomTest(editingTest.id, payload)
      : !!(await createCustomTest(payload));
    setSaving(false);
    if (ok) {
      onOpenChange(false);
      onSaved?.();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <div className="w-12 h-1 rounded-full mx-auto mb-4 bg-primary/50" />
          <SheetTitle className="font-display text-left text-xl">
            {editingTest ? 'Edit Tes Kustom' : 'Tambah Tes Kustom'}
          </SheetTitle>
          <p className="text-xs text-muted-foreground text-left">
            Tes ini hanya terlihat oleh akun Anda.
          </p>
        </SheetHeader>

        <div className="space-y-5 mt-5 pb-24">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nama Tes *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Squat Jump 30 detik" />
            </div>
            <div>
              <Label>Kategori Biomotor *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {biomotorCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Satuan *</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="detik / cm / kg / rep" />
            </div>
            <div className="col-span-2">
              <Label>Deskripsi</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="col-span-2">
              <Label>Prosedur Pelaksanaan</Label>
              <Textarea value={procedure} onChange={(e) => setProcedure(e.target.value)} rows={3} />
            </div>
            <div className="col-span-2">
              <Label>Peralatan (pisahkan dengan koma)</Label>
              <Input value={equipmentText} onChange={(e) => setEquipmentText(e.target.value)} placeholder="Stopwatch, Kerucut, Meteran" />
            </div>
            <div className="col-span-2">
              <Label>Referensi</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Sumber referensi (opsional)" />
            </div>
          </div>

          {/* Toggles */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Nilai lebih tinggi = lebih baik</p>
                <p className="text-xs text-muted-foreground">Nonaktifkan bila lebih rendah lebih baik (contoh: waktu sprint)</p>
              </div>
              <Switch checked={higherIsBetter} onCheckedChange={setHigherIsBetter} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Gunakan kelompok usia</p>
                <p className="text-xs text-muted-foreground">Aktifkan untuk membuat norma berbeda tiap rentang usia</p>
              </div>
              <Switch checked={useAgeGroups} onCheckedChange={setUseAgeGroups} />
            </div>
          </div>

          {/* Norms editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Norma Penilaian (5 Skala)</h4>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => addRow('male')}>
                  <Plus className="w-3 h-3 mr-1" /> ♂ L
                </Button>
                <Button size="sm" variant="outline" onClick={() => addRow('female')}>
                  <Plus className="w-3 h-3 mr-1" /> ♀ P
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Skala: 1 = Kurang Sekali, 2 = Kurang, 3 = Sedang, 4 = Baik, 5 = Baik Sekali. Isi rentang nilai untuk masing-masing skala.
            </p>

            {rows.map((r, idx) => (
              <div key={idx} className="rounded-xl border border-border p-3 space-y-2 bg-muted/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Select value={r.gender} onValueChange={(v) => updateRow(idx, { gender: v as 'male' | 'female' })}>
                      <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">♂ Laki-laki</SelectItem>
                        <SelectItem value="female">♀ Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    {useAgeGroups && (
                      <div className="flex items-center gap-1 text-xs">
                        <span>Usia</span>
                        <Input className="h-8 w-14" type="number" value={r.ageMin}
                          onChange={(e) => updateRow(idx, { ageMin: Number(e.target.value) })} />
                        <span>-</span>
                        <Input className="h-8 w-14" type="number" value={r.ageMax}
                          onChange={(e) => updateRow(idx, { ageMax: Number(e.target.value) })} />
                        <span>th</span>
                      </div>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeRow(idx)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-5 gap-1 text-[10px]">
                  {([
                    ['1', 'scale1From', 'scale1To', 'Kurang Sekali'],
                    ['2', 'scale2From', 'scale2To', 'Kurang'],
                    ['3', 'scale3From', 'scale3To', 'Sedang'],
                    ['4', 'scale4From', 'scale4To', 'Baik'],
                    ['5', 'scale5From', 'scale5From', 'Baik Sekali'],
                  ] as const).map(([lbl, from, to, name]) => (
                    <div key={lbl} className="flex flex-col gap-1">
                      <p className="text-center font-medium">{lbl} · {name}</p>
                      <Input className="h-8 text-xs" type="number" step="0.01"
                        value={r[from as keyof NormRow] as number}
                        onChange={(e) => updateRow(idx, { [from]: Number(e.target.value) } as Partial<NormRow>)} />
                      {from !== to && (
                        <Input className="h-8 text-xs" type="number" step="0.01"
                          value={r[to as keyof NormRow] as number}
                          onChange={(e) => updateRow(idx, { [to]: Number(e.target.value) } as Partial<NormRow>)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-background border-t border-border flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button className="flex-1" disabled={saving} onClick={handleSave}>
              {saving ? 'Menyimpan…' : editingTest ? 'Simpan Perubahan' : 'Buat Tes'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
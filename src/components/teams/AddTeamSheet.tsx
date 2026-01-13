import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { sportsList } from '@/data/biomotorTests';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const teamColors = [
  { name: 'Biru', value: 'hsl(210, 100%, 50%)' },
  { name: 'Merah', value: 'hsl(0, 100%, 50%)' },
  { name: 'Hijau', value: 'hsl(120, 100%, 35%)' },
  { name: 'Kuning', value: 'hsl(45, 100%, 50%)' },
  { name: 'Ungu', value: 'hsl(270, 100%, 50%)' },
  { name: 'Orange', value: 'hsl(30, 100%, 50%)' },
  { name: 'Cyan', value: 'hsl(180, 100%, 40%)' },
  { name: 'Pink', value: 'hsl(330, 100%, 50%)' },
];

interface AddTeamSheetProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddTeamSheet({ children, onSuccess }: AddTeamSheetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(teamColors[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addTeam } = useSupabaseData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !sport) {
      toast.error('Nama tim dan cabang olahraga wajib diisi');
      return;
    }

    setIsSubmitting(true);

    const result = await addTeam({
      name: name.trim(),
      sport,
      description: description.trim() || undefined,
      color,
    });

    setIsSubmitting(false);

    if (result) {
      toast.success(`Tim ${name} berhasil ditambahkan`);
      setName('');
      setSport('');
      setDescription('');
      setColor(teamColors[0].value);
      setOpen(false);
      onSuccess?.();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Tim
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>Tambah Tim Baru</SheetTitle>
          <SheetDescription>
            Buat tim atau grup untuk mengelompokkan atlet
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="teamName">Nama Tim *</Label>
            <Input
              id="teamName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Tim Nasional U-19"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSport">Cabang Olahraga *</Label>
            <Select value={sport} onValueChange={setSport} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih cabang olahraga" />
              </SelectTrigger>
              <SelectContent>
                {sportsList.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamColor">Warna Tim</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teamColors.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: c.value }}
                      />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamDescription">Deskripsi</Label>
            <Textarea
              id="teamDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi tim (opsional)"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Tambah Tim'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
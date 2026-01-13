import { useState, useEffect } from 'react';
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
import { Team } from '@/types/team';
import { sportsList } from '@/data/biomotorTests';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

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

interface EditTeamSheetProps {
  team: Team;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditTeamSheet({ team, children, onSuccess }: EditTeamSheetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(team.name);
  const [sport, setSport] = useState(team.sport);
  const [description, setDescription] = useState(team.description || '');
  const [color, setColor] = useState(team.color);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateTeam } = useSupabaseData();

  useEffect(() => {
    if (open) {
      setName(team.name);
      setSport(team.sport);
      setDescription(team.description || '');
      setColor(team.color);
    }
  }, [open, team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !sport) {
      toast.error('Nama tim dan cabang olahraga wajib diisi');
      return;
    }

    setIsSubmitting(true);

    const success = await updateTeam(team.id, {
      name: name.trim(),
      sport,
      description: description.trim() || undefined,
      color,
    });

    setIsSubmitting(false);

    if (success) {
      toast.success(`Tim ${name} berhasil diperbarui`);
      setOpen(false);
      onSuccess?.();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>Edit Tim</SheetTitle>
          <SheetDescription>
            Perbarui informasi tim
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="editTeamName">Nama Tim *</Label>
            <Input
              id="editTeamName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editTeamSport">Cabang Olahraga *</Label>
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
            <Label htmlFor="editTeamColor">Warna Tim</Label>
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
            <Label htmlFor="editTeamDescription">Deskripsi</Label>
            <Textarea
              id="editTeamDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi tim (opsional)"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
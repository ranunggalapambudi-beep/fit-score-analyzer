import { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Camera, X } from 'lucide-react';
import { useAthleteStore } from '@/store/athleteStore';
import { sportsList } from '@/data/biomotorTests';
import { toast } from 'sonner';

interface AddAthleteSheetProps {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  onSuccess?: () => void;
  defaultTeam?: string;
  defaultSport?: string;
}

export function AddAthleteSheet({ trigger, children, onSuccess, defaultTeam, defaultSport }: AddAthleteSheetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [sport, setSport] = useState(defaultSport || '');
  const [team, setTeam] = useState(defaultTeam || '');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addAthlete = useAthleteStore((state) => state.addAthlete);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !dateOfBirth || !sport) {
      toast.error('Mohon lengkapi data yang wajib diisi');
      return;
    }

    const newAthlete = {
      id: crypto.randomUUID(),
      name,
      dateOfBirth,
      gender,
      sport,
      team: team || undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      photo,
      createdAt: new Date().toISOString(),
    };

    addAthlete(newAthlete);
    toast.success('Atlet berhasil ditambahkan');
    
    // Reset form
    setName('');
    setDateOfBirth('');
    setGender('male');
    setSport('');
    setTeam('');
    setHeight('');
    setWeight('');
    setPhoto(undefined);
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Atlet
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="font-display">Tambah Atlet Baru</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              {photo && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">Tap untuk upload foto (maks. 2MB)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama atlet"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dob">Tanggal Lahir *</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Jenis Kelamin *</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Laki-laki</SelectItem>
                <SelectItem value="female">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cabang Olahraga *</Label>
            <Select value={sport} onValueChange={setSport}>
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
            <Label htmlFor="team">Tim/Klub</Label>
            <Input
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Nama tim atau klub"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Tinggi Badan (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Berat Badan (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65"
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-6">
            Simpan Atlet
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, X, Edit } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { sportsList } from '@/data/biomotorTests';
import { Athlete } from '@/types/athlete';
import { toast } from 'sonner';

interface EditAthleteSheetProps {
  athlete: Athlete;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const OTHER_SPORT_VALUE = '__other__';

export function EditAthleteSheet({ athlete, trigger, onSuccess }: EditAthleteSheetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(athlete.name);
  const [dateOfBirth, setDateOfBirth] = useState(athlete.dateOfBirth);
  const [gender, setGender] = useState<'male' | 'female'>(athlete.gender);
  const [sport, setSport] = useState(athlete.sport);
  const [customSport, setCustomSport] = useState('');
  const [showCustomSport, setShowCustomSport] = useState(false);
  const [team, setTeam] = useState(athlete.team || '');
  const [height, setHeight] = useState(athlete.height?.toString() || '');
  const [weight, setWeight] = useState(athlete.weight?.toString() || '');
  const [photo, setPhoto] = useState<string | undefined>(athlete.photo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateAthlete } = useSupabaseData();

  useEffect(() => {
    if (open) {
      setName(athlete.name);
      setDateOfBirth(athlete.dateOfBirth);
      setGender(athlete.gender);
      setTeam(athlete.team || '');
      setHeight(athlete.height?.toString() || '');
      setWeight(athlete.weight?.toString() || '');
      setPhoto(athlete.photo);
      
      // Check if athlete's sport is not in the sportsList
      if (!sportsList.includes(athlete.sport)) {
        setShowCustomSport(true);
        setCustomSport(athlete.sport);
        setSport('');
      } else {
        setShowCustomSport(false);
        setSport(athlete.sport);
        setCustomSport('');
      }
    }
  }, [open, athlete]);

  const handleSportChange = (value: string) => {
    if (value === OTHER_SPORT_VALUE) {
      setShowCustomSport(true);
      setSport('');
    } else {
      setShowCustomSport(false);
      setSport(value);
      setCustomSport('');
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalSport = showCustomSport ? customSport.trim() : sport;
    
    if (!name || !dateOfBirth || !finalSport) {
      toast.error('Mohon lengkapi data yang wajib diisi');
      return;
    }

    setIsSubmitting(true);

    const success = await updateAthlete(athlete.id, {
      name,
      dateOfBirth,
      gender,
      sport: finalSport,
      team: team || undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      photo,
    });

    setIsSubmitting(false);

    if (success) {
      toast.success('Profil atlet berhasil diperbarui');
      setOpen(false);
      onSuccess?.();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="font-display">Edit Profil Atlet</SheetTitle>
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
            <p className="text-xs text-muted-foreground">Tap untuk ganti foto (maks. 2MB)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Lengkap *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama atlet"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-dob">Tanggal Lahir *</Label>
            <Input
              id="edit-dob"
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
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="male">Laki-laki</SelectItem>
                <SelectItem value="female">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cabang Olahraga *</Label>
            <Select 
              value={showCustomSport ? OTHER_SPORT_VALUE : sport} 
              onValueChange={handleSportChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih cabang olahraga" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50 max-h-60">
                {sportsList.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
                <SelectItem value={OTHER_SPORT_VALUE} className="text-primary font-medium">
                  + Lainnya (Input Manual)
                </SelectItem>
              </SelectContent>
            </Select>
            {showCustomSport && (
              <Input
                value={customSport}
                onChange={(e) => setCustomSport(e.target.value)}
                placeholder="Masukkan nama cabang olahraga"
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-team">Tim/Klub</Label>
            <Input
              id="edit-team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Nama tim atau klub"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-height">Tinggi Badan (cm)</Label>
              <Input
                id="edit-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Berat Badan (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65"
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

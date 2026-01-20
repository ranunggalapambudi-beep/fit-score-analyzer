import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, Camera, User, Building, Loader2, Save, 
  CheckCircle, AlertCircle, Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  organization: z.string().trim().max(200, "Organisasi maksimal 200 karakter").optional()
});

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [profile, setProfile] = useState({
    full_name: "",
    organization: "",
    avatar_url: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, organization, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setProfile({
            full_name: data.full_name || "",
            organization: data.organization || "",
            avatar_url: data.avatar_url || ""
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if any
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Foto profil berhasil diperbarui');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});
    setSuccess(false);

    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: result.data.full_name,
          organization: result.data.organization || null
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess(true);
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <Layout>
        <Header title="Profil" subtitle="Akses Ditolak">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Header>
        <main className="flex-1 overflow-auto">
          <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-muted-foreground mb-4">
              Silakan login terlebih dahulu untuk mengakses halaman ini.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Login
            </Button>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Profil Saya" subtitle="Pengaturan Akun">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Header>

      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-6 pb-24">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Avatar Section */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                        <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                          {profile.full_name ? getInitials(profile.full_name) : <User className="w-10 h-10" />}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-2 -right-2 rounded-full w-9 h-9 shadow-lg"
                        onClick={handleAvatarClick}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    <h2 className="text-lg font-semibold">{profile.full_name || 'Nama Pengguna'}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {profile.organization && (
                      <p className="text-sm text-muted-foreground mt-1">{profile.organization}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Profil</CardTitle>
                </CardHeader>
                <CardContent>
                  {success && (
                    <Alert className="mb-4 border-green-500/50 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-600">
                        Profil berhasil diperbarui!
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={user.email || ""}
                          disabled
                          className="pl-10 bg-muted"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nama Lengkap <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="full_name"
                          name="full_name"
                          placeholder="Masukkan nama lengkap"
                          value={profile.full_name}
                          onChange={handleChange}
                          className={`pl-10 ${errors.full_name ? "border-destructive" : ""}`}
                        />
                      </div>
                      {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organisasi / Klub</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="organization"
                          name="organization"
                          placeholder="Nama organisasi atau klub (opsional)"
                          value={profile.organization}
                          onChange={handleChange}
                          className={`pl-10 ${errors.organization ? "border-destructive" : ""}`}
                        />
                      </div>
                      {errors.organization && <p className="text-xs text-destructive">{errors.organization}</p>}
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Akun</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">User ID</span>
                    <span className="text-sm font-mono">{user.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm text-green-500 font-medium">Aktif</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}

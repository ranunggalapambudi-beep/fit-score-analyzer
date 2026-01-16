import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Mail, MapPin, Phone, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import hirocrossLogo from "@/assets/hirocross-logo.png";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  email: z.string().trim().email("Format email tidak valid").max(255, "Email maksimal 255 karakter"),
  subject: z.string().trim().max(200, "Subjek maksimal 200 karakter").optional(),
  message: z.string().trim().min(1, "Pesan wajib diisi").max(1000, "Pesan maksimal 1000 karakter")
});

export default function Contact() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
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

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: result.data.name,
          email: result.data.email,
          subject: result.data.subject || null,
          message: result.data.message
        });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Pesan berhasil dikirim!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Header title="Contact" subtitle="HIROCROSS">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Header>

      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-6 pb-24">
          {/* Header Card */}
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-background shadow-lg flex items-center justify-center overflow-hidden">
                  <img src={hirocrossLogo} alt="HIROCROSS" className="w-14 h-14 object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-display text-foreground">Hubungi Kami</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Punya pertanyaan atau saran? Kirim pesan kepada kami.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">support@hirocross.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telepon</p>
                <p className="text-sm font-medium">+62 812 3456 7890</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Alamat</p>
                <p className="text-sm font-medium">Jakarta, Indonesia</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kirim Pesan</CardTitle>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Pesan Terkirim!</h3>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Terima kasih telah menghubungi kami. Kami akan segera merespon pesan Anda.
                  </p>
                  <Button variant="outline" onClick={() => setIsSuccess(false)}>
                    Kirim Pesan Lain
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nama lengkap Anda"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Topik pesan (opsional)"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tulis pesan Anda di sini..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}

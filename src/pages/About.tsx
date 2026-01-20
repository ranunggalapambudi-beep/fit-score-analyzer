import { Layout } from "@/components/layout/Layout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Users, BarChart3, Zap, Shield, Award, Mail, Instagram } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import hirocrossLogo from "@/assets/hirocross-logo.png";

export default function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Pengukuran Biomotor",
      description: "Analisis komprehensif kemampuan biomotor atlet meliputi kecepatan, kekuatan, daya tahan, kelincahan, dan fleksibilitas."
    },
    {
      icon: Users,
      title: "Manajemen Tim",
      description: "Kelola atlet dan tim dengan mudah. Pantau perkembangan setiap anggota tim secara terorganisir."
    },
    {
      icon: BarChart3,
      title: "Analisis Performa",
      description: "Visualisasi data performa dengan grafik radar dan tren perkembangan dari waktu ke waktu."
    },
    {
      icon: Zap,
      title: "Hasil Real-time",
      description: "Input hasil tes dan dapatkan skor secara langsung berdasarkan standar yang tervalidasi."
    },
    {
      icon: Shield,
      title: "Data Aman",
      description: "Data atlet tersimpan dengan aman di cloud dengan enkripsi dan proteksi tingkat tinggi."
    },
    {
      icon: Award,
      title: "Laporan Profesional",
      description: "Export laporan dalam format PDF yang siap digunakan untuk evaluasi dan presentasi."
    }
  ];

  return (
    <Layout>
      <Header title="About" subtitle="HIROCROSS Platform">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Header>

      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-6 pb-24">
          {/* Hero Section */}
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-background shadow-lg flex items-center justify-center overflow-hidden">
                  <img src={hirocrossLogo} alt="HIROCROSS" className="w-20 h-20 object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-display text-foreground">HIROCROSS</h1>
                  <p className="text-sm text-muted-foreground mt-1">Biomotor Analysis Platform</p>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Version 1.0.0
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tentang Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">HIROCROSS</strong> adalah platform analisis biomotor yang dirancang 
                khusus untuk pelatih, atlet, dan profesional olahraga. Platform ini membantu mengukur, 
                menganalisis, dan memantau perkembangan kemampuan fisik atlet secara komprehensif.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dengan metode pengukuran yang terstandarisasi dan sistem skoring yang tervalidasi, 
                HIROCROSS memberikan insight mendalam tentang kekuatan dan area yang perlu ditingkatkan 
                dari setiap atlet.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fitur Utama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kontak & Dukungan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Untuk pertanyaan, saran, atau dukungan teknis, silakan hubungi tim kami.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <a href="mailto:hiro.cross1010@gmail.com" className="text-foreground hover:text-primary transition-colors">hiro.cross1010@gmail.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Instagram:</span>
                  <a href="https://instagram.com/hirocros" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">@hirocros</a>
                </div>
              </div>
              <Link to="/contact">
                <Button className="w-full mt-3 gap-2">
                  <Mail className="w-4 h-4" />
                  Hubungi Kami
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground py-4">
            <p>© 2024 HIROCROSS. All rights reserved.</p>
            <p className="mt-1">Made with ❤️ for athletes and coaches</p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

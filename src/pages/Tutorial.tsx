import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { biomotorCategories } from "@/data/biomotorTests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, Dumbbell, Zap, Activity, StretchHorizontal, 
  Search, BookOpen, Video, ClipboardList, Ruler, 
  AlertCircle, CheckCircle2, Target, Info, ArrowLeft,
  Timer, Users, Wrench
} from "lucide-react";

const iconMap: { [key: string]: React.ReactNode } = {
  Heart: <Heart className="h-5 w-5" />,
  Dumbbell: <Dumbbell className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Activity: <Activity className="h-5 w-5" />,
  StretchHorizontal: <StretchHorizontal className="h-5 w-5" />,
};

const categoryColors: { [key: string]: string } = {
  endurance: "bg-red-500/10 text-red-600 border-red-500/20",
  strength: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  speed: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  agility: "bg-green-500/10 text-green-600 border-green-500/20",
  flexibility: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export default function Tutorial() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = biomotorCategories.map(category => ({
    ...category,
    tests: category.tests.filter(test => 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    selectedCategory === null || category.id === selectedCategory
  ).filter(category => category.tests.length > 0 || searchQuery === "");

  const totalTests = biomotorCategories.reduce((acc, cat) => acc + cat.tests.length, 0);

  const getScoreDescription = (score: number) => {
    switch (score) {
      case 1: return "Sangat Kurang";
      case 2: return "Kurang";
      case 3: return "Cukup";
      case 4: return "Baik";
      case 5: return "Sangat Baik";
      default: return "";
    }
  };

  return (
    <Layout showBackButton>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">Panduan Tes Biomotor</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Panduan lengkap prosedur pengukuran, peralatan yang dibutuhkan, dan norma penilaian 
            untuk {totalTests} jenis tes biomotor dalam {biomotorCategories.length} kategori.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {biomotorCategories.map(category => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
            >
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-2 rounded-lg mb-2 ${categoryColors[category.color]}`}>
                  {iconMap[category.icon]}
                </div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.tests.length} tes</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari tes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedCategory && (
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tampilkan Semua Kategori
            </Button>
          </div>
        )}

        {/* Test Categories */}
        <div className="space-y-8">
          {filteredCategories.map(category => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${categoryColors[category.color]}`}>
                  {iconMap[category.icon]}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <Accordion type="single" collapsible className="space-y-2">
                {category.tests.map(test => (
                  <AccordionItem 
                    key={test.id} 
                    value={test.id}
                    className="border rounded-lg px-4 bg-card"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Target className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <h3 className="font-semibold">{test.name}</h3>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Tabs defaultValue="procedure" className="mt-4">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="procedure" className="text-xs sm:text-sm">
                            <ClipboardList className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Prosedur</span>
                          </TabsTrigger>
                          <TabsTrigger value="equipment" className="text-xs sm:text-sm">
                            <Wrench className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Alat</span>
                          </TabsTrigger>
                          <TabsTrigger value="norms" className="text-xs sm:text-sm">
                            <Ruler className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Norma</span>
                          </TabsTrigger>
                          <TabsTrigger value="tips" className="text-xs sm:text-sm">
                            <Info className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Tips</span>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="procedure" className="mt-4 space-y-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Langkah Pelaksanaan
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {test.procedure.split('\n').map((step, idx) => (
                                  <div key={idx} className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                      {idx + 1}
                                    </div>
                                    <p className="text-sm pt-0.5">{step.replace(/^\d+\.\s*/, '')}</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="equipment" className="mt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Wrench className="h-4 w-4" />
                                Peralatan yang Dibutuhkan
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {test.equipment.map((item, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-sm">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="norms" className="mt-4 space-y-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Norma Penilaian ({test.norms[0]?.unit || 'unit'})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 px-2">Gender</th>
                                    <th className="text-left py-2 px-2">Usia</th>
                                    <th className="text-center py-2 px-2">
                                      <Badge variant="destructive" className="text-xs">1</Badge>
                                    </th>
                                    <th className="text-center py-2 px-2">
                                      <Badge className="text-xs bg-orange-500">2</Badge>
                                    </th>
                                    <th className="text-center py-2 px-2">
                                      <Badge className="text-xs bg-yellow-500">3</Badge>
                                    </th>
                                    <th className="text-center py-2 px-2">
                                      <Badge className="text-xs bg-blue-500">4</Badge>
                                    </th>
                                    <th className="text-center py-2 px-2">
                                      <Badge className="text-xs bg-green-500">5</Badge>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {test.norms.map((norm, idx) => (
                                    <tr key={idx} className="border-b last:border-0">
                                      <td className="py-2 px-2 capitalize">
                                        {norm.gender === 'male' ? '👨 Pria' : '👩 Wanita'}
                                      </td>
                                      <td className="py-2 px-2">
                                        {norm.ageRange[0]}-{norm.ageRange[1]} th
                                      </td>
                                      <td className="text-center py-2 px-2 text-xs">
                                        {norm.scale1[0]}-{norm.scale1[1]}
                                      </td>
                                      <td className="text-center py-2 px-2 text-xs">
                                        {norm.scale2[0]}-{norm.scale2[1]}
                                      </td>
                                      <td className="text-center py-2 px-2 text-xs">
                                        {norm.scale3[0]}-{norm.scale3[1]}
                                      </td>
                                      <td className="text-center py-2 px-2 text-xs">
                                        {norm.scale4[0]}-{norm.scale4[1]}
                                      </td>
                                      <td className="text-center py-2 px-2 text-xs">
                                        {norm.scale5[0]}-{norm.scale5[1]}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </CardContent>
                          </Card>

                          <div className="grid grid-cols-5 gap-2 text-center text-xs">
                            {[1, 2, 3, 4, 5].map(score => (
                              <div key={score} className="p-2 rounded bg-muted">
                                <Badge 
                                  className={`mb-1 ${
                                    score === 1 ? 'bg-red-500' :
                                    score === 2 ? 'bg-orange-500' :
                                    score === 3 ? 'bg-yellow-500' :
                                    score === 4 ? 'bg-blue-500' :
                                    'bg-green-500'
                                  }`}
                                >
                                  {score}
                                </Badge>
                                <p className="text-muted-foreground">{getScoreDescription(score)}</p>
                              </div>
                            ))}
                          </div>

                          <p className="text-xs text-muted-foreground text-center">
                            📚 Referensi: {test.reference}
                          </p>
                        </TabsContent>

                        <TabsContent value="tips" className="mt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Tips & Perhatian
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex gap-3 items-start">
                                <Timer className="h-4 w-4 text-primary mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">Waktu Terbaik</p>
                                  <p className="text-xs text-muted-foreground">
                                    Lakukan tes di pagi hari (08.00-10.00) saat kondisi tubuh masih segar
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-3 items-start">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">Persiapan</p>
                                  <p className="text-xs text-muted-foreground">
                                    Pastikan atlet sudah pemanasan minimal 10-15 menit sebelum tes
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-3 items-start">
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">Keamanan</p>
                                  <p className="text-xs text-muted-foreground">
                                    Hentikan tes jika atlet menunjukkan tanda kelelahan berlebih atau cedera
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-3 items-start">
                                <Ruler className="h-4 w-4 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">Akurasi</p>
                                  <p className="text-xs text-muted-foreground">
                                    Gunakan alat ukur yang sudah dikalibrasi untuk hasil yang akurat
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold">Tidak ada tes ditemukan</h3>
            <p className="text-muted-foreground">Coba kata kunci lain atau hapus filter</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

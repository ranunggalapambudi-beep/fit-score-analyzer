import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { biomotorCategories } from '@/data/biomotorTests';
import { TestIllustrationGuide } from '@/components/tests/TestIllustrationGuide';
import { ChevronLeft, ChevronRight, BookOpen, Wrench } from 'lucide-react';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from '@/components/ui/sheet';

export default function TestCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const category = biomotorCategories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <Layout title="Kategori Tidak Ditemukan">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted-foreground">Kategori tidak ditemukan</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/tests')}>
            Kembali
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false}>
      {/* Custom Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tests')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold font-display">{category.name}</h1>
            <p className="text-xs text-muted-foreground">{category.tests.length} Item Tes</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Category Description */}
        <section 
          className="p-4 rounded-xl border"
          style={{ 
            borderColor: `hsl(var(--${category.color}) / 0.3)`,
            background: `hsl(var(--${category.color}) / 0.05)`,
          }}
        >
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </section>

        {/* Test Items */}
        <section className="space-y-3">
          {category.tests.map((test, index) => (
            <Sheet key={test.id}>
              <SheetTrigger asChild>
                <button
                  className="w-full p-4 rounded-xl bg-card border border-border/50 flex items-start gap-4 text-left hover:border-border transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                    style={{ 
                      backgroundColor: `hsl(var(--${category.color}) / 0.15)`,
                      color: `hsl(var(--${category.color}))`,
                    }}
                  >
                    <span className="font-bold font-display">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold font-display text-foreground">
                      {test.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {test.description}
                    </p>
                    <p className="text-xs mt-2" style={{ color: `hsl(var(--${category.color}))` }}>
                      Unit: {test.norms[0]?.unit}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle className="font-display text-left">{test.name}</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Description */}
                  <div>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </div>

                  {/* Visual Illustration Guide */}
                  <TestIllustrationGuide 
                    testId={test.id} 
                    testName={test.name}
                    categoryColor={category.color}
                  />

                  {/* Procedure */}
                  <div>
                    <h4 className="font-semibold font-display flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Prosedur Pelaksanaan
                    </h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted/50 p-4 rounded-xl">
                      {test.procedure}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <h4 className="font-semibold font-display flex items-center gap-2 mb-3">
                      <Wrench className="w-4 h-4 text-primary" />
                      Peralatan
                    </h4>
                    <ul className="space-y-2">
                      {test.equipment.map((eq, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {eq}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Norms Table */}
                  <div>
                    <h4 className="font-semibold font-display mb-3">Norma Penilaian</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-2 font-medium">Kelompok</th>
                            <th className="text-center py-2 px-1 font-medium">1</th>
                            <th className="text-center py-2 px-1 font-medium">2</th>
                            <th className="text-center py-2 px-1 font-medium">3</th>
                            <th className="text-center py-2 px-1 font-medium">4</th>
                            <th className="text-center py-2 px-1 font-medium">5</th>
                          </tr>
                        </thead>
                        <tbody>
                          {test.norms.map((norm, i) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-2 px-2 text-muted-foreground">
                                {norm.gender === 'male' ? 'L' : 'P'} {norm.ageRange[0]}-{norm.ageRange[1]} th
                              </td>
                              <td className="text-center py-2 px-1 text-xs">
                                {norm.scale1[0]}-{norm.scale1[1]}
                              </td>
                              <td className="text-center py-2 px-1 text-xs">
                                {norm.scale2[0]}-{norm.scale2[1]}
                              </td>
                              <td className="text-center py-2 px-1 text-xs">
                                {norm.scale3[0]}-{norm.scale3[1]}
                              </td>
                              <td className="text-center py-2 px-1 text-xs">
                                {norm.scale4[0]}-{norm.scale4[1]}
                              </td>
                              <td className="text-center py-2 px-1 text-xs">
                                {norm.scale5[0]}+
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Unit: {test.norms[0]?.unit} • {test.norms[0]?.higherIsBetter ? 'Semakin tinggi semakin baik' : 'Semakin rendah semakin baik'}
                    </p>
                  </div>

                  {/* Reference */}
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Referensi:</span> {test.reference}
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </section>
      </div>
    </Layout>
  );
}

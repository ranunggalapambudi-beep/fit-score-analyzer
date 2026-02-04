import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { biomotorCategories } from '@/data/biomotorTests';
import { TestIllustrationGuide } from '@/components/tests/TestIllustrationGuide';
import { ChevronLeft, ChevronRight, BookOpen, Wrench, Image as ImageIcon, Info, Target, ListChecks, Star, ArrowLeftRight } from 'lucide-react';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from '@/components/ui/sheet';
import { categoryImages } from '@/data/categoryImages';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useFavoriteTests } from '@/hooks/useFavoriteTests';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function TestCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoriteTests();
  
  const category = biomotorCategories.find((c) => c.id === categoryId);
  const categoryImage = categoryId ? categoryImages[categoryId] : null;

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

  // Get all category images for gallery
  const allCategoryImages = Object.entries(categoryImages).map(([id, image]) => {
    const cat = biomotorCategories.find(c => c.id === id);
    return {
      id,
      image,
      name: cat?.name || id,
      isCurrent: id === categoryId
    };
  });

  return (
    <Layout showHeader={false}>
      {/* Hero Section with Category Image */}
      <section className="relative h-56 overflow-hidden">
        {categoryImage && (
          <>
            <img 
              src={categoryImage} 
              alt={category.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
          </>
        )}
        
        {/* Back Button and Compare Button */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <Button 
            variant="secondary" 
            size="icon" 
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => navigate('/tests')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Link to="/tests/compare">
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-background/80 backdrop-blur-sm gap-1.5"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Bandingkan
            </Button>
          </Link>
        </div>
        
        {/* Category Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div 
            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
            style={{ 
              backgroundColor: `hsl(var(--${category.color}) / 0.9)`,
              color: 'white'
            }}
          >
            {category.tests.length} Item Tes
          </div>
          <h1 className="text-2xl font-bold font-display text-white drop-shadow-lg">
            {category.name}
          </h1>
        </div>
      </section>

      <div className="px-4 py-6 space-y-6">
        {/* Category Description Card */}
        <section 
          className="p-5 rounded-2xl border-2 animate-fade-in"
          style={{ 
            borderColor: `hsl(var(--${category.color}) / 0.3)`,
            background: `linear-gradient(135deg, hsl(var(--${category.color}) / 0.08), hsl(var(--${category.color}) / 0.02))`,
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
              style={{ 
                backgroundColor: `hsl(var(--${category.color}) / 0.15)`,
                color: `hsl(var(--${category.color}))`,
              }}
            >
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold font-display mb-1">Tentang {category.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>
        </section>

        {/* Image Gallery Carousel */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="font-semibold font-display">Galeri Kategori Biomotor</h2>
          </div>
          <Carousel
            opts={{
              align: "center",
              loop: true,
              startIndex: allCategoryImages.findIndex(c => c.isCurrent),
            }}
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {allCategoryImages.map((cat) => (
                <CarouselItem key={cat.id} className="pl-2 basis-2/3 md:basis-1/2">
                  <div 
                    className={`relative rounded-xl overflow-hidden aspect-video cursor-pointer transition-all duration-300 ${
                      cat.isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => navigate(`/tests/${cat.id}`)}
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className={`text-white font-medium ${cat.isCurrent ? 'text-sm' : 'text-xs'}`}>
                        {cat.name}
                        {cat.isCurrent && <span className="ml-2 text-primary">• Aktif</span>}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-1 bg-background/80" />
            <CarouselNext className="right-1 bg-background/80" />
          </Carousel>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Klik gambar untuk beralih kategori
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div 
            className="p-4 rounded-xl text-center"
            style={{ 
              backgroundColor: `hsl(var(--${category.color}) / 0.1)`,
            }}
          >
            <Target className="w-5 h-5 mx-auto mb-1" style={{ color: `hsl(var(--${category.color}))` }} />
            <p className="text-lg font-bold font-display">{category.tests.length}</p>
            <p className="text-xs text-muted-foreground">Item Tes</p>
          </div>
          <div 
            className="p-4 rounded-xl text-center"
            style={{ 
              backgroundColor: `hsl(var(--${category.color}) / 0.1)`,
            }}
          >
            <ListChecks className="w-5 h-5 mx-auto mb-1" style={{ color: `hsl(var(--${category.color}))` }} />
            <p className="text-lg font-bold font-display">
              {category.tests.reduce((acc, t) => acc + t.norms.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Norma</p>
          </div>
          <div 
            className="p-4 rounded-xl text-center"
            style={{ 
              backgroundColor: `hsl(var(--${category.color}) / 0.1)`,
            }}
          >
            <BookOpen className="w-5 h-5 mx-auto mb-1" style={{ color: `hsl(var(--${category.color}))` }} />
            <p className="text-lg font-bold font-display">5</p>
            <p className="text-xs text-muted-foreground">Skala</p>
          </div>
        </section>

        {/* Test Items */}
        <section className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: `hsl(var(--${category.color}))` }}
            />
            <h2 className="font-semibold font-display">Daftar Item Tes</h2>
          </div>
          
          {category.tests.map((test, index) => (
            <Sheet key={test.id}>
              <SheetTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <button
                    className="w-full p-4 rounded-xl bg-card border border-border/50 flex items-start gap-4 text-left hover:border-border transition-all duration-200 hover:shadow-md"
                  >
                    <div 
                      className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                      style={{ 
                        backgroundColor: `hsl(var(--${category.color}) / 0.15)`,
                        color: `hsl(var(--${category.color}))`,
                      }}
                    >
                      <span className="text-lg font-bold font-display">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold font-display text-foreground">
                          {test.name}
                        </h3>
                        {isFavorite(test.id) && (
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {test.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ 
                            backgroundColor: `hsl(var(--${category.color}) / 0.1)`,
                            color: `hsl(var(--${category.color}))`,
                          }}
                        >
                          {test.norms[0]?.unit}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {test.norms.length} norma
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />
                  </button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-3xl">
                <SheetHeader>
                  <div 
                    className="w-12 h-1 rounded-full mx-auto mb-4"
                    style={{ backgroundColor: `hsl(var(--${category.color}))` }}
                  />
                  <div className="flex items-center justify-between">
                    <SheetTitle className="font-display text-left text-xl">{test.name}</SheetTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(test.id, category.id);
                      }}
                      className="shrink-0"
                    >
                      <Star 
                        className={`w-5 h-5 ${isFavorite(test.id) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                      />
                    </Button>
                  </div>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Favorite Button */}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => toggleFavorite(test.id, category.id)}
                  >
                    <Star 
                      className={`w-4 h-4 ${isFavorite(test.id) ? 'text-yellow-500 fill-yellow-500' : ''}`} 
                    />
                    {isFavorite(test.id) ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                  </Button>

                  {/* Description */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{ 
                      backgroundColor: `hsl(var(--${category.color}) / 0.05)`,
                      borderLeft: `4px solid hsl(var(--${category.color}))`,
                    }}
                  >
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
                      <BookOpen className="w-4 h-4" style={{ color: `hsl(var(--${category.color}))` }} />
                      Prosedur Pelaksanaan
                    </h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted/50 p-4 rounded-xl">
                      {test.procedure}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <h4 className="font-semibold font-display flex items-center gap-2 mb-3">
                      <Wrench className="w-4 h-4" style={{ color: `hsl(var(--${category.color}))` }} />
                      Peralatan
                    </h4>
                    <ul className="space-y-2">
                      {test.equipment.map((eq, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span 
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: `hsl(var(--${category.color}))` }}
                          />
                          {eq}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Norms Table */}
                  <div>
                    <h4 className="font-semibold font-display mb-3">Norma Penilaian</h4>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr 
                            style={{ backgroundColor: `hsl(var(--${category.color}) / 0.1)` }}
                          >
                            <th className="text-left py-3 px-3 font-medium">Kelompok</th>
                            <th className="text-center py-3 px-2 font-medium">1</th>
                            <th className="text-center py-3 px-2 font-medium">2</th>
                            <th className="text-center py-3 px-2 font-medium">3</th>
                            <th className="text-center py-3 px-2 font-medium">4</th>
                            <th className="text-center py-3 px-2 font-medium">5</th>
                          </tr>
                        </thead>
                        <tbody>
                          {test.norms.map((norm, i) => (
                            <tr key={i} className="border-t border-border/50 hover:bg-muted/30">
                              <td className="py-3 px-3 text-muted-foreground font-medium">
                                {norm.gender === 'male' ? '♂ L' : '♀ P'} {norm.ageRange[0]}-{norm.ageRange[1]} th
                              </td>
                              <td className="text-center py-3 px-2 text-xs text-red-500">
                                {norm.scale1[0]}-{norm.scale1[1]}
                              </td>
                              <td className="text-center py-3 px-2 text-xs text-orange-500">
                                {norm.scale2[0]}-{norm.scale2[1]}
                              </td>
                              <td className="text-center py-3 px-2 text-xs text-yellow-500">
                                {norm.scale3[0]}-{norm.scale3[1]}
                              </td>
                              <td className="text-center py-3 px-2 text-xs text-green-500">
                                {norm.scale4[0]}-{norm.scale4[1]}
                              </td>
                              <td className="text-center py-3 px-2 text-xs text-primary font-medium">
                                {norm.scale5[0]}+
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                      <span 
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `hsl(var(--${category.color}) / 0.1)` }}
                      >
                        {test.norms[0]?.unit}
                      </span>
                      {test.norms[0]?.higherIsBetter ? '↑ Semakin tinggi semakin baik' : '↓ Semakin rendah semakin baik'}
                    </p>
                  </div>

                  {/* Reference */}
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">📚 Referensi:</span> {test.reference}
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

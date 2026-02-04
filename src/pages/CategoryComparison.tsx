import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { biomotorCategories } from '@/data/biomotorTests';
import { categoryImages } from '@/data/categoryImages';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ArrowLeftRight, 
  Target, 
  ListChecks, 
  BookOpen,
  Check,
  X
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function CategoryComparison() {
  const navigate = useNavigate();
  const [category1Id, setCategory1Id] = useState<string>('speed');
  const [category2Id, setCategory2Id] = useState<string>('power');

  const category1 = biomotorCategories.find((c) => c.id === category1Id);
  const category2 = biomotorCategories.find((c) => c.id === category2Id);

  // Radar chart data comparing test counts, norms, etc.
  const radarData = [
    {
      subject: 'Jumlah Tes',
      cat1: category1?.tests.length || 0,
      cat2: category2?.tests.length || 0,
      fullMark: 10,
    },
    {
      subject: 'Total Norma',
      cat1: (category1?.tests.reduce((acc, t) => acc + t.norms.length, 0) || 0) / 4,
      cat2: (category2?.tests.reduce((acc, t) => acc + t.norms.length, 0) || 0) / 4,
      fullMark: 10,
    },
    {
      subject: 'Kompleksitas',
      cat1: (category1?.tests.reduce((acc, t) => acc + t.equipment.length, 0) || 0) / 2,
      cat2: (category2?.tests.reduce((acc, t) => acc + t.equipment.length, 0) || 0) / 2,
      fullMark: 10,
    },
    {
      subject: 'Variasi Gender',
      cat1: category1?.tests.reduce((acc, t) => {
        const hasM = t.norms.some(n => n.gender === 'male');
        const hasF = t.norms.some(n => n.gender === 'female');
        return acc + (hasM ? 1 : 0) + (hasF ? 1 : 0);
      }, 0) || 0,
      cat2: category2?.tests.reduce((acc, t) => {
        const hasM = t.norms.some(n => n.gender === 'male');
        const hasF = t.norms.some(n => n.gender === 'female');
        return acc + (hasM ? 1 : 0) + (hasF ? 1 : 0);
      }, 0) || 0,
      fullMark: 10,
    },
    {
      subject: 'Range Usia',
      cat1: category1?.tests.reduce((acc, t) => {
        const ages = t.norms.map(n => n.ageRange[1] - n.ageRange[0]);
        return acc + Math.max(...ages, 0) / 5;
      }, 0) || 0,
      cat2: category2?.tests.reduce((acc, t) => {
        const ages = t.norms.map(n => n.ageRange[1] - n.ageRange[0]);
        return acc + Math.max(...ages, 0) / 5;
      }, 0) || 0,
      fullMark: 10,
    },
  ];

  // Get test IDs for comparison
  const cat1TestIds = new Set(category1?.tests.map(t => t.id) || []);
  const cat2TestIds = new Set(category2?.tests.map(t => t.id) || []);
  const allTestNames = [
    ...(category1?.tests || []).map(t => ({ name: t.name, inCat1: true, inCat2: cat2TestIds.has(t.id) })),
    ...(category2?.tests || [])
      .filter(t => !cat1TestIds.has(t.id))
      .map(t => ({ name: t.name, inCat1: false, inCat2: true })),
  ];

  return (
    <Layout showHeader={false}>
      {/* Header */}
      <section className="relative h-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        <div className="absolute top-4 left-4 z-10">
          <Button 
            variant="secondary" 
            size="icon" 
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => navigate('/tests')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-primary">Perbandingan</span>
          </div>
          <h1 className="text-xl font-bold font-display text-foreground">
            Bandingkan Kategori Biomotor
          </h1>
        </div>
      </section>

      <div className="px-4 py-6 space-y-6">
        {/* Category Selectors */}
        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Kategori 1</label>
            <Select value={category1Id} onValueChange={setCategory1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {biomotorCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} disabled={cat.id === category2Id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category1 && categoryImages[category1.id] && (
              <div className="relative h-24 rounded-xl overflow-hidden">
                <img 
                  src={categoryImages[category1.id]} 
                  alt={category1.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p 
                  className="absolute bottom-2 left-2 text-sm font-medium text-white"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {category1.name}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Kategori 2</label>
            <Select value={category2Id} onValueChange={setCategory2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {biomotorCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} disabled={cat.id === category1Id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category2 && categoryImages[category2.id] && (
              <div className="relative h-24 rounded-xl overflow-hidden">
                <img 
                  src={categoryImages[category2.id]} 
                  alt={category2.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p 
                  className="absolute bottom-2 left-2 text-sm font-medium text-white"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {category2.name}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Stats Comparison */}
        {category1 && category2 && (
          <>
            <section className="grid grid-cols-3 gap-3 animate-fade-in">
              {[
                { 
                  icon: Target, 
                  label: 'Item Tes', 
                  val1: category1.tests.length, 
                  val2: category2.tests.length 
                },
                { 
                  icon: ListChecks, 
                  label: 'Total Norma', 
                  val1: category1.tests.reduce((acc, t) => acc + t.norms.length, 0), 
                  val2: category2.tests.reduce((acc, t) => acc + t.norms.length, 0) 
                },
                { 
                  icon: BookOpen, 
                  label: 'Skala', 
                  val1: 5, 
                  val2: 5 
                },
              ].map((stat, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-card border border-border/50 text-center"
                >
                  <stat.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <div className="flex items-center justify-center gap-2 text-sm font-bold">
                    <span style={{ color: `hsl(var(--${category1.color}))` }}>{stat.val1}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span style={{ color: `hsl(var(--${category2.color}))` }}>{stat.val2}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </section>

            {/* Radar Chart */}
            <section 
              className="p-4 rounded-2xl border border-border/50 bg-card animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Grafik Perbandingan
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 10]}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    />
                    <Radar
                      name={category1.name}
                      dataKey="cat1"
                      stroke={`hsl(var(--${category1.color}))`}
                      fill={`hsl(var(--${category1.color}))`}
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={category2.name}
                      dataKey="cat2"
                      stroke={`hsl(var(--${category2.color}))`}
                      fill={`hsl(var(--${category2.color}))`}
                      fillOpacity={0.3}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Test Items Table */}
            <section 
              className="animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <h3 className="font-semibold font-display mb-3 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-accent" />
                Daftar Item Tes
              </h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Nama Tes</th>
                      <th className="text-center py-3 px-3 font-medium w-20">
                        <span 
                          className="inline-block px-2 py-0.5 rounded-full text-xs"
                          style={{ 
                            backgroundColor: `hsl(var(--${category1.color}) / 0.2)`,
                            color: `hsl(var(--${category1.color}))`
                          }}
                        >
                          {category1.name.slice(0, 8)}
                        </span>
                      </th>
                      <th className="text-center py-3 px-3 font-medium w-20">
                        <span 
                          className="inline-block px-2 py-0.5 rounded-full text-xs"
                          style={{ 
                            backgroundColor: `hsl(var(--${category2.color}) / 0.2)`,
                            color: `hsl(var(--${category2.color}))`
                          }}
                        >
                          {category2.name.slice(0, 8)}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTestNames.map((test, idx) => (
                      <tr key={idx} className="border-t border-border/50 hover:bg-muted/30">
                        <td className="py-2.5 px-4 text-muted-foreground">{test.name}</td>
                        <td className="text-center py-2.5 px-3">
                          {test.inCat1 ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2.5 px-3">
                          {test.inCat2 ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Total: {category1.tests.length + category2.tests.length} item tes dari 2 kategori
              </p>
            </section>

            {/* Description Comparison */}
            <section 
              className="grid gap-3 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div 
                className="p-4 rounded-xl border-2"
                style={{ 
                  borderColor: `hsl(var(--${category1.color}) / 0.3)`,
                  background: `linear-gradient(135deg, hsl(var(--${category1.color}) / 0.08), hsl(var(--${category1.color}) / 0.02))`
                }}
              >
                <h4 className="font-semibold text-sm mb-1" style={{ color: `hsl(var(--${category1.color}))` }}>
                  {category1.name}
                </h4>
                <p className="text-sm text-muted-foreground">{category1.description}</p>
              </div>
              <div 
                className="p-4 rounded-xl border-2"
                style={{ 
                  borderColor: `hsl(var(--${category2.color}) / 0.3)`,
                  background: `linear-gradient(135deg, hsl(var(--${category2.color}) / 0.08), hsl(var(--${category2.color}) / 0.02))`
                }}
              >
                <h4 className="font-semibold text-sm mb-1" style={{ color: `hsl(var(--${category2.color}))` }}>
                  {category2.name}
                </h4>
                <p className="text-sm text-muted-foreground">{category2.description}</p>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

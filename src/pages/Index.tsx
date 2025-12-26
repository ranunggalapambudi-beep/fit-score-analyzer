import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/ui/category-card';
import { Button } from '@/components/ui/button';
import { biomotorCategories } from '@/data/biomotorTests';
import { useAthleteStore } from '@/store/athleteStore';
import { Users, ClipboardList, TrendingUp, ArrowRight } from 'lucide-react';

export default function Index() {
  const athletes = useAthleteStore((state) => state.athletes);
  const testSessions = useAthleteStore((state) => state.testSessions);

  const totalTests = testSessions.reduce((acc, s) => acc + s.results.length, 0);

  return (
    <Layout title="BiomotorTest" subtitle="Aplikasi Tes & Pengukuran Biomotor">
      <div className="px-4 py-6 space-y-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl p-6 border border-border/50" 
          style={{ background: 'var(--gradient-hero)' }}>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold font-display">
              Selamat Datang di{' '}
              <span className="gradient-text">BiomotorTest</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Platform pengukuran komponen biomotor lengkap untuk atlet dengan norma berdasarkan usia dan jenis kelamin
            </p>
            <Link to="/athletes">
              <Button className="mt-4 gap-2">
                Mulai Tes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <Users className="w-5 h-5 text-primary mx-auto" />
            <p className="text-2xl font-bold font-display mt-2">{athletes.length}</p>
            <p className="text-xs text-muted-foreground">Atlet</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <ClipboardList className="w-5 h-5 text-accent mx-auto" />
            <p className="text-2xl font-bold font-display mt-2">{totalTests}</p>
            <p className="text-xs text-muted-foreground">Total Tes</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <TrendingUp className="w-5 h-5 text-endurance mx-auto" />
            <p className="text-2xl font-bold font-display mt-2">7</p>
            <p className="text-xs text-muted-foreground">Kategori</p>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-display">Kategori Biomotor</h3>
            <Link to="/tests" className="text-sm text-primary">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {biomotorCategories.map((category) => (
              <Link key={category.id} to={`/tests/${category.id}`}>
                <CategoryCard
                  name={category.name}
                  description={category.description}
                  iconName={category.icon}
                  color={category.color}
                  testCount={category.tests.length}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="rounded-2xl border border-border/50 p-5 bg-card/30">
          <h3 className="text-lg font-semibold font-display mb-4">Fitur Unggulan</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                1
              </span>
              <span>7 komponen biomotor dengan 30+ item tes berdasarkan referensi ilmiah</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                2
              </span>
              <span>Norma tes berdasarkan usia dan jenis kelamin (skala 1-5)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                3
              </span>
              <span>Visualisasi radar chart untuk analisis profil biomotor</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                4
              </span>
              <span>Analisis AI untuk rekomendasi latihan dan evaluasi</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                5
              </span>
              <span>Export data ke PDF untuk dokumentasi dan evaluasi</span>
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}

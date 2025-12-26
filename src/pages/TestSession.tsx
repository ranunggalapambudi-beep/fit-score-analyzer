import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScoreBadge } from '@/components/ui/score-badge';
import { useAthleteStore } from '@/store/athleteStore';
import { biomotorCategories, calculateScore } from '@/data/biomotorTests';
import { TestResult, TestSession as TestSessionType } from '@/types/athlete';
import { ChevronLeft, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TestSession() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const athlete = useAthleteStore((state) => state.getAthleteById(athleteId || ''));
  const addTestSession = useAthleteStore((state) => state.addTestSession);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [results, setResults] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  const age = useMemo(() => {
    if (!athlete) return 0;
    return Math.floor(
      (new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
    );
  }, [athlete]);

  const currentCategory = biomotorCategories[currentCategoryIndex];

  const getScore = (testId: string, categoryId: string) => {
    const value = results[testId];
    if (value === undefined) return null;
    
    const category = biomotorCategories.find((c) => c.id === categoryId);
    const test = category?.tests.find((t) => t.id === testId);
    if (!test || !athlete) return null;

    return calculateScore(value, test, athlete.gender, age);
  };

  const handleValueChange = (testId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setResults((prev) => ({ ...prev, [testId]: numValue }));
    } else if (value === '') {
      setResults((prev) => {
        const newResults = { ...prev };
        delete newResults[testId];
        return newResults;
      });
    }
  };

  const handleNext = () => {
    if (currentCategoryIndex < biomotorCategories.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
    }
  };

  const handleSave = () => {
    if (!athlete) return;
    
    const testResults: TestResult[] = [];
    
    Object.entries(results).forEach(([testId, value]) => {
      const category = biomotorCategories.find((c) => 
        c.tests.some((t) => t.id === testId)
      );
      const test = category?.tests.find((t) => t.id === testId);
      
      if (category && test) {
        const score = calculateScore(value, test, athlete.gender, age);
        testResults.push({
          id: crypto.randomUUID(),
          athleteId: athlete.id,
          testId,
          categoryId: category.id,
          value,
          score,
          date: new Date().toISOString(),
        });
      }
    });

    if (testResults.length === 0) {
      toast.error('Mohon isi minimal satu item tes');
      return;
    }

    const session: TestSessionType = {
      id: crypto.randomUUID(),
      athleteId: athlete.id,
      date: new Date().toISOString(),
      results: testResults,
      notes: notes || undefined,
    };

    addTestSession(session);
    toast.success('Sesi tes berhasil disimpan');
    navigate(`/athletes/${athlete.id}`);
  };

  if (!athlete) {
    return (
      <Layout title="Atlet Tidak Ditemukan">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted-foreground">Atlet tidak ditemukan</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/athletes')}>
            Kembali
          </Button>
        </div>
      </Layout>
    );
  }

  const completedTests = Object.keys(results).filter((id) => 
    currentCategory.tests.some((t) => t.id === id)
  ).length;

  return (
    <Layout showHeader={false}>
      {/* Custom Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/athletes/${athlete.id}`)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold font-display">Sesi Tes: {athlete.name}</h1>
            <p className="text-xs text-muted-foreground">
              {athlete.sport} • {age} tahun • {athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
            </p>
          </div>
        </div>
        {/* Category Progress */}
        <div className="flex gap-1 px-4 pb-3">
          {biomotorCategories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setCurrentCategoryIndex(i)}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all',
                i === currentCategoryIndex 
                  ? 'bg-primary' 
                  : i < currentCategoryIndex 
                    ? 'bg-primary/50' 
                    : 'bg-muted'
              )}
            />
          ))}
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Category Header */}
        <div 
          className="p-4 rounded-xl"
          style={{ 
            backgroundColor: `hsl(var(--${currentCategory.color}) / 0.1)`,
            borderLeft: `4px solid hsl(var(--${currentCategory.color}))`,
          }}
        >
          <h2 className="font-bold font-display text-lg">{currentCategory.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {completedTests}/{currentCategory.tests.length} item diisi
          </p>
        </div>

        {/* Test Items */}
        <div className="space-y-4">
          {currentCategory.tests.map((test) => {
            const score = getScore(test.id, currentCategory.id);
            return (
              <div 
                key={test.id} 
                className="p-4 rounded-xl bg-card border border-border/50 space-y-3"
              >
                <div>
                  <h3 className="font-semibold text-sm">{test.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{test.description}</p>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor={test.id} className="text-xs text-muted-foreground">
                      Hasil ({test.norms[0]?.unit})
                    </Label>
                    <Input
                      id={test.id}
                      type="number"
                      step="0.01"
                      value={results[test.id] ?? ''}
                      onChange={(e) => handleValueChange(test.id, e.target.value)}
                      placeholder={`Masukkan ${test.norms[0]?.unit}`}
                    />
                  </div>
                  {score !== null && (
                    <div className="shrink-0">
                      <ScoreBadge score={score} size="md" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrev}
            disabled={currentCategoryIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Sebelumnya
          </Button>
          {currentCategoryIndex < biomotorCategories.length - 1 ? (
            <Button className="flex-1" onClick={handleNext}>
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button className="flex-1 gap-2" onClick={handleSave}>
              <Check className="w-4 h-4" />
              Simpan Tes
            </Button>
          )}
        </div>

        {/* Notes (only on last page) */}
        {currentCategoryIndex === biomotorCategories.length - 1 && (
          <div className="space-y-2">
            <Label>Catatan (opsional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan untuk sesi tes ini..."
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

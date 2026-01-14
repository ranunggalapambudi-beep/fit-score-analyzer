import { useState } from 'react';
import { getTestIllustration } from '@/data/testIllustrations';
import { 
  AlertTriangle, CheckCircle2, Lightbulb, PlayCircle, 
  ChevronDown, ChevronUp, ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TestIllustrationGuideProps {
  testId: string;
  testName: string;
  categoryColor: string;
}

// Mapping test IDs to illustration descriptions for visual guidance
const testIllustrationDescriptions: Record<string, { title: string; steps: string[] }> = {
  'cooper-test': {
    title: 'Cooper Test - Lari 12 Menit',
    steps: [
      'Atlet bersiap di garis start lintasan atletik',
      'Berlari dengan kecepatan konsisten selama 12 menit',
      'Gunakan cone penanda untuk menghitung jarak',
      'Catat jarak total setelah 12 menit'
    ]
  },
  'beep-test': {
    title: 'Multistage Fitness Test',
    steps: [
      'Lapangan 20 meter dengan cone di kedua ujung',
      'Atlet berlari bolak-balik mengikuti irama beep',
      'Kecepatan meningkat setiap level',
      'Tes berakhir jika gagal 2x berturut-turut'
    ]
  },
  'push-up': {
    title: 'Push Up Test',
    steps: [
      'Posisi plank dengan tangan selebar bahu',
      'Turunkan badan hingga dada hampir menyentuh lantai',
      'Dorong kembali ke posisi awal',
      'Jaga tubuh tetap lurus sepanjang gerakan'
    ]
  },
  'sit-up': {
    title: 'Sit Up 60 Detik',
    steps: [
      'Berbaring dengan lutut ditekuk 90 derajat',
      'Tangan di belakang kepala atau menyilang di dada',
      'Angkat badan hingga siku menyentuh lutut',
      'Kembali ke posisi awal, hitung repetisi dalam 60 detik'
    ]
  },
  'pull-up': {
    title: 'Pull Up Test',
    steps: [
      'Bergantung pada palang dengan pegangan overhand',
      'Lengan lurus sepenuhnya (dead hang)',
      'Tarik tubuh hingga dagu melewati palang',
      'Turunkan dengan kontrol ke posisi awal'
    ]
  },
  'back-lift': {
    title: 'Back Lift Dynamometer',
    steps: [
      'Berdiri di platform dynamometer',
      'Tekuk lutut sedikit, punggung tetap lurus',
      'Pegang pegangan dengan kedua tangan',
      'Tarik ke atas menggunakan kekuatan punggung'
    ]
  },
  'leg-dynamometer': {
    title: 'Leg Dynamometer',
    steps: [
      'Berdiri di platform dengan lutut ditekuk 115-125°',
      'Pegang pegangan dengan kedua tangan',
      'Punggung tetap lurus, pandangan ke depan',
      'Tarik ke atas menggunakan kekuatan tungkai'
    ]
  },
  'arm-dynamometer': {
    title: 'Arm Dynamometer',
    steps: [
      'Duduk atau berdiri dengan posisi tegak',
      'Pegang pegangan dynamometer dengan satu tangan',
      'Lengan pada posisi yang ditentukan',
      'Tarik/tekan dengan kekuatan maksimal lengan'
    ]
  },
  'grip-strength': {
    title: 'Grip Strength Test',
    steps: [
      'Berdiri dengan lengan di samping tubuh',
      'Pegang hand grip dynamometer',
      'Genggam dengan kekuatan maksimal',
      'Lakukan 3 kali, catat nilai tertinggi'
    ]
  },
  'leg-press': {
    title: 'Leg Press 1RM',
    steps: [
      'Duduk di mesin leg press dengan punggung rata',
      'Kaki di platform selebar bahu',
      'Turunkan beban dengan kontrol',
      'Dorong hingga kaki hampir lurus'
    ]
  },
  'vertical-jump': {
    title: 'Vertical Jump Test',
    steps: [
      'Ukur reach height dengan tangan terentang',
      'Berdiri dengan kaki selebar bahu',
      'Tekuk lutut, ayun tangan, lompat maksimal',
      'Sentuh titik tertinggi, hitung selisih'
    ]
  },
  'standing-broad-jump': {
    title: 'Standing Broad Jump',
    steps: [
      'Berdiri di belakang garis start',
      'Kaki selebar bahu, tekuk lutut',
      'Ayun tangan dan lompat ke depan',
      'Ukur jarak dari garis start ke tumit terdekat'
    ]
  },
  'sprint-30m': {
    title: 'Sprint 30 Meter',
    steps: [
      'Posisi start di garis awal',
      'Condongkan badan ke depan, siap sprint',
      'Berlari secepat mungkin ke garis finish',
      'Catat waktu saat dada melewati garis'
    ]
  },
  'sprint-60m': {
    title: 'Sprint 60 Meter',
    steps: [
      'Posisi start jongkok atau berdiri',
      'Berlari dengan akselerasi maksimal',
      'Pertahankan kecepatan hingga finish',
      'Jangan kurangi kecepatan sebelum garis'
    ]
  },
  'sit-and-reach': {
    title: 'Sit and Reach Test',
    steps: [
      'Duduk dengan kaki lurus ke depan',
      'Telapak kaki rata menempel box',
      'Condongkan badan ke depan perlahan',
      'Jangkau sejauh mungkin, tahan 2 detik'
    ]
  },
  'illinois-agility': {
    title: 'Illinois Agility Test',
    steps: [
      'Setup area 10x5 meter dengan cone',
      'Mulai dari posisi telungkup',
      'Sprint, berbelok, weaving antar cone',
      'Finish secepat mungkin tanpa menyentuh cone'
    ]
  },
  't-test': {
    title: 'T-Test Agility',
    steps: [
      'Setup cone membentuk huruf T',
      'Sprint ke cone tengah',
      'Shuffle ke kiri, kanan, kembali ke tengah',
      'Backpedal ke posisi start'
    ]
  },
  'stork-stand': {
    title: 'Stork Stand Balance Test',
    steps: [
      'Berdiri dengan satu kaki',
      'Kaki lainnya menempel di lutut penopang',
      'Tangan di pinggang',
      'Pertahankan keseimbangan selama mungkin'
    ]
  },
  'yo-yo-intermittent': {
    title: 'Yo-Yo Intermittent Recovery Test',
    steps: [
      'Lari 2x20 meter mengikuti irama beep',
      'Istirahat aktif 10 detik',
      'Lanjut ke shuttle berikutnya',
      'Tes berakhir jika gagal mencapai garis tepat waktu'
    ]
  },
  'harvard-step': {
    title: 'Harvard Step Test',
    steps: [
      'Naik turun bangku 45cm',
      'Frekuensi 30x/menit selama 5 menit',
      'Ikuti irama metronom',
      'Ukur denyut nadi pemulihan'
    ]
  },
};

export function TestIllustrationGuide({ testId, testName, categoryColor }: TestIllustrationGuideProps) {
  const [expanded, setExpanded] = useState(false);
  const illustration = getTestIllustration(testId);
  const visualGuide = testIllustrationDescriptions[testId];

  if (!illustration && !visualGuide) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Visual Steps Guide */}
      {visualGuide && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `hsl(var(--${categoryColor}) / 0.15)` }}
              >
                <ImageIcon className="w-5 h-5" style={{ color: `hsl(var(--${categoryColor}))` }} />
              </div>
              <div className="text-left">
                <h4 className="font-semibold font-display text-sm">Panduan Visual</h4>
                <p className="text-xs text-muted-foreground">Langkah-langkah pelaksanaan tes</p>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          {expanded && (
            <div className="p-4 pt-0 space-y-4">
              {/* Step by step visual guide */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {visualGuide.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-muted/30 border border-border/30"
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                      style={{ 
                        backgroundColor: `hsl(var(--${categoryColor}) / 0.2)`,
                        color: `hsl(var(--${categoryColor}))`
                      }}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Illustration from testIllustrations.ts */}
      {illustration && (
        <div className="space-y-4">
          {/* Steps */}
          <div>
            <h4 className="font-semibold font-display flex items-center gap-2 mb-3 text-sm">
              <PlayCircle className="w-4 h-4" style={{ color: `hsl(var(--${categoryColor}))` }} />
              Langkah Pelaksanaan
            </h4>
            <div className="space-y-3">
              {illustration.steps.map((step) => (
                <div 
                  key={step.step}
                  className={cn(
                    "p-3 rounded-xl border transition-all",
                    "bg-card border-border/50"
                  )}
                >
                  <div className="flex gap-3">
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ 
                        backgroundColor: `hsl(var(--${categoryColor}) / 0.15)`,
                        color: `hsl(var(--${categoryColor}))`
                      }}
                    >
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{step.description}</p>
                      {step.tips && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                          <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />
                          {step.tips}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          {illustration.commonMistakes && illustration.commonMistakes.length > 0 && (
            <div>
              <h4 className="font-semibold font-display flex items-center gap-2 mb-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Kesalahan Umum
              </h4>
              <div className="space-y-2">
                {illustration.commonMistakes.map((mistake, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
                  >
                    <span className="text-amber-500 mt-0.5">✗</span>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Tips */}
          {illustration.safetyTips && illustration.safetyTips.length > 0 && (
            <div>
              <h4 className="font-semibold font-display flex items-center gap-2 mb-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Tips Keamanan
              </h4>
              <div className="space-y-2">
                {illustration.safetyTips.map((tip, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Link */}
          {illustration.videoUrl && (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => window.open(illustration.videoUrl, '_blank')}
            >
              <PlayCircle className="w-4 h-4" />
              Lihat Video Tutorial
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

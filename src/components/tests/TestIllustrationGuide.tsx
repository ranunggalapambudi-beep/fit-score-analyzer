import { useState } from 'react';
import { getTestIllustration } from '@/data/testIllustrations';
import { 
  AlertTriangle, CheckCircle2, Lightbulb, PlayCircle, 
  ChevronDown, ChevronUp, ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import test illustration images
import cooperTestImg from '@/assets/tests/cooper-test.jpg';
import beepTestImg from '@/assets/tests/beep-test.jpg';
import pushUpImg from '@/assets/tests/push-up.jpg';
import sitUpImg from '@/assets/tests/sit-up.jpg';
import pullUpImg from '@/assets/tests/pull-up.jpg';
import gripStrengthImg from '@/assets/tests/grip-strength.jpg';
import sprint30mImg from '@/assets/tests/sprint-30m.jpg';
import illinoisAgilityImg from '@/assets/tests/illinois-agility.jpg';
import tTestImg from '@/assets/tests/t-test.jpg';
import shuttleRunImg from '@/assets/tests/shuttle-run.jpg';
import sitAndReachImg from '@/assets/tests/sit-and-reach.jpg';
import storkStandImg from '@/assets/tests/stork-stand.jpg';
import verticalJumpImg from '@/assets/tests/vertical-jump.jpg';
import standingBroadJumpImg from '@/assets/tests/standing-broad-jump.jpg';
import medicineBallThrowImg from '@/assets/tests/medicine-ball-throw.jpg';
import ballWallTossImg from '@/assets/tests/ball-wall-toss.jpg';

// Map test IDs to their illustration images
const testImages: Record<string, string> = {
  'cooper-test': cooperTestImg,
  'beep-test': beepTestImg,
  'yo-yo-intermittent': beepTestImg,
  'harvard-step': cooperTestImg,
  'mft-1600': cooperTestImg,
  'push-up': pushUpImg,
  'sit-up': sitUpImg,
  'pull-up': pullUpImg,
  'back-lift': gripStrengthImg,
  'leg-dynamometer': gripStrengthImg,
  'arm-dynamometer': gripStrengthImg,
  'grip-strength': gripStrengthImg,
  'leg-press': pushUpImg,
  'bench-press-1rm-ratio': pushUpImg,
  'squat-1rm-ratio': standingBroadJumpImg,
  'deadlift-1rm-ratio': gripStrengthImg,
  'overhead-press-1rm-ratio': gripStrengthImg,
  'sprint-30m': sprint30mImg,
  'sprint-60m': sprint30mImg,
  'sprint-100m': sprint30mImg,
  'reaction-time': sprint30mImg,
  'flying-start-20m': sprint30mImg,
  'illinois-agility': illinoisAgilityImg,
  't-test': tTestImg,
  'hexagon-test': illinoisAgilityImg,
  'shuttle-run': shuttleRunImg,
  'pro-agility': shuttleRunImg,
  'sit-and-reach': sitAndReachImg,
  'sit-reach': sitAndReachImg,
  'shoulder-flexibility': sitAndReachImg,
  'trunk-rotation': sitAndReachImg,
  'groin-flexibility': sitAndReachImg,
  'hip-flexor': sitAndReachImg,
  'stork-stand': storkStandImg,
  'y-balance': storkStandImg,
  'bass-test': storkStandImg,
  'tandem-walk': storkStandImg,
  'romberg-test': storkStandImg,
  'vertical-jump': verticalJumpImg,
  'standing-broad-jump': standingBroadJumpImg,
  'medicine-ball-throw': medicineBallThrowImg,
  'triple-hop': standingBroadJumpImg,
  'countermovement-jump': verticalJumpImg,
  'wingate-test': cooperTestImg,
  'ball-wall-toss': ballWallTossImg,
  'alternate-hand-wall-toss': ballWallTossImg,
  'stick-drop-test': ballWallTossImg,
  'soccer-wall-volley': ballWallTossImg,
  'basketball-dribble': ballWallTossImg,
};

interface TestIllustrationGuideProps {
  testId: string;
  testName: string;
  categoryColor: string;
}

// Mapping test IDs to illustration descriptions for visual guidance
const testIllustrationDescriptions: Record<string, { title: string; steps: string[] }> = {
  'cooper-test': {
    title: 'Cooper Test - Lari 12 Menit',
    steps: ['Atlet bersiap di garis start lintasan atletik', 'Berlari dengan kecepatan konsisten selama 12 menit', 'Gunakan cone penanda untuk menghitung jarak', 'Catat jarak total setelah 12 menit']
  },
  'beep-test': {
    title: 'Multistage Fitness Test',
    steps: ['Lapangan 20 meter dengan cone di kedua ujung', 'Atlet berlari bolak-balik mengikuti irama beep', 'Kecepatan meningkat setiap level', 'Tes berakhir jika gagal 2x berturut-turut']
  },
  'yo-yo-intermittent': {
    title: 'Yo-Yo Intermittent Recovery Test',
    steps: ['Lari 2x20 meter mengikuti irama beep', 'Istirahat aktif 10 detik di zona recovery', 'Lanjut ke shuttle berikutnya', 'Tes berakhir jika gagal mencapai garis tepat waktu']
  },
  'harvard-step': {
    title: 'Harvard Step Test',
    steps: ['Naik turun bangku 45cm mengikuti metronom', 'Frekuensi 30x/menit selama 5 menit', 'Duduk dan ukur denyut nadi pemulihan', 'Hitung indeks kebugaran dari nadi']
  },
  'mft-1600': {
    title: 'Lari 1600 Meter',
    steps: ['Pemanasan 10-15 menit', 'Berlari 1600 meter (4 putaran 400m) secepat mungkin', 'Gunakan strategi pacing yang konsisten', 'Catat waktu tempuh']
  },
  'push-up': {
    title: 'Push Up Test',
    steps: ['Posisi plank dengan tangan selebar bahu', 'Turunkan badan hingga dada hampir menyentuh lantai', 'Dorong kembali ke posisi awal', 'Jaga tubuh tetap lurus sepanjang gerakan']
  },
  'sit-up': {
    title: 'Sit Up 60 Detik',
    steps: ['Berbaring dengan lutut ditekuk 90 derajat', 'Tangan di belakang kepala atau menyilang di dada', 'Angkat badan hingga siku menyentuh lutut', 'Kembali ke posisi awal, hitung repetisi dalam 60 detik']
  },
  'pull-up': {
    title: 'Pull Up Test',
    steps: ['Bergantung pada palang dengan pegangan overhand', 'Lengan lurus sepenuhnya (dead hang)', 'Tarik tubuh hingga dagu melewati palang', 'Turunkan dengan kontrol ke posisi awal']
  },
  'back-lift': {
    title: 'Back Lift Dynamometer',
    steps: ['Berdiri di platform dynamometer', 'Tekuk lutut sedikit, punggung tetap lurus', 'Pegang pegangan dengan kedua tangan', 'Tarik ke atas menggunakan kekuatan punggung']
  },
  'leg-dynamometer': {
    title: 'Leg Dynamometer',
    steps: ['Berdiri di platform dengan lutut ditekuk 115-125°', 'Pegang pegangan dengan kedua tangan', 'Punggung tetap lurus, pandangan ke depan', 'Tarik ke atas menggunakan kekuatan tungkai']
  },
  'arm-dynamometer': {
    title: 'Arm Dynamometer',
    steps: ['Duduk atau berdiri dengan posisi tegak', 'Pegang pegangan dynamometer dengan satu tangan', 'Lengan pada posisi yang ditentukan', 'Tarik/tekan dengan kekuatan maksimal lengan']
  },
  'grip-strength': {
    title: 'Grip Strength Test',
    steps: ['Berdiri dengan lengan di samping tubuh', 'Pegang hand grip dynamometer', 'Genggam dengan kekuatan maksimal 3-5 detik', 'Lakukan 3 kali, catat nilai tertinggi']
  },
  'leg-press': {
    title: 'Leg Press 1RM',
    steps: ['Duduk di mesin leg press dengan punggung rata', 'Kaki di platform selebar bahu', 'Pemanasan lalu tingkatkan beban bertahap', 'Dorong hingga kaki hampir lurus, catat 1RM']
  },
  'bench-press-1rm-ratio': {
    title: 'Bench Press 1RM (Rasio BB)',
    steps: ['Berbaring di bench, kaki rata di lantai', 'Pemanasan progresif dari ringan ke berat', 'Tingkatkan beban hingga 1RM', 'Hitung rasio: 1RM ÷ Berat Badan']
  },
  'squat-1rm-ratio': {
    title: 'Back Squat 1RM (Rasio BB)',
    steps: ['Barbell di upper back, kaki selebar bahu', 'Pemanasan: bodyweight lalu beban bertahap', 'Squat penuh hingga paha paralel', 'Hitung rasio: 1RM ÷ Berat Badan']
  },
  'deadlift-1rm-ratio': {
    title: 'Deadlift 1RM (Rasio BB)',
    steps: ['Berdiri di depan barbell, kaki selebar bahu', 'Pegang barbell, punggung lurus', 'Angkat dengan mendorong lantai, bukan menarik', 'Hitung rasio: 1RM ÷ Berat Badan']
  },
  'overhead-press-1rm-ratio': {
    title: 'Overhead Press 1RM (Rasio BB)',
    steps: ['Barbell di rack position depan bahu', 'Pemanasan progresif', 'Tekan ke atas hingga lengan lurus', 'Hitung rasio: 1RM ÷ Berat Badan']
  },
  'vertical-jump': {
    title: 'Vertical Jump Test',
    steps: ['Ukur reach height dengan tangan terentang', 'Berdiri dengan kaki selebar bahu', 'Tekuk lutut, ayun tangan, lompat maksimal', 'Sentuh titik tertinggi, hitung selisih']
  },
  'standing-broad-jump': {
    title: 'Standing Broad Jump',
    steps: ['Berdiri di belakang garis start', 'Kaki selebar bahu, tekuk lutut', 'Ayun tangan dan lompat ke depan sejauh mungkin', 'Ukur jarak dari garis start ke tumit terdekat']
  },
  'sprint-30m': {
    title: 'Sprint 30 Meter',
    steps: ['Posisi start berdiri di garis awal', 'Condongkan badan ke depan, siap sprint', 'Berlari secepat mungkin ke garis finish', 'Catat waktu saat dada melewati garis']
  },
  'sprint-60m': {
    title: 'Sprint 60 Meter',
    steps: ['Posisi start jongkok atau berdiri', 'Akselerasi maksimal dari garis start', 'Pertahankan kecepatan puncak hingga finish', 'Jangan kurangi kecepatan sebelum garis']
  },
  'sprint-100m': {
    title: 'Sprint 100 Meter',
    steps: ['Start jongkok dengan blok start', 'Akselerasi progresif 0-40 meter', 'Kecepatan puncak 40-70 meter', 'Maintenance kecepatan hingga 100m finish']
  },
  'reaction-time': {
    title: 'Reaction Time Test',
    steps: ['Siapkan alat reaction time', 'Atlet fokus menunggu stimulus', 'Respon secepat mungkin saat stimulus muncul', 'Rata-rata dari 10 percobaan']
  },
  'flying-start-20m': {
    title: 'Flying Start 20 Meter',
    steps: ['Zona awalan 10-15m sebelum zona timing', 'Akselerasi di zona awalan', 'Kecepatan maksimal saat memasuki zona 20m', 'Catat waktu melewati zona timing']
  },
  'sit-and-reach': {
    title: 'Sit and Reach Test',
    steps: ['Duduk dengan kaki lurus ke depan', 'Telapak kaki rata menempel box', 'Condongkan badan ke depan perlahan', 'Jangkau sejauh mungkin, tahan 2 detik']
  },
  'sit-reach': {
    title: 'Sit and Reach Test',
    steps: ['Duduk dengan kaki lurus ke depan', 'Telapak kaki menempel box', 'Condongkan badan ke depan', 'Jangkau sejauh mungkin, tahan 2 detik']
  },
  'shoulder-flexibility': {
    title: 'Shoulder Flexibility (Apley Scratch)',
    steps: ['Tangan kanan meraih lewat atas bahu ke belakang', 'Tangan kiri meraih lewat bawah ke atas', 'Coba sentuhkan jari kedua tangan', 'Ukur jarak antara jari, ulangi sisi sebaliknya']
  },
  'trunk-rotation': {
    title: 'Trunk Rotation Test',
    steps: ['Duduk dengan kaki lurus, pegang tongkat di bahu', 'Rotasi tubuh ke satu sisi semaksimal mungkin', 'Pinggul tetap menghadap depan', 'Ukur sudut rotasi, ulangi sisi lain']
  },
  'groin-flexibility': {
    title: 'Groin Flexibility Test',
    steps: ['Duduk butterfly: telapak kaki saling menempel', 'Tarik tumit dekat tubuh', 'Biarkan lutut turun ke samping alami', 'Ukur jarak lutut ke lantai']
  },
  'hip-flexor': {
    title: 'Thomas Test (Hip Flexor)',
    steps: ['Berbaring di ujung meja, kaki menggantung', 'Tarik satu lutut ke dada dengan tangan', 'Kaki lain menggantung bebas', 'Amati sudut paha terhadap horizontal']
  },
  'illinois-agility': {
    title: 'Illinois Agility Test',
    steps: ['Setup area 10x5 meter dengan 8 cone', 'Mulai dari posisi telungkup', 'Sprint, berbelok, weaving antar cone', 'Finish secepat mungkin tanpa menyentuh cone']
  },
  't-test': {
    title: 'T-Test Agility',
    steps: ['Setup cone membentuk huruf T (10m depan, 5m kiri-kanan)', 'Sprint ke cone tengah', 'Shuffle ke kiri, kanan, kembali ke tengah', 'Backpedal ke posisi start']
  },
  'hexagon-test': {
    title: 'Hexagon Agility Test',
    steps: ['Buat hexagon 66cm per sisi di lantai', 'Berdiri di tengah hexagon', 'Lompat keluar-masuk setiap sisi, 3 putaran', 'Catat waktu total, jangan injak garis']
  },
  'shuttle-run': {
    title: 'Shuttle Run 4x10 Meter',
    steps: ['2 garis paralel 10 meter, 2 balok kayu', 'Lari ke garis finish, ambil 1 balok', 'Kembali, letakkan balok di start', 'Ulangi untuk balok kedua, catat waktu']
  },
  'pro-agility': {
    title: 'Pro Agility (5-10-5)',
    steps: ['3 cone garis lurus jarak 5 yard', 'Start di cone tengah, 3-point stance', 'Sprint 5 yard kanan, 10 yard kiri, 5 yard kembali', 'Sentuh garis dengan tangan di setiap titik']
  },
  'stork-stand': {
    title: 'Stork Stand Balance Test',
    steps: ['Berdiri satu kaki, tangan di pinggang', 'Kaki lainnya menempel di lutut penopang', 'Angkat tumit, berdiri di ujung jari', 'Pertahankan keseimbangan selama mungkin']
  },
  'y-balance': {
    title: 'Y Balance Test',
    steps: ['Buat 3 garis dari titik tengah (Y shape)', 'Berdiri satu kaki di tengah', 'Raih sejauh mungkin ke 3 arah', 'Catat jarak, hitung composite score']
  },
  'bass-test': {
    title: 'Bass Test of Dynamic Balance',
    steps: ['10 target marks di lantai', 'Lompat ke target satu per satu', 'Mendarat satu kaki, tahan 5 detik', 'Skor: landing + durasi bertahan']
  },
  'tandem-walk': {
    title: 'Tandem Walk Test',
    steps: ['Garis lurus 3 meter di lantai', 'Berjalan tumit-ke-jari di atas garis', 'Pandangan ke depan, bukan ke bawah', 'Hitung jumlah kesalahan']
  },
  'romberg-test': {
    title: 'Romberg Test',
    steps: ['Berdiri kaki rapat, tangan di samping', 'Tutup mata sepenuhnya', 'Tahan posisi selama mungkin (maks 60 detik)', 'Timer berhenti jika kehilangan keseimbangan']
  },
  'medicine-ball-throw': {
    title: 'Medicine Ball Throw',
    steps: ['Berdiri di belakang garis, pegang medicine ball 3kg', 'Posisi kaki selebar bahu', 'Lempar bola ke depan dengan tenaga maksimal', 'Ukur jarak lemparan, 3 percobaan']
  },
  'triple-hop': {
    title: 'Triple Hop Test',
    steps: ['Berdiri satu kaki di garis start', 'Lompat 3x berturut-turut dengan kaki sama', 'Mendarat stabil setelah lompatan ketiga', 'Ukur jarak total, bandingkan kiri-kanan']
  },
  'countermovement-jump': {
    title: 'Countermovement Jump (CMJ)',
    steps: ['Berdiri tegak, tangan di pinggang', 'Turun cepat ke quarter squat', 'Langsung lompat setinggi mungkin', 'Kaki lurus saat di udara, mendarat di mat']
  },
  'wingate-test': {
    title: 'Wingate Anaerobic Test',
    steps: ['Atur cycle ergometer dan beban (7.5% BB)', 'Pemanasan 5 menit', 'Sprint maksimal 30 detik melawan beban', 'Catat peak power dan mean power']
  },
  'ball-wall-toss': {
    title: 'Ball Wall Toss Test',
    steps: ['Berdiri 2 meter dari dinding', 'Lempar bola tenis ke dinding', 'Tangkap pantulan dengan tangan yang sama', 'Hitung tangkapan sukses dalam 30 detik']
  },
  'alternate-hand-wall-toss': {
    title: 'Alternate Hand Wall Toss',
    steps: ['Berdiri 2 meter dari dinding', 'Lempar dengan kanan, tangkap dengan kiri', 'Lempar dengan kiri, tangkap dengan kanan', 'Hitung tangkapan sukses dalam 30 detik']
  },
  'stick-drop-test': {
    title: 'Stick Drop Reaction Test',
    steps: ['Tester pegang tongkat vertikal di atas', 'Subjek siap menangkap di bawah', 'Tester lepas tanpa aba-aba', 'Catat jarak jatuh sebelum ditangkap']
  },
  'soccer-wall-volley': {
    title: 'Soccer Wall Volley Test',
    steps: ['Berdiri 4 meter dari dinding', 'Tendang bola ke dinding', 'Kontrol pantulan dan tendang lagi', 'Hitung tendangan sukses dalam 30 detik']
  },
  'basketball-dribble': {
    title: 'Basketball Dribble Test',
    steps: ['5 cone garis lurus jarak 2 meter', 'Dribble zigzag melewati semua cone', 'Kembali ke start dengan cara sama', 'Catat waktu total']
  },
};

export function TestIllustrationGuide({ testId, testName, categoryColor }: TestIllustrationGuideProps) {
  const [expanded, setExpanded] = useState(false);
  const illustration = getTestIllustration(testId);
  const visualGuide = testIllustrationDescriptions[testId];
  const testImage = testImages[testId];

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
                <h4 className="font-semibold font-display text-sm">📖 Panduan Visual & Pelaksanaan</h4>
                <p className="text-xs text-muted-foreground">Langkah-langkah, gambar, tips & kesalahan umum</p>
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
              {/* Test Image */}
              {testImage && (
                <div className="mt-4 rounded-xl overflow-hidden border border-border/30">
                  <img 
                    src={testImage} 
                    alt={`Ilustrasi ${visualGuide.title}`}
                    className="w-full h-48 object-cover"
                  />
                  <div 
                    className="px-3 py-2 text-xs font-medium text-center"
                    style={{ 
                      backgroundColor: `hsl(var(--${categoryColor}) / 0.1)`,
                      color: `hsl(var(--${categoryColor}))`
                    }}
                  >
                    {visualGuide.title}
                  </div>
                </div>
              )}

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

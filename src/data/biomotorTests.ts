export interface TestNorm {
  gender: 'male' | 'female';
  ageRange: [number, number];
  scale1: [number, number];
  scale2: [number, number];
  scale3: [number, number];
  scale4: [number, number];
  scale5: [number, number];
  unit: string;
  higherIsBetter: boolean;
}

export interface TestItem {
  id: string;
  name: string;
  description: string;
  procedure: string;
  equipment: string[];
  reference: string;
  norms: TestNorm[];
}

export interface BiomotorCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tests: TestItem[];
}

export const biomotorCategories: BiomotorCategory[] = [
  {
    id: 'endurance',
    name: 'Daya Tahan',
    description: 'Kemampuan tubuh melakukan aktivitas dalam waktu lama tanpa kelelahan berlebih',
    icon: 'Heart',
    color: 'endurance',
    tests: [
      {
        id: 'cooper-test',
        name: 'Cooper Test (Lari 12 Menit)',
        description: 'Tes berlari sejauh mungkin dalam waktu 12 menit untuk mengukur VO2max',
        procedure: '1. Pemanasan 10 menit\n2. Berlari/berjalan selama 12 menit\n3. Catat jarak tempuh',
        equipment: ['Lintasan atletik/lapangan', 'Stopwatch', 'Peluit', 'Cone penanda'],
        reference: 'Cooper, K.H. (1968). A means of assessing maximal oxygen intake. JAMA',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [0, 2100], scale2: [2100, 2400], scale3: [2400, 2700], scale4: [2700, 3000], scale5: [3000, 9999], unit: 'meter', higherIsBetter: true },
          { gender: 'male', ageRange: [20, 29], scale1: [0, 1600], scale2: [1600, 2200], scale3: [2200, 2400], scale4: [2400, 2800], scale5: [2800, 9999], unit: 'meter', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 19], scale1: [0, 1600], scale2: [1600, 1900], scale3: [1900, 2100], scale4: [2100, 2300], scale5: [2300, 9999], unit: 'meter', higherIsBetter: true },
          { gender: 'female', ageRange: [20, 29], scale1: [0, 1500], scale2: [1500, 1800], scale3: [1800, 2000], scale4: [2000, 2200], scale5: [2200, 9999], unit: 'meter', higherIsBetter: true },
        ]
      },
      {
        id: 'beep-test',
        name: 'Multistage Fitness Test (Beep Test)',
        description: 'Tes lari bolak-balik 20 meter mengikuti irama bunyi beep yang semakin cepat',
        procedure: '1. Lari bolak-balik 20 meter\n2. Ikuti irama beep\n3. Catat level dan shuttle terakhir',
        equipment: ['Lapangan 20 meter', 'Audio beep test', 'Cone', 'Speaker'],
        reference: 'Léger, L.A. & Lambert, J. (1982). A maximal multistage 20m shuttle run test',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [0, 5], scale2: [5, 7], scale3: [7, 9], scale4: [9, 11], scale5: [11, 21], unit: 'level', higherIsBetter: true },
          { gender: 'male', ageRange: [20, 29], scale1: [0, 6], scale2: [6, 8], scale3: [8, 10], scale4: [10, 12], scale5: [12, 21], unit: 'level', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 19], scale1: [0, 4], scale2: [4, 5.5], scale3: [5.5, 7], scale4: [7, 8.5], scale5: [8.5, 21], unit: 'level', higherIsBetter: true },
          { gender: 'female', ageRange: [20, 29], scale1: [0, 4.5], scale2: [4.5, 6], scale3: [6, 7.5], scale4: [7.5, 9], scale5: [9, 21], unit: 'level', higherIsBetter: true },
        ]
      },
      {
        id: 'yo-yo-intermittent',
        name: 'Yo-Yo Intermittent Recovery Test',
        description: 'Tes daya tahan dengan istirahat aktif untuk olahraga intermiten',
        procedure: '1. Lari 2x20 meter\n2. Istirahat aktif 10 detik\n3. Ikuti irama beep hingga gagal',
        equipment: ['Lapangan 20+5 meter', 'Audio yo-yo test', 'Cone'],
        reference: 'Bangsbo, J. (1994). Fitness training in football',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [0, 440], scale2: [440, 720], scale3: [720, 1040], scale4: [1040, 1400], scale5: [1400, 9999], unit: 'meter', higherIsBetter: true },
          { gender: 'male', ageRange: [20, 35], scale1: [0, 560], scale2: [560, 920], scale3: [920, 1280], scale4: [1280, 1680], scale5: [1680, 9999], unit: 'meter', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 19], scale1: [0, 280], scale2: [280, 440], scale3: [440, 600], scale4: [600, 800], scale5: [800, 9999], unit: 'meter', higherIsBetter: true },
          { gender: 'female', ageRange: [20, 35], scale1: [0, 320], scale2: [320, 480], scale3: [480, 680], scale4: [680, 920], scale5: [920, 9999], unit: 'meter', higherIsBetter: true },
        ]
      },
      {
        id: 'harvard-step',
        name: 'Harvard Step Test',
        description: 'Tes naik turun bangku untuk mengukur kebugaran kardiovaskular',
        procedure: '1. Naik turun bangku 45cm selama 5 menit\n2. Frekuensi 30x/menit\n3. Ukur denyut nadi pemulihan',
        equipment: ['Bangku 45cm', 'Stopwatch', 'Metronom'],
        reference: 'Brouha, L. (1943). The step test: A simple method of measuring physical fitness',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 55], scale2: [55, 64], scale3: [65, 79], scale4: [80, 89], scale5: [90, 150], unit: 'indeks', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 50], scale2: [50, 59], scale3: [60, 74], scale4: [75, 84], scale5: [85, 150], unit: 'indeks', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 50], scale2: [50, 59], scale3: [60, 74], scale4: [75, 84], scale5: [85, 150], unit: 'indeks', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 45], scale2: [45, 54], scale3: [55, 69], scale4: [70, 79], scale5: [80, 150], unit: 'indeks', higherIsBetter: true },
        ]
      },
      {
        id: 'mft-1600',
        name: 'Lari 1600 Meter',
        description: 'Tes lari jarak menengah untuk mengukur daya tahan aerobik',
        procedure: '1. Pemanasan\n2. Berlari 1600 meter secepat mungkin\n3. Catat waktu tempuh',
        equipment: ['Lintasan atletik', 'Stopwatch'],
        reference: 'AAHPERD (1980). Health Related Physical Fitness Test Manual',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [600, 480], scale2: [480, 420], scale3: [420, 360], scale4: [360, 300], scale5: [300, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [20, 35], scale1: [660, 540], scale2: [540, 450], scale3: [450, 390], scale4: [390, 330], scale5: [330, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [13, 19], scale1: [720, 600], scale2: [600, 510], scale3: [510, 450], scale4: [450, 390], scale5: [390, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [20, 35], scale1: [780, 660], scale2: [660, 570], scale3: [570, 510], scale4: [510, 450], scale5: [450, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
    ]
  },
  {
    id: 'strength',
    name: 'Kekuatan',
    description: 'Kemampuan otot untuk mengatasi beban atau tahanan maksimal',
    icon: 'Dumbbell',
    color: 'strength',
    tests: [
      {
        id: 'push-up',
        name: 'Push Up',
        description: 'Tes kekuatan otot lengan dan dada',
        procedure: '1. Posisi telungkup, tangan di samping dada\n2. Angkat badan hingga tangan lurus\n3. Turunkan hingga dada hampir menyentuh lantai\n4. Hitung repetisi maksimal',
        equipment: ['Matras'],
        reference: 'ACSM (2018). Guidelines for Exercise Testing and Prescription',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [0, 15], scale2: [15, 25], scale3: [25, 35], scale4: [35, 45], scale5: [45, 100], unit: 'repetisi', higherIsBetter: true },
          { gender: 'male', ageRange: [20, 29], scale1: [0, 17], scale2: [17, 29], scale3: [29, 36], scale4: [36, 44], scale5: [44, 100], unit: 'repetisi', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 19], scale1: [0, 8], scale2: [8, 15], scale3: [15, 22], scale4: [22, 30], scale5: [30, 100], unit: 'repetisi', higherIsBetter: true },
          { gender: 'female', ageRange: [20, 29], scale1: [0, 10], scale2: [10, 18], scale3: [18, 24], scale4: [24, 32], scale5: [32, 100], unit: 'repetisi', higherIsBetter: true },
        ]
      },
      {
        id: 'sit-up',
        name: 'Sit Up (60 detik)',
        description: 'Tes kekuatan otot perut',
        procedure: '1. Berbaring, lutut ditekuk 90 derajat\n2. Tangan di belakang kepala\n3. Angkat badan hingga siku menyentuh lutut\n4. Hitung repetisi dalam 60 detik',
        equipment: ['Matras', 'Stopwatch'],
        reference: 'Mackenzie, B. (2005). 101 Performance Evaluation Tests',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [0, 25], scale2: [25, 35], scale3: [35, 45], scale4: [45, 55], scale5: [55, 100], unit: 'repetisi', higherIsBetter: true },
          { gender: 'male', ageRange: [20, 35], scale1: [0, 22], scale2: [22, 32], scale3: [32, 42], scale4: [42, 52], scale5: [52, 100], unit: 'repetisi', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 19], scale1: [0, 18], scale2: [18, 28], scale3: [28, 38], scale4: [38, 48], scale5: [48, 100], unit: 'repetisi', higherIsBetter: true },
          { gender: 'female', ageRange: [20, 35], scale1: [0, 15], scale2: [15, 25], scale3: [25, 35], scale4: [35, 45], scale5: [45, 100], unit: 'repetisi', higherIsBetter: true },
        ]
      },
      {
        id: 'pull-up',
        name: 'Pull Up',
        description: 'Tes kekuatan otot lengan dan punggung',
        procedure: '1. Bergantung pada palang, pegangan overhand\n2. Tarik badan hingga dagu melewati palang\n3. Turunkan dengan kontrol\n4. Hitung repetisi maksimal',
        equipment: ['Palang pull up'],
        reference: 'NSCA (2016). Essentials of Strength Training and Conditioning',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [0, 3], scale2: [3, 7], scale3: [7, 12], scale4: [12, 17], scale5: [17, 50], unit: 'repetisi', higherIsBetter: true },
          { gender: 'male', ageRange: [20, 35], scale1: [0, 4], scale2: [4, 8], scale3: [8, 13], scale4: [13, 18], scale5: [18, 50], unit: 'repetisi', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 19], scale1: [0, 1], scale2: [1, 2], scale3: [2, 4], scale4: [4, 7], scale5: [7, 30], unit: 'repetisi', higherIsBetter: true },
          { gender: 'female', ageRange: [20, 35], scale1: [0, 1], scale2: [1, 3], scale3: [3, 5], scale4: [5, 8], scale5: [8, 30], unit: 'repetisi', higherIsBetter: true },
        ]
      },
      {
        id: 'back-lift',
        name: 'Back Lift Dynamometer',
        description: 'Tes kekuatan otot punggung menggunakan dynamometer',
        procedure: '1. Berdiri di atas platform dynamometer\n2. Tekuk lutut sedikit, punggung lurus\n3. Tarik pegangan ke atas dengan kekuatan punggung\n4. Catat angka tertinggi',
        equipment: ['Back lift dynamometer'],
        reference: 'Johnson, B.L. & Nelson, J.K. (1986). Practical Measurements for Evaluation in PE',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 90], scale2: [90, 120], scale3: [120, 150], scale4: [150, 180], scale5: [180, 300], unit: 'kg', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 85], scale2: [85, 115], scale3: [115, 145], scale4: [145, 175], scale5: [175, 300], unit: 'kg', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 50], scale2: [50, 70], scale3: [70, 90], scale4: [90, 110], scale5: [110, 200], unit: 'kg', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 45], scale2: [45, 65], scale3: [65, 85], scale4: [85, 105], scale5: [105, 200], unit: 'kg', higherIsBetter: true },
        ]
      },
      {
        id: 'leg-press',
        name: 'Leg Press 1RM',
        description: 'Tes kekuatan maksimal otot tungkai',
        procedure: '1. Duduk di mesin leg press\n2. Tentukan beban maksimal yang bisa diangkat 1 kali\n3. Gunakan protokol peningkatan beban bertahap',
        equipment: ['Mesin leg press'],
        reference: 'Baechle, T.R. & Earle, R.W. (2008). Essentials of Strength Training',
        norms: [
          { gender: 'male', ageRange: [18, 30], scale1: [0, 150], scale2: [150, 200], scale3: [200, 250], scale4: [250, 300], scale5: [300, 500], unit: 'kg', higherIsBetter: true },
          { gender: 'male', ageRange: [31, 45], scale1: [0, 130], scale2: [130, 180], scale3: [180, 230], scale4: [230, 280], scale5: [280, 500], unit: 'kg', higherIsBetter: true },
          { gender: 'female', ageRange: [18, 30], scale1: [0, 80], scale2: [80, 120], scale3: [120, 160], scale4: [160, 200], scale5: [200, 350], unit: 'kg', higherIsBetter: true },
          { gender: 'female', ageRange: [31, 45], scale1: [0, 70], scale2: [70, 110], scale3: [110, 150], scale4: [150, 190], scale5: [190, 350], unit: 'kg', higherIsBetter: true },
        ]
      },
      {
        id: 'grip-strength',
        name: 'Grip Strength (Hand Dynamometer)',
        description: 'Tes kekuatan genggaman tangan',
        procedure: '1. Berdiri, tangan di samping tubuh\n2. Genggam dynamometer dengan kuat\n3. Lakukan 3 kali percobaan\n4. Catat nilai tertinggi',
        equipment: ['Hand grip dynamometer'],
        reference: 'Roberts, H.C. et al. (2011). A review of the measurement of grip strength',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 35], scale2: [35, 45], scale3: [45, 55], scale4: [55, 65], scale5: [65, 100], unit: 'kg', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 38], scale2: [38, 48], scale3: [48, 58], scale4: [58, 68], scale5: [68, 100], unit: 'kg', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 20], scale2: [20, 28], scale3: [28, 36], scale4: [36, 44], scale5: [44, 70], unit: 'kg', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 22], scale2: [22, 30], scale3: [30, 38], scale4: [38, 46], scale5: [46, 70], unit: 'kg', higherIsBetter: true },
        ]
      },
      {
        id: 'bench-press-1rm-ratio',
        name: 'Bench Press 1RM (Rasio BB)',
        description: 'Tes kekuatan maksimal dada dan lengan berdasarkan rasio berat badan. Nilai = 1RM / Berat Badan',
        procedure: '1. Pemanasan dengan beban ringan 10-15 rep\n2. Tingkatkan beban bertahap hingga 1RM\n3. Istirahat 3-5 menit antar set\n4. Hitung rasio: 1RM ÷ Berat Badan',
        equipment: ['Bench press', 'Barbell', 'Plate beban'],
        reference: 'Baechle, T.R. & Earle, R.W. (2008). Essentials of Strength Training and Conditioning',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 0.75], scale2: [0.75, 1.0], scale3: [1.0, 1.25], scale4: [1.25, 1.5], scale5: [1.5, 3.0], unit: 'rasio', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 0.70], scale2: [0.70, 0.95], scale3: [0.95, 1.20], scale4: [1.20, 1.45], scale5: [1.45, 3.0], unit: 'rasio', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 0.40], scale2: [0.40, 0.55], scale3: [0.55, 0.70], scale4: [0.70, 0.90], scale5: [0.90, 2.0], unit: 'rasio', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 0.35], scale2: [0.35, 0.50], scale3: [0.50, 0.65], scale4: [0.65, 0.85], scale5: [0.85, 2.0], unit: 'rasio', higherIsBetter: true },
        ]
      },
      {
        id: 'squat-1rm-ratio',
        name: 'Back Squat 1RM (Rasio BB)',
        description: 'Tes kekuatan maksimal tungkai berdasarkan rasio berat badan. Nilai = 1RM / Berat Badan',
        procedure: '1. Pemanasan dengan beban ringan\n2. Squat penuh hingga paha paralel atau lebih rendah\n3. Tingkatkan beban hingga 1RM\n4. Hitung rasio: 1RM ÷ Berat Badan',
        equipment: ['Squat rack', 'Barbell', 'Plate beban'],
        reference: 'NSCA (2016). Essentials of Strength Training and Conditioning',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 1.0], scale2: [1.0, 1.5], scale3: [1.5, 1.75], scale4: [1.75, 2.0], scale5: [2.0, 4.0], unit: 'rasio', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 0.95], scale2: [0.95, 1.40], scale3: [1.40, 1.65], scale4: [1.65, 1.90], scale5: [1.90, 4.0], unit: 'rasio', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 0.65], scale2: [0.65, 1.0], scale3: [1.0, 1.25], scale4: [1.25, 1.50], scale5: [1.50, 3.0], unit: 'rasio', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 0.60], scale2: [0.60, 0.90], scale3: [0.90, 1.15], scale4: [1.15, 1.40], scale5: [1.40, 3.0], unit: 'rasio', higherIsBetter: true },
        ]
      },
      {
        id: 'deadlift-1rm-ratio',
        name: 'Deadlift 1RM (Rasio BB)',
        description: 'Tes kekuatan total tubuh berdasarkan rasio berat badan. Nilai = 1RM / Berat Badan',
        procedure: '1. Pemanasan dengan beban ringan\n2. Angkat barbell dari lantai dengan teknik yang benar\n3. Tingkatkan beban hingga 1RM\n4. Hitung rasio: 1RM ÷ Berat Badan',
        equipment: ['Barbell', 'Plate beban', 'Platform deadlift'],
        reference: 'Rippetoe, M. (2011). Starting Strength: Basic Barbell Training',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 1.25], scale2: [1.25, 1.75], scale3: [1.75, 2.0], scale4: [2.0, 2.5], scale5: [2.5, 4.5], unit: 'rasio', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 1.20], scale2: [1.20, 1.65], scale3: [1.65, 1.90], scale4: [1.90, 2.40], scale5: [2.40, 4.5], unit: 'rasio', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 0.80], scale2: [0.80, 1.25], scale3: [1.25, 1.50], scale4: [1.50, 1.75], scale5: [1.75, 3.5], unit: 'rasio', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 0.75], scale2: [0.75, 1.15], scale3: [1.15, 1.40], scale4: [1.40, 1.65], scale5: [1.65, 3.5], unit: 'rasio', higherIsBetter: true },
        ]
      },
      {
        id: 'overhead-press-1rm-ratio',
        name: 'Overhead Press 1RM (Rasio BB)',
        description: 'Tes kekuatan bahu berdasarkan rasio berat badan. Nilai = 1RM / Berat Badan',
        procedure: '1. Berdiri dengan barbell di depan bahu\n2. Tekan ke atas hingga tangan lurus\n3. Tingkatkan beban hingga 1RM\n4. Hitung rasio: 1RM ÷ Berat Badan',
        equipment: ['Barbell', 'Plate beban'],
        reference: 'Rippetoe, M. (2011). Starting Strength: Basic Barbell Training',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 0.45], scale2: [0.45, 0.60], scale3: [0.60, 0.75], scale4: [0.75, 0.90], scale5: [0.90, 2.0], unit: 'rasio', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 0.40], scale2: [0.40, 0.55], scale3: [0.55, 0.70], scale4: [0.70, 0.85], scale5: [0.85, 2.0], unit: 'rasio', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 0.30], scale2: [0.30, 0.40], scale3: [0.40, 0.50], scale4: [0.50, 0.65], scale5: [0.65, 1.5], unit: 'rasio', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 0.25], scale2: [0.25, 0.35], scale3: [0.35, 0.45], scale4: [0.45, 0.60], scale5: [0.60, 1.5], unit: 'rasio', higherIsBetter: true },
        ]
      },
    ]
  },
  {
    id: 'speed',
    name: 'Kecepatan',
    description: 'Kemampuan melakukan gerakan dalam waktu sesingkat-singkatnya',
    icon: 'Zap',
    color: 'speed',
    tests: [
      {
        id: 'sprint-30m',
        name: 'Sprint 30 Meter',
        description: 'Tes kecepatan lari jarak pendek',
        procedure: '1. Start berdiri\n2. Lari secepat mungkin 30 meter\n3. Catat waktu tempuh',
        equipment: ['Lintasan 30 meter', 'Stopwatch/timing gate'],
        reference: 'Haugen, T. & Buchheit, M. (2016). Sprint running performance monitoring',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [6.0, 5.2], scale2: [5.2, 4.6], scale3: [4.6, 4.2], scale4: [4.2, 3.8], scale5: [3.8, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [20, 35], scale1: [6.2, 5.4], scale2: [5.4, 4.8], scale3: [4.8, 4.4], scale4: [4.4, 4.0], scale5: [4.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [13, 19], scale1: [7.0, 6.0], scale2: [6.0, 5.4], scale3: [5.4, 4.9], scale4: [4.9, 4.5], scale5: [4.5, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [20, 35], scale1: [7.2, 6.2], scale2: [6.2, 5.6], scale3: [5.6, 5.1], scale4: [5.1, 4.7], scale5: [4.7, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
      {
        id: 'sprint-60m',
        name: 'Sprint 60 Meter',
        description: 'Tes kecepatan lari jarak menengah-pendek',
        procedure: '1. Start jongkok atau berdiri\n2. Lari secepat mungkin 60 meter\n3. Catat waktu tempuh',
        equipment: ['Lintasan 60 meter', 'Stopwatch'],
        reference: 'Bompa, T.O. (2009). Periodization: Theory and Methodology of Training',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [10.0, 9.0], scale2: [9.0, 8.2], scale3: [8.2, 7.6], scale4: [7.6, 7.0], scale5: [7.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [20, 35], scale1: [10.5, 9.5], scale2: [9.5, 8.6], scale3: [8.6, 8.0], scale4: [8.0, 7.4], scale5: [7.4, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [13, 19], scale1: [12.0, 10.5], scale2: [10.5, 9.5], scale3: [9.5, 8.8], scale4: [8.8, 8.2], scale5: [8.2, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [20, 35], scale1: [12.5, 11.0], scale2: [11.0, 10.0], scale3: [10.0, 9.2], scale4: [9.2, 8.6], scale5: [8.6, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
      {
        id: 'reaction-time',
        name: 'Reaction Time Test',
        description: 'Tes kecepatan reaksi terhadap stimulus',
        procedure: '1. Siap menerima stimulus visual/audio\n2. Respon secepat mungkin saat stimulus muncul\n3. Catat waktu reaksi rata-rata dari 5 percobaan',
        equipment: ['Reaction time apparatus', 'Komputer dengan software khusus'],
        reference: 'Magill, R.A. (2011). Motor Learning and Control',
        norms: [
          { gender: 'male', ageRange: [15, 30], scale1: [400, 300], scale2: [300, 250], scale3: [250, 200], scale4: [200, 160], scale5: [160, 0], unit: 'ms', higherIsBetter: false },
          { gender: 'male', ageRange: [31, 50], scale1: [450, 350], scale2: [350, 280], scale3: [280, 230], scale4: [230, 180], scale5: [180, 0], unit: 'ms', higherIsBetter: false },
          { gender: 'female', ageRange: [15, 30], scale1: [450, 340], scale2: [340, 280], scale3: [280, 230], scale4: [230, 180], scale5: [180, 0], unit: 'ms', higherIsBetter: false },
          { gender: 'female', ageRange: [31, 50], scale1: [500, 380], scale2: [380, 310], scale3: [310, 260], scale4: [260, 210], scale5: [210, 0], unit: 'ms', higherIsBetter: false },
        ]
      },
      {
        id: 'flying-start-20m',
        name: 'Flying Start 20 Meter',
        description: 'Tes kecepatan maksimal dengan awalan berlari',
        procedure: '1. Awalan lari 10-15 meter\n2. Catat waktu 20 meter dalam kecepatan maksimal',
        equipment: ['Lintasan dengan zona timing', 'Timing gate/Stopwatch'],
        reference: 'Little, T. & Williams, A.G. (2005). Specificity of acceleration and maximum speed',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [3.5, 3.0], scale2: [3.0, 2.7], scale3: [2.7, 2.4], scale4: [2.4, 2.2], scale5: [2.2, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [26, 40], scale1: [3.7, 3.2], scale2: [3.2, 2.9], scale3: [2.9, 2.6], scale4: [2.6, 2.4], scale5: [2.4, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [15, 25], scale1: [4.0, 3.5], scale2: [3.5, 3.1], scale3: [3.1, 2.8], scale4: [2.8, 2.5], scale5: [2.5, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [26, 40], scale1: [4.2, 3.7], scale2: [3.7, 3.3], scale3: [3.3, 3.0], scale4: [3.0, 2.7], scale5: [2.7, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
      {
        id: 'sprint-100m',
        name: 'Sprint 100 Meter',
        description: 'Tes kecepatan klasik jarak pendek',
        procedure: '1. Start jongkok dengan blok start\n2. Lari secepat mungkin 100 meter\n3. Catat waktu tempuh',
        equipment: ['Lintasan 100 meter', 'Blok start', 'Stopwatch/timing system'],
        reference: 'IAAF (2019). Competition Rules',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [15.0, 13.5], scale2: [13.5, 12.5], scale3: [12.5, 11.5], scale4: [11.5, 10.8], scale5: [10.8, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [26, 40], scale1: [16.0, 14.5], scale2: [14.5, 13.0], scale3: [13.0, 12.0], scale4: [12.0, 11.3], scale5: [11.3, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [15, 25], scale1: [17.5, 15.5], scale2: [15.5, 14.0], scale3: [14.0, 13.0], scale4: [13.0, 12.2], scale5: [12.2, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [26, 40], scale1: [18.5, 16.5], scale2: [16.5, 15.0], scale3: [15.0, 14.0], scale4: [14.0, 13.2], scale5: [13.2, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
    ]
  },
  {
    id: 'agility',
    name: 'Kelincahan',
    description: 'Kemampuan mengubah arah dengan cepat dan tepat tanpa kehilangan keseimbangan',
    icon: 'RotateCcw',
    color: 'agility',
    tests: [
      {
        id: 'illinois-agility',
        name: 'Illinois Agility Test',
        description: 'Tes kelincahan dengan lari zig-zag dan memutar',
        procedure: '1. Start telungkup\n2. Lari mengikuti pola zig-zag\n3. Finish di ujung lintasan\n4. Catat waktu tempuh',
        equipment: ['8 cone', 'Lintasan 10x5 meter', 'Stopwatch'],
        reference: 'Getchell, B. (1979). Physical Fitness: A Way of Life',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [20.0, 17.5], scale2: [17.5, 16.0], scale3: [16.0, 15.0], scale4: [15.0, 14.0], scale5: [14.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [20, 35], scale1: [21.0, 18.5], scale2: [18.5, 17.0], scale3: [17.0, 15.5], scale4: [15.5, 14.5], scale5: [14.5, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [13, 19], scale1: [23.0, 20.0], scale2: [20.0, 18.5], scale3: [18.5, 17.0], scale4: [17.0, 16.0], scale5: [16.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [20, 35], scale1: [24.0, 21.0], scale2: [21.0, 19.5], scale3: [19.5, 18.0], scale4: [18.0, 17.0], scale5: [17.0, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
      {
        id: 't-test',
        name: 'T-Test Agility',
        description: 'Tes kelincahan dengan pola huruf T',
        procedure: '1. Start di cone A\n2. Sprint ke cone B (10m)\n3. Shuffle ke kiri ke C (5m)\n4. Shuffle ke kanan ke D (10m)\n5. Shuffle ke B, lalu mundur ke A',
        equipment: ['4 cone', 'Stopwatch'],
        reference: 'Pauole, K. et al. (2000). Reliability and validity of the T-test',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [13.0, 11.5], scale2: [11.5, 10.5], scale3: [10.5, 9.5], scale4: [9.5, 9.0], scale5: [9.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [20, 35], scale1: [14.0, 12.0], scale2: [12.0, 11.0], scale3: [11.0, 10.0], scale4: [10.0, 9.5], scale5: [9.5, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [13, 19], scale1: [14.5, 12.5], scale2: [12.5, 11.5], scale3: [11.5, 10.8], scale4: [10.8, 10.2], scale5: [10.2, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [20, 35], scale1: [15.5, 13.5], scale2: [13.5, 12.5], scale3: [12.5, 11.5], scale4: [11.5, 11.0], scale5: [11.0, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
      {
        id: 'hexagon-test',
        name: 'Hexagon Agility Test',
        description: 'Tes kelincahan dengan melompat keluar-masuk hexagon',
        procedure: '1. Berdiri di tengah hexagon\n2. Melompat keluar-masuk setiap sisi hexagon\n3. 3 putaran searah jarum jam\n4. Catat waktu total',
        equipment: ['Hexagon tape (66cm per sisi)', 'Stopwatch'],
        reference: 'Beekhuizen, K.S. et al. (2009). Test-retest reliability and minimal detectable change',
        norms: [
          { gender: 'male', ageRange: [13, 25], scale1: [18.0, 15.0], scale2: [15.0, 13.0], scale3: [13.0, 11.5], scale4: [11.5, 10.0], scale5: [10.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [26, 40], scale1: [20.0, 17.0], scale2: [17.0, 14.5], scale3: [14.5, 12.5], scale4: [12.5, 11.0], scale5: [11.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [13, 25], scale1: [20.0, 17.0], scale2: [17.0, 14.5], scale3: [14.5, 12.5], scale4: [12.5, 11.0], scale5: [11.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [26, 40], scale1: [22.0, 19.0], scale2: [19.0, 16.5], scale3: [16.5, 14.0], scale4: [14.0, 12.5], scale5: [12.5, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
      {
        id: 'shuttle-run',
        name: 'Shuttle Run 4x10 Meter',
        description: 'Tes lari bolak-balik dengan memindahkan balok',
        procedure: '1. Start di garis start\n2. Lari ke garis 10m, ambil balok\n3. Kembali, letakkan balok\n4. Ulangi untuk balok kedua',
        equipment: ['2 balok kayu', 'Lintasan 10 meter', 'Stopwatch'],
        reference: 'TKJI (Tes Kesegaran Jasmani Indonesia)',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [13.0, 11.5], scale2: [11.5, 10.5], scale3: [10.5, 9.8], scale4: [9.8, 9.0], scale5: [9.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [20, 35], scale1: [13.5, 12.0], scale2: [12.0, 11.0], scale3: [11.0, 10.2], scale4: [10.2, 9.5], scale5: [9.5, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [13, 19], scale1: [14.5, 12.8], scale2: [12.8, 11.8], scale3: [11.8, 11.0], scale4: [11.0, 10.2], scale5: [10.2, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [20, 35], scale1: [15.0, 13.5], scale2: [13.5, 12.3], scale3: [12.3, 11.5], scale4: [11.5, 10.8], scale5: [10.8, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
      {
        id: 'pro-agility',
        name: 'Pro Agility (5-10-5)',
        description: 'Tes kelincahan standar NFL untuk perubahan arah',
        procedure: '1. Start di garis tengah\n2. Sprint 5 yard ke kanan\n3. Sprint 10 yard ke kiri\n4. Sprint 5 yard kembali ke tengah',
        equipment: ['3 cone', 'Stopwatch'],
        reference: 'Hoffman, J. (2006). Norms for Fitness, Performance, and Health',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [5.5, 5.0], scale2: [5.0, 4.6], scale3: [4.6, 4.3], scale4: [4.3, 4.0], scale5: [4.0, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'male', ageRange: [26, 40], scale1: [6.0, 5.4], scale2: [5.4, 5.0], scale3: [5.0, 4.6], scale4: [4.6, 4.3], scale5: [4.3, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [15, 25], scale1: [6.2, 5.6], scale2: [5.6, 5.2], scale3: [5.2, 4.8], scale4: [4.8, 4.5], scale5: [4.5, 0], unit: 'detik', higherIsBetter: false },
          { gender: 'female', ageRange: [26, 40], scale1: [6.7, 6.0], scale2: [6.0, 5.5], scale3: [5.5, 5.1], scale4: [5.1, 4.8], scale5: [4.8, 0], unit: 'detik', higherIsBetter: false },
        ]
      },
    ]
  },
  {
    id: 'flexibility',
    name: 'Fleksibilitas',
    description: 'Kemampuan sendi untuk bergerak dalam rentang gerak maksimal',
    icon: 'Maximize2',
    color: 'flexibility',
    tests: [
      {
        id: 'sit-reach',
        name: 'Sit and Reach Test',
        description: 'Tes fleksibilitas hamstring dan punggung bawah',
        procedure: '1. Duduk dengan kaki lurus\n2. Raih ke depan sejauh mungkin\n3. Tahan posisi 2 detik\n4. Catat jarak terjauh',
        equipment: ['Sit and reach box'],
        reference: 'Wells, K.F. & Dillon, E.K. (1952). The sit and reach test',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [-15, 0], scale2: [0, 10], scale3: [10, 20], scale4: [20, 30], scale5: [30, 50], unit: 'cm', higherIsBetter: true },
          { gender: 'male', ageRange: [20, 35], scale1: [-20, -5], scale2: [-5, 5], scale3: [5, 15], scale4: [15, 25], scale5: [25, 50], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 19], scale1: [-10, 5], scale2: [5, 15], scale3: [15, 25], scale4: [25, 35], scale5: [35, 55], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [20, 35], scale1: [-15, 0], scale2: [0, 10], scale3: [10, 20], scale4: [20, 30], scale5: [30, 55], unit: 'cm', higherIsBetter: true },
        ]
      },
      {
        id: 'shoulder-flexibility',
        name: 'Shoulder Flexibility Test',
        description: 'Tes fleksibilitas bahu dengan metode Apley scratch',
        procedure: '1. Tangan kanan lewat atas bahu\n2. Tangan kiri lewat bawah\n3. Coba sentuhkan kedua tangan\n4. Ukur jarak antara jari',
        equipment: ['Pita ukur'],
        reference: 'Hoppenfeld, S. (1976). Physical Examination of the Spine and Extremities',
        norms: [
          { gender: 'male', ageRange: [13, 30], scale1: [-15, -8], scale2: [-8, -2], scale3: [-2, 3], scale4: [3, 8], scale5: [8, 20], unit: 'cm', higherIsBetter: true },
          { gender: 'male', ageRange: [31, 50], scale1: [-20, -12], scale2: [-12, -5], scale3: [-5, 0], scale4: [0, 5], scale5: [5, 20], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 30], scale1: [-10, -3], scale2: [-3, 2], scale3: [2, 7], scale4: [7, 12], scale5: [12, 25], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [31, 50], scale1: [-15, -7], scale2: [-7, 0], scale3: [0, 5], scale4: [5, 10], scale5: [10, 25], unit: 'cm', higherIsBetter: true },
        ]
      },
      {
        id: 'trunk-rotation',
        name: 'Trunk Rotation Test',
        description: 'Tes fleksibilitas rotasi batang tubuh',
        procedure: '1. Duduk dengan kaki lurus\n2. Pegang tongkat di belakang bahu\n3. Rotasi tubuh ke satu sisi\n4. Ukur sudut rotasi',
        equipment: ['Tongkat', 'Goniometer'],
        reference: 'Johnson, B.L. & Nelson, J.K. (1986). Practical Measurements',
        norms: [
          { gender: 'male', ageRange: [15, 30], scale1: [0, 25], scale2: [25, 35], scale3: [35, 45], scale4: [45, 55], scale5: [55, 90], unit: 'derajat', higherIsBetter: true },
          { gender: 'male', ageRange: [31, 50], scale1: [0, 20], scale2: [20, 30], scale3: [30, 40], scale4: [40, 50], scale5: [50, 90], unit: 'derajat', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 30], scale1: [0, 28], scale2: [28, 38], scale3: [38, 48], scale4: [48, 58], scale5: [58, 90], unit: 'derajat', higherIsBetter: true },
          { gender: 'female', ageRange: [31, 50], scale1: [0, 23], scale2: [23, 33], scale3: [33, 43], scale4: [43, 53], scale5: [53, 90], unit: 'derajat', higherIsBetter: true },
        ]
      },
      {
        id: 'groin-flexibility',
        name: 'Groin Flexibility Test',
        description: 'Tes fleksibilitas otot adduktor paha',
        procedure: '1. Duduk, telapak kaki saling menempel\n2. Biarkan lutut turun ke samping\n3. Ukur jarak lutut ke lantai',
        equipment: ['Pita ukur'],
        reference: 'Alter, M.J. (2004). Science of Flexibility',
        norms: [
          { gender: 'male', ageRange: [15, 30], scale1: [25, 18], scale2: [18, 12], scale3: [12, 8], scale4: [8, 4], scale5: [4, 0], unit: 'cm', higherIsBetter: false },
          { gender: 'male', ageRange: [31, 50], scale1: [30, 22], scale2: [22, 16], scale3: [16, 10], scale4: [10, 6], scale5: [6, 0], unit: 'cm', higherIsBetter: false },
          { gender: 'female', ageRange: [15, 30], scale1: [20, 14], scale2: [14, 9], scale3: [9, 5], scale4: [5, 2], scale5: [2, 0], unit: 'cm', higherIsBetter: false },
          { gender: 'female', ageRange: [31, 50], scale1: [25, 18], scale2: [18, 12], scale3: [12, 7], scale4: [7, 3], scale5: [3, 0], unit: 'cm', higherIsBetter: false },
        ]
      },
      {
        id: 'hip-flexor',
        name: 'Thomas Test (Hip Flexor)',
        description: 'Tes fleksibilitas hip flexor',
        procedure: '1. Berbaring di ujung meja\n2. Tarik satu lutut ke dada\n3. Biarkan kaki lain menggantung\n4. Ukur posisi paha terhadap horizontal',
        equipment: ['Meja/bangku', 'Goniometer'],
        reference: 'Kendall, F.P. et al. (2005). Muscles: Testing and Function',
        norms: [
          { gender: 'male', ageRange: [15, 35], scale1: [20, 12], scale2: [12, 6], scale3: [6, 0], scale4: [0, -5], scale5: [-5, -15], unit: 'derajat', higherIsBetter: false },
          { gender: 'male', ageRange: [36, 55], scale1: [25, 17], scale2: [17, 10], scale3: [10, 4], scale4: [4, -2], scale5: [-2, -15], unit: 'derajat', higherIsBetter: false },
          { gender: 'female', ageRange: [15, 35], scale1: [15, 8], scale2: [8, 3], scale3: [3, -2], scale4: [-2, -7], scale5: [-7, -15], unit: 'derajat', higherIsBetter: false },
          { gender: 'female', ageRange: [36, 55], scale1: [20, 12], scale2: [12, 6], scale3: [6, 0], scale4: [0, -5], scale5: [-5, -15], unit: 'derajat', higherIsBetter: false },
        ]
      },
    ]
  },
  {
    id: 'balance',
    name: 'Keseimbangan',
    description: 'Kemampuan mempertahankan posisi tubuh stabil dalam berbagai kondisi',
    icon: 'Scale',
    color: 'balance',
    tests: [
      {
        id: 'stork-stand',
        name: 'Stork Stand Balance Test',
        description: 'Tes keseimbangan statis dengan berdiri satu kaki',
        procedure: '1. Berdiri satu kaki, kaki lain di lutut\n2. Angkat tumit dari lantai\n3. Tahan posisi selama mungkin\n4. Catat waktu bertahan',
        equipment: ['Stopwatch'],
        reference: 'Johnson, B.L. & Nelson, J.K. (1986). Practical Measurements',
        norms: [
          { gender: 'male', ageRange: [13, 25], scale1: [0, 20], scale2: [20, 35], scale3: [35, 50], scale4: [50, 65], scale5: [65, 180], unit: 'detik', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 45], scale1: [0, 15], scale2: [15, 28], scale3: [28, 42], scale4: [42, 55], scale5: [55, 180], unit: 'detik', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 25], scale1: [0, 18], scale2: [18, 32], scale3: [32, 45], scale4: [45, 60], scale5: [60, 180], unit: 'detik', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 45], scale1: [0, 12], scale2: [12, 24], scale3: [24, 38], scale4: [38, 50], scale5: [50, 180], unit: 'detik', higherIsBetter: true },
        ]
      },
      {
        id: 'y-balance',
        name: 'Y Balance Test',
        description: 'Tes keseimbangan dinamis dengan jangkauan tiga arah',
        procedure: '1. Berdiri satu kaki di tengah\n2. Raih sejauh mungkin ke 3 arah (anterior, posteromedial, posterolateral)\n3. Catat jarak jangkauan rata-rata',
        equipment: ['Y Balance Test Kit atau tape marks'],
        reference: 'Plisky, P.J. et al. (2006). Star Excursion Balance Test',
        norms: [
          { gender: 'male', ageRange: [15, 30], scale1: [0, 75], scale2: [75, 85], scale3: [85, 95], scale4: [95, 105], scale5: [105, 130], unit: '% tinggi', higherIsBetter: true },
          { gender: 'male', ageRange: [31, 50], scale1: [0, 70], scale2: [70, 80], scale3: [80, 90], scale4: [90, 100], scale5: [100, 130], unit: '% tinggi', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 30], scale1: [0, 78], scale2: [78, 88], scale3: [88, 98], scale4: [98, 108], scale5: [108, 135], unit: '% tinggi', higherIsBetter: true },
          { gender: 'female', ageRange: [31, 50], scale1: [0, 73], scale2: [73, 83], scale3: [83, 93], scale4: [93, 103], scale5: [103, 135], unit: '% tinggi', higherIsBetter: true },
        ]
      },
      {
        id: 'bass-test',
        name: 'Bass Test of Dynamic Balance',
        description: 'Tes keseimbangan dinamis dengan melompat ke target',
        procedure: '1. Lompat ke 10 target yang ditandai\n2. Tahan keseimbangan 5 detik di setiap target\n3. Skor berdasarkan keberhasilan landing dan waktu bertahan',
        equipment: ['10 target marks (2.5 x 2.5 cm)', 'Stopwatch'],
        reference: 'Bass, R.I. (1939). An analysis of the components of tests of semicircular canal function',
        norms: [
          { gender: 'male', ageRange: [13, 25], scale1: [0, 50], scale2: [50, 65], scale3: [65, 80], scale4: [80, 90], scale5: [90, 100], unit: 'poin', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 45], scale1: [0, 45], scale2: [45, 60], scale3: [60, 75], scale4: [75, 85], scale5: [85, 100], unit: 'poin', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 25], scale1: [0, 48], scale2: [48, 62], scale3: [62, 77], scale4: [77, 88], scale5: [88, 100], unit: 'poin', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 45], scale1: [0, 42], scale2: [42, 56], scale3: [56, 72], scale4: [72, 83], scale5: [83, 100], unit: 'poin', higherIsBetter: true },
        ]
      },
      {
        id: 'tandem-walk',
        name: 'Tandem Walk Test',
        description: 'Tes keseimbangan dengan berjalan tumit-ke-jari',
        procedure: '1. Berjalan dalam garis lurus\n2. Tumit menyentuh jari kaki depan\n3. Jarak 3 meter\n4. Hitung jumlah kesalahan',
        equipment: ['Garis/tape 3 meter'],
        reference: 'Fregly, A.R. (1974). Vestibular ataxia and its measurement in man',
        norms: [
          { gender: 'male', ageRange: [15, 35], scale1: [10, 6], scale2: [6, 4], scale3: [4, 2], scale4: [2, 1], scale5: [1, 0], unit: 'kesalahan', higherIsBetter: false },
          { gender: 'male', ageRange: [36, 55], scale1: [12, 8], scale2: [8, 5], scale3: [5, 3], scale4: [3, 1], scale5: [1, 0], unit: 'kesalahan', higherIsBetter: false },
          { gender: 'female', ageRange: [15, 35], scale1: [8, 5], scale2: [5, 3], scale3: [3, 2], scale4: [2, 1], scale5: [1, 0], unit: 'kesalahan', higherIsBetter: false },
          { gender: 'female', ageRange: [36, 55], scale1: [10, 7], scale2: [7, 4], scale3: [4, 2], scale4: [2, 1], scale5: [1, 0], unit: 'kesalahan', higherIsBetter: false },
        ]
      },
      {
        id: 'romberg-test',
        name: 'Romberg Test',
        description: 'Tes keseimbangan dengan mata tertutup',
        procedure: '1. Berdiri kaki rapat, tangan di samping\n2. Tutup mata\n3. Tahan posisi selama mungkin\n4. Catat waktu bertahan (maks 60 detik)',
        equipment: ['Stopwatch'],
        reference: 'Lanska, D.J. (2002). The Romberg sign and early instruments',
        norms: [
          { gender: 'male', ageRange: [15, 35], scale1: [0, 20], scale2: [20, 35], scale3: [35, 45], scale4: [45, 55], scale5: [55, 60], unit: 'detik', higherIsBetter: true },
          { gender: 'male', ageRange: [36, 55], scale1: [0, 15], scale2: [15, 28], scale3: [28, 40], scale4: [40, 50], scale5: [50, 60], unit: 'detik', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 35], scale1: [0, 22], scale2: [22, 36], scale3: [36, 47], scale4: [47, 55], scale5: [55, 60], unit: 'detik', higherIsBetter: true },
          { gender: 'female', ageRange: [36, 55], scale1: [0, 17], scale2: [17, 30], scale3: [30, 42], scale4: [42, 52], scale5: [52, 60], unit: 'detik', higherIsBetter: true },
        ]
      },
    ]
  },
  {
    id: 'power',
    name: 'Power',
    description: 'Kemampuan otot untuk menghasilkan gaya maksimal dalam waktu singkat',
    icon: 'Flame',
    color: 'power',
    tests: [
      {
        id: 'vertical-jump',
        name: 'Vertical Jump (Sargent Jump)',
        description: 'Tes power tungkai dengan lompatan vertikal',
        procedure: '1. Berdiri di samping dinding/papan\n2. Tandai titik jangkauan tertinggi\n3. Lompat setinggi mungkin\n4. Catat selisih tinggi',
        equipment: ['Vertec atau dinding dengan penanda', 'Kapur'],
        reference: 'Sargent, D.A. (1921). The Physical Test of a Man',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [0, 35], scale2: [35, 45], scale3: [45, 55], scale4: [55, 65], scale5: [65, 100], unit: 'cm', higherIsBetter: true },
          { gender: 'male', ageRange: [20, 35], scale1: [0, 40], scale2: [40, 50], scale3: [50, 60], scale4: [60, 70], scale5: [70, 100], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 19], scale1: [0, 25], scale2: [25, 33], scale3: [33, 41], scale4: [41, 50], scale5: [50, 80], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [20, 35], scale1: [0, 28], scale2: [28, 36], scale3: [36, 44], scale4: [44, 52], scale5: [52, 80], unit: 'cm', higherIsBetter: true },
        ]
      },
      {
        id: 'standing-broad-jump',
        name: 'Standing Broad Jump',
        description: 'Tes power tungkai dengan lompat jauh tanpa awalan',
        procedure: '1. Berdiri di belakang garis start\n2. Ayunkan lengan dan lompat sejauh mungkin\n3. Mendarat dengan kedua kaki\n4. Ukur jarak dari garis start ke tumit terdekat',
        equipment: ['Pita ukur', 'Matras pendaratan'],
        reference: 'Castro-Piñero, J. et al. (2010). Criterion-related validity of field-based fitness tests',
        norms: [
          { gender: 'male', ageRange: [13, 19], scale1: [0, 180], scale2: [180, 210], scale3: [210, 240], scale4: [240, 270], scale5: [270, 350], unit: 'cm', higherIsBetter: true },
          { gender: 'male', ageRange: [20, 35], scale1: [0, 200], scale2: [200, 230], scale3: [230, 260], scale4: [260, 290], scale5: [290, 350], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [13, 19], scale1: [0, 140], scale2: [140, 165], scale3: [165, 190], scale4: [190, 215], scale5: [215, 280], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [20, 35], scale1: [0, 150], scale2: [150, 175], scale3: [175, 200], scale4: [200, 225], scale5: [225, 280], unit: 'cm', higherIsBetter: true },
        ]
      },
      {
        id: 'medicine-ball-throw',
        name: 'Medicine Ball Throw',
        description: 'Tes power tubuh bagian atas dengan lempar bola medicine',
        procedure: '1. Duduk atau berdiri dengan bola medicine 3kg\n2. Lempar bola ke depan sejauh mungkin\n3. Catat jarak lemparan',
        equipment: ['Medicine ball 3kg', 'Pita ukur'],
        reference: 'Stockbrugger, B.A. & Haennel, R.G. (2001). Validity and reliability of a medicine ball explosive power test',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 450], scale2: [450, 550], scale3: [550, 650], scale4: [650, 750], scale5: [750, 1000], unit: 'cm', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 400], scale2: [400, 500], scale3: [500, 600], scale4: [600, 700], scale5: [700, 1000], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 300], scale2: [300, 380], scale3: [380, 460], scale4: [460, 540], scale5: [540, 750], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 270], scale2: [270, 350], scale3: [350, 430], scale4: [430, 510], scale5: [510, 750], unit: 'cm', higherIsBetter: true },
        ]
      },
      {
        id: 'triple-hop',
        name: 'Triple Hop Test',
        description: 'Tes power tungkai dengan tiga lompatan berturut-turut',
        procedure: '1. Berdiri satu kaki\n2. Lompat 3 kali berturut-turut dengan kaki yang sama\n3. Catat total jarak',
        equipment: ['Pita ukur'],
        reference: 'Noyes, F.R. et al. (1991). The drop jump screening test',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 500], scale2: [500, 580], scale3: [580, 660], scale4: [660, 740], scale5: [740, 900], unit: 'cm', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 470], scale2: [470, 550], scale3: [550, 630], scale4: [630, 710], scale5: [710, 900], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 380], scale2: [380, 450], scale3: [450, 520], scale4: [520, 590], scale5: [590, 750], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 350], scale2: [350, 420], scale3: [420, 490], scale4: [490, 560], scale5: [560, 750], unit: 'cm', higherIsBetter: true },
        ]
      },
      {
        id: 'countermovement-jump',
        name: 'Countermovement Jump (CMJ)',
        description: 'Tes power tungkai dengan lompatan countermovement',
        procedure: '1. Berdiri tegak\n2. Turun cepat ke posisi squat\n3. Lompat setinggi mungkin\n4. Ukur tinggi lompatan',
        equipment: ['Contact mat atau force platform', 'Jump analyzer'],
        reference: 'Bosco, C. et al. (1983). A simple method for measurement of mechanical power',
        norms: [
          { gender: 'male', ageRange: [15, 25], scale1: [0, 32], scale2: [32, 42], scale3: [42, 52], scale4: [52, 62], scale5: [62, 85], unit: 'cm', higherIsBetter: true },
          { gender: 'male', ageRange: [26, 40], scale1: [0, 28], scale2: [28, 38], scale3: [38, 48], scale4: [48, 58], scale5: [58, 85], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [15, 25], scale1: [0, 22], scale2: [22, 30], scale3: [30, 38], scale4: [38, 46], scale5: [46, 65], unit: 'cm', higherIsBetter: true },
          { gender: 'female', ageRange: [26, 40], scale1: [0, 18], scale2: [18, 26], scale3: [26, 34], scale4: [34, 42], scale5: [42, 65], unit: 'cm', higherIsBetter: true },
        ]
      },
      {
        id: 'wingate-test',
        name: 'Wingate Anaerobic Test',
        description: 'Tes power anaerobik pada cycle ergometer',
        procedure: '1. Pemanasan 5 menit\n2. Sprint maksimal 30 detik dengan beban tertentu\n3. Catat peak power dan mean power',
        equipment: ['Cycle ergometer dengan software Wingate'],
        reference: 'Bar-Or, O. (1987). The Wingate anaerobic test',
        norms: [
          { gender: 'male', ageRange: [18, 30], scale1: [0, 8], scale2: [8, 10], scale3: [10, 12], scale4: [12, 14], scale5: [14, 20], unit: 'W/kg', higherIsBetter: true },
          { gender: 'male', ageRange: [31, 50], scale1: [0, 7], scale2: [7, 9], scale3: [9, 11], scale4: [11, 13], scale5: [13, 20], unit: 'W/kg', higherIsBetter: true },
          { gender: 'female', ageRange: [18, 30], scale1: [0, 6], scale2: [6, 8], scale3: [8, 9.5], scale4: [9.5, 11], scale5: [11, 16], unit: 'W/kg', higherIsBetter: true },
          { gender: 'female', ageRange: [31, 50], scale1: [0, 5], scale2: [5, 7], scale3: [7, 8.5], scale4: [8.5, 10], scale5: [10, 16], unit: 'W/kg', higherIsBetter: true },
        ]
      },
    ]
  },
];

export const sportsList = [
  'Sepak Bola', 'Basket', 'Voli', 'Bulu Tangkis', 'Tenis', 'Renang',
  'Atletik', 'Senam', 'Taekwondo', 'Pencak Silat', 'Karate', 'Judo',
  'Tinju', 'Gulat', 'Angkat Besi', 'Balap Sepeda', 'Rowing', 'Panahan',
  'Golf', 'Futsal', 'Hoki', 'Rugby', 'Handball', 'Dayung', 'Menembak'
];

export function calculateScore(
  value: number, 
  test: TestItem, 
  gender: 'male' | 'female', 
  age: number
): number {
  const applicableNorm = test.norms.find(
    n => n.gender === gender && age >= n.ageRange[0] && age <= n.ageRange[1]
  );

  if (!applicableNorm) {
    // Find closest age range
    const sameGenderNorms = test.norms.filter(n => n.gender === gender);
    if (sameGenderNorms.length === 0) return 3;
    
    const closest = sameGenderNorms.reduce((prev, curr) => {
      const prevDist = Math.min(Math.abs(age - prev.ageRange[0]), Math.abs(age - prev.ageRange[1]));
      const currDist = Math.min(Math.abs(age - curr.ageRange[0]), Math.abs(age - curr.ageRange[1]));
      return currDist < prevDist ? curr : prev;
    });
    return calculateScoreWithNorm(value, closest);
  }

  return calculateScoreWithNorm(value, applicableNorm);
}

function calculateScoreWithNorm(value: number, norm: TestNorm): number {
  if (norm.higherIsBetter) {
    if (value >= norm.scale5[0]) return 5;
    if (value >= norm.scale4[0]) return 4;
    if (value >= norm.scale3[0]) return 3;
    if (value >= norm.scale2[0]) return 2;
    return 1;
  } else {
    if (value <= norm.scale5[0]) return 5;
    if (value <= norm.scale4[0]) return 4;
    if (value <= norm.scale3[0]) return 3;
    if (value <= norm.scale2[0]) return 2;
    return 1;
  }
}

export function getScoreLabel(score: number): string {
  switch(score) {
    case 5: return 'Sangat Baik';
    case 4: return 'Baik';
    case 3: return 'Sedang';
    case 2: return 'Kurang';
    case 1: return 'Sangat Kurang';
    default: return 'Tidak Diketahui';
  }
}

export function getScoreColor(score: number): string {
  switch(score) {
    case 5: return 'hsl(142, 70%, 45%)';
    case 4: return 'hsl(160, 70%, 45%)';
    case 3: return 'hsl(45, 90%, 50%)';
    case 2: return 'hsl(25, 90%, 55%)';
    case 1: return 'hsl(0, 72%, 55%)';
    default: return 'hsl(215, 15%, 55%)';
  }
}

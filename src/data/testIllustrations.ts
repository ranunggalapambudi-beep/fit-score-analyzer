// Test illustrations and video references
export interface TestIllustration {
  testId: string;
  steps: {
    step: number;
    description: string;
    imageUrl?: string;
    tips?: string;
  }[];
  videoUrl?: string;
  commonMistakes?: string[];
  safetyTips?: string[];
}

// Image mapping for tests that have illustration images
export const testImageMap: Record<string, string> = {};

// We'll populate this dynamically with imports
export const testIllustrations: TestIllustration[] = [
  // ========== ENDURANCE ==========
  {
    testId: 'cooper-test',
    steps: [
      { step: 1, description: 'Pemanasan dinamis selama 10 menit: jogging ringan, stretching dinamis, dan gerakan mobilitas', tips: 'Fokus pada otot-otot utama: paha, betis, dan pinggul' },
      { step: 2, description: 'Posisikan atlet di garis start lintasan atletik atau lapangan yang sudah diukur', tips: 'Gunakan cone atau penanda setiap 100 meter untuk memudahkan perhitungan' },
      { step: 3, description: 'Bunyikan peluit dan mulai stopwatch. Atlet berlari sejauh mungkin selama 12 menit', tips: 'Atlet boleh berjalan jika kelelahan, tapi dorong untuk tetap bergerak' },
      { step: 4, description: 'Setelah 12 menit, bunyikan peluit akhir. Catat posisi atlet dan hitung total jarak', tips: 'Minta atlet untuk cooling down dengan berjalan ringan' }
    ],
    commonMistakes: ['Memulai terlalu cepat dan kehabisan energi', 'Tidak melakukan pemanasan yang cukup', 'Berhenti total saat kelelahan'],
    safetyTips: ['Pastikan atlet dalam kondisi sehat', 'Sediakan air minum', 'Hentikan tes jika atlet menunjukkan tanda-tanda distress']
  },
  {
    testId: 'beep-test',
    steps: [
      { step: 1, description: 'Siapkan lapangan 20 meter dengan cone di kedua ujung', tips: 'Pastikan permukaan lapangan rata dan tidak licin' },
      { step: 2, description: 'Jelaskan aturan: atlet harus mencapai garis sebelum bunyi beep berikutnya', tips: 'Demonstrasikan teknik pivot yang benar di garis' },
      { step: 3, description: 'Putar audio beep test. Atlet memulai saat bunyi beep pertama', tips: 'Level awal cukup lambat, kecepatan meningkat setiap level' },
      { step: 4, description: 'Atlet dinyatakan gagal jika 2x berturut-turut tidak mencapai garis tepat waktu', tips: 'Catat level dan shuttle terakhir yang berhasil diselesaikan' }
    ],
    commonMistakes: ['Tidak menyentuh garis dengan kaki', 'Memulai berlari sebelum bunyi beep', 'Teknik pivot yang buruk membuang energi'],
    safetyTips: ['Gunakan alas kaki yang sesuai', 'Hindari tes di permukaan yang keras tanpa alas yang baik']
  },
  {
    testId: 'yo-yo-intermittent',
    steps: [
      { step: 1, description: 'Siapkan lapangan 20 meter dengan zona istirahat 5 meter di belakang garis start', tips: 'Tandai garis start, garis 20m, dan zona istirahat' },
      { step: 2, description: 'Atlet berlari 2x20 meter (bolak-balik) mengikuti irama beep', tips: 'Pastikan audio terdengar jelas di seluruh area tes' },
      { step: 3, description: 'Setelah setiap shuttle, atlet istirahat aktif 10 detik di zona recovery', tips: 'Atlet harus kembali ke garis start sebelum beep berikutnya' },
      { step: 4, description: 'Catat level dan shuttle terakhir. Tes berakhir jika gagal 2x berturut-turut', tips: 'Konversi level ke jarak total menggunakan tabel referensi' }
    ],
    commonMistakes: ['Tidak memanfaatkan waktu recovery dengan baik', 'Berlari terlalu cepat di level awal', 'Tidak menyentuh garis saat berbalik'],
    safetyTips: ['Pastikan hidrasi yang cukup sebelum tes', 'Lakukan pemanasan menyeluruh', 'Monitor tanda-tanda kelelahan berlebih']
  },
  {
    testId: 'harvard-step',
    steps: [
      { step: 1, description: 'Siapkan bangku setinggi 45cm dan metronom dengan kecepatan 120 BPM (30 step/menit)', tips: 'Pastikan bangku stabil dan tidak bergeser' },
      { step: 2, description: 'Atlet naik turun bangku mengikuti irama metronom selama 5 menit', tips: 'Pola: kaki kanan naik - kaki kiri naik - kaki kanan turun - kaki kiri turun' },
      { step: 3, description: 'Setelah 5 menit, atlet duduk. Ukur denyut nadi pada menit 1-1.5, 2-2.5, dan 3-3.5', tips: 'Gunakan pulse oximeter atau hitung manual di pergelangan tangan' },
      { step: 4, description: 'Hitung indeks: Durasi(detik) x 100 / (2 x jumlah 3 pengukuran nadi)', tips: 'Semakin tinggi indeks, semakin baik kebugaran kardiovaskular' }
    ],
    commonMistakes: ['Tidak mengikuti irama metronom', 'Lutut tidak lurus penuh saat di atas bangku', 'Berhenti sebelum 5 menit tanpa alasan medis'],
    safetyTips: ['Pastikan bangku anti-slip', 'Siapkan penopang jika atlet kehilangan keseimbangan', 'Hentikan jika atlet merasa pusing']
  },
  {
    testId: 'mft-1600',
    steps: [
      { step: 1, description: 'Pemanasan 10-15 menit dengan jogging ringan dan stretching dinamis', tips: 'Fokus pada pemanasan kaki dan pernapasan' },
      { step: 2, description: 'Atlet bersiap di garis start lintasan atletik 400 meter (4 putaran)', tips: 'Gunakan start berdiri, bukan start jongkok' },
      { step: 3, description: 'Aba-aba start, atlet berlari 1600 meter secepat mungkin', tips: 'Strategi pacing penting: jangan terlalu cepat di awal' },
      { step: 4, description: 'Catat waktu saat melewati garis finish. Cooling down 5 menit', tips: 'Berikan informasi waktu di setiap putaran' }
    ],
    commonMistakes: ['Pacing yang buruk (terlalu cepat di awal)', 'Tidak melakukan pemanasan', 'Berhenti mendadak setelah finish'],
    safetyTips: ['Pastikan atlet terhidrasi', 'Jangan lakukan di cuaca sangat panas', 'Siapkan pertolongan pertama']
  },

  // ========== STRENGTH ==========
  {
    testId: 'push-up',
    steps: [
      { step: 1, description: 'Posisi awal: telungkup dengan tangan di samping dada, sedikit lebih lebar dari bahu', tips: 'Jari-jari menghadap ke depan, siku mengarah ke samping-belakang' },
      { step: 2, description: 'Angkat badan dengan meluruskan tangan, tubuh membentuk garis lurus dari kepala hingga tumit', tips: 'Jaga core tetap engaged, jangan biarkan pinggul turun atau naik' },
      { step: 3, description: 'Turunkan badan dengan menekuk siku hingga dada hampir menyentuh lantai (sekitar 5cm)', tips: 'Kontrol gerakan turun, jangan jatuhkan tubuh' },
      { step: 4, description: 'Hitung repetisi yang benar sampai atlet tidak mampu melanjutkan dengan teknik yang benar', tips: 'Repetisi tidak dihitung jika teknik tidak benar' }
    ],
    commonMistakes: ['Pinggul terlalu tinggi atau terlalu rendah', 'Tidak turun cukup dalam', 'Kepala menunduk atau mendongak', 'Gerakan terlalu cepat tanpa kontrol'],
    safetyTips: ['Pemanasan pergelangan tangan sebelum tes', 'Gunakan matras untuk kenyamanan']
  },
  {
    testId: 'sit-up',
    steps: [
      { step: 1, description: 'Posisi awal: berbaring telentang, lutut ditekuk 90 derajat, kaki rata di lantai', tips: 'Partner dapat menahan kaki atau gunakan penahan' },
      { step: 2, description: 'Tangan diletakkan di belakang kepala atau menyilang di dada', tips: 'Jangan menarik kepala dengan tangan jika posisi di belakang kepala' },
      { step: 3, description: 'Angkat tubuh dengan mengkontraksikan otot perut hingga siku menyentuh lutut', tips: 'Hembuskan nafas saat naik, tarik nafas saat turun' },
      { step: 4, description: 'Hitung repetisi dalam 60 detik. Hanya hitung repetisi dengan teknik yang benar', tips: 'Punggung harus menyentuh lantai sepenuhnya sebelum repetisi berikutnya' }
    ],
    commonMistakes: ['Menggunakan momentum, bukan kekuatan otot perut', 'Menarik leher dengan tangan', 'Tidak menyentuh lantai dengan punggung bawah'],
    safetyTips: ['Hindari jika ada masalah punggung bawah', 'Gunakan matras untuk kenyamanan']
  },
  {
    testId: 'pull-up',
    steps: [
      { step: 1, description: 'Pegang palang dengan pegangan overhand (telapak menghadap depan), tangan selebar bahu', tips: 'Pastikan palang cukup tinggi agar kaki tidak menyentuh lantai' },
      { step: 2, description: 'Bergantung dengan lengan lurus sepenuhnya (posisi dead hang)', tips: 'Scapula dalam posisi netral, bahu tidak mengangkat ke telinga' },
      { step: 3, description: 'Tarik tubuh ke atas hingga dagu melewati palang, siku menekuk penuh', tips: 'Inisiasi gerakan dengan menarik skapula ke bawah' },
      { step: 4, description: 'Turunkan tubuh dengan kontrol hingga lengan lurus kembali. Hitung repetisi maksimal', tips: 'Setiap repetisi harus dimulai dari posisi lengan lurus penuh' }
    ],
    commonMistakes: ['Menggunakan kipping atau ayunan', 'Tidak naik cukup tinggi (dagu tidak melewati palang)', 'Tidak turun sepenuhnya ke posisi dead hang'],
    safetyTips: ['Periksa kestabilan palang sebelum tes', 'Siapkan matras di bawah sebagai pengaman']
  },
  {
    testId: 'back-lift',
    steps: [
      { step: 1, description: 'Berdiri di atas platform back lift dynamometer dengan kedua kaki', tips: 'Pastikan kaki berada di tengah platform untuk keseimbangan optimal' },
      { step: 2, description: 'Tekuk lutut sedikit (sekitar 15-20 derajat), punggung tetap lurus', tips: 'Jangan membungkuk, jaga postur tegak' },
      { step: 3, description: 'Pegang pegangan dynamometer dengan kedua tangan, lengan lurus', tips: 'Pegangan harus setinggi lutut saat posisi siap' },
      { step: 4, description: 'Tarik pegangan ke atas dengan menggunakan kekuatan otot punggung secara maksimal', tips: 'Lakukan 3 kali percobaan dengan istirahat 30 detik, ambil nilai tertinggi' }
    ],
    commonMistakes: ['Menggunakan kekuatan lengan bukan punggung', 'Punggung membungkuk saat menarik', 'Lutut terlalu lurus atau terlalu ditekuk'],
    safetyTips: ['Pemanasan punggung dan hamstring sebelum tes', 'Hentikan jika terasa nyeri pada punggung bawah', 'Tidak dianjurkan untuk atlet dengan riwayat cedera punggung']
  },
  {
    testId: 'leg-dynamometer',
    steps: [
      { step: 1, description: 'Berdiri di atas platform leg dynamometer dengan kedua kaki', tips: 'Kaki selebar bahu untuk keseimbangan optimal' },
      { step: 2, description: 'Tekuk lutut sekitar 115-125 derajat, punggung tetap lurus dan tegak', tips: 'Sudut lutut sangat penting untuk mengukur kekuatan tungkai dengan akurat' },
      { step: 3, description: 'Pegang pegangan dynamometer dengan kedua tangan, pandangan ke depan', tips: 'Sesuaikan panjang rantai agar posisi nyaman' },
      { step: 4, description: 'Dorong ke atas dengan kekuatan tungkai, bukan punggung. Lakukan 3 percobaan', tips: 'Fokus pada kontraksi otot paha dan betis' }
    ],
    commonMistakes: ['Menggunakan kekuatan punggung bukan tungkai', 'Sudut lutut tidak tepat (terlalu terbuka atau tertutup)', 'Mengangkat tumit dari platform'],
    safetyTips: ['Pemanasan tungkai sebelum tes', 'Pastikan platform stabil', 'Tidak dianjurkan untuk atlet dengan cedera lutut']
  },
  {
    testId: 'arm-dynamometer',
    steps: [
      { step: 1, description: 'Duduk di kursi dengan punggung tegak atau berdiri dengan posisi stabil', tips: 'Pilih posisi sesuai protokol yang digunakan' },
      { step: 2, description: 'Pegang pegangan arm dynamometer dengan tangan yang akan diuji', tips: 'Biasanya dimulai dengan lengan dominan' },
      { step: 3, description: 'Posisikan lengan sesuai protokol: lurus ke depan atau ditekuk 90 derajat', tips: 'Konsistensi posisi penting untuk perbandingan hasil' },
      { step: 4, description: 'Tarik atau tekan pegangan dengan kekuatan maksimal lengan', tips: 'Lakukan 3 percobaan per lengan dengan istirahat 30 detik' }
    ],
    commonMistakes: ['Menggerakkan badan untuk membantu menarik', 'Posisi lengan berubah-ubah antar percobaan', 'Tidak memberikan usaha maksimal'],
    safetyTips: ['Pemanasan lengan dan bahu sebelum tes', 'Hindari jika ada cedera bahu atau siku']
  },
  {
    testId: 'grip-strength',
    steps: [
      { step: 1, description: 'Berdiri tegak dengan lengan di samping tubuh, tidak menyentuh paha', tips: 'Posisi berdiri standar dengan kaki selebar bahu' },
      { step: 2, description: 'Pegang hand grip dynamometer dengan tangan yang diuji', tips: 'Sesuaikan ukuran grip agar nyaman di tangan' },
      { step: 3, description: 'Genggam dynamometer dengan kekuatan maksimal selama 3-5 detik', tips: 'Jangan mengayun tangan atau menggerakkan badan' },
      { step: 4, description: 'Catat nilai, istirahat 30 detik, ulangi 3 kali. Ambil nilai tertinggi', tips: 'Uji kedua tangan untuk perbandingan' }
    ],
    commonMistakes: ['Menggerakkan lengan saat menggenggam', 'Tidak memberikan usaha maksimal', 'Posisi grip yang tidak konsisten'],
    safetyTips: ['Hindari jika ada cedera tangan atau pergelangan', 'Hentikan jika terasa nyeri']
  },
  {
    testId: 'leg-press',
    steps: [
      { step: 1, description: 'Duduk di mesin leg press dengan punggung rata menempel pada sandaran', tips: 'Atur posisi kursi agar lutut ditekuk ~90 derajat' },
      { step: 2, description: 'Letakkan kaki di platform selebar bahu, jari kaki sedikit mengarah keluar', tips: 'Posisi kaki mempengaruhi otot yang diaktivasi' },
      { step: 3, description: 'Pemanasan dengan beban ringan 10-15 rep, lalu tingkatkan beban bertahap', tips: 'Istirahat 3-5 menit antar set peningkatan beban' },
      { step: 4, description: 'Tentukan beban maksimal 1 repetisi (1RM) dengan teknik yang benar', tips: 'Jangan lock lutut sepenuhnya saat mendorong' }
    ],
    commonMistakes: ['Mengangkat bokong dari sandaran', 'Lutut terlalu menekuk melewati jari kaki', 'Menahan napas saat mengangkat (valsalva berlebih)'],
    safetyTips: ['Gunakan spotter atau safety stop', 'Jangan langsung coba beban berat', 'Hindari jika ada cedera lutut']
  },
  {
    testId: 'bench-press-1rm-ratio',
    steps: [
      { step: 1, description: 'Berbaring di bench press, kaki rata di lantai, punggung membentuk arch alami', tips: 'Posisi mata tepat di bawah barbell' },
      { step: 2, description: 'Pemanasan dengan beban ringan 10-15 rep, lalu 5 rep dengan beban sedang', tips: 'Pemanasan progresif mencegah cedera' },
      { step: 3, description: 'Tingkatkan beban bertahap menuju 1RM dengan istirahat 3-5 menit antar set', tips: 'Peningkatan beban 5-10% per set mendekati 1RM' },
      { step: 4, description: 'Catat beban 1RM, hitung rasio: 1RM ÷ Berat Badan', tips: 'Selalu gunakan spotter untuk keamanan' }
    ],
    commonMistakes: ['Mengangkat bokong dari bench', 'Barbell memantul di dada', 'Tidak menggunakan spotter'],
    safetyTips: ['Wajib ada spotter', 'Gunakan safety pin/rack', 'Pemanasan progresif wajib']
  },
  {
    testId: 'squat-1rm-ratio',
    steps: [
      { step: 1, description: 'Posisikan barbell di upper back (bukan leher), kaki selebar bahu atau sedikit lebih lebar', tips: 'Gunakan pad barbell jika diperlukan untuk kenyamanan' },
      { step: 2, description: 'Pemanasan: bodyweight squat, lalu beban ringan 10 rep, sedang 5 rep', tips: 'Perhatikan depth: paha minimal sejajar lantai' },
      { step: 3, description: 'Tingkatkan beban bertahap menuju 1RM. Squat penuh hingga paha paralel atau lebih rendah', tips: 'Lutut mengikuti arah jari kaki, jangan kolaps ke dalam' },
      { step: 4, description: 'Catat beban 1RM, hitung rasio: 1RM ÷ Berat Badan', tips: 'Gunakan squat rack dengan safety bar' }
    ],
    commonMistakes: ['Lutut kolaps ke dalam (valgus)', 'Tidak mencapai depth yang cukup', 'Punggung membulat saat naik'],
    safetyTips: ['Wajib gunakan squat rack dengan safety', 'Spotter berpengalaman', 'Jangan coba 1RM tanpa pengalaman']
  },
  {
    testId: 'deadlift-1rm-ratio',
    steps: [
      { step: 1, description: 'Posisi berdiri dengan kaki selebar bahu, barbell di depan tulang kering', tips: 'Jari kaki bisa sedikit mengarah keluar' },
      { step: 2, description: 'Bungkuk dengan punggung lurus, pegang barbell dengan overhand atau mixed grip', tips: 'Tangan sedikit di luar lutut' },
      { step: 3, description: 'Angkat barbell dengan mendorong lantai, punggung tetap lurus, barbell dekat tubuh', tips: 'Inisiasi dari kaki, bukan punggung' },
      { step: 4, description: 'Lockout di atas: bahu ke belakang, pinggul terdorong penuh. Hitung rasio: 1RM ÷ BB', tips: 'Turunkan barbell dengan kontrol' }
    ],
    commonMistakes: ['Punggung membulat (rounding)', 'Barbell terlalu jauh dari tubuh', 'Mengangkat dengan punggung bukan kaki'],
    safetyTips: ['Gunakan belt untuk beban berat', 'Pastikan form sempurna sebelum menambah beban', 'Gunakan platform deadlift']
  },
  {
    testId: 'overhead-press-1rm-ratio',
    steps: [
      { step: 1, description: 'Berdiri dengan kaki selebar bahu, barbell di depan bahu (rack position)', tips: 'Core harus engaged sepanjang gerakan' },
      { step: 2, description: 'Pemanasan dengan beban ringan 10 rep, sedang 5 rep', tips: 'Pastikan mobilitas bahu cukup sebelum tes' },
      { step: 3, description: 'Tekan barbell ke atas melewati kepala hingga lengan lurus penuh', tips: 'Kepala sedikit mundur saat barbell melewati, lalu kembali' },
      { step: 4, description: 'Turunkan dengan kontrol. Hitung rasio: 1RM ÷ Berat Badan', tips: 'Jangan gunakan bantuan kaki (leg drive)' }
    ],
    commonMistakes: ['Menggunakan leg drive (menjadi push press)', 'Punggung terlalu melengkung ke belakang', 'Barbell tidak di atas kepala saat lockout'],
    safetyTips: ['Pemanasan bahu menyeluruh', 'Hindari jika ada masalah bahu', 'Gunakan rack untuk keamanan']
  },

  // ========== SPEED ==========
  {
    testId: 'sprint-30m',
    steps: [
      { step: 1, description: 'Siapkan lintasan 30 meter yang rata. Pasang cone di start dan finish', tips: 'Tambahkan zona run-through 5-10 meter setelah garis finish' },
      { step: 2, description: 'Posisi start: standing start atau 3-point stance, kaki belakang di garis start', tips: 'Berat badan condong ke depan, siap meledak' },
      { step: 3, description: 'Aba-aba: "Siap" - atlet siap di posisi, "Ya"/peluit - mulai sprint dan stopwatch', tips: 'Timer harus di posisi yang jelas melihat garis finish' },
      { step: 4, description: 'Stop waktu saat dada melewati garis finish. Berikan 2-3 percobaan dengan istirahat cukup', tips: 'Ambil waktu terbaik dari semua percobaan' }
    ],
    commonMistakes: ['Start yang terlalu tegak', 'Mengurangi kecepatan sebelum garis finish', 'Istirahat tidak cukup antar percobaan'],
    safetyTips: ['Pemanasan sprint pendek sebelum tes', 'Pastikan lintasan bebas hambatan']
  },
  {
    testId: 'sprint-60m',
    steps: [
      { step: 1, description: 'Siapkan lintasan 60 meter yang rata dengan zona run-off setelah finish', tips: 'Permukaan lintasan harus konsisten' },
      { step: 2, description: 'Posisi start: jongkok atau berdiri. Atlet siap di garis start', tips: 'Start jongkok lebih standar untuk jarak ini' },
      { step: 3, description: 'Sprint dengan akselerasi maksimal, pertahankan kecepatan puncak', tips: 'Fase akselerasi ~30m, maintenance ~30m' },
      { step: 4, description: 'Catat waktu saat dada melewati finish. Berikan 2-3 percobaan', tips: 'Istirahat penuh (3-5 menit) antar percobaan' }
    ],
    commonMistakes: ['Decelerasi sebelum finish', 'Posisi tubuh terlalu tegak saat akselerasi', 'Langkah terlalu pendek atau terlalu panjang'],
    safetyTips: ['Pemanasan sprint progresif wajib', 'Pastikan permukaan tidak licin', 'Hindari sprint maksimal tanpa pemanasan']
  },
  {
    testId: 'reaction-time',
    steps: [
      { step: 1, description: 'Siapkan alat reaction time atau software komputer yang sesuai', tips: 'Bisa menggunakan ruler drop test sebagai alternatif sederhana' },
      { step: 2, description: 'Atlet siap di posisi yang nyaman, fokus pada stimulus yang akan muncul', tips: 'Minimalisir distraksi di sekitar area tes' },
      { step: 3, description: 'Berikan stimulus visual/audio secara random, atlet merespon secepat mungkin', tips: 'Variasikan interval antar stimulus (1-5 detik)' },
      { step: 4, description: 'Lakukan 10 percobaan, buang nilai tertinggi dan terendah, rata-ratakan sisanya', tips: 'Catat waktu dalam milidetik' }
    ],
    commonMistakes: ['Antisipasi stimulus (respon sebelum stimulus)', 'Tidak fokus penuh', 'Posisi tangan/jari tidak konsisten'],
    safetyTips: ['Pastikan atlet dalam kondisi segar (tidak lelah)', 'Lakukan di lingkungan yang tenang']
  },
  {
    testId: 'flying-start-20m',
    steps: [
      { step: 1, description: 'Siapkan zona timing 20 meter dengan awalan 10-15 meter sebelumnya', tips: 'Gunakan timing gate untuk akurasi terbaik' },
      { step: 2, description: 'Atlet memulai dari posisi berdiri 10-15 meter sebelum zona timing', tips: 'Zona awalan untuk mencapai kecepatan maksimal' },
      { step: 3, description: 'Akselerasi di zona awalan, timer mulai saat memasuki zona 20 meter', tips: 'Atlet harus sudah di kecepatan puncak saat memasuki zona timing' },
      { step: 4, description: 'Catat waktu 20 meter. Berikan 2-3 percobaan dengan istirahat penuh', tips: 'Tes ini mengukur kecepatan maksimal, bukan akselerasi' }
    ],
    commonMistakes: ['Belum mencapai kecepatan maksimal saat memasuki zona', 'Zona awalan terlalu pendek', 'Decelerasi di dalam zona timing'],
    safetyTips: ['Pastikan area run-off setelah finish cukup panjang', 'Pemanasan sprint progresif sebelum tes']
  },
  {
    testId: 'sprint-100m',
    steps: [
      { step: 1, description: 'Siapkan lintasan 100 meter dengan blok start (opsional)', tips: 'Gunakan lintasan atletik standar untuk akurasi' },
      { step: 2, description: 'Posisi start jongkok di blok start atau standing start', tips: 'Untuk start jongkok: "Bersedia" - "Siap" - "Ya"' },
      { step: 3, description: 'Sprint 100 meter dengan akselerasi, kecepatan puncak, dan maintenance', tips: 'Fase: akselerasi 0-40m, puncak 40-70m, maintenance 70-100m' },
      { step: 4, description: 'Catat waktu saat dada melewati finish. Berikan 2-3 percobaan', tips: 'Istirahat penuh (5-8 menit) antar percobaan' }
    ],
    commonMistakes: ['Akselerasi terlalu pendek', 'Teknik lari yang tidak efisien', 'Decelerasi signifikan di 20m terakhir'],
    safetyTips: ['Pemanasan menyeluruh wajib (15-20 menit)', 'Hindari sprint 100m tanpa pengalaman latihan sprint', 'Siapkan es/pendingin untuk hamstring']
  },

  // ========== AGILITY ==========
  {
    testId: 'illinois-agility',
    steps: [
      { step: 1, description: 'Setup: area 10x5 meter dengan 4 cone di sudut dan 4 cone di tengah (jarak 3.3m antar cone tengah)', tips: 'Ukur dengan teliti untuk hasil yang konsisten' },
      { step: 2, description: 'Posisi start: berbaring telungkup di garis start, tangan di samping bahu', tips: 'Wajah menghadap ke bawah, siap bangun dan sprint' },
      { step: 3, description: 'Aba-aba start: bangun secepat mungkin, sprint lurus, berbelok, weaving antar cone', tips: 'Ikuti pola: lurus-belok-weaving-belok-lurus-finish' },
      { step: 4, description: 'Waktu berhenti saat melewati garis finish. Gagal jika menyentuh atau melewatkan cone', tips: 'Latih polanya dulu sebelum tes sebenarnya' }
    ],
    commonMistakes: ['Menyentuh atau menjatuhkan cone', 'Melewatkan cone saat weaving', 'Tidak memotong sudut dengan efisien'],
    safetyTips: ['Gunakan sepatu dengan grip yang baik', 'Pastikan area tes kering dan tidak licin']
  },
  {
    testId: 't-test',
    steps: [
      { step: 1, description: 'Setup: bentuk T dengan cone - 1 di start, 1 di tengah (10m), 2 di sisi kiri-kanan (5m dari tengah)', tips: 'Gunakan pita pengukur untuk akurasi' },
      { step: 2, description: 'Posisi start: berdiri di cone start, siap sprint', tips: 'Stance atletis, siap bergerak ke segala arah' },
      { step: 3, description: 'Pola: sprint ke cone tengah - shuffle kiri - shuffle kanan - shuffle kembali ke tengah - backpedal ke start', tips: 'Sentuh setiap cone dengan tangan' },
      { step: 4, description: 'Waktu berhenti saat melewati garis start kembali', tips: 'Tidak boleh menyilangkan kaki saat shuffle' }
    ],
    commonMistakes: ['Menyilangkan kaki saat shuffle (crossover)', 'Tidak menyentuh cone', 'Berbalik badan saat backpedal'],
    safetyTips: ['Pemanasan lateral movement sebelum tes', 'Hindari tes pada permukaan yang licin']
  },
  {
    testId: 'hexagon-test',
    steps: [
      { step: 1, description: 'Buat hexagon di lantai menggunakan tape (setiap sisi 66cm, sudut 120°)', tips: 'Bisa menggunakan template untuk akurasi' },
      { step: 2, description: 'Atlet berdiri di tengah hexagon, menghadap sisi tertentu yang ditandai', tips: 'Kedua kaki rapat di titik tengah' },
      { step: 3, description: 'Aba-aba start: lompat keluar-masuk hexagon searah jarum jam, 3 putaran penuh', tips: 'Selalu kembali ke tengah setelah melompat keluar' },
      { step: 4, description: 'Catat waktu total untuk 3 putaran. Gagal jika menginjak garis', tips: 'Lompat dengan kedua kaki bersamaan' }
    ],
    commonMistakes: ['Menginjak garis hexagon', 'Tidak kembali ke tengah', 'Melompat dengan satu kaki', 'Melompat ke arah yang salah'],
    safetyTips: ['Gunakan alas kaki yang tidak licin', 'Pemanasan pergelangan kaki', 'Pastikan permukaan lantai rata']
  },
  {
    testId: 'shuttle-run',
    steps: [
      { step: 1, description: 'Siapkan 2 garis paralel 10 meter, letakkan 2 balok kayu di garis finish', tips: 'Balok harus cukup besar untuk digenggam' },
      { step: 2, description: 'Atlet berdiri di garis start. Aba-aba "Ya", lari ke garis finish, ambil 1 balok', tips: 'Posisi start berdiri, siap sprint' },
      { step: 3, description: 'Bawa balok kembali ke garis start, letakkan (tidak boleh dilempar)', tips: 'Balok harus diletakkan, bukan dijatuhkan' },
      { step: 4, description: 'Lari lagi ambil balok kedua. Waktu berhenti saat balok kedua diletakkan di start', tips: 'Total 4 kali lari 10 meter' }
    ],
    commonMistakes: ['Melempar balok alih-alih meletakkan', 'Teknik pivot yang tidak efisien', 'Decelerasi terlalu dini sebelum garis'],
    safetyTips: ['Gunakan sepatu dengan grip baik', 'Pastikan lantai tidak licin', 'Pemanasan sprint pendek sebelum tes']
  },
  {
    testId: 'pro-agility',
    steps: [
      { step: 1, description: 'Setup: 3 cone dalam garis lurus, jarak 5 yard (4.57m) antar cone', tips: '1 yard = 0.914 meter' },
      { step: 2, description: 'Atlet mulai di cone tengah, posisi 3-point stance menghadap tester', tips: 'Satu tangan di lantai, siap meledak' },
      { step: 3, description: 'Sprint 5 yard ke kanan, sentuh garis. Sprint 10 yard ke kiri, sentuh garis', tips: 'Harus menyentuh garis dengan tangan' },
      { step: 4, description: 'Sprint 5 yard kembali ke cone tengah. Catat waktu', tips: 'Berikan percobaan ke kedua arah' }
    ],
    commonMistakes: ['Tidak menyentuh garis', 'Crossover step saat berbelok', 'Start yang tidak seimbang'],
    safetyTips: ['Pemanasan perubahan arah', 'Gunakan sepatu dengan traction baik', 'Permukaan harus kering']
  },

  // ========== FLEXIBILITY ==========
  {
    testId: 'sit-and-reach',
    steps: [
      { step: 1, description: 'Siapkan sit and reach box atau bangku dengan penggaris. Posisi 0 cm di tepi bangku', tips: 'Bisa juga menggunakan lantai dengan penggaris jika tidak ada box' },
      { step: 2, description: 'Duduk dengan kaki lurus ke depan, telapak kaki rata menempel box/dinding', tips: 'Lutut harus tetap lurus sepanjang tes' },
      { step: 3, description: 'Letakkan tangan di atas box, jari-jari menumpuk. Condongkan badan ke depan perlahan', tips: 'Gerakan harus halus dan terkontrol, tidak bouncing' },
      { step: 4, description: 'Jangkau sejauh mungkin, tahan posisi 2 detik. Catat jarak terjauh', tips: 'Lakukan 3 percobaan, ambil nilai terbaik' }
    ],
    commonMistakes: ['Menekuk lutut saat reach', 'Bouncing untuk mendapatkan jarak lebih jauh', 'Tidak menahan posisi cukup lama'],
    safetyTips: ['Pemanasan hamstring sebelum tes', 'Jangan dipaksa jika terasa nyeri tajam']
  },
  {
    testId: 'sit-reach',
    steps: [
      { step: 1, description: 'Siapkan sit and reach box atau bangku dengan penggaris', tips: 'Posisi 0 di tepi bangku, nilai positif melewati ujung kaki' },
      { step: 2, description: 'Duduk dengan kaki lurus, telapak kaki rata menempel box', tips: 'Lutut harus lurus sepanjang tes' },
      { step: 3, description: 'Condongkan badan ke depan perlahan dengan kedua tangan menumpuk', tips: 'Gerakan halus dan terkontrol' },
      { step: 4, description: 'Jangkau sejauh mungkin, tahan 2 detik. Ambil nilai terbaik dari 3 percobaan', tips: 'Jangan bouncing' }
    ],
    commonMistakes: ['Menekuk lutut', 'Bouncing', 'Tidak menahan posisi'],
    safetyTips: ['Pemanasan hamstring', 'Jangan paksa jika nyeri']
  },
  {
    testId: 'shoulder-flexibility',
    steps: [
      { step: 1, description: 'Berdiri tegak dengan posisi rileks. Siapkan pita pengukur', tips: 'Pastikan atlet sudah melakukan pemanasan bahu' },
      { step: 2, description: 'Tangan kanan meraih lewat atas bahu ke belakang, tangan kiri lewat bawah ke atas', tips: 'Jari-jari mencoba saling menyentuh' },
      { step: 3, description: 'Ukur jarak antara jari tengah kedua tangan', tips: 'Nilai positif = jari saling tumpang tindih, negatif = ada celah' },
      { step: 4, description: 'Ulangi dengan posisi tangan terbalik. Lakukan 2 percobaan per sisi', tips: 'Bandingkan fleksibilitas kiri dan kanan' }
    ],
    commonMistakes: ['Mencondongkan badan untuk membantu jangkauan', 'Menekuk punggung ke samping', 'Tidak rileks saat tes'],
    safetyTips: ['Pemanasan bahu dengan arm circle', 'Jangan paksa jika terasa nyeri', 'Hindari gerakan mendadak']
  },
  {
    testId: 'trunk-rotation',
    steps: [
      { step: 1, description: 'Duduk di lantai dengan kaki lurus ke depan, punggung tegak', tips: 'Bisa juga duduk di kursi tanpa sandaran' },
      { step: 2, description: 'Pegang tongkat di belakang bahu, kedua tangan menggenggam ujung tongkat', tips: 'Tongkat harus tetap di posisi horizontal' },
      { step: 3, description: 'Rotasi batang tubuh ke satu sisi semaksimal mungkin', tips: 'Pinggul harus tetap menghadap depan' },
      { step: 4, description: 'Ukur sudut rotasi menggunakan goniometer. Ulangi ke sisi lain', tips: 'Bandingkan sudut kiri dan kanan' }
    ],
    commonMistakes: ['Pinggul ikut berputar', 'Tongkat tidak horizontal', 'Gerakan bouncing'],
    safetyTips: ['Pemanasan rotasi ringan sebelum tes', 'Hindari jika ada masalah punggung']
  },
  {
    testId: 'groin-flexibility',
    steps: [
      { step: 1, description: 'Duduk di lantai dengan kedua telapak kaki saling menempel (butterfly position)', tips: 'Punggung tetap lurus dan tegak' },
      { step: 2, description: 'Tarik tumit sedekat mungkin ke tubuh', tips: 'Genggam pergelangan kaki atau ujung jari kaki' },
      { step: 3, description: 'Biarkan lutut turun ke samping secara alami (tanpa tekanan)', tips: 'Jangan tekan lutut dengan tangan' },
      { step: 4, description: 'Ukur jarak dari lutut ke lantai menggunakan penggaris', tips: 'Semakin dekat ke lantai, semakin baik' }
    ],
    commonMistakes: ['Menekan lutut dengan tangan', 'Punggung membungkuk', 'Kaki terlalu jauh dari tubuh'],
    safetyTips: ['Pemanasan adduktor sebelum tes', 'Jangan paksa gerakan', 'Hindari jika ada cedera selangkangan']
  },
  {
    testId: 'hip-flexor',
    steps: [
      { step: 1, description: 'Berbaring di ujung meja/bangku, kedua kaki menggantung di ujung', tips: 'Bokong tepat di ujung meja' },
      { step: 2, description: 'Tarik satu lutut ke dada dengan kedua tangan, peluk erat', tips: 'Punggung bawah harus tetap menempel meja' },
      { step: 3, description: 'Biarkan kaki yang tidak ditarik menggantung bebas', tips: 'Relakskan kaki yang menggantung sepenuhnya' },
      { step: 4, description: 'Amati posisi paha yang menggantung. Ukur sudut terhadap horizontal', tips: 'Paha di atas horizontal = hip flexor ketat' }
    ],
    commonMistakes: ['Punggung bawah terangkat dari meja', 'Kaki yang menggantung tidak rileks', 'Meja terlalu tinggi/rendah'],
    safetyTips: ['Lakukan perlahan', 'Gunakan meja yang stabil', 'Hindari jika ada nyeri pinggul']
  },

  // ========== BALANCE ==========
  {
    testId: 'stork-stand',
    steps: [
      { step: 1, description: 'Berdiri dengan kedua kaki, tangan di pinggang, pilih kaki penopang', tips: 'Pilih kaki yang lebih dominan untuk keseimbangan' },
      { step: 2, description: 'Angkat kaki non-penopang, letakkan telapak di bagian dalam lutut kaki penopang', tips: 'Kaki membentuk posisi seperti angka 4' },
      { step: 3, description: 'Angkat tumit dari lantai (berdiri di ujung jari kaki). Timer mulai', tips: 'Fokus pandangan pada satu titik tetap di depan' },
      { step: 4, description: 'Catat waktu sampai tumit menyentuh lantai atau kaki bergeser. Lakukan 3x', tips: 'Ambil waktu terlama' }
    ],
    commonMistakes: ['Tangan bergerak dari pinggang', 'Kaki penyangga bergeser', 'Tidak fokus pada satu titik'],
    safetyTips: ['Lakukan dekat dinding sebagai pengaman', 'Permukaan lantai rata dan tidak licin']
  },
  {
    testId: 'y-balance',
    steps: [
      { step: 1, description: 'Buat 3 garis dari titik tengah: anterior (depan), posteromedial (belakang-dalam), posterolateral (belakang-luar)', tips: 'Sudut: anterior 0°, posteromedial 135°, posterolateral 135° dari anterior' },
      { step: 2, description: 'Berdiri di titik tengah dengan satu kaki, tangan di pinggang', tips: 'Kaki penopang stabil di tengah' },
      { step: 3, description: 'Raih sejauh mungkin ke setiap arah dengan kaki yang tidak menopang', tips: 'Sentuh ringan, jangan transfer berat badan' },
      { step: 4, description: 'Catat jarak jangkauan per arah. Hitung composite score (rata-rata / panjang kaki × 100)', tips: 'Lakukan 3x per arah per kaki' }
    ],
    commonMistakes: ['Transfer berat ke kaki yang meraih', 'Tangan bergerak dari pinggang', 'Tumit kaki penopang terangkat'],
    safetyTips: ['Pemanasan keseimbangan sebelum tes', 'Permukaan rata dan stabil']
  },
  {
    testId: 'bass-test',
    steps: [
      { step: 1, description: 'Buat 10 target marks (2.5 x 2.5 cm) di lantai dengan pola tertentu', tips: 'Jarak antar target bervariasi (1-1.5 meter)' },
      { step: 2, description: 'Atlet berdiri di target pertama dengan satu kaki', tips: 'Pilih kaki dominan' },
      { step: 3, description: 'Lompat dari target ke target, mendarat dengan satu kaki, tahan 5 detik', tips: 'Skor berdasarkan keberhasilan landing dan durasi bertahan' },
      { step: 4, description: 'Hitung skor: +5 poin per landing berhasil, +1 per detik bertahan (maks 5)', tips: 'Skor maksimal: 100 poin (10 target × 10 poin)' }
    ],
    commonMistakes: ['Mendarat di luar target', 'Menggunakan kedua kaki', 'Tidak menahan 5 detik penuh'],
    safetyTips: ['Pemanasan pergelangan kaki', 'Permukaan yang tidak licin', 'Matras tipis di sekitar area tes']
  },
  {
    testId: 'tandem-walk',
    steps: [
      { step: 1, description: 'Buat garis lurus sepanjang 3 meter di lantai menggunakan tape', tips: 'Garis harus jelas terlihat' },
      { step: 2, description: 'Atlet berdiri di ujung garis, posisi tumit-ke-jari (tandem)', tips: 'Tangan bisa di samping tubuh atau di pinggang' },
      { step: 3, description: 'Berjalan sepanjang garis dengan tumit kaki depan menyentuh jari kaki belakang', tips: 'Pandangan ke depan, bukan ke bawah' },
      { step: 4, description: 'Hitung jumlah kesalahan (kaki keluar garis, jarak antar kaki, kehilangan balance)', tips: 'Lakukan 2 percobaan, ambil yang terbaik' }
    ],
    commonMistakes: ['Berjalan terlalu cepat', 'Melihat ke bawah terus-menerus', 'Langkah tidak menyentuh tumit-ke-jari'],
    safetyTips: ['Lakukan di area yang aman jika kehilangan balance', 'Permukaan rata']
  },
  {
    testId: 'romberg-test',
    steps: [
      { step: 1, description: 'Berdiri dengan kedua kaki rapat, tangan di samping tubuh', tips: 'Posisi tegak dan rileks' },
      { step: 2, description: 'Tutup mata sepenuhnya. Timer mulai saat mata tertutup', tips: 'Pastikan mata benar-benar tertutup' },
      { step: 3, description: 'Tahan posisi berdiri selama mungkin (maksimal 60 detik)', tips: 'Fokus pada propriosepsi dan input vestibular' },
      { step: 4, description: 'Timer berhenti jika: mata terbuka, kaki bergeser, atau kehilangan keseimbangan', tips: 'Tester harus siap menangkap jika atlet terjatuh' }
    ],
    commonMistakes: ['Membuka mata', 'Kaki tidak rapat', 'Menggerakkan tangan untuk menjaga balance'],
    safetyTips: ['Wajib ada tester di dekat atlet', 'Lakukan di area yang aman', 'Siapkan untuk menangkap atlet']
  },

  // ========== POWER ==========
  {
    testId: 'vertical-jump',
    steps: [
      { step: 1, description: 'Ukur reach height: berdiri di samping dinding, angkat tangan tertinggi, tandai posisi ujung jari', tips: 'Pastikan bahu menempel dinding saat mengukur' },
      { step: 2, description: 'Posisi untuk lompatan: berdiri dengan kaki selebar bahu, sedikit menjauh dari dinding', tips: 'Jarak dari dinding sekitar 15-20 cm' },
      { step: 3, description: 'Counter movement: tekuk lutut, ayun tangan ke belakang, lalu lompat setinggi mungkin', tips: 'Koordinasikan ayunan tangan dengan lompatan' },
      { step: 4, description: 'Sentuh dinding/papan di titik tertinggi. Hitung selisih dengan reach height', tips: 'Lakukan 3 percobaan, ambil nilai terbaik' }
    ],
    commonMistakes: ['Melangkah atau berlari sebelum lompat', 'Tidak menggunakan counter movement yang optimal', 'Mendarat dengan lutut lurus'],
    safetyTips: ['Gunakan alas kaki yang tidak licin', 'Pastikan area pendaratan aman', 'Pemanasan yang cukup untuk mencegah cedera']
  },
  {
    testId: 'standing-broad-jump',
    steps: [
      { step: 1, description: 'Berdiri di belakang garis start dengan kedua kaki sejajar', tips: 'Ujung jari kaki tepat di belakang garis' },
      { step: 2, description: 'Tekuk lutut dan ayunkan tangan ke belakang untuk momentum', tips: 'Condongkan badan sedikit ke depan' },
      { step: 3, description: 'Lompat ke depan sejauh mungkin dengan mengayunkan tangan ke depan', tips: 'Dorong dengan kuat dari kedua kaki secara bersamaan' },
      { step: 4, description: 'Mendarat dengan kedua kaki. Ukur dari garis start ke tumit terdekat', tips: 'Lakukan 3 percobaan, ambil jarak terjauh' }
    ],
    commonMistakes: ['Menginjak garis start', 'Terjatuh ke belakang saat mendarat', 'Tidak menggunakan ayunan tangan optimal'],
    safetyTips: ['Gunakan alas yang tidak licin', 'Pastikan area pendaratan cukup empuk', 'Pemanasan tungkai dan ankle sebelum tes']
  },
  {
    testId: 'medicine-ball-throw',
    steps: [
      { step: 1, description: 'Berdiri di belakang garis start, pegang medicine ball 3kg dengan kedua tangan', tips: 'Bola di depan dada atau di atas kepala sesuai protokol' },
      { step: 2, description: 'Posisi kaki selebar bahu, sedikit ditekuk', tips: 'Pemanasan dengan lemparan ringan 3-5 kali' },
      { step: 3, description: 'Lempar bola ke depan dengan tenaga maksimal (chest pass atau overhead throw)', tips: 'Transfer tenaga dari kaki ke tangan' },
      { step: 4, description: 'Ukur jarak dari garis start ke titik jatuh bola. Lakukan 3 percobaan', tips: 'Kaki tidak boleh melewati garis start' }
    ],
    commonMistakes: ['Kaki melewati garis saat melempar', 'Hanya menggunakan lengan (tidak ada transfer dari kaki)', 'Melempar ke atas bukan ke depan'],
    safetyTips: ['Pastikan area jatuh bola kosong', 'Gunakan medicine ball yang sesuai berat', 'Pemanasan bahu dan dada']
  },
  {
    testId: 'triple-hop',
    steps: [
      { step: 1, description: 'Berdiri di garis start dengan satu kaki (kaki yang diuji)', tips: 'Mulai dengan kaki dominan' },
      { step: 2, description: 'Lompat ke depan 3 kali berturut-turut dengan kaki yang sama', tips: 'Setiap lompatan harus dimaksimalkan' },
      { step: 3, description: 'Mendarat stabil setelah lompatan ketiga', tips: 'Harus mendarat dan tahan tanpa jatuh' },
      { step: 4, description: 'Ukur jarak total dari garis start ke titik pendaratan terakhir', tips: 'Lakukan 3 percobaan per kaki, bandingkan kiri-kanan' }
    ],
    commonMistakes: ['Kehilangan keseimbangan antar hop', 'Menggunakan kaki bergantian', 'Pendaratan tidak stabil'],
    safetyTips: ['Pemanasan tungkai menyeluruh', 'Permukaan yang empuk', 'Hindari jika ada cedera ankle/lutut']
  },
  {
    testId: 'countermovement-jump',
    steps: [
      { step: 1, description: 'Berdiri tegak di atas contact mat atau force platform, tangan di pinggang', tips: 'Tangan tetap di pinggang sepanjang tes (tidak boleh mengayun)' },
      { step: 2, description: 'Turun cepat ke posisi quarter squat (countermovement)', tips: 'Gerakan turun dan naik harus menyatu tanpa jeda' },
      { step: 3, description: 'Segera lompat setinggi mungkin dari posisi countermovement', tips: 'Kaki harus lurus saat di udara' },
      { step: 4, description: 'Mendarat kembali di mat. Alat akan menghitung tinggi lompatan dari flight time', tips: 'Lakukan 3-5 percobaan, ambil yang terbaik' }
    ],
    commonMistakes: ['Mengayun tangan', 'Jeda terlalu lama di posisi bawah', 'Menekuk kaki saat di udara (menaikkan lutut)'],
    safetyTips: ['Pemanasan lompatan ringan', 'Permukaan pendaratan yang sesuai', 'Pastikan alat terkalibrasi']
  },
  {
    testId: 'wingate-test',
    steps: [
      { step: 1, description: 'Atur cycle ergometer dan beban sesuai berat badan atlet (biasanya 7.5% BB)', tips: 'Tinggi sadel: kaki hampir lurus saat pedal di bawah' },
      { step: 2, description: 'Pemanasan 5 menit dengan intensitas ringan, 2-3 sprint pendek 5 detik', tips: 'Istirahat 1 menit setelah pemanasan sebelum tes' },
      { step: 3, description: 'Sprint maksimal selama 30 detik melawan beban yang ditentukan', tips: 'Mulai pedal cepat tanpa beban, beban ditambahkan saat sudah sprint' },
      { step: 4, description: 'Catat peak power (5 detik tertinggi) dan mean power (rata-rata 30 detik)', tips: 'Cooling down 5 menit setelah tes' }
    ],
    commonMistakes: ['Tidak sprint maksimal dari awal', 'Berhenti sebelum 30 detik', 'Posisi duduk yang tidak optimal'],
    safetyTips: ['Pastikan atlet sehat jantung', 'Sediakan ember/kantong jika mual', 'Cooling down wajib', 'Jangan lakukan jika ada kontraindikasi kardio']
  },

  // ========== COORDINATION ==========
  {
    testId: 'ball-wall-toss',
    steps: [
      { step: 1, description: 'Berdiri 2 meter dari dinding yang rata, pegang bola tenis', tips: 'Tandai jarak 2 meter dengan tape' },
      { step: 2, description: 'Lempar bola tenis ke dinding dengan tangan dominan (underhand throw)', tips: 'Lemparan setinggi dada untuk pantulan optimal' },
      { step: 3, description: 'Tangkap bola yang memantul dengan tangan yang sama', tips: 'Fokus mata pada bola sepanjang gerakan' },
      { step: 4, description: 'Hitung jumlah tangkapan sukses dalam 30 detik', tips: 'Jika bola jatuh, ambil dan lanjutkan' }
    ],
    commonMistakes: ['Berdiri terlalu dekat/jauh dari dinding', 'Lemparan terlalu keras/lemah', 'Tidak fokus pada bola'],
    safetyTips: ['Gunakan bola tenis standar', 'Dinding harus rata dan keras', 'Area di sekitar bebas hambatan']
  },
  {
    testId: 'alternate-hand-wall-toss',
    steps: [
      { step: 1, description: 'Berdiri 2 meter dari dinding, pegang bola tenis', tips: 'Posisi yang sama dengan wall toss biasa' },
      { step: 2, description: 'Lempar bola ke dinding dengan tangan kanan', tips: 'Underhand throw, setinggi dada' },
      { step: 3, description: 'Tangkap pantulan dengan tangan kiri, lalu lempar dengan kiri, tangkap dengan kanan', tips: 'Bergantian: lempar kanan-tangkap kiri, lempar kiri-tangkap kanan' },
      { step: 4, description: 'Hitung total tangkapan sukses dalam 30 detik', tips: 'Setiap tangkapan sukses = 1 poin' }
    ],
    commonMistakes: ['Lupa bergantian tangan', 'Lemparan tidak konsisten', 'Tangkapan hanya dengan tangan dominan'],
    safetyTips: ['Pemanasan pergelangan tangan', 'Area yang cukup luas']
  },
  {
    testId: 'stick-drop-test',
    steps: [
      { step: 1, description: 'Tester memegang tongkat reaksi (dengan skala cm) di ujung atas secara vertikal', tips: 'Angka 0 di bagian bawah tongkat' },
      { step: 2, description: 'Subjek memposisikan tangan dominan di bagian bawah tongkat tanpa menyentuh', tips: 'Ibu jari dan telunjuk membentuk huruf C, siap menangkap' },
      { step: 3, description: 'Tester melepas tongkat tanpa aba-aba (waktu random 1-5 detik)', tips: 'Subjek tidak boleh melihat tangan tester' },
      { step: 4, description: 'Catat posisi cm di mana tongkat tertangkap. Lakukan 10 percobaan, rata-rata', tips: 'Buang 2 nilai tertinggi dan terendah' }
    ],
    commonMistakes: ['Mengantisipasi pelepasan (menebak)', 'Posisi tangan terlalu ketat/longgar', 'Tidak fokus'],
    safetyTips: ['Tongkat harus halus (tidak tajam)', 'Lakukan di area yang tenang']
  },
  {
    testId: 'soccer-wall-volley',
    steps: [
      { step: 1, description: 'Berdiri 4 meter dari dinding, letakkan bola sepak di lantai', tips: 'Tandai jarak 4 meter dengan cone' },
      { step: 2, description: 'Tendang bola ke dinding menggunakan instep (punggung kaki)', tips: 'Tendangan harus cukup keras agar memantul kembali' },
      { step: 3, description: 'Kontrol bola pantulan, lalu tendang lagi ke dinding', tips: 'Bisa menggunakan kaki kiri atau kanan' },
      { step: 4, description: 'Hitung jumlah tendangan yang berhasil masuk ke dinding dalam 30 detik', tips: 'Bola harus tetap di bawah ketinggian pinggang saat mengenai dinding' }
    ],
    commonMistakes: ['Bola terlalu tinggi saat mengenai dinding', 'Kontrol bola yang buruk', 'Berdiri terlalu dekat/jauh'],
    safetyTips: ['Gunakan sepatu futsal/olahraga', 'Dinding harus kuat dan rata', 'Area di sekitar bebas hambatan']
  },
  {
    testId: 'basketball-dribble',
    steps: [
      { step: 1, description: 'Setup 5 cone dalam garis lurus dengan jarak 2 meter antar cone', tips: 'Total panjang track 8 meter' },
      { step: 2, description: 'Atlet berdiri di start dengan bola basket, siap dribble', tips: 'Bola harus di-dribble sepanjang track' },
      { step: 3, description: 'Dribble melewati semua cone secara zigzag (weaving), lalu kembali', tips: 'Bola harus selalu dalam kontrol' },
      { step: 4, description: 'Catat waktu dari start hingga kembali ke posisi awal', tips: 'Jika bola lepas, ambil dan lanjutkan dari posisi terakhir' }
    ],
    commonMistakes: ['Melewatkan cone', 'Membawa bola (carrying)', 'Menyentuh cone'],
    safetyTips: ['Gunakan bola yang dipompa dengan benar', 'Permukaan indoor yang rata', 'Pemanasan dribble ringan']
  },
];

export const getTestIllustration = (testId: string): TestIllustration | undefined => {
  return testIllustrations.find(t => t.testId === testId);
};

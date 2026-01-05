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

export const testIllustrations: TestIllustration[] = [
  {
    testId: 'cooper-test',
    steps: [
      {
        step: 1,
        description: 'Pemanasan dinamis selama 10 menit: jogging ringan, stretching dinamis, dan gerakan mobilitas',
        tips: 'Fokus pada otot-otot utama: paha, betis, dan pinggul'
      },
      {
        step: 2,
        description: 'Posisikan atlet di garis start lintasan atletik atau lapangan yang sudah diukur',
        tips: 'Gunakan cone atau penanda setiap 100 meter untuk memudahkan perhitungan'
      },
      {
        step: 3,
        description: 'Bunyikan peluit dan mulai stopwatch. Atlet berlari sejauh mungkin selama 12 menit',
        tips: 'Atlet boleh berjalan jika kelelahan, tapi dorong untuk tetap bergerak'
      },
      {
        step: 4,
        description: 'Setelah 12 menit, bunyikan peluit akhir. Catat posisi atlet dan hitung total jarak',
        tips: 'Minta atlet untuk cooling down dengan berjalan ringan'
      }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=example_cooper',
    commonMistakes: [
      'Memulai terlalu cepat dan kehabisan energi',
      'Tidak melakukan pemanasan yang cukup',
      'Berhenti total saat kelelahan'
    ],
    safetyTips: [
      'Pastikan atlet dalam kondisi sehat',
      'Sediakan air minum',
      'Hentikan tes jika atlet menunjukkan tanda-tanda distress'
    ]
  },
  {
    testId: 'beep-test',
    steps: [
      {
        step: 1,
        description: 'Siapkan lapangan 20 meter dengan cone di kedua ujung',
        tips: 'Pastikan permukaan lapangan rata dan tidak licin'
      },
      {
        step: 2,
        description: 'Jelaskan aturan: atlet harus mencapai garis sebelum bunyi beep berikutnya',
        tips: 'Demonstrasikan teknik pivot yang benar di garis'
      },
      {
        step: 3,
        description: 'Putar audio beep test. Atlet memulai saat bunyi beep pertama',
        tips: 'Level awal cukup lambat, kecepatan meningkat setiap level'
      },
      {
        step: 4,
        description: 'Atlet dinyatakan gagal jika 2x berturut-turut tidak mencapai garis tepat waktu',
        tips: 'Catat level dan shuttle terakhir yang berhasil diselesaikan'
      }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=example_beep',
    commonMistakes: [
      'Tidak menyentuh garis dengan kaki',
      'Memulai berlari sebelum bunyi beep',
      'Teknik pivot yang buruk membuang energi'
    ],
    safetyTips: [
      'Gunakan alas kaki yang sesuai',
      'Hindari tes di permukaan yang keras tanpa alas yang baik'
    ]
  },
  {
    testId: 'push-up',
    steps: [
      {
        step: 1,
        description: 'Posisi awal: telungkup dengan tangan di samping dada, sedikit lebih lebar dari bahu',
        tips: 'Jari-jari menghadap ke depan, siku mengarah ke samping-belakang'
      },
      {
        step: 2,
        description: 'Angkat badan dengan meluruskan tangan, tubuh membentuk garis lurus dari kepala hingga tumit',
        tips: 'Jaga core tetap engaged, jangan biarkan pinggul turun atau naik'
      },
      {
        step: 3,
        description: 'Turunkan badan dengan menekuk siku hingga dada hampir menyentuh lantai (sekitar 5cm)',
        tips: 'Kontrol gerakan turun, jangan jatuhkan tubuh'
      },
      {
        step: 4,
        description: 'Hitung repetisi yang benar sampai atlet tidak mampu melanjutkan dengan teknik yang benar',
        tips: 'Repetisi tidak dihitung jika teknik tidak benar'
      }
    ],
    commonMistakes: [
      'Pinggul terlalu tinggi atau terlalu rendah',
      'Tidak turun cukup dalam',
      'Kepala menunduk atau mendongak',
      'Gerakan terlalu cepat tanpa kontrol'
    ],
    safetyTips: [
      'Pemanasan pergelangan tangan sebelum tes',
      'Gunakan matras untuk kenyamanan'
    ]
  },
  {
    testId: 'sit-up',
    steps: [
      {
        step: 1,
        description: 'Posisi awal: berbaring telentang, lutut ditekuk 90 derajat, kaki rata di lantai',
        tips: 'Partner dapat menahan kaki atau gunakan penahan'
      },
      {
        step: 2,
        description: 'Tangan diletakkan di belakang kepala atau menyilang di dada',
        tips: 'Jangan menarik kepala dengan tangan jika posisi di belakang kepala'
      },
      {
        step: 3,
        description: 'Angkat tubuh dengan mengkontraksikan otot perut hingga siku menyentuh lutut',
        tips: 'Hembuskan nafas saat naik, tarik nafas saat turun'
      },
      {
        step: 4,
        description: 'Hitung repetisi dalam 60 detik. Hanya hitung repetisi dengan teknik yang benar',
        tips: 'Punggung harus menyentuh lantai sepenuhnya sebelum repetisi berikutnya'
      }
    ],
    commonMistakes: [
      'Menggunakan momentum, bukan kekuatan otot perut',
      'Menarik leher dengan tangan',
      'Tidak menyentuh lantai dengan punggung bawah'
    ],
    safetyTips: [
      'Hindari jika ada masalah punggung bawah',
      'Gunakan matras untuk kenyamanan'
    ]
  },
  {
    testId: 'pull-up',
    steps: [
      {
        step: 1,
        description: 'Pegang palang dengan pegangan overhand (telapak menghadap depan), tangan selebar bahu',
        tips: 'Pastikan palang cukup tinggi agar kaki tidak menyentuh lantai'
      },
      {
        step: 2,
        description: 'Bergantung dengan lengan lurus sepenuhnya (posisi dead hang)',
        tips: 'Scapula dalam posisi netral, bahu tidak mengangkat ke telinga'
      },
      {
        step: 3,
        description: 'Tarik tubuh ke atas hingga dagu melewati palang, siku menekuk penuh',
        tips: 'Inisiasi gerakan dengan menarik skapula ke bawah'
      },
      {
        step: 4,
        description: 'Turunkan tubuh dengan kontrol hingga lengan lurus kembali. Hitung repetisi maksimal',
        tips: 'Setiap repetisi harus dimulai dari posisi lengan lurus penuh'
      }
    ],
    commonMistakes: [
      'Menggunakan kipping atau ayunan',
      'Tidak naik cukup tinggi (dagu tidak melewati palang)',
      'Tidak turun sepenuhnya ke posisi dead hang'
    ],
    safetyTips: [
      'Periksa kestabilan palang sebelum tes',
      'Siapkan matras di bawah sebagai pengaman'
    ]
  },
  {
    testId: 'vertical-jump',
    steps: [
      {
        step: 1,
        description: 'Ukur reach height: berdiri di samping dinding, angkat tangan tertinggi, tandai posisi ujung jari',
        tips: 'Pastikan bahu menempel dinding saat mengukur'
      },
      {
        step: 2,
        description: 'Posisi untuk lompatan: berdiri dengan kaki selebar bahu, sedikit menjauh dari dinding',
        tips: 'Jarak dari dinding sekitar 15-20 cm'
      },
      {
        step: 3,
        description: 'Counter movement: tekuk lutut, ayun tangan ke belakang, lalu lompat setinggi mungkin',
        tips: 'Koordinasikan ayunan tangan dengan lompatan'
      },
      {
        step: 4,
        description: 'Sentuh dinding/papan di titik tertinggi. Hitung selisih dengan reach height',
        tips: 'Lakukan 3 percobaan, ambil nilai terbaik'
      }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=example_vertical_jump',
    commonMistakes: [
      'Melangkah atau berlari sebelum lompat',
      'Tidak menggunakan counter movement yang optimal',
      'Mendarat dengan lutut lurus'
    ],
    safetyTips: [
      'Gunakan alas kaki yang tidak licin',
      'Pastikan area pendaratan aman',
      'Pemanasan yang cukup untuk mencegah cedera'
    ]
  },
  {
    testId: 'sprint-30m',
    steps: [
      {
        step: 1,
        description: 'Siapkan lintasan 30 meter yang rata. Pasang cone di start dan finish',
        tips: 'Tambahkan zona run-through 5-10 meter setelah garis finish'
      },
      {
        step: 2,
        description: 'Posisi start: standing start atau 3-point stance, kaki belakang di garis start',
        tips: 'Berat badan condong ke depan, siap meledak'
      },
      {
        step: 3,
        description: 'Aba-aba: "Siap" - atlet siap di posisi, "Ya"/peluit - mulai sprint dan stopwatch',
        tips: 'Timer harus di posisi yang jelas melihat garis finish'
      },
      {
        step: 4,
        description: 'Stop waktu saat dada melewati garis finish. Berikan 2-3 percobaan dengan istirahat cukup',
        tips: 'Ambil waktu terbaik dari semua percobaan'
      }
    ],
    commonMistakes: [
      'Start yang terlalu tegak',
      'Mengurangi kecepatan sebelum garis finish',
      'Istirahat tidak cukup antar percobaan'
    ],
    safetyTips: [
      'Pemanasan sprint pendek sebelum tes',
      'Pastikan lintasan bebas hambatan'
    ]
  },
  {
    testId: 'sit-and-reach',
    steps: [
      {
        step: 1,
        description: 'Siapkan sit and reach box atau bangku dengan penggaris. Posisi 0 cm di tepi bangku',
        tips: 'Bisa juga menggunakan lantai dengan penggaris jika tidak ada box'
      },
      {
        step: 2,
        description: 'Duduk dengan kaki lurus ke depan, telapak kaki rata menempel box/dinding',
        tips: 'Lutut harus tetap lurus sepanjang tes'
      },
      {
        step: 3,
        description: 'Letakkan tangan di atas box, jari-jari menumpuk. Condongkan badan ke depan perlahan',
        tips: 'Gerakan harus halus dan terkontrol, tidak bouncing'
      },
      {
        step: 4,
        description: 'Jangkau sejauh mungkin, tahan posisi 2 detik. Catat jarak terjauh',
        tips: 'Lakukan 3 percobaan, ambil nilai terbaik'
      }
    ],
    commonMistakes: [
      'Menekuk lutut saat reach',
      'Bouncing untuk mendapatkan jarak lebih jauh',
      'Tidak menahan posisi cukup lama'
    ],
    safetyTips: [
      'Pemanasan hamstring sebelum tes',
      'Jangan dipaksa jika terasa nyeri tajam'
    ]
  },
  {
    testId: 'illinois-agility',
    steps: [
      {
        step: 1,
        description: 'Setup: area 10x5 meter dengan 4 cone di sudut dan 4 cone di tengah (jarak 3.3m antar cone tengah)',
        tips: 'Ukur dengan teliti untuk hasil yang konsisten'
      },
      {
        step: 2,
        description: 'Posisi start: berbaring telungkup di garis start, tangan di samping bahu',
        tips: 'Wajah menghadap ke bawah, siap bangun dan sprint'
      },
      {
        step: 3,
        description: 'Aba-aba start: bangun secepat mungkin, sprint lurus, berbelok, weaving antar cone',
        tips: 'Ikuti pola: lurus-belok-weaving-belok-lurus-finish'
      },
      {
        step: 4,
        description: 'Waktu berhenti saat melewati garis finish. Gagal jika menyentuh atau melewatkan cone',
        tips: 'Latih polanya dulu sebelum tes sebenarnya'
      }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=example_illinois',
    commonMistakes: [
      'Menyentuh atau menjatuhkan cone',
      'Melewatkan cone saat weaving',
      'Tidak memotong sudut dengan efisien'
    ],
    safetyTips: [
      'Gunakan sepatu dengan grip yang baik',
      'Pastikan area tes kering dan tidak licin'
    ]
  },
  {
    testId: 't-test',
    steps: [
      {
        step: 1,
        description: 'Setup: bentuk T dengan cone - 1 di start, 1 di tengah (10m), 2 di sisi kiri-kanan (5m dari tengah)',
        tips: 'Gunakan pita pengukur untuk akurasi'
      },
      {
        step: 2,
        description: 'Posisi start: berdiri di cone start, siap sprint',
        tips: 'Stance atletis, siap bergerak ke segala arah'
      },
      {
        step: 3,
        description: 'Pola: sprint ke cone tengah - shuffle kiri - shuffle kanan - shuffle kembali ke tengah - backpedal ke start',
        tips: 'Sentuh setiap cone dengan tangan'
      },
      {
        step: 4,
        description: 'Waktu berhenti saat melewati garis start kembali',
        tips: 'Tidak boleh menyilangkan kaki saat shuffle'
      }
    ],
    commonMistakes: [
      'Menyilangkan kaki saat shuffle (crossover)',
      'Tidak menyentuh cone',
      'Berbalik badan saat backpedal'
    ],
    safetyTips: [
      'Pemanasan lateral movement sebelum tes',
      'Hindari tes pada permukaan yang licin'
    ]
  }
];

export const getTestIllustration = (testId: string): TestIllustration | undefined => {
  return testIllustrations.find(t => t.testId === testId);
};

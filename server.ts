import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface StudentSubmission {
  id: string;
  studentName: string;
  studentId: string; // NIS/NISN
  className: string;
  groupName?: string;
  submittedAt: string;
  stage1: {
    hypothesis: string;
    galvaniPerspective: string;
    voltaPerspective: string;
    conceptSummary: string;
    score: number;
  };
  stage2: {
    electronFlowAnswer: string;
    saltBridgeFunctionAnswer: string;
    ionMigrationAnswer: string;
    completedSimulation: boolean;
    score: number;
  };
  stage3: {
    experimentTable: Array<{
      anode: string;
      cathode: string;
      measuredVoltage: number;
      observedReaction: string;
    }>;
    saltBridgeMade: boolean;
    digitalVoltmeterUsed: boolean;
    score: number;
  };
  stage4: {
    percentErrorZnCu: number;
    errorAnalysisNotes: string;
    cellNotations: Record<string, string>;
    voltaSeriesOrder: string[];
    score: number;
  };
  stage5: {
    hotsAnswers: Record<string, string>;
    hotsScore: number;
    reflection: string;
  };
  totalScore: number;
  maxScore: number;
  teacherFeedback?: string;
  status: 'draft' | 'submitted' | 'graded';
}

interface LKPDConfig {
  title: string;
  subTitle: string;
  author: string;
  classLevel: string;
  stage1Narrative: string;
  stage1Prompt: string;
  saltBridgeGuide: {
    materials: string[];
    steps: string[];
  };
  daniellCellGuide: {
    steps: string[];
    theoreticalZnCu: number;
  };
  metalOptions: Array<{
    symbol: string;
    name: string;
    standardPotential: number;
    color: string;
    ion: string;
  }>;
  hotsQuestions: Array<{
    id: string;
    question: string;
    stimulus: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    competency: string;
  }>;
}

const defaultLKPDConfig: LKPDConfig = {
  title: "LKPD Interaktif: Penyelidikan Sel Volta Berbasis Problem-Based Learning (PBL)",
  subTitle: "Pembelajaran Kimia SMA/SMK Fase F - Elektrokimia & Sel Elektrokimia",
  author: "Nurmawaida, S.Pd",
  classLevel: "Kelas XII",
  stage1Narrative: "Pada tahun 1780, ilmuwan anatomi Italia Luigi Galvani melakukan pembedahan pada paha katak. Ketika paha katak digantung dengan kait kuningan pada terali besi balkon, otot katak tiba-tiba berkedut keras saat kedua logam bersentuhan. Galvani menyimpulkan adanya 'Listrik Hewani' (Animal Electricity) yang tersimpan di dalam jaringan syaraf dan otot katak.\n\nNamun, fisikawan Alessandro Volta meragukan penjelasan tersebut. Melalui serangkaian pengujian tanpa jaringan hewan, Volta membuktikan bahwa katak hanyalah detektor basah. Sumber listrik sesungguhnya berasal dari kontak dua logam berbeda (bimetallic) yang dipisahkan oleh cairan penghantar (elektrolit). Volta kemudian menciptakan 'Tumpukan Volta' (Voltaic Pile)—baterai kimia pertama di dunia dengan menumpuk pelat seng (Zn) dan perak/tembaga (Cu) yang diselingi kain basah air garam.",
  stage1Prompt: "Berdasarkan kontroversi ilmiah antara Galvani dan Volta di atas, analisis perbedaan sudut pandang keduanya dan rumuskan hipotesis ilmiah Anda mengenai apa yang sesungguhnya memicu timbulnya arus listrik!",
  saltBridgeGuide: {
    materials: [
      "1 bungkus agar-agar tawar/plain (tanpa warna)",
      "10 gram garam Kalium Klorida (KCl)",
      "100 mL akuades (air suling)",
      "Pipa kaca bentuk U (atau selang transparan 15-20 cm)",
      "Gelas kimia 250 mL, pembakar bunsen/hotplate, kassa & kaki tiga",
      "Kapas secukupnya untuk penyumbat ujung pipa U"
    ],
    steps: [
      "Larutkan 10 gram KCl dan 3 gram bubuk agar-agar ke dalam 100 mL akuades di dalam gelas kimia.",
      "Panaskan larutan di atas hotplate/pembakar bunsen sambil diaduk perlahan hingga agar-agar larut sempurna dan larutan mulai mendidih jernih.",
      "Siapkan pipa U bersih. Tuangkan larutan agar-agar KCl yang masih panas secara hati-hati ke dalam pipa U hingga hampir penuh (hindari gelembung udara).",
      "Sumbat kedua ujung pipa U dengan sedikit kapas steril agar gel tidak mudah lepas.",
      "Diamkan hingga agar-agar mendingin dan memadat menjadi gel elektrolit semi-padat yang siap menghantarkan ion K⁺ dan Cl⁻."
    ]
  },
  daniellCellGuide: {
    steps: [
      "Tuangkan 100 mL larutan ZnSO4 1 M ke dalam Gelas Kimia A (ruang Anoda).",
      "Tuangkan 100 mL larutan CuSO4 1 M ke dalam Gelas Kimia B (ruang Katoda).",
      "Celupkan lempeng Seng (Zn) ke larutan ZnSO4 dan lempeng Tembaga (Cu) ke larutan CuSO4.",
      "Pasang jembatan garam agar-agar KCl menghubungkan kedua gelas kimia.",
      "Hubungkan kabel probe hitam multimeter (COM / Negatif) ke elektroda Zn dan kabel probe merah (VΩmA / Positif) ke elektroda Cu.",
      "Nyalakan voltmeter digital pada mode DC 20V dan amati pembacaan potensial sel (E°sel)."
    ],
    theoreticalZnCu: 1.10
  },
  metalOptions: [
    { symbol: "Mg", name: "Magnesium", standardPotential: -2.37, color: "#94a3b8", ion: "Mg²⁺" },
    { symbol: "Al", name: "Aluminium", standardPotential: -1.66, color: "#cbd5e1", ion: "Al³⁺" },
    { symbol: "Zn", name: "Seng (Zinc)", standardPotential: -0.76, color: "#94a3b8", ion: "Zn²⁺" },
    { symbol: "Fe", name: "Besi (Iron)", standardPotential: -0.44, color: "#78716c", ion: "Fe²⁺" },
    { symbol: "Cu", name: "Tembaga (Copper)", standardPotential: 0.34, color: "#f97316", ion: "Cu²⁺" }
  ],
  hotsQuestions: [
    {
      id: "hots-1",
      stimulus: "Sebuah sel Daniell (Zn|Zn²⁺||Cu²⁺|Cu) dirangkai dengan konsentrasi masing-masing larutan 1 M. Setelah sel dibiarkan bekerja selama 1 jam menghasilkan arus listrik, apa yang terjadi pada massa kedua elektroda dan konsentrasi ion dalam larutan?",
      question: "Pilihlah pernyataan yang paling tepat mengenai perubahan fisik dan kimia yang terjadi pada anoda dan katoda:",
      options: [
        "Massa Zn berkurang, massa Cu bertambah, [Zn²⁺] meningkat, [Cu²⁺] menurun.",
        "Massa Zn bertambah, massa Cu berkurang, [Zn²⁺] menurun, [Cu²⁺] meningkat.",
        "Kedua elektroda berkurang massanya karena sama-sama melepaskan elektron ke larutan.",
        "Massa Zn berkurang, massa Cu tetap karena Cu hanya bertindak sebagai elektroda inert konduktor.",
        "Konsentrasi kedua ion tetap konstan karena diseimbangkan oleh difusi air dari jembatan garam."
      ],
      correctAnswerIndex: 0,
      explanation: "Pada anoda, terjadi oksidasi Zn(s) -> Zn²⁺(aq) + 2e⁻ sehingga lempeng Zn melarut (massa berkurang) dan [Zn²⁺] naik. Pada katoda, terjadi reduksi Cu²⁺(aq) + 2e⁻ -> Cu(s) sehingga ion Cu²⁺ mengendap di permukaan lempeng Cu (massa bertambah) dan [Cu²⁺] berkurang.",
      competency: "Menganalisis proses elektrokimia pada tingkat mikroskopis dan makroskopis (C4)"
    },
    {
      id: "hots-2",
      stimulus: "Seorang siswa lupa memasang jembatan garam saat merangkai sel volta Zn-Cu. Ketika voltmeter dinyalakan, jarum/layar digital menunjukkan angka 0,00 Volt dan lampu LED indikator tidak menyala sama sekali.",
      question: "Mengapa tanpa jembatan garam rangkaian sel volta tidak dapat menghasilkan arus listrik yang mengalir?",
      options: [
        "Jembatan garam bertindak sebagai sumber energi penggerak elektron utama menggantikan baterai.",
        "Tanpa jembatan garam, terjadi akumulasi muatan positif (Zn²⁺) di anoda dan negatif (SO₄²⁻) di katoda yang seketika menghentikan aliran elektron karena sirkuit terbuka.",
        "Jembatan garam berfungsi mengalirkan elektron bebas secara langsung dari gelas beker katoda kembali ke anoda.",
        "Larutan ZnSO4 dan CuSO4 tidak dapat terionisasi apabila tidak ditambahkan agar-agar KCl.",
        "Voltmeter memerlukan ion K⁺ dan Cl⁻ di dalam kabel pengukurnya agar resistansi voltmeter menjadi tak terhingga."
      ],
      correctAnswerIndex: 1,
      explanation: "Oksidasi menghasilkan kelebihan kation Zn²⁺ di anoda, sedangkan reduksi menghabiskan Cu²⁺ meninggalkan kelebihan anion SO₄²⁻ di katoda. Penumpukan muatan ini menimbulkan gaya tolak elektrostatik yang menghentikan aliran elektron. Jembatan garam menjaga netralitas listrik larutan dengan mendonorkan Cl⁻ ke anoda dan K⁺ ke katoda sekaligus menutup rangkaian listrik.",
      competency: "Mengevaluasi peran fungsional jembatan garam dalam sirkuit sel elektrokimia (C5)"
    },
    {
      id: "hots-3",
      stimulus: "Diberikan data potensial reduksi standar: E° Mg²⁺|Mg = -2,37 V ; E° Al³⁺|Al = -1,66 V ; E° Fe²⁺|Fe = -0,44 V ; E° Cu²⁺|Cu = +0,34 V. Sebuah industri perkapalan ingin memasang pelat logam proteksi katodik untuk melindungi lambung kapal yang terbuat dari besi (Fe) dari korosi air laut.",
      question: "Berdasarkan prinsip deret Volta dan potensial elektroda, logam manakah yang paling efektif dan rasional digunakan sebagai anoda korban (sacrificial anode) untuk melindungi besi?",
      options: [
        "Tembaga (Cu), karena memiliki E° paling positif sehingga menarik elektron menjauhi besi.",
        "Magnesium (Mg) atau Seng (Zn), karena memiliki E° lebih negatif dari Fe sehingga teroksidasi lebih dahulu mengorbankan dirinya.",
        "Hanya Tembaga, karena logam Cu tidak bereaksi dengan ion klorida dalam air laut.",
        "Besi itu sendiri yang dilapisi cat tanpa memerlukan anoda korban dari logam lain.",
        "Logam mulia seperti Emas (Au) karena tidak dapat teroksidasi dalam lingkungan air laut."
      ],
      correctAnswerIndex: 1,
      explanation: "Proteksi katodik (anoda korban) memanfaatkan prinsip deret Volta di mana logam dengan potensial reduksi lebih negatif (terletak di sebelah kiri Fe, seperti Mg atau Zn) akan lebih mudah teroksidasi dan melepaskan elektron ke besi, sehingga besi tetap dalam bentuk tereduksi Fe(s) dan terlindung dari perkaratan.",
      competency: "Menerapkan prinsip sel volta dalam pemecahan masalah teknologi pencegahan korosi (C4/C6)"
    },
    {
      id: "hots-4",
      stimulus: "Dua setengah sel dirangkai: Bejana A berisi larutan Al(NO3)3 dengan elektroda Al, Bejana B berisi larutan Cu(NO3)2 dengan elektroda Cu. (E° Al³⁺/Al = -1,66 V, E° Cu²⁺/Cu = +0,34 V).",
      question: "Notasi sel volta yang benar dan nilai potensial sel standar (E° sel) yang dihasilkan adalah:",
      options: [
        "Al | Al³⁺ || Cu²⁺ | Cu ; E° sel = +2,00 V",
        "Cu | Cu²⁺ || Al³⁺ | Al ; E° sel = -2,00 V",
        "Al³⁺ | Al || Cu | Cu²⁺ ; E° sel = +1,32 V",
        "Al | Al³⁺ || Cu²⁺ | Cu ; E° sel = +1,32 V",
        "Cu²⁺ | Cu || Al | Al³⁺ ; E° sel = +2,00 V"
      ],
      correctAnswerIndex: 0,
      explanation: "Al memiliki E° lebih negatif (-1,66 V) sehingga bertindak sebagai Anoda (oksidasi): Al -> Al³⁺ + 3e⁻. Cu memiliki E° lebih positif (+0,34 V) sehingga bertindak sebagai Katoda (reduksi): Cu²⁺ + 2e⁻ -> Cu. Notasi sel: Anoda | Ion Anoda || Ion Katoda | Katoda => Al | Al³⁺ || Cu²⁺ | Cu. E° sel = E° katoda - E° anoda = (+0,34 V) - (-1,66 V) = +2,00 V.",
      competency: "Menyusun notasi sel dan menghitung potensial sel standar reaksi spontan (C3/C4)"
    }
  ]
};

// In-memory store with local disk persistence backup
let currentLKPDConfig: LKPDConfig = { ...defaultLKPDConfig };
let submissions: StudentSubmission[] = [
  {
    id: "sub-demo-1",
    studentName: "Ahmad Fauzi",
    studentId: "20241001",
    className: "XII MIPA 1",
    groupName: "Kelompok 1 (Faraday)",
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    stage1: {
      hypothesis: "Sumber arus listrik bukan dari otot katak melainkan reaksi redoks spontan saat dua elektroda logam berbeda bersentuhan melalui larutan elektrolit.",
      galvaniPerspective: "Listrik hewani ada di dalam syaraf katak",
      voltaPerspective: "Kontak dua logam bimetal dengan penghantar cairan",
      conceptSummary: "Katak hanya bertindak sebagai konduktor/detektor basah",
      score: 95
    },
    stage2: {
      electronFlowAnswer: "Elektron mengalir dari anoda Zn (potensial lebih rendah/lebih mudah teroksidasi) melalui kawat luar menuju katoda Cu.",
      saltBridgeFunctionAnswer: "Menetralkan kelebihan ion Zn2+ di anoda dengan menyalurkan Cl- dan melengkapi kekurangan kation di katoda dengan K+.",
      ionMigrationAnswer: "Cl- ke kompartemen anoda, K+ ke kompartemen katoda",
      completedSimulation: true,
      score: 100
    },
    stage3: {
      experimentTable: [
        { anode: "Zn", cathode: "Cu", measuredVoltage: 1.08, observedReaction: "Zn melarut perlahan, muncul endapan tembaga cokelat di Cu, jarum 1.08V" },
        { anode: "Mg", cathode: "Cu", measuredVoltage: 2.65, observedReaction: "Reaksi sangat cepat, tegangan tinggi 2.65V" },
        { anode: "Al", cathode: "Cu", measuredVoltage: 1.95, observedReaction: "Muncul gelembung halus, tegangan 1.95V" },
        { anode: "Fe", cathode: "Cu", measuredVoltage: 0.74, observedReaction: "Tegangan 0.74V, larutan Fe menjadi kekuningan" },
        { anode: "Mg", cathode: "Fe", measuredVoltage: 1.88, observedReaction: "Mg teroksidasi kuat, tegangan 1.88V" }
      ],
      saltBridgeMade: true,
      digitalVoltmeterUsed: true,
      score: 95
    },
    stage4: {
      percentErrorZnCu: 1.82,
      errorAnalysisNotes: "Galat sebesar 1.82% kemungkinan disebabkan resistansi dalam kabel kontak dan konsentrasi larutan belum tepat standar 1.00 M.",
      cellNotations: {
        "Zn-Cu": "Zn | Zn²⁺ || Cu²⁺ | Cu",
        "Mg-Cu": "Mg | Mg²⁺ || Cu²⁺ | Cu",
        "Al-Cu": "Al | Al³⁺ || Cu²⁺ | Cu",
        "Fe-Cu": "Fe | Fe²⁺ || Cu²⁺ | Cu"
      },
      voltaSeriesOrder: ["Mg", "Al", "Zn", "Fe", "Cu"],
      score: 100
    },
    stage5: {
      hotsAnswers: {
        "hots-1": "0",
        "hots-2": "1",
        "hots-3": "1",
        "hots-4": "0"
      },
      hotsScore: 100,
      reflection: "Saya sangat memahami konsep sel volta setelah melihat visualisasi mikroskopis transfer ion jembatan garam dan melakukan perakitan sel Daniell secara interaktif."
    },
    totalScore: 98,
    maxScore: 100,
    teacherFeedback: "Analisis galat sangat logis dan notasi sel dituliskan dengan tepat. Pertahankan prestasimu!",
    status: 'graded'
  },
  {
    id: "sub-demo-2",
    studentName: "Siti Rahmawati",
    studentId: "20241018",
    className: "XII MIPA 1",
    groupName: "Kelompok 2 (Daniell)",
    submittedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    stage1: {
      hypothesis: "Aliran listrik timbul karena perbedaan kecenderungan melepas elektron antar logam.",
      galvaniPerspective: "Otot katak menghasilkan listrik hayati",
      voltaPerspective: "Logam berbeda menghasilkan potensial kontak",
      conceptSummary: "Volta terbukti benar melalui tumpukan logam seng-perak",
      score: 90
    },
    stage2: {
      electronFlowAnswer: "Dari anoda ke katoda melalui kabel luar.",
      saltBridgeFunctionAnswer: "Mencegah polarisasi dan menjaga kesetimbangan muatan larutan.",
      ionMigrationAnswer: "Anion ke anoda, kation ke katoda.",
      completedSimulation: true,
      score: 95
    },
    stage3: {
      experimentTable: [
        { anode: "Zn", cathode: "Cu", measuredVoltage: 1.06, observedReaction: "Zn menipis, Cu menebal, terbaca 1.06V" },
        { anode: "Mg", cathode: "Cu", measuredVoltage: 2.62, observedReaction: "Tegangan terukur 2.62V" },
        { anode: "Fe", cathode: "Cu", measuredVoltage: 0.72, observedReaction: "Tegangan terukur 0.72V" }
      ],
      saltBridgeMade: true,
      digitalVoltmeterUsed: true,
      score: 90
    },
    stage4: {
      percentErrorZnCu: 3.64,
      errorAnalysisNotes: "Eksperimen menghasilkan 1.06V vs teori 1.10V, galat 3.64%.",
      cellNotations: {
        "Zn-Cu": "Zn | Zn²⁺ || Cu²⁺ | Cu",
        "Mg-Cu": "Mg | Mg²⁺ || Cu²⁺ | Cu"
      },
      voltaSeriesOrder: ["Mg", "Al", "Zn", "Fe", "Cu"],
      score: 92
    },
    stage5: {
      hotsAnswers: {
        "hots-1": "0",
        "hots-2": "1",
        "hots-3": "1",
        "hots-4": "0"
      },
      hotsScore: 100,
      reflection: "Simulasi mikroskopis sangat membantu membayangkan aliran ion yang tidak kasat mata."
    },
    totalScore: 93,
    maxScore: 100,
    teacherFeedback: "Pekerjaan rapi, perbanyak variasi pasangan logam pada eksperimen berikutnya.",
    status: 'submitted'
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "LKPD Sel Volta PBL System", timestamp: new Date().toISOString() });
  });

  // Get current LKPD configuration (for students and teachers)
  app.get("/api/lkpd-config", (req, res) => {
    res.json({ success: true, data: currentLKPDConfig });
  });

  // Update LKPD configuration (Teacher only)
  app.post("/api/lkpd-config", (req, res) => {
    const updated = req.body;
    if (!updated || typeof updated !== "object") {
      return res.status(400).json({ success: false, error: "Invalid configuration data" });
    }
    currentLKPDConfig = { ...currentLKPDConfig, ...updated };
    res.json({ success: true, message: "Konfigurasi LKPD berhasil diperbarui guru!", data: currentLKPDConfig });
  });

  // Reset LKPD configuration to default
  app.post("/api/lkpd-config/reset", (req, res) => {
    currentLKPDConfig = JSON.parse(JSON.stringify(defaultLKPDConfig));
    res.json({ success: true, message: "Konfigurasi LKPD dikembalikan ke setelan baku", data: currentLKPDConfig });
  });

  // Submit student work
  app.post("/api/submissions", (req, res) => {
    const submission: StudentSubmission = req.body;
    if (!submission.studentName || !submission.className) {
      return res.status(400).json({ success: false, error: "Nama siswa dan kelas wajib diisi." });
    }

    const newSubmission: StudentSubmission = {
      ...submission,
      id: submission.id || `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      submittedAt: new Date().toISOString(),
      status: submission.status || 'submitted'
    };

    // Check if updating existing draft/submission
    const existingIndex = submissions.findIndex(s => s.id === newSubmission.id || (s.studentId && s.studentId === newSubmission.studentId && s.className === newSubmission.className));
    if (existingIndex >= 0) {
      submissions[existingIndex] = newSubmission;
    } else {
      submissions.unshift(newSubmission);
    }

    res.json({
      success: true,
      message: "Tugas LKPD berhasil dikirimkan ke guru!",
      submissionId: newSubmission.id,
      data: newSubmission
    });
  });

  // Get all submissions (Teacher Dashboard)
  app.get("/api/submissions", (req, res) => {
    const { className, search } = req.query;
    let filtered = [...submissions];

    if (className && typeof className === "string" && className !== "all") {
      filtered = filtered.filter(s => s.className.toLowerCase() === className.toLowerCase());
    }

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.studentName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        (s.groupName && s.groupName.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  });

  // Teacher feedback / grade update
  app.put("/api/submissions/:id/feedback", (req, res) => {
    const { id } = req.params;
    const { teacherFeedback, adjustedScore, status } = req.body;

    const sub = submissions.find(s => s.id === id);
    if (!sub) {
      return res.status(404).json({ success: false, error: "Data siswa tidak ditemukan." });
    }

    if (teacherFeedback !== undefined) sub.teacherFeedback = teacherFeedback;
    if (adjustedScore !== undefined) sub.totalScore = Number(adjustedScore);
    if (status !== undefined) sub.status = status;

    res.json({ success: true, message: "Nilai dan umpan balik guru berhasil disimpan.", data: sub });
  });

  // Delete submission
  app.delete("/api/submissions/:id", (req, res) => {
    const { id } = req.params;
    const idx = submissions.findIndex(s => s.id === id);
    if (idx >= 0) {
      submissions.splice(idx, 1);
      res.json({ success: true, message: "Data pengumpulan berhasil dihapus." });
    } else {
      res.status(404).json({ success: false, error: "Data tidak ditemukan." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LKPD Sel Volta PBL Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

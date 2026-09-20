import { LKPDConfig, StudentSubmission, Stage1Answers, Stage2Answers, Stage3Answers, Stage4Answers, Stage5Answers } from '../types';

export const initialLKPDConfig: LKPDConfig = {
  title: "LKPD Interaktif: Penyelidikan Sel Volta Berbasis Problem-Based Learning (PBL)",
  subTitle: "Materi Kimia SMA/SMK Fase F - Sel Elektrokimia & Deret Volta",
  author: "Nurmawaida, S.Pd",
  classLevel: "Kelas XII",
  stage1Narrative: "Pada tahun 1780 di Universitas Bologna, ilmuwan anatomi Italia Luigi Galvani mengamati fenomena tak terduga saat membedah paha katak. Ketika paha katak yang digantung dengan kait kuningan bersentuhan dengan terali besi balkon laboratorium, otot kaki katak tiba-tiba berkedut keras seolah hidup kembali! Galvani menarik kesimpulan bahwa ada 'Listrik Hewani' (Animal Electricity) yang tersimpan alami di dalam serabut syaraf dan cairan otot katak.\n\nNamun, fisikawan Alessandro Volta di Pavia meragukan kesimpulan tersebut. Volta berargumen: 'Katak bukanlah penghasil listrik, melainkan hanya detektor/sensor basah yang sangat sensitif!' Melalui serangkaian eksperimen pembuktian tanpa jaringan hewan sedikitpun, Volta membuktikan bahwa listrik timbul akibat kontak antara DUA LOGAM BERBEDA yang dihubungkan oleh cairan elektrolit penghantar.\n\nVolta kemudian menciptakan 'Tumpukan Volta' (Voltaic Pile, tahun 1800)—baterai kimia pertama dalam sejarah manusia—dengan menumpuk piringan seng (Zn) dan tembaga/perak (Cu) yang dipisahkan kain karton basah berair garam.",
  stage1Prompt: "Berdasarkan sejarah kontroversi ilmiah Luigi Galvani vs Alessandro Volta di atas, bagaimana kedua ilmuwan tersebut memiliki kesimpulan yang berbeda dari fenomena yang sama? Rancanglah hipotesis ilmiah Anda untuk membuktikan sumber arus listrik sebenarnya!",
  saltBridgeGuide: {
    materials: [
      "1 bungkus agar-agar tawar (tanpa rasa & tanpa pewarna)",
      "10 gram garam Kalium Klorida (KCl)",
      "100 mL akuades / air suling",
      "Pipa kaca bentuk U (diameter 1-1,5 cm)",
      "Gelas beker 250 mL, hotplate / pembakar bunsen, pengaduk kaca",
      "Kapas steril untuk penyumbat kedua ujung pipa"
    ],
    steps: [
      "Timbang 10 gram garam KCl dan 3 gram bubuk agar-agar, lalu masukkan ke dalam 100 mL akuades dalam gelas beker.",
      "Panaskan campuran di atas hotplate sambil terus diaduk rata hingga agar-agar larut sempurna dan larutan mendidih jernih (transparan).",
      "Dalam keadaan masih panas dan cair, tuangkan larutan agar-agar KCl secara perlahan ke dalam pipa U hingga penuh (hindari terbentuknya gelembung udara di dalam pipa).",
      "Sumbat kedua mulut ujung pipa U dengan kapas steril secukupnya agar gel agar-agar tidak mudah meluncur keluar saat dibalik.",
      "Biarkan pipa U pada suhu ruang selama 15-20 menit hingga gel memadat sempurna. Jembatan garam agar-agar KCl siap digunakan!"
    ]
  },
  daniellCellGuide: {
    steps: [
      "Siapkan Bejana A: Tuangkan 100 mL larutan ZnSO4 1 M dan celupkan lempeng Seng (Zn) sebagai Anoda (-).",
      "Siapkan Bejana B: Tuangkan 100 mL larutan CuSO4 1 M dan celupkan lempeng Tembaga (Cu) sebagai Katoda (+).",
      "Pasang Jembatan Garam agar-agar KCl dengan kedua kakinya tercelup ke dalam masing-masing larutan bejana A dan B.",
      "Hubungkan kabel probe hitam multimeter (kutub negatif / COM) ke lempeng Zn, dan kabel probe merah multimeter (kutub positif / VΩ) ke lempeng Cu.",
      "Atur saklar putar multimeter digital ke mode Tegangan Searah (DCV 20 V), amati dan catat nilai potensial sel yang tertera pada layar LCD."
    ],
    theoreticalZnCu: 1.10
  },
  metalOptions: [
    { symbol: "Mg", name: "Magnesium", standardPotential: -2.37, color: "#94a3b8", ion: "Mg²⁺" },
    { symbol: "Al", name: "Aluminium", standardPotential: -1.66, color: "#cbd5e1", ion: "Al³⁺" },
    { symbol: "Zn", name: "Seng (Zinc)", standardPotential: -0.76, color: "#64748b", ion: "Zn²⁺" },
    { symbol: "Fe", name: "Besi (Iron)", standardPotential: -0.44, color: "#78716c", ion: "Fe²⁺" },
    { symbol: "Cu", name: "Tembaga (Copper)", standardPotential: 0.34, color: "#f97316", ion: "Cu²⁺" }
  ],
  hotsQuestions: [
    {
      id: "hots-1",
      stimulus: "Sebuah sel Daniell (Zn|Zn²⁺(1M)||Cu²⁺(1M)|Cu) dirangkai dan dihubungkan dengan motor listrik kecil. Setelah sel bekerja selama beberapa waktu, terjadi perubahan fisik dan mikroskopis pada kedua kompartemen elektroda.",
      question: "Manakah pernyataan yang paling tepat mengenai perubahan massa elektroda dan konsentrasi ion dalam larutan?",
      options: [
        "Massa Zn berkurang, massa Cu bertambah, konsentrasi Zn²⁺ meningkat, dan konsentrasi Cu²⁺ menurun.",
        "Massa Zn bertambah karena menerima elektron, massa Cu berkurang, konsentrasi Zn²⁺ menurun, dan Cu²⁺ meningkat.",
        "Kedua elektroda berkurang massanya karena sama-sama melarut dalam larutan elektrolit masing-masing.",
        "Massa Cu tetap konstan karena Cu bertindak sebagai elektroda inert yang tidak ikut bereaksi.",
        "Konsentrasi kedua ion tidak berubah karena laju difusi ion dari jembatan garam persis sama cepat."
      ],
      correctAnswerIndex: 0,
      explanation: "Pada Anoda terjadi oksidasi: Zn(s) → Zn²⁺(aq) + 2e⁻ (massa lempeng Zn berkurang, konsentrasi ion Zn²⁺ naik). Pada Katoda terjadi reduksi: Cu²⁺(aq) + 2e⁻ → Cu(s) (ion Cu²⁺ dari larutan mengendap menjadi Cu logam pada elektroda, sehingga massa Cu bertambah dan konsentrasi ion Cu²⁺ turun).",
      competency: "Menganalisis fenomena mikroskopis & makroskopis sel elektrokimia (C4 - Analisis)"
    },
    {
      id: "hots-2",
      stimulus: "Dalam suatu praktikum, kelompok siswa merangkai sel Zn-Cu namun lupa memasang jembatan garam. Ketika voltmeter dinyalakan, jarum/layar digital hanya sempat bergerak sekejap lalu langsung menunjukkan angka 0,00 Volt.",
      question: "Mengapa tanpa jembatan garam, arus listrik seketika berhenti mengalir pada sel volta?",
      options: [
        "Jembatan garam adalah baterai cadangan yang memberikan daya listrik tambahan ke kawat.",
        "Terjadi akumulasi muatan positif berlebih (Zn²⁺) di anoda dan muatan negatif berlebih (SO₄²⁻) di katoda yang menghentikan aliran elektron karena tidak ada netralitas listrik dan sirkuit terbuka.",
        "Voltmeter digital hanya dapat mengukur beda potensial jika terkena uap garam Kalium Klorida.",
        "Elektron hanya dapat mengalir dari anoda ke katoda jika melewati bagian dalam agar-agar jembatan garam.",
        "Logam seng akan langsung terbungkus lapisan oksida tebal jika tidak terkena ion kalium dari jembatan garam."
      ],
      correctAnswerIndex: 1,
      explanation: "Oksidasi terus menghasilkan kation Zn²⁺ di anoda, sedangkan reduksi menghabiskan kation Cu²⁺ menyisakan anion SO₄²⁻ berlebih di katoda. Tanpa jembatan garam yang menyuplai Cl⁻ ke anoda dan K⁺ ke katoda, ketidakseimbangan muatan ini menghasilkan gaya elektrostatik penahan yang seketika menghentikan aliran elektron (sirkuit menjadi open-loop).",
      competency: "Mengevaluasi fungsi jembatan garam dalam menjaga netralitas listrik sirkuit tertutup (C5 - Evaluasi)"
    },
    {
      id: "hots-3",
      stimulus: "Diberikan data potensial reduksi standar beberapa logam: E° Mg²⁺|Mg = -2,37 V ; E° Al³⁺|Al = -1,66 V ; E° Zn²⁺|Zn = -0,76 V ; E° Fe²⁺|Fe = -0,44 V ; E° Cu²⁺|Cu = +0,34 V. Sebuah perusahaan konstruksi dermaga laut ingin melindungi tiang pancang baja/besi (Fe) dari korosi air laut menggunakan metode perlindungan katodik (anoda korban).",
      question: "Berdasarkan prinsip deret Volta, logam manakah yang paling tepat dipasangkan sebagai anoda korban untuk melindungi besi, serta apa alasannya?",
      options: [
        "Tembaga (Cu), karena E° sel Cu lebih positif sehingga tembaga akan menyerap ion oksigen perusak.",
        "Magnesium (Mg) atau Seng (Zn), karena memiliki potensial reduksi lebih negatif daripada Fe, sehingga logam tersebut akan teroksidasi lebih dahulu mengorbankan dirinya demi menjaga Fe tetap tereduksi.",
        "Hanya Tembaga (Cu), karena tembaga lebih mahal dan tahan karat dibanding besi.",
        "Besi itu sendiri yang dilapisi minyak karena logam lain akan meracuni ekosistem laut.",
        "Aluminium saja dan harus dihubungkan dengan sumber arus listrik bolak-balik (AC)."
      ],
      correctAnswerIndex: 1,
      explanation: "Metode anoda korban memanfaatkan logam dengan potensial elektroda yang lebih negatif (lebih mudah teroksidasi / reduktor lebih kuat) dibanding besi. Mg (-2,37 V) dan Zn (-0,76 V) berada di sebelah kiri Fe (-0,44 V) pada deret Volta, sehingga akan melepaskan elektron ke besi dan terkorosi lebih dahulu, melindungi struktur besi dari perkaratan.",
      competency: "Menerapkan prinsip deret Volta dalam teknologi pemecahan masalah korosi (C4/C6 - Aplikasi & Kreasi)"
    },
    {
      id: "hots-4",
      stimulus: "Dua bejana elektrokimia dihubungkan dengan jembatan garam. Bejana pertama berisi batang Aluminium dalam larutan Al(NO3)3 1 M (E° Al³⁺|Al = -1,66 V). Bejana kedua berisi batang Tembaga dalam larutan Cu(NO3)2 1 M (E° Cu²⁺|Cu = +0,34 V).",
      question: "Notasi sel volta yang menyatakan reaksi spontan tersebut beserta nilai potensial sel standar (E° sel) yang dihasilkan adalah:",
      options: [
        "Al | Al³⁺ || Cu²⁺ | Cu ; E° sel = +2,00 Volt",
        "Cu | Cu²⁺ || Al³⁺ | Al ; E° sel = -2,00 Volt",
        "Al³⁺ | Al || Cu | Cu²⁺ ; E° sel = +1,32 Volt",
        "Al | Al³⁺ || Cu²⁺ | Cu ; E° sel = +1,32 Volt",
        "Cu²⁺ | Cu || Al | Al³⁺ ; E° sel = +2,00 Volt"
      ],
      correctAnswerIndex: 0,
      explanation: "Al memiliki E° lebih negatif (-1,66 V) sehingga menjadi Anoda (oksidasi): Al → Al³⁺ + 3e⁻. Cu memiliki E° lebih positif (+0,34 V) sehingga menjadi Katoda (reduksi): Cu²⁺ + 2e⁻ → Cu. Notasi sel: Anoda | Ion Anoda || Ion Katoda | Katoda = Al | Al³⁺ || Cu²⁺ | Cu. Potensial sel standar E° sel = E° katoda - E° anoda = (+0,34 V) - (-1,66 V) = +2,00 V.",
      competency: "Menyusun notasi sel volta standar dan menghitung beda potensial sel reaksi spontan (C3/C4)"
    }
  ]
};

export const initialStage1Answers: Stage1Answers = {
  hypothesis: "",
  galvaniPerspective: "",
  voltaPerspective: "",
  conceptSummary: "",
  score: 0
};

export const initialStage2Answers: Stage2Answers = {
  electronFlowAnswer: "",
  saltBridgeFunctionAnswer: "",
  ionMigrationAnswer: "",
  completedSimulation: false,
  score: 0
};

export const initialStage3Answers: Stage3Answers = {
  experimentTable: [],
  saltBridgeMade: false,
  digitalVoltmeterUsed: false,
  score: 0
};

export const initialStage4Answers: Stage4Answers = {
  percentErrorZnCu: 0,
  errorAnalysisNotes: "",
  cellNotations: {},
  voltaSeriesOrder: ["Zn", "Cu", "Mg", "Al", "Fe"], // scrambled initially
  score: 0
};

export const initialStage5Answers: Stage5Answers = {
  hotsAnswers: {},
  hotsScore: 0,
  reflection: ""
};

// Calculate standard cell potential
export function calculateTheoreticalPotential(anodeSymbol: string, cathodeSymbol: string, metals: LKPDConfig['metalOptions']): number {
  const anode = metals.find(m => m.symbol === anodeSymbol);
  const cathode = metals.find(m => m.symbol === cathodeSymbol);
  if (!anode || !cathode) return 0;
  // E°cell = E°cathode - E°anode
  const eCell = cathode.standardPotential - anode.standardPotential;
  return Number(eCell.toFixed(2));
}

// Calculate Percent Error formula: |Theoretical - Experimental| / Theoretical * 100%
export function calculatePercentError(theoretical: number, experimental: number): number {
  if (theoretical === 0) return 0;
  const err = (Math.abs(theoretical - experimental) / Math.abs(theoretical)) * 100;
  return Number(err.toFixed(2));
}

// Check standard volta order (for Mg, Al, Zn, Fe, Cu)
// Standard order: Mg (-2.37) < Al (-1.66) < Zn (-0.76) < Fe (-0.44) < Cu (+0.34)
export const CORRECT_VOLTA_ORDER = ["Mg", "Al", "Zn", "Fe", "Cu"];

import React, { useState, useEffect } from 'react';
import { Stage4Answers, Stage3Answers, LKPDConfig } from '../types';
import { calculatePercentError, CORRECT_VOLTA_ORDER } from '../utils/defaults';
import { 
  Calculator, 
  Binary, 
  ArrowLeftRight, 
  CheckCircle2, 
  Check,
  Sparkles, 
  ArrowRight, 
  FileText, 
  MoveLeft, 
  MoveRight, 
  HelpCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Stage4Props {
  answers: Stage4Answers;
  stage3Data: Stage3Answers;
  onSaveAnswers: (answers: Stage4Answers) => void;
  config: LKPDConfig;
  onNextStage: () => void;
  onPrevStage: () => void;
}

export const Stage4DevelopAndPresent: React.FC<Stage4Props> = ({
  answers,
  stage3Data,
  onSaveAnswers,
  config,
  onNextStage,
  onPrevStage
}) => {
  const [formData, setFormData] = useState<Stage4Answers>({ ...answers });

  // Galat % Inputs
  const theoreticalZnCu = config.daniellCellGuide.theoreticalZnCu; // 1.10 V
  // Find measured Zn-Cu from stage 3 if available
  const znCuRow = stage3Data.experimentTable.find(
    r => (r.anode === 'Zn' && r.cathode === 'Cu') || (r.anode === 'Cu' && r.cathode === 'Zn')
  );
  const initialExpV = znCuRow ? Math.abs(znCuRow.measuredVoltage) : 1.08;

  const [expVoltageInput, setExpVoltageInput] = useState<number>(initialExpV);
  const [calculatedError, setCalculatedError] = useState<number>(
    calculatePercentError(theoreticalZnCu, initialExpV)
  );

  // Cell Notations State
  const defaultPairs = [
    { key: "Zn-Cu", name: "Sel Daniell (Seng - Tembaga)", defaultCorrect: "Zn | Zn²⁺ || Cu²⁺ | Cu" },
    { key: "Mg-Cu", name: "Sel Magnesium - Tembaga", defaultCorrect: "Mg | Mg²⁺ || Cu²⁺ | Cu" },
    { key: "Al-Cu", name: "Sel Aluminium - Tembaga", defaultCorrect: "Al | Al³⁺ || Cu²⁺ | Cu" },
    { key: "Fe-Cu", name: "Sel Besi - Tembaga", defaultCorrect: "Fe | Fe²⁺ || Cu²⁺ | Cu" },
    { key: "Mg-Fe", name: "Sel Magnesium - Besi", defaultCorrect: "Mg | Mg²⁺ || Fe²⁺ | Fe" }
  ];

  const [cellNotations, setCellNotations] = useState<Record<string, string>>({
    "Zn-Cu": answers.cellNotations["Zn-Cu"] || "Zn | Zn²⁺ || Cu²⁺ | Cu",
    "Mg-Cu": answers.cellNotations["Mg-Cu"] || "",
    "Al-Cu": answers.cellNotations["Al-Cu"] || "",
    "Fe-Cu": answers.cellNotations["Fe-Cu"] || "",
    "Mg-Fe": answers.cellNotations["Mg-Fe"] || "",
    ...answers.cellNotations
  });

  const [activeInputPair, setActiveInputPair] = useState<string>("Zn-Cu");

  // Volta Series Drag/Reorder State
  const [voltaOrder, setVoltaOrder] = useState<string[]>(
    answers.voltaSeriesOrder && answers.voltaSeriesOrder.length === 5 
      ? answers.voltaSeriesOrder 
      : ["Zn", "Cu", "Mg", "Al", "Fe"]
  );
  const [isVoltaCorrect, setIsVoltaCorrect] = useState<boolean | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // Recalculate percent error whenever input changes
  useEffect(() => {
    const err = calculatePercentError(theoreticalZnCu, expVoltageInput);
    setCalculatedError(err);
  }, [expVoltageInput, theoreticalZnCu]);

  // Insert chemical symbol into active notation input
  const handleInsertSymbol = (symbol: string) => {
    setCellNotations(prev => {
      const current = prev[activeInputPair] || "";
      return {
        ...prev,
        [activeInputPair]: current + symbol
      };
    });
  };

  // Reorder Volta Series
  const moveMetal = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= voltaOrder.length) return;
    const nextList = [...voltaOrder];
    const temp = nextList[index];
    nextList[index] = nextList[newIdx];
    nextList[newIdx] = temp;
    setVoltaOrder(nextList);
    setIsVoltaCorrect(null);
  };

  const handleCheckVolta = () => {
    const matches = voltaOrder.every((metal, i) => metal === CORRECT_VOLTA_ORDER[i]);
    setIsVoltaCorrect(matches);
    if (matches) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  // Check notation accuracy
  const isNotationValid = (pairKey: string, text: string) => {
    const clean = text.replace(/\s+/g, '');
    if (pairKey === 'Zn-Cu') return clean.includes('Zn|Zn²⁺||Cu²⁺|Cu') || clean.includes('Zn|Zn2+||Cu2+|Cu');
    if (pairKey === 'Mg-Cu') return clean.includes('Mg|Mg²⁺||Cu²⁺|Cu') || clean.includes('Mg|Mg2+||Cu2+|Cu');
    if (pairKey === 'Al-Cu') return clean.includes('Al|Al³⁺||Cu²⁺|Cu') || clean.includes('Al|Al3+||Cu2+|Cu');
    if (pairKey === 'Fe-Cu') return clean.includes('Fe|Fe²⁺||Cu²⁺|Cu') || clean.includes('Fe|Fe2+||Cu2+|Cu');
    if (pairKey === 'Mg-Fe') return clean.includes('Mg|Mg²⁺||Fe²⁺|Fe') || clean.includes('Mg|Mg2+||Fe2+|Fe');
    return text.length > 5;
  };

  const handleSave = () => {
    let score = 0;
    // Error calculation & analysis
    if (calculatedError >= 0 && formData.errorAnalysisNotes.trim().length > 15) score += 30;
    // Cell notations accuracy
    let notationCount = 0;
    defaultPairs.forEach(p => {
      if (isNotationValid(p.key, cellNotations[p.key] || "")) notationCount++;
    });
    score += Math.min(35, notationCount * 7);
    // Volta Series
    const voltaMatch = voltaOrder.every((metal, i) => metal === CORRECT_VOLTA_ORDER[i]);
    if (voltaMatch) score += 35; else score += 15;

    const updated: Stage4Answers = {
      ...formData,
      percentErrorZnCu: calculatedError,
      cellNotations,
      voltaSeriesOrder: voltaOrder,
      score
    };
    setFormData(updated);
    onSaveAnswers(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12" id="stage4-container">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-800 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide backdrop-blur-xs mb-3 border border-white/20">
            <FileText className="w-3.5 h-3.5" />
            <span>TAHAP 4: MENGEMBANGKAN & MENYAJIKAN HASIL KARYA (PBL)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Analisis Galat Eksperimen, Notasi Sel & Rekonstruksi Deret Volta
          </h1>
          <p className="mt-2 text-sm sm:text-base text-purple-100 max-w-3xl leading-relaxed">
            Olah data penyelidikan Anda: hitung persentase kesalahan (galat) hasil ukur vs teoritis, susun notasi sel volta standar, dan urutkan logam berdasarkan daya desak reduksinya!
          </p>
        </div>
      </div>

      {/* Section 1: Percent Error Calculation (% Galat) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            4.1
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Perhitungan Galat Persen (% Error) Sel Daniell (Zn - Cu)
            </h2>
            <p className="text-xs text-slate-500">
              Bandingkan nilai $E^\circ$ teoritis (1,10 V) dengan potensial sel yang terbaca pada voltmeter laboratorium Anda.
            </p>
          </div>
        </div>

        {/* Formula Presentation Box */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Rumus Perhitungan Galat Relatif (% Error):
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-sm text-slate-800 text-center shadow-xs">
              Galat (%) = <span className="text-purple-700 font-bold">| E°teoritis - Eeksperimen |</span> / <span className="text-slate-700 font-bold">E°teoritis</span> × 100%
            </div>
            <p className="text-[11px] text-slate-500">
              *E° teoritis Zn-Cu = E°katoda (Cu) - E°anoda (Zn) = (+0,34 V) - (-0,76 V) = <b>1,10 Volt</b>.
            </p>
          </div>

          {/* Interactive Calculation Card */}
          <div className="w-full md:w-80 bg-white p-4 rounded-xl border-2 border-purple-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-semibold">E° Teoritis (Zn-Cu):</span>
              <span className="font-mono font-bold text-slate-900">1.10 V</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                E Eksperimen Siswa (Volt):
              </label>
              <input
                type="number"
                step="0.01"
                value={expVoltageInput}
                onChange={(e) => setExpVoltageInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Hasil Galat (%):</span>
              <span className="text-lg font-mono font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                {calculatedError}%
              </span>
            </div>
          </div>
        </div>

        {/* Error Factor Analysis Reflection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Analisis Ilmiah Faktor Penyebab Galat Eksperimen:
          </label>
          <p className="text-[11px] text-slate-500">
            Bila ada perbedaan nilai antara hasil pengukuran dengan nilai teori 1,10 V, jelaskan kemungkinan faktor penyebabnya (misal: resistansi internal kabel multimeter, pembentukan lapisan oksida pada logam seng, konsentrasi larutan belum tepat standar 1 M, atau difusi jembatan garam).
          </p>
          <textarea
            rows={3}
            value={formData.errorAnalysisNotes}
            onChange={(e) => setFormData({ ...formData, errorAnalysisNotes: e.target.value })}
            placeholder="Uraikan analisis ilmiah faktor ketidaksempurnaan pengukuran sel Daniell Anda..."
            className="w-full p-3 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Section 2: Writing Complete Cell Notations */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            4.2
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Penulisan Notasi Sel Volta Standar (Cell Notation)
            </h2>
            <p className="text-xs text-slate-500">
              Format standar IUPAC: <b>Anoda | Ion Anoda (1 M) || Ion Katoda (1 M) | Katoda</b>
            </p>
          </div>
        </div>

        {/* Quick Symbol Insert Toolbar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-600 mr-2">Tombol Simbol Cepat:</span>
          {["|", "||", "²⁺", "³⁺", "(1 M)", "(aq)", "(s)", "Zn", "Cu", "Mg", "Al", "Fe"].map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => handleInsertSymbol(` ${sym} `)}
              className="px-2.5 py-1 text-xs font-mono font-semibold bg-white text-slate-800 border border-slate-300 rounded-md hover:bg-slate-100 hover:border-slate-400 active:scale-95 transition-all"
            >
              {sym}
            </button>
          ))}
          <span className="text-[10px] text-slate-400 ml-auto hidden sm:inline">
            *Klik untuk memasukkan ke input aktif
          </span>
        </div>

        {/* Input Rows for Different Metal Pairs */}
        <div className="space-y-4">
          {defaultPairs.map((pair) => {
            const currentVal = cellNotations[pair.key] || "";
            const isValid = isNotationValid(pair.key, currentVal);

            return (
              <div 
                key={pair.key}
                onClick={() => setActiveInputPair(pair.key)}
                className={`p-4 rounded-xl border transition-all ${
                  activeInputPair === pair.key 
                    ? 'border-blue-500 ring-1 ring-blue-500/30 bg-blue-50/20' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-slate-900">{pair.name}</span>
                  <div className="flex items-center space-x-2">
                    {isValid ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Format Sesuai</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600">
                        Belum lengkap
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={currentVal}
                    onFocus={() => setActiveInputPair(pair.key)}
                    onChange={(e) => setCellNotations({ ...cellNotations, [pair.key]: e.target.value })}
                    placeholder={`Contoh: ${pair.defaultCorrect}`}
                    className="flex-1 px-3 py-2 text-xs font-mono font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setCellNotations({ ...cellNotations, [pair.key]: pair.defaultCorrect })}
                    className="px-2.5 py-2 text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 whitespace-nowrap"
                    title="Isi format otomatis jika ragu"
                  >
                    Bantu Format
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Ordering Metals in Volta Series (Daya Desak Reduksi) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              4.3
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Rekonstruksi Deret Volta Berdasarkan Daya Desak Reduksi
              </h2>
              <p className="text-xs text-slate-500">
                Urutkan kelima logam (Mg, Al, Zn, Fe, Cu) dari yang <b>paling mudah teroksidasi (reduktor terkuat)</b> di sebelah kiri hingga yang <b>paling mudah tereduksi</b> di sebelah kanan!
              </p>
            </div>
          </div>
        </div>

        {/* Concept Scaffold Box */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
          <div className="font-bold flex items-center space-x-1 text-amber-950">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Prinsip Daya Desak Logam (Hukum Pendesakan):</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            Logam yang terletak di <b>sebelah kiri</b> dalam Deret Volta memiliki $E^\circ$ lebih negatif, bertindak sebagai <b>reduktor kuat</b>, dan <b>mampu mendesak (mereduksi)</b> ion-ion logam di sebelah kanannya dari larutan. Sebaliknya, logam di sebelah kanan tidak mampu mendesak logam di sebelah kirinya!
          </p>
        </div>

        {/* Interactive Reordering Blocks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-2">
            <span className="text-red-600">⮜ Makin Mudah Teroksidasi (E° Makin Negatif)</span>
            <span className="text-emerald-600">Makin Mudah Tereduksi (E° Makin Positif) ➔</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {voltaOrder.map((symbol, idx) => {
              const metalInfo = config.metalOptions.find(m => m.symbol === symbol);

              return (
                <div
                  key={symbol}
                  className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-3 flex flex-col items-center justify-between shadow-xs hover:border-slate-400 transition-all text-center"
                >
                  <span className="text-[10px] font-bold text-slate-400 mb-1">Posisi {idx + 1}</span>
                  
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-sm mb-1"
                    style={{ backgroundColor: metalInfo?.color || '#334155' }}
                  >
                    {symbol}
                  </div>

                  <span className="text-xs font-bold text-slate-800">{metalInfo?.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 mb-3">
                    E° = {metalInfo && metalInfo.standardPotential > 0 ? `+${metalInfo.standardPotential}` : metalInfo?.standardPotential} V
                  </span>

                  {/* Move Left / Right Buttons */}
                  <div className="flex items-center space-x-1.5 w-full pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveMetal(idx, 'left')}
                      className="flex-1 py-1 bg-white hover:bg-slate-200 disabled:opacity-30 rounded border border-slate-200 text-slate-700 flex items-center justify-center"
                      title="Geser ke kiri"
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === voltaOrder.length - 1}
                      onClick={() => moveMetal(idx, 'right')}
                      className="flex-1 py-1 bg-white hover:bg-slate-200 disabled:opacity-30 rounded border border-slate-200 text-slate-700 flex items-center justify-center"
                      title="Geser ke kanan"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation Button & Result */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCheckVolta}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors"
            >
              <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
              <span>Verifikasi Urutan Deret Volta</span>
            </button>

            {isVoltaCorrect !== null && (
              <div className={`text-xs font-bold flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                isVoltaCorrect 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {isVoltaCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>LUAR BIASA! Urutan Deret Volta Anda BENAR: Mg &lt; Al &lt; Zn &lt; Fe &lt; Cu.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Urutan belum tepat. Cermati nilai E°: Logam dengan E° paling negatif berada di paling kiri!</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onPrevStage}
          className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
        >
          Kembali ke Tahap 3
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Jawaban Tahap 4</span>
          </button>
          {saveToast && (
            <span className="text-xs font-semibold text-emerald-600 animate-in fade-in duration-150">
              Tersimpan! (Skor: {formData.score}/100)
            </span>
          )}
        </div>

        <button
          onClick={() => {
            handleSave();
            onNextStage();
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all"
        >
          <span>Lanjut ke Tahap 5: Evaluasi HOTS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Stage1Answers, LKPDConfig } from '../types';
import { 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lightbulb, 
  FlaskConical, 
  RotateCcw,
  Zap,
  Flame,
  Info
} from 'lucide-react';

interface Stage1Props {
  answers: Stage1Answers;
  onSaveAnswers: (answers: Stage1Answers) => void;
  config: LKPDConfig;
  onNextStage: () => void;
}

export const Stage1ProblemOrientation: React.FC<Stage1Props> = ({
  answers,
  onSaveAnswers,
  config,
  onNextStage
}) => {
  const [formData, setFormData] = useState<Stage1Answers>({ ...answers });
  const [frogKicking, setFrogKicking] = useState(false);
  const [voltaActive, setVoltaActive] = useState(false);
  const [showScaffoldingHint, setShowScaffoldingHint] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleFrogExperiment = () => {
    setFrogKicking(true);
    setTimeout(() => setFrogKicking(false), 1200);
  };

  const handleSave = () => {
    // Scoring logic for Stage 1: checks completeness of scaffolding fields
    let stageScore = 0;
    if (formData.galvaniPerspective.trim().length > 15) stageScore += 25;
    if (formData.voltaPerspective.trim().length > 15) stageScore += 25;
    if (formData.conceptSummary.trim().length > 15) stageScore += 25;
    if (formData.hypothesis.trim().length > 20) stageScore += 25;

    const updated = { ...formData, score: stageScore };
    setFormData(updated);
    onSaveAnswers(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12" id="stage1-container">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide backdrop-blur-xs mb-3 border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>TAHAP 1: ORIENTASI MASALAH (PBL)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Misteri Listrik: Kontroversi Galvani vs. Tumpukan Volta
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-3xl leading-relaxed">
            Pahamilah perbedaan paradigma antara Luigi Galvani (listrik hewani) dan Alessandro Volta (bimetal & elektrolit). Telusuri bagaimana perdebatan ilmiah bersejarah ini melahirkan konsep Sel Elektrokimia modern!
          </p>
        </div>
      </div>

      {/* Historical Narrative Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            1.1
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Narasi Sejarah: Dari Paha Katak ke Baterai Kimia Pertama</h2>
            <p className="text-xs text-slate-500">Cermati kronologi dan fenomena ilmiah berikut ini.</p>
          </div>
        </div>

        {/* Narrative Text */}
        <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-5 rounded-xl border border-slate-200/70 whitespace-pre-line">
          {config.stage1Narrative}
        </div>

        {/* Interactive Dual-Simulation: Galvani vs Volta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Simulation A: Galvani Frog Muscle */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Eksperimen Galvani (1780)
                </span>
                <span className="text-[11px] text-slate-500">Listrik Hewani</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Kedutan Otot Katak & Dua Logam</h3>
              <p className="text-xs text-slate-600 mb-4">
                Kait kuningan (Cu-Zn) dipasang pada syaraf paha katak, lalu disentuhkan ke terali besi (Fe).
              </p>

              {/* Graphic Frog Canvas */}
              <div className="h-44 bg-slate-900 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono">
                  Balkon Laboratorium Bologna
                </div>

                {/* Frog Leg & Electrodes Representation */}
                <div className="relative flex flex-col items-center">
                  {/* Brass Hook */}
                  <div className="w-1.5 h-10 bg-amber-400 rounded-full shadow-sm" />
                  <div className="text-[10px] text-amber-300 font-semibold mb-1">Kait Kuningan (Brass)</div>

                  {/* Muscle body */}
                  <div className={`transition-all duration-300 ${frogKicking ? 'scale-110 rotate-12 text-emerald-400' : 'text-emerald-500'}`}>
                    <svg viewBox="0 0 100 80" className="w-24 h-20 fill-current">
                      <path d="M50 10 C30 10, 20 30, 25 50 C28 60, 40 70, 50 75 C60 70, 72 60, 75 50 C80 30, 70 10, 50 10 Z" />
                      <circle cx="38" cy="25" r="4" fill="#1e293b" />
                      <circle cx="62" cy="25" r="4" fill="#1e293b" />
                      {/* Twitching Legs */}
                      <path d={frogKicking ? "M25 50 L5 80 L-10 65" : "M25 50 L15 75 L5 70"} stroke="#10b981" strokeWidth="6" strokeLinecap="round" fill="none" />
                      <path d={frogKicking ? "M75 50 L95 80 L110 65" : "M75 50 L85 75 L95 70"} stroke="#10b981" strokeWidth="6" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>

                  {/* Iron Bar Contact */}
                  <div className="w-32 h-2 bg-slate-400 rounded-full mt-2 shadow-xs" />
                  <div className="text-[10px] text-slate-300 font-semibold mt-1">Terali Besi (Iron Railing)</div>

                  {frogKicking && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="px-2 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full animate-ping">
                        ⚡ ZZZT! BERKEDUT!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleFrogExperiment}
              className="mt-4 w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Sentuhkan Logam ke Otot Katak</span>
            </button>
          </div>

          {/* Simulation B: Voltaic Pile */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  Invensi Volta (1800)
                </span>
                <span className="text-[11px] text-slate-500">Baterai Kimia Pertama</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Tumpukan Volta (Voltaic Pile)</h3>
              <p className="text-xs text-slate-600 mb-4">
                Tumpukan berselang-seling: Cakram Seng (Zn) - Kain Garam (Elektrolit) - Cakram Tembaga (Cu).
              </p>

              {/* Graphic Voltaic Pile Canvas */}
              <div className="h-44 bg-slate-900 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono">
                  Pavia, Italia (Tanpa Hewan)
                </div>

                <div className="flex items-center space-x-6">
                  {/* The Discs Stack */}
                  <div className="flex flex-col items-center space-y-1">
                    {[1, 2, 3].map((layer) => (
                      <div key={layer} className="flex flex-col items-center space-y-0.5">
                        <div className="w-16 h-2 bg-orange-500 rounded-xs" title="Tembaga (Cu)" />
                        <div className="w-14 h-1.5 bg-blue-400 rounded-xs" title="Kain basah air garam" />
                        <div className="w-16 h-2 bg-slate-400 rounded-xs" title="Seng (Zn)" />
                      </div>
                    ))}
                    <div className="text-[9px] text-slate-400 font-mono mt-1">Discs Zn-Salt-Cu</div>
                  </div>

                  {/* Wire & Bulb */}
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-full border-2 transition-all ${
                      voltaActive 
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/50 scale-110' 
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      <Lightbulb className={`w-8 h-8 ${voltaActive ? 'fill-current' : ''}`} />
                    </div>
                    <span className="text-[11px] font-mono mt-2 font-bold text-slate-300">
                      {voltaActive ? "1,10 V (Arus Mengalir!)" : "0,00 V (Saklar Mati)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setVoltaActive(!voltaActive)}
              className={`mt-4 w-full py-2 px-3 text-xs font-bold rounded-lg shadow-xs flex items-center justify-center space-x-1.5 transition-colors ${
                voltaActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>{voltaActive ? "Putus Hubungan Arus" : "Sambungkan Sirkuit Tumpukan Volta"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Scaffolding Guided Reflection & Hypothesis Formulation */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              1.2
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Scaffolding: Analisis Masalah & Rumusan Hipotesis</h2>
              <p className="text-xs text-slate-500">Jawablah pertanyaan terpandu di bawah untuk merumuskan akar masalah ilmiah.</p>
            </div>
          </div>

          <button
            onClick={() => setShowScaffoldingHint(!showScaffoldingHint)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Petunjuk Scaffolding</span>
          </button>
        </div>

        {/* Hint banner if clicked */}
        {showScaffoldingHint && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2 animate-in fade-in duration-150">
            <div className="font-bold flex items-center space-x-1.5 text-amber-950">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Bimbingan Berpikir Ilmiah (Scaffolding Tips):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>Perhatikan jenis logam yang digunakan Galvani (kuningan dan besi) serta cairan dalam otot katak (elektrolit biologis).</li>
              <li>Apakah hewan hidup diperlukan untuk menghasilkan listrik, atau adakah peran esensial dari perbedaan potensial antar dua logam?</li>
              <li>Format rumusan hipotesis yang baik: <i>"Jika [variabel bebas: jenis pasangan logam dan larutan elektrolit dirangkai], maka [variabel terikat: akan timbul beda potensial/arus listrik] karena [alasan ilmiah: transfer elektron spontan]."</i></li>
            </ul>
          </div>
        )}

        {/* Scaffolded Question 1 */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            A. Apa argumen utama Luigi Galvani mengenai penyebab otot paha katak berkedut?
          </label>
          <textarea
            rows={2}
            value={formData.galvaniPerspective}
            onChange={(e) => setFormData({ ...formData, galvaniPerspective: e.target.value })}
            placeholder="Tuliskan pemikiran Galvani mengenai 'listrik hewani'..."
            className="w-full p-3 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Scaffolded Question 2 */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            B. Bagaimana Alessandro Volta membantah teori Galvani dan apa bukti krusial yang ia ciptakan?
          </label>
          <textarea
            rows={2}
            value={formData.voltaPerspective}
            onChange={(e) => setFormData({ ...formData, voltaPerspective: e.target.value })}
            placeholder="Jelaskan peran dua logam berbeda, cairan garam, dan konsep tumpukan Volta..."
            className="w-full p-3 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Scaffolded Question 3 */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            C. Dari dua pandangan tersebut, sintesiskan: Apakah sesungguhnya fungsi cairan elektrolit dan dua logam berbeda?
          </label>
          <textarea
            rows={2}
            value={formData.conceptSummary}
            onChange={(e) => setFormData({ ...formData, conceptSummary: e.target.value })}
            placeholder="Sintesiskan konsep transfer elektron antar logam melalui medium elektrolit..."
            className="w-full p-3 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Scaffolded Question 4: Hypothesis */}
        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[11px] font-bold">RUMUSAN HIPOTESIS</span>
            <label className="text-xs font-bold text-blue-950">
              D. Rumuskan Hipotesis Penyelidikan Anda Sebelum Melakukan Percobaan Sel Volta:
            </label>
          </div>
          <p className="text-[11px] text-slate-500">
            Gunakan pola: <i>"Jika dua logam dengan kecenderungan melepas elektron berbeda dicelupkan ke larutan elektrolit dan dihubungkan, maka..."</i>
          </p>
          <textarea
            rows={3}
            value={formData.hypothesis}
            onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
            placeholder="Tuliskan hipotesis ilmiah kelompok Anda di sini..."
            className="w-full p-3 text-xs text-slate-800 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Jawaban Tahap 1</span>
            </button>
            {saveToast && (
              <span className="text-xs font-semibold text-emerald-600 animate-in fade-in duration-150">
                Tersimpan di sistem! (Skor: {formData.score}/100)
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
            <span>Lanjut ke Tahap 2: Visualisasi Aliran & TCK</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

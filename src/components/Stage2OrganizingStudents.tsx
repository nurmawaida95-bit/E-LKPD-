import React, { useState, useEffect } from 'react';
import { Stage2Answers } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Sliders, 
  AlertCircle, 
  HelpCircle,
  Layers,
  ArrowLeftRight
} from 'lucide-react';

interface Stage2Props {
  answers: Stage2Answers;
  onSaveAnswers: (answers: Stage2Answers) => void;
  onNextStage: () => void;
  onPrevStage: () => void;
}

export const Stage2OrganizingStudents: React.FC<Stage2Props> = ({
  answers,
  onSaveAnswers,
  onNextStage,
  onPrevStage
}) => {
  const [formData, setFormData] = useState<Stage2Answers>({ ...answers });
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasSaltBridge, setHasSaltBridge] = useState(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [showMicroscopicView, setShowMicroscopicView] = useState(true);
  const [animTick, setAnimTick] = useState(0);
  const [saveToast, setSaveToast] = useState(false);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying || !hasSaltBridge) return;
    const interval = setInterval(() => {
      setAnimTick((prev) => (prev + 1) % 100);
    }, 50 / animSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, hasSaltBridge, animSpeed]);

  const handleSave = () => {
    let score = 0;
    if (formData.electronFlowAnswer.trim().length > 15) score += 30;
    if (formData.saltBridgeFunctionAnswer.trim().length > 15) score += 35;
    if (formData.ionMigrationAnswer.trim().length > 15) score += 35;

    const updated: Stage2Answers = {
      ...formData,
      completedSimulation: true,
      score
    };
    setFormData(updated);
    onSaveAnswers(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Particles for animation
  // Electrons: 8 dots travelling along top wire from X=150 to X=450
  const electronPositions = [0, 15, 30, 45, 60, 75, 90].map(offset => {
    const progress = (animTick * 1.5 + offset) % 100;
    // Path: Anode rod (x=160, y=140 to 60), wire (x=160->440, y=60), Cathode rod (x=440, y=60->140)
    let x = 160;
    let y = 60;
    if (progress < 20) {
      // climbing anode rod
      x = 160;
      y = 140 - (progress / 20) * 80;
    } else if (progress < 80) {
      // traversing wire through voltmeter
      const wireP = (progress - 20) / 60;
      x = 160 + wireP * 280;
      y = 60;
    } else {
      // descending cathode rod
      const downP = (progress - 80) / 20;
      x = 440;
      y = 60 + downP * 80;
    }
    return { x, y };
  });

  // Salt bridge ions:
  // Cl- ions (Green) moving to the left arm down into Anode beaker (X=250 to 220, Y=110 to 180)
  // K+ ions (Purple) moving to the right arm down into Cathode beaker (X=350 to 380, Y=110 to 180)
  const clIonOffsets = [5, 35, 65, 95];
  const kIonOffsets = [15, 45, 75];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12" id="stage2-container">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide backdrop-blur-xs mb-3 border border-white/20">
            <Layers className="w-3.5 h-3.5" />
            <span>TAHAP 2: MENGORGANISASIKAN PESERTA DIDIK (TCK)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Visualisasi Aliran Elektron & Transfer Ion Jembatan Garam
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100 max-w-3xl leading-relaxed">
            Perhatikan interaksi mikroskopis tingkat atom dan ion. Amati mengapa elektron bergerak searah dari anoda menuju katoda, serta bagaimana jembatan garam menjaga kenetralan muatan larutan secara dinamis!
          </p>
        </div>
      </div>

      {/* Main Interactive Animation Stage (TCK Core) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Technological Content Knowledge (TCK)
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Simulasi Dinamis Sel Daniell (Zn-Cu) & Jembatan Garam KCl
            </h2>
          </div>

          {/* Interactive Controls */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors ${
                isPlaying
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Jeda Animasi' : 'Putar Aliran'}</span>
            </button>

            <button
              onClick={() => setHasSaltBridge(!hasSaltBridge)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors ${
                hasSaltBridge
                  ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border border-indigo-200'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              <span>{hasSaltBridge ? 'Lepas Jembatan Garam' : 'Pasang Jembatan Garam'}</span>
            </button>

            <button
              onClick={() => setShowMicroscopicView(!showMicroscopicView)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg flex items-center space-x-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showMicroscopicView ? 'Mode Standar' : 'Mode Mikroskopis'}</span>
            </button>
          </div>
        </div>

        {/* Warning if Salt Bridge Removed */}
        {!hasSaltBridge && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex items-center space-x-3 text-rose-900 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Eksperimen Bukti Nyata: Jembatan Garam Dilepas!</span>
              <p className="text-rose-700 mt-0.5">
                Voltmeter langsung terbaca <b>0,00 V</b> dan aliran elektron berhenti seketika! Hal ini membuktikan bahwa tanpa transfer ion jembatan garam, terjadi penumpukan muatan polarisasi yang mematikan sirkuit sel.
              </p>
            </div>
          </div>
        )}

        {/* The Graphic Canvas Container */}
        <div className="relative bg-slate-950 rounded-2xl p-4 sm:p-6 overflow-hidden border border-slate-800 shadow-inner">
          <svg viewBox="0 0 600 380" className="w-full h-auto select-none font-sans">
            
            {/* Background Grid Lines subtle */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="znGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="cuGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
              <linearGradient id="znSolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="cuSolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="gelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#eab308" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            <rect width="600" height="380" fill="#090d16" />
            <rect width="600" height="380" fill="url(#grid)" opacity="0.5" />

            {/* Left Beaker (Anode - ZnSO4) */}
            <g id="anode-beaker">
              {/* Glass Beaker Body */}
              <rect x="90" y="160" width="140" height="170" rx="10" fill="url(#znSolGrad)" stroke="#60a5fa" strokeWidth="2.5" strokeOpacity="0.6" />
              {/* Beaker Lip */}
              <path d="M 85 160 L 235 160" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
              {/* Liquid surface */}
              <ellipse cx="160" cy="175" rx="68" ry="12" fill="#38bdf8" fillOpacity="0.3" stroke="#7dd3fc" strokeWidth="1" />
              
              {/* Zn Electrode */}
              <rect x="145" y="100" width="30" height="180" rx="3" fill="url(#znGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="160" y="90" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">Zn (s)</text>
              <text x="160" y="76" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">ANODA (-)</text>

              {/* Beaker Label */}
              <text x="160" y="355" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle">Larutan ZnSO₄ 1 M</text>
            </g>

            {/* Right Beaker (Cathode - CuSO4) */}
            <g id="cathode-beaker">
              {/* Glass Beaker Body */}
              <rect x="370" y="160" width="140" height="170" rx="10" fill="url(#cuSolGrad)" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.8" />
              {/* Beaker Lip */}
              <path d="M 365 160 L 515 160" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
              {/* Liquid surface */}
              <ellipse cx="440" cy="175" rx="68" ry="12" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />

              {/* Cu Electrode */}
              <rect x="425" y="100" width="30" height="180" rx="3" fill="url(#cuGrad)" stroke="#fdba74" strokeWidth="1.5" />
              <text x="440" y="90" fill="#fdba74" fontSize="11" fontWeight="bold" textAnchor="middle">Cu (s)</text>
              <text x="440" y="76" fill="#4ade80" fontSize="10" fontWeight="bold" textAnchor="middle">KATODA (+)</text>

              {/* Beaker Label */}
              <text x="440" y="355" fill="#94a3b8" fontSize="11" fontWeight="600" textAnchor="middle">Larutan CuSO₄ 1 M</text>
            </g>

            {/* Connecting Wire from Zn to Cu with Digital Voltmeter in middle */}
            <path d="M 160 100 L 160 60 L 250 60" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 350 60 L 440 60 L 440 100" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Digital Voltmeter Component */}
            <g id="voltmeter" transform="translate(250, 25)">
              <rect x="0" y="0" width="100" height="70" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              {/* LCD Display Screen */}
              <rect x="12" y="10" width="76" height="32" rx="4" fill="#022c22" stroke="#059669" strokeWidth="1" />
              <text 
                x="50" 
                y="33" 
                fill={hasSaltBridge ? "#34d399" : "#6b7280"} 
                fontSize="18" 
                fontFamily="monospace" 
                fontWeight="bold" 
                textAnchor="middle"
              >
                {hasSaltBridge ? "+1.10 V" : " 0.00 V"}
              </text>
              <text x="50" y="58" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
                VOLTMETER DIGITAL
              </text>
              {/* Terminals */}
              <circle cx="0" cy="35" r="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="100" cy="35" r="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
            </g>

            {/* Electron Flow Particles along Wire */}
            {hasSaltBridge && isPlaying && electronPositions.map((p, idx) => (
              <g key={`e-${idx}`}>
                <circle cx={p.x} cy={p.y} r="4.5" fill="#facc15" filter="drop-shadow(0px 0px 3px #fde047)" />
                <text x={p.x} y={p.y + 2.5} fill="#78350f" fontSize="7" fontWeight="black" textAnchor="middle">e⁻</text>
              </g>
            ))}

            {/* Electron Direction Arrows on Wire */}
            <g id="flow-indicator" transform="translate(185, 45)">
              <text x="0" y="0" fill="#fbbf24" fontSize="10" fontWeight="bold">Aliran Elektron (e⁻) ➔</text>
            </g>

            {/* Salt Bridge (U-Tube) */}
            {hasSaltBridge && (
              <g id="salt-bridge">
                {/* U-tube inverted path */}
                <path 
                  d="M 215 240 L 215 150 Q 215 125 240 125 L 360 125 Q 385 125 385 150 L 385 240" 
                  stroke="#334155" 
                  strokeWidth="24" 
                  fill="none" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 215 240 L 215 150 Q 215 125 240 125 L 360 125 Q 385 125 385 150 L 385 240" 
                  stroke="url(#gelGrad)" 
                  strokeWidth="18" 
                  fill="none" 
                  strokeLinecap="round" 
                />
                {/* Cotton Plugs at ends */}
                <rect x="206" y="232" width="18" height="12" rx="3" fill="#f1f5f9" opacity="0.85" />
                <rect x="376" y="232" width="18" height="12" rx="3" fill="#f1f5f9" opacity="0.85" />

                <text x="300" y="112" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Jembatan Garam (Agar-agar + KCl)
                </text>

                {/* Transfer Ion Animation in Salt Bridge */}
                {isPlaying && clIonOffsets.map((offset, i) => {
                  // Cl- (Green) moving left down into Anode
                  const progress = (animTick + offset * 1.5) % 100;
                  let cx = 300 - (progress / 100) * 85;
                  let cy = 125;
                  if (progress > 50) {
                    cx = 215;
                    cy = 125 + ((progress - 50) / 50) * 115;
                  }
                  return (
                    <g key={`cl-${i}`}>
                      <circle cx={cx} cy={cy} r="5" fill="#22c55e" stroke="#14532d" strokeWidth="1" />
                      <text x={cx} y={cy + 2.5} fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">Cl⁻</text>
                    </g>
                  );
                })}

                {isPlaying && kIonOffsets.map((offset, i) => {
                  // K+ (Purple) moving right down into Cathode
                  const progress = (animTick + offset * 1.5) % 100;
                  let cx = 300 + (progress / 100) * 85;
                  let cy = 125;
                  if (progress > 50) {
                    cx = 385;
                    cy = 125 + ((progress - 50) / 50) * 115;
                  }
                  return (
                    <g key={`k-${i}`}>
                      <circle cx={cx} cy={cy} r="5" fill="#a855f7" stroke="#581c87" strokeWidth="1" />
                      <text x={cx} y={cy + 2.5} fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">K⁺</text>
                    </g>
                  );
                })}

                {/* Salt Bridge Label Annotations */}
                <text x="220" y="270" fill="#4ade80" fontSize="9" fontWeight="bold">⮜ Cl⁻ Menetralkan Zn²⁺</text>
                <text x="380" y="270" fill="#c084fc" fontSize="9" fontWeight="bold">K⁺ Menetralkan SO₄²⁻ ➔</text>
              </g>
            )}

            {/* Microscopic Sub-reactions Inset Boxes */}
            {showMicroscopicView && (
              <>
                {/* Anode oxidation bubble */}
                <g transform="translate(100, 205)">
                  <rect width="115" height="38" rx="6" fill="#0f172a" fillOpacity="0.9" stroke="#ef4444" strokeWidth="1" />
                  <text x="57" y="16" fill="#f87171" fontSize="9" fontWeight="bold" textAnchor="middle">Oksidasi di Anoda:</text>
                  <text x="57" y="30" fill="#ffffff" fontSize="8.5" fontFamily="monospace" textAnchor="middle">Zn → Zn²⁺ + 2e⁻</text>
                </g>

                {/* Cathode reduction bubble */}
                <g transform="translate(385, 205)">
                  <rect width="115" height="38" rx="6" fill="#0f172a" fillOpacity="0.9" stroke="#22c55e" strokeWidth="1" />
                  <text x="57" y="16" fill="#4ade80" fontSize="9" fontWeight="bold" textAnchor="middle">Reduksi di Katoda:</text>
                  <text x="57" y="30" fill="#ffffff" fontSize="8.5" fontFamily="monospace" textAnchor="middle">Cu²⁺ + 2e⁻ → Cu</text>
                </g>
              </>
            )}

          </svg>
        </div>

        {/* Scientific Legend & Speed Controller */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-xs" />
            <span className="text-slate-700"><b>Elektron (e⁻):</b> Mengalir lewat kawat luar dari Anoda Zn ke Katoda Cu</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-xs" />
            <span className="text-slate-700"><b>Anion Cl⁻:</b> Turun ke Anoda menetralkan kelebihan kation Zn²⁺</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-xs" />
            <span className="text-slate-700"><b>Kation K⁺:</b> Turun ke Katoda menggantikan Cu²⁺ yang tereduksi</span>
          </div>
        </div>
      </div>

      {/* Guided Scaffolding Questions for Stage 2 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            2.1
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Scaffolding Konseptual: Analisis Dinamika Sel Volta</h2>
            <p className="text-xs text-slate-500">Tuliskan pemahaman hasil pengamatan animasi simulasi TCK di atas.</p>
          </div>
        </div>

        {/* Question A */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            A. Mengapa arah aliran elektron (e⁻) bergerak dari elektroda Seng (Zn) menuju Tembaga (Cu) dan BUKAN sebaliknya?
          </label>
          <p className="text-[11px] text-slate-500">
            Petunjuk: Hubungkan dengan kecenderungan oksidasi, nilai potensial reduksi standar ($E^\circ$ Zn = -0,76 V vs $E^\circ$ Cu = +0,34 V).
          </p>
          <textarea
            rows={2}
            value={formData.electronFlowAnswer}
            onChange={(e) => setFormData({ ...formData, electronFlowAnswer: e.target.value })}
            placeholder="Jelaskan alasan termodinamika mengapa Zn bertindak sebagai anoda (melepas elektron)..."
            className="w-full p-3 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Question B */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            B. Ketika tombol 'Lepas Jembatan Garam' ditekan, apa yang terjadi pada pembacaan voltmeter dan mengapa hal itu terjadi?
          </label>
          <textarea
            rows={2}
            value={formData.saltBridgeFunctionAnswer}
            onChange={(e) => setFormData({ ...formData, saltBridgeFunctionAnswer: e.target.value })}
            placeholder="Uraikan fenomena penumpukan muatan (polarisasi) tanpa jembatan garam..."
            className="w-full p-3 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Question C */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            C. Jelaskan peran spesifik ion $K^+$ dan ion $Cl^-$ dari jembatan garam agar sel volta tetap berfungsi terus menerus!
          </label>
          <textarea
            rows={2}
            value={formData.ionMigrationAnswer}
            onChange={(e) => setFormData({ ...formData, ionMigrationAnswer: e.target.value })}
            placeholder="Kemanakah Cl- bermigrasi dan kemanakah K+ bermigrasi? Mengapa demikian?"
            className="w-full p-3 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onPrevStage}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Kembali ke Tahap 1
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Jawaban Tahap 2</span>
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
            <span>Lanjut ke Tahap 3: Penyelidikan Lab Virtual</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

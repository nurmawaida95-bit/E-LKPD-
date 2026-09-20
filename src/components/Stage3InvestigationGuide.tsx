import React, { useState } from 'react';
import { Stage3Answers, LKPDConfig, MetalOption, ExperimentObservation } from '../types';
import { calculateTheoreticalPotential } from '../utils/defaults';
import { 
  FlaskConical, 
  TestTube, 
  Gauge, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Info, 
  AlertTriangle,
  RotateCcw,
  Zap,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface Stage3Props {
  answers: Stage3Answers;
  onSaveAnswers: (answers: Stage3Answers) => void;
  config: LKPDConfig;
  onNextStage: () => void;
  onPrevStage: () => void;
}

export const Stage3InvestigationGuide: React.FC<Stage3Props> = ({
  answers,
  onSaveAnswers,
  config,
  onNextStage,
  onPrevStage
}) => {
  const [formData, setFormData] = useState<Stage3Answers>({ ...answers });

  // Virtual Lab Selection States
  const [selectedAnode, setSelectedAnode] = useState<string>("Zn");
  const [selectedCathode, setSelectedCathode] = useState<string>("Cu");
  const [isVoltmeterOn, setIsVoltmeterOn] = useState<boolean>(true);
  const [reverseProbes, setReverseProbes] = useState<boolean>(false);
  const [saltBridgeInstalled, setSaltBridgeInstalled] = useState<boolean>(true);
  const [measuredVolts, setMeasuredVolts] = useState<number>(1.08); // initial Daniell measured
  const [observationNote, setObservationNote] = useState<string>("");
  const [saveToast, setSaveToast] = useState(false);

  // Step-by-step salt bridge checklist
  const [completedSaltSteps, setCompletedSaltSteps] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: true, 3: true, 4: true
  });

  const metals = config.metalOptions;
  const currentAnodeMetal = metals.find(m => m.symbol === selectedAnode) || metals[2];
  const currentCathodeMetal = metals.find(m => m.symbol === selectedCathode) || metals[4];

  // Calculate theoretical & measured potential
  const theoreticalE = calculateTheoreticalPotential(selectedAnode, selectedCathode, metals);

  const calculateMeasured = () => {
    if (!saltBridgeInstalled || !isVoltmeterOn) return 0.00;
    if (selectedAnode === selectedCathode) return 0.00;

    // Realistic laboratory variation: small resistance loss (1-4%)
    let base = theoreticalE;
    let actual = base > 0 ? base - 0.02 : base;
    if (reverseProbes) actual = -actual;
    return Number(actual.toFixed(2));
  };

  const handleMeasure = () => {
    const v = calculateMeasured();
    setMeasuredVolts(v);
  };

  // Add observation to experiment table
  const handleAddToTable = () => {
    const existingIdx = formData.experimentTable.findIndex(
      row => row.anode === selectedAnode && row.cathode === selectedCathode
    );

    const newRow: ExperimentObservation = {
      id: `exp-${Date.now()}`,
      anode: selectedAnode,
      cathode: selectedCathode,
      measuredVoltage: measuredVolts,
      theoreticalVoltage: theoreticalE,
      observedReaction: observationNote || (
        selectedAnode === selectedCathode 
          ? "Tidak ada reaksi, potensial sel 0 V" 
          : `Logam ${selectedAnode} melarut, ion ${selectedCathode} tereduksi di katoda, terbaca ${measuredVolts} V`
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let updatedTable = [...formData.experimentTable];
    if (existingIdx >= 0) {
      updatedTable[existingIdx] = newRow;
    } else {
      updatedTable.push(newRow);
    }

    const updatedData: Stage3Answers = {
      ...formData,
      experimentTable: updatedTable,
      saltBridgeMade: true,
      digitalVoltmeterUsed: true
    };
    setFormData(updatedData);
    onSaveAnswers(updatedData);
    setObservationNote("");
  };

  const handleDeleteRow = (id: string) => {
    const filtered = formData.experimentTable.filter(r => r.id !== id);
    const updated = { ...formData, experimentTable: filtered };
    setFormData(updated);
    onSaveAnswers(updated);
  };

  const handleSave = () => {
    let score = 0;
    if (formData.saltBridgeMade) score += 20;
    if (formData.digitalVoltmeterUsed) score += 20;
    // Score based on number of varied experiments recorded (up to 60)
    score += Math.min(60, formData.experimentTable.length * 15);

    const updated = { ...formData, score };
    setFormData(updated);
    onSaveAnswers(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const toggleSaltStep = (idx: number) => {
    setCompletedSaltSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12" id="stage3-container">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-cyan-800 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide backdrop-blur-xs mb-3 border border-white/20">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>TAHAP 3: MEMBIMBING PENYELIDIKAN INDIVIDU / KELOMPOK (PBL)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Perakitan Sel Daniell & Eksplorasi Variasi Elektroda Logam
          </h1>
          <p className="mt-2 text-sm sm:text-base text-cyan-100 max-w-3xl leading-relaxed">
            Ikuti bimbingan pembuatan jembatan garam agar-agar KCl, pelajari pemasangan kutub voltmeter digital, dan eksplorasi potensial sel dari variasi elektroda (Mg, Al, Zn, Fe, Cu) di Laboratorium Virtual!
          </p>
        </div>
      </div>

      {/* Section 1: Salt Bridge Fabrication Guide */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
            3.1
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Bimbingan Pembuatan Jembatan Garam dari Agar-agar KCl
            </h2>
            <p className="text-xs text-slate-500">
              Jembatan garam semi-padat dibuat agar ion mudah berdifusi tanpa larutan tumpah bercampur langsung.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tools & Materials Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
              <TestTube className="w-4 h-4 text-cyan-600" />
              <span>Alat dan Bahan</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              {config.saltBridgeGuide.materials.map((mat, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{mat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Steps Checklist */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Langkah Kerja Pembuatan (Centang Setiap Tahap):
              </span>
              <span className="text-xs text-emerald-600 font-semibold">
                {Object.values(completedSaltSteps).filter(Boolean).length} dari 5 Selesai
              </span>
            </div>

            <div className="space-y-2.5">
              {config.saltBridgeGuide.steps.map((step, idx) => {
                const isChecked = !!completedSaltSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSaltStep(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-3 ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-bold mr-1">Langkah {idx + 1}:</span>
                      <span>{step}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-cyan-50/60 border border-cyan-200 rounded-xl text-xs text-cyan-900 flex items-center space-x-2">
              <Info className="w-4 h-4 text-cyan-700 shrink-0" />
              <span>
                <b>Kenapa Agar-agar KCl?</b> Ion K⁺ dan Cl⁻ memiliki mobilitas ionik yang hampir identik sehingga tidak menimbulkan potensial junction cair tambahan yang mengacaukan pembacaan voltmeter.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Multimeter & Daniell Assembly Guide */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            3.2
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Panduan Perakitan Sel Daniell (Zn-Cu) & Penggunaan Voltmeter Digital
            </h2>
            <p className="text-xs text-slate-500">
              Hindari kesalahan pemasangan probe positif/negatif yang menghasilkan pembacaan negatif.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Voltmeter Wiring Guide */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Aturan Pemasangan Probe Voltmeter Digital</span>
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-slate-200">
                <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  -
                </div>
                <div>
                  <span className="font-bold text-slate-900">Probe Hitam (Kutub COM / Negatif):</span>
                  <p className="text-slate-600 mt-0.5">
                    Wajib dihubungkan ke <b>Anoda (Elektroda Zn)</b> tempat elektron dilepaskan.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-slate-200">
                <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  +
                </div>
                <div>
                  <span className="font-bold text-slate-900">Probe Merah (Kutub VΩmA / Positif):</span>
                  <p className="text-slate-600 mt-0.5">
                    Wajib dihubungkan ke <b>Katoda (Elektroda Cu)</b> tempat elektron ditangkap.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-slate-200">
                <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ⚙
                </div>
                <div>
                  <span className="font-bold text-slate-900">Selektor Skala Pengukuran:</span>
                  <p className="text-slate-600 mt-0.5">
                    Putar selektor multimeter ke posisi <b>DCV 20 V</b> (Tegangan Searah hingga 20 Volt).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assembly Steps */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>SOP Perakitan Sel Daniell Standar</span>
            </h3>
            <ol className="space-y-2 list-decimal list-inside text-slate-700">
              {config.daniellCellGuide.steps.map((st, i) => (
                <li key={i} className="leading-relaxed">
                  <span className="font-medium">{st}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Section 3: Virtual Electrochemical Laboratory */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              3.3
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Laboratorium Virtual: Eksplorasi Variasi Elektroda (Mg, Al, Zn, Fe, Cu)
              </h2>
              <p className="text-xs text-slate-500">
                Ganti kombinasi elektroda anoda dan katoda, amati nilai tegangan pada voltmeter digital!
              </p>
            </div>
          </div>
        </div>

        {/* The Virtual Bench Container */}
        <div className="bg-slate-950 rounded-2xl p-5 sm:p-8 text-white border border-slate-800">
          
          {/* Top Control Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-800">
            {/* Anode Selector */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-red-400 flex items-center space-x-1">
                  <span>BEJANA ANODA (-)</span>
                </label>
                <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800">
                  Oksidasi
                </span>
              </div>
              <select
                value={selectedAnode}
                onChange={(e) => {
                  setSelectedAnode(e.target.value);
                  setTimeout(handleMeasure, 50);
                }}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
              >
                {metals.map(m => (
                  <option key={`anode-${m.symbol}`} value={m.symbol}>
                    {m.symbol} ({m.name}) — E° = {m.standardPotential > 0 ? `+${m.standardPotential}` : m.standardPotential} V
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[11px] text-slate-400">
                Elektrolit: <b>{currentAnodeMetal.symbol}SO₄ / {currentAnodeMetal.ion} 1 M</b>
              </div>
            </div>

            {/* Voltmeter Instrument Display */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                VOLTMETER DIGITAL (DC 20V)
              </div>
              <div className="bg-emerald-950/80 border-2 border-emerald-600/80 rounded-xl px-6 py-2 shadow-inner">
                <span className="text-3xl font-mono font-black text-emerald-400 tracking-wider">
                  {measuredVolts >= 0 ? `+${measuredVolts.toFixed(2)}` : measuredVolts.toFixed(2)}
                  <span className="text-sm ml-1 text-emerald-300 font-sans font-normal">V</span>
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={() => {
                    setReverseProbes(!reverseProbes);
                    setTimeout(handleMeasure, 50);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-colors ${
                    reverseProbes
                      ? 'bg-rose-900/80 text-rose-200 border-rose-600'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                  }`}
                  title="Balik arah kutub probe merah dan hitam"
                >
                  {reverseProbes ? 'Probe Terbalik (-) Aktif' : 'Balik Probe (+/-)'}
                </button>
                <button
                  onClick={handleMeasure}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Ukur Ulang
                </button>
              </div>
            </div>

            {/* Cathode Selector */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <span>BEJANA KATODA (+)</span>
                </label>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  Reduksi
                </span>
              </div>
              <select
                value={selectedCathode}
                onChange={(e) => {
                  setSelectedCathode(e.target.value);
                  setTimeout(handleMeasure, 50);
                }}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
              >
                {metals.map(m => (
                  <option key={`cathode-${m.symbol}`} value={m.symbol}>
                    {m.symbol} ({m.name}) — E° = {m.standardPotential > 0 ? `+${m.standardPotential}` : m.standardPotential} V
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[11px] text-slate-400">
                Elektrolit: <b>{currentCathodeMetal.symbol}SO₄ / {currentCathodeMetal.ion} 1 M</b>
              </div>
            </div>
          </div>

          {/* Visual Bench Graphic */}
          <div className="py-6 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            
            {/* Left Beaker Representation */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-36 bg-cyan-950/40 border-2 border-cyan-500/60 rounded-b-2xl flex flex-col items-center justify-end pb-3 overflow-hidden shadow-lg">
                {/* Liquid Level */}
                <div className="absolute inset-x-0 bottom-0 top-10 bg-cyan-600/30 backdrop-blur-xs" />
                {/* Metal Strip */}
                <div 
                  className="w-8 h-28 rounded-xs shadow-md z-10 border border-white/20 transition-all"
                  style={{ backgroundColor: currentAnodeMetal.color }}
                />
                <span className="z-20 text-[11px] font-bold text-white mt-1 drop-shadow-md">
                  {currentAnodeMetal.symbol} (Anoda)
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-300 mt-2">
                Larutan {currentAnodeMetal.ion} (1 M)
              </span>
            </div>

            {/* Salt Bridge Icon / Bridge */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-10 border-t-8 border-x-8 border-emerald-400/80 rounded-t-xl" />
              <span className="text-[10px] text-emerald-400 font-bold mt-1">Jembatan Garam KCl</span>
              <div className="text-[11px] text-amber-300 font-mono mt-2">
                E° teoritis = {theoreticalE > 0 ? `+${theoreticalE.toFixed(2)}` : theoreticalE.toFixed(2)} V
              </div>
            </div>

            {/* Right Beaker Representation */}
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-36 bg-blue-950/40 border-2 border-blue-500/60 rounded-b-2xl flex flex-col items-center justify-end pb-3 overflow-hidden shadow-lg">
                {/* Liquid Level */}
                <div className="absolute inset-x-0 bottom-0 top-10 bg-blue-600/40 backdrop-blur-xs" />
                {/* Metal Strip */}
                <div 
                  className="w-8 h-28 rounded-xs shadow-md z-10 border border-white/20 transition-all"
                  style={{ backgroundColor: currentCathodeMetal.color }}
                />
                <span className="z-20 text-[11px] font-bold text-white mt-1 drop-shadow-md">
                  {currentCathodeMetal.symbol} (Katoda)
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-300 mt-2">
                Larutan {currentCathodeMetal.ion} (1 M)
              </span>
            </div>

          </div>

          {/* Add to Observation Table Form */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={observationNote}
              onChange={(e) => setObservationNote(e.target.value)}
              placeholder="Catatan pengamatan (misal: jarum stabil 1.08V, logam Zn melarut perlahan)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={handleAddToTable}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-md shadow-cyan-400/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Catat ke Tabel Pengamatan LKPD</span>
            </button>
          </div>

        </div>

        {/* Experiment Observation Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Tabel Hasil Pengamatan Praktikum Penyelidikan Siswa
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              {formData.experimentTable.length} Pasangan Logam Tercatat
            </span>
          </div>

          {formData.experimentTable.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-xs text-slate-500">
              Belum ada data pengamatan yang dicatat. Gunakan Lab Virtual di atas dan tekan <b>"Catat ke Tabel Pengamatan LKPD"</b> untuk mencatat data eksperimen Anda!
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">No</th>
                    <th className="px-3 py-2.5">Anoda (-)</th>
                    <th className="px-3 py-2.5">Katoda (+)</th>
                    <th className="px-3 py-2.5">E° Teoritis</th>
                    <th className="px-3 py-2.5">E Terukur (Volt)</th>
                    <th className="px-3 py-2.5">Deskripsi Gejala / Reaksi</th>
                    <th className="px-3 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {formData.experimentTable.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-500">{index + 1}</td>
                      <td className="px-3 py-2.5 font-bold text-red-600">{row.anode}</td>
                      <td className="px-3 py-2.5 font-bold text-emerald-600">{row.cathode}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        {row.theoreticalVoltage > 0 ? `+${row.theoreticalVoltage.toFixed(2)}` : row.theoreticalVoltage.toFixed(2)} V
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-blue-600">
                        {row.measuredVoltage > 0 ? `+${row.measuredVoltage.toFixed(2)}` : row.measuredVoltage.toFixed(2)} V
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 max-w-xs truncate">{row.observedReaction}</td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onPrevStage}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Kembali ke Tahap 2
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Jawaban Tahap 3</span>
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
            <span>Lanjut ke Tahap 4: Olah Data & Deret Volta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

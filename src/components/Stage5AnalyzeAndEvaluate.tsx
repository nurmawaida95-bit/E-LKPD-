import React, { useState } from 'react';
import { Stage5Answers, LKPDConfig, StudentProfile } from '../types';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Check, 
  X, 
  Info, 
  BookOpen,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Stage5Props {
  answers: Stage5Answers;
  onSaveAnswers: (answers: Stage5Answers) => void;
  config: LKPDConfig;
  studentProfile: StudentProfile;
  onSubmitFullLKPD: () => void;
  onPrevStage: () => void;
  isSubmitting: boolean;
}

export const Stage5AnalyzeAndEvaluate: React.FC<Stage5Props> = ({
  answers,
  onSaveAnswers,
  config,
  studentProfile,
  onSubmitFullLKPD,
  onPrevStage,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Stage5Answers>({ ...answers });
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(
    Object.keys(answers.hotsAnswers).length > 0
  );
  const [saveToast, setSaveToast] = useState(false);

  const questions = config.hotsQuestions;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    const updated = {
      ...formData.hotsAnswers,
      [questionId]: optionIndex
    };
    setFormData(prev => ({ ...prev, hotsAnswers: updated }));
  };

  const calculateHotsScore = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (formData.hotsAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    const finalScore = Math.round((correctCount / questions.length) * 100);
    return { correctCount, finalScore };
  };

  const handleEvaluateQuiz = () => {
    const { finalScore } = calculateHotsScore();
    const updated = {
      ...formData,
      hotsScore: finalScore
    };
    setFormData(updated);
    setSubmittedQuiz(true);
    onSaveAnswers(updated);

    if (finalScore >= 75) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSaveOnly = () => {
    const { finalScore } = calculateHotsScore();
    const updated = {
      ...formData,
      hotsScore: finalScore
    };
    setFormData(updated);
    onSaveAnswers(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const { correctCount, finalScore } = calculateHotsScore();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12" id="stage5-container">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide backdrop-blur-xs mb-3 border border-white/20">
            <Award className="w-3.5 h-3.5" />
            <span>TAHAP 5: MENGANALISIS & MENGEVALUASI PROSES PEMECAHAN MASALAH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Evaluasi HOTS & Refleksi Akhir Sel Volta
          </h1>
          <p className="mt-2 text-sm sm:text-base text-amber-100 max-w-3xl leading-relaxed">
            Uji daya nalar tingkat tinggi (Higher Order Thinking Skills) Anda dalam menyelesaikan masalah elektrokimia di dunia nyata, lalu refleksikan pemecahan masalah terkait misteri Galvani vs Volta!
          </p>
        </div>
      </div>

      {/* HOTS Questions Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              5.1
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Soal Evaluasi HOTS (High Order Thinking Skills)
              </h2>
              <p className="text-xs text-slate-500">
                {questions.length} Butir Soal Analisis, Evaluasi & Rekayasa Sel Volta
              </p>
            </div>
          </div>

          {submittedQuiz && (
            <div className="flex items-center space-x-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
              <span className="text-xs font-bold text-slate-700">Skor HOTS:</span>
              <span className="text-sm font-black font-mono text-amber-800">
                {finalScore} / 100 ({correctCount} dari {questions.length} Benar)
              </span>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {questions.map((q, qIndex) => {
            const selectedOpt = formData.hotsAnswers[q.id];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = selectedOpt === q.correctAnswerIndex;

            return (
              <div 
                key={q.id} 
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
              >
                {/* Stimulus & Question */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                      Soal Nomor {qIndex + 1}
                    </span>
                    <span className="text-slate-400 font-medium italic">{q.competency}</span>
                  </div>

                  {/* Stimulus Box */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-medium">
                    {q.stimulus}
                  </div>

                  <p className="text-xs font-bold text-slate-900 pt-1">
                    {q.question}
                  </p>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                  {q.options.map((optionText, optIndex) => {
                    const isSelected = selectedOpt === optIndex;
                    const letter = String.fromCharCode(65 + optIndex);

                    let itemClass = "bg-white border-slate-200 hover:border-slate-300 text-slate-800";
                    if (submittedQuiz) {
                      if (optIndex === q.correctAnswerIndex) {
                        itemClass = "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold";
                      } else if (isSelected && !isCorrect) {
                        itemClass = "bg-rose-50 border-rose-300 text-rose-950";
                      }
                    } else if (isSelected) {
                      itemClass = "bg-blue-50 border-blue-500 text-blue-950 font-semibold ring-1 ring-blue-500/30";
                    }

                    return (
                      <div
                        key={optIndex}
                        onClick={() => handleSelectOption(q.id, optIndex)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-3 ${itemClass}`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px] border ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-slate-100 text-slate-600'
                        }`}>
                          {letter}
                        </div>
                        <span className="leading-relaxed">{optionText}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box if evaluated */}
                {submittedQuiz && (
                  <div className={`p-4 rounded-xl text-xs space-y-1.5 ${
                    isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-950' : 'bg-amber-50 border border-amber-200 text-amber-950'
                  }`}>
                    <div className="font-bold flex items-center space-x-1.5">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-800">Jawaban Anda Tepat!</span>
                        </>
                      ) : (
                        <>
                          <Info className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-800">Pembahasan Ilmiah:</span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed pl-5">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Evaluate Quiz Trigger */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleEvaluateQuiz}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Periksa Jawaban & Tampilkan Pembahasan HOTS</span>
          </button>

          <span className="text-xs text-slate-500">
            {Object.keys(formData.hotsAnswers).length} dari {questions.length} soal telah dijawab
          </span>
        </div>
      </div>

      {/* Section 2: Scaffolding Problem-Solving Reflection */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
            5.2
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Refleksi Pemecahan Masalah PBL: Resolusi Debat Galvani vs Volta
            </h2>
            <p className="text-xs text-slate-500">
              Sintesiskan seluruh bukti eksperimental yang telah Anda selesaikan dari Tahap 1 hingga Tahap 4.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Berdasarkan seluruh hasil eksperimen sel Daniell, jembatan garam, dan deret Volta: Mengapa penjelasan Alessandro Volta lebih tepat dibandingkan teori 'Listrik Hewani' Luigi Galvani? Apa kesimpulan akhir kelompok Anda?
          </label>
          <textarea
            rows={4}
            value={formData.reflection}
            onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
            placeholder="Tuliskan kesimpulan ilmiah akhir kelompok Anda di sini (kaitkan peran bimetal, elektrolit, jembatan garam, dan transfer elektron)..."
            className="w-full p-3.5 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Final Submission Card */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
              PENGUMPULAN AKHIR LKPD
            </span>
            <h3 className="text-xl font-bold mt-1">
              Kirimkan Lembar Kerja ke Guru Pembimbing
            </h3>
            <p className="text-xs text-blue-200 mt-1">
              Guru: <b>{config.author}</b> • Peserta Didik: <b>{studentProfile.name || 'Belum diisi'}</b> ({studentProfile.className})
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-4 py-2 text-xs font-medium text-blue-200 bg-blue-800/60 hover:bg-blue-800 rounded-xl border border-blue-700 transition-colors"
            >
              Simpan Draft
            </button>
            {saveToast && (
              <span className="text-xs text-emerald-300 font-semibold">Tersimpan!</span>
            )}
          </div>
        </div>

        <div className="text-xs text-blue-100 leading-relaxed bg-blue-950/60 p-4 rounded-xl border border-blue-800/80">
          Dengan menekan tombol di bawah ini, seluruh jawaban dari Tahap 1 (Orientasi Masalah), Tahap 2 (Visualisasi & TCK), Tahap 3 (Data Lab Virtual), Tahap 4 (Galat & Deret Volta), dan Tahap 5 (Evaluasi HOTS) akan dikirimkan langsung ke <b>Dashboard Guru</b> untuk dinilai.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onPrevStage}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-blue-900/50 hover:bg-blue-900 rounded-xl border border-blue-700"
          >
            Kembali ke Tahap 4
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              handleSaveOnly();
              onSubmitFullLKPD();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 stroke-[2.5]" />
            )}
            <span>{isSubmitting ? 'Mengirim Tugas...' : 'Kirim Seluruh Lembar Kerja ke Guru'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

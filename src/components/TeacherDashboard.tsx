import React, { useState } from 'react';
import { LKPDConfig, StudentSubmission, HotsQuestion } from '../types';
import { 
  GraduationCap, 
  Users, 
  Settings, 
  Share2, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Save, 
  RotateCcw, 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  X, 
  Check, 
  Copy, 
  ExternalLink,
  MessageSquareQuote,
  Layers,
  Award
} from 'lucide-react';

interface TeacherDashboardProps {
  submissions: StudentSubmission[];
  config: LKPDConfig;
  onUpdateConfig: (newConfig: LKPDConfig) => Promise<boolean>;
  onResetConfig: () => Promise<boolean>;
  onUpdateSubmissionFeedback: (submissionId: string, feedback: string, adjustedScore?: number) => Promise<boolean>;
  onDeleteSubmission: (submissionId: string) => Promise<boolean>;
  onBackToStudentView: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  submissions,
  config,
  onUpdateConfig,
  onResetConfig,
  onUpdateSubmissionFeedback,
  onDeleteSubmission,
  onBackToStudentView
}) => {
  const [activeTeacherTab, setActiveTeacherTab] = useState<'submissions' | 'editor' | 'share'>('submissions');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  // Review / Feedback State
  const [feedbackInput, setFeedbackInput] = useState('');
  const [adjustedScoreInput, setAdjustedScoreInput] = useState<number>(0);
  const [savingFeedback, setSavingFeedback] = useState(false);

  // LKPD Editor State
  const [editorConfig, setEditorConfig] = useState<LKPDConfig>(JSON.parse(JSON.stringify(config)));
  const [savingEditor, setSavingEditor] = useState(false);
  const [editorSaveSuccess, setEditorSaveSuccess] = useState(false);

  // Share Link State
  const [shareClassTarget, setShareClassTarget] = useState('XII MIPA 1');
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter Submissions
  const filteredSubmissions = submissions.filter(s => {
    const matchesClass = classFilter === 'all' || s.className.toLowerCase() === classFilter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || 
      s.studentName.toLowerCase().includes(q) || 
      s.studentId.toLowerCase().includes(q) || 
      (s.groupName && s.groupName.toLowerCase().includes(q));
    return matchesClass && matchesQuery;
  });

  // Calculate quick stats
  const totalSubmissions = filteredSubmissions.length;
  const avgScore = totalSubmissions > 0 
    ? Math.round(filteredSubmissions.reduce((acc, s) => acc + s.totalScore, 0) / totalSubmissions) 
    : 0;
  const maxScore = totalSubmissions > 0 
    ? Math.max(...filteredSubmissions.map(s => s.totalScore)) 
    : 0;
  const minScore = totalSubmissions > 0 
    ? Math.min(...filteredSubmissions.map(s => s.totalScore)) 
    : 0;

  // Open detail review modal
  const handleOpenReview = (sub: StudentSubmission) => {
    setSelectedSubmission(sub);
    setFeedbackInput(sub.teacherFeedback || '');
    setAdjustedScoreInput(sub.totalScore);
  };

  const handleSaveFeedback = async () => {
    if (!selectedSubmission) return;
    setSavingFeedback(true);
    const ok = await onUpdateSubmissionFeedback(selectedSubmission.id, feedbackInput, adjustedScoreInput);
    setSavingFeedback(false);
    if (ok) {
      setSelectedSubmission({
        ...selectedSubmission,
        teacherFeedback: feedbackInput,
        totalScore: adjustedScoreInput,
        status: 'graded'
      });
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Nama Siswa", "NIS", "Kelas", "Kelompok", "Tahap 1", "Tahap 2", "Tahap 3", "Tahap 4", "HOTS (Tahap 5)", "Skor Total", "Status", "Waktu Kirim", "Feedback Guru"];
    const rows = filteredSubmissions.map(s => [
      `"${s.studentName}"`,
      `"${s.studentId}"`,
      `"${s.className}"`,
      `"${s.groupName || '-'}"`,
      s.stage1.score,
      s.stage2.score,
      s.stage3.score,
      s.stage4.score,
      s.stage5.hotsScore,
      s.totalScore,
      `"${s.status}"`,
      `"${new Date(s.submittedAt).toLocaleString('id-ID')}"`,
      `"${(s.teacherFeedback || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Nilai_LKPD_Sel_Volta_${classFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveConfigChanges = async () => {
    setSavingEditor(true);
    const ok = await onUpdateConfig(editorConfig);
    setSavingEditor(false);
    if (ok) {
      setEditorSaveSuccess(true);
      setTimeout(() => setEditorSaveSuccess(false), 3000);
    }
  };

  const handleResetToDefaultConfig = async () => {
    if (confirm("Apakah Anda yakin ingin mengembalikan seluruh narasi, petunjuk, dan soal ke setelan baku awal?")) {
      await onResetConfig();
      setEditorConfig(JSON.parse(JSON.stringify(config)));
    }
  };

  const getStudentShareUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const encodedClass = encodeURIComponent(shareClassTarget);
    return `${origin}/?mode=student&class=${encodedClass}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getStudentShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16" id="teacher-dashboard-container">
      
      {/* Teacher Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide border border-amber-500/30 mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>PORTAL KHUSUS GURU PEMBIMBING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashboard Guru: Rekap Nilai & Manajemen LKPD
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Guru Pengampu: <b>{config.author}</b> ({config.subTitle}) • Kelola pengumpulan tugas, tinjau hasil eksperimen siswa, dan sesuaikan item materi LKPD.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onBackToStudentView}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xs transition-colors"
          >
            Buka Tampilan Siswa
          </button>
        </div>
      </div>

      {/* Teacher Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTeacherTab('submissions')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTeacherTab === 'submissions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Nilai & Kemajuan Belajar Siswa ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTeacherTab('editor')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTeacherTab === 'editor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Editor Item-Item LKPD</span>
        </button>

        <button
          onClick={() => setActiveTeacherTab('share')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTeacherTab === 'share'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan Tautan Khusus Siswa</span>
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS & GRADES */}
      {activeTeacherTab === 'submissions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Siswa Mengumpulkan</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalSubmissions} Siswa</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Rata-rata Nilai</span>
              <div className="text-2xl font-black text-blue-600 mt-1">{avgScore} / 100</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Nilai Tertinggi</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{maxScore} / 100</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Nilai Terendah</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{minScore} / 100</div>
            </div>
          </div>

          {/* Filter Bar & Export Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama siswa atau NIS..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Class Filter */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Kelas</option>
                  <option value="XII MIPA 1">XII MIPA 1</option>
                  <option value="XII MIPA 2">XII MIPA 2</option>
                  <option value="XII MIPA 3">XII MIPA 3</option>
                  <option value="XII Teknik Kimia">XII Teknik Kimia</option>
                  <option value="XII Farmasi">XII Farmasi</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Unduh Rekap CSV</span>
              </button>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                Belum ada pengumpulan tugas dari siswa untuk filter kelas ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Nama Siswa & NIS</th>
                      <th className="px-4 py-3">Kelas & Kelompok</th>
                      <th className="px-4 py-3 text-center">Tahap 1 (Orientasi)</th>
                      <th className="px-4 py-3 text-center">Tahap 2 (TCK)</th>
                      <th className="px-4 py-3 text-center">Tahap 3 (Lab)</th>
                      <th className="px-4 py-3 text-center">Tahap 4 (Karya)</th>
                      <th className="px-4 py-3 text-center">HOTS (Tahap 5)</th>
                      <th className="px-4 py-3 text-center">Skor Akhir</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{sub.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">NIS: {sub.studentId || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{sub.className}</div>
                          <div className="text-[11px] text-slate-500">{sub.groupName || 'Individu'}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{sub.stage1.score}</td>
                        <td className="px-4 py-3 text-center font-mono">{sub.stage2.score}</td>
                        <td className="px-4 py-3 text-center font-mono">{sub.stage3.score}</td>
                        <td className="px-4 py-3 text-center font-mono">{sub.stage4.score}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-amber-700">{sub.stage5.hotsScore}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                            sub.totalScore >= 85 ? 'bg-emerald-100 text-emerald-800' :
                            sub.totalScore >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sub.totalScore}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sub.status === 'graded' ? 'Dinilai' : 'Masuk'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenReview(sub)}
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Periksa</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus pengumpulan tugas siswa ${sub.studentName}?`)) {
                                  onDeleteSubmission(sub.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LKPD ITEMS EDITOR */}
      {activeTeacherTab === 'editor' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pengaturan & Penyesuaian Item Materi LKPD
                </h2>
                <p className="text-xs text-slate-500">
                  Guru dapat menyesuaikan narasi sejarah, pertanyaan scaffolding, dan butir soal evaluasi HOTS secara langsung.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetToDefaultConfig}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Setelan Baku</span>
                </button>
                <button
                  type="button"
                  disabled={savingEditor}
                  onClick={handleSaveConfigChanges}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingEditor ? 'Menyimpan...' : 'Simpan Perubahan LKPD'}</span>
                </button>
              </div>
            </div>

            {editorSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Seluruh perubahan item LKPD berhasil disimpan dan langsung aktif bagi peserta didik!</span>
              </div>
            )}

            {/* General Meta Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul LKPD:
                </label>
                <input
                  type="text"
                  value={editorConfig.title}
                  onChange={(e) => setEditorConfig({ ...editorConfig, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Guru Pengampu:
                </label>
                <input
                  type="text"
                  value={editorConfig.author}
                  onChange={(e) => setEditorConfig({ ...editorConfig, author: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Stage 1 Narrative Editor */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                Tahap 1: Narasi Kontroversi Galvani vs Volta
              </span>
              <textarea
                rows={5}
                value={editorConfig.stage1Narrative}
                onChange={(e) => setEditorConfig({ ...editorConfig, stage1Narrative: e.target.value })}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* HOTS Question Editor */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                  Tahap 5: Butir Soal Evaluasi HOTS ({editorConfig.hotsQuestions.length} Soal)
                </span>
              </div>

              <div className="space-y-6">
                {editorConfig.hotsQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">Soal Nomor {idx + 1}</span>
                      <span className="text-[11px] text-slate-500">ID: {q.id}</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Stimulus Soal:</label>
                      <textarea
                        rows={2}
                        value={q.stimulus}
                        onChange={(e) => {
                          const updated = [...editorConfig.hotsQuestions];
                          updated[idx].stimulus = e.target.value;
                          setEditorConfig({ ...editorConfig, hotsQuestions: updated });
                        }}
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Pertanyaan:</label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...editorConfig.hotsQuestions];
                          updated[idx].question = e.target.value;
                          setEditorConfig({ ...editorConfig, hotsQuestions: updated });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Pilihan Jawaban (Pilih radio button untuk menandai kunci jawaban yang benar):
                      </label>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctAnswerIndex === oIdx}
                              onChange={() => {
                                const updated = [...editorConfig.hotsQuestions];
                                updated[idx].correctAnswerIndex = oIdx;
                                setEditorConfig({ ...editorConfig, hotsQuestions: updated });
                              }}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-slate-500">{String.fromCharCode(65 + oIdx)}.</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...editorConfig.hotsQuestions];
                                updated[idx].options[oIdx] = e.target.value;
                                setEditorConfig({ ...editorConfig, hotsQuestions: updated });
                              }}
                              className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Pembahasan Ilmiah:</label>
                      <textarea
                        rows={2}
                        value={q.explanation}
                        onChange={(e) => {
                          const updated = [...editorConfig.hotsQuestions];
                          updated[idx].explanation = e.target.value;
                          setEditorConfig({ ...editorConfig, hotsQuestions: updated });
                        }}
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHARE LINK TO STUDENTS */}
      {activeTeacherTab === 'share' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              Bagikan Tautan Khusus LKPD ke Peserta Didik
            </h2>
            <p className="text-xs text-slate-500">
              Setiap tautan dapat dikhususkan untuk kelas tertentu agar hasil pengumpulan terfilter secara otomatis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Kelas Sasaran:
                </label>
                <select
                  value={shareClassTarget}
                  onChange={(e) => setShareClassTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="XII MIPA 1">XII MIPA 1</option>
                  <option value="XII MIPA 2">XII MIPA 2</option>
                  <option value="XII MIPA 3">XII MIPA 3</option>
                  <option value="XII Teknik Kimia">XII Teknik Kimia</option>
                  <option value="XII Farmasi">XII Farmasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tautan Langsung Siswa:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={getStudentShareUrl()}
                    className="flex-1 px-3 py-2.5 text-xs font-mono bg-slate-100 border border-slate-300 rounded-xl text-slate-700 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-2">
                <span className="font-bold flex items-center space-x-1">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Petunjuk Pembelajaran di Kelas:</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  <li>Kirimkan tautan ini melalui WhatsApp Group kelas, Google Classroom, atau LMS sekolah.</li>
                  <li>Siswa tidak memerlukan kata sandi guru untuk mengerjakan.</li>
                  <li>Progres pengerjaan siswa tersimpan secara otomatis setiap kali menekan tombol simpan atau kirim tugas.</li>
                </ul>
              </div>
            </div>

            {/* Big Presentation QR Card for Projector */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                TAMPILKAN DI PROYEKTOR KELAS
              </span>
              <div className="p-4 bg-white rounded-2xl shadow-inner">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-48 h-48 text-slate-900" fill="currentColor">
                  <rect x="10" y="10" width="25" height="25" fill="black" />
                  <rect x="15" y="15" width="15" height="15" fill="white" />
                  <rect x="18" y="18" width="9" height="9" fill="black" />
                  <rect x="65" y="10" width="25" height="25" fill="black" />
                  <rect x="70" y="15" width="15" height="15" fill="white" />
                  <rect x="73" y="18" width="9" height="9" fill="black" />
                  <rect x="10" y="65" width="25" height="25" fill="black" />
                  <rect x="15" y="70" width="15" height="15" fill="white" />
                  <rect x="18" y="73" width="9" height="9" fill="black" />
                  <rect x="42" y="15" width="16" height="8" fill="black" />
                  <rect x="45" y="30" width="10" height="20" fill="black" />
                  <rect x="25" y="45" width="15" height="10" fill="black" />
                  <rect x="65" y="45" width="20" height="15" fill="black" />
                  <rect x="45" y="65" width="15" height="25" fill="black" />
                  <rect x="70" y="75" width="20" height="15" fill="black" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm">Scan QR Code Ini Dengan Kamera HP</div>
                <div className="text-xs text-slate-400 mt-0.5">Langsung membuka LKPD Sel Volta Kelas {shareClassTarget}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal (Detail Student Work) */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Tinjauan Lembar Kerja: {selectedSubmission.studentName}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                    {selectedSubmission.className}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  NIS: {selectedSubmission.studentId || '-'} • Kelompok: {selectedSubmission.groupName || '-'} • Dikirim: {new Date(selectedSubmission.submittedAt).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stages Detail Accordion / Content */}
            <div className="space-y-6 my-6 text-xs text-slate-800">
              
              {/* Stage 1 Answers Review */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <span>Tahap 1: Orientasi Masalah (Galvani vs Volta)</span>
                  <span className="text-blue-600">Nilai: {selectedSubmission.stage1.score}/100</span>
                </div>
                <div><b>Sudut Pandang Galvani:</b> {selectedSubmission.stage1.galvaniPerspective || '-'}</div>
                <div><b>Sudut Pandang Volta:</b> {selectedSubmission.stage1.voltaPerspective || '-'}</div>
                <div><b>Sintesis Konsep:</b> {selectedSubmission.stage1.conceptSummary || '-'}</div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <b>Rumusan Hipotesis Siswa:</b> {selectedSubmission.stage1.hypothesis || '-'}
                </div>
              </div>

              {/* Stage 2 Answers Review */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <span>Tahap 2: Visualisasi Aliran Elektron & Transfer Ion</span>
                  <span className="text-emerald-600">Nilai: {selectedSubmission.stage2.score}/100</span>
                </div>
                <div><b>Alasan Aliran Elektron:</b> {selectedSubmission.stage2.electronFlowAnswer || '-'}</div>
                <div><b>Fungsi Jembatan Garam:</b> {selectedSubmission.stage2.saltBridgeFunctionAnswer || '-'}</div>
                <div><b>Arah Migrasi K⁺ & Cl⁻:</b> {selectedSubmission.stage2.ionMigrationAnswer || '-'}</div>
              </div>

              {/* Stage 3 Lab Data Review */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <span>Tahap 3: Tabel Hasil Eksperimen Lab Virtual</span>
                  <span className="text-cyan-600">Nilai: {selectedSubmission.stage3.score}/100</span>
                </div>
                {selectedSubmission.stage3.experimentTable.length === 0 ? (
                  <p className="text-slate-400 italic">Tidak ada data praktikum tercatat.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-200 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-1.5">Anoda</th>
                          <th className="p-1.5">Katoda</th>
                          <th className="p-1.5">E° Teori</th>
                          <th className="p-1.5">E Terukur</th>
                          <th className="p-1.5">Pengamatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedSubmission.stage3.experimentTable.map((r, i) => (
                          <tr key={i}>
                            <td className="p-1.5 font-bold text-red-600">{r.anode}</td>
                            <td className="p-1.5 font-bold text-emerald-600">{r.cathode}</td>
                            <td className="p-1.5 font-mono">{r.theoreticalVoltage} V</td>
                            <td className="p-1.5 font-mono font-bold text-blue-600">{r.measuredVoltage} V</td>
                            <td className="p-1.5 truncate max-w-xs">{r.observedReaction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Stage 4 Data Review */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <span>Tahap 4: Galat (%), Notasi Sel & Deret Volta</span>
                  <span className="text-purple-600">Nilai: {selectedSubmission.stage4.score}/100</span>
                </div>
                <div><b>Galat Persen Zn-Cu:</b> {selectedSubmission.stage4.percentErrorZnCu}%</div>
                <div><b>Catatan Analisis Galat:</b> {selectedSubmission.stage4.errorAnalysisNotes || '-'}</div>
                <div>
                  <b>Urutan Deret Volta Siswa:</b>{' '}
                  <span className="font-bold text-indigo-700">
                    {selectedSubmission.stage4.voltaSeriesOrder.join(' < ')}
                  </span>
                </div>
              </div>

              {/* Stage 5 HOTS Review */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <span>Tahap 5: Evaluasi HOTS & Refleksi Akhir</span>
                  <span className="text-amber-600">Skor HOTS: {selectedSubmission.stage5.hotsScore}/100</span>
                </div>
                <div><b>Refleksi Resolusi Galvani vs Volta:</b> {selectedSubmission.stage5.reflection || '-'}</div>
              </div>

            </div>

            {/* Teacher Grading & Feedback Form */}
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-3">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center space-x-1.5">
                <MessageSquareQuote className="w-4 h-4 text-amber-700" />
                <span>Penilaian & Umpan Balik Guru</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Skor Total Akhir (0 - 100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={adjustedScoreInput}
                    onChange={(e) => setAdjustedScoreInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Umpan Balik / Catatan Guru untuk Siswa:
                  </label>
                  <input
                    type="text"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Contoh: Analisis galat sangat baik, perhatikan penulisan fasa pada notasi sel..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={savingFeedback}
                  onClick={handleSaveFeedback}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingFeedback ? 'Menyimpan...' : 'Simpan Nilai & Umpan Balik'}</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Tutup Tinjauan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { ActiveTab, StudentProfile } from '../types';
import { 
  Atom, 
  Share2, 
  UserCheck, 
  GraduationCap, 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  Check, 
  QrCode, 
  X,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface HeaderNavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: 'student' | 'teacher';
  setUserRole: (role: 'student' | 'teacher') => void;
  studentProfile: StudentProfile;
  completedStages: {
    stage1: boolean;
    stage2: boolean;
    stage3: boolean;
    stage4: boolean;
    stage5: boolean;
  };
  onOpenProfileModal: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  studentProfile,
  completedStages,
  onOpenProfileModal
}) => {
  const [showTeacherPinModal, setShowTeacherPinModal] = useState(false);
  const [teacherPinInput, setTeacherPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedShareClass, setSelectedShareClass] = useState(studentProfile.className || 'XII MIPA 1');

  const stagesList = [
    { id: 'stage1' as ActiveTab, number: 1, title: 'Tahap 1: Orientasi Masalah', short: 'Orientasi Masalah' },
    { id: 'stage2' as ActiveTab, number: 2, title: 'Tahap 2: Mengorganisasikan', short: 'Visualisasi & TCK' },
    { id: 'stage3' as ActiveTab, number: 3, title: 'Tahap 3: Penyelidikan', short: 'Lab Virtual & Jembatan' },
    { id: 'stage4' as ActiveTab, number: 4, title: 'Tahap 4: Hasil Karya', short: 'Galat, Notasi & Deret' },
    { id: 'stage5' as ActiveTab, number: 5, title: 'Tahap 5: Evaluasi HOTS', short: 'Evaluasi & Refleksi' }
  ];

  const handleTeacherAccess = () => {
    if (userRole === 'teacher') {
      setUserRole('student');
      setActiveTab('stage1');
    } else {
      setShowTeacherPinModal(true);
      setTeacherPinInput('');
      setPinError('');
    }
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherPinInput === '1234' || teacherPinInput === 'guru' || teacherPinInput === '2026') {
      setUserRole('teacher');
      setActiveTab('teacher_dashboard');
      setShowTeacherPinModal(false);
      setPinError('');
    } else {
      setPinError('PIN salah! Masukkan PIN standar guru: 1234');
    }
  };

  const getStudentShareUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const encodedClass = encodeURIComponent(selectedShareClass);
    return `${origin}/?mode=student&class=${encodedClass}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getStudentShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs" id="main-header">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Subject Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">LKPD Sel Volta</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Model PBL
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600">
                  Fase F / Kelas XII
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Scaffolding Worksheet Elektrokimia, Sel Daniell, & Jembatan Garam
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Share Link Button */}
            <button
              id="btn-share-link"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Bagikan Tautan Khusus Siswa"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Bagikan ke Siswa</span>
            </button>

            {/* Student Profile Quick View or Change */}
            {userRole === 'student' && (
              <button
                id="btn-student-profile"
                onClick={onOpenProfileModal}
                className="inline-flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[120px] truncate font-semibold">
                  {studentProfile.name || "Isi Data Siswa"}
                </span>
                <span className="hidden md:inline text-emerald-600">
                  ({studentProfile.className || "Kelas XII"})
                </span>
              </button>
            )}

            {/* Teacher Dashboard Switcher */}
            <button
              id="btn-teacher-toggle"
              onClick={handleTeacherAccess}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs ${
                userRole === 'teacher'
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              {userRole === 'teacher' ? (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>Mode Guru Aktif</span>
                  <span className="text-[10px] bg-amber-800 px-1.5 py-0.5 rounded text-amber-100">Beralih</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dashboard Guru</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Stage Tabs Navigation */}
      <div className="bg-slate-50 border-t border-slate-200 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5 min-w-max" aria-label="Stages">
            {stagesList.map((stage) => {
              const isActive = activeTab === stage.id;
              const isDone = completedStages[stage.id as keyof typeof completedStages];

              return (
                <button
                  key={stage.id}
                  id={`tab-nav-${stage.id}`}
                  onClick={() => setActiveTab(stage.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDone
                      ? 'bg-white text-emerald-700 border border-emerald-200 hover:bg-slate-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : stage.number}
                  </span>
                  <span className="font-semibold">{stage.short}</span>
                </button>
              );
            })}

            {/* If in Teacher Role, also show quick Teacher Dashboard Tab */}
            {userRole === 'teacher' && (
              <button
                id="tab-nav-teacher"
                onClick={() => setActiveTab('teacher_dashboard')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'teacher_dashboard'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-100/70 text-amber-800 border border-amber-300 hover:bg-amber-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Panel Guru & Nilai Siswa</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Teacher PIN Modal */}
      {showTeacherPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900">Autentikasi Guru</h3>
            <p className="text-xs text-center text-slate-500 mt-1 mb-4">
              Dashboard ini hanya dapat diakses oleh guru untuk memantau kemajuan belajar dan mengedit LKPD.
            </p>

            <form onSubmit={verifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Masukkan PIN Guru:
                </label>
                <input
                  type="password"
                  value={teacherPinInput}
                  onChange={(e) => setTeacherPinInput(e.target.value)}
                  placeholder="PIN standar: 1234"
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-center text-lg font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                  <span>Petunjuk PIN default: <b>1234</b></span>
                </div>
                {pinError && (
                  <p className="text-xs font-medium text-red-600 mt-1.5 text-center">{pinError}</p>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTeacherPinModal(false)}
                  className="flex-1 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
                >
                  Masuk Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Bagikan LKPD ke Peserta Didik</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Bagikan tautan berikut kepada siswa Anda. Siswa akan langsung masuk ke mode pengerjaan mandiri atau kelompok dengan progres tersimpan otomatis.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Target Kelas:
                </label>
                <select
                  value={selectedShareClass}
                  onChange={(e) => setSelectedShareClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="XII MIPA 1">XII MIPA 1</option>
                  <option value="XII MIPA 2">XII MIPA 2</option>
                  <option value="XII MIPA 3">XII MIPA 3</option>
                  <option value="XII Teknik Kimia 1">XII Teknik Kimia 1</option>
                  <option value="XII Farmasi">XII Farmasi</option>
                  <option value="Semua Kelas">Semua Kelas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tautan Khusus Siswa:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={getStudentShareUrl()}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-300 rounded-lg text-slate-700 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`inline-flex items-center space-x-1 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code Presentation Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center shadow-xs">
                    {/* SVG QR Code Simulation */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800" fill="currentColor">
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
                    <div className="text-xs font-bold text-slate-900">QR Code Proyektor Kelas</div>
                    <div className="text-[11px] text-slate-500">
                      Tampilkan di proyektor kelas agar siswa dapat langsung scan kamera HP.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.open(getStudentShareUrl(), '_blank')}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Uji Buka</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

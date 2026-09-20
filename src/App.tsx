import React, { useState, useEffect } from 'react';
import { 
  ActiveTab, 
  LKPDConfig, 
  StudentProfile, 
  StudentSubmission, 
  Stage1Answers, 
  Stage2Answers, 
  Stage3Answers, 
  Stage4Answers, 
  Stage5Answers 
} from './types';
import { 
  initialLKPDConfig, 
  initialStage1Answers, 
  initialStage2Answers, 
  initialStage3Answers, 
  initialStage4Answers, 
  initialStage5Answers 
} from './utils/defaults';
import { HeaderNavbar } from './components/HeaderNavbar';
import { StudentProfileModal } from './components/StudentProfileModal';
import { Stage1ProblemOrientation } from './components/Stage1ProblemOrientation';
import { Stage2OrganizingStudents } from './components/Stage2OrganizingStudents';
import { Stage3InvestigationGuide } from './components/Stage3InvestigationGuide';
import { Stage4DevelopAndPresent } from './components/Stage4DevelopAndPresent';
import { Stage5AnalyzeAndEvaluate } from './components/Stage5AnalyzeAndEvaluate';
import { TeacherDashboard } from './components/TeacherDashboard';
import { CheckCircle2, Award, ArrowRight, BookOpen, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<ActiveTab>('stage1');
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessModal, setSubmissionSuccessModal] = useState(false);

  // Student Profile
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('lkpd_student_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      name: '',
      studentId: '',
      className: 'XII MIPA 1',
      groupName: ''
    };
  });

  // Active LKPD Configuration
  const [config, setConfig] = useState<LKPDConfig>(initialLKPDConfig);

  // Student Stage Answers
  const [stage1, setStage1] = useState<Stage1Answers>(() => {
    const s = localStorage.getItem('lkpd_stage1');
    return s ? JSON.parse(s) : initialStage1Answers;
  });

  const [stage2, setStage2] = useState<Stage2Answers>(() => {
    const s = localStorage.getItem('lkpd_stage2');
    return s ? JSON.parse(s) : initialStage2Answers;
  });

  const [stage3, setStage3] = useState<Stage3Answers>(() => {
    const s = localStorage.getItem('lkpd_stage3');
    return s ? JSON.parse(s) : initialStage3Answers;
  });

  const [stage4, setStage4] = useState<Stage4Answers>(() => {
    const s = localStorage.getItem('lkpd_stage4');
    return s ? JSON.parse(s) : initialStage4Answers;
  });

  const [stage5, setStage5] = useState<Stage5Answers>(() => {
    const s = localStorage.getItem('lkpd_stage5');
    return s ? JSON.parse(s) : initialStage5Answers;
  });

  // Teacher Submissions Store
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  // Parse URL queries on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const modeParam = urlParams.get('mode');
      const classParam = urlParams.get('class');

      if (modeParam === 'teacher') {
        setUserRole('teacher');
        setActiveTab('teacher_dashboard');
      } else if (modeParam === 'student') {
        setUserRole('student');
      }

      if (classParam) {
        setStudentProfile(prev => ({ ...prev, className: decodeURIComponent(classParam) }));
      }
    }
  }, []);

  // Fetch LKPD configuration from server
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/lkpd-config');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setConfig(json.data);
          }
        }
      } catch (err) {
        console.warn('Using local fallback for LKPD config');
      }
    };
    fetchConfig();
  }, []);

  // Fetch submissions for teacher
  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSubmissions(json.data);
        }
      }
    } catch (err) {
      console.warn('Submissions fetch fallback');
    }
  };

  useEffect(() => {
    if (userRole === 'teacher') {
      fetchSubmissions();
    }
  }, [userRole]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('lkpd_student_profile', JSON.stringify(studentProfile));
  }, [studentProfile]);

  useEffect(() => {
    localStorage.setItem('lkpd_stage1', JSON.stringify(stage1));
  }, [stage1]);

  useEffect(() => {
    localStorage.setItem('lkpd_stage2', JSON.stringify(stage2));
  }, [stage2]);

  useEffect(() => {
    localStorage.setItem('lkpd_stage3', JSON.stringify(stage3));
  }, [stage3]);

  useEffect(() => {
    localStorage.setItem('lkpd_stage4', JSON.stringify(stage4));
  }, [stage4]);

  useEffect(() => {
    localStorage.setItem('lkpd_stage5', JSON.stringify(stage5));
  }, [stage5]);

  // Stage Completion Checks
  const completedStages = {
    stage1: stage1.score > 0 || (stage1.hypothesis.length > 10 && stage1.voltaPerspective.length > 10),
    stage2: stage2.completedSimulation || (stage2.electronFlowAnswer.length > 10 && stage2.saltBridgeFunctionAnswer.length > 10),
    stage3: stage3.experimentTable.length >= 2,
    stage4: stage4.score > 0 || Object.keys(stage4.cellNotations).length >= 2,
    stage5: Object.keys(stage5.hotsAnswers).length >= 2
  };

  // Calculate Overall Final Score
  const calculateTotalScore = () => {
    const s1 = stage1.score || 0;
    const s2 = stage2.score || 0;
    const s3 = stage3.score || 0;
    const s4 = stage4.score || 0;
    const s5 = stage5.hotsScore || 0;
    const avg = Math.round((s1 + s2 + s3 + s4 + s5) / 5);
    return Math.min(100, Math.max(0, avg));
  };

  // Submit Full LKPD to Teacher
  const handleSubmitFullLKPD = async () => {
    if (!studentProfile.name.trim()) {
      setShowProfileModal(true);
      return;
    }

    setIsSubmitting(true);
    const totalScore = calculateTotalScore();

    const payload: StudentSubmission = {
      id: `sub-${Date.now()}`,
      studentName: studentProfile.name,
      studentId: studentProfile.studentId || '2024000',
      className: studentProfile.className,
      groupName: studentProfile.groupName,
      submittedAt: new Date().toISOString(),
      stage1,
      stage2,
      stage3,
      stage4,
      stage5,
      totalScore,
      maxScore: 100,
      status: 'submitted'
    };

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
        setSubmissionSuccessModal(true);
        fetchSubmissions();
      }
    } catch (err) {
      // Local fallback
      setSubmissions(prev => [payload, ...prev]);
      setSubmissionSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Teacher Config Update
  const handleUpdateConfig = async (newConfig: LKPDConfig): Promise<boolean> => {
    try {
      const res = await fetch('/api/lkpd-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setConfig(newConfig);
        return true;
      }
    } catch (e) {
      setConfig(newConfig);
      return true;
    }
    return false;
  };

  // Teacher Config Reset
  const handleResetConfig = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/lkpd-config/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setConfig(json.data);
        return true;
      }
    } catch (e) {
      setConfig(initialLKPDConfig);
      return true;
    }
    return false;
  };

  // Teacher Feedback update
  const handleUpdateSubmissionFeedback = async (
    submissionId: string, 
    feedback: string, 
    adjustedScore?: number
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherFeedback: feedback, adjustedScore, status: 'graded' })
      });
      if (res.ok) {
        await fetchSubmissions();
        return true;
      }
    } catch (e) {
      setSubmissions(prev => prev.map(s => s.id === submissionId ? {
        ...s,
        teacherFeedback: feedback,
        totalScore: adjustedScore !== undefined ? adjustedScore : s.totalScore,
        status: 'graded'
      } : s));
      return true;
    }
    return false;
  };

  // Teacher Delete Submission
  const handleDeleteSubmission = async (submissionId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, { method: 'DELETE' });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        return true;
      }
    } catch (e) {
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-200">
      
      {/* Global Top Navbar */}
      <HeaderNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        studentProfile={studentProfile}
        completedStages={completedStages}
        onOpenProfileModal={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {userRole === 'teacher' && activeTab === 'teacher_dashboard' ? (
          <TeacherDashboard
            submissions={submissions}
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onResetConfig={handleResetConfig}
            onUpdateSubmissionFeedback={handleUpdateSubmissionFeedback}
            onDeleteSubmission={handleDeleteSubmission}
            onBackToStudentView={() => {
              setUserRole('student');
              setActiveTab('stage1');
            }}
          />
        ) : (
          <>
            {activeTab === 'stage1' && (
              <Stage1ProblemOrientation
                answers={stage1}
                onSaveAnswers={setStage1}
                config={config}
                onNextStage={() => setActiveTab('stage2')}
              />
            )}

            {activeTab === 'stage2' && (
              <Stage2OrganizingStudents
                answers={stage2}
                onSaveAnswers={setStage2}
                onNextStage={() => setActiveTab('stage3')}
                onPrevStage={() => setActiveTab('stage1')}
              />
            )}

            {activeTab === 'stage3' && (
              <Stage3InvestigationGuide
                answers={stage3}
                onSaveAnswers={setStage3}
                config={config}
                onNextStage={() => setActiveTab('stage4')}
                onPrevStage={() => setActiveTab('stage2')}
              />
            )}

            {activeTab === 'stage4' && (
              <Stage4DevelopAndPresent
                answers={stage4}
                stage3Data={stage3}
                onSaveAnswers={setStage4}
                config={config}
                onNextStage={() => setActiveTab('stage5')}
                onPrevStage={() => setActiveTab('stage3')}
              />
            )}

            {activeTab === 'stage5' && (
              <Stage5AnalyzeAndEvaluate
                answers={stage5}
                onSaveAnswers={setStage5}
                config={config}
                studentProfile={studentProfile}
                onSubmitFullLKPD={handleSubmitFullLKPD}
                onPrevStage={() => setActiveTab('stage4')}
                isSubmitting={isSubmitting}
              />
            )}
          </>
        )}
      </main>

      {/* Student Profile Dialog */}
      <StudentProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={studentProfile}
        onSave={(updated) => setStudentProfile(updated)}
      />

      {/* Success Submission Celebration Modal */}
      {submissionSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                PENGUMPULAN BERHASIL
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Selamat! LKPD Sel Volta Telah Terkirim
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Tugas Anda atas nama <b>{studentProfile.name}</b> ({studentProfile.className}) berhasil diserahkan ke Guru <b>{config.author}</b>.
              </p>
            </div>

            {/* Score Badge */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Estimasi Nilai Rata-rata PBL:</span>
              <div className="text-3xl font-black font-mono text-blue-600">
                {calculateTotalScore()} <span className="text-sm font-sans font-normal text-slate-400">/ 100</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[10px] text-slate-600 pt-2 border-t border-slate-200 font-mono">
                <div>T1: {stage1.score}</div>
                <div>T2: {stage2.score}</div>
                <div>T3: {stage3.score}</div>
                <div>T4: {stage4.score}</div>
                <div>T5: {stage5.hotsScore}</div>
              </div>
            </div>

            <button
              onClick={() => setSubmissionSuccessModal(false)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Selesai & Kembali ke Lembar Kerja
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <b>{config.title}</b> — Pembelajaran Kimia Fase F SMA/SMK
          </div>
          <div>
            Pengembang: {config.author} • Berbasis Sintaks PBL & TPACK (TCK)
          </div>
        </div>
      </footer>

    </div>
  );
}

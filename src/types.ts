export interface MetalOption {
  symbol: string;
  name: string;
  standardPotential: number; // in Volts
  color: string;
  ion: string;
}

export interface ExperimentObservation {
  id: string;
  anode: string;
  cathode: string;
  measuredVoltage: number;
  theoreticalVoltage: number;
  observedReaction: string;
  timestamp: string;
}

export interface HotsQuestion {
  id: string;
  stimulus: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  competency: string;
}

export interface LKPDConfig {
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
  metalOptions: MetalOption[];
  hotsQuestions: HotsQuestion[];
}

export interface StudentProfile {
  name: string;
  studentId: string;
  className: string;
  groupName: string;
}

export interface Stage1Answers {
  hypothesis: string;
  galvaniPerspective: string;
  voltaPerspective: string;
  conceptSummary: string;
  score: number;
}

export interface Stage2Answers {
  electronFlowAnswer: string;
  saltBridgeFunctionAnswer: string;
  ionMigrationAnswer: string;
  completedSimulation: boolean;
  score: number;
}

export interface Stage3Answers {
  experimentTable: ExperimentObservation[];
  saltBridgeMade: boolean;
  digitalVoltmeterUsed: boolean;
  score: number;
}

export interface Stage4Answers {
  percentErrorZnCu: number;
  errorAnalysisNotes: string;
  cellNotations: Record<string, string>; // pairKey -> notation e.g. "Zn-Cu": "Zn | Zn²⁺ || Cu²⁺ | Cu"
  voltaSeriesOrder: string[]; // e.g. ["Mg", "Al", "Zn", "Fe", "Cu"]
  score: number;
}

export interface Stage5Answers {
  hotsAnswers: Record<string, number>; // questionId -> selected option index
  hotsScore: number;
  reflection: string;
}

export interface StudentSubmission {
  id: string;
  studentName: string;
  studentId: string;
  className: string;
  groupName?: string;
  submittedAt: string;
  stage1: Stage1Answers;
  stage2: Stage2Answers;
  stage3: Stage3Answers;
  stage4: Stage4Answers;
  stage5: Stage5Answers;
  totalScore: number;
  maxScore: number;
  teacherFeedback?: string;
  status: 'draft' | 'submitted' | 'graded';
}

export type ActiveTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5' | 'teacher_dashboard';

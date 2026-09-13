export const practiceSources = {
  ies: 'https://ies.ed.gov/ncee/wwc/PracticeGuide/1',
  eef: 'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation',
  unicef: 'https://www.unicef.org/parenting/child-care/11-tips-communicating-your-teen',
} as const;

export const familyPractices = [
  { id: 'smallStep', source: 'eef' },
  { id: 'recall', source: 'ies' },
  { id: 'explain', source: 'ies' },
  { id: 'revisit', source: 'ies' },
  { id: 'listen', source: 'unicef' },
  { id: 'together', source: 'unicef' },
] as const;

export const practiceStepIds = ['choose', 'try', 'review'] as const;
export type FamilyPracticeId = (typeof familyPractices)[number]['id'];
export type PracticeMode = 'together' | 'accessible';
export type PracticeSession = {
  practiceId: FamilyPracticeId;
  stepIndex: number;
  mode: PracticeMode;
  phase: 'ready' | 'active' | 'finished' | 'skipped';
} | null;

export type PracticeAction =
  | { type: 'choose'; practiceId: FamilyPracticeId }
  | { type: 'mode'; mode: PracticeMode }
  | { type: 'start' | 'next' | 'back' | 'skip' | 'finish' | 'close' };

export function practiceSessionReducer(
  state: PracticeSession,
  action: PracticeAction,
): PracticeSession {
  if (action.type === 'close') return null;
  if (action.type === 'choose') {
    if (!familyPractices.some((practice) => practice.id === action.practiceId)) return state;
    return { practiceId: action.practiceId, stepIndex: 0, mode: 'together', phase: 'ready' };
  }
  if (!state) return state;
  if (action.type === 'mode') {
    if (state.phase === 'finished' || state.phase === 'skipped') return state;
    return { ...state, mode: action.mode };
  }
  if (action.type === 'back') {
    if (state.phase !== 'active') return null;
    return state.stepIndex === 0
      ? { ...state, phase: 'ready' }
      : { ...state, stepIndex: state.stepIndex - 1 };
  }
  if (action.type === 'start' && state.phase === 'ready') return { ...state, phase: 'active' };
  if (action.type === 'skip' && (state.phase === 'ready' || state.phase === 'active')) {
    return { ...state, phase: 'skipped' };
  }
  if (state.phase !== 'active') return state;
  if (action.type === 'next' && state.stepIndex < practiceStepIds.length - 1) {
    return { ...state, stepIndex: state.stepIndex + 1 };
  }
  if (action.type === 'finish' && state.stepIndex === practiceStepIds.length - 1) {
    return { ...state, phase: 'finished' };
  }
  return state;
}

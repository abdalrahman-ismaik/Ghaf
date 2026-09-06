export const ONBOARDING_STEPS = ['choose', 'support', 'growth'] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type ActiveExperience = 'signed_out' | 'parent' | 'child' | null;
export type ExperienceSection =
  | 'welcome'
  | 'parent-access'
  | 'child-access'
  | 'parent-experience'
  | 'child-experience'
  | 'neutral';

export interface FirstRunState {
  readonly completed: boolean;
  readonly step: OnboardingStep;
}

export type FirstRunAction =
  | { readonly type: 'back' }
  | { readonly type: 'next' }
  | { readonly type: 'skip' }
  | { readonly type: 'start' };

export const initialFirstRunState: FirstRunState = {
  completed: false,
  step: 'choose',
};

export function reduceFirstRunState(state: FirstRunState, action: FirstRunAction): FirstRunState {
  const index = ONBOARDING_STEPS.indexOf(state.step);

  if (action.type === 'skip') return { ...state, completed: true };
  if (action.type === 'start') {
    return state.step === 'growth' ? { ...state, completed: true } : state;
  }
  if (action.type === 'back') {
    return { ...state, step: ONBOARDING_STEPS[Math.max(0, index - 1)] ?? 'choose' };
  }
  return {
    ...state,
    step: ONBOARDING_STEPS[Math.min(ONBOARDING_STEPS.length - 1, index + 1)] ?? 'growth',
  };
}

export function classifyExperiencePath(
  pathname: string,
  activeExperience: ActiveExperience,
): ExperienceSection {
  if (pathname === '/') return 'welcome';
  if (pathname.startsWith('/access/parent')) return 'parent-access';
  if (pathname.startsWith('/access/child')) return 'child-access';
  if (pathname.startsWith('/parent')) return 'parent-experience';
  if (pathname.startsWith('/child') || pathname === '/league') return 'child-experience';
  if (pathname === '/garden' || pathname.startsWith('/garden/') || pathname.startsWith('/circle')) {
    if (activeExperience === 'parent') return 'parent-experience';
    if (activeExperience === 'child') return 'child-experience';
  }
  return 'neutral';
}

const bufferedHandoffs = new Set([
  'welcome:parent-access',
  'welcome:child-access',
  'welcome:parent-experience',
  'welcome:child-experience',
  'parent-access:parent-experience',
  'child-access:child-experience',
]);

export function shouldShowSectionTransition(
  previous: ExperienceSection,
  next: ExperienceSection,
): boolean {
  return bufferedHandoffs.has(`${previous}:${next}`);
}

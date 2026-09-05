import { useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import type { SyntheticChildId } from '@/models/familyGrowth';
import type {
  LearningCheckOptionId,
  LearningContentStepId,
  LearningRoute,
  MangroveLearningState,
} from '@/models/learning';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import { MANGROVE_ROOTS_LEARNING_PACKAGE } from './mangroveLearning';
import {
  createR002bLearningPresentation,
  type R002bLearningPresentation,
} from './r002bLearningViewModel';

export const R002B_SYNTHETIC_LEARNING_COMPLETION_TIME = '2026-09-05T12:30:00.000Z';

export type ActiveR002bLearningPresentation =
  | {
      readonly ok: true;
      readonly data: R002bLearningPresentation;
      readonly state: MangroveLearningState;
    }
  | {
      readonly ok: false;
      readonly reason: 'profile_mismatch' | 'not_unlocked' | 'invalid_origin' | 'inactive_route';
    };

type R002bLearningMountFailure = Extract<
  ActiveR002bLearningPresentation,
  { readonly ok: false }
>['reason'];

function validateMountedLearning(input: {
  readonly profileId: SyntheticChildId;
  readonly route: LearningRoute;
  readonly state: MangroveLearningState;
}): R002bLearningMountFailure | null {
  if (
    input.state.packageId !== MANGROVE_ROOTS_LEARNING_PACKAGE.id ||
    input.state.profileId !== input.profileId
  ) {
    return 'profile_mismatch';
  }
  if (!input.state.unlockEvidence?.reachedThresholds.includes(132)) return 'not_unlocked';
  if (
    (input.state.origin?.kind !== 'impact_path' && input.state.origin?.kind !== 'badge_detail') ||
    input.state.origin.profileId !== input.profileId
  ) {
    return 'invalid_origin';
  }
  if (input.state.completion === null && input.state.activeRoute !== input.route) {
    return 'inactive_route';
  }
  return null;
}

export function useR002bLearningPresentation(input: {
  readonly navigateToMode: (route: LearningRoute) => void;
  readonly profileId: SyntheticChildId;
  readonly route: LearningRoute;
}): ActiveR002bLearningPresentation {
  const { t } = useTranslation();
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const learningState = usePrototypeStore(
    (state) => state.mangroveLearningByProfile[input.profileId],
  );
  const advanceLearning = usePrototypeStore((state) => state.advanceMangroveLearning);
  const answerCheck = usePrototypeStore((state) => state.answerMangroveLearningCheck);
  const completeLearning = usePrototypeStore((state) => state.completeMangroveLearning);
  const startLearning = usePrototypeStore((state) => state.startMangroveLearning);
  const reducedMotion = Boolean(useReducedMotion());
  const [selectedOptionId, setSelectedOptionId] = useState<LearningCheckOptionId | null>(null);
  const [actionError, setActionError] = useState(false);

  const invalid = validateMountedLearning({
    profileId: input.profileId,
    route: input.route,
    state: learningState,
  });
  if (invalid) return { ok: false, reason: invalid };

  const run = (action: () => { readonly ok: boolean }) => {
    const result = action();
    setActionError(!result.ok);
    return result.ok;
  };
  const advance = (stepId: LearningContentStepId) => {
    run(() => advanceLearning(input.route, stepId));
  };
  const answer = (optionId: LearningCheckOptionId) => {
    setSelectedOptionId(optionId);
    run(() => answerCheck(input.route, optionId));
  };
  const complete = () => {
    run(() => completeLearning(input.route, R002B_SYNTHETIC_LEARNING_COMPLETION_TIME));
  };
  const switchMode = (route: LearningRoute) => {
    const origin = learningState.origin;
    if (!origin || !run(() => startLearning(route, origin))) return;
    setSelectedOptionId(null);
    input.navigateToMode(route);
  };

  return {
    ok: true,
    state: learningState,
    data: createR002bLearningPresentation({
      actionError,
      state: learningState,
      route: input.route,
      language,
      direction,
      reducedMotion,
      selectedOptionId,
      translate: (key, values) => String(t(key, values)),
      actions: { advance, answer, complete, switchMode },
    }),
  };
}

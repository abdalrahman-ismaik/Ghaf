import { useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import {
  createGrowthJourneyPresentation,
  type GrowthJourneyPresentationActions,
  type GrowthJourneyPresentationModel,
} from './r002bViewModel';
import { projectR002bGrowthExperienceWithLearning } from './presentation';

export type ActiveGrowthPresentationResult =
  | { readonly ok: true; readonly data: GrowthJourneyPresentationModel }
  | { readonly ok: false; readonly reason: 'disabled' | 'projection_unavailable' };

export function useR002bGrowthPresentation(input: {
  readonly actions: GrowthJourneyPresentationActions;
  readonly enabled: boolean;
  readonly profileId: SyntheticChildId;
}): ActiveGrowthPresentationResult {
  const { t } = useTranslation();
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const growthJourney = usePrototypeStore((state) => state.growthJourney);
  const journey = usePrototypeStore((state) => state.journey);
  const learningState = usePrototypeStore(
    (state) => state.mangroveLearningByProfile[input.profileId],
  );
  const mangroveProgress = usePrototypeStore((state) => state.landscapeProgress.mangrove);
  const reducedMotion = Boolean(useReducedMotion());

  if (!input.enabled) return { ok: false, reason: 'disabled' };

  const projected = projectR002bGrowthExperienceWithLearning({
    runtime: growthJourney,
    profileId: input.profileId,
    journey,
    learningState,
  });
  if (!projected.ok) return { ok: false, reason: 'projection_unavailable' };

  const earnedAtByBadgeId = Object.fromEntries(
    growthJourney.achievementsByProfile[input.profileId].awards.map((award) => [
      award.badgeId,
      award.earnedAt,
    ]),
  );
  const currentMangroveStage =
    input.profileId === 'child_salem'
      ? {
          currentSeeds: mangroveProgress.cumulativeSeeds,
          targetSeeds:
            mangroveProgress.nextThreshold ?? Math.max(mangroveProgress.cumulativeSeeds, 1),
        }
      : null;

  return {
    ok: true,
    data: createGrowthJourneyPresentation({
      projection: projected.data,
      currentMangroveStage,
      language,
      direction,
      reducedMotion,
      translate: (key, values) => String(t(key, values)),
      actions: input.actions,
      earnedAtByBadgeId,
    }),
  };
}

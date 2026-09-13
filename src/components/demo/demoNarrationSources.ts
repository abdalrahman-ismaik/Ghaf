import type { LocaleCode } from '@/models/familyGrowth';

import type { DemoStoryStep } from './types';

const sources = [
  require('../../../assets/audio/demo-onboarding/ar-together-wiam-v1.mp3') as number,
  require('../../../assets/audio/demo-onboarding/ar-support-wiam-v1.mp3') as number,
  require('../../../assets/audio/demo-onboarding/ar-growth-wiam-v1.mp3') as number,
] as const;

export function getDemoNarrationSource(
  locale: LocaleCode,
  step: DemoStoryStep | null,
  active: boolean,
): number | null {
  if (!active || locale !== 'ar') return null;
  if (step === 2) return sources[0];
  if (step === 4) return sources[1];
  if (step === 5) return sources[2];
  return null;
}

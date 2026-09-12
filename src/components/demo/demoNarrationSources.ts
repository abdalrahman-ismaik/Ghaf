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
  return active && locale === 'ar' && (step === 0 || step === 1 || step === 2)
    ? (sources[step] ?? null)
    : null;
}

import type { LocaleCode } from '@/models/familyGrowth';

import type { OnboardingStep } from './experienceModel';

export const onboardingNarrationSources: Readonly<
  Record<LocaleCode, Readonly<Record<OnboardingStep, number | null>>>
> = {
  ar: {
    intro: require('../../../assets/audio/onboarding/narration-ar-intro-v2.mp3'),
    family: require('../../../assets/audio/onboarding/narration-ar-family-v2.mp3'),
    sustainability: require('../../../assets/audio/onboarding/narration-ar-sustainability-v2.mp3'),
    ai: require('../../../assets/audio/onboarding/narration-ar-assistant-v2.mp3'),
    support: require('../../../assets/audio/onboarding/narration-ar-support-v2.mp3'),
    growth: require('../../../assets/audio/onboarding/narration-ar-growth-v2.mp3'),
  },
  en: {
    intro: require('../../../assets/audio/onboarding/narration-en-intro-v1.mp3'),
    family: require('../../../assets/audio/onboarding/narration-en-family-v1.mp3'),
    sustainability: require('../../../assets/audio/onboarding/narration-en-sustainability-v1.mp3'),
    ai: require('../../../assets/audio/onboarding/narration-en-assistant-v1.mp3'),
    support: require('../../../assets/audio/onboarding/narration-en-support-v1.mp3'),
    growth: require('../../../assets/audio/onboarding/narration-en-growth-v1.mp3'),
  },
};

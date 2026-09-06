import type { LocaleCode } from '@/models/familyGrowth';

import type { OnboardingStep } from './experienceModel';

export const onboardingNarrationSources: Readonly<
  Record<LocaleCode, Readonly<Record<OnboardingStep, number>>>
> = {
  ar: {
    intro: require('../../../assets/audio/onboarding/narration-ar-intro-v1.mp3'),
    family: require('../../../assets/audio/onboarding/narration-ar-family-v1.mp3'),
    sustainability: require('../../../assets/audio/onboarding/narration-ar-sustainability-v1.mp3'),
    ai: require('../../../assets/audio/onboarding/narration-ar-ai-v1.mp3'),
    support: require('../../../assets/audio/onboarding/narration-ar-support-v1.mp3'),
    growth: require('../../../assets/audio/onboarding/narration-ar-growth-v1.mp3'),
  },
  en: {
    intro: require('../../../assets/audio/onboarding/narration-en-intro-v1.mp3'),
    family: require('../../../assets/audio/onboarding/narration-en-family-v1.mp3'),
    sustainability: require('../../../assets/audio/onboarding/narration-en-sustainability-v1.mp3'),
    ai: require('../../../assets/audio/onboarding/narration-en-ai-v1.mp3'),
    support: require('../../../assets/audio/onboarding/narration-en-support-v1.mp3'),
    growth: require('../../../assets/audio/onboarding/narration-en-growth-v1.mp3'),
  },
};

export const onboardingAmbienceSource = require('../../../assets/audio/onboarding/ambience-nature-v1.mp3');

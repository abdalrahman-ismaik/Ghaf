import type { DemoPrincipal } from '@/models/demoEntry';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';

export interface DemoProfileOption {
  readonly principal: DemoPrincipal;
  readonly name: string;
  readonly roleLabel: string;
  readonly description: string;
  readonly avatar: 'parent' | 'ghaf_tree' | 'flower';
}

export interface DemoStoryMoment {
  readonly id: 'together' | 'support' | 'growth';
  readonly title: string;
  readonly body: string;
  readonly imageAlt: string;
  readonly assetId: 'onboarding-action' | 'onboarding-support' | 'onboarding-growth';
}

export interface DemoEntryCopy {
  readonly title: string;
  readonly body: string;
  readonly disclosure: string;
  readonly restartNotice: string;
  readonly breadthNotice: string;
  readonly busyLabel: string;
  readonly unavailableError: string;
  readonly restartRequiredTitle: string;
  readonly restartRequiredBody: string;
  readonly storyAction: string;
  readonly languageAction: string;
  readonly profiles: readonly DemoProfileOption[];
  readonly moments: readonly DemoStoryMoment[];
  readonly story: {
    readonly close: string;
    readonly next: string;
    readonly back: string;
    readonly finish: string;
    readonly progressLabel: (current: number, total: number) => string;
    readonly audioUnavailable: string;
    readonly audioPlay: string;
    readonly audioStop: string;
    readonly audioReplay: string;
    readonly audioLoading: string;
    readonly audioScreenReader: string;
  };
}

export interface DemoNarrationControls {
  readonly status: 'silent' | 'loading' | 'playing' | 'unavailable';
  readonly canPlay: boolean;
  readonly canStop: boolean;
  readonly canReplay: boolean;
  readonly screenReaderActive: boolean;
  readonly onPlay: () => void;
  readonly onStop: () => void;
  readonly onReplay: () => void;
}

export interface DemoEntryScreenProps {
  readonly runGeneration: number;
  readonly entryEpoch: number;
  readonly locale: LocaleCode;
  readonly direction: TextDirection;
  readonly copy: DemoEntryCopy;
  readonly busy: boolean;
  readonly error: string | null;
  readonly restartRequired: boolean;
  readonly onChooseProfile: (principal: DemoPrincipal) => void;
  readonly onChangeLocale: () => void;
}

export type DemoStoryStep = 0 | 1 | 2;

export interface DemoOnboardingStoryProps {
  readonly navigationPlacement?: 'inline' | 'footer';
  readonly narration?: DemoNarrationControls;
  readonly locale: LocaleCode;
  readonly direction: TextDirection;
  readonly copy: DemoEntryCopy;
  readonly step: DemoStoryStep;
  readonly onStepChange: (step: DemoStoryStep) => void;
  readonly onClose: () => void;
}

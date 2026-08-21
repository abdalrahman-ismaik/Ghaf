export const SUPPORTED_LOCALES = ['ar', 'en'] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];
export type TextDirection = 'rtl' | 'ltr';
export type PrototypeRole = 'parent' | 'child';

export interface LocalizedText {
  readonly ar: string;
  readonly en: string;
}

export interface ParentProfile {
  readonly id: string;
  readonly role: 'parent';
  readonly displayName: LocalizedText;
}

export interface ChildProfile {
  readonly id: string;
  readonly role: 'child';
  readonly displayName: LocalizedText;
  readonly ageBand: '8-10';
}

export interface FamilyProfile {
  readonly id: string;
  readonly displayName: LocalizedText;
  readonly parent: ParentProfile;
  readonly child: ChildProfile;
}

export interface MissionStep {
  readonly id: string;
  readonly text: LocalizedText;
}

export interface MissionImpactTarget {
  readonly estimatedGrams: number;
  readonly estimatedPortions: number;
}

export interface MissionSummary {
  readonly id: string;
  readonly title: LocalizedText;
  readonly story: LocalizedText;
  readonly steps: readonly [MissionStep, MissionStep, MissionStep];
  readonly status: 'assigned';
  readonly reward: LocalizedText;
  readonly impactTarget: MissionImpactTarget;
  readonly source: 'pregenerated-mock';
}

export interface ImpactSummary {
  readonly rescuedGrams: number;
  readonly rescuedPortions: number;
  readonly completedMissions: number;
  readonly streakDays: number;
}

export type GhafStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface GhafProgress {
  readonly stage: GhafStage;
  readonly progressPercent: number;
  readonly newMilestone: LocalizedText | null;
}

export type PreparedMediaKind = 'image' | 'audio';

export interface PreparedMedia {
  readonly id: string;
  readonly kind: PreparedMediaKind;
  readonly uri: string;
  readonly label: LocalizedText;
  readonly source: 'prepared-demo';
}

export interface PrototypeSession {
  readonly locale: LocaleCode;
  readonly role: PrototypeRole;
  readonly family: FamilyProfile;
  readonly mission: MissionSummary;
  readonly impact: ImpactSummary;
  readonly ghaf: GhafProgress;
  readonly mockMode: true;
}

/**
 * Accepts values read from platform or prototype storage. Unsupported or malformed
 * values deliberately return the Arabic-first demo default.
 */
export function coerceLocale(value: unknown): LocaleCode {
  if (typeof value !== 'string') {
    return 'ar';
  }

  const language = value.trim().toLowerCase().split(/[-_]/, 1)[0];
  return language === 'en' ? 'en' : 'ar';
}

export function getLocaleDirection(value: unknown): TextDirection {
  return coerceLocale(value) === 'ar' ? 'rtl' : 'ltr';
}

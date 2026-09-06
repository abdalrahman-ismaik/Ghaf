import type { GardenStage, LandscapeId } from '@/models/familyGrowth';
import type { LeagueTreeAvatarToken } from '@/models/familyLeague';
import type { ChildTreeAvatarId } from '@/models/parentOnboarding';

export const artworkSources = {
  'field-paper': require('../../../assets/images/illustrations/r003/final/field-paper.jpg'),
  'welcome-ghaf-habitat': require('../../../assets/images/illustrations/r003/final/welcome-ghaf-habitat.jpg'),
  'onboarding-ghaf-intro': require('../../../assets/images/illustrations/r003/final/onboarding-ghaf-intro.jpg'),
  'onboarding-action': require('../../../assets/images/illustrations/r003/final/onboarding-action.jpg'),
  'onboarding-support': require('../../../assets/images/illustrations/r003/final/onboarding-support.jpg'),
  'onboarding-growth': require('../../../assets/images/illustrations/r003/final/onboarding-growth.jpg'),
  'section-transition': require('../../../assets/images/illustrations/r003/final/section-transition.jpg'),
  'avatar-ghaf': require('../../../assets/images/illustrations/r003/final/avatar-ghaf.jpg'),
  'avatar-leaf': require('../../../assets/images/illustrations/r003/final/avatar-leaf.jpg'),
  'avatar-flower': require('../../../assets/images/illustrations/r003/final/avatar-flower.jpg'),
  'avatar-energy-leaf': require('../../../assets/images/illustrations/r003/final/avatar-energy-leaf.jpg'),
  'avatar-water-drop': require('../../../assets/images/illustrations/r003/final/avatar-water-drop.jpg'),
  'task-recycling': require('../../../assets/images/illustrations/r003/final/task-recycling.jpg'),
  'ghaf-seed': require('../../../assets/images/illustrations/r003/final/ghaf-seed.jpg'),
  'ghaf-shoot': require('../../../assets/images/illustrations/r003/final/ghaf-shoot.jpg'),
  'ghaf-sapling': require('../../../assets/images/illustrations/r003/final/ghaf-sapling.jpg'),
  'ghaf-shade': require('../../../assets/images/illustrations/r003/final/ghaf-shade.jpg'),
  'ghaf-flourishing': require('../../../assets/images/illustrations/r003/final/ghaf-flourishing.jpg'),
  'samar-seed': require('../../../assets/images/illustrations/r003/final/samar-seed.jpg'),
  'samar-shoot': require('../../../assets/images/illustrations/r003/final/samar-shoot.jpg'),
  'samar-sapling': require('../../../assets/images/illustrations/r003/final/samar-sapling.jpg'),
  'samar-shade': require('../../../assets/images/illustrations/r003/final/samar-shade.jpg'),
  'samar-flourishing': require('../../../assets/images/illustrations/r003/final/samar-flourishing.jpg'),
  'sidr-seed': require('../../../assets/images/illustrations/r003/final/sidr-seed.jpg'),
  'sidr-shoot': require('../../../assets/images/illustrations/r003/final/sidr-shoot.jpg'),
  'sidr-sapling': require('../../../assets/images/illustrations/r003/final/sidr-sapling.jpg'),
  'sidr-shade': require('../../../assets/images/illustrations/r003/final/sidr-shade.jpg'),
  'sidr-flourishing': require('../../../assets/images/illustrations/r003/final/sidr-flourishing.jpg'),
  'date-palm-seed': require('../../../assets/images/illustrations/r003/final/date-palm-seed.jpg'),
  'date-palm-shoot': require('../../../assets/images/illustrations/r003/final/date-palm-shoot.jpg'),
  'date-palm-sapling': require('../../../assets/images/illustrations/r003/final/date-palm-sapling.jpg'),
  'date-palm-shade': require('../../../assets/images/illustrations/r003/final/date-palm-shade.jpg'),
  'date-palm-flourishing': require('../../../assets/images/illustrations/r003/final/date-palm-flourishing.jpg'),
  'mangrove-seed': require('../../../assets/images/illustrations/r003/final/mangrove-seed.jpg'),
  'mangrove-shoot': require('../../../assets/images/illustrations/r003/final/mangrove-shoot.jpg'),
  'mangrove-sapling': require('../../../assets/images/illustrations/r003/final/mangrove-sapling.jpg'),
  'mangrove-shade': require('../../../assets/images/illustrations/r003/final/mangrove-shade.jpg'),
  'mangrove-flourishing': require('../../../assets/images/illustrations/r003/final/mangrove-flourishing.jpg'),
  'family-canopy-19': require('../../../assets/images/illustrations/r003/final/family-canopy-19.jpg'),
  'family-canopy-20': require('../../../assets/images/illustrations/r003/final/family-canopy-20.jpg'),
  'circle-garden-1': require('../../../assets/images/illustrations/r003/final/circle-garden-1.jpg'),
  'circle-garden-2': require('../../../assets/images/illustrations/r003/final/circle-garden-2.jpg'),
  'circle-garden-3': require('../../../assets/images/illustrations/r003/final/circle-garden-3.jpg'),
  'recognition-reveal': require('../../../assets/images/illustrations/r003/final/recognition-reveal.jpg'),
  'mangrove-habitat': require('../../../assets/images/illustrations/r003/final/mangrove-habitat.jpg'),
  'shared-coastal-canopy': require('../../../assets/images/illustrations/r003/final/shared-coastal-canopy.jpg'),
} as const;

export type ArtworkId = keyof typeof artworkSources;
export type ArtworkSource = (typeof artworkSources)[ArtworkId];

export const accessFieldArtworkSource = artworkSources['field-paper'];
export const welcomeArtworkSource = artworkSources['welcome-ghaf-habitat'];
export const onboardingArtworkIds = [
  'onboarding-ghaf-intro',
  'onboarding-action',
  'onboarding-support',
  'onboarding-growth',
] as const satisfies readonly ArtworkId[];
export const sectionTransitionArtworkSource = artworkSources['section-transition'];
export const taskArtworkSource = artworkSources['task-recycling'];
export const revealArtworkSource = artworkSources['recognition-reveal'];
export const learningArtworkSource = artworkSources['mangrove-habitat'];
export const sharedGrowthArtworkSource = artworkSources['shared-coastal-canopy'];

export const botanicalAvatarArtworkIds: Readonly<Record<ChildTreeAvatarId, ArtworkId>> = {
  ghaf_tree: 'avatar-ghaf',
  leaf: 'avatar-leaf',
  flower: 'avatar-flower',
  energy_leaf: 'avatar-energy-leaf',
  water_drop: 'avatar-water-drop',
};

export const leagueAvatarArtworkIds: Readonly<Record<LeagueTreeAvatarToken, ArtworkId>> = {
  mangrove_shoot: 'avatar-water-drop',
  ghaf_leaf: 'avatar-ghaf',
  sidr_sapling: 'avatar-flower',
};

export const landscapeArtworkIds: Readonly<
  Record<LandscapeId, Readonly<Record<GardenStage, ArtworkId>>>
> = {
  ghaf: {
    seed: 'ghaf-seed',
    shoot: 'ghaf-shoot',
    sapling: 'ghaf-sapling',
    shade: 'ghaf-shade',
    flourishing: 'ghaf-flourishing',
  },
  samar: {
    seed: 'samar-seed',
    shoot: 'samar-shoot',
    sapling: 'samar-sapling',
    shade: 'samar-shade',
    flourishing: 'samar-flourishing',
  },
  sidr: {
    seed: 'sidr-seed',
    shoot: 'sidr-shoot',
    sapling: 'sidr-sapling',
    shade: 'sidr-shade',
    flourishing: 'sidr-flourishing',
  },
  date_palm: {
    seed: 'date-palm-seed',
    shoot: 'date-palm-shoot',
    sapling: 'date-palm-sapling',
    shade: 'date-palm-shade',
    flourishing: 'date-palm-flourishing',
  },
  mangrove: {
    seed: 'mangrove-seed',
    shoot: 'mangrove-shoot',
    sapling: 'mangrove-sapling',
    shade: 'mangrove-shade',
    flourishing: 'mangrove-flourishing',
  },
};

export const landscapeArtworkSources: Readonly<
  Record<LandscapeId, Readonly<Record<GardenStage, ArtworkSource>>>
> = {
  ghaf: {
    seed: artworkSources['ghaf-seed'],
    shoot: artworkSources['ghaf-shoot'],
    sapling: artworkSources['ghaf-sapling'],
    shade: artworkSources['ghaf-shade'],
    flourishing: artworkSources['ghaf-flourishing'],
  },
  samar: {
    seed: artworkSources['samar-seed'],
    shoot: artworkSources['samar-shoot'],
    sapling: artworkSources['samar-sapling'],
    shade: artworkSources['samar-shade'],
    flourishing: artworkSources['samar-flourishing'],
  },
  sidr: {
    seed: artworkSources['sidr-seed'],
    shoot: artworkSources['sidr-shoot'],
    sapling: artworkSources['sidr-sapling'],
    shade: artworkSources['sidr-shade'],
    flourishing: artworkSources['sidr-flourishing'],
  },
  date_palm: {
    seed: artworkSources['date-palm-seed'],
    shoot: artworkSources['date-palm-shoot'],
    sapling: artworkSources['date-palm-sapling'],
    shade: artworkSources['date-palm-shade'],
    flourishing: artworkSources['date-palm-flourishing'],
  },
  mangrove: {
    seed: artworkSources['mangrove-seed'],
    shoot: artworkSources['mangrove-shoot'],
    sapling: artworkSources['mangrove-sapling'],
    shade: artworkSources['mangrove-shade'],
    flourishing: artworkSources['mangrove-flourishing'],
  },
};

export const familyCanopyArtworkSources = {
  19: artworkSources['family-canopy-19'],
  20: artworkSources['family-canopy-20'],
} as const;

export const circleGardenArtworkSources = [
  artworkSources['circle-garden-1'],
  artworkSources['circle-garden-2'],
  artworkSources['circle-garden-3'],
] as const;

export const circleGardenArtworkIds = [
  'circle-garden-1',
  'circle-garden-2',
  'circle-garden-3',
] as const satisfies readonly ArtworkId[];

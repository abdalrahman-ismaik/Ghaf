import type { GhafProgress, GhafStage, LocalizedText } from '../../models/prototype';

export const GHAF_STAGE_NAMES: readonly LocalizedText[] = [
  { ar: 'بذرة', en: 'Seed' },
  { ar: 'إنبات', en: 'Germination' },
  { ar: 'شتلة', en: 'Sapling' },
  { ar: 'شجرة فتية', en: 'Young tree' },
  { ar: 'شجرة متفرعة', en: 'Branching tree' },
  { ar: 'شجرة غاف مكتملة', en: 'Full Ghaf tree' },
];

export const GHAF_STAGE_THRESHOLDS = [0, 20, 40, 60, 80, 100] as const;

const milestoneByStage: Readonly<
  Partial<Record<GhafStage, { readonly id: string; readonly label: LocalizedText }>>
> = {
  1: { id: 'roots', label: { ar: 'ظهرت الجذور الأولى', en: 'The first roots appear' } },
  2: { id: 'sapling', label: { ar: 'نمت شتلة غاف', en: 'A Ghaf sapling grows' } },
  3: { id: 'new-branch', label: { ar: 'ظهر غصن جديد', en: 'A new branch appears' } },
  4: { id: 'leaves', label: { ar: 'امتلأت الأغصان بالأوراق', en: 'Leaves fill the branches' } },
  5: { id: 'full-tree', label: { ar: 'اكتملت شجرة الغاف', en: 'The Ghaf tree is full' } },
};

export function deriveGhafStage(progressPoints: number): GhafStage {
  const bounded = Math.max(0, Math.min(100, Math.trunc(progressPoints)));
  let stage: GhafStage = 0;

  for (let index = 1; index < GHAF_STAGE_THRESHOLDS.length; index += 1) {
    const threshold = GHAF_STAGE_THRESHOLDS[index];
    if (threshold !== undefined && bounded >= threshold) {
      stage = index as GhafStage;
    }
  }

  return stage;
}

export function applyGhafAward(current: GhafProgress, awardedPoints: number): GhafProgress {
  const safeAward = Number.isFinite(awardedPoints) ? Math.max(0, Math.trunc(awardedPoints)) : 0;
  const progressPoints = Math.min(100, current.progressPoints + safeAward);
  const stage = deriveGhafStage(progressPoints);
  const unlockedMilestoneIds = [...current.unlockedMilestoneIds];
  let newMilestone: LocalizedText | null = null;

  if (stage > current.stage) {
    for (let next = current.stage + 1; next <= stage; next += 1) {
      const milestone = milestoneByStage[next as GhafStage];
      if (milestone && !unlockedMilestoneIds.includes(milestone.id)) {
        unlockedMilestoneIds.push(milestone.id);
        newMilestone = milestone.label;
      }
    }
  }

  return {
    stage,
    progressPoints,
    progressPercent: progressPoints,
    unlockedMilestoneIds,
    newMilestone,
  };
}

export function milestoneIdForStage(stage: GhafStage): string | null {
  return milestoneByStage[stage]?.id ?? null;
}

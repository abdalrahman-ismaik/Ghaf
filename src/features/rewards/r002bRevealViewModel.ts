import type {
  RevealActionPresentation,
  RevealBundleActionBarProps,
  RevealBundleScreenProps,
  RevealConsequencePresentation,
  RevealContentState,
} from '@/components/r002b/RevealBundleScreen';
import { getBadgeDefinition } from '@/features/growth/badgeRegistry';
import type { LocaleCode, SyntheticChildId, TextDirection } from '@/models/familyGrowth';
import type {
  CommittedRevealSourceReceipt,
  RevealBundle,
  RevealConsequence,
} from '@/models/revealBundle';

export type RevealTranslate = (key: string, values?: Record<string, string | number>) => string;

export type RevealRecoveryState = 'stable' | 'interrupted' | 'recovered' | 'offline' | 'error';

export interface RevealBundlePresentationInput {
  readonly bundle: RevealBundle;
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly onAcknowledge: () => void;
  readonly onOpenGrowth?: () => void;
  readonly onRecover?: () => void;
  readonly profileEpochId: string;
  readonly profileId: SyntheticChildId;
  readonly recoveryState?: RevealRecoveryState;
  readonly reducedMotion: boolean;
  readonly submitting?: boolean;
  readonly translate: RevealTranslate;
}

export type RevealBundlePresentationResult =
  | {
      readonly ok: true;
      readonly data: {
        readonly actions: RevealBundleActionBarProps;
        readonly screen: RevealBundleScreenProps;
      };
    }
  | {
      readonly ok: false;
      readonly reason:
        | 'profile_mismatch'
        | 'epoch_mismatch'
        | 'invalid_identity'
        | 'invalid_bundle'
        | 'already_seen';
    };

const KIND_ORDER: Readonly<Record<RevealConsequence['kind'], number>> = {
  parent_praise: 0,
  seed: 1,
  plant_stage: 2,
  canopy: 3,
  green_circle: 4,
  private_league_leaf: 5,
  challenge_leaf: 6,
  private_family_reward: 7,
  earned_badge: 8,
  impact_path_station: 9,
  unlocked_learning: 10,
  safe_help: 11,
};

const BIDI_LTR_ISOLATE_START = '\u2066';
const BIDI_ISOLATE_END = '\u2069';

function isolateProgressRange(value: string): string {
  return `${BIDI_LTR_ISOLATE_START}${value}${BIDI_ISOLATE_END}`;
}

function accessibleLabel(parts: readonly (string | undefined)[]): string {
  return parts.filter((part): part is string => Boolean(part)).join('. ');
}

function formatNumber(language: LocaleCode, value: number): string {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-AE', {
    useGrouping: false,
  }).format(value);
}

function contentState(input: RevealBundlePresentationInput): RevealContentState {
  if (input.recoveryState && input.recoveryState !== 'stable') return input.recoveryState;
  if (input.bundle.lifecycle === 'ready') return 'ready';
  if (input.bundle.lifecycle === 'presenting') return 'presenting';
  return 'archived';
}

function statusKey(state: RevealContentState): string {
  return `r002bReveal.state.${state}`;
}

function presentationItem(
  receipt: CommittedRevealSourceReceipt,
  input: RevealBundlePresentationInput,
): RevealConsequencePresentation {
  const { consequence } = receipt;
  const t = input.translate;
  const number = (value: number) => formatNumber(input.language, value);
  const common = {
    id: receipt.id,
    kind: consequence.kind,
  } as const;

  switch (consequence.kind) {
    case 'parent_praise': {
      const detail = consequence.text[input.language];
      const statusLabel = t('r002bReveal.item.praise.status');
      return {
        ...common,
        title: t('r002bReveal.item.praise.title'),
        detail,
        iconName: 'family',
        tone: 'emerald',
        statusLabel,
        accessibilityLabel: accessibleLabel([
          t('r002bReveal.item.praise.title'),
          detail,
          statusLabel,
        ]),
      };
    }
    case 'seed': {
      const value = t('r002bReveal.item.seed.delta', { delta: number(consequence.delta) });
      const detail = t('r002bReveal.item.seed.detail', {
        before: number(consequence.before),
        after: number(consequence.after),
      });
      const statusLabel = t('r002bReveal.item.seed.status');
      return {
        ...common,
        title: t('r002bReveal.item.seed.title'),
        value,
        detail,
        iconName: 'flower',
        tone: 'amber',
        statusLabel,
        accessibilityLabel: accessibleLabel([
          t('r002bReveal.item.seed.title'),
          value,
          detail,
          statusLabel,
        ]),
      };
    }
    case 'plant_stage': {
      const landscape = t(`r002bReveal.landscape.${consequence.landscapeId}`);
      const stageBefore = t(`r002bReveal.stage.${consequence.stageBefore}`);
      const stageAfter = t(`r002bReveal.stage.${consequence.stageAfter}`);
      const value = isolateProgressRange(
        t('r002bReveal.item.plant.range', {
          before: number(consequence.seedsBefore),
          after: number(consequence.seedsAfter),
        }),
      );
      const detail = t('r002bReveal.item.plant.detail', {
        landscape,
        before: stageBefore,
        after: stageAfter,
      });
      const statusLabel = consequence.crossedThreshold
        ? t('r002bReveal.item.plant.threshold', {
            threshold: number(consequence.crossedThreshold),
          })
        : t('r002bReveal.item.plant.progress');
      return {
        ...common,
        title: t('r002bReveal.item.plant.title'),
        value,
        detail,
        iconName: 'ghaf-tree',
        tone: 'emerald',
        statusLabel,
        accessibilityLabel: accessibleLabel([
          t('r002bReveal.item.plant.title'),
          detail,
          value,
          statusLabel,
        ]),
      };
    }
    case 'canopy': {
      const value = t('r002bReveal.item.canopy.delta', { delta: number(consequence.leafDelta) });
      const detail = t('r002bReveal.item.canopy.detail', {
        current: number(consequence.leavesAfter),
        goal: number(consequence.goalLeaves),
      });
      return {
        ...common,
        title: t('r002bReveal.item.canopy.title'),
        value,
        detail,
        iconName: 'leaf',
        tone: 'emerald',
        accessibilityLabel: `${t('r002bReveal.item.canopy.title')}. ${value}. ${detail}`,
      };
    }
    case 'green_circle': {
      const value = t('r002bReveal.item.circle.delta', { delta: number(consequence.actionDelta) });
      const detail = t('r002bReveal.item.circle.detail', {
        current: number(consequence.actionsAfter),
        goal: number(consequence.goal),
      });
      return {
        ...common,
        title: t('r002bReveal.item.circle.title'),
        value,
        detail,
        iconName: 'family',
        tone: 'water',
        accessibilityLabel: `${t('r002bReveal.item.circle.title')}. ${value}. ${detail}`,
      };
    }
    case 'private_league_leaf': {
      const value = t('r002bReveal.item.league.delta', { delta: number(consequence.leafDelta) });
      const detail = t('r002bReveal.item.league.detail', {
        current: number(consequence.confirmedLeavesAfter),
        goal: number(5),
      });
      const statusLabel = t('r002bReveal.item.league.private');
      return {
        ...common,
        title: t('r002bReveal.item.league.title'),
        value,
        detail,
        iconName: 'league',
        tone: 'amber',
        statusLabel,
        accessibilityLabel: accessibleLabel([
          t('r002bReveal.item.league.title'),
          value,
          detail,
          statusLabel,
        ]),
      };
    }
    case 'challenge_leaf': {
      const detail = t('r002bReveal.item.challenge.detail');
      const statusLabel = t('r002bReveal.item.challenge.private');
      return {
        ...common,
        title: t('r002bReveal.item.challenge.title'),
        detail,
        iconName: 'check-filled',
        tone: 'emerald',
        statusLabel,
        accessibilityLabel: accessibleLabel([
          t('r002bReveal.item.challenge.title'),
          detail,
          statusLabel,
        ]),
      };
    }
    case 'private_family_reward': {
      const detail = t('r002bReveal.item.familyReward.detail');
      const statusLabel = t('r002bReveal.item.familyReward.private');
      return {
        ...common,
        title: t('r002bReveal.item.familyReward.title'),
        detail,
        iconName: 'sparkle',
        tone: 'coral',
        statusLabel,
        accessibilityLabel: accessibleLabel([
          t('r002bReveal.item.familyReward.title'),
          detail,
          statusLabel,
        ]),
      };
    }
    case 'earned_badge': {
      const definition = getBadgeDefinition(consequence.badgeId);
      const badge = definition?.label[input.language] ?? t('r002bReveal.item.badge.fallback');
      const title = t('r002bReveal.item.badge.title', { badge });
      const detail = t('r002bReveal.item.badge.detail');
      const statusLabel = t('r002bReveal.item.badge.permanent');
      return {
        ...common,
        title,
        detail,
        iconName: 'sparkle',
        tone: 'amber',
        statusLabel,
        accessibilityLabel: accessibleLabel([title, detail, statusLabel]),
      };
    }
    case 'impact_path_station': {
      const threshold = number(consequence.threshold);
      const value = t('r002bReveal.item.station.value', { threshold });
      const detail = t(`r002bReveal.item.station.result.${consequence.result}`);
      const statusLabel = t('r002bReveal.item.station.status');
      return {
        ...common,
        title: t('r002bReveal.item.station.title'),
        value,
        detail,
        iconName: 'water-drop',
        tone: 'water',
        statusLabel,
        accessibilityLabel: accessibleLabel([
          t('r002bReveal.item.station.title'),
          value,
          detail,
          statusLabel,
        ]),
      };
    }
    case 'unlocked_learning': {
      const detail = t('r002bReveal.item.learning.detail');
      const statusLabel = t('r002bReveal.item.learning.status');
      return {
        ...common,
        title: t('r002bReveal.item.learning.title'),
        detail,
        iconName: 'science',
        tone: 'water',
        statusLabel,
        accessibilityLabel: accessibleLabel([
          t('r002bReveal.item.learning.title'),
          detail,
          statusLabel,
        ]),
      };
    }
    case 'safe_help': {
      const detail = t(`r002bReveal.item.safeHelp.${consequence.helpKind}`);
      const statusLabel = t('r002bReveal.item.safeHelp.status');
      return {
        ...common,
        title: t('r002bReveal.item.safeHelp.title'),
        detail,
        iconName: 'help',
        tone: 'emerald',
        statusLabel,
        accessibilityLabel: accessibleLabel([
          t('r002bReveal.item.safeHelp.title'),
          detail,
          statusLabel,
        ]),
      };
    }
  }
}

function validCanonicalItems(bundle: RevealBundle): boolean {
  const ids = new Set<string>();
  let previousOrder = -1;
  for (const item of bundle.items) {
    const order = KIND_ORDER[item.consequence.kind];
    if (
      ids.has(item.id) ||
      order < previousOrder ||
      item.status !== 'committed' ||
      item.profileId !== bundle.profileId ||
      item.profileEpochId !== bundle.profileEpochId ||
      item.triggerEventId !== bundle.triggerEventId ||
      item.triggerKind !== bundle.triggerKind
    ) {
      return false;
    }
    ids.add(item.id);
    previousOrder = order;
  }
  return bundle.items.length > 0;
}

function hasGrowthDestination(items: readonly CommittedRevealSourceReceipt[]): boolean {
  return items.some((item) =>
    ['plant_stage', 'earned_badge', 'impact_path_station', 'unlocked_learning'].includes(
      item.consequence.kind,
    ),
  );
}

export function createRevealBundlePresentation(
  input: RevealBundlePresentationInput,
): RevealBundlePresentationResult {
  if (input.bundle.profileId !== input.profileId) return { ok: false, reason: 'profile_mismatch' };
  if (input.bundle.profileEpochId !== input.profileEpochId) {
    return { ok: false, reason: 'epoch_mismatch' };
  }
  if (
    input.bundle.id !== `reveal:${input.profileId}:${input.bundle.triggerEventId}` ||
    input.bundle.audience !== 'child'
  ) {
    return { ok: false, reason: 'invalid_identity' };
  }
  if (input.bundle.lifecycle === 'acknowledged' || input.bundle.lifecycle === 'archived') {
    return { ok: false, reason: 'already_seen' };
  }
  if (!validCanonicalItems(input.bundle)) return { ok: false, reason: 'invalid_bundle' };

  const state = contentState(input);
  const t = input.translate;
  const items = Object.freeze(input.bundle.items.map((item) => presentationItem(item, input)));
  const primaryBusy = input.submitting === true;
  const recovering = state === 'error';
  const primaryHandler = recovering
    ? (input.onRecover ?? input.onAcknowledge)
    : input.onAcknowledge;
  const primary: RevealActionPresentation = Object.freeze({
    accessibilityLabel: t(
      recovering
        ? 'r002bReveal.action.recover.accessibility'
        : 'r002bReveal.action.continue.accessibility',
    ),
    busy: primaryBusy,
    busyLabel: t('r002bReveal.action.continue.busy'),
    disabled: primaryBusy,
    label: t(recovering ? 'r002bReveal.action.recover.label' : 'r002bReveal.action.continue.label'),
    onPress: () => {
      if (!primaryBusy) primaryHandler();
    },
    testID: 'r002b-child-reveal-acknowledge',
  });
  const secondary: RevealActionPresentation | undefined =
    input.onOpenGrowth && hasGrowthDestination(input.bundle.items)
      ? Object.freeze({
          accessibilityLabel: t('r002bReveal.action.growth.accessibility'),
          disabled: primaryBusy || recovering,
          label: t('r002bReveal.action.growth.label'),
          onPress: () => {
            if (!primaryBusy && !recovering) input.onOpenGrowth?.();
          },
          testID: 'r002b-child-reveal-growth-action',
        })
      : undefined;

  return {
    ok: true,
    data: {
      screen: {
        contentState: state,
        direction: input.direction,
        groupLabel: t('r002bReveal.groupLabel'),
        illustrationLabel: t('r002bReveal.illustrationLabel'),
        introduction: t(
          input.bundle.triggerKind === 'task_approval'
            ? 'r002bReveal.introduction.taskApproval'
            : 'r002bReveal.introduction.learningCompletion',
        ),
        items,
        language: input.language,
        privateNote: t('r002bReveal.privateNote'),
        reducedMotion: input.reducedMotion,
        statusLabel: t(statusKey(state)),
        symbolicNote: t('r002bReveal.symbolicNote'),
        title: t('r002bReveal.title'),
      },
      actions: {
        direction: input.direction,
        language: input.language,
        primary,
        reducedMotion: input.reducedMotion,
        ...(secondary ? { secondary } : {}),
      },
    },
  };
}

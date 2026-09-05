import { describe, expect, it, vi } from 'vitest';

import {
  R002B_SHARED_GROWTH_TRANSLATION_KEYS,
  createR002bParentSharedGardenPresentation,
  createR002bSharedGrowthChildPresentation,
  type SharedGrowthTranslate,
} from '@/features/shared-growth/r002bSharedGrowthViewModel';
import { resources } from '@/i18n/resources';
import type {
  CommunityParticipationPreference,
  SharedGrowthChildView,
  SharedGrowthParticipationAction,
  SharedGrowthParticipationStatus,
} from '@/models/sharedGrowth';

const EXPECTED_TRANSLATION_KEYS = [
  'r002bSharedGrowth.common.back',
  'r002bSharedGrowth.common.state.ready',
  'r002bSharedGrowth.common.state.loading',
  'r002bSharedGrowth.common.state.offline',
  'r002bSharedGrowth.common.state.unavailable',
  'r002bSharedGrowth.common.state.error',
  'r002bSharedGrowth.common.state.interrupted',
  'r002bSharedGrowth.common.state.recovered',
  'r002bSharedGrowth.common.state.artUnavailable',
  'r002bSharedGrowth.common.state.submitting',
  'r002bSharedGrowth.common.state.saved',
  'r002bSharedGrowth.common.state.duplicate',
  'r002bSharedGrowth.child.groupLabel',
  'r002bSharedGrowth.child.title',
  'r002bSharedGrowth.child.subtitle',
  'r002bSharedGrowth.child.sceneAccessibilityLabel',
  'r002bSharedGrowth.child.artUnavailableText',
  'r002bSharedGrowth.child.observationHeading',
  'r002bSharedGrowth.child.emptyObservationText',
  'r002bSharedGrowth.child.privacyHeading',
  'r002bSharedGrowth.child.privacyBody',
  'r002bSharedGrowth.child.syntheticLabel',
  'r002bSharedGrowth.child.viewOnlyHeading',
  'r002bSharedGrowth.child.viewOnlyBody',
  'r002bSharedGrowth.child.participationHeading',
  'r002bSharedGrowth.child.participation.continued',
  'r002bSharedGrowth.child.participation.paused',
  'r002bSharedGrowth.child.participation.ended',
  'r002bSharedGrowth.child.observationAccessibilityLabel',
  'r002bSharedGrowth.child.theme.coastalHabitatCare',
  'r002bSharedGrowth.child.theme.waterStewardship',
  'r002bSharedGrowth.child.theme.nativeCanopyCare',
  'r002bSharedGrowth.child.outlook.continuing',
  'r002bSharedGrowth.child.outlook.takingRoot',
  'r002bSharedGrowth.child.outlook.growingGently',
  'r002bSharedGrowth.parent.groupLabel',
  'r002bSharedGrowth.parent.title',
  'r002bSharedGrowth.parent.subtitle',
  'r002bSharedGrowth.parent.entryTitle',
  'r002bSharedGrowth.parent.entryBody',
  'r002bSharedGrowth.parent.entryStatus',
  'r002bSharedGrowth.parent.entryAction',
  'r002bSharedGrowth.parent.currentHeading',
  'r002bSharedGrowth.parent.status.continued',
  'r002bSharedGrowth.parent.status.paused',
  'r002bSharedGrowth.parent.status.ended',
  'r002bSharedGrowth.parent.statusDescription.continued',
  'r002bSharedGrowth.parent.statusDescription.paused',
  'r002bSharedGrowth.parent.statusDescription.ended',
  'r002bSharedGrowth.parent.privacyHeading',
  'r002bSharedGrowth.parent.privacyBody',
  'r002bSharedGrowth.parent.futureOnlyHeading',
  'r002bSharedGrowth.parent.futureOnlyBody',
  'r002bSharedGrowth.parent.noEffectHeading',
  'r002bSharedGrowth.parent.noEffectBody',
  'r002bSharedGrowth.parent.settingsHeading',
  'r002bSharedGrowth.parent.readOnlyHeading',
  'r002bSharedGrowth.parent.readOnlyBody',
  'r002bSharedGrowth.parent.freshConsentMessage',
  'r002bSharedGrowth.parent.existingConsentMessage',
  'r002bSharedGrowth.parent.pendingMessage',
  'r002bSharedGrowth.parent.action.continue.label',
  'r002bSharedGrowth.parent.action.continue.descriptionPaused',
  'r002bSharedGrowth.parent.action.continue.descriptionEnded',
  'r002bSharedGrowth.parent.action.continue.accessibilityLabel',
  'r002bSharedGrowth.parent.action.pause.label',
  'r002bSharedGrowth.parent.action.pause.description',
  'r002bSharedGrowth.parent.action.pause.accessibilityLabel',
  'r002bSharedGrowth.parent.action.end.label',
  'r002bSharedGrowth.parent.action.end.description',
  'r002bSharedGrowth.parent.action.end.accessibilityLabel',
  'r002bSharedGrowth.parent.confirmation.groupLabel',
  'r002bSharedGrowth.parent.confirmation.end.title',
  'r002bSharedGrowth.parent.confirmation.end.body',
  'r002bSharedGrowth.parent.confirmation.rejoin.title',
  'r002bSharedGrowth.parent.confirmation.rejoin.body',
  'r002bSharedGrowth.parent.confirmation.confirmLabel',
  'r002bSharedGrowth.parent.confirmation.cancelLabel',
] as const;

function lookup(source: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((value, segment) => {
    if (typeof value !== 'object' || value === null || !(segment in value)) return undefined;
    return (value as Record<string, unknown>)[segment];
  }, source);
}

function translate(language: 'ar' | 'en'): SharedGrowthTranslate {
  return (key, values = {}) => {
    const suffix = Object.entries(values)
      .map(([name, value]) => `${name}:${String(value)}`)
      .join('|');
    return `${language}:${key}${suffix ? `:${suffix}` : ''}`;
  };
}

function preference(status: SharedGrowthParticipationStatus): CommunityParticipationPreference {
  return {
    schemaVersion: 'r002b.shared-growth.v1',
    householdId: 'household_al_noor',
    participationEpochId: 'participation-epoch-private',
    status,
    activeConsentReceiptId: status === 'ended' ? null : 'private-consent-id',
    acceptingSignalsSince: status === 'continued' ? '2026-09-05T08:00:00.000Z' : null,
    consentReceipts: [],
    invalidatedConsentReceiptIds: status === 'ended' ? ['private-consent-id'] : [],
    actionHistory: [],
    revision: 7,
    origin: 'synthetic_local',
  };
}

function childProjection(
  participation: SharedGrowthParticipationStatus = 'continued',
): SharedGrowthChildView {
  return {
    availability: 'ready',
    scene: 'coastal_canopy',
    observations: [
      { theme: 'coastal_habitat_care', outlook: 'continuing' },
      { theme: 'water_stewardship', outlook: 'taking_root' },
      { theme: 'native_canopy_care', outlook: 'growing_gently' },
    ],
    origin: 'synthetic_local',
    privacy: 'anonymous_qualitative',
    viewing: 'available',
    participation,
    contributionPrompt: 'none',
  };
}

describe('R002b Shared Growth presentation adapters', () => {
  it('freezes the exact resource-key contract for integration', () => {
    expect(R002B_SHARED_GROWTH_TRANSLATION_KEYS).toEqual(EXPECTED_TRANSLATION_KEYS);
    expect(Object.isFrozen(R002B_SHARED_GROWTH_TRANSLATION_KEYS)).toBe(true);
  });

  it('resolves every Shared Growth resource key in Arabic and English', () => {
    for (const locale of ['ar', 'en'] as const) {
      for (const key of R002B_SHARED_GROWTH_TRANSLATION_KEYS) {
        const value = lookup(resources[locale].translation, key);
        expect(value, `${locale}:${key}`).toEqual(expect.any(String));
        expect(String(value).trim(), `${locale}:${key}`).not.toBe('');
      }
    }
  });

  it('maps only the Child qualitative allowlist and does not mutate its projection', () => {
    const projection = childProjection();
    const before = structuredClone(projection);
    const model = createR002bSharedGrowthChildPresentation({
      projection,
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      translate: translate('ar'),
    });
    const serialized = JSON.stringify(model);

    expect(model.observations.map((item) => item.tone)).toEqual(['coast', 'water', 'canopy']);
    expect(serialized).not.toMatch(
      /household_al_noor|child_salem|participation-epoch|private-consent|2026-09-05|\b(?:rank|percent|count|task|seed|badge|event|profile|name)\b/iu,
    );
    expect(model).not.toHaveProperty('participationActions');
    expect(model).not.toHaveProperty('contributionEnabled');
    expect(projection).toEqual(before);
  });

  it.each(['continued', 'paused', 'ended'] as const)(
    'keeps the Child projection viewable while participation is %s',
    (participation) => {
      const model = createR002bSharedGrowthChildPresentation({
        projection: childProjection(participation),
        language: 'en',
        direction: 'ltr',
        reducedMotion: false,
        translate: translate('en'),
      });

      expect(model.contentState).toBe('ready');
      expect(model.participationState).toBe(participation);
      expect(model.participationLabel).toContain(`participation.${participation}`);
      expect(model.observations).toHaveLength(3);
    },
  );

  it('represents only localized unavailable, offline, interrupted, recovered, error, and missing-art states', () => {
    const unavailable = createR002bSharedGrowthChildPresentation({
      projection: { ...childProjection(), availability: 'unavailable' },
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
    });
    const states = ['offline', 'interrupted', 'recovered', 'error', 'art_unavailable'] as const;

    expect(unavailable.contentState).toBe('unavailable');
    for (const contentState of states) {
      const model = createR002bSharedGrowthChildPresentation({
        projection: childProjection(),
        language: 'en',
        direction: 'ltr',
        reducedMotion: false,
        translate: translate('en'),
        contentState,
      });
      expect(model.contentState).toBe(contentState);
      expect(model.stateMessage).toBe(
        `en:r002bSharedGrowth.common.state.${
          contentState === 'art_unavailable' ? 'artUnavailable' : contentState
        }`,
      );
      expect(model.artUnavailable).toBe(contentState === 'art_unavailable');
    }
  });

  it.each([
    ['loading', 'loading'],
    ['offline', 'offline'],
    ['error', 'error'],
    ['interrupted', 'interrupted'],
    ['recovered', 'recovered'],
    ['art_unavailable', 'art_unavailable'],
    [undefined, 'unavailable'],
  ] as const)(
    'uses explicit content state %s before the unavailable projection fallback',
    (contentState, expected) => {
      const model = createR002bSharedGrowthChildPresentation({
        projection: { ...childProjection(), availability: 'unavailable' },
        language: 'en',
        direction: 'ltr',
        reducedMotion: false,
        translate: translate('en'),
        contentState,
      });

      expect(model.contentState).toBe(expected);
    },
  );

  it('ignores adversarial arbitrary state copy instead of leaking it to either surface', () => {
    const secret = 'child_salem private-consent-id task_recycling_p0_v1';
    const child = createR002bSharedGrowthChildPresentation({
      projection: childProjection(),
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      stateMessage: secret,
    } as Parameters<typeof createR002bSharedGrowthChildPresentation>[0] & {
      stateMessage: string;
    });
    const parent = createR002bParentSharedGardenPresentation({
      preference: preference('continued'),
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      contributionEnabled: true,
      stateMessage: secret,
    } as Parameters<typeof createR002bParentSharedGardenPresentation>[0] & {
      stateMessage: string;
    });

    expect(child.stateMessage).not.toContain(secret);
    expect(parent.stateMessage).not.toContain(secret);
    expect(JSON.stringify({ child, parent })).not.toContain(secret);
  });

  it('preserves locale, direction, reduced motion, and emits only a return callback', () => {
    const onBack = vi.fn();
    const model = createR002bSharedGrowthChildPresentation({
      projection: childProjection(),
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      translate: translate('ar'),
      onBack,
    });

    expect(model).toMatchObject({ language: 'ar', direction: 'rtl', reducedMotion: true });
    model.backAction?.onPress();
    expect(onBack).toHaveBeenCalledOnce();
  });

  it.each([
    ['continued', ['pause_new_contributions', 'end_participation']],
    ['paused', ['continue', 'end_participation']],
    ['ended', ['continue']],
  ] as const)('offers only the bounded action set for %s', (status, expectedActions) => {
    const model = createR002bParentSharedGardenPresentation({
      preference: preference(status),
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      contributionEnabled: true,
      onAction: () => undefined,
    });

    expect(model.participationActions.map((action) => action.action)).toEqual(expectedActions);
    expect(model.participationState).toBe(status);
    if (status === 'ended') expect(model.freshConsentMessage).toBeDefined();
    else expect(model.freshConsentMessage).toBeUndefined();
  });

  it.each(['offline', 'error', 'unavailable', 'interrupted'] as const)(
    'keeps the truthful %s content state while contribution is read-only',
    (contentState) => {
      const onAction = vi.fn();
      const model = createR002bParentSharedGardenPresentation({
        preference: preference('continued'),
        language: 'ar',
        direction: 'rtl',
        reducedMotion: true,
        translate: translate('ar'),
        contributionEnabled: false,
        contentState,
        pendingAction: 'pause_new_contributions',
        onAction,
      });

      expect(model.contentState).toBe(contentState);
      expect(model.contributionEnabled).toBe(false);
      expect(model.participationActions).toEqual([]);
      expect(model.readOnlyHeading).toBeTruthy();
      expect(model.readOnlyBody).toBeTruthy();
      expect(onAction).not.toHaveBeenCalled();
    },
  );

  it('defaults a contribution-disabled presentation to ready content plus read-only interaction', () => {
    const onAction = vi.fn();
    const model = createR002bParentSharedGardenPresentation({
      preference: preference('continued'),
      language: 'ar',
      direction: 'rtl',
      reducedMotion: true,
      translate: translate('ar'),
      contributionEnabled: false,
      pendingAction: 'pause_new_contributions',
      onAction,
    });

    expect(model.contentState).toBe('ready');
    expect(model.contributionEnabled).toBe(false);
    expect(model.participationActions).toEqual([]);
    expect(model.readOnlyHeading).toBeTruthy();
    expect(model.readOnlyBody).toBeTruthy();
    expect(onAction).not.toHaveBeenCalled();
  });

  it('emits a non-destructive typed action without timestamps, consent, authority, or mutation', () => {
    const onAction = vi.fn<(action: SharedGrowthParticipationAction) => void>();
    const source = preference('paused');
    const before = structuredClone(source);
    const model = createR002bParentSharedGardenPresentation({
      preference: source,
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      contributionEnabled: true,
      onAction,
    });

    model.participationActions[0]?.onPress();
    expect(onAction).toHaveBeenCalledExactlyOnceWith('continue');
    expect(source).toEqual(before);
    expect(JSON.stringify(model)).not.toMatch(
      /private-consent|participation-epoch|2026-09-05|reauthentication|authority/iu,
    );
  });

  it.each([
    ['continued', 'end_participation'],
    ['paused', 'end_participation'],
    ['ended', 'continue'],
  ] as const)('requires explicit confirmation before %s can emit from %s', (status, action) => {
    const onAction = vi.fn<(value: SharedGrowthParticipationAction) => void>();
    const onRequestConfirmation = vi.fn<(value: SharedGrowthParticipationAction) => void>();
    const onCancelConfirmation = vi.fn();
    const onRestoreConfirmationFocus = vi.fn<(testID: string) => void>();
    const initial = createR002bParentSharedGardenPresentation({
      preference: preference(status),
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      contributionEnabled: true,
      onAction,
      onRequestConfirmation,
    });
    const trigger = initial.participationActions.find((item) => item.action === action);

    trigger?.onPress();
    expect(onAction).not.toHaveBeenCalled();
    expect(onRequestConfirmation).toHaveBeenCalledExactlyOnceWith(action);

    const confirming = createR002bParentSharedGardenPresentation({
      preference: preference(status),
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      contributionEnabled: true,
      confirmationAction: action,
      onAction,
      onCancelConfirmation,
      onRequestConfirmation,
      onRestoreConfirmationFocus,
    });

    expect(confirming.confirmation).toMatchObject({
      action,
      focusReturnTargetTestID: `shared-parent-action-${action}`,
    });
    confirming.confirmation?.confirmAction.onPress();
    expect(onAction).toHaveBeenCalledExactlyOnceWith(action);
    confirming.confirmation?.cancelAction.onPress();
    expect(onCancelConfirmation).toHaveBeenCalledOnce();
    confirming.confirmation?.onRequestFocusRestore(`shared-parent-action-${action}`);
    expect(onRestoreConfirmationFocus).toHaveBeenCalledExactlyOnceWith(
      `shared-parent-action-${action}`,
    );
  });

  it('guards disabled action and confirmation closures against programmatic invocation', () => {
    const onAction = vi.fn<(value: SharedGrowthParticipationAction) => void>();
    const onRequestConfirmation = vi.fn<(value: SharedGrowthParticipationAction) => void>();
    const unavailable = createR002bParentSharedGardenPresentation({
      preference: preference('continued'),
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      contributionEnabled: true,
      contentState: 'offline',
      confirmationAction: 'end_participation',
      onAction,
      onRequestConfirmation,
    });

    for (const action of unavailable.participationActions) action.onPress();
    unavailable.confirmation?.confirmAction.onPress();
    expect(onAction).not.toHaveBeenCalled();
    expect(onRequestConfirmation).not.toHaveBeenCalled();
    expect(unavailable.confirmation).toBeUndefined();
  });

  it('marks only a valid pending action busy and disables the bounded action area', () => {
    const model = createR002bParentSharedGardenPresentation({
      preference: preference('continued'),
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      contributionEnabled: true,
      pendingAction: 'pause_new_contributions',
      onAction: () => undefined,
    });

    expect(model.contentState).toBe('submitting');
    expect(model.participationActions.find((action) => action.busy)?.action).toBe(
      'pause_new_contributions',
    );
    expect(model.participationActions.every((action) => action.disabled)).toBe(true);
    expect(model.pendingMessage).toContain('pendingMessage');
  });

  it('uses existing consent language after Pause and fresh consent language after End', () => {
    const paused = createR002bParentSharedGardenPresentation({
      preference: preference('paused'),
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      contributionEnabled: true,
    });
    const ended = createR002bParentSharedGardenPresentation({
      preference: preference('ended'),
      language: 'en',
      direction: 'ltr',
      reducedMotion: false,
      translate: translate('en'),
      contributionEnabled: true,
    });

    expect(paused.existingConsentMessage).toContain('existingConsentMessage');
    expect(paused.freshConsentMessage).toBeUndefined();
    expect(ended.freshConsentMessage).toContain('freshConsentMessage');
    expect(ended.existingConsentMessage).toBeUndefined();
  });
});

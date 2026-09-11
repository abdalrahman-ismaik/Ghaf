import type {
  ParentSharedGardenContentState,
  ParentSharedGardenScreenProps,
  ParentSharedGrowthActionPresentation,
  ParentSharedGrowthConfirmationPresentation,
  SharedGrowthChildContentState,
  SharedGrowthChildScreenProps,
  SharedGrowthObservationPresentation,
} from '@/components/r002b/SharedGrowthScreens';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';
import type {
  CommunityParticipationPreference,
  SharedGrowthChildView,
  SharedGrowthParticipationAction,
  SharedGrowthParticipationStatus,
  SharedGrowthSignalTheme,
  SharedGrowthObservationOutlook,
} from '@/models/sharedGrowth';

export type SharedGrowthTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export interface R002bSharedGrowthChildPresentationInput {
  readonly contentState?: SharedGrowthChildContentState;
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly onBack?: () => void;
  readonly projection: SharedGrowthChildView;
  readonly reducedMotion: boolean;
  readonly translate: SharedGrowthTranslate;
}

export interface R002bParentSharedGardenPresentationInput {
  readonly contentState?: ParentSharedGardenContentState;
  readonly confirmationAction?: SharedGrowthParticipationAction;
  readonly contributionEnabled: boolean;
  readonly direction: TextDirection;
  readonly language: LocaleCode;
  readonly onAction?: (action: SharedGrowthParticipationAction) => void;
  readonly onBack?: () => void;
  readonly onCancelConfirmation?: () => void;
  readonly onRequestConfirmation?: (action: SharedGrowthParticipationAction) => void;
  readonly onRecover?: () => void;
  readonly onRestoreConfirmationFocus?: (targetTestID: string) => void;
  readonly pendingAction?: SharedGrowthParticipationAction;
  readonly preference: CommunityParticipationPreference;
  readonly reducedMotion: boolean;
  readonly translate: SharedGrowthTranslate;
}

const COPY_KEYS = {
  common: {
    back: 'r002bSharedGrowth.common.back',
    state: {
      ready: 'r002bSharedGrowth.common.state.ready',
      loading: 'r002bSharedGrowth.common.state.loading',
      offline: 'r002bSharedGrowth.common.state.offline',
      unavailable: 'r002bSharedGrowth.common.state.unavailable',
      error: 'r002bSharedGrowth.common.state.error',
      interrupted: 'r002bSharedGrowth.common.state.interrupted',
      recovered: 'r002bSharedGrowth.common.state.recovered',
      artUnavailable: 'r002bSharedGrowth.common.state.artUnavailable',
      submitting: 'r002bSharedGrowth.common.state.submitting',
      saved: 'r002bSharedGrowth.common.state.saved',
      duplicate: 'r002bSharedGrowth.common.state.duplicate',
    },
  },
  child: {
    groupLabel: 'r002bSharedGrowth.child.groupLabel',
    title: 'r002bSharedGrowth.child.title',
    subtitle: 'r002bSharedGrowth.child.subtitle',
    sceneAccessibilityLabel: 'r002bSharedGrowth.child.sceneAccessibilityLabel',
    artUnavailableText: 'r002bSharedGrowth.child.artUnavailableText',
    observationHeading: 'r002bSharedGrowth.child.observationHeading',
    emptyObservationText: 'r002bSharedGrowth.child.emptyObservationText',
    privacyHeading: 'r002bSharedGrowth.child.privacyHeading',
    privacyBody: 'r002bSharedGrowth.child.privacyBody',
    syntheticLabel: 'r002bSharedGrowth.child.syntheticLabel',
    viewOnlyHeading: 'r002bSharedGrowth.child.viewOnlyHeading',
    viewOnlyBody: 'r002bSharedGrowth.child.viewOnlyBody',
    participationHeading: 'r002bSharedGrowth.child.participationHeading',
    participation: {
      continued: 'r002bSharedGrowth.child.participation.continued',
      paused: 'r002bSharedGrowth.child.participation.paused',
      ended: 'r002bSharedGrowth.child.participation.ended',
    },
    observationAccessibilityLabel: 'r002bSharedGrowth.child.observationAccessibilityLabel',
    theme: {
      coastalHabitatCare: 'r002bSharedGrowth.child.theme.coastalHabitatCare',
      waterStewardship: 'r002bSharedGrowth.child.theme.waterStewardship',
      nativeCanopyCare: 'r002bSharedGrowth.child.theme.nativeCanopyCare',
    },
    outlook: {
      continuing: 'r002bSharedGrowth.child.outlook.continuing',
      takingRoot: 'r002bSharedGrowth.child.outlook.takingRoot',
      growingGently: 'r002bSharedGrowth.child.outlook.growingGently',
    },
  },
  parent: {
    groupLabel: 'r002bSharedGrowth.parent.groupLabel',
    title: 'r002bSharedGrowth.parent.title',
    subtitle: 'r002bSharedGrowth.parent.subtitle',
    entryTitle: 'r002bSharedGrowth.parent.entryTitle',
    entryBody: 'r002bSharedGrowth.parent.entryBody',
    entryStatus: 'r002bSharedGrowth.parent.entryStatus',
    entryAction: 'r002bSharedGrowth.parent.entryAction',
    currentHeading: 'r002bSharedGrowth.parent.currentHeading',
    status: {
      continued: 'r002bSharedGrowth.parent.status.continued',
      paused: 'r002bSharedGrowth.parent.status.paused',
      ended: 'r002bSharedGrowth.parent.status.ended',
    },
    statusDescription: {
      continued: 'r002bSharedGrowth.parent.statusDescription.continued',
      paused: 'r002bSharedGrowth.parent.statusDescription.paused',
      ended: 'r002bSharedGrowth.parent.statusDescription.ended',
    },
    privacyHeading: 'r002bSharedGrowth.parent.privacyHeading',
    privacyBody: 'r002bSharedGrowth.parent.privacyBody',
    futureOnlyHeading: 'r002bSharedGrowth.parent.futureOnlyHeading',
    futureOnlyBody: 'r002bSharedGrowth.parent.futureOnlyBody',
    noEffectHeading: 'r002bSharedGrowth.parent.noEffectHeading',
    noEffectBody: 'r002bSharedGrowth.parent.noEffectBody',
    settingsHeading: 'r002bSharedGrowth.parent.settingsHeading',
    readOnlyHeading: 'r002bSharedGrowth.parent.readOnlyHeading',
    readOnlyBody: 'r002bSharedGrowth.parent.readOnlyBody',
    freshConsentMessage: 'r002bSharedGrowth.parent.freshConsentMessage',
    existingConsentMessage: 'r002bSharedGrowth.parent.existingConsentMessage',
    pendingMessage: 'r002bSharedGrowth.parent.pendingMessage',
    recovery: {
      accessibilityLabel: 'r002bSharedGrowth.parent.recovery.accessibilityLabel',
      failureMessage: 'r002bSharedGrowth.parent.recovery.failureMessage',
      label: 'r002bSharedGrowth.parent.recovery.label',
    },
    action: {
      continue: {
        label: 'r002bSharedGrowth.parent.action.continue.label',
        descriptionPaused: 'r002bSharedGrowth.parent.action.continue.descriptionPaused',
        descriptionEnded: 'r002bSharedGrowth.parent.action.continue.descriptionEnded',
        accessibilityLabel: 'r002bSharedGrowth.parent.action.continue.accessibilityLabel',
      },
      pause: {
        label: 'r002bSharedGrowth.parent.action.pause.label',
        description: 'r002bSharedGrowth.parent.action.pause.description',
        accessibilityLabel: 'r002bSharedGrowth.parent.action.pause.accessibilityLabel',
      },
      end: {
        label: 'r002bSharedGrowth.parent.action.end.label',
        description: 'r002bSharedGrowth.parent.action.end.description',
        accessibilityLabel: 'r002bSharedGrowth.parent.action.end.accessibilityLabel',
      },
    },
    confirmation: {
      groupLabel: 'r002bSharedGrowth.parent.confirmation.groupLabel',
      end: {
        title: 'r002bSharedGrowth.parent.confirmation.end.title',
        body: 'r002bSharedGrowth.parent.confirmation.end.body',
      },
      rejoin: {
        title: 'r002bSharedGrowth.parent.confirmation.rejoin.title',
        body: 'r002bSharedGrowth.parent.confirmation.rejoin.body',
      },
      confirmLabel: 'r002bSharedGrowth.parent.confirmation.confirmLabel',
      cancelLabel: 'r002bSharedGrowth.parent.confirmation.cancelLabel',
    },
  },
} as const;

export const R002B_SHARED_GROWTH_TRANSLATION_KEYS = Object.freeze([
  COPY_KEYS.common.back,
  ...Object.values(COPY_KEYS.common.state),
  COPY_KEYS.child.groupLabel,
  COPY_KEYS.child.title,
  COPY_KEYS.child.subtitle,
  COPY_KEYS.child.sceneAccessibilityLabel,
  COPY_KEYS.child.artUnavailableText,
  COPY_KEYS.child.observationHeading,
  COPY_KEYS.child.emptyObservationText,
  COPY_KEYS.child.privacyHeading,
  COPY_KEYS.child.privacyBody,
  COPY_KEYS.child.syntheticLabel,
  COPY_KEYS.child.viewOnlyHeading,
  COPY_KEYS.child.viewOnlyBody,
  COPY_KEYS.child.participationHeading,
  ...Object.values(COPY_KEYS.child.participation),
  COPY_KEYS.child.observationAccessibilityLabel,
  ...Object.values(COPY_KEYS.child.theme),
  ...Object.values(COPY_KEYS.child.outlook),
  COPY_KEYS.parent.groupLabel,
  COPY_KEYS.parent.title,
  COPY_KEYS.parent.subtitle,
  COPY_KEYS.parent.entryTitle,
  COPY_KEYS.parent.entryBody,
  COPY_KEYS.parent.entryStatus,
  COPY_KEYS.parent.entryAction,
  COPY_KEYS.parent.currentHeading,
  ...Object.values(COPY_KEYS.parent.status),
  ...Object.values(COPY_KEYS.parent.statusDescription),
  COPY_KEYS.parent.privacyHeading,
  COPY_KEYS.parent.privacyBody,
  COPY_KEYS.parent.futureOnlyHeading,
  COPY_KEYS.parent.futureOnlyBody,
  COPY_KEYS.parent.noEffectHeading,
  COPY_KEYS.parent.noEffectBody,
  COPY_KEYS.parent.settingsHeading,
  COPY_KEYS.parent.readOnlyHeading,
  COPY_KEYS.parent.readOnlyBody,
  COPY_KEYS.parent.freshConsentMessage,
  COPY_KEYS.parent.existingConsentMessage,
  COPY_KEYS.parent.pendingMessage,
  COPY_KEYS.parent.recovery.accessibilityLabel,
  COPY_KEYS.parent.recovery.failureMessage,
  COPY_KEYS.parent.recovery.label,
  COPY_KEYS.parent.action.continue.label,
  COPY_KEYS.parent.action.continue.descriptionPaused,
  COPY_KEYS.parent.action.continue.descriptionEnded,
  COPY_KEYS.parent.action.continue.accessibilityLabel,
  COPY_KEYS.parent.action.pause.label,
  COPY_KEYS.parent.action.pause.description,
  COPY_KEYS.parent.action.pause.accessibilityLabel,
  COPY_KEYS.parent.action.end.label,
  COPY_KEYS.parent.action.end.description,
  COPY_KEYS.parent.action.end.accessibilityLabel,
  COPY_KEYS.parent.confirmation.groupLabel,
  COPY_KEYS.parent.confirmation.end.title,
  COPY_KEYS.parent.confirmation.end.body,
  COPY_KEYS.parent.confirmation.rejoin.title,
  COPY_KEYS.parent.confirmation.rejoin.body,
  COPY_KEYS.parent.confirmation.confirmLabel,
  COPY_KEYS.parent.confirmation.cancelLabel,
] as const);

const CHILD_STATE_COPY: Readonly<Record<SharedGrowthChildContentState, string>> = {
  ready: COPY_KEYS.common.state.ready,
  loading: COPY_KEYS.common.state.loading,
  offline: COPY_KEYS.common.state.offline,
  unavailable: COPY_KEYS.common.state.unavailable,
  error: COPY_KEYS.common.state.error,
  interrupted: COPY_KEYS.common.state.interrupted,
  recovered: COPY_KEYS.common.state.recovered,
  art_unavailable: COPY_KEYS.common.state.artUnavailable,
};

const PARENT_STATE_COPY: Readonly<Record<ParentSharedGardenContentState, string>> = {
  ready: COPY_KEYS.common.state.ready,
  loading: COPY_KEYS.common.state.loading,
  offline: COPY_KEYS.common.state.offline,
  unavailable: COPY_KEYS.common.state.unavailable,
  error: COPY_KEYS.parent.recovery.failureMessage,
  interrupted: COPY_KEYS.common.state.interrupted,
  recovered: COPY_KEYS.common.state.recovered,
  submitting: COPY_KEYS.common.state.submitting,
  saved: COPY_KEYS.common.state.saved,
  duplicate: COPY_KEYS.common.state.duplicate,
};

const THEME_COPY: Readonly<Record<SharedGrowthSignalTheme, string>> = {
  coastal_habitat_care: COPY_KEYS.child.theme.coastalHabitatCare,
  water_stewardship: COPY_KEYS.child.theme.waterStewardship,
  native_canopy_care: COPY_KEYS.child.theme.nativeCanopyCare,
};

const THEME_TONE: Readonly<
  Record<SharedGrowthSignalTheme, SharedGrowthObservationPresentation['tone']>
> = {
  coastal_habitat_care: 'coast',
  water_stewardship: 'water',
  native_canopy_care: 'canopy',
};

const OUTLOOK_COPY: Readonly<Record<SharedGrowthObservationOutlook, string>> = {
  continuing: COPY_KEYS.child.outlook.continuing,
  taking_root: COPY_KEYS.child.outlook.takingRoot,
  growing_gently: COPY_KEYS.child.outlook.growingGently,
};

const ALLOWED_ACTIONS: Readonly<
  Record<SharedGrowthParticipationStatus, readonly SharedGrowthParticipationAction[]>
> = {
  continued: ['pause_new_contributions', 'end_participation'],
  paused: ['continue', 'end_participation'],
  ended: ['continue'],
};

function backAction(translate: SharedGrowthTranslate, onBack?: () => void) {
  if (!onBack) return undefined;
  const label = translate(COPY_KEYS.common.back);
  return Object.freeze({
    accessibilityLabel: label,
    label,
    onPress: onBack,
    testID: 'shared-back',
  });
}

function childContentState(input: R002bSharedGrowthChildPresentationInput) {
  if (input.contentState) return input.contentState;
  if (input.projection.availability === 'unavailable') return 'unavailable' as const;
  return 'ready' as const;
}

export function createR002bSharedGrowthChildPresentation(
  input: R002bSharedGrowthChildPresentationInput,
): SharedGrowthChildScreenProps {
  const { direction, language, onBack, projection, reducedMotion, translate } = input;
  const contentState = childContentState(input);
  const observations = Object.freeze(
    projection.observations.map((observation, index) => {
      const themeLabel = translate(THEME_COPY[observation.theme]);
      const outlookLabel = translate(OUTLOOK_COPY[observation.outlook]);
      return Object.freeze({
        accessibilityLabel: translate(COPY_KEYS.child.observationAccessibilityLabel, {
          theme: themeLabel,
          outlook: outlookLabel,
        }),
        id: `shared-observation-${index + 1}`,
        outlookLabel,
        themeLabel,
        tone: THEME_TONE[observation.theme],
      });
    }),
  );

  return Object.freeze({
    artUnavailable: contentState === 'art_unavailable',
    artUnavailableText: translate(COPY_KEYS.child.artUnavailableText),
    backAction: backAction(translate, onBack),
    contentState,
    direction,
    emptyObservationText: translate(COPY_KEYS.child.emptyObservationText),
    groupLabel: translate(COPY_KEYS.child.groupLabel),
    language,
    observationHeading: translate(COPY_KEYS.child.observationHeading),
    observations,
    participationHeading: translate(COPY_KEYS.child.participationHeading),
    participationLabel: translate(COPY_KEYS.child.participation[projection.participation]),
    participationState: projection.participation,
    privacyBody: translate(COPY_KEYS.child.privacyBody),
    privacyHeading: translate(COPY_KEYS.child.privacyHeading),
    reducedMotion,
    sceneAccessibilityLabel: translate(COPY_KEYS.child.sceneAccessibilityLabel),
    stateMessage: translate(CHILD_STATE_COPY[contentState]),
    statusLabel: translate(CHILD_STATE_COPY[contentState]),
    subtitle: translate(COPY_KEYS.child.subtitle),
    syntheticLabel: translate(COPY_KEYS.child.syntheticLabel),
    title: translate(COPY_KEYS.child.title),
    viewOnlyBody: translate(COPY_KEYS.child.viewOnlyBody),
    viewOnlyHeading: translate(COPY_KEYS.child.viewOnlyHeading),
  });
}

function actionCopy(
  action: SharedGrowthParticipationAction,
  status: SharedGrowthParticipationStatus,
  translate: SharedGrowthTranslate,
) {
  if (action === 'continue') {
    return {
      accessibilityLabel: translate(COPY_KEYS.parent.action.continue.accessibilityLabel),
      description: translate(
        status === 'ended'
          ? COPY_KEYS.parent.action.continue.descriptionEnded
          : COPY_KEYS.parent.action.continue.descriptionPaused,
      ),
      label: translate(COPY_KEYS.parent.action.continue.label),
      tone: 'primary' as const,
    };
  }
  if (action === 'pause_new_contributions') {
    return {
      accessibilityLabel: translate(COPY_KEYS.parent.action.pause.accessibilityLabel),
      description: translate(COPY_KEYS.parent.action.pause.description),
      label: translate(COPY_KEYS.parent.action.pause.label),
      tone: 'caution' as const,
    };
  }
  return {
    accessibilityLabel: translate(COPY_KEYS.parent.action.end.accessibilityLabel),
    description: translate(COPY_KEYS.parent.action.end.description),
    label: translate(COPY_KEYS.parent.action.end.label),
    tone: 'danger' as const,
  };
}

function parentContentState(
  input: R002bParentSharedGardenPresentationInput,
  pendingIsValid: boolean,
): ParentSharedGardenContentState {
  if (input.contentState) return input.contentState;
  return input.contributionEnabled && pendingIsValid ? 'submitting' : 'ready';
}

function actionsAreInteractive(contentState: ParentSharedGardenContentState) {
  return (
    contentState === 'ready' ||
    contentState === 'recovered' ||
    contentState === 'saved' ||
    contentState === 'duplicate'
  );
}

function requiresConfirmation(
  action: SharedGrowthParticipationAction,
  status: SharedGrowthParticipationStatus,
): action is Extract<SharedGrowthParticipationAction, 'continue' | 'end_participation'> {
  return action === 'end_participation' || (action === 'continue' && status === 'ended');
}

function createConfirmation(
  input: R002bParentSharedGardenPresentationInput,
  contentState: ParentSharedGardenContentState,
  interactive: boolean,
): ParentSharedGrowthConfirmationPresentation | undefined {
  const action = input.confirmationAction;
  if (
    !action ||
    !input.contributionEnabled ||
    !interactive ||
    !ALLOWED_ACTIONS[input.preference.status].includes(action) ||
    !requiresConfirmation(action, input.preference.status)
  ) {
    return undefined;
  }

  const actionTestID = `shared-parent-action-${action}`;
  const isEnd = action === 'end_participation';
  const confirmEnabled = Boolean(input.onAction);
  const cancelEnabled = Boolean(input.onCancelConfirmation);
  const confirmLabel = input.translate(COPY_KEYS.parent.confirmation.confirmLabel);
  const cancelLabel = input.translate(COPY_KEYS.parent.confirmation.cancelLabel);

  return Object.freeze({
    action,
    body: input.translate(
      isEnd ? COPY_KEYS.parent.confirmation.end.body : COPY_KEYS.parent.confirmation.rejoin.body,
    ),
    cancelAction: Object.freeze({
      accessibilityLabel: cancelLabel,
      disabled: !cancelEnabled,
      label: cancelLabel,
      onPress: () => {
        if (!cancelEnabled) return;
        input.onCancelConfirmation?.();
      },
      testID: 'shared-growth-confirmation-cancel',
    }),
    confirmAction: Object.freeze({
      accessibilityLabel: confirmLabel,
      disabled: !confirmEnabled,
      label: confirmLabel,
      onPress: () => {
        if (!confirmEnabled || !actionsAreInteractive(contentState)) return;
        input.onAction?.(action);
      },
      testID: 'shared-growth-confirmation-confirm',
    }),
    focusReturnTargetTestID: actionTestID,
    groupLabel: input.translate(COPY_KEYS.parent.confirmation.groupLabel),
    onRequestFocusRestore: () => input.onRestoreConfirmationFocus?.(actionTestID),
    title: input.translate(
      isEnd ? COPY_KEYS.parent.confirmation.end.title : COPY_KEYS.parent.confirmation.rejoin.title,
    ),
    tone: isEnd ? ('danger' as const) : ('primary' as const),
  });
}

export function createR002bParentSharedGardenPresentation(
  input: R002bParentSharedGardenPresentationInput,
): ParentSharedGardenScreenProps {
  const { direction, language, onAction, onBack, preference, reducedMotion, translate } = input;
  const allowedActions = ALLOWED_ACTIONS[preference.status];
  const pendingIsValid = input.pendingAction ? allowedActions.includes(input.pendingAction) : false;
  const contentState = parentContentState(input, pendingIsValid);
  const actionAreaBusy = pendingIsValid && contentState === 'submitting';
  const baseInteractive = actionsAreInteractive(contentState) && !actionAreaBusy;
  const confirmation = createConfirmation(input, contentState, baseInteractive);
  const confirmationOpen = Boolean(confirmation);
  const interactive = Boolean(onAction) && baseInteractive && !confirmationOpen;
  const participationActions: readonly ParentSharedGrowthActionPresentation[] =
    input.contributionEnabled
      ? Object.freeze(
          allowedActions.map((action) => {
            const copy = actionCopy(action, preference.status, translate);
            const confirmationRequired = requiresConfirmation(action, preference.status);
            const enabled = confirmationRequired
              ? baseInteractive && !confirmationOpen && Boolean(input.onRequestConfirmation)
              : interactive;
            return Object.freeze({
              ...copy,
              action,
              busy: actionAreaBusy && input.pendingAction === action,
              disabled: !enabled,
              onPress: () => {
                if (!enabled) return;
                if (confirmationRequired) {
                  input.onRequestConfirmation?.(action);
                  return;
                }
                onAction?.(action);
              },
              testID: `shared-parent-action-${action}`,
            });
          }),
        )
      : Object.freeze([]);
  const pendingActionLabel = participationActions.find(
    (action) => action.action === input.pendingAction,
  )?.label;
  const recoveryAction =
    contentState === 'error' && input.contributionEnabled && input.onRecover
      ? Object.freeze({
          accessibilityLabel: translate(COPY_KEYS.parent.recovery.accessibilityLabel),
          disabled: false,
          label: translate(COPY_KEYS.parent.recovery.label),
          onPress: () => {
            if (contentState !== 'error') return;
            input.onRecover?.();
          },
          testID: 'shared-parent-recover',
        })
      : undefined;
  return Object.freeze({
    backAction: backAction(translate, onBack),
    confirmation,
    contentState,
    contributionEnabled: input.contributionEnabled,
    currentHeading: translate(COPY_KEYS.parent.currentHeading),
    currentStatusDescription: translate(COPY_KEYS.parent.statusDescription[preference.status]),
    currentStatusLabel: translate(COPY_KEYS.parent.status[preference.status]),
    direction,
    existingConsentMessage:
      preference.status === 'paused'
        ? translate(COPY_KEYS.parent.existingConsentMessage)
        : undefined,
    freshConsentMessage:
      preference.status === 'ended' ? translate(COPY_KEYS.parent.freshConsentMessage) : undefined,
    futureOnlyBody: translate(COPY_KEYS.parent.futureOnlyBody),
    futureOnlyHeading: translate(COPY_KEYS.parent.futureOnlyHeading),
    groupLabel: translate(COPY_KEYS.parent.groupLabel),
    language,
    noEffectBody: translate(COPY_KEYS.parent.noEffectBody),
    noEffectHeading: translate(COPY_KEYS.parent.noEffectHeading),
    participationActions,
    participationState: preference.status,
    pendingMessage: pendingActionLabel
      ? translate(COPY_KEYS.parent.pendingMessage, { action: pendingActionLabel })
      : undefined,
    privacyBody: translate(COPY_KEYS.parent.privacyBody),
    privacyHeading: translate(COPY_KEYS.parent.privacyHeading),
    readOnlyBody: translate(COPY_KEYS.parent.readOnlyBody),
    readOnlyHeading: translate(COPY_KEYS.parent.readOnlyHeading),
    recoveryAction,
    reducedMotion,
    settingsHeading: translate(COPY_KEYS.parent.settingsHeading),
    stateMessage: translate(PARENT_STATE_COPY[contentState]),
    statusLabel: translate(PARENT_STATE_COPY[contentState]),
    subtitle: translate(COPY_KEYS.parent.subtitle),
    title: translate(COPY_KEYS.parent.title),
  });
}

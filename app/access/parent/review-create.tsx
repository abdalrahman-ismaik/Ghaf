import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessActionRegion,
  AccessHeader,
  AccessScreen,
  BotanicalAvatar,
  InfoRow,
  PrototypePill,
  ReviewRow,
  StatusBanner,
  SummaryCard,
} from '@/components/access';
import { PrimaryButton, Row, SecondaryButton, Text } from '@/components/primitives';
import { colors, isolateBidiText, logicalRowDirection, r001Radii, spacing } from '@/design/tokens';
import type { DomainErrorCode } from '@/models/familyGrowth';
import type { BasicAccessibilityDefault } from '@/models/parentOnboarding';
import { usePrototypeStore } from '@/state/usePrototypeStore';

function localizedCompletionError(code: DomainErrorCode, t: (key: string) => string) {
  const errorKeys: Readonly<Record<DomainErrorCode, string>> = {
    INVALID_INPUT: 'access.states.interrupted',
    NOT_FOUND: 'access.states.interrupted',
    INVALID_TRANSITION: 'access.states.interrupted',
    NOT_ASSIGNED_CHILD: 'access.states.interrupted',
    SAFETY_REJECTED: 'access.states.interrupted',
    PRIVACY_REJECTED: 'access.states.interrupted',
    INVALID_REWARD_PAIRING: 'access.states.interrupted',
    PREPARED_FIXTURE_UNAVAILABLE: 'access.states.localFallback',
    REMOTE_UNAVAILABLE: 'access.states.localFallback',
    TIMEOUT: 'access.states.localFallback',
    INVALID_RESPONSE: 'access.states.interrupted',
  };
  return t(errorKeys[code]);
}

export default function ReviewCreateScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const completeParentOnboarding = usePrototypeStore((state) => state.completeParentOnboarding);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const completionPending = useRef(false);
  const successOpen = pathname === '/access/parent/family-created-success';

  const draft = parentOnboarding.draft;
  const familyIsValid = draft.familyName.trim().length >= 2;
  const childIsValid = draft.child.nickname.trim().length >= 2;
  const canReview =
    (parentOnboarding.status === 'verified' ||
      parentOnboarding.status === 'authenticated_parent') &&
    familyIsValid &&
    childIsValid;

  const goBack = useCallback(() => {
    if (parentOnboarding.status !== 'verified') return;
    router.replace('/access/parent/add-first-child');
  }, [parentOnboarding.status, router]);

  useEffect(() => {
    if (parentOnboarding.status === 'signed_out') {
      router.replace('/access/parent/sign-in');
    } else if (parentOnboarding.status === 'code_sent' || parentOnboarding.status === 'verifying') {
      router.replace('/access/parent/verification');
    } else if (
      parentOnboarding.status === 'authenticated_parent' &&
      !successOpen &&
      !completionPending.current
    ) {
      router.replace('/parent');
    } else if (!familyIsValid) {
      router.replace('/access/parent/family-basics');
    } else if (!childIsValid) {
      router.replace('/access/parent/add-first-child');
    }
  }, [childIsValid, familyIsValid, parentOnboarding.status, router, successOpen]);

  useEffect(() => {
    if (Platform.OS !== 'android' || parentOnboarding.status !== 'verified') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack, parentOnboarding.status]);

  if (!canReview) return null;

  const ageLabel = {
    '6_8': t('access.setup.ageSixEight'),
    '9_11': t('access.setup.ageNineEleven'),
    '12_14': t('access.setup.ageTwelveFourteen'),
  }[draft.child.ageBand];
  const languageLabel = {
    ar: t('language.arabic'),
    en: t('language.english'),
    both: t('access.setup.bothLanguages'),
  }[draft.child.preferredLanguage];
  const accessibilityLabels: Readonly<Record<BasicAccessibilityDefault, string>> = {
    larger_text: t('access.setup.largerText'),
    simpler_instructions: t('access.setup.simplerInstructions'),
    high_contrast: t('access.setup.highContrast'),
    reduced_motion: t('access.setup.reducedMotion'),
  };

  const createFamily = () => {
    if (completionPending.current || busy) return;

    completionPending.current = true;
    setError(null);
    setBusy(true);

    try {
      const result = completeParentOnboarding();
      if (!result.ok) {
        completionPending.current = false;
        setBusy(false);
        setError(localizedCompletionError(result.error.code, t));
        return;
      }
      requestAnimationFrame(() => {
        router.push('/access/parent/family-created-success');
        completionPending.current = false;
        setBusy(false);
      });
    } catch {
      completionPending.current = false;
      setBusy(false);
      setError(t('access.states.interrupted'));
    }
  };

  return (
    <AccessScreen
      accessibilityHidden={successOpen}
      background="dotted"
      header={
        <AccessHeader
          backLabel={t('common.back')}
          brand={t('common.brand')}
          direction={direction}
          language={locale}
          onBack={parentOnboarding.status === 'verified' ? goBack : undefined}
          progressLabel={t('access.setup.progress', { step: 3, total: 3 })}
        />
      }
      testID="review-create-screen"
    >
      <View style={styles.heading}>
        <Text brand direction={direction} language={locale} variant="hero">
          {t('access.review.title')}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} language={locale} variant="body">
          {t('access.review.body')}
        </Text>
      </View>

      {parentOnboarding.offlineFallbackUsed ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={t('access.states.localFallback')}
          title={t('access.states.offline')}
          tone="offline"
        />
      ) : null}
      {error ? (
        <StatusBanner
          actionLabel={t('access.states.retry')}
          direction={direction}
          language={locale}
          message={error}
          onAction={createFamily}
          tone="error"
        />
      ) : null}

      <SummaryCard
        accessibilityLabel={`${t('access.review.family')}: ${draft.familyName}. ${t('access.review.childDetails')}: ${draft.child.nickname}`}
        testID="family-review-summary"
      >
        <ReviewRow
          direction={direction}
          icon="ghaf-tree"
          label={t('access.review.family')}
          language={locale}
          value={draft.familyName}
        />
        <View style={styles.divider} />
        <Text
          brand
          color="onSurfaceVariant"
          direction={direction}
          language={locale}
          variant="caption"
        >
          {t('access.review.childDetails')}
        </Text>
        <Row direction={direction} gap={spacing.md}>
          <BotanicalAvatar
            direction={direction}
            id={draft.child.avatarId}
            size={64}
            style={styles.reviewAvatar}
          />
          <View style={styles.childCopy}>
            <Text brand direction="auto" language={locale} variant="screenTitle">
              {draft.child.nickname}
            </Text>
            <Text
              brand
              color="onSurfaceVariant"
              direction={direction}
              language={locale}
              tabular
              variant="label"
            >
              {t('access.review.ageLanguage', {
                age: isolateBidiText(ageLabel, 'ltr'),
                language: isolateBidiText(languageLabel, direction),
              })}
            </Text>
          </View>
        </Row>
        <View style={[styles.tagRow, { flexDirection: logicalRowDirection(direction) }]}>
          {(draft.child.accessibilityDefaults.length > 0
            ? draft.child.accessibilityDefaults
            : [null]
          ).map((item) => (
            <PrototypePill
              direction={direction}
              icon="info"
              key={item ?? 'none'}
              language={locale}
              message={item ? accessibilityLabels[item] : t('access.setup.notNow')}
            />
          ))}
        </View>
      </SummaryCard>

      <View style={styles.privacyList}>
        <InfoRow
          direction={direction}
          icon="shield"
          language={locale}
          message={t('access.review.parentControls')}
        />
        <InfoRow
          direction={direction}
          icon="media-off"
          language={locale}
          message={t('access.review.mediaUnavailable')}
        />
        <InfoRow
          direction={direction}
          icon="league"
          language={locale}
          message={t('access.review.privateLeague')}
        />
        <InfoRow
          direction={direction}
          icon="person-add"
          language={locale}
          message={t('access.review.addChildrenLater')}
        />
      </View>

      <AccessActionRegion
        direction={direction}
        language={locale}
        supportingText={t('access.setup.origin')}
      >
        <PrimaryButton
          brand
          busy={busy}
          busyLabel={t('access.review.creating')}
          direction={direction}
          disabled={busy || successOpen}
          language={locale}
          onPress={createFamily}
          size="regular"
          testID="create-family-button"
        >
          {t('access.review.create')}
        </PrimaryButton>
        <SecondaryButton
          brand
          direction={direction}
          disabled={busy || parentOnboarding.status === 'authenticated_parent'}
          language={locale}
          onPress={() => router.replace('/access/parent/add-first-child')}
          size="regular"
          testID="edit-family-button"
        >
          {t('access.review.edit')}
        </SecondaryButton>
      </AccessActionRegion>
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceContainerHigh,
  },
  childCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  reviewAvatar: {
    borderRadius: r001Radii.lg,
    borderWidth: 0,
    backgroundColor: colors.surfaceContainerLow,
  },
  tagRow: {
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  privacyList: {
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
});

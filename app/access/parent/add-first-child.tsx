import { useCallback, useEffect, useState } from 'react';
import { Redirect, type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessActionRegion,
  AccessHeader,
  AccessScreen,
  ChildProfileForm,
  InfoRow,
  StatusBanner,
} from '@/components/access';
import { PrimaryButton, Text } from '@/components/primitives';
import { spacing } from '@/design/tokens';
import { isChildProfileComplete } from '@/features/access/parentOnboarding';
import type { ParentOnboardingChildDraft } from '@/models/parentOnboarding';
import { usePrototypeStore } from '@/state/usePrototypeStore';

function childIndexFrom(value: string | string[] | undefined): 0 | 1 {
  return (Array.isArray(value) ? value[0] : value) === '1' ? 1 : 0;
}

export default function AddFirstChildScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ child?: string | string[] }>();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const parentOnboarding = usePrototypeStore((state) => state.parentOnboarding);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const pendingFamilyCreation = usePrototypeStore((state) => state.pendingFamilyCreation);
  const cancelParentVerification = usePrototypeStore((state) => state.cancelParentVerification);
  const updateParentOnboardingDraft = usePrototypeStore(
    (state) => state.updateParentOnboardingDraft,
  );
  const childIndex = childIndexFrom(params.child);
  const child = parentOnboarding.draft.children[childIndex];
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const updateChild = useCallback(
    (patch: Partial<ParentOnboardingChildDraft>) => {
      setError(null);
      const result = updateParentOnboardingDraft({ childIndex, child: patch });
      if (!result.ok) setError(t('access.states.interrupted'));
      return result.ok;
    },
    [childIndex, t, updateParentOnboardingDraft],
  );

  const goBack = useCallback(() => {
    if (childIndex === 0) {
      if (pendingFamilyCreation === 'profile_repair') {
        const cancelled = cancelParentVerification();
        if (!cancelled.ok) {
          setError(t('access.states.interrupted'));
          return;
        }
        router.replace('/access/parent/sign-in');
        return;
      }
      router.replace('/access/parent/family-basics');
      return;
    }
    router.replace('/access/parent/add-first-child?child=0' as Href);
  }, [cancelParentVerification, childIndex, pendingFamilyCreation, router, t]);

  const familyIsValid = parentOnboarding.draft.familyName.trim().length >= 2;
  const indexIsConfigured = childIndex < parentOnboarding.draft.childCount;

  useEffect(() => {
    if (parentOnboarding.status === 'signed_out') {
      router.replace('/access/parent/sign-in');
    } else if (parentOnboarding.status === 'code_sent' || parentOnboarding.status === 'verifying') {
      router.replace('/access/parent/verification');
    } else if (parentOnboarding.status === 'authenticated_parent') {
      router.replace('/parent');
    } else if (parentOnboarding.status === 'verified' && !familyIsValid) {
      router.replace('/access/parent/family-basics');
    } else if (parentOnboarding.status === 'verified' && !indexIsConfigured) {
      router.replace('/access/parent/review-create');
    }
  }, [familyIsValid, indexIsConfigured, parentOnboarding.status, router]);

  useEffect(() => {
    if (Platform.OS !== 'android' || parentOnboarding.status !== 'verified') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack, parentOnboarding.status]);

  if (parentOnboarding.status === 'verified' && parentOnboarding.completionReceipt) {
    return <Redirect href="/access/parent/verification" />;
  }
  if (parentOnboarding.status !== 'verified' || !familyIsValid || !indexIsConfigured || !child) {
    return null;
  }

  const validateProfile = () => {
    const valid = isChildProfileComplete(child);
    const message =
      child.nickname.trim().length < 2
        ? t('access.setup.childNameError')
        : child.sex === null
          ? t('access.setup.sexRequiredError')
          : t('access.setup.customAnswerRequired');
    setError(valid ? null : message);
    return valid;
  };

  const continueSetup = () => {
    if (busy || !validateProfile()) return;
    setBusy(true);
    if (!updateChild({ nickname: child.nickname.trim() })) {
      setBusy(false);
      return;
    }
    if (childIndex + 1 < parentOnboarding.draft.childCount) {
      requestAnimationFrame(() => {
        router.replace('/access/parent/add-first-child?child=1' as Href);
        setBusy(false);
      });
      return;
    }
    requestAnimationFrame(() => router.replace('/access/parent/review-create'));
  };

  // The shared form keeps fields editable={!busy} and radio state aria-checked={selected}.
  return (
    <AccessScreen
      background="organic"
      footer={
        <AccessActionRegion
          direction={direction}
          language={locale}
          supportingText={t('access.setup.origin')}
        >
          <InfoRow
            direction={direction}
            icon="shield"
            language={locale}
            message={t('access.setup.noChildContact')}
            tone="primary"
          />
          <PrimaryButton
            brand
            busy={busy}
            busyLabel={t('access.setup.continue')}
            direction={direction}
            disabled={!isChildProfileComplete(child)}
            language={locale}
            onPress={continueSetup}
            size="regular"
            testID="add-child-continue"
          >
            {childIndex + 1 < parentOnboarding.draft.childCount
              ? t('access.setup.nextChild')
              : t('access.setup.reviewFamily')}
          </PrimaryButton>
        </AccessActionRegion>
      }
      header={
        <AccessHeader
          backLabel={t('common.back')}
          brand={t('common.brand')}
          direction={direction}
          language={locale}
          onBack={goBack}
          progressLabel={t('access.setup.progress', {
            step: childIndex + 2,
            total: parentOnboarding.draft.childCount + 2,
          })}
        />
      }
      keyboardAware
      testID="add-first-child-screen"
    >
      <View style={styles.heading}>
        <Text brand color="ghafEmerald" direction={direction} language={locale} variant="hero">
          {t('access.setup.childStepTitle', {
            current: childIndex + 1,
            total: parentOnboarding.draft.childCount,
          })}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} language={locale} variant="body">
          {t('access.setup.childStepBody')}
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
      {pendingFamilyCreation === 'profile_repair' ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={t('access.setup.profileRepairBody')}
          title={t('access.setup.profileRepairTitle')}
          tone="origin"
        />
      ) : null}
      {localFamily.status === 'unavailable' && pendingFamilyCreation !== 'profile_repair' ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={t('access.states.localDataUnavailable')}
          tone="error"
        />
      ) : null}
      {error && child.nickname.trim().length >= 2 ? (
        <StatusBanner direction={direction} language={locale} message={error} tone="error" />
      ) : null}
      <ChildProfileForm
        child={child}
        direction={direction}
        disabled={busy}
        errorText={child.nickname.trim().length < 2 ? (error ?? undefined) : undefined}
        language={locale}
        onLimitReached={() => setError(t('access.setup.chooseUpToThree'))}
        onPatch={updateChild}
        onValidateName={validateProfile}
      />
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
});

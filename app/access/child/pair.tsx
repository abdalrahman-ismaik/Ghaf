import { Redirect, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessHeader, AccessScreen, BotanicalAvatar } from '@/components/access';
import { PrimaryButton, SecondaryButton, Text } from '@/components/primitives';
import { R003Hero, R003Section, R003Status } from '@/components/r003';
import { colors, layout, logicalRowDirection, r001Radii, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function PairChildDeviceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const childAccess = usePrototypeStore((state) => state.childAccess);
  const children = usePrototypeStore((state) => state.children);
  const requestPairing = usePrototypeStore((state) => state.requestChildPairing);
  const enterParentExperience = usePrototypeStore((state) => state.enterParentExperience);
  const completePairing = usePrototypeStore((state) => state.completeChildPairing);
  const [error, setError] = useState<string | null>(null);

  if (activeExperience === 'parent') {
    return <Redirect href={'/parent/settings/devices' as Href} />;
  }
  if (!childAccess.selectedChildId) return <Redirect href={'/access/child' as Href} />;
  const child = children[childAccess.selectedChildId];
  const name = localize(child.displayName, locale);

  const run = (action: () => ReturnType<typeof requestPairing>) => {
    setError(null);
    const result = action();
    if (!result.ok) setError(t('r003.access.parentRequired'));
  };

  const authenticated = childAccess.status === 'authenticated_child';
  const pending = childAccess.status === 'pairing_pending';
  const approved = childAccess.status === 'pairing_approved';
  const expired = childAccess.status === 'pairing_expired';

  const openParentApproval = () => {
    const result = enterParentExperience();
    router.replace((result.ok ? '/parent/settings/devices' : '/access/parent/sign-in') as Href);
  };

  return (
    <AccessScreen
      background="organic"
      contentMaxWidth={layout.readableContentWidth}
      header={
        <AccessHeader
          backLabel={t('common.back')}
          brand={t('common.brand')}
          direction={direction}
          language={locale}
          onBack={() => router.replace('/access/child/pin' as Href)}
        />
      }
      testID="child-pair-device-screen"
    >
      <R003Hero
        body={t('r003.access.pairBody')}
        direction={direction}
        icon="shield"
        language={locale}
        title={t('r003.access.pairTitle')}
      />
      <R003Section testID="pairing-state-panel">
        <View style={[styles.identity, { flexDirection: logicalRowDirection(direction) }]}>
          <BotanicalAvatar
            direction={direction}
            id={child.id === 'child_salem' ? 'ghaf_tree' : 'flower'}
            size={56}
          />
          <View style={styles.grow}>
            <Text brand color="deepForest" direction={direction} variant="screenTitle">
              {name}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {t('r003.devices.deviceName')}
            </Text>
          </View>
        </View>

        {childAccess.status === 'credential_verified' ? (
          <PrimaryButton
            brand
            direction={direction}
            language={locale}
            onPress={() => run(requestPairing)}
            testID="request-child-pairing"
          >
            {t('r003.access.pairRequest')}
          </PrimaryButton>
        ) : null}
        {pending ? (
          <>
            <R003Status
              direction={direction}
              icon="person"
              language={locale}
              message={`${t('r003.access.pendingTitle')}. ${t('r003.access.pendingBody')}`}
              tone="warning"
            />
            <PrimaryButton
              brand
              direction={direction}
              language={locale}
              onPress={openParentApproval}
              testID="open-parent-pairing-approval"
            >
              {t('r003.access.openParentApproval')}
            </PrimaryButton>
          </>
        ) : null}
        {approved ? (
          <>
            <R003Status
              direction={direction}
              icon="check-filled"
              language={locale}
              message={`${t('r003.access.approvedTitle')}. ${t('r003.access.approvedBody')}`}
              tone="success"
            />
            <PrimaryButton
              brand
              direction={direction}
              language={locale}
              onPress={() => run(completePairing)}
              testID="complete-child-pairing"
            >
              {t('r003.access.finishPairing')}
            </PrimaryButton>
          </>
        ) : null}
        {expired ? (
          <>
            <R003Status
              direction={direction}
              icon="info"
              language={locale}
              message={`${t('r003.access.expiredTitle')}. ${t('r003.access.expiredBody')}`}
              tone="warning"
            />
            <PrimaryButton
              brand
              direction={direction}
              language={locale}
              onPress={() => run(requestPairing)}
              testID="restart-child-pairing"
            >
              {t('r003.access.retryPairing')}
            </PrimaryButton>
          </>
        ) : null}
        {authenticated ? (
          <>
            <R003Status
              direction={direction}
              icon="check-filled"
              language={locale}
              message={`${t('r003.access.successTitle')}. ${t('r003.access.successBody', { name })}`}
              tone="success"
            />
            <PrimaryButton
              brand
              direction={direction}
              language={locale}
              onPress={() => router.replace('/child')}
              testID="open-child-today-after-pairing"
            >
              {t('r003.access.openToday')}
            </PrimaryButton>
          </>
        ) : null}
        {error ? (
          <R003Status direction={direction} language={locale} message={error} tone="warning" />
        ) : null}
      </R003Section>
      <View style={styles.disclosure}>
        <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
          {t('r003.access.synthetic')}
        </Text>
      </View>
      {error ? (
        <SecondaryButton
          brand
          direction={direction}
          language={locale}
          onPress={() => router.replace('/access/parent/sign-in')}
        >
          {t('access.welcome.parentAction')}
        </SecondaryButton>
      ) : null}
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  identity: {
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.primaryFixedTint,
    padding: spacing.md,
  },
  grow: { minWidth: 0, flex: 1, gap: spacing.xxs },
  disclosure: { alignItems: 'center', paddingHorizontal: spacing.md },
});

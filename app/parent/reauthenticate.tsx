import { useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Input, PrimaryButton } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003Hero, R003Status } from '@/components/r003';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

type PermissionKind = 'voice' | 'media' | 'ai';

export default function ParentReauthenticationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    profileId?: string;
    kind?: string;
    granted?: string;
    returnTo?: string;
  }>();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const updateGrant = usePrototypeStore((state) => state.updateChildPermissionGrant);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const profileId: SyntheticChildId | null =
    params.profileId === 'child_salem' || params.profileId === 'child_alya'
      ? params.profileId
      : null;
  const kind: PermissionKind | null =
    params.kind === 'voice' || params.kind === 'media' || params.kind === 'ai' ? params.kind : null;
  const granted = params.granted === 'true' ? true : params.granted === 'false' ? false : null;
  const returnTo =
    params.returnTo === '/parent/settings/permissions'
      ? ('/parent/settings/permissions' as Href)
      : null;

  if (!profileId || !kind || granted === null || !returnTo) {
    return <Redirect href={'/parent/settings' as Href} />;
  }

  const submit = () => {
    setError(null);
    const result = updateGrant({
      childId: profileId,
      kind,
      granted,
      reauthenticationCode: code,
    });
    if (!result.ok) {
      setError(
        result.error.code === 'INVALID_INPUT' ? t('r003.reauth.invalid') : t('errors.safeRetry'),
      );
      return;
    }
    router.replace(returnTo);
  };

  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('common.back')}
          direction={direction}
          onBack={() => router.replace(returnTo)}
          title={t('r003.reauth.title')}
        />
      }
      keyboardAware
      testID="parent-reauthentication-screen"
    >
      <R003Hero
        body={t('r003.reauth.body')}
        direction={direction}
        icon="lock"
        language={locale}
        title={t('r003.reauth.title')}
      />
      <Input
        accessibilityLabel={t('r003.reauth.title')}
        autoComplete="off"
        brand
        direction={direction}
        errorText={error ?? undefined}
        keyboardType="number-pad"
        language={locale}
        maxLength={4}
        onChangeText={setCode}
        secureTextEntry
        helperText={error ? undefined : t('r003.reauth.hint')}
        testID="parent-reauthentication-code"
        value={code}
      />
      <PrimaryButton
        brand
        direction={direction}
        disabled={code.length !== 4}
        language={locale}
        onPress={submit}
        testID="confirm-parent-reauthentication"
      >
        {t('r003.reauth.action')}
      </PrimaryButton>
      <R003Status
        direction={direction}
        icon="shield"
        language={locale}
        message={t('r003.reauth.origin')}
      />
    </R002aScreen>
  );
}

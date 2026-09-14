import { useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CloudFamilyBoundary } from '@/components/cloud-family/CloudFamilyBoundary';
import { Button, Text } from '@/components/primitives';
import type { PilotController, PilotState } from '@/features/pilot/controller';
import type { ParentAccountService } from '@/models/parentAccount';

import { AccountWorkspaceBoundary } from './AccountWorkspaceBoundary';
import { PilotAccountView } from './PilotAccountView';

export function RealFamilySession({
  controller,
  state,
  service,
  userId,
}: {
  controller: PilotController;
  state: PilotState;
  service: ParentAccountService;
  userId: string;
}) {
  const { t } = useTranslation();
  const [panel, setPanel] = useState<'family' | 'account' | 'legacy'>('family');
  const child = state.account?.role === 'child';
  useEffect(() => {
    if (Platform.OS !== 'android' || panel === 'family') return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      setPanel('family');
      return true;
    });
    return () => back.remove();
  }, [panel]);

  if (child || panel === 'family')
    return (
      <CloudFamilyBoundary
        service={service}
        userId={userId}
        onSignOut={() => void controller.signOut()}
        onOpenAccount={child ? undefined : () => setPanel('account')}
        onOpenLegacy={child ? undefined : () => setPanel('legacy')}
      />
    );

  return (
    <PilotAccountView controller={controller} state={state}>
      <Button
        brand
        variant="secondary"
        onPress={() => setPanel('family')}
        testID="cloud-return-family"
      >
        {t('cloudAccess.returnFamily')}
      </Button>
      {panel === 'legacy' ? (
        <>
          <Text brand variant="label">
            {t('cloudAccess.legacyTitle')}
          </Text>
          <Text brand color="onSurfaceVariant">
            {t('cloudAccess.legacyBody')}
          </Text>
          <AccountWorkspaceBoundary service={service} userId={userId} />
        </>
      ) : null}
    </PilotAccountView>
  );
}

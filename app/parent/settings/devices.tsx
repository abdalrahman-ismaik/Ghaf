import { useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { R003ActionRow, R003Hero, R003Section, R003Status } from '@/components/r003';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export default function ParentDevicesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const childAccess = usePrototypeStore((state) => state.childAccess);
  const children = usePrototypeStore((state) => state.children);
  const approve = usePrototypeStore((state) => state.approveChildPairing);
  const handoff = usePrototypeStore((state) => state.handoffApprovedChildPairing);
  const revoke = usePrototypeStore((state) => state.revokeChildDevice);
  const signOutExperience = usePrototypeStore((state) => state.signOutExperience);
  const [notice, setNotice] = useState<{
    readonly message: string;
    readonly tone: 'success' | 'warning';
  } | null>(null);

  const revokeDevice = (childId: 'child_salem' | 'child_alya') => {
    const result = revoke(childId);
    setNotice({
      message: result.ok ? t('r003.devices.revokedNotice') : t('errors.safeRetry'),
      tone: result.ok ? 'success' : 'warning',
    });
  };

  const approvePendingPairing = () => {
    const result = approve();
    setNotice({
      message: result.ok ? t('r003.devices.approvedNotice') : t('errors.safeRetry'),
      tone: result.ok ? 'success' : 'warning',
    });
  };

  const returnToPairing = () => {
    const result = handoff();
    if (!result.ok) {
      setNotice({ message: t('errors.safeRetry'), tone: 'warning' });
      return;
    }
    router.replace('/access/child/pair' as Href);
  };

  const returnToExpiredPairing = () => {
    const result = signOutExperience();
    if (!result.ok) {
      setNotice({ message: t('errors.safeRetry'), tone: 'warning' });
      return;
    }
    router.replace('/access/child/pair' as Href);
  };

  const pendingChildId = childAccess.pairingRequest?.childId;
  const pendingChild = pendingChildId ? children[pendingChildId] : null;

  return (
    <R002aScreen
      header={
        <R002aFlowHeader
          backLabel={t('common.back')}
          direction={direction}
          onBack={() => router.replace('/parent/settings' as Href)}
          title={t('r003.devices.title')}
        />
      }
      testID="parent-devices-screen"
    >
      <R003Hero
        body={t('r003.devices.body')}
        direction={direction}
        icon="dialpad"
        language={locale}
        title={t('r003.devices.title')}
      />
      {pendingChild && childAccess.status === 'pairing_pending' ? (
        <R003Section title={t('r003.devices.pendingTitle')} testID="pending-pairing-request">
          <R003ActionRow
            body={t('r003.devices.pendingFor', {
              name: localize(pendingChild.displayName, locale),
            })}
            direction={direction}
            icon="person"
            language={locale}
            meta={t('r003.access.pendingTitle')}
            onPress={approvePendingPairing}
            testID="approve-pending-child-pairing"
            title={t('r003.devices.approvePairing')}
          />
        </R003Section>
      ) : null}
      {pendingChild && childAccess.status === 'pairing_approved' ? (
        <R003Section title={t('r003.access.approvedTitle')} testID="approved-pairing-handoff">
          <R003Status
            direction={direction}
            icon="check-filled"
            language={locale}
            message={t('r003.devices.approvedFor', {
              name: localize(pendingChild.displayName, locale),
            })}
            tone="success"
          />
          <R003ActionRow
            direction={direction}
            icon="child"
            language={locale}
            onPress={returnToPairing}
            testID="return-to-child-pairing"
            title={t('r003.devices.returnToPairing')}
          />
        </R003Section>
      ) : null}
      {pendingChild && childAccess.status === 'pairing_expired' ? (
        <R003Section title={t('r003.access.expiredTitle')} testID="expired-pairing-request">
          <R003Status
            direction={direction}
            language={locale}
            message={t('r003.access.expiredBody')}
            tone="warning"
          />
          <R003ActionRow
            direction={direction}
            icon="child"
            language={locale}
            onPress={returnToExpiredPairing}
            testID="return-to-expired-child-pairing"
            title={t('r003.access.retryPairing')}
          />
        </R003Section>
      ) : null}
      <R003Section>
        {childAccess.pairedDevices.length > 0 ? (
          childAccess.pairedDevices.map((device) => {
            const name = localize(children[device.childId].displayName, locale);
            return (
              <R003ActionRow
                body={t('r003.devices.pairedFor', { name })}
                direction={direction}
                disabled={device.status === 'revoked'}
                icon="shield"
                key={device.deviceId}
                language={locale}
                meta={t(
                  device.status === 'paired' ? 'r003.devices.paired' : 'r003.devices.revoked',
                )}
                onPress={
                  device.status === 'paired' ? () => revokeDevice(device.childId) : undefined
                }
                testID={`revoke-device-${device.childId}`}
                title={
                  device.status === 'paired'
                    ? t('r003.devices.revoke', { name })
                    : t('r003.devices.deviceName')
                }
              />
            );
          })
        ) : (
          <R003Status
            direction={direction}
            icon="info"
            language={locale}
            message={t('r003.devices.empty')}
          />
        )}
      </R003Section>
      {notice ? (
        <R003Status
          direction={direction}
          icon={notice.tone === 'success' ? 'check-filled' : 'info'}
          language={locale}
          message={notice.message}
          tone={notice.tone}
        />
      ) : null}
    </R002aScreen>
  );
}

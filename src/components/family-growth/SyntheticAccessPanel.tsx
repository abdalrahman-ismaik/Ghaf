import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import type { SyntheticChildId } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface SyntheticAccessProfile {
  readonly childId: SyntheticChildId;
  readonly label: string;
  readonly status: 'ready' | 'revoked';
}

export interface SyntheticAccessPanelProps {
  readonly canManage: boolean;
  readonly error: string | null;
  readonly onChangeAccess: (childId: SyntheticChildId, enabled: boolean) => void;
  readonly profiles: readonly SyntheticAccessProfile[];
}

export function SyntheticAccessPanel({
  canManage,
  error,
  onChangeAccess,
  profiles,
}: SyntheticAccessPanelProps) {
  const { t } = useTranslation();
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <Card testID="synthetic-access-panel" variant="tonal">
      <View style={styles.heading}>
        <Text color="forest" variant="heading">
          {t('familyAccess.title')}
        </Text>
        <Text color="inkMuted">{t('familyAccess.body')}</Text>
        <Text color="mangrove" variant="caption">
          {t('familyAccess.parentReady')}
        </Text>
      </View>

      <View style={styles.profileList}>
        {profiles.map((profile) => {
          const enabled = profile.status === 'ready';
          return (
            <View
              key={profile.childId}
              style={[
                styles.profile,
                direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
                enabled ? styles.profileReady : styles.profileRevoked,
              ]}
              testID={`access-profile-${profile.childId}`}
            >
              <View
                aria-hidden
                style={[styles.statusMark, enabled ? styles.markReady : styles.markRevoked]}
              />
              <View style={styles.profileCopy}>
                <Text color="forest" variant="label">
                  {profile.label}
                </Text>
                <Text color={enabled ? 'mangrove' : 'danger'} variant="caption">
                  {t(enabled ? 'familyAccess.profileReady' : 'familyAccess.profileRevoked')}
                </Text>
                <Text color="inkMuted" variant="caption">
                  {enabled ? t('familyAccess.paired') : t('familyAccess.blocked')}
                </Text>
                {canManage ? (
                  <Button
                    fullWidth={false}
                    onPress={() => onChangeAccess(profile.childId, !enabled)}
                    testID={`${enabled ? 'revoke' : 'restore'}-${profile.childId}-access`}
                    variant={enabled ? 'quiet' : 'secondary'}
                  >
                    {t(enabled ? 'familyAccess.revoke' : 'familyAccess.restore')}
                  </Button>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {!canManage ? (
        <Text color="inkMuted" variant="caption">
          {t('familyAccess.manageHint')}
        </Text>
      ) : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" color="danger" testID="access-panel-error">
          {error}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  profileList: { gap: spacing.sm },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  profile: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderStartWidth: 1,
    padding: spacing.md,
  },
  profileReady: { borderStartColor: colors.mangrove, backgroundColor: colors.waterLight },
  profileRevoked: { borderStartColor: colors.coral, backgroundColor: colors.coralLight },
  statusMark: {
    width: spacing.sm,
    height: spacing.sm,
    flexShrink: 0,
    marginTop: spacing.xs,
    borderRadius: radii.pill,
  },
  markReady: { backgroundColor: colors.success },
  markRevoked: { backgroundColor: colors.danger },
  profileCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
});

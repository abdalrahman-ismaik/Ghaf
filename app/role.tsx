import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SyntheticAccessPanel } from '@/components/family-growth/SyntheticAccessPanel';
import { JourneyHeader } from '@/components/journey';
import { Screen, Text } from '@/components/primitives';
import { colors, layout, radii, spacing } from '@/design/tokens';
import type { DemoRole, SyntheticChildId, TaskLifecycleStatus } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const CHILD_HANDOFF_ROUTES: Partial<
  Record<TaskLifecycleStatus, '/child' | '/child/task' | '/garden'>
> = {
  assigned: '/child',
  chosen: '/child/task',
  in_progress: '/child/task',
  submitted: '/child/task',
  retry: '/child',
  confirmed: '/child',
  recognized: '/garden',
};

export default function RoleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);
  const direction = usePrototypeStore((state) => state.direction);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const journey = usePrototypeStore((state) => state.journey);
  const familyExperience = usePrototypeStore((state) => state.familyExperience);
  const enterParentExperience = usePrototypeStore((state) => state.enterParentExperience);
  const enterChildExperience = usePrototypeStore((state) => state.enterChildExperience);
  const setSyntheticChildAccess = usePrototypeStore((state) => state.setSyntheticChildAccess);
  const [accessError, setAccessError] = useState<string | null>(null);
  const salemHandoffLabel =
    journey?.assignment?.childId === 'child_salem'
      ? journey.lifecycle === 'assigned'
        ? t('role.salemAssigned')
        : journey.lifecycle === 'chosen'
          ? t('childHome.openTask')
          : journey.lifecycle === 'in_progress'
            ? t('childHome.resumeTask')
            : ['submitted', 'confirmed'].includes(journey.lifecycle)
              ? t('childHome.waitingForParent')
              : journey.lifecycle === 'recognized'
                ? t('parentHome.openGarden')
                : null
      : null;

  const openParent = () => {
    setAccessError(null);
    const result = enterParentExperience();
    if (!result.ok) {
      setAccessError(t('errors.safeRetry'));
      return;
    }
    requestAnimationFrame(() => {
      router.replace(
        journey && ['submitted', 'retry', 'confirmed', 'recognized'].includes(journey.lifecycle)
          ? '/parent/check-in'
          : '/parent',
      );
    });
  };

  const openChild = (childId: SyntheticChildId) => {
    setAccessError(null);
    const result = enterChildExperience(childId);
    if (!result.ok) {
      setAccessError(t('errors.safeRetry'));
      return;
    }
    requestAnimationFrame(() => {
      const handoffRoute =
        childId === 'child_salem' && journey?.assignment?.childId === childId
          ? (CHILD_HANDOFF_ROUTES[journey.lifecycle] ?? '/child')
          : '/child';
      router.replace(handoffRoute);
    });
  };

  const changeChildAccess = (childId: SyntheticChildId, enabled: boolean) => {
    setAccessError(null);
    const result = setSyntheticChildAccess(childId, enabled);
    if (!result.ok) setAccessError(t('errors.safeRetry'));
  };

  const childAccess = Object.fromEntries(
    familyExperience.access.children.map((profile) => [profile.childId, profile.pairingStatus]),
  ) as Readonly<Record<SyntheticChildId, 'paired' | 'revoked'>>;

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="role-screen">
      <JourneyHeader
        action={<LanguageSwitcher compact showGuidance={false} />}
        eyebrow={t('common.prototype')}
        onBack={() => router.replace('/')}
        subtitle={t('role.body')}
        title={t('role.title')}
      />

      <RoleChoice
        description={t('role.parentBody')}
        label={t('role.parentTitle')}
        onPress={openParent}
        selected={role === 'parent'}
        type="parent"
      />

      <View style={styles.childMode}>
        <Text color="forest" variant="heading">
          {t('role.childTitle')}
        </Text>
        <Text color="inkMuted">{t('role.childBody')}</Text>
        <ProfileChoice
          disabled={childAccess.child_salem !== 'paired'}
          label={t('role.chooseSalem')}
          onPress={() => openChild('child_salem')}
          selected={role === 'child' && activeChildId === 'child_salem'}
          status={
            childAccess.child_salem === 'paired'
              ? salemHandoffLabel
              : t('familyAccess.profileRevoked')
          }
          statusTestID="salem-handoff-status"
          testID="choose-salem-button"
        />
        <ProfileChoice
          disabled={childAccess.child_alya !== 'paired'}
          label={t('role.chooseAlya')}
          onPress={() => openChild('child_alya')}
          selected={role === 'child' && activeChildId === 'child_alya'}
          status={childAccess.child_alya === 'paired' ? null : t('familyAccess.profileRevoked')}
          testID="choose-alya-button"
        />
      </View>

      <SyntheticAccessPanel
        canManage={familyExperience.activeEntry?.role === 'parent'}
        error={accessError}
        onChangeAccess={changeChildAccess}
        profiles={familyExperience.access.children.map((profile) => ({
          childId: profile.childId,
          label: t(profile.childId === 'child_salem' ? 'role.chooseSalem' : 'role.chooseAlya'),
          status: profile.pairingStatus === 'paired' ? 'ready' : 'revoked',
        }))}
      />

      <View style={[styles.disclosure, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.disclosureRule} />
        <Text color="earth" style={styles.disclosureCopy} variant="caption">
          {t('parentHome.syntheticPrivacyBoundary')}
        </Text>
      </View>
    </Screen>
  );
}

function RoleChoice({
  description,
  label,
  onPress,
  selected,
  type,
}: {
  description: string;
  label: string;
  onPress: () => void;
  selected: boolean;
  type: DemoRole;
}) {
  const [focused, setFocused] = useState(false);
  const direction = usePrototypeStore((state) => state.direction);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleChoice,
        direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
        selected ? styles.selected : null,
        focused ? styles.focused : null,
        pressed ? styles.pressed : null,
      ]}
      testID={`choose-${type}-mode`}
    >
      <View style={styles.roleGlyph}>
        <View style={styles.roleStem} />
        <View style={[styles.roleLeaf, styles.roleLeafOne]} />
        {type === 'parent' ? <View style={[styles.roleLeaf, styles.roleLeafTwo]} /> : null}
      </View>
      <View style={styles.copy}>
        <Text color="forest" variant="heading">
          {label}
        </Text>
        <Text color="inkMuted">{description}</Text>
      </View>
    </Pressable>
  );
}

function ProfileChoice({
  disabled,
  label,
  onPress,
  selected,
  status,
  statusTestID,
  testID,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
  status?: string | null;
  statusTestID?: string;
  testID: string;
}) {
  const [focused, setFocused] = useState(false);
  const direction = usePrototypeStore((state) => state.direction);
  return (
    <Pressable
      accessibilityLabel={[label, status].filter(Boolean).join('. ')}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.profileChoice,
        direction === 'rtl' ? styles.rowRtl : styles.rowLtr,
        selected ? styles.profileSelected : null,
        focused ? styles.focused : null,
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
      testID={testID}
    >
      <View style={[styles.profileMark, selected ? styles.profileMarkSelected : null]} />
      <View style={styles.copy}>
        <Text color="forest" variant="label">
          {label}
        </Text>
        {status ? (
          <Text color="mangrove" testID={statusTestID} variant="caption">
            {status}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContent: { justifyContent: 'center', paddingBottom: spacing.huge },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLtr: { flexDirection: 'row' },
  roleChoice: {
    minHeight: 132,
    alignItems: 'center',
    gap: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  selected: {
    borderColor: colors.ghaf,
    backgroundColor: colors.leafMist,
  },
  roleGlyph: {
    width: 60,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  roleStem: {
    position: 'absolute',
    bottom: 12,
    width: 4,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.earth,
  },
  roleLeaf: {
    position: 'absolute',
    width: 24,
    height: 13,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.ghaf,
  },
  roleLeafOne: { top: 18, start: 9, transform: [{ rotate: '24deg' }] },
  roleLeafTwo: { top: 34, end: 7, transform: [{ rotate: '-24deg' }] },
  copy: { flex: 1, minWidth: 0, gap: spacing.xxs },
  childMode: {
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: spacing.lg,
  },
  profileChoice: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  profileSelected: { borderColor: colors.mangrove, backgroundColor: colors.waterLight },
  profileMark: {
    width: 18,
    height: 26,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.inkMuted,
  },
  profileMarkSelected: { borderColor: colors.mangrove, backgroundColor: colors.mangrove },
  disclosure: { alignItems: 'flex-start', gap: spacing.sm },
  disclosureCopy: { flex: 1, minWidth: 0 },
  disclosureRule: { width: 1, minHeight: 44, backgroundColor: colors.gold },
  focused: { borderColor: colors.gold, borderWidth: 2 },
  pressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.56 },
});

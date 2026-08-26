import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Screen, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import type { PrototypeRole } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface RoleChoiceProps {
  description: string;
  divider?: boolean;
  kind: PrototypeRole;
  label: string;
  onPress: () => void;
  selected: boolean;
  testID: string;
}

function RoleChoice({
  description,
  divider = false,
  kind,
  label,
  onPress,
  selected,
  testID,
}: RoleChoiceProps) {
  const direction = usePrototypeStore((state) => state.direction);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleChoice,
        divider ? styles.roleChoiceDivider : null,
        direction === 'rtl' ? styles.rowRtl : null,
        selected ? styles.roleChoiceSelected : null,
        pressed ? styles.pressed : null,
      ]}
      testID={testID}
    >
      <View style={[styles.roleGlyph, selected ? styles.roleGlyphSelected : null]}>
        <View style={[styles.roleStem, selected ? styles.roleStemSelected : null]} />
        <View
          style={[
            styles.roleLeaf,
            kind === 'parent' ? styles.roleLeafParent : styles.roleLeafChild,
            selected ? styles.roleLeafSelected : null,
          ]}
        />
        {kind === 'parent' ? (
          <View
            style={[
              styles.roleLeaf,
              styles.roleLeafSecond,
              selected ? styles.roleLeafSelected : null,
            ]}
          />
        ) : null}
      </View>
      <View style={styles.roleCopy}>
        <Text color="forest" variant="heading">
          {label}
        </Text>
        <Text color="inkMuted">{description}</Text>
      </View>
    </Pressable>
  );
}

export default function RoleSelectorScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);
  const setRole = usePrototypeStore((state) => state.setRole);
  const resetDemo = usePrototypeStore((state) => state.resetDemo);

  const openRole = (nextRole: PrototypeRole) => {
    setRole(nextRole);
    router.replace(nextRole === 'parent' ? '/parent' : '/child');
  };

  const reset = () => {
    resetDemo();
    router.dismissAll();
    router.replace('/parent');
  };

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="role-screen">
      <View style={styles.topBar}>
        <View>
          <Text color="forest" variant="heading">
            Ghaf · غاف
          </Text>
          <Text color="earth" variant="caption">
            {t('common.prototype')}
          </Text>
        </View>
        <LanguageSwitcher compact showGuidance={false} />
      </View>

      <View style={styles.intro}>
        <Text color="forest" variant="title">
          {t('role.title')}
        </Text>
        <Text color="inkMuted">{t('role.subtitle')}</Text>
        <View style={styles.introRecord}>
          <View style={styles.introLine} />
          <Text color="earth" variant="caption">
            {t('role.eyebrow')}
          </Text>
        </View>
      </View>

      <View accessibilityRole="radiogroup" style={styles.roleGrid}>
        <RoleChoice
          description={t('role.parentDescription')}
          divider
          kind="parent"
          label={t('common.parent')}
          onPress={() => openRole('parent')}
          selected={role === 'parent'}
          testID="choose-parent-button"
        />
        <RoleChoice
          description={t('role.childDescription')}
          kind="child"
          label={t('common.child')}
          onPress={() => openRole('child')}
          selected={role === 'child'}
          testID="choose-child-button"
        />
      </View>

      <View style={styles.disclosure}>
        <View style={styles.disclosureDot} />
        <Text color="inkMuted" style={styles.disclosureText} variant="caption">
          {t('role.shortcutNote')} {t('mission.sourceNote')}
        </Text>
      </View>

      <Button onPress={reset} variant="ghost">
        {t('common.reset')}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  intro: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  introRecord: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  introLine: {
    width: 32,
    height: 1,
    backgroundColor: colors.gold,
  },
  roleGrid: {
    overflow: 'hidden',
    borderRadius: radii.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  roleChoice: {
    minHeight: 136,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
    borderRadius: 0,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  roleChoiceDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  roleChoiceSelected: {
    backgroundColor: colors.leafLight,
  },
  roleGlyph: {
    width: 58,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  roleGlyphSelected: {
    backgroundColor: colors.ghaf,
    borderColor: colors.ghaf,
  },
  roleStem: {
    position: 'absolute',
    bottom: 14,
    width: 3,
    height: 37,
    borderRadius: radii.pill,
    backgroundColor: colors.earth,
    transform: [{ rotate: '6deg' }],
  },
  roleStemSelected: {
    backgroundColor: colors.goldLight,
  },
  roleLeaf: {
    position: 'absolute',
    width: 19,
    height: 10,
    borderTopLeftRadius: radii.pill,
    borderBottomRightRadius: radii.pill,
    backgroundColor: colors.ghaf,
  },
  roleLeafSelected: {
    backgroundColor: colors.white,
  },
  roleLeafParent: {
    top: 20,
    left: 13,
    transform: [{ rotate: '25deg' }],
  },
  roleLeafChild: {
    top: 29,
    right: 11,
    transform: [{ rotate: '-24deg' }],
  },
  roleLeafSecond: {
    top: 34,
    right: 10,
    transform: [{ rotate: '-25deg' }],
  },
  roleCopy: {
    maxWidth: 320,
    flex: 1,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  disclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.goldLight,
    borderWidth: 1,
    borderColor: colors.sand,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  disclosureDot: {
    width: 9,
    height: 9,
    flexShrink: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
  },
  disclosureText: {
    flex: 1,
  },
});

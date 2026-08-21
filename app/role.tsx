import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button, Card, Screen, Text } from '@/components/primitives';
import { colors, radii, spacing } from '@/design/tokens';
import type { PrototypeRole } from '@/models/prototype';
import { usePrototypeStore } from '@/state/usePrototypeStore';

interface RoleChoiceProps {
  description: string;
  glyph: string;
  label: string;
  onPress: () => void;
  selected: boolean;
}

function RoleChoice({ description, glyph, label, onPress, selected }: RoleChoiceProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleChoice,
        selected ? styles.roleChoiceSelected : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.roleGlyph, selected ? styles.roleGlyphSelected : null]}>
        <Text align="center" color={selected ? 'white' : 'ghaf'} style={styles.roleGlyphText}>
          {glyph}
        </Text>
      </View>
      <View style={styles.roleCopy}>
        <Text align="center" color="forest" variant="heading">
          {label}
        </Text>
        <Text align="center" color="inkMuted">
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

export default function RoleSelectorScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = usePrototypeStore((state) => state.role);
  const direction = usePrototypeStore((state) => state.direction);
  const setRole = usePrototypeStore((state) => state.setRole);
  const resetDemo = usePrototypeStore((state) => state.resetDemo);

  const openRole = (nextRole: PrototypeRole) => {
    setRole(nextRole);
    router.replace(nextRole === 'parent' ? '/parent' : '/child');
  };

  const reset = () => {
    resetDemo();
    router.replace('/parent');
  };

  return (
    <Screen contentContainerStyle={styles.screenContent} testID="role-screen">
      <View style={[styles.topBar, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View>
          <Text color="forest" variant="heading">
            Ghaf · غاف
          </Text>
          <Text color="gold" variant="caption">
            {t('common.prototype')}
          </Text>
        </View>
        <LanguageSwitcher compact showGuidance={false} />
      </View>

      <View style={styles.intro}>
        <Text color="gold" variant="label">
          {t('role.eyebrow')}
        </Text>
        <Text color="forest" variant="title">
          {t('role.title')}
        </Text>
        <Text color="inkMuted">{t('role.subtitle')}</Text>
      </View>

      <View accessibilityRole="radiogroup" style={styles.roleGrid}>
        <RoleChoice
          description={t('role.parentDescription')}
          glyph="⌂"
          label={t('common.parent')}
          onPress={() => openRole('parent')}
          selected={role === 'parent'}
        />
        <RoleChoice
          description={t('role.childDescription')}
          glyph="✦"
          label={t('common.child')}
          onPress={() => openRole('child')}
          selected={role === 'child'}
        />
      </View>

      <Card style={[styles.disclosure, direction === 'rtl' ? styles.rowRtl : styles.rowLtr]}>
        <View style={styles.disclosureDot} />
        <Text color="inkMuted" style={styles.disclosureText} variant="caption">
          {t('role.shortcutNote')} {t('mission.sourceNote')}
        </Text>
      </Card>

      <Button onPress={reset} variant="ghost">
        {t('common.reset')}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowLtr: {
    flexDirection: 'row',
  },
  screenContent: {
    justifyContent: 'center',
  },
  topBar: {
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
  roleGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleChoice: {
    minHeight: 188,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  roleChoiceSelected: {
    borderColor: colors.ghaf,
    backgroundColor: colors.leafLight,
  },
  roleGlyph: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  roleGlyphSelected: {
    backgroundColor: colors.ghaf,
    borderColor: colors.ghaf,
  },
  roleGlyphText: {
    fontSize: 30,
    lineHeight: 36,
  },
  roleCopy: {
    maxWidth: 320,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  disclosure: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.goldLight,
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

import { Redirect, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessHeader, AccessScreen, BotanicalAvatar, GhafIcon } from '@/components/access';
import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import { R003Status } from '@/components/r003';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import { localize } from '@/i18n';
import { usePrototypeStore } from '@/state/usePrototypeStore';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;
const PICTURE_KEYS = [
  { id: 'leaf', icon: 'leaf', label: 'r003.access.pictureLeaf' },
  { id: 'water', icon: 'water-drop', label: 'r003.access.pictureWater' },
  { id: 'tree', icon: 'ghaf-tree', label: 'r003.access.pictureTree' },
] as const;

export default function ChildCredentialScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const childAccess = usePrototypeStore((state) => state.childAccess);
  const children = usePrototypeStore((state) => state.children);
  const verify = usePrototypeStore((state) => state.verifyChildCredential);
  const [pin, setPin] = useState('');
  const [sequence, setSequence] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (activeExperience === 'parent') return <Redirect href="/parent" />;
  if (activeExperience === 'child') return <Redirect href="/child" />;
  if (!childAccess.selectedChildId) return <Redirect href={'/access/child' as Href} />;
  const child = children[childAccess.selectedChildId];
  const name = localize(child.displayName, locale);
  const pictureMode = childAccess.credentialKind === 'picture_sequence';

  const submit = () => {
    setError(null);
    const credential = pictureMode ? sequence.join('-') : pin;
    const result = verify(credential);
    if (!result.ok) {
      setError(t('r003.access.invalidCredential'));
      return;
    }
    router.replace((result.data.canEnterChildExperience ? '/child' : '/access/child/pair') as Href);
  };

  const clear = () => {
    setError(null);
    setPin('');
    setSequence([]);
  };

  return (
    <AccessScreen
      background="dotted"
      contentMaxWidth={layout.readableContentWidth}
      header={
        <AccessHeader
          backLabel={t('common.back')}
          brand={t('common.brand')}
          direction={direction}
          language={locale}
          onBack={() => router.replace('/access/child' as Href)}
        />
      }
      testID="child-credential-screen"
    >
      <View style={styles.identity}>
        <BotanicalAvatar
          direction={direction}
          id={child.id === 'child_salem' ? 'ghaf_tree' : 'flower'}
          size={76}
        />
        <Text align="center" brand color="deepForest" direction={direction} variant="hero">
          {t('r003.access.pinTitle', { name })}
        </Text>
        <Text align="center" brand color="onSurfaceVariant" direction={direction}>
          {t(pictureMode ? 'r003.access.pictureBody' : 'r003.access.pinBody')}
        </Text>
      </View>

      {pictureMode ? (
        <View style={styles.pictureSection}>
          <View style={[styles.pictureRow, { flexDirection: logicalRowDirection(direction) }]}>
            {PICTURE_KEYS.map((item) => (
              <Pressable
                accessibilityLabel={t(item.label)}
                accessibilityRole="button"
                key={item.id}
                onPress={() => {
                  if (sequence.length < 3) setSequence((items) => [...items, item.id]);
                }}
                style={({ pressed }) => [styles.pictureKey, pressed ? styles.pressed : null]}
                testID={`picture-key-${item.id}`}
              >
                <GhafIcon
                  color={colors.ghafEmerald}
                  direction={direction}
                  name={item.icon}
                  size={30}
                />
                <Text align="center" brand direction={direction} variant="caption">
                  {t(item.label)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text align="center" brand color="onSurfaceVariant" tabular variant="label">
            {t('r003.access.pictureSelected', { count: sequence.length })}
          </Text>
        </View>
      ) : (
        <View style={styles.pinSection}>
          <View
            accessibilityLabel={`${pin.length} / 4`}
            style={[styles.pinSlots, { flexDirection: logicalRowDirection(direction) }]}
          >
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[styles.pinSlot, index < pin.length ? styles.pinFilled : null]}
              >
                {index < pin.length ? <View style={styles.pinDot} /> : null}
              </View>
            ))}
          </View>
          <View style={styles.keypad}>
            {KEYS.map((key) => (
              <Pressable
                accessibilityLabel={key}
                accessibilityRole="button"
                key={key}
                onPress={() => {
                  if (pin.length < 4) setPin((value) => `${value}${key}`);
                }}
                style={({ pressed }) => [styles.numberKey, pressed ? styles.pressed : null]}
                testID={`pin-key-${key}`}
              >
                <Text align="center" brand color="deepForest" tabular variant="screenTitle">
                  {key}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text align="center" brand color="onSurfaceVariant" variant="caption">
            {t('r003.access.pinHint')}
          </Text>
        </View>
      )}

      {error ? (
        <R003Status
          direction={direction}
          icon="info"
          language={locale}
          message={error}
          tone="warning"
        />
      ) : null}
      <View style={styles.actions}>
        <PrimaryButton
          brand
          direction={direction}
          disabled={pictureMode ? sequence.length !== 3 : pin.length !== 4}
          language={locale}
          onPress={submit}
          testID="submit-child-credential"
        >
          {t('r003.access.continue')}
        </PrimaryButton>
        <QuietButton brand direction={direction} language={locale} onPress={clear}>
          {t('r003.access.clear')}
        </QuietButton>
      </View>
      <R003Status
        direction={direction}
        icon="shield"
        language={locale}
        message={t('r003.access.synthetic')}
      />
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  pictureSection: { gap: spacing.md },
  pictureRow: { justifyContent: 'center', gap: spacing.sm },
  pictureKey: {
    minWidth: 0,
    maxWidth: 96,
    flex: 1,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    ...r001Shadows.soft,
  },
  pinSection: { alignItems: 'center', gap: spacing.lg },
  pinSlots: { justifyContent: 'center', gap: spacing.sm },
  pinSlot: {
    width: 56,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: r001Radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
  },
  pinFilled: { borderColor: colors.solarAmber, borderWidth: 2 },
  pinDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.deepForest },
  keypad: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  numberKey: {
    width: 84,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    ...r001Shadows.soft,
  },
  actions: { gap: spacing.xs },
  pressed: { opacity: opacity.pressed, transform: [{ scale: 0.97 }] },
});

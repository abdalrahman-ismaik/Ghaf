import { Redirect, useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessHeader, AccessScreen, BotanicalAvatar, GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { R003Hero, R003Status } from '@/components/r003';
import {
  colors,
  layout,
  logicalRowDirection,
  opacity,
  r001Radii,
  r001Shadows,
  spacing,
} from '@/design/tokens';
import { usePrototypeStore } from '@/state/usePrototypeStore';
import type { ChildTreeAvatarId } from '@/models/parentOnboarding';

export default function ChooseChildProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const localFamily = usePrototypeStore((state) => state.localFamily);
  const selectProfile = usePrototypeStore((state) => state.selectChildAccessProfile);

  if (activeExperience === 'parent') return <Redirect href="/parent" />;
  if (activeExperience === 'child') return <Redirect href="/child" />;

  const choose = (childId: 'child_salem' | 'child_alya') => {
    const result = selectProfile(childId);
    if (result.ok) router.push('/access/child/pin' as Href);
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
          onBack={() => router.replace('/')}
        />
      }
      testID="child-profile-access-screen"
    >
      <R003Hero
        body={t('r003.access.chooseBody')}
        direction={direction}
        icon="child"
        language={locale}
        title={t('r003.access.chooseTitle')}
      />
      <View style={styles.profiles}>
        {localFamily.record?.children.map((child) => (
          <ProfileChoice
            accessLabel={t(
              child.id === 'child_salem' ? 'r003.access.salemAccess' : 'r003.access.alyaAccess',
            )}
            avatar={child.avatarId}
            direction={direction}
            key={child.id}
            label={child.nickname}
            onPress={() => choose(child.id)}
            testID={`choose-${child.id.replace('_', '-')}`}
          />
        ))}
      </View>
      <R003Status
        direction={direction}
        icon={localFamily.record ? 'shield' : 'family'}
        language={locale}
        message={
          localFamily.record
            ? t('r003.access.synthetic')
            : localFamily.status === 'unavailable'
              ? t('access.states.localDataUnavailable')
              : t('r003.access.parentRequired')
        }
        tone={localFamily.record ? 'neutral' : 'warning'}
      />
    </AccessScreen>
  );
}

function ProfileChoice({
  accessLabel,
  avatar,
  direction,
  label,
  onPress,
  testID,
}: {
  accessLabel: string;
  avatar: ChildTreeAvatarId;
  direction: 'rtl' | 'ltr';
  label: string;
  onPress: () => void;
  testID: string;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityLabel={t('r003.access.profileAction', { name: label })}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.profile,
        { flexDirection: logicalRowDirection(direction) },
        pressed ? styles.pressed : null,
      ]}
      testID={testID}
    >
      <BotanicalAvatar direction={direction} id={avatar} size={64} />
      <View style={styles.profileCopy}>
        <Text brand color="deepForest" direction={direction} variant="screenTitle">
          {label}
        </Text>
        <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
          {accessLabel}
        </Text>
      </View>
      <GhafIcon color={colors.ghafEmerald} direction={direction} name="chevron" size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profiles: { gap: spacing.md },
  profile: {
    minHeight: 104,
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: r001Radii.xl,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    ...r001Shadows.soft,
  },
  profileCopy: { minWidth: 0, flex: 1, gap: spacing.xxs },
  pressed: { opacity: opacity.pressed, transform: [{ scale: 0.99 }] },
});

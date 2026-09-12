import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AccessHeader,
  AccessScreen,
  BotanicalAvatar,
  ChildAccessPortrait,
  GhafIcon,
} from '@/components/access';
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
import type { DemoPrincipal } from '@/models/demoEntry';
import type { LocaleCode, TextDirection } from '@/models/familyGrowth';
import type { ChildTreeAvatarId } from '@/models/parentOnboarding';

import type { DemoEntryCopy } from './types';

const childPrincipals = ['child_salem', 'child_alya'] as const;
const childAvatars: Record<'ghaf_tree' | 'flower', ChildTreeAvatarId> = {
  ghaf_tree: 'ghaf_tree',
  flower: 'flower',
};

export interface OriginalDemoChildChooserProps {
  readonly locale: LocaleCode;
  readonly direction: TextDirection;
  readonly copy: DemoEntryCopy;
  readonly busy: boolean;
  readonly error: string | null;
  readonly onChooseProfile: (principal: DemoPrincipal) => void;
  readonly onBack: () => void;
}

export function OriginalDemoChildChooser({
  locale,
  direction,
  copy,
  busy,
  error,
  onChooseProfile,
  onBack,
}: OriginalDemoChildChooserProps) {
  const { t } = useTranslation();
  const profiles = childPrincipals.flatMap((principal) => {
    const profile = copy.profiles.find((option) => option.principal === principal);
    return profile && (profile.avatar === 'ghaf_tree' || profile.avatar === 'flower')
      ? [{ profile, avatar: childAvatars[profile.avatar] }]
      : [];
  });
  const validProfiles = profiles.length === childPrincipals.length;
  const displayedError = validProfiles ? error : copy.unavailableError;

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  const choose = (principal: DemoPrincipal) => {
    if (
      busy ||
      !validProfiles ||
      !profiles.some(({ profile }) => profile.principal === principal)
    ) {
      return;
    }
    onChooseProfile(principal);
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
          onBack={onBack}
        />
      }
      testID="child-profile-access-screen"
    >
      <R003Hero
        body={copy.body}
        direction={direction}
        icon="child"
        language={locale}
        title={t('r003.access.chooseTitle')}
      />
      <ChildAccessPortrait />
      <View style={styles.profiles}>
        {validProfiles
          ? profiles.map(({ profile, avatar }) => (
              <ProfileChoice
                accessLabel={profile.description}
                avatar={avatar}
                direction={direction}
                disabled={busy}
                key={profile.principal}
                label={profile.name}
                onPress={() => choose(profile.principal)}
                testID={`choose-${profile.principal.replace('_', '-')}`}
              />
            ))
          : null}
      </View>
      <R003Status
        direction={direction}
        icon="shield"
        language={locale}
        message={copy.disclosure}
        tone="neutral"
      />
      {displayedError ? (
        <Text
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
          brand
          color="tertiary"
          direction={direction}
          language={locale}
          testID="demo-entry-error"
        >
          {displayedError}
        </Text>
      ) : null}
      {busy ? (
        <Text
          accessibilityLiveRegion="polite"
          accessibilityState={{ busy: true }}
          brand
          direction={direction}
          language={locale}
          testID="demo-entry-busy"
        >
          {copy.busyLabel}
        </Text>
      ) : null}
    </AccessScreen>
  );
}

function ProfileChoice({
  accessLabel,
  avatar,
  direction,
  disabled,
  label,
  onPress,
  testID,
}: {
  accessLabel: string;
  avatar: ChildTreeAvatarId;
  direction: TextDirection;
  disabled: boolean;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityLabel={t('r003.access.profileAction', { name: label })}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: disabled }}
      disabled={disabled}
      onPress={() => {
        if (!disabled) onPress();
      }}
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

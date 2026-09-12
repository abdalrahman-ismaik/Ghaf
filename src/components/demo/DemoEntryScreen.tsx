import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  findNodeHandle,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { AccessScreen } from '@/components/access/AccessShell';
import { GhafIcon, type GhafIconName } from '@/components/access/GhafIcon';
import { GhafRasterLogo } from '@/components/brand/GhafRasterLogo';
import { Button, QuietButton, Text } from '@/components/primitives';
import { botanical, layout, logicalRowDirection } from '@/design/tokens';
import type { DemoPrincipal } from '@/models/demoEntry';

import { DemoOnboardingStory } from './DemoOnboardingStory';
import type { DemoEntryScreenProps, DemoProfileOption, DemoStoryStep } from './types';

const principals: readonly DemoPrincipal[] = ['parent_al_noor', 'child_salem', 'child_alya'];
const avatarIcons: Record<DemoProfileOption['avatar'], GhafIconName> = {
  parent: 'person',
  ghaf_tree: 'ghaf-tree',
  flower: 'flower',
};

function isProfileOption(value: unknown): value is DemoProfileOption {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<DemoProfileOption>;
  return (
    principals.includes(profile.principal as DemoPrincipal) &&
    [profile.name, profile.roleLabel, profile.description].every(
      (text) => typeof text === 'string' && text.trim().length > 0,
    ) &&
    typeof profile.avatar === 'string' &&
    Object.hasOwn(avatarIcons, profile.avatar)
  );
}

export function DemoEntryScreen({
  locale,
  direction,
  copy,
  busy,
  error,
  restartRequired,
  onChooseProfile,
  onChangeLocale,
}: DemoEntryScreenProps) {
  const [storyStep, setStoryStep] = useState<DemoStoryStep | null>(null);
  const headingRef = useRef<View>(null);
  const showingStory = storyStep !== null && !restartRequired;
  const profileOptions = Array.isArray(copy.profiles) ? Array.from(copy.profiles) : [];
  const validProfiles =
    profileOptions.length === principals.length &&
    profileOptions.every(isProfileOption) &&
    new Set(profileOptions.map((profile) => profile.principal)).size === principals.length;
  const profiles = validProfiles
    ? principals.flatMap((principal) =>
        profileOptions.filter((profile) => profile.principal === principal),
      )
    : [];
  const displayedError = validProfiles ? error : copy.unavailableError;

  useEffect(() => {
    if (!showingStory) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setStoryStep((current) =>
        current === null || current === 0 ? null : ((current - 1) as DemoStoryStep),
      );
      return true;
    });
    return () => subscription.remove();
  }, [showingStory]);

  useEffect(() => {
    if (showingStory) return;
    if (Platform.OS === 'web') {
      headingRef.current?.focus();
      return;
    }
    const handle = findNodeHandle(headingRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  }, [locale, restartRequired, showingStory]);

  const header = (
    <View style={[styles.header, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafRasterLogo decorative size={56} />
      <QuietButton
        brand
        direction={direction}
        disabled={busy && !restartRequired}
        fullWidth={false}
        icon={<GhafIcon direction={direction} name="language" />}
        language={locale}
        onPress={() => {
          if (!busy || restartRequired) onChangeLocale();
        }}
        style={styles.language}
        testID="demo-language"
      >
        {copy.languageAction}
      </QuietButton>
    </View>
  );

  return (
    <AccessScreen
      background="plain"
      contentStyle={styles.content}
      header={header}
      key={showingStory ? `story-${storyStep}` : 'entry'}
      testID="demo-entry-screen"
    >
      {showingStory ? (
        <DemoOnboardingStory
          copy={copy}
          direction={direction}
          locale={locale}
          onClose={() => setStoryStep(null)}
          onStepChange={setStoryStep}
          step={storyStep}
        />
      ) : (
        <>
          <View
            accessibilityLabel={restartRequired ? copy.restartRequiredTitle : copy.title}
            accessibilityRole="header"
            accessible
            ref={headingRef}
            tabIndex={Platform.OS === 'web' ? -1 : undefined}
          >
            <Text brand direction={direction} language={locale} variant="parentHero">
              {restartRequired ? copy.restartRequiredTitle : copy.title}
            </Text>
          </View>
          {restartRequired ? (
            <Text
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              brand
              direction={direction}
              language={locale}
              testID="demo-restart-required"
            >
              {copy.restartRequiredBody}
            </Text>
          ) : (
            <>
              <Text brand direction={direction} language={locale}>
                {copy.body}
              </Text>
              <Text
                brand
                direction={direction}
                language={locale}
                style={styles.disclosure}
                variant="caption"
              >
                {copy.disclosure}
              </Text>
              {displayedError ? (
                <Text
                  accessibilityLiveRegion="assertive"
                  accessibilityRole="alert"
                  brand
                  direction={direction}
                  language={locale}
                  style={styles.error}
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
              <View style={styles.profiles}>
                {profiles.map((profile) => (
                  <Button
                    accessibilityLabel={[profile.name, profile.roleLabel]
                      .filter((value, index, values) => values.indexOf(value) === index)
                      .join(', ')}
                    accessibilityHint={profile.description}
                    accessibilityState={{ busy, disabled: busy }}
                    brand
                    direction={direction}
                    disabled={busy}
                    key={profile.principal}
                    language={locale}
                    onPress={() => {
                      if (!busy && !restartRequired && validProfiles)
                        onChooseProfile(profile.principal);
                    }}
                    style={styles.profileButton}
                    testID={`demo-profile-${profile.principal}`}
                    variant="neutral"
                  >
                    <View
                      style={[styles.profileRow, { flexDirection: logicalRowDirection(direction) }]}
                    >
                      <View style={styles.avatar}>
                        <GhafIcon
                          color={botanical.colors.forest}
                          name={avatarIcons[profile.avatar]}
                          size={32}
                        />
                      </View>
                      <View style={styles.profileCopy}>
                        <Text brand direction={direction} language={locale} variant="screenTitle">
                          {profile.name}
                        </Text>
                        {profile.roleLabel !== profile.name ? (
                          <Text brand direction={direction} language={locale} variant="caption">
                            {profile.roleLabel}
                          </Text>
                        ) : null}
                        <Text
                          brand
                          direction={direction}
                          language={locale}
                          style={styles.supporting}
                          variant="caption"
                        >
                          {profile.description}
                        </Text>
                      </View>
                      <GhafIcon direction={direction} name="chevron" size={20} />
                    </View>
                  </Button>
                ))}
              </View>
              <Text
                brand
                direction={direction}
                language={locale}
                style={styles.supporting}
                variant="caption"
              >
                {copy.breadthNotice}
              </Text>
              <QuietButton
                brand
                direction={direction}
                disabled={busy}
                language={locale}
                onPress={() => {
                  if (!busy) setStoryStep(0);
                }}
                testID="demo-story-open"
              >
                {copy.storyAction}
              </QuietButton>
              <Text
                brand
                direction={direction}
                language={locale}
                style={styles.supporting}
                variant="caption"
              >
                {copy.restartNotice}
              </Text>
            </>
          )}
        </>
      )}
    </AccessScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: botanical.space.inset,
    paddingVertical: botanical.space.small,
    gap: botanical.space.small,
  },
  language: {
    flexShrink: 1,
    minHeight: layout.touchTarget,
  },
  content: {
    gap: botanical.space.row,
    paddingBottom: botanical.space.section,
  },
  disclosure: {
    color: botanical.colors.forest,
  },
  error: {
    padding: botanical.space.row,
    backgroundColor: botanical.colors.amberWash,
    borderRadius: botanical.radius.small,
  },
  profiles: {
    gap: botanical.space.small,
  },
  profileButton: {
    minHeight: layout.touchTarget,
    padding: botanical.space.row,
    backgroundColor: botanical.colors.paper,
    borderColor: botanical.colors.line,
    borderRadius: botanical.radius.control,
  },
  profileRow: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: botanical.space.small,
  },
  avatar: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.control,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  supporting: {
    color: botanical.colors.muted,
  },
});

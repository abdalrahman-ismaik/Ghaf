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
import { GhafBrandLockup } from '@/components/brand/GhafBrandLockup';
import { LocalIllustration } from '@/components/illustrations/LocalIllustration';
import { Button, QuietButton, Text } from '@/components/primitives';
import { botanical, layout, logicalRowDirection } from '@/design/tokens';
import type { DemoPrincipal } from '@/models/demoEntry';

import { DemoOnboardingStory, DemoStoryNavigation } from './DemoOnboardingStory';
import type { DemoEntryScreenProps, DemoProfileOption, DemoStoryStep } from './types';
import { useDemoOnboardingNarrator } from './useDemoOnboardingNarrator';

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
  runGeneration,
  entryEpoch,
  onChooseProfile,
  onChangeLocale,
}: DemoEntryScreenProps) {
  const [storyStep, setStoryStep] = useState<DemoStoryStep | null>(entryEpoch === 0 ? 0 : null);
  const headingRef = useRef<View>(null);
  const showingStory = storyStep !== null && !restartRequired;
  const narration = useDemoOnboardingNarrator({
    locale,
    step: storyStep,
    active: showingStory && !busy,
    runGeneration,
    entryEpoch,
  });
  const cancelNarration = narration.cancel;
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
      cancelNarration();
      setStoryStep((current) =>
        current === null || current === 0 ? null : ((current - 1) as DemoStoryStep),
      );
      return true;
    });
    return () => subscription.remove();
  }, [showingStory, cancelNarration]);

  useEffect(() => {
    if (showingStory) return;
    if (Platform.OS === 'web') {
      (
        headingRef.current as unknown as { focus(options: { preventScroll: boolean }): void } | null
      )?.focus({ preventScroll: true });
      return;
    }
    const handle = findNodeHandle(headingRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  }, [locale, restartRequired, showingStory]);

  const header = (
    <View style={[styles.header, { flexDirection: logicalRowDirection(direction) }]}>
      <GhafBrandLockup
        brand={copy.brand}
        direction={direction}
        language={locale}
        logoSize={40}
        testID="demo-brand-lockup"
      />
      <QuietButton
        brand
        direction={direction}
        disabled={busy && !restartRequired}
        fullWidth={false}
        icon={<GhafIcon direction={direction} name="language" />}
        language={locale}
        onPress={() => {
          if (!busy || restartRequired) {
            cancelNarration();
            onChangeLocale();
          }
        }}
        style={styles.language}
        testID="demo-language"
      >
        {copy.languageAction}
      </QuietButton>
    </View>
  );

  const closeStory = () => {
    cancelNarration();
    setStoryStep(null);
  };
  const changeStoryStep = (next: DemoStoryStep) => {
    cancelNarration();
    setStoryStep(next);
  };

  return (
    <AccessScreen
      background="welcome"
      contentContainerStyle={showingStory ? styles.storyViewport : styles.entryViewport}
      contentMaxWidth={showingStory ? layout.accessContentWidth : layout.readableContentWidth}
      contentStyle={showingStory ? styles.storyContent : styles.content}
      footer={
        showingStory ? (
          <DemoStoryNavigation
            copy={copy}
            direction={direction}
            locale={locale}
            onClose={closeStory}
            onStepChange={changeStoryStep}
            step={storyStep}
          />
        ) : undefined
      }
      header={header}
      key={showingStory ? `story-${storyStep}` : 'entry'}
      testID="demo-entry-screen"
    >
      {showingStory ? (
        <DemoOnboardingStory
          copy={copy}
          direction={direction}
          locale={locale}
          narration={narration}
          navigationPlacement="footer"
          onClose={closeStory}
          onStepChange={changeStoryStep}
          step={storyStep}
        />
      ) : (
        <>
          <View
            accessibilityLabel={restartRequired ? copy.restartRequiredTitle : copy.title}
            accessibilityRole="header"
            accessible
            ref={headingRef}
            style={
              Platform.OS === 'web'
                ? { outlineWidth: 0, outlineStyle: 'solid' as const }
                : undefined
            }
            tabIndex={Platform.OS === 'web' ? -1 : undefined}
          >
            <Text
              accessibilityRole="text"
              align="center"
              brand
              direction={direction}
              language={locale}
              variant="parentHero"
            >
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
              <Text
                align="center"
                brand
                direction={direction}
                language={locale}
                style={styles.introduction}
              >
                {copy.body}
              </Text>
              <Text
                align="center"
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
                {profiles.map((profile) => {
                  const isParent = profile.principal === 'parent_al_noor';
                  const portrait = isParent
                    ? 'avatar-leaf'
                    : profile.avatar === 'flower'
                      ? 'avatar-flower'
                      : 'avatar-ghaf';
                  return (
                    <Button
                      accessibilityLabel={[profile.name, profile.roleLabel]
                        .filter((value, index, values) => values.indexOf(value) === index)
                        .join(', ')}
                      accessibilityHint={profile.description}
                      accessibilityState={{ busy, disabled: busy }}
                      brand
                      direction={direction}
                      disabled={busy}
                      fullWidth
                      key={profile.principal}
                      language={locale}
                      onPress={() => {
                        if (!busy && !restartRequired && validProfiles) {
                          cancelNarration();
                          onChooseProfile(profile.principal);
                        }
                      }}
                      style={[
                        styles.profileButton,
                        isParent ? styles.parentButton : styles.childButton,
                      ]}
                      testID={`demo-profile-${profile.principal}`}
                      variant="neutral"
                    >
                      <View
                        style={[
                          styles.profileContent,
                          { flexDirection: logicalRowDirection(direction) },
                        ]}
                      >
                        <LocalIllustration
                          assetId={portrait}
                          contentFit="contain"
                          decorative
                          direction={direction}
                          fallback={
                            <View style={styles.avatarFallback}>
                              <GhafIcon
                                color={botanical.colors.forest}
                                name={avatarIcons[profile.avatar]}
                                size={32}
                              />
                            </View>
                          }
                          language={locale}
                          style={styles.profileAvatar}
                          testID={`demo-profile-portrait-${profile.principal}`}
                        />
                        <View style={styles.profileCopy}>
                          <Text
                            accessibilityRole="text"
                            brand
                            direction={direction}
                            language={locale}
                            style={isParent ? styles.parentText : undefined}
                            variant="screenTitle"
                          >
                            {profile.name}
                          </Text>
                          {profile.roleLabel !== profile.name ? (
                            <Text
                              brand
                              direction={direction}
                              language={locale}
                              style={isParent ? styles.parentSupporting : styles.supporting}
                              variant="label"
                            >
                              {profile.roleLabel}
                            </Text>
                          ) : null}
                          <Text
                            brand
                            direction={direction}
                            language={locale}
                            style={isParent ? styles.parentSupporting : styles.supporting}
                            variant="caption"
                          >
                            {profile.description}
                          </Text>
                        </View>
                        <View style={styles.profileChevron}>
                          <GhafIcon
                            color={isParent ? botanical.colors.onForest : botanical.colors.forest}
                            direction={direction}
                            name="chevron"
                            size={20}
                          />
                        </View>
                      </View>
                    </Button>
                  );
                })}
              </View>
              <LocalIllustration
                assetId="welcome-ghaf-habitat"
                decorative
                direction={direction}
                fallback={
                  <View style={styles.habitatFallback}>
                    <GhafIcon name="ghaf-tree" color={botanical.colors.forest} size={56} />
                  </View>
                }
                language={locale}
                priority="high"
                style={styles.habitat}
                testID="demo-entry-habitat"
              />
              <Text
                align="center"
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
                  if (!busy) {
                    cancelNarration();
                    setStoryStep(0);
                  }
                }}
                testID="demo-story-open"
              >
                {copy.storyAction}
              </QuietButton>
              <Text
                align="center"
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: layout.accessContentWidth + botanical.space.inset * 2,
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
  storyViewport: {
    paddingTop: botanical.space.small,
    paddingBottom: botanical.space.row,
  },
  entryViewport: {
    paddingTop: botanical.space.row,
  },
  storyContent: {
    gap: botanical.space.row,
  },
  content: {
    gap: botanical.space.row,
    paddingBottom: botanical.space.section,
  },
  introduction: {
    color: botanical.colors.muted,
  },
  habitat: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: botanical.radius.hero,
  },
  habitatFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: botanical.colors.sage,
  },
  disclosure: {
    color: botanical.colors.muted,
  },
  error: {
    padding: botanical.space.row,
    backgroundColor: botanical.colors.amberWash,
    borderRadius: botanical.radius.small,
  },
  profiles: {
    alignItems: 'stretch',
    gap: botanical.space.small,
  },
  profileButton: {
    minHeight: layout.touchTarget,
    padding: botanical.space.row,
    borderRadius: botanical.radius.control,
  },
  parentButton: {
    backgroundColor: botanical.colors.forest,
    borderColor: botanical.colors.forest,
  },
  childButton: {
    backgroundColor: botanical.colors.paper,
    borderColor: botanical.colors.line,
  },
  profileContent: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: botanical.space.small,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    flexShrink: 0,
    borderRadius: botanical.radius.small,
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: botanical.colors.sage,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  profileChevron: {
    flexShrink: 0,
  },
  parentText: {
    color: botanical.colors.onForest,
  },
  parentSupporting: {
    color: botanical.colors.sage,
  },
  supporting: {
    color: botanical.colors.muted,
  },
});

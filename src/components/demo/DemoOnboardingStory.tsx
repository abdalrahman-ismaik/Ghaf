import { useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, StyleSheet, View } from 'react-native';

import { GhafIcon } from '@/components/access/GhafIcon';
import { LocalIllustration } from '@/components/illustrations/LocalIllustration';
import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import { botanical, layout, logicalRowDirection } from '@/design/tokens';

import type { DemoOnboardingStoryProps, DemoStoryStep } from './types';

const momentIds = ['together', 'support', 'growth'] as const;

export function DemoOnboardingStory({
  locale,
  direction,
  copy,
  step,
  narration,
  onStepChange,
  onClose,
}: DemoOnboardingStoryProps) {
  const headingRef = useRef<View>(null);
  const moment = copy.moments.find((item) => item.id === momentIds[step]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      headingRef.current?.focus();
      return;
    }
    const handle = findNodeHandle(headingRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  }, [locale, step]);

  if (!moment) return null;

  const progress = copy.story.progressLabel(step + 1, momentIds.length);
  const audioAvailable =
    locale === 'ar' &&
    narration &&
    !narration.screenReaderActive &&
    narration.status !== 'unavailable' &&
    (narration.canPlay || narration.canStop || narration.canReplay);
  const primaryAudioAction = narration?.canStop ? 'stop' : narration?.canReplay ? 'replay' : 'play';
  const audioLabel =
    primaryAudioAction === 'stop'
      ? copy.story.audioStop
      : primaryAudioAction === 'replay'
        ? copy.story.audioReplay
        : copy.story.audioPlay;
  const pressAudio = () => {
    if (!audioAvailable || !narration) return;
    if (narration.canStop) narration.onStop();
    else if (narration.canReplay) narration.onReplay();
    else if (narration.canPlay) narration.onPlay();
  };

  return (
    <View style={styles.story} testID="demo-onboarding-story">
      <View style={[styles.topLine, { flexDirection: logicalRowDirection(direction) }]}>
        <Text
          accessibilityLabel={progress}
          brand
          direction={direction}
          language={locale}
          style={styles.progress}
          tabular
          testID="demo-story-progress"
          variant="caption"
        >
          {progress}
        </Text>
        <QuietButton
          brand
          direction={direction}
          fullWidth={false}
          language={locale}
          onPress={onClose}
          style={styles.close}
          testID="demo-story-close"
        >
          {copy.story.close}
        </QuietButton>
      </View>
      <View
        accessibilityLabel={moment.title}
        accessibilityRole="header"
        accessible
        ref={headingRef}
        tabIndex={Platform.OS === 'web' ? -1 : undefined}
      >
        <Text
          accessibilityRole="text"
          brand
          direction={direction}
          language={locale}
          variant="parentHero"
        >
          {moment.title}
        </Text>
      </View>
      <LocalIllustration
        accessibilityLabel={moment.imageAlt}
        assetId={moment.assetId}
        direction={direction}
        fallbackLabel={moment.imageAlt}
        language={locale}
        style={styles.artwork}
        testID={`demo-story-image-${moment.id}`}
      />
      <Text brand direction={direction} language={locale} variant="body">
        {moment.body}
      </Text>
      <View style={styles.audio}>
        {audioAvailable ? (
          <>
            <QuietButton
              brand
              direction={direction}
              language={locale}
              onPress={pressAudio}
              testID={`demo-story-audio-${primaryAudioAction}`}
            >
              {audioLabel}
            </QuietButton>
            {narration.canStop && narration.canReplay ? (
              <QuietButton
                brand
                direction={direction}
                language={locale}
                onPress={() => {
                  if (audioAvailable && narration.canReplay) narration.onReplay();
                }}
                testID="demo-story-audio-replay"
              >
                {copy.story.audioReplay}
              </QuietButton>
            ) : null}
            {narration.status === 'loading' ? (
              <Text
                accessibilityLiveRegion="polite"
                brand
                direction={direction}
                language={locale}
                style={styles.mediaNotice}
                testID="demo-story-audio-loading"
                variant="caption"
              >
                {copy.story.audioLoading}
              </Text>
            ) : null}
          </>
        ) : (
          <Text
            brand
            direction={direction}
            language={locale}
            style={styles.mediaNotice}
            testID={
              narration?.screenReaderActive
                ? 'demo-story-audio-screen-reader'
                : 'demo-story-audio-unavailable'
            }
            variant="caption"
          >
            {narration?.screenReaderActive
              ? copy.story.audioScreenReader
              : copy.story.audioUnavailable}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          brand
          direction={direction}
          language={locale}
          onPress={() => (step === 2 ? onClose() : onStepChange((step + 1) as DemoStoryStep))}
          size="regular"
          testID={step === 2 ? 'demo-story-finish' : 'demo-story-next'}
        >
          {step === 2 ? copy.story.finish : copy.story.next}
        </PrimaryButton>
        <QuietButton
          brand
          direction={direction}
          icon={<GhafIcon direction={direction} name="arrow-back" />}
          language={locale}
          onPress={() => (step === 0 ? onClose() : onStepChange((step - 1) as DemoStoryStep))}
          testID="demo-story-back"
        >
          {copy.story.back}
        </QuietButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  story: {
    gap: botanical.space.row,
    width: '100%',
    minWidth: 0,
  },
  topLine: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: botanical.space.small,
  },
  progress: {
    flexShrink: 1,
    color: botanical.colors.muted,
  },
  close: {
    flexShrink: 1,
    minHeight: layout.touchTarget,
  },
  artwork: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: botanical.radius.hero,
  },
  audio: {
    gap: botanical.space.small,
  },
  actions: {
    gap: botanical.space.small,
    paddingTop: botanical.space.small,
  },
  mediaNotice: {
    color: botanical.colors.muted,
  },
});

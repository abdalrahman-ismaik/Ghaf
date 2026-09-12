import { useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { GhafIcon } from '@/components/access/GhafIcon';
import { LocalIllustration } from '@/components/illustrations/LocalIllustration';
import { PrimaryButton, QuietButton, Text } from '@/components/primitives';
import { botanical, layout, logicalRowDirection } from '@/design/tokens';

import type { DemoOnboardingStoryProps, DemoStoryStep } from './types';

const momentIds = ['intro', 'family', 'together', 'ai', 'support', 'growth'] as const;

export function DemoOnboardingStory({
  locale,
  direction,
  copy,
  step,
  narration,
  navigationPlacement = 'inline',
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

  const hasRecording = step === 2 || step === 4 || step === 5;
  const audioAvailable =
    hasRecording &&
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
      <View style={styles.artworkFrame}>
        <LocalIllustration
          accessibilityLabel={moment.imageAlt}
          assetId={moment.assetId}
          direction={direction}
          fallbackLabel={moment.imageAlt}
          language={locale}
          style={styles.artwork}
          testID={`demo-story-image-${moment.id}`}
        />
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={StyleSheet.absoluteFillObject}
        >
          <Svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="none">
            <Rect
              x={3}
              y={3}
              width={294}
              height={194}
              rx={18}
              fill="none"
              stroke={botanical.colors.paper}
              strokeOpacity={0.55}
              strokeWidth={1.5}
            />
            <Rect
              x={3}
              y={3}
              width={294}
              height={194}
              rx={18}
              fill="none"
              stroke={botanical.colors.amber}
              strokeWidth={2.5}
              strokeDasharray={`${(945 * (step + 1)) / 6} 945`}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      </View>
      {hasRecording ? (
        <View style={styles.audio}>
          {audioAvailable ? (
            <>
              <QuietButton
                brand
                direction={direction}
                language={locale}
                icon={<GhafIcon name="speaker" direction={direction} />}
                onPress={pressAudio}
                fullWidth={false}
                style={styles.audioControl}
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
                  fullWidth={false}
                  style={styles.audioControl}
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
      ) : null}
      <View style={styles.readingPanel}>
        <View
          accessibilityLabel={moment.title}
          accessibilityRole="header"
          accessible
          ref={headingRef}
          style={styles.heading}
          tabIndex={Platform.OS === 'web' ? -1 : undefined}
        >
          <Text
            accessibilityRole="text"
            brand
            direction={direction}
            language={locale}
            style={styles.title}
            variant="parentHero"
          >
            {moment.title}
          </Text>
        </View>
        <Text
          brand
          direction={direction}
          language={locale}
          style={styles.transcript}
          variant="body"
        >
          {moment.body}
        </Text>
        {navigationPlacement === 'inline' ? (
          <DemoStoryNavigation
            copy={copy}
            direction={direction}
            locale={locale}
            onClose={onClose}
            onStepChange={onStepChange}
            step={step}
          />
        ) : null}
      </View>
    </View>
  );
}

export function DemoStoryNavigation({
  locale,
  direction,
  copy,
  step,
  onStepChange,
  onClose,
}: Pick<
  DemoOnboardingStoryProps,
  'locale' | 'direction' | 'copy' | 'step' | 'onStepChange' | 'onClose'
>) {
  return (
    <View style={styles.actions} testID="demo-story-navigation">
      <View style={styles.progressGroup}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.progressMarks, { flexDirection: logicalRowDirection(direction) }]}
        >
          {momentIds.map((id, index) => (
            <View
              key={id}
              style={[styles.progressMark, index === step ? styles.progressMarkReached : null]}
            />
          ))}
        </View>
        <Text
          accessibilityLabel={copy.story.progressLabel(step + 1, momentIds.length)}
          brand
          direction={direction}
          language={locale}
          style={styles.progress}
          tabular
          testID="demo-story-progress"
          variant="caption"
        >
          {copy.story.progressLabel(step + 1, momentIds.length)}
        </Text>
      </View>
      <View style={[styles.navigationRow, { flexDirection: logicalRowDirection(direction) }]}>
        <QuietButton
          brand
          direction={direction}
          icon={<GhafIcon direction={direction} name="arrow-back" />}
          language={locale}
          onPress={() => (step === 0 ? onClose() : onStepChange((step - 1) as DemoStoryStep))}
          fullWidth={false}
          style={styles.navigationControl}
          testID="demo-story-back"
        >
          {copy.story.back}
        </QuietButton>
        <PrimaryButton
          brand
          direction={direction}
          language={locale}
          onPress={() => (step === 5 ? onClose() : onStepChange((step + 1) as DemoStoryStep))}
          size="regular"
          fullWidth={false}
          style={styles.navigationControl}
          testID={step === 5 ? 'demo-story-finish' : 'demo-story-next'}
        >
          {step === 5 ? copy.story.finish : copy.story.next}
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  story: { gap: botanical.space.row, width: '100%', minWidth: 0 },
  topLine: { alignItems: 'center', justifyContent: 'flex-end' },
  progressGroup: { gap: botanical.space.small, alignItems: 'center' },
  progressMarks: { gap: botanical.space.small },
  progressMark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: botanical.colors.sageStrong,
  },
  progressMarkReached: { width: 24, backgroundColor: botanical.colors.forest },
  progress: { color: botanical.colors.muted, textAlign: 'center' },
  close: { flexShrink: 1, maxWidth: '100%', minHeight: layout.touchTarget },
  heading: { minWidth: 0, alignItems: 'center' },
  title: {
    color: botanical.colors.forest,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 42,
    flexShrink: 1,
  },
  artworkFrame: { width: '100%', overflow: 'hidden', borderRadius: botanical.radius.surface },
  artwork: { width: '100%', aspectRatio: 1.5 },
  readingPanel: {
    minWidth: 0,
    gap: botanical.space.small,
    paddingHorizontal: botanical.space.small,
  },
  transcript: {
    color: botanical.colors.ink,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 28,
    flexShrink: 1,
  },
  audio: { gap: botanical.space.small, alignItems: 'center' },
  audioControl: {
    minHeight: layout.touchTarget,
    minWidth: 0,
    alignSelf: 'center',
    paddingHorizontal: botanical.space.row,
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.pill,
  },
  actions: { gap: botanical.space.row },
  navigationRow: { gap: botanical.space.small, alignItems: 'stretch' },
  navigationControl: { flex: 1, minHeight: layout.touchTarget, minWidth: 0 },
  mediaNotice: { color: botanical.colors.muted, textAlign: 'center' },
});

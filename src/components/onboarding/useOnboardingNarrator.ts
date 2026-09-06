import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import type { LocaleCode } from '@/models/familyGrowth';

export type OnboardingNarrationStatus = 'idle' | 'speaking' | 'unavailable';

interface UseOnboardingNarratorOptions {
  readonly body: string;
  readonly locale: LocaleCode;
  readonly step: string;
  readonly title: string;
}

interface OnboardingNarrator {
  readonly enabled: boolean;
  readonly replay: () => void;
  readonly screenReaderActive: boolean;
  readonly status: OnboardingNarrationStatus;
  readonly toggle: () => void;
}

const speechSettings = {
  ar: { language: 'ar-AE', pitch: 1.04, rate: 0.92 },
  en: { language: 'en-AE', pitch: 1.04, rate: 1.02 },
} as const;

export function useOnboardingNarrator({
  body,
  locale,
  step,
  title,
}: UseOnboardingNarratorOptions): OnboardingNarrator {
  const [enabled, setEnabled] = useState(Platform.OS !== 'web');
  const [replayRequest, setReplayRequest] = useState(0);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState<boolean | null>(
    Platform.OS === 'web' ? false : null,
  );
  const [status, setStatus] = useState<OnboardingNarrationStatus>('idle');
  const utteranceId = useRef(0);

  useEffect(() => {
    // React Native Web always reports a screen reader. Keep web narration opt-in instead.
    if (Platform.OS === 'web') return;

    let mounted = true;
    const updateScreenReader = (active: boolean) => {
      if (mounted) setScreenReaderEnabled(active);
    };

    void AccessibilityInfo.isScreenReaderEnabled()
      .then(updateScreenReader)
      .catch(() => updateScreenReader(true));
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      updateScreenReader,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const currentUtterance = utteranceId.current + 1;
    utteranceId.current = currentUtterance;
    let active = true;
    const ownsUtterance = () => active && utteranceId.current === currentUtterance;

    if (!enabled || screenReaderEnabled !== false) {
      void Speech.stop()
        .catch(() => undefined)
        .finally(() => {
          if (ownsUtterance()) setStatus('idle');
        });
      return () => {
        active = false;
      };
    }

    const speak = async () => {
      try {
        await Speech.stop();
        if (!ownsUtterance()) return;
        const settings = speechSettings[locale];
        Speech.speak(`${title}. ${body}`, {
          ...settings,
          onDone: () => {
            if (ownsUtterance()) setStatus('idle');
          },
          onError: () => {
            if (ownsUtterance()) setStatus('unavailable');
          },
          onStart: () => {
            if (ownsUtterance()) setStatus('speaking');
          },
          onStopped: () => {
            if (ownsUtterance()) setStatus('idle');
          },
          useApplicationAudioSession: false,
        });
      } catch {
        if (ownsUtterance()) setStatus('unavailable');
      }
    };

    void speak();
    return () => {
      active = false;
      utteranceId.current += 1;
      void Speech.stop().catch(() => undefined);
    };
  }, [body, enabled, locale, replayRequest, screenReaderEnabled, step, title]);

  const toggle = useCallback(() => {
    setEnabled((current) => !current);
  }, []);
  const replay = useCallback(() => {
    setReplayRequest((current) => current + 1);
  }, []);

  return {
    enabled,
    replay,
    screenReaderActive: screenReaderEnabled === true,
    status,
    toggle,
  };
}

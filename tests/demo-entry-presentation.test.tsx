import { createRequire } from 'node:module';

import { createElement, type ComponentProps, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DemoEntryScreen } from '@/components/demo/DemoEntryScreen';
import { DemoOnboardingStory } from '@/components/demo/DemoOnboardingStory';
import type {
  DemoEntryCopy,
  DemoEntryScreenProps,
  DemoNarrationControls,
  DemoStoryStep,
} from '@/components/demo/types';
import type { DemoPrincipal } from '@/models/demoEntry';

interface LeafProps {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  label?: string;
  testID?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityLiveRegion?: string;
  accessibilityState?: { disabled?: boolean; busy?: boolean };
  accessibilityValue?: { min?: number; max?: number; now?: number; text?: string };
  role?: string;
  'aria-live'?: string;
  onPress?: () => void;
  language?: string;
  direction?: string;
}

interface IllustrationProps extends LeafProps {
  assetId: string;
  decorative?: boolean;
  fallback?: ReactNode;
  fallbackLabel?: string;
}

const rendered = vi.hoisted(() => ({
  controls: [] as LeafProps[],
  nodes: [] as LeafProps[],
  images: [] as IllustrationProps[],
  omitImages: false,
  width: 390,
  fontScale: 1,
}));

function renderLeaf(tag: 'div' | 'span' | 'button' | 'main', props: LeafProps) {
  rendered.nodes.push(props);
  if (tag === 'button') rendered.controls.push(props);
  return createElement(
    tag,
    {
      'data-testid': props.testID,
      'aria-label': props.accessibilityLabel,
      role: props.role ?? props.accessibilityRole,
      'aria-live': props['aria-live'] ?? props.accessibilityLiveRegion,
      disabled: tag === 'button' ? props.disabled : undefined,
    },
    props.header,
    props.children ?? props.label,
    props.footer,
  );
}

const narrator = vi.hoisted(() => ({
  cancel: vi.fn(),
  options: null as unknown,
}));
vi.mock('@/components/demo/useDemoOnboardingNarrator', () => ({
  useDemoOnboardingNarrator: (options: unknown) => {
    narrator.options = options;
    return {
      status: 'unavailable',
      canPlay: false,
      canStop: false,
      canReplay: false,
      screenReaderActive: false,
      onPlay: vi.fn(),
      onStop: narrator.cancel,
      onReplay: vi.fn(),
      cancel: narrator.cancel,
    };
  },
}));

vi.mock('react-native', () => ({
  AccessibilityInfo: { setAccessibilityFocus: vi.fn() },
  BackHandler: { addEventListener: vi.fn(() => ({ remove: vi.fn() })) },
  findNodeHandle: vi.fn(),
  Platform: { OS: 'web', select: (options: Record<string, unknown>) => options.default },
  StyleSheet: {
    create: <T,>(styles: T) => styles,
    absoluteFillObject: {},
    hairlineWidth: 1,
  },
  useWindowDimensions: () => ({
    width: rendered.width,
    height: 844,
    scale: 1,
    fontScale: rendered.fontScale,
  }),
  View: (props: LeafProps) => renderLeaf('div', props),
  ScrollView: (props: LeafProps) => renderLeaf('main', props),
  Text: (props: LeafProps) => renderLeaf('span', props),
  Pressable: (props: LeafProps) => renderLeaf('button', props),
}));
vi.mock('@/components/primitives', () => ({
  Text: (props: LeafProps) => renderLeaf('span', props),
  Button: (props: LeafProps) => renderLeaf('button', props),
  PrimaryButton: (props: LeafProps) => renderLeaf('button', props),
  QuietButton: (props: LeafProps) => renderLeaf('button', props),
}));
vi.mock('@/components/access/AccessShell', () => ({
  AccessScreen: (props: LeafProps) => renderLeaf('main', props),
}));
vi.mock('@/components/access/GhafIcon', () => ({
  GhafIcon: () => null,
}));
vi.mock('@/components/brand/GhafRasterLogo', () => ({
  GhafRasterLogo: () => null,
}));
vi.mock('@/components/illustrations/LocalIllustration', () => ({
  LocalIllustration: (props: IllustrationProps) => {
    rendered.images.push(props);
    if (rendered.omitImages) return props.fallback ?? null;
    return createElement('img', {
      'data-testid': props.testID,
      'data-asset': props.assetId,
      alt: props.decorative ? '' : props.accessibilityLabel,
    });
  },
}));

// Real React server rendering covers initial output and captured callback contracts only.
// Mounted state, effects, focus, layout, native Back, and audio lifecycle require separate evidence.
const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup: (element: ReactNode) => string;
};

const principals = ['parent_al_noor', 'child_salem', 'child_alya'] as const;
const momentIds = ['together', 'support', 'growth'] as const;
const momentAssets = ['onboarding-action', 'onboarding-support', 'onboarding-growth'] as const;
const locales = ['ar', 'en'] as const;

function copyFor(locale: (typeof locales)[number]): DemoEntryCopy {
  const ar = locale === 'ar';
  return {
    unavailableError: ar
      ? 'تعذّر عرض ملفات العرض التجريبي. أغلق التطبيق بالكامل ثم افتحه من جديد.'
      : 'Demo profiles could not be displayed. Fully close and reopen the app.',
    title: ar ? 'خطوة صغيرة، ننجزها معًا' : 'A small step, done together',
    body: ar ? 'اختر ملفًا لتجربة غاف.' : 'Choose a profile to try Ghaf.',
    disclosure: ar
      ? 'عرض تجريبي ببيانات افتراضية. اختر وليّ الأمر أو أحد الطفلين.'
      : 'A demo with synthetic data. Choose the Parent or one of the Children.',
    restartNotice: ar
      ? 'تبدأ تجربة جديدة عند إعادة تشغيل التطبيق.'
      : 'Restarting the app begins a fresh demo run.',
    breadthNotice: ar
      ? 'المهمة القابلة للتجربة متاحة لسالم فقط في هذا العرض.'
      : 'The executable task is available only to Salem in this demo.',
    busyLabel: ar ? 'جارٍ فتح الملف التجريبي…' : 'Opening demo profile…',
    restartRequiredTitle: ar ? 'أعد تشغيل التطبيق' : 'Restart the app',
    restartRequiredBody: ar
      ? 'أغلق التطبيق بالكامل وافتحه مجددًا. في المتصفح، أعد تحميل الصفحة.'
      : 'Fully close and reopen the app. In a browser, reload the page.',
    storyAction: ar ? 'تعرّف إلى غاف' : 'Discover Ghaf',
    languageAction: ar ? 'English' : 'العربية',
    profiles: [
      {
        principal: 'parent_al_noor',
        name: ar ? 'أسرة النور' : 'Al Noor Family',
        roleLabel: ar ? 'وليّ الأمر' : 'Parent',
        description: ar ? 'راجع المهمة وقدّم الدعم' : 'Review the task and offer support',
        avatar: 'parent',
      },
      {
        principal: 'child_salem',
        name: ar ? 'سالم' : 'Salem',
        roleLabel: ar ? 'طفل' : 'Child',
        description: ar ? 'جرّب المهمة واطلب المساعدة' : 'Try the task and ask for help',
        avatar: 'ghaf_tree',
      },
      {
        principal: 'child_alya',
        name: ar ? 'علياء' : 'Alya',
        roleLabel: ar ? 'طفل' : 'Child',
        description: ar ? 'استكشف ملف علياء التجريبي' : 'Explore Alya’s demo profile',
        avatar: 'flower',
      },
    ],
    moments: [
      {
        id: 'together',
        title: ar ? 'نختار خطوة آمنة معًا' : 'Choose a safe step together',
        body: ar
          ? 'يختار الطفل من المهام التي وافق عليها وليّ الأمر. في هذا العرض، يجرّب سالم فرز مواد نظيفة قابلة لإعادة التدوير، مع إشراف شخص بالغ.'
          : 'The Child chooses from tasks approved by the Parent. In this demo, Salem tries sorting clean recyclable materials with adult supervision.',
        imageAlt: ar ? 'خطوة آمنة مع الأسرة' : 'A safe step with the family',
        assetId: 'onboarding-action',
      },
      {
        id: 'support',
        title: ar ? 'المساعدة جزء من المهمة' : 'Help is part of the task',
        body: ar
          ? 'قبل قبول المهمة، يمكن للطفل طلب نسخة أصغر يراجعها وليّ الأمر. المساعدة المسموح بها لا تقلّل المكافأة المتفق عليها. إرشادات الذكاء الاصطناعي هنا أمثلة مُعدّة للمهمة المعتمدة وقد تخطئ؛ ويمكن للطفل سؤال وليّ الأمر عند الحاجة.'
          : 'Before accepting the task, the Child can ask the Parent to review a smaller version. Permitted help does not reduce the agreed award. The AI guidance here uses prepared examples for the approved task and may be wrong; the Child can ask the Parent when needed.',
        imageAlt: ar ? 'مساعدة في المهمة المعتمدة' : 'Support for the approved task',
        assetId: 'onboarding-support',
      },
      {
        id: 'growth',
        title: ar ? 'نقدّر الفعل، ثم تنمو الحديقة' : 'Recognize the action, then grow the garden',
        body: ar
          ? 'بعد تأكيد وليّ الأمر إكمال هذه المهمة وتقدير ما أُنجز، تُضاف البذور وتُظهر الحديقة الخاصة نموًا رمزيًا. لا يثبت ذلك زراعة أشجار أو أثرًا بيئيًا مقاسًا. هذا العرض محلي؛ تبدأ تجربة جديدة عند إعادة تشغيل التطبيق.'
          : 'After the Parent confirms completion of this task and praises the action, Seeds are added and the private garden shows symbolic growth. This does not prove trees were planted or environmental impact was measured. This demo is local; restarting the app begins a fresh run.',
        imageAlt: ar ? 'نمو رمزي في حديقة خاصة' : 'Symbolic growth in a private garden',
        assetId: 'onboarding-growth',
      },
    ],
    story: {
      close: ar ? 'تخطّي المقدمة' : 'Skip introduction',
      next: ar ? 'التالي' : 'Next',
      back: ar ? 'السابق' : 'Back',
      finish: ar ? 'دخول العرض التجريبي' : 'Enter demo',
      progressLabel: (current, total) =>
        ar ? `الخطوة ${current} من ${total}` : `Step ${current} of ${total}`,
      audioPlay: ar ? 'استمع إلى النص' : 'Listen to text',
      audioStop: ar ? 'إيقاف السرد' : 'Stop narration',
      audioReplay: ar ? 'إعادة الاستماع' : 'Replay',
      audioLoading: ar ? 'جارٍ تحميل السرد…' : 'Loading narration…',
      audioScreenReader: ar
        ? 'السرد متوقف أثناء استخدام قارئ الشاشة.'
        : 'Narration is off while a screen reader is active.',
      audioUnavailable: ar
        ? 'السرد الصوتي غير متاح. يمكنك قراءة النص والمتابعة.'
        : 'Narration is unavailable. Read the text and continue.',
    },
  };
}

function entryProps(
  locale: (typeof locales)[number],
  overrides: Partial<DemoEntryScreenProps> = {},
): DemoEntryScreenProps {
  return {
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    copy: copyFor(locale),
    runGeneration: 0,
    entryEpoch: 1,
    busy: false,
    error: null,
    restartRequired: false,
    onChooseProfile: vi.fn(),
    onChangeLocale: vi.fn(),
    ...overrides,
  };
}

function clearRender() {
  rendered.controls.length = 0;
  rendered.nodes.length = 0;
  rendered.images.length = 0;
}

function renderEntry(props: DemoEntryScreenProps) {
  clearRender();
  return renderToStaticMarkup(createElement(DemoEntryScreen, props));
}

function renderStory(props: ComponentProps<typeof DemoOnboardingStory>) {
  clearRender();
  return renderToStaticMarkup(createElement(DemoOnboardingStory, props));
}

function control(testID: string) {
  const matches = rendered.controls.filter((item) => item.testID === testID);
  expect(matches).toHaveLength(1);
  return matches[0]!;
}

function node(testID: string) {
  const matches = rendered.nodes.filter((item) => item.testID === testID);
  expect(matches).toHaveLength(1);
  return matches[0]!;
}

function profileControls() {
  return rendered.controls.filter((item) => item.testID?.startsWith('demo-profile-'));
}

function expectText(markup: string, value: string) {
  expect(markup).toContain(renderToStaticMarkup(value));
}

function press(testID: string) {
  const selected = control(testID);
  expect(selected.onPress).toEqual(expect.any(Function));
  selected.onPress!();
}

function expectAnnouncement(testID: string) {
  const announcement = node(testID);
  expect(
    announcement.accessibilityRole === 'alert' ||
      announcement.role === 'alert' ||
      ['polite', 'assertive'].includes(
        announcement.accessibilityLiveRegion ?? announcement['aria-live'] ?? '',
      ),
  ).toBe(true);
}

beforeEach(() => {
  clearRender();
  rendered.omitImages = false;
  rendered.width = 390;
  rendered.fontScale = 1;
});

describe('demo entry rendered presentation and callbacks', () => {
  it.each(locales)(
    'opens the three-page introduction on a fresh %s run with immediate profile escape',
    (locale) => {
      const props = entryProps(locale, { entryEpoch: 0 });
      const markup = renderEntry(props);
      expectText(markup, props.copy.moments[0]!.title);
      expectText(markup, props.copy.story.progressLabel(1, 3));
      expect(profileControls()).toHaveLength(0);
      expect(control('demo-story-close').onPress).toEqual(expect.any(Function));
      expect(control('demo-story-next').onPress).toEqual(expect.any(Function));
      expect(control('demo-story-back').onPress).toEqual(expect.any(Function));
      expect(props.onChooseProfile).not.toHaveBeenCalled();
    },
  );

  it.each(locales)(
    'offers exactly the three profiles and supplied %s text immediately on handoff',
    (locale) => {
      const props = entryProps(locale);
      const markup = renderEntry(props);

      expect(profileControls().map((item) => item.testID)).toEqual(
        principals.map((principal) => `demo-profile-${principal}`),
      );
      for (const value of [
        props.copy.title,
        props.copy.body,
        props.copy.disclosure,
        props.copy.restartNotice,
        props.copy.breadthNotice,
        props.copy.languageAction,
        props.copy.storyAction,
      ]) {
        expectText(markup, value);
      }
      for (const profile of props.copy.profiles) {
        for (const value of [profile.name, profile.roleLabel, profile.description]) {
          expectText(markup, value);
        }
        const choice = control(`demo-profile-${profile.principal}`);
        expect(choice.disabled).not.toBe(true);
        expect(choice.accessibilityState?.disabled).not.toBe(true);
        expect(choice.accessibilityLabel).toContain(profile.name);
        expect(choice.accessibilityLabel).toContain(profile.roleLabel);
        expect(choice.accessibilityHint).toBe(profile.description);
        expect(choice.language).toBe(locale);
        expect(choice.direction).toBe(props.direction);
      }
      expect(props.onChooseProfile).not.toHaveBeenCalled();
      expect(props.onChangeLocale).not.toHaveBeenCalled();
      expect(control('demo-story-open').onPress).toEqual(expect.any(Function));
      expect(rendered.controls.some((item) => item.testID?.startsWith('demo-story-next'))).toBe(
        false,
      );

      for (const principal of principals) press(`demo-profile-${principal}`);
      expect(props.onChooseProfile).toHaveBeenCalledTimes(3);
      principals.forEach((principal, index) => {
        expect(props.onChooseProfile).toHaveBeenNthCalledWith(index + 1, principal);
      });
      press('demo-language');
      expect(props.onChangeLocale).toHaveBeenCalledExactlyOnceWith();
    },
  );

  it('keeps canonical profile order even when the three valid choices arrive reordered', () => {
    const copy = copyFor('en');
    const [parent, salem, alya] = copy.profiles;
    const props = entryProps('en', {
      copy: { ...copy, profiles: [alya!, parent!, salem!] },
    });

    renderEntry(props);

    expect(profileControls().map((item) => item.testID)).toEqual(
      principals.map((principal) => `demo-profile-${principal}`),
    );
    for (const principal of principals) press(`demo-profile-${principal}`);
    expect(props.onChooseProfile).toHaveBeenCalledTimes(3);
    principals.forEach((principal, index) => {
      expect(props.onChooseProfile).toHaveBeenNthCalledWith(index + 1, principal);
    });
  });

  for (const locale of locales) {
    it.each(['missing', 'duplicate', 'extra_duplicate', 'unknown', 'malformed', 'sparse'] as const)(
      `denies every profile for %s profile copy and announces the supplied ${locale} error`,
      (invalidKind) => {
        const copy = copyFor(locale);
        const [parent, salem, alya] = copy.profiles;
        const sparseProfiles = [parent!, salem!];
        sparseProfiles.length = 3;
        const invalidProfiles: Record<typeof invalidKind, DemoEntryCopy['profiles']> = {
          missing: [parent!, salem!],
          duplicate: [parent!, salem!, salem!],
          extra_duplicate: [parent!, salem!, alya!, { ...salem!, name: 'Duplicate Salem' }],
          unknown: [parent!, salem!, { ...alya!, principal: 'unknown_profile' as DemoPrincipal }],
          malformed: [parent!, null, alya!] as unknown as DemoEntryCopy['profiles'],
          sparse: sparseProfiles,
        };
        const error = copy.unavailableError;
        const props = entryProps(locale, {
          copy: { ...copy, profiles: invalidProfiles[invalidKind] },
        });

        const markup = renderEntry(props);

        expect(profileControls()).toHaveLength(0);
        expectText(markup, error);
        expectAnnouncement('demo-entry-error');
        expect(props.onChooseProfile).not.toHaveBeenCalled();
      },
    );
  }

  it.each(locales)(
    'announces busy state and guards even directly invoked disabled callbacks in %s',
    (locale) => {
      const props = entryProps(locale, { busy: true });
      const markup = renderEntry(props);

      expectText(markup, props.copy.busyLabel);
      expectAnnouncement('demo-entry-busy');
      for (const principal of principals) {
        const choice = control(`demo-profile-${principal}`);
        expect(choice.disabled || choice.accessibilityState?.disabled).toBe(true);
        choice.onPress?.();
      }
      expect(props.onChooseProfile).not.toHaveBeenCalled();
      for (const testID of ['demo-language', 'demo-story-open']) {
        expect(control(testID).disabled).toBe(true);
        press(testID);
      }
      expect(props.onChangeLocale).not.toHaveBeenCalled();
    },
  );

  it.each(locales)(
    'shows and announces an entry error while allowing a profile retry in %s',
    (locale) => {
      const error =
        locale === 'ar'
          ? 'تعذّر فتح الملف التجريبي. حاول مجددًا.'
          : 'The demo profile could not open. Try again.';
      const props = entryProps(locale, { error });
      const markup = renderEntry(props);

      expectText(markup, error);
      expectAnnouncement('demo-entry-error');
      press('demo-profile-child_salem');
      expect(props.onChooseProfile).toHaveBeenCalledExactlyOnceWith('child_salem');
    },
  );

  it.each(locales)(
    'prioritizes restart instructions over busy/error/profile/story actions in %s',
    (locale) => {
      const props = entryProps(locale, {
        restartRequired: true,
        busy: true,
        error: 'Previous entry error must not replace restart instructions',
      });
      const markup = renderEntry(props);

      expectAnnouncement('demo-restart-required');
      expectText(markup, props.copy.restartRequiredTitle);
      expectText(markup, props.copy.restartRequiredBody);
      expect(profileControls()).toHaveLength(0);
      expect(rendered.controls.map((item) => item.testID)).toEqual(['demo-language']);
      expect(markup).not.toContain(props.error!);
      expect(markup).not.toContain(props.copy.busyLabel);
      expect(props.onChooseProfile).not.toHaveBeenCalled();
      press('demo-language');
      expect(props.onChangeLocale).toHaveBeenCalledExactlyOnceWith();
    },
  );
});

describe('controlled optional demo story', () => {
  for (const locale of locales) {
    it.each([0, 1, 2] as const)(
      `renders exact ${locale} step %s with manual callback requests only`,
      (step) => {
        const copy = copyFor(locale);
        const moment = copy.moments[step]!;
        const onStepChange = vi.fn();
        const onClose = vi.fn();
        const markup = renderStory({
          locale,
          direction: locale === 'ar' ? 'rtl' : 'ltr',
          copy,
          step,
          onStepChange,
          onClose,
        });

        expectText(markup, moment.title);
        expectText(markup, moment.body);
        expectText(markup, copy.story.audioUnavailable);
        expectText(markup, copy.story.close);
        expectText(markup, copy.story.back);
        expectText(markup, copy.story.progressLabel(step + 1, 3));
        for (const other of copy.moments.filter((item) => item.id !== moment.id)) {
          expect(markup).not.toContain(other.title);
          expect(markup).not.toContain(other.body);
        }
        expect(
          rendered.images.filter((item) => item.testID?.startsWith('demo-story-image-')),
        ).toEqual([
          expect.objectContaining({
            testID: `demo-story-image-${momentIds[step]}`,
            assetId: momentAssets[step],
            accessibilityLabel: moment.imageAlt,
            fallbackLabel: moment.imageAlt,
            language: locale,
            direction: locale === 'ar' ? 'rtl' : 'ltr',
          }),
        ]);
        expect(node('demo-story-progress').accessibilityLabel).toBe(
          copy.story.progressLabel(step + 1, 3),
        );
        expect(node('demo-story-audio-unavailable').children).toBe(copy.story.audioUnavailable);
        expect(onStepChange).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(rendered.controls.map((item) => item.testID).sort()).toEqual(
          [
            'demo-story-close',
            'demo-story-back',
            step === 2 ? 'demo-story-finish' : 'demo-story-next',
          ].sort(),
        );

        press('demo-story-close');
        expect(onClose).toHaveBeenCalledExactlyOnceWith();
        expect(onStepChange).not.toHaveBeenCalled();
        onClose.mockClear();
        press('demo-story-back');
        if (step === 0) {
          expect(onClose).toHaveBeenCalledExactlyOnceWith();
          expect(onStepChange).not.toHaveBeenCalled();
        } else {
          expect(onStepChange).toHaveBeenCalledExactlyOnceWith(step - 1);
          expect(onClose).not.toHaveBeenCalled();
        }
        onClose.mockClear();
        onStepChange.mockClear();
        const primaryId = step === 2 ? 'demo-story-finish' : 'demo-story-next';
        expectText(markup, step === 2 ? copy.story.finish : copy.story.next);
        press(primaryId);
        if (step === 2) {
          expect(onClose).toHaveBeenCalledExactlyOnceWith();
          expect(onStepChange).not.toHaveBeenCalled();
        } else {
          expect(onStepChange).toHaveBeenCalledExactlyOnceWith(step + 1);
          expect(onClose).not.toHaveBeenCalled();
        }
      },
    );

    it(`keeps the complete ${locale} story usable when the image leaf renders no image`, () => {
      rendered.omitImages = true;
      const copy = copyFor(locale);
      for (const step of [0, 1, 2] satisfies DemoStoryStep[]) {
        const onStepChange = vi.fn();
        const onClose = vi.fn();
        const markup = renderStory({
          locale,
          direction: locale === 'ar' ? 'rtl' : 'ltr',
          copy,
          step,
          onStepChange,
          onClose,
        });

        expect(markup).not.toContain('<img');
        expectText(markup, copy.moments[step]!.body);
        expectText(markup, copy.story.audioUnavailable);
        expect(control('demo-story-close').disabled).not.toBe(true);
        press(step === 2 ? 'demo-story-finish' : 'demo-story-next');
        if (step === 2) expect(onClose).toHaveBeenCalledExactlyOnceWith();
        else expect(onStepChange).toHaveBeenCalledExactlyOnceWith(step + 1);
      }
    });
  }
});

// Captured callbacks and SSR output only; native/media hook lifecycle is covered separately.
describe('optional demo narration controls and cancellation handoff', () => {
  function narration(overrides: Partial<DemoNarrationControls> = {}): DemoNarrationControls {
    return {
      status: 'silent',
      canPlay: true,
      canStop: false,
      canReplay: false,
      screenReaderActive: false,
      onPlay: vi.fn(),
      onStop: vi.fn(),
      onReplay: vi.fn(),
      ...overrides,
    };
  }
  function story(audio: DemoNarrationControls, locale: 'ar' | 'en' = 'ar') {
    const copy = copyFor(locale);
    const onClose = vi.fn();
    const onStepChange = vi.fn();
    const markup = renderStory({
      locale,
      direction: locale === 'ar' ? 'rtl' : 'ltr',
      copy,
      step: 1,
      narration: audio,
      onClose,
      onStepChange,
    });
    expectText(markup, copy.moments[1]!.body);
    expect(control('demo-story-next').disabled).not.toBe(true);
    expect(control('demo-story-back').disabled).not.toBe(true);
    expect(control('demo-story-close').disabled).not.toBe(true);
    return { markup, copy, onClose, onStepChange };
  }

  it('plays only on explicit control press and keeps the complete transcript', () => {
    const audio = narration();
    const { markup, copy } = story(audio);
    expectText(markup, copy.story.audioPlay);
    expect(audio.onPlay).not.toHaveBeenCalled();
    press('demo-story-audio-play');
    expect(audio.onPlay).toHaveBeenCalledExactlyOnceWith();
  });

  it('offers immediate Stop during loading and never delays navigation', () => {
    const audio = narration({ status: 'loading', canPlay: false, canStop: true });
    const { markup, copy, onStepChange } = story(audio);
    expectText(markup, copy.story.audioLoading);
    expectAnnouncement('demo-story-audio-loading');
    expect(control('demo-story-audio-stop').disabled).not.toBe(true);
    press('demo-story-audio-stop');
    expect(audio.onStop).toHaveBeenCalledExactlyOnceWith();
    press('demo-story-next');
    expect(onStepChange).toHaveBeenCalledExactlyOnceWith(2);
  });

  it('offers Stop and Replay during playback, and a single Replay afterward', () => {
    const audio = narration({ status: 'playing', canPlay: false, canStop: true, canReplay: true });
    story(audio);
    press('demo-story-audio-stop');
    press('demo-story-audio-replay');
    expect(audio.onStop).toHaveBeenCalledOnce();
    expect(audio.onReplay).toHaveBeenCalledOnce();
    story(narration({ canReplay: true }));
    expect(
      rendered.controls
        .filter((item) => item.testID?.startsWith('demo-story-audio-'))
        .map((item) => item.testID),
    ).toEqual(['demo-story-audio-replay']);
  });

  it.each(['en', 'unavailable', 'screen_reader'] as const)(
    'keeps %s fully readable without enabled playback',
    (reason) => {
      const audio = narration({
        status: reason === 'unavailable' ? 'unavailable' : 'silent',
        screenReaderActive: reason === 'screen_reader',
      });
      const { markup, copy } = story(audio, reason === 'en' ? 'en' : 'ar');
      expectText(
        markup,
        reason === 'screen_reader' ? copy.story.audioScreenReader : copy.story.audioUnavailable,
      );
      expect(rendered.controls.some((item) => item.testID?.startsWith('demo-story-audio-'))).toBe(
        false,
      );
      expect(audio.onPlay).not.toHaveBeenCalled();
    },
  );

  it('passes authoritative identity and cancels before profile/locale callbacks', () => {
    const order: string[] = [];
    narrator.cancel.mockImplementation(() => order.push('cancel'));
    const props = entryProps('ar', {
      runGeneration: 7,
      entryEpoch: 9,
      onChooseProfile: () => {
        order.push('profile');
      },
      onChangeLocale: () => {
        order.push('locale');
      },
    });
    renderEntry(props);
    expect(narrator.options).toEqual({
      locale: 'ar',
      step: null,
      active: false,
      runGeneration: 7,
      entryEpoch: 9,
    });
    press('demo-profile-child_salem');
    press('demo-language');
    expect(order).toEqual(['cancel', 'profile', 'cancel', 'locale']);
    narrator.cancel.mockReset();
  });
});

// These rows cover conditional presentation and image fallback, not actual font geometry.
describe('botanical demo entry retains direct access across presentation fallbacks', () => {
  for (const locale of locales) {
    it.each([
      { width: 320, fontScale: 1 },
      { width: 390, fontScale: 2 },
    ])(`keeps all three ${locale} choices and labels at %j with failed artwork`, (dimensions) => {
      rendered.width = dimensions.width;
      rendered.fontScale = dimensions.fontScale;
      rendered.omitImages = true;
      const props = entryProps(locale);
      const markup = renderEntry(props);
      expect(profileControls().map((item) => item.testID)).toEqual(
        principals.map((principal) => `demo-profile-${principal}`),
      );
      for (const profile of props.copy.profiles) {
        expectText(markup, profile.name);
        expectText(markup, profile.description);
        const choice = control(`demo-profile-${profile.principal}`);
        expect(choice.accessibilityLabel).toContain(profile.name);
        expect(choice.disabled).not.toBe(true);
        press(`demo-profile-${profile.principal}`);
      }
      expect(props.onChooseProfile).toHaveBeenCalledTimes(3);
      expectText(markup, props.copy.disclosure);
      expectText(markup, props.copy.breadthNotice);
      expect(control('demo-story-open').disabled).not.toBe(true);
    });
  }
});

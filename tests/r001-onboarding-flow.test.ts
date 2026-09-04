import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resources } from '../src/i18n/resources';

const PRESERVED_REMOTE_ROUTES = [
  '/',
  '/role',
  '/parent',
  '/parent/task/new',
  '/parent/task/review',
  '/child',
  '/child/task',
  '/parent/check-in',
  '/garden',
  '/circle',
] as const;

const R001_ACCESS_ROUTES = [
  '/access/parent/sign-in',
  '/access/parent/verification',
  '/access/parent/family-basics',
  '/access/parent/add-first-child',
  '/access/parent/review-create',
  '/access/parent/family-created-success',
] as const;

function listTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(directory, entry.name);
    if (entry.isDirectory()) return listTsxFiles(child);
    return entry.isFile() && entry.name.endsWith('.tsx') ? [child] : [];
  });
}

function authoredRoutes(): string[] {
  const appRoot = resolve(import.meta.dirname, '../app');
  return listTsxFiles(appRoot)
    .map((file) => relative(appRoot, file).split(sep).join('/'))
    .filter((file) => !file.endsWith('_layout.tsx') && file !== '+html.tsx')
    .map((file) => {
      const withoutExtension = file.replace(/\.tsx$/u, '');
      const withoutIndex = withoutExtension.replace(/(?:^|\/)index$/u, '');
      return withoutIndex ? `/${withoutIndex}` : '/';
    })
    .sort();
}

function flattenStrings(value: unknown, key = ''): Map<string, string> {
  const output = new Map<string, string>();
  if (typeof value === 'string') {
    output.set(key, value);
    return output;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return output;
  for (const [childKey, child] of Object.entries(value)) {
    for (const [path, text] of flattenStrings(child, key ? `${key}.${childKey}` : childKey)) {
      output.set(path, text);
    }
  }
  return output;
}

describe('approved R001 Parent onboarding integration', () => {
  it('preserves the remote ten routes and adds exactly the six approved access routes', () => {
    expect(authoredRoutes()).toEqual([...PRESERVED_REMOTE_ROUTES, ...R001_ACCESS_ROUTES].sort());
  });

  it('keeps complete, non-empty Arabic and English access resources in parity', () => {
    const ar = flattenStrings(
      (resources.ar.translation as unknown as Record<string, unknown>).access,
    );
    const en = flattenStrings(
      (resources.en.translation as unknown as Record<string, unknown>).access,
    );

    expect(ar.size).toBeGreaterThan(50);
    expect([...ar.keys()].sort()).toEqual([...en.keys()].sort());
    for (const key of ar.keys()) {
      expect(ar.get(key)?.trim(), `Arabic access resource ${key}`).not.toBe('');
      expect(en.get(key)?.trim(), `English access resource ${key}`).not.toBe('');
    }
    expect(ar.get('verification.invalidCode')).toContain('424242');
    expect(en.get('verification.invalidCode')).toContain('424242');
    expect(ar.get('welcome.childUnavailable')).toContain('الطفل');
    expect(en.get('welcome.childUnavailable')).toMatch(/Child access/i);
    expect(ar.get('success.origin')).toContain('اصطناعي');
    expect(en.get('success.origin')).toMatch(/synthetic/i);
  });

  it('uses native routes and a transparent modal without importing Stitch runtime code', () => {
    const routeSources = R001_ACCESS_ROUTES.map((route) =>
      readFileSync(resolve(import.meta.dirname, `../app${route}.tsx`), 'utf8'),
    ).join('\n');
    const rootLayout = readFileSync(new URL('../app/_layout.tsx', import.meta.url), 'utf8');

    expect(routeSources).toContain("from 'react-native'");
    expect(routeSources).not.toMatch(/code\.html|screen\.png|source\.html|react-native-web/u);
    expect(routeSources).not.toMatch(/<(?:div|button|input|form|section|main)\b|className=/u);
    expect(rootLayout).toContain('name="access/parent/family-created-success"');
    expect(rootLayout).toContain("presentation: 'transparentModal'");
    expect(rootLayout).toContain("pathname.startsWith('/access/parent/')");
    expect(rootLayout).not.toContain("pathname.startsWith('/child')");
  });

  it('wires every approved interaction to the bounded onboarding authority', () => {
    const routeSource = (route: (typeof R001_ACCESS_ROUTES)[number]) =>
      readFileSync(resolve(import.meta.dirname, `../app${route}.tsx`), 'utf8');

    expect(routeSource('/access/parent/sign-in')).toContain('requestParentVerification');

    const verification = routeSource('/access/parent/verification');
    expect(verification).toContain('verifyParentCode');
    expect(verification).toContain('resendParentVerification');
    expect(verification).toContain('cancelParentVerification');

    const familyBasics = routeSource('/access/parent/family-basics');
    expect(familyBasics).toContain('updateParentOnboardingDraft');
    expect(familyBasics).toContain("router.replace('/access/parent/add-first-child')");

    const addChild = routeSource('/access/parent/add-first-child');
    expect(addChild).toContain('updateParentOnboardingDraft');
    expect(addChild).toContain("router.replace('/access/parent/review-create')");
    expect(routeSource('/access/parent/review-create')).toContain('completeParentOnboarding');

    const success = routeSource('/access/parent/family-created-success');
    expect(success).toContain('authorizeParentExperience');
    expect(success).toContain('router.dismissAll()');
    expect(success).toContain("router.replace('/parent')");
  });

  it('keeps entry truthful and protects transactional navigation from stale or repeated actions', () => {
    const welcome = readFileSync(new URL('../app/index.tsx', import.meta.url), 'utf8');
    const routeSource = (route: (typeof R001_ACCESS_ROUTES)[number]) =>
      readFileSync(resolve(import.meta.dirname, `../app${route}.tsx`), 'utf8');

    expect(welcome).not.toContain('setRole');
    expect(welcome).not.toContain('switchRole');
    expect(welcome).toContain("parentOnboarding.status === 'authenticated_parent'");
    expect(welcome).toContain('<Redirect href="/parent" />');

    for (const route of R001_ACCESS_ROUTES) {
      const contents = routeSource(route);
      expect(contents, route).not.toContain('error.message');
      expect(contents, route).toMatch(/parentOnboarding\.status/u);
    }

    const review = routeSource('/access/parent/review-create');
    expect(review).toContain('useRef');
    expect(review).toMatch(/\.current/u);

    const success = routeSource('/access/parent/family-created-success');
    expect(success).toContain("router.dismissTo('/access/parent/review-create')");
    expect(success).toContain('router.dismissAll()');
    expect(success).toContain("router.replace('/parent')");
    expect(success).toContain('authorizeParentExperience');
  });

  it('preserves the approved default composition while keeping actions functional', () => {
    const welcome = readFileSync(new URL('../app/index.tsx', import.meta.url), 'utf8');
    const routeSource = (route: (typeof R001_ACCESS_ROUTES)[number]) =>
      readFileSync(resolve(import.meta.dirname, `../app${route}.tsx`), 'utf8');
    const languageAction = welcome.slice(
      welcome.indexOf('<Button'),
      welcome.indexOf('</Button>') + '</Button>'.length,
    );

    expect(languageAction).toContain('direction="ltr"');
    expect(welcome).toContain('maxWidth: layout.readableContentWidth + layout.screenPadding * 2');

    const signIn = routeSource('/access/parent/sign-in');
    expect(signIn).not.toContain('disabled={identifier.trim().length === 0}');
    expect(signIn).toContain('variant="neutral"');

    const verification = routeSource('/access/parent/verification');
    expect(verification).toContain('iconPosition="end"');

    const review = routeSource('/access/parent/review-create');
    expect(review).not.toContain('footer={');
    expect(review).toContain('usePathname');
    expect(review).toContain('accessibilityHidden={successOpen}');
    expect(review).toContain('disabled={busy || successOpen}');
    expect(review).toContain('style={styles.reviewAvatar}');
    expect(review.indexOf('testID="create-family-button"')).toBeGreaterThan(
      review.indexOf('<View style={styles.privacyList}>'),
    );

    expect(routeSource('/access/parent/family-basics')).toContain('icon="lock"');

    const success = routeSource('/access/parent/family-created-success');
    expect(success).not.toContain('<PrototypePill');
    expect(success).toContain('testID="success-authorization-loading"');
    expect(success).toContain('<SafeAreaView');
  });

  it('hands every completed onboarding entry and exit to Parent without reopening Review', () => {
    const routeSource = (route: (typeof R001_ACCESS_ROUTES)[number]) =>
      readFileSync(resolve(import.meta.dirname, `../app${route}.tsx`), 'utf8');

    for (const route of [
      '/access/parent/sign-in',
      '/access/parent/verification',
      '/access/parent/family-basics',
      '/access/parent/add-first-child',
    ] as const) {
      const contents = routeSource(route);
      expect(contents, route).toMatch(/(?:href=|replace\()["']\/parent["']/u);
      expect(contents, route).not.toContain(
        "authenticated_parent') {\n      router.replace('/access/parent/family-created-success",
      );
    }

    const review = routeSource('/access/parent/review-create');
    expect(review).toMatch(
      /parentOnboarding\.status === 'authenticated_parent'\s*&&\s*!successOpen/u,
    );
    expect(review).toContain("router.replace('/parent')");
    expect(review).not.toContain(
      "if (parentOnboarding.status === 'authenticated_parent') {\n      router.push('/access/parent/family-created-success')",
    );

    const rootLayout = readFileSync(new URL('../app/_layout.tsx', import.meta.url), 'utf8');
    expect(rootLayout).toContain('gestureEnabled: false');
  });

  it('locks controls during setup transitions and announces every status change', () => {
    const familyBasics = readFileSync(
      new URL('../app/access/parent/family-basics.tsx', import.meta.url),
      'utf8',
    );
    const addChild = readFileSync(
      new URL('../app/access/parent/add-first-child.tsx', import.meta.url),
      'utf8',
    );
    const controls = readFileSync(
      new URL('../src/components/access/AccessControls.tsx', import.meta.url),
      'utf8',
    );

    expect(familyBasics).toContain('editable={!busy}');
    expect(addChild).toContain('editable={!busy}');
    expect(controls).toContain('accessibilityLiveRegion="polite"');
    expect(controls).not.toContain(
      "accessibilityLiveRegion={tone === 'error' || tone === 'offline' ? 'polite' : undefined}",
    );
  });

  it('guards the preserved Parent route through capability-backed onboarding authority', () => {
    const parentLayout = readFileSync(
      new URL('../app/parent/_layout.tsx', import.meta.url),
      'utf8',
    );
    const roleRoute = readFileSync(new URL('../app/role.tsx', import.meta.url), 'utf8');

    expect(parentLayout).toContain('selectCanEnterParentExperience');
    expect(parentLayout).toContain('authorizeParentExperience');
    expect(parentLayout).toContain('<Redirect');
    expect(parentLayout).toContain('href="/access/parent/sign-in"');
    expect(parentLayout).not.toMatch(/state\.role\s*===\s*['"]parent['"]/u);

    expect(roleRoute).toContain('selectCanEnterParentExperience');
    expect(roleRoute).toContain('authorizeParentExperience');
    expect(roleRoute).toContain("router.replace('/access/parent/sign-in')");
  });

  it('maps Android hardware Back to the same safe transitions as the visible setup controls', () => {
    const routeSource = (route: (typeof R001_ACCESS_ROUTES)[number]) =>
      readFileSync(resolve(import.meta.dirname, `../app${route}.tsx`), 'utf8');

    for (const route of [
      '/access/parent/sign-in',
      '/access/parent/family-basics',
      '/access/parent/add-first-child',
      '/access/parent/review-create',
    ] as const) {
      const contents = routeSource(route);
      expect(contents, route).toContain("BackHandler.addEventListener('hardwareBackPress'");
      expect(contents, route).toContain("Platform.OS !== 'android'");
    }

    expect(routeSource('/access/parent/sign-in')).toContain("router.replace('/')");
    expect(routeSource('/access/parent/add-first-child')).toContain('aria-checked={selected}');
  });
});

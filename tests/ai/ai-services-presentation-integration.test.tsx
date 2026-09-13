import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { resources } from '../../src/i18n/resources';

function source(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
}

describe('AI Services 1–3 presentation integration', () => {
  it('uses one reusable identity and origin pattern across the prepared AI surfaces', () => {
    const identity = source('src/components/AssistantIdentity.tsx');
    const profile = source('src/components/access/AIProfilePreview.tsx');
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');
    const childTask = source('app/child/task.tsx');
    const summary = source('src/components/family-growth/ParentPatternSummary.tsx');

    expect(identity).toContain('export function AssistantIdentity');
    expect(identity).toContain('accessibilityLabel');
    expect(identity).toContain('assistant-origin-');
    for (const consumer of [profile, composer, childTask, summary]) {
      expect(consumer).toContain('<AssistantIdentity');
    }
  });

  it('separates profile support style from recommended starting categories', () => {
    const profile = source('src/components/access/AIProfilePreview.tsx');

    expect(profile).toContain('profile-support-style');
    expect(profile).toContain('profile-starting-categories');
    expect(profile).toContain('aiSupportStyleLabel');
    expect(profile).toContain('aiStartingPointsLabel');
    expect(profile).not.toContain("t('access.setup.aiPreviewBody'");
  });

  it('keeps one screen title and exposes recommendation and Guide context before actions', () => {
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');

    expect(composer.match(/variant="screenTitle"/gu)).toHaveLength(1);
    expect(composer).toContain('profile-recommendation-panel');
    expect(composer).toContain('parent-guide-origin');
    expect(composer).toContain('guide-actions-heading');
    expect(composer.indexOf('parent-guide-origin')).toBeLessThan(
      composer.indexOf('guide-actions-heading'),
    );
  });

  it('presents prepared Child help as one bounded action then one result', () => {
    const childTask = source('app/child/task.tsx');

    expect(childTask).toContain('prepared-child-coach');
    expect(childTask).toContain('coach-actions-heading');
    expect(childTask).toContain('brand\n                          busy={busyIntent === intent}');
    expect(childTask).toContain('trusted-adult-exit');
    expect(childTask).toMatch(/setShowSupportTools\(true\);\s+void askCoach\('need_adult'\)/u);
    expect(childTask.indexOf('trusted-adult-exit')).toBeLessThan(
      childTask.indexOf('prepared-child-coach'),
    );
  });

  it('puts the Parent summary question before uncertainty and correction controls', () => {
    const summary = source('src/components/family-growth/ParentPatternSummary.tsx');

    expect(summary).toContain('parent-summary-question');
    expect(summary.indexOf("t('parentHome.question')")).toBeLessThan(
      summary.indexOf("t('parentHome.uncertainty')"),
    );
    expect(summary.indexOf("t('parentHome.question')")).toBeLessThan(
      summary.indexOf("t('parentHome.correctSummary')"),
    );
  });

  it('shows one clear Parent AI notice without repeating generic warnings across Parent surfaces', () => {
    const profile = source('src/components/access/AIProfilePreview.tsx');
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');
    const summary = source('src/components/family-growth/ParentPatternSummary.tsx');
    const checkIn = source('src/components/family-growth/ParentCheckIn.tsx');
    const permissions = source('app/parent/settings/permissions.tsx');
    const parentSources = [profile, composer, summary, checkIn, permissions].join('\n');

    expect(parentSources.match(/t\('parentHome\.aiDisclosure'\)/gu)).toHaveLength(1);
    expect(summary).toContain('testID="parent-ai-disclosure"');
    expect(summary).toMatch(
      /color=\{branded \? 'onSurfaceVariant' : 'inkMuted'\}[\s\S]+variant="caption"[\s\S]+t\('parentHome\.aiDisclosure'\)/u,
    );
    expect(composer).not.toContain('guideDisclosure');
    expect(summary).not.toContain('current.meta.disclosure.text');
    expect(checkIn).not.toContain("t('parentHome.summaryDisclosure')");

    expect(resources.ar.translation.parentHome.aiDisclosure).toBe(
      'قد تكون ملخصات واقتراحات الذكاء الاصطناعي غير صحيحة، وهي لا تشخّص الطفل ولا تفسّر دوافعه. يراجع وليّ الأمر كل نتيجة ويتخذ القرار.',
    );
    expect(resources.en.translation.parentHome.aiDisclosure).toBe(
      'AI summaries and suggestions may be wrong. They do not diagnose the Child or explain motives; the Parent reviews each result and decides.',
    );

    const repeatedParentCopy = [
      resources.ar.translation.access.setup.aiDisclosure,
      resources.ar.translation.taskNew.profileRecommendationDisclosure,
      resources.ar.translation.taskNew.liveDraftDisclosure,
      resources.ar.translation.r003.permissions.liveAiRisk,
      resources.en.translation.access.setup.aiDisclosure,
      resources.en.translation.taskNew.profileRecommendationDisclosure,
      resources.en.translation.taskNew.liveDraftDisclosure,
      resources.en.translation.r003.permissions.liveAiRisk,
    ].join('\n');
    expect(repeatedParentCopy).not.toMatch(
      /(?:قد يخطئ|قد يكون غير صحيح|قد تكون غير صحيحة|may be wrong|can be wrong|does not diagnose|لا تشخّص)/iu,
    );
  });

  it('keeps every new presentation label equivalent in Arabic and English', () => {
    const resources = source('src/i18n/resources.ts');

    for (const key of [
      'aiSupportStyleLabel',
      'aiStartingPointsLabel',
      'profileRecommendationTitle',
      'guidePurpose',
      'guideActionsTitle',
      'liveLoading',
      'coachPreparedPurpose',
      'coachActionsTitle',
      'summaryPreparedWindow',
      'summaryQuestionLead',
    ]) {
      expect(resources.match(new RegExp(`${key}:`, 'gu'))).toHaveLength(2);
    }
  });
});

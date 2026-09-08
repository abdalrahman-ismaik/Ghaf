import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
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

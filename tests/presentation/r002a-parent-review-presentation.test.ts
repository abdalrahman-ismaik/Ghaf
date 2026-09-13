import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { resources } from '../../src/i18n/resources';

const root = fileURLToPath(new URL('../../', import.meta.url));

function source(relativePath: string) {
  const absolutePath = `${root}${relativePath}`;
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

const reviewPresentationFiles = [
  'src/components/r002a/parent/ParentApprovalSuccessSheet.tsx',
  'src/components/r002a/parent/ParentReviewTaskCard.tsx',
  'src/components/r002a/parent/ParentSupportRequestSheet.tsx',
] as const;

describe('R002a Parent review presentation', () => {
  it('uses native R002a components on the existing guarded check-in route', () => {
    const route = source('app/parent/check-in.tsx');
    const review = source('src/components/family-growth/ParentCheckIn.tsx');

    for (const relativePath of reviewPresentationFiles) {
      expect(existsSync(`${root}${relativePath}`), relativePath).toBe(true);
      const contents = source(relativePath);
      expect(contents, relativePath).not.toMatch(
        /(?:<div|className=|WebView|\.html["']|\.png["'])/u,
      );
      expect(contents, relativePath).not.toMatch(/https?:\/\//u);
    }

    expect(route).toContain("router.replace('/parent')");
    expect(route).toContain("role !== 'parent'");
    expect(route).toContain('resolveCheckInState');
    expect(review).toContain('<R002aScreen');
    expect(review).toContain('<R002aFlowHeader');
    expect(review).toContain('testID="parent-check-in-screen"');
  });

  it('keeps approval praise-first and delegates every state change to existing actions', () => {
    const review = source('src/components/family-growth/ParentCheckIn.tsx');
    const arabic = resources.ar.translation.r002aReview;
    const english = resources.en.translation.r002aReview;

    expect(review).toContain('confirmAndPresentPraise(');
    expect(review).toContain('markPraisePresented(');
    expect(review).toContain('applyRecognition(');
    expect(review).toContain('requestKindRetry(');
    expect(review).toContain('resumeRetry()');
    expect(review).toContain('testID="plan-confirmation-button"');
    expect(review).toContain('testID="present-praise-button"');
    expect(review).toContain('testID="apply-recognition-button"');
    expect(review).toContain('testID="kind-retry-button"');
    expect(review).not.toMatch(/(?:earnedSeeds|cumulativeSeeds|contributionLeaves)\s*[+\-=]/u);
    expect(arabic.approvalActionWithSeeds).not.toContain('إضافة');
    expect(english.approvalActionWithSeeds).not.toMatch(/add.+Seeds/iu);
    expect(english.approvalActionWithSeeds).toContain('then {{count}} Seeds');
  });

  it('represents support request default, selected, and sent states without new domain state', () => {
    const review = source('src/components/family-growth/ParentCheckIn.tsx');
    const sheet = source('src/components/r002a/parent/ParentSupportRequestSheet.tsx');

    expect(sheet).toContain('<Modal');
    expect(sheet).toContain('accessibilityViewIsModal');
    expect(sheet).toContain('useReducedMotion');
    expect(sheet).toContain('selectedStepIds');
    expect(sheet).toContain('accessibilityRole="checkbox"');
    expect(sheet).toContain('accessibilityState={{ checked: selected }}');
    expect(sheet).toContain('support-request-sheet');
    expect(review).toContain("journey.lifecycle === 'retry'");
    expect(review).toContain('kind-retry-state');
    expect(review).toContain("bilingualResource('checkIn.retryObservation')");
    expect(review).toContain('requestAnimationFrame(() =>');
    expect(review).toContain('supportSentRef');
  });

  it('shows only persisted completion evidence and keeps support topics task-version aware', () => {
    const review = source('src/components/family-growth/ParentCheckIn.tsx');

    expect(review).toContain("t('r002aReview.definitionAcknowledged'");
    expect(review).toContain('content.positiveAction');
    expect(review).toContain('content.safety.stopAndAskAdult');
    expect(review).not.toContain("t('childTask.stepOne')");
    expect(review).not.toContain("t('childTask.stepThree')");
    expect(review).not.toContain('requestedSupportStepIds');
  });

  it('renders live receipt consequences in one accessible success sheet', () => {
    const review = source('src/components/family-growth/ParentCheckIn.tsx');
    const success = source('src/components/r002a/parent/ParentApprovalSuccessSheet.tsx');
    const combined = `${review}\n${success}`;

    expect(success).toContain('<Modal');
    expect(success).toContain('<SuccessSheet');
    expect(success).toContain('receipt.seedTransaction');
    expect(success).toContain('receipt.landscapeGrowth');
    expect(success).toContain('receipt.landscapeGrowth.seedsBefore');
    expect(success).toContain('receipt.landscapeGrowth.seedsAfter');
    expect(success).toContain('receipt.canopyContribution');
    expect(success).toContain('receipt.circleEvent');
    expect(combined).toContain('recognitionLedger');
    expect(combined).not.toMatch(/\b(?:108|120|180)\b/u);
    expect(combined).not.toContain('task.recycling_sort.v1');
  });

  it('presents a fresh success once and keeps recognized route re-entry neutral', () => {
    const review = source('src/components/family-growth/ParentCheckIn.tsx');

    expect(review).toContain('const [showFreshSuccess, setShowFreshSuccess] = useState(false)');
    expect(review).toContain("setShowFreshSuccess(result.data.disposition === 'applied')");
    expect(review).toContain('const isReentry =');
    expect(review).toContain('receipt && !isReentry');
    expect(review).toContain("isReentry ? 'r002aReview.duplicateTitle'");
    expect(review).toContain('{isReentry ? phaseReviewControl : null}');
  });

  it('centralizes equivalent Arabic and English review copy without placeholders', () => {
    const arabic = resources.ar.translation.r002aReview;
    const english = resources.en.translation.r002aReview;
    const review = source('src/components/family-growth/ParentCheckIn.tsx');

    expect(Object.keys(arabic).sort()).toEqual(Object.keys(english).sort());
    expect(JSON.stringify(arabic)).not.toContain('EN:S');
    expect(JSON.stringify(english)).not.toContain('EN:S');
    expect(JSON.stringify(arabic)).not.toContain('سالم');
    expect(JSON.stringify(english)).not.toContain('Salem');
    expect(review).toContain("t('r002aReview.returnToTasks', { child: childName })");
    expect(review).not.toContain("t('parentHome.aiDisclosure')");
    expect(review).not.toContain("t('parentHome.summaryDisclosure')");
    expect(arabic.pendingTitle.trim()).not.toBe('');
    expect(english.pendingTitle.trim()).not.toBe('');
  });

  it('uses minimum touch targets and keeps physical direction explicit', () => {
    const taskCard = source('src/components/r002a/parent/ParentReviewTaskCard.tsx');
    const support = source('src/components/r002a/parent/ParentSupportRequestSheet.tsx');
    const combined = `${taskCard}\n${support}`;

    expect(combined).toContain('logicalRowDirection(direction)');
    expect(support).toContain('minHeight: layout.touchTarget');
    expect(support).toContain('onRequestClose');
    expect(support).toContain('findNodeHandle');
    expect(support).toContain('AccessibilityInfo.setAccessibilityFocus');
  });
});

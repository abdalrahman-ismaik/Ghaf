import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
}

describe('F4 Parent task drafting UI contract', () => {
  it('keeps the new surface behind only the Parent drafting flag', () => {
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');

    expect(composer).toContain('aiFeatureFlags.ai_parent_task_drafting_live');
    expect(composer).not.toMatch(
      /ai_child_coach_(?:text|voice)_live\s*(?:&&|\|\|).*parent-task-drafting/iu,
    );
    expect(composer).toContain('requestParentTaskDraft');
  });

  it('shows retained and suggested bilingual copy, truthful origin, and three explicit decisions', () => {
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');

    for (const marker of [
      'parent-task-drafting-controls',
      'parent-task-drafting-diff',
      'parent-task-drafting-retained',
      'parent-task-drafting-suggested',
      'parent-task-drafting-origin',
      'accept-parent-task-draft',
      'keep-parent-task-draft',
      'edit-parent-task-draft',
    ]) {
      expect(composer).toContain(marker);
    }
    expect(composer).toContain('accessibilityLiveRegion="polite"');
    expect(composer).toContain('logicalRowDirection(direction)');
  });

  it('keeps all new user-facing copy in equivalent Arabic and English resources', () => {
    const resources = source('src/i18n/resources.ts');

    for (const key of [
      'liveDraftTitle',
      'liveDraftDisclosure',
      'liveDraftRequest',
      'liveDraftRetained',
      'liveDraftSuggested',
      'liveDraftAccept',
      'liveDraftKeep',
      'liveDraftEdit',
      'liveDraftPreparedOrigin',
      'liveDraftLiveOrigin',
      'liveDraftFallback',
    ]) {
      expect(resources.match(new RegExp(`${key}:`, 'gu'))).toHaveLength(2);
    }
  });
});

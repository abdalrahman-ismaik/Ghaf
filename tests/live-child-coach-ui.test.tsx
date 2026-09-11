import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

describe('bounded live Child Coach UI contract', () => {
  it('keeps text help behind only its independent default-off flag', () => {
    const task = source('app/child/task.tsx');

    expect(task).toContain('aiFeatureFlags.ai_child_coach_text_live');
    expect(task).toContain('<LiveChildCoachPanel');
    expect(task).not.toMatch(/ai_child_coach_voice_live\s*(?:&&|\|\|).*<LiveChildCoachPanel/isu);
  });

  it('offers age-banded controls and no unrestricted conversation affordance', () => {
    const panel = source('src/components/family-growth/LiveChildCoachPanel.tsx');

    for (const marker of [
      "'6_8'",
      "'9_11'",
      "'12_14'",
      'live-child-coach-notice',
      'decline-live-child-coach',
      'live-child-coach-result',
      'liveCoachTerminal',
      'need_adult',
      'logicalRowDirection(direction)',
      'accessibilityLiveRegion="polite"',
    ]) {
      expect(panel).toContain(marker);
    }
    expect(panel).not.toMatch(/continue chat|conversation history|message thread/iu);
  });

  it('keeps notices, origins, denial, adult exit, and terminal copy bilingual', () => {
    const resources = source('src/i18n/resources.ts');

    for (const key of [
      'liveCoachTitle',
      'liveCoachNotice',
      'liveCoachAiDisclosure',
      'liveCoachDecline',
      'liveCoachDeclined',
      'liveCoachGrantRequired',
      'liveCoachPreparedOrigin',
      'liveCoachLiveOrigin',
      'liveCoachFallback',
      'liveCoachAdultExit',
      'liveCoachTerminal',
    ]) {
      expect(resources.match(new RegExp(`${key}:`, 'gu'))).toHaveLength(2);
    }
  });
});

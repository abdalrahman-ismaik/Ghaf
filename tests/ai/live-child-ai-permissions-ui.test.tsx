import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
}

describe('Feature 004 Child AI permission presentation', () => {
  it('presents separate text and voice actions behind independent flags', () => {
    const permissions = source('app/parent/settings/permissions.tsx');

    expect(permissions).toContain('aiFeatureFlags.ai_child_coach_text_live');
    expect(permissions).toContain('aiFeatureFlags.ai_child_coach_voice_live');
    expect(permissions).toContain('change-live-child-ai-text');
    expect(permissions).toContain('change-live-child-ai-voice');
    expect(permissions).toContain('syntheticImplementationOnly');
  });

  it('routes both sensitive changes through Parent reauthentication', () => {
    const reauthentication = source('app/parent/reauthenticate.tsx');

    expect(reauthentication).toContain("'live_child_text'");
    expect(reauthentication).toContain("'live_child_voice'");
    expect(reauthentication).toContain('updateLiveChildAiGrant');
  });

  it('keeps purpose, risk, provider, revoke, and deletion copy equivalent', () => {
    const resources = source('src/i18n/resources.ts');

    for (const key of [
      'liveAiTitle',
      'liveAiPurpose',
      'liveAiRisk',
      'liveAiProviderBlocked',
      'liveAiText',
      'liveAiVoice',
      'liveAiVoiceIneligible',
      'liveAiRevoke',
      'liveAiDeletion',
      'syntheticImplementationOnly',
    ]) {
      expect(resources.match(new RegExp(`${key}:`, 'gu'))).toHaveLength(2);
    }
  });
});

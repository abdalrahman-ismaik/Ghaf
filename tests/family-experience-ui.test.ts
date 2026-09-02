import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { resources } from '../src/i18n/resources';

const read = (path: string) => readFileSync(path, 'utf8');

describe('family experience in-route presentation', () => {
  it('mounts the access, private Reward, and League views only on existing routes', () => {
    const role = read('app/role.tsx');
    const parent = read('app/parent/index.tsx');
    const child = read('app/child/index.tsx');

    expect(role).toContain('<SyntheticAccessPanel');
    expect(role).toContain('enterParentExperience');
    expect(role).toContain('enterChildExperience');
    expect(parent).toContain('<FamilyRewardPanel');
    expect(parent).toContain('<FamilyLeaguePanel');
    expect(child).toContain('<FamilyRewardPanel');
    expect(child).toContain('<FamilyLeaguePanel');
  });

  it('keeps credentials, raw domain requests, and direct services out of presentation files', () => {
    const presentationFiles = [
      'app/role.tsx',
      'app/parent/index.tsx',
      'app/child/index.tsx',
      'src/components/family-growth/SyntheticAccessPanel.tsx',
      'src/components/family-growth/FamilyRewardPanel.tsx',
      'src/components/family-growth/FamilyLeaguePanel.tsx',
    ];
    for (const path of presentationFiles) {
      const source = read(path);
      expect(source).not.toMatch(/SYNTHETIC_(?:PARENT|CHILD).*FIXTURE/);
      expect(source).not.toMatch(/FamilyRewardEligibilityEvent|ChallengeLeafCandidate/);
      expect(source).not.toMatch(/password|pairingCode|proofId/i);
    }
    for (const path of presentationFiles.slice(3)) {
      expect(read(path)).not.toMatch(/from ['"]@\/services/);
    }
  });

  it('keeps the League cooperative goal and optional controls visually secondary', () => {
    const league = read('src/components/family-growth/FamilyLeaguePanel.tsx');
    const reward = read('src/components/family-growth/FamilyRewardPanel.tsx');
    const child = read('app/child/index.tsx');

    expect(league).toContain('accessibilityRole="progressbar"');
    expect(league).toContain("role === 'child' && canSendEncouragement");
    expect(league).toContain('variant="secondary"');
    expect(league).toContain('variant="quiet"');
    expect(reward).toContain('variant="secondary"');
    expect(league).not.toContain('variant="primary"');
    expect(reward).not.toContain('variant="primary"');
    expect(child).toContain("sendPreparedLeagueEncouragement('child_alya', 'keep_growing')");
  });

  it('provides equal Arabic and English family-experience copy', () => {
    const ar = resources.ar.translation;
    const en = resources.en.translation;

    expect(Object.keys(ar.familyAccess).sort()).toEqual(Object.keys(en.familyAccess).sort());
    expect(Object.keys(ar.familyReward).sort()).toEqual(Object.keys(en.familyReward).sort());
    expect(Object.keys(ar.familyLeague).sort()).toEqual(Object.keys(en.familyLeague).sort());
  });
});

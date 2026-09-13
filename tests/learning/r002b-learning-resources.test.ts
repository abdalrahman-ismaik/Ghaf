import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { resources } from '@/i18n/resources';

interface CandidateMessage {
  readonly id: string;
  readonly ar: string;
  readonly en: string;
}

interface CandidatePack {
  readonly messages: readonly CandidateMessage[];
}

const candidateUrl = new URL('../../docs/content/MANGROVE_LEARNING_CANDIDATE.md', import.meta.url);

function candidatePack(): CandidatePack {
  const document = readFileSync(candidateUrl, 'utf8');
  const match = document.match(
    /<!-- MANGROVE_LEARNING_CANDIDATE_JSON_START -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- MANGROVE_LEARNING_CANDIDATE_JSON_END -->/u,
  );
  expect(match).not.toBeNull();
  return JSON.parse(match?.[1] ?? '{}') as CandidatePack;
}

function lookup(source: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((value, segment) => {
    if (typeof value !== 'object' || value === null || !(segment in value)) return undefined;
    return (value as Record<string, unknown>)[segment];
  }, source);
}

describe('R002b Mangrove learning runtime resources', () => {
  it('centralizes every reviewed-candidate key with exact Arabic and English parity', () => {
    const candidate = candidatePack();

    expect(candidate.messages.length).toBeGreaterThan(0);
    for (const message of candidate.messages) {
      expect(lookup(resources.ar.translation, message.id), `${message.id}.ar`).toBe(message.ar);
      expect(lookup(resources.en.translation, message.id), `${message.id}.en`).toBe(message.en);
    }
  });

  it('keeps candidate copy local, non-placeholder, and free of executable markup', () => {
    for (const locale of ['ar', 'en'] as const) {
      const values = candidatePack().messages.map((message) =>
        lookup(resources[locale].translation, message.id),
      );
      expect(values.every((value) => typeof value === 'string' && value.trim().length > 0)).toBe(
        true,
      );
      expect(values.join('\n')).not.toMatch(/EN:S|TODO|placeholder|https?:\/\/|<script|<iframe/iu);
    }
  });
});

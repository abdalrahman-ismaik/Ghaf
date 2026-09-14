import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  contextSchema,
  errorCodes,
  phraseIds,
  phraseText,
  peerPermissionSchema,
  threadSchema,
  validBody,
} from '../../src/features/familyMessaging/contracts';
import { resources } from '../../src/i18n/resources';
import { child, parent } from './fixtures';
import { peerMessagingAr, peerMessagingEn } from '../../src/i18n/peerMessagingResources';

describe('messaging policy and bilingual contract', () => {
  it('keeps equivalent peer labels and rejects ambiguous peer DTOs', () => {
    expect(Object.keys(peerMessagingAr).sort()).toEqual(Object.keys(peerMessagingEn).sort());
    expect(
      threadSchema.safeParse({
        id: parent.deviceId,
        kind: 'child_child',
        childId: child.personId,
        otherName: parent.displayName,
        otherRole: 'parent',
      }).success,
    ).toBe(false);
    expect(
      peerPermissionSchema.safeParse({
        firstChildId: child.personId,
        secondChildId: child.personId,
        firstName: 'A',
        secondName: 'B',
        threadId: null,
        enabled: false,
        available: true,
      }).success,
    ).toBe(false);
    expect(
      peerPermissionSchema.safeParse({
        firstChildId: child.personId,
        secondChildId: '30000000-0000-4000-8000-000000000002',
        firstName: 'A',
        secondName: 'B',
        threadId: null,
        enabled: true,
        available: true,
      }).success,
    ).toBe(false);
  });
  it('matches the server curated phrase allowlist and bilingual resources exactly', () => {
    const sql = readFileSync(
      new URL(
        '../../workers/ghaf-family-messaging/migrations/001_family_messaging.sql',
        import.meta.url,
      ),
      'utf8',
    );
    for (const locale of ['ar', 'en'] as const) {
      expect(resources[locale].translation.messaging.phrasesText).toEqual(phraseText[locale]);
      for (const phrase of phraseIds) expect(sql).toContain(`'${phraseText[locale][phrase]}'`);
      for (const code of errorCodes)
        expect(resources[locale].translation.messaging.errors[code]).toBeTruthy();
    }
  });

  it('rejects ambiguous role/age contexts and Unicode whitespace-only content', () => {
    expect(contextSchema.safeParse({ ...parent, ageBand: '6_8' }).success).toBe(false);
    expect(contextSchema.safeParse({ ...child, ageBand: null }).success).toBe(false);
    for (const text of ['', ' \t\n', '\u0085', '\u00a0\u202f', '\ufeff', 'hello\0'])
      expect(validBody(text)).toBe(false);
    expect(validBody('🌳'.repeat(500))).toBe(true);
    expect(validBody('🌳'.repeat(501))).toBe(false);
  });
});

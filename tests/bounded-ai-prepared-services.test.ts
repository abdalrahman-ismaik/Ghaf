import { describe, expect, it } from 'vitest';

import type { ParentTaskDraftingService } from '@/services';
import { BlockedCapabilityTokenService, createFeature003ServiceRegistry } from '@/services';

const parentRequest = {
  operation: 'draft_parent_task_v1' as const,
  schemaVersion: '1.0' as const,
  requestId: 'request_parent_1234',
  bindingNonce: 'binding_parent_1234',
  localeSet: 'ar_en' as const,
  ageBand: '9_11' as const,
  archetypeId: 'task_recycling_p0_v1' as const,
  catalogVersion: 1,
  intent: 'make_clearer' as const,
  effortBand: 'fifteen_thirty' as const,
  stepCount: 1,
  supportMode: 'adult_alongside' as const,
};

describe('prepared Feature 004 services', () => {
  it('keeps every primary on the deterministic prepared provider by default', () => {
    const registry = createFeature003ServiceRegistry();

    expect(registry.boundedAi.parentTaskDraftingPrimary).toBe(
      registry.boundedAi.parentTaskDraftingPrepared,
    );
    expect(registry.boundedAi.childCoachTextPrimary).toBe(
      registry.boundedAi.childCoachTextPrepared,
    );
    expect(registry.boundedAi.voiceTranscriptionPrimary).toBe(
      registry.boundedAi.voiceTranscriptionPrepared,
    );
    expect(registry.boundedAi.capabilityToken).toBeInstanceOf(BlockedCapabilityTokenService);
  });

  it('returns a correlation-bound bilingual Parent fixture', async () => {
    const result =
      await createFeature003ServiceRegistry().boundedAi.parentTaskDraftingPrepared.draft(
        parentRequest,
      );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.meta).toMatchObject({ origin: 'prepared', fallbackUsed: false });
    expect(result.data).toMatchObject({
      requestId: parentRequest.requestId,
      bindingNonce: parentRequest.bindingNonce,
      archetypeId: parentRequest.archetypeId,
    });
    expect(result.data.title.ar.length).toBeGreaterThan(0);
    expect(result.data.title.en.length).toBeGreaterThan(0);
  });

  it('returns one terminal prepared Coach card for the approved task', async () => {
    const result = await createFeature003ServiceRegistry().boundedAi.childCoachTextPrepared.respond(
      {
        operation: 'coach_approved_task_v1',
        schemaVersion: '1.0',
        requestId: 'request_child_12345',
        taskBindingNonce: 'binding_child_12345',
        ageBand: '6_8',
        locale: 'ar',
        intent: 'show_next_step',
        taskArchetypeId: 'task_recycling_p0_v1',
        catalogVersion: 1,
        approvedTaskVersion: 1,
        noticeVersion: 1,
        grantVersion: 1,
      },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.meta.origin).toBe('prepared');
    expect(result.data.terminal).toBe(true);
    expect(result.data.requestId).toBe('request_child_12345');
  });

  it('uses only a synthetic audio fixture and returns a text-only transcript', async () => {
    const audioBytes = new Uint8Array([1, 2, 3, 4]);
    const result =
      await createFeature003ServiceRegistry().boundedAi.voiceTranscriptionPrepared.transcribe({
        metadata: {
          operation: 'transcribe_child_task_voice_v1',
          schemaVersion: '1.0',
          requestId: 'request_voice_12345',
          bindingNonce: 'binding_voice_12345',
          locale: 'en',
          taskArchetypeId: 'task_recycling_p0_v1',
          catalogVersion: 1,
          approvedTaskVersion: 1,
          noticeVersion: 1,
          grantVersion: 1,
          durationMs: 1_000,
          declaredByteCount: audioBytes.byteLength,
          mediaType: 'audio/m4a',
          synthetic: true,
        },
        audioBytes,
      });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).not.toHaveProperty('audio');
    expect(result.data).not.toHaveProperty('confidence');
    expect(result.data).toMatchObject({ locale: 'en', audioDeleted: true });
  });

  it('blocks token access and allows explicit dependency injection without changing fallback', async () => {
    const injected: ParentTaskDraftingService = {
      async draft() {
        return {
          ok: false,
          error: {
            code: 'REMOTE_UNAVAILABLE',
            message: 'fake remote unavailable',
            retryable: false,
            fallbackAvailable: true,
          },
        };
      },
    };
    const registry = createFeature003ServiceRegistry({ parentTaskDraftingPrimary: injected });

    expect(registry.boundedAi.parentTaskDraftingPrimary).toBe(injected);
    expect(registry.boundedAi.parentTaskDraftingPrepared).not.toBe(injected);
    await expect(
      registry.boundedAi.capabilityToken.getToken({
        role: 'parent',
        scope: 'draft_parent_task_v1',
      }),
    ).resolves.toMatchObject({
      ok: false,
      error: { code: 'REMOTE_UNAVAILABLE', fallbackAvailable: true },
    });
  });
});

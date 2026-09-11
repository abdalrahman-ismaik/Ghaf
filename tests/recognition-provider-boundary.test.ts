import { describe, expect, it } from 'vitest';

import {
  validateCheckInRouteProviderResult,
  validateConfirmationProviderResult,
  validatePraisePresentationProviderResult,
  validateSyntheticProviderResult,
} from '../src/features/tasks/recognitionProviderBoundary';

const SYNTHETIC_META = { origin: 'synthetic' as const, fallbackUsed: false };

describe('recognition provider result boundary', () => {
  it('returns a detached plain-data success envelope', () => {
    const source = {
      ok: true as const,
      data: { state: 'submitted', nested: { values: ['first'] } },
      meta: { ...SYNTHETIC_META },
    };

    const validated = validateSyntheticProviderResult<Record<string, unknown>>(source);

    expect(validated).toEqual({ ok: true, data: source });
    expect(validated.ok).toBe(true);
    if (!validated.ok || !validated.data.ok) return;
    expect(validated.data).not.toBe(source);
    expect(validated.data.data).not.toBe(source.data);
    expect(validated.data.meta).not.toBe(source.meta);

    source.data.nested.values[0] = 'changed';
    expect(validated.data.data).toEqual({ state: 'submitted', nested: { values: ['first'] } });
  });

  it('returns a detached allowlisted failure envelope', () => {
    const source = {
      ok: false as const,
      error: {
        code: 'TIMEOUT' as const,
        message: 'Provider timed out',
        retryable: true,
        fallbackAvailable: true,
      },
    };

    const validated = validateConfirmationProviderResult(source);

    expect(validated).toEqual({ ok: true, data: source });
    expect(validated.ok).toBe(true);
    if (!validated.ok || validated.data.ok) return;
    expect(validated.data).not.toBe(source);
    expect(validated.data.error).not.toBe(source.error);

    source.error.message = 'Changed after validation';
    expect(validated.data.error.message).toBe('Provider timed out');
  });

  it.each([
    ['check-in route', validateCheckInRouteProviderResult],
    ['confirmation', validateConfirmationProviderResult],
    ['praise presentation', validatePraisePresentationProviderResult],
  ])('exposes a typed validator for the %s result', (_label, validate) => {
    const result = validate({
      ok: true,
      data: { marker: 'plain record' },
      meta: SYNTHETIC_META,
    });

    expect(result.ok).toBe(true);
  });

  it.each([
    ['extra success key', { ok: true, data: {}, meta: SYNTHETIC_META, extra: true }],
    ['array success data', { ok: true, data: [], meta: SYNTHETIC_META }],
    ['prepared origin', { ok: true, data: {}, meta: { ...SYNTHETIC_META, origin: 'prepared' } }],
    ['fallback metadata', { ok: true, data: {}, meta: { ...SYNTHETIC_META, fallbackUsed: true } }],
    [
      'extra metadata key',
      { ok: true, data: {}, meta: { ...SYNTHETIC_META, fixtureId: 'not-allowed' } },
    ],
    [
      'unknown error code',
      {
        ok: false,
        error: {
          code: 'UNKNOWN',
          message: 'No matching domain code',
          retryable: false,
          fallbackAvailable: false,
        },
      },
    ],
    [
      'empty error message',
      {
        ok: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: '   ',
          retryable: false,
          fallbackAvailable: false,
        },
      },
    ],
    [
      'extra error key',
      {
        ok: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Malformed response',
          retryable: false,
          fallbackAvailable: false,
          reason: 'extra',
        },
      },
    ],
    ['non-finite nested number', { ok: true, data: { value: Number.NaN }, meta: SYNTHETIC_META }],
    ['non-plain nested value', { ok: true, data: { value: new Date(0) }, meta: SYNTHETIC_META }],
  ])('rejects %s', (_label, value) => {
    expect(validateCheckInRouteProviderResult(value)).toEqual({
      ok: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Provider result envelope is malformed',
        retryable: false,
        fallbackAvailable: false,
      },
    });
  });

  it('rejects cyclic and accessor-backed data without invoking the accessor', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const getter = viLikeGetter();
    const accessorData = Object.defineProperty({}, 'value', {
      enumerable: true,
      get: getter.read,
    });

    expect(
      validatePraisePresentationProviderResult({
        ok: true,
        data: cyclic,
        meta: SYNTHETIC_META,
      }).ok,
    ).toBe(false);
    expect(
      validatePraisePresentationProviderResult({
        ok: true,
        data: accessorData,
        meta: SYNTHETIC_META,
      }).ok,
    ).toBe(false);
    expect(getter.readCount()).toBe(0);
  });
});

function viLikeGetter(): { readonly read: () => string; readonly readCount: () => number } {
  let reads = 0;
  return {
    read: () => {
      reads += 1;
      return 'must not run';
    },
    readCount: () => reads,
  };
}

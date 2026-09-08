import type { R002bFeatureFlags } from '@/config/r002bFeatureFlags';
import type { DemoRole } from '@/models/familyGrowth';

import {
  parseR002bOriginParams,
  resolveR002bOrigin,
  type R002bOrigin,
  type R002bOriginId,
  type ResolveR002bOriginResult,
} from './r002bOrigin';
import { guardR002bRoute, type R002bRouteGuardResult, type R002bRouteId } from './r002bRouteGuard';

export type R002bRouteParam = string | readonly string[] | undefined;
type R002bGuardFailureReason = Extract<R002bRouteGuardResult, { allowed: false }>['reason'];

export type R002bRouteRequestResult =
  | {
      readonly allowed: true;
      readonly requestedProfileId: string;
      readonly entityId: string | undefined;
      readonly origin: R002bOrigin;
      readonly back: Extract<ResolveR002bOriginResult, { restored: true }>;
    }
  | {
      readonly allowed: false;
      readonly fallback: '/child' | '/parent';
      readonly reason: R002bGuardFailureReason | 'invalid_route_param' | 'invalid_origin';
    };

function scalarParam(value: R002bRouteParam): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function safeRoot(role: DemoRole): '/child' | '/parent' {
  return role === 'child' ? '/child' : '/parent';
}

export function resolveR002bRouteRequest(input: {
  readonly routeId: R002bRouteId;
  readonly role: DemoRole;
  readonly activeProfileId: string;
  readonly authorizedProfileIds: readonly string[];
  readonly flags: R002bFeatureFlags;
  readonly requestedProfileParam: R002bRouteParam;
  readonly entityParam: R002bRouteParam;
  readonly originParams: Readonly<Record<string, unknown>>;
  readonly allowedOriginIds: readonly R002bOriginId[];
}): R002bRouteRequestResult {
  const fallback = safeRoot(input.role);
  const requestedProfileId = scalarParam(input.requestedProfileParam);
  const entityId = scalarParam(input.entityParam);
  if (!requestedProfileId || (input.entityParam !== undefined && entityId === undefined)) {
    return { allowed: false, fallback, reason: 'invalid_route_param' };
  }

  const guard = guardR002bRoute({
    routeId: input.routeId,
    role: input.role,
    activeProfileId: input.activeProfileId,
    requestedProfileId,
    authorizedProfileIds: input.authorizedProfileIds,
    flags: input.flags,
    ...(entityId === undefined ? {} : { entityId }),
  });
  if (!guard.allowed) return guard;

  const parsedOrigin = parseR002bOriginParams(input.originParams);
  if (
    !parsedOrigin.ok ||
    parsedOrigin.data.profileId !== requestedProfileId ||
    !input.allowedOriginIds.includes(parsedOrigin.data.id)
  ) {
    return { allowed: false, fallback, reason: 'invalid_origin' };
  }
  const back = resolveR002bOrigin({
    origin: parsedOrigin.data,
    activeRole: input.role,
    activeProfileId: input.activeProfileId,
  });
  if (!back.restored) {
    return { allowed: false, fallback, reason: 'invalid_origin' };
  }

  return Object.freeze({
    allowed: true,
    requestedProfileId,
    entityId,
    origin: parsedOrigin.data,
    back,
  });
}

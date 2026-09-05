import type { R002bFeatureFlag, R002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { getBadgeDefinition } from '@/features/growth/badgeRegistry';
import type { DemoRole } from '@/models/familyGrowth';

export const R002B_ROUTE_IDS = [
  'impact_path',
  'badge_gallery',
  'badge_detail',
  'learning_story',
  'learning_accessible',
  'child_reveal',
  'parent_progress',
  'shared_growth',
  'parent_shared_garden',
] as const;

export type R002bRouteId = (typeof R002B_ROUTE_IDS)[number];

interface RouteDefinition {
  readonly role: DemoRole;
  readonly flag: R002bFeatureFlag;
  readonly entity: 'none' | 'badge' | 'learning' | 'reveal';
}

const ROUTE_DEFINITIONS: Readonly<Record<R002bRouteId, RouteDefinition>> = {
  impact_path: { role: 'child', flag: 'r002b_impact_path_ui', entity: 'none' },
  badge_gallery: { role: 'child', flag: 'r002b_badges_ui', entity: 'none' },
  badge_detail: { role: 'child', flag: 'r002b_badges_ui', entity: 'badge' },
  learning_story: { role: 'child', flag: 'r002b_learning_ui', entity: 'learning' },
  learning_accessible: { role: 'child', flag: 'r002b_learning_ui', entity: 'learning' },
  child_reveal: { role: 'child', flag: 'r002b_reveal_bundle_v2', entity: 'reveal' },
  parent_progress: { role: 'parent', flag: 'r002b_parent_progress_ui', entity: 'none' },
  shared_growth: { role: 'child', flag: 'r002b_shared_growth_view', entity: 'none' },
  parent_shared_garden: {
    role: 'parent',
    flag: 'r002b_shared_growth_view',
    entity: 'none',
  },
};

function isRouteId(value: unknown): value is R002bRouteId {
  return typeof value === 'string' && (R002B_ROUTE_IDS as readonly string[]).includes(value);
}

function safeRoot(role: DemoRole): '/child' | '/parent' {
  return role === 'child' ? '/child' : '/parent';
}

function isLearningId(value: unknown): boolean {
  return value === 'learning.mangrove_roots.v1';
}

function isRevealId(value: unknown, profileId: string): boolean {
  if (typeof value !== 'string') return false;
  const prefix = `reveal:${profileId}:`;
  return (
    value.startsWith(prefix) &&
    value.length > prefix.length &&
    value.length <= 240 &&
    !/[\r\n/\\]/.test(value)
  );
}

function validEntity(
  kind: RouteDefinition['entity'],
  entityId: unknown,
  profileId: string,
): boolean {
  if (kind === 'none') return entityId === undefined;
  if (kind === 'badge')
    return typeof entityId === 'string' && getBadgeDefinition(entityId) !== null;
  if (kind === 'learning') return isLearningId(entityId);
  return isRevealId(entityId, profileId);
}

export type R002bRouteGuardResult =
  | { readonly allowed: true }
  | {
      readonly allowed: false;
      readonly fallback: '/child' | '/parent';
      readonly reason:
        | 'invalid_route'
        | 'role_mismatch'
        | 'feature_disabled'
        | 'profile_mismatch'
        | 'profile_not_authorized'
        | 'invalid_entity';
    };

export function guardR002bRoute(input: {
  readonly routeId: R002bRouteId;
  readonly role: DemoRole;
  readonly activeProfileId: string;
  readonly requestedProfileId: string;
  readonly authorizedProfileIds: readonly string[];
  readonly flags: R002bFeatureFlags;
  readonly entityId?: string;
}): R002bRouteGuardResult {
  const fallback = safeRoot(input.role);
  if (!isRouteId(input.routeId)) {
    return { allowed: false, fallback, reason: 'invalid_route' };
  }

  const definition = ROUTE_DEFINITIONS[input.routeId];
  if (input.role !== definition.role) {
    return { allowed: false, fallback, reason: 'role_mismatch' };
  }
  if (input.flags?.[definition.flag] !== true) {
    return { allowed: false, fallback, reason: 'feature_disabled' };
  }

  const profileAuthorized = input.authorizedProfileIds.includes(input.requestedProfileId);
  if (!profileAuthorized) {
    return { allowed: false, fallback, reason: 'profile_not_authorized' };
  }
  if (definition.role === 'child' && input.requestedProfileId !== input.activeProfileId) {
    return { allowed: false, fallback, reason: 'profile_mismatch' };
  }
  if (!validEntity(definition.entity, input.entityId, input.requestedProfileId)) {
    return { allowed: false, fallback, reason: 'invalid_entity' };
  }

  return { allowed: true };
}

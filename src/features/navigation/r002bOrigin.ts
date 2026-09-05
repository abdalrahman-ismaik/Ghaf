import type { DemoRole } from '@/models/familyGrowth';
import { getBadgeDefinition } from '@/features/growth/badgeRegistry';

export const R002B_ORIGIN_IDS = [
  'child_today_path_card',
  'child_garden_path_card',
  'child_garden_badges_card',
  'impact_path_badges_action',
  'impact_path_learning_action',
  'badge_gallery_badge_card',
  'badge_detail_path_action',
  'badge_detail_learning_action',
  'child_reveal_growth_action',
  'child_garden_shared_growth_card',
  'child_league_shared_growth_card',
  'parent_family_progress_card',
  'parent_progress_task_action',
  'parent_garden_shared_settings_card',
] as const;

export type R002bOriginId = (typeof R002B_ORIGIN_IDS)[number];
export type R002bBadgeFilter = 'all' | 'earned' | 'in_progress' | 'locked' | 'archived';

export interface R002bOrigin {
  readonly version: 1;
  readonly id: R002bOriginId;
  readonly profileId: string;
  readonly scrollOffset?: number;
  readonly filter?: R002bBadgeFilter;
  readonly entityId?: string;
}

interface OriginDefinition {
  readonly role: DemoRole;
  readonly href: 'child' | 'garden' | 'impact_path' | 'badge_gallery' | 'badge_detail' | 'parent';
  readonly focusTarget: string;
  readonly entity: 'none' | 'badge' | 'reveal';
  readonly acceptsFilter?: true;
}

const ORIGIN_DEFINITIONS: Readonly<Record<R002bOriginId, OriginDefinition>> = {
  child_today_path_card: {
    role: 'child',
    href: 'child',
    focusTarget: 'r002b-today-path-card',
    entity: 'none',
  },
  child_garden_path_card: {
    role: 'child',
    href: 'garden',
    focusTarget: 'r002b-garden-path-card',
    entity: 'none',
  },
  child_garden_badges_card: {
    role: 'child',
    href: 'garden',
    focusTarget: 'r002b-garden-badges-card',
    entity: 'none',
  },
  impact_path_badges_action: {
    role: 'child',
    href: 'impact_path',
    focusTarget: 'r002b-impact-path-badges-action',
    entity: 'none',
  },
  impact_path_learning_action: {
    role: 'child',
    href: 'impact_path',
    focusTarget: 'r002b-impact-path-learning-action',
    entity: 'none',
  },
  badge_gallery_badge_card: {
    role: 'child',
    href: 'badge_gallery',
    focusTarget: 'r002b-badge-gallery-list',
    entity: 'none',
    acceptsFilter: true,
  },
  badge_detail_path_action: {
    role: 'child',
    href: 'badge_detail',
    focusTarget: 'r002b-badge-detail-path-action',
    entity: 'badge',
  },
  badge_detail_learning_action: {
    role: 'child',
    href: 'badge_detail',
    focusTarget: 'r002b-badge-detail-learning-action',
    entity: 'badge',
  },
  child_reveal_growth_action: {
    role: 'child',
    href: 'child',
    focusTarget: 'r002b-child-reveal-growth-action',
    entity: 'reveal',
  },
  child_garden_shared_growth_card: {
    role: 'child',
    href: 'garden',
    focusTarget: 'r002b-garden-shared-growth-card',
    entity: 'none',
  },
  child_league_shared_growth_card: {
    role: 'child',
    href: 'child',
    focusTarget: 'r002b-child-league-shared-growth-card',
    entity: 'none',
  },
  parent_family_progress_card: {
    role: 'parent',
    href: 'parent',
    focusTarget: 'r002b-parent-family-progress-card',
    entity: 'none',
  },
  parent_progress_task_action: {
    role: 'parent',
    href: 'parent',
    focusTarget: 'r002b-parent-progress-task-action',
    entity: 'none',
  },
  parent_garden_shared_settings_card: {
    role: 'parent',
    href: 'garden',
    focusTarget: 'r002b-parent-garden-shared-settings-card',
    entity: 'none',
  },
};

const BADGE_FILTERS = new Set<R002bBadgeFilter>([
  'all',
  'earned',
  'in_progress',
  'locked',
  'archived',
]);

export type CreateR002bOriginResult =
  | { readonly ok: true; readonly data: R002bOrigin }
  | {
      readonly ok: false;
      readonly error:
        | 'invalid_origin'
        | 'invalid_profile'
        | 'invalid_entity'
        | 'invalid_filter'
        | 'invalid_scroll';
    };

function isOriginId(value: unknown): value is R002bOriginId {
  return typeof value === 'string' && (R002B_ORIGIN_IDS as readonly string[]).includes(value);
}

function isSafeIdentifier(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 180 &&
    /^[a-zA-Z0-9._:-]+$/.test(value)
  );
}

function isRevealId(value: string, profileId: string): boolean {
  const prefix = `reveal:${profileId}:`;
  return value.startsWith(prefix) && value.length > prefix.length && value.length <= 240;
}

export function createR002bOrigin(input: {
  readonly id: R002bOriginId;
  readonly profileId: string;
  readonly scrollOffset?: number;
  readonly filter?: R002bBadgeFilter;
  readonly entityId?: string;
}): CreateR002bOriginResult {
  if (!isOriginId(input?.id)) return { ok: false, error: 'invalid_origin' };
  if (!isSafeIdentifier(input.profileId)) return { ok: false, error: 'invalid_profile' };

  const definition = ORIGIN_DEFINITIONS[input.id];
  if (
    input.scrollOffset !== undefined &&
    (!Number.isSafeInteger(input.scrollOffset) ||
      input.scrollOffset < 0 ||
      input.scrollOffset > 100_000)
  ) {
    return { ok: false, error: 'invalid_scroll' };
  }
  if (
    input.filter !== undefined &&
    (!definition.acceptsFilter || !BADGE_FILTERS.has(input.filter))
  ) {
    return { ok: false, error: 'invalid_filter' };
  }

  if (definition.entity === 'none' && input.entityId !== undefined) {
    return { ok: false, error: 'invalid_entity' };
  }
  if (
    definition.entity === 'badge' &&
    (typeof input.entityId !== 'string' || getBadgeDefinition(input.entityId) === null)
  ) {
    return { ok: false, error: 'invalid_entity' };
  }
  if (
    definition.entity === 'reveal' &&
    (typeof input.entityId !== 'string' || !isRevealId(input.entityId, input.profileId))
  ) {
    return { ok: false, error: 'invalid_entity' };
  }

  const data: R002bOrigin = {
    version: 1,
    id: input.id,
    profileId: input.profileId,
    ...(input.scrollOffset === undefined ? {} : { scrollOffset: input.scrollOffset }),
    ...(input.filter === undefined ? {} : { filter: input.filter }),
    ...(input.entityId === undefined ? {} : { entityId: input.entityId }),
  };
  return { ok: true, data: Object.freeze(data) };
}

function safeRoot(role: DemoRole): '/child' | '/parent' {
  return role === 'child' ? '/child' : '/parent';
}

function hrefFor(origin: R002bOrigin, definition: OriginDefinition): string {
  switch (definition.href) {
    case 'child':
      return '/child';
    case 'garden':
      return '/garden';
    case 'impact_path':
      return '/garden/impact-path';
    case 'badge_gallery':
      return '/garden/badges';
    case 'badge_detail':
      return `/garden/badges/${encodeURIComponent(origin.entityId ?? '')}`;
    case 'parent':
      return '/parent';
  }
}

export type ResolveR002bOriginResult =
  | {
      readonly restored: true;
      readonly href: string;
      readonly focusTarget: string;
      readonly scrollOffset: number;
      readonly filter: R002bBadgeFilter | null;
    }
  | {
      readonly restored: false;
      readonly href: '/child' | '/parent';
      readonly reason: 'invalid_origin' | 'role_mismatch' | 'profile_mismatch';
    };

export function resolveR002bOrigin(input: {
  readonly origin: R002bOrigin;
  readonly activeRole: DemoRole;
  readonly activeProfileId: string;
}): ResolveR002bOriginResult {
  const candidate = input?.origin;
  if (!candidate || candidate.version !== 1) {
    return { restored: false, href: safeRoot(input.activeRole), reason: 'invalid_origin' };
  }

  const normalized = createR002bOrigin(candidate);
  if (!normalized.ok) {
    return { restored: false, href: safeRoot(input.activeRole), reason: 'invalid_origin' };
  }
  const definition = ORIGIN_DEFINITIONS[normalized.data.id];
  if (definition.role !== input.activeRole) {
    return { restored: false, href: safeRoot(input.activeRole), reason: 'role_mismatch' };
  }
  if (normalized.data.profileId !== input.activeProfileId) {
    return { restored: false, href: safeRoot(input.activeRole), reason: 'profile_mismatch' };
  }

  return {
    restored: true,
    href: hrefFor(normalized.data, definition),
    focusTarget: definition.focusTarget,
    scrollOffset: normalized.data.scrollOffset ?? 0,
    filter: normalized.data.filter ?? null,
  };
}

import { describe, expect, it } from 'vitest';

import { DEFAULT_R002B_FEATURE_FLAGS, resolveR002bFeatureFlags } from '@/config/r002bFeatureFlags';
import {
  createR002bOrigin,
  resolveR002bOrigin,
  R002B_ORIGIN_IDS,
} from '@/features/navigation/r002bOrigin';
import { guardR002bRoute, R002B_ROUTE_IDS } from '@/features/navigation/r002bRouteGuard';

const CHILD_ID = 'child_salem';
const OTHER_CHILD_ID = 'child_alya';

describe('R002b typed origins', () => {
  it('defines a closed set of same-role restoration origins', () => {
    expect(R002B_ORIGIN_IDS).toEqual([
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
    ]);
  });

  it('restores a Child Garden card with bounded scroll and a known focus target', () => {
    const created = createR002bOrigin({
      id: 'child_garden_badges_card',
      profileId: CHILD_ID,
      scrollOffset: 420,
    });

    expect(created).toEqual({
      ok: true,
      data: {
        version: 1,
        id: 'child_garden_badges_card',
        profileId: CHILD_ID,
        scrollOffset: 420,
      },
    });
    if (!created.ok) throw new Error('expected origin');

    expect(
      resolveR002bOrigin({
        origin: created.data,
        activeRole: 'child',
        activeProfileId: CHILD_ID,
      }),
    ).toEqual({
      restored: true,
      href: '/garden',
      focusTarget: 'r002b-garden-badges-card',
      scrollOffset: 420,
      filter: null,
    });
    expect(Object.isFrozen(created.data)).toBe(true);
  });

  it('restores a known Badge Detail origin without accepting a raw path', () => {
    const created = createR002bOrigin({
      id: 'badge_detail_path_action',
      profileId: CHILD_ID,
      entityId: 'badge.skill.sorting.bud.v1',
      scrollOffset: 24,
    });
    if (!created.ok) throw new Error('expected origin');

    expect(
      resolveR002bOrigin({
        origin: created.data,
        activeRole: 'child',
        activeProfileId: CHILD_ID,
      }),
    ).toEqual({
      restored: true,
      href: '/garden/badges/badge.skill.sorting.bud.v1',
      focusTarget: 'r002b-badge-detail-path-action',
      scrollOffset: 24,
      filter: null,
    });
    expect('path' in created.data).toBe(false);
  });

  it('rejects arbitrary IDs, invalid entities, malformed filters, and unbounded scroll', () => {
    expect(createR002bOrigin({ id: '/parent', profileId: CHILD_ID } as never)).toEqual({
      ok: false,
      error: 'invalid_origin',
    });
    expect(
      createR002bOrigin({
        id: 'badge_detail_path_action',
        profileId: CHILD_ID,
        entityId: '../../parent',
      }),
    ).toEqual({ ok: false, error: 'invalid_entity' });
    expect(
      createR002bOrigin({
        id: 'badge_gallery_badge_card',
        profileId: CHILD_ID,
        filter: 'mystery' as never,
      }),
    ).toEqual({ ok: false, error: 'invalid_filter' });
    expect(
      createR002bOrigin({
        id: 'child_today_path_card',
        profileId: CHILD_ID,
        scrollOffset: Number.POSITIVE_INFINITY,
      }),
    ).toEqual({ ok: false, error: 'invalid_scroll' });
  });

  it('fails closed for a wrong role, wrong profile, or malformed restored payload', () => {
    const created = createR002bOrigin({ id: 'child_today_path_card', profileId: CHILD_ID });
    if (!created.ok) throw new Error('expected origin');

    expect(
      resolveR002bOrigin({
        origin: created.data,
        activeRole: 'parent',
        activeProfileId: CHILD_ID,
      }),
    ).toEqual({ restored: false, href: '/parent', reason: 'role_mismatch' });
    expect(
      resolveR002bOrigin({
        origin: created.data,
        activeRole: 'child',
        activeProfileId: OTHER_CHILD_ID,
      }),
    ).toEqual({ restored: false, href: '/child', reason: 'profile_mismatch' });
    expect(
      resolveR002bOrigin({
        origin: { ...created.data, version: 2 } as never,
        activeRole: 'child',
        activeProfileId: CHILD_ID,
      }),
    ).toEqual({ restored: false, href: '/child', reason: 'invalid_origin' });
  });
});

describe('R002b route guard', () => {
  it('defines only the authorized nested routes', () => {
    expect(R002B_ROUTE_IDS).toEqual([
      'impact_path',
      'badge_gallery',
      'badge_detail',
      'learning_story',
      'learning_accessible',
      'child_reveal',
      'parent_progress',
      'shared_growth',
      'parent_shared_garden',
    ]);
  });

  it('allows a Child route only when its independent flag and profile scope match', () => {
    const flags = resolveR002bFeatureFlags({ r002b_impact_path_ui: true });

    expect(
      guardR002bRoute({
        routeId: 'impact_path',
        role: 'child',
        activeProfileId: CHILD_ID,
        requestedProfileId: CHILD_ID,
        authorizedProfileIds: [CHILD_ID],
        flags,
      }),
    ).toEqual({ allowed: true });

    expect(
      guardR002bRoute({
        routeId: 'impact_path',
        role: 'child',
        activeProfileId: CHILD_ID,
        requestedProfileId: OTHER_CHILD_ID,
        authorizedProfileIds: [CHILD_ID, OTHER_CHILD_ID],
        flags,
      }),
    ).toEqual({ allowed: false, fallback: '/child', reason: 'profile_mismatch' });
  });

  it('fails closed when the required flag is off', () => {
    expect(
      guardR002bRoute({
        routeId: 'badge_gallery',
        role: 'child',
        activeProfileId: CHILD_ID,
        requestedProfileId: CHILD_ID,
        authorizedProfileIds: [CHILD_ID],
        flags: DEFAULT_R002B_FEATURE_FLAGS,
      }),
    ).toEqual({ allowed: false, fallback: '/child', reason: 'feature_disabled' });
  });

  it('guards Parent Progress by role and household profile authorization', () => {
    const flags = resolveR002bFeatureFlags({ r002b_parent_progress_ui: true });
    const base = {
      routeId: 'parent_progress' as const,
      activeProfileId: CHILD_ID,
      requestedProfileId: OTHER_CHILD_ID,
      authorizedProfileIds: [CHILD_ID, OTHER_CHILD_ID],
      flags,
    };

    expect(guardR002bRoute({ ...base, role: 'parent' })).toEqual({ allowed: true });
    expect(guardR002bRoute({ ...base, role: 'child' })).toEqual({
      allowed: false,
      fallback: '/child',
      reason: 'role_mismatch',
    });
    expect(guardR002bRoute({ ...base, role: 'parent', authorizedProfileIds: [CHILD_ID] })).toEqual({
      allowed: false,
      fallback: '/parent',
      reason: 'profile_not_authorized',
    });
  });

  it('validates entity IDs for badges, learning, and reveal bundles', () => {
    const flags = resolveR002bFeatureFlags({
      r002b_badges_ui: true,
      r002b_learning_ui: true,
      r002b_reveal_bundle_v2: true,
    });
    const base = {
      role: 'child' as const,
      activeProfileId: CHILD_ID,
      requestedProfileId: CHILD_ID,
      authorizedProfileIds: [CHILD_ID],
      flags,
    };

    expect(
      guardR002bRoute({
        ...base,
        routeId: 'badge_detail',
        entityId: 'badge.habitat.mangrove_care.v1',
      }),
    ).toEqual({ allowed: true });
    expect(
      guardR002bRoute({ ...base, routeId: 'badge_detail', entityId: 'badge.unknown.v1' }),
    ).toEqual({ allowed: false, fallback: '/child', reason: 'invalid_entity' });
    expect(
      guardR002bRoute({
        ...base,
        routeId: 'learning_story',
        entityId: 'learning.mangrove_roots.v1',
      }),
    ).toEqual({ allowed: true });
    expect(
      guardR002bRoute({
        ...base,
        routeId: 'child_reveal',
        entityId: `reveal:${CHILD_ID}:approval-001`,
      }),
    ).toEqual({ allowed: true });
    expect(
      guardR002bRoute({
        ...base,
        routeId: 'child_reveal',
        entityId: `reveal:${OTHER_CHILD_ID}:approval-001`,
      }),
    ).toEqual({ allowed: false, fallback: '/child', reason: 'invalid_entity' });
  });

  it('keeps Shared Growth viewing independent from contribution', () => {
    const viewOnly = resolveR002bFeatureFlags({ r002b_shared_growth_view: true });
    const base = {
      activeProfileId: CHILD_ID,
      requestedProfileId: CHILD_ID,
      authorizedProfileIds: [CHILD_ID],
      flags: viewOnly,
    };

    expect(guardR002bRoute({ ...base, role: 'child', routeId: 'shared_growth' })).toEqual({
      allowed: true,
    });
    expect(guardR002bRoute({ ...base, role: 'parent', routeId: 'parent_shared_garden' })).toEqual({
      allowed: true,
    });
    expect(viewOnly.r002b_shared_growth_contribution).toBe(false);
  });
});

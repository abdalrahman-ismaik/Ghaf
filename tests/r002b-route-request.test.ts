import { describe, expect, it } from 'vitest';

import { resolveR002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import { resolveR002bRouteRequest } from '@/features/navigation/r002bRouteRequest';

function origin(
  id:
    | 'child_today_path_card'
    | 'badge_gallery_badge_card'
    | 'impact_path_learning_action'
    | 'child_today_reveal_handoff'
    | 'child_garden_shared_growth_card'
    | 'child_league_shared_growth_card'
    | 'parent_garden_shared_settings_card',
) {
  const result = createR002bOrigin({
    id,
    profileId: 'child_salem',
    ...(id === 'badge_gallery_badge_card'
      ? { filter: 'all' as const, entityId: 'badge.skill.sorting.bud.v1' }
      : id === 'child_today_reveal_handoff'
        ? { entityId: 'reveal:child_salem:recognition:submission_1' }
        : {}),
  });
  if (!result.ok) throw new Error(result.error);
  return serializeR002bOrigin(result.data);
}

describe('R002b untrusted route request resolver', () => {
  it('authorizes a known Child route, profile, entity, and destination origin', () => {
    const result = resolveR002bRouteRequest({
      routeId: 'impact_path',
      role: 'child',
      activeProfileId: 'child_salem',
      authorizedProfileIds: ['child_salem'],
      flags: resolveR002bFeatureFlags({ r002b_impact_path_ui: true }),
      requestedProfileParam: 'child_salem',
      entityParam: undefined,
      originParams: origin('child_today_path_card'),
      allowedOriginIds: ['child_today_path_card'],
    });

    expect(result).toMatchObject({
      allowed: true,
      requestedProfileId: 'child_salem',
      back: { restored: true, href: '/child' },
    });
  });

  it('fails before projection for arrays, flag-off requests, and cross-profile routes', () => {
    const base = {
      routeId: 'impact_path' as const,
      role: 'child' as const,
      activeProfileId: 'child_salem',
      authorizedProfileIds: ['child_salem'] as const,
      originParams: origin('child_today_path_card'),
      allowedOriginIds: ['child_today_path_card'] as const,
      entityParam: undefined,
    };

    expect(
      resolveR002bRouteRequest({
        ...base,
        flags: resolveR002bFeatureFlags({ r002b_impact_path_ui: true }),
        requestedProfileParam: ['child_salem'],
      }),
    ).toMatchObject({ allowed: false, fallback: '/child', reason: 'invalid_route_param' });
    expect(
      resolveR002bRouteRequest({
        ...base,
        flags: resolveR002bFeatureFlags({}),
        requestedProfileParam: 'child_salem',
      }),
    ).toMatchObject({ allowed: false, fallback: '/child', reason: 'feature_disabled' });
    expect(
      resolveR002bRouteRequest({
        ...base,
        flags: resolveR002bFeatureFlags({ r002b_impact_path_ui: true }),
        requestedProfileParam: 'child_alya',
      }),
    ).toMatchObject({ allowed: false, fallback: '/child', reason: 'profile_not_authorized' });
  });

  it('rejects a valid same-role origin that is not authorized for this destination', () => {
    const result = resolveR002bRouteRequest({
      routeId: 'impact_path',
      role: 'child',
      activeProfileId: 'child_salem',
      authorizedProfileIds: ['child_salem'],
      flags: resolveR002bFeatureFlags({ r002b_impact_path_ui: true }),
      requestedProfileParam: 'child_salem',
      entityParam: undefined,
      originParams: origin('badge_gallery_badge_card'),
      allowedOriginIds: ['child_today_path_card'],
    });

    expect(result).toEqual({
      allowed: false,
      fallback: '/child',
      reason: 'invalid_origin',
    });
  });

  it('requires a valid registry entity before accepting Badge Detail', () => {
    const flags = resolveR002bFeatureFlags({ r002b_badges_ui: true });
    const shared = {
      routeId: 'badge_detail' as const,
      role: 'child' as const,
      activeProfileId: 'child_salem',
      authorizedProfileIds: ['child_salem'] as const,
      flags,
      requestedProfileParam: 'child_salem',
      originParams: origin('badge_gallery_badge_card'),
      allowedOriginIds: ['badge_gallery_badge_card'] as const,
    };

    expect(
      resolveR002bRouteRequest({ ...shared, entityParam: 'badge.skill.sorting.bud.v1' }),
    ).toMatchObject({ allowed: true, entityId: 'badge.skill.sorting.bud.v1' });
    expect(
      resolveR002bRouteRequest({ ...shared, entityParam: ['badge.unknown.v1'] }),
    ).toMatchObject({
      allowed: false,
      fallback: '/child',
      reason: 'invalid_route_param',
    });
  });

  it('accepts only the exact learning package and Impact Path learning origin', () => {
    const base = {
      routeId: 'learning_story' as const,
      role: 'child' as const,
      activeProfileId: 'child_salem',
      authorizedProfileIds: ['child_salem'] as const,
      flags: resolveR002bFeatureFlags({ r002b_learning_ui: true }),
      requestedProfileParam: 'child_salem',
      entityParam: 'learning.mangrove_roots.v1',
      originParams: origin('impact_path_learning_action'),
      allowedOriginIds: ['impact_path_learning_action'] as const,
    };

    expect(resolveR002bRouteRequest(base)).toMatchObject({
      allowed: true,
      entityId: 'learning.mangrove_roots.v1',
      back: { href: '/garden/impact-path' },
    });
    expect(resolveR002bRouteRequest({ ...base, routeId: 'learning_accessible' })).toMatchObject({
      allowed: true,
    });
    expect(resolveR002bRouteRequest({ ...base, entityParam: 'learning.unknown.v1' })).toMatchObject(
      {
        allowed: false,
        fallback: '/child',
        reason: 'invalid_entity',
      },
    );
    expect(
      resolveR002bRouteRequest({ ...base, originParams: origin('child_today_path_card') }),
    ).toMatchObject({ allowed: false, fallback: '/child', reason: 'invalid_origin' });
  });

  it('accepts a Reveal only with its exact typed Child handoff and bundle entity', () => {
    const bundleId = 'reveal:child_salem:recognition:submission_1';
    const result = resolveR002bRouteRequest({
      routeId: 'child_reveal',
      role: 'child',
      activeProfileId: 'child_salem',
      authorizedProfileIds: ['child_salem'],
      flags: resolveR002bFeatureFlags({ r002b_reveal_bundle_v2: true }),
      requestedProfileParam: 'child_salem',
      entityParam: bundleId,
      originParams: origin('child_today_reveal_handoff'),
      allowedOriginIds: ['child_today_reveal_handoff'],
    });

    expect(result).toMatchObject({ allowed: true, entityId: bundleId, back: { href: '/child' } });
    expect(
      resolveR002bRouteRequest({
        routeId: 'child_reveal',
        role: 'child',
        activeProfileId: 'child_salem',
        authorizedProfileIds: ['child_salem'],
        flags: resolveR002bFeatureFlags({ r002b_reveal_bundle_v2: true }),
        requestedProfileParam: 'child_salem',
        entityParam: bundleId,
        originParams: origin('child_today_path_card'),
        allowedOriginIds: ['child_today_reveal_handoff'],
      }),
    ).toMatchObject({ allowed: false, reason: 'invalid_origin' });
  });

  it.each(['child_garden_shared_growth_card', 'child_league_shared_growth_card'] as const)(
    'accepts only the documented Child Shared Growth origin %s',
    (originId) => {
      const result = resolveR002bRouteRequest({
        routeId: 'shared_growth',
        role: 'child',
        activeProfileId: 'child_salem',
        authorizedProfileIds: ['child_salem'],
        flags: resolveR002bFeatureFlags({ r002b_shared_growth_view: true }),
        requestedProfileParam: 'child_salem',
        entityParam: undefined,
        originParams: origin(originId),
        allowedOriginIds: ['child_garden_shared_growth_card', 'child_league_shared_growth_card'],
      });

      expect(result).toMatchObject({ allowed: true, requestedProfileId: 'child_salem' });
    },
  );

  it('accepts only the Parent Garden origin for Shared Garden settings', () => {
    const accepted = resolveR002bRouteRequest({
      routeId: 'parent_shared_garden',
      role: 'parent',
      activeProfileId: 'child_salem',
      authorizedProfileIds: ['child_salem', 'child_alya'],
      flags: resolveR002bFeatureFlags({ r002b_shared_growth_view: true }),
      requestedProfileParam: 'child_salem',
      entityParam: undefined,
      originParams: origin('parent_garden_shared_settings_card'),
      allowedOriginIds: ['parent_garden_shared_settings_card'],
    });

    expect(accepted).toMatchObject({
      allowed: true,
      requestedProfileId: 'child_salem',
      back: { href: '/garden' },
    });
    expect(
      resolveR002bRouteRequest({
        routeId: 'parent_shared_garden',
        role: 'parent',
        activeProfileId: 'child_salem',
        authorizedProfileIds: ['child_salem', 'child_alya'],
        flags: resolveR002bFeatureFlags({ r002b_shared_growth_view: true }),
        requestedProfileParam: 'child_salem',
        entityParam: undefined,
        originParams: origin('child_garden_shared_growth_card'),
        allowedOriginIds: ['parent_garden_shared_settings_card'],
      }),
    ).toEqual({ allowed: false, fallback: '/parent', reason: 'invalid_origin' });
  });
});

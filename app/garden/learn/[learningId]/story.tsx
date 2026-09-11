import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { R002bNestedScreen } from '@/components/r002b/R002bNestedScreen';
import { MangroveStoryScreen } from '@/components/r002b/LearningScreens';
import { r002bFeatureFlags } from '@/config/r002bFeatureFlags';
import { createR002bLearningBackHandler } from '@/features/learning/r002bLearningNavigation';
import { useR002bLearningPresentation } from '@/features/learning/useR002bLearningPresentation';
import { createR002bOrigin, serializeR002bOrigin } from '@/features/navigation/r002bOrigin';
import {
  resolveR002bRouteRequest,
  type R002bRouteParam,
} from '@/features/navigation/r002bRouteRequest';
import type { SyntheticChildId } from '@/models/familyGrowth';
import type { LearningRoute } from '@/models/learning';
import { selectCanEnterChildExperience, usePrototypeStore } from '@/state/usePrototypeStore';

interface LearningStoryParams extends Record<string, R002bRouteParam> {
  readonly learningId?: R002bRouteParam;
  readonly profileId?: R002bRouteParam;
  readonly originId?: R002bRouteParam;
  readonly originProfileId?: R002bRouteParam;
  readonly originScrollOffset?: R002bRouteParam;
  readonly originFilter?: R002bRouteParam;
  readonly originEntityId?: R002bRouteParam;
}

const ALLOWED_ORIGINS = ['impact_path_learning_action', 'badge_detail_learning_action'] as const;

export default function LearningStoryRoute() {
  const params = useLocalSearchParams() as unknown as LearningStoryParams;
  const role = usePrototypeStore((state) => state.role);
  const activeExperience = usePrototypeStore((state) => state.activeExperience);
  const canEnterChildExperience = usePrototypeStore(selectCanEnterChildExperience);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);

  if (activeExperience === 'parent') return <Redirect href={'/parent' as Href} />;
  if (activeExperience !== 'child' || !canEnterChildExperience) {
    return <Redirect href={'/' as Href} />;
  }
  const access = resolveR002bRouteRequest({
    routeId: 'learning_story',
    role,
    activeProfileId: activeChildId,
    authorizedProfileIds: [activeChildId],
    flags: r002bFeatureFlags,
    requestedProfileParam: params.profileId,
    entityParam: params.learningId,
    originParams: params,
    allowedOriginIds: ALLOWED_ORIGINS,
  });

  if (!access.allowed) return <Redirect href={access.fallback} />;

  return <AuthorizedLearningStory access={access} profileId={activeChildId} />;
}

function AuthorizedLearningStory({
  access,
  profileId,
}: {
  readonly access: Extract<ReturnType<typeof resolveR002bRouteRequest>, { allowed: true }>;
  readonly profileId: SyntheticChildId;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const language = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const navigateToMode = (route: LearningRoute) => {
    router.replace({
      pathname:
        route === 'story'
          ? '/garden/learn/[learningId]/story'
          : '/garden/learn/[learningId]/accessible',
      params: {
        learningId: access.entityId,
        profileId,
        ...serializeR002bOrigin(access.origin),
      },
    } as unknown as Href);
  };
  const learning = useR002bLearningPresentation({
    navigateToMode,
    profileId,
    route: 'story',
  });

  if (!learning.ok || learning.data.kind !== 'story') return <Redirect href="/child" />;

  const onBack = createR002bLearningBackHandler({
    state: learning.state,
    profileId,
    canGoBack: () => router.canGoBack(),
    goBack: () => router.back(),
    replaceValidatedOrigin: (intent) => {
      if (intent.kind === 'badge_detail') {
        const badgeOrigin = createR002bOrigin({
          id: 'badge_gallery_badge_card',
          profileId,
          entityId: intent.badgeId,
          filter: intent.filter,
          scrollOffset: intent.galleryScrollOffset,
        });
        if (!badgeOrigin.ok) {
          router.replace('/child');
          return;
        }
        router.replace({
          pathname: '/garden/badges/[badgeId]',
          params: {
            badgeId: intent.badgeId,
            profileId,
            ...serializeR002bOrigin(badgeOrigin.data),
            restoreProfileId: profileId,
            restoreFocusTarget: intent.focusTargetId,
            restoreScrollOffset: String(intent.scrollOffset),
          },
        } as unknown as Href);
        return;
      }
      if (intent.route !== '/garden/impact-path') {
        router.replace('/child');
        return;
      }
      const returnOrigin = createR002bOrigin({
        id: 'impact_path_learning_action',
        profileId,
        scrollOffset: intent.scrollOffset,
      });
      if (!returnOrigin.ok) {
        router.replace('/child');
        return;
      }
      router.replace({
        pathname: '/garden/impact-path',
        params: {
          profileId,
          ...serializeR002bOrigin(returnOrigin.data),
          restoreProfileId: profileId,
          restoreFocusTarget: intent.focusTargetId,
          restoreScrollOffset: String(intent.scrollOffset),
        },
      } as unknown as Href);
    },
    replaceSafeRoot: () => router.replace('/child'),
  });

  return (
    <R002bNestedScreen
      backLabel={t('common.back')}
      direction={direction}
      language={language}
      onBack={onBack}
      reducedMotion={learning.data.props.reducedMotion}
      testID="r002b-learning-story-route"
      title={t('learning.mangroveRoots.title')}
    >
      <MangroveStoryScreen {...learning.data.props} />
    </R002bNestedScreen>
  );
}

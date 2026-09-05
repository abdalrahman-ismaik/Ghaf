import type { ResolveR002bOriginResult } from './r002bOrigin';

type RestoredOrigin = Extract<ResolveR002bOriginResult, { restored: true }>;

export interface R002bBackNavigationTarget {
  readonly pathname: '/child' | '/garden' | '/circle' | '/parent';
  readonly params: {
    readonly restoreFocusTarget: string;
    readonly restoreProfileId: string;
    readonly restoreScrollOffset: string;
    readonly restoreFilter?: string;
  };
}

function directRoot(href: string): R002bBackNavigationTarget['pathname'] | null {
  if (href === '/child' || href === '/garden' || href === '/circle' || href === '/parent') {
    return href;
  }
  return null;
}

export function createValidatedBackHandler(input: {
  readonly back: RestoredOrigin;
  readonly canGoBack: () => boolean;
  readonly goBack: () => void;
  readonly profileId: string;
  readonly replace: (target: R002bBackNavigationTarget | '/child' | '/parent') => void;
  readonly safeRoot: '/child' | '/parent';
}): () => void {
  return () => {
    if (input.canGoBack()) {
      input.goBack();
      return;
    }

    const pathname = directRoot(input.back.href);
    if (!pathname) {
      input.replace(input.safeRoot);
      return;
    }

    input.replace({
      pathname,
      params: {
        restoreFocusTarget: input.back.focusTarget,
        restoreProfileId: input.profileId,
        restoreScrollOffset: String(input.back.scrollOffset),
        ...(input.back.filter === null ? {} : { restoreFilter: input.back.filter }),
      },
    });
  };
}

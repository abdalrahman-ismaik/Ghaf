import type { EntryMode } from '../../models/demoEntry';
import type { LocalFamilyRecord } from '../../models/localFamily';
import type { SyntheticChildId } from '../../models/familyGrowth';
import type { ParentOnboardingHandoff } from '../../models/parentOnboarding';
import type { ServiceResult } from '../../services/interfaces';
import type { LocalFamilyRepository } from '../../services/local/repository';
import { isExactPlainDataEqual } from '../../utils/exactPlainData';
import { localFamilyRecordToReceipt, parseLocalFamilyRecord } from '../local-family';
import type { ChildAccessController, ChildAccessView } from './childAccess';
import { createCanonicalDemoFamily } from './demoEntry';
import type { ParentOnboardingController } from './parentOnboarding/controller';

export interface LocalParentEntryContext {
  readonly mode: EntryMode;
  readonly activeExperience: 'signed_out' | 'parent' | 'child';
  readonly activeChildId: SyntheticChildId;
  readonly resetFailed: boolean;
  readonly familyReady: boolean;
  readonly family: LocalFamilyRecord | null;
  readonly incompleteSetup: boolean;
  readonly temporaryChildId: SyntheticChildId | null;
}

interface LocalParentEntryDependencies {
  readonly family: Pick<LocalFamilyRepository, 'read' | 'save'>;
  readonly parent: Pick<
    ParentOnboardingController,
    'getView' | 'restoreCompletionReceipt' | 'resumeRememberedParent' | 'authorizeParentExperience'
  >;
  readonly child: Pick<ChildAccessController, 'getView' | 'restorePairedDevices'>;
  readonly readContext: () => LocalParentEntryContext;
  readonly now: () => string;
  readonly runAtomically: <T>(operation: () => ServiceResult<T>) => ServiceResult<T>;
}

interface LocalParentEntryResult {
  readonly handoff: ParentOnboardingHandoff;
  readonly family: LocalFamilyRecord;
  readonly parent: ReturnType<ParentOnboardingController['getView']>;
  readonly child: ChildAccessView;
}

function failure(message: string): ServiceResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_TRANSITION',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

export function createLocalParentEntry(dependencies: LocalParentEntryDependencies) {
  let busy = false;
  let aborted = false;

  return (): ServiceResult<LocalParentEntryResult> => {
    if (busy) {
      aborted = true;
      return failure('Local Parent entry is already in progress');
    }
    busy = true;
    aborted = false;
    try {
      const context = dependencies.readContext();
      const parent = dependencies.parent.getView();
      const child = dependencies.child.getView();
      if (
        context.mode !== 'ordinary' ||
        context.activeExperience !== 'signed_out' ||
        context.resetFailed ||
        !context.familyReady ||
        context.incompleteSetup ||
        parent.status !== 'signed_out' ||
        parent.canEnterParentExperience ||
        child.status === 'authenticated_child' ||
        (context.family === null && child.status !== 'signed_out') ||
        child.canEnterChildExperience
      ) {
        return failure('Choose a local Parent only from a ready signed-out experience');
      }
      const stillCurrent = () =>
        !aborted && isExactPlainDataEqual(context, dependencies.readContext());
      const stored = dependencies.family.read();
      if (!stored.ok) return stored;
      if (!isExactPlainDataEqual(stored.data, context.family)) {
        return failure('The local family changed; reopen account selection');
      }
      const now = dependencies.now();
      const candidate = stored.data
        ? parseLocalFamilyRecord(JSON.stringify(stored.data))
        : createCanonicalDemoFamily(now);
      if (!candidate.ok) return candidate;
      const family = candidate.data;
      if (
        !stillCurrent() ||
        (context.temporaryChildId !== null && stored.data === null) ||
        (parent.completionReceipt &&
          (parent.completionReceipt.householdId !== family.householdId ||
            parent.completionReceipt.completedAt !== family.createdAt))
      ) {
        return failure('The local Parent account no longer matches this entry');
      }

      return dependencies.runAtomically(() => {
        if (!stillCurrent()) return failure('Local Parent entry was interrupted');
        if (!parent.completionReceipt) {
          const restored = dependencies.parent.restoreCompletionReceipt(
            localFamilyRecordToReceipt(family),
          );
          if (!restored.ok) return restored;
          const paired = dependencies.child.restorePairedDevices({
            childIds: family.pairedChildIds,
            pairedAt: family.updatedAt,
          });
          if (!paired.ok) return paired;
        }
        const entered = dependencies.parent.resumeRememberedParent(now);
        if (!entered.ok) return entered;
        const authorized = dependencies.parent.authorizeParentExperience(now);
        if (!authorized.ok) return authorized;
        const parentView = dependencies.parent.getView();
        const childView = dependencies.child.getView();
        if (
          !stillCurrent() ||
          !isExactPlainDataEqual(entered.data, authorized.data) ||
          entered.data.origin !== 'synthetic' ||
          entered.data.destination !== '/parent' ||
          parentView.productionAuthentication !== false ||
          parentView.capabilityTruth !== 'local_prototype_not_authentication' ||
          parentView.status !== 'authenticated_parent' ||
          !parentView.canEnterParentExperience ||
          childView.status === 'authenticated_child' ||
          (parent.completionReceipt && !isExactPlainDataEqual(childView, child)) ||
          childView.canEnterChildExperience
        ) {
          return failure('Local Parent authority could not be established');
        }
        const result: ServiceResult<LocalParentEntryResult> = {
          ok: true,
          data: { handoff: authorized.data, family, parent: parentView, child: childView },
          meta: { origin: 'synthetic', fallbackUsed: false },
        };
        // Persist only a new family, after every authority check; failures roll back the sessions.
        if (stored.data === null) {
          const saved = dependencies.family.save(family);
          if (!saved.ok) return saved;
        }
        return result;
      });
    } catch {
      return failure('Local Parent entry could not be completed');
    } finally {
      busy = false;
      aborted = false;
    }
  };
}

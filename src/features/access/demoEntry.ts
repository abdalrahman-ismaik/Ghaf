import type {
  DemoEntryContext,
  DemoEntryHandoff,
  DemoEntryRequest,
  DemoPrincipal,
} from '../../models/demoEntry';
import type { DomainErrorCode, SyntheticChildId } from '../../models/familyGrowth';
import type { LocalChildProfile, LocalFamilyRecord } from '../../models/localFamily';
import type { ParentOnboardingHandoff, ParentOnboardingView } from '../../models/parentOnboarding';
import type { ServiceResult } from '../../services/interfaces';
import type { LocalFamilyRepository } from '../../services/local/repository';
import {
  hasExactPlainDataKeys,
  isExactPlainDataEqual,
  isPlainDataRecord,
} from '../../utils/exactPlainData';
import {
  createLocalFamilyRecord,
  localFamilyRecordToReceipt,
  parseLocalFamilyRecord,
} from '../local-family/schema';
import type { ChildAccessController, ChildAccessView } from './childAccess';
import type { ParentOnboardingController } from './parentOnboarding/controller';
import {
  createInitialParentOnboardingDraft,
  normalizeParentIdentifier,
} from './parentOnboarding/policy';

export interface DemoEntryDependencies {
  readonly family: LocalFamilyRepository;
  readonly parent: Pick<
    ParentOnboardingController,
    'getView' | 'restoreCompletionReceipt' | 'resumeRememberedParent'
  >;
  readonly child: Pick<
    ChildAccessController,
    'getView' | 'restorePairedDevices' | 'resumeRememberedChild'
  >;
  readonly readContext: () => DemoEntryContext;
  readonly now: () => string;
  readonly runAtomically: <T>(operation: () => ServiceResult<T>) => ServiceResult<T>;
}

export interface DemoEntryAdapter {
  enter(request: DemoEntryRequest): ServiceResult<DemoEntryHandoff>;
  invalidate(): void;
}

const CHILD_IDS = ['child_salem', 'child_alya'] as const;
const PRINCIPALS: readonly DemoPrincipal[] = ['parent_al_noor', ...CHILD_IDS];
const TRUTH = 'local_prototype_not_authentication';

function failure(code: DomainErrorCode, message: string): ServiceResult<never> {
  return { ok: false, error: { code, message, retryable: false, fallbackAvailable: false } };
}

function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data, meta: { origin: 'synthetic', fallbackUsed: false } };
}

function validCounter(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function validRequest(value: unknown): value is DemoEntryRequest {
  return (
    isPlainDataRecord(value) &&
    hasExactPlainDataKeys(value, ['principal', 'expectedGeneration', 'expectedEpoch']) &&
    PRINCIPALS.includes(value.principal as DemoPrincipal) &&
    validCounter(value.expectedGeneration) &&
    validCounter(value.expectedEpoch)
  );
}

function validContext(value: DemoEntryContext, request: DemoEntryRequest): boolean {
  return (
    isPlainDataRecord(value) &&
    value.mode === 'demo' &&
    validCounter(value.runGeneration) &&
    validCounter(value.entryEpoch) &&
    value.runGeneration === request.expectedGeneration &&
    value.entryEpoch === request.expectedEpoch &&
    value.activeExperience === 'signed_out' &&
    value.temporaryParentAccess === false &&
    CHILD_IDS.includes(value.activeChildId)
  );
}

function signedOut(parent: ParentOnboardingView, child: ChildAccessView): boolean {
  return (
    parent.status === 'signed_out' &&
    parent.canEnterParentExperience === false &&
    child.status === 'signed_out' &&
    child.canEnterChildExperience === false
  );
}

function validFamily(record: LocalFamilyRecord): ServiceResult<LocalFamilyRecord> {
  const parsed = parseLocalFamilyRecord(JSON.stringify(record));
  if (!parsed.ok) return parsed;
  const family = parsed.data;
  if (
    family.children.length !== 2 ||
    !CHILD_IDS.every((id, index) => family.children[index]?.id === id) ||
    family.pairedChildIds.length !== 2 ||
    !CHILD_IDS.every((id) => family.pairedChildIds.includes(id)) ||
    family.parent.normalizedIdentifier !== 'parent@example.com' ||
    family.parent.identifierKind !== 'email'
  ) {
    return failure('INVALID_INPUT', 'The isolated demo requires its canonical three profiles');
  }
  return success(family);
}

export function createCanonicalDemoFamily(now: string): ServiceResult<LocalFamilyRecord> {
  try {
    const identifier = normalizeParentIdentifier('parent@example.com');
    if (!identifier.ok) return identifier;
    const draft = createInitialParentOnboardingDraft();
    const children: LocalChildProfile[] = [];
    for (const { profileId, ...child } of draft.children) {
      if (child.sex === null)
        return failure('INVALID_RESPONSE', 'The prepared profile is incomplete');
      children.push({
        ...child,
        id: profileId,
        role: 'child',
        sex: child.sex,
        nickname: profileId === 'child_alya' ? 'علياء' : child.nickname,
      });
    }
    const created = createLocalFamilyRecord({
      familyName: 'عائلة أبو راشد',
      familyConnections: {
        primaryGuardianName: 'وليّ الأمر',
        secondaryGuardianName: '',
        relatives: [],
      },
      appLanguage: 'ar',
      parentIdentifier: identifier.data,
      children,
      pairedChildIds: CHILD_IDS,
      now,
    });
    return created.ok ? success(created.data) : created;
  } catch {
    return failure('INVALID_INPUT', 'The prepared demo family could not be created');
  }
}

function validParentHandoff(value: ParentOnboardingHandoff): boolean {
  return (
    value.authorized === true &&
    value.capability === 'enter_parent_experience' &&
    value.destination === '/parent' &&
    value.receiptId === 'parent_onboarding_al_noor_r001_v1' &&
    value.origin === 'synthetic'
  );
}

function validChildHandoff(value: ChildAccessView, childId: SyntheticChildId): boolean {
  return (
    value.status === 'authenticated_child' &&
    value.selectedChildId === childId &&
    value.canEnterChildExperience === true &&
    value.origin === 'synthetic' &&
    value.capabilityTruth === TRUTH &&
    value.productionAuthentication === false
  );
}

export function createDemoEntryAdapter(dependencies: DemoEntryDependencies): DemoEntryAdapter {
  let initialized: { generation: number; createdAt: string } | null = null;
  let revision = 0;
  let busy = false;
  let aborted = false;

  return {
    invalidate() {
      revision += 1;
      initialized = null;
      if (busy) aborted = true;
    },
    enter(input) {
      if (busy) {
        aborted = true;
        return failure('INVALID_TRANSITION', 'Demo entry cannot reenter an active attempt');
      }
      busy = true;
      aborted = false;
      const attemptRevision = revision;
      try {
        if (!validRequest(input)) return failure('INVALID_INPUT', 'Choose one valid demo profile');
        const request: DemoEntryRequest = { ...input };
        if (!validRequest(request))
          return failure('INVALID_INPUT', 'Choose one valid demo profile');
        const initialContext = { ...dependencies.readContext() };
        const stillCurrent = () => {
          const current = dependencies.readContext();
          return (
            !aborted &&
            revision === attemptRevision &&
            validContext(current, request) &&
            current.activeChildId === initialContext.activeChildId
          );
        };
        if (
          !validContext(initialContext, request) ||
          !signedOut(dependencies.parent.getView(), dependencies.child.getView())
        ) {
          return failure(
            'INVALID_TRANSITION',
            'Demo entry requires a current signed-out experience',
          );
        }
        if (initialized && initialized.generation !== request.expectedGeneration) {
          return failure('INVALID_TRANSITION', 'Reset must invalidate the previous demo run');
        }
        const now = dependencies.now();
        if (typeof now !== 'string' || new Date(now).toISOString() !== now) {
          return failure('INVALID_INPUT', 'Demo entry requires a valid prepared time');
        }
        const stored = dependencies.family.read();
        if (!stored.ok) return stored;
        let family: LocalFamilyRecord;
        if (stored.data === null) {
          if (initialized)
            return failure('INVALID_TRANSITION', 'The initialized demo family is missing');
          if (!stillCurrent())
            return failure('INVALID_TRANSITION', 'The demo entry attempt is stale');
          const created = createCanonicalDemoFamily(now);
          if (!created.ok) return created;
          const saved = dependencies.family.save(created.data);
          if (!saved.ok) return saved;
          const validated = validFamily(saved.data);
          if (!validated.ok) return validated;
          if (!isExactPlainDataEqual(validated.data, created.data)) {
            return failure(
              'INVALID_RESPONSE',
              'The saved demo family does not match initialization',
            );
          }
          family = validated.data;
        } else {
          const validated = validFamily(stored.data);
          if (!validated.ok) return validated;
          family = validated.data;
          if (initialized) {
            if (family.createdAt !== initialized.createdAt) {
              return failure('INVALID_TRANSITION', 'The initialized demo family was replaced');
            }
          } else {
            const canonical = createCanonicalDemoFamily(family.createdAt);
            if (!canonical.ok || !isExactPlainDataEqual(family, canonical.data)) {
              return failure(
                'INVALID_TRANSITION',
                'An existing family cannot be replaced by demo entry',
              );
            }
          }
        }
        if (!stillCurrent())
          return failure('INVALID_TRANSITION', 'The demo entry attempt is stale');

        // Every fallible authority/postcondition check stays inside the owning rollback wrappers.
        const result = dependencies.runAtomically(() => {
          if (
            !stillCurrent() ||
            !signedOut(dependencies.parent.getView(), dependencies.child.getView())
          ) {
            return failure('INVALID_TRANSITION', 'The signed-out demo changed before entry');
          }
          if (!initialized) {
            const restored = dependencies.parent.restoreCompletionReceipt(
              localFamilyRecordToReceipt(family),
            );
            if (!restored.ok) return restored;
            const paired = dependencies.child.restorePairedDevices({
              childIds: family.pairedChildIds,
              pairedAt: family.createdAt,
            });
            if (!paired.ok) return paired;
          }
          if (!stillCurrent())
            return failure('INVALID_TRANSITION', 'The demo entry attempt is stale');
          if (request.principal === 'parent_al_noor') {
            const entered = dependencies.parent.resumeRememberedParent(now);
            if (!entered.ok) return entered;
            if (!validParentHandoff(entered.data)) {
              return failure('INVALID_RESPONSE', 'The demo Parent handoff was not authorized');
            }
          } else {
            const entered = dependencies.child.resumeRememberedChild(request.principal, now);
            if (!entered.ok) return entered;
            if (!validChildHandoff(entered.data, request.principal)) {
              return failure(
                'INVALID_RESPONSE',
                'The demo Child handoff does not match the selection',
              );
            }
          }
          const parentOnboarding = dependencies.parent.getView();
          const childAccess = dependencies.child.getView();
          const receipt = parentOnboarding.completionReceipt;
          const parentSelected = request.principal === 'parent_al_noor';
          if (
            !stillCurrent() ||
            parentOnboarding.origin !== 'synthetic' ||
            parentOnboarding.capabilityTruth !== TRUTH ||
            parentOnboarding.productionAuthentication !== false ||
            !receipt ||
            receipt.householdId !== family.householdId ||
            receipt.completedAt !== family.createdAt ||
            receipt.childCount !== 2 ||
            !CHILD_IDS.every((id, index) => receipt.children[index]?.profileId === id) ||
            (parentSelected
              ? parentOnboarding.status !== 'authenticated_parent' ||
                parentOnboarding.canEnterParentExperience !== true ||
                childAccess.status !== 'signed_out' ||
                childAccess.canEnterChildExperience !== false
              : parentOnboarding.status !== 'signed_out' ||
                parentOnboarding.canEnterParentExperience !== false ||
                !validChildHandoff(childAccess, request.principal as SyntheticChildId))
          ) {
            return failure('INVALID_TRANSITION', 'Demo entry postconditions no longer match');
          }
          return success<DemoEntryHandoff>({
            principal: request.principal,
            destination: parentSelected ? '/parent' : '/child',
            activeChildId: parentSelected
              ? initialContext.activeChildId
              : (request.principal as SyntheticChildId),
            family,
            parentOnboarding,
            childAccess,
            runGeneration: request.expectedGeneration,
            entryEpoch: request.expectedEpoch,
          });
        });
        if (result.ok)
          initialized = { generation: request.expectedGeneration, createdAt: family.createdAt };
        return result;
      } catch {
        return failure('INVALID_RESPONSE', 'The prepared demo entry could not be completed');
      } finally {
        busy = false;
        aborted = false;
      }
    },
  };
}

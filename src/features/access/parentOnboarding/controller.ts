import { SYNTHETIC_PARENT_ACCESS_FIXTURE, type ParentAccessSession } from '../../../models/access';
import type { DomainErrorCode } from '../../../models/familyGrowth';
import type {
  ParentOnboardingCompletionReceipt,
  ParentOnboardingDraft,
  ParentOnboardingDraftPatch,
  ParentOnboardingHandoff,
  ParentOnboardingStatus,
  ParentOnboardingView,
} from '../../../models/parentOnboarding';
import type { ServiceResult, SyntheticAccessService } from '../../../services/interfaces';
import {
  createInitialParentOnboardingDraft,
  normalizeParentIdentifier,
  PARENT_VERIFICATION_CODE,
  toAccessLanguagePreference,
  updateParentOnboardingDraft,
  validateCompleteParentOnboardingDraft,
} from './policy';

const CAPABILITY_TRUTH = 'local_prototype_not_authentication' as const;
const COMPLETION_RECEIPT_ID = 'parent_onboarding_al_noor_r001_v1' as const;

export interface ParentOnboardingControllerConfig {
  readonly sessionId: string;
  readonly deviceId: string;
}

export type ParentOnboardingAccessAuthority = Pick<
  SyntheticAccessService,
  'signInParent' | 'authorizeCapability' | 'terminateParentSession'
>;

const DEFAULT_CONFIG: ParentOnboardingControllerConfig = Object.freeze({
  sessionId: 'parent-onboarding-r001-session-v1',
  deviceId: 'parent-onboarding-r001-device-v1',
});

function failure(code: DomainErrorCode, message: string): ServiceResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: false },
  };
}

function success<T>(
  data: T,
  options: { readonly fallbackUsed?: boolean; readonly fixtureId?: string } = {},
): ServiceResult<T> {
  return {
    ok: true,
    data,
    meta: {
      origin: 'synthetic',
      fallbackUsed: options.fallbackUsed ?? false,
      ...(options.fixtureId ? { fixtureId: options.fixtureId } : {}),
    },
  };
}

function cloneDraft(draft: ParentOnboardingDraft): ParentOnboardingDraft {
  return {
    ...draft,
    child: {
      ...draft.child,
      accessibilityDefaults: [...draft.child.accessibilityDefaults],
    },
  };
}

function cloneReceipt(
  receipt: ParentOnboardingCompletionReceipt,
): ParentOnboardingCompletionReceipt {
  return {
    ...receipt,
    child: {
      ...receipt.child,
      accessibilityDefaults: [...receipt.child.accessibilityDefaults],
    },
  };
}

export class ParentOnboardingController {
  private status: ParentOnboardingStatus = 'signed_out';
  private identifierKind: ParentOnboardingView['identifierKind'] = null;
  private maskedDestination: string | null = null;
  private delivery: ParentOnboardingView['delivery'] = null;
  private offlineFallbackUsed = false;
  private draft = createInitialParentOnboardingDraft();
  private parentSession: ParentAccessSession | null = null;
  private completionReceipt: ParentOnboardingCompletionReceipt | null = null;
  private verificationAttempt = 0;

  constructor(
    private readonly access: ParentOnboardingAccessAuthority,
    private readonly config: ParentOnboardingControllerConfig = DEFAULT_CONFIG,
  ) {}

  getView(): ParentOnboardingView {
    return {
      status: this.status,
      identifierKind: this.identifierKind,
      maskedDestination: this.maskedDestination,
      delivery: this.delivery,
      offlineFallbackUsed: this.offlineFallbackUsed,
      productionAuthentication: false,
      capabilityTruth: CAPABILITY_TRUTH,
      returnGate: 'pin',
      canEnterParentExperience: this.parentSession !== null && this.completionReceipt !== null,
      draft: cloneDraft(this.draft),
      completionReceipt: this.completionReceipt ? cloneReceipt(this.completionReceipt) : null,
      origin: 'synthetic',
    };
  }

  requestVerification(input: {
    readonly identifier: unknown;
    readonly networkAvailable?: boolean;
  }): ServiceResult<ParentOnboardingView> {
    if (this.status === 'authenticated_parent') {
      return failure('INVALID_TRANSITION', 'The synthetic Parent session is already active');
    }
    const normalized = normalizeParentIdentifier(input.identifier);
    if (!normalized.ok) return { ok: false, error: normalized.error };

    this.verificationAttempt += 1;
    this.status = 'code_sent';
    this.identifierKind = normalized.data.identifierKind;
    this.maskedDestination = normalized.data.maskedDestination;
    this.delivery = 'local_fixture';
    this.offlineFallbackUsed = input.networkAvailable === false;
    return success(this.getView(), {
      fallbackUsed: this.offlineFallbackUsed,
      fixtureId: 'parent_access_r001',
    });
  }

  async verifyCode(code: unknown): Promise<ServiceResult<ParentOnboardingView>> {
    if (this.status === 'verified') {
      return success(this.getView(), {
        fallbackUsed: this.offlineFallbackUsed,
        fixtureId: 'parent_access_r001',
      });
    }
    if (this.status !== 'code_sent') {
      return failure('INVALID_TRANSITION', 'Request the synthetic verification code first');
    }

    const attempt = ++this.verificationAttempt;
    this.status = 'verifying';
    await Promise.resolve();
    if (attempt !== this.verificationAttempt || this.status !== 'verifying') {
      return failure('INVALID_TRANSITION', 'The synthetic verification attempt was interrupted');
    }
    if (typeof code !== 'string' || !/^\d{6}$/u.test(code) || code !== PARENT_VERIFICATION_CODE) {
      this.status = 'code_sent';
      return failure('INVALID_INPUT', 'The synthetic verification code is not correct');
    }

    this.status = 'verified';
    return success(this.getView(), {
      fallbackUsed: this.offlineFallbackUsed,
      fixtureId: 'parent_access_r001',
    });
  }

  resendVerification(input: {
    readonly networkAvailable?: boolean;
  }): ServiceResult<ParentOnboardingView> {
    if (this.status !== 'code_sent' && this.status !== 'verified') {
      return failure('INVALID_TRANSITION', 'Request the synthetic verification code first');
    }
    this.verificationAttempt += 1;
    this.status = 'code_sent';
    this.offlineFallbackUsed = input.networkAvailable === false;
    return success(this.getView(), {
      fallbackUsed: this.offlineFallbackUsed,
      fixtureId: 'parent_access_r001',
    });
  }

  cancelVerification(): ServiceResult<ParentOnboardingView> {
    if (this.status === 'authenticated_parent') {
      return failure('INVALID_TRANSITION', 'Reset the active synthetic Parent session instead');
    }
    this.verificationAttempt += 1;
    this.clearVerification();
    return success(this.getView());
  }

  updateDraft(patch: ParentOnboardingDraftPatch): ServiceResult<ParentOnboardingView> {
    if (this.status === 'authenticated_parent') {
      return failure('INVALID_TRANSITION', 'The completed onboarding receipt cannot be rewritten');
    }
    const updated = updateParentOnboardingDraft(this.draft, patch);
    if (!updated.ok) return { ok: false, error: updated.error };
    this.draft = updated.data;
    return success(this.getView());
  }

  complete(now: string): ServiceResult<ParentOnboardingCompletionReceipt> {
    if (this.completionReceipt && this.parentSession) {
      return success(cloneReceipt(this.completionReceipt), {
        fixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
      });
    }
    if (this.parentSession) {
      return failure(
        'INVALID_TRANSITION',
        'Reset the incomplete synthetic Parent session before trying again',
      );
    }
    if (this.status !== 'verified') {
      return failure('INVALID_TRANSITION', 'Complete synthetic Parent verification first');
    }
    const validatedDraft = validateCompleteParentOnboardingDraft(this.draft);
    if (!validatedDraft.ok) return { ok: false, error: validatedDraft.error };
    const signedIn = this.access.signInParent({
      sessionId: this.config.sessionId,
      parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
      deviceId: this.config.deviceId,
      now,
    });
    if (!signedIn.ok) return signedIn;
    const authorized = this.access.authorizeCapability({
      session: signedIn.data,
      capability: 'enter_parent_experience',
      now,
    });
    if (!authorized.ok) {
      const terminated = this.access.terminateParentSession({ session: signedIn.data, now });
      if (!terminated.ok) {
        this.parentSession = signedIn.data;
        return failure(
          'INVALID_TRANSITION',
          'The synthetic Parent session could not be safely established',
        );
      }
      return authorized;
    }

    this.draft = validatedDraft.data;
    this.parentSession = signedIn.data;
    this.completionReceipt = {
      receiptId: COMPLETION_RECEIPT_ID,
      completedAt: now,
      destination: '/parent',
      householdId: signedIn.data.householdId,
      familyName: validatedDraft.data.familyName,
      appLanguage: validatedDraft.data.appLanguage,
      child: {
        nickname: validatedDraft.data.child.nickname,
        avatarId: validatedDraft.data.child.avatarId,
        ageBand: validatedDraft.data.child.ageBand,
        accessLanguagePreference: toAccessLanguagePreference(
          validatedDraft.data.child.preferredLanguage,
        ),
        accessibilityDefaults: [...validatedDraft.data.child.accessibilityDefaults],
      },
      origin: 'synthetic',
      capabilityTruth: CAPABILITY_TRUTH,
    };
    this.status = 'authenticated_parent';
    return success(cloneReceipt(this.completionReceipt), {
      fixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
    });
  }

  authorizeParentExperience(now: string): ServiceResult<ParentOnboardingHandoff> {
    if (!this.parentSession || !this.completionReceipt || this.status !== 'authenticated_parent') {
      return failure('INVALID_TRANSITION', 'A completed Parent onboarding session is required');
    }
    const authorized = this.access.authorizeCapability({
      session: this.parentSession,
      capability: 'enter_parent_experience',
      now,
    });
    if (!authorized.ok) return authorized;
    return success({
      authorized: true,
      capability: 'enter_parent_experience',
      destination: '/parent',
      receiptId: this.completionReceipt.receiptId,
      origin: 'synthetic',
    });
  }

  reset(now: string): ServiceResult<ParentOnboardingView> {
    this.verificationAttempt += 1;
    if (this.parentSession) {
      const terminated = this.access.terminateParentSession({ session: this.parentSession, now });
      if (!terminated.ok) return terminated;
    }

    this.parentSession = null;
    this.completionReceipt = null;
    this.draft = createInitialParentOnboardingDraft();
    this.offlineFallbackUsed = false;
    this.clearVerification();
    return success(this.getView());
  }

  private clearVerification(): void {
    this.status = 'signed_out';
    this.identifierKind = null;
    this.maskedDestination = null;
    this.delivery = null;
    this.offlineFallbackUsed = false;
  }
}

export function createParentOnboardingController(
  access: ParentOnboardingAccessAuthority,
  config?: ParentOnboardingControllerConfig,
): ParentOnboardingController {
  return new ParentOnboardingController(access, config);
}

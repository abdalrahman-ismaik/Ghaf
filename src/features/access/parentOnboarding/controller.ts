import {
  SYNTHETIC_PARENT_ACCESS_FIXTURE,
  SYNTHETIC_PARENT_REAUTHENTICATION_CODE,
  SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
  type ChildPermissionChange,
  type ChildPermissionGrant,
  type DeviceAccessState,
  type PairingRequest,
  type ParentAccessSession,
} from '../../../models/access';
import type { DomainErrorCode, SyntheticChildId } from '../../../models/familyGrowth';
import type {
  ParentOnboardingCompletionReceipt,
  ParentOnboardingDraft,
  ParentOnboardingDraftPatch,
  ParentOnboardingHandoff,
  ParentOnboardingStatus,
  ParentOnboardingView,
  ParentReportHandoff,
  ParentSharedGrowthAccessHandoff,
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
> &
  Partial<
    Pick<
      SyntheticAccessService,
      | 'issueReauthentication'
      | 'authorizeSensitiveAction'
      | 'approvePairing'
      | 'getChildPermissions'
      | 'updateChildPermissions'
      | 'revokeDevice'
    >
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
    children: draft.children.map((child) => ({
      ...child,
      interests: [...child.interests],
      hobbies: [...child.hobbies],
      accessibilityDefaults: [...child.accessibilityDefaults],
      supportPreferences: [...child.supportPreferences],
    })),
  };
}

function cloneReceipt(
  receipt: ParentOnboardingCompletionReceipt,
): ParentOnboardingCompletionReceipt {
  return {
    ...receipt,
    children: receipt.children.map((child) => ({
      ...child,
      interests: [...child.interests],
      hobbies: [...child.hobbies],
      accessibilityDefaults: [...child.accessibilityDefaults],
      supportPreferences: [...child.supportPreferences],
    })),
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
  private sessionGeneration = 0;

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
    if (this.completionReceipt) {
      return failure('INVALID_TRANSITION', 'The completed onboarding receipt cannot be rewritten');
    }
    const updated = updateParentOnboardingDraft(this.draft, patch);
    if (!updated.ok) return { ok: false, error: updated.error };
    this.draft = updated.data;
    return success(this.getView());
  }

  restoreCompletionReceipt(
    receipt: ParentOnboardingCompletionReceipt,
  ): ServiceResult<ParentOnboardingView> {
    if (this.completionReceipt || this.parentSession) {
      return failure('INVALID_TRANSITION', 'Reset before restoring a local family receipt');
    }
    const initial = createInitialParentOnboardingDraft();
    if (
      receipt.receiptId !== COMPLETION_RECEIPT_ID ||
      receipt.destination !== '/parent' ||
      receipt.householdId !== 'household_al_noor' ||
      receipt.origin !== 'synthetic' ||
      receipt.capabilityTruth !== CAPABILITY_TRUTH ||
      receipt.children.length !== receipt.childCount ||
      !Number.isFinite(Date.parse(receipt.completedAt))
    ) {
      return failure('INVALID_INPUT', 'The device-local family receipt is invalid');
    }
    const draft: ParentOnboardingDraft = {
      familyName: receipt.familyName,
      appLanguage: receipt.appLanguage,
      childCount: receipt.childCount,
      children: initial.children.map((fallback, index) => {
        const child = receipt.children[index];
        return child
          ? {
              profileId: child.profileId,
              nickname: child.nickname,
              avatarId: child.avatarId,
              ageBand: child.ageBand,
              preferredLanguage: child.preferredLanguage,
              gender: child.gender,
              interests: [...child.interests],
              hobbies: [...child.hobbies],
              accessibilityDefaults: [...child.accessibilityDefaults],
              supportPreferences: [...child.supportPreferences],
              personalizationEnabled: child.personalizationEnabled,
            }
          : fallback;
      }),
    };
    const validated = validateCompleteParentOnboardingDraft(draft);
    if (
      !validated.ok ||
      receipt.children.some(
        (child) =>
          child.accessLanguagePreference !== toAccessLanguagePreference(child.preferredLanguage),
      )
    ) {
      return failure('INVALID_INPUT', 'The device-local family receipt is invalid');
    }
    this.draft = validated.data;
    this.completionReceipt = cloneReceipt(receipt);
    this.clearVerification();
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
      sessionId: this.nextSessionId(),
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
    this.completionReceipt ??= {
      receiptId: COMPLETION_RECEIPT_ID,
      completedAt: now,
      destination: '/parent',
      householdId: signedIn.data.householdId,
      familyName: validatedDraft.data.familyName,
      appLanguage: validatedDraft.data.appLanguage,
      childCount: validatedDraft.data.childCount,
      children: validatedDraft.data.children
        .slice(0, validatedDraft.data.childCount)
        .map((child) => ({
          profileId: child.profileId,
          nickname: child.nickname,
          avatarId: child.avatarId,
          ageBand: child.ageBand,
          preferredLanguage: child.preferredLanguage,
          accessLanguagePreference: toAccessLanguagePreference(child.preferredLanguage),
          gender: child.gender,
          interests: [...child.interests],
          hobbies: [...child.hobbies],
          accessibilityDefaults: [...child.accessibilityDefaults],
          supportPreferences: [...child.supportPreferences],
          personalizationEnabled: child.personalizationEnabled,
        })),
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

  approveChildPairing(input: {
    readonly requestId: string;
    readonly childId: SyntheticChildId;
    readonly requestingDeviceId: string;
    readonly now: string;
  }): ServiceResult<PairingRequest> {
    if (
      !this.parentSession ||
      !this.completionReceipt ||
      this.status !== 'authenticated_parent' ||
      !this.isConfiguredChild(input.childId) ||
      !this.access.approvePairing
    ) {
      return failure(
        'INVALID_TRANSITION',
        'A completed Parent session is required to approve Child pairing',
      );
    }
    return this.access.approvePairing({
      ...input,
      parentSession: this.parentSession,
    });
  }

  getChildPermissions(childId: SyntheticChildId, now: string): ServiceResult<ChildPermissionGrant> {
    if (
      !this.parentSession ||
      !this.completionReceipt ||
      this.status !== 'authenticated_parent' ||
      !this.isConfiguredChild(childId) ||
      !this.access.getChildPermissions
    ) {
      return failure(
        'INVALID_TRANSITION',
        'A completed Parent session is required to view Child permissions',
      );
    }
    return this.access.getChildPermissions({ session: this.parentSession, childId, now });
  }

  updateChildPermission(input: {
    readonly childId: SyntheticChildId;
    readonly change: Omit<Exclude<ChildPermissionChange, { kind: 'language' }>, 'proofId'>;
    readonly proofId: string;
    readonly reauthenticationCode: unknown;
    readonly now: string;
  }): ServiceResult<ChildPermissionGrant> {
    if (
      !this.parentSession ||
      !this.completionReceipt ||
      this.status !== 'authenticated_parent' ||
      !this.isConfiguredChild(input.childId) ||
      !this.access.getChildPermissions ||
      !this.access.updateChildPermissions ||
      !this.access.issueReauthentication
    ) {
      return failure(
        'INVALID_TRANSITION',
        'A completed Parent session is required to change Child permissions',
      );
    }
    if (input.reauthenticationCode !== SYNTHETIC_PARENT_REAUTHENTICATION_CODE) {
      return failure('INVALID_INPUT', 'The synthetic Parent reauthentication code is not correct');
    }
    const purpose =
      input.change.kind === 'voice'
        ? 'change_voice_permission'
        : input.change.kind === 'media'
          ? 'change_media_permission'
          : 'change_ai_permission';
    const current = this.access.getChildPermissions({
      session: this.parentSession,
      childId: input.childId,
      now: input.now,
    });
    if (!current.ok) return current;
    const proof = this.access.issueReauthentication({
      proofId: input.proofId,
      parentSession: this.parentSession,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose,
      now: input.now,
    });
    if (!proof.ok) return proof;
    return this.access.updateChildPermissions({
      parentSession: this.parentSession,
      childId: input.childId,
      expectedVersion: current.data.version,
      change: { ...input.change, proofId: proof.data.id } as ChildPermissionChange,
      now: input.now,
    });
  }

  signOut(now: string): ServiceResult<ParentOnboardingView> {
    this.verificationAttempt += 1;
    if (this.parentSession) {
      const terminated = this.access.terminateParentSession({ session: this.parentSession, now });
      if (!terminated.ok) return terminated;
    }

    this.parentSession = null;
    this.clearVerification();
    return success(this.getView());
  }

  revokeChildDevice(input: {
    readonly childId: SyntheticChildId;
    readonly deviceId: string;
    readonly now: string;
  }): ServiceResult<DeviceAccessState> {
    if (
      !this.parentSession ||
      !this.completionReceipt ||
      this.status !== 'authenticated_parent' ||
      !this.isConfiguredChild(input.childId) ||
      !this.access.revokeDevice
    ) {
      return failure(
        'INVALID_TRANSITION',
        'A completed Parent session is required to revoke a Child device',
      );
    }
    return this.access.revokeDevice({ ...input, parentSession: this.parentSession });
  }

  authorizeParentReport(profileId: unknown, now: string): ServiceResult<ParentReportHandoff> {
    if (!this.parentSession || !this.completionReceipt || this.status !== 'authenticated_parent') {
      return failure('INVALID_TRANSITION', 'A completed Parent onboarding session is required');
    }
    if (
      (profileId !== 'child_salem' && profileId !== 'child_alya') ||
      !this.isConfiguredChild(profileId)
    ) {
      return failure('NOT_FOUND', 'The selected synthetic Child profile was not found');
    }
    const authorized = this.access.authorizeCapability({
      session: this.parentSession,
      capability: 'view_parent_reports',
      now,
    });
    if (!authorized.ok) return authorized;
    return success({
      authorized: true,
      role: 'parent',
      capability: 'view_parent_reports',
      parentId: this.parentSession.principal.parentId,
      householdId: this.parentSession.householdId,
      authorizedProfileIds: Object.freeze([profileId]),
      origin: 'synthetic',
      capabilityTruth: this.parentSession.capabilityTruth,
    });
  }

  authorizeSharedGrowthParticipation(input: {
    readonly proofId: string;
    readonly participationEpochId: string;
    readonly now: string;
  }): ServiceResult<ParentSharedGrowthAccessHandoff> {
    if (!this.parentSession || !this.completionReceipt || this.status !== 'authenticated_parent') {
      return failure('INVALID_TRANSITION', 'A completed Parent onboarding session is required');
    }
    if (
      !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(input.participationEpochId) ||
      !this.access.issueReauthentication ||
      !this.access.authorizeSensitiveAction
    ) {
      return failure('INVALID_INPUT', 'Shared Growth access evidence is unavailable');
    }
    const capability = this.access.authorizeCapability({
      session: this.parentSession,
      capability: 'manage_shared_growth_contribution',
      now: input.now,
    });
    if (!capability.ok) return capability;
    const issued = this.access.issueReauthentication({
      proofId: input.proofId,
      parentSession: this.parentSession,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose: 'change_shared_growth_participation',
      now: input.now,
    });
    if (!issued.ok) return issued;
    const verified = this.access.authorizeSensitiveAction({
      proofId: issued.data.id,
      parentSession: this.parentSession,
      purpose: issued.data.purpose,
      now: input.now,
    });
    if (!verified.ok) return verified;
    return success({
      authorized: true,
      role: 'parent',
      capability: 'manage_shared_growth_contribution',
      parentId: verified.data.parentId,
      householdId: verified.data.householdId,
      participationEpochId: input.participationEpochId,
      reauthentication: {
        id: verified.data.id,
        purpose: 'change_shared_growth_participation',
        status: 'verified',
        issuedAt: verified.data.issuedAt,
        expiresAt: verified.data.expiresAt,
        consumedByAccessService: true,
        origin: 'synthetic',
        capabilityTruth: verified.data.capabilityTruth,
      },
      origin: 'synthetic',
      capabilityTruth: verified.data.capabilityTruth,
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

  private isConfiguredChild(childId: SyntheticChildId): boolean {
    return this.completionReceipt?.children.some((child) => child.profileId === childId) ?? false;
  }

  private nextSessionId(): string {
    this.sessionGeneration += 1;
    return this.sessionGeneration === 1
      ? this.config.sessionId
      : `${this.config.sessionId}-${this.sessionGeneration}`;
  }
}

export function createParentOnboardingController(
  access: ParentOnboardingAccessAuthority,
  config?: ParentOnboardingControllerConfig,
): ParentOnboardingController {
  return new ParentOnboardingController(access, config);
}

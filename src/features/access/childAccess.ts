import type {
  ChildAccessSession,
  ChildPermissionGrant,
  DeviceAccessState,
  PairingRequest,
  SyntheticChildCredentialFixture,
} from '../../models/access';
import { SYNTHETIC_CHILD_CREDENTIAL_FIXTURES } from '../../models/access';
import type { DomainErrorCode, SyntheticChildId } from '../../models/familyGrowth';
import type { ServiceResult, SyntheticAccessService } from '../../services/interfaces';
import type { ParentOnboardingController } from './parentOnboarding';

export type ChildCredentialKind = 'pin' | 'picture_sequence';
export type ChildAccessStatus =
  | 'signed_out'
  | 'profile_selected'
  | 'credential_verified'
  | 'pairing_pending'
  | 'pairing_approved'
  | 'pairing_expired'
  | 'authenticated_child';

export interface ChildAccessView {
  readonly status: ChildAccessStatus;
  readonly selectedChildId: SyntheticChildId | null;
  readonly credentialKind: ChildCredentialKind | null;
  readonly pairingRequest: PairingRequest | null;
  readonly pairedDevices: readonly DeviceAccessState[];
  readonly canEnterChildExperience: boolean;
  readonly productionAuthentication: false;
  readonly origin: 'synthetic';
  readonly capabilityTruth: 'local_prototype_not_authentication';
}

const CAPABILITY_TRUTH = 'local_prototype_not_authentication' as const;
const CHILD_PIN = '2468';
const ALYA_PICTURE_SEQUENCE = 'leaf-water-tree';

function failure(code: DomainErrorCode, message: string): ServiceResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: false },
  };
}

function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data, meta: { origin: 'synthetic', fallbackUsed: false } };
}

function credentialKindFor(fixture: SyntheticChildCredentialFixture): ChildCredentialKind {
  return fixture.verificationKind === 'avatar_pin_fixture' ? 'pin' : 'picture_sequence';
}

function clonePairing(request: PairingRequest | null): PairingRequest | null {
  return request ? { ...request } : null;
}

export class ChildAccessController {
  private status: ChildAccessStatus = 'signed_out';
  private selectedChildId: SyntheticChildId | null = null;
  private pairingRequest: PairingRequest | null = null;
  private session: ChildAccessSession | null = null;
  private readonly devices = new Map<SyntheticChildId, DeviceAccessState>();
  private sequence = 0;

  constructor(
    private readonly access: SyntheticAccessService,
    private readonly parent: ParentOnboardingController,
  ) {}

  getView(): ChildAccessView {
    const fixture = this.selectedChildId
      ? SYNTHETIC_CHILD_CREDENTIAL_FIXTURES[this.selectedChildId]
      : null;
    return {
      status: this.status,
      selectedChildId: this.selectedChildId,
      credentialKind: fixture ? credentialKindFor(fixture) : null,
      pairingRequest: clonePairing(this.pairingRequest),
      pairedDevices: [...this.devices.values()].map((device) => ({ ...device })),
      canEnterChildExperience: this.status === 'authenticated_child' && this.session !== null,
      productionAuthentication: false,
      origin: 'synthetic',
      capabilityTruth: CAPABILITY_TRUTH,
    };
  }

  restorePairedDevices(input: {
    readonly childIds: readonly SyntheticChildId[];
    readonly pairedAt: string;
  }): ServiceResult<ChildAccessView> {
    if (this.session || this.status !== 'signed_out' || this.devices.size > 0) {
      return failure('INVALID_TRANSITION', 'Reset before restoring device-local pairing markers');
    }
    for (const childId of input.childIds) {
      const restored = this.access.restorePairedDevice({
        childId,
        deviceId: this.deviceId(childId),
        pairedAt: input.pairedAt,
      });
      if (!restored.ok) {
        this.devices.clear();
        return restored;
      }
      this.devices.set(childId, restored.data);
    }
    return success(this.getView());
  }

  selectProfile(childId: unknown): ServiceResult<ChildAccessView> {
    if (this.session || this.status === 'authenticated_child') {
      return failure('INVALID_TRANSITION', 'Sign out before choosing another Child profile');
    }
    if (childId !== 'child_salem' && childId !== 'child_alya') {
      return failure('NOT_FOUND', 'Choose one available synthetic Child profile');
    }
    this.selectedChildId = childId;
    this.status = 'profile_selected';
    this.pairingRequest = null;
    this.session = null;
    return success(this.getView());
  }

  verifyCredential(
    value: unknown,
    now = '2026-09-05T10:00:00.000Z',
  ): ServiceResult<ChildAccessView> {
    const childId = this.selectedChildId;
    if (!childId || this.status !== 'profile_selected') {
      return failure('INVALID_TRANSITION', 'Choose a Child profile before entering a credential');
    }
    const expected = childId === 'child_salem' ? CHILD_PIN : ALYA_PICTURE_SEQUENCE;
    if (typeof value !== 'string' || value !== expected) {
      return failure('INVALID_INPUT', 'The local demonstration credential is not correct');
    }

    const pairedDevice = this.devices.get(childId);
    if (pairedDevice?.status === 'paired') {
      const existing = this.signInPairedDevice(childId, now);
      if (existing.ok) return existing;
    }
    this.status = 'credential_verified';
    return success(this.getView());
  }

  requestPairing(now: string): ServiceResult<ChildAccessView> {
    const childId = this.selectedChildId;
    if (!childId || (this.status !== 'credential_verified' && this.status !== 'pairing_expired')) {
      return failure('INVALID_TRANSITION', 'Verify the selected Child credential before pairing');
    }
    this.sequence += 1;
    const requestId = `r003-pair-${childId}-${this.sequence}`;
    const requested = this.access.requestPairing({
      requestId,
      pairingCode: `synthetic-code-${requestId}`,
      childId,
      requestingDeviceId: this.deviceId(childId),
      now,
    });
    if (!requested.ok) return requested;
    this.pairingRequest = requested.data;
    this.status = 'pairing_pending';
    return success(this.getView());
  }

  approvePairing(now: string): ServiceResult<ChildAccessView> {
    const request = this.pairingRequest;
    if (!request || this.status !== 'pairing_pending') {
      return failure('INVALID_TRANSITION', 'A pending pairing request is required');
    }
    const approved = this.parent.approveChildPairing({
      requestId: request.id,
      childId: request.childId,
      requestingDeviceId: request.requestingDeviceId,
      now,
    });
    if (!approved.ok) {
      this.recordExpiredPairing(now);
      return approved;
    }
    this.pairingRequest = approved.data;
    this.status = 'pairing_approved';
    return success(this.getView());
  }

  completePairing(now: string): ServiceResult<ChildAccessView> {
    const request = this.pairingRequest;
    if (!request || this.status !== 'pairing_approved') {
      return failure('INVALID_TRANSITION', 'Parent approval is required before pairing completes');
    }
    const fixture = SYNTHETIC_CHILD_CREDENTIAL_FIXTURES[request.childId];
    const consumed = this.access.consumePairing({
      requestId: request.id,
      pairingCode: request.pairingCode,
      childId: request.childId,
      deviceId: request.requestingDeviceId,
      childCredentialFixtureId: fixture.fixtureId,
      sessionId: this.nextSessionId(request.childId),
      now,
    });
    if (!consumed.ok) {
      this.recordExpiredPairing(now);
      return consumed;
    }
    this.session = consumed.data;
    this.devices.set(request.childId, {
      householdId: request.householdId,
      childId: request.childId,
      deviceId: request.requestingDeviceId,
      pairingRequestId: request.id,
      status: 'paired',
      pairedAt: now,
      revokedAt: null,
      revokedByParentId: null,
      origin: 'synthetic',
      capabilityTruth: CAPABILITY_TRUTH,
    });
    this.pairingRequest = { ...request, status: 'consumed', consumedAt: now };
    this.status = 'authenticated_child';
    return success(this.getView());
  }

  authorizeChildExperience(now: string): ServiceResult<ChildAccessView> {
    if (!this.session || this.status !== 'authenticated_child') {
      return failure('INVALID_TRANSITION', 'An active synthetic Child session is required');
    }
    const authorized = this.access.authorizeCapability({
      session: this.session,
      capability: 'enter_child_experience',
      now,
    });
    return authorized.ok ? success(this.getView()) : authorized;
  }

  resumeRememberedChild(childId: SyntheticChildId, now: string): ServiceResult<ChildAccessView> {
    const device = this.devices.get(childId);
    if (this.session || this.status !== 'signed_out' || !device || device.status !== 'paired') {
      return failure(
        'INVALID_TRANSITION',
        'A signed-out Child with an active restored pairing is required',
      );
    }
    this.selectedChildId = childId;
    const signedIn = this.signInPairedDevice(childId, now);
    if (!signedIn.ok) {
      this.clearLocalSession();
      return signedIn;
    }
    const authorized = this.authorizeChildExperience(now);
    if (!authorized.ok) {
      const signedOut = this.signOut(now);
      return signedOut.ok
        ? authorized
        : failure('INVALID_TRANSITION', 'Remembered Child access could not be safely restored');
    }
    return success(this.getView());
  }

  getOwnPermissions(now: string): ServiceResult<ChildPermissionGrant> {
    if (!this.session || this.status !== 'authenticated_child' || !this.selectedChildId) {
      return failure('INVALID_TRANSITION', 'An active synthetic Child session is required');
    }
    return this.access.getChildPermissions({
      session: this.session,
      childId: this.selectedChildId,
      now,
    });
  }

  revokeDevice(childId: SyntheticChildId, now: string): ServiceResult<ChildAccessView> {
    const device = this.devices.get(childId);
    if (!device || device.status !== 'paired') {
      return failure('NOT_FOUND', 'No active synthetic pairing exists for this Child');
    }
    const revoked = this.parent.revokeChildDevice({ childId, deviceId: device.deviceId, now });
    if (!revoked.ok) return revoked;
    this.devices.set(childId, revoked.data);
    if (this.session?.principal.childId === childId) this.clearLocalSession();
    return success(this.getView());
  }

  forgetDeviceAfterPersistedRevocation(childId: SyntheticChildId): ChildAccessView {
    this.devices.delete(childId);
    if (
      this.selectedChildId === childId ||
      (this.session?.principal.role === 'child' && this.session.principal.childId === childId)
    ) {
      return this.clearLocalSession();
    }
    return this.getView();
  }

  signOut(now: string): ServiceResult<ChildAccessView> {
    if (this.session) {
      const terminated = this.access.terminateChildSession({ session: this.session, now });
      if (!terminated.ok) return terminated;
    }
    return success(this.clearLocalSession());
  }

  private clearLocalSession(): ChildAccessView {
    this.status = 'signed_out';
    this.selectedChildId = null;
    this.pairingRequest = null;
    this.session = null;
    return this.getView();
  }

  reset(): ChildAccessView {
    this.devices.clear();
    return this.clearLocalSession();
  }

  private signInPairedDevice(
    childId: SyntheticChildId,
    now: string,
  ): ServiceResult<ChildAccessView> {
    const fixture = SYNTHETIC_CHILD_CREDENTIAL_FIXTURES[childId];
    const signedIn = this.access.signInChild({
      sessionId: this.nextSessionId(childId),
      childId,
      childCredentialFixtureId: fixture.fixtureId,
      deviceId: this.deviceId(childId),
      now,
    });
    if (!signedIn.ok) return signedIn;
    this.session = signedIn.data;
    this.status = 'authenticated_child';
    return success(this.getView());
  }

  private deviceId(childId: SyntheticChildId): string {
    return `r003-shared-device-${childId}`;
  }

  private nextSessionId(childId: SyntheticChildId): string {
    this.sequence += 1;
    return `r003-child-session-${childId}-${this.sequence}`;
  }

  private recordExpiredPairing(now: string): void {
    if (!this.pairingRequest) return;
    const expiry = Date.parse(this.pairingRequest.expiresAt);
    const current = Date.parse(now);
    if (!Number.isFinite(expiry) || !Number.isFinite(current) || current < expiry) return;
    this.pairingRequest = { ...this.pairingRequest, status: 'expired' };
    this.status = 'pairing_expired';
  }
}

export function createChildAccessController(
  access: SyntheticAccessService,
  parent: ParentOnboardingController,
): ChildAccessController {
  return new ChildAccessController(access, parent);
}

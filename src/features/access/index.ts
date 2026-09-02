import type {
  AccessCapability,
  AccessSession,
  AccessView,
  CapabilityAuthorization,
  CapabilityAuthorizationInput,
  ChildAccessSession,
  ChildPermissionGrant,
  ChildPermissionQueryInput,
  DeviceAccessState,
  DeviceRevocationInput,
  PairingApprovalInput,
  PairingConsumptionInput,
  PairingRequest,
  PairingRequestInput,
  ParentAccessSession,
  PermissionUpdateInput,
  ProjectAccessSessionInput,
  ReauthenticationInput,
  ReauthenticationProof,
  SensitiveActionInput,
  SensitiveActionPurpose,
  SyntheticChildSignIn,
  SyntheticParentSignIn,
} from '../../models/access';
import {
  ACCESS_SESSION_TTL_MS,
  CHILD_CAPABILITIES,
  PAIRING_TTL_MS,
  PARENT_CAPABILITIES,
  REAUTHENTICATION_TTL_MS,
  SYNTHETIC_CHILD_CREDENTIAL_FIXTURES,
  SYNTHETIC_PARENT_ACCESS_FIXTURE,
  SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
} from '../../models/access';
import type { DomainErrorCode, SyntheticChildId } from '../../models/familyGrowth';
import type { ServiceResult } from '../../services/interfaces';

const CAPABILITY_TRUTH = 'local_prototype_not_authentication' as const;
const SYNTHETIC_HOUSEHOLD_ID = 'household_al_noor' as const;
const INITIAL_PERMISSION_TIME = '2026-09-01T00:00:00.000Z';

function success<T>(data: T, fixtureId?: string): ServiceResult<T> {
  return {
    ok: true,
    data,
    meta: {
      origin: 'synthetic',
      fallbackUsed: false,
      ...(fixtureId ? { fixtureId } : {}),
    },
  };
}

function failure(code: DomainErrorCode, message: string): ServiceResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: false },
  };
}

function parsedTime(value: string): number | null {
  if (!value.trim()) return null;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) ? milliseconds : null;
}

function expiresAt(now: string, ttl: number): string | null {
  const milliseconds = parsedTime(now);
  return milliseconds === null ? null : new Date(milliseconds + ttl).toISOString();
}

function isExpired(expiry: string, now: string): boolean | null {
  const expiryTime = parsedTime(expiry);
  const currentTime = parsedTime(now);
  if (expiryTime === null || currentTime === null) return null;
  return currentTime >= expiryTime;
}

function isWithinWindow(start: string, expiry: string, now: string): boolean {
  const startTime = parsedTime(start);
  const expiryTime = parsedTime(expiry);
  const currentTime = parsedTime(now);
  return (
    startTime !== null &&
    expiryTime !== null &&
    currentTime !== null &&
    currentTime >= startTime &&
    currentTime < expiryTime
  );
}

function nonEmpty(...values: readonly string[]): boolean {
  return values.every((value) => value.trim().length > 0);
}

function deviceKey(childId: SyntheticChildId, deviceId: string): string {
  return `${childId}:${deviceId}`;
}

function childFixture(childId: unknown) {
  return childId === 'child_salem' || childId === 'child_alya'
    ? SYNTHETIC_CHILD_CREDENTIAL_FIXTURES[childId]
    : null;
}

function sameSessionIdentity(left: AccessSession, right: AccessSession): boolean {
  if (
    left.sessionKind !== right.sessionKind ||
    left.id !== right.id ||
    left.deviceId !== right.deviceId ||
    left.householdId !== right.householdId
  ) {
    return false;
  }
  if (left.sessionKind === 'parent' && right.sessionKind === 'parent') {
    return left.principal.parentId === right.principal.parentId;
  }
  if (left.sessionKind === 'child' && right.sessionKind === 'child') {
    return left.principal.childId === right.principal.childId;
  }
  return false;
}

function cloneAccessSession(session: ParentAccessSession): ParentAccessSession;
function cloneAccessSession(session: ChildAccessSession): ChildAccessSession;
function cloneAccessSession(session: AccessSession): AccessSession {
  return session.sessionKind === 'parent'
    ? {
        ...session,
        principal: { ...session.principal },
        capabilities: [...session.capabilities],
      }
    : {
        ...session,
        principal: { ...session.principal },
        capabilities: [...session.capabilities],
      };
}

function purposeCapability(purpose: SensitiveActionPurpose): AccessCapability {
  switch (purpose) {
    case 'create_monetary_family_reward':
    case 'change_monetary_family_reward':
      return 'manage_family_rewards';
    case 'change_league_membership':
      return 'manage_league_membership';
    case 'change_voice_permission':
    case 'change_media_permission':
    case 'change_ai_permission':
      return 'manage_child_permissions';
  }
}

function permissionPurpose(
  kind: Exclude<PermissionUpdateInput['change']['kind'], 'language'>,
): SensitiveActionPurpose {
  switch (kind) {
    case 'voice':
      return 'change_voice_permission';
    case 'media':
      return 'change_media_permission';
    case 'ai':
      return 'change_ai_permission';
  }
}

function initialPermissionGrant(childId: SyntheticChildId): ChildPermissionGrant {
  return {
    childId,
    householdId: SYNTHETIC_HOUSEHOLD_ID,
    languagePreference: 'ar',
    voiceGranted: false,
    mediaGranted: false,
    aiGranted: false,
    version: 1,
    updatedByParentId: SYNTHETIC_PARENT_ACCESS_FIXTURE.parentId,
    updatedAt: INITIAL_PERMISSION_TIME,
    origin: 'synthetic',
    capabilityTruth: CAPABILITY_TRUTH,
  };
}

export class DeterministicSyntheticAccessService {
  private readonly sessions = new Map<string, AccessSession>();
  private readonly pairingRequests = new Map<string, PairingRequest>();
  private readonly devices = new Map<string, DeviceAccessState>();
  private readonly proofs = new Map<string, ReauthenticationProof>();
  private readonly permissionGrants = new Map<SyntheticChildId, ChildPermissionGrant>([
    ['child_salem', initialPermissionGrant('child_salem')],
    ['child_alya', initialPermissionGrant('child_alya')],
  ]);

  signInParent(input: SyntheticParentSignIn): ServiceResult<ParentAccessSession> {
    const expiry = expiresAt(input.now, ACCESS_SESSION_TTL_MS);
    if (
      !expiry ||
      !nonEmpty(input.sessionId, input.deviceId) ||
      input.parentFixtureId !== SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId ||
      this.sessions.has(input.sessionId)
    ) {
      return failure('INVALID_INPUT', 'A unique reviewed synthetic Parent fixture is required');
    }
    const session: ParentAccessSession = {
      id: input.sessionId,
      sessionKind: 'parent',
      householdId: SYNTHETIC_PARENT_ACCESS_FIXTURE.householdId,
      deviceId: input.deviceId,
      issuedAt: input.now,
      expiresAt: expiry,
      principal: {
        role: 'parent',
        parentId: SYNTHETIC_PARENT_ACCESS_FIXTURE.parentId,
        householdId: SYNTHETIC_PARENT_ACCESS_FIXTURE.householdId,
        fixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
        origin: 'synthetic',
      },
      capabilities: [...PARENT_CAPABILITIES],
      origin: 'synthetic',
      capabilityTruth: CAPABILITY_TRUTH,
    };
    this.sessions.set(session.id, cloneAccessSession(session));
    return success(cloneAccessSession(session), SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId);
  }

  signInChild(input: SyntheticChildSignIn): ServiceResult<ChildAccessSession> {
    const fixture = childFixture(input.childId);
    const device = this.devices.get(deviceKey(input.childId, input.deviceId));
    if (
      !nonEmpty(input.sessionId, input.deviceId) ||
      parsedTime(input.now) === null ||
      this.sessions.has(input.sessionId) ||
      !fixture ||
      fixture.fixtureId !== input.childCredentialFixtureId ||
      !device ||
      device.status !== 'paired' ||
      device.childId !== input.childId ||
      device.deviceId !== input.deviceId
    ) {
      return failure(
        'INVALID_INPUT',
        'A matching active synthetic Child/device fixture is required',
      );
    }
    return this.createChildSession(input, fixture.avatarId);
  }

  projectSession(input: ProjectAccessSessionInput): ServiceResult<AccessView> {
    const resolved = this.resolveSession(input.session, input.now);
    if (!resolved.ok) return resolved;
    const session = resolved.data;
    if (session.sessionKind === 'parent') {
      return success({
        viewKind: 'parent',
        sessionId: session.id,
        parentId: session.principal.parentId,
        householdId: session.householdId,
        deviceId: session.deviceId,
        capabilities: [...session.capabilities],
        reportAccess: 'parent_only',
        permissionManagement: 'parent_only',
        origin: 'synthetic',
        capabilityTruth: CAPABILITY_TRUTH,
      });
    }
    return success({
      viewKind: 'child',
      sessionId: session.id,
      childId: session.principal.childId,
      householdId: session.householdId,
      deviceId: session.deviceId,
      avatarId: session.principal.avatarId,
      capabilities: [...session.capabilities],
      origin: 'synthetic',
      capabilityTruth: CAPABILITY_TRUTH,
    });
  }

  authorizeCapability(input: CapabilityAuthorizationInput): ServiceResult<CapabilityAuthorization> {
    const resolved = this.resolveSession(input.session, input.now);
    if (!resolved.ok) return resolved;
    if (!(resolved.data.capabilities as readonly AccessCapability[]).includes(input.capability)) {
      return failure('PRIVACY_REJECTED', 'The synthetic session does not allow this capability');
    }
    return success({
      sessionId: resolved.data.id,
      capability: input.capability,
      authorized: true,
      origin: 'synthetic',
    });
  }

  requestPairing(input: PairingRequestInput): ServiceResult<PairingRequest> {
    const expiry = expiresAt(input.now, PAIRING_TTL_MS);
    const existingDevice = this.devices.get(deviceKey(input.childId, input.requestingDeviceId));
    if (
      !expiry ||
      !nonEmpty(input.requestId, input.pairingCode, input.requestingDeviceId) ||
      !input.pairingCode.startsWith('synthetic-code-') ||
      !childFixture(input.childId) ||
      this.pairingRequests.has(input.requestId) ||
      existingDevice
    ) {
      return failure(
        'INVALID_INPUT',
        'A unique unpaired synthetic Child/device request is required',
      );
    }
    const request: PairingRequest = {
      id: input.requestId,
      pairingCode: input.pairingCode,
      householdId: SYNTHETIC_HOUSEHOLD_ID,
      childId: input.childId,
      requestingDeviceId: input.requestingDeviceId,
      requestedAt: input.now,
      expiresAt: expiry,
      status: 'pending',
      approvedByParentId: null,
      approvedAt: null,
      consumedAt: null,
      revokedAt: null,
      origin: 'synthetic',
      capabilityTruth: CAPABILITY_TRUTH,
    };
    this.pairingRequests.set(request.id, { ...request });
    return success({ ...request }, request.id);
  }

  approvePairing(input: PairingApprovalInput): ServiceResult<PairingRequest> {
    const parent = this.resolveParent(input.parentSession, input.now, 'manage_child_devices');
    if (!parent.ok) return parent;
    const request = this.pairingRequests.get(input.requestId);
    if (!request) return failure('NOT_FOUND', 'The synthetic pairing request was not found');
    const expired = isExpired(request.expiresAt, input.now);
    if (expired === null) return failure('INVALID_INPUT', 'A valid deterministic time is required');
    if (expired) {
      this.pairingRequests.set(request.id, { ...request, status: 'expired' });
      return failure('INVALID_TRANSITION', 'The synthetic pairing request expired');
    }
    if (
      request.status !== 'pending' ||
      !isWithinWindow(request.requestedAt, request.expiresAt, input.now) ||
      request.householdId !== parent.data.householdId ||
      request.childId !== input.childId ||
      request.requestingDeviceId !== input.requestingDeviceId
    ) {
      return failure(
        'INVALID_TRANSITION',
        'The pairing actor, Child, device, or state does not match',
      );
    }
    const approved: PairingRequest = {
      ...request,
      status: 'approved',
      approvedByParentId: parent.data.principal.parentId,
      approvedAt: input.now,
    };
    this.pairingRequests.set(approved.id, { ...approved });
    return success({ ...approved }, approved.id);
  }

  consumePairing(input: PairingConsumptionInput): ServiceResult<ChildAccessSession> {
    const request = this.pairingRequests.get(input.requestId);
    if (!request) return failure('NOT_FOUND', 'The synthetic pairing request was not found');
    const expired = isExpired(request.expiresAt, input.now);
    if (expired === null || !nonEmpty(input.sessionId, input.deviceId)) {
      return failure('INVALID_INPUT', 'Valid deterministic pairing inputs are required');
    }
    if (expired) {
      this.pairingRequests.set(request.id, { ...request, status: 'expired' });
      return failure('INVALID_TRANSITION', 'The synthetic pairing request expired');
    }
    const fixture = childFixture(input.childId);
    const existingDevice = this.devices.get(deviceKey(input.childId, input.deviceId));
    if (
      request.status !== 'approved' ||
      request.pairingCode !== input.pairingCode ||
      request.childId !== input.childId ||
      request.requestingDeviceId !== input.deviceId ||
      request.approvedByParentId === null ||
      !fixture ||
      fixture.fixtureId !== input.childCredentialFixtureId ||
      !isWithinWindow(request.requestedAt, request.expiresAt, input.now) ||
      existingDevice ||
      this.sessions.has(input.sessionId)
    ) {
      return failure(
        'INVALID_TRANSITION',
        'The pairing is unapproved, replayed, revoked, or mismatched',
      );
    }
    const pairedDevice: DeviceAccessState = {
      householdId: request.householdId,
      childId: request.childId,
      deviceId: request.requestingDeviceId,
      pairingRequestId: request.id,
      status: 'paired',
      pairedAt: input.now,
      revokedAt: null,
      revokedByParentId: null,
      origin: 'synthetic',
      capabilityTruth: CAPABILITY_TRUTH,
    };
    this.devices.set(deviceKey(input.childId, input.deviceId), { ...pairedDevice });
    this.pairingRequests.set(request.id, {
      ...request,
      status: 'consumed',
      consumedAt: input.now,
    });
    return this.createChildSession(
      {
        sessionId: input.sessionId,
        childId: input.childId,
        childCredentialFixtureId: input.childCredentialFixtureId,
        deviceId: input.deviceId,
        now: input.now,
      },
      fixture.avatarId,
    );
  }

  revokeDevice(input: DeviceRevocationInput): ServiceResult<DeviceAccessState> {
    const parent = this.resolveParent(input.parentSession, input.now, 'manage_child_devices');
    if (!parent.ok) return parent;
    const key = deviceKey(input.childId, input.deviceId);
    const device = this.devices.get(key);
    if (
      !device ||
      device.householdId !== parent.data.householdId ||
      device.childId !== input.childId ||
      device.deviceId !== input.deviceId ||
      device.status !== 'paired'
    ) {
      return failure('INVALID_TRANSITION', 'The synthetic Child/device binding is not active');
    }
    const revoked: DeviceAccessState = {
      ...device,
      status: 'revoked',
      revokedAt: input.now,
      revokedByParentId: parent.data.principal.parentId,
    };
    this.devices.set(key, { ...revoked });
    const request = this.pairingRequests.get(device.pairingRequestId);
    if (request) {
      this.pairingRequests.set(request.id, {
        ...request,
        status: 'revoked',
        revokedAt: input.now,
      });
    }
    return success({ ...revoked }, device.pairingRequestId);
  }

  issueReauthentication(input: ReauthenticationInput): ServiceResult<ReauthenticationProof> {
    const parent = this.resolveParent(
      input.parentSession,
      input.now,
      purposeCapability(input.purpose),
    );
    const expiry = expiresAt(input.now, REAUTHENTICATION_TTL_MS);
    if (!parent.ok) return parent;
    if (
      !expiry ||
      !nonEmpty(input.proofId) ||
      input.reauthenticationFixtureId !== SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID ||
      this.proofs.has(input.proofId)
    ) {
      return failure(
        'INVALID_INPUT',
        'A unique reviewed synthetic reauthentication fixture is required',
      );
    }
    const proof: ReauthenticationProof = {
      id: input.proofId,
      parentId: parent.data.principal.parentId,
      parentSessionId: parent.data.id,
      householdId: parent.data.householdId,
      deviceId: parent.data.deviceId,
      purpose: input.purpose,
      issuedAt: input.now,
      expiresAt: expiry,
      consumed: false,
      consumedAt: null,
      origin: 'synthetic',
      capabilityTruth: CAPABILITY_TRUTH,
    };
    this.proofs.set(proof.id, { ...proof });
    return success({ ...proof }, input.reauthenticationFixtureId);
  }

  authorizeSensitiveAction(input: SensitiveActionInput): ServiceResult<ReauthenticationProof> {
    const parent = this.resolveParent(
      input.parentSession,
      input.now,
      purposeCapability(input.purpose),
    );
    if (!parent.ok) return parent;
    const proof = this.proofs.get(input.proofId);
    if (!proof) return failure('NOT_FOUND', 'The synthetic reauthentication proof was not found');
    const expired = isExpired(proof.expiresAt, input.now);
    if (expired === null) return failure('INVALID_INPUT', 'A valid deterministic time is required');
    if (
      expired ||
      !isWithinWindow(proof.issuedAt, proof.expiresAt, input.now) ||
      proof.consumed ||
      proof.parentId !== parent.data.principal.parentId ||
      proof.parentSessionId !== parent.data.id ||
      proof.householdId !== parent.data.householdId ||
      proof.deviceId !== parent.data.deviceId ||
      proof.purpose !== input.purpose
    ) {
      return failure(
        'INVALID_TRANSITION',
        'The proof expired, was used, or has the wrong actor or purpose',
      );
    }
    const consumed: ReauthenticationProof = {
      ...proof,
      consumed: true,
      consumedAt: input.now,
    };
    this.proofs.set(consumed.id, { ...consumed });
    return success({ ...consumed }, SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID);
  }

  getChildPermissions(input: ChildPermissionQueryInput): ServiceResult<ChildPermissionGrant> {
    const session = this.resolveSession(input.session, input.now);
    if (!session.ok) return session;
    if (
      session.data.sessionKind === 'child' &&
      (session.data.principal.childId !== input.childId ||
        !session.data.capabilities.includes('view_own_permissions'))
    ) {
      return failure('PRIVACY_REJECTED', 'A Child session can read only its own grants');
    }
    if (
      session.data.sessionKind === 'parent' &&
      !session.data.capabilities.includes('manage_child_permissions')
    ) {
      return failure('PRIVACY_REJECTED', 'The Parent session cannot read Child grants');
    }
    const grant = this.permissionGrants.get(input.childId);
    return grant
      ? success({ ...grant })
      : failure('NOT_FOUND', 'The synthetic Child permission grant was not found');
  }

  updateChildPermissions(input: PermissionUpdateInput): ServiceResult<ChildPermissionGrant> {
    const parent = this.resolveParent(input.parentSession, input.now, 'manage_child_permissions');
    if (!parent.ok) return parent;
    const current = this.permissionGrants.get(input.childId);
    if (!current) return failure('NOT_FOUND', 'The synthetic Child permission grant was not found');
    if (input.expectedVersion !== current.version) {
      return failure('INVALID_TRANSITION', 'The Child permission grant version is stale');
    }
    if (
      !['language', 'voice', 'media', 'ai'].includes(input.change.kind) ||
      (input.change.kind === 'language' &&
        !['ar', 'en', 'bilingual'].includes(input.change.value)) ||
      (input.change.kind !== 'language' && typeof input.change.granted !== 'boolean')
    ) {
      return failure('INVALID_INPUT', 'The Child permission change is not allowlisted');
    }
    if (input.change.kind !== 'language') {
      const authorized = this.authorizeSensitiveAction({
        proofId: input.change.proofId,
        parentSession: parent.data,
        purpose: permissionPurpose(input.change.kind),
        now: input.now,
      });
      if (!authorized.ok) return authorized;
    }
    const next: ChildPermissionGrant = {
      ...current,
      ...(input.change.kind === 'language'
        ? { languagePreference: input.change.value }
        : input.change.kind === 'voice'
          ? { voiceGranted: input.change.granted }
          : input.change.kind === 'media'
            ? { mediaGranted: input.change.granted }
            : { aiGranted: input.change.granted }),
      version: current.version + 1,
      updatedByParentId: parent.data.principal.parentId,
      updatedAt: input.now,
    };
    this.permissionGrants.set(next.childId, { ...next });
    return success({ ...next });
  }

  private createChildSession(
    input: SyntheticChildSignIn,
    avatarId: ChildAccessSession['principal']['avatarId'],
  ): ServiceResult<ChildAccessSession> {
    const expiry = expiresAt(input.now, ACCESS_SESSION_TTL_MS);
    if (!expiry) return failure('INVALID_INPUT', 'A valid deterministic time is required');
    const session: ChildAccessSession = {
      id: input.sessionId,
      sessionKind: 'child',
      householdId: SYNTHETIC_HOUSEHOLD_ID,
      deviceId: input.deviceId,
      issuedAt: input.now,
      expiresAt: expiry,
      principal: {
        role: 'child',
        childId: input.childId,
        householdId: SYNTHETIC_HOUSEHOLD_ID,
        avatarId,
        credentialFixtureId: input.childCredentialFixtureId,
        origin: 'synthetic',
      },
      capabilities: [...CHILD_CAPABILITIES],
      origin: 'synthetic',
      capabilityTruth: CAPABILITY_TRUTH,
    };
    this.sessions.set(session.id, cloneAccessSession(session));
    return success(cloneAccessSession(session), input.childCredentialFixtureId);
  }

  private resolveSession(session: AccessSession, now: string): ServiceResult<AccessSession> {
    const stored = this.sessions.get(session.id);
    if (
      !stored ||
      !isWithinWindow(stored.issuedAt, stored.expiresAt, now) ||
      !sameSessionIdentity(stored, session) ||
      stored.capabilityTruth !== CAPABILITY_TRUTH ||
      stored.origin !== 'synthetic'
    ) {
      return failure('INVALID_TRANSITION', 'The synthetic access session is invalid or expired');
    }
    if (stored.sessionKind === 'child') {
      const device = this.devices.get(deviceKey(stored.principal.childId, stored.deviceId));
      if (!device || device.status !== 'paired') {
        return failure('INVALID_TRANSITION', 'The synthetic Child device is not paired');
      }
    }
    return success(stored);
  }

  private resolveParent(
    session: AccessSession,
    now: string,
    capability: AccessCapability,
  ): ServiceResult<ParentAccessSession> {
    const resolved = this.resolveSession(session, now);
    if (!resolved.ok) return resolved;
    if (
      resolved.data.sessionKind !== 'parent' ||
      !(resolved.data.capabilities as readonly AccessCapability[]).includes(capability)
    ) {
      return failure('PRIVACY_REJECTED', 'A matching Parent capability is required');
    }
    return success(resolved.data);
  }
}

export function createDeterministicSyntheticAccessService(): DeterministicSyntheticAccessService {
  return new DeterministicSyntheticAccessService();
}

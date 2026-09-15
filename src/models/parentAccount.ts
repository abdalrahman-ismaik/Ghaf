import type { AccountWorkspace, AccountWorkspaceUpdate } from './accountWorkspace';

export type PilotAccessStatus = 'pending' | 'approved' | 'suspended';

export interface RealAccountSession {
  readonly userId: string;
  readonly email: string;
  readonly role?: 'child';
  readonly familyId?: string;
  readonly childId?: string;
}

export interface AccountProfile {
  readonly userId: string;
  readonly displayName: string;
  readonly preferredLocale: 'ar' | 'en';
  readonly revision: number;
  readonly updatedAt: string;
}

export interface AccountProfileUpdate {
  readonly displayName: string;
  readonly preferredLocale: 'ar' | 'en';
  readonly expectedRevision: number;
}

export type ParentAccountErrorCode =
  | 'configuration_unavailable'
  | 'storage_unavailable'
  | 'network_unavailable'
  | 'invalid_credentials'
  | 'email_not_verified'
  | 'invalid_code'
  | 'weak_password'
  | 'rate_limited'
  | 'account_unavailable'
  | 'access_unavailable'
  | 'invalid_profile'
  | 'profile_conflict'
  | 'profile_unavailable'
  | 'recovery_required'
  | 'reauth_required'
  | 'session_expired'
  | 'operation_cancelled'
  | 'provider_unavailable';

export class ParentAccountError extends Error {
  constructor(readonly code: ParentAccountErrorCode) {
    super(code);
    this.name = 'ParentAccountError';
  }
}

export type ParentAccountEvent = 'signed-out' | 'changed' | 'refreshed' | 'recovery' | 'error';

export interface ParentAccountService {
  normalizedFamilyRequest?(
    name: 'ghaf_read' | 'ghaf_command',
    parameters: Record<string, unknown> | undefined,
    expectedUserId: string,
  ): Promise<{ data: unknown; error: unknown; status?: number }>;
  familyRequest?(
    name: string,
    args?: Record<string, unknown>,
    expectedUserId?: string,
  ): Promise<unknown>;
  subscribeFamily?(familyId: string, onChange: () => void): Promise<() => void>;
  pairChildDevice?(token: string, requestId: string): Promise<RealAccountSession>;
  reauthenticate?(password: string, expectedUserId?: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<RealAccountSession>;
  signIn(email: string, password: string): Promise<RealAccountSession>;
  restoreSession(): Promise<RealAccountSession | null>;
  getAccess(userId: string): Promise<PilotAccessStatus>;
  loadProfile(expectedUserId?: string): Promise<AccountProfile>;
  saveProfile(update: AccountProfileUpdate, expectedUserId?: string): Promise<AccountProfile>;
  loadWorkspace(expectedUserId?: string): Promise<AccountWorkspace>;
  updateWorkspace(
    update: AccountWorkspaceUpdate,
    expectedUserId?: string,
  ): Promise<AccountWorkspace>;
  resendVerification(email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  verifyRecovery(email: string, code: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
  onSessionChange(listener: (event: ParentAccountEvent) => void): () => void;
  setAppActive(active: boolean): void;
  dispose(): void;
}

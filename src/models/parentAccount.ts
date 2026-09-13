export type PilotAccessStatus = 'pending' | 'approved' | 'suspended';

export interface RealAccountSession {
  readonly userId: string;
  readonly email: string;
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
  | 'recovery_required'
  | 'session_expired'
  | 'operation_cancelled'
  | 'provider_unavailable';

export class ParentAccountError extends Error {
  constructor(readonly code: ParentAccountErrorCode) {
    super(code);
    this.name = 'ParentAccountError';
  }
}

export type ParentAccountEvent = 'signed-out' | 'changed' | 'recovery' | 'error';

export interface ParentAccountService {
  signUp(email: string, password: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<RealAccountSession>;
  signIn(email: string, password: string): Promise<RealAccountSession>;
  restoreSession(): Promise<RealAccountSession | null>;
  getAccess(userId: string): Promise<PilotAccessStatus>;
  resendVerification(email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  verifyRecovery(email: string, code: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
  onSessionChange(listener: (event: ParentAccountEvent) => void): () => void;
  setAppActive(active: boolean): void;
  dispose(): void;
}

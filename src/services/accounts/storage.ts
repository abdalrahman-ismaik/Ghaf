import { ParentAccountError } from '../../models/parentAccount';

export const ACCOUNT_STORAGE_KEY = 'ghaf.pilot.auth.v1';
export const RECOVERY_STORAGE_KEY = `${ACCOUNT_STORAGE_KEY}.recovery`;

export interface AccountStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export class GuardedAccountStorage implements AccountStorage {
  private writable = true;
  private failed = false;
  private queue: Promise<unknown> = Promise.resolve();
  private sessionSnapshot: string | null = null;

  constructor(
    private readonly storage: AccountStorage,
    private readonly storageKey = ACCOUNT_STORAGE_KEY,
  ) {}

  get hasFailed() {
    return this.failed;
  }

  blockWrites() {
    this.writable = false;
  }

  allowWrites() {
    this.writable = true;
    this.failed = false;
    this.sessionSnapshot = null;
  }

  forgetSnapshot() {
    this.sessionSnapshot = null;
  }

  private run<T>(operation: () => Promise<T>): Promise<T> {
    const pending = this.queue.then(operation).catch(() => {
      this.failed = true;
      throw new ParentAccountError('storage_unavailable');
    });
    this.queue = pending.catch(() => undefined);
    return pending;
  }

  getItem(key: string): Promise<string | null> {
    return this.run(async () => {
      if (!this.writable && key === this.storageKey && this.sessionSnapshot) {
        return this.sessionSnapshot;
      }
      const value = await this.storage.getItem(key);
      if (this.writable && key === this.storageKey) this.sessionSnapshot = value;
      return value;
    });
  }

  setItem(key: string, value: string): Promise<void> {
    return this.run(async () => {
      if (this.writable) {
        await this.storage.setItem(key, value);
        if (key === this.storageKey) this.sessionSnapshot = value;
      }
    });
  }

  removeItem(key: string): Promise<void> {
    return this.run(() => this.storage.removeItem(key));
  }

  async clearCredentials(preserveRecovery = false): Promise<void> {
    const results = await Promise.allSettled(
      [
        this.storageKey,
        `${this.storageKey}-user`,
        `${this.storageKey}-code-verifier`,
        ...(preserveRecovery ? [] : [`${this.storageKey}.recovery`]),
      ].map((key) => this.removeItem(key)),
    );
    if (results.some((result) => result.status === 'rejected')) {
      throw new ParentAccountError('storage_unavailable');
    }
  }
}

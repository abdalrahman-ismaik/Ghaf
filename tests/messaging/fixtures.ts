import { vi } from 'vitest';
import type {
  CredentialStorage,
  FamilyMessage,
  FamilyMessagingService,
  MessagingContext,
} from '../../src/features/familyMessaging/contracts';

export const ids = {
  user: '00000000-0000-4000-8000-000000000001',
  person: '30000000-0000-4000-8000-000000000001',
  household: '20000000-0000-4000-8000-000000000001',
  device: '50000000-0000-4000-8000-000000000001',
  thread: '40000000-0000-4000-8000-000000000001',
  key: '60000000-0000-4000-8000-000000000001',
  message: '70000000-0000-4000-8000-000000000001',
};
export const parent: MessagingContext = {
  role: 'parent',
  personId: ids.user,
  householdId: ids.household,
  deviceId: ids.device,
  displayName: 'Synthetic Parent',
  ageBand: null,
};
export const child: MessagingContext = {
  ...parent,
  role: 'child',
  personId: ids.person,
  displayName: 'Synthetic Child',
  ageBand: '9_11',
};
export const thread = {
  id: ids.thread,
  kind: 'parent_child' as const,
  childId: ids.person,
  otherName: 'Synthetic Child',
  otherRole: 'child' as const,
};
export const message: FamilyMessage = {
  id: ids.message,
  threadId: ids.thread,
  senderId: ids.user,
  body: 'Synthetic message',
  sequence: 1,
  createdAt: '2026-09-13T09:00:00.000Z',
  clientKey: ids.key,
};
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
export function memoryStorage(): CredentialStorage {
  let value: string | null = null;
  return {
    read: vi.fn(async () => value),
    write: vi.fn(async (next: string) => {
      value = next;
    }),
    clear: vi.fn(async () => {
      value = null;
    }),
  };
}
export function fakeService(context: MessagingContext = parent): FamilyMessagingService {
  return {
    configured: true,
    restore: vi.fn(async () => context),
    context: vi.fn(async () => context),
    signIn: vi.fn(async () => context),
    enroll: vi.fn(async () => context),
    threads: vi.fn(async () => [
      { ...thread, otherRole: context.role === 'child' ? ('parent' as const) : ('child' as const) },
    ]),
    messages: vi.fn(async () => []),
    send: vi.fn(async () => message),
    children: vi.fn(async () => []),
    peerPermissions: vi.fn(async () => []),
    setPeerPermission: vi.fn(async () => undefined),
    leavePeerThread: vi.fn(async () => undefined),
    createChild: vi.fn(),
    invite: vi.fn(),
    devices: vi.fn(async () => []),
    revokeDevice: vi.fn(async () => undefined),
    revokeAccount: vi.fn(async () => undefined),
    signOut: vi.fn(async () => ({ remoteConfirmed: true })),
    forget: vi.fn(async () => undefined),
  };
}

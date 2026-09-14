import type {
  FamilyMessage,
  MessagingAgeBand,
  MessagingErrorCode,
  PhraseId,
} from '@/features/familyMessaging/contracts';

export interface CloudMessagingActor {
  readonly personId: string;
  readonly role: 'parent' | 'child';
  readonly ageBand: MessagingAgeBand | null;
}
export interface CloudMessageThread {
  readonly id: string;
  readonly kind: 'parent_child' | 'child_child';
  readonly childId: string;
  readonly otherName: string;
  readonly otherRole: 'parent' | 'child';
  readonly otherPersonId: string;
  readonly lastSequence: number;
  readonly readSequence: number;
  readonly unreadCount: number;
}
export interface CloudMessageInbox {
  readonly actor: CloudMessagingActor;
  readonly threads: readonly CloudMessageThread[];
}
export interface CloudMessagePermission {
  readonly firstChildId: string;
  readonly secondChildId: string;
  readonly firstName: string;
  readonly secondName: string;
  readonly threadId: string | null;
  readonly enabled: boolean;
  readonly available: boolean;
}
export interface CloudMessagePage {
  readonly messages: readonly FamilyMessage[];
  readonly hasMore: boolean;
}
export interface CloudMessagePending {
  readonly threadId: string;
  readonly requestId: string;
  readonly body: string;
  readonly phraseId: PhraseId | null;
  readonly createdAt: number;
  readonly status: 'sending' | 'failed';
}
export interface CloudMessagingState {
  readonly status: 'loading' | 'ready' | 'unavailable';
  readonly inbox: CloudMessageInbox | null;
  readonly permissions: readonly CloudMessagePermission[];
  readonly threadId: string | null;
  readonly messages: readonly FamilyMessage[];
  readonly hasMore: boolean;
  readonly busy: boolean;
  readonly error: MessagingErrorCode | null;
  readonly pending: CloudMessagePending | null;
}
export interface CloudMessagingTransport {
  familyRequest(name: string, args: Record<string, unknown>): Promise<unknown>;
  subscribeFamily(familyId: string, listener: () => void): Promise<() => void>;
}

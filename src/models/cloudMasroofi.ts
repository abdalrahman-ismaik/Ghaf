import type { CloudFamilyActor } from './cloudFamily';
import type {
  MasroofiControls,
  MasroofiDeclineReason,
  MasroofiPurchaseFixtureId,
} from './masroofi';

export interface CloudMasroofiCard {
  readonly childId: string;
  readonly balanceFils: number;
  readonly controlsVersion: number;
  readonly age10PlusConfirmed: true;
  readonly controls: MasroofiControls;
}

export interface CloudMasroofiPromise {
  readonly id: string;
  readonly childId: string;
  readonly taskId: string;
  readonly taskRevision: number;
  readonly amountFils?: number;
  readonly status: 'promised' | 'credited';
  readonly createdAt: string;
  readonly creditedAt: string | null;
}

export interface CloudMasroofiTransaction {
  readonly id: string;
  readonly childId: string;
  readonly requestId: string;
  readonly kind: 'reward' | 'top_up' | 'purchase';
  readonly amountFils: number;
  readonly status: 'credited' | 'approved' | 'declined';
  readonly declineReason: MasroofiDeclineReason | null;
  readonly fixtureId: MasroofiPurchaseFixtureId | null;
  readonly day: string;
  readonly balanceAfterFils: number;
  readonly taskId: string | null;
  readonly createdAt: string;
}

export interface CloudMasroofiSnapshot {
  readonly schemaVersion: 1;
  readonly actor: CloudFamilyActor;
  readonly familyId: string;
  readonly revision: number;
  readonly cards: readonly CloudMasroofiCard[];
  readonly promises: readonly CloudMasroofiPromise[];
  readonly transactions: readonly CloudMasroofiTransaction[];
}

export type CloudMasroofiCommand =
  | { readonly type: 'card.enable'; readonly childId: string; readonly age10PlusConfirmed: true }
  | {
      readonly type: 'card.controls';
      readonly childId: string;
      readonly expectedVersion: number;
      readonly controls: MasroofiControls;
    }
  | { readonly type: 'card.top_up'; readonly childId: string; readonly amountFils: number }
  | {
      readonly type: 'reward.promise';
      readonly taskId: string;
      readonly expectedTaskRevision: number;
      readonly amountFils: number;
    }
  | {
      readonly type: 'purchase';
      readonly childId: string;
      readonly fixtureId: MasroofiPurchaseFixtureId;
    };

export type CloudMasroofiErrorCode =
  | 'access_unavailable'
  | 'family_unavailable'
  | 'invalid_command'
  | 'invalid_transition'
  | 'request_conflict'
  | 'reauth_required'
  | 'network_unavailable'
  | 'provider_unavailable'
  | 'schema_unavailable'
  | 'invalid_response'
  | 'age_ineligible'
  | 'task_ineligible'
  | 'promise_locked'
  | 'balance_limit';

export class CloudMasroofiError extends Error {
  constructor(readonly code: CloudMasroofiErrorCode) {
    super(code);
    this.name = 'CloudMasroofiError';
  }
}

export interface CloudMasroofiTransport {
  familyRequest(
    name: 'ghaf_family_masroofi' | 'ghaf_family_masroofi_command',
    args: Readonly<Record<string, unknown>>,
  ): Promise<unknown>;
  subscribeFamily(familyId: string, onChange: () => void): Promise<() => void>;
  reauthenticate?(password: string): Promise<unknown>;
}

export interface CloudMasroofiService {
  load(): Promise<CloudMasroofiSnapshot>;
  command(requestId: string, command: CloudMasroofiCommand): Promise<CloudMasroofiSnapshot>;
}

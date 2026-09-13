import type { AgeBand, RecognitionReceipt, SyntheticChildId, TaskJourney } from './familyGrowth';

export type MasroofiActor =
  { readonly role: 'parent' } | { readonly role: 'child'; readonly childId: SyntheticChildId };

export type MasroofiCategory = 'stationery' | 'games';
export type MasroofiPurchaseFixtureId = 'stationery' | 'game_online';

export interface MasroofiControls {
  readonly frozen: boolean;
  readonly onlineAllowed: boolean;
  readonly allowedCategories: readonly MasroofiCategory[];
  readonly perPurchaseLimitFils: number;
  readonly dailyLimitFils: number;
}

export interface MasroofiCard {
  readonly childId: SyntheticChildId;
  readonly enabled: true;
  readonly age10PlusConfirmed: true;
  readonly balanceFils: number;
  readonly controls: MasroofiControls;
  readonly origin: 'simulated';
}

export interface MasroofiPromise {
  readonly id: string;
  readonly childId: SyntheticChildId;
  readonly taskId: string;
  readonly taskVersion: number;
  readonly assignmentId: string;
  readonly amountFils: number;
  readonly contentFingerprint: string;
  readonly status: 'promised' | 'credited';
  readonly recognitionKey: string | null;
}

export type MasroofiDeclineReason =
  | 'card_disabled'
  | 'card_frozen'
  | 'category_blocked'
  | 'online_blocked'
  | 'per_purchase_limit'
  | 'daily_limit'
  | 'insufficient_balance';

export type MasroofiErrorCode =
  | MasroofiDeclineReason
  | 'feature_disabled'
  | 'profile_unavailable'
  | 'access_denied'
  | 'parent_required'
  | 'child_required'
  | 'profile_mismatch'
  | 'age_ineligible'
  | 'invalid_amount'
  | 'invalid_controls'
  | 'invalid_request'
  | 'request_conflict'
  | 'task_ineligible'
  | 'task_not_available'
  | 'promise_locked'
  | 'recognition_required'
  | 'recognition_mismatch'
  | 'balance_limit';

export interface MasroofiTransaction {
  readonly id: string;
  readonly requestId: string;
  readonly childId: SyntheticChildId;
  readonly kind: 'reward' | 'top_up' | 'purchase';
  readonly amountFils: number;
  readonly status: 'credited' | 'approved' | 'declined';
  readonly declineReason: MasroofiDeclineReason | null;
  readonly fixtureId: MasroofiPurchaseFixtureId | null;
  readonly day: string;
  readonly balanceAfterFils: number;
  readonly assignmentId: string | null;
  readonly origin: 'simulated';
}

export interface MasroofiRuntime {
  readonly cards: Readonly<Partial<Record<SyntheticChildId, MasroofiCard>>>;
  readonly promises: readonly MasroofiPromise[];
  readonly transactions: readonly MasroofiTransaction[];
}

export interface MasroofiParentView {
  readonly card: MasroofiCard | null;
  readonly promises: readonly MasroofiPromise[];
  readonly transactions: readonly MasroofiTransaction[];
}

export interface MasroofiChildView {
  readonly card: MasroofiCard | null;
  readonly transactions: readonly MasroofiTransaction[];
  readonly promisedAssignmentIds: readonly string[];
  readonly promisedTasks: readonly {
    readonly assignmentId: string;
    readonly taskVersion: number;
  }[];
}

export type MasroofiResult<T> =
  | { readonly ok: true; readonly data: T }
  | {
      readonly ok: false;
      readonly error: { readonly code: MasroofiErrorCode; readonly message: string };
    };

export interface MasroofiProfileInput {
  readonly actor: MasroofiActor;
  readonly childId: SyntheticChildId;
}

export interface MasroofiEnableInput extends MasroofiProfileInput {
  readonly ageBand: AgeBand;
  readonly age10PlusConfirmed: boolean;
  readonly knownAge?: number;
}

export interface MasroofiControlsInput extends MasroofiProfileInput {
  readonly controls: MasroofiControls;
}

export interface MasroofiTopUpInput extends MasroofiProfileInput {
  readonly amountFils: number;
  readonly requestId: string;
  readonly day: string;
}

export interface MasroofiPromiseInput {
  readonly actor: MasroofiActor;
  readonly journey: TaskJourney;
  readonly amountFils: number;
}

export interface MasroofiCreditInput {
  readonly actor: MasroofiActor;
  readonly journey: TaskJourney;
  readonly receipt: RecognitionReceipt;
  readonly day: string;
}

export interface MasroofiPurchaseInput extends MasroofiProfileInput {
  readonly fixtureId: MasroofiPurchaseFixtureId;
  readonly requestId: string;
  readonly day: string;
}

export interface MasroofiService {
  eligibleJourney(journey: TaskJourney): boolean;
  enable(runtime: MasroofiRuntime, input: MasroofiEnableInput): MasroofiResult<MasroofiRuntime>;
  setControls(
    runtime: MasroofiRuntime,
    input: MasroofiControlsInput,
  ): MasroofiResult<MasroofiRuntime>;
  topUp(runtime: MasroofiRuntime, input: MasroofiTopUpInput): MasroofiResult<MasroofiRuntime>;
  promise(runtime: MasroofiRuntime, input: MasroofiPromiseInput): MasroofiResult<MasroofiRuntime>;
  credit(runtime: MasroofiRuntime, input: MasroofiCreditInput): MasroofiResult<MasroofiRuntime>;
  purchase(runtime: MasroofiRuntime, input: MasroofiPurchaseInput): MasroofiResult<MasroofiRuntime>;
  projectParent(
    runtime: MasroofiRuntime,
    input: MasroofiProfileInput,
  ): MasroofiResult<MasroofiParentView>;
  projectChild(
    runtime: MasroofiRuntime,
    input: MasroofiProfileInput,
  ): MasroofiResult<MasroofiChildView>;
}

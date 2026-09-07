import { z } from 'zod';

import type { SyntheticChildId } from './familyGrowth';

export const BOUNDED_AI_SCHEMA_VERSION = '1.0' as const;
export const MAX_CORRELATION_LIFETIME_MS = 5 * 60 * 1_000;
export const MAX_SYNTHETIC_GRANT_LIFETIME_MS = 30 * 24 * 60 * 60 * 1_000;
export const MAX_CHILD_TEXT_SCALARS = 240;
export const MAX_CHILD_TEXT_BYTES = 512;
export const MAX_VOICE_DURATION_MS = 15_000;
export const MAX_VOICE_BYTES = 262_144;

export const ageBandSchema = z.enum(['6_8', '9_11', '12_14']);
export const localeSchema = z.enum(['ar', 'en']);
export const urlSafeIdentifierSchema = z
  .string()
  .min(16)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/u);

const isoTimestampSchema = z.iso.datetime({ offset: true });
const invisibleControlPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u;
const externalLinkPattern = /(?:https?:\/\/|www\.)/iu;
const emailPattern = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/u;

function utf8ByteLength(value: string): number {
  let length = 0;
  for (const scalar of value) {
    const point = scalar.codePointAt(0) ?? 0;
    length += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
  }
  return length;
}

function boundedTextSchema(maxScalars: number, maxBytes?: number) {
  return z
    .string()
    .trim()
    .min(1)
    .refine((value) => Array.from(value).length <= maxScalars, 'Text is too long')
    .refine(
      (value) => maxBytes === undefined || utf8ByteLength(value) <= maxBytes,
      'Text exceeds the byte limit',
    )
    .refine((value) => !invisibleControlPattern.test(value), 'Control characters are not allowed')
    .refine((value) => !externalLinkPattern.test(value), 'External links are not allowed')
    .refine((value) => !emailPattern.test(value), 'Contact details are not allowed');
}

export function boundedBilingualCopySchema(maxScalars: number) {
  const text = boundedTextSchema(maxScalars);
  return z.object({ ar: text, en: text }).strict();
}

export const requestCorrelationV1Schema = z
  .object({
    requestId: urlSafeIdentifierSchema,
    bindingNonce: urlSafeIdentifierSchema,
    schemaVersion: z.literal(BOUNDED_AI_SCHEMA_VERSION),
    issuedAt: isoTimestampSchema,
    expiresAt: isoTimestampSchema,
  })
  .strict()
  .superRefine((value, context) => {
    const issuedAt = Date.parse(value.issuedAt);
    const expiresAt = Date.parse(value.expiresAt);
    const lifetime = expiresAt - issuedAt;
    if (lifetime <= 0 || lifetime > MAX_CORRELATION_LIFETIME_MS) {
      context.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message: 'Correlation lifetime must be positive and no more than five minutes',
      });
    }
  });

export const liveChildCoachGrantSchema = z
  .object({
    capability: z.enum(['text', 'voice']),
    status: z.enum(['granted', 'revoked', 'expired']),
    childSubject: urlSafeIdentifierSchema,
    grantVersion: z.number().int().positive(),
    noticeVersion: z.number().int().positive(),
    policyVersion: z.string().trim().min(1).max(80),
    providerVersion: z.string().trim().min(1).max(80),
    issuedAt: isoTimestampSchema,
    expiresAt: isoTimestampSchema,
    revokedAt: isoTimestampSchema.nullable(),
    reauthenticationProofId: urlSafeIdentifierSchema,
    capabilityTruth: z.literal('synthetic_implementation_only'),
  })
  .strict()
  .superRefine((value, context) => {
    const issuedAt = Date.parse(value.issuedAt);
    const expiresAt = Date.parse(value.expiresAt);
    const lifetime = expiresAt - issuedAt;
    if (lifetime <= 0 || lifetime > MAX_SYNTHETIC_GRANT_LIFETIME_MS) {
      context.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message: 'Synthetic grant lifetime must be positive and no more than 30 days',
      });
    }
    if (value.status === 'revoked' && value.revokedAt === null) {
      context.addIssue({
        code: 'custom',
        path: ['revokedAt'],
        message: 'Revoked grants require a revocation time',
      });
    }
    if (value.status !== 'revoked' && value.revokedAt !== null) {
      context.addIssue({
        code: 'custom',
        path: ['revokedAt'],
        message: 'Only revoked grants may include a revocation time',
      });
    }
  });

const coachIntentSchema = z.enum([
  'show_next_step',
  'make_step_shorter',
  'need_adult',
  'first_step',
  'next_step',
  'smaller_chunk',
  'if_then',
  'rehearse_phrase',
  'clarify_step',
  'plan_order',
  'ask_for_help',
  'reflect_on_strategy',
]);

const coachCopySchema = boundedBilingualCopySchema(180);

export const childCoachTextResponseV1Schema = z
  .object({
    schemaVersion: z.literal(BOUNDED_AI_SCHEMA_VERSION),
    requestId: urlSafeIdentifierSchema,
    taskBindingNonce: urlSafeIdentifierSchema,
    intent: coachIntentSchema,
    disposition: z.enum(['coach', 'ask_adult', 'decline']),
    steps: z.array(coachCopySchema).max(3),
    ifThenCue: coachCopySchema.nullable(),
    reflectionQuestion: coachCopySchema.nullable(),
    reviewedPhrase: coachCopySchema.nullable(),
    terminal: z.literal(true),
  })
  .strict();

export const AI_ZERO_EFFECTS = Object.freeze({
  taskApproved: false,
  taskAssigned: false,
  taskConfirmed: false,
  seedsAwarded: false,
  gardenGrowthApplied: false,
  circleEventCreated: false,
  leagueScoreChanged: false,
  familyRewardProgressChanged: false,
  badgeProgressChanged: false,
  learningProgressChanged: false,
} as const);

export const aiZeroEffectsSchema = z
  .object({
    taskApproved: z.literal(false),
    taskAssigned: z.literal(false),
    taskConfirmed: z.literal(false),
    seedsAwarded: z.literal(false),
    gardenGrowthApplied: z.literal(false),
    circleEventCreated: z.literal(false),
    leagueScoreChanged: z.literal(false),
    familyRewardProgressChanged: z.literal(false),
    badgeProgressChanged: z.literal(false),
    learningProgressChanged: z.literal(false),
  })
  .strict();

export const aiControlEventSchema = z
  .object({
    operation: z.enum([
      'draft_parent_task_v1',
      'coach_approved_task_v1',
      'transcribe_child_task_voice_v1',
    ]),
    schemaVersion: z.literal(BOUNDED_AI_SCHEMA_VERSION),
    ageBand: ageBandSchema.nullable(),
    outcome: z.enum(['prepared', 'live', 'fallback', 'denied', 'rejected']),
    latencyBucket: z.enum(['under_500_ms', 'under_1500_ms', 'under_5000_ms', 'timeout']),
    fallbackReason: z
      .enum(['timeout', 'network', 'authentication', 'rate_limit', 'invalid_response', 'safety'])
      .nullable(),
    rateLimitBucket: z.enum(['within_limit', 'limited', 'not_applicable']),
    deploymentVersion: z.string().trim().min(1).max(80),
    requestCorrelation: urlSafeIdentifierSchema,
    deletionOutcome: z.enum(['deleted', 'failed', 'not_applicable']),
  })
  .strict();

export const parentTaskArchetypeSchema = z.enum(['task_recycling_p0_v1', 'GI01', 'HR02', 'LW01']);

export const parentTaskDraftRequestV1Schema = z
  .object({
    operation: z.literal('draft_parent_task_v1'),
    schemaVersion: z.literal(BOUNDED_AI_SCHEMA_VERSION),
    requestId: urlSafeIdentifierSchema,
    bindingNonce: urlSafeIdentifierSchema,
    localeSet: z.literal('ar_en'),
    ageBand: ageBandSchema,
    archetypeId: parentTaskArchetypeSchema,
    catalogVersion: z.number().int().positive(),
    intent: z.enum(['draft', 'make_clearer', 'make_smaller', 'adapt_age']),
    effortBand: z.enum(['five_ten', 'ten_fifteen', 'fifteen_thirty']),
    stepCount: z.number().int().min(1).max(4),
    supportMode: z.enum([
      'short_steps',
      'visual_checklist',
      'adult_alongside',
      'independent_with_check',
    ]),
  })
  .strict();

const parentDraftStepSchema = z
  .object({
    order: z.number().int().min(1).max(4),
    text: boundedBilingualCopySchema(280),
  })
  .strict();

export const parentTaskDraftSuggestionV1Schema = z
  .object({
    schemaVersion: z.literal(BOUNDED_AI_SCHEMA_VERSION),
    requestId: urlSafeIdentifierSchema,
    bindingNonce: urlSafeIdentifierSchema,
    archetypeId: parentTaskArchetypeSchema,
    title: boundedBilingualCopySchema(120),
    positiveAction: boundedBilingualCopySchema(240),
    whyItMatters: boundedBilingualCopySchema(360),
    steps: z.array(parentDraftStepSchema).min(1).max(4),
    supportCue: boundedBilingualCopySchema(180),
  })
  .strict()
  .superRefine((value, context) => {
    const orders = value.steps.map((step) => step.order);
    if (orders.some((order, index) => order !== index + 1)) {
      context.addIssue({
        code: 'custom',
        path: ['steps'],
        message: 'Step order must be unique and continuous from one',
      });
    }
  });

const childCoachRequestBase = z.object({
  operation: z.literal('coach_approved_task_v1'),
  schemaVersion: z.literal(BOUNDED_AI_SCHEMA_VERSION),
  requestId: urlSafeIdentifierSchema,
  taskBindingNonce: urlSafeIdentifierSchema,
  locale: localeSchema,
  taskArchetypeId: parentTaskArchetypeSchema,
  catalogVersion: z.number().int().positive(),
  approvedTaskVersion: z.number().int().positive(),
  noticeVersion: z.number().int().positive(),
  grantVersion: z.number().int().positive(),
});

const structuredSupportSchema = z
  .object({
    supportChoice: z.enum([
      'first_step',
      'next_step',
      'smaller_chunk',
      'if_then',
      'rehearse_phrase',
      'need_adult',
    ]),
    stepOrdinal: z.number().int().min(1).max(4).optional(),
  })
  .strict();

const childCoach6To8RequestSchema = childCoachRequestBase
  .extend({
    ageBand: z.literal('6_8'),
    intent: z.enum(['show_next_step', 'make_step_shorter', 'need_adult']),
  })
  .strict();

const childCoach9To11RequestSchema = childCoachRequestBase
  .extend({
    ageBand: z.literal('9_11'),
    intent: z.enum([
      'first_step',
      'next_step',
      'smaller_chunk',
      'if_then',
      'rehearse_phrase',
      'need_adult',
    ]),
    templateInput: structuredSupportSchema,
  })
  .strict();

const boundedChildTextSchema = boundedTextSchema(
  MAX_CHILD_TEXT_SCALARS,
  MAX_CHILD_TEXT_BYTES,
).refine((value) => !/[\r\n]/u.test(value), 'Only one logical line is allowed');

const childCoach12To14RequestSchema = childCoachRequestBase
  .extend({
    ageBand: z.literal('12_14'),
    intent: z.enum([
      'clarify_step',
      'plan_order',
      'ask_for_help',
      'reflect_on_strategy',
      'need_adult',
    ]),
    templateInput: structuredSupportSchema.optional(),
    topic: z.enum(['clarify_step', 'plan_order', 'ask_for_help', 'reflect_on_strategy']).optional(),
    boundedText: boundedChildTextSchema.optional(),
    inputOrigin: z.enum(['typed', 'reviewed_voice_transcript']),
    voiceGrantVersion: z.number().int().positive().optional(),
    voiceNoticeVersion: z.number().int().positive().optional(),
    voiceRequestId: urlSafeIdentifierSchema.optional(),
    voiceBindingNonce: urlSafeIdentifierSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.intent === 'need_adult' && value.topic !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['topic'],
        message: 'The adult exit does not accept a generated topic',
      });
    }
    if (value.intent !== 'need_adult' && value.topic !== value.intent) {
      context.addIssue({
        code: 'custom',
        path: ['topic'],
        message: 'The bounded topic must match the selected intent',
      });
    }
    const voiceFields = [
      value.voiceGrantVersion,
      value.voiceNoticeVersion,
      value.voiceRequestId,
      value.voiceBindingNonce,
    ];
    if (
      value.inputOrigin === 'reviewed_voice_transcript' &&
      voiceFields.some((field) => field === undefined)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['voiceGrantVersion'],
        message: 'Reviewed voice text requires a separate voice grant and correlation',
      });
    }
    if (value.inputOrigin === 'typed' && voiceFields.some((field) => field !== undefined)) {
      context.addIssue({
        code: 'custom',
        path: ['voiceGrantVersion'],
        message: 'Typed text cannot carry voice authority',
      });
    }
  });

export const childCoachTextRequestV1Schema = z.discriminatedUnion('ageBand', [
  childCoach6To8RequestSchema,
  childCoach9To11RequestSchema,
  childCoach12To14RequestSchema,
]);

export const voiceCaptureEnvelopeV1Schema = z
  .object({
    voiceSessionId: urlSafeIdentifierSchema,
    requestId: urlSafeIdentifierSchema,
    bindingNonce: urlSafeIdentifierSchema,
    status: z.enum([
      'idle',
      'requesting_permission',
      'permission_denied',
      'ready',
      'recording_held',
      'transcribing',
      'transcript_review',
      'ready_to_send',
      'sending_text',
      'terminal',
      'failed',
      'deleting',
      'deleted',
    ]),
    locale: localeSchema,
    permissionState: z.enum(['unknown', 'denied', 'granted']),
    startedAt: isoTimestampSchema.nullable(),
    stoppedAt: isoTimestampSchema.nullable(),
    durationMs: z.number().int().min(0).max(MAX_VOICE_DURATION_MS),
    byteCount: z.number().int().min(0).max(MAX_VOICE_BYTES).nullable(),
    cacheUri: z.string().trim().min(1).max(2_048).nullable(),
    noticeVersion: z.number().int().positive(),
    grantVersion: z.number().int().positive(),
    taskArchetypeId: parentTaskArchetypeSchema,
    approvedTaskVersion: z.number().int().positive(),
    deletionStatus: z.enum(['not_applicable', 'pending', 'deleted', 'failed']),
  })
  .strict();

export const voiceTranscriptDraftV1Schema = z
  .object({
    requestId: urlSafeIdentifierSchema,
    bindingNonce: urlSafeIdentifierSchema,
    text: boundedChildTextSchema,
    locale: localeSchema,
    origin: z.enum(['prepared_synthetic', 'transcribed']),
    reviewStatus: z.enum(['unreviewed', 'edited', 'ready_to_send']),
  })
  .strict();

export const voiceTranscriptionMetadataV1Schema = z
  .object({
    operation: z.literal('transcribe_child_task_voice_v1'),
    schemaVersion: z.literal(BOUNDED_AI_SCHEMA_VERSION),
    requestId: urlSafeIdentifierSchema,
    bindingNonce: urlSafeIdentifierSchema,
    locale: localeSchema,
    taskArchetypeId: parentTaskArchetypeSchema,
    catalogVersion: z.number().int().positive(),
    approvedTaskVersion: z.number().int().positive(),
    noticeVersion: z.number().int().positive(),
    grantVersion: z.number().int().positive(),
    durationMs: z.number().int().positive().max(MAX_VOICE_DURATION_MS),
    declaredByteCount: z.number().int().positive().max(MAX_VOICE_BYTES),
    mediaType: z.enum(['audio/mp4', 'audio/m4a', 'audio/webm']),
    synthetic: z.literal(true),
  })
  .strict();

export const voiceTranscriptionResponseV1Schema = z
  .object({
    schemaVersion: z.literal(BOUNDED_AI_SCHEMA_VERSION),
    requestId: urlSafeIdentifierSchema,
    bindingNonce: urlSafeIdentifierSchema,
    text: boundedChildTextSchema,
    locale: localeSchema,
    audioDeleted: z.literal(true),
  })
  .strict();

export const capabilityTokenClaimsSchema = z
  .object({
    iss: z.string().trim().min(1).max(120),
    aud: z.string().trim().min(1).max(120),
    sub: urlSafeIdentifierSchema,
    tenant: urlSafeIdentifierSchema,
    role: z.enum(['parent', 'child']),
    scope: z.enum([
      'draft_parent_task_v1',
      'coach_approved_task_v1',
      'transcribe_child_task_voice_v1',
    ]),
    grantVersion: z.number().int().positive().nullable(),
    noticeVersion: z.number().int().positive().nullable(),
    voiceGrantVersion: z.number().int().positive().nullable().optional(),
    voiceNoticeVersion: z.number().int().positive().nullable().optional(),
    voiceRequestId: urlSafeIdentifierSchema.nullable().optional(),
    voiceBindingNonce: urlSafeIdentifierSchema.nullable().optional(),
    iat: z.number().int().nonnegative(),
    exp: z.number().int().positive(),
    jti: urlSafeIdentifierSchema,
    synthetic: z.literal(true),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.exp <= value.iat || value.exp - value.iat > 300) {
      context.addIssue({
        code: 'custom',
        path: ['exp'],
        message: 'Capability lifetime must be positive and no more than five minutes',
      });
    }
    const childScope = value.scope !== 'draft_parent_task_v1';
    if (childScope && (value.grantVersion === null || value.noticeVersion === null)) {
      context.addIssue({
        code: 'custom',
        path: ['grantVersion'],
        message: 'Child capability claims require grant and notice versions',
      });
    }
    if (
      value.scope === 'draft_parent_task_v1' &&
      (value.grantVersion !== null ||
        value.noticeVersion !== null ||
        value.voiceGrantVersion != null ||
        value.voiceNoticeVersion != null ||
        value.voiceRequestId != null ||
        value.voiceBindingNonce != null)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['grantVersion'],
        message: 'Parent drafting claims do not carry Child grant versions',
      });
    }
    if (
      value.scope !== 'coach_approved_task_v1' &&
      (value.voiceGrantVersion != null ||
        value.voiceNoticeVersion != null ||
        value.voiceRequestId != null ||
        value.voiceBindingNonce != null)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['voiceGrantVersion'],
        message: 'Voice handoff claims are valid only for the Child Coach text scope',
      });
    }
    if (value.scope === 'draft_parent_task_v1' && value.role !== 'parent') {
      context.addIssue({
        code: 'custom',
        path: ['role'],
        message: 'Parent scope requires Parent role',
      });
    }
    if (childScope && value.role !== 'child') {
      context.addIssue({
        code: 'custom',
        path: ['role'],
        message: 'Child scope requires Child role',
      });
    }
  });

export type RequestCorrelationV1 = z.infer<typeof requestCorrelationV1Schema>;
export type LiveChildCoachGrant = z.infer<typeof liveChildCoachGrantSchema>;
export type LiveChildCoachCapability = LiveChildCoachGrant['capability'];
export type LiveChildAiGrantsByProfile = Readonly<
  Record<SyntheticChildId, Readonly<Record<LiveChildCoachCapability, LiveChildCoachGrant>>>
>;
export type ChildCoachTextRequestV1 = z.infer<typeof childCoachTextRequestV1Schema>;
export type ChildCoachTextResponseV1 = z.infer<typeof childCoachTextResponseV1Schema>;
export type ParentTaskDraftRequestV1 = z.infer<typeof parentTaskDraftRequestV1Schema>;
export type ParentTaskDraftSuggestionV1 = z.infer<typeof parentTaskDraftSuggestionV1Schema>;
export type VoiceCaptureEnvelopeV1 = z.infer<typeof voiceCaptureEnvelopeV1Schema>;
export type VoiceTranscriptDraftV1 = z.infer<typeof voiceTranscriptDraftV1Schema>;
export type VoiceTranscriptionMetadataV1 = z.infer<typeof voiceTranscriptionMetadataV1Schema>;
export type VoiceTranscriptionResponseV1 = z.infer<typeof voiceTranscriptionResponseV1Schema>;
export type CapabilityTokenClaims = z.infer<typeof capabilityTokenClaimsSchema>;
export type AiControlEvent = z.infer<typeof aiControlEventSchema>;

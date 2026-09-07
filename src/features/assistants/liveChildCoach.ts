import {
  LIVE_CHILD_AI_NOTICE_VERSION,
  LIVE_CHILD_AI_POLICY_VERSION,
  LIVE_CHILD_AI_PROVIDER_VERSION,
  liveChildSubjectFor,
} from '../access';
import { evaluateAssistantSafety } from './policy';
import {
  childCoachTextRequestV1Schema,
  childCoachTextResponseV1Schema,
  liveChildCoachGrantSchema,
  type ChildCoachTextRequestV1,
  type ChildCoachTextResponseV1,
  type LiveChildCoachGrant,
} from '../../models/boundedAi';
import type {
  AgeBand,
  DomainResult,
  LocalizedText,
  SyntheticChildId,
} from '../../models/familyGrowth';

export type LiveChildCoachIntent = ChildCoachTextRequestV1['intent'];

export interface LiveChildCoachRequestInput {
  readonly ageBand: AgeBand;
  readonly childId: SyntheticChildId;
  readonly locale: 'ar' | 'en';
  readonly now: string;
  readonly taskArchetypeId: ChildCoachTextRequestV1['taskArchetypeId'];
  readonly catalogVersion: number;
  readonly approvedTaskVersion: number;
  readonly requestId: string;
  readonly bindingNonce: string;
  readonly grant: LiveChildCoachGrant;
  readonly intent: LiveChildCoachIntent;
  readonly boundedText?: string;
  readonly inputOrigin?: 'typed' | 'reviewed_voice_transcript';
  readonly voiceGrant?: LiveChildCoachGrant;
  readonly voiceRequestId?: string;
  readonly voiceBindingNonce?: string;
}

export interface LiveChildCoachSnapshot {
  readonly childId: SyntheticChildId;
  readonly assignmentId: string;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly grantVersion: number;
  readonly noticeVersion: number;
  readonly voiceGrantVersion: number | null;
  readonly voiceRequestId: string | null;
}

export interface LiveChildCoachView {
  readonly status: 'idle' | 'requesting' | 'terminal' | 'fallback' | 'denied' | 'declined';
  readonly origin: 'prepared' | 'live' | null;
  readonly response: ChildCoachTextResponseV1 | null;
  readonly activeRequest: ChildCoachTextRequestV1 | null;
  readonly snapshot: LiveChildCoachSnapshot | null;
  readonly requestRevision: number;
  readonly fallbackReason:
    'timeout' | 'remote_unavailable' | 'invalid_response' | 'safety_rejected' | null;
}

export const INITIAL_LIVE_CHILD_COACH_VIEW: LiveChildCoachView = Object.freeze({
  status: 'idle',
  origin: null,
  response: null,
  activeRequest: null,
  snapshot: null,
  requestRevision: 0,
  fallbackReason: null,
});

const INPUT_SAFETY_PATTERNS: readonly RegExp[] = [
  /(?:\+?\d[\d\s().-]{7,}\d)|(?:[٠-٩۰-۹][٠-٩۰-۹\s.-]{7,}[٠-٩۰-۹])/u,
  /\b(?:address|home address|street|phone|mobile|contact me|call me|location)\b|(?:عنوان|شارع|موقعي|موقع المنزل|هاتف|جوال|اتصل بي)/iu,
  /\b(?:ignore|override|forget)\b.{0,40}\b(?:instruction|prompt|policy|system)\b|(?:تجاهل|تخط|انس).{0,40}(?:التعليمات|السياسة|النظام|رسالة النظام)/iu,
  /\b(?:system prompt|developer message|hidden instruction|reveal.*prompt)\b|(?:اكشف|أظهر).{0,30}(?:رسالة النظام|التعليمات المخفية)/iu,
  /\b(?:do i have|diagnose me|am i)\b.{0,30}\b(?:adhd|disorder|depression|anxiety)\b|(?:هل لدي|شخّصني).{0,30}(?:فرط الحركة|اضطراب|اكتئاب|قلق)/iu,
  /\b(?:is my prayer|my prayer is|judge my prayer|religiously valid)\b|(?:هل|احكم).{0,30}(?:صلاتي|ديني|إيماني).{0,20}(?:صحيحة|صحيح|باطلة|صالح)/iu,
  /\b(?:pick up|touch|handle)\b.{0,35}\b(?:broken glass|battery|chemical|unknown waste)\b|(?:أ?لتقط|أ?لمس|أ?تعامل).{0,35}(?:الزجاج المكسور|بطارية|مواد كيميائية|نفايات مجهولة)/iu,
  /\b(?:my name is|i am called|device id|ip address)\b|(?:اسمي|أنا اسمي|معرّف الجهاز|عنوان الإنترنت)/iu,
  /\b(?:suicid(?:e|al)|kill myself|hurt myself|self[- ]harm|want to die)\b|(?:انتحار|أقتل نفسي|أؤذي نفسي|إيذاء النفس|أريد أن أموت)/iu,
  /\b(?:sex|sexual|nude|naked|private parts?|porn)\b|(?:جنس|جنسي|عاري|عارية|أجزاء خاصة|إباحي)/iu,
  /\b(?:medicine|medication|dose|doctor|medical|allergy|sick|ill)\b|(?:دواء|جرعة|طبيب|طبي|حساسية|مريض|مريضة)/iu,
  /\b(?:safe to eat|expired food|raw food|allergen)\b|(?:آمن للأكل|طعام منتهي|طعام نيء|مسبب للحساسية)/iu,
];

const TASK_RELEVANCE_PATTERNS: Readonly<
  Record<LiveChildCoachRequestInput['taskArchetypeId'], RegExp>
> = {
  task_recycling_p0_v1:
    /\b(?:task|step|first|next|start|help|adult|sort|recycl|paper|plastic|clean|item|bin)\b|(?:المهمة|مهمة|خطوة|الأولى|التالية|أبدأ|ابدأ|مساعدة|بالغ|افرز|فرز|تدوير|ورق|بلاستيك|نظيف|غرض|حاوية)/iu,
  GI01: /\b(?:task|step|first|next|start|help|adult|sort|recycl|paper|plastic|clean|item|bin)\b|(?:المهمة|مهمة|خطوة|الأولى|التالية|أبدأ|ابدأ|مساعدة|بالغ|افرز|فرز|تدوير|ورق|بلاستيك|نظيف|غرض|حاوية)/iu,
  HR02: /\b(?:task|step|first|next|start|help|adult|school|bag|tomorrow|book|checklist|item|pack)\b|(?:المهمة|مهمة|خطوة|الأولى|التالية|أبدأ|ابدأ|مساعدة|بالغ|مدرسة|حقيبة|غد|كتاب|قائمة|غرض|جهز|تجهيز)/iu,
  LW01: /\b(?:task|step|first|next|start|help|adult|read|listen|book|minute|accessible)\b|(?:المهمة|مهمة|خطوة|الأولى|التالية|أبدأ|ابدأ|مساعدة|بالغ|اقرأ|قراءة|استمع|كتاب|دقيقة|ميسر|ميسّر)/iu,
};

function failure(
  code: 'INVALID_INPUT' | 'INVALID_RESPONSE' | 'PRIVACY_REJECTED' | 'SAFETY_REJECTED',
  message: string,
): DomainResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: code !== 'INVALID_INPUT' },
  };
}

export function liveChildCoachBoundedTextIsSafe(
  taskArchetypeId: LiveChildCoachRequestInput['taskArchetypeId'],
  value: string,
): boolean {
  if (INPUT_SAFETY_PATTERNS.some((pattern) => pattern.test(value))) return false;
  if (!TASK_RELEVANCE_PATTERNS[taskArchetypeId].test(value)) return false;
  return evaluateAssistantSafety({
    audience: 'child',
    texts: [{ ar: value, en: value }],
  }).accepted;
}

function grantAllowsRequest(
  input: LiveChildCoachRequestInput,
  grant: LiveChildCoachGrant | undefined,
  capability: 'text' | 'voice',
): boolean {
  const parsed = liveChildCoachGrantSchema.safeParse(grant);
  const now = Date.parse(input.now);
  return (
    parsed.success &&
    Number.isFinite(now) &&
    parsed.data.capability === capability &&
    parsed.data.status === 'granted' &&
    parsed.data.childSubject === liveChildSubjectFor(input.childId) &&
    parsed.data.noticeVersion === LIVE_CHILD_AI_NOTICE_VERSION &&
    parsed.data.policyVersion === LIVE_CHILD_AI_POLICY_VERSION &&
    parsed.data.providerVersion === LIVE_CHILD_AI_PROVIDER_VERSION &&
    now >= Date.parse(parsed.data.issuedAt) &&
    now < Date.parse(parsed.data.expiresAt)
  );
}

export function createLiveChildCoachRequest(
  input: LiveChildCoachRequestInput,
): DomainResult<ChildCoachTextRequestV1> {
  if (!grantAllowsRequest(input, input.grant, 'text')) {
    return failure('PRIVACY_REJECTED', 'A current profile-scoped text grant is required');
  }
  if (
    input.inputOrigin === 'reviewed_voice_transcript' &&
    !grantAllowsRequest(input, input.voiceGrant, 'voice')
  ) {
    return failure('PRIVACY_REJECTED', 'A current separate voice grant is required');
  }
  const base = {
    operation: 'coach_approved_task_v1' as const,
    schemaVersion: '1.0' as const,
    requestId: input.requestId,
    taskBindingNonce: input.bindingNonce,
    locale: input.locale,
    taskArchetypeId: input.taskArchetypeId,
    catalogVersion: input.catalogVersion,
    approvedTaskVersion: input.approvedTaskVersion,
    noticeVersion: input.grant.noticeVersion,
    grantVersion: input.grant.grantVersion,
  };
  const candidate =
    input.ageBand === '6_8'
      ? { ...base, ageBand: input.ageBand, intent: input.intent }
      : input.ageBand === '9_11'
        ? {
            ...base,
            ageBand: input.ageBand,
            intent: input.intent,
            templateInput: { supportChoice: input.intent },
            ...(input.boundedText === undefined ? {} : { boundedText: input.boundedText }),
          }
        : {
            ...base,
            ageBand: input.ageBand,
            intent: input.intent,
            ...(input.intent === 'need_adult' ? {} : { topic: input.intent }),
            ...(input.boundedText === undefined ? {} : { boundedText: input.boundedText }),
            inputOrigin: input.inputOrigin ?? 'typed',
            ...(input.inputOrigin === 'reviewed_voice_transcript' && input.voiceGrant
              ? {
                  voiceGrantVersion: input.voiceGrant.grantVersion,
                  voiceNoticeVersion: input.voiceGrant.noticeVersion,
                  voiceRequestId: input.voiceRequestId,
                  voiceBindingNonce: input.voiceBindingNonce,
                }
              : {}),
          };
  const parsed = childCoachTextRequestV1Schema.safeParse(candidate);
  if (!parsed.success) {
    return failure('INVALID_INPUT', 'Child Coach intent or input mode is outside the age policy');
  }
  if (
    parsed.data.ageBand === '12_14' &&
    parsed.data.boundedText !== undefined &&
    !liveChildCoachBoundedTextIsSafe(parsed.data.taskArchetypeId, parsed.data.boundedText)
  ) {
    return failure('SAFETY_REJECTED', 'Child input was stopped locally before inference');
  }
  return { ok: true, data: parsed.data };
}

function responseTexts(response: ChildCoachTextResponseV1): readonly LocalizedText[] {
  return [
    ...response.steps,
    ...(response.ifThenCue ? [response.ifThenCue] : []),
    ...(response.reflectionQuestion ? [response.reflectionQuestion] : []),
    ...(response.reviewedPhrase ? [response.reviewedPhrase] : []),
  ];
}

export function validateLiveChildCoachResponse(
  request: ChildCoachTextRequestV1,
  input: unknown,
): DomainResult<ChildCoachTextResponseV1> {
  const parsed = childCoachTextResponseV1Schema.safeParse(input);
  const maximumSteps = request.ageBand === '6_8' ? 1 : 3;
  if (
    !parsed.success ||
    parsed.data.requestId !== request.requestId ||
    parsed.data.taskBindingNonce !== request.taskBindingNonce ||
    parsed.data.intent !== request.intent ||
    parsed.data.steps.length > maximumSteps ||
    (parsed.data.disposition === 'ask_adult' && parsed.data.steps.length !== 0) ||
    (parsed.data.disposition === 'decline' && parsed.data.steps.length !== 0) ||
    (parsed.data.disposition === 'coach' && responseTexts(parsed.data).length === 0)
  ) {
    return failure('INVALID_RESPONSE', 'Child Coach response is malformed or mismatched');
  }
  if (!evaluateAssistantSafety({ audience: 'child', texts: responseTexts(parsed.data) }).accepted) {
    return failure('SAFETY_REJECTED', 'Child Coach response failed local safety policy');
  }
  return { ok: true, data: parsed.data };
}

export function createLocalChildCoachSafeExit(
  request: ChildCoachTextRequestV1,
  reason: 'safety' | 'adult' | 'declined',
): ChildCoachTextResponseV1 {
  const asksAdult = reason === 'adult';
  return {
    schemaVersion: '1.0',
    requestId: request.requestId,
    taskBindingNonce: request.taskBindingNonce,
    intent: request.intent,
    disposition: asksAdult ? 'ask_adult' : 'decline',
    steps: [],
    ifThenCue: null,
    reflectionQuestion: null,
    reviewedPhrase: {
      ar: asksAdult
        ? 'توقّف الآن واطلب مساعدة شخص بالغ تثق به.'
        : 'لن نرسل هذا. يمكنك اختيار مساعدة مُعدّة أو طلب شخص بالغ.',
      en: asksAdult
        ? 'Stop now and ask a trusted adult for help.'
        : 'We will not send that. You can choose prepared help or ask an adult.',
    },
    terminal: true,
  };
}

export function idleLiveChildCoachView(
  current: LiveChildCoachView,
  status: 'idle' | 'declined' = 'idle',
): LiveChildCoachView {
  return {
    ...INITIAL_LIVE_CHILD_COACH_VIEW,
    status,
    requestRevision: current.requestRevision + 1,
  };
}

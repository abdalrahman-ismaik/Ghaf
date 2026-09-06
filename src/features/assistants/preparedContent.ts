import type {
  PreparedCoachMaterial,
  PreparedCoachMaterialFixtureId,
  PreparedVoiceTranscriptFixture,
  PreparedVoiceTranscriptFixtureId,
} from '../../models/assistantVoice';

export const P0_APPROVED_COACH_BINDING = Object.freeze({
  childId: 'child_salem',
  assignmentId: 'assignment_recycling_p0_v1',
  taskId: 'task_recycling_p0_v1',
  approvedTaskVersion: 1,
} as const);

const p0PreparedCoachMaterial = Object.freeze({
  fixtureId: 'coach_recycling_steps_v1',
  taskId: P0_APPROVED_COACH_BINDING.taskId,
  approvedTaskVersion: P0_APPROVED_COACH_BINDING.approvedTaskVersion,
  steps: Object.freeze([
    Object.freeze({
      ar: 'اطلب من شخص بالغ فحص المواد النظيفة مسبقاً وتحديد حاوية إعادة التدوير المنزلية.',
      en: 'Ask an adult to pre-check the clean items and choose the household recycling bin.',
    }),
    Object.freeze({
      ar: 'افرز فقط الورق والبلاستيك السليمين وغير الحادّين اللذين وافق عليهما الشخص البالغ.',
      en: 'Sort only the intact, non-sharp paper and plastic the adult approved.',
    }),
    Object.freeze({
      ar: 'توقّف واسأل شخصاً بالغاً إذا كان أي شيء حاداً أو متسرباً أو متسخاً أو مجهولاً.',
      en: 'Stop and ask an adult if anything is sharp, leaking, dirty, or unknown.',
    }),
    Object.freeze({
      ar: 'بعد الفحص الثاني، ساعد في إغلاق كيس إعادة التدوير الخفيف عند الحاجة، ورافق الشخص البالغ عبر المسار الآمن بينما يحمل الكيس ويتولى التخلّص منه، ثم اغسل يديك.',
      en: 'After the adult checks again, help close the light recycling bag if needed, go with the adult on the safe route while the adult carries/disposes, then wash your hands.',
    }),
  ] as const),
  quickChoices: Object.freeze([
    Object.freeze({ ar: 'أرني الخطوات', en: 'Show me the steps' }),
    Object.freeze({ ar: 'بسّطها', en: 'Make it simpler' }),
    Object.freeze({ ar: 'أحتاج إلى شخص بالغ', en: 'I need an adult' }),
  ] as const),
  adultExit: Object.freeze({ ar: 'أحتاج إلى شخص بالغ', en: 'I need an adult' }),
  aiDisclosure: Object.freeze({
    ar: 'مثال مُعدّ مسبقاً لمساعد بالذكاء الاصطناعي؛ هذه الاستجابة مكتوبة مسبقاً وقد تكون غير صحيحة.',
    en: 'Prepared AI-assistant example; this response is prewritten and may be wrong.',
  }),
  origin: 'prepared',
} as const satisfies PreparedCoachMaterial);

export const PREPARED_COACH_MATERIALS = Object.freeze({
  coach_recycling_steps_v1: p0PreparedCoachMaterial,
} as const satisfies Readonly<Record<PreparedCoachMaterialFixtureId, PreparedCoachMaterial>>);

export const PREPARED_VOICE_TRANSCRIPTS: Readonly<
  Record<PreparedVoiceTranscriptFixtureId, PreparedVoiceTranscriptFixture>
> = Object.freeze({
  voice_recycling_complete_v1: Object.freeze({
    taskId: P0_APPROVED_COACH_BINDING.taskId,
    approvedTaskVersion: P0_APPROVED_COACH_BINDING.approvedTaskVersion,
    transcript: Object.freeze({
      ar: 'بعد فحص الشخص البالغ، أفرز المواد النظيفة.',
      en: 'After the adult checks, I sort the clean items.',
    }),
  }),
  voice_short_review_v1: Object.freeze({
    taskId: P0_APPROVED_COACH_BINDING.taskId,
    approvedTaskVersion: P0_APPROVED_COACH_BINDING.approvedTaskVersion,
    transcript: Object.freeze({ ar: 'نص مجهز.', en: 'Prepared text.' }),
  }),
});

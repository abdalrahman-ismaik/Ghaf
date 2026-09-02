import type {
  CoachAgeGroup,
  CoachLanguageMode,
  CoachRequest,
  CoachResponse,
  LocalizedText,
} from '../../models/prototype';

export interface CoachAgePolicy {
  readonly maximumQuickChoices: number;
  readonly maximumResponseCharacters: number;
  readonly instructionStyle: string;
}

const ARABIC_CHARACTER = /[\u0600-\u06ff]/u;
const LATIN_CHARACTER = /[a-z]/iu;
const ADULT_REQUIRED_PATTERNS = [
  /safe to eat|food poisoning|allergy|medicine|doctor|religious ruling|fatwa/iu,
  /آمن(?:ة)? للأكل|تسمم|حساسي(?:ة|ه)|دواء|طبيب|فتوى|حكم شرعي/iu,
  /phone number|email address|home address|رقم الهاتف|البريد الإلكتروني|عنوان المنزل/iu,
];

export function getCoachAgePolicy(ageGroup: CoachAgeGroup): CoachAgePolicy {
  switch (ageGroup) {
    case '6-8':
      return {
        maximumQuickChoices: 2,
        maximumResponseCharacters: 180,
        instructionStyle: 'Give one instruction at a time in very short sentences.',
      };
    case '9-11':
      return {
        maximumQuickChoices: 3,
        maximumResponseCharacters: 280,
        instructionStyle: 'Give two or three short steps with friendly quick choices.',
      };
    case '12-14':
      return {
        maximumQuickChoices: 3,
        maximumResponseCharacters: 360,
        instructionStyle: 'Be concise, respectful, and mature; never sound babyish.',
      };
  }
}

export function detectCoachLanguageMode(message: string): CoachLanguageMode {
  const hasArabic = ARABIC_CHARACTER.test(message);
  const hasEnglish = LATIN_CHARACTER.test(message);
  if (hasArabic && hasEnglish) return 'code-switched';
  return hasArabic ? 'ar' : 'en';
}

export function coachNeedsAdult(message: string): boolean {
  return ADULT_REQUIRED_PATTERNS.some((pattern) => pattern.test(message));
}

export function createDeterministicCoachResponse(request: CoachRequest): CoachResponse {
  const requiresAdult = coachNeedsAdult(request.message);
  let message: LocalizedText;
  let quickChoices: readonly LocalizedText[];

  if (requiresAdult) {
    message = {
      ar: 'لا أستطيع اتخاذ هذا القرار. أوقف المهمة الآن واسأل شخصًا كبيرًا تثق به.',
      en: 'I cannot make that decision. Pause the task and ask an adult you trust.',
    };
    quickChoices = [];
  } else if (request.ageGroup === '6-8') {
    message = {
      ar: 'خطوة واحدة الآن: اتبع تعليمات المهمة الظاهرة. إذا لم تكن متأكدًا، اسأل شخصًا كبيرًا.',
      en: 'One step now: follow the task shown. If you are unsure, ask an adult.',
    };
    quickChoices = [{ ar: 'أرني الخطوة', en: 'Show my step' }];
  } else if (request.ageGroup === '9-11') {
    message = {
      ar: 'اقرأ المهمة الظاهرة، اختر الخطوة التالية، ثم أخبر ولي أمرك إذا احتجت إلى مساعدة.',
      en: 'Read the task shown, choose your next step, then tell a Parent if you need help.',
    };
    quickChoices = [
      { ar: 'اشرح الخطوة', en: 'Explain the step' },
      { ar: 'أحتاج مساعدة', en: 'I need help' },
    ];
  } else {
    message = {
      ar: 'راجع المهمة الحالية واختر الخطوة العملية التالية. إذا كان القرار يحتاج إلى حكم شخص بالغ، اطلب مساعدة ولي أمرك.',
      en: 'Review the current task and choose the next practical step. Ask a Parent when the decision needs adult judgment.',
    };
    quickChoices = [
      { ar: 'لخّص المهمة', en: 'Summarize the task' },
      { ar: 'ما الخطوة التالية؟', en: 'What is next?' },
    ];
  }

  return {
    schemaVersion: '1.0',
    requestId: request.requestId,
    taskId: request.taskId,
    message,
    quickChoices,
    askAdult: {
      label: { ar: 'اسأل شخصًا كبيرًا', en: 'Ask an adult' },
      recommended: requiresAdult || request.ageGroup === '6-8',
    },
    languageMode: detectCoachLanguageMode(request.message),
    safety: { foodSafetyVerdict: false, requiresAdult },
  };
}

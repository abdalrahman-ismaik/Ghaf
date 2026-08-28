import { z } from 'zod';

import type { DomainResult, Task, TaskTemplate } from '../../models/familyGrowth';
import { P0_RECYCLING_TEMPLATE, P0_SAFE_EQUIVALENT_TEMPLATE, TASK_TEMPLATES } from './demoContent';

const localizedTextSchema = z
  .object({
    ar: z.string().trim().min(1),
    en: z.string().trim().min(1),
  })
  .strict();

const categorySchema = z.enum([
  'faith_gratitude',
  'roots_kinship',
  'home_responsibility',
  'green_impact',
  'food_hospitality',
  'heritage_etiquette',
  'kindness_community',
  'learning_wellbeing',
]);

const landscapeSchema = z.enum(['ghaf', 'samar', 'sidr', 'date_palm', 'mangrove']);
const recognitionModeSchema = z.enum(['standard', 'fade_first', 'recognition_only']);
const routinePhaseSchema = z.enum(['acquisition', 'maintenance', 'not_applicable']);
const fixedSeedAwardSchema = z.union([
  z.literal(4),
  z.literal(6),
  z.literal(8),
  z.literal(12),
  z.literal(15),
]);

const taskSafetyBoundarySchema = z
  .object({
    adultPreCheck: localizedTextSchema,
    adultSecondCheck: localizedTextSchema,
    adultOwnedActions: z.array(localizedTextSchema).min(1),
    childAllowedActions: z.array(localizedTextSchema).min(1),
    excludedHazards: z.array(localizedTextSchema).min(1),
    stopAndAskAdult: localizedTextSchema,
    routeConstraint: localizedTextSchema.nullable(),
    indoorAlternative: localizedTextSchema.nullable(),
    aftercare: localizedTextSchema.nullable(),
  })
  .strict();

const CATEGORY_LANDSCAPES = {
  faith_gratitude: 'sidr',
  roots_kinship: 'ghaf',
  home_responsibility: 'samar',
  green_impact: 'mangrove',
  food_hospitality: 'date_palm',
  heritage_etiquette: 'ghaf',
  kindness_community: 'samar',
  learning_wellbeing: 'sidr',
} as const;

const PROHIBITED_FOOD_PRESSURE =
  /(?:clean\s*plate|finish\s+(?:all|every)|every\s+bite|calorie|diet|body\s*weight|إنهاء\s+كل\s+الطعام|الطبق\s+النظيف|السعرات|الحمية|الوزن)/iu;

export const taskTemplateSchema = z
  .object({
    id: z.string().trim().min(1),
    categoryId: categorySchema,
    landscapeId: landscapeSchema,
    title: localizedTextSchema,
    positiveAction: localizedTextSchema,
    whyItMatters: localizedTextSchema,
    definitionOfDone: localizedTextSchema,
    childAgeBands: z.array(z.enum(['6_8', '9_11', '12_14'])).min(1),
    estimatedEffort: localizedTextSchema,
    permittedHelp: localizedTextSchema,
    supervision: localizedTextSchema,
    safety: taskSafetyBoundarySchema,
    evidencePolicy: z.enum(['optional_prepared_only', 'none']),
    reflectionPolicy: z.enum(['optional_task_focused', 'none']),
    recognitionMode: recognitionModeSchema,
    routinePhase: routinePhaseSchema,
    recurrence: z.enum(['once', 'recurrent']),
    displayedSeedAward: fixedSeedAwardSchema.nullable(),
    visibilityScope: z.enum(['child_guardian', 'household']),
    circleEligible: z.boolean(),
    privacyNotice: localizedTextSchema,
    origin: z.literal('prepared'),
  })
  .strict()
  .superRefine((template, context) => {
    if (CATEGORY_LANDSCAPES[template.categoryId] !== template.landscapeId) {
      context.addIssue({
        code: 'custom',
        path: ['landscapeId'],
        message: 'The category must use its reviewed landscape mapping',
      });
    }

    if (
      template.circleEligible &&
      (template.categoryId !== 'green_impact' || template.visibilityScope !== 'household')
    ) {
      context.addIssue({
        code: 'custom',
        path: ['circleEligible'],
        message: 'Circle eligibility requires household-visible Green Impact work',
      });
    }

    if (
      template.recognitionMode === 'recognition_only' &&
      (template.routinePhase !== 'not_applicable' || template.displayedSeedAward !== null)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['recognitionMode'],
        message: 'Recognition-only tasks use not_applicable and no Seed award',
      });
    }

    if (
      template.recognitionMode !== 'recognition_only' &&
      template.routinePhase === 'not_applicable'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['routinePhase'],
        message: 'Reward-eligible tasks require acquisition or maintenance',
      });
    }

    if (
      template.recognitionMode !== 'recognition_only' &&
      template.routinePhase === 'acquisition' &&
      template.displayedSeedAward === null
    ) {
      context.addIssue({
        code: 'custom',
        path: ['displayedSeedAward'],
        message: 'Acquisition tasks require a fixed displayed Seed award',
      });
    }

    if (template.routinePhase === 'maintenance' && template.displayedSeedAward !== null) {
      context.addIssue({
        code: 'custom',
        path: ['displayedSeedAward'],
        message: 'Maintenance tasks do not display a Seed award',
      });
    }

    if (template.recognitionMode === 'standard' && template.recurrence !== 'once') {
      context.addIssue({
        code: 'custom',
        path: ['recurrence'],
        message: 'Standard tasks must be recurrence-once in the prototype',
      });
    }

    if (
      template.recurrence === 'recurrent' &&
      template.recognitionMode !== 'fade_first' &&
      template.recognitionMode !== 'recognition_only'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['recognitionMode'],
        message: 'Recurrent rewarded routines must use fade_first',
      });
    }

    if (
      template.categoryId === 'faith_gratitude' &&
      template.recognitionMode !== 'recognition_only'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['recognitionMode'],
        message: 'Faith fixtures default to private recognition-only behavior',
      });
    }

    if (template.categoryId === 'food_hospitality') {
      const foodCopy = [
        template.title.ar,
        template.title.en,
        template.positiveAction.ar,
        template.positiveAction.en,
        template.definitionOfDone.ar,
        template.definitionOfDone.en,
      ].join(' ');
      if (PROHIBITED_FOOD_PRESSURE.test(foodCopy)) {
        context.addIssue({
          code: 'custom',
          path: ['positiveAction'],
          message: 'Food tasks cannot pressure eating, bodies, calories, or a clean plate',
        });
      }
    }
  });

function invalidTask(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'INVALID_INPUT',
      message,
      retryable: false,
      fallbackAvailable: false,
    },
  };
}

function unsafeTask(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code: 'SAFETY_REJECTED',
      message,
      retryable: false,
      fallbackAvailable: true,
    },
  };
}

const HAZARDOUS_ENGLISH_INSTRUCTION =
  /\b(?:carry|take|bring|move|sort|collect|gather|place|bag|dispose|throw|pick\s*up|touch|handle|repair)\b.{0,55}\b(?:glass|sharps?|batter(?:y|ies)|chemicals?|medicine|unknown\s+waste|electrical\s+(?:item|wire|device))\b/iu;
const HAZARDOUS_ARABIC_INSTRUCTION =
  /(?:احمل|خذ|انقل|افرز|اجمع|ضع|تخلّص|التقط|المس|تعامل|أصلح).{0,55}(?:الزجاج|أداة\s+حادّة|أدوات\s+حادّة|بطارية|بطاريات|مادة\s+كيميائية|مواد\s+كيميائية|دواء|أدوية|نفايات\s+مجهولة|عنصر\s+كهربائي)/iu;
const PROHIBITED_HAZARD_NOUNS_ENGLISH =
  /\b(?:glass|(?<!non-)sharps?|batter(?:y|ies)|chemicals?|medicine|unknown\s+waste|electrical\s+(?:item|wire|device))\b/iu;
const PROHIBITED_HAZARD_NOUNS_ARABIC =
  /(?:الزجاج|بطارية|بطاريات|مادة\s+كيميائية|مواد\s+كيميائية|دواء|أدوية|نفايات\s+مجهولة|عنصر\s+كهربائي)/iu;
const UNSUPERVISED_ENGLISH_INSTRUCTION =
  /\b(?:go|walk|carry|take|dispose)\b.{0,45}\b(?:alone|yourself|without\s+(?:an\s+)?adult)\b|\bcross\s+(?:a\s+)?road\b/iu;
const UNSUPERVISED_ARABIC_INSTRUCTION =
  /(?:اذهب|امش|احمل|خذ|تخلّص).{0,45}(?:وحدك|بنفسك|دون\s+شخص\s+بالغ)|اعبر\s+(?:ال)?طريق/iu;
const P0_GUIDE_FIXTURE_ID = 'guide_recycling_refine_v1';
const BOUNDED_P0_PARENT_ACTION_ENGLISH =
  /^sort\s+(?:only\s+)?(?:the\s+)?clean\s+(?:paper\s+and\s+plastic|recyclables?|materials?)(?:\s+(?:that\s+were\s+)?approved\s+by\s+an?\s+adult)?(?:,\s*(?:and\s+)?stop\s+(?:to\s+)?ask\s+an?\s+adult\s+when\s+unsure)?[.!]?$/iu;
const BOUNDED_P0_PARENT_ACTION_ARABIC =
  /^افرز\s+(?:فقط\s+)?(?:ال)?ورق\s+و(?:ال)?بلاستيك\s+(?:ال)?نظيف(?:ين)?(?:\s+اللذين\s+وافق\s+عليهما\s+شخص\s+بالغ)?(?:[،,]\s*و?توقف\s+واسأل\s+شخص(?:اً|ا)?\s+بالغ(?:اً|ا)?\s+عند\s+الشك)?[.!؟]?$/u;

function sameLocalizedText(
  left: { readonly ar: string; readonly en: string },
  right: { readonly ar: string; readonly en: string },
): boolean {
  return left.ar === right.ar && left.en === right.en;
}

function isBoundedRetainedP0Action(action: { readonly ar: string; readonly en: string }): boolean {
  return (
    BOUNDED_P0_PARENT_ACTION_ENGLISH.test(action.en) &&
    BOUNDED_P0_PARENT_ACTION_ARABIC.test(action.ar)
  );
}

export function validateTaskInstructionsAgainstSafety(
  template: TaskTemplate,
): DomainResult<TaskTemplate> {
  const instructionCopy = [
    template.title,
    template.positiveAction,
    template.definitionOfDone,
    ...template.safety.childAllowedActions,
  ];
  const english = instructionCopy.map((value) => value.en).join('\n');
  const arabic = instructionCopy.map((value) => value.ar).join('\n');
  const directInstructionEnglish = [
    template.title.en,
    template.positiveAction.en,
    template.definitionOfDone.en,
  ].join('\n');
  const directInstructionArabic = [
    template.title.ar,
    template.positiveAction.ar,
    template.definitionOfDone.ar,
  ].join('\n');
  if (
    HAZARDOUS_ENGLISH_INSTRUCTION.test(english) ||
    HAZARDOUS_ARABIC_INSTRUCTION.test(arabic) ||
    PROHIBITED_HAZARD_NOUNS_ENGLISH.test(directInstructionEnglish) ||
    PROHIBITED_HAZARD_NOUNS_ARABIC.test(directInstructionArabic) ||
    UNSUPERVISED_ENGLISH_INSTRUCTION.test(english) ||
    UNSUPERVISED_ARABIC_INSTRUCTION.test(arabic)
  ) {
    return unsafeTask(
      'Child-facing instructions contradict the reviewed hazard, supervision, or route boundary',
    );
  }
  return { ok: true, data: template };
}

export function validateTaskTemplate(template: unknown): DomainResult<TaskTemplate> {
  const parsed = taskTemplateSchema.safeParse(template);
  if (!parsed.success) {
    return invalidTask(parsed.error.issues[0]?.message ?? 'Task template is invalid');
  }
  return validateTaskInstructionsAgainstSafety(parsed.data as TaskTemplate);
}

function sameStructuredValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => sameStructuredValue(value, right[index]))
    );
  }
  if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) {
    return false;
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key, index) =>
        key === rightKeys[index] && sameStructuredValue(leftRecord[key], rightRecord[key]),
    )
  );
}

export function matchesCanonicalP0TaskContent(
  template: unknown,
  mode: 'exact_guide' | 'retained_parent_action',
): boolean {
  const validated = validateTaskTemplate(template);
  if (!validated.ok) return false;
  const comparable =
    mode === 'retained_parent_action'
      ? { ...validated.data, positiveAction: P0_RECYCLING_TEMPLATE.positiveAction }
      : validated.data;
  return sameStructuredValue(comparable, P0_RECYCLING_TEMPLATE);
}

export function validateTaskForReview(task: Task): DomainResult<Task> {
  if (
    !task.id.trim() ||
    !task.templateId.trim() ||
    !task.parentOriginalText.ar.trim() ||
    !task.parentOriginalText.en.trim() ||
    !Number.isInteger(task.version) ||
    task.version < 1
  ) {
    return invalidTask('The task draft is incomplete');
  }

  const content = validateTaskTemplate(task.content);
  if (!content.ok) return content;

  const reviewedReplacement =
    task.id === P0_RECYCLING_TEMPLATE.id && task.version > 1
      ? [
          TASK_TEMPLATES.find((template) => template.id === 'GI01'),
          P0_SAFE_EQUIVALENT_TEMPLATE,
        ].find((template) => template?.id === task.templateId)
      : undefined;
  if (task.id === P0_RECYCLING_TEMPLATE.id && task.version > 1) {
    if (
      !reviewedReplacement ||
      task.targetChildId !== 'child_salem' ||
      ![null, P0_GUIDE_FIXTURE_ID].includes(task.acceptedGuideFixtureId) ||
      task.content.id !== task.templateId ||
      !sameStructuredValue(content.data, reviewedReplacement)
    ) {
      return unsafeTask(
        'A replacement version must exactly match its reviewed smaller or safe-equivalent fixture',
      );
    }
    return { ok: true, data: task };
  }

  if (
    task.acceptedGuideFixtureId === null &&
    !sameLocalizedText(task.content.positiveAction, task.parentOriginalText)
  ) {
    return invalidTask('The reviewed positive action must be the retained Parent wording');
  }

  if (task.templateId === P0_RECYCLING_TEMPLATE.id) {
    if (task.content.id !== P0_RECYCLING_TEMPLATE.id) {
      return unsafeTask('The executable P0 task must retain its reviewed recycling template');
    }
    if (
      task.acceptedGuideFixtureId === null
        ? !isBoundedRetainedP0Action(content.data.positiveAction) ||
          !matchesCanonicalP0TaskContent(content.data, 'retained_parent_action')
        : task.acceptedGuideFixtureId !== P0_GUIDE_FIXTURE_ID ||
          !matchesCanonicalP0TaskContent(content.data, 'exact_guide')
    ) {
      return unsafeTask(
        'The P0 recycling action must use the bounded Parent grammar or exact reviewed Guide action',
      );
    }
  }
  return { ok: true, data: task };
}

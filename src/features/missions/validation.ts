import { z } from 'zod';

const nonEmptyText = z.string().trim().min(1).max(700);

export const localizedTextSchema = z
  .object({
    ar: nonEmptyText,
    en: nonEmptyText,
  })
  .strict();

export const quantitySchema = z
  .object({
    value: z.number().int().positive(),
    unit: z.enum(['grams', 'portions']),
  })
  .strict()
  .superRefine((quantity, context) => {
    const maximum = quantity.unit === 'grams' ? 5_000 : 20;
    if (quantity.value > maximum) {
      context.addIssue({
        code: 'too_big',
        maximum,
        origin: 'number',
        inclusive: true,
        message: `Quantity must not exceed ${maximum} ${quantity.unit}`,
      });
    }
  });

export const missionInputSchema = z
  .object({
    id: z.string().trim().min(1),
    childId: z.string().trim().min(1),
    foodImageId: z.string().trim().min(1),
    voiceNoteId: z.string().trim().min(1),
    quantity: quantitySchema,
    availableMinutes: z.number().int().min(5).max(60),
    reward: localizedTextSchema.nullable(),
    updatedAt: z.string().datetime(),
  })
  .strict();

function generatedStepSchema<const TOrder extends 1 | 2 | 3>(order: TOrder) {
  return z
    .object({
      order: z.literal(order),
      instruction: localizedTextSchema,
    })
    .strict();
}

const unsafeVerdictTerms = [
  /safe to eat/i,
  /definitely safe/i,
  /آمن(?:ة)? للأكل/u,
  /صالح(?:ة)? للأكل بالتأكيد/u,
];

export const generatedMissionPayloadSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    title: localizedTextSchema,
    story: localizedTextSchema,
    steps: z.tuple([generatedStepSchema(1), generatedStepSchema(2), generatedStepSchema(3)]),
    reflectionPrompt: localizedTextSchema,
    impactTarget: quantitySchema,
    evidenceMethod: z.enum(['prepared-evidence', 'parent-confirmation', 'either']),
    reward: localizedTextSchema.nullable(),
    personalization: z
      .object({
        childAgeBand: z.string().trim().min(1),
        foodSituation: localizedTextSchema,
        familyWisdomSummary: localizedTextSchema,
        availableMinutes: z.number().int().min(1).max(60),
      })
      .strict(),
  })
  .strict()
  .superRefine((payload, context) => {
    const userFacingText = [
      payload.story.ar,
      payload.story.en,
      ...payload.steps.flatMap((step) => [step.instruction.ar, step.instruction.en]),
    ].join(' ');

    if (unsafeVerdictTerms.some((term) => term.test(userFacingText))) {
      context.addIssue({
        code: 'custom',
        message: 'Mission content must not make a food-safety verdict',
      });
    }
  });

export const submissionDraftSchema = z
  .object({
    evidenceMediaId: z.string().trim().min(1).nullable(),
    parentConfirmationRequested: z.boolean(),
    reflection: z.string().trim().min(1).max(240),
  })
  .strict()
  .superRefine((draft, context) => {
    const hasEvidence = draft.evidenceMediaId !== null;
    if (hasEvidence === draft.parentConfirmationRequested) {
      context.addIssue({
        code: 'custom',
        path: ['evidenceMediaId'],
        message: 'Choose prepared evidence or Parent confirmation, but not both',
      });
    }
  });

export type ValidatedMissionInput = z.infer<typeof missionInputSchema>;
export type ValidatedGeneratedMissionPayload = z.infer<typeof generatedMissionPayloadSchema>;
export type ValidatedSubmissionDraft = z.infer<typeof submissionDraftSchema>;

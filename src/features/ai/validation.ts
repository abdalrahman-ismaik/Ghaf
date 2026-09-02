import { z } from 'zod';

import type { CoachRequest, CoachResponse } from '../../models/prototype';
import { getCoachAgePolicy } from './policy';

const text = z.string().trim().min(1).max(700);
const localizedText = z.object({ ar: text, en: text }).strict();

export const coachRequestSchema = z
  .object({
    requestId: z.string().trim().min(1).max(128),
    taskId: z.string().trim().min(1).max(128),
    ageGroup: z.enum(['6-8', '9-11', '12-14']),
    locale: z.enum(['ar', 'en']),
    inputMode: z.enum(['text', 'voice-transcript']),
    message: z.string().trim().min(1).max(500),
    currentTask: localizedText,
    permissions: z
      .object({
        aiEnabled: z.boolean(),
        voiceEnabled: z.boolean(),
      })
      .strict(),
  })
  .strict()
  .superRefine((request, context) => {
    if (!request.permissions.aiEnabled) {
      context.addIssue({
        code: 'custom',
        path: ['permissions', 'aiEnabled'],
        message: 'Parent AI permission is required',
      });
    }
    if (request.inputMode === 'voice-transcript' && !request.permissions.voiceEnabled) {
      context.addIssue({
        code: 'custom',
        path: ['permissions', 'voiceEnabled'],
        message: 'Parent voice permission is required',
      });
    }
  });

const forbiddenOutputPatterns = [
  /safe to eat|definitely safe|medical diagnosis|religious ruling|fatwa/iu,
  /آمن(?:ة)? للأكل|صالح(?:ة)? للأكل بالتأكيد|تشخيص طبي|فتوى|حكم شرعي/iu,
  /send me your (?:phone|email|address)|أرسل لي (?:رقم|بريد|عنوان)/iu,
];

export const coachResponseSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    requestId: z.string().trim().min(1).max(128),
    taskId: z.string().trim().min(1).max(128),
    message: localizedText,
    quickChoices: z.array(localizedText).max(3),
    askAdult: z
      .object({
        label: localizedText,
        recommended: z.boolean(),
      })
      .strict(),
    languageMode: z.enum(['ar', 'en', 'code-switched']),
    safety: z
      .object({
        foodSafetyVerdict: z.literal(false),
        requiresAdult: z.boolean(),
      })
      .strict(),
  })
  .strict()
  .superRefine((response, context) => {
    const combined = [
      response.message.ar,
      response.message.en,
      ...response.quickChoices.flatMap((choice) => [choice.ar, choice.en]),
    ].join(' ');
    if (forbiddenOutputPatterns.some((pattern) => pattern.test(combined))) {
      context.addIssue({
        code: 'custom',
        message:
          'Coach output contains a prohibited verdict, ruling, diagnosis, or private-data request',
      });
    }
    if (
      !/اسأل|شخصًا كبيرًا|ولي أمرك/u.test(response.askAdult.label.ar) ||
      !/ask|adult|parent/iu.test(response.askAdult.label.en)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['askAdult', 'label'],
        message: 'Coach output must preserve the bilingual Ask an adult action',
      });
    }
  });

export function validateCoachResponseForRequest(
  request: CoachRequest,
  value: unknown,
):
  | { readonly success: true; readonly data: CoachResponse }
  | { readonly success: false; readonly message: string } {
  const parsed = coachResponseSchema.safeParse(value);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid Coach response' };
  }
  if (parsed.data.requestId !== request.requestId || parsed.data.taskId !== request.taskId) {
    return { success: false, message: 'Coach response does not match the active request and task' };
  }
  const policy = getCoachAgePolicy(request.ageGroup);
  if (parsed.data.quickChoices.length > policy.maximumQuickChoices) {
    return { success: false, message: 'Coach response exceeds the age-group quick-choice limit' };
  }
  if (
    parsed.data.message.ar.length > policy.maximumResponseCharacters ||
    parsed.data.message.en.length > policy.maximumResponseCharacters
  ) {
    return { success: false, message: 'Coach response exceeds the age-group length limit' };
  }
  return { success: true, data: parsed.data as CoachResponse };
}

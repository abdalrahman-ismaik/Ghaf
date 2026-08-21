import { z } from 'zod';

import type { MissionInput, QuantityUnit } from '../../models/prototype';

export const missionFormSchema = z
  .object({
    childId: z.string().trim().min(1),
    foodImageId: z.string().trim().min(1),
    voiceNoteId: z.string().trim().min(1),
    quantityValue: z.coerce.number().int().positive(),
    quantityUnit: z.enum(['grams', 'portions']),
    availableMinutes: z.coerce.number().int().min(5).max(60),
    rewardAr: z.string().trim().max(80),
    rewardEn: z.string().trim().max(80),
  })
  .superRefine((form, context) => {
    const maximum = form.quantityUnit === 'grams' ? 5_000 : 20;
    if (form.quantityValue > maximum) {
      context.addIssue({
        code: 'too_big',
        maximum,
        origin: 'number',
        inclusive: true,
        path: ['quantityValue'],
        message: `Quantity must not exceed ${maximum} ${form.quantityUnit}`,
      });
    }
    if ((form.rewardAr.length === 0) !== (form.rewardEn.length === 0)) {
      context.addIssue({
        code: 'custom',
        path: ['rewardAr'],
        message: 'Provide the optional reward in both languages or leave both blank',
      });
    }
  });

export type MissionFormValues = z.input<typeof missionFormSchema>;
export type ParsedMissionFormValues = z.output<typeof missionFormSchema>;

export const defaultMissionFormValues: MissionFormValues = {
  childId: '',
  foodImageId: '',
  voiceNoteId: '',
  quantityValue: 250,
  quantityUnit: 'grams',
  availableMinutes: 15,
  rewardAr: '',
  rewardEn: '',
};

export function missionFormToInput(
  values: ParsedMissionFormValues,
  options: { id: string; updatedAt: string },
): MissionInput {
  return {
    id: options.id,
    childId: values.childId,
    foodImageId: values.foodImageId,
    voiceNoteId: values.voiceNoteId,
    quantity: {
      value: values.quantityValue,
      unit: values.quantityUnit as QuantityUnit,
    },
    availableMinutes: values.availableMinutes,
    reward:
      values.rewardAr.length > 0
        ? {
            ar: values.rewardAr,
            en: values.rewardEn,
          }
        : null,
    updatedAt: options.updatedAt,
  };
}

import type { ProfileRecommendationReason } from '../features/assistants/profilePersonalization';

export const profileRecommendationResources = {
  ar: {
    sustainability: 'لأنك اخترت الاستدامة ضمن الاهتمامات.',
    nature: 'لأنك اخترت الطبيعة ضمن الاهتمامات.',
    gardening: 'لأنك اخترت العناية بالنباتات ضمن الهوايات.',
    stories: 'لأنك اخترت القصص ضمن الاهتمامات.',
    reading: 'لأنك اخترت القراءة ضمن الهوايات.',
    puzzles: 'لأنك اخترت الألغاز ضمن الهوايات.',
    simplerInstructions: 'لأنك اخترت تعليمات أبسط؛ هذه الفئة نقطة بداية مُعدّة مسبقًا.',
    familyHelping: 'لأنك اخترت مساعدة الأسرة ضمن الاهتمامات.',
    making: 'لأنك اخترت الصنع والابتكار ضمن الاهتمامات.',
    drawing: 'لأنك اخترت الرسم ضمن الهوايات.',
    customInterestMatch: 'لأن وصف اهتمام أو هواية أضفته يتوافق مع هذه الفئة.',
    practicalStart: 'نقطة بداية عامة لمهمة منزلية عملية، ويمكنك اختيار فئة أخرى.',
  },
  en: {
    sustainability: 'Because you selected sustainability as an interest.',
    nature: 'Because you selected nature as an interest.',
    gardening: 'Because you selected gardening as a hobby.',
    stories: 'Because you selected stories as an interest.',
    reading: 'Because you selected reading as a hobby.',
    puzzles: 'Because you selected puzzles as a hobby.',
    simplerInstructions:
      'You selected simpler instructions; this category is a prepared starting point.',
    familyHelping: 'Because you selected helping family as an interest.',
    making: 'Because you selected making things as an interest.',
    drawing: 'Because you selected drawing as a hobby.',
    customInterestMatch:
      'Because an interest or hobby description you added matches this category.',
    practicalStart:
      'A general starting point for a practical home task. You can choose another category.',
  },
} satisfies Record<'ar' | 'en', Record<ProfileRecommendationReason, string>>;

import type {
  FamilyProfile,
  GhafProgress,
  ImpactSummary,
  MissionSummary,
  PreparedMedia,
  PrototypeSession,
} from '../../models/prototype';

export function createSeededFamily(): FamilyProfile {
  return {
    id: 'family-ghaf-demo',
    displayName: {
      ar: 'عائلة غاف التجريبية',
      en: 'Ghaf Demo Family',
    },
    parent: {
      id: 'parent-mariam-demo',
      role: 'parent',
      displayName: {
        ar: 'مريم',
        en: 'Mariam',
      },
    },
    child: {
      id: 'child-salem-demo',
      role: 'child',
      displayName: {
        ar: 'سالم',
        en: 'Salem',
      },
      ageBand: '8-10',
    },
  };
}

export function createSeededMission(): MissionSummary {
  return {
    id: 'mission-bread-rescue-demo',
    title: {
      ar: 'مغامرة إنقاذ الخبز',
      en: 'The Bread Rescue Adventure',
    },
    story: {
      ar: 'تشارك مريم حكمة العائلة: نحترم النعمة ونمنح الخبز الزائد فرصة جديدة، بعد أن يتأكد شخص بالغ من أنه مناسب للاستخدام.',
      en: 'Mariam shares a family lesson: respect every blessing and give extra bread a new purpose after an adult confirms it is suitable to use.',
    },
    steps: [
      {
        id: 'mission-step-check',
        text: {
          ar: 'اطلب من شخص بالغ فحص الخبز وحددوا الكمية معًا.',
          en: 'Ask an adult to check the bread and estimate the amount together.',
        },
      },
      {
        id: 'mission-step-prepare',
        text: {
          ar: 'ساعد في تجهيز الخبز المعتمد ليُستخدم في وصفة العائلة.',
          en: 'Help prepare the approved bread for a family recipe.',
        },
      },
      {
        id: 'mission-step-share',
        text: {
          ar: 'أخبر عائلتك كم حصة أنقذتموها وسجل النتيجة.',
          en: 'Tell your family how many portions you rescued and record the result.',
        },
      },
    ],
    status: 'assigned',
    reward: {
      ar: 'ورقة غاف ذهبية',
      en: 'Golden Ghaf Leaf',
    },
    impactTarget: {
      estimatedGrams: 250,
      estimatedPortions: 2,
    },
    source: 'pregenerated-mock',
  };
}

export function createSeededImpact(): ImpactSummary {
  return {
    rescuedGrams: 1_250,
    rescuedPortions: 5,
    completedMissions: 3,
    streakDays: 2,
  };
}

export function createSeededGhafProgress(): GhafProgress {
  return {
    stage: 2,
    progressPercent: 48,
    newMilestone: null,
  };
}

export function createPreparedImage(): PreparedMedia {
  return {
    id: 'prepared-image-bread-demo',
    kind: 'image',
    uri: 'demo://images/extra-bread',
    label: {
      ar: 'صورة تجريبية للخبز الزائد',
      en: 'Prepared demo image of extra bread',
    },
    source: 'prepared-demo',
  };
}

export function createPreparedAudio(): PreparedMedia {
  return {
    id: 'prepared-audio-family-wisdom-demo',
    kind: 'audio',
    uri: 'demo://audio/family-wisdom',
    label: {
      ar: 'رسالة صوتية تجريبية من أحد أفراد العائلة',
      en: 'Prepared family voice-note demo',
    },
    source: 'prepared-demo',
  };
}

export function createInitialPrototypeSession(): PrototypeSession {
  return {
    locale: 'ar',
    role: 'parent',
    family: createSeededFamily(),
    mission: createSeededMission(),
    impact: createSeededImpact(),
    ghaf: createSeededGhafProgress(),
    mockMode: true,
  };
}

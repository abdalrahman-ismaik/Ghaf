import type { SyntheticChildId } from '@/models/familyGrowth';
import type { MangroveLearningReturnIntent, MangroveLearningState } from '@/models/learning';

import { createMangroveReturnIntent } from './mangroveLearning';

export function createR002bLearningBackHandler(input: {
  readonly canGoBack: () => boolean;
  readonly goBack: () => void;
  readonly profileId: SyntheticChildId;
  readonly replaceValidatedOrigin: (intent: MangroveLearningReturnIntent) => void;
  readonly replaceSafeRoot: () => void;
  readonly state: MangroveLearningState;
}): () => void {
  return () => {
    const intent = createMangroveReturnIntent({ state: input.state });
    if (!intent.ok || intent.data.profileId !== input.profileId) {
      input.replaceSafeRoot();
      return;
    }
    if (input.canGoBack()) {
      input.goBack();
      return;
    }
    input.replaceValidatedOrigin(intent.data);
  };
}

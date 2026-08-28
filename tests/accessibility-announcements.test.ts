import { describe, expect, it } from 'vitest';

import { buildRecognitionAnnouncement } from '../src/features/garden/announcements';

describe('Feature 003 accessibility announcements', () => {
  it('announces the fixed award and every shared consequence in one concise recognition message', () => {
    expect(
      buildRecognitionAnnouncement({
        award: '12 Seeds',
        landscape: 'Mangrove coast reached Sapling',
        canopy: 'One contribution leaf joined the family canopy.',
        circle: 'The Green Circle reached 12 of 12 eligible actions.',
      }),
    ).toBe(
      '12 Seeds. Mangrove coast reached Sapling. One contribution leaf joined the family canopy. The Green Circle reached 12 of 12 eligible actions.',
    );
  });

  it('omits a consequence that did not occur instead of announcing false progress', () => {
    expect(
      buildRecognitionAnnouncement({
        award: null,
        landscape: null,
        canopy: null,
        circle: 'One eligible Green action was recorded.',
      }),
    ).toBe('One eligible Green action was recorded.');
  });
});

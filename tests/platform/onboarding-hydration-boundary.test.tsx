import { createRequire } from 'node:module';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FirstRunExperienceProvider,
  useFirstRunExperience,
} from '../../src/components/onboarding/FirstRunExperienceContext';

const { renderToStaticMarkup } = createRequire(import.meta.url)('react-dom/server') as {
  renderToStaticMarkup(node: ReactNode): string;
};

const mock = vi.hoisted(() => ({
  completed: false,
  resetSequence: 0,
  read: vi.fn(),
}));

vi.mock('@/config/demoEntry', () => ({ entryMode: 'ordinary' }));
vi.mock('@/services', () => ({
  serviceRegistry: {
    onboardingCompletion: { read: mock.read },
  },
}));
vi.mock('@/state/usePrototypeStore', () => ({
  usePrototypeStore: (selector: (state: unknown) => unknown) =>
    selector({ growthJourney: { resetSequence: mock.resetSequence } }),
}));

function Probe() {
  const experience = useFirstRunExperience();
  return createElement('div', {
    'data-completed': experience.state.completed,
    'data-step': experience.state.step,
    'data-ready': experience.presentationReady,
  });
}

beforeEach(() => {
  mock.completed = false;
  mock.resetSequence = 0;
  mock.read.mockReset().mockImplementation(() => ({ ok: true, completed: mock.completed }));
});

describe('ordinary onboarding server snapshot', () => {
  it('does not read a remembered completion marker while rendering server markup', () => {
    const render = () =>
      renderToStaticMarkup(
        createElement(
          FirstRunExperienceProvider,
          { presentationReady: true },
          createElement(Probe),
        ),
      );
    const fresh = render();
    mock.completed = true;
    mock.resetSequence = 3;
    const remembered = render();

    expect(remembered).toBe(fresh);
    expect(fresh).toContain('data-completed="false"');
    expect(fresh).toContain('data-step="intro"');
    expect(fresh).toContain('data-ready="false"');
    expect(mock.read).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';

import { CloudAccessGate } from '../../src/components/cloudFamily/CloudAccessGate';

const mock = vi.hoisted(() => ({
  cursor: 0,
  slots: [] as unknown[],
  effects: [] as (() => void)[],
  readMode: vi.fn(),
  writeMode: vi.fn(),
  restore: vi.fn(),
  signOut: vi.fn(),
  dispose: vi.fn(),
}));

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => {
    const index = mock.cursor++;
    if (!(index in mock.slots)) mock.slots[index] = initial;
    return [
      mock.slots[index],
      (value: unknown) => {
        mock.slots[index] = value;
      },
    ];
  },
  useRef: (initial: unknown) => {
    const index = mock.cursor++;
    mock.slots[index] ??= { current: initial };
    return mock.slots[index];
  },
  useEffect: (effect: () => void) => {
    const index = mock.cursor++;
    if (!(index in mock.slots)) {
      mock.slots[index] = true;
      mock.effects.push(effect);
    }
  },
}));
vi.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  View: 'View',
  Platform: {
    OS: 'android',
    select: <T,>(values: { android?: T; native?: T; default?: T }) =>
      values.android ?? values.native ?? values.default,
  },
  StyleSheet: { create: (value: unknown) => value },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../../src/components/primitives', () => ({ Button: 'Button', Text: 'Text' }));
vi.mock('../../src/components/cloudFamily/CloudChildEntry', () => ({
  CloudChildEntry: 'CloudChildEntry',
}));
vi.mock('../../src/features/cloudFamily/childService', () => ({
  readCloudDeviceMode: mock.readMode,
  writeCloudDeviceMode: mock.writeMode,
}));
vi.mock('../../src/services', () => ({
  getParentAccountService: () => ({
    restoreSession: mock.restore,
    signOut: mock.signOut,
    dispose: mock.dispose,
  }),
}));

function render() {
  mock.cursor = 0;
  return CloudAccessGate({ renderParent: () => 'parent-entry' });
}

async function enterChildMode() {
  render();
  mock.effects.splice(0).forEach((effect) => effect());
  await vi.waitFor(() => expect(mock.slots[0]).toBe('child'));
  const child = render() as ReactElement<{ onParent: () => Promise<void> }>;
  expect(child.type).toBe('CloudChildEntry');
  return child.props.onParent;
}

beforeEach(() => {
  mock.cursor = 0;
  mock.slots = [];
  mock.effects = [];
  mock.readMode.mockReset().mockResolvedValue('child');
  mock.writeMode.mockReset().mockResolvedValue(undefined);
  mock.restore.mockReset().mockResolvedValue(null);
  mock.signOut.mockReset().mockResolvedValue(undefined);
  mock.dispose.mockReset();
});

describe('normalized Child return to Parent access', () => {
  it('initializes and clears retained Parent credentials before opening fresh Parent entry', async () => {
    const returnToParent = await enterChildMode();
    await returnToParent();
    expect(mock.restore).toHaveBeenCalledOnce();
    expect(mock.restore.mock.invocationCallOrder[0]).toBeLessThan(
      mock.signOut.mock.invocationCallOrder[0]!,
    );
    expect(mock.signOut.mock.invocationCallOrder[0]).toBeLessThan(
      mock.writeMode.mock.invocationCallOrder[0]!,
    );
    expect(mock.writeMode).toHaveBeenCalledExactlyOnceWith('parent');
    expect(mock.dispose).toHaveBeenCalledOnce();
    expect(render()).toBe('parent-entry');
  });

  it('clears stored credentials even when their provider restore fails', async () => {
    mock.restore.mockRejectedValueOnce(new Error('synthetic revoked session'));
    const returnToParent = await enterChildMode();
    await returnToParent();
    expect(mock.signOut).toHaveBeenCalledOnce();
    expect(render()).toBe('parent-entry');
  });

  it('keeps Parent entry closed if credential cleanup fails', async () => {
    mock.signOut.mockRejectedValueOnce(new Error('synthetic storage failure'));
    const returnToParent = await enterChildMode();
    await expect(returnToParent()).rejects.toThrow('synthetic storage failure');
    expect(mock.writeMode).not.toHaveBeenCalled();
    expect(mock.dispose).toHaveBeenCalledOnce();
    expect((render() as ReactElement).type).toBe('CloudChildEntry');
  });
});

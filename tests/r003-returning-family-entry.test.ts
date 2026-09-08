import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import { PARENT_VERIFICATION_CODE } from '../src/features/access';
import { usePrototypeStore } from '../src/state/usePrototypeStore';
import { resetPrototypeForTest } from './helpers/prototypeStore';

function expectOk<T>(result: { readonly ok: boolean; readonly data?: T }): T {
  expect(result.ok).toBe(true);
  if (!result.ok || result.data === undefined) throw new Error('Expected result to succeed');
  return result.data;
}

async function verifyAndEnterParent(returning = false) {
  expectOk(
    usePrototypeStore
      .getState()
      [returning ? 'requestExistingParentVerification' : 'requestParentVerification']({
        identifier: 'parent@example.com',
        networkAvailable: false,
      }),
  );
  expectOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  expectOk(usePrototypeStore.getState().completeParentOnboarding());
}

async function createFreshFamily() {
  await verifyAndEnterParent();
  expect(usePrototypeStore.getState().returningUserWelcome).toBeNull();
}

async function pairSalemForTheFirstTime() {
  expectOk(usePrototypeStore.getState().signOutExperience());
  expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
  expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));
  expectOk(usePrototypeStore.getState().requestChildPairing());
  await verifyAndEnterParent(true);
  expectOk(usePrototypeStore.getState().approveChildPairing());
  expectOk(usePrototypeStore.getState().handoffApprovedChildPairing());
  expectOk(usePrototypeStore.getState().completeChildPairing());
}

describe('R003 returning-family session entry', () => {
  beforeEach(() => {
    expectOk(resetPrototypeForTest());
  });

  it('does not welcome a fresh family but emits one disposable returning-Parent signal', async () => {
    await createFreshFamily();
    expectOk(usePrototypeStore.getState().signOutExperience());

    await verifyAndEnterParent(true);

    expect(usePrototypeStore.getState().returningUserWelcome).toEqual({
      kind: 'returning_parent',
      householdId: 'household_al_noor',
    });
    usePrototypeStore.getState().dismissReturningUserWelcome();
    expect(usePrototypeStore.getState().returningUserWelcome).toBeNull();
  });

  it('welcomes only an already-paired Child and keeps the signal bound to that profile', async () => {
    await createFreshFamily();
    await pairSalemForTheFirstTime();
    expect(usePrototypeStore.getState().returningUserWelcome).toBeNull();

    expectOk(usePrototypeStore.getState().signOutExperience());
    expectOk(usePrototypeStore.getState().selectChildAccessProfile('child_salem'));
    expectOk(usePrototypeStore.getState().verifyChildCredential('2468'));

    expect(usePrototypeStore.getState().returningUserWelcome).toEqual({
      kind: 'returning_child',
      childId: 'child_salem',
    });
    expect(usePrototypeStore.getState()).toMatchObject({
      activeExperience: 'child',
      activeChildId: 'child_salem',
      role: 'child',
    });
  });

  it('clears a returning signal on sign-out, Parent handoff, and deterministic reset', async () => {
    await createFreshFamily();
    expectOk(usePrototypeStore.getState().signOutExperience());
    await verifyAndEnterParent(true);
    expect(usePrototypeStore.getState().returningUserWelcome).not.toBeNull();

    expectOk(usePrototypeStore.getState().signOutExperience());
    expect(usePrototypeStore.getState().returningUserWelcome).toBeNull();

    await verifyAndEnterParent(true);
    expect(usePrototypeStore.getState().returningUserWelcome).not.toBeNull();
    expectOk(usePrototypeStore.getState().resetPrototype());
    expect(usePrototypeStore.getState().returningUserWelcome).toBeNull();
  });
});

describe('R003 returning-family route and presentation contract', () => {
  const source = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8');

  it('fails completed families out of every first-family setup route', () => {
    for (const route of [
      'app/access/parent/family-basics.tsx',
      'app/access/parent/add-first-child.tsx',
      'app/access/parent/review-create.tsx',
    ]) {
      const contents = source(route);
      expect(contents, route).toContain('parentOnboarding.completionReceipt');
      expect(contents, route).toContain('<Redirect href="/access/parent/verification" />');
    }

    const verification = source('app/access/parent/verification.tsx');
    expect(verification).toContain("parentOnboarding.status !== 'verified'");
    expect(verification).toContain('!parentOnboarding.completionReceipt');
    expect(verification).toContain('completeParentOnboarding()');
    expect(verification).toContain('if (!isCreateFamilyFlow && result.data.completionReceipt)');
    expect(verification).toContain('return <Redirect href={entryHref} />');
    expect(verification).not.toContain(
      'parentOnboarding.status === \'verified\' && !parentOnboarding.completionReceipt) {\n    return <Redirect href="/access/parent/family-basics" />',
    );

    const success = source('app/access/parent/family-created-success.tsx');
    expect(success).toContain("returningUserWelcome?.kind === 'returning_parent'");
    expect(success).toContain('<Redirect href="/parent" />');
  });

  it('uses one shared accessible welcome dialog over both role-correct dashboards', () => {
    const dialog = source('src/components/session/ReturningWelcomeDialog.tsx');
    expect(dialog).toContain('Modal');
    expect(dialog).toContain('accessibilityViewIsModal');
    expect(dialog).toContain("reducedMotion ? 'none' : 'fade'");
    expect(dialog).toContain('updates.slice(0, 2)');
    expect(dialog).toContain('layout.touchTarget');

    const parent = source('app/parent/index.tsx');
    expect(parent).toContain('ReturningWelcomeDialog');
    expect(parent).toContain("returningUserWelcome?.kind === 'returning_parent'");
    expect(parent).toContain('dismissReturningUserWelcome');

    const child = source('app/child/index.tsx');
    expect(child).toContain('ReturningWelcomeDialog');
    expect(child).toContain("returningUserWelcome?.kind === 'returning_child'");
    expect(child).toContain('returningUserWelcome.childId === activeChildId');
  });
});

import { PARENT_VERIFICATION_CODE } from '../../src/features/access';
import type { SyntheticChildId } from '../../src/models/familyGrowth';
import { usePrototypeStore } from '../../src/state/usePrototypeStore';

function assertOk(result: { readonly ok: boolean; readonly error?: { readonly message: string } }) {
  if (!result.ok) throw new Error(result.error?.message ?? 'Expected synthetic access to succeed');
}

export function resetPrototypeForTest() {
  usePrototypeStore.setState({ role: 'parent', activeExperience: 'parent' });
  return usePrototypeStore.getState().resetPrototype();
}

export async function enterParentExperienceForTest() {
  const current = usePrototypeStore.getState();
  if (current.activeExperience === 'parent' && current.authorizeParentExperience().ok) return;
  if (current.activeExperience !== 'signed_out') {
    assertOk(current.signOutExperience());
  }
  assertOk(
    usePrototypeStore.getState().requestParentVerification({
      identifier: 'parent@example.com',
      networkAvailable: false,
    }),
  );
  assertOk(await usePrototypeStore.getState().verifyParentCode(PARENT_VERIFICATION_CODE));
  assertOk(usePrototypeStore.getState().completeParentOnboarding());
}

export async function enterChildExperienceForTest(childId: SyntheticChildId = 'child_salem') {
  let current = usePrototypeStore.getState();
  if (
    current.activeExperience === 'child' &&
    current.activeChildId === childId &&
    current.authorizeChildExperience().ok
  ) {
    return;
  }
  if (!current.localFamily.configuredChildIds.includes(childId)) {
    await enterParentExperienceForTest();
    assertOk(usePrototypeStore.getState().signOutExperience());
    current = usePrototypeStore.getState();
  }
  if (current.activeExperience !== 'signed_out') {
    assertOk(current.signOutExperience());
  }

  assertOk(usePrototypeStore.getState().selectChildAccessProfile(childId));
  const credential = childId === 'child_salem' ? '2468' : 'leaf-water-tree';
  const verified = usePrototypeStore.getState().verifyChildCredential(credential);
  assertOk(verified);
  if (usePrototypeStore.getState().activeExperience === 'child') return;

  assertOk(usePrototypeStore.getState().requestChildPairing());
  await enterParentExperienceForTest();
  assertOk(usePrototypeStore.getState().approveChildPairing());
  assertOk(usePrototypeStore.getState().handoffApprovedChildPairing());
  assertOk(usePrototypeStore.getState().completeChildPairing());
}

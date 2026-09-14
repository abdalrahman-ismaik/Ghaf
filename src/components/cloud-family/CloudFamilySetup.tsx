import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/primitives';
import type { CloudFamilyController } from '@/features/cloud-family';
import type { CloudFamilySnapshot, CloudFamilyState } from '@/models/cloudFamily';
import type { AgeBand } from '@/models/familyGrowth';

import {
  CloudAction,
  CloudActions,
  CloudField,
  CloudSection,
  cloudStyles,
  useCloudCopy,
} from './common';

export type FamilyEditor =
  { kind: 'create' | 'join' | 'rename' | 'add-child' } | { kind: 'edit-child'; childId: string };

export function CloudFamilySetup({
  editor,
  snapshot,
  controller,
  disabled,
  onClose,
}: {
  readonly editor: FamilyEditor;
  readonly snapshot: CloudFamilySnapshot;
  readonly controller: CloudFamilyController;
  readonly disabled: boolean;
  readonly onClose: () => void;
}) {
  const { text } = useCloudCopy();
  const child =
    editor.kind === 'edit-child'
      ? snapshot.children.find((item) => item.id === editor.childId)
      : null;
  const [name, setName] = useState(
    editor.kind === 'rename' ? (snapshot.family?.name ?? '') : (child?.displayName ?? ''),
  );
  const [displayName, setDisplayName] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const capacityReached = editor.kind === 'add-child' && snapshot.children.length >= 2;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const submit = async () => {
    if (
      disabled ||
      capacityReached ||
      !name.trim() ||
      (editor.kind === 'create' && !displayName.trim())
    )
      return;
    const saved =
      editor.kind === 'join'
        ? await controller.redeemInvite(name.trim())
        : editor.kind === 'create'
          ? await controller.command({
              type: 'create_family',
              name: name.trim(),
              displayName: displayName.trim(),
            })
          : editor.kind === 'rename'
            ? await controller.command({ type: 'rename_family', name: name.trim() })
            : editor.kind === 'edit-child'
              ? await controller.command({
                  type: 'rename_child',
                  childId: editor.childId,
                  displayName: name.trim(),
                })
              : ageBand
                ? await controller.command({ type: 'add_child', displayName: name.trim(), ageBand })
                : false;
    if (saved && mounted.current) onClose();
  };
  const title =
    editor.kind === 'create'
      ? 'createFamily'
      : editor.kind === 'join'
        ? 'joinFamily'
        : editor.kind === 'rename'
          ? 'renameFamily'
          : editor.kind === 'add-child'
            ? 'addChild'
            : 'editChild';
  if (snapshot.actor.role !== 'parent') return null;
  return (
    <CloudSection title={text(title)} testID="cloud-family-editor">
      <CloudField
        label={text(
          editor.kind === 'join'
            ? 'inviteToken'
            : editor.kind === 'add-child' || editor.kind === 'edit-child'
              ? 'childName'
              : 'familyName',
        )}
        value={name}
        onChangeText={setName}
        editable={!disabled}
        maxLength={editor.kind === 'join' ? 256 : 80}
        autoCapitalize={editor.kind === 'join' ? 'none' : 'sentences'}
        autoCorrect={editor.kind !== 'join'}
        testID="cloud-family-name-input"
      />
      {editor.kind === 'create' ? (
        <>
          <CloudField
            label={text('yourName')}
            value={displayName}
            onChangeText={setDisplayName}
            editable={!disabled}
            maxLength={80}
            testID="cloud-parent-name-input"
          />
          <Text brand variant="caption" color="onSurfaceVariant">
            {text('yourNameHelp')}
          </Text>
        </>
      ) : null}
      {editor.kind === 'add-child' ? (
        <CloudSection title={text('ageBand')}>
          <CloudActions>
            {(['6_8', '9_11', '12_14'] as const).map((band) => (
              <CloudAction
                key={band}
                accessibilityRole="radio"
                accessibilityState={{ checked: band === ageBand }}
                disabled={disabled}
                variant={band === ageBand ? 'primary' : 'secondary'}
                onPress={() => setAgeBand(band)}
                testID={`cloud-age-${band}`}
              >
                {text(`ages.${band}`)}
              </CloudAction>
            ))}
          </CloudActions>
        </CloudSection>
      ) : null}
      {capacityReached ? <Text brand>{text('freeCapacity')}</Text> : null}
      <CloudActions>
        <CloudAction
          disabled={
            disabled ||
            capacityReached ||
            !name.trim() ||
            (editor.kind === 'create' && !displayName.trim()) ||
            (editor.kind === 'add-child' && !ageBand)
          }
          onPress={() => void submit()}
          testID="cloud-family-editor-save"
        >
          {text(editor.kind === 'join' ? 'join' : 'save')}
        </CloudAction>
        <CloudAction disabled={disabled} onPress={onClose} variant="quiet">
          {text('cancel')}
        </CloudAction>
      </CloudActions>
    </CloudSection>
  );
}

export function CloudFamilyMembers({
  snapshot,
  state,
  controller,
  disabled,
  onEdit,
}: {
  readonly snapshot: CloudFamilySnapshot;
  readonly state: CloudFamilyState;
  readonly controller: CloudFamilyController;
  readonly disabled: boolean;
  readonly onEdit: (editor: FamilyEditor) => void;
}) {
  const { text, locale } = useCloudCopy();
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const parent = snapshot.actor.role === 'parent';
  const children = snapshot.children.filter(
    (child) => child.active && (parent || child.id === snapshot.actor.childId),
  );
  return (
    <>
      {!snapshot.family ? (
        <CloudSection title={text('emptyTitle')}>
          <Text brand>{text('emptyBody')}</Text>
          <CloudActions>
            {parent ? (
              <>
                <CloudAction
                  disabled={disabled}
                  onPress={() => onEdit({ kind: 'create' })}
                  testID="cloud-create-family"
                >
                  {text('createFamily')}
                </CloudAction>
                <CloudAction
                  disabled={disabled}
                  onPress={() => onEdit({ kind: 'join' })}
                  variant="secondary"
                  testID="cloud-join-family"
                >
                  {text('joinFamily')}
                </CloudAction>
              </>
            ) : null}
          </CloudActions>
        </CloudSection>
      ) : (
        <>
          <CloudSection title={snapshot.family.name}>
            {parent ? (
              <CloudActions>
                <CloudAction
                  disabled={disabled}
                  onPress={() => onEdit({ kind: 'rename' })}
                  variant="secondary"
                >
                  {text('renameFamily')}
                </CloudAction>
                <CloudAction
                  disabled={disabled}
                  onPress={() => void controller.command({ type: 'invite_parent' })}
                  variant="secondary"
                  testID="cloud-invite-parent"
                >
                  {text('inviteParent')}
                </CloudAction>
              </CloudActions>
            ) : (
              <Text brand>{text('childFamilyNote')}</Text>
            )}
          </CloudSection>
          {parent && snapshot.families.length > 1 ? (
            <CloudSection title={text('chooseFamily')}>
              <CloudActions>
                {snapshot.families.map((family) => (
                  <CloudAction
                    key={family.id}
                    disabled={disabled}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: family.id === snapshot.family?.id }}
                    variant={family.id === snapshot.family?.id ? 'primary' : 'secondary'}
                    onPress={() => void controller.selectFamily(family.id)}
                  >
                    {family.name}
                  </CloudAction>
                ))}
              </CloudActions>
            </CloudSection>
          ) : null}
          <CloudSection title={text('children')}>
            {!children.length ? (
              <Text brand testID="cloud-family-children-empty">
                {text('noChildren')}
              </Text>
            ) : null}
            {children.map((child) => (
              <View key={child.id} style={cloudStyles.card} testID={`cloud-child-${child.id}`}>
                <Text brand variant="label">
                  {child.displayName}
                </Text>
                <Text brand color="onSurfaceVariant">
                  {text(`ages.${child.ageBand}`)}
                </Text>
                {parent ? (
                  <CloudActions>
                    <CloudAction
                      disabled={disabled}
                      variant="secondary"
                      onPress={() => onEdit({ kind: 'edit-child', childId: child.id })}
                    >
                      {text('editChild')}
                    </CloudAction>
                    <CloudAction
                      disabled={disabled}
                      variant="secondary"
                      onPress={() =>
                        void controller.command({ type: 'invite_child', childId: child.id })
                      }
                      testID={`cloud-pair-${child.id}`}
                    >
                      {text('inviteChild')}
                    </CloudAction>
                    <CloudAction
                      disabled={disabled}
                      variant="quiet"
                      onPress={() => setRevokeId(child.id)}
                    >
                      {text('revokeChild')}
                    </CloudAction>
                  </CloudActions>
                ) : null}
                {parent && revokeId === child.id ? (
                  <View style={cloudStyles.error}>
                    <Text brand>{text('revokeConfirm', { name: child.displayName })}</Text>
                    <CloudActions>
                      <CloudAction
                        disabled={disabled}
                        onPress={() =>
                          void controller
                            .command({ type: 'revoke_child', childId: child.id })
                            .then((saved) => {
                              if (saved) setRevokeId(null);
                            })
                        }
                        testID="cloud-revoke-confirm"
                      >
                        {text('confirmRevoke')}
                      </CloudAction>
                      <CloudAction
                        disabled={disabled}
                        variant="quiet"
                        onPress={() => setRevokeId(null)}
                      >
                        {text('cancel')}
                      </CloudAction>
                    </CloudActions>
                  </View>
                ) : null}
              </View>
            ))}
            {parent ? (
              <>
                <CloudAction
                  disabled={disabled || snapshot.children.length >= 2}
                  onPress={() => onEdit({ kind: 'add-child' })}
                  testID="cloud-add-child"
                >
                  {text('addChild')}
                </CloudAction>
                <Text brand variant="caption" color="onSurfaceVariant">
                  {text('freeCapacity')}
                </Text>
              </>
            ) : null}
          </CloudSection>
        </>
      )}
      {parent && state.lastInvite ? (
        <View style={cloudStyles.status} testID="cloud-invitation">
          {'token' in state.lastInvite ? (
            <Text brand selectable direction="ltr" testID="cloud-invitation-token">
              {state.lastInvite.token}
            </Text>
          ) : (
            <Text brand>{text('invitationUnavailable')}</Text>
          )}
          <Text brand>
            {text('invitationPrivate', {
              time: new Date(state.lastInvite.expiresAt).toLocaleString(locale),
            })}
          </Text>
        </View>
      ) : null}
    </>
  );
}

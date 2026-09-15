import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { randomUUID } from 'expo-crypto';

import { AccessTextField, ChoiceChip, GhafIcon, type GhafIconName } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import {
  FamilyConnectionPlan,
  type FamilyConnectionPlanPresentation,
} from '@/components/family/FamilyConnectionPlan';
import { botanical, logicalRowDirection, spacing } from '@/design/tokens';
import type {
  CloudChild,
  CloudChildInput,
  CloudCommand,
  CloudCommandResult,
  CloudRelative,
  CloudSnapshot,
} from '@/models/cloudFamily';

export interface CloudCorePanelProps {
  snapshot: CloudSnapshot;
  busy: boolean;
  command: (command: CloudCommand) => Promise<CloudCommandResult | null>;
}

export function useCloudCoreCopy(section: 'family' | 'tasks') {
  const { t, i18n } = useTranslation();
  const language =
    i18n.resolvedLanguage?.startsWith('en') || i18n.language?.startsWith('en') ? 'en' : 'ar';
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  return {
    language,
    direction,
    text: (key: string, values?: Record<string, string | number>) =>
      t(`cloudFamily.${section}.${key}`, values),
  } as const;
}

export function CloudChoices({
  label,
  options,
  selected,
  onSelect,
  disabled,
  testID,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  selected: readonly string[];
  onSelect: (value: string) => void;
  disabled: boolean;
  testID: string;
}) {
  const { language, direction } = useCloudCoreCopy('family');
  return (
    <View style={coreStyles.group}>
      <Text brand direction={direction} language={language} variant="label">
        {label}
      </Text>
      <View style={[coreStyles.choices, { flexDirection: logicalRowDirection(direction) }]}>
        {options.map((option) => (
          <ChoiceChip
            key={option.value}
            direction={direction}
            language={language}
            label={option.label}
            selected={selected.includes(option.value)}
            disabled={disabled}
            onPress={() => onSelect(option.value)}
            testID={`${testID}-${option.value}`}
          />
        ))}
      </View>
    </View>
  );
}

type ChildDraft = Omit<CloudChildInput, 'ageBand'> & {
  ageBand: CloudChildInput['ageBand'] | null;
  id?: string;
};

export function cloudChildDraft(child?: CloudChild): ChildDraft {
  return {
    id: child?.id,
    nickname: child?.nickname ?? '',
    ageBand: child?.age_band ?? null,
    age10PlusConfirmed: child?.age10_plus_confirmed ?? false,
    preferredLanguage: child?.preferred_language ?? 'ar',
    avatarId: child?.avatar_id ?? 'ghaf_tree',
    preferences: child
      ? {
          ...child.preferences,
          interests: [...child.preferences.interests],
          hobbies: [...child.preferences.hobbies],
          accessibility: [...child.preferences.accessibility],
          support: [...child.preferences.support],
        }
      : {
          sex: null,
          interests: [],
          hobbies: [],
          accessibility: [],
          support: [],
          personalization_enabled: false,
          custom_interest: null,
          custom_hobby: null,
          custom_support: null,
          custom_accessibility: null,
        },
  };
}

export function cloudFamilyConnections(snapshot: CloudSnapshot): FamilyConnectionPlanPresentation {
  return {
    guardianDisplayNames: [...snapshot.family.guardian_names],
    entries: snapshot.family.relatives.map((relative) => ({
      relativeId: relative.id,
      displayName: relative.display_name,
      relationship: relative.relationship,
      rhythm: relative.rhythm,
      ideaKind:
        relative.relationship === 'grandmother' || relative.relationship === 'grandfather'
          ? 'family_story'
          : 'visit_or_call',
    })),
  };
}

const groups = [
  {
    field: 'interests',
    label: 'interests',
    values: ['nature', 'making', 'stories', 'family_helping', 'sustainability'],
  },
  {
    field: 'hobbies',
    label: 'hobbies',
    values: ['drawing', 'reading', 'sports', 'puzzles', 'gardening'],
  },
  {
    field: 'support',
    label: 'support',
    values: ['short_steps', 'visual_examples', 'extra_time', 'adult_alongside', 'quiet_reminders'],
  },
  {
    field: 'accessibility',
    label: 'accessibility',
    values: ['larger_text', 'simpler_instructions', 'high_contrast', 'reduced_motion'],
  },
] as const;

const avatarIcons: Readonly<Record<string, GhafIconName>> = {
  ghaf_tree: 'ghaf-tree',
  leaf: 'leaf',
  flower: 'flower',
  energy_leaf: 'energy-leaf',
  water_drop: 'water-drop',
};

export function FamilyPanel({ snapshot, busy, command }: CloudCorePanelProps) {
  const { text, language, direction } = useCloudCoreCopy('family');
  const [familyDraft, setFamilyDraft] = useState<{
    name: string;
    locale: 'ar' | 'en';
    guardianNames: string[];
    relatives: CloudRelative[];
  } | null>(null);
  const [childDraft, setChildDraft] = useState<ChildDraft | null>(null);
  const [editRevision, setEditRevision] = useState<number | null>(null);
  const [reviewedRevision, setReviewedRevision] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const [saving, setSaving] = useState(false);
  const disabled = busy || saving;
  const preferences = childDraft?.preferences;
  const parent = snapshot.actor.role === 'parent';
  const conflict =
    (familyDraft !== null || childDraft !== null) && editRevision !== snapshot.revision;
  const latestChild = childDraft?.id
    ? snapshot.children.find((child) => child.id === childDraft.id)
    : undefined;
  const settingsCommand = async (input: CloudCommand) => {
    if (!parent || disabled || pending.current || childDraft || familyDraft) return;
    pending.current = true;
    setSaving(true);
    setError(null);
    try {
      if (!(await command(input))) setError('retained');
    } catch {
      setError('retained');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  const save = async () => {
    if (!parent || disabled || pending.current) return;
    if (conflict) {
      setError('conflict');
      return;
    }
    let input: CloudCommand;
    if (childDraft) {
      if (!childDraft.nickname.trim() || !childDraft.ageBand || !childDraft.preferences?.sex) {
        setError('required');
        return;
      }
      const values: CloudChildInput = {
        nickname: childDraft.nickname.trim(),
        ageBand: childDraft.ageBand,
        age10PlusConfirmed: childDraft.age10PlusConfirmed,
        preferredLanguage: childDraft.preferredLanguage,
        avatarId: childDraft.avatarId,
        preferences: childDraft.preferences,
      };
      input = childDraft.id
        ? { type: 'child.update', childId: childDraft.id, ...values }
        : { type: 'child.create', ...values };
    } else if (familyDraft) {
      if (!familyDraft.name.trim()) {
        setError('requiredFamily');
        return;
      }
      if (familyDraft.relatives.some((relative) => !relative.display_name.trim())) {
        setError('requiredRelative');
        return;
      }
      input = {
        type: 'family.update',
        ...familyDraft,
        name: familyDraft.name.trim(),
        guardianNames: familyDraft.guardianNames.map((name) => name?.trim() ?? '').filter(Boolean),
        relatives: familyDraft.relatives.map((relative) => ({
          ...relative,
          display_name: relative.display_name.trim(),
        })),
      };
    } else return;
    pending.current = true;
    setSaving(true);
    setError(null);
    try {
      const result = await command(input);
      if (result) {
        setFamilyDraft(null);
        setChildDraft(null);
        setEditRevision(null);
        setReviewedRevision(null);
      } else setError('retained');
    } catch {
      setError('retained');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  const patch = (value: Partial<ChildDraft>) => {
    if (!disabled && !pending.current)
      setChildDraft((current) => (current ? { ...current, ...value } : current));
  };
  return (
    <View style={coreStyles.panel} testID="cloud-family-panel">
      <Text brand variant="parentHero" direction={direction} language={language}>
        {text('title')}
      </Text>
      <Text direction={direction} language={language}>
        {text('intro')}
      </Text>
      <Text brand variant="heading" direction={direction} language={language}>
        {snapshot.family.name || text('empty')}
      </Text>
      {parent && !familyDraft && !childDraft ? (
        <Button
          brand
          direction={direction}
          language={language}
          variant="secondary"
          disabled={disabled}
          testID="cloud-family-edit"
          onPress={() => {
            setError(null);
            setEditRevision(snapshot.revision);
            setReviewedRevision(null);
            setFamilyDraft({
              name: snapshot.family.name,
              locale: snapshot.family.locale,
              guardianNames: [...snapshot.family.guardian_names],
              relatives: snapshot.family.relatives.map((relative) => ({ ...relative })),
            });
          }}
        >
          {text(snapshot.family.name ? 'editFamily' : 'create')}
        </Button>
      ) : null}
      {familyDraft ? (
        <View style={coreStyles.editor} testID="cloud-family-editor">
          <AccessTextField
            label={text('name')}
            value={familyDraft.name}
            maxLength={80}
            editable={!disabled}
            direction={direction}
            language={language}
            testID="cloud-family-name"
            onChangeText={(name) => {
              if (!pending.current)
                setFamilyDraft((current) => (current ? { ...current, name } : current));
            }}
          />
          <CloudChoices
            label={text('appLanguage')}
            disabled={disabled}
            selected={[familyDraft.locale]}
            options={['ar', 'en'].map((value) => ({ value, label: text(value) }))}
            testID="cloud-family-language"
            onSelect={(locale) =>
              setFamilyDraft((current) =>
                current ? { ...current, locale: locale === 'en' ? 'en' : 'ar' } : current,
              )
            }
          />
          {[0, 1].map((index) => (
            <AccessTextField
              key={index}
              label={text(index === 0 ? 'primaryGuardian' : 'secondaryGuardian')}
              value={familyDraft.guardianNames[index] ?? ''}
              maxLength={80}
              editable={!disabled}
              direction={direction}
              language={language}
              testID={`cloud-family-guardian-${index}`}
              onChangeText={(name) =>
                setFamilyDraft((current) => {
                  if (!current || pending.current) return current;
                  const guardianNames = [...current.guardianNames];
                  guardianNames[index] = name;
                  return { ...current, guardianNames };
                })
              }
            />
          ))}
          <Text brand direction={direction} language={language} variant="heading">
            {text('relatives')}
          </Text>
          {familyDraft.relatives.map((relative) => (
            <View key={relative.id} style={coreStyles.listRow}>
              <AccessTextField
                label={text('relativeName')}
                direction={direction}
                language={language}
                editable={!disabled}
                maxLength={80}
                value={relative.display_name}
                testID={`cloud-relative-name-${relative.id}`}
                onChangeText={(display_name) =>
                  setFamilyDraft((current) =>
                    current && !pending.current
                      ? {
                          ...current,
                          relatives: current.relatives.map((item) =>
                            item.id === relative.id ? { ...item, display_name } : item,
                          ),
                        }
                      : current,
                  )
                }
              />
              <CloudChoices
                label={text('relationship')}
                disabled={disabled}
                selected={[relative.relationship]}
                options={(['grandmother', 'grandfather', 'aunt', 'uncle'] as const).map(
                  (value) => ({ value, label: text(value) }),
                )}
                testID={`cloud-relative-relationship-${relative.id}`}
                onSelect={(value) => {
                  if (
                    value !== 'grandmother' &&
                    value !== 'grandfather' &&
                    value !== 'aunt' &&
                    value !== 'uncle'
                  )
                    return;
                  setFamilyDraft((current) =>
                    current
                      ? {
                          ...current,
                          relatives: current.relatives.map((item) =>
                            item.id === relative.id ? { ...item, relationship: value } : item,
                          ),
                        }
                      : current,
                  );
                }}
              />
              <CloudChoices
                label={text('rhythm')}
                disabled={disabled}
                selected={[relative.rhythm]}
                options={['weekly', 'monthly', 'every_three_months', 'no_schedule'].map(
                  (value) => ({ value, label: text(value) }),
                )}
                testID={`cloud-relative-rhythm-${relative.id}`}
                onSelect={(value) => {
                  if (
                    value !== 'weekly' &&
                    value !== 'monthly' &&
                    value !== 'every_three_months' &&
                    value !== 'no_schedule'
                  )
                    return;
                  setFamilyDraft((current) =>
                    current
                      ? {
                          ...current,
                          relatives: current.relatives.map((item) =>
                            item.id === relative.id ? { ...item, rhythm: value } : item,
                          ),
                        }
                      : current,
                  );
                }}
              />
            </View>
          ))}
          <Button
            brand
            variant="secondary"
            direction={direction}
            language={language}
            disabled={disabled}
            testID="cloud-family-add-relative"
            onPress={() =>
              setFamilyDraft((current) =>
                current && !pending.current
                  ? {
                      ...current,
                      relatives: [
                        ...current.relatives,
                        {
                          id: randomUUID(),
                          display_name: '',
                          relationship: 'grandmother',
                          rhythm: 'no_schedule',
                        },
                      ],
                    }
                  : current,
              )
            }
          >
            {text('addRelative')}
          </Button>
        </View>
      ) : null}
      {!familyDraft ? (
        <>
          <Text brand variant="heading" direction={direction} language={language}>
            {text('children')}
          </Text>
          {!snapshot.children.length ? (
            <Text direction={direction} language={language}>
              {text('noChildren')}
            </Text>
          ) : null}
          {snapshot.children.map((child) => (
            <View key={child.id} style={coreStyles.listRow} testID={`cloud-child-${child.id}`}>
              <View
                style={[coreStyles.identity, { flexDirection: logicalRowDirection(direction) }]}
              >
                <GhafIcon
                  name={avatarIcons[child.avatar_id] ?? 'ghaf-tree'}
                  size={32}
                  color={botanical.colors.forest}
                />
                <View style={coreStyles.grow}>
                  <Text brand variant="heading" direction={direction} language={language}>
                    {child.nickname}
                  </Text>
                  {!child.age_band || !child.preferences.sex ? (
                    <Text direction={direction} language={language}>
                      {text('completeProfile')}
                    </Text>
                  ) : null}
                </View>
              </View>
              {parent && !childDraft ? (
                <Button
                  brand
                  direction={direction}
                  language={language}
                  variant="quiet"
                  disabled={disabled}
                  testID={`cloud-child-edit-${child.id}`}
                  onPress={() => {
                    setError(null);
                    setEditRevision(snapshot.revision);
                    setReviewedRevision(null);
                    setChildDraft(cloudChildDraft(child));
                  }}
                >
                  {text('editChild')}
                </Button>
              ) : null}
              {parent && !childDraft ? (
                <View style={coreStyles.group} testID={`cloud-child-permissions-${child.id}`}>
                  <Text brand direction={direction} language={language} variant="label">
                    {text('permissions')}
                  </Text>
                  {snapshot.permissions
                    .filter((permission) => permission.child_id === child.id)
                    .map((permission) => (
                      <View key={child.id} style={coreStyles.group}>
                        {(
                          [
                            ['voice_granted', 'voice'],
                            ['media_granted', 'media'],
                            ['ai_granted', 'ai'],
                          ] as const
                        ).map(([field, label]) => (
                          <ChoiceChip
                            key={field}
                            direction={direction}
                            language={language}
                            disabled={disabled}
                            selected={permission[field]}
                            label={text(label)}
                            testID={`cloud-permission-${child.id}-${field}`}
                            onPress={() =>
                              void settingsCommand({
                                type: 'child.permissions',
                                childId: child.id,
                                voiceGranted:
                                  field === 'voice_granted'
                                    ? !permission.voice_granted
                                    : permission.voice_granted,
                                mediaGranted:
                                  field === 'media_granted'
                                    ? !permission.media_granted
                                    : permission.media_granted,
                                aiGranted:
                                  field === 'ai_granted'
                                    ? !permission.ai_granted
                                    : permission.ai_granted,
                              })
                            }
                          />
                        ))}
                      </View>
                    ))}
                  <Text direction={direction} language={language} variant="caption">
                    {text('permissionsHelp')}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
          {parent && !childDraft ? (
            <Button
              brand
              direction={direction}
              language={language}
              disabled={disabled}
              testID="cloud-child-add"
              onPress={() => {
                setError(null);
                setEditRevision(snapshot.revision);
                setReviewedRevision(null);
                setChildDraft(cloudChildDraft());
              }}
            >
              {text('addChild')}
            </Button>
          ) : null}
        </>
      ) : null}
      {!familyDraft &&
      !childDraft &&
      (snapshot.family.guardian_names.length > 0 || snapshot.family.relatives.length > 0) ? (
        <FamilyConnectionPlan
          direction={direction}
          language={language}
          plan={cloudFamilyConnections(snapshot)}
        />
      ) : null}
      {parent && !familyDraft && !childDraft ? (
        <View style={coreStyles.group} testID="cloud-community-controls">
          <Text brand direction={direction} language={language} variant="heading">
            {text('community')}
          </Text>
          <Text direction={direction} language={language}>
            {text('communityDescription')}
          </Text>
          <Text direction={direction} language={language}>
            {text(`community_${snapshot.community.status}`)}
          </Text>
          {(['continue', 'pause_new_contributions', 'end_participation'] as const).map((action) => (
            <Button
              key={action}
              brand
              variant="secondary"
              direction={direction}
              language={language}
              disabled={disabled}
              testID={`cloud-community-${action}`}
              onPress={() => void settingsCommand({ type: 'community.participation', action })}
            >
              {text(action)}
            </Button>
          ))}
          <Text direction={direction} language={language} variant="caption">
            {text('freshParent')}
          </Text>
        </View>
      ) : null}
      {childDraft && preferences ? (
        <View style={coreStyles.editor} testID="cloud-child-editor">
          <Text brand variant="heading" direction={direction} language={language}>
            {text('profile')}
          </Text>
          <AccessTextField
            label={text('nickname')}
            direction={direction}
            language={language}
            editable={!disabled}
            value={childDraft.nickname}
            maxLength={80}
            onChangeText={(nickname) => patch({ nickname })}
            testID="cloud-child-nickname"
          />
          <CloudChoices
            label={text('age')}
            selected={childDraft.ageBand ? [childDraft.ageBand] : []}
            disabled={disabled}
            options={[
              { value: '6_8', label: text('age6') },
              { value: '9_11', label: text('age9') },
              { value: '12_14', label: text('age12') },
            ]}
            onSelect={(value) => {
              if (value === '6_8' || value === '9_11' || value === '12_14')
                patch({ ageBand: value, age10PlusConfirmed: false });
            }}
            testID="cloud-child-age"
          />
          {childDraft.ageBand && childDraft.ageBand !== '6_8' ? (
            <ChoiceChip
              direction={direction}
              language={language}
              disabled={disabled}
              label={text('age10Attestation')}
              selected={childDraft.age10PlusConfirmed}
              testID="cloud-child-age10"
              onPress={() => patch({ age10PlusConfirmed: !childDraft.age10PlusConfirmed })}
            />
          ) : null}
          <CloudChoices
            label={text('sex')}
            selected={preferences.sex ? [preferences.sex] : []}
            disabled={disabled}
            options={['male', 'female'].map((value) => ({ value, label: text(value) }))}
            testID="cloud-child-sex"
            onSelect={(value) =>
              patch({
                preferences: { ...preferences, sex: value === 'female' ? 'female' : 'male' },
              })
            }
          />
          <CloudChoices
            label={text('avatar')}
            selected={[childDraft.avatarId]}
            disabled={disabled}
            options={['ghaf_tree', 'leaf', 'flower', 'energy_leaf', 'water_drop'].map((value) => ({
              value,
              label: text(value),
            }))}
            onSelect={(avatarId) => patch({ avatarId })}
            testID="cloud-child-avatar"
          />
          <CloudChoices
            label={text('language')}
            selected={[childDraft.preferredLanguage]}
            disabled={disabled}
            options={['ar', 'en', 'both'].map((value) => ({ value, label: text(value) }))}
            testID="cloud-child-language"
            onSelect={(value) => {
              if (value === 'ar' || value === 'en' || value === 'both')
                patch({ preferredLanguage: value });
            }}
          />
          {groups.map((group) => (
            <CloudChoices
              key={group.field}
              label={text(group.label)}
              disabled={disabled}
              options={group.values.map((value) => ({ value, label: text(value) }))}
              selected={preferences[group.field]}
              testID={`cloud-child-${group.field}`}
              onSelect={(value) => {
                const values = preferences[group.field];
                patch({
                  preferences: {
                    ...preferences,
                    [group.field]: values.includes(value)
                      ? values.filter((item) => item !== value)
                      : [...values, value],
                  },
                });
              }}
            />
          ))}
          {(
            [
              ['custom_interest', 'customInterest'],
              ['custom_hobby', 'customHobby'],
              ['custom_support', 'customSupport'],
              ['custom_accessibility', 'customAccessibility'],
            ] as const
          ).map(([field, label]) => (
            <AccessTextField
              key={field}
              label={text(label)}
              value={preferences[field] ?? ''}
              direction={direction}
              language={language}
              editable={!disabled}
              maxLength={300}
              testID={`cloud-child-${field}`}
              onChangeText={(value) =>
                patch({ preferences: { ...preferences, [field]: value || null } })
              }
            />
          ))}
          <ChoiceChip
            direction={direction}
            language={language}
            disabled={disabled}
            label={text('personalization')}
            selected={preferences.personalization_enabled}
            testID="cloud-child-personalization"
            onPress={() =>
              patch({
                preferences: {
                  ...preferences,
                  personalization_enabled: !preferences.personalization_enabled,
                },
              })
            }
          />
          <Text direction={direction} language={language} variant="caption">
            {text('private')}
          </Text>
        </View>
      ) : null}
      {conflict ? (
        <View style={coreStyles.notice} testID="cloud-family-conflict">
          <Text accessibilityRole="alert" direction={direction} language={language}>
            {text('conflict')}
          </Text>
          <Button
            brand
            variant="secondary"
            direction={direction}
            language={language}
            disabled={disabled}
            testID="cloud-family-review-latest"
            onPress={() => setReviewedRevision(snapshot.revision)}
          >
            {text('reviewLatest')}
          </Button>
          {reviewedRevision === snapshot.revision ? (
            <View style={coreStyles.group} testID="cloud-family-latest-data">
              <Text brand direction={direction} language={language} variant="heading">
                {text('latestSaved')}
              </Text>
              <Text direction={direction} language={language}>
                {text('name')}: {snapshot.family.name}
              </Text>
              <Text direction={direction} language={language}>
                {text('appLanguage')}: {text(snapshot.family.locale)}
              </Text>
              {snapshot.family.guardian_names.map((name, index) => (
                <Text key={index} direction={direction} language={language}>
                  {text(index === 0 ? 'primaryGuardian' : 'secondaryGuardian')}: {name}
                </Text>
              ))}
              {snapshot.family.relatives.map((relative) => (
                <Text key={relative.id} direction={direction} language={language}>
                  {relative.display_name} · {text(relative.relationship)} · {text(relative.rhythm)}
                </Text>
              ))}
              {latestChild ? (
                <>
                  <Text direction={direction} language={language}>
                    {text('nickname')}: {latestChild.nickname}
                  </Text>
                  <Text direction={direction} language={language}>
                    {text('age')}:{' '}
                    {text(
                      latestChild.age_band === '6_8'
                        ? 'age6'
                        : latestChild.age_band === '9_11'
                          ? 'age9'
                          : latestChild.age_band === '12_14'
                            ? 'age12'
                            : 'ageUnknown',
                    )}
                  </Text>
                  <Text direction={direction} language={language}>
                    {text('age10Attestation')}:{' '}
                    {text(latestChild.age10_plus_confirmed ? 'enabled' : 'disabled')}
                  </Text>
                  <Text direction={direction} language={language}>
                    {text('sex')}:{' '}
                    {latestChild.preferences.sex
                      ? text(latestChild.preferences.sex)
                      : text('unselected')}
                  </Text>
                  <Text direction={direction} language={language}>
                    {text('avatar')}: {text(latestChild.avatar_id)}
                  </Text>
                  <Text direction={direction} language={language}>
                    {text('language')}: {text(latestChild.preferred_language)}
                  </Text>
                  {groups.map((group) => (
                    <Text key={group.field} direction={direction} language={language}>
                      {text(group.label)}:{' '}
                      {latestChild.preferences[group.field].map((value) => text(value)).join(' · ')}
                    </Text>
                  ))}
                  {(
                    [
                      ['custom_interest', 'customInterest'],
                      ['custom_hobby', 'customHobby'],
                      ['custom_support', 'customSupport'],
                      ['custom_accessibility', 'customAccessibility'],
                    ] as const
                  ).map(([field, label]) => (
                    <Text key={field} direction={direction} language={language}>
                      {text(label)}: {latestChild.preferences[field] ?? ''}
                    </Text>
                  ))}
                  <Text direction={direction} language={language}>
                    {text('personalization')}:{' '}
                    {text(latestChild.preferences.personalization_enabled ? 'enabled' : 'disabled')}
                  </Text>
                </>
              ) : (
                snapshot.children.map((child) => (
                  <Text key={child.id} direction={direction} language={language}>
                    {child.nickname}
                  </Text>
                ))
              )}
              <Text direction={direction} language={language}>
                {text('keepDraftExplanation')}
              </Text>
              <Button
                brand
                direction={direction}
                language={language}
                disabled={disabled || (!!childDraft?.id && !latestChild)}
                testID="cloud-family-keep-draft"
                onPress={() => {
                  if (!pending.current && reviewedRevision === snapshot.revision) {
                    setEditRevision(snapshot.revision);
                    setReviewedRevision(null);
                    setError(null);
                  }
                }}
              >
                {text('keepDraft')}
              </Button>
            </View>
          ) : null}
        </View>
      ) : null}
      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          color="error"
          direction={direction}
          language={language}
          testID="cloud-family-error"
        >
          {text(error)}
        </Text>
      ) : null}
      {familyDraft || childDraft ? (
        <View style={coreStyles.group}>
          <Button
            brand
            direction={direction}
            language={language}
            busy={saving}
            disabled={disabled || conflict}
            testID="cloud-family-save"
            onPress={() => void save()}
          >
            {text(saving ? 'saving' : 'save')}
          </Button>
          <Button
            brand
            direction={direction}
            language={language}
            variant="quiet"
            disabled={disabled}
            testID="cloud-family-cancel"
            onPress={() => {
              if (!pending.current) {
                setFamilyDraft(null);
                setChildDraft(null);
                setEditRevision(null);
                setReviewedRevision(null);
                setError(null);
              }
            }}
          >
            {text('cancel')}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export const coreStyles = StyleSheet.create({
  panel: { gap: spacing.lg },
  group: { gap: spacing.xs },
  choices: { flexWrap: 'wrap', gap: spacing.xs },
  editor: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: botanical.radius.control,
    backgroundColor: botanical.colors.paper,
  },
  listRow: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: botanical.colors.line,
  },
  identity: { alignItems: 'center', gap: spacing.md },
  grow: { flex: 1, minWidth: 0 },
  notice: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.small,
  },
});

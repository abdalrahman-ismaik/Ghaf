import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/primitives';
import type { CloudFamilyController } from '@/features/cloud-family';
import type { CloudFamilySnapshot } from '@/models/cloudFamily';
import type { CloudSavedTemplate } from '@/models/cloudFamilyDocuments';
import type { LocalizedText, TaskCategoryId } from '@/models/familyGrowth';

import {
  CloudAction,
  CloudActions,
  CloudField,
  CloudSection,
  cloudStyles,
  useCloudCopy,
} from './common';

export function CloudCustomTaskView({
  snapshot,
  controller,
  disabled,
  draft,
  onAssigned,
}: {
  readonly snapshot: CloudFamilySnapshot;
  readonly controller: CloudFamilyController;
  readonly disabled: boolean;
  readonly draft?: CloudSavedTemplate;
  readonly onAssigned: (taskId: string | null) => void;
}) {
  const { text, locale } = useCloudCopy();
  const [creating, setCreating] = useState(Boolean(draft));
  const [reviewing, setReviewing] = useState(false);
  const [title, setTitle] = useState<LocalizedText>(draft?.title ?? { ar: '', en: '' });
  const [action, setAction] = useState<LocalizedText>(draft?.positiveAction ?? { ar: '', en: '' });
  const [categoryId, setCategoryId] = useState<TaskCategoryId | null>(draft?.categoryId ?? null);
  const [recurrence, setRecurrence] = useState<'once' | 'recurrent'>(draft?.recurrence ?? 'once');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  if (snapshot.actor.role !== 'parent') return null;
  const templates = snapshot.customTemplates.filter((item) => item.active);
  const selected = templates.find((item) => item.id === selectedTemplateId);
  const valid =
    categoryId !== null &&
    [title.ar, title.en, action.ar, action.en].every((value) => value.trim().length > 0);
  const save = async () => {
    if (disabled || !reviewing || !valid || !categoryId) return;
    const saved = await controller.command({
      type: 'create_custom_template',
      title: { ar: title.ar.trim(), en: title.en.trim() },
      positiveAction: { ar: action.ar.trim(), en: action.en.trim() },
      categoryId,
      recurrence,
      reviewed: true,
    });
    if (saved && mounted.current) {
      setCreating(false);
      setReviewing(false);
    }
  };
  const assign = async () => {
    if (!selected || !selectedChildId || disabled) return;
    const previous = new Set(snapshot.tasks.map((task) => task.id));
    const saved = await controller.command({
      type: 'assign_custom_task',
      childId: selectedChildId,
      templateId: selected.id,
    });
    if (saved && mounted.current)
      onAssigned(
        controller
          .getSnapshot()
          .snapshot?.tasks.find(
            (task) => !previous.has(task.id) && task.childId === selectedChildId,
          )?.id ?? null,
      );
  };
  if (creating)
    return (
      <CloudSection
        title={text(reviewing ? 'reviewCustom' : 'createCustom')}
        testID="cloud-custom-editor"
      >
        <Text brand>{text('customPrivate')}</Text>
        {reviewing ? (
          <View style={cloudStyles.card}>
            <Text brand direction="rtl" language="ar" variant="label">
              {title.ar}
            </Text>
            <Text brand direction="rtl" language="ar">
              {action.ar}
            </Text>
            <Text brand direction="ltr" language="en" variant="label">
              {title.en}
            </Text>
            <Text brand direction="ltr" language="en">
              {action.en}
            </Text>
            <Text brand>
              {text(`categories.${categoryId}`)} · {text(recurrence)}
            </Text>
          </View>
        ) : (
          <>
            <CloudField
              label={text('titleAr')}
              value={title.ar}
              onChangeText={(value) => setTitle({ ...title, ar: value })}
              editable={!disabled}
              maxLength={160}
              inputLanguage="ar"
              testID="cloud-custom-title-ar"
            />
            <CloudField
              label={text('titleEn')}
              value={title.en}
              onChangeText={(value) => setTitle({ ...title, en: value })}
              editable={!disabled}
              maxLength={160}
              inputLanguage="en"
              testID="cloud-custom-title-en"
            />
            <CloudField
              label={text('actionAr')}
              value={action.ar}
              onChangeText={(value) => setAction({ ...action, ar: value })}
              editable={!disabled}
              maxLength={500}
              multiline
              inputLanguage="ar"
              testID="cloud-custom-action-ar"
            />
            <CloudField
              label={text('actionEn')}
              value={action.en}
              onChangeText={(value) => setAction({ ...action, en: value })}
              editable={!disabled}
              maxLength={500}
              multiline
              inputLanguage="en"
              testID="cloud-custom-action-en"
            />
            <CloudSection title={text('category')}>
              <CloudActions>
                {[...new Set(snapshot.catalog.map((item) => item.categoryId))].map((category) => (
                  <CloudAction
                    key={category}
                    disabled={disabled}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: categoryId === category }}
                    variant={categoryId === category ? 'primary' : 'secondary'}
                    onPress={() => setCategoryId(category)}
                  >
                    {text(`categories.${category}`)}
                  </CloudAction>
                ))}
              </CloudActions>
            </CloudSection>
            <CloudSection title={text('recurrence')}>
              <CloudActions>
                {(['once', 'recurrent'] as const).map((option) => (
                  <CloudAction
                    key={option}
                    disabled={disabled}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: recurrence === option }}
                    variant={recurrence === option ? 'primary' : 'secondary'}
                    onPress={() => setRecurrence(option)}
                  >
                    {text(option)}
                  </CloudAction>
                ))}
              </CloudActions>
            </CloudSection>
          </>
        )}
        <CloudActions>
          <CloudAction
            disabled={disabled || !valid}
            onPress={() => {
              if (reviewing) void save();
              else setReviewing(true);
            }}
            testID="cloud-custom-review-save"
          >
            {text(reviewing ? 'confirmCustom' : 'reviewCustom')}
          </CloudAction>
          <CloudAction
            disabled={disabled}
            variant="quiet"
            onPress={() => {
              if (reviewing) setReviewing(false);
              else setCreating(false);
            }}
          >
            {text(reviewing ? 'back' : 'cancel')}
          </CloudAction>
        </CloudActions>
      </CloudSection>
    );
  return (
    <CloudSection title={text('customTasks')} testID="cloud-custom-library">
      <Text brand>{text('customPrivate')}</Text>
      <CloudAction
        disabled={disabled}
        onPress={() => {
          setTitle({ ar: '', en: '' });
          setAction({ ar: '', en: '' });
          setCategoryId(null);
          setRecurrence('once');
          setCreating(true);
        }}
      >
        {text('createCustom')}
      </CloudAction>
      {!templates.length ? <Text brand>{text('customEmpty')}</Text> : null}
      {templates.map((item) => (
        <View key={item.id} style={cloudStyles.card}>
          <Text brand variant="label">
            {item.template.title[locale]}
          </Text>
          <Text brand>{item.template.positiveAction[locale]}</Text>
          <CloudActions>
            <CloudAction
              disabled={disabled}
              variant="secondary"
              onPress={() => {
                setSelectedTemplateId(item.id);
                setSelectedChildId('');
              }}
            >
              {text('review')}
            </CloudAction>
            <CloudAction disabled={disabled} variant="quiet" onPress={() => setRemoveId(item.id)}>
              {text('removeCustom')}
            </CloudAction>
          </CloudActions>
          {removeId === item.id ? (
            <>
              <Text brand>{text('removeCustomConfirm')}</Text>
              <CloudActions>
                <CloudAction
                  disabled={disabled}
                  onPress={() =>
                    void controller.command({
                      type: 'remove_custom_template',
                      templateId: item.id,
                      expectedRevision: item.revision,
                    })
                  }
                >
                  {text('removeCustom')}
                </CloudAction>
                <CloudAction disabled={disabled} variant="quiet" onPress={() => setRemoveId(null)}>
                  {text('cancel')}
                </CloudAction>
              </CloudActions>
            </>
          ) : null}
          {selected?.id === item.id ? (
            <CloudSection title={text('chooseChild')}>
              <CloudActions>
                {snapshot.children
                  .filter((child) => child.active)
                  .map((child) => (
                    <CloudAction
                      key={child.id}
                      disabled={disabled}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selectedChildId === child.id }}
                      variant={selectedChildId === child.id ? 'primary' : 'secondary'}
                      onPress={() => setSelectedChildId(child.id)}
                    >
                      {child.displayName}
                    </CloudAction>
                  ))}
              </CloudActions>
              <Text brand>{text('customPrivate')}</Text>
              <CloudAction
                disabled={disabled || !selectedChildId}
                onPress={() => void assign()}
                testID="cloud-custom-assign"
              >
                {text('assign')}
              </CloudAction>
            </CloudSection>
          ) : null}
        </View>
      ))}
    </CloudSection>
  );
}

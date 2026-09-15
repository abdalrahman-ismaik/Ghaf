import { useRef, useState } from 'react';
import { View } from 'react-native';

import { AccessTextField, ChoiceChip } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import type {
  CloudTask,
  CloudTaskInput,
  CloudTaskSafety,
  CloudTemplate,
} from '@/models/cloudFamily';

import {
  CloudChoices,
  coreStyles,
  useCloudCoreCopy,
  type CloudCorePanelProps,
} from './FamilyPanel';

export interface TaskEditorProps extends CloudCorePanelProps {
  task?: CloudTask;
  onClose: () => void;
}

export const emptyTaskSafety = (): CloudTaskSafety => ({
  adult_pre_check: '',
  adult_second_check: '',
  adult_owned_actions: [],
  child_allowed_actions: [],
  excluded_hazards: [],
  stop_and_ask_adult: '',
  route_constraint: null,
  indoor_alternative: null,
  aftercare: null,
});

export function taskInputFromRow(task: CloudTask, includeCatalogTemplate = true): CloudTaskInput {
  return {
    childId: task.child_id,
    ...(includeCatalogTemplate && task.template_id ? { templateId: task.template_id } : {}),
    locale: task.content_locale,
    title: task.title,
    definitionOfDone: task.definition_of_done,
    steps: [...task.steps],
    categoryId: task.category_id,
    positiveAction: task.positive_action,
    whyItMatters: task.why_it_matters,
    permittedHelp: task.permitted_help,
    supervision: task.supervision,
    safety: { ...task.safety },
    recognitionMode: task.recognition_mode,
    routinePhase: task.routine_phase,
    seedAward: task.seed_award,
    visibilityScope: task.visibility_scope,
    recurrence: task.recurrence,
    circleEligible: task.circle_eligible,
  };
}

export function taskInputFromTemplate(
  template: CloudTemplate,
  childId: string,
  locale: 'ar' | 'en',
): CloudTaskInput {
  return {
    childId,
    templateId: template.id,
    locale,
    categoryId: template.category_id,
    title: locale === 'ar' ? template.title_ar : template.title_en,
    definitionOfDone: locale === 'ar' ? template.definition_ar : template.definition_en,
    positiveAction: locale === 'ar' ? template.positive_action_ar : template.positive_action_en,
    whyItMatters: locale === 'ar' ? template.why_it_matters_ar : template.why_it_matters_en,
    steps: [...(locale === 'ar' ? template.steps_ar : template.steps_en)],
    permittedHelp: locale === 'ar' ? template.permitted_help_ar : template.permitted_help_en,
    supervision: locale === 'ar' ? template.supervision_ar : template.supervision_en,
    safety: { ...(locale === 'ar' ? template.safety_ar : template.safety_en) },
    recognitionMode: template.recognition_mode,
    routinePhase: template.routine_phase,
    seedAward: template.seed_award,
    visibilityScope: template.visibility_scope,
    recurrence: template.recurrence,
    circleEligible: template.circle_eligible,
  };
}

export function TaskEditor({ snapshot, busy, command, task, onClose }: TaskEditorProps) {
  const { text, language, direction } = useCloudCoreCopy('tasks');
  const [draft, setDraft] = useState<CloudTaskInput>(() =>
    task
      ? taskInputFromRow(task)
      : {
          childId: '',
          locale: language,
          title: '',
          definitionOfDone: '',
          positiveAction: '',
          whyItMatters: '',
          steps: [],
          recognitionMode: 'recognition_only',
          routinePhase: 'not_applicable',
          seedAward: null,
          permittedHelp: '',
          supervision: '',
          safety: emptyTaskSafety(),
          visibilityScope: 'child_guardian',
          recurrence: 'once',
          circleEligible: false,
        },
  );
  const [stepsText, setStepsText] = useState(task?.steps.join('\n') ?? '');
  const [baseVersion, setBaseVersion] = useState(task?.version ?? null);
  const [reviewedVersion, setReviewedVersion] = useState<number | null>(null);
  const [error, setError] = useState<'required' | 'retained' | null>(null);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const disabled = busy || saving;
  const latestTask = task
    ? snapshot.tasks
        .filter((item) => item.id === task.id)
        .reduce((latest, item) => (item.version > latest.version ? item : latest), task)
    : undefined;
  const conflict = !!latestTask && latestTask.version !== baseVersion;
  const locked = task?.status === 'assigned' || latestTask?.status === 'assigned';
  const child = snapshot.children.find((item) => item.id === draft.childId);
  const safeRecognition =
    draft.categoryId !== 'faith_gratitude' && draft.categoryId !== 'roots_kinship';
  const seedBearing =
    safeRecognition &&
    draft.recognitionMode !== 'recognition_only' &&
    draft.routinePhase === 'acquisition';
  const safety = draft.safety ?? emptyTaskSafety();
  const patch = (values: Partial<CloudTaskInput>) => {
    if (!disabled && !pending.current && !locked)
      setDraft((current) => ({ ...current, ...values }));
  };
  const applyTemplate = (template: CloudTemplate) => {
    if (disabled || pending.current || locked) return;
    const next = taskInputFromTemplate(template, draft.childId, draft.locale);
    setDraft(next);
    setStepsText(next.steps?.join('\n') ?? '');
    setError(null);
  };
  const save = async () => {
    if (disabled || pending.current || locked || conflict || snapshot.actor.role !== 'parent')
      return;
    const steps = stepsText
      .split(/\r?\n/u)
      .map((value) => value.trim())
      .filter(Boolean);
    if (
      !child?.age_band ||
      !draft.categoryId ||
      !draft.title?.trim() ||
      !draft.definitionOfDone?.trim() ||
      !steps.length
    ) {
      setError('required');
      return;
    }
    const values: CloudTaskInput = {
      ...draft,
      title: draft.title.trim(),
      definitionOfDone: draft.definitionOfDone.trim(),
      steps,
      safety: {
        ...safety,
        adult_owned_actions: safety.adult_owned_actions
          .map((value) => value.trim())
          .filter(Boolean),
        child_allowed_actions: safety.child_allowed_actions
          .map((value) => value.trim())
          .filter(Boolean),
        excluded_hazards: safety.excluded_hazards.map((value) => value.trim()).filter(Boolean),
        route_constraint: safety.route_constraint?.trim() || null,
        indoor_alternative: safety.indoor_alternative?.trim() || null,
        aftercare: safety.aftercare?.trim() || null,
      },
      recognitionMode: safeRecognition ? draft.recognitionMode : 'recognition_only',
      routinePhase:
        safeRecognition && draft.recognitionMode !== 'recognition_only'
          ? draft.routinePhase
          : 'not_applicable',
      seedAward: seedBearing ? draft.seedAward : null,
      circleEligible:
        draft.categoryId === 'green_impact' &&
        draft.visibilityScope === 'household' &&
        draft.circleEligible === true,
    };
    pending.current = true;
    setSaving(true);
    setError(null);
    try {
      const result = await command(
        task
          ? {
              type: 'task.update',
              taskId: task.id,
              expectedVersion: baseVersion ?? task.version,
              ...values,
            }
          : { type: 'task.create', ...values },
      );
      if (result) onClose();
      else setError('retained');
    } catch {
      setError('retained');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  const labels = (values: readonly string[]) =>
    values.map((value) => ({ value, label: text(value) }));
  return (
    <View style={coreStyles.editor} testID="cloud-task-editor">
      <Text brand direction={direction} language={language} variant="heading">
        {text('editor')}
      </Text>
      <CloudChoices
        label={text('child')}
        options={snapshot.children
          .filter((item) => item.active)
          .map((item) => ({ value: item.id, label: item.nickname }))}
        selected={[draft.childId]}
        disabled={disabled || locked}
        testID="cloud-task-child"
        onSelect={(childId) => patch({ childId })}
      />
      {child && !child.age_band ? (
        <Text direction={direction} language={language}>
          {text('noProfiles')}
        </Text>
      ) : null}
      <CloudChoices
        label={text('language')}
        options={[
          { value: 'ar', label: text('ar') },
          { value: 'en', label: text('en') },
        ]}
        selected={[draft.locale]}
        disabled={disabled || locked}
        testID="cloud-task-language"
        onSelect={(locale) => patch({ locale: locale === 'en' ? 'en' : 'ar' })}
      />
      <CloudChoices
        label={text('category')}
        options={snapshot.categories.map((category) => ({
          value: category.id,
          label: language === 'ar' ? category.label_ar : category.label_en,
        }))}
        selected={draft.categoryId ? [draft.categoryId] : []}
        disabled={disabled || locked}
        testID="cloud-task-category"
        onSelect={(value) => {
          const category = snapshot.categories.find((item) => item.id === value);
          if (!category) return;
          const protectedCategory = value === 'faith_gratitude' || value === 'roots_kinship';
          patch({
            categoryId: category.id,
            templateId: undefined,
            circleEligible: false,
            ...(protectedCategory
              ? {
                  recognitionMode: 'recognition_only' as const,
                  routinePhase: 'not_applicable' as const,
                  seedAward: null,
                }
              : {}),
          });
        }}
      />
      <CloudChoices
        label={text('template')}
        disabled={disabled || locked}
        selected={draft.templateId ? [draft.templateId] : []}
        options={snapshot.templates
          .filter(
            (template) =>
              (!draft.categoryId || template.category_id === draft.categoryId) &&
              (!child?.age_band || template.age_bands.includes(child.age_band)),
          )
          .map((template) => ({
            value: template.id,
            label: language === 'ar' ? template.title_ar : template.title_en,
          }))}
        onSelect={(id) => {
          const template = snapshot.templates.find((item) => item.id === id);
          if (template) applyTemplate(template);
        }}
        testID="cloud-task-template"
      />
      {snapshot.saved_templates.length ? (
        <CloudChoices
          label={text('savedTemplates')}
          disabled={disabled || locked}
          selected={draft.savedTemplateId ? [draft.savedTemplateId] : []}
          options={snapshot.saved_templates.map((item) => ({ value: item.id, label: item.title }))}
          testID="cloud-task-saved-template"
          onSelect={(id) => {
            const saved = snapshot.saved_templates.find((item) => item.id === id);
            const original = snapshot.tasks.find(
              (item) => item.id === saved?.task_id && item.version === saved.task_version,
            );
            if (original) {
              const next = {
                ...taskInputFromRow(original, false),
                childId: draft.childId,
                savedTemplateId: id,
              };
              setDraft(next);
              setStepsText(original.steps.join('\n'));
            }
          }}
        />
      ) : null}
      <AccessTextField
        label={text('titleField')}
        value={draft.title ?? ''}
        direction={direction}
        language={language}
        editable={!disabled && !locked}
        maxLength={160}
        onChangeText={(title) => patch({ title })}
        testID="cloud-task-title"
      />
      <AccessTextField
        label={text('definition')}
        value={draft.definitionOfDone ?? ''}
        direction={direction}
        language={language}
        editable={!disabled && !locked}
        multiline
        maxLength={1000}
        onChangeText={(definitionOfDone) => patch({ definitionOfDone })}
        testID="cloud-task-definition"
      />
      <AccessTextField
        label={text('positiveAction')}
        value={draft.positiveAction ?? ''}
        direction={direction}
        language={language}
        editable={!disabled && !locked}
        multiline
        maxLength={1000}
        onChangeText={(positiveAction) => patch({ positiveAction })}
        testID="cloud-task-positive-action"
      />
      <AccessTextField
        label={text('description')}
        value={draft.whyItMatters ?? ''}
        direction={direction}
        language={language}
        editable={!disabled && !locked}
        multiline
        maxLength={1000}
        onChangeText={(whyItMatters) => patch({ whyItMatters })}
        testID="cloud-task-why"
      />
      <AccessTextField
        label={text('steps')}
        value={stepsText}
        direction={direction}
        language={language}
        editable={!disabled && !locked}
        multiline
        maxLength={4000}
        onChangeText={(value) => {
          if (!pending.current) setStepsText(value);
        }}
        testID="cloud-task-steps"
      />
      <AccessTextField
        label={text('permittedHelp')}
        value={draft.permittedHelp ?? ''}
        direction={direction}
        language={language}
        editable={!disabled && !locked}
        multiline
        maxLength={1000}
        onChangeText={(permittedHelp) => patch({ permittedHelp })}
        testID="cloud-task-permitted-help"
      />
      <AccessTextField
        label={text('supervisionText')}
        value={draft.supervision ?? ''}
        direction={direction}
        language={language}
        editable={!disabled && !locked}
        multiline
        maxLength={1000}
        onChangeText={(supervision) => patch({ supervision })}
        testID="cloud-task-supervision"
      />
      <CloudChoices
        label={text('recognition')}
        disabled={disabled || locked || !safeRecognition}
        selected={[draft.recognitionMode ?? 'recognition_only']}
        options={labels(['standard', 'fade_first', 'recognition_only'])}
        testID="cloud-task-recognition"
        onSelect={(value) => {
          if (value !== 'standard' && value !== 'fade_first' && value !== 'recognition_only')
            return;
          patch({
            recognitionMode: value,
            routinePhase: value === 'recognition_only' ? 'not_applicable' : 'acquisition',
            seedAward: value === 'recognition_only' ? null : 4,
          });
        }}
      />
      {draft.recognitionMode !== 'recognition_only' && safeRecognition ? (
        <CloudChoices
          label={text('phase')}
          options={labels(['acquisition', 'maintenance'])}
          selected={[draft.routinePhase ?? 'acquisition']}
          disabled={disabled || locked}
          testID="cloud-task-phase"
          onSelect={(value) => {
            if (value === 'acquisition' || value === 'maintenance')
              patch({ routinePhase: value, seedAward: value === 'maintenance' ? null : 4 });
          }}
        />
      ) : null}
      {seedBearing ? (
        <CloudChoices
          label={text('award')}
          options={[4, 6, 8, 12, 15].map((value) => ({
            value: String(value),
            label: text('awardCount', { count: value }),
          }))}
          selected={[String(draft.seedAward)]}
          disabled={disabled || locked}
          testID="cloud-task-award"
          onSelect={(value) => patch({ seedAward: Number(value) })}
        />
      ) : (
        <Text direction={direction} language={language}>
          {text('zeroAward')}
        </Text>
      )}
      <Text direction={direction} language={language} variant="caption">
        {text('fixedAward')}
      </Text>
      <CloudChoices
        label={text('privacy')}
        selected={[draft.visibilityScope ?? 'child_guardian']}
        disabled={disabled || locked}
        options={[
          { value: 'household', label: text('household') },
          { value: 'child_guardian', label: text('child_private') },
        ]}
        testID="cloud-task-privacy"
        onSelect={(value) =>
          patch({
            visibilityScope: value === 'household' ? 'household' : 'child_guardian',
            circleEligible: false,
          })
        }
      />
      {draft.categoryId === 'green_impact' && draft.visibilityScope === 'household' ? (
        <ChoiceChip
          direction={direction}
          language={language}
          label={text('circleEligible')}
          selected={draft.circleEligible}
          disabled={disabled || locked}
          testID="cloud-task-circle"
          onPress={() => patch({ circleEligible: !draft.circleEligible })}
        />
      ) : null}
      <CloudChoices
        label={text('recurrence')}
        selected={[draft.recurrence ?? 'once']}
        disabled={disabled || locked}
        options={labels(['once', 'recurrent'])}
        testID="cloud-task-recurrence"
        onSelect={(value) => patch({ recurrence: value === 'recurrent' ? 'recurrent' : 'once' })}
      />
      <Text brand direction={direction} language={language} variant="heading">
        {text('safety')}
      </Text>
      {(Object.keys(safety) as (keyof CloudTaskSafety)[]).map((field) => (
        <AccessTextField
          key={field}
          label={text(field)}
          value={Array.isArray(safety[field]) ? safety[field].join('\n') : (safety[field] ?? '')}
          direction={direction}
          language={language}
          editable={!disabled && !locked}
          multiline
          maxLength={1000}
          testID={`cloud-task-safety-${field}`}
          onChangeText={(value) =>
            patch({
              safety: {
                ...safety,
                [field]: Array.isArray(safety[field]) ? value.split(/\r?\n/u) : value,
              },
            })
          }
        />
      ))}
      <Text direction={direction} language={language} variant="caption">
        {text('privacyEligibility')}
      </Text>
      {(conflict || locked) && latestTask ? (
        <View style={coreStyles.notice} testID="cloud-task-version-conflict">
          <Text accessibilityRole="alert" direction={direction} language={language}>
            {text(locked ? 'assignedElsewhere' : 'versionConflict')}
          </Text>
          <Button
            brand
            variant="secondary"
            direction={direction}
            language={language}
            disabled={disabled}
            testID="cloud-task-review-latest"
            onPress={() => setReviewedVersion(latestTask.version)}
          >
            {text('reviewLatest')}
          </Button>
          {reviewedVersion === latestTask.version ? (
            <View style={coreStyles.group} testID="cloud-task-latest-version">
              <Text brand direction={direction} language={language} variant="heading">
                {latestTask.title}
              </Text>
              <Text direction={direction} language={language}>
                {snapshot.children.find((child) => child.id === latestTask.child_id)?.nickname}
              </Text>
              <Text direction={direction} language={language}>
                {latestTask.positive_action}
              </Text>
              <Text direction={direction} language={language}>
                {latestTask.why_it_matters}
              </Text>
              <Text direction={direction} language={language}>
                {latestTask.definition_of_done}
              </Text>
              {latestTask.steps.map((step, index) => (
                <Text key={index} direction={direction} language={language}>
                  {index + 1}. {step}
                </Text>
              ))}
              <Text direction={direction} language={language}>
                {text(latestTask.recognition_mode)} · {text(latestTask.routine_phase)} ·{' '}
                {text('awardCount', { count: latestTask.seed_award ?? 0 })}
              </Text>
              <Text direction={direction} language={language}>
                {text('privacy')}:{' '}
                {text(latestTask.visibility_scope === 'household' ? 'household' : 'child_private')}
              </Text>
              <Text direction={direction} language={language}>
                {text('permittedHelp')}: {latestTask.permitted_help}
              </Text>
              <Text direction={direction} language={language}>
                {text('supervisionText')}: {latestTask.supervision}
              </Text>
              {Object.entries(latestTask.safety).map(([field, value]) =>
                value && (!Array.isArray(value) || value.length) ? (
                  <Text key={field} direction={direction} language={language}>
                    {text(field)}: {Array.isArray(value) ? value.join(' · ') : value}
                  </Text>
                ) : null,
              )}
              <Text direction={direction} language={language}>
                {text('keepDraftExplanation')}
              </Text>
              <Button
                brand
                direction={direction}
                language={language}
                disabled={disabled || locked}
                testID="cloud-task-keep-draft"
                onPress={() => {
                  if (!pending.current && reviewedVersion === latestTask.version) {
                    setBaseVersion(latestTask.version);
                    setReviewedVersion(null);
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
          color="error"
          direction={direction}
          language={language}
          testID="cloud-task-editor-error"
        >
          {text(error)}
        </Text>
      ) : null}
      <Button
        brand
        direction={direction}
        language={language}
        busy={saving}
        disabled={disabled || locked || conflict}
        testID="cloud-task-save"
        onPress={() => void save()}
      >
        {text(saving ? 'saving' : 'saveDraft')}
      </Button>
      <Button
        brand
        direction={direction}
        language={language}
        variant="quiet"
        disabled={disabled}
        testID="cloud-task-cancel"
        onPress={() => {
          if (!pending.current) onClose();
        }}
      >
        {text('cancel')}
      </Button>
    </View>
  );
}

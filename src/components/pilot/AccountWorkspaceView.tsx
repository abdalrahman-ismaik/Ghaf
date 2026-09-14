import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessTextField, StatusBanner } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { colors, logicalRowDirection, spacing } from '@/design/tokens';
import type {
  AccountWorkspaceController,
  AccountWorkspaceState,
} from '@/features/pilot/workspaceController';
import type { WorkspaceCommand } from '@/models/accountWorkspace';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export interface AccountWorkspaceViewProps {
  readonly controller: AccountWorkspaceController;
  readonly state: AccountWorkspaceState;
}

interface Editor {
  readonly kind: 'family' | 'member' | 'task' | 'study';
  readonly id?: string;
  readonly primary: string;
  readonly secondary: string;
  readonly childId: string;
  readonly revision: number;
  readonly token: number;
}

const pageSize = 10;

export function AccountWorkspaceView({ controller, state }: AccountWorkspaceViewProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((current) => current.locale);
  const direction = usePrototypeStore((current) => current.direction);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [section, setSection] = useState<'family' | 'task' | 'study'>('family');
  const [taskPage, setTaskPage] = useState(0);
  const [studyPage, setStudyPage] = useState(0);
  const lifetime = useRef(0);
  const mounted = useRef(true);
  const data = state.data;
  const actionsDisabled = state.busy || state.conflict || editor !== null;
  const row = { flexDirection: logicalRowDirection(direction) } as const;
  const text = (key: string) => t(`pilot.workspace.${key}`);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      lifetime.current += 1;
    };
  }, []);

  const begin = (kind: Editor['kind'], id?: string) => {
    if (!data || actionsDisabled) return;
    const member = data.members.find((item) => item.id === id);
    const task = data.tasks.find((item) => item.id === id);
    const study = data.studyPlans.find((item) => item.id === id);
    setEditor({
      kind,
      id,
      primary:
        kind === 'family'
          ? data.familyName
          : kind === 'member'
            ? (member?.nickname ?? '')
            : kind === 'task'
              ? (task?.title ?? '')
              : (study?.subject ?? ''),
      secondary: study?.nextStep ?? '',
      childId: task?.childId ?? study?.childId ?? data.members[0]?.id ?? '',
      revision: data.revision,
      token: ++lifetime.current,
    });
  };
  const cancel = () => {
    if (controller.getSnapshot().busy) return;
    lifetime.current += 1;
    setEditor(null);
  };
  const updateDraft = (patch: Partial<Pick<Editor, 'primary' | 'secondary' | 'childId'>>) => {
    if (controller.getSnapshot().busy) return;
    const token = editor?.token;
    setEditor((current) =>
      current && current.token === token ? { ...current, ...patch } : current,
    );
  };
  const validEditor =
    editor !== null &&
    Array.from(editor.primary.trim()).length >= 1 &&
    Array.from(editor.primary.trim()).length <=
      (editor.kind === 'family' || editor.kind === 'member' ? 80 : 160) &&
    (editor.kind !== 'study' ||
      (Array.from(editor.secondary.trim()).length >= 1 &&
        Array.from(editor.secondary.trim()).length <= 300)) &&
    ((editor.kind !== 'task' && editor.kind !== 'study') || Boolean(editor.childId));
  const save = async () => {
    if (!editor || !validEditor || state.conflict) return;
    const editing = editor;
    let command: WorkspaceCommand;
    if (editing.kind === 'family') command = { type: 'rename_family', name: editing.primary };
    else if (editing.kind === 'member')
      command = editing.id
        ? { type: 'rename_member', id: editing.id, nickname: editing.primary }
        : { type: 'add_member', nickname: editing.primary };
    else if (editing.kind === 'task')
      command = editing.id
        ? { type: 'edit_task', id: editing.id, title: editing.primary }
        : { type: 'add_task', childId: editing.childId, title: editing.primary };
    else
      command = editing.id
        ? {
            type: 'edit_study_plan',
            id: editing.id,
            subject: editing.primary,
            nextStep: editing.secondary,
          }
        : {
            type: 'add_study_plan',
            childId: editing.childId,
            subject: editing.primary,
            nextStep: editing.secondary,
          };
    const saved = await controller.update(command, editing.revision);
    if (!saved || !mounted.current || lifetime.current !== editing.token) return;
    setEditor(null);
    const latest = controller.getSnapshot().data;
    if (!editing.id && editing.kind === 'task' && latest)
      setTaskPage(Math.floor((latest.tasks.length - 1) / pageSize));
    if (!editing.id && editing.kind === 'study' && latest)
      setStudyPage(Math.floor((latest.studyPlans.length - 1) / pageSize));
  };
  const reload = async () => {
    const attempt = lifetime.current;
    const loaded = await controller.reload();
    if (!loaded || !mounted.current || lifetime.current !== attempt) return;
    lifetime.current += 1;
    setEditor(null);
  };
  const renderEditor = (kind: Editor['kind'], id?: string) => {
    if (!editor || editor.kind !== kind || editor.id !== id) return null;
    const needsMember = !editor.id && (kind === 'task' || kind === 'study');
    const primaryLabel =
      kind === 'family'
        ? 'familyName'
        : kind === 'member'
          ? 'nickname'
          : kind === 'task'
            ? 'taskTitle'
            : 'subject';
    return (
      <View style={styles.editor} testID={`workspace-${kind}-editor`}>
        {needsMember ? (
          <>
            <Text brand variant="label">
              {text('chooseMember')}
            </Text>
            <View style={[styles.controls, row]}>
              {data?.members.map((member) => (
                <Button
                  key={member.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: member.id === editor.childId }}
                  brand
                  disabled={state.busy}
                  fullWidth={false}
                  onPress={() => updateDraft({ childId: member.id })}
                  testID={`workspace-choose-${member.id}`}
                  variant={member.id === editor.childId ? 'primary' : 'secondary'}
                >
                  {member.nickname}
                </Button>
              ))}
            </View>
          </>
        ) : null}
        <AccessTextField
          autoCapitalize="sentences"
          autoComplete="off"
          direction={direction}
          editable={!state.busy}
          helperText={text(kind === 'family' || kind === 'member' ? 'nameHint' : 'titleHint')}
          label={text(primaryLabel)}
          language={locale}
          maxLength={kind === 'family' || kind === 'member' ? 160 : 320}
          onChangeText={(primary) => updateDraft({ primary })}
          onSubmitEditing={kind === 'study' ? undefined : () => void save()}
          returnKeyType={kind === 'study' ? 'next' : 'done'}
          testID="workspace-editor-primary"
          value={editor.primary}
        />
        {kind === 'study' ? (
          <AccessTextField
            autoCapitalize="sentences"
            autoComplete="off"
            direction={direction}
            editable={!state.busy}
            helperText={text('stepHint')}
            label={text('nextStep')}
            language={locale}
            maxLength={600}
            multiline
            onChangeText={(secondary) => updateDraft({ secondary })}
            testID="workspace-editor-secondary"
            value={editor.secondary}
          />
        ) : null}
        <Text brand color="onSurfaceVariant" variant="caption">
          {text('unsaved')}
        </Text>
        <Button
          brand
          busy={state.busy && !state.loading}
          busyLabel={t('pilot.working')}
          disabled={state.busy || state.conflict || !validEditor}
          onPress={() => void save()}
          testID="workspace-editor-save"
        >
          {text('save')}
        </Button>
        <Button
          brand
          disabled={state.busy}
          onPress={cancel}
          testID="workspace-editor-cancel"
          variant="quiet"
        >
          {text('cancel')}
        </Button>
      </View>
    );
  };
  const memberName = (childId: string) =>
    data?.members.find((member) => member.id === childId)?.nickname ?? text('member');
  const renderPager = (
    kind: 'task' | 'study',
    total: number,
    requestedPage: number,
    setPage: (page: number) => void,
  ) => {
    const pages = Math.ceil(total / pageSize);
    if (pages <= 1) return null;
    const page = Math.min(requestedPage, pages - 1);
    return (
      <View style={styles.pager} testID={`workspace-${kind}-pager`}>
        <Text brand color="onSurfaceVariant" variant="caption">
          {t('pilot.workspace.page', { current: page + 1, total: pages })}
        </Text>
        <View style={[styles.controls, row]}>
          <Button
            brand
            disabled={page === 0 || editor !== null}
            fullWidth={false}
            onPress={() => setPage(page - 1)}
            testID={`workspace-${kind}-previous`}
            variant="secondary"
          >
            {text('previous')}
          </Button>
          <Button
            brand
            disabled={page === pages - 1 || editor !== null}
            fullWidth={false}
            onPress={() => setPage(page + 1)}
            testID={`workspace-${kind}-next`}
            variant="secondary"
          >
            {text('next')}
          </Button>
        </View>
      </View>
    );
  };
  const currentTaskPage = Math.min(
    taskPage,
    Math.max(0, Math.ceil((data?.tasks.length ?? 0) / pageSize) - 1),
  );
  const currentStudyPage = Math.min(
    studyPage,
    Math.max(0, Math.ceil((data?.studyPlans.length ?? 0) / pageSize) - 1),
  );
  const errorMessage =
    state.error === 'invalid_profile'
      ? text('invalid')
      : state.error === 'profile_conflict'
        ? text('conflict')
        : state.error === 'profile_unavailable'
          ? text('unavailable')
          : t(`pilot.errors.${state.error}`);

  return (
    <View style={styles.root} testID="account-workspace">
      <Text accessibilityRole="header" brand color="deepForest" variant="title">
        {text('title')}
      </Text>
      <Text brand color="onSurfaceVariant">
        {text('body')}
      </Text>
      <Text brand color="onSurfaceVariant" variant="caption">
        {text('separate')}
      </Text>
      {state.error ? (
        <StatusBanner direction={direction} language={locale} message={errorMessage} tone="error" />
      ) : null}
      {state.notice === 'saved' ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={text('saved')}
          tone="success"
        />
      ) : null}
      {state.loading ? (
        <ActivityIndicator
          accessibilityLabel={text('loading')}
          color={colors.ghafEmerald}
          testID="workspace-loading"
        />
      ) : null}
      <Button
        brand
        disabled={state.busy}
        onPress={() => void reload()}
        testID="workspace-reload"
        variant="secondary"
      >
        {text(editor ? 'discardReload' : 'reload')}
      </Button>
      {data ? (
        <>
          <View style={[styles.controls, row]}>
            {(['family', 'task', 'study'] as const).map((item) => (
              <Button
                key={item}
                accessibilityState={{ expanded: section === item }}
                brand
                disabled={editor !== null}
                fullWidth={false}
                onPress={() => setSection(item)}
                testID={`workspace-show-${item}`}
                variant={section === item ? 'primary' : 'secondary'}
              >
                {text(item === 'task' ? 'tasks' : item)}
              </Button>
            ))}
          </View>
          {section === 'family' ? (
            <View style={styles.section} testID="workspace-family-section">
              <Text accessibilityRole="header" brand color="deepForest" variant="title">
                {text('family')}
              </Text>
              <Text brand testID="workspace-family-name">
                {data.familyName || text('familyEmpty')}
              </Text>
              <Button
                brand
                disabled={actionsDisabled}
                onPress={() => begin('family')}
                testID="workspace-rename-family"
                variant="secondary"
              >
                {text(data.familyName ? 'editFamily' : 'nameFamily')}
              </Button>
              {renderEditor('family')}
              {data.members.length === 0 ? (
                <Text brand color="onSurfaceVariant" testID="workspace-members-empty">
                  {text('membersEmpty')}
                </Text>
              ) : null}
              {data.members.map((member) => (
                <View
                  key={member.id}
                  style={styles.record}
                  testID={`workspace-member-${member.id}`}
                >
                  <Text brand>{member.nickname}</Text>
                  <Button
                    accessibilityLabel={t('pilot.workspace.editNamed', { name: member.nickname })}
                    brand
                    disabled={actionsDisabled}
                    onPress={() => begin('member', member.id)}
                    testID={`workspace-edit-member-${member.id}`}
                    variant="quiet"
                  >
                    {text('edit')}
                  </Button>
                  {renderEditor('member', member.id)}
                </View>
              ))}
              <Button
                brand
                disabled={actionsDisabled || data.members.length >= 20}
                onPress={() => begin('member')}
                testID="workspace-add-member"
                variant="secondary"
              >
                {text('addMember')}
              </Button>
              {data.members.length >= 20 ? (
                <Text brand color="onSurfaceVariant" variant="caption">
                  {text('memberLimit')}
                </Text>
              ) : null}
              {renderEditor('member')}
            </View>
          ) : null}

          {section === 'task' ? (
            <View style={styles.section} testID="workspace-tasks-section">
              <Text accessibilityRole="header" brand color="deepForest" variant="title">
                {text('tasks')}
              </Text>
              {data.tasks.length === 0 ? (
                <Text brand color="onSurfaceVariant" testID="workspace-tasks-empty">
                  {text('tasksEmpty')}
                </Text>
              ) : null}
              {data.tasks
                .slice(currentTaskPage * pageSize, (currentTaskPage + 1) * pageSize)
                .map((task) => (
                  <View key={task.id} style={styles.record} testID={`workspace-task-${task.id}`}>
                    <Text brand>{task.title}</Text>
                    <Text brand color="onSurfaceVariant" variant="caption">
                      {memberName(task.childId)}
                    </Text>
                    <Text brand testID={`workspace-task-status-${task.id}`} variant="caption">
                      {text(task.completed ? 'completed' : 'open')}
                    </Text>
                    <Button
                      accessibilityLabel={t('pilot.workspace.editNamed', { name: task.title })}
                      brand
                      disabled={actionsDisabled}
                      onPress={() => begin('task', task.id)}
                      testID={`workspace-edit-task-${task.id}`}
                      variant="secondary"
                    >
                      {text('edit')}
                    </Button>
                    <Button
                      accessibilityLabel={t(
                        task.completed
                          ? 'pilot.workspace.reopenNamed'
                          : 'pilot.workspace.completeNamed',
                        { name: task.title },
                      )}
                      brand
                      disabled={actionsDisabled}
                      onPress={() =>
                        void controller.update(
                          { type: 'complete_task', id: task.id, completed: !task.completed },
                          data.revision,
                        )
                      }
                      testID={`workspace-complete-task-${task.id}`}
                      variant="quiet"
                    >
                      {text(task.completed ? 'reopen' : 'complete')}
                    </Button>
                    {renderEditor('task', task.id)}
                  </View>
                ))}
              {renderPager('task', data.tasks.length, currentTaskPage, setTaskPage)}
              {!data.members.length ? (
                <Text brand color="onSurfaceVariant" variant="caption">
                  {text('memberFirst')}
                </Text>
              ) : null}
              <Button
                brand
                disabled={actionsDisabled || !data.members.length || data.tasks.length >= 200}
                onPress={() => begin('task')}
                testID="workspace-add-task"
                variant="secondary"
              >
                {text('addTask')}
              </Button>
              {data.tasks.length >= 200 ? (
                <Text brand color="onSurfaceVariant" variant="caption">
                  {text('recordLimit')}
                </Text>
              ) : null}
              {renderEditor('task')}
            </View>
          ) : null}

          {section === 'study' ? (
            <View style={styles.section} testID="workspace-study-section">
              <Text accessibilityRole="header" brand color="deepForest" variant="title">
                {text('study')}
              </Text>
              {data.studyPlans.length === 0 ? (
                <Text brand color="onSurfaceVariant" testID="workspace-study-empty">
                  {text('studyEmpty')}
                </Text>
              ) : null}
              {data.studyPlans
                .slice(currentStudyPage * pageSize, (currentStudyPage + 1) * pageSize)
                .map((plan) => (
                  <View key={plan.id} style={styles.record} testID={`workspace-study-${plan.id}`}>
                    <Text brand>{plan.subject}</Text>
                    <Text brand color="onSurfaceVariant" variant="caption">
                      {memberName(plan.childId)}
                    </Text>
                    <Text brand>{plan.nextStep}</Text>
                    <Text brand testID={`workspace-study-status-${plan.id}`} variant="caption">
                      {text(plan.completed ? 'completed' : 'open')}
                    </Text>
                    <Button
                      accessibilityLabel={t('pilot.workspace.editNamed', { name: plan.subject })}
                      brand
                      disabled={actionsDisabled}
                      onPress={() => begin('study', plan.id)}
                      testID={`workspace-edit-study-${plan.id}`}
                      variant="secondary"
                    >
                      {text('edit')}
                    </Button>
                    <Button
                      accessibilityLabel={t(
                        plan.completed
                          ? 'pilot.workspace.reopenNamed'
                          : 'pilot.workspace.completeNamed',
                        { name: plan.subject },
                      )}
                      brand
                      disabled={actionsDisabled}
                      onPress={() =>
                        void controller.update(
                          { type: 'complete_study_plan', id: plan.id, completed: !plan.completed },
                          data.revision,
                        )
                      }
                      testID={`workspace-complete-study-${plan.id}`}
                      variant="quiet"
                    >
                      {text(plan.completed ? 'reopen' : 'complete')}
                    </Button>
                    {renderEditor('study', plan.id)}
                  </View>
                ))}
              {renderPager('study', data.studyPlans.length, currentStudyPage, setStudyPage)}
              {!data.members.length ? (
                <Text brand color="onSurfaceVariant" variant="caption">
                  {text('memberFirst')}
                </Text>
              ) : null}
              <Button
                brand
                disabled={actionsDisabled || !data.members.length || data.studyPlans.length >= 200}
                onPress={() => begin('study')}
                testID="workspace-add-study"
                variant="secondary"
              >
                {text('addStudy')}
              </Button>
              {data.studyPlans.length >= 200 ? (
                <Text brand color="onSurfaceVariant" variant="caption">
                  {text('recordLimit')}
                </Text>
              ) : null}
              {renderEditor('study')}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md, width: '100%' },
  section: { gap: spacing.sm, paddingVertical: spacing.md },
  record: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  controls: { flexWrap: 'wrap', gap: spacing.sm },
  editor: { gap: spacing.sm, paddingVertical: spacing.sm },
  pager: { gap: spacing.xs, paddingVertical: spacing.sm },
});

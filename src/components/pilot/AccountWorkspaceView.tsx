import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AccessTextField, StatusBanner } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { botanical, colors, logicalRowDirection, spacing } from '@/design/tokens';
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
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [reloadedDraft, setReloadedDraft] = useState(false);
  const lifetime = useRef(0);
  const mounted = useRef(true);
  const requestPending = useRef(false);
  const data = state.data;
  const actionsDisabled = state.busy || state.conflict || editor !== null;
  const row = { flexDirection: logicalRowDirection(direction) } as const;
  const text = (key: string) => t(`pilot.workspace.${key}`);
  const editorSection = editor?.kind === 'member' ? 'family' : editor?.kind;
  const accessDenied = [
    'access_unavailable',
    'account_unavailable',
    'session_expired',
    'storage_unavailable',
  ].includes(state.error ?? '');

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
    setReloadedDraft(false);
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
      childId:
        task?.childId ??
        study?.childId ??
        (data.members.some((item) => item.id === selectedMemberId) ? selectedMemberId : ''),
      revision: data.revision,
      token: ++lifetime.current,
    });
  };
  const cancel = () => {
    if (requestPending.current || controller.getSnapshot().busy) return;
    lifetime.current += 1;
    setEditor(null);
  };
  const updateDraft = (patch: Partial<Pick<Editor, 'primary' | 'secondary' | 'childId'>>) => {
    if (requestPending.current || controller.getSnapshot().busy) return;
    if (patch.childId !== undefined) setSelectedMemberId(patch.childId);
    setReloadedDraft(false);
    const token = editor?.token;
    setEditor((current) =>
      current && current.token === token ? { ...current, ...patch } : current,
    );
  };
  const validEditor =
    data !== null &&
    editor !== null &&
    Array.from(editor.primary.trim()).length >= 1 &&
    Array.from(editor.primary.trim()).length <=
      (editor.kind === 'family' || editor.kind === 'member' ? 80 : 160) &&
    (editor.kind !== 'study' ||
      (Array.from(editor.secondary.trim()).length >= 1 &&
        Array.from(editor.secondary.trim()).length <= 300)) &&
    ((editor.kind !== 'task' && editor.kind !== 'study') ||
      data.members.some((member) => member.id === editor.childId));
  const write = async (command: WorkspaceCommand, revision: number) => {
    if (requestPending.current || controller.getSnapshot().busy) return false;
    requestPending.current = true;
    try {
      return await controller.update(command, revision);
    } finally {
      requestPending.current = false;
    }
  };
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
    const saved = await write(command, editing.revision);
    if (!saved || !mounted.current || lifetime.current !== editing.token) return;
    setEditor(null);
    const latest = controller.getSnapshot().data;
    if (!editing.id && editing.kind === 'task' && latest)
      setTaskPage(Math.floor((latest.tasks.length - 1) / pageSize));
    if (!editing.id && editing.kind === 'study' && latest)
      setStudyPage(Math.floor((latest.studyPlans.length - 1) / pageSize));
  };
  const reload = async () => {
    if (requestPending.current || controller.getSnapshot().busy) return;
    const attempt = lifetime.current;
    requestPending.current = true;
    try {
      const loaded = await controller.reload();
      const latest = controller.getSnapshot().data;
      if (!loaded || !latest || !mounted.current || lifetime.current !== attempt) return;
      setEditor((current) => (current ? { ...current, revision: latest.revision } : current));
      setReloadedDraft(editor !== null);
    } finally {
      requestPending.current = false;
    }
  };
  const renderEditor = () => {
    if (!editor || editorSection !== section || accessDenied) return null;
    const kind = editor.kind;
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
        <Text accessibilityRole="header" brand direction={direction} variant="heading">
          {text(primaryLabel)}
        </Text>
        {!data ? (
          <Text brand color="onSurfaceVariant" direction={direction}>
            {text('draftWaitingForData')}
          </Text>
        ) : null}
        {reloadedDraft ? (
          <Text
            accessibilityLiveRegion="polite"
            brand
            color="onSurfaceVariant"
            direction={direction}
          >
            {text('reloadedDraft')}
          </Text>
        ) : null}
        {needsMember ? (
          <>
            <Text brand variant="label">
              {text('chooseMember')}
            </Text>
            <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
              {data?.members.some((member) => member.id === editor.childId)
                ? t('pilot.workspace.assignedMember', {
                    name: data.members.find((member) => member.id === editor.childId)?.nickname,
                  })
                : text('chooseMemberPrompt')}
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
      <Text
        accessibilityRole="header"
        brand
        color="deepForest"
        direction={direction}
        variant="screenTitle"
      >
        {data?.familyName || text('title')}
      </Text>
      <Text brand color="onSurfaceVariant">
        {text('body')}
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
        fullWidth={editor !== null || state.error !== null}
        onPress={() => void reload()}
        testID="workspace-reload"
        variant={state.error || editor ? 'secondary' : 'quiet'}
      >
        {text(editor ? 'reloadKeepDraft' : 'reload')}
      </Button>
      <View
        accessibilityRole="tablist"
        style={[styles.navigation, row]}
        testID="workspace-navigation"
      >
        {(['family', 'task', 'study'] as const).map((item) => (
          <Button
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: section === item }}
            brand
            disabled={false}
            fullWidth={false}
            onPress={() => setSection(item)}
            style={styles.navigationItem}
            testID={`workspace-show-${item}`}
            variant={section === item ? 'primary' : 'secondary'}
          >
            {text(item === 'task' ? 'tasks' : item)}
          </Button>
        ))}
      </View>
      {editor && editorSection !== section && !accessDenied ? (
        <View style={styles.draftNotice}>
          <Text brand color="onSurfaceVariant" direction={direction}>
            {text('draftAway')}
          </Text>
          <Button
            brand
            onPress={() => setSection(editor.kind === 'member' ? 'family' : editor.kind)}
            testID="workspace-resume-draft"
            variant="secondary"
          >
            {text('resumeDraft')}
          </Button>
        </View>
      ) : null}
      {renderEditor()}
      {data ? (
        <>
          {section === 'family' ? (
            <View style={styles.section} testID="workspace-family-section">
              <Text accessibilityRole="header" brand color="deepForest" variant="title">
                {text('family')}
              </Text>
              <Text brand testID="workspace-family-name">
                {data.familyName || text('familyEmpty')}
              </Text>
              {!data.familyName || !data.members.length || !data.tasks.length ? (
                <View style={styles.setup} testID="workspace-setup-guidance">
                  <Text brand direction={direction}>
                    {text(
                      !data.familyName
                        ? 'setupName'
                        : !data.members.length
                          ? 'setupMember'
                          : 'setupTask',
                    )}
                  </Text>
                  {data.familyName && data.members.length > 0 && data.tasks.length === 0 ? (
                    <Button brand onPress={() => setSection('task')} testID="workspace-setup-tasks">
                      {text('setupTasksButton')}
                    </Button>
                  ) : null}
                </View>
              ) : null}
              <Button
                brand
                disabled={actionsDisabled}
                onPress={() => begin('family')}
                testID="workspace-rename-family"
                variant={data.familyName ? 'secondary' : 'primary'}
              >
                {text(data.familyName ? 'editFamily' : 'nameFamily')}
              </Button>
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
                </View>
              ))}
              <Button
                brand
                disabled={actionsDisabled || !data.familyName || data.members.length >= 20}
                onPress={() => begin('member')}
                testID="workspace-add-member"
                variant={data.members.length ? 'secondary' : 'primary'}
              >
                {text('addMember')}
              </Button>
              {!data.familyName ? (
                <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                  {text('familyFirst')}
                </Text>
              ) : null}
              {data.members.length >= 20 ? (
                <Text brand color="onSurfaceVariant" variant="caption">
                  {text('memberLimit')}
                </Text>
              ) : null}
            </View>
          ) : null}

          {section === 'task' ? (
            <View style={styles.section} testID="workspace-tasks-section">
              <Text accessibilityRole="header" brand color="deepForest" variant="title">
                {text('tasks')}
              </Text>
              <Text brand color="onSurfaceVariant" direction={direction}>
                {text('tasksBody')}
              </Text>
              <Button
                brand
                disabled={actionsDisabled || !data.members.length || data.tasks.length >= 200}
                onPress={() => begin('task')}
                testID="workspace-add-task"
              >
                {text('addTask')}
              </Button>
              {!data.members.length ? (
                <Button brand onPress={() => setSection('family')} variant="secondary">
                  {text('memberFirst')}
                </Button>
              ) : null}
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
                    <View style={[styles.controls, row]}>
                      <Button
                        accessibilityLabel={t('pilot.workspace.editNamed', { name: task.title })}
                        brand
                        disabled={actionsDisabled}
                        fullWidth={false}
                        onPress={() => begin('task', task.id)}
                        style={styles.recordAction}
                        testID={`workspace-edit-task-${task.id}`}
                        variant="quiet"
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
                        fullWidth={false}
                        onPress={() =>
                          void write(
                            { type: 'complete_task', id: task.id, completed: !task.completed },
                            data.revision,
                          )
                        }
                        testID={`workspace-complete-task-${task.id}`}
                        style={styles.recordAction}
                        variant={task.completed ? 'secondary' : 'primary'}
                      >
                        {text(task.completed ? 'reopen' : 'complete')}
                      </Button>
                    </View>
                  </View>
                ))}
              {renderPager('task', data.tasks.length, currentTaskPage, setTaskPage)}
              {data.tasks.length >= 200 ? (
                <Text brand color="onSurfaceVariant" variant="caption">
                  {text('recordLimit')}
                </Text>
              ) : null}
              <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                {text('completionNote')}
              </Text>
            </View>
          ) : null}

          {section === 'study' ? (
            <View style={styles.section} testID="workspace-study-section">
              <Text accessibilityRole="header" brand color="deepForest" variant="title">
                {text('study')}
              </Text>
              <Text brand color="onSurfaceVariant" direction={direction}>
                {text('studyBody')}
              </Text>
              <Button
                brand
                disabled={actionsDisabled || !data.members.length || data.studyPlans.length >= 200}
                onPress={() => begin('study')}
                testID="workspace-add-study"
              >
                {text('addStudy')}
              </Button>
              {!data.members.length ? (
                <Button brand onPress={() => setSection('family')} variant="secondary">
                  {text('memberFirst')}
                </Button>
              ) : null}
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
                    <View style={[styles.controls, row]}>
                      <Button
                        accessibilityLabel={t('pilot.workspace.editNamed', { name: plan.subject })}
                        brand
                        disabled={actionsDisabled}
                        fullWidth={false}
                        onPress={() => begin('study', plan.id)}
                        style={styles.recordAction}
                        testID={`workspace-edit-study-${plan.id}`}
                        variant="quiet"
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
                        fullWidth={false}
                        onPress={() =>
                          void write(
                            {
                              type: 'complete_study_plan',
                              id: plan.id,
                              completed: !plan.completed,
                            },
                            data.revision,
                          )
                        }
                        testID={`workspace-complete-study-${plan.id}`}
                        style={styles.recordAction}
                        variant={plan.completed ? 'secondary' : 'primary'}
                      >
                        {text(plan.completed ? 'reopen' : 'complete')}
                      </Button>
                    </View>
                  </View>
                ))}
              {renderPager('study', data.studyPlans.length, currentStudyPage, setStudyPage)}
              {data.studyPlans.length >= 200 ? (
                <Text brand color="onSurfaceVariant" variant="caption">
                  {text('recordLimit')}
                </Text>
              ) : null}
              <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
                {text('completionNote')}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
      <Text brand color="onSurfaceVariant" direction={direction} variant="caption">
        {text('separate')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md, width: '100%', minWidth: 0 },
  section: { gap: spacing.md, paddingVertical: spacing.xs },
  record: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  controls: { flexWrap: 'wrap', gap: spacing.sm },
  recordAction: { flexGrow: 1, flexBasis: 0, minWidth: 96 },
  navigation: { gap: spacing.xs, flexWrap: 'wrap' },
  navigationItem: { flexGrow: 1, flexBasis: 0, minWidth: 72, paddingHorizontal: spacing.xs },
  setup: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: botanical.radius.control,
    backgroundColor: botanical.colors.sage,
  },
  draftNotice: { gap: spacing.sm },
  editor: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: botanical.colors.line,
  },
  pager: { gap: spacing.xs, paddingVertical: spacing.sm },
});

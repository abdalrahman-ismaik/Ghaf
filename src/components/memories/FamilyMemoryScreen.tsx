import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { R002aFlowHeader, R002aScreen } from '@/components/r002a';
import { entryMode } from '@/config/demoEntry';
import { colors, spacing } from '@/design/tokens';
import { memoryFromRecognition } from '@/features/family-memory';
import { localize } from '@/i18n';
import { pilotSampleEnabled } from '@/services';
import {
  selectCanEnterChildExperience,
  selectHasActiveParentExperience,
  usePrototypeStore,
} from '@/state/usePrototypeStore';

export function FamilyMemoryScreen() {
  const role = usePrototypeStore((state) => state.role);
  const parent = usePrototypeStore(selectHasActiveParentExperience);
  const child = usePrototypeStore(selectCanEnterChildExperience);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const family = usePrototypeStore((state) => state.localFamily.record);
  const authorized = role === 'parent' ? parent : child;
  if (!authorized) return <Redirect href="/" />;
  return (
    <FamilyMemoryContent key={`${role}:${activeChildId}:${family?.studyInstanceId ?? 'unbound'}`} />
  );
}

function FamilyMemoryContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const role = usePrototypeStore((state) => state.role);
  const activeChildId = usePrototypeStore((state) => state.activeChildId);
  const family = usePrototypeStore((state) => state.localFamily.record);
  usePrototypeStore((state) => state.memoryRevision);
  const journey = usePrototypeStore((state) => state.journey);
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const loaded = usePrototypeStore.getState().getFamilyMemories();
  const [, setReadRevision] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const refresh = () => setReadRevision((revision) => revision + 1);
  const candidate = memoryFromRecognition(usePrototypeStore.getState(), {
    familyKey: `memory:${family?.studyInstanceId ?? 'preview'}`,
    runId: usePrototypeStore.getState().memoryRunId ?? 'preview',
    savedAt: new Date().toISOString(),
  });
  const save = () => {
    const result = usePrototypeStore.getState().saveFamilyMemory();
    setNotice(
      t(
        result.ok
          ? 'memories.saved'
          : result.error.code === 'deleted'
            ? 'memories.previouslyDeleted'
            : 'memories.unavailable',
      ),
    );
    refresh();
  };
  const remove = (id: string) => {
    const result = usePrototypeStore.getState().removeFamilyMemory(id);
    setNotice(t(result.ok ? 'memories.deleted' : 'memories.unavailable'));
    if (result.ok) setPendingDelete(null);
    refresh();
  };
  const visible = loaded?.ok
    ? loaded.data.filter(
        (memory) =>
          memory.familyKey === `memory:${family?.studyInstanceId}` &&
          (role === 'parent' || memory.childId === activeChildId),
      )
    : [];
  return (
    <R002aScreen
      testID="family-memories-screen"
      header={
        <R002aFlowHeader
          direction={direction}
          title={t('memories.title')}
          backLabel={t('common.back')}
          onBack={() => router.replace('/garden')}
        />
      }
    >
      <Text brand direction={direction}>
        {t('memories.body')}
      </Text>
      <Text brand direction={direction} color="onSurfaceVariant">
        {t(entryMode === 'demo' || pilotSampleEnabled ? 'memories.session' : 'memories.local')}
      </Text>
      {role === 'child' ? (
        <Text brand direction={direction}>
          {t('memories.childScope')}
        </Text>
      ) : null}
      {role === 'parent' && journey?.lifecycle === 'recognized' && candidate.ok ? (
        <Button brand direction={direction} onPress={save} testID="memory-save">
          {t('memories.save')}
        </Button>
      ) : role === 'parent' ? (
        <Text brand direction={direction}>
          {t('memories.ineligible')}
        </Text>
      ) : null}
      {notice ? (
        <Text brand direction={direction} accessibilityLiveRegion="polite" testID="memory-notice">
          {notice}
        </Text>
      ) : null}
      {loaded && !loaded.ok ? (
        <View style={styles.stack}>
          <Text brand direction={direction} accessibilityLiveRegion="assertive">
            {t('memories.unavailable')}
          </Text>
          <Button brand direction={direction} onPress={refresh}>
            {t('memories.retry')}
          </Button>
        </View>
      ) : null}
      {loaded?.ok && visible.length === 0 ? (
        <Text brand direction={direction} testID="memory-empty">
          {t('memories.empty')}
        </Text>
      ) : null}
      {visible.map((memory) => (
        <View key={memory.id} style={styles.memory} testID="memory-leaf">
          <GhafIcon color={colors.ghafEmerald} name="leaf" size={32} />
          <Text brand direction={direction} variant="heading">
            {localize(memory.title, locale)}
          </Text>
          <Text brand direction={direction}>
            {family?.children.find((profile) => profile.id === memory.childId)?.nickname}
          </Text>
          <Text brand direction={direction}>
            {t('memories.confirmed', {
              date: new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }).format(new Date(memory.confirmedAt)),
            })}
          </Text>
          <Text brand direction={direction} variant="caption">
            {t('memories.synthetic')}
          </Text>
          {role === 'parent' ? (
            pendingDelete === memory.id ? (
              <View style={styles.stack}>
                <Text brand direction={direction}>
                  {t('memories.confirmRemove')}
                </Text>
                <Button
                  brand
                  direction={direction}
                  onPress={() => remove(memory.id)}
                  testID="memory-delete-confirm"
                >
                  {t('memories.confirm')}
                </Button>
                <Button
                  brand
                  direction={direction}
                  variant="secondary"
                  onPress={() => setPendingDelete(null)}
                >
                  {t('memories.cancel')}
                </Button>
              </View>
            ) : (
              <Button
                brand
                direction={direction}
                variant="secondary"
                onPress={() => setPendingDelete(memory.id)}
                testID="memory-delete"
              >
                {t('memories.remove')}
              </Button>
            )
          ) : null}
        </View>
      ))}
    </R002aScreen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  memory: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.leafMist,
  },
});

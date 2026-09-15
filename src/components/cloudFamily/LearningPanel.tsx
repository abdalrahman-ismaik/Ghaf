import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ChoiceChip, StatusBanner } from '@/components/access';
import { Button, Text } from '@/components/primitives';
import { logicalRowDirection } from '@/design/tokens';
import type { CloudCommand } from '@/models/normalizedCloudFamily';
import { usePrototypeStore } from '@/state/usePrototypeStore';

import {
  CloudGrowthChildPicker,
  cloudGrowthStyles,
  visibleCloudChildren,
  type CloudGrowthPanelProps,
} from './GrowthPanel';

const contentKeys: Readonly<Record<string, { title: string; body: string }>> = {
  story_frame_1: { title: 'story.frame1.title', body: 'story.frame1.body' },
  story_frame_2: { title: 'story.frame2.title', body: 'story.frame2.body' },
  accessible_section_1: { title: 'accessible.section1.heading', body: 'accessible.section1.body' },
  accessible_section_2: { title: 'accessible.section2.heading', body: 'accessible.section2.body' },
};
const checkKeys: Readonly<Record<string, string>> = {
  habitat_support_and_care: 'check.option.habitatSupportAndCare',
  visit_or_task_reward: 'check.option.visitOrTaskReward',
};

export function LearningPanel({ snapshot, busy, command }: CloudGrowthPanelProps) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [route, setRoute] = useState<'story' | 'accessible'>('story');
  const [feedback, setFeedback] = useState<'failed' | 'retry' | null>(null);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const text = (key: string, values?: Record<string, string | number>) =>
    t(`normalizedCloudFamily.learning.${key}`, values);
  const lessonText = (key: string) => t(`learning.mangroveRoots.${key}`);
  const children = visibleCloudChildren(snapshot);
  const child = children.find((item) => item.id === selectedChildId) ?? children[0];
  const packages = snapshot.extras.learning.packages;
  const learning = packages.find((item) => item.id === selectedPackageId) ?? packages[0];
  const progress = snapshot.extras.learning.progress.find(
    (entry) =>
      entry.childId === child?.id && entry.learningId === learning?.id && entry.route === route,
  );
  const completed = snapshot.extras.learning.completions.some(
    (entry) => entry.childId === child?.id && entry.learningId === learning?.id,
  );
  const unlocked = !!child && !!learning?.unlockedChildIds.includes(child.id);
  const supported = learning?.available && learning.id === 'learning.mangrove_roots.v1';
  const disabled = busy || saving;
  const mayAct = snapshot.actor.role === 'child' && unlocked && supported && !completed;
  const steps = learning?.steps[route] ?? [];
  const nextStep = steps.find((id) => !progress?.completedStepIds.includes(id));
  const send = async (next: CloudCommand) => {
    if (disabled || pending.current || !mayAct) return;
    pending.current = true;
    setSaving(true);
    setFeedback(null);
    try {
      const result = await command(next);
      if (!result) setFeedback('failed');
      else if (next.type === 'learning.check') {
        const saved = result.snapshot.extras.learning.progress.find(
          (entry) =>
            entry.childId === child?.id &&
            entry.learningId === next.learningId &&
            entry.route === next.route,
        );
        if (!saved?.checkSatisfied) setFeedback('retry');
      }
    } catch {
      setFeedback('failed');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  return (
    <View style={cloudGrowthStyles.panel} testID="cloud-learning-panel">
      <Text
        brand
        direction={direction}
        language={locale}
        variant="screenTitle"
        accessibilityRole="header"
      >
        {text('title')}
      </Text>
      <Text brand direction={direction} language={locale}>
        {text('body')}
      </Text>
      {snapshot.actor.role === 'parent' && child ? (
        <>
          <CloudGrowthChildPicker
            profiles={children}
            selectedId={child.id}
            onSelect={setSelectedChildId}
            disabled={disabled}
            label={text('chooseChild')}
          />
          <Text brand direction={direction} language={locale} color="onSurfaceVariant">
            {text('parentView')}
          </Text>
        </>
      ) : null}
      {!child || !learning ? (
        <Text brand direction={direction} language={locale}>
          {text('empty')}
        </Text>
      ) : (
        <>
          <View style={[cloudGrowthStyles.wrap, { flexDirection: logicalRowDirection(direction) }]}>
            {packages.map((item) => (
              <ChoiceChip
                key={item.id}
                direction={direction}
                language={locale}
                disabled={disabled}
                selected={learning.id === item.id}
                label={locale === 'ar' ? item.labelAr : item.labelEn}
                onPress={() => {
                  setSelectedPackageId(item.id);
                  setFeedback(null);
                }}
                testID={`cloud-learning-package-${item.id}`}
              />
            ))}
          </View>
          <Text brand direction={direction} language={locale} variant="heading">
            {locale === 'ar' ? learning.labelAr : learning.labelEn}
          </Text>
          {completed ? (
            <StatusBanner
              direction={direction}
              language={locale}
              message={text('completed')}
              tone="success"
            />
          ) : null}
          {!supported ? (
            <Text brand direction={direction} language={locale}>
              {text('unavailable')}
            </Text>
          ) : !unlocked ? (
            <Text brand direction={direction} language={locale} testID="cloud-learning-locked">
              {text('locked', { count: learning.unlockThreshold })}
            </Text>
          ) : (
            <>
              <Text brand direction={direction} language={locale}>
                {lessonText('objective')}
              </Text>
              <View
                style={[cloudGrowthStyles.wrap, { flexDirection: logicalRowDirection(direction) }]}
              >
                {(['story', 'accessible'] as const).map((option) => (
                  <ChoiceChip
                    key={option}
                    direction={direction}
                    language={locale}
                    disabled={disabled}
                    label={text(option)}
                    selected={route === option}
                    onPress={() => {
                      setRoute(option);
                      setFeedback(null);
                    }}
                    testID={`cloud-learning-route-${option}`}
                  />
                ))}
              </View>
              <Text brand direction={direction} language={locale}>
                {text('steps', {
                  completed: progress?.completedStepIds.length ?? 0,
                  total: steps.length,
                })}
              </Text>
              {!progress && mayAct ? (
                <Button
                  brand
                  direction={direction}
                  language={locale}
                  disabled={disabled}
                  onPress={() =>
                    void send({ type: 'learning.start', learningId: learning.id, route })
                  }
                  testID="cloud-learning-start"
                >
                  {text('start')}
                </Button>
              ) : null}
              {steps.map((stepId) => {
                const content = contentKeys[stepId];
                if (!content) return null;
                const done = progress?.completedStepIds.includes(stepId) ?? false;
                return (
                  <View
                    key={stepId}
                    style={cloudGrowthStyles.rule}
                    testID={`cloud-learning-step-${stepId}`}
                  >
                    <Text brand direction={direction} language={locale} variant="heading">
                      {lessonText(content.title)}
                    </Text>
                    <Text brand direction={direction} language={locale}>
                      {lessonText(content.body)}
                    </Text>
                    {done ? (
                      <Text brand direction={direction} language={locale} color="ghafEmerald">
                        {text('savedStep')}
                      </Text>
                    ) : null}
                    {mayAct && progress && nextStep === stepId ? (
                      <Button
                        brand
                        direction={direction}
                        language={locale}
                        disabled={disabled}
                        onPress={() =>
                          void send({
                            type: 'learning.step',
                            learningId: learning.id,
                            route,
                            stepId,
                          })
                        }
                        testID={`cloud-learning-read-${stepId}`}
                      >
                        {text('continue')}
                      </Button>
                    ) : null}
                  </View>
                );
              })}
              {progress && !nextStep ? (
                <View style={cloudGrowthStyles.section}>
                  <Text brand direction={direction} language={locale} variant="heading">
                    {text('check')}
                  </Text>
                  <Text brand direction={direction} language={locale}>
                    {lessonText('check.prompt')}
                  </Text>
                  {progress.checkSatisfied ? (
                    <Text brand direction={direction} language={locale} color="ghafEmerald">
                      {text('checkSaved')}
                    </Text>
                  ) : null}
                  {mayAct && !progress.checkSatisfied
                    ? learning.checkOptions.map((optionId) =>
                        checkKeys[optionId] ? (
                          <Button
                            key={optionId}
                            brand
                            direction={direction}
                            language={locale}
                            disabled={disabled}
                            variant="secondary"
                            onPress={() =>
                              void send({
                                type: 'learning.check',
                                learningId: learning.id,
                                route,
                                optionId,
                              })
                            }
                            testID={`cloud-learning-check-${optionId}`}
                          >
                            {lessonText(checkKeys[optionId])}
                          </Button>
                        ) : null,
                      )
                    : null}
                  {mayAct && progress.checkSatisfied ? (
                    <Button
                      brand
                      direction={direction}
                      language={locale}
                      disabled={disabled}
                      onPress={() =>
                        void send({ type: 'learning.complete', learningId: learning.id, route })
                      }
                      testID="cloud-learning-complete"
                    >
                      {text('complete')}
                    </Button>
                  ) : null}
                </View>
              ) : null}
              <View style={cloudGrowthStyles.rule}>
                <Text brand direction={direction} language={locale} variant="label">
                  {text('source')}
                </Text>
                <Text brand direction={direction} language={locale} variant="caption">
                  {lessonText('sources.note')}
                </Text>
              </View>
            </>
          )}
        </>
      )}
      {feedback ? (
        <StatusBanner
          direction={direction}
          language={locale}
          message={text(feedback)}
          tone={feedback === 'failed' ? 'error' : 'origin'}
        />
      ) : null}
      <Text
        brand
        direction={direction}
        language={locale}
        color="onSurfaceVariant"
        variant="caption"
      >
        {text('disclosure')}
      </Text>
    </View>
  );
}

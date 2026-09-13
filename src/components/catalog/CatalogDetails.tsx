import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GhafIcon } from '@/components/access';
import { Text } from '@/components/primitives';
import { botanical, colors, layout, logicalRowDirection, spacing } from '@/design/tokens';
import { localize } from '@/i18n';
import type { TaskTemplate } from '@/models/familyGrowth';
import { usePrototypeStore } from '@/state/usePrototypeStore';

export function CatalogToggle({
  label,
  checked,
  onChange,
  testID,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  testID: string;
}) {
  const direction = usePrototypeStore((state) => state.direction);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      aria-checked={checked}
      onPress={onChange}
      {...(Platform.OS === 'web'
        ? {
            onKeyDown: (event: { key: string; repeat: boolean; preventDefault: () => void }) => {
              if (event.key === ' ' && !event.repeat) {
                event.preventDefault();
                onChange();
              }
            },
          }
        : {})}
      style={[styles.toggle, { flexDirection: logicalRowDirection(direction) }]}
      testID={testID}
    >
      <GhafIcon name={checked ? 'check-filled' : 'check'} color={colors.ghafEmerald} size={24} />
      <Text brand direction={direction} style={styles.grow}>
        {label}
      </Text>
    </Pressable>
  );
}

export function CatalogDetails({
  content,
  safety = false,
}: {
  content: TaskTemplate;
  safety?: boolean;
}) {
  const { t } = useTranslation();
  const locale = usePrototypeStore((state) => state.locale);
  const direction = usePrototypeStore((state) => state.direction);
  const fields = [
    [t('catalog.why'), content.whyItMatters],
    [t('catalog.definition'), content.definitionOfDone],
    [t('catalog.help'), content.permittedHelp],
    [t('catalog.privacy'), content.privacyNotice],
  ] as const;
  return (
    <View style={styles.stack}>
      <Text brand direction={direction} variant="screenTitle">
        {localize(content.title, locale)}
      </Text>
      <Text brand direction={direction} color="ghafEmerald" variant="label">
        {content.recognitionMode === 'recognition_only' || content.routinePhase === 'maintenance'
          ? t('catalog.noAward')
          : t('catalog.award', { count: content.displayedSeedAward })}
      </Text>
      {fields.map(([label, text]) => (
        <View key={label} style={styles.section}>
          <Text brand direction={direction} variant="heading">
            {label}
          </Text>
          <Text brand direction={direction}>
            {localize(text, locale)}
          </Text>
        </View>
      ))}
      {content.catalogExecution?.completionScope === 'parent_observed_period' ? (
        <Text brand direction={direction}>
          {t('catalog.period')}
        </Text>
      ) : null}
      {safety ? (
        <View style={styles.section}>
          <Text brand direction={direction} variant="heading">
            {t('catalog.safety')}
          </Text>
          {[
            content.supervision,
            content.safety.adultPreCheck,
            ...content.safety.adultOwnedActions,
            ...content.safety.excludedHazards,
            content.safety.stopAndAskAdult,
            content.safety.routeConstraint,
            content.safety.aftercare,
          ]
            .filter((item) => item !== null)
            .map((item, i) => (
              <Text key={i} brand direction={direction}>
                {localize(item, locale)}
              </Text>
            ))}
        </View>
      ) : null}
    </View>
  );
}

export const catalogStyles = StyleSheet.create({
  stack: { gap: spacing.md, width: '100%' },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: botanical.colors.paper,
    borderColor: botanical.colors.line,
    borderWidth: 1,
    borderRadius: botanical.radius.surface,
  },
});
const styles = StyleSheet.create({
  stack: catalogStyles.stack,
  section: { gap: spacing.sm },
  toggle: {
    minHeight: layout.touchTarget,
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: botanical.radius.control,
    backgroundColor: botanical.colors.sage,
  },
  grow: { flex: 1, minWidth: 0 },
});

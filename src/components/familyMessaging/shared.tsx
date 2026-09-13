import { Platform, StyleSheet } from 'react-native';
import type { ComponentProps } from 'react';

import { Button, Text } from '@/components/primitives';
import { botanical, spacing } from '@/design/tokens';

export function MessageButton(props: ComponentProps<typeof Button>) {
  return <Button brand size="regular" {...props} style={[styles.target, props.style]} />;
}

export function MessageText(props: ComponentProps<typeof Text>) {
  const { selectable, style, ...rest } = props;
  return (
    <Text
      brand
      color="deepForest"
      {...rest}
      selectable={Platform.OS === 'web' ? undefined : selectable}
      style={[style, Platform.OS === 'web' && selectable ? { userSelect: 'text' } : undefined]}
    />
  );
}

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: botanical.colors.canvas },
  column: { width: '100%', maxWidth: 680, alignSelf: 'center', flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderColor: botanical.colors.line,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  group: { gap: spacing.sm },
  section: { gap: spacing.md, paddingTop: spacing.lg },
  target: { minHeight: 48 },
  recipient: {
    borderBottomWidth: 1,
    borderColor: botanical.colors.line,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  identity: { flex: 1, minWidth: 140, gap: spacing.xxs },
  notice: {
    padding: spacing.md,
    backgroundColor: botanical.colors.sage,
    borderRadius: botanical.radius.small,
    gap: spacing.xs,
  },
  error: {
    padding: spacing.md,
    backgroundColor: botanical.colors.amberWash,
    borderRadius: botanical.radius.small,
    gap: spacing.xs,
  },
  composer: {
    borderTopWidth: 1,
    borderColor: botanical.colors.line,
    backgroundColor: botanical.colors.paper,
    padding: spacing.md,
    gap: spacing.sm,
    maxHeight: '50%',
  },
  messageInput: { minHeight: 64, maxHeight: 132 },
  bubble: {
    padding: spacing.md,
    borderRadius: botanical.radius.control,
    gap: spacing.xs,
    maxWidth: '92%',
    backgroundColor: botanical.colors.paper,
  },
  ownBubble: { backgroundColor: botanical.colors.sage },
  code: {
    padding: spacing.lg,
    backgroundColor: botanical.colors.paper,
    borderRadius: botanical.radius.small,
  },
});

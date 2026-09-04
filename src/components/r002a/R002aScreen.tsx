import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { colors, layout, spacing } from '@/design/tokens';

interface R002aScreenProps extends PropsWithChildren {
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  header: ReactNode;
  keyboardAware?: boolean;
  safeAreaEdges?: readonly Edge[];
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  testID?: string;
}

export function R002aScreen({
  children,
  contentContainerStyle,
  footer,
  header,
  keyboardAware = false,
  safeAreaEdges = ['top', 'left', 'right'],
  scrollProps,
  testID,
}: R002aScreenProps) {
  // Keep physical layout stable while individual rows and text apply the active locale explicitly.
  const nativePhysicalDirection: ViewStyle | undefined =
    Platform.OS === 'web' ? undefined : { direction: 'ltr' };
  const webPhysicalDirection = Platform.OS === 'web' ? ({ dir: 'ltr' } as const) : {};

  return (
    <SafeAreaView
      {...webPhysicalDirection}
      edges={safeAreaEdges}
      style={[styles.safeArea, nativePhysicalDirection]}
      testID={testID}
    >
      <R002aDotField />
      {header}
      <KeyboardAvoidingView
        behavior={keyboardAware ? (Platform.OS === 'ios' ? 'padding' : 'height') : undefined}
        enabled={keyboardAware}
        style={styles.keyboardRoot}
      >
        <ScrollView
          {...scrollProps}
          automaticallyAdjustKeyboardInsets={keyboardAware}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
      {footer}
    </SafeAreaView>
  );
}

function R002aDotField() {
  return (
    <Svg aria-hidden height="100%" style={styles.dotField} width="100%">
      <Defs>
        <Pattern height="24" id="r002a-dot-grid" patternUnits="userSpaceOnUse" width="24">
          <Circle cx="1" cy="1" fill={colors.outlineVariant} opacity={0.28} r={0.75} />
        </Pattern>
      </Defs>
      <Rect fill="url(#r002a-dot-grid)" height="100%" width="100%" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.pearlGround,
  },
  dotField: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
  },
  keyboardRoot: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  content: {
    width: '100%',
    maxWidth: layout.compactContentWidth,
    alignSelf: 'center',
    gap: spacing.xl,
  },
});

import { useEffect, useRef, type PropsWithChildren, type ReactNode } from 'react';
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

import { LocalIllustration } from '@/components/illustrations';
import { botanical, layout, spacing } from '@/design/tokens';

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
  const scrollViewRef = useRef<ScrollView | null>(null);
  const restoredScrollX = scrollProps?.contentOffset?.x ?? 0;
  const restoredScrollY = scrollProps?.contentOffset?.y ?? 0;

  useEffect(() => {
    if (restoredScrollX === 0 && restoredScrollY === 0) return;
    let settleFrame: number | undefined;
    const layoutFrame = requestAnimationFrame(() => {
      settleFrame = requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({
          animated: false,
          x: restoredScrollX,
          y: restoredScrollY,
        });
      });
    });
    return () => {
      cancelAnimationFrame(layoutFrame);
      if (settleFrame !== undefined) cancelAnimationFrame(settleFrame);
    };
  }, [restoredScrollX, restoredScrollY]);

  return (
    <SafeAreaView
      {...webPhysicalDirection}
      edges={safeAreaEdges}
      style={[styles.safeArea, nativePhysicalDirection]}
      testID={testID}
    >
      <R002aFieldTexture />
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
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
      {footer}
    </SafeAreaView>
  );
}

function R002aFieldTexture() {
  return (
    <View pointerEvents="none" style={styles.fieldTextureFrame}>
      <LocalIllustration
        assetId="field-paper"
        decorative
        style={styles.fieldTexture}
        testID="r002a-field-texture"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: botanical.colors.canvas,
  },
  fieldTextureFrame: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
  },
  fieldTexture: {
    width: '100%',
    height: '100%',
    opacity: 0.055,
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
    gap: botanical.space.section,
  },
});

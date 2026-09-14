import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Platform, type View } from 'react-native';

import { focusAccessibilityTarget } from './accessibilityFocus';
import { useReducedMotionPreference } from './useReducedMotionPreference';

// Native Modal owns motion; focus follows committed visibility, not a close request.
export function useTaskModalPresentation(
  visible: boolean,
  headingRef: RefObject<View | null>,
  returnFocusRef: RefObject<View | null>,
  entrance: 'fade' | 'slide',
) {
  const reducedMotion = useReducedMotionPreference();
  const [animation, setAnimation] = useState({
    visible,
    type: reducedMotion ? ('none' as const) : entrance,
  });
  const animationType =
    visible && !animation.visible ? (reducedMotion ? 'none' : entrance) : animation.type;
  // Changing a visible Android Modal's theme recreates its native window.
  if (animation.visible !== visible) setAnimation({ visible, type: animationType });
  const token = useMemo(() => ({ visible }), [visible]);
  const lifecycle = useRef<{
    token: typeof token;
    active: boolean;
    headingFocused: boolean;
    restorePending: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    const previous = lifecycle.current;
    const presentation = {
      token,
      active: true,
      headingFocused: previous?.token === token && previous.headingFocused,
      restorePending:
        previous?.token === token
          ? previous.restorePending
          : Boolean(previous?.token.visible && !visible),
    };
    lifecycle.current = presentation;
    let frame: number | undefined;

    // Android removes the host at visible=false and has no Modal onDismiss event.
    if (presentation.restorePending && Platform.OS === 'android') {
      frame = requestAnimationFrame(() => {
        if (!presentation.active || !presentation.restorePending) return;
        presentation.restorePending = false;
        focusAccessibilityTarget(returnFocusRef.current);
      });
    }

    return () => {
      presentation.active = false;
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [token, returnFocusRef, visible]);

  return {
    animationType,
    onShow: () => {
      const presentation = lifecycle.current;
      if (
        !presentation?.active ||
        presentation.token !== token ||
        !visible ||
        presentation.headingFocused
      )
        return;
      presentation.headingFocused = true;
      // React Native Web owns its focus trap and restoration.
      if (Platform.OS !== 'web') focusAccessibilityTarget(headingRef.current);
    },
    onDismiss: () => {
      const presentation = lifecycle.current;
      if (
        Platform.OS !== 'ios' ||
        !presentation?.active ||
        presentation.token !== token ||
        visible ||
        !presentation.restorePending
      )
        return;
      presentation.restorePending = false;
      focusAccessibilityTarget(returnFocusRef.current);
    },
  };
}

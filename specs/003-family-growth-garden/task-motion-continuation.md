# Compatible task motion repair — 2026-09-14

Authority: the user's continued animation-polish request. This supplements the
existing motion repair contract without changing product behavior, navigation,
flags, actions, awards, dependencies or permissions.

1. Task support and Child completion modals use the existing live reduced-motion
   preference on each opening, preserving the native theme through that visible
   presentation because changing it recreates the Android window. Native Modal
   and Android system settings own in-flight motion and Back. No custom gesture
   or delayed business dismissal is introduced.
2. Modal heading focus belongs to the current visible presentation. Return focus
   is requested only after committed dismissal, cancelled on reopen/unmount and
   guarded against stale callbacks. Repeated native show notifications cannot
   reset selected help steps; opening a new presentation resets them before paint.
   Pending submission and closing keep selection stable; failures retain it.
3. The default-off task workspace keeps category rail dimensions constant during
   selection. Existing BotanicalPressable supplies button feedback; callers do not
   stack the obsolete pressed-opacity effect on its scale. Reduced motion retains
   the shared static feedback. No selection/content delay or added animation.
4. Native inspection at 360dp width found the completion sheet's initial viewport
   clipped Send and hid Return below long Arabic content. Both task sheets keep
   actions in a reserved footer while the summary/selection body scrolls. This
   preserves usable dismissal and submission through variable content and font
   changes without animating layout or changing business state.

Test rapid dismiss/reopen, stale native show callbacks, unmount, externally driven
successful close, busy/error state, live preference changes, keyboard activation,
and selection geometry. Preserve multiline content, existing scrolling and 48dp
controls. Mock execution is lifecycle evidence only. Android Back, keyboard,
TalkBack, large text, native reversals and frame timing require current-device
evidence; emulator startup currently fails its disk-space preflight.

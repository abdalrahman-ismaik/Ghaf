# Assigned QA Slice 2 — bounded accessibility repairs

User read the independent packet and identified Slice2 as eligible once assigned. Canonical board97
is the exact implementation grant; NEXT-BATCH.md remains a proposal. These repairs implement existing
accessibility, RTL and readable-state requirements; no new product behavior or package is introduced.

- QAF-002: native grouped step/success announcements keep complete labels and focus lifecycle;
  web exposes visible numbered task instructions and success title/body exactly once. Do not fix
  generic wrapper labels by hiding meaningful web descendants or changing the global Text adapter.
- QAF-003: Parent support/retry choices expose checked and unchecked states on web alongside native
  accessibilityState. Mouse/keyboard selection and deselection reflect the same state; no-choice
  Send stays disabled, and a selected submission uses the existing callback/data. Preserve retry
  no-loss rules, task authority, dismissal, modal focus and prepared content.
- QAF-004: preserve all six original onboarding pages, selected5A branding/art, narration selection,
  wording, progress and actions; make only the header groups wrap/shrink safely. Complete AR/EN
  labels and targets≥48dp must remain within320/390 widths. Never truncate essential content or
  disable font scaling. Keep the user's later logo-focused Welcome refinement untouched.
- QAF-009: Child permission rows are facts, not controls. Restore readable opacity at the caller
  without adding an onPress/Child capability or globally weakening disabled-action styling.

Lead owns onboarding header/styles, Child-settings caller, integration and evidence. One helper
owns only the three semantic components and focused rendered tests listed on board97. Existing
uncommitted narration changes in FirstRunOnboarding are snapshotted/preserved and excluded from
this slice's staged diff. No Garden files: shared-versus-personal decision still pending and
Slice3 must coordinate the same route with Slice1. No other packet recommendation is granted.

Validate existing affected tests and focused regressions, then one bounded real-browser AR/EN
320/390 pass with six-page header geometry, accessibility snapshots, checkbox keyboard/click,
ordinary success consumers and permission contrast. Treat any injected fixtures as synthetic,
separate from actual UI journeys. Larger-text browser probes are diagnostic; actual Android
TalkBack/font scale/Back/focus/keyboard and human review remain NOT RUN without direct evidence.

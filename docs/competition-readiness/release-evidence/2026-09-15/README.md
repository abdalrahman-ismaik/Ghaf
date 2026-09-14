# Native QA captures — September 15, 2026 Dubai

These are unedited ADB screenshots from the actual internal standalone APKs,
using synthetic QA records on `Ghaf_API35_ARM64Bridge`, Android35/x86_64,
720×1600 at320dpi. They are engineering evidence, not approved store screenshots
or proof that the complete product is ready. No real family data, credentials,
pairing tokens or original Android user0 captures are included.

| Capture                                             | Source / setting                                                   | What it establishes                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Earlier footer](d13-child-restored.png)            | d13c148, restricted Child, Arabic, font1                           | Six destinations occupy three rows.                                                                                                                          |
| [Compact footer](b2-child-settled.png)              | b2b4302, same Child and task state, Arabic, font1                  | Three equal columns place the same six destinations in two rows. The first-row bounds moved down136px, leaving more content visible.                         |
| [Enlarged-text defect](b2-large-text-ar.png)        | b2b4302, Parent, Arabic, font1.5                                   | Settings splits inside an Arabic word. This triggered the responsive-column repair; this image is a failing case.                                            |
| [Persisted memories](b2-child-memories-visible.png) | b2b4302, restricted Child after both QA clients restarted, font1   | Both recognized synthetic activities remain visible. The separate execution record supplies server/Parent readback; an image alone cannot prove persistence. |
| [Account B empty state](b2-account-b-empty.png)     | b2b4302, previously approved synthetic Parent B after A signed out | Create/join setup contains no Family A history. This is account switching, not acceptance of unapproved public signup.                                       |
| [Safety guidance](b2-native-safety.png)             | b2b4302, Parent task detail, Arabic, font1                         | Existing adult support and material guidance is now rendered. It does not certify an adult performed the prerequisite or close catalog safety gate G1.       |

## Final4dd candidate

The same installed4dd APK was independently hashed on the emulator. These final
captures were reviewed directly; they contain synthetic data only:

- [Normal Arabic](final-normal-ar.png): three columns/two rows; both activities restored.
- [Enlarged Arabic](final-large-ar.png): font1.5, two columns/three rows; Settings remains a whole word.
- [Enlarged English](final-large-en.png): font1.5, all six full labels remain visible.
- [Restored growth](final-garden-settled.png): restricted Child,16Seeds and two shared-canopy contributions.
- [Restored memories](final-memories.png): both saved synthetic activities after upgrade/restart.

Machine-readable sanitized receipts record [artifact identity](final-artifact-review.json),
[installed hash/device cleanup/crash-buffer scope](final-device-state.json),
[normal](final-interactions-normal.json), [large Arabic](final-interactions-large-ar.json),
[large English](final-interactions-large-en.json),
[disabled-animation](final-interactions-zero-motion.json) and
[cancelled-press](final-press-cancel.json) checks, [cold startup](startup-final.json),
and the [b2](b2warm-profile.json)/[final](finalwarm-profile.json) warmed frame samples.
Timing limitations in those receipts are part of the evidence; none establishes
physical-device performance, TalkBack speech or complete feature acceptance.

The complete [QA record](../../release-qa-results.md),
[performance evidence](../../release-performance.md) and
[release ledger](../../release-readiness.md) define the test boundaries. White
status-bar icons on the light cloud-screen background remain a P2 contrast issue;
the separately owned root navigation/status-bar work was not included in these APKs.

The actual parent confirmation recording is retained only in ignored local QA
evidence, `b2-parent-confirmation.mp4` (962,223bytes, SHA-256
`72560c35dca27def593c810c933982c483c06d436656d3fe6ee86128649ef4bf`).
Its MP4 metadata reports29.2407seconds; it was not decoded/reviewed as visual
quality or frame-timing evidence. It is not a published promo.

# Stitch Inventory — Ghaf R001 Batch 1

**Reviewed:** 2026-09-02

**User decision:** The seven supplied Arabic Parent-onboarding screens and their shared foundations
are the first approved implementation batch.

**Inventory result:** Complete for the files physically present in `ghaf-r001`; incomplete for the
full Feature 003 Revision 2 design gate.

## Release Contents

Release root: `docs/design/stitch/releases/ghaf-r001/`

| Artifact                                            | Present | Intake use                                                                                |
| --------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `STITCH_DESIGN.md` and `SCREEN_INDEX.md`            | Yes     | Release status and index, reconciled to this intake                                       |
| `design-system/DESIGN.md`                           | Yes     | Batch token, type, spacing, radius, and visual-language source                            |
| Seven `screen.png` files                            | Yes     | Canonical default-state composition references                                            |
| Seven `code.html` files                             | Yes     | Non-runtime measurement, structure, copy, and interaction hints                           |
| `screen-spec.md` files                              | No      | Interaction behavior is not supplied as a formal screen specification                     |
| `reference-top.png` / `source.html`                 | No      | The actual export names are `screen.png` and `code.html`                                  |
| English LTR frames                                  | No      | English runtime parity is required but has no approved visual reference                   |
| Separate focus/loading/error/offline/success frames | No      | Required states must use the shared native system without claiming Stitch visual approval |
| Font files and licenses                             | No      | Local package integration is recorded separately; remote HTML font links are prohibited   |
| Botanical, icon, and illustration exports           | No      | The three `assets/` directories exist but are empty; use code-native SVG                  |

## Screen Files

|   # | Screen                 | PNG dimensions | PNG SHA-256                                                        | HTML SHA-256                                                       |
| --: | ---------------------- | -------------: | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
|  01 | Welcome                |        487×772 | `02f175ed1c106e0f618e57641655d3ba9a8ff50f4332c9741692d42e3fae96fd` | `7b4e1c33beb04c682df2d292678f663357b9ba089fa97124d0629eb2bb8def71` |
|  02 | Parent sign-in         |        487×883 | `ed0773fb66d8508758df37d9b48f78f998f1974fc867ce0b47df0bd76545891e` | `a282bf90dcb27b85e0050ccd463c6b7882cc34687754909957d5e79193dc3b05` |
|  03 | Verification code      |       487×1055 | `508b0707f5a59098d35c7e3efd516597b98355addb190975ea217b1c306e652b` | `116dbebee23429ebd065f30e482f5962fd571ed16dab8087dec9c3383bdc93b2` |
|  04 | Family basics          |       487×1105 | `32d045dc2d597e7f6fc6fd5d338e32175dcad3c921a9104dffd8ddf75ef55f1f` | `e7a75e214ec3fb6de88e9f02e11ba11760c2b4fa27fb1e081487bfdaace5f25c` |
|  05 | Add first Child        |       487×1137 | `93f8490902ccd74b287fa94bd04620f15ed4c77da9e24679289469c00cf55872` | `03b37bb1fe9387a895d4d1d1fa08424684718865428c1e9491b3368b76794b83` |
|  06 | Review and create      |       487×1242 | `a7f56ccb73d8b578ee0158d11bf7c86373639d6d0b6406248d1f04c684451d7c` | `5408142fae88ef98358262bc2d11db71b1289d3f41d42c5afaa63b34eb9656fc` |
|  07 | Family-created success |       487×1242 | `05bff1697c81662e2e896ba6bb60803c725280c37840b736ba7dcb9d87f5111a` | `4e7e5139adb5dc2eec7ae762c120e761bc46e498353edd740f7650fdb91e3088` |

The design-system SHA-256 is
`2affc7868ec1e1d9cdd83c56b0ea7e956ee829ae813858c9e570d3e1cb40425c`.

## Locale, Role, and Product Coverage

| Dimension                  | Supplied coverage                                                                              | Disposition                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Locale                     | Arabic only                                                                                    | Arabic is canonical for this batch; English is implementation parity without visual approval                              |
| Direction                  | RTL default compositions                                                                       | Preserve page-level RTL and mirror only directional controls                                                              |
| Role                       | Shared welcome plus first-time Parent access/setup                                             | Child entry route and all authenticated Child surfaces remain blocked                                                     |
| Journey                    | Welcome → synthetic Parent identifier → verification → family → first Child → review → success | Released as one deterministic local onboarding slice                                                                      |
| Parent tabs                | None                                                                                           | Home/Tasks/Garden/Family shell remains blocked; `/parent` is only the integration destination                             |
| Child tabs                 | None                                                                                           | Today/Garden/League shell remains blocked                                                                                 |
| Food-rescue outcome        | None in this batch                                                                             | The later Parent-to-Child recycling and estimated food/waste outcome journey remains required and blocked on later frames |
| AI, League, reward, garden | Mentioned only in general copy or privacy statements                                           | No later mechanism is released for screen implementation                                                                  |

## Design-System Extraction

- Style: Soft Organic Modernism with a subtle dot field, restrained organic landscape planes,
  strong centered Arabic typography, flat/tonal surfaces, and rare soft elevation.
- Canonical batch colors include pearl `#F7F8F3`, primary `#00503B`, Ghaf emerald `#126A50`, deep
  forest `#0D3128`, mangrove teal `#188B83`, solar amber `#F2B84B`, ink `#14221D`, and the supplied
  semantic surface/outline/error roles.
- Typography: Alexandria for display; Readex Pro for body, controls, and data.
- Geometry: 4 px spacing basis, 20 px phone margins, 16 px structural gaps, 48dp minimum targets,
  56dp dominant actions, 16 px primary radii, full pills, and a 28 px success-sheet top radius.
- Depth: tonal layers and code-native organic SVG before shadow. HTML backdrop blur is not a native
  dependency requirement.

## Intake Boundary

The inventory proves that an approved visual source exists for this batch. It does not prove
English parity, responsive behavior, Android rendering, keyboard behavior, 200% font scale,
TalkBack order, interaction correctness, or any later Revision 2 screen. Those require fresh
implementation evidence or later approved frames.

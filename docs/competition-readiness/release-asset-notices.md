# Ghaf release asset notices and rights evidence

**Internal prelaunch draft — 2026-09-15. Publication clearance is unresolved.**

This bounded review traces current source-selected logo, artwork, fonts and audio to supplied
provenance and license files. Source was read at `61a56e2` with other lanes' work preserved.
A later read-only inspection verifies font/audio bytes in the exact earlier `d13c148` APK below;
it does not verify another APK, store upload, public video or permission to publish. The
[main release ledger](release-readiness.md) remains authoritative; this document does not change
its verdict. It complements the [store draft](release-store-listing.md) and
[security/privacy record](release-security-and-privacy.md).

## Source-selected inventory

“Selected” below means a current source import or native configuration reference. It does not mean
a rights reviewer approved publication. A default-off feature is not evidence that a statically
referenced asset is absent from an export.

| Asset boundary                                 | Actual source and supplied evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Rights finding and exact next decision                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **5A Refined Classic mark and platform icons** | [GhafRasterLogo](../../src/components/brand/GhafRasterLogo.tsx) selects `assets/brand/ghaf/ghaf-mark-full-color-1024.png`. [Expo config](../../app.config.ts) selects `app-icon/icon.png`, `android-legacy-icon-1024.png`, `android-adaptive-foreground-1024.png`, `android-adaptive-monochrome-1024.png`, splash and iOS/web derivatives under that same canonical directory. The [5A README](../design/brand/5a-refined-classic/README.md), [manifest](../design/brand/5a-refined-classic/manifest.json) and [generation record](../design/brand/5a-refined-classic/generation.json) record the user-selected board, built-in image-tool extraction and deterministic derivatives. | **Commercial clearance undocumented.** Selection on 2026-09-13 is visual approval. Record the selected board's creator/rightsholder and the authority to distribute it and its generated derivatives under the applicable generation account terms. No trademark clearance or third-party license is inferred. The older tree-only pack is a different asset and cannot license 5A.                   |
| **48 R003 botanical JPEGs**                    | All 48 literal references occur in [illustrationSources](../../src/components/illustrations/illustrationSources.ts). Exact filenames, hashes and transformations are in the [asset manifest](../../assets/images/illustrations/r003/ASSET_MANIFEST.json); final files are under `assets/images/illustrations/r003/final/`. [Provenance](../../assets/images/illustrations/r003/PROVENANCE.md) records prepared synthetic generation on 2026-09-06 and the 2026-09-07 Welcome replacement.                                                                                                                                                                                            | **Commercial clearance undocumented for this entire 48-file boundary.** Provider/model/account-use terms are not identified in the public manifest; its review status is `curated-local-candidate`. Named image-rights review explicitly remains `NOT RUN`. Obtain the generation and reference-input rights record for these exact hashes; do not convert crop/visual approval into a license claim. |
| **Parent and Child access portraits**          | [Parent registry](../../src/components/access/parentAccessAssets.ts) selects `assets/images/access/parent-emirati/parent-access-emirati-family-v2.jpg`; [its provenance](../../assets/images/access/parent-emirati/PROVENANCE_FAMILY_V2.md) identifies the synthetic v1 father as an edit reference. [Child registry](../../src/components/access/childAccessAssets.ts) selects `assets/images/access/child-emirati/child-access-emirati-v1.jpg`; [its provenance](../../assets/images/access/child-emirati/PROVENANCE.md) records synthetic generation without real-person input.                                                                                                   | **Commercial clearance undocumented.** Both records explicitly leave named image-rights and cultural review unrun. Record provider/account terms and input provenance, including the Parent v1 reference. Fictional subjects and user-requested composition do not resolve output rights or cultural acceptance.                                                                                      |
| **Task helper portrait**                       | [CompanionPortrait](../../src/components/companion/CompanionPortrait.tsx) imports `assets/images/companion/task-helper.png`. The [README](../../assets/images/companion/README.md) records a byte-for-byte copy of supplied `assets/character_companion/assets/images/avatars/avatar3.png` and the user's statement that they created the character.                                                                                                                                                                                                                                                                                                                                 | **Owner creation attestation recorded; distribution authority still to be recorded.** Confirm that the eventual app publisher is authorized by that creator. Do not invent a creator name, stock license, copyright assignment or reviewed human identity. No third-party attribution requirement is supplied.                                                                                        |
| **Alexandria 700 Bold / 800 ExtraBold**        | [Root font loading](../../app/_layout.tsx) and [native font configuration](../../app.config.ts) select these two TTFs from installed `@expo-google-fonts/alexandria@0.4.2`. Its `LICENSE_FONT` supplies the Alexandria author notice and SIL OFL 1.1; `LICENSE` covers the package wrapper under MIT.                                                                                                                                                                                                                                                                                                                                                                                | **Bundling permission documented, subject to notices.** Preserve the exact notice and full OFL below in an easily viewable form in each distributed copy. No font modification was identified in this bounded source review. APK notice delivery is **not verified**.                                                                                                                                 |
| **Readex Pro 400 Regular / 500 Medium**        | The same root and native configuration select these two TTFs from installed `@expo-google-fonts/readex-pro@0.4.1`. Its `LICENSE_FONT` supplies the author notice, reserved name and SIL OFL 1.1; wrapper `LICENSE` is MIT.                                                                                                                                                                                                                                                                                                                                                                                                                                                           | **Bundling permission documented, subject to notices.** Retain the exact Reserved Font Name statement below. Names appearing elsewhere in design tokens are not evidence that additional font files are loaded. APK notice delivery is **not verified**.                                                                                                                                              |
| **Six current Arabic onboarding recordings**   | [onboardingAudioSources](../../src/components/onboarding/onboardingAudioSources.ts) selects `assets/audio/onboarding/narration-ar-{intro,family,sustainability,assistant,support,growth}-v2.mp3`. The [audio README](../../assets/audio/onboarding/README.md) and [v2 selection report](workstreams/c-v2-narration.md) preserve per-file hashes and the user's supplied selection.                                                                                                                                                                                                                                                                                                   | **Commercial clearance undocumented for all six.** The record does not establish provider/model, generation plan, human/voice rights, or per-clip license. Obtain the actual supplied recordings' rights evidence. Do not inherit the distinct three Wiam clips' approval or plan conditions. Decode success and voice selection are not redistribution permission.                                   |
| **Six current English onboarding recordings**  | The same registry selects `assets/audio/onboarding/narration-en-{intro,family,sustainability,assistant,support,growth}-v1.mp3`. The [README](../../assets/audio/onboarding/README.md) records prepared synthetic authoring on 2026-09-07 with `en-US-EmmaMultilingualNeural`, public title/body scripts, and exact hashes.                                                                                                                                                                                                                                                                                                                                                           | **Commercial clearance undocumented for all six.** The voice identifier alone does not establish which service/account/license generated the files. Retrieve that authoring evidence and applicable terms. English ordinary onboarding remains distinct from the silent English demo setting.                                                                                                         |
| **Ambient calm soundscape v2**                 | [AmbientAudioProvider](../../src/components/audio/AmbientAudioProvider.tsx) imports `assets/audio/ambient/calm-soundscape-v2.mp3`. [Provenance](../../assets/audio/ambient/README.md) records local FFmpeg synthesis from fixed noise seeds on 2026-09-08, without downloaded recordings, field samples, speech or third-party audio.                                                                                                                                                                                                                                                                                                                                                | **Local authoring documented; publisher authority not named.** No third-party recording attribution is identified by this record. Confirm the authored output's publication authority; the generation tool's software license is not itself an audio-output license or a supplied-sample rights clearance.                                                                                            |

The 48 botanical files comprise 25 landscape-stage images, five avatars, six onboarding scenes,
four field/Welcome/transition/task scenes, two family canopies, three Circle gardens and three
reveal/learning/shared-growth scenes. The manifest is the filename and checksum authority;
`onboarding-ai` is a registry key whose actual file is `onboarding-assistant.jpg`.

## Executed d13 APK inspection — 2026-09-15

Artifact: `output/release-021-baseline-d13/ghaf-internal-d13c148e09dd.apk`,
88,449,616 bytes; independently measured SHA-256
`2648b6038d5b65778583f05bae9df7ccb3208cf134a1cf1cbbc5ff803fa8f060`.
This matches the adjacent `build-receipt.json` and checksum file. That receipt identifies source
`d13c148e09ddd64c5cd17c8f784c21f7c5396f72`, workflow `34888514880`, and the internal prototype
package. This is an earlier candidate; no later source or artifact inherits these results.

The inspection streamed SHA-256 over **all 1,652 non-directory ZIP entries**, comparing their
uncompressed bytes to the local audio/font/license inputs regardless of renamed resource paths.
No APK extraction, modification, installation or new build was performed.

| Source recording under `assets/audio/`          | Exact matching APK entry |
| ----------------------------------------------- | ------------------------ |
| `onboarding/narration-ar-intro-v2.mp3`          | `res/Ex.mp3`             |
| `onboarding/narration-ar-family-v2.mp3`         | `res/2B.mp3`             |
| `onboarding/narration-ar-sustainability-v2.mp3` | `res/ql.mp3`             |
| `onboarding/narration-ar-assistant-v2.mp3`      | `res/bL.mp3`             |
| `onboarding/narration-ar-support-v2.mp3`        | `res/2l.mp3`             |
| `onboarding/narration-ar-growth-v2.mp3`         | `res/NI.mp3`             |
| `onboarding/narration-en-intro-v1.mp3`          | `res/p9.mp3`             |
| `onboarding/narration-en-family-v1.mp3`         | `res/pg.mp3`             |
| `onboarding/narration-en-sustainability-v1.mp3` | `res/S4.mp3`             |
| `onboarding/narration-en-assistant-v1.mp3`      | `res/Nv.mp3`             |
| `onboarding/narration-en-support-v1.mp3`        | `res/aT.mp3`             |
| `onboarding/narration-en-growth-v1.mp3`         | `res/Eu.mp3`             |
| `ambient/calm-soundscape-v2.mp3`                | `res/D0.mp3`             |

These matches account for all **13 MP3 entries**. The six Arabic v1 clips, three Wiam clips,
and ambient v1 have **no exact-byte match in any entry**. This establishes the selected files'
presence and the absence of those exact historical byte streams as standalone entries; it does
not exclude a transformed/re-encoded rendition or nested content by filename guessing. No new
listening, transcript or voice-rights review was performed. The **12 selected narration clips'
commercial-rights gaps therefore apply to actual content of this d13 APK**, not just source.

| Font bytes                                | Exact matching APK entries                               |
| ----------------------------------------- | -------------------------------------------------------- |
| `Alexandria_700Bold.ttf`                  | `assets/fonts/Alexandria_700Bold.ttf`, `res/b4.ttf`      |
| `Alexandria_800ExtraBold.ttf`             | `assets/fonts/Alexandria_800ExtraBold.ttf`, `res/Nz.ttf` |
| `ReadexPro_400Regular.ttf`                | `assets/fonts/ReadexPro_400Regular.ttf`, `res/aj.ttf`    |
| `ReadexPro_500Medium.ttf`                 | `assets/fonts/ReadexPro_500Medium.ttf`, `res/UB.ttf`     |
| `MaterialSymbols_400Regular.ttf`          | `res/V6.ttf`                                             |
| Roboto Medium numeric subset, 3,316 bytes | `res/RV.ttf`; source attribution below                   |

The four configured text-font hashes match the table at the end of this document. Each has two
byte-identical packaged copies. Material Symbols matches its installed package's regular TTF.
Thus this APK contains **ten TTF entries representing six unique font binaries**, not just the
four configured application text fonts. This review does not change font loading or remove copies.

**Notice evidence:** neither supplied Alexandria/Readex `LICENSE_FONT` nor their MIT wrapper
`LICENSE` matches a complete APK entry. Neither does Material Symbols' supplied `LICENSE_FONT`.
All eight Alexandria/Readex TTF entries retain copyright plus a short OFL declaration and URL in
their name tables, but those fields do not contain the full OFL. No contiguous UTF-8/UTF-16 match
for two distinctive OFL condition/definition phrases or `Copyright (c) 2020 Expo` was found in any
entry. The six entries whose names contain `LICENSE`/`NOTICE` belong to AndroidX/OkHttp; none
contains the full supplied Material Symbols Apache text after whitespace normalization.
This is evidence about the inspected representations, not proof that no compiled or dynamically
assembled notice could exist. An app-user-readable full font notice surface was **not verified**.

The Readex TTF metadata says **Copyright 2019**, while the supplied package `LICENSE_FONT` says
**Copyright 2018** and names **RevReading Lexend**. Both actual notices are preserved below;
this audit does not silently replace one with the other or declare a legal conflict resolved.

## Retained assets that must not be confused with the current selection

The three `assets/audio/demo-onboarding/ar-{together,support,growth}-wiam-v1.mp3` files have
a **specific, documented noncommercial limitation**. Their [README](../../assets/audio/demo-onboarding/README.md)
records user-reported ElevenLabs Wiam / Multilingual v2, **Free plan at generation**, and approval
of wording/pronunciation/delivery for local educational evaluation.

The old [DemoEntryScreen](../../src/components/demo/DemoEntryScreen.tsx) imports
[useDemoOnboardingNarrator](../../src/components/demo/useDemoOnboardingNarrator.ts), which imports
[demoNarrationSources](../../src/components/demo/demoNarrationSources.ts) and those three files.
However, the current [entry route](../../app/index.tsx) imports
[OriginalDemoEntryScreen](../../src/components/demo/OriginalDemoEntryScreen.tsx), which uses
[FirstRunOnboarding](../../src/components/onboarding/FirstRunOnboarding.tsx) and the six-topic
source registry. This audit found no `app/` or `src/` importer of the old `DemoEntryScreen`.
The d13 APK inspection above found no exact-byte copy of those three recordings in any ZIP entry.
Other artifacts still require their own check; a source repository or older artifact may contain
them. No conclusion about a transformed recording is inferred from its filename.

The official [ElevenLabs publishing policy](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform),
read on **2026-09-15**, states that Free-generated output lacks commercial-use permission and requires
provider attribution in the content title when shared noncommercially. Generation during a later paid
subscription does not confer commercial permission on previously Free-generated clips. Exact
competition/public-video classification and APK attribution placement remain unresolved; adding an
About credit has not been established as sufficient. A suitable recorded evaluation title is
**“Ghaf demo narration — elevenlabs.io”**, matching the supplied README. This does not approve
publication or alter the app's brand title.

Other retained files are not selected by the current registries: six Arabic v1 onboarding clips,
`nature-soundscape-v1.mp3`, and `parent-access-emirati.jpg`. The Parent v1 image still matters as
the active portrait's reference input. [fixture-salem-plan-ar-v1.md](../../assets/audio/fixture-salem-plan-ar-v1.md)
is a transcript fallback record, not evidence of a supplied audio binary.

## Concrete release decisions still open

| Priority       | Exact unresolved boundary                                                   | Required evidence or implementation before clearance                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1             | 5A mark; 48 botanical JPEGs; two access portraits                           | Record actual creator/provider, input rights, applicable generation-account terms, and authorized publisher decision against existing manifests. Keep named cultural/image-rights review distinct from commercial-use rights.  |
| P1             | Six Arabic v2 and six English v1 selected narration files                   | Establish per-collection or per-file generation/recording rights covering the exact hashes and intended public APK/video use. No replacement, upload or regeneration is authorized by this document.                           |
| P1             | Four selected TTFs and font package wrappers                                | Deliver the exact OFL notices/full license and applicable MIT wrapper notice below in a user-viewable distributed form; verify that form in the final APK. A Markdown file in the repository is not proof the APK includes it. |
| P2             | User-created companion and locally authored ambient v2                      | Associate the existing authorship attestation/provenance with the eventual publisher's permission. No invented copyright holder or additional license is supplied here.                                                        |
| Conditional P1 | Old Wiam recordings if included in a distributed artifact or source package | Reconcile exact inclusion and allowed use/attribution with the Free-generation record and official policy. Current source route tracing does not prove artifact absence.                                                       |

## Font notices prepared for distribution

The supplied font licenses permit bundling with software, including commercial distribution,
subject to their conditions. Preserve these notices and the complete license text; the OFL
does not require Ghaf application code or documents rendered using the fonts to adopt the OFL.
The [official SIL OFL 1.1 text](https://openfontlicense.org/open-font-license-official-text/)
was checked on **2026-09-15**. The exact notices and full text below were copied from the locally
installed packages' license files, not inferred from a Google Fonts listing.

### Alexandria

```text
Copyright 2022 The Alexandria Project Authors (https://github.com/Gue3bara/Alexandria)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
```

Local source: `node_modules/@expo-google-fonts/alexandria/LICENSE_FONT`.
No Reserved Font Name is specified in this supplied copyright header.

### Readex Pro

```text
Copyright 2018 The Readex Pro Project Authors (https://github.com/ThomasJockin/readexpro), with Reserved Font Name “RevReading Lexend”.

This Font Software is licensed under the SIL Open Font License, Version 1.1.
```

Local source: `node_modules/@expo-google-fonts/readex-pro/LICENSE_FONT`.

The exact d13 bundled TTFs also retain this separate copyright notice in their font metadata:

```text
Copyright 2019 The Readex Pro Project Authors (https://github.com/ThomasJockin/readexpro)
```

### SIL Open Font License 1.1 — applies to both font notices above

```text
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

### Expo font package wrapper notice

Both installed font packages supply the following same `LICENSE`. It covers their package
software separately from the OFL-licensed font files. This is a bounded font notice record,
not a complete dependency license inventory.

```text
MIT License

Copyright (c) 2020 Expo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Additional fonts discovered in the APK

### Material Symbols Regular — exact local package match

APK `res/V6.ttf` is byte-identical to
`node_modules/@expo-google-fonts/material-symbols/400Regular/MaterialSymbols_400Regular.ttf`,
SHA-256 `91a669d11d3080118e93dcc29ea3d84d845bb251ef2ae57f7d493ddcc577c801`.
Installed package version is **0.4.44**. The [lockfile](../../package-lock.json) records it through
`expo-symbols@57.0.2`; the local
`node_modules/expo-symbols/src/android/weights/regular/index.ts` imports that exact font,
and `src/utils.ts` selects the regular weight by default.

Its local `LICENSE_FONT` supplies **Apache License 2.0**; its `LICENSE` is byte-identical
to the Expo MIT wrapper notice reproduced above. The font's actual copyright field is retained:

```text
Material Symbols Regular
Copyright 2026 Google LLC.  All Rights Reserved.
```

The [official Google Material Symbols repository](https://github.com/google/material-design-icons/blob/master/README.md?plain=1)
also identifies Apache 2.0 and describes product inclusion. This is license evidence for this
font, subject to the license conditions; it is not authorization to publish the entire Ghaf
candidate. The supplied full Apache text follows. Its measured local SHA-256 is
`58d1e17ffe5109a7ae296caafcadfdbe6a7d176f0bc4ab01e12a689b0499d8bd`.

### Roboto Medium numbers — artifact identity established; source-byte link pending

APK `res/RV.ttf` is **3,316 bytes**, SHA-256
`acbf6c59d8c5765ffa9af2a839249e2800e0b107aad4045cf5c070765fa29322`.
The font reports `Roboto Medium`, `Roboto-Medium`, and `Version 2.137; 2017`.
Its copyright field is:

```text
Roboto Medium
Copyright 2011 Google Inc. All Rights Reserved.
```

The APK resource table contains `roboto_medium_numbers`, and its
`META-INF/com.google.android.material_material.version` is **1.13.0**. These observations
point to the Material Components numeric subset; this is an **inference**, not an upstream
binary hash match. No Roboto font file was found among the installed `node_modules` paths.
Local SDK/cache provenance was not verified in this helper scope.

The [Material Components Android 1.13.0 license](https://github.com/material-components/material-components-android/blob/1.13.0/LICENSE)
and [Roboto-2 upstream license](https://github.com/googlefonts/roboto-2/blob/main/LICENSE)
both supply Apache 2.0. Preserve the actual embedded copyright above and full Apache text.
Before closing provenance, compare the exact native dependency's `roboto_medium_numbers.ttf`
to the APK hash and retain any accompanying notices or upstream modification record. This
document does not infer that an unrelated modern Roboto release licenses these exact subset bytes.
The full Apache license below is a supplied local copy from Material Symbols, not a claim that
a matching Roboto source/license file was locally present. The primary sources in this section
were read on **2026-09-15**.

### Full Apache License 2.0

Exact local source: `node_modules/@expo-google-fonts/material-symbols/LICENSE_FONT`.
The bracketed examples in its appendix are part of the standard license, not invented Ghaf
copyright ownership.

```text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

## Candidate delivery boundary

A locally assembled candidate ZIP may retain the APK, its receipt and checksums, this notice
record, and the **complete supplied license files** side by side. The source files to preserve
without replacing their headers are:

- `node_modules/@expo-google-fonts/alexandria/LICENSE_FONT`
- `node_modules/@expo-google-fonts/readex-pro/LICENSE_FONT`
- `node_modules/@expo-google-fonts/material-symbols/LICENSE_FONT`
- The identical Expo font-package wrapper `LICENSE`, plus the exact embedded font copyright
  notices reproduced above and any verified native dependency notices.

This helper did not create that ZIP or alter the APK. Including notices addresses a concrete
distribution requirement; it does **not** grant commercial rights for the selected recordings,
generated images or logo, clear the unresolved Roboto provenance link, or establish full legal
compliance. Keep public/commercial distribution unresolved until the corresponding evidence is
recorded. A readable in-app notices surface and its standalone APK acceptance remain explicit
release gates even if a local ZIP includes companion license files.

## Verification and limits

**Executed:** read source references and existing manifests/provenance; read the three installed
font packages' licenses and versions; measure the configured fonts and exact d13 artifact inputs;
hash all 1,652 APK entries; parse packaged font metadata; inspect native dependency/resource
identifiers; perform bounded full-license/text-marker comparisons; read the official policy and
upstream license sources linked above. No private media, provider accounts or generation
credentials were inspected.

| Local font input                                      | SHA-256 measured 2026-09-15                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| `alexandria/700Bold/Alexandria_700Bold.ttf`           | `7c79ced75e6c6bc95a3bda85f867813d122f39afb61c6566c3c6a18c1e68b7c3` |
| `alexandria/800ExtraBold/Alexandria_800ExtraBold.ttf` | `4e6fa7f55a736f203d9e0b2605e8faffe5f64994745729ca9fec001f2ddd28bf` |
| `readex-pro/400Regular/ReadexPro_400Regular.ttf`      | `cf8d20680d810289ebbd85f219ecaf77d79a5a78094a1806ca1a42fcaf6fa81f` |
| `readex-pro/500Medium/ReadexPro_500Medium.ttf`        | `f5c313c71ad772613d16f5c979a4be59380b82dcd6da32d8de17702ebfda9fc8` |
| `alexandria/LICENSE_FONT`                             | `56372aed19c2701f50e6e784110af55bf8796ed51648805324ad1adb0a3860bb` |
| `readex-pro/LICENSE_FONT`                             | `b41267a3903a45955f77b44596e080480c577fb7221df59672d0bc8cd8cd4b6f` |

Paths in this table are relative to `node_modules/@expo-google-fonts/`. Artwork checksums remain
in their linked manifests and were not independently recalculated by this audit. Local audio
bytes were hashed and compared with the d13 APK as recorded above.

**Not executed:** new exports/builds; artifact checks beyond the exact d13 candidate; device or
user-viewable notice acceptance; public upload; new playback/listening or visual/cultural review;
provider account/license verification. Historical asset tests and decode results remain their
dated evidence, not new passes here. Reconcile any later artifact separately, close exact native
font provenance, preserve full notices in the actual distributed form, and obtain the explicit
rights decisions above. No assets or runtime behavior were changed by this document.

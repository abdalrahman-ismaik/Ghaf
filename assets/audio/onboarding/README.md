# Onboarding prepared audio

## Current Arabic selection — 2026-09-13

The user explicitly requested the supplied Arabic v2 recordings. Runtime now selects v2 for
all six topics in both ordinary and demo onboarding, including the replacement sustainability clip. English retains
its existing v1 mapping; English demo narration remains disabled.

The earlier empty `narration-ar-sustainability-v2.mp3` was replaced by the user and validated at
2026-09-13T09:07:55.016493+00:00. Its runtime source is now the v2 asset. All six Arabic sources are
available; missing-source guards remain for an explicitly unavailable source and preserve text-only
navigation without falling back to the rejected Arabic v1 narrator.

All six selected files pass ffprobe and full ffmpeg decoding. The earlier five hashes are unchanged;
only the replacement required a fresh decode. That verifies usable MP3 data,
not pronunciation, exact transcript parity or physical-device playback. The user selected v2;
recording provider/model, per-clip provenance, exact text review and native listening are not
established by the filenames. Earlier Wiam three-clip approvals do not automatically approve
these six separate files. No new voice generation, upload or provider request was made for this fix.

Current mapping: `src/components/onboarding/onboardingAudioSources.ts`. Repair/evidence details:
`docs/competition-readiness/workstreams/c-v2-narration.md`. Old recordings remain historical assets.

| Arabic v2 topic                    | Bytes  | SHA-256                                                            | Runtime  |
| ---------------------------------- | ------ | ------------------------------------------------------------------ | -------- |
| narration-ar-assistant-v2.mp3      | 176005 | `3a324868de8c377588ec44a524dba5a25ddc599e783a3d97fa2866aeb0755267` | Selected |
| narration-ar-family-v2.mp3         | 136717 | `12ab61cb8254ce3eafff0d688efaa0b7733a6282ec8a6216958a2d9fa6841d59` | Selected |
| narration-ar-growth-v2.mp3         | 196067 | `46e806eeccc019896a69b0f42664501f76fc6fc0dd1bd421fc95533969f25054` | Selected |
| narration-ar-intro-v2.mp3          | 167646 | `57ad68490b226182a130e51b88c7932ad613c18e094212f135a0a6fd14c3a180` | Selected |
| narration-ar-support-v2.mp3        | 182693 | `9b5e48a05da8f7e048dff6ac25f6bc098e258a08246992d264970d613b07789c` | Selected |
| narration-ar-sustainability-v2.mp3 | 164720 | `f2f0b5886529b8767c3747f0dbeb94a1535732fb96f8449ef5588bbe93330549` | Selected |

## Historical v1 authoring record

These files are prepared synthetic presentation assets for the local Ghaf prototype. They contain
only the public bilingual onboarding copy; no real Child, family, microphone, or user recording was
used. Runtime playback is local and offline through static Expo asset references.

### Narration

- Authoring date: 2026-09-07
- Authoring method: prepared synthetic voice generation used only during asset preparation
- Arabic voice: `ar-AE-FatimaNeural`, rate `+7%`, pitch `+2Hz`
- English voice: `en-US-EmmaMultilingualNeural`, rate `+8%`, pitch `+2Hz`
- Transcript: the exact localized title followed by body in `src/i18n/resources.ts`
- Classification: prepared synthetic voice, not a live model call, human performance, cloned
  personal voice, microphone capture, or proof that AI ran at runtime

The external authoring service received only the public onboarding scripts. Release activation
still requires the repository's named Arabic/UAE voice-quality and asset-rights review.

### SHA-256

```text
fc4087bf5a5e59d0c1288512de58bcac6b0a4a87705a24cce04df9f4f67253e8  narration-ar-assistant-v1.mp3
5e02bace02cddb1319a6677c60ec0fc9c303c8e9344caf9eca67b612c6757528  narration-ar-family-v1.mp3
fe4b87dcf80b8d3be8b2ee8270674ccbb92cfcfc54cc9c474e367e178a5f1522  narration-ar-growth-v1.mp3
38131e33c5c93b296ced5409dc1e15c10cdace738cbbb185368b30cd97efd9ea  narration-ar-intro-v1.mp3
52fd4432b94bfb4cf7b430ffabb9f0d4baf602955a10f37ccd7abeaccf56b777  narration-ar-support-v1.mp3
f66b189122b75fbcd132e789d975de32e8cd73b24368710fde2f6693b60108c1  narration-ar-sustainability-v1.mp3
be3fdb0a917883247e578c4e3c9c1e36c9001a58d1019c35898a05b62894f4fe  narration-en-assistant-v1.mp3
e81009220640720fc8092dffd2d4f466af4966af08577f8c2e515b0d0f80a02a  narration-en-family-v1.mp3
f2910a5688702d9fc7c91598e1e37de6d343bd196bf1ac04ff2407005e6570a7  narration-en-growth-v1.mp3
8c23f3754f890aa12093aa073993e72b46202616f1de7aeb8e9b4a45288f688c  narration-en-intro-v1.mp3
dea52ac08a0e9e060e88d02ba5da100d5a3a79155d5384e4ac5004d981bc4557  narration-en-support-v1.mp3
01656a08793bbea83cc471dc7b205772bec4114b63c471de363ba207e1031778  narration-en-sustainability-v1.mp3
```

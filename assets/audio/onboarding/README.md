# Onboarding prepared audio

These files are prepared synthetic presentation assets for the local Ghaf prototype. They contain
only the public bilingual onboarding copy; no real Child, family, microphone, or user recording was
used. Runtime playback is local and offline through static Expo asset references.

## Narration

- Authoring date: 2026-09-07
- Authoring tool: `edge-tts` 7.2.3, used only during asset preparation
- Arabic voice: `ar-AE-FatimaNeural`, rate `+7%`, pitch `+2Hz`
- English voice: `en-US-EmmaMultilingualNeural`, rate `+8%`, pitch `+2Hz`
- Transcript: the exact localized title followed by body in `src/i18n/resources.ts`
- Classification: prepared synthetic voice, not a live model call, human performance, cloned
  personal voice, microphone capture, or proof that AI ran at runtime

The external authoring service received only the public onboarding scripts. Release activation
still requires the repository's named Arabic/UAE voice-quality and asset-rights review.

## Nature ambience

`ambience-nature-v1.mp3` is a 48-second locally synthesized, non-verbal soundscape authored with
FFmpeg 7.1.1 from layered pink/brown noise and two quiet tonal bird-like accents. It contains no
downloaded field recording or third-party sample. Runtime volume is deliberately low, ducks below
narration, and playback stops when onboarding exits. App configuration keeps recording and
operating-system background playback disabled.

## SHA-256

```text
d597335684f17773f6ac4c258122951488468fb871af190d8fae171a45253d71  ambience-nature-v1.mp3
fc4087bf5a5e59d0c1288512de58bcac6b0a4a87705a24cce04df9f4f67253e8  narration-ar-ai-v1.mp3
5e02bace02cddb1319a6677c60ec0fc9c303c8e9344caf9eca67b612c6757528  narration-ar-family-v1.mp3
fe4b87dcf80b8d3be8b2ee8270674ccbb92cfcfc54cc9c474e367e178a5f1522  narration-ar-growth-v1.mp3
38131e33c5c93b296ced5409dc1e15c10cdace738cbbb185368b30cd97efd9ea  narration-ar-intro-v1.mp3
52fd4432b94bfb4cf7b430ffabb9f0d4baf602955a10f37ccd7abeaccf56b777  narration-ar-support-v1.mp3
f66b189122b75fbcd132e789d975de32e8cd73b24368710fde2f6693b60108c1  narration-ar-sustainability-v1.mp3
be3fdb0a917883247e578c4e3c9c1e36c9001a58d1019c35898a05b62894f4fe  narration-en-ai-v1.mp3
e81009220640720fc8092dffd2d4f466af4966af08577f8c2e515b0d0f80a02a  narration-en-family-v1.mp3
f2910a5688702d9fc7c91598e1e37de6d343bd196bf1ac04ff2407005e6570a7  narration-en-growth-v1.mp3
8c23f3754f890aa12093aa073993e72b46202616f1de7aeb8e9b4a45288f688c  narration-en-intro-v1.mp3
dea52ac08a0e9e060e88d02ba5da100d5a3a79155d5384e4ac5004d981bc4557  narration-en-support-v1.mp3
01656a08793bbea83cc471dc7b205772bec4114b63c471de363ba207e1031778  narration-en-sustainability-v1.mp3
```

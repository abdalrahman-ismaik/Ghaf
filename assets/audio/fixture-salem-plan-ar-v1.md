# Prepared fixture: `fixture_salem_plan_ar_v1`

- **Created**: 2026-08-26
- **Purpose**: Optional prepared Arabic if–then plan for the Feature 003 recycling task.
- **Origin**: Reviewed local transcript fixture; synthetic/prepared and not a real Child recording.
- **Binary status**: No reviewed synthetic audio binary is currently supplied. Runtime must show
  the transcript fallback, remain fully usable, and must not request microphone permission.
- **Runtime disclosure**: Label the fixture **prepared / synthetic**, say that a Parent can see it,
  keep it optional/removable, and never share it across households.

## Canonical transcript

> بعد أن يفحص الشخص البالغ المواد، أفرز المواد النظيفة القابلة لإعادة التدوير.

English equivalent:

> After the adult checks the items, I sort the clean recyclables.

The Arabic text is copied unchanged from the canonical prepared Child Coach fixture in
`DEMO_RUNBOOK.md`. It remains pending named fluent/cultural review and must not be improvised by
implementation code.

## Fallback contract

If no audio URI exists or playback fails, show the Arabic transcript, English equivalent, prepared
origin, and Coach steps. Completion, submission, and the fixed reward remain available. Do not
enable recording, background listening, upload, face/voice analysis, or a live Child provider.

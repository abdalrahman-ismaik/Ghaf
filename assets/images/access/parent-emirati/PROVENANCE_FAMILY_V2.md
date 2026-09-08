# Emirati Parent Family Access Portrait Provenance

## Active Feature 009 asset

- Path: `assets/images/access/parent-emirati/parent-access-emirati-family-v2.jpg`
- Purpose: decorative Parent sign-in, sign-up, and verification family portrait
- Generator: OpenAI built-in imagegen, using the preserved v1 synthetic father portrait as the
  edit/style reference
- Generation date: 2026-09-08
- Subjects: exactly one fictional synthetic adult Emirati father and one fictional synthetic adult
  Emirati mother; no Child or real user data
- Attire: white kandura, white ghutra, and black agal; traditional black abaya and black shayla-
  style hijab
- Source: generated opaque RGB PNG, 1536×1024
- Final: opaque JPEG, 1200×800, 113,758 bytes
- SHA-256: `4e8d8e61a58840a1b3f21e5f8e4665503d9fe1d57b279491ef1e65b525e639fa`
- Routes: `/access/parent/sign-in`, `/access/parent/sign-up`, and
  `/access/parent/verification`
- Accessibility: decorative and removed from the accessibility tree
- Product authority: none; the portrait does not authenticate, identify, authorize, select a
  profile, or calculate any state
- Named Emirati cultural review: `NOT RUN`
- Named safeguarding, Arabic/UAE, accessibility, visual, and image-rights review: `NOT RUN`
- Physical Android rendering: `NOT RUN`

The user explicitly requested adding a fictional Emirati woman wearing traditional abaya and
hijab to the Parent login imagery. The result presents two adults with equal visual prominence; it
does not establish their legal relationship or claim that one appearance represents every Emirati
Parent or guardian. It contains no Child, text, logo, device, badge, reward, task evidence, or
environmental-impact claim.

## Exact generation input

The exact prompt is stored in `GENERATION_PROMPT_FAMILY_V2.txt` and embedded in the shipping JPEG's
`impeccable:prompt` COM segment. The image-edit reference was
`parent-access-emirati.jpg`, whose own generation history remains preserved below.

## Transformations and inspection

1. Generated once with OpenAI built-in imagegen from the exact prompt and v1 local reference.
2. Inspected the original 1536×1024 output for exactly two adults, requested attire, facial and
   fabric integrity, balanced prominence, prohibited props/text, Ghaf setting, and centered crop
   safety.
3. Resized to 1200×800 with FFmpeg Lanczos scaling and encoded as an opaque JPEG at q=3 with input
   metadata removed.
4. Embedded the exact generation prompt in the JPEG COM segment with the repository's Impeccable
   prompt tool.
5. Re-inspected the final 1200×800 asset. Named-human review and physical Android rendering remain
   unobserved.

## Preserved v1 reference asset

- Path: `assets/images/access/parent-emirati/parent-access-emirati.jpg`
- Purpose: original one-father access portrait and retained rollback/reference candidate
- Generator: OpenAI built-in imagegen
- Generation date: 2026-09-07
- Subject: one fictional synthetic adult Emirati father; no Child or real user data
- Source: generated opaque RGB PNG, 1536×1024
- Final: opaque JPEG, 1200×800, 91,432 bytes
- SHA-256: `7e66f4bf7459196b04635793bef3c48c5eb2dd3dc6139dcb5a3fcde1a3a081f2`
- Exact prompt: `GENERATION_PROMPT.txt`, also embedded in the JPEG
- Runtime status: preserved but no longer selected by the Feature 009 source registry

The v1 file is not overwritten or deleted so its original prompt, checksum, subject count, and
audit trail remain truthful.

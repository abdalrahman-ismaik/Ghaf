# Prototype Limitations

## Repository Status

> Ghaf is an MVP Prototype for competition evaluation. It is designed to demonstrate the product concept, core interactions, AI value, cultural identity, visual quality, and sustainability impact. It is not intended to demonstrate production infrastructure, regulatory compliance, financial integration, large-scale security, or store-ready deployment.

**Project:** Ghaf — غاف

**Stage:** MVP Prototype

**Purpose:** SMAC 2026 competition demo

**Production-ready:** No

The repository is intentionally bounded to a single Expo application, one synthetic family, one
Parent, one Child, a small approved screen set, replaceable local services, and a deterministic
competition fallback. Feature 001 establishes the app foundation. Feature 002 is planning-only
until the team reviews its initial technical plan.

## Capability Boundaries

### Real for the competition prototype

Once verified on the target build, these interactions are implemented by the application rather
than represented by slides:

- mobile navigation among the approved routes;
- Arabic/English selection and locale-aware RTL/LTR presentation;
- Parent/Child role switching on one device;
- Parent mission-review and Child mission-completion interactions planned for Feature 002;
- impact-state update, Ghaf stage change, and demo reset planned for Feature 002;
- a local typed service boundary that screens can consume.

Web runtime claims are recorded in the README and demo runbook. Native Android, preview-build, and
physical-device claims remain `NOT RUN` until direct device evidence is recorded.

### Mocked

- Mission, media, AI, impact, and prototype-session providers use deterministic local `Mock*`
  implementations in the foundation.
- AI processing may be shown as timed visual stages.
- Voice transcription, image interpretation, evidence review, Parent notifications, persistence,
  and authentication may be simulated during the initial competition build.
- No external service is required to complete the mock path.

### Seeded

- One family, one Parent profile, one Child profile, and one assigned mission use synthetic data.
- Reset impact is 1,250 rescued grams, 5 rescued portions, 3 completed missions, and a 2-day streak.
- Reset Ghaf progress is stage 2 (Sapling) at 48%.
- Prepared images, audio, evidence, and demonstrations must be team-created or safely licensed and
  contain no real child information.

### Pregenerated

- Feature 001 mission copy is a curated bilingual fixture with source `pregenerated-mock`.
- A pregenerated mission can remain the Feature 002 offline fallback even if a live AI adapter is
  later added.
- Pregenerated content must not be introduced as a live model response.

### Optional later, if the mock journey is complete

- one minimal server-side proxy for transcription and structured mission generation;
- `expo-audio` playback and visible-action recording;
- `expo-image-picker` and, only if necessary, camera capture;
- local persistence or small Supabase storage;
- saved mission history.

Each optional capability needs a reviewed plan change and must preserve the deterministic offline
fallback. An OpenAI secret belongs only on the server side, never in the mobile bundle.

### Explicit future work

- production registration, authentication, child accounts, password recovery, and authorization;
- production privacy controls and legal/compliance work;
- multiple families, schools, administration, and tenancy;
- banking, payment cards, real financial rewards, and a marketplace;
- social feed, unrestricted chat, advanced analytics, and production notifications;
- scalable backend, production monitoring, deployment automation, store signing, and release;
- accurate computer-vision measurement of food weight or food-safety assessment.

These are not missing deliverables for the SMAC 2026 prototype.

## Minimum Safeguards

The prototype retains only these bounded safeguards:

1. Never commit API keys.
2. Never place an OpenAI secret key directly inside the mobile application.
3. Use synthetic or team-created demo information rather than real child data.
4. Audio recording begins only after a visible microphone action.
5. Do not implement continuous or background recording.
6. Do not claim that AI can determine whether food is safe to eat.
7. Parent approval remains part of the experience.
8. Do not claim the prototype is production-ready or legally compliant.

These safeguards do not create a separate threat-modeling, incident-response, compliance,
retention-policy, enterprise secrets, or penetration-testing workstream.

## Known Technical Limitations

- Foundation state is in memory; a reload may discard changes before reset.
- Native global direction changes may require an app reload, especially during Expo development.
  Screen-level logical alignment is the fallback, and the final result still needs physical Android
  verification.
- Impact values are simplified estimates entered or seeded for demonstration; they are not audited,
  weighed, or derived from a reliable vision model.
- Mock AI does not transcribe speech, interpret images, judge evidence, or contact a model.
- Prepared-media and simulated-loading paths favor demo reliability over live-input realism.
- The Ghaf tree uses deterministic discrete stages, not biological simulation or real-time 3D.
- Role switching replaces authentication and does not enforce identity or permission boundaries.
- Native Android package and iOS bundle identifiers are provisional.
- Automated tests are deliberately focused; there is no broad production regression suite.
- iOS and web are secondary convenience surfaces and may not receive the same rehearsal depth.

## Claims the Team Must Avoid

Do not say or imply that the prototype:

- is production-ready, store-ready, legally compliant, or secure for real child data;
- has continuous listening, autonomous Child chat, or objective food-safety intelligence;
- measures food weight accurately from an image;
- provides real money, banking, or marketplace rewards;
- operates live AI, storage, notifications, or evidence review when the demo is using a mock;
- supports multiple families, schools, or production accounts.

Use direct language during the pitch: the interaction and product concept are real; selected AI,
media, evidence, and persistence steps are deliberately mocked or pregenerated for a reliable MVP
Prototype demonstration.

# Screen and State Map — Ghaf R001 Batch 1

**Scope:** Welcome and first-time Parent onboarding only

## Journey

```text
Arabic-first welcome
  → Parent sign-in
  → six-digit verification
  → family basics (1/3)
  → first Child (2/3)
  → review (3/3)
  → native success sheet
  → Parent Home integration destination
```

The Child action on Welcome does not enter the historical `/role` route. Until approved Child
access frames arrive, it presents a localized, non-blaming unavailable state and stays on Welcome.

## Screen-State Inventory

| Screen                 | Canonical default                                                                            | Inputs and actions                                                     | Native states required in this release                                                                               | Exit                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Welcome                | Arabic RTL hero, language action, organic field                                              | Change locale; Parent entry; Child entry                               | Arabic, English parity, Child-unavailable notice, offline-equivalent local state                                     | Parent entry opens sign-in                                                                      |
| Parent sign-in         | Empty phone/email field, primary action, simulated biometric alternative, create-family link | Enter identifier; Continue; simulated biometric; Back                  | Empty/disabled, focused, invalid, loading, offline fallback, success                                                 | Verification for first-time fixture; `/parent` only for an approved returning synthetic fixture |
| Verification           | Six empty visual cells, countdown, disabled Verify                                           | Enter/paste/delete six digits; resend; change identifier; Verify; Back | Empty, partial, focused, complete/enabled, invalid, resend-waiting, resend-ready, loading, offline fallback, success | Family basics on valid local code                                                               |
| Family basics          | `عائلة النخلة`, Arabic selected, 1/3                                                         | Edit display name; choose Arabic/English; Continue; Back               | Focused, invalid/empty, disabled, loading, offline fallback, success                                                 | Add first Child                                                                                 |
| Add first Child        | Salem, selected tree symbol, 9–11, Arabic, simpler instructions, 2/3                         | Edit nickname; select avatar/age/language/supports; Continue; Back     | Focused, validation error, selected/unselected/multiselect, disabled, loading, offline fallback, success             | Review                                                                                          |
| Review and create      | Read-only family/Child summary and four access/privacy statements, 3/3                       | Create; return to edit; Back                                           | Ready, disabled, loading, local failure/offline fallback, success receipt                                            | Success modal or Add first Child                                                                |
| Family-created success | Review remains visually behind a dimmed modal sheet                                          | Dismiss/Back; go to Home                                               | Opening/open, focus contained, dismissed, navigation loading, completed                                              | `/parent` by history replacement                                                                |

## Deterministic Local Fixture

The batch uses synthetic local values only:

- Parent identifier example: `+971 50 123 4567`; stored only in the current in-memory prototype
  session.
- Verification: one six-digit local fixture; the implementation fixture is `424242`. It performs no
  SMS, email, network, cryptographic, or identity-verification operation.
- Family onboarding draft: `عائلة النخلة` / `Palm Family`.
- First Child: `سالم` / `Salem`, age band 9–11, Arabic preference, and simpler-instructions support.
- Camera and microphone remain off. No Child email, phone, location, school, medical record, photo,
  or voice is collected.

`عائلة النخلة` is a screen-local onboarding draft selected by the approved frame. It does not
replace the canonical Al Noor household used by the later full Revision 2 demonstration contract.
Until that domain migration is separately released, entering `/parent` must not be described as a
persisted production account or completed household migration.

## Bilingual Terminology Contract

| Arabic                              | English                             | Use                                                            |
| ----------------------------------- | ----------------------------------- | -------------------------------------------------------------- |
| دخول وليّ الأمر                     | Parent access                       | Welcome action; do not call it production login security       |
| دخول الطفل                          | Child access                        | Unavailable in this batch without opening Parent mode          |
| رقم الهاتف أو البريد الإلكتروني     | Phone number or email               | Synthetic Parent identifier                                    |
| رمز التحقق                          | Verification code                   | Local six-digit demo code; no message or identity verification |
| اسم العائلة داخل التطبيق            | Family name in the app              | Local display name, not a legal household name                 |
| اسم الطفل داخل التطبيق              | Child name in the app               | Short name or nickname, not a legal name                       |
| الفئة العمرية                       | Age band                            | 6–8, 9–11, or 12–14; never diagnosis or maturity score         |
| اللغة المفضلة                       | Preferred language                  | Child content preference; Arabic, English, or both             |
| ما الذي يساعده؟                     | What helps?                         | Optional supports, never medical labels                        |
| راجع إعداد العائلة                  | Review family setup                 | Review before local creation                                   |
| عائلتكم جاهزة                       | Your family is ready                | Local synthetic success only                                   |
| نسخة تجريبية محلية ببيانات اصطناعية | Local prototype with synthetic data | Persistent capability disclosure                               |

All user-facing copy resolves from the bilingual resources. Safety/capability meaning is
equivalent across locales even though only Arabic composition frames were supplied.

## Validation Rules

- Identifier: trim Unicode whitespace; accept a conservative synthetic phone or email shape; show a
  localized inline error and preserve input on rejection.
- Verification: accept decimal digits only, normalize Arabic-Indic digits, support paste and
  deletion through one native input, and compare with the local fixture. Invalid code changes no
  access state.
- Family name and Child nickname: trim, require a short non-empty display value, keep it local, and
  never imply a legal name.
- Age band and preferred language are required; accessibility supports are optional and
  multiselect.
- `both` is valid only as the Child's content preference. It does not make an ordinary screen show
  two locales simultaneously.
- Create is idempotent within the current session. Repeated submission reuses the local success
  receipt and does not create another profile.

## Offline and Failure Meaning

Offline is a successful deterministic fallback for every released transition because no remote
service is required. A synthetic delay may demonstrate loading, but it must settle locally and must
not imitate a real SMS, biometric, account, or cloud failure. The UI retains draft data across
validation and recoverable local errors. Reload persistence is not claimed.

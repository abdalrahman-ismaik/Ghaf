# Data Model: Role Header Branding

This feature creates no persisted or domain data.

## Presentation Value: Role Header Title

| Field | Type | Constraint |
|---|---|---|
| `title` | localized visible string | Existing route-owned resource; remains the sole heading |
| `direction` | `rtl` or `ltr` | Existing session direction; controls logical mark/title order |
| `language` | Arabic or English, optional | Existing screen language; supplies title accessibility language |
| `tone` | brand or neutral | Finite visual treatment matching the existing header family |
| `scale` | compact or prominent | Finite mark/title relationship; never arbitrary route sizing |

## Invariants

- The mark has no product state, tap action, route action, or independent spoken label.
- The title remains visible and readable if the image cannot decode.
- Role authority, locale, route, task, reward, League, growth, and assistant state are unchanged.
- A screen receives at most one top-header mark from its shared header family.
- Official asset identity and dimensions are unchanged.

# Ghiraas-inspired Ghaf poster — 13 September 2026

The user rejected the earlier generic poster, supplied a Ghiraas PowerPoint reference and asked for a similar Ghaf poster. A new A1 portrait poster is complete for user review, preserving the original reference, previous poster and other sessions' application changes.

## Deliverable

Local packet: `/home/smyk/projects/Ghaf/output/poster-20260913-ghiraas-inspired/`.

The `deliverables/` directory contains the PRINT PowerPoint, editable PowerPoint, print PDF, preview PNG, 240 ppi PNG, outlined SVG and usage instructions. `Ghaf-SMAC-2026-Poster-Package.zip` adds the supplied-font bundle, reference review and speaking notes. No reference artwork or private team details are added to tracked source.

The redesign adapts the reference's strong green masthead, problem/solution narrative, screenshot-supported features, engineering diagram and intended-value section. Ghaf-specific content covers prepared Parent guidance, Child choice/help, praise before one recognition, the observed 48→60 Seeds and Mangrove Sapling 60/60, and five fair weekly League opportunities. It uses the selected 5A logo, Alexandria/Readex typography and six genuine Arabic/English app captures. There are 362 editorial words and 63 editable text boxes.

The supplied reference's local PowerPoint render diverged from its embedded thumbnail, including wrapped branding and text collisions. The print delivery therefore uses outlined vector text and an embedded PNG fallback. The editable master retains real text and original pictures and requires the included fonts; it is not represented as font-independent.

## Evidence

- `build-manifest.json`: exact source-image hashes, provenance, positions, typography and effective resolution.
- `verification.json`: 21/21 delivery checks passed, including one-slide exact A1 geometry, ZIP integrity, self-contained assets, byte-identical embedded pictures, no text-box overflow, editable text fit in actual PowerPoint, Arabic glyph presence and no missing body glyphs.
- `final-print-render/`: the exact PRINT PowerPoint opened and exported successfully with no authoring-font registration; lead visually inspected its resulting PNG.
- `final-editable-render/`: exact editable file opened and exported in PowerPoint with both fonts temporarily registered and subsequently removed. All 63 actual text bounds fit.
- `REFERENCE-REVIEW.md`: reference evaluation, adoption decisions, prior-poster critique and provenance limits.
- `SPEAKING-NOTES.md`: suggested 75–90 second walkthrough; timing was not human-rehearsed.

The Parent Guide screenshot is preserved from 12 September runtime `98be865`; the other five are from the 13 September independent Firefox audit at `f89f87a`. These are explicitly dated captures, not fresh observations of later source changes. The older Guide screen retains its original small header mark; screenshot pixels were not retouched. App captures have approximately 127–464 ppi at their placed sizes. Larger editorial labels carry the narrative; a higher-resolution container does not add detail to the original screens.

An independent read-only helper reviewed claims and the completed layout. It found one initial mismatch between the Mangrove thumbnail and the audited stage; the final files use `mangrove-sapling.jpg`. The lead also corrected initially missing Arabic text, an unsupported body arrow glyph and three native text-box width tolerances. Failed/intermediate render evidence remains locally traceable.

## Scope and handoff

Only this new report and the isolated output packet were written. The authoring work reused the existing isolated Python/PowerPoint tooling; no app dependency, runtime, test, flag, Metro, native-build or coordination file was changed. App checks were not rerun because application behavior was outside the task. The report received a scoped formatting and whitespace check.

Lead contribution: reference inspection, layout/copy, reproducible PPTX/PDF/vector generation, render inspection, mechanical verification and packaging. One bounded helper contributed read-only evidence/visual review; no descendants or human review are claimed. Existing owner-supplied team details remain only in ignored poster outputs.

Boundary ready for integration and user review. Output/report writer scopes are released at handoff. Human approval, physical print and physical Android remain NOT RUN for this task; no submission, push, merge or deployment occurred. No live AI, measured environmental impact, indefinite demo persistence or production capability is advertised.

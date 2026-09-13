# Contract: Parent Task Workspace

1. The create action is outside all rails and remains visible with or without a journey.
2. All Children and per-Child controls are radios with 48 dp targets and selected state.
3. Category/template rails are manual, horizontal, RTL-aware, and show a partial next card.
4. Required safety, privacy, approval, and executable-state information is never rail-only.
5. Saved-template read failure returns an empty, unavailable state; it never blocks the P0 task.
6. Save/reuse/delete require an active Parent experience and cannot mutate journey authority.
7. Flag off renders the existing R002a Tasks and builder behavior without new storage reads.

## Context

The existing comment implementation is concentrated in `client/src/page/feed.tsx`. The form currently renders as a basic card with labels and inputs, but it does not explain required fields until the user encounters a server-side validation error. Comment items still render author avatars even though the discussion layout can already identify the author through name, link, admin badge, timestamp, and reply context. The requested change is UI-only and should stay inside the existing feed page and translation resources.

## Goals / Non-Goals

**Goals:**
- Present required comment fields before the user interacts with the form.
- Remove avatars from comment cards without losing author identity or reply context.
- Make the composer and comment list feel more cohesive with the existing theme utilities and card styles.
- Improve interaction polish with clearer submit states, reply focus behavior, and more graceful empty or error presentation.

**Non-Goals:**
- Changing comment APIs, validation rules, or persistence behavior.
- Introducing new design dependencies or a shared comment component library.
- Reworking unrelated feed page sections outside the comment area.

## Decisions

- Keep the change local to `feed.tsx` and locale JSON files.
  - Rationale: the entire comment experience already lives in one page module, and the requested work is a focused UI polish rather than a reusable architecture change.
  - Alternative considered: extracting new shared components for cards and fields. Rejected because it adds structure without reuse.
- Replace avatar-led comment rows with card-led comment rows.
  - Rationale: removing the avatar should not leave a visual void, so each comment will use spacing, borders, metadata grouping, and nested reply containers to preserve hierarchy.
  - Alternative considered: replacing avatars with initials or icons. Rejected because it still behaves like an avatar and does not satisfy the request cleanly.
- Add up-front guidance plus inline required markers and computed submit readiness.
  - Rationale: users should know the expectations immediately, and the submit button should reflect whether the minimum required inputs are present before making a request.
  - Alternative considered: keeping only server-returned validation alerts. Rejected because it is reactive rather than elegant.
- Improve reply interaction by bringing focus back to the composer and making the reply target state visually explicit.
  - Rationale: reply intent should feel connected to the composer instead of split between distant UI elements.
  - Alternative considered: keeping the current static reply banner only. Rejected because it misses a simple flow improvement.

## Risks / Trade-offs

- [A larger `feed.tsx` component becomes harder to scan] → Keep the changes scoped and introduce only small helpers where they reduce duplication.
- [More visual treatment could clash with dark mode or theme colors] → Reuse existing utility classes (`bg-w`, `bg-secondary`, `t-primary`, `t-secondary`, `theme`) instead of inventing a new palette.
- [Client-side submit gating could diverge from server validation] → Only gate on the existing required fields and keep server-side error normalization intact.

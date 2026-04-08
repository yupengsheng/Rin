## Context

Rin’s current architecture still carries multiple product signals from a broader hosted-blog-platform mindset: GitHub OAuth remains supported in auth status and runtime wiring, public reading surfaces still show per-user identity, and several workflows assume the presence of more than one user. For a single-author personal blog, this complexity increases setup burden, creates unnecessary UX branches, and makes the product story less coherent.

## Goals / Non-Goals

**Goals:**
- Make the supported authentication path clearly single-owner and password-admin based.
- Remove or hide public multi-user cues so the product reads as one author publishing under one site identity.
- Set safer defaults for a personal blog deployment so optional community features do not dominate the baseline experience.
- Capture the migration work needed to move existing installs toward the new product posture.

**Non-Goals:**
- Removing comments, moments, or blogroll features entirely in this change.
- Re-architecting the database away from the existing `users` table in one pass.
- Rebranding the entire visual design system beyond the product-positioning changes required here.

## Decisions

- Keep a single admin account model, but retain the underlying user record for compatibility.
  - Rationale: this lets the product remove multi-user UX without forcing an immediate deep schema rewrite.
  - Alternative considered: deleting all user-model concepts outright. Rejected because it raises migration risk and broadens scope.
- Remove GitHub OAuth from supported auth flows instead of leaving it as a dormant option.
  - Rationale: hiding only the button still leaves complexity in config, docs, runtime checks, and support burden.
  - Alternative considered: leaving OAuth in code but disabled by default. Rejected because it preserves conceptual sprawl.
- Public pages should present site identity, not author identity, when the product is in personal-blog mode.
  - Rationale: article and moment pages currently duplicate information the reader already understands: this is one person’s site.
  - Alternative considered: keep author UI but auto-fill from the admin user. Rejected because it still communicates a multi-user frame.
- Personal-blog defaults should explicitly reduce community-style workflows.
  - Rationale: friend-link applications, login affordances, and profile management should not appear central in the default product.
  - Alternative considered: keep current defaults and rely on documentation. Rejected because defaults define the real product.

## Risks / Trade-offs

- [Existing installs may rely on GitHub OAuth] → Provide a migration checklist and flag the change as breaking in proposal/spec/tasks.
- [Some internal code paths still assume user identity is meaningful publicly] → Stage the implementation so auth simplification lands before public-surface cleanup.
- [Features like moments and blogroll may still feel platform-like even after auth cleanup] → Reinterpret them under site identity and review whether they remain first-class in defaults.

## Migration Plan

1. Introduce the single-author product contract in docs, config defaults, and auth requirements.
2. Remove GitHub OAuth from runtime status and UI, keeping password-admin login as the only supported path.
3. Replace public author/profile rendering with site-level identity on article and moment surfaces.
4. Revisit optional features such as friend applications and profile management so they either disappear from the default path or move behind admin-only workflows.
5. Validate an upgrade path for existing sites that already have an admin user record.

## Open Questions

- Should `Moments` remain a first-class public nav item in the personal-blog default, or become an opt-in module?
- Should friend-link applications be disabled by default or removed from the public UI entirely in personal-blog mode?
- Should commenter email become optional as part of the same simplification, or stay in a separate change focused on comment UX and spam control?

## Why

The current comment area works functionally, but it feels visually detached from the rest of the feed page and exposes important form expectations too late. Hiding comment avatars, surfacing required fields up front, and smoothing reply and submit interactions will make the discussion experience calmer and more coherent.

## What Changes

- Remove avatar rendering from comment items and redesign the comment card layout around author metadata, content, and reply actions.
- Refresh the comment composer with stronger visual hierarchy, up-front required field guidance, and clearer field labeling.
- Improve interaction details around replying, validation, submission state, and empty/error states so the flow feels more polished.
- Add the supporting i18n copy needed for the updated composer and comment list presentation.

## Capabilities

### New Capabilities
- `comment-experience`: Defines the required presentation and interaction behavior for the comment composer and comment thread UI.

### Modified Capabilities

## Impact

- Affected code: `client/src/page/feed.tsx`
- Affected copy: `client/public/locales/en/translation.json`, `client/public/locales/zh-CN/translation.json`
- No API or data model changes

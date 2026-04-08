## 1. Product Contract

- [x] 1.1 Update documentation and product-facing copy to describe Rin as a single-author personal blog system.
- [x] 1.2 Audit configuration defaults and settings labels to identify values that still assume a platform or multi-user posture.

## 2. Authentication Simplification

- [x] 2.1 Remove GitHub OAuth from supported authentication flows, status reporting, and public login affordances.
- [x] 2.2 Collapse admin access around the configured password-admin path and decide how legacy profile management should behave in single-author mode.

## 3. Public Surface Simplification

- [x] 3.1 Remove redundant author presentation from article, moment, and related public content surfaces where site identity already establishes authorship.
- [x] 3.2 Review public navigation and account-oriented UI to remove cues that imply a reader-facing account system.

## 4. Personal-Blog Defaults

- [x] 4.1 Rework optional community features such as friend applications so they are disabled or deemphasized by default.
- [ ] 4.2 Validate the resulting product flow against the personal-blog positioning and capture any follow-up changes needed for comments, moments, or blogroll scope.

## Notes

GitHub OAuth endpoints still exist server-side for backward compatibility, but they are no longer exposed through supported client auth flows, status reporting, or public navigation.

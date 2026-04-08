## Why

Rin currently presents itself as a more general multi-user blog platform, but the intended product direction is a personal, single-author blog system. Keeping GitHub OAuth, user-profile semantics, and redundant public author surfaces adds product complexity without improving the core value for a solo writer.

## What Changes

- **BREAKING** Remove GitHub OAuth and any public-facing multi-user registration path from the supported product flow.
- Simplify authentication to a single administrator access model centered on password-based admin login.
- Reframe public content surfaces around site identity instead of per-user identity, removing redundant author presentation where the site has only one author.
- Change default configuration and UX assumptions to favor personal-blog publishing rather than community or platform-style workflows.
- Update product copy and documentation so the system is described as a personal blog engine first.

## Capabilities

### New Capabilities
- `single-author-auth`: Defines the authentication and admin-access rules for a single-owner blog.
- `single-author-reading-experience`: Defines how public content surfaces behave when the site has one author and should present site identity over user identity.
- `personal-blog-defaults`: Defines the default configuration and product posture for a personal blog deployment.

### Modified Capabilities

## Impact

- Affected server code: authentication services, user/profile flows, auth status endpoints, related config handling
- Affected client code: login/profile pages, public reading surfaces, moments and article metadata, settings and navigation copy
- Affected config defaults: login, friend-application posture, public feature assumptions
- Affected docs: README and product-facing setup guidance

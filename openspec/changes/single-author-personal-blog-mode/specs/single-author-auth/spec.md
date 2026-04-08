## ADDED Requirements

### Requirement: Authentication SHALL support a single administrator product model
The system SHALL support a single-owner personal blog model in which administrator access is obtained through password-based admin login and not through public multi-user registration flows.

#### Scenario: Auth status for personal blog mode
- **WHEN** the client requests authentication status for a default personal-blog deployment
- **THEN** the system reports password admin login as the supported path
- **AND** the system does not advertise GitHub OAuth as an available sign-in option

#### Scenario: Admin access
- **WHEN** the owner provides valid configured administrator credentials
- **THEN** the system grants administrator access
- **AND** the system does not require any GitHub OAuth setup

### Requirement: Public product flows SHALL not imply multi-user registration
The system SHALL avoid exposing public login or registration expectations that suggest a community or multi-account product model.

#### Scenario: Public site navigation
- **WHEN** a reader visits the public site
- **THEN** the default experience does not present GitHub login or registration-oriented affordances as part of normal reading

#### Scenario: Profile semantics
- **WHEN** the owner manages site identity
- **THEN** the supported workflow is aligned with a single site owner rather than a general end-user profile system

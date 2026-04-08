## ADDED Requirements

### Requirement: Default configuration SHALL favor a personal blog deployment
The system SHALL ship with defaults that reflect a personal single-author blog rather than a multi-user platform.

#### Scenario: Fresh deployment defaults
- **WHEN** a new site is configured with default client and server settings
- **THEN** the defaults favor single-owner publishing behavior
- **AND** optional community-oriented workflows are not central to the baseline experience

#### Scenario: Documentation and product language
- **WHEN** users read setup or feature documentation
- **THEN** the product is described as a personal blog engine first

### Requirement: Optional community-style features SHALL be secondary
The system SHALL treat workflows such as public friend-link applications or profile-centric account management as optional, secondary capabilities in a personal-blog deployment.

#### Scenario: Friend-link workflow defaults
- **WHEN** the site is using the personal-blog default posture
- **THEN** public friend-link application behavior is disabled or otherwise deemphasized by default

#### Scenario: Settings presentation
- **WHEN** the owner configures the site
- **THEN** settings prioritize writing, publishing, and site identity over multi-user or platform operations

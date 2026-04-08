## ADDED Requirements

### Requirement: Public content surfaces SHALL present site identity over author identity
The system SHALL present the blog as a single-author site, avoiding redundant per-post author identity when the product is configured for one author.

#### Scenario: Article display
- **WHEN** a reader opens an article page
- **THEN** the page does not show redundant per-user author identity if that identity is equivalent to the site owner

#### Scenario: Moment display
- **WHEN** a reader opens the moments stream
- **THEN** the UI does not frame each item as content from a distinct user account

### Requirement: Personal-blog reading flows SHALL prioritize the reader over account semantics
The system SHALL keep reading surfaces focused on content, chronology, and site-level identity instead of account-management cues.

#### Scenario: Public content metadata
- **WHEN** content metadata is rendered on public pages
- **THEN** the metadata emphasizes publish/update context, series context, or site context instead of multi-user account framing

#### Scenario: Personal blog navigation
- **WHEN** the public navigation is rendered
- **THEN** it prioritizes reading and publishing sections appropriate for a personal site over community-account workflows

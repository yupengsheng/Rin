## ADDED Requirements

### Requirement: Comment composer discloses required information before submission
The system SHALL present required comment fields and publishing expectations before the user submits a comment.

#### Scenario: Initial composer render
- **WHEN** the comment composer is rendered
- **THEN** the UI shows which fields are required before any validation error occurs

#### Scenario: Required labels remain visible while typing
- **WHEN** the user fills or edits the composer fields
- **THEN** the required markers and helper guidance remain visible without waiting for a failed submit

### Requirement: Comment threads render without avatars
The system SHALL render comments and replies without showing author avatar images while preserving author identity and thread hierarchy.

#### Scenario: Root comment display
- **WHEN** a top-level comment is displayed
- **THEN** the UI shows the author name, metadata, content, and actions without rendering an avatar

#### Scenario: Reply display
- **WHEN** a reply comment is displayed
- **THEN** the UI preserves nesting and reply context without rendering an avatar

### Requirement: Comment interactions feel graceful and explicit
The system SHALL provide clearer interaction feedback for replying and submitting comments.

#### Scenario: Reply action
- **WHEN** the user chooses to reply to a comment
- **THEN** the composer shows the reply target clearly and moves the user back toward the compose area

#### Scenario: Submit readiness
- **WHEN** required fields are incomplete or a submission is in progress
- **THEN** the submit action reflects that state instead of appearing immediately ready

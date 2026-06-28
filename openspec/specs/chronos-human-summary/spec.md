# Delta for chronos-human-summary

## Requirements

### Requirement: Human-readable change guide
The system MUST provide a human-facing summary document for the Chronos MVP change set. The document MUST be quick to scan, readable in under 30 minutes, and written to help reviewers understand the OpenSpec artifacts without reading every spec in full.

#### Scenario: New reader gets oriented quickly
- GIVEN a reader opens the summary document first
- WHEN they scan it
- THEN they understand the purpose of the change and the main artifacts

#### Scenario: Reader can finish within a short review window
- GIVEN the reader has limited time
- WHEN they follow the summary
- THEN they can understand the change set in under 30 minutes

### Requirement: Artifact map and reading order
The system MUST explain the OpenSpec artifacts for the change and MUST present a recommended reading order that makes the spec set easy to navigate.

#### Scenario: Reader follows the guide
- GIVEN the change includes multiple artifacts
- WHEN the reader uses the summary document
- THEN they can identify what each artifact covers
- AND they can choose a sensible reading order

#### Scenario: Reader looks for scope boundaries
- GIVEN the reader wants to know what is in scope
- WHEN they read the summary document
- THEN they can distinguish the MVP scope from out-of-scope items

# Delta for chronos-mvp-core

## Requirements

### Requirement: Daily chronogram
The system MUST present a daily horizontal timeline as the primary execution surface. Blocks MUST appear as colored spans, and a current-time indicator MUST show the present moment on that same timeline.

#### Scenario: Planned day view
- GIVEN a day with scheduled blocks
- WHEN the user opens the daily view
- THEN the blocks are shown in time order on a horizontal timeline
- AND each block is visually distinguished by color

#### Scenario: Empty or partially planned day
- GIVEN a day with no blocks or gaps between blocks
- WHEN the user opens the daily view
- THEN the timeline is still visible
- AND the current-time indicator is still shown

### Requirement: Weekly planning calendar
The system MUST provide a weekly planning calendar for creating and editing blocks before execution. The weekly view MUST support moving blocks across days and adjusting planned time ranges.

#### Scenario: Plan ahead for the week
- GIVEN the user is in planning mode
- WHEN the user creates or edits a block in the weekly calendar
- THEN the block is stored as a planned time block

#### Scenario: Reschedule a block
- GIVEN a planned block exists on one day
- WHEN the user moves it to another day in the weekly calendar
- THEN the planned schedule updates to the new day and time

### Requirement: Block model and lifecycle
The system MUST classify each block as work, home activity, or training, and each block MUST move through planning, execution, and conclusion phases.

#### Scenario: Create a categorized block
- GIVEN the user creates a new block
- WHEN the user selects a category
- THEN the block is saved as work, home activity, or training

#### Scenario: Advance through block phases
- GIVEN a block is planned
- WHEN the user starts it and later concludes it
- THEN the block transitions from planning to execution to conclusion

### Requirement: Task movement into blocks
The system MUST maintain a general task list and MUST allow tasks to be moved into a specific block while preserving the task as a trackable item.

#### Scenario: Move a task into a block
- GIVEN a task exists in the general task list
- WHEN the user assigns it to a block
- THEN the task becomes associated with that block

#### Scenario: Keep unassigned tasks available
- GIVEN a task is not assigned to any block
- WHEN the user views the task list
- THEN the task remains available for later scheduling

### Requirement: Internal block tasks and attached events
The system MUST support tasks created inside a block and important highlighted events attached to a block. These items MUST remain visible in the block context during execution and conclusion.

#### Scenario: Add internal tasks
- GIVEN a block is open
- WHEN the user creates a task inside that block
- THEN the task is stored as part of the block

#### Scenario: Attach a highlighted event
- GIVEN a block exists
- WHEN the user adds an important event to it
- THEN the event is linked to the block and shown with the block

### Requirement: Pause logging and planned vs actual metrics
The system MUST allow 5-minute, 10-minute, and untimed pauses to be logged inside an active block without shifting the scheduled block. The system MUST record planned versus actual time and report metrics by category, block, and phase.

#### Scenario: Log a short pause without moving the schedule
- GIVEN a block is active
- WHEN the user logs a 5-minute, 10-minute, or untimed pause
- THEN the pause is recorded inside the block
- AND the planned schedule does not move

#### Scenario: Review actual performance
- GIVEN one or more blocks have concluded
- WHEN the user reviews metrics
- THEN the system shows planned versus actual time by category, block, and phase

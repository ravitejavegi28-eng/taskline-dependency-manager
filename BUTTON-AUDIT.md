# Button and workflow audit

Verified on 31 October 2026 against a separate temporary MongoDB database.

- Passed: Workspace opens directly without a login screen
- Passed: All five navigation buttons and brand home link
- Passed: Sidebar Explore dependencies
- Passed: Board, List, Map, zoom in, zoom out and fit view
- Passed: Blocked dashboard shortcut switches out of graph into filtered board
- Passed: In-progress, overdue and banner review shortcuts
- Passed: Search, empty search results and all status filters
- Passed: All four column add buttons, New task, Cancel and dialog Close
- Passed: Blocked-column create requires an unfinished prerequisite and then saves
- Passed: Task cards, details Close and details Escape
- Passed: Blocker drill-down, Preview impact and Close impact preview
- Passed: Team owner View tasks opens a filtered list
- Passed: Recent activity View all
- Passed: Export downloads valid project JSON
- Passed: Topbar refresh
- Passed: Conflicting save shows task-level error and error Refresh recovers
- Passed: Create project, Cancel, visible connection error and successful retry
- Passed: New-project team and activity empty states
- Passed: Create tasks with required fields and save
- Passed: Edit title, owner, description, priority and due date persist
- Passed: Drag graph handles creates and saves a dependency
- Passed: Edit prerequisites checkbox adds a second requirement
- Passed: Prerequisite task drill-down and remove link
- Passed: Blocked status transition rejected visibly
- Passed: Status selector completes prerequisite, starts and completes dependent
- Passed: Delete Cancel keeps task; confirmed Delete removes task
- Passed: Project switch clears stale owner search
- Passed: Project and task changes survive reload
- Passed: Empty required task fields prevent save
- Passed: Mobile navigation, task dialog, graph/list tabs and project switch
- Passed: No browser page errors during the complete audit

All tested controls passed. The audit covers every application-owned button type, task form control, project selector, graph connection handle, and graph zoom/fit control. It is representative scenario coverage, not a guarantee against every possible browser or input.

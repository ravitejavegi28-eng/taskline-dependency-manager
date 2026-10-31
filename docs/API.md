# Taskline API documentation

Base URL: https://taskline-dependency-manager.vercel.app/api

The current version is a public shared demo without login. Send JSON request bodies with Content-Type: application/json. Use synthetic data only; changes affect the shared workspace.

## Endpoints

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Check backend and Mongoose connection | 200 |
| GET | /projects | List projects with tasks and derived task states | 200 |
| POST | /projects | Create an empty project | 201 |
| PUT | /projects/:id | Replace the task list after validation and revision checking | 200 |

## GET /health

Returns status, database, connector, and access. A healthy response has status `ok` and connector `Mongoose`. Database or configuration failures return 503. Secrets are never included.

## GET /projects

Returns an array of projects. Each contains id, name, description, revision, tasks, and activity. Task responses include computed blockers, displayStatus, and level. These values are derived by the backend and are not authoritative inputs.

## POST /projects

Example request:

```json
{
  "name": "Team United Demo",
  "description": "Sample dependency workflow"
}
```

The project name must be nonempty and at most 80 characters; description is optional and at most 500 characters. The response includes a generated project id, revision 0, and empty tasks/activity arrays.

## PUT /projects/:id

Use the actual project id and the latest revision returned by GET or the last successful save. Send the complete task array, not only the edited task.

```json
{
  "revision": 0,
  "event": "Added sample dependency chain",
  "tasks": [
    {
      "id": "task-db",
      "title": "Design database",
      "description": "Define the project schema",
      "owner": "Demo member",
      "priority": "high",
      "status": "completed",
      "dueDate": "2026-11-02",
      "dependencies": []
    },
    {
      "id": "task-api",
      "title": "Build backend",
      "description": "Implement task endpoints",
      "owner": "Demo member",
      "priority": "medium",
      "status": "todo",
      "dueDate": "2026-11-03",
      "dependencies": ["task-db"]
    }
  ]
}
```

Use these samples on a new empty demo project. Replacing the tasks of an existing project with this example would remove its current task list.

### Validation and behaviour

- Maximum 150 tasks and a 128 KB JSON request body.
- Task id: nonempty, unique within the project, maximum 80 characters.
- Title: nonempty, maximum 120 characters. Description: maximum 2000 characters.
- Owner: maximum 60 characters; an omitted or empty owner defaults to Unassigned.
- Priority: low, medium, or high.
- Stored status: todo, in_progress, or completed. Blocked/Ready are derived display states.
- Due date: a valid YYYY-MM-DD calendar date.
- Dependencies: unique IDs of tasks in the same project. Self-links, cycles, and missing IDs are rejected.
- A task with unfinished prerequisites must remain todo. It cannot be started or completed.
- createdAt is generated for new tasks and preserved for existing task IDs.
- A successful save increments revision and prepends an activity event; the latest 50 events are retained.
- To delete a task, omit it from the full task array and remove references to its id from the remaining dependencies. There is no separate DELETE endpoint.
- There is no project deletion or project metadata editing endpoint in this prototype.

## Error responses

Application errors use a JSON object with an error message.

| Status | Meaning |
|---|---|
| 400 | Invalid fields, dependencies, dates, or task-state transition |
| 403 | Unexpected host or cross-site browser mutation |
| 404 | Project or endpoint not found |
| 409 | Stale revision; refresh the project before retrying |
| 413 | Request body exceeds the JSON limit |
| 415 | A mutation did not use application/json |
| 500 | Unexpected application/database write failure |
| 503 | Database unavailable or hosting configuration incomplete |

## Implementation

The Vercel rewrite forwards all API path depths to api/handler.js. server/vercel-handler.js initializes the database once per warm function and dispatches to the Express app. Routes live in server/app.js, graph rules in server/graph.js, and Mongoose models in server/db.js. Host and origin checks are not authentication; anyone with access to this demo can edit its data.

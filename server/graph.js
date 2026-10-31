export class RuleError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }

// Edges point from a prerequisite to the task that needs it.
export function analyze(tasks) {
  const byId = new Map(tasks.map(t => [t.id, t]));
  if (byId.size !== tasks.length) throw new RuleError('Task identifiers must be unique.');
  const children = new Map(tasks.map(t => [t.id, []]));
  const indegree = new Map();
  for (const task of tasks) {
    if (new Set(task.dependencies).size !== task.dependencies.length) throw new RuleError('A prerequisite can only be added once.');
    for (const id of task.dependencies) {
      if (id === task.id) throw new RuleError('A task cannot depend on itself.');
      if (!byId.has(id)) throw new RuleError('A prerequisite no longer exists. Refresh the project.');
      children.get(id).push(task.id);
    }
    indegree.set(task.id, task.dependencies.length);
  }
  // Kahn's topological traversal validates the whole candidate graph in O(V+E).
  const queue = tasks.filter(t => indegree.get(t.id) === 0).map(t => t.id);
  const levels = new Map(queue.map(id => [id, 0]));
  for (let i = 0; i < queue.length; i++) {
    for (const child of children.get(queue[i])) {
      levels.set(child, Math.max(levels.get(child) || 0, levels.get(queue[i]) + 1));
      indegree.set(child, indegree.get(child) - 1);
      if (indegree.get(child) === 0) queue.push(child);
    }
  }
  if (queue.length !== tasks.length) throw new RuleError('Circular dependency detected. This connection would create a loop.');
  const decorated = tasks.map(t => {
    const blockers = t.dependencies.filter(id => byId.get(id).status !== 'completed');
    return { ...t, blockers, level: levels.get(t.id), displayStatus: blockers.length ? 'blocked' : t.status === 'todo' ? 'ready' : t.status };
  });
  return { tasks: decorated, children };
}

export function downstream(tasks, start) {
  const { children } = analyze(tasks);
  const seen = new Set();
  const queue = [...(children.get(start) || [])];
  for (let i = 0; i < queue.length; i++) {
    if (seen.has(queue[i])) continue;
    seen.add(queue[i]);
    queue.push(...children.get(queue[i]));
  }
  return [...seen];
}

export function validateState(tasks) {
  const result = analyze(tasks);
  for (const task of result.tasks) {
    if (task.blockers.length && task.status !== 'todo') throw new RuleError(`“${task.title}” still has unfinished prerequisites. Complete them first, or return affected tasks to Ready before reopening a prerequisite.`);
  }
  return result;
}

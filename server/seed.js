import { randomUUID } from 'node:crypto';
export function seedProject() {
  const ids = Array.from({ length: 12 }, () => randomUUID());
  const date = offset => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
  const records = [
    ['Define project scope', 'Aarav', 'high', 'completed', -5, []],
    ['Design database schema', 'Diya', 'high', 'completed', -4, [0]],
    ['Create wireframes', 'Meera', 'medium', 'completed', -3, [0]],
    ['Build task APIs', 'Diya', 'high', 'in_progress', -1, [1]],
    ['Build dashboard layout', 'Meera', 'medium', 'in_progress', 1, [2]],
    ['Implement dependency engine', 'Aarav', 'high', 'todo', 2, [3]],
    ['Connect task forms', 'Kabir', 'medium', 'todo', 3, [3, 4]],
    ['Build dependency graph', 'Meera', 'high', 'todo', 4, [5, 4]],
    ['Test cycle prevention', 'Kabir', 'high', 'todo', 5, [5]],
    ['Run end-to-end tests', 'Kabir', 'high', 'todo', 6, [6, 7, 8]],
    ['Prepare demo presentation', 'Aarav', 'medium', 'todo', 4, [2]],
    ['Launch hackathon demo', 'Diya', 'high', 'todo', 7, [9, 10]],
  ];
  return { id: randomUUID(), name: 'Hackathon launch', description: 'From the first idea to a confident live demo. A sample project for your team to explore.', revision: 0, tasks: records.map((r, i) => ({ id: ids[i], title: r[0], owner: r[1], priority: r[2], status: r[3], dueDate: date(r[4]), dependencies: r[5].map(j => ids[j]), description: `Deliver ${r[0].toLowerCase()} for the hackathon prototype. Review the prerequisites before starting.`, createdAt: new Date().toISOString() })), activity: [{ id: randomUUID(), text: 'Sample project created with 12 tasks and multiple dependency chains.', at: new Date().toISOString() }] };
}

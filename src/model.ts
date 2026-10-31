export type Status = 'ready' | 'blocked' | 'in_progress' | 'completed';
export type Task = { id: string; title: string; description: string; owner: string; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'completed'; dueDate: string; dependencies: string[]; blockers: string[]; displayStatus: Status; level: number; createdAt: string };
export type Project = { id: string; name: string; description: string; revision: number; tasks: Task[]; activity: { id: string; text: string; at: string }[] };
export const labels: Record<Status, string> = { ready: 'Ready', blocked: 'Blocked', in_progress: 'In progress', completed: 'Completed' };
export const statusOrder: Status[] = ['ready', 'in_progress', 'blocked', 'completed'];
export function downstream(tasks: Task[], start: string): Set<string> { const children = new Map<string, string[]>(); for (const t of tasks) for (const d of t.dependencies) children.set(d, [...(children.get(d) || []), t.id]); const seen = new Set<string>(); const queue = [...(children.get(start) || [])]; for (let i = 0; i < queue.length; i++) { if (!seen.has(queue[i])) { seen.add(queue[i]); queue.push(...(children.get(queue[i]) || [])); } } return seen; }
export function dateLabel(date: string) { return new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
export function overdue(t: Task) { const d = new Date(); const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; return t.status !== 'completed' && t.dueDate < today; }
let demoAuthorization = '';
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export function setDemoCredentials(username: string, password: string) {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  demoAuthorization = 'Basic ' + btoa(String.fromCharCode(...bytes));
}
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const r = await fetch('/api' + url, { ...options, headers: { 'Content-Type': 'application/json', ...(demoAuthorization ? { Authorization: demoAuthorization } : {}), ...options?.headers }, signal: AbortSignal.timeout(20000) });
  if (r.status === 401) throw new ApiError('Enter the shared demo username and password to open this workspace.',401);
  if (!r.headers.get('content-type')?.includes('application/json')) throw new ApiError(r.status === 404 ? 'The backend API is not deployed. Deploy the complete project, including its api folder.' : 'The backend returned an unexpected response. Check the deployment logs.',r.status);
  const data = await r.json();
  if (!r.ok) throw new ApiError(data.error || 'Request failed. Please try again.',r.status);
  return data;
}

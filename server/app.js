import express from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { Project, databaseMode } from './db.js';
import { analyze, validateState, RuleError } from './graph.js';
import { runtimeConfig } from './config.js';

const clean = doc => { const { _id, ...p } = doc; return { ...p, tasks: analyze(p.tasks).tasks }; };
function text(value, name, limit, required = false) {
  if (typeof value !== 'string' || value.length > limit || (required && !value.trim())) throw new RuleError(`${name} must be ${required ? 'nonempty and ' : ''}at most ${limit} characters.`);
  return value.trim();
}
export function createApp(config = runtimeConfig()) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  // Render terminates HTTPS at its proxy. Validate against the configured public
  // origin rather than trusting client-supplied forwarded headers.
  app.use((req, res, next) => {
    const allowed = config.hosted
      ? req.headers.host === new URL(config.origin).host
      : ['127.0.0.1', 'localhost', '[::1]'].includes(req.hostname);
    if (!allowed) return res.status(403).json({ error: 'This host is not allowed for the workspace.' });
    next();
  });
  app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'disconnected', database: databaseMode, connector: 'Mongoose', access: config.hosted ? 'Public shared demo' : 'Local single-user workspace' }));
  app.use(express.json({ limit: '128kb' }));
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(req.method)) {
      if (!req.is('application/json')) return res.status(415).json({ error: 'Use application/json for workspace changes.' });
      const origin = config.hosted ? config.origin : `${req.protocol}://${req.headers.host}`;
      if (req.headers.origin && req.headers.origin !== origin) return res.status(403).json({ error: 'Cross-site changes are not allowed.' });
    }
    next();
  });
  app.get('/api/projects', async (req, res) => res.json((await Project.find().lean()).map(clean)));
  app.post('/api/projects', async (req, res) => {
    const p = await Project.create({ id: randomUUID(), name: text(req.body.name, 'Project name', 80, true), description: text(req.body.description || '', 'Description', 500), tasks: [], activity: [], revision: 0 });
    res.status(201).json(clean(p.toObject()));
  });
  app.put('/api/projects/:id', async (req, res) => {
    const current = await Project.findOne({ id: req.params.id }).lean();
    if (!current) throw new RuleError('Project not found.', 404);
    if (!Number.isInteger(req.body.revision) || current.revision !== req.body.revision) throw new RuleError('This project changed in another window. Refresh and try again.', 409);
    if (!Array.isArray(req.body.tasks) || req.body.tasks.length > 150) throw new RuleError('A project can contain up to 150 tasks.');
    const tasks = req.body.tasks.map(t => {
      if (!['todo', 'in_progress', 'completed'].includes(t.status) || !['low', 'medium', 'high'].includes(t.priority)) throw new RuleError('Choose a valid status and priority.');
      if (typeof t.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(t.dueDate) || !Number.isFinite(Date.parse(t.dueDate)) || new Date(t.dueDate).toISOString().slice(0,10) !== t.dueDate) throw new RuleError('Choose a valid due date.');
      if (!Array.isArray(t.dependencies) || t.dependencies.some(d => typeof d !== 'string')) throw new RuleError('Prerequisites must be task identifiers.');
      return { id: text(t.id, 'Task ID', 80, true), title: text(t.title, 'Task title', 120, true), description: text(t.description || '', 'Description', 2000), owner: text(t.owner || 'Unassigned', 'Owner', 60, true), dueDate: t.dueDate, status: t.status, priority: t.priority, dependencies: t.dependencies, createdAt: current.tasks.find(old => old.id === t.id)?.createdAt || new Date().toISOString() };
    });
    validateState(tasks);
    const event = { id: randomUUID(), text: text(req.body.event || 'Project updated', 'Activity', 200, true), at: new Date().toISOString() };
    const updated = await Project.findOneAndUpdate({ id: current.id, revision: current.revision }, { $set: { tasks, activity: [event, ...current.activity].slice(0, 50) }, $inc: { revision: 1 } }, { returnDocument: 'after', runValidators: true }).lean();
    if (!updated) throw new RuleError('This project changed in another window. Refresh and try again.', 409);
    res.json(clean(updated));
  });
  app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use((err, req, res, next) => {
    const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
    if (status === 500) console.error(err.message);
    res.status(status).json({ error: status === 500 ? 'Unable to save right now. Check the database connection and retry.' : err.message });
  });
  return app;
}



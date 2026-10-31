import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './db.js';
import express from 'express';
import path from 'node:path';

try {
  await connectDatabase();
  const app = createApp();
  if (process.argv.includes('--production')) {
    app.use(express.static(path.resolve('dist')));
    app.get('/{*path}', (req, res) => res.sendFile(path.resolve('dist/index.html')));
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }
  const port = Number(process.env.PORT || 4173);
  const server = app.listen(port, '127.0.0.1', () => console.log(`Taskline is ready: http://127.0.0.1:${port}`));
  async function shutdown() { server.close(); await disconnectDatabase(); process.exit(0); }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (e) {
  console.error('Startup failed:', e.message, '\nIf the first-run MongoDB download is blocked, set MONGODB_URI in .env to your local MongoDB or Atlas connection string.');
  process.exit(1);
}

import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './db.js';
import express from 'express';
import path from 'node:path';
import { runtimeConfig } from './config.js';

try {
  const config = runtimeConfig();
  await connectDatabase();
  const app = createApp(config);
  if (process.argv.includes('--production')) {
    app.use(express.static(path.resolve('dist')));
    app.get('/{*path}', (req, res) => res.sendFile(path.resolve('dist/index.html')));
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }
  const server = app.listen(config.port, config.host, () => console.log(`Taskline is ready: ${config.origin || `http://127.0.0.1:${config.port}`}`));
  async function shutdown() { server.close(); await disconnectDatabase(); process.exit(0); }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (e) {
  console.error('Startup failed:', e.message, '\nIf the first-run MongoDB download is blocked, set MONGODB_URI in .env to your local MongoDB or Atlas connection string.');
  process.exit(1);
}

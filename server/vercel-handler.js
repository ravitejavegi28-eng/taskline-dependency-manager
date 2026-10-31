import { createApp } from './app.js';
import { connectDatabase } from './db.js';
import { runtimeConfig } from './config.js';

// One initialization promise per warm function, shared by concurrent requests.
export function createVercelHandler({ readConfig = runtimeConfig, connect = connectDatabase, makeApp = createApp } = {}) {
  let ready;
  return async function handler(req, res) {
    try {
      if (!ready) ready = (async () => { const config = readConfig(); await connect(); return makeApp(config); })();
      const app = await ready;
      return app(req, res);
    } catch (error) {
      ready = undefined;
      console.error('Taskline API initialization failed:', error.name);
      const configuration = /^(Hosted mode requires|Set PUBLIC_BASE_URL|PORT must)/.test(error.message || '');
      return res.status(503).json({ error: configuration ? error.message : 'The database is unavailable. Check MONGODB_URI, the Atlas database password, and Atlas network access in your hosting settings.' });
    }
  };
}

import { createHash, timingSafeEqual } from 'node:crypto';
export function runtimeConfig(env = process.env) {
  const hosted = env.APP_MODE === 'hosted' || env.RENDER === 'true';
  const port = Number(env.PORT || 4173);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be a valid port number.');
  let origin;
  if (hosted) {
    if (!env.MONGODB_URI?.trim()) throw new Error('Hosted mode requires MONGODB_URI. Set your Atlas connection string in the hosting environment.');
    if (!env.DEMO_PASSWORD || env.DEMO_PASSWORD.length < 16) throw new Error('Hosted mode requires DEMO_PASSWORD with at least 16 characters.');
    try { const url = new URL(env.PUBLIC_BASE_URL || env.RENDER_EXTERNAL_URL); if(url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/') throw new Error(); origin = url.origin; } catch { throw new Error('Set PUBLIC_BASE_URL to the HTTPS app URL, or use Render\'s RENDER_EXTERNAL_URL.'); }
  }
  return { hosted, port, host: hosted ? '0.0.0.0' : '127.0.0.1', origin, demoUsername: env.DEMO_USERNAME || 'evaluator', demoPassword: hosted ? env.DEMO_PASSWORD : undefined };
}
const digest = text => createHash('sha256').update(text).digest();
export function validDemoAuth(header, config) {
  if (typeof header !== 'string' || !header.startsWith('Basic ') || header.length > 2048) return false;
  const value = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const separator = value.indexOf(':');
  if (separator < 0) return false;
  return timingSafeEqual(digest(value.slice(0,separator)), digest(config.demoUsername)) && timingSafeEqual(digest(value.slice(separator+1)), digest(config.demoPassword));
}

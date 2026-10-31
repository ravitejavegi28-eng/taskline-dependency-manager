# Vercel deployment

The Vite frontend and Express API deploy together. `api/handler.js` receives all API path depths through the explicit vercel.json rewrite and forwards requests into the existing Express app through a cached initialization promise. MongoDB connections are reused within a warm function. The local MongoDB process is never started on Vercel.

## Settings

- Framework: Vite
- Build: `npm run build`
- Output directory: `dist`
- Node.js: 24.x recommended
- Production environment variable: MONGODB_URI. DEMO_USERNAME and DEMO_PASSWORD are no longer used.
- Do not prefix secrets with VITE_. Do not commit them.
- Vercel's system variables select hosted mode and the production or preview URL. PUBLIC_BASE_URL is optional for an alternate custom domain.

The workspace opens directly without login. Anyone with its URL can view and edit the same demo projects. Assignment labels are not accounts. Keep only synthetic sample data here.

## Verify

Open /api/health: it must return JSON, never the Vercel NOT_FOUND page. A 503 JSON response identifies missing configuration or database connectivity. Create a project and task without signing in, refresh, and verify persistence.

Atlas must permit connections from the deployed Vercel backend. The laptop IP allowed during onboarding is not sufficient. Use the Atlas network configuration appropriate for your hosting environment. If database initialization fails, check Atlas access and the credentials stored privately in Vercel. Never share the database URI in screenshots.

Repository changes trigger the connected deployment. Check the Vercel build and runtime logs after deploying; a successful frontend build alone does not verify database connectivity.

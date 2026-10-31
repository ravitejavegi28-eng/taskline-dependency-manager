# Vercel deployment

The Vite frontend and Express API deploy together. `api/[...path].js` forwards API requests into the existing Express app through a cached initialization promise. MongoDB connections are reused within a warm function. The local MongoDB process is never started on Vercel.

## Settings

- Framework: Vite
- Build: `npm run build`
- Output directory: `dist`
- Node.js: 24.x recommended
- Production environment variables: MONGODB_URI, DEMO_USERNAME=evaluator, DEMO_PASSWORD (at least 16 characters).
- Do not prefix secrets with VITE_. Do not commit them.
- Vercel's system variables select hosted mode and the production or preview URL. PUBLIC_BASE_URL is optional for an alternate custom domain.

The API uses the same shared evaluator credentials as Render. The frontend now has a sign-in screen and keeps the authorization value only in memory, so a full refresh may require signing in again. Assignment labels are not separate team accounts.

## Verify

Open /api/health: it must return JSON, never the Vercel NOT_FOUND page. A 503 JSON response identifies missing configuration or database connectivity. Projects require the shared login. Sign in through the app, create a project and task, refresh, sign in again if asked, and verify persistence.

Atlas must permit connections from the deployed Vercel backend. The laptop IP allowed during onboarding is not sufficient. Use the Atlas network configuration appropriate for your hosting environment. If database initialization fails, check Atlas access and the credentials stored privately in Vercel. Never share the database URI in screenshots.

Repository changes trigger the connected deployment. Check the Vercel build and runtime logs after deploying; a successful frontend build alone does not verify database connectivity.

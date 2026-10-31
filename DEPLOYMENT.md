# Deploy Taskline on Render

The same repository supports local development and one shared evaluator workspace on Render. Local use stays on 127.0.0.1 with no sign-in. Hosted mode requires MongoDB Atlas and one shared demo login; it does not create separate team accounts.

## Render setup

Create a Node Web Service from the main branch. Use:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path (Advanced): `/api/health`
- Environment `MONGODB_URI`: your private Atlas URI with the `taskline` database name. Replace the password placeholder with the new real database password. URL-encode password characters if your password contains URI-reserved characters.
- Environment `DEMO_USERNAME`: `evaluator`
- Environment `DEMO_PASSWORD`: choose a separate private password of at least 16 characters. This is the shared website login, not your Atlas password.
- Environment `NODE_VERSION`: `24`

Render provides PORT, RENDER=true and RENDER_EXTERNAL_URL automatically. The server uses its assigned port and binds to 0.0.0.0 in hosted mode. Outside Render, set APP_MODE=hosted and PUBLIC_BASE_URL to the HTTPS app origin as well.

## Atlas access

Use a project-specific database user restricted to read/write on the taskline database. Add the Render service's outbound IP ranges to the Atlas access list. The laptop IP allowed during Atlas onboarding does not authorize the hosted server. Do not commit your database URI or passwords. Rotate the database password if it appeared in a screenshot.

## Verify after deployment

Open the HTTPS application link. Your browser asks for the shared username and password. Sign in, create a sample task, refresh, and check the task persists. Verify the graph and a rejected circular dependency. Share the website demo credentials privately with evaluators, along with its URL. Do not give them Atlas credentials.

Health checks are reachable without the demo login and report HTTP 200 only while Mongoose is connected; other pages and APIs require the shared login. Cross-site changes and unexpected hostnames are rejected. The shared login is a demo gate, not a multi-user permission system. Everyone with that login edits the same sample workspace.

The local MongoDB process is never a hosted fallback. Missing cloud configuration fails startup with an explanation. A hosting restart does not erase Atlas data. Free hosting can sleep when idle; allow time for it to wake before evaluation.

Deployment support was tested locally using hosted configuration and a disposable MongoDB for the existing API/browser tests. A live Render-to-Atlas connection still needs verification after you supply the environment variables and network access.

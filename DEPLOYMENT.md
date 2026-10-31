# Deploy Taskline on Render

The same repository supports local development and one shared evaluator workspace on Render. Local use stays on 127.0.0.1 with no sign-in. Hosted mode requires MongoDB Atlas and opens a public shared demo without login. It does not create team accounts.

## Render setup

Create a Node Web Service from the main branch. Use:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path (Advanced): `/api/health`
- Environment `MONGODB_URI`: your private Atlas URI with the `taskline` database name. Replace the password placeholder with the new real database password. URL-encode password characters if your password contains URI-reserved characters.
- Environment `NODE_VERSION`: `24`

Render provides PORT, RENDER=true and RENDER_EXTERNAL_URL automatically. The server uses its assigned port and binds to 0.0.0.0 in hosted mode. Outside Render, set APP_MODE=hosted and PUBLIC_BASE_URL to the HTTPS app origin as well.

## Atlas access

Use a project-specific database user restricted to read/write on the taskline database. Add the Render service's outbound IP ranges to the Atlas access list. The laptop IP allowed during Atlas onboarding does not authorize the hosted server. Do not commit your database URI or passwords. Rotate the database password if it appeared in a screenshot.

## Verify after deployment

Open the HTTPS application link directly. Create a sample task, refresh, and check persistence. Verify the graph and a rejected cycle. Share the site URL with evaluators; never share Atlas credentials.

Health checks report HTTP 200 only while Mongoose is connected. Pages and APIs are public. Cross-site browser changes and unexpected hostnames are rejected, but this is not authentication: any visitor can edit the shared sample workspace.

The local MongoDB process is never a hosted fallback. Missing cloud configuration fails startup with an explanation. A hosting restart does not erase Atlas data. Free hosting can sleep when idle; allow time for it to wake before evaluation.

Deployment support was tested locally using hosted configuration and a disposable MongoDB for the existing API/browser tests. A live Render-to-Atlas connection still needs verification after you supply the environment variables and network access.

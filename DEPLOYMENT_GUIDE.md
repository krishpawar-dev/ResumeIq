# ResumeIQ deployment guide (GitHub + Render)

## Security fixes in this copy
- Database credentials have been removed from `backend/config/db.js`.
- Production requires `MONGODB_URI` from the hosting provider's environment settings.
- A production database connection failure now stops the backend instead of leaving a broken API running.
- Do not upload `.git`, `node_modules`, `.env`, or real credentials.

## 1. Before publishing
1. Change/rotate the MongoDB database user's password because the previous connection string was embedded in source.
2. In MongoDB Atlas, create or select a database and database user. In Network Access, allow Render to connect (for a quick setup you may temporarily allow `0.0.0.0/0`; use stronger network restrictions where practical).
3. Create strong production secrets. Never use the example values in `.env.example`.
4. Check that `.env` is not staged by Git: `git status`.

## 2. Upload to GitHub (Windows)
1. Extract `ResumeIQ-fixed.zip`.
2. Open the extracted `ResumeIQ` folder in VS Code.
3. Open Terminal > New Terminal and run:

```bash
git init
git add .
git status
git commit -m "Prepare ResumeIQ for deployment"
git branch -M main
```

4. Create an empty repository on https://github.com/new. Do not initialize it with a README, license, or `.gitignore` because the project already has files.
5. Copy the repository's HTTPS URL, then run (replace the example URL):

```bash
git remote add origin https://github.com/YOUR-USERNAME/ResumeIQ.git
git push -u origin main
```

If Git says `remote origin already exists`, run `git remote -v`. If it points to a repository you do not own or want to use, change it with `git remote set-url origin https://github.com/YOUR-USERNAME/ResumeIQ.git`.

## 3. Deploy backend on Render
1. Open https://render.com and connect your GitHub account.
2. Choose **New + > Web Service**, then select the ResumeIQ repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add these environment variables in Render (use real values, not placeholders):
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your new MongoDB Atlas connection string
   - `JWT_SECRET` = a long, random secret (at least 32 characters)
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = your frontend Render URL, once created
   - `OPENAI_API_KEY` = your key, only if you want live AI features
   - `OPENAI_MODEL` = `gpt-4o-mini` (or a model available to your account)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` = only if using Cloudinary
   - `REDIS_URL` = only if you configure a Redis service
7. Deploy and test `https://YOUR-BACKEND.onrender.com/api/health`.

## 4. Deploy frontend on Render
1. In Render choose **New + > Static Site**, and select the same repository.
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Publish Directory** to `dist`.
5. Add environment variable `VITE_API_BASE_URL` = `https://YOUR-BACKEND.onrender.com/api` (replace with the real backend URL).
6. Deploy the static site.
7. Go back to the backend Web Service and set `CLIENT_URL` to the exact frontend URL, including `https://` and no trailing slash. Save changes and redeploy the backend.

## 5. Final checks
- Open the frontend URL and register/login.
- In the browser Developer Tools > Network, confirm API calls go to the backend URL and do not fail with CORS errors.
- Test resume upload, ATS analysis, job matching, and any AI features you configured.
- Check the backend logs in Render if requests fail.
- Free hosting services may sleep when idle; the first request can be slow.
- Local disk is not reliable persistent storage on hosted services. Configure Cloudinary for uploaded resume files before relying on uploads in production.
- If the UI uses client-side routes and refreshing a nested URL returns 404, add a Render rewrite from `/*` to `/index.html` with status `200` in the Static Site's Redirects/Rewrites settings.

## Notes
- The API currently expects MongoDB. OpenAI, Cloudinary, and Redis are optional for some functionality, but features depending on them will not work fully without configuration.
- This guide cannot guarantee every feature works until the app is deployed and tested with your own service credentials.

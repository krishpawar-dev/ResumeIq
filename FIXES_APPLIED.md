# ResumeIQ Improvements Applied

## Fixed
- Tailwind CSS v4 dark-mode variant now follows the app's `.dark` class, so Light/Dark switching works correctly.
- Resume PDF export now waits for fonts, captures at high resolution, splits long resumes across A4 pages, and downloads using an explicit Blob URL.
- Safer PDF filenames for names containing Windows-invalid characters.
- PDF export now reports a clear error instead of silently failing.

## Important
- `node_modules` and local `.env` files are intentionally excluded from this ZIP.
- Run `npm install` inside both `frontend` and `backend` before starting the project.
- Put your real backend environment values in `backend/.env` using `backend/.env.example` as the template.

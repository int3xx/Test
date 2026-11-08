# INT3X site

- `src/` — readable source (edit here)
- `npm install && npm run build` — creates `dist/` with minified + obfuscated code
- Push to `main` — GitHub Actions builds and deploys `dist/` to GitHub Pages

Setup: repo **Settings → Pages → Source: GitHub Actions**. Custom domain comes from `src/CNAME`.
Set the Discord webhook in `src/assets/app.js` (`WEBHOOK_URL`).

# Deployment Guide - Travel Planner v1.0.1

This project supports two production deployment targets:

1. GitHub Pages (already configured)
2. Firebase Hosting (configuration files added in this repo)

---

## 1. Prerequisites

### Required environment variables

Set these variables in your local `.env` and CI secrets:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Optional (only if you enable Supabase image path):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Security notes:
- Do not commit `.env`.
- Frontend env values are compiled into the bundle, so protect data with Firebase/Supabase security rules.

---

## 2. GitHub Pages

### Current repo status

- Workflow exists: `.github/workflows/deploy.yml`
- Manual deploy script exists: `npm run deploy`
- Vite base path is set to project pages: `base: '/travel-planner/'` in `vite.config.ts`

### A. Auto deploy via GitHub Actions

1. Add repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
2. Go to `Settings > Pages`, set source to `GitHub Actions`.
3. Push to `main` to trigger deploy.

### B. Manual deploy with `gh-pages`

```bash
npm run deploy
```

This runs build and publishes `dist/` to `gh-pages` branch.

### GitHub Pages base-path rule

- Project pages (`https://<user>.github.io/<repo>/`): `base` should be `/<repo>/`.
- User/org pages (`https://<user>.github.io/`): `base` should be `/`.

---

## 3. Firebase Hosting

This repo now includes:
- `firebase.json`
- `.firebaserc.example`

### One-time setup

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login and bind project:

```bash
firebase login
firebase use --add
```

3. Copy template and set your project id:

```bash
cp .firebaserc.example .firebaserc
```

Then replace `your-firebase-project-id` with your real project id.

### Deploy

```bash
npm run build
firebase deploy --only hosting
```

### SPA routing

`firebase.json` already includes a rewrite rule to `index.html`, so React Router deep links work.

---

## 4. Verification Checklist

- Site is accessible after deployment
- Login/registration works
- Firestore reads/writes work
- Image upload works
- PWA install and offline cache work

---

## 5. Troubleshooting

### Blank page or 404

- Check `vite.config.ts` base path matches your hosting target.
- For Firebase Hosting, ensure deploy target uses `dist/` and rewrite exists.

### Firebase auth blocked on production domain

- Add deployed domain to Firebase Auth Authorized Domains.

### CI build passes but runtime fails

- Confirm all required `VITE_FIREBASE_*` values are present in CI secrets.

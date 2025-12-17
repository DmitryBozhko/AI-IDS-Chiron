# Chiron Web

React + Vite + TypeScript app for the Chiron CMMC manager.

## Setup
1) Copy `.env.example` → `.env` and fill Firebase config
2) Install deps: `pnpm i` (or `npm i`)
3) Run dev: `pnpm dev`

### Firebase connection
- Populate every `VITE_FIREBASE_*` variable in `.env` with your project credentials (including `VITE_FIREBASE_MEASUREMENT_ID` if you use Analytics).
- Enable Email/Password or Google auth in Firebase Console if you plan to use the built-in login screen (Google auth is pre-wired).
- Create a `businesses` collection in Firestore that mirrors the shape of `public/data/businesses.json` (arrays for `members`, `invites`, `controlState`, etc.).
- Once credentials exist the app boots against Firestore; remove them to fall back to local demo data.

## Build & Deploy
- Build: `pnpm build`
- Preview: `pnpm preview`
- Hosting (once Firebase is initialized): `firebase deploy`

## Multi-company preview mode
- Seed data now includes multiple companies with per-member roles, pending invites, and evidence placeholders (`public/data/businesses.json`).
- Every authenticated user can create their own company; editors/viewers are limited to the workspaces they belong to.
- Control edits require owner or editor role. Viewers stay read-only; the UI reflects their capabilities in the header and control detail screen.
- The selector honors invite-only access. Owners can review outstanding invites before onboarding teammates.
- When Firebase auth is disabled, the app falls back to a demo owner user (`demo-owner`). Change the active demo account by setting `localStorage.setItem('chiron:demoUserId', '<uid>')` in the browser console (e.g., `demo-viewer`).


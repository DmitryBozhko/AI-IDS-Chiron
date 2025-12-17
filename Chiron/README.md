# Chiron
Compliance management software for CMMC

## Overview
Chiron is a CMMC compliance manager focused on tracking the CMMC controls. Each control can be opened, assigned a status (Not Implemented, Partially Implemented, Fully Implemented), include objective checklists, attach evidence, and capture comments/answers. Once all controls are answered we can generate POAMs that the user can address.

This repo includes:
- docs describing requirements and data model
- a React + Firebase web app skeleton (TypeScript, Vite)
- Firebase Hosting configuration, Firestore and Storage security rules
- sample control data and initial UI stubs

## Quick Start
1) Install Node 18+ and pnpm or npm
2) In `web/`, install deps and run dev server:
   - `install npm`
   - `npm run dev`
   - Go to local host
   (Firebase config save for later)
3) Create a Firebase project. Enable Authentication (Google), Firestore, Storage, and Hosting.
4) Copy `.env.example` to `.env` in `web/` and fill with your Firebase config.
5) Deploy Hosting when ready:
   - `firebase login`
   - `firebase init` (use existing `firebase.json`, select Hosting, Firestore, Storage)
   - `pnpm build` then `firebase deploy`

#### Production Release
1. Ensure your changes are merged to the `main` branch
2. Go to GitHub Actions → "Release" workflow
3. Click "Run workflow"
4. Configure the release:
   - Branch: `main`
   - Version bump type:
     - `patch` for bug fixes and non-functional changes
     - `minor` for new features (backwards compatible)
     - `major` for breaking changes
   - Leave pre-release identifier empty
5. Click "Run workflow"

#### Development Release
1. From your development branch (e.g., `feature/new-feature`)
2. Go to GitHub Actions → "Release" workflow
3. Click "Run workflow"
4. Configure the release:
   - Branch: your branch name (e.g., `feature/new-feature`)
   - Version bump type: usually `patch` or `minor`
   - Pre-release identifier: `dev`, `alpha`, or `beta`
5. Click "Run workflow"

Examples:
- Dev branch patch: v1.2.3 → v1.2.4-dev.0
- Dev branch minor: v1.2.3 → v1.3.0-dev.0
- Alpha release: Use `alpha` as pre-release identifier
- Beta release: Use `beta` as pre-release identifier

The workflow will:
1. Run tests and build the project
2. Bump version in `web/package.json`
3. Create a git tag (e.g., v1.2.3)
4. Create a GitHub Release

### Branch Protection Notes

If `main` branch has protection rules that prevent GitHub Actions from pushing:
1. Go to repository Settings → Branches → Branch protection rules
2. Edit the rule for `main`
3. Under "Restrict who can push", allow the GitHub Actions bot
   OR
4. Add a Personal Access Token (PAT) with repo access to repository secrets as RELEASE_TOKEN
5. Contact repository admin if you need help with permissions

### Manually bumping the web version locally

If you want to update the `web` package version locally (for testing or to create a local release commit/tag), there are helper npm scripts in the `web` folder.

From the repository root run:

```powershell
cd web
npm run version:patch   # bumps patch (x.y.z -> x.y.z+1), commits and tags
npm run version:minor   # bumps minor (x.y.z -> x.(y+1).0)
npm run version:major   # bumps major (x.y.z -> (x+1).0.0)
```

These scripts call `npm version <level>`, which will update `web/package.json`, create a Git commit and a Git tag (e.g., `v1.2.3`) if your working tree is clean and Git is available. If you don't want npm to create the commit/tag automatically, run:

```powershell
cd web
npm version patch --no-git-tag-version
```

Then commit and push the changes yourself, or rely on the release workflow to commit and push when running on CI.

## Sprints & Deliverablesi
- Sprint 1 (Weeks 1–4, Aug 25–Sep 21, due Sep 21)
  - Repo, app skeleton, and sample data complete
  - Requirements, data model, architecture draft (Docs in Google Docs/Sheets)
  - Controls list + detail MVP; objectives checkboxes and comments (local data ok)
  - Test plan outline and first test cases; metrics baseline (velocity, PRs, test runs)
  - CI/CD pipeline plan drafted; basic build workflow defined (to activate in Sprint 2)
  - Evidence: PRs with reviews, meeting notes, links to docs
- Sprint 2 (Weeks 5–8, Sep 23–Oct 19, due Oct 19)
  - Firebase Auth; Firestore read/write for controls, comments, status; Storage uploads (dev)
  - Expand tests: unit + basic integration; enable CI to build and run tests on PRs
  - Midterm presentation (Oct 14): live demo of running code and tests
  - Evidence: PRs reviewed, test results, CI runs, demo deck/notes
- Sprint 3 (Weeks 9–12, Oct 21–Nov 16, due Nov 16)
  - Roles/permissions, audit metadata, Settings stub; POAMs/Policies pages scaffolded
  - Operations plan draft (runbook, support flow), threat model, network model
  - Test execution results; bug tracking/fix evidence; CI enhancements
  - Evidence: PRs, docs updates, metrics graphs (tests, defects, deployment/builds)
- Sprint 4 (Weeks 13–16, Nov 17–Dec 16, due Dec 16)
  - Reporting/export, filters/search, UX polish; documentation (user + install guides)
  - CI/CD stabilization; operations/playbooks finalized; final demo content
  - Final presentations: Dec 16, 7:00–8:50pm (HUM 226)
  - Evidence: PRs, final docs, test results, release notes

Meetings: weekly in Sprint 1, then every two weeks by instructor schedule. Maintain attendance and notes.

## Evidence & Workflow
- Branching: every change via a branch and Pull Request; at least one peer review before merge.
- Identity: use the same GitHub account all semester; no anonymous commits.
- Docs: maintain Google Docs/Sheets for plan, metrics, and the capstone document; link them in the repo wiki or README.
- Metrics: track PR count/throughput, test coverage/execution, defect discovery/fix rate, build success, cycle time; include graphs per sprint.
- Testing: maintain a Test Plan, develop Test Cases, capture Test Results; attach evidence of bugs and fixes.
- CI/CD: set up build + test on PRs (GitHub Actions) by Sprint 2; extend with additional checks in Sprints 3–4.
- Operations: define operations/support plan, patch/maintenance approach, user/help manuals; threat and network models.

See `docs/requirements.md` and `docs/data-model.md` for product details.

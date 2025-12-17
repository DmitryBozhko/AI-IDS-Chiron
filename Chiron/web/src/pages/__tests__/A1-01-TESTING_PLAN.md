Testing plan: Onboarding - Create account and complete quick start

Branch
testForUserStartUp

Goal
- Verify that a new user can create/sign-in to an account and complete the quick-start onboarding (select a company/workspace) to begin using the app.

Scope
- End-to-end-ish component tests using Vitest + React Testing Library.
- Run in demo/offline mode (Firebase disabled) so tests are deterministic.

User story
- As a user, I want to be able to create an account and complete quick start up.

Contracts / Success criteria
- Input: user navigates to our app and is redirected to /login and clicks the sign-in button.
- System: app will navigate to the dashboard and show the company selector if no company is selected.
- User selects a company; the selector closes and the dashboard (Overview) is visible.
- Tests should assert visible text and DOM changes (dialog open/close, navigation title).

Test cases
1) Sign-in and quick-start
   - Render the App at /login with BusinessProvider
   - Stub network and Firebase so the app runs in demo mode
   - Click the Google sign-in button
   - Assert: Dashboard/Overview appears
   - Assert: Company selector dialog opens
   - Click a company card (select)
   - Assert: Dialog closes and Overview remains

Edge cases
- No companies available: BusinessSelector shows "You do not have access to any companies yet." (not covered by current test, but should be added later)
- Firebase enabled flow: requires separate integration tests or e2e with Firebase emulator.

Mocking strategy
- Mock '../../firebase' to set isFirebaseConfigured=false during unit tests.
- Stub global fetch to return control definitions and businesses.json payloads used by BusinessProvider.

How to run
- From the web folder:
```
cd web
npm install
npm test
```

Notes
- End-to-end-ish component tests using Vitest + React Testing Library.
- Run in demo/offline mode (Firebase disabled) so tests are deterministic.
- Tests run with Vitest. They intentionally run the app in offline/demo mode by mocking the firebase module so tests don't call external services.


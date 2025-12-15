Testing plan: AuthRoute - Authentication route component

Branch
test_authroute

Goal
- Verify `AuthRoute` component correctly handles three modes: bypass (no firebase configured), authenticated user, and unauthenticated user (redirect to `/login`).

Scope
- Unit + small-integration tests with Vitest + React Testing Library.
- Component-level behavior only; Firebase and router interactions are mocked so tests run offline and deterministically.

User stories
- As an app consumer, I expect protected routes to show content only when a user is authenticated.
- As a developer, I expect `AuthRoute` to allow bypass when Firebase is not configured (useful for local/demo builds).

Contracts / Success criteria
- Bypass flow:
  - Input: `isFirebaseConfigured` is false and `auth` is undefined.
  - System: `AuthRoute` should immediately render children and call optional `onAuthSuccess` callback.
  - Output: Protected children are visible and `onAuthSuccess` is invoked.

- Authenticated flow:
  - Input: `isFirebaseConfigured` true and `onAuthStateChanged` calls back with a user object.
  - System: `AuthRoute` shows children.
  - Output: Protected children are visible.

- Unauthenticated flow:
  - Input: `isFirebaseConfigured` true and `onAuthStateChanged` calls back with `null`.
  - System: `AuthRoute` shows a loading indicator and triggers navigation to `/login`.
  - Output: Loading text appears and `useNavigate('/login')` is called.

Test cases
1) Bypass (no firebase configured)
   - Render `AuthRoute` with `isFirebaseConfigured: false` and `auth: undefined` mocked.
   - Provide an `onAuthSuccess` mock and a child node.
   - Assert: child is rendered and `onAuthSuccess` was called.

2) Authenticated user
   - Mock `isFirebaseConfigured: true` and `auth: {}`.
   - Mock `onAuthStateChanged` to call back with a fake user ({ uid, displayName }).
   - Assert: child is rendered.

3) Unauthenticated user
   - Mock `isFirebaseConfigured: true` and `auth: {}`.
   - Mock `onAuthStateChanged` to call back with `null`.
   - Mock `useNavigate` and assert it was called with `/login`.
   - Assert: component shows a loading indicator while redirect logic runs.

Edge cases
- Confirm `AuthRoute` does not crash if `auth` is undefined but `isFirebaseConfigured` true (rare config mismatch).
- Ensure `signOut` errors are caught gracefully when calling `logout` (if covered separately).

Mocking strategy
- Mock `web/src/firebase.ts` exports: `isFirebaseConfigured` and `auth` per-test using runtime mocks (Vitest `vi.doMock`), so module-level values are evaluated against the mock when `AuthRoute` is imported.
- Mock `firebase/auth` functions used by the component: `onAuthStateChanged` and `signOut`.
- Mock `react-router-dom`'s `useNavigate` to capture navigation calls.

How to run
- From the `web` folder (PowerShell):
```
cd web
npx vitest src/context/__tests__/AuthRoute.test.tsx --run
```
Or run the whole test suite:
```
cd web
npm run test
```

Notes
- Tests use runtime mocks (`vi.doMock`) so the mocked values are in place before `AuthRoute` is imported. This avoids hoisting issues and ensures the module-level computed values in `AuthRoute` (like `firebaseEnabled`) reflect the mocked environment.
- The tests are intentionally lightweight and focused on behavior. For end-to-end coverage, consider adding integration or Cypress tests that exercise real Firebase behavior in a staging environment.

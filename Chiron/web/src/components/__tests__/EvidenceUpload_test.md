Testing plan: ControlDetail — Evidence upload, listing, and deletion

Branch
feature/test-control-detail

Goal
- Verify the ControlDetail page correctly allows users to upload evidence, lists uploaded evidence, and allows authorized users to delete evidence.

Scope
- Component + integration-style tests with Vitest + React Testing Library.
- Run in demo/offline mode by mocking Firebase so tests are deterministic.

User stories
- As a signed-in user, I can upload a file for a control and see it listed under Evidence.
- As the uploader, I can remove my uploaded file and it will disappear from the list.
- As a workspace owner, I can remove other users' uploaded evidence.

Contracts / Success criteria
- Upload flow:
  - Input: user selects a file in the Evidence section for a specific control.
  - System: upload is initiated to Storage and the business document is updated with evidence metadata.
  - Output: Evidence appears in ControlDetail evidence list with filename, uploadedBy, timestamp, and a Download button.

- Delete flow:
  - Input: user clicks Remove on an evidence item they uploaded or have manager rights for.
  - System: Storage object is deleted and Firestore evidence metadata is removed.
  - Output: Evidence item is removed from the UI list.

Test cases
1) Upload happy path
   - Render ControlDetail for a control with BusinessProvider; mock Firebase as configured in tests.
   - Mock storage upload to immediately succeed and return a download URL.
   - Click the file input and simulate selecting a file.
   - Assert: upload function was called, Firestore runTransaction was invoked, and the evidence list shows the new item.

2) Evidence listing
   - Render ControlDetail with selectedBusiness.evidence containing several items (some matching controlId) and verify only matching items are displayed.
   - Assert: each displayed item shows filename, uploadedBy, human-readable timestamp, and Download button.

3) Delete by uploader
   - Render ControlDetail with an evidence item uploadedBy currentUser.
   - Click Remove; mock deleteObject and Firestore transaction to succeed.
   - Assert: deleteObject was called with correct storage path and item removed from UI.

4) Delete by manager
   - Render ControlDetail where currentUser is a manager (canManageSelected true) and evidence uploadedBy someone else.
   - Click Remove; ensure deletion proceeds and UI updates.

5) Error handling
   - Simulate storage delete failure (deleteObject throws) but Firestore update still succeeds: UI should still remove item (or show a warning) — assert behavior matches decisions.
   - Simulate Firestore transaction failure: UI should display an error message and keep the evidence item in the list.

Edge cases
- Upload without signing in should show an error and not call storage.
- Large files: simulate oversized file and assert uploader shows an error message.
- Filename collisions: test that uploaded items use a unique id (timestamp + filename) to avoid metadata collisions.

Mocking strategy
- Mock `firebase/storage` functions: `ref`, `uploadBytesResumable`, `getDownloadURL`, `deleteObject`.
- Mock `firebase/firestore` functions: `doc`, `runTransaction`, and `arrayUnion`.
- Mock `../../context/AuthRoute.getCurrentUserID` to return a test uid.
- Mock `global.fetch` calls used by BusinessProvider to supply static control and business JSON.

Additional tests added
- Evidence list rendering: verifies that `EvidenceList` displays only evidence items matching the given `controlId`, shows filename and "Uploaded by" metadata, and renders Download and Remove buttons as appropriate.
- Permission cases: verifies Remove is shown when the current user is the uploader, and also when the current user has manager rights (`canManageSelected`).

How to run
- From the web folder:
```
cd web
npm ci
npm test
```

Notes
- These tests are unit/integration tests (not full e2e) and rely on mocks. For true end-to-end validation of Storage/Firestore behavior, consider using the Firebase Emulator Suite in CI or adding Cypress tests against an emulator.
- Keep the evidence metadata schema in sync between uploader and tests (use `id`, `name`/`filename`, `path`, `url`, `uploadedBy`, `uploadedAt`).


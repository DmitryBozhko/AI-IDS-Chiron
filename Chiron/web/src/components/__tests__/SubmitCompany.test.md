Testing plan: Submit company - Upload company form

Branch
create_company

Goal
- Verify the submit company firebase end-point.

Scope
- Component + integration-style tests with Vitest + React Testing Library.
- Run in demo/offline mode by mocking Firebase so tests are deterministic.

User stories
- As a signed-in user, I can create a company and invite and designate roles for teammates.

Contracts / Success criteria
- Upload company flow:
  - Input: user enters the minimum or all the information needed to create company (not implemented yet: invite the desired members by email to join the company). Then press the submit company button form.
  - System: upload is initiated to Storage. (not implemented yet: send invites all the users)
  - Output: The new company appears on the company selector and the needed certificate data is set for the company.

- Incorrect/Incomplete submition flow:
  - Input: user clicks to create company button with unavailable/wrongly formated data or missing fields.
  - System: Gets the inputs, then filterout the errors, and if needed safely ends the transaction before uploading the information to the database.
  - Output: Error messages are displayed in the UI.

Test cases
1) Submition end-to-end with database
   - Render SubmitCompany component. Add a dummy company information in the needed fields, adds a dummy invite with viewer role, selects a certificate, and finally submits and waits for a setDoc to be called.
   - Asert: 
        - Document with the correct id, and business name

Edge cases
- Displaying the Company may take some time to be fully vissible for others due to the company certificate setting up.

Mocking strategy
- Mock `firebase/firestore` functions: `setdoc`, and `doc`.

How to run
- From the web folder:
```
cd web
npm ci
npm test
```

Notes
- These tests are unit/integration tests (not full e2e) and rely on mocks.


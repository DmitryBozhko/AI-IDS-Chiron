# Roadmap (Semester)

## Week 3–4: MVP Skeleton
- Controls List and Control Detail pages (local sample data)
- Status changes and objectives checkboxes (local state)
- Basic UI polish and filters

## Week 4–5: Firebase Foundations
- Enable Firebase Auth (Google), read-only Firestore pulling controls
- Storage setup and a small test upload flow
- Set Firestore/Storage rules; test in emulator

## Week 6–7: Editing + Comments
- Write control status and comment updates to Firestore
- Comments subcollection (create/edit/delete by author)
- Evidence metadata in Firestore and files in Storage

## Week 8–9: Roles + Audit
- userProfiles and simple roles (owner/editor/viewer)
- Guard writes in rules based on role
- Add updatedBy/updatedAt fields; basic change log view

## Week 10+: Reporting + Polish
- Filters, search, export (CSV or simple PDF)
- Performance passes and UX improvements
- Prepare demo dataset and walkthrough

## Suggested Team Split (4 people)
- FE (UI): Controls List/Detail, components, routing
- FE (Integration): Firebase Auth, Firestore/Storage wiring
- BE (Rules/Model): Rules tuning, data model, migration scripts
- QA/Docs: Test scenarios, demo content, docs & deployment


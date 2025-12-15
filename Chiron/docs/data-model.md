# Data Model

## Collections (Firestore)

controls (110 docs total)
- id: string (e.g., "AC.L2-3.1.1")
- code: string (same as id)
- title: string
- family: string (e.g., "Access Control")
- status: enum("not_implemented","partially_implemented","fully_implemented") or absent (unanswered)
- objectives: array<Objective>
- comment: string (primary answer/notes)
- updatedBy: uid
- updatedAt: timestamp

Objective
- id: string (ordinal, e.g., "o1")
- text: string
- done: boolean

comments (subcollection under controls/{controlId})
- authorUid
- authorName
- text
- createdAt
- updatedAt

evidence (top-level or subcollection under controls/{controlId})
- controlId
- storagePath (Storage path)
- filename
- size
- contentType
- uploadedBy
- uploadedAt
- objectiveIds: array<string> (optional linkage to objectives)

userProfiles (optional for roles)
- role: enum("owner","editor","viewer")
- displayName, email, photoURL

## Storage (Firebase Storage)

Paths:
- evidence/{controlId}/{uid}/{filename}

## Security (Overview)
- Auth required for all reads/writes.
- Only the author can edit/delete their own comments and evidence metadata.
- Evidence file write limited to owner path (uid == request.auth.uid).
- Validate `status` enum and objective structure via rules.

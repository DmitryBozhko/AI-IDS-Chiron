# Chiron Requirements (MVP → Iteration)

## Goals
- Track all 110 CMMC practices (Level 2 baseline) with:
  - Status: Not Implemented, Partially Implemented, Fully Implemented, or Unanswered
  - Objectives checklist per control
  - Evidence attachments
  - Comment/answer field and threaded discussion
  - Audit metadata (who/when updated)

## Personas
- Assessor: reviews evidence and marks objectives/controls complete
- Implementer: uploads evidence, writes comments, updates status
- Viewer: read-only

## Core Views
- Dashboard: summary counts by status, quick filters
- Controls List: all 110 controls with status badge, filter/search
- Control Detail: objectives checklist, evidence list/upload, comments, status update

## Status Definitions
- Not Implemented: No meaningful progress
- Partially Implemented: Some objectives complete or evidence exists
- Fully Implemented: All objectives complete, sufficient evidence
- N/A (optional): Justified out-of-scope

## Evidence
- Upload files (PDF, DOCX, PNG/JPG, TXT, CSV, etc.) to Firebase Storage
- Link evidence items to a control and optionally to specific objectives
- Store metadata: filename, size, uploadedBy, uploadedAt, notes

## Comments
- Control-level comments with author and timestamp
- Basic edit/delete by author

## Non-Functional
- Team-collaboration friendly UI
- Secure by default (Firestore/Storage rules)
- Minimal vendor lock-in: simple data export path

## Stretch (Later)
- Reports and exports (CSV/PDF)
- Role-based access per project/organization
- Audit trail of all changes
- Mapping to NIST 800-171 / CMMC 2.0 practices beyond Level 2

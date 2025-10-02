# Firestore Composite Indexes Guide (AccreditEx)

This document explains when you need composite indexes, recommended indexes for AccreditEx, and how to add them step‑by‑step using either the Firebase Console or the Firebase CLI with a firestore.indexes.json file.

---

## 1) What are composite indexes and when do you need them?

Cloud Firestore automatically indexes each document by ID and also creates single‑field indexes by default. You need a composite index when your query:

- Filters on multiple fields (equality + range or multiple equalities)
- Combines `where(...)` with `orderBy(...)` on a different field
- Uses multiple `orderBy(...)` clauses
- Runs a collection group query with filters & sorting

Examples that require composite indexes:
- `where('programId', '==', pid).where('status', '==', 'In Progress').orderBy('endDate', 'desc')`
- `where('assignedTo', '==', uid).where('status', 'in', [...]).orderBy('dueDate')`
- `collectionGroup('documents').where('type', '==', 'Procedure').where('status', '==', 'Draft').orderBy('reviewDate', 'desc')`

---

## 2) Option A (fastest): Create indexes via Firebase Console on demand

1. Run your app. When Firestore needs an index, the query fails with an error like:
   > FAILED_PRECONDITION: The query requires an index. You can create it here: https://console.firebase.google.com/.../firestore/indexes?create_composite=...

2. Click the link in the error. This opens the exact index configuration prefilled.
3. Click Create Index. Wait for the index to build (usually seconds to minutes).
4. Reload the page and re‑run the query.

Pros: Easiest for ad‑hoc development.
Cons: Not tracked in version control or CI by default.

---

## 3) Option B (preferred): Use Firebase CLI with firestore.indexes.json

This approach keeps indexes in source control and supports CI/CD.

### 3.1) Install and log in

- Install the CLI:
  - macOS: `brew install firebase-cli`
  - Windows: `npm i -g firebase-tools`
- Authenticate: `firebase login`

### 3.2) Initialize (if not already)

From your project root:
- `firebase init firestore`
- Choose: use existing project → select your Firebase project
- Accept prompts to create `firestore.indexes.json` (and optionally `firestore.rules`)

### 3.3) Recommended indexes (AccreditEx)

Copy the following JSON into `firestore.indexes.json` (replace the entire `indexes` and `fieldOverrides` arrays). This set anticipates common queries for projects, checklists, documents, notifications, audits, risks, incidents, and standards.

```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "programId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "endDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "programId", "order": "ASCENDING" },
        { "fieldPath": "progress", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "checklist",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "assignedTo", "order": "ASCENDING" },
        { "fieldPath": "dueDate", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "documents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "reviewDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "audits",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "planId", "order": "ASCENDING" },
        { "fieldPath": "dateConducted", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "risks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "impact", "order": "DESCENDING" },
        { "fieldPath": "likelihood", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "incidents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "severity", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "incidentDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "standards",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "programId", "order": "ASCENDING" },
        { "fieldPath": "section", "order": "ASCENDING" },
        { "fieldPath": "standardId", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "documents",
      "fieldPath": "content",
      "indexes": []
    },
    {
      "collectionGroup": "projects",
      "fieldPath": "checklist",
      "indexes": []
    }
  ]
}
```

What these support:
- Projects:
  - `where('programId','==',pid).where('status','==','In Progress').orderBy('endDate','desc')`
  - `where('programId','==',pid).orderBy('progress','desc')`
- Checklist (collection group):
  - `where('assignedTo','==',uid).where('status','in',[...]).orderBy('dueDate')`
- Documents:
  - `where('type','==','Procedure').where('status','==','Draft').orderBy('reviewDate','desc')`
- Notifications:
  - `where('userId','==',uid).orderBy('timestamp','desc')`
- Audits:
  - `where('planId','==',planId).orderBy('dateConducted','desc')`
- Risks:
  - `where('status','==','Open').orderBy('impact','desc').orderBy('likelihood','desc')`
- Incidents:
  - `where('severity','==','Severe').where('status','==','Open').orderBy('incidentDate','desc')`
- Standards:
  - `where('programId','==','prog-oman-smcs').where('section','==','Provision of Care').orderBy('standardId')`

> Note: Adjust collection/field names as you finalize your Firestore schema.

### 3.4) Deploy indexes

- From the project root: `firebase deploy --only firestore:indexes`
- Wait until deployment completes and index status is "Enabled".

### 3.5) Verify

- Run your app and execute the queries. If Firestore still suggests an index, create it via the link and then mirror it back into `firestore.indexes.json`.

---

## 4) Best practices

- Create indexes only for queries you actually use; every index increases write cost and storage.
- Prefer collection group indexes for repeated subcollection shapes (e.g., `checklist`).
- Use `fieldOverrides` to disable indexing of large fields (blob‑like content or arrays), reducing costs.
- Keep `firestore.indexes.json` in source control and deploy via CI to keep environments consistent.
- When you change query patterns, let Firestore suggest the exact index first; then generalize your indexes file.

---

## 5) Troubleshooting

- Error: FAILED_PRECONDITION: The query requires an index
  - Click the provided link in the error to auto‑create the index.
  - Or translate the link’s parameters into a composite in `firestore.indexes.json` and deploy.

- Index creation takes too long
  - Large datasets or many indexes can increase build time. Reduce unnecessary indexes and avoid over‑indexing large fields.

- Writes are slow or expensive
  - You may have too many indexes or are indexing large fields unnecessarily. Remove indexes you don’t use and disable single‑field indexing for large fields through `fieldOverrides` or security rules as appropriate.

---

## 6) Summary

- Use the Console to create indexes quickly during development.
- For production, track everything in `firestore.indexes.json` and deploy via CLI.
- Start with the recommended indexes above and refine as your query patterns stabilize.

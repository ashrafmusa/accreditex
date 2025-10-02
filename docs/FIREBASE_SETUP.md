# Firebase Configuration Guide

This project uses Firebase for authentication (and optionally Firestore user profiles). The rest of the app data is currently stored in the browser (localStorage) as part of the mock backend.

This guide explains how to configure Firebase for local development and production builds.

- Auth: Email/Password via Firebase Auth
- User Profiles: Stored in Firestore under the `users` collection (optional but recommended)
- SDK: Firebase Web v9+ Modular SDK (tree-shakable)
- Build: Vite; configuration read from `import.meta.env.VITE_*` variables

---

## 1) Environment variables (.env.local)

Create or update a `.env.local` file at the project root with your Firebase configuration variables. Vite only exposes variables that start with `VITE_` to the client.

Example (replace with your project values):

```
VITE_FIREBASE_API_KEY=AIzaSyBPkTWdojLlQBG7E9OPWCXPZ_Zzg31YrLg
VITE_FIREBASE_AUTH_DOMAIN=accreditex-79c08.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=accreditex-79c08
VITE_FIREBASE_STORAGE_BUCKET=accreditex-79c08.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=600504438909
VITE_FIREBASE_APP_ID=1:600504438909:web:5e25200e69243a615e2114
VITE_FIREBASE_MEASUREMENT_ID=G-41932M9TKF
```

Notes:
- These are client-side web keys; they are expected to be visible in the browser (normal for Firebase).
- Do not include non-`VITE_` secrets; Vite will not expose them to the client.

Restart the dev server after editing `.env.local` so Vite picks up the changes.

---

## 2) Firebase initialization (modular SDK)

The app initializes Firebase using the modular SDK in `firebase/firebaseConfig.ts` and exports `auth` and `db`:

- `auth`: Firebase Auth instance
- `db`: Firestore instance

Ensure you have the following in that file (already configured):

- Read config from `import.meta.env.VITE_FIREBASE_*`
- Initialize the app with `initializeApp`
- Export `getAuth(app)` and `getFirestore(app)`

No compat APIs or analytics are used to avoid Electron/SSR issues.

---

## 3) Enable auth provider

In Firebase Console → Authentication → Sign-in method:
- Enable Email/Password
- (Optional) Enable any additional providers you plan to use (Google, SSO, etc.)

If you’re using seed users from `data/users.json`, you must also create corresponding Firebase Auth users to sign in with the same email addresses. Example seed record:

- Email: `e.reed@healthcare.com`
- Role: `Admin`

Create that user in Firebase Auth with a password (e.g., `password123`) to match your testing scenario.

---

## 4) User profile documents (Firestore)

The app listens to auth state (`onAuthStateChanged`) and then attempts to load a matching user profile document from Firestore at `users/{uid}`. If no document exists, the app constructs a minimal fallback user from Firebase account data so the UI remains usable. For full roles and profile features, create the Firestore doc.

Collection: `users`
- Document ID: the Firebase UID

Recommended document shape (aligns with the app’s `User` type):

```
{
  "id": "<uid>",
  "name": "Dr. Evelyn Reed",
  "email": "e.reed@healthcare.com",
  "role": "Admin",               // Admin | ProjectLead | TeamMember | Auditor
  "departmentId": "dep-7",       // optional
  "jobTitle": "Chief Medical Officer",
  "hireDate": "2018-03-12",
  "competencies": [],
  "trainingAssignments": [],
  "readAndAcknowledge": []
}
```

Mapping from seed data (`data/users.json`) to Firestore:
- Keep the `email` and profile fields the same.
- Use the Firebase user’s UID as the document ID and set `id` to the same value (or omit `id` and the app will default to the UID).
- `role` must be one of: `Admin`, `ProjectLead`, `TeamMember`, `Auditor`.

---

## 5) How the login flow works in this app

- `useUserStore.login(email, password)` calls `signInWithEmailAndPassword(auth, email, password)`.
- `useFirebaseAuth()` (in `firebase/firebaseHooks.ts`) subscribes to `onAuthStateChanged`:
  - If logged in: tries to fetch `users/{uid}`
    - If found: maps the document to the app’s `User` type and sets `currentUser`
    - If missing: builds a minimal `User` using Firebase account data (UID, email); defaults `role` to `TeamMember`
  - If logged out: clears `currentUser`

Admin-only areas require a user with `role: Admin`. Create/maintain that role in the Firestore user document.

---

## 6) Development and dev server

- Dev server: Vite at `http://localhost:3000`
- If you see module 500 errors in dev (for TSX files), ensure you are loading the app via the Vite dev server (not a static/non-Vite server) and that no stale service worker is caching dev requests.
- The app only registers the service worker in production. In dev, any previously registered SW is unregistered on load.

Common fixes:
- Stop other servers on :3000
- Clear site data / unregister SW (Chrome DevTools → Application)
- Restart `npm run dev`

---

## 7) Firestore Security Rules (example)

Adjust these to your needs. A simple starting point:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require auth for all reads/writes by default
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Users collection example
    match /users/{userId} {
      // Users can read their own profile; admins can read all
      allow read: if request.auth != null;

      // Only the user themselves or an admin can update their profile
      allow write: if request.auth != null && (
        request.auth.uid == userId ||
        // Example admin check via custom claims (configure via backend admin SDK)
        (request.auth.token.admin == true)
      );
    }
  }
}
```

For production, consider using custom claims for role-based access and more granular rules.

---

## 8) Troubleshooting

- TypeScript error: `Property 'env' does not exist on type 'ImportMeta'`:
  - Ensure `tsconfig.json` includes `"types": ["node", "vite/client"]`
- Firebase Auth errors (invalid API key or domain):
  - Verify `.env.local` values and that they match the Firebase Console → Project settings → Your apps → Web
- Login works but no admin access:
  - Ensure a Firestore user document exists for the signed-in UID with `role: "Admin"`
- AI key not found (if using AI features):
  - Use `VITE_GOOGLE_GENAI_API_KEY` in `.env.local` for web builds (and/or `process.env.API_KEY` in Electron)

---

## 9) Optional: Migrating app data to Firestore

Currently, only authentication (and optionally user profiles) use Firebase. The rest of the data is managed via a mock localStorage-backed data service. If you plan to move projects, documents, etc., to Firestore, migrate endpoints gradually:

- Mirror the data model to Firestore collections
- Replace the `dataService` setters/getters with Firestore reads/writes
- Add offline support via Firestore’s cache if needed

---

## 10) Summary

- Configure `.env.local` with Vite-prefixed Firebase variables
- Enable Email/Password in Firebase Auth
- Create Firebase Auth users and optional `users/{uid}` Firestore documents with the app’s `User` shape
- Start the app with `npm run dev` and sign in using your Firebase Auth credentials

This setup lets you authenticate users via Firebase while keeping the rest of the app functional with mock data, and provides a migration path to a full Firebase backend when you’re ready.

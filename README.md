# My Date Planner

A personal invitation for Sanskruti built with React 19, TypeScript, TanStack Start, Tailwind CSS, Motion and Firebase Firestore.

## Invitation

The public `/` page renders immediately from bundled settings with no database or authentication request on page load. The flow is welcome → “Are you single?” → date idea → outfit photo slider → date selection → confirmation. “No” moves to a random visible position and requests phone vibration when supported. There is no “Are you free?” step or teasing message.

Cards, buttons and modals use `rounded-lg`; modals are centered on mobile and desktop. Date selection is a simple single-day calendar without mode tabs. Only final confirmation contacts Firestore: it rechecks current availability and saves a response.

## Local development

Use Node.js 24 or newer and npm:

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

The development server runs at http://localhost:8080. npm and `package-lock.json` are the supported package manager and lockfile.

## Firebase

The checked-in `.env` contains the public web app configuration for `thesamplebee`. Firestore uses the default database; Realtime Database and Analytics are not initialized. Never add service-account credentials to client environment variables.

Collections:

- `invite_settings/default`: invitation text, date rules, derived `available_windows`, and a server timestamp `updated_at`.
- `invite_responses/{autoId}`: confirmed availability, selected date or range, `window_index`, `date_type`, `outfit`, and server timestamp `created_at`. The compatibility fields `is_single` and `is_free` indicate the positive invitation answer and availability confirmed by choosing dates.

Edit `firebase/invite-settings.json` to change the bundled UI. To publish those same settings to Firestore, use a trusted service account through `GOOGLE_APPLICATION_CREDENTIALS` and run:

```sh
npm run firebase:seed
```

This creates the document only if it does not exist. For an intentional settings update:

```sh
npm run firebase:seed -- --update
```

The script and settings hook derive contiguous available windows from the blocked dates. Always use them when updating date rules so a range cannot cross a blocked day. Historical responses are not imported by the settings script.

## Access rules

`firestore.rules` allows public reads of the invitation and validated response creation. Settings writes and response reads require a Firebase Authentication custom claim `admin: true`, assigned by a trusted administrator. There are no login or admin dashboard pages in this repository, and clients cannot grant themselves admin access.

Publish rules after signing in with an account that manages this Firebase project. If the project hosts other apps, merge their existing rules before publishing this file:

```sh
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project thesamplebee
```

Local rule changes do not automatically update Firebase's live rules. Verify deployment before sharing the invitation publicly.

## Firestore rules tests

Requires Java 21 and the Firebase CLI (downloaded by npx). All test data stays in a local demo project:

```sh
npm run test:rules
```

Tests cover public/private access, admin claims, valid submissions, blocked dates and ranges, disabled selection, timestamp forgery, invalid fields and role escalation.

## Lovable

This repository remains connected to the Lovable editor. Avoid rewriting published Git history. Pushing changes to the connected branch syncs them to Lovable.

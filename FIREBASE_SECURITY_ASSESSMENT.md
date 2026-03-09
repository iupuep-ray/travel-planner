# Firebase Security Assessment

## Current state

- This app already uses Firebase Authentication, so the fastest containment is to require login for all Firestore and Storage access.
- The current Firestore schema is mostly shared top-level collections:
  - `members`
  - `schedules`
  - `planning`
  - `expenses`
  - `settlements`
  - `pushTokens`
- Because `schedules`, `planning`, `expenses`, and `settlements` are not scoped by `tripId`, `ownerUid`, or `allowedMemberIds`, Firestore rules cannot safely distinguish which authenticated user should access which document.

## What can be fixed now without changing plan

- Disable all anonymous/public client access immediately.
- Require authenticated access for Firestore collections used by the app.
- Restrict `members` profile writes so a user can only create, update, or delete the member document that belongs to their own `authUid`.
- Restrict `pushTokens` so a user can only manage tokens tied to their own `authUid`.
- Lock down Cloud Functions internal collections from client access.
- Require authenticated image access in Firebase Storage and reject non-image or oversized uploads.

## Important tradeoff

- The provided rules are a strong containment baseline, not a fully least-privilege design.
- With the current schema, any signed-in user can still read and write shared trip data in:
  - `schedules`
  - `planning`
  - `expenses`
  - `settlements`
- This is a schema limitation, not a Blaze-plan limitation.

## Likely product impact

- Self-registration continues to work because signup creates a `members` document whose `authUid` matches the logged-in user.
- Editing or deleting your own member profile continues to be possible.
- Creating arbitrary guest members from the members page will be blocked by these rules, because those documents are not tied to the current user's `authUid`.

## Recommended next refactor

- Add a `trips/{tripId}` boundary.
- Move shared data under trip-scoped paths such as:
  - `trips/{tripId}/members/{memberId}`
  - `trips/{tripId}/schedules/{scheduleId}`
  - `trips/{tripId}/planning/{planningId}`
  - `trips/{tripId}/expenses/{expenseId}`
- Add a trip membership document keyed by auth UID, for example:
  - `trips/{tripId}/access/{authUid}`
- Then enforce rules like "user must be a member of this trip" instead of "user is simply signed in".

## Deployment

- Firestore rules file: `firestore.rules`
- Storage rules file: `storage.rules`
- Update `firebase.json` to deploy these rules before the current test-mode deadline is reached.

# Goal
Add new backend endpoints for managing batches (Delete All, Edit, Delete Single, and Trigger Seed), and stop `seedBatches` from running automatically on startup.

## Proposed Changes

### Backend (`lilsculprbackend`)
- **[MODIFY] `server.js`**: Remove the code that automatically runs `seedBatches.js` on `npm start`.
- **[MODIFY] `routes/batch.routes.js`**: Add new API routes:
  - `POST /api/batches/seed` - Triggers the seed script.
  - `DELETE /api/batches/all` - Deletes all batches (useful for completely clearing the wrong batches).
  - `DELETE /api/batches/:id` - Deletes a specific batch by ID.
  - `PUT /api/batches/:id` - Edits/updates a specific batch.
- **[MODIFY] `controllers/batch.controller.js`**: Implement the logic for the above new routes.
- **[MODIFY] `seed/seedBatches.js`**: Export the `seedBatches` function so it can be called seamlessly from the `POST /seed` endpoint without terminating the server process.

## Open Questions
- Do you want these new administrative routes to be protected by authentication (e.g., only accessible by Admins), or should they be open for now while we test? (I will protect them with your standard admin middleware by default unless you say otherwise).

## Verification Plan
- Start the local server.
- Test the endpoints via `curl` to ensure they delete, edit, and seed batches correctly.

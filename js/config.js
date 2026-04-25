// ── Configuration ────────────────────────────────────────────────────────────
// Leave GAS_URL empty to run in DEMO MODE — the app uses an in-browser mock
// backend (js/mock-backend.js) seeded with sample data, no deployment needed.
//
// To wire up the real Apps Script backend:
//   1. Deploy google-apps-script.js (see README) and copy the /exec URL
//   2. Paste it below
//   3. Commit + push so all team leads share the same backend

const GAS_URL = '';

// Admin access code — anyone hitting /?view=admin must enter this.
// Change this to whatever you want to gate the admin dashboard.
const ADMIN_ACCESS_CODE = 'mecka-admin';

// Polling interval for admin dashboard (ms).
const ADMIN_POLL_INTERVAL = 60000;

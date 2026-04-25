# Mecka Dispatch — UX Prototype & Handoff Spec

**Internal tool for hub team leads to submit SD card dispatches and device return requests.**

This repo is a **clickable prototype** that doubles as the spec for the engineering team. Open `index.html` in any browser — it runs entirely in-browser using a mock backend seeded with sample data. No deployment, no setup.

When the engineering team is ready to build the production version, they can either:

- **Wire up the included Apps Script backend** ([`google-apps-script.js`](google-apps-script.js)) by pasting the URL into [`js/config.js`](js/config.js) — and the same UI works against a real Google Sheet, or
- **Reimplement** the backend in any stack of choice. The API surface is documented below.

---

## Try it

```bash
# Either:
open index.html

# Or serve over HTTP (recommended — some browsers restrict file:// origins):
python3 -m http.server 8000
# then visit http://localhost:8000
```

You'll land on the team-lead home screen with a **demo-mode banner** at the top. Click "Open admin view →" in the banner to see the dashboard with seeded data, or "Reset demo data" to wipe everything back to defaults.

Default admin access code: `mecka-admin` (change in [`js/config.js`](js/config.js)).

---

## What it does

Two distinct submission flows for hub team leads at the four filming hubs (**Manila, Jakarta, Bali, HCM**), plus an admin dashboard for the upload center.

### Flow A — Send SD Cards

A team lead declares "I'm sending N SD cards to the upload center, expected handoff at time T."

**Fields captured:**

| Field | Required | Notes |
|---|---|---|
| Hub | ✅ | Manila / Jakarta / Bali / HCM |
| Team Name | ✅ | Free text — remembered in localStorage across sessions |
| Business ID | optional | Merchant identifier |
| SD Card Count | ✅ | Integer ≥ 1 |
| Expected Handoff Time | ✅ | datetime, defaults to now + 2h |
| Notes | optional | Free text |

**On submit** → row written, status = `Submitted`, confirmation screen shows reference ID + summary. Reference ID format: `SD-YYYYMMDD-XXXX`.

**Status transitions** (admin-driven): `Submitted → In Transit → Received → Processed`. When admin marks `Received`, they enter the actual count received; the system computes variance (actual − submitted).

### Flow B — Return Devices

A team lead requests replacement devices, bundling Multicams and CM5s in a single submission.

**Step 1 — Context:** Hub, Team Name, Business ID, Reason (`Broken / Faulty — RMA` or `End of Filming Cycle — Rotation`). If broken, a Fault Description is required.

**Step 2 — Devices:** Two toggleable sections side-by-side (stacked on mobile):

- **Multicam** — toggle on → Count, IDs (one per line or comma-separated), Replacements Needed
- **CM5** — same shape

**Validation rules:**

- At least one device type must be toggled on (blocks submit)
- For each toggled-on type: count and at least one ID required (blocks submit)
- Count must match the number of IDs entered — if they don't, show a warning but **do not block** (real-world IDs can be messy)
- Fault description required if reason = `broken_rma` (blocks submit)

**On submit** → row written, status = `Submitted`, confirmation screen with reference ID `RET-YYYYMMDD-XXXX`. Copy: "The logistics team will review and confirm shipment."

**Status transitions** (admin-driven): `Submitted → Reviewing → Approved → Shipped → Closed`.

### Flow C — Admin dashboard

`/?view=admin` — gated by access code. Two tabs: **SD Cards** and **Device Returns**.

- **Hub summary cards** at the top (one per hub): SD cards inbound, returns open, open RMAs
- **Filterable tables** — by hub, status, and (for returns) reason
- **Inline status updates** — change the status dropdown, hit Save
- **Inline actual-count entry** for SD cards — variance auto-calculated and color-coded (green=0, red=negative, orange=positive)
- **Expandable rows** for returns — show full device IDs, fault description, and admin notes
- **60-second auto-refresh** — also a manual refresh button
- **Status badge colors** — distinct hue per status, defined in [`js/constants.js`](js/constants.js)

---

## Data model

Three "tables" (Sheet tabs in the GAS implementation):

### `sd_card_submissions`
`submission_id, timestamp, hub, team_name, business_id, sd_count_submitted, expected_handoff_time, notes, status, sd_count_actual, variance, updated_at`

### `device_return_requests`
`request_id, timestamp, hub, team_name, business_id, reason, multicam_count, multicam_ids, cm5_count, cm5_ids, replacement_multicam_needed, replacement_cm5_needed, fault_description, photo_urls, status, notes, updated_at`

> `photo_urls` field exists but no upload UI in v1 — leave blank.

### `hub_summary` (auto-computed on every write)
`hub, sd_pending_inbound, device_returns_open, open_rmas, updated_at`

---

## API surface

The mock backend ([`js/mock-backend.js`](js/mock-backend.js)) and the Apps Script backend ([`google-apps-script.js`](google-apps-script.js)) implement the same JSON-over-HTTP surface. Engineering team can match this contract when reimplementing on a different stack.

### POST `/exec`
Body: `{ "action": "...", "payload": {...} }`. All POSTs use `Content-Type: text/plain` to dodge the CORS preflight that Apps Script doesn't handle.

| action | payload |
|---|---|
| `submit_sd_cards` | `{ hub, team_name, business_id, sd_count_submitted, expected_handoff_time, notes }` |
| `submit_device_return` | `{ hub, team_name, business_id, reason, multicam_count, multicam_ids, cm5_count, cm5_ids, replacement_multicam_needed, replacement_cm5_needed, fault_description, photo_urls }` |
| `update_sd_status` | `{ submission_id, status, sd_count_actual }` |
| `update_device_status` | `{ request_id, status, notes }` |

### GET `/exec?action=...`

| action | params |
|---|---|
| `get_submissions` | `type=sd_cards\|device_returns`, `hub`, `status`, `reason` (`all` or specific value) |
| `get_hub_summary` | _(none)_ |
| `ping` | _(none)_ — sanity check |

### Response shape
Always `{ success: true, data: ... }` or `{ success: false, error: "..." }`.

---

## UX requirements that aren't obvious from clicking

- **Mobile-first.** Tap targets ≥ 44px (CSS variable `--tap`). Inputs use `font-size: 16px` to prevent iOS zoom-on-focus. The 2-step return form was specifically chosen so neither step overflows a phone screen.
- **No login.** Hub + team name is captured per submission, persisted in localStorage so the team lead doesn't retype it every time. Business ID also persisted.
- **Clear reference ID after every submit.** Team leads need to be able to text the upload center "Hey, where's RET-20260425-A1B2 at?"
- **Never silently fail.** API errors surface inline with a retry path.
- **Status is the source of truth.** Visible everywhere — confirmation screens, admin tables, hub summary cards.
- **All copy in [`js/strings.js`](js/strings.js).** Centralized for easy translation later. No hardcoded strings in render functions.

---

## File layout

```
mecka-dispatch/
├── index.html                  Static shell, loads scripts in order
├── css/style.css               All styles, mobile-first, no framework
├── js/
│   ├── config.js               GAS_URL + admin code (env-like config)
│   ├── strings.js              All UI strings (i18n-ready)
│   ├── constants.js            Hubs, statuses, status colors, LS keys
│   ├── mock-backend.js         In-browser fake GAS for demo mode
│   ├── api.js                  Routes calls to mock or real GAS
│   ├── forms.js                SD form + 2-step device return form
│   ├── admin.js                Admin dashboard + polling
│   └── app.js                  Router, demo banner, entry point
├── google-apps-script.js       Reference backend implementation
└── README.md
```

---

## Notes for the engineering team

**Things to keep:**

- The two-flow split (SD vs. device returns). They're operationally distinct and the team-lead flow really is two different actions.
- The reference IDs in the confirmation screen — operations runs on people texting these around.
- The `business_id` as optional — some hubs have a single team, some have many merchants per hub.
- Variance calculation on the SD side. The whole point of declaring a count up-front is so we can spot drift on receipt.
- The "warn but don't block" behavior on count/IDs mismatch. Hub team leads need to be able to submit messy data; the upload center reconciles it.

**Things that are placeholders / open questions:**

- **Photo upload** — schema field exists (`photo_urls`), no UI yet. Will probably want this for `broken_rma` returns. Pick a storage backend (S3, Cloudinary, GCS, etc.) and add an uploader to step 2 of the device return flow.
- **Notifications** — out of scope for v1. Likely Phase 2: email/Slack to the upload center on new submissions, and back to the team lead on status changes.
- **Auth** — none in v1. Internal-only. If the tool starts capturing more sensitive data, add SSO (Google Workspace is easiest given the GAS pairing).
- **Real-time updates** — admin uses 60s polling. Fine for now; not worth WebSockets at this scale.
- **Audit log** — only `updated_at` per row. If you need full edit history, add an append-only log tab/table.

**If keeping the GAS backend:**

1. Create a Google Sheet → Extensions → Apps Script → paste [`google-apps-script.js`](google-apps-script.js) → Save
2. (Optional) Run `setupSheets()` from the editor to pre-create tabs
3. Deploy → New deployment → Web app → Execute as: Me, Access: Anyone → copy `/exec` URL
4. Paste URL into [`js/config.js`](js/config.js) → demo banner disappears, real backend takes over

To smoke-test the deployed endpoint:

```bash
# IMPORTANT: don't use -X POST. Apps Script returns a 302 → GET that some
# clients drop the body on; -L plus letting curl auto-pick the method works.
curl -L 'https://script.google.com/macros/s/YOUR_ID/exec' \
  -H 'Content-Type: text/plain' \
  -d '{"action":"submit_sd_cards","payload":{"hub":"Manila","team_name":"Test","sd_count_submitted":5,"expected_handoff_time":"2026-04-25T18:00"}}'

curl 'https://script.google.com/macros/s/YOUR_ID/exec?action=ping'
```

// ── GAS API wrapper ─────────────────────────────────────────────────────────
// All POSTs use Content-Type: text/plain to dodge CORS preflight. GAS reads
// the raw body via e.postData.contents either way.
//
// Don't curl /exec with -X POST — Apps Script returns a 302 → GET redirect
// that some clients drop the body on. Use --location-trusted or POST without
// the explicit -X.
//
// If GAS_URL is empty, all calls are routed to the in-browser mock backend
// (mock-backend.js) so the demo runs without any deployment.

async function gasPost(action, payload) {
  if (isMockMode()) return mockCall(action, payload, null);
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, payload: payload || {} })
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

async function gasGet(action, params) {
  if (isMockMode()) return mockCall(action, null, params);
  try {
    const qs = new URLSearchParams({ action, ...(params || {}) }).toString();
    const res = await fetch(GAS_URL + '?' + qs);
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

// ── Submission helpers ──────────────────────────────────────────────────────
const api = {
  submitSDCards: (payload) => gasPost('submit_sd_cards', payload),
  submitDeviceReturn: (payload) => gasPost('submit_device_return', payload),
  updateSDStatus: (payload) => gasPost('update_sd_status', payload),
  updateDeviceStatus: (payload) => gasPost('update_device_status', payload),
  getSubmissions: (params) => gasGet('get_submissions', params),
  getHubSummary: () => gasGet('get_hub_summary'),
  ping: () => gasGet('ping')
};

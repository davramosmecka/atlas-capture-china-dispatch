// ════════════════════════════════════════════════════════════════════
// Mock backend — only used when GAS_URL is empty (demo / handoff mode).
// Mirrors the real Apps Script API surface so the engineering team can
// see exactly what payloads to send and what shapes come back.
//
// State is persisted in localStorage so refreshes don't wipe the data.
// Reset via the "Reset demo data" button on the home screen footer.
// ════════════════════════════════════════════════════════════════════

const MOCK_STORAGE_KEY = 'mecka_dispatch_mock_data_v1';
const MOCK_LATENCY_MS = 250;  // simulate network round-trip

// ── Storage ─────────────────────────────────────────────────────────────────
function mockLoad() {
  const raw = localStorage.getItem(MOCK_STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through */ }
  }
  const seeded = mockSeedData();
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function mockSave(state) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
}

function mockReset() {
  localStorage.removeItem(MOCK_STORAGE_KEY);
}

function mockId(prefix) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return prefix + '-' + yyyy + mm + dd + '-' + rand;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Seed data ───────────────────────────────────────────────────────────────
function mockSeedData() {
  const now = Date.now();
  const hours = (h) => new Date(now - h * 3600 * 1000).toISOString();
  const fwd = (h) => new Date(now + h * 3600 * 1000).toISOString();

  return {
    sd_card_submissions: [
      {
        submission_id: 'SD-DEMO-A1B2', timestamp: hours(2),
        hub: 'China', team_name: 'Fujian Partner', business_id: 'Business - Shenzhen - Ext - Fujian Partner',
        sd_count_submitted: '24', expected_handoff_time: fwd(3), notes: '',
        status: 'Submitted', sd_count_actual: '', variance: '', updated_at: hours(2)
      },
      {
        submission_id: 'SD-DEMO-C3D4', timestamp: hours(8),
        hub: 'China', team_name: 'Mr Ma', business_id: 'Business - Shenzhen - Ext - Mr Ma',
        sd_count_submitted: '36', expected_handoff_time: hours(2), notes: 'Driver dropping off at 4pm',
        status: 'In Transit', sd_count_actual: '', variance: '', updated_at: hours(4)
      },
      {
        submission_id: 'SD-DEMO-E5F6', timestamp: hours(26),
        hub: 'China', team_name: 'Kylar', business_id: 'Business - Shenzhen - Ext - Kylar',
        sd_count_submitted: '12', expected_handoff_time: hours(20), notes: '',
        status: 'Received', sd_count_actual: '11', variance: '-1', updated_at: hours(18)
      },
      {
        submission_id: 'SD-DEMO-G7H8', timestamp: hours(48),
        hub: 'China', team_name: 'Paul', business_id: 'Business - Shenzhen - Ext - Paul',
        sd_count_submitted: '20', expected_handoff_time: hours(40), notes: '',
        status: 'Processed', sd_count_actual: '20', variance: '0', updated_at: hours(36)
      }
    ],
    device_return_requests: [
      {
        request_id: 'RET-DEMO-J1K2', timestamp: hours(3),
        hub: 'China', team_name: 'Fujian Partner', business_id: 'Business - Shenzhen - Ext - Fujian Partner',
        reason: 'broken_rma',
        sets_returning: '2', sets_needed: '2',
        multicam_count: '2', multicam_ids: 'MC-1041, MC-1058',
        cm5_count: '1', cm5_ids: 'CM5-2207',
        replacement_multicam_needed: '2', replacement_cm5_needed: '1',
        fault_description: 'Two Multicams lost wifi pairing after firmware update; CM5 unit will not power on.',
        photo_urls: '',
        status: 'Submitted', notes: '', updated_at: hours(3)
      },
      {
        request_id: 'RET-DEMO-L3M4', timestamp: hours(20),
        hub: 'China', team_name: 'Mr Ma', business_id: 'Business - Shenzhen - Ext - Mr Ma',
        reason: 'end_of_cycle',
        sets_returning: '8', sets_needed: '8',
        multicam_count: '8', multicam_ids: 'MC-1100, MC-1101, MC-1102, MC-1103, MC-1104, MC-1105, MC-1106, MC-1107',
        cm5_count: '0', cm5_ids: '',
        replacement_multicam_needed: '8', replacement_cm5_needed: '0',
        fault_description: '',
        photo_urls: '',
        status: 'Reviewing', notes: '', updated_at: hours(14)
      },
      {
        request_id: 'RET-DEMO-N5P6', timestamp: hours(50),
        hub: 'China', team_name: 'Sandu', business_id: 'Business - Shenzhen - Ext - Sandu',
        reason: 'broken_rma',
        sets_returning: '3', sets_needed: '3',
        multicam_count: '0', multicam_ids: '',
        cm5_count: '3', cm5_ids: 'CM5-2301, CM5-2302, CM5-2303',
        replacement_multicam_needed: '0', replacement_cm5_needed: '3',
        fault_description: 'CM5 batteries swelling — pulled from circulation.',
        photo_urls: '',
        status: 'Approved', notes: 'Replacements shipping Tue from HK warehouse.', updated_at: hours(40)
      },
      {
        request_id: 'RET-DEMO-Q7R8', timestamp: hours(96),
        hub: 'China', team_name: 'Wang Qin', business_id: 'Business - Shenzhen - Ext - Wang Qin',
        reason: 'end_of_cycle',
        sets_returning: '4', sets_needed: '4',
        multicam_count: '4', multicam_ids: 'MC-1201, MC-1202, MC-1203, MC-1204',
        cm5_count: '4', cm5_ids: 'CM5-2401, CM5-2402, CM5-2403, CM5-2404',
        replacement_multicam_needed: '4', replacement_cm5_needed: '4',
        fault_description: '',
        photo_urls: '',
        status: 'Closed', notes: 'Replacements delivered + confirmed.', updated_at: hours(20)
      }
    ]
  };
}

// ── Hub summary recalc ──────────────────────────────────────────────────────
function mockComputeHubSummary(state) {
  const map = {};
  HUBS.forEach(h => { map[h] = { hub: h, sd_pending_inbound: 0, device_returns_open: 0, open_rmas: 0, updated_at: new Date().toISOString() }; });
  state.sd_card_submissions.forEach(r => {
    if (!map[r.hub]) return;
    if (r.status === 'Submitted' || r.status === 'In Transit') {
      map[r.hub].sd_pending_inbound += Number(r.sd_count_submitted) || 0;
    }
  });
  state.device_return_requests.forEach(r => {
    if (!map[r.hub]) return;
    if (r.status !== 'Closed') {
      map[r.hub].device_returns_open += 1;
      if (r.reason === 'broken_rma') map[r.hub].open_rmas += 1;
    }
  });
  return HUBS.map(h => map[h]);
}

// ── Mock action dispatcher (mirrors GAS doPost/doGet) ──────────────────────
async function mockCall(action, payload, params) {
  await delay(MOCK_LATENCY_MS);
  const state = mockLoad();
  const now = new Date().toISOString();

  if (action === 'submit_sd_cards') {
    const p = payload || {};
    if (!p.hub || !p.team_name || !p.sd_count_submitted) {
      return { success: false, error: 'Missing required fields' };
    }
    const id = mockId('SD');
    state.sd_card_submissions.push({
      submission_id: id, timestamp: now,
      hub: p.hub, team_name: p.team_name, business_id: p.business_id || '',
      sd_count_submitted: String(p.sd_count_submitted),
      expected_handoff_time: p.expected_handoff_time || '',
      notes: p.notes || '',
      status: 'Submitted', sd_count_actual: '', variance: '', updated_at: now
    });
    mockSave(state);
    return { success: true, data: { submission_id: id, timestamp: now } };
  }

  if (action === 'submit_device_return') {
    const p = payload || {};
    if (!p.hub || !p.team_name || !p.reason) return { success: false, error: 'Missing required fields' };
    if (p.reason === 'broken_rma' && !p.fault_description) return { success: false, error: 'fault_description required for broken_rma' };
    const mcCount = Number(p.multicam_count) || 0;
    const cmCount = Number(p.cm5_count) || 0;
    if (!mcCount && !cmCount) return { success: false, error: 'At least one device type must be returned' };
    const id = mockId('RET');
    state.device_return_requests.push({
      request_id: id, timestamp: now,
      hub: p.hub, team_name: p.team_name, business_id: p.business_id || '',
      reason: p.reason,
      sets_returning: String(p.sets_returning || 0),
      sets_needed: String(p.sets_needed || 0),
      multicam_count: String(mcCount), multicam_ids: p.multicam_ids || '',
      cm5_count: String(cmCount), cm5_ids: p.cm5_ids || '',
      replacement_multicam_needed: String(p.replacement_multicam_needed || 0),
      replacement_cm5_needed: String(p.replacement_cm5_needed || 0),
      fault_description: p.fault_description || '',
      photo_urls: p.photo_urls || '',
      status: 'Submitted', notes: '', updated_at: now
    });
    mockSave(state);
    return { success: true, data: { request_id: id, timestamp: now } };
  }

  if (action === 'update_sd_status') {
    const p = payload || {};
    const row = state.sd_card_submissions.find(r => r.submission_id === p.submission_id);
    if (!row) return { success: false, error: 'Submission not found' };
    if (p.status) row.status = p.status;
    if (p.sd_count_actual !== undefined && p.sd_count_actual !== '') {
      const actual = Number(p.sd_count_actual);
      const submitted = Number(row.sd_count_submitted) || 0;
      row.sd_count_actual = String(actual);
      row.variance = String(actual - submitted);
    }
    row.updated_at = now;
    mockSave(state);
    return { success: true, data: { submission_id: p.submission_id } };
  }

  if (action === 'update_device_status') {
    const p = payload || {};
    const row = state.device_return_requests.find(r => r.request_id === p.request_id);
    if (!row) return { success: false, error: 'Request not found' };
    if (p.status) row.status = p.status;
    if (p.notes !== undefined) row.notes = p.notes;
    row.updated_at = now;
    mockSave(state);
    return { success: true, data: { request_id: p.request_id } };
  }

  if (action === 'get_submissions') {
    const ps = params || {};
    const type = ps.type || 'sd_cards';
    const rows = type === 'device_returns' ? state.device_return_requests : state.sd_card_submissions;
    const hub = (ps.hub || 'all').toLowerCase();
    const status = (ps.status || 'all').toLowerCase();
    const reason = (ps.reason || 'all').toLowerCase();
    const filtered = rows.filter(r => {
      if (hub !== 'all' && String(r.hub).toLowerCase() !== hub) return false;
      if (status !== 'all' && String(r.status).toLowerCase() !== status) return false;
      if (type === 'device_returns' && reason !== 'all' && String(r.reason).toLowerCase() !== reason) return false;
      return true;
    });
    filtered.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
    return { success: true, data: filtered };
  }

  if (action === 'get_hub_summary') {
    return { success: true, data: mockComputeHubSummary(state) };
  }

  return { success: false, error: 'Unknown action: ' + action };
}

function isMockMode() {
  return !GAS_URL;
}

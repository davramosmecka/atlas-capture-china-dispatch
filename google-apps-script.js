// ════════════════════════════════════════════════════════════════════
// Mecka AI — Dispatch & Returns Tool — Apps Script Backend
// ════════════════════════════════════════════════════════════════════
// Auto-creates tabs on first run. No auth (internal tool).
// All POST bodies use Content-Type: text/plain to dodge CORS preflight.
//
// Setup:
//   1. Open the target Google Sheet → Extensions → Apps Script
//   2. Paste this whole file → Save (any name)
//   3. Deploy → New deployment → Web app
//        Execute as: Me
//        Who has access: Anyone
//   4. Copy the /exec URL → paste into js/config.js as GAS_URL
//   5. Run setupSheets() once from the editor to pre-create tabs (optional —
//      the tabs will auto-create on first POST too)
// ════════════════════════════════════════════════════════════════════

const TAB_SD = 'sd_card_submissions';
const TAB_RET = 'device_return_requests';
const TAB_SUM = 'hub_summary';

const HEADERS_SD = [
  'submission_id', 'timestamp', 'hub', 'team_name', 'business_id',
  'sd_count_submitted', 'expected_handoff_time', 'notes',
  'status', 'sd_count_actual', 'variance', 'updated_at'
];

const HEADERS_RET = [
  'request_id', 'timestamp', 'hub', 'team_name', 'business_id', 'reason',
  'sets_returning', 'sets_needed',
  'multicam_count', 'multicam_ids', 'cm5_count', 'cm5_ids',
  'replacement_multicam_needed', 'replacement_cm5_needed',
  'fault_description', 'photo_urls', 'status', 'notes', 'updated_at'
];

const HEADERS_SUM = [
  'hub', 'sd_pending_inbound', 'device_returns_open', 'open_rmas', 'updated_at'
];

const HUBS = ['Manila', 'Jakarta', 'Bali', 'HCM'];

// ── Routing ──────────────────────────────────────────────────────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  try {
    if (action === 'ping') return json({ success: true, message: 'pong' });
    if (action === 'get_submissions') return json({ success: true, data: getSubmissions(e.parameter) });
    if (action === 'get_hub_summary') return json({ success: true, data: getHubSummary() });
    return json({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return json({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};

    if (action === 'submit_sd_cards') return json(submitSDCards(payload));
    if (action === 'submit_device_return') return json(submitDeviceReturn(payload));
    if (action === 'update_sd_status') return json(updateSDStatus(payload));
    if (action === 'update_device_status') return json(updateDeviceStatus(payload));

    return json({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return json({ success: false, error: err.toString() });
  }
}

// ── Writers ──────────────────────────────────────────────────────────────────
function submitSDCards(p) {
  if (!p.hub || !p.team_name || !p.sd_count_submitted) {
    return { success: false, error: 'Missing required fields (hub, team_name, sd_count_submitted)' };
  }
  const sheet = getOrCreateTab(TAB_SD, HEADERS_SD);
  const id = generateId('SD');
  const now = new Date().toISOString();
  const row = [
    id, now, p.hub, p.team_name, p.business_id || '',
    Number(p.sd_count_submitted) || 0,
    p.expected_handoff_time || '',
    p.notes || '',
    'Submitted', '', '', now
  ];
  sheet.appendRow(row);
  updateHubSummary(p.hub);
  return { success: true, data: { submission_id: id, timestamp: now } };
}

function submitDeviceReturn(p) {
  if (!p.hub || !p.team_name || !p.reason) {
    return { success: false, error: 'Missing required fields (hub, team_name, reason)' };
  }
  if (p.reason === 'broken_rma' && !p.fault_description) {
    return { success: false, error: 'fault_description required for broken_rma' };
  }
  const mcCount = Number(p.multicam_count) || 0;
  const cmCount = Number(p.cm5_count) || 0;
  if (mcCount === 0 && cmCount === 0) {
    return { success: false, error: 'At least one device type must be returned' };
  }
  const sheet = getOrCreateTab(TAB_RET, HEADERS_RET);
  const id = generateId('RET');
  const now = new Date().toISOString();
  const row = [
    id, now, p.hub, p.team_name, p.business_id || '', p.reason,
    Number(p.sets_returning) || 0,
    Number(p.sets_needed) || 0,
    mcCount, p.multicam_ids || '',
    cmCount, p.cm5_ids || '',
    Number(p.replacement_multicam_needed) || 0,
    Number(p.replacement_cm5_needed) || 0,
    p.fault_description || '',
    p.photo_urls || '',
    'Submitted', '', now
  ];
  sheet.appendRow(row);
  updateHubSummary(p.hub);
  return { success: true, data: { request_id: id, timestamp: now } };
}

function updateSDStatus(p) {
  if (!p.submission_id) return { success: false, error: 'submission_id required' };
  const sheet = getOrCreateTab(TAB_SD, HEADERS_SD);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(p.submission_id)) {
      const now = new Date().toISOString();
      if (p.status) sheet.getRange(i + 1, 9).setValue(p.status);
      if (p.sd_count_actual !== undefined && p.sd_count_actual !== '') {
        const actual = Number(p.sd_count_actual);
        const submitted = Number(data[i][5]) || 0;
        sheet.getRange(i + 1, 10).setValue(actual);
        sheet.getRange(i + 1, 11).setValue(actual - submitted);
      }
      sheet.getRange(i + 1, 12).setValue(now);
      updateHubSummary(String(data[i][2]));
      return { success: true, data: { submission_id: p.submission_id } };
    }
  }
  return { success: false, error: 'Submission not found: ' + p.submission_id };
}

function updateDeviceStatus(p) {
  if (!p.request_id) return { success: false, error: 'request_id required' };
  const sheet = getOrCreateTab(TAB_RET, HEADERS_RET);
  const data = sheet.getDataRange().getValues();
  // After adding sets_returning + sets_needed (cols 7-8), status/notes/updated_at
  // shift: status now col 17, notes col 18, updated_at col 19.
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(p.request_id)) {
      const now = new Date().toISOString();
      if (p.status) sheet.getRange(i + 1, 17).setValue(p.status);
      if (p.notes !== undefined) sheet.getRange(i + 1, 18).setValue(p.notes);
      sheet.getRange(i + 1, 19).setValue(now);
      updateHubSummary(String(data[i][2]));
      return { success: true, data: { request_id: p.request_id } };
    }
  }
  return { success: false, error: 'Request not found: ' + p.request_id };
}

// ── Readers ──────────────────────────────────────────────────────────────────
function getSubmissions(params) {
  const type = params.type || 'sd_cards';
  const tab = type === 'device_returns' ? TAB_RET : TAB_SD;
  const headers = type === 'device_returns' ? HEADERS_RET : HEADERS_SD;
  const sheet = getOrCreateTab(tab, headers);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const hub = (params.hub || 'all').toLowerCase();
  const status = (params.status || 'all').toLowerCase();
  const reason = (params.reason || 'all').toLowerCase();

  const out = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = row[idx] !== undefined ? String(row[idx]) : ''; });
    if (hub !== 'all' && String(obj.hub).toLowerCase() !== hub) continue;
    if (status !== 'all' && String(obj.status).toLowerCase() !== status) continue;
    if (type === 'device_returns' && reason !== 'all' && String(obj.reason).toLowerCase() !== reason) continue;
    out.push(obj);
  }
  out.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  return out;
}

function getHubSummary() {
  const sheet = getOrCreateTab(TAB_SUM, HEADERS_SUM);
  const data = sheet.getDataRange().getValues();
  const map = {};
  HUBS.forEach(h => { map[h] = { hub: h, sd_pending_inbound: 0, device_returns_open: 0, open_rmas: 0, updated_at: '' }; });
  for (let i = 1; i < data.length; i++) {
    const hub = String(data[i][0] || '');
    if (!hub) continue;
    map[hub] = {
      hub: hub,
      sd_pending_inbound: Number(data[i][1]) || 0,
      device_returns_open: Number(data[i][2]) || 0,
      open_rmas: Number(data[i][3]) || 0,
      updated_at: String(data[i][4] || '')
    };
  }
  return HUBS.map(h => map[h]);
}

// ── Hub summary recalc ───────────────────────────────────────────────────────
function updateHubSummary(hub) {
  if (!hub) return;
  const sdSheet = getOrCreateTab(TAB_SD, HEADERS_SD);
  const retSheet = getOrCreateTab(TAB_RET, HEADERS_RET);
  const sumSheet = getOrCreateTab(TAB_SUM, HEADERS_SUM);

  let sdPending = 0;
  const sdData = sdSheet.getDataRange().getValues();
  for (let i = 1; i < sdData.length; i++) {
    if (String(sdData[i][2]) === hub) {
      const status = String(sdData[i][8]);
      if (status === 'Submitted' || status === 'In Transit') {
        sdPending += Number(sdData[i][5]) || 0;
      }
    }
  }

  let retOpen = 0;
  let openRmas = 0;
  const retData = retSheet.getDataRange().getValues();
  // status column is index 16 (0-indexed) after sets fields were inserted
  for (let i = 1; i < retData.length; i++) {
    if (String(retData[i][2]) === hub) {
      const status = String(retData[i][16]);
      const reason = String(retData[i][5]);
      if (status !== 'Closed') {
        retOpen += 1;
        if (reason === 'broken_rma') openRmas += 1;
      }
    }
  }

  const now = new Date().toISOString();
  const sumData = sumSheet.getDataRange().getValues();
  let foundRow = -1;
  for (let i = 1; i < sumData.length; i++) {
    if (String(sumData[i][0]) === hub) { foundRow = i + 1; break; }
  }
  const row = [hub, sdPending, retOpen, openRmas, now];
  if (foundRow > 0) {
    sumSheet.getRange(foundRow, 1, 1, row.length).setValues([row]);
  } else {
    sumSheet.appendRow(row);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getOrCreateTab(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const h = sheet.getRange(1, 1, 1, headers.length);
    h.setFontWeight('bold');
    h.setBackground('#1a1917');
    h.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const h = sheet.getRange(1, 1, 1, headers.length);
    h.setFontWeight('bold');
    h.setBackground('#1a1917');
    h.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function generateId(prefix) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return prefix + '-' + yyyy + mm + dd + '-' + rand;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── One-shot: pre-create all tabs (optional, called manually from editor) ────
function setupSheets() {
  getOrCreateTab(TAB_SD, HEADERS_SD);
  getOrCreateTab(TAB_RET, HEADERS_RET);
  getOrCreateTab(TAB_SUM, HEADERS_SUM);
  HUBS.forEach(h => updateHubSummary(h));
  Logger.log('Tabs ready: ' + [TAB_SD, TAB_RET, TAB_SUM].join(', '));
}
